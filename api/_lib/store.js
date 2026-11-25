import { createClient } from '@supabase/supabase-js';

// Memoria por instancia serverless para resiliencia en frío / sin Supabase configurado
const memorySessions = new Map();
const memoryQuotes = new Map();
const memoryComplaints = new Map();
const ipRateLimits = new Map();

const MAX_TURNS_PER_SESSION = 15;
const MAX_SESSIONS_PER_IP_HOUR = 10; // Tolerante para demos; Turnstile/IP guard aplicable

function getSupabaseServerClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export function checkIpSessionQuota(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const entries = (ipRateLimits.get(ip) || []).filter((ts) => now - ts < windowMs);
  if (entries.length >= MAX_SESSIONS_PER_IP_HOUR) {
    return { allowed: false, remaining: 0 };
  }
  entries.push(now);
  ipRateLimits.set(ip, entries);
  return { allowed: true, remaining: MAX_SESSIONS_PER_IP_HOUR - entries.length };
}

export async function getSession(sessionId) {
  if (memorySessions.has(sessionId)) {
    return memorySessions.get(sessionId);
  }
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { data } = await sb
        .from('formalia_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();
      if (data) {
        const record = {
          session_id: data.session_id,
          process_graph: data.process_graph,
          messages: data.messages || [],
          versions: data.versions || [],
          generated_files: data.generated_files || [],
          turns_count: data.turns_count || 0,
          completeness_score: data.completeness_score || 0,
          linked_quote_id: data.linked_quote_id || null,
          created_at: data.created_at,
          expires_at: data.expires_at
        };
        memorySessions.set(sessionId, record);
        return record;
      }
    } catch (_) {}
  }
  return null;
}

export async function saveSession(record) {
  memorySessions.set(record.session_id, record);
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      await sb.from('formalia_sessions').upsert({
        session_id: record.session_id,
        process_graph: record.process_graph,
        messages: record.messages || [],
        versions: record.versions || [],
        generated_files: record.generated_files || [],
        turns_count: record.turns_count || 0,
        completeness_score: record.completeness_score || 0,
        linked_quote_id: record.linked_quote_id || null,
        updated_at: new Date().toISOString()
      });
    } catch (_) {}
  }
  return record;
}

export async function saveArtifactVersion(artifact) {
  const session = await getSession(artifact.session_id);
  if (session) {
    const nextFiles = [
      ...(session.generated_files || []).filter((f) => f.id !== artifact.id),
      artifact
    ];
    session.generated_files = nextFiles;
    await saveSession(session);
  }
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      await sb.from('formalia_artifact_versions').upsert({
        id: artifact.id,
        session_id: artifact.session_id,
        version_number: artifact.version_number || 1,
        version_label: artifact.version_label || `v${artifact.version_number || 1}`,
        artifact_kind: artifact.artifact_kind || 'snapshot',
        file_name: artifact.file_name,
        mime_type: artifact.mime_type || 'text/plain',
        content_text: artifact.content_text || null,
        data_url: artifact.data_url || null,
        size_bytes: artifact.size_bytes || 0,
        change_summary: artifact.change_summary || '',
        chat_turns_at: artifact.chat_turns_at || 0
      });
    } catch (_) {}
  }
  return artifact;
}

export async function listFormaliaSessionsArchive() {
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { data: sessions } = await sb
        .from('formalia_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);

      const { data: artifacts } = await sb
        .from('formalia_artifact_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (sessions && sessions.length > 0) {
        const artifactsBySession = new Map();
        (artifacts || []).forEach((a) => {
          if (!artifactsBySession.has(a.session_id)) artifactsBySession.set(a.session_id, []);
          artifactsBySession.get(a.session_id).push(a);
        });
        return sessions.map((s) => ({
          ...s,
          generated_files: artifactsBySession.get(s.session_id) || s.generated_files || []
        }));
      }
    } catch (_) {}
  }
  return Array.from(memorySessions.values());
}

export async function saveQuoteWithHandoff(quotePayload) {
  memoryQuotes.set(quotePayload.quote_id, quotePayload);
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { error } = await sb.from('quotes').insert({
        quote_id: quotePayload.quote_id,
        formalia_session_id: quotePayload.formalia_session_id || null,
        business_discovery: quotePayload.business_discovery || {},
        configuration: quotePayload.configuration || {},
        pricing_summary: quotePayload.pricing_summary || {},
        lead_contact: quotePayload.lead_contact || {},
        engineering_handoff: quotePayload.engineering_handoff || null,
        privacy_policy_accepted: Boolean(quotePayload.privacy_policy_accepted),
        privacy_policy_version: quotePayload.privacy_policy_version || '2026-11',
        accepted_at: quotePayload.accepted_at || new Date().toISOString(),
        status: 'nuevo_lead'
      });
      if (!error && quotePayload.formalia_session_id) {
        await sb
          .from('formalia_sessions')
          .update({ linked_quote_id: quotePayload.quote_id })
          .eq('session_id', quotePayload.formalia_session_id);
      }
    } catch (_) {}
  }
  return quotePayload;
}

export async function saveComplaintRecord(complaintPayload) {
  memoryComplaints.set(complaintPayload.complaint_code, complaintPayload);
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      await sb.from('complaints').insert({
        complaint_code: complaintPayload.complaint_code,
        record_type: complaintPayload.record_type || 'Reclamo',
        consumer_name: complaintPayload.consumer_name,
        document_type: complaintPayload.document_type || 'DNI',
        document_number: complaintPayload.document_number,
        address: complaintPayload.address || '',
        phone: complaintPayload.phone || '',
        email: complaintPayload.email,
        is_minor: Boolean(complaintPayload.is_minor),
        guardian_name: complaintPayload.guardian_name || null,
        service_type: complaintPayload.service_type || 'Servicio de Software / Membresía',
        claimed_amount: complaintPayload.claimed_amount || null,
        service_description: complaintPayload.service_description || '',
        detail: complaintPayload.detail,
        consumer_request: complaintPayload.consumer_request,
        privacy_policy_accepted: Boolean(complaintPayload.privacy_policy_accepted),
        privacy_policy_version: complaintPayload.privacy_policy_version || '2026-11',
        accepted_at: complaintPayload.accepted_at || new Date().toISOString(),
        status: 'registrado'
      });
    } catch (_) {}
  }
  return complaintPayload;
}

export { MAX_TURNS_PER_SESSION };
