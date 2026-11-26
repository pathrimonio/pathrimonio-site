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
        .not('session_id', 'like', 'SYS-%')
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
  return Array.from(memorySessions.values()).filter((s) => !String(s.session_id || '').startsWith('SYS-'));
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

// ── Telemetría Diaria de API y Límites por Clave Conectada ────────────────────

const TELEMETRY_SYSTEM_SESSION_ID = 'SYS-API-TELEMETRY-V1';
const memoryApiUsageLogs = [];
const memoryApiKeyQuotas = new Map();
const memoryProbeResults = new Map();

export const DEFAULT_KEY_QUOTA_PROFILES = {
  server_gemini: {
    key_id: 'server_gemini',
    provider: 'gemini',
    label: 'Google Gemini API (Servidor FormalIA)',
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

export { MAX_TURNS_PER_SESSION };
