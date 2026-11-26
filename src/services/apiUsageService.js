import { loadArchiflyAiConfig } from './archiflyAiService';

const CLIENT_API_USAGE_KEY = 'pathrimonio_client_api_usage_v1';
const LOCAL_QUOTA_OVERRIDES_KEY = 'pathrimonio_api_quota_overrides_v1';

export const PLAN_TIER_PRESETS = {
  gemini: {
    free: { label: 'Free Tier (Google AI Studio)', daily_request_limit: 1500, rpm_limit: 15, daily_token_limit: 250000 },
    tier1: { label: 'Tier 1 Pago (Facturación GCP)', daily_request_limit: 10000, rpm_limit: 300, daily_token_limit: 4000000 }
  },
  openai: {
    free: { label: 'Free / Sandbox', daily_request_limit: 200, rpm_limit: 3, daily_token_limit: 40000 },
    tier1: { label: 'Tier 1 Pago', daily_request_limit: 10000, rpm_limit: 500, daily_token_limit: 2000000 }
  },
  deepseek: {
    free: { label: 'Prueba / Bajo Saldo', daily_request_limit: 1000, rpm_limit: 30, daily_token_limit: 1000000 },
    tier1: { label: 'Estándar Prepago', daily_request_limit: 5000, rpm_limit: 60, daily_token_limit: 5000000 }
  }
};

function maskFingerprint(key = '') {
  const clean = String(key || '').trim();
  if (!clean) return '';
  if (clean.length <= 10) return `${clean.slice(0, 3)}••••`;
  return `${clean.slice(0, 5)}••••${clean.slice(-4)}`;
}

function getLimaDateString(input = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(input));
  } catch {
    return new Date(input).toISOString().slice(0, 10);
  }
}

function loadLocalClientLogs() {
  try {
    const raw = localStorage.getItem(CLIENT_API_USAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadLocalQuotaOverrides() {
  try {
    const raw = localStorage.getItem(LOCAL_QUOTA_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalQuotaOverride(patch) {
  try {
    const all = loadLocalQuotaOverrides();
    all[patch.key_id] = patch;
    localStorage.setItem(LOCAL_QUOTA_OVERRIDES_KEY, JSON.stringify(all));
  } catch (_) {}
}

function enrichSummaryWithPortalByok(serverSummary) {
  const archiflyCfg = loadArchiflyAiConfig();
  const localLogs = loadLocalClientLogs();
  const today = serverSummary?.today_date || getLimaDateString();
  const localOverrides = loadLocalQuotaOverrides();

  const keys = [...(serverSummary?.keys || [])];
  const byokKeyId = `portal_byok_${archiflyCfg.provider || 'gemini'}`;
  const hasServerByokEntry = keys.some((k) => k.key_id === byokKeyId);

  if (archiflyCfg.apiKey && !hasServerByokEntry) {
    const provider = archiflyCfg.provider || 'gemini';
    const preset = PLAN_TIER_PRESETS[provider]?.free || PLAN_TIER_PRESETS.gemini.free;
    const override = localOverrides[byokKeyId] || {};
    const limitReq = Number(override.daily_request_limit) || preset.daily_request_limit;
    const limitTok = Number(override.daily_token_limit) || preset.daily_token_limit;
    const limitRpm = Number(override.rpm_limit) || preset.rpm_limit;

    const todayByokLogs = localLogs.filter(
      (l) => getLimaDateString(l.created_at) === today && (l.key_id === byokKeyId || l.provider === provider)
    );
    const reqToday = todayByokLogs.length;
    const tokToday = todayByokLogs.reduce((acc, l) => acc + (Number(l.total_tokens) || 0), 0);
    const promptTok = todayByokLogs.reduce((acc, l) => acc + (Number(l.prompt_tokens) || 0), 0);
    const outTok = todayByokLogs.reduce((acc, l) => acc + (Number(l.output_tokens) || 0), 0);
    const reqPct = Math.min(100, Math.round((reqToday / Math.max(1, limitReq)) * 100));
    const tokPct = Math.min(100, Math.round((tokToday / Math.max(1, limitTok)) * 100));

    keys.push({
      key_id: byokKeyId,
      provider,
      label: `Portal Archifly BYOK (${provider.toUpperCase()})`,
      scope: 'client_byok',
      connected: Boolean(archiflyCfg.isAiEnabled && archiflyCfg.apiKey),
      active_env_var: 'localStorage (Configuración IA)',
      key_fingerprint: maskFingerprint(archiflyCfg.apiKey),
      configured_models: [archiflyCfg.model || 'gemini-3.5-flash-lite'],
      tier: override.tier || 'free',
      daily_request_limit: limitReq,
      rpm_limit: limitRpm,
      daily_token_limit: limitTok,
      notes: override.notes || 'Clave personal conectada en el navegador para análisis Archifly.',
      health_status: archiflyCfg.isAiEnabled ? 'healthy' : 'missing',
      usage_today: {
        requests: reqToday,
        remaining_requests: Math.max(0, limitReq - reqToday),
        request_pct: reqPct,
        success_count: todayByokLogs.filter((l) => l.success !== false).length,
        rate_limited_count: todayByokLogs.filter((l) => l.http_status === 429).length,
        error_count: todayByokLogs.filter((l) => l.success === false && l.http_status !== 429).length,
        rpm_current: 0,
        prompt_tokens: promptTok,
        output_tokens: outTok,
        total_tokens: tokToday,
        remaining_tokens: Math.max(0, limitTok - tokToday),
        token_pct: tokPct,
        avg_latency_ms: 0,
        last_used_at: todayByokLogs[0]?.created_at || null
      },
      models_today: []
    });
  }

  return {
    ...serverSummary,
    keys,
    summary: {
      ...(serverSummary?.summary || {}),
      connected_keys_count: keys.filter((k) => k.connected).length,
      total_keys_count: keys.length
    }
  };
}

function buildOfflineSummary(days = 7) {
  const today = getLimaDateString();
  const localLogs = loadLocalClientLogs();
  const base = {
    timezone: 'America/Lima',
    today_date: today,
    storage_backend: 'client_local_fallback',
    summary: {
      connected_keys_count: 0,
      total_keys_count: 1,
      requests_today: localLogs.filter((l) => getLimaDateString(l.created_at) === today).length,
      daily_request_limit_total: 1500,
      request_usage_pct: 0,
      tokens_today: 0,
      prompt_tokens_today: 0,
      output_tokens_today: 0,
      daily_token_limit_total: 250000,
      token_usage_pct: 0,
      success_rate_pct: 100,
      rate_limited_today: 0,
      avg_latency_ms: 0
    },
    keys: [
      {
        key_id: 'server_gemini',
        provider: 'gemini',
        label: 'Google Gemini API (Servidor FormalIA)',
        scope: 'server',
        connected: false,
        active_env_var: 'GEMINI_API_KEY (Solo entorno Vercel)',
        key_fingerprint: '',
        configured_models: ['gemini-flash-lite-latest', 'gemini-3-flash-preview'],
        tier: 'free',
        daily_request_limit: 1500,
        rpm_limit: 15,
        daily_token_limit: 250000,
        notes: 'Requiere servidor Vercel (/api/v1/admin/api-usage) para consultar entorno de producción.',
        health_status: 'missing',
        usage_today: {
          requests: 0,
          remaining_requests: 1500,
          request_pct: 0,
          success_count: 0,
          rate_limited_count: 0,
          error_count: 0,
          rpm_current: 0,
          prompt_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
          remaining_tokens: 250000,
          token_pct: 0,
          avg_latency_ms: 0,
          last_used_at: null
        },
        models_today: []
      }
    ],
    daily_series: Array.from({ length: days }, (_, idx) => {
      const d = new Date(Date.now() - (days - 1 - idx) * 86400000);
      const ds = getLimaDateString(d);
      const dayEvents = localLogs.filter((l) => getLimaDateString(l.created_at) === ds);
      return {
        date: ds,
        requests: dayEvents.length,
        success: dayEvents.filter((e) => e.success !== false).length,
        errors: dayEvents.filter((e) => e.success === false).length,
        tokens: dayEvents.reduce((acc, e) => acc + (Number(e.total_tokens) || 0), 0)
      };
    }),
    recent_logs: localLogs.slice(0, 30)
  };
  return enrichSummaryWithPortalByok(base);
}

export async function fetchAdminApiUsage(days = 7) {
  try {
    const res = await fetch(`/api/v1/admin/api-usage?days=${days}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return enrichSummaryWithPortalByok(data);
    }
  } catch (_) {}
  return buildOfflineSummary(days);
}

export async function probeServerApiKeys() {
  const res = await fetch('/api/v1/admin/api-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'probe' })
  });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error('La verificación de claves de servidor requiere conexión con /api/v1/admin/api-usage.');
  }
  const data = await res.json();
  return {
    ...data,
    summary: enrichSummaryWithPortalByok(data.summary)
  };
}

export async function saveApiKeyQuotaLimit(patch) {
  saveLocalQuotaOverride(patch);
  try {
    const res = await fetch('/api/v1/admin/api-usage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return {
        ...data,
        summary: enrichSummaryWithPortalByok(data.summary)
      };
    }
  } catch (_) {}
  return {
    ok: true,
    quota: patch,
    summary: buildOfflineSummary(7)
  };
}
