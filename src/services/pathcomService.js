import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { normalizeRoleCode } from '../auth/permissionsConfig.js';
import {
  DEFAULT_PATHCOM_MODULE_FLAGS,
  filterVisibleSiteProjects
} from '../lib/pathcom/rbacPolicy.js';
import { executePathcomTool, formatPathTimestamp } from '../lib/pathcom/toolExecutor.js';
import { runPathcomAgentTurn } from '../lib/pathcom/agentEngine.js';

const LOCAL_PATHCOM_STATE_KEY = 'pathcom_workspace_state_v1';

const SEED_SITE_PROJECTS = [
  {
    id: 'pathway',
    name: 'Pathway — Metas y Progreso Comunitario',
    client_partner_id: 'partner_pathrimonio',
    status: 'LIVE',
    public_summary:
      'Aplicación móvil y web que ordena objetivos por pasos diarios e integra avances sincronizados hacia Pathrimonio.',
    draft_name: null,
    draft_status: null,
    draft_summary: null,
    cms_state: 'PUBLISHED',
    is_published: true,
    updated_at: '2026-11-28T01:00:00Z'
  },
  {
    id: 'core-hub',
    name: 'Core Hub PYME — Caja, Stock y Pedidos Offline-First',
    client_partner_id: 'partner_pyme_01',
    status: 'LIVE',
    public_summary:
      'Sistema operativo por roles para comercios y distribuidoras con base local SQLite y $0 de implementación para socios.',
    draft_name: null,
    draft_status: null,
    draft_summary: null,
    cms_state: 'PUBLISHED',
    is_published: true,
    updated_at: '2026-11-28T01:00:00Z'
  },
  {
    id: 'formalia-studio',
    name: 'Formalia Studio & Pathcom Ops',
    client_partner_id: 'partner_pathrimonio',
    status: 'IN_PROGRESS',
    public_summary:
      'Motor de mapeo de procesos por carriles conectado a historias SDD y registro cronológico verificable.',
    draft_name: null,
    draft_status: null,
    draft_summary: null,
    cms_state: 'PUBLISHED',
    is_published: true,
    updated_at: '2026-11-28T01:00:00Z'
  }
];

const SEED_MARKET_PATHS = [
  {
    id: 'MP-2026-001',
    author_user_id: 'USR-SOFIA-OPS',
    author_name: 'Sofía Mendoza · Operaciones',
    author_email: 'sofia@pathrimonio.org',
    title: 'Implementación de Control de Caja y Cierre Diario sin Descuadres',
    category: 'Finanzas & Caja PYME',
    summary:
      'Guía paso a paso validada en tienda real para separar apertura, arqueo ciego por turno y reporte automático a Gerencia.',
    steps_json: [
      {
        log_id: 'LOG-2026-8801',
        title: 'Inventario inicial de conceptos de ingreso y egreso',
        content: 'Estandarización de motivos de caja chica, transferencias Yape/Plin y ventas al contado.',
        recorded_at: '2026-11-26T14:10:00Z',
        client_timezone: 'America/Lima',
        duration_minutes: 35,
        progress_percent: 35,
        source: 'WEB'
      },
      {
        log_id: 'LOG-2026-8802',
        title: 'Configuración de rol Cajero con arqueo ciego',
        content: 'El rol Cajero registra el efectivo contado antes de ver el saldo esperado, reduciendo errores manuales.',
        recorded_at: '2026-11-27T16:45:00Z',
        client_timezone: 'America/Lima',
        duration_minutes: 50,
        progress_percent: 75,
        source: 'WEB'
      },
      {
        log_id: 'LOG-2026-8803',
        title: 'Validación en cierre real y sincronización de meta en Pathway',
        content: 'Primer cierre completo de fin de semana sin diferencias ni hojas paralelas.',
        recorded_at: '2026-11-28T01:15:00Z',
        client_timezone: 'America/Lima',
        duration_minutes: 30,
        progress_percent: 100,
        source: 'PATHWAY'
      }
    ],
    status: 'VALIDATED',
    is_patrimonio_validated: true,
    avg_rating: 4.85,
    validations_count: 2,
    total_duration_minutes: 115,
    published_at: '2026-11-28T01:20:00Z',
    created_at: '2026-11-28T01:18:00Z',
    updated_at: '2026-11-28T01:20:00Z'
  },
  {
    id: 'MP-2026-002',
    author_user_id: 'USR-CARLOS-LOG',
    author_name: 'Carlos Quispe · Logística',
    author_email: 'carlos@pathrimonio.org',
    title: 'Ruta de Despacho en Almacén con Guías por WhatsApp y Conteo Rápido',
    category: 'Almacén & Despacho',
    summary:
      'Secuencia verificada en ruta de 3 sesiones para separar picking de despacho y confirmar entregas sin pérdida de stock.',
    steps_json: [
      {
        log_id: 'LOG-2026-8811',
        title: 'Etiquetado de zonas rápidas de almacén',
        content: 'Se agruparon los 40 SKUs de mayor rotación en pasillo A para reducir traslados.',
        recorded_at: '2026-11-27T15:05:00Z',
        client_timezone: 'America/Lima',
        duration_minutes: 40,
        progress_percent: 50,
        source: 'WEB'
      },
      {
        log_id: 'LOG-2026-8812',
        title: 'Checklist de salida para repartidor',
        content: 'Confirmación obligatoria de bultos antes de marcar el pedido En Ruta.',
        recorded_at: '2026-11-27T21:30:00Z',
        client_timezone: 'America/Lima',
        duration_minutes: 45,
        progress_percent: 90,
        source: 'WEB'
      }
    ],
    status: 'PEER_REVIEW',
    is_patrimonio_validated: false,
    avg_rating: 4.5,
    validations_count: 1,
    total_duration_minutes: 85,
    published_at: '2026-11-27T21:40:00Z',
    created_at: '2026-11-27T21:35:00Z',
    updated_at: '2026-11-27T21:40:00Z'
  }
];

const SEED_PATH_LOGS = [
  {
    id: 'LOG-2026-8801',
    user_id: 'USR-SOFIA-OPS',
    user_email: 'sofia@pathrimonio.org',
    user_name: 'Sofía Mendoza · Operaciones',
    market_path_id: 'MP-2026-001',
    title: 'Inventario inicial de conceptos de ingreso y egreso',
    content: 'Estandarización de motivos de caja chica, transferencias Yape/Plin y ventas al contado.',
    recorded_at: '2026-11-26T14:10:00Z',
    client_timezone: 'America/Lima',
    duration_minutes: 35,
    progress_percent: 35,
    source: 'WEB',
    verified_timestamp: true
  },
  {
    id: 'LOG-2026-8802',
    user_id: 'USR-SOFIA-OPS',
    user_email: 'sofia@pathrimonio.org',
    user_name: 'Sofía Mendoza · Operaciones',
    market_path_id: 'MP-2026-001',
    title: 'Configuración de rol Cajero con arqueo ciego',
    content: 'El rol Cajero registra el efectivo contado antes de ver el saldo esperado, reduciendo errores manuales.',
    recorded_at: '2026-11-27T16:45:00Z',
    client_timezone: 'America/Lima',
    duration_minutes: 50,
    progress_percent: 75,
    source: 'WEB',
    verified_timestamp: true
  },
  {
    id: 'LOG-2026-8803',
    user_id: 'USR-SOFIA-OPS',
    user_email: 'sofia@pathrimonio.org',
    user_name: 'Sofía Mendoza · Operaciones',
    market_path_id: 'MP-2026-001',
    title: 'Validación en cierre real y sincronización de meta en Pathway',
    content: 'Primer cierre completo de fin de semana sin diferencias ni hojas paralelas.',
    recorded_at: '2026-11-28T01:15:00Z',
    client_timezone: 'America/Lima',
    duration_minutes: 30,
    progress_percent: 100,
    source: 'PATHWAY',
    verified_timestamp: true
  },
  {
    id: 'LOG-2026-8811',
    user_id: 'USR-CARLOS-LOG',
    user_email: 'carlos@pathrimonio.org',
    user_name: 'Carlos Quispe · Logística',
    market_path_id: 'MP-2026-002',
    title: 'Etiquetado de zonas rápidas de almacén',
    content: 'Se agruparon los 40 SKUs de mayor rotación en pasillo A para reducir traslados.',
    recorded_at: '2026-11-27T15:05:00Z',
    client_timezone: 'America/Lima',
    duration_minutes: 40,
    progress_percent: 50,
    source: 'WEB',
    verified_timestamp: true
  },
  {
    id: 'LOG-2026-8812',
    user_id: 'USR-CARLOS-LOG',
    user_email: 'carlos@pathrimonio.org',
    user_name: 'Carlos Quispe · Logística',
    market_path_id: 'MP-2026-002',
    title: 'Checklist de salida para repartidor',
    content: 'Confirmación obligatoria de bultos antes de marcar el pedido En Ruta.',
    recorded_at: '2026-11-27T21:30:00Z',
    client_timezone: 'America/Lima',
    duration_minutes: 45,
    progress_percent: 90,
    source: 'WEB',
    verified_timestamp: true
  }
];

export function detectBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima';
  } catch (_) {
    return 'America/Lima';
  }
}

export function buildClientActor(currentUser) {
  if (!currentUser) {
    return {
      authenticated: false,
      roleCode: 'guest',
      userId: null,
      userEmail: null,
      userName: 'Visitante',
      timezone: detectBrowserTimezone()
    };
  }
  return {
    authenticated: true,
    roleCode: normalizeRoleCode(currentUser.role || 'Usuario Registrado'),
    userId: currentUser.id || currentUser.email,
    userEmail: currentUser.email || null,
    userName: currentUser.name || currentUser.email || 'Integrante',
    timezone: detectBrowserTimezone()
  };
}

function readLocalState() {
  const defaults = {
    logs: [...SEED_PATH_LOGS],
    marketPaths: [...SEED_MARKET_PATHS],
    validations: [],
    siteProjects: [...SEED_SITE_PROJECTS],
    queue: [],
    messages: []
  };
  if (typeof localStorage === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(LOCAL_PATHCOM_STATE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      logs: Array.isArray(parsed.logs) && parsed.logs.length ? parsed.logs : defaults.logs,
      marketPaths: Array.isArray(parsed.marketPaths) && parsed.marketPaths.length ? parsed.marketPaths : defaults.marketPaths,
      validations: Array.isArray(parsed.validations) ? parsed.validations : [],
      siteProjects: Array.isArray(parsed.siteProjects) && parsed.siteProjects.length ? parsed.siteProjects : defaults.siteProjects,
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : []
    };
  } catch {
    return defaults;
  }
}

function writeLocalState(next) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PATHCOM_STATE_KEY, JSON.stringify(next));
  } catch (_) {}
}

function createLocalBrowserRepo() {
  const state = readLocalState();
  const persist = () => writeLocalState(state);

  return {
    async createPathLog(row) {
      state.logs.unshift(row);
      persist();
      return row;
    },
    async listPathLogs({ userId = null, marketPathId = null, publicOnly = false, order = 'desc' } = {}) {
      let list = [...state.logs];
      if (userId) list = list.filter((l) => l.user_id === userId);
      if (marketPathId) list = list.filter((l) => l.market_path_id === marketPathId);
      if (publicOnly && !marketPathId) list = list.filter((l) => Boolean(l.market_path_id));
      list.sort((a, b) => {
        const diff = new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime();
        return order === 'asc' ? diff : -diff;
      });
      return list;
    },
    async linkLogsToMarketPath(logIds = [], marketPathId) {
      const set = new Set(logIds);
      for (const l of state.logs) {
        if (set.has(l.id)) l.market_path_id = marketPathId;
      }
      persist();
    },
    async listMarketPaths({ category = null, includeDraftsForUserId = null } = {}) {
      return state.marketPaths
        .filter((m) => {
          if (includeDraftsForUserId === '__ALL__') return true;
          if (m.status === 'PEER_REVIEW' || m.status === 'VALIDATED') return true;
          return Boolean(includeDraftsForUserId && m.author_user_id === includeDraftsForUserId);
        })
        .filter((m) => (!category || category === 'Todas' ? true : m.category === category));
    },
    async getMarketPathById(id) {
      return state.marketPaths.find((m) => m.id === id) || null;
    },
    async saveMarketPath(item) {
      const idx = state.marketPaths.findIndex((m) => m.id === item.id);
      if (idx >= 0) state.marketPaths[idx] = { ...state.marketPaths[idx], ...item };
      else state.marketPaths.unshift(item);
      persist();
      return item;
    },
    async listPathValidations(marketPathId) {
      return state.validations.filter((v) => v.market_path_id === marketPathId);
    },
    async savePathValidation(val) {
      const idx = state.validations.findIndex(
        (v) => v.market_path_id === val.market_path_id && v.validator_user_id === val.validator_user_id
      );
      if (idx >= 0) state.validations[idx] = { ...state.validations[idx], ...val };
      else state.validations.unshift(val);
      persist();
      return val;
    },
    async recomputeMarketPathRating(marketPathId) {
      const target = state.marketPaths.find((m) => m.id === marketPathId);
      if (!target) return null;
      const list = state.validations.filter((v) => v.market_path_id === marketPathId);
      const totalWeight = list.reduce((acc, v) => acc + (Number(v.validator_weight) || 1), 0);
      const weightedSum = list.reduce((acc, v) => acc + Number(v.score) * (Number(v.validator_weight) || 1), 0);
      if (list.length > 0) {
        target.validations_count = list.length;
        target.avg_rating = Number((weightedSum / totalWeight).toFixed(2));
      }
      persist();
      return target;
    },
    async listSiteProjects() {
      return [...state.siteProjects];
    },
    async saveSiteProjectDraft({ id, draft_name, draft_status, draft_summary }) {
      const idx = state.siteProjects.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const cur = state.siteProjects[idx];
        state.siteProjects[idx] = {
          ...cur,
          draft_name: draft_name ?? cur.draft_name ?? cur.name,
          draft_status: draft_status ?? cur.draft_status ?? cur.status,
          draft_summary: draft_summary ?? cur.draft_summary ?? cur.public_summary,
          cms_state: 'DRAFT',
          updated_at: new Date().toISOString()
        };
        persist();
        return state.siteProjects[idx];
      }
      const created = {
        id,
        name: draft_name || id,
        client_partner_id: null,
        status: 'DISCOVERY',
        public_summary: '',
        draft_name: draft_name || id,
        draft_status: draft_status || 'DISCOVERY',
        draft_summary: draft_summary || '',
        cms_state: 'DRAFT',
        is_published: false,
        updated_at: new Date().toISOString()
      };
      state.siteProjects.unshift(created);
      persist();
      return created;
    },
    async enqueueAction(item) {
      state.queue.unshift(item);
      persist();
      return item;
    },
    async listActionQueue({ status = null } = {}) {
      return state.queue.filter((q) => (!status ? true : q.status === status));
    },
    async resolveActionQueueItem({ id, decision, reviewerEmail, reviewNote }) {
      const item = state.queue.find((q) => q.id === id);
      if (!item) return null;
      item.status = decision;
      item.reviewed_by = reviewerEmail;
      item.review_note = reviewNote || '';
      item.reviewed_at = new Date().toISOString();
      if (decision === 'APPROVED') {
        const payload = item.payload_json || {};
        if (payload.kind === 'publish_site_project' && payload.project_id) {
          const p = state.siteProjects.find((sp) => sp.id === payload.project_id);
          if (p) {
            p.name = payload.proposed_live?.name || p.draft_name || p.name;
            p.status = payload.proposed_live?.status || p.draft_status || p.status;
            p.public_summary = payload.proposed_live?.public_summary || p.draft_summary || p.public_summary;
            p.draft_name = null;
            p.draft_status = null;
            p.draft_summary = null;
            p.cms_state = 'PUBLISHED';
            p.is_published = true;
            p.updated_at = new Date().toISOString();
          }
        } else if (payload.kind === 'certify_market_path' && payload.market_path_id) {
          const mp = state.marketPaths.find((m) => m.id === payload.market_path_id);
          if (mp) {
            mp.status = 'VALIDATED';
            mp.is_patrimonio_validated = true;
            mp.updated_at = new Date().toISOString();
          }
        }
      }
      persist();
      return item;
    },
    async listFormaliaSessionsSummary() {
      return [];
    },
    async fetchPathwayMilestones({ userId }) {
      return [
        {
          external_ref_id: `PW-${userId || 'PARTNER'}-01`,
          title: 'Pathway · Meta semanal de cierre operativo completada',
          content: 'Hito sincronizado desde Pathway App tras completar 5 días consecutivos de avance.',
          recorded_at: '2026-11-27T19:42:00Z',
          client_timezone: detectBrowserTimezone(),
          duration_minutes: 40,
          progress_percent: 80
        }
      ];
    },
    async saveChatMessage(msg) {
      state.messages.push(msg);
      persist();
      return msg;
    },
    async listChatMessages() {
      return state.messages.slice(-30);
    }
  };
}

async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'x-client-timezone': detectBrowserTimezone()
  };
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
  }
  return headers;
}

async function apiFetchJson(url, options = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return data;
}

export async function fetchPublishedSiteProjects() {
  try {
    const data = await apiFetchJson('/api/v1/pathcom/projects', { method: 'GET' });
    return Array.isArray(data.projects) ? data.projects : [];
  } catch {
    return filterVisibleSiteProjects(readLocalState().siteProjects, { roleCode: 'guest' });
  }
}

export async function fetchPathcomBootstrap(currentUser) {
  const actor = buildClientActor(currentUser);
  const localRepo = createLocalBrowserRepo();

  try {
    const [marketRes, projRes, histRes, timelineRes] = await Promise.all([
      apiFetchJson('/api/v1/market/paths', { method: 'GET' }),
      apiFetchJson('/api/v1/pathcom/projects', { method: 'GET' }),
      apiFetchJson('/api/v1/pathcom/history', { method: 'GET' }),
      apiFetchJson(`/api/v1/paths/${encodeURIComponent(actor.userId || 'all')}/timeline`, { method: 'GET' })
    ]);

    let approvals = [];
    if (['collaborator', 'admin'].includes(actor.roleCode)) {
      try {
        const appRes = await apiFetchJson('/api/v1/pathcom/approvals', { method: 'GET' });
        approvals = appRes.approvals || [];
      } catch (_) {}
    }

    return {
      actor,
      marketPaths: marketRes.paths || [],
      siteProjects: projRes.projects || [],
      featureFlags: projRes.feature_flags || DEFAULT_PATHCOM_MODULE_FLAGS,
      messages: histRes.messages || [],
      logs: timelineRes.logs || [],
      approvals,
      source: 'api'
    };
  } catch {
    const logs = await localRepo.listPathLogs({
      userId: actor.userId || null,
      publicOnly: !actor.authenticated,
      order: 'desc'
    });
    return {
      actor,
      marketPaths: await localRepo.listMarketPaths({ includeDraftsForUserId: actor.userId }),
      siteProjects: filterVisibleSiteProjects(await localRepo.listSiteProjects(), actor),
      featureFlags: DEFAULT_PATHCOM_MODULE_FLAGS,
      messages: await localRepo.listChatMessages(actor.userId),
      logs,
      approvals: ['collaborator', 'admin'].includes(actor.roleCode) ? await localRepo.listActionQueue() : [],
      source: 'local_fallback'
    };
  }
}

export async function sendPathcomChat(message, currentUser) {
  const actor = buildClientActor(currentUser);
  const clientTimezone = detectBrowserTimezone();
  try {
    return await apiFetchJson('/api/v1/pathcom/chat', {
      method: 'POST',
      body: JSON.stringify({ message, client_timezone: clientTimezone })
    });
  } catch (err) {
    if (err?.status === 400 || err?.status === 403 || err?.status === 429) throw err;
    const localRepo = createLocalBrowserRepo();
    const res = await runPathcomAgentTurn({
      message,
      actor,
      repo: localRepo,
      featureFlags: DEFAULT_PATHCOM_MODULE_FLAGS,
      clientTimezone,
      history: await localRepo.listChatMessages(actor.userId)
    });
    return { actor, ...res };
  }
}

export async function createManualPathLog(payload, currentUser) {
  const actor = buildClientActor(currentUser);
  const clientTimezone = detectBrowserTimezone();
  try {
    return await apiFetchJson('/api/v1/paths/logs', {
      method: 'POST',
      body: JSON.stringify({ ...payload, client_timezone: clientTimezone })
    });
  } catch (err) {
    if (err?.status === 400 || err?.status === 403) throw err;
    const localRepo = createLocalBrowserRepo();
    const res = await executePathcomTool({
      actor,
      toolName: 'path_log_tool',
      operation: 'create_log',
      args: { ...payload, client_timezone: clientTimezone },
      repo: localRepo
    });
    if (!res.ok) throw new Error(res.error);
    return res.data.log;
  }
}

export async function validateMarketPath(marketPathId, { score, feedback }, currentUser) {
  const actor = buildClientActor(currentUser);
  try {
    return await apiFetchJson(`/api/v1/market/paths/${encodeURIComponent(marketPathId)}/validate`, {
      method: 'POST',
      body: JSON.stringify({ score, feedback })
    });
  } catch (err) {
    if (err?.status === 400 || err?.status === 403) throw err;
    const localRepo = createLocalBrowserRepo();
    const res = await executePathcomTool({
      actor,
      toolName: 'market_curator_tool',
      operation: 'record_validation',
      args: { market_path_id: marketPathId, score, feedback },
      repo: localRepo
    });
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }
}

export async function syncPathwayLogs(currentUser) {
  const actor = buildClientActor(currentUser);
  try {
    return await apiFetchJson('/api/v1/pathcom/pathway-sync', {
      method: 'POST',
      body: JSON.stringify({ client_timezone: detectBrowserTimezone() })
    });
  } catch (err) {
    if (err?.status === 400 || err?.status === 403) throw err;
    const localRepo = createLocalBrowserRepo();
    const res = await executePathcomTool({
      actor,
      toolName: 'pathway_bridge_tool',
      operation: 'import_pathway_logs',
      args: { client_timezone: detectBrowserTimezone() },
      repo: localRepo
    });
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }
}

export async function submitSiteProjectCms(payload, currentUser) {
  const actor = buildClientActor(currentUser);
  try {
    return await apiFetchJson('/api/v1/pathcom/projects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    if (err?.status === 400 || err?.status === 403) throw err;
    const localRepo = createLocalBrowserRepo();
    const op = payload.request_publish ? 'request_publish' : 'create_section_draft';
    const res = await executePathcomTool({
      actor,
      toolName: 'site_cms_tool',
      operation: op,
      args: payload,
      repo: localRepo
    });
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }
}

export async function resolvePathcomApproval({ id, status, review_note = '' }, currentUser) {
  const actor = buildClientActor(currentUser);
  try {
    return await apiFetchJson('/api/v1/pathcom/approvals', {
      method: 'PATCH',
      body: JSON.stringify({ id, status, review_note })
    });
  } catch (err) {
    if (err?.status === 400 || err?.status === 403 || err?.status === 404) throw err;
    const localRepo = createLocalBrowserRepo();
    const resolved = await localRepo.resolveActionQueueItem({
      id,
      decision: status,
      reviewerEmail: actor.userEmail || actor.userName,
      reviewNote: review_note
    });
    return {
      approval: resolved,
      site_projects: filterVisibleSiteProjects(await localRepo.listSiteProjects(), actor)
    };
  }
}

export { formatPathTimestamp, DEFAULT_PATHCOM_MODULE_FLAGS };
