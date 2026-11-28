import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import {
  createDefaultWebBlueprint,
  sanitizeUiScreensPayload,
  ANON_SESSION_AI_LIMIT,
  ANON_IP_DAILY_AI_LIMIT,
  AUTH_USER_DAILY_AI_LIMIT,
  PARTNER_DAILY_AI_LIMIT,
  MAX_WORKSPACES_FREE,
  MAX_CANVASES_PER_WORKSPACE_FREE,
  MAX_WORKSPACES_PARTNER,
  MAX_CANVASES_PER_WORKSPACE_PARTNER,
  getAiDailyLimitForRole
} from '../../src/lib/formalia/blueprintSchema.js';

export {
  ANON_SESSION_AI_LIMIT,
  ANON_IP_DAILY_AI_LIMIT,
  AUTH_USER_DAILY_AI_LIMIT,
  PARTNER_DAILY_AI_LIMIT,
  MAX_WORKSPACES_FREE,
  MAX_CANVASES_PER_WORKSPACE_FREE,
  MAX_WORKSPACES_PARTNER,
  MAX_CANVASES_PER_WORKSPACE_PARTNER,
  getAiDailyLimitForRole
};

// Memoria por instancia serverless para resiliencia en frío / sin Supabase configurado
const memorySessions = new Map();
const memoryQuotes = new Map();
const memoryComplaints = new Map();
const memoryAiQuotaLedger = [];
const memoryBlueprints = new Map();
const ipRateLimits = new Map();

const MAX_TURNS_PER_SESSION = ANON_SESSION_AI_LIMIT;
const MAX_SESSIONS_PER_IP_HOUR = 15; // Tolerante para demos; Turnstile/IP guard aplicable
const QUOTA_LEDGER_FALLBACK_ID = 'SYS-AI-QUOTA-V2';
const PRIVILEGED_QUOTA_ROLES = new Set(['Admin', 'Administrador', 'Colaborador', 'Desarrollador', 'Fintech Lead', 'Auditora de Impacto']);

async function resolveUserRoleFromDb({ sb, userEmail = null, providedRole = null }) {
  if (providedRole && String(providedRole).trim()) {
    return String(providedRole).trim();
  }
  if (!sb || !userEmail) return null;
  try {
    const cleanEmail = String(userEmail).trim().toLowerCase();
    const { data } = await sb
      .from('portal_users')
      .select('role')
      .ilike('email', cleanEmail)
      .maybeSingle();
    return data?.role || null;
  } catch (_) {
    return null;
  }
}

export function hashClientIp(ip = 'unknown') {
  const salt = process.env.IP_HASH_SALT || 'pathrimonio-formalia-v2';
  return crypto
    .createHash('sha256')
    .update(`${String(ip || 'unknown')}:${salt}`)
    .digest('hex')
    .slice(0, 24);
}

export function getUtcDateString(inputDate = new Date()) {
  return new Date(inputDate).toISOString().slice(0, 10);
}

export function getNextUtcResetIso(inputDate = new Date()) {
  const d = new Date(inputDate);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0)).toISOString();
}

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

export function resolveWorkspaceFields(record) {
  if (!record || typeof record !== 'object') return {};
  const meta = record.process_graph?.workspace_meta || {};
  const projectId = record.project_id ?? meta.project_id ?? null;
  const workspaceId =
    record.workspace_id ||
    meta.workspace_id ||
    (projectId ? `ws_proj_${projectId}` : null);
  const workspaceName =
    record.workspace_name ||
    meta.workspace_name ||
    record.process_graph?.business_context?.company_name ||
    null;
  const canvasTitle =
    record.canvas_title ||
    meta.canvas_title ||
    record.process_name ||
    record.process_graph?.business_context?.process_name ||
    null;
  return {
    workspace_id: workspaceId ? String(workspaceId) : null,
    workspace_name: workspaceName ? String(workspaceName) : null,
    project_id: projectId ? String(projectId) : null,
    canvas_title: canvasTitle ? String(canvasTitle) : null
  };
}

function hydrateSessionRecord(data) {
  if (!data) return null;
  const ws = resolveWorkspaceFields(data);
  const graph = data.process_graph ? { ...data.process_graph } : null;
  if (graph && (ws.workspace_id || ws.workspace_name || ws.project_id || ws.canvas_title)) {
    graph.workspace_meta = {
      ...(graph.workspace_meta || {}),
      ...ws
    };
  }
  return {
    session_id: data.session_id,
    user_id: data.user_id || null,
    user_email: data.user_email || null,
    user_name: data.user_name || null,
    process_name: data.process_name || graph?.business_context?.process_name || ws.canvas_title || null,
    saved_to_account: Boolean(data.saved_to_account),
    workspace_id: ws.workspace_id,
    workspace_name: ws.workspace_name,
    project_id: ws.project_id,
    canvas_title: ws.canvas_title,
    process_graph: graph,
    messages: data.messages || [],
    versions: data.versions || [],
    generated_files: data.generated_files || [],
    turns_count: data.turns_count || 0,
    completeness_score: data.completeness_score || 0,
    linked_quote_id: data.linked_quote_id || null,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
    expires_at: data.expires_at
  };
}

export async function getSession(sessionId) {
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { data } = await sb
        .from('formalia_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();
      if (data) {
        const record = hydrateSessionRecord(data);
        memorySessions.set(sessionId, record);
        return record;
      }
    } catch (_) {}
  }
  if (memorySessions.has(sessionId)) {
    return hydrateSessionRecord(memorySessions.get(sessionId));
  }
  return null;
}

export async function saveSession(record) {
  const ws = resolveWorkspaceFields(record);
  const syncedGraph = record.process_graph ? { ...record.process_graph } : null;
  if (syncedGraph && (ws.workspace_id || ws.workspace_name || ws.project_id || ws.canvas_title)) {
    syncedGraph.workspace_meta = {
      ...(syncedGraph.workspace_meta || {}),
      ...ws
    };
  }

  const normalizedRecord = {
    ...record,
    ...ws,
    process_graph: syncedGraph
  };
  memorySessions.set(normalizedRecord.session_id, normalizedRecord);

  const sb = getSupabaseServerClient();
  if (sb) {
    const processName =
      normalizedRecord.process_name ||
      syncedGraph?.business_context?.process_name ||
      ws.canvas_title ||
      null;
    const payload = {
      session_id: normalizedRecord.session_id,
      process_graph: syncedGraph,
      messages: normalizedRecord.messages || [],
      versions: normalizedRecord.versions || [],
      generated_files: normalizedRecord.generated_files || [],
      turns_count: normalizedRecord.turns_count || 0,
      completeness_score: normalizedRecord.completeness_score || 0,
      linked_quote_id: normalizedRecord.linked_quote_id || null,
      process_name: processName,
      updated_at: new Date().toISOString()
    };
    if (normalizedRecord.user_id !== undefined) payload.user_id = normalizedRecord.user_id || null;
    if (normalizedRecord.user_email !== undefined) payload.user_email = normalizedRecord.user_email || null;
    if (normalizedRecord.user_name !== undefined) payload.user_name = normalizedRecord.user_name || null;
    if (ws.workspace_id) payload.workspace_id = ws.workspace_id;
    if (ws.workspace_name) payload.workspace_name = ws.workspace_name;
    if (ws.project_id) payload.project_id = ws.project_id;
    if (ws.canvas_title) payload.canvas_title = ws.canvas_title;
    if (normalizedRecord.saved_to_account !== undefined) {
      payload.saved_to_account = Boolean(normalizedRecord.saved_to_account);
      if (normalizedRecord.saved_to_account) {
        payload.expires_at = '2099-12-31T23:59:59Z';
      } else {
        payload.expires_at =
          normalizedRecord.expires_at ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
    } else if (!normalizedRecord.saved_to_account) {
      payload.expires_at =
        normalizedRecord.expires_at ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    try {
      const { error } = await sb.from('formalia_sessions').upsert(payload);
      if (error) {
        // Fallback 1: sin columnas workspace si aún no se aplicó migración 20261126000300 (workspace_meta vive en JSONB)
        const {
          workspace_id: _wid,
          workspace_name: _wn,
          project_id: _pid,
          canvas_title: _ct,
          ...withoutWorkspaceCols
        } = payload;
        const { error: err2 } = await sb.from('formalia_sessions').upsert(withoutWorkspaceCols);
        if (err2) {
          // Fallback 2: sin columnas extendidas de cuenta
          const {
            user_id: _uid,
            user_email: _ue,
            user_name: _un,
            process_name: _pn,
            saved_to_account: _sta,
            ...legacyPayload
          } = withoutWorkspaceCols;
          await sb.from('formalia_sessions').upsert(legacyPayload);
        }
      }

      // Sincronización relacional opcional en workspaces / canvases si la migración v2 está aplicada
      if (normalizedRecord.saved_to_account && ws.workspace_id) {
        try {
          await sb.from('workspaces').upsert({
            id: ws.workspace_id,
            owner_user_id: normalizedRecord.user_id || null,
            owner_email: normalizedRecord.user_email || null,
            name: ws.workspace_name || 'Mi Negocio / General',
            industry: syncedGraph?.business_context?.industry || 'otro_sector',
            project_id: ws.project_id || null,
            updated_at: new Date().toISOString()
          });
          await sb.from('canvases').upsert({
            id: normalizedRecord.session_id,
            workspace_id: ws.workspace_id,
            session_id: normalizedRecord.session_id,
            title: ws.canvas_title || processName || 'Lienzo principal',
            process_graph_json: syncedGraph || {},
            updated_at: new Date().toISOString()
          });
        } catch (_) {}
      }
    } catch (_) {}
  }
  return normalizedRecord;
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

export async function listFormaliaSessionsArchive({ userId = null, userEmail = null, mineOnly = false } = {}) {
  const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : null;
  const matchesOwner = (s) => {
    if (!mineOnly) return true;
    if (userId && s.user_id && s.user_id === userId) return true;
    if (cleanEmail && s.user_email && String(s.user_email).trim().toLowerCase() === cleanEmail) return true;
    return false;
  };

  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      let query = sb
        .from('formalia_sessions')
        .select('*')
        .not('session_id', 'like', 'SYS-%')
        .order('updated_at', { ascending: false })
        .limit(80);

      if (mineOnly && (userId || cleanEmail)) {
        const filters = [];
        if (userId) filters.push(`user_id.eq.${userId}`);
        if (cleanEmail) filters.push(`user_email.ilike.${cleanEmail}`);
        if (filters.length > 0) query = query.or(filters.join(','));
      }

      const { data: sessions } = await query;

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
        return sessions.filter(matchesOwner).map((s) =>
          hydrateSessionRecord({
            ...s,
            generated_files: artifactsBySession.get(s.session_id) || s.generated_files || []
          })
        );
      }
      if (mineOnly) return [];
    } catch (_) {}
  }
  return Array.from(memorySessions.values())
    .filter((s) => !String(s.session_id || '').startsWith('SYS-'))
    .filter(matchesOwner)
    .map(hydrateSessionRecord);
}

export async function updateFormaliaSessionWorkspace(sessionId, updates = {}) {
  if (!sessionId) return null;
  const existing = await getSession(sessionId);
  if (!existing) return null;

  const nextGraph = existing.process_graph ? { ...existing.process_graph } : {};
  const nextMeta = {
    ...(nextGraph.workspace_meta || {}),
    workspace_id: updates.workspace_id !== undefined ? updates.workspace_id : (existing.workspace_id || nextGraph.workspace_meta?.workspace_id || null),
    workspace_name: updates.workspace_name !== undefined ? updates.workspace_name : (existing.workspace_name || nextGraph.workspace_meta?.workspace_name || null),
    project_id: updates.project_id !== undefined ? updates.project_id : (existing.project_id ?? nextGraph.workspace_meta?.project_id ?? null),
    canvas_title: updates.canvas_title !== undefined ? updates.canvas_title : (existing.canvas_title || nextGraph.workspace_meta?.canvas_title || null)
  };
  nextGraph.workspace_meta = nextMeta;

  if (updates.canvas_title) {
    nextGraph.business_context = {
      ...(nextGraph.business_context || {}),
      process_name: updates.canvas_title
    };
  }
  if (updates.workspace_name && !nextGraph.business_context?.company_name) {
    nextGraph.business_context = {
      ...(nextGraph.business_context || {}),
      company_name: updates.workspace_name
    };
  }

  return saveSession({
    ...existing,
    workspace_id: nextMeta.workspace_id,
    workspace_name: nextMeta.workspace_name,
    project_id: nextMeta.project_id,
    canvas_title: nextMeta.canvas_title,
    process_name: updates.canvas_title || existing.process_name,
    ...(updates.user_id ? { user_id: updates.user_id } : {}),
    ...(updates.user_email ? { user_email: updates.user_email } : {}),
    ...(updates.user_name ? { user_name: updates.user_name } : {}),
    saved_to_account: updates.saved_to_account !== undefined ? Boolean(updates.saved_to_account) : existing.saved_to_account,
    process_graph: nextGraph
  });
}

export async function deleteFormaliaSessionRecord(sessionId) {
  if (!sessionId) return false;
  memorySessions.delete(sessionId);
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      await sb.from('formalia_artifact_versions').delete().eq('session_id', sessionId);
      await sb.from('formalia_sessions').delete().eq('session_id', sessionId);
    } catch (_) {}
  }
  return true;
}

export async function saveQuoteWithHandoff(quotePayload) {
  memoryQuotes.set(quotePayload.quote_id, quotePayload);
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const insertRow = {
        quote_id: quotePayload.quote_id,
        formalia_session_id: quotePayload.formalia_session_id || null,
        web_blueprint_id: quotePayload.web_blueprint_id || null,
        user_email: quotePayload.user_email || quotePayload.lead_contact?.email || null,
        user_id: quotePayload.user_id || null,
        business_discovery: quotePayload.business_discovery || {},
        configuration: quotePayload.configuration || {},
        pricing_summary: quotePayload.pricing_summary || {},
        lead_contact: quotePayload.lead_contact || {},
        engineering_handoff: quotePayload.engineering_handoff || null,
        privacy_policy_accepted: Boolean(quotePayload.privacy_policy_accepted),
        privacy_policy_version: quotePayload.privacy_policy_version || '2026-11',
        accepted_at: quotePayload.accepted_at || new Date().toISOString(),
        status: 'nuevo_lead'
      };
      let { error } = await sb.from('quotes').insert(insertRow);
      if (error && insertRow.web_blueprint_id) {
        const { web_blueprint_id: _wbp, ...withoutBp } = insertRow;
        const retry = await sb.from('quotes').insert(withoutBp);
        error = retry.error;
      }
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

// ── Telemetría Diaria de API y Límites por Clave Conectada ────────────────────

const TELEMETRY_SYSTEM_SESSION_ID = 'SYS-API-TELEMETRY-V1';
const memoryApiUsageLogs = [];
const memoryApiKeyQuotas = new Map();
const memoryProbeResults = new Map();

export const DEFAULT_KEY_QUOTA_PROFILES = {
  server_gemini: {
    key_id: 'server_gemini',
    provider: 'gemini',
    label: 'Google Gemini API (Servidor Formalia)',
    env_names: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'],
    scope: 'server',
    tier: 'free',
    daily_request_limit: 1500,
    rpm_limit: 15,
    daily_token_limit: 250000,
    notes: 'Tope referencial Google AI Studio Free Tier (ajustable a Tier 1 o personalizado según tu consola).'
  },
  server_openai: {
    key_id: 'server_openai',
    provider: 'openai',
    label: 'OpenAI API (Respaldo Servidor)',
    env_names: ['OPENAI_API_KEY'],
    scope: 'server',
    tier: 'tier1',
    daily_request_limit: 10000,
    rpm_limit: 500,
    daily_token_limit: 2000000,
    notes: 'Límite base Tier 1 OpenAI (ajustable según tu organización y límites x-ratelimit).'
  },
  server_deepseek: {
    key_id: 'server_deepseek',
    provider: 'deepseek',
    label: 'DeepSeek API (Respaldo Servidor)',
    env_names: ['DEEPSEEK_API_KEY'],
    scope: 'server',
    tier: 'tier1',
    daily_request_limit: 5000,
    rpm_limit: 60,
    daily_token_limit: 5000000,
    notes: 'Límite operativo según saldo recargado en plataforma DeepSeek.'
  }
};

export function getPeruDateString(inputDate = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(inputDate));
  } catch {
    return new Date(inputDate).toISOString().slice(0, 10);
  }
}

export function maskSecretKey(rawKey = '') {
  const clean = String(rawKey || '').trim();
  if (!clean) return '';
  if (clean.length <= 10) return `${clean.slice(0, 3)}••••`;
  return `${clean.slice(0, 5)}••••${clean.slice(-4)}`;
}

function readServerSecret(names = []) {
  for (const name of names) {
    if (process.env[name] && String(process.env[name]).trim()) {
      return { envVar: name, value: String(process.env[name]).trim() };
    }
  }
  return { envVar: null, value: '' };
}

export function inspectServerKeysStatus() {
  const geminiMatch = readServerSecret([
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'VITE_GEMINI_API_KEY'
  ]);
  const openAiMatch = readServerSecret(['OPENAI_API_KEY']);
  const deepseekMatch = readServerSecret(['DEEPSEEK_API_KEY']);

  return [
    {
      ...DEFAULT_KEY_QUOTA_PROFILES.server_gemini,
      connected: Boolean(geminiMatch.value),
      active_env_var: geminiMatch.envVar,
      key_fingerprint: maskSecretKey(geminiMatch.value),
      configured_models: ['gemini-flash-lite-latest', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview']
    },
    {
      ...DEFAULT_KEY_QUOTA_PROFILES.server_openai,
      connected: Boolean(openAiMatch.value),
      active_env_var: openAiMatch.envVar,
      key_fingerprint: maskSecretKey(openAiMatch.value),
      configured_models: [process.env.OPENAI_MODEL || 'gpt-4o-mini']
    },
    {
      ...DEFAULT_KEY_QUOTA_PROFILES.server_deepseek,
      connected: Boolean(deepseekMatch.value),
      active_env_var: deepseekMatch.envVar,
      key_fingerprint: maskSecretKey(deepseekMatch.value),
      configured_models: ['deepseek-chat']
    }
  ];
}

async function readTelemetryLedgerFallback(sb) {
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('formalia_sessions')
      .select('process_graph')
      .eq('session_id', TELEMETRY_SYSTEM_SESSION_ID)
      .maybeSingle();
    if (error) return null;
    return data?.process_graph || { logs: [], quotas: {}, probes: {} };
  } catch {
    return null;
  }
}

async function writeTelemetryLedgerFallback(sb, ledger) {
  if (!sb) return;
  try {
    const bounded = {
      logs: (ledger.logs || []).slice(0, 250),
      quotas: ledger.quotas || {},
      probes: ledger.probes || {}
    };
    await sb.from('formalia_sessions').upsert({
      session_id: TELEMETRY_SYSTEM_SESSION_ID,
      process_graph: bounded,
      messages: [],
      versions: [],
      generated_files: [],
      turns_count: 0,
      completeness_score: 100,
      expires_at: '2099-12-31T23:59:59Z',
      updated_at: new Date().toISOString()
    });
  } catch (_) {}
}

export async function recordApiUsageEvent(event) {
  if (!event) return null;
  const nowIso = event.created_at || new Date().toISOString();
  const row = {
    id: event.id || `api_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    usage_date: event.usage_date || getPeruDateString(nowIso),
    key_id: String(event.key_id || `server_${event.provider || 'gemini'}`),
    key_label: String(event.key_label || 'API IA'),
    key_fingerprint: String(event.key_fingerprint || ''),
    provider: String(event.provider || 'gemini'),
    model: String(event.model || 'unknown'),
    source_module: String(event.source_module || 'formalia'),
    scope: String(event.scope || 'server'),
    http_status: Number(event.http_status) || 200,
    success: event.success !== undefined ? Boolean(event.success) : Number(event.http_status || 200) < 400,
    prompt_tokens: Math.max(0, Number(event.prompt_tokens) || 0),
    output_tokens: Math.max(0, Number(event.output_tokens) || 0),
    total_tokens:
      Math.max(
        0,
        Number(event.total_tokens) ||
          ((Number(event.prompt_tokens) || 0) + (Number(event.output_tokens) || 0))
      ),
    latency_ms: Math.max(0, Number(event.latency_ms) || 0),
    rate_limit_info: event.rate_limit_info || {},
    error_message: event.error_message ? String(event.error_message).slice(0, 280) : null,
    created_at: nowIso
  };

  memoryApiUsageLogs.unshift(row);
  if (memoryApiUsageLogs.length > 300) memoryApiUsageLogs.length = 300;

  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { error } = await sb.from('api_usage_logs').insert(row);
      if (!error) return row;
    } catch (_) {}

    // Respaldo persistente en ledger de sistema si la tabla dedicada aún no fue migrada
    const ledger = (await readTelemetryLedgerFallback(sb)) || { logs: [], quotas: {}, probes: {} };
    const nextLogs = [row, ...(ledger.logs || []).filter((l) => l.id !== row.id)].slice(0, 250);
    await writeTelemetryLedgerFallback(sb, { ...ledger, logs: nextLogs });
  }

  return row;
}

export async function updateApiKeyQuotaLimit(patch) {
  if (!patch || !patch.key_id) {
    throw new Error('key_id es obligatorio para actualizar límites.');
  }
  const base = DEFAULT_KEY_QUOTA_PROFILES[patch.key_id] || {
    key_id: patch.key_id,
    provider: patch.provider || 'gemini',
    label: patch.label || patch.key_id,
    tier: 'custom',
    daily_request_limit: 1500,
    rpm_limit: 15,
    daily_token_limit: 250000
  };

  const nextQuota = {
    key_id: String(patch.key_id),
    provider: String(patch.provider || base.provider),
    label: String(patch.label || base.label),
    tier: ['free', 'tier1', 'custom'].includes(patch.tier) ? patch.tier : base.tier,
    daily_request_limit: Math.max(1, Number(patch.daily_request_limit) || base.daily_request_limit),
    rpm_limit: Math.max(1, Number(patch.rpm_limit) || base.rpm_limit),
    daily_token_limit: Math.max(1000, Number(patch.daily_token_limit) || base.daily_token_limit),
    notes: patch.notes !== undefined ? String(patch.notes) : (base.notes || ''),
    updated_by: patch.updated_by ? String(patch.updated_by) : 'Admin Portal',
    updated_at: new Date().toISOString()
  };

  memoryApiKeyQuotas.set(nextQuota.key_id, nextQuota);

  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { error } = await sb.from('api_key_quotas').upsert(nextQuota);
      if (!error) return nextQuota;
    } catch (_) {}

    const ledger = (await readTelemetryLedgerFallback(sb)) || { logs: [], quotas: {}, probes: {} };
    const nextQuotas = { ...(ledger.quotas || {}), [nextQuota.key_id]: nextQuota };
    await writeTelemetryLedgerFallback(sb, { ...ledger, quotas: nextQuotas });
  }

  return nextQuota;
}

export async function probeConnectedServerKeys() {
  const keys = inspectServerKeysStatus();
  const probedAt = new Date().toISOString();
  const results = {};

  for (const k of keys) {
    if (!k.connected) {
      results[k.key_id] = {
        key_id: k.key_id,
        status: 'missing',
        healthy: false,
        checked_at: probedAt,
        message: 'Sin clave configurada en variables de entorno.'
      };
      continue;
    }

    const secret = readServerSecret(
      k.key_id === 'server_gemini'
        ? ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'VITE_GEMINI_API_KEY']
        : k.env_names
    ).value;

    const t0 = Date.now();
    try {
      if (k.provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(secret)}`
        );
        const latencyMs = Date.now() - t0;
        const json = await res.json().catch(() => ({}));
        const availableModels = Array.isArray(json.models)
          ? json.models
              .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
              .map((m) => String(m.name || '').replace(/^models\//, ''))
          : [];

        results[k.key_id] = {
          key_id: k.key_id,
          status: res.ok ? 'active' : res.status === 429 ? 'rate_limited' : 'error',
          http_status: res.status,
          healthy: res.ok,
          latency_ms: latencyMs,
          checked_at: probedAt,
          available_models_count: availableModels.length,
          available_models: availableModels.slice(0, 10),
          message: res.ok
            ? `Clave válida · ${availableModels.length} modelos generativos disponibles`
            : json?.error?.message || `HTTP ${res.status}`
        };
      } else if (k.provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${secret}` }
        });
        const latencyMs = Date.now() - t0;
        const rateLimitHeaders = {
          limit_requests: res.headers.get('x-ratelimit-limit-requests'),
          remaining_requests: res.headers.get('x-ratelimit-remaining-requests'),
          limit_tokens: res.headers.get('x-ratelimit-limit-tokens'),
          remaining_tokens: res.headers.get('x-ratelimit-remaining-tokens')
        };
        results[k.key_id] = {
          key_id: k.key_id,
          status: res.ok ? 'active' : res.status === 429 ? 'rate_limited' : 'error',
          http_status: res.status,
          healthy: res.ok,
          latency_ms: latencyMs,
          checked_at: probedAt,
          rate_limit_headers: rateLimitHeaders,
          message: res.ok ? 'Clave OpenAI conectada y autenticada' : `HTTP ${res.status}`
        };
      } else if (k.provider === 'deepseek') {
        const res = await fetch('https://api.deepseek.com/user/balance', {
          headers: { Authorization: `Bearer ${secret}` }
        });
        const latencyMs = Date.now() - t0;
        const json = await res.json().catch(() => ({}));
        const bal = json?.balance_infos?.[0];
        results[k.key_id] = {
          key_id: k.key_id,
          status: res.ok ? 'active' : res.status === 429 ? 'rate_limited' : 'error',
          http_status: res.status,
          healthy: res.ok,
          latency_ms: latencyMs,
          checked_at: probedAt,
          balance: bal ? `${bal.total_balance} ${bal.currency}` : null,
          message: res.ok
            ? bal
              ? `Saldo disponible: ${bal.total_balance} ${bal.currency}`
              : 'Clave DeepSeek conectada'
            : json?.error?.message || `HTTP ${res.status}`
        };
      }
      memoryProbeResults.set(k.key_id, results[k.key_id]);
    } catch (err) {
      results[k.key_id] = {
        key_id: k.key_id,
        status: 'error',
        healthy: false,
        latency_ms: Date.now() - t0,
        checked_at: probedAt,
        message: err?.message || 'Error de red consultando proveedor'
      };
      memoryProbeResults.set(k.key_id, results[k.key_id]);
    }
  }

  const sb = getSupabaseServerClient();
  if (sb) {
    const ledger = await readTelemetryLedgerFallback(sb);
    if (ledger) {
      await writeTelemetryLedgerFallback(sb, { ...ledger, probes: results });
    }
  }

  return results;
}

export async function getApiUsageSummary({ days = 7 } = {}) {
  const todayPeru = getPeruDateString();
  const oneMinuteAgoTs = Date.now() - 60 * 1000;
  let storageBackend = 'memory';
  let logs = [...memoryApiUsageLogs];
  const quotaOverrides = new Map(memoryApiKeyQuotas);
  const probesMap = new Map(memoryProbeResults);

  const sb = getSupabaseServerClient();
  if (sb) {
    // 1. Intentar leer tablas dedicadas si existen
    let loadedDedicated = false;
    try {
      const { data: dbLogs, error: logsErr } = await sb
        .from('api_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(350);

      if (!logsErr && Array.isArray(dbLogs)) {
        loadedDedicated = true;
        storageBackend = 'supabase_table';
        const seen = new Set(dbLogs.map((l) => l.id));
        logs = [...dbLogs, ...logs.filter((m) => !seen.has(m.id))];
      }

      const { data: dbQuotas, error: quotaErr } = await sb
        .from('api_key_quotas')
        .select('*');
      if (!quotaErr && Array.isArray(dbQuotas)) {
        dbQuotas.forEach((q) => quotaOverrides.set(q.key_id, q));
      }
    } catch (_) {}

    // 2. Complementar desde telemetry ledger en formalia_sessions si no existen las tablas dedicadas
    if (!loadedDedicated) {
      const ledger = await readTelemetryLedgerFallback(sb);
      if (ledger) {
        storageBackend = 'supabase_telemetry_ledger';
        const ledgerLogs = Array.isArray(ledger.logs) ? ledger.logs : [];
        const seen = new Set(ledgerLogs.map((l) => l.id));
        logs = [...ledgerLogs, ...logs.filter((m) => !seen.has(m.id))];
        Object.entries(ledger.quotas || {}).forEach(([kId, q]) => {
          if (!quotaOverrides.has(kId)) quotaOverrides.set(kId, q);
        });
        Object.entries(ledger.probes || {}).forEach(([kId, p]) => {
          if (!probesMap.has(kId)) probesMap.set(kId, p);
        });
      }
    }
  }

  const serverKeys = inspectServerKeysStatus();
  const keysMap = new Map();

  for (const sk of serverKeys) {
    const override = quotaOverrides.get(sk.key_id);
    keysMap.set(sk.key_id, {
      ...sk,
      tier: override?.tier || sk.tier,
      daily_request_limit: override?.daily_request_limit || sk.daily_request_limit,
      rpm_limit: override?.rpm_limit || sk.rpm_limit,
      daily_token_limit: override?.daily_token_limit || sk.daily_token_limit,
      notes: override?.notes || sk.notes,
      quota_updated_at: override?.updated_at || null,
      probe: probesMap.get(sk.key_id) || null
    });
  }

  // Incluir claves BYOK del Portal que hayan enviado eventos
  for (const log of logs) {
    if (!keysMap.has(log.key_id)) {
      const override = quotaOverrides.get(log.key_id);
      keysMap.set(log.key_id, {
        key_id: log.key_id,
        provider: log.provider,
        label: override?.label || log.key_label || `Clave ${log.provider}`,
        scope: log.scope || 'client_byok',
        connected: true,
        active_env_var: 'localStorage (Portal Archifly)',
        key_fingerprint: log.key_fingerprint || '',
        configured_models: [log.model],
        tier: override?.tier || 'free',
        daily_request_limit: override?.daily_request_limit || 1500,
        rpm_limit: override?.rpm_limit || 15,
        daily_token_limit: override?.daily_token_limit || 250000,
        notes: override?.notes || 'Clave conectada desde Configuración IA del Portal.',
        quota_updated_at: override?.updated_at || null,
        probe: null
      });
    }
  }

  const todayLogs = logs.filter((l) => l.usage_date === todayPeru);

  const keySummaries = Array.from(keysMap.values()).map((keyMeta) => {
    const keyTodayLogs = todayLogs.filter((l) => l.key_id === keyMeta.key_id);
    const reqToday = keyTodayLogs.length;
    const okToday = keyTodayLogs.filter((l) => l.success).length;
    const rateLimitedToday = keyTodayLogs.filter((l) => l.http_status === 429).length;
    const errorToday = keyTodayLogs.filter((l) => !l.success && l.http_status !== 429).length;
    const promptTokensToday = keyTodayLogs.reduce((acc, l) => acc + (l.prompt_tokens || 0), 0);
    const outputTokensToday = keyTodayLogs.reduce((acc, l) => acc + (l.output_tokens || 0), 0);
    const totalTokensToday = keyTodayLogs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
    const rpmCurrent = keyTodayLogs.filter(
      (l) => new Date(l.created_at).getTime() >= oneMinuteAgoTs
    ).length;

    const latestWithHeaders = keyTodayLogs.find(
      (l) => l.rate_limit_info && Object.values(l.rate_limit_info).some(Boolean)
    );
    const modelBreakdownMap = new Map();
    for (const l of keyTodayLogs) {
      const cur = modelBreakdownMap.get(l.model) || { model: l.model, requests: 0, tokens: 0, errors: 0 };
      cur.requests += 1;
      cur.tokens += l.total_tokens || 0;
      if (!l.success) cur.errors += 1;
      modelBreakdownMap.set(l.model, cur);
    }

    const reqPct = Math.min(100, Math.round((reqToday / Math.max(1, keyMeta.daily_request_limit)) * 100));
    const tokenPct = Math.min(100, Math.round((totalTokensToday / Math.max(1, keyMeta.daily_token_limit)) * 100));

    let healthStatus = 'missing';
    if (keyMeta.connected) {
      if (rateLimitedToday > 0 || keyMeta.probe?.status === 'rate_limited') healthStatus = 'rate_limited';
      else if (reqPct >= 90 || tokenPct >= 90) healthStatus = 'critical';
      else if (reqPct >= 70 || tokenPct >= 70) healthStatus = 'warning';
      else if (keyMeta.probe && !keyMeta.probe.healthy) healthStatus = 'error';
      else healthStatus = 'healthy';
    }

    return {
      ...keyMeta,
      health_status: healthStatus,
      usage_today: {
        requests: reqToday,
        remaining_requests: Math.max(0, keyMeta.daily_request_limit - reqToday),
        request_pct: reqPct,
        success_count: okToday,
        rate_limited_count: rateLimitedToday,
        error_count: errorToday,
        rpm_current: rpmCurrent,
        prompt_tokens: promptTokensToday,
        output_tokens: outputTokensToday,
        total_tokens: totalTokensToday,
        remaining_tokens: Math.max(0, keyMeta.daily_token_limit - totalTokensToday),
        token_pct: tokenPct,
        avg_latency_ms:
          reqToday > 0
            ? Math.round(keyTodayLogs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / reqToday)
            : 0,
        last_used_at: keyTodayLogs[0]?.created_at || null
      },
      upstream_rate_limits: latestWithHeaders?.rate_limit_info || keyMeta.probe?.rate_limit_headers || null,
      models_today: Array.from(modelBreakdownMap.values())
    };
  });

  // Serie de los últimos N días (zona horaria America/Lima)
  const dailySeries = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
    const dateStr = getPeruDateString(d);
    const dayLogs = logs.filter((l) => l.usage_date === dateStr);
    dailySeries.push({
      date: dateStr,
      requests: dayLogs.length,
      success: dayLogs.filter((l) => l.success).length,
      errors: dayLogs.filter((l) => !l.success).length,
      tokens: dayLogs.reduce((acc, l) => acc + (l.total_tokens || 0), 0)
    });
  }

  // Totales agregados de claves conectadas
  const connectedKeys = keySummaries.filter((k) => k.connected);
  const totalRequestsToday = todayLogs.length;
  const totalTokensToday = todayLogs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
  const totalPromptTokensToday = todayLogs.reduce((acc, l) => acc + (l.prompt_tokens || 0), 0);
  const totalOutputTokensToday = todayLogs.reduce((acc, l) => acc + (l.output_tokens || 0), 0);
  const totalDailyReqLimit = connectedKeys.reduce((acc, k) => acc + k.daily_request_limit, 0);
  const totalDailyTokenLimit = connectedKeys.reduce((acc, k) => acc + k.daily_token_limit, 0);
  const successToday = todayLogs.filter((l) => l.success).length;

  return {
    timezone: 'America/Lima',
    today_date: todayPeru,
    storage_backend: storageBackend,
    summary: {
      connected_keys_count: connectedKeys.length,
      total_keys_count: keySummaries.length,
      requests_today: totalRequestsToday,
      daily_request_limit_total: totalDailyReqLimit,
      request_usage_pct: totalDailyReqLimit > 0 ? Math.min(100, Math.round((totalRequestsToday / totalDailyReqLimit) * 100)) : 0,
      tokens_today: totalTokensToday,
      prompt_tokens_today: totalPromptTokensToday,
      output_tokens_today: totalOutputTokensToday,
      daily_token_limit_total: totalDailyTokenLimit,
      token_usage_pct: totalDailyTokenLimit > 0 ? Math.min(100, Math.round((totalTokensToday / totalDailyTokenLimit) * 100)) : 0,
      success_rate_pct: totalRequestsToday > 0 ? Math.round((successToday / totalRequestsToday) * 100) : 100,
      rate_limited_today: todayLogs.filter((l) => l.http_status === 429).length,
      avg_latency_ms:
        totalRequestsToday > 0
          ? Math.round(todayLogs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / totalRequestsToday)
          : 0
    },
    keys: keySummaries,
    daily_series: dailySeries,
    recent_logs: logs.slice(0, 40)
  };
}

// ── Cuotas de IA FormalIA v2, Claim Flow y Web Blueprints ────────────────────

async function readQuotaLedgerFallback(sb) {
  if (!sb) return [];
  try {
    const { data } = await sb
      .from('formalia_sessions')
      .select('process_graph')
      .eq('session_id', QUOTA_LEDGER_FALLBACK_ID)
      .maybeSingle();
    return Array.isArray(data?.process_graph?.entries) ? data.process_graph.entries : [];
  } catch {
    return [];
  }
}

async function writeQuotaLedgerFallback(sb, entries) {
  if (!sb) return;
  try {
    await sb.from('formalia_sessions').upsert({
      session_id: QUOTA_LEDGER_FALLBACK_ID,
      process_graph: { entries: entries.slice(0, 500) },
      messages: [],
      versions: [],
      generated_files: [],
      turns_count: 0,
      completeness_score: 100,
      expires_at: '2099-12-31T23:59:59Z',
      updated_at: new Date().toISOString()
    });
  } catch (_) {}
}

export async function recordAiQuotaTurn({
  userId = null,
  userEmail = null,
  ip = 'unknown',
  sessionId = null,
  workspaceId = null,
  actionType = 'PROCESS_CHAT'
}) {
  const nowIso = new Date().toISOString();
  const usageDateUtc = getUtcDateString(nowIso);
  const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : null;
  const entry = {
    id: `aiq_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    user_id: userId ? String(userId) : null,
    user_email: cleanEmail,
    ip_hash: hashClientIp(ip),
    session_id: sessionId || null,
    workspace_id: workspaceId || null,
    action_type: actionType,
    usage_date_utc: usageDateUtc,
    created_at: nowIso
  };

  memoryAiQuotaLedger.unshift(entry);
  if (memoryAiQuotaLedger.length > 600) memoryAiQuotaLedger.length = 600;

  const sb = getSupabaseServerClient();
  if (sb) {
    let savedToTable = false;
    try {
      const { error } = await sb.from('ai_usage_ledger').insert(entry);
      if (!error) savedToTable = true;
    } catch (_) {}

    if (!savedToTable) {
      const prev = await readQuotaLedgerFallback(sb);
      const next = [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, 500);
      await writeQuotaLedgerFallback(sb, next);
    }
  }

  return entry;
}

export async function getAiQuotaStatus({
  userId = null,
  userEmail = null,
  userRole = null,
  ip = 'unknown',
  sessionId = null
} = {}) {
  const todayUtc = getUtcDateString();
  const resetAt = getNextUtcResetIso();
  const ipHash = hashClientIp(ip);
  const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : null;
  const isAuthenticated = Boolean(userId || cleanEmail);

  let entries = memoryAiQuotaLedger.filter((e) => e.usage_date_utc === todayUtc);
  const sb = getSupabaseServerClient();
  const resolvedRole = isAuthenticated
    ? await resolveUserRoleFromDb({ sb, userEmail: cleanEmail, providedRole: userRole })
    : null;
  const authDailyLimit = getAiDailyLimitForRole(resolvedRole, isAuthenticated);

  if (sb) {
    let loadedDedicated = false;
    try {
      const { data, error } = await sb
        .from('ai_usage_ledger')
        .select('*')
        .eq('usage_date_utc', todayUtc)
        .limit(500);
      if (!error && Array.isArray(data)) {
        loadedDedicated = true;
        const seen = new Set(data.map((d) => d.id));
        entries = [...data, ...entries.filter((m) => !seen.has(m.id))];
      }
    } catch (_) {}

    if (!loadedDedicated) {
      const fallbackEntries = (await readQuotaLedgerFallback(sb)).filter(
        (e) => e.usage_date_utc === todayUtc
      );
      const seen = new Set(fallbackEntries.map((d) => d.id));
      entries = [...fallbackEntries, ...entries.filter((m) => !seen.has(m.id))];
    }
  }

  const ipUsedToday = entries.filter((e) => e.ip_hash === ipHash && !e.user_id && !e.user_email).length;

  if (isAuthenticated) {
    const userUsedToday = entries.filter(
      (e) =>
        (userId && e.user_id && e.user_id === String(userId)) ||
        (cleanEmail && e.user_email && String(e.user_email).toLowerCase() === cleanEmail)
    ).length;

    const remainingTurns = Math.max(0, authDailyLimit - userUsedToday);
    return {
      allowed: remainingTurns > 0,
      code: remainingTurns > 0 ? null : 'AI_QUOTA_EXCEEDED',
      remaining_turns: remainingTurns,
      used_turns: userUsedToday,
      daily_limit: authDailyLimit,
      session_turns_used: userUsedToday,
      session_limit: authDailyLimit,
      ip_used_today: ipUsedToday,
      ip_limit: authDailyLimit,
      reset_at: resetAt,
      role: resolvedRole || 'Usuario Registrado',
      is_authenticated: true
    };
  }

  let sessionTurnsUsed = 0;
  if (sessionId) {
    const ledgerSessionCount = entries.filter((e) => e.session_id === sessionId).length;
    const sessRecord = await getSession(sessionId);
    sessionTurnsUsed = Math.max(sessRecord?.turns_count || 0, ledgerSessionCount);
  }

  const remainingSession = Math.max(0, ANON_SESSION_AI_LIMIT - sessionTurnsUsed);
  const remainingIp = Math.max(0, ANON_IP_DAILY_AI_LIMIT - ipUsedToday);
  const remainingTurns = Math.min(remainingSession, remainingIp);

  return {
    allowed: remainingTurns > 0,
    code: remainingTurns > 0 ? null : 'AI_QUOTA_EXCEEDED',
    remaining_turns: remainingTurns,
    used_turns: sessionTurnsUsed,
    daily_limit: ANON_SESSION_AI_LIMIT,
    session_turns_used: sessionTurnsUsed,
    session_limit: ANON_SESSION_AI_LIMIT,
    ip_used_today: ipUsedToday,
    ip_limit: ANON_IP_DAILY_AI_LIMIT,
    reset_at: resetAt,
    role: 'Visitante',
    is_authenticated: false
  };
}

export async function checkUserWorkspaceCaps({
  userId = null,
  userEmail = null,
  userRole = null,
  workspaceId = null,
  projectId = null,
  creatingNewWorkspace = false
} = {}) {
  if (!userId && !userEmail) return { allowed: true };
  const sb = getSupabaseServerClient();
  const resolvedRole = await resolveUserRoleFromDb({ sb, userEmail, providedRole: userRole });
  if (resolvedRole && PRIVILEGED_QUOTA_ROLES.has(resolvedRole)) return { allowed: true };
  if (projectId) return { allowed: true };

  const normalizedRoleLower = String(resolvedRole || '').trim().toLowerCase();
  const isPartner = ['socio / cliente', 'socio', 'partner', 'cliente'].includes(normalizedRoleLower);
  const maxWorkspaces = isPartner ? MAX_WORKSPACES_PARTNER : MAX_WORKSPACES_FREE;
  const maxCanvases = isPartner ? MAX_CANVASES_PER_WORKSPACE_PARTNER : MAX_CANVASES_PER_WORKSPACE_FREE;

  const sessions = await listFormaliaSessionsArchive({
    userId,
    userEmail,
    mineOnly: true
  });

  const nonProjectWorkspaces = new Set();
  const canvasesInTarget = new Set();

  sessions.forEach((s) => {
    const ws = resolveWorkspaceFields(s);
    if (!ws.project_id && ws.workspace_id && ws.workspace_id !== 'ws_general') {
      nonProjectWorkspaces.add(ws.workspace_id);
    }
    if (workspaceId && ws.workspace_id === workspaceId) {
      canvasesInTarget.add(s.session_id);
    }
  });

  if (creatingNewWorkspace && workspaceId && !nonProjectWorkspaces.has(workspaceId)) {
    if (nonProjectWorkspaces.size >= maxWorkspaces) {
      return {
        allowed: false,
        code: 'WORKSPACE_LIMIT_EXCEEDED',
        limit: maxWorkspaces,
        error: `Alcanzaste el límite técnico de ${maxWorkspaces} espacios de trabajo para tu plan actual.`
      };
    }
  }

  if (workspaceId && canvasesInTarget.size >= maxCanvases) {
    return {
      allowed: false,
      code: 'CANVAS_LIMIT_EXCEEDED',
      limit: maxCanvases,
      error: `Este espacio alcanzó el máximo de ${maxCanvases} lienzos para tu plan actual.`
    };
  }

  return { allowed: true };
}

export async function claimAnonymousSessionToAccount({
  anonymousSessionId,
  userId = null,
  userEmail = null,
  userName = null,
  workspaceId = null,
  workspaceName = null,
  projectId = null,
  fallbackSession = null
} = {}) {
  if (!anonymousSessionId && !fallbackSession?.session_id) {
    return { ok: false, error: 'anonymous_session_id es requerido' };
  }
  const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : null;
  if (!userId && !cleanEmail) {
    return { ok: false, error: 'Debes autenticarte para reclamar el lienzo.' };
  }

  const targetSessionId = anonymousSessionId || fallbackSession.session_id;
  const remoteExisting = await getSession(targetSessionId);
  const scoreRichness = (s) => {
    if (!s || typeof s !== 'object') return -1;
    const msgs = Array.isArray(s.messages) ? s.messages.length : 0;
    const turns = Number(s.turns_count || 0);
    const vers = Array.isArray(s.versions) ? s.versions.length : 0;
    const steps = Array.isArray(s.process_graph?.steps) ? s.process_graph.steps.length : 0;
    const actors = Array.isArray(s.process_graph?.actors) ? s.process_graph.actors.length : 0;
    return turns * 100 + msgs * 15 + vers * 20 + steps * 10 + actors * 5 + Number(s.completeness_score || 0);
  };
  const existing =
    remoteExisting && fallbackSession
      ? (scoreRichness(fallbackSession) > scoreRichness(remoteExisting)
          ? { ...remoteExisting, ...fallbackSession }
          : { ...fallbackSession, ...remoteExisting })
      : (remoteExisting || fallbackSession);
  if (!existing) {
    return { ok: false, error: 'Sesión anónima no encontrada.' };
  }

  const wsSlug = String(
    workspaceName ||
      existing.process_graph?.business_context?.company_name ||
      'mi_negocio'
  )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);

  const assignedProjectId =
    projectId !== undefined && projectId !== null && String(projectId).trim() && String(projectId).trim() !== 'all'
      ? String(projectId).trim()
      : (existing.project_id || null);

  const assignedWsId =
    workspaceId ||
    (assignedProjectId ? `ws_proj_${assignedProjectId}` : null) ||
    (existing.workspace_id && existing.workspace_id !== 'ws_general'
      ? existing.workspace_id
      : `ws_${wsSlug || 'negocio'}`);
  const assignedWsName =
    workspaceName ||
    existing.workspace_name ||
    existing.process_graph?.business_context?.company_name ||
    (assignedProjectId ? `Proyecto ${assignedProjectId}` : 'Mi Negocio / General');
  const assignedCanvasTitle =
    existing.canvas_title ||
    existing.process_graph?.business_context?.process_name ||
    existing.process_name ||
    'Lienzo principal';

  const nextGraph = {
    ...(existing.process_graph || {}),
    workspace_meta: {
      workspace_id: assignedWsId,
      workspace_name: assignedWsName,
      project_id: assignedProjectId,
      canvas_title: assignedCanvasTitle
    }
  };

  const claimed = await saveSession({
    ...existing,
    session_id: targetSessionId,
    user_id: userId || existing.user_id || null,
    user_email: cleanEmail || existing.user_email || null,
    user_name: userName || existing.user_name || null,
    workspace_id: assignedWsId,
    workspace_name: assignedWsName,
    project_id: assignedProjectId,
    canvas_title: assignedCanvasTitle,
    process_name: assignedCanvasTitle,
    saved_to_account: true,
    expires_at: '2099-12-31T23:59:59Z',
    process_graph: nextGraph
  });

  return {
    ok: true,
    workspace_id: assignedWsId,
    workspace_name: assignedWsName,
    project_id: assignedProjectId,
    session: claimed
  };
}

export async function getWorkspaceBlueprint(workspaceId = 'ws_general') {
  const cleanId = String(workspaceId || 'ws_general');
  const sb = getSupabaseServerClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('web_blueprints')
        .select('*')
        .eq('workspace_id', cleanId)
        .maybeSingle();
      if (!error && data) {
        const bp = {
          blueprint_id: data.id,
          workspace_id: data.workspace_id,
          source_canvas_ids: data.source_canvas_ids || [],
          user_stories: data.user_stories_json || [],
          theme_config: data.theme_config_json || createDefaultWebBlueprint(cleanId).theme_config,
          ui_screens: data.ui_screens_json || [],
          updated_at: data.updated_at
        };
        memoryBlueprints.set(cleanId, bp);
        return bp;
      }
    } catch (_) {}

    // Fallback JSONB en formalia_sessions si la tabla web_blueprints aún no existe
    try {
      const { data } = await sb
        .from('formalia_sessions')
        .select('process_graph, updated_at')
        .eq('session_id', `SYS-BP-${cleanId}`)
        .maybeSingle();
      if (data?.process_graph?.blueprint_id) {
        memoryBlueprints.set(cleanId, data.process_graph);
        return data.process_graph;
      }
    } catch (_) {}
  }

  if (memoryBlueprints.has(cleanId)) {
    return memoryBlueprints.get(cleanId);
  }

  return createDefaultWebBlueprint(cleanId);
}

export async function saveWorkspaceBlueprint(workspaceId = 'ws_general', patch = {}) {
  const cleanId = String(workspaceId || 'ws_general');
  const prev = await getWorkspaceBlueprint(cleanId);

  const sanitizedScreens =
    patch.ui_screens !== undefined
      ? sanitizeUiScreensPayload(patch.ui_screens)
      : prev.ui_screens || [];

  const next = {
    ...prev,
    ...(patch.blueprint_id ? { blueprint_id: patch.blueprint_id } : {}),
    workspace_id: cleanId,
    source_canvas_ids:
      patch.source_canvas_ids !== undefined ? patch.source_canvas_ids : (prev.source_canvas_ids || []),
    user_stories:
      patch.user_stories !== undefined ? patch.user_stories : (prev.user_stories || []),
    theme_config:
      patch.theme_config !== undefined ? { ...(prev.theme_config || {}), ...patch.theme_config } : prev.theme_config,
    ui_screens: sanitizedScreens,
    updated_at: new Date().toISOString()
  };

  memoryBlueprints.set(cleanId, next);

  const sb = getSupabaseServerClient();
  if (sb) {
    let savedDedicated = false;
    try {
      const { error } = await sb.from('web_blueprints').upsert(
        {
          id: next.blueprint_id,
          workspace_id: cleanId,
          source_canvas_ids: next.source_canvas_ids,
          user_stories_json: next.user_stories,
          theme_config_json: next.theme_config,
          ui_screens_json: next.ui_screens,
          updated_at: next.updated_at
        },
        { onConflict: 'workspace_id' }
      );
      if (!error) savedDedicated = true;
    } catch (_) {}

    if (!savedDedicated) {
      try {
        await sb.from('formalia_sessions').upsert({
          session_id: `SYS-BP-${cleanId}`,
          process_graph: next,
          messages: [],
          versions: [],
          generated_files: [],
          turns_count: 0,
          completeness_score: 100,
          expires_at: '2099-12-31T23:59:59Z',
          updated_at: next.updated_at
        });
      } catch (_) {}
    }
  }

  return next;
}

export { MAX_TURNS_PER_SESSION };
