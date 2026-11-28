import { createClient } from '@supabase/supabase-js';
import { normalizeRoleCode } from '../../src/auth/permissionsConfig.js';
import { DEFAULT_PATHCOM_MODULE_FLAGS } from '../../src/lib/pathcom/rbacPolicy.js';
import { listFormaliaSessionsArchive } from './store.js';

function getSupabaseServerClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const DEFAULT_SITE_PROJECTS = [
  {
    id: 'pathway',
    name: 'Pathway — Metas y Progreso Comunitario',
    client_partner_id: 'partner_pathrimonio',
    status: 'LIVE',
    public_summary: 'Aplicación móvil y web que ordena objetivos por pasos diarios e integra avances sincronizados hacia Pathrimonio.',
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
    public_summary: 'Sistema operativo por roles para comercios y distribuidoras con base local SQLite y $0 de implementación para socios.',
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
    public_summary: 'Motor de mapeo de procesos por carriles conectado a historias SDD y registro cronológico verificable.',
    draft_name: null,
    draft_status: null,
    draft_summary: null,
    cms_state: 'PUBLISHED',
    is_published: true,
    updated_at: '2026-11-28T01:00:00Z'
  }
];

const DEFAULT_MARKET_PATHS = [
  {
    id: 'MP-2026-001',
    author_user_id: 'USR-SOFIA-OPS',
    author_name: 'Sofía Mendoza · Operaciones',
    author_email: 'sofia@pathrimonio.org',
    title: 'Implementación de Control de Caja y Cierre Diario sin Descuadres',
    category: 'Finanzas & Caja PYME',
    summary: 'Guía paso a paso validada en tienda real para separar apertura, arqueo ciego por turno y reporte automático a Gerencia.',
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
    summary: 'Secuencia verificada en ruta de 3 sesiones para separar picking de despacho y confirmar entregas sin pérdida de stock.',
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

const DEFAULT_PATH_LOGS = [
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

const DEFAULT_PATH_VALIDATIONS = [
  {
    id: 'VAL-2026-01',
    market_path_id: 'MP-2026-001',
    validator_user_id: 'USR-CARLOS-LOG',
    validator_name: 'Carlos Quispe',
    validator_role: 'collaborator',
    score: 5,
    feedback: 'Orden muy claro; el arqueo ciego evitó diferencias en el primer turno.',
    validator_weight: 1.5,
    created_at: '2026-11-28T01:25:00Z'
  },
  {
    id: 'VAL-2026-02',
    market_path_id: 'MP-2026-001',
    validator_user_id: 'USR-SOCIO-DEMO',
    validator_name: 'Bodega San Martín (Socio)',
    validator_role: 'partner',
    score: 5,
    feedback: 'Lo aplicamos con dos cajeros por turno y redujimos el cierre a 10 minutos.',
    validator_weight: 1.5,
    created_at: '2026-11-28T01:40:00Z'
  },
  {
    id: 'VAL-2026-03',
    market_path_id: 'MP-2026-002',
    validator_user_id: 'USR-SOFIA-OPS',
    validator_name: 'Sofía Mendoza',
    validator_role: 'collaborator',
    score: 5,
    feedback: 'Buena separación de zonas A; falta detallar protocolo de devoluciones.',
    validator_weight: 1.5,
    created_at: '2026-11-27T22:00:00Z'
  }
];

/**
 * Crea un repositorio en memoria compatible con Postgres/Supabase
 * para tests deterministas y fallback offline de servidor.
 */
export function createMemoryPathcomRepo(seed = {}) {
  const logs = [...(seed.logs || DEFAULT_PATH_LOGS)];
  const marketPaths = [...(seed.marketPaths || DEFAULT_MARKET_PATHS)];
  const validations = [...(seed.validations || DEFAULT_PATH_VALIDATIONS)];
  const siteProjects = [...(seed.siteProjects || DEFAULT_SITE_PROJECTS)];
  const queue = [...(seed.queue || [])];
  const chatHistory = [...(seed.chatHistory || [])];
  const formaliaSessions = [...(seed.formaliaSessions || [])];

  return {
    async createPathLog(row) {
      logs.unshift(row);
      return row;
    },
    async listPathLogs({ userId = null, marketPathId = null, publicOnly = false, order = 'desc' } = {}) {
      let filtered = [...logs];
      if (userId) filtered = filtered.filter((l) => l.user_id === userId);
      if (marketPathId) filtered = filtered.filter((l) => l.market_path_id === marketPathId);
      if (publicOnly && !marketPathId) {
        filtered = filtered.filter((l) => Boolean(l.market_path_id));
      }
      filtered.sort((a, b) => {
        const diff = new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime();
        return order === 'asc' ? diff : -diff;
      });
      return filtered;
    },
    async linkLogsToMarketPath(logIds = [], marketPathId) {
      const set = new Set(logIds);
      for (const l of logs) {
        if (set.has(l.id)) l.market_path_id = marketPathId;
      }
    },
    async listMarketPaths({ category = null, includeDraftsForUserId = null } = {}) {
      return marketPaths
        .filter((m) => {
          if (includeDraftsForUserId === '__ALL__') return true;
          if (m.status === 'PEER_REVIEW' || m.status === 'VALIDATED') return true;
          return Boolean(includeDraftsForUserId && m.author_user_id === includeDraftsForUserId);
        })
        .filter((m) => (!category || category === 'Todas' ? true : m.category === category))
        .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
    },
    async getMarketPathById(id) {
      return marketPaths.find((m) => m.id === id) || null;
    },
    async saveMarketPath(item) {
      const idx = marketPaths.findIndex((m) => m.id === item.id);
      if (idx >= 0) {
        marketPaths[idx] = { ...marketPaths[idx], ...item };
        return marketPaths[idx];
      }
      marketPaths.unshift(item);
      return item;
    },
    async listPathValidations(marketPathId) {
      return validations.filter((v) => v.market_path_id === marketPathId);
    },
    async savePathValidation(val) {
      const idx = validations.findIndex(
        (v) => v.market_path_id === val.market_path_id && v.validator_user_id === val.validator_user_id
      );
      if (idx >= 0) {
        validations[idx] = { ...validations[idx], ...val };
        return validations[idx];
      }
      validations.unshift(val);
      return val;
    },
    async recomputeMarketPathRating(marketPathId) {
      const target = marketPaths.find((m) => m.id === marketPathId);
      if (!target) return null;
      const list = validations.filter((v) => v.market_path_id === marketPathId);
      const totalWeight = list.reduce((acc, v) => acc + (Number(v.validator_weight) || 1), 0);
      const weightedSum = list.reduce(
        (acc, v) => acc + Number(v.score) * (Number(v.validator_weight) || 1),
        0
      );
      target.validations_count = list.length;
      target.avg_rating = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;
      if (list.length >= 2 && target.avg_rating >= 4.0 && target.status === 'PEER_REVIEW') {
        target.status = 'VALIDATED';
      }
      target.updated_at = new Date().toISOString();
      return target;
    },
    async listSiteProjects() {
      return [...siteProjects];
    },
    async saveSiteProjectDraft({ id, draft_name, draft_status, draft_summary }) {
      const idx = siteProjects.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const cur = siteProjects[idx];
        siteProjects[idx] = {
          ...cur,
          draft_name: draft_name ?? cur.draft_name ?? cur.name,
          draft_status: draft_status ?? cur.draft_status ?? cur.status,
          draft_summary: draft_summary ?? cur.draft_summary ?? cur.public_summary,
          cms_state: 'DRAFT',
          updated_at: new Date().toISOString()
        };
        return siteProjects[idx];
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
      siteProjects.unshift(created);
      return created;
    },
    async enqueueAction(item) {
      queue.unshift(item);
      return item;
    },
    async listActionQueue({ status = null } = {}) {
      return queue.filter((q) => (!status ? true : q.status === status));
    },
    async resolveActionQueueItem({ id, decision, reviewerEmail, reviewNote }) {
      const item = queue.find((q) => q.id === id);
      if (!item) return null;
      item.status = decision;
      item.reviewed_by = reviewerEmail || 'admin';
      item.review_note = reviewNote || '';
      item.reviewed_at = new Date().toISOString();

      if (decision === 'APPROVED') {
        const payload = item.payload_json || {};
        if (payload.kind === 'publish_site_project' && payload.project_id) {
          const p = siteProjects.find((sp) => sp.id === payload.project_id);
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
          const mp = marketPaths.find((m) => m.id === payload.market_path_id);
          if (mp) {
            mp.status = 'VALIDATED';
            mp.is_patrimonio_validated = true;
            mp.published_at = mp.published_at || new Date().toISOString();
            mp.updated_at = new Date().toISOString();
          }
        }
      }
      return item;
    },
    async listFormaliaSessionsSummary() {
      return formaliaSessions;
    },
    async fetchPathwayMilestones({ userId }) {
      return [
        {
          external_ref_id: `PW-${userId || 'PARTNER'}-01`,
          title: 'Pathway · Meta semanal de cierre operativo completada',
          content: 'Hito sincronizado desde Pathway App tras completar 5 días consecutivos de avance.',
          recorded_at: '2026-11-27T19:42:00Z',
          client_timezone: 'America/Lima',
          duration_minutes: 40,
          progress_percent: 80
        }
      ];
    },
    async saveChatMessage(msg) {
      chatHistory.push(msg);
      return msg;
    },
    async listChatMessages(userId) {
      return chatHistory.filter((m) => m.user_id === userId).slice(-30);
    }
  };
}

const fallbackMemoryRepo = createMemoryPathcomRepo();

/**
 * Resuelve la identidad RBAC real del solicitante desde Bearer JWT de Supabase.
 * Nunca confía en roles enviados en el cuerpo si existe sesión o sin token válido.
 */
export async function resolveServerActor(req) {
  const sb = getSupabaseServerClient();
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const timezone =
    req.headers?.['x-client-timezone'] ||
    req.body?.client_timezone ||
    req.query?.timezone ||
    'America/Lima';

  if (!sb || !token) {
    return {
      authenticated: false,
      roleCode: 'guest',
      userId: null,
      userEmail: null,
      userName: 'Visitante',
      timezone
    };
  }

  try {
    const { data, error } = await sb.auth.getUser(token);
    const authUser = data?.user;
    if (error || !authUser?.email) {
      return {
        authenticated: false,
        roleCode: 'guest',
        userId: null,
        userEmail: null,
        userName: 'Visitante',
        timezone
      };
    }

    const cleanEmail = String(authUser.email).trim().toLowerCase();
    const { data: portalRow } = await sb
      .from('portal_users')
      .select('id, email, name, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    const rawRole = portalRow?.role || authUser.user_metadata?.role || 'Usuario Registrado';
    return {
      authenticated: true,
      roleCode: normalizeRoleCode(rawRole),
      userId: portalRow?.id || authUser.id,
      userEmail: cleanEmail,
      userName: portalRow?.name || authUser.user_metadata?.name || cleanEmail.split('@')[0],
      timezone
    };
  } catch (_) {
    return {
      authenticated: false,
      roleCode: 'guest',
      userId: null,
      userEmail: null,
      userName: 'Visitante',
      timezone
    };
  }
}

export async function loadPathcomFeatureFlags() {
  const sb = getSupabaseServerClient();
  if (!sb) return { ...DEFAULT_PATHCOM_MODULE_FLAGS };
  try {
    const { data } = await sb
      .from('platform_settings')
      .select('value')
      .eq('key', 'pathcom_modules')
      .maybeSingle();
    return { ...DEFAULT_PATHCOM_MODULE_FLAGS, ...(data?.value || {}) };
  } catch (_) {
    return { ...DEFAULT_PATHCOM_MODULE_FLAGS };
  }
}

/**
 * Repositorio productivo Supabase con respaldo transparente a memoria
 * en caso las tablas aún no existan en un entorno de desarrollo.
 */
export function getServerPathcomRepo() {
  const sb = getSupabaseServerClient();
  if (!sb) return fallbackMemoryRepo;

  return {
    async createPathLog(row) {
      await fallbackMemoryRepo.createPathLog(row);
      try {
        const { data, error } = await sb.from('path_logs').insert(row).select('*').single();
        if (!error && data) return data;
      } catch (_) {}
      return row;
    },

    async listPathLogs({ userId = null, marketPathId = null, publicOnly = false, order = 'desc' } = {}) {
      try {
        let q = sb.from('path_logs').select('*').order('recorded_at', { ascending: order === 'asc' });
        if (userId) q = q.eq('user_id', userId);
        if (marketPathId) q = q.eq('market_path_id', marketPathId);
        if (publicOnly && !marketPathId) q = q.not('market_path_id', 'is', null);
        const { data, error } = await q.limit(100);
        if (!error && Array.isArray(data)) return data;
      } catch (_) {}
      return fallbackMemoryRepo.listPathLogs({ userId, marketPathId, publicOnly, order });
    },

    async linkLogsToMarketPath(logIds = [], marketPathId) {
      await fallbackMemoryRepo.linkLogsToMarketPath(logIds, marketPathId);
      if (!logIds.length) return;
      try {
        await sb.from('path_logs').update({ market_path_id: marketPathId }).in('id', logIds);
      } catch (_) {}
    },

    async listMarketPaths({ category = null, includeDraftsForUserId = null } = {}) {
      try {
        let q = sb.from('market_paths').select('*').order('updated_at', { ascending: false });
        if (category && category !== 'Todas') q = q.eq('category', category);
        const { data, error } = await q.limit(60);
        if (!error && Array.isArray(data)) {
          return data.filter((m) => {
            if (includeDraftsForUserId === '__ALL__') return true;
            if (m.status === 'PEER_REVIEW' || m.status === 'VALIDATED') return true;
            return Boolean(includeDraftsForUserId && m.author_user_id === includeDraftsForUserId);
          });
        }
      } catch (_) {}
      return fallbackMemoryRepo.listMarketPaths({ category, includeDraftsForUserId });
    },

    async getMarketPathById(id) {
      try {
        const { data, error } = await sb.from('market_paths').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (_) {}
      return fallbackMemoryRepo.getMarketPathById(id);
    },

    async saveMarketPath(item) {
      await fallbackMemoryRepo.saveMarketPath(item);
      try {
        const { data, error } = await sb.from('market_paths').upsert(item, { onConflict: 'id' }).select('*').single();
        if (!error && data) return data;
      } catch (_) {}
      return item;
    },

    async listPathValidations(marketPathId) {
      try {
        const { data, error } = await sb
          .from('path_validations')
          .select('*')
          .eq('market_path_id', marketPathId)
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) return data;
      } catch (_) {}
      return fallbackMemoryRepo.listPathValidations(marketPathId);
    },

    async savePathValidation(val) {
      await fallbackMemoryRepo.savePathValidation(val);
      try {
        const { data, error } = await sb
          .from('path_validations')
          .upsert(val, { onConflict: 'market_path_id,validator_user_id' })
          .select('*')
          .single();
        if (!error && data) return data;
      } catch (_) {}
      return val;
    },

    async recomputeMarketPathRating(marketPathId) {
      try {
        const { data: list, error } = await sb
          .from('path_validations')
          .select('*')
          .eq('market_path_id', marketPathId);
        const { data: target } = await sb
          .from('market_paths')
          .select('*')
          .eq('id', marketPathId)
          .maybeSingle();

        if (!error && Array.isArray(list) && target) {
          const totalWeight = list.reduce((acc, v) => acc + (Number(v.validator_weight) || 1), 0);
          const weightedSum = list.reduce(
            (acc, v) => acc + Number(v.score) * (Number(v.validator_weight) || 1),
            0
          );
          const avgRating = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;
          const nextStatus =
            list.length >= 2 && avgRating >= 4.0 && target.status === 'PEER_REVIEW'
              ? 'VALIDATED'
              : target.status;

          const { data: updated } = await sb
            .from('market_paths')
            .update({
              avg_rating: avgRating,
              validations_count: list.length,
              status: nextStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', marketPathId)
            .select('*')
            .single();
          if (updated) return updated;
        }
      } catch (_) {}
      return fallbackMemoryRepo.recomputeMarketPathRating(marketPathId);
    },

    async listSiteProjects() {
      try {
        const { data, error } = await sb
          .from('site_projects')
          .select('*')
          .order('updated_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (_) {}
      return fallbackMemoryRepo.listSiteProjects();
    },

    async saveSiteProjectDraft({ id, draft_name, draft_status, draft_summary }) {
      const memResult = await fallbackMemoryRepo.saveSiteProjectDraft({ id, draft_name, draft_status, draft_summary });
      try {
        const { data: existing } = await sb.from('site_projects').select('*').eq('id', id).maybeSingle();
        const row = existing
          ? {
              ...existing,
              draft_name: draft_name ?? existing.draft_name ?? existing.name,
              draft_status: draft_status ?? existing.draft_status ?? existing.status,
              draft_summary: draft_summary ?? existing.draft_summary ?? existing.public_summary,
              cms_state: 'DRAFT',
              updated_at: new Date().toISOString()
            }
          : {
              id,
              name: draft_name || id,
              status: 'DISCOVERY',
              public_summary: '',
              draft_name: draft_name || id,
              draft_status: draft_status || 'DISCOVERY',
              draft_summary: draft_summary || '',
              cms_state: 'DRAFT',
              is_published: false,
              updated_at: new Date().toISOString()
            };
        const { data, error } = await sb
          .from('site_projects')
          .upsert(row, { onConflict: 'id' })
          .select('*')
          .single();
        if (!error && data) return data;
      } catch (_) {}
      return memResult;
    },

    async enqueueAction(item) {
      await fallbackMemoryRepo.enqueueAction(item);
      try {
        const { data, error } = await sb
          .from('pathcom_action_queue')
          .insert(item)
          .select('*')
          .single();
        if (!error && data) return data;
      } catch (_) {}
      return item;
    },

    async listActionQueue({ status = null } = {}) {
      try {
        let q = sb.from('pathcom_action_queue').select('*').order('created_at', { ascending: false });
        if (status) q = q.eq('status', status);
        const { data, error } = await q.limit(50);
        if (!error && Array.isArray(data)) return data;
      } catch (_) {}
      return fallbackMemoryRepo.listActionQueue({ status });
    },

    async getActionQueueItem(id) {
      try {
        const { data, error } = await sb.from('pathcom_action_queue').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (_) {}
      const list = await fallbackMemoryRepo.listActionQueue();
      return list.find((q) => q.id === id) || null;
    },

    async resolveActionQueueItem({ id, decision, reviewerEmail, reviewNote }) {
      const memResult = await fallbackMemoryRepo.resolveActionQueueItem({
        id,
        decision,
        reviewerEmail,
        reviewNote
      });
      try {
        const { data: item } = await sb.from('pathcom_action_queue').select('*').eq('id', id).maybeSingle();
        if (!item) return memResult;
        const { data: updatedQueue } = await sb
          .from('pathcom_action_queue')
          .update({
            status: decision,
            reviewed_by: reviewerEmail,
            review_note: reviewNote || '',
            reviewed_at: new Date().toISOString()
          })
          .eq('id', id)
          .select('*')
          .single();

        if (decision === 'APPROVED') {
          const payload = item.payload_json || {};
          if (payload.kind === 'publish_site_project' && payload.project_id) {
            await sb
              .from('site_projects')
              .update({
                name: payload.proposed_live?.name,
                status: payload.proposed_live?.status || 'LIVE',
                public_summary: payload.proposed_live?.public_summary || '',
                draft_name: null,
                draft_status: null,
                draft_summary: null,
                cms_state: 'PUBLISHED',
                is_published: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', payload.project_id);
          } else if (payload.kind === 'certify_market_path' && payload.market_path_id) {
            await sb
              .from('market_paths')
              .update({
                status: 'VALIDATED',
                is_patrimonio_validated: true,
                published_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', payload.market_path_id);
          }
        }
        return updatedQueue || memResult;
      } catch (_) {}
      return memResult;
    },

    async listFormaliaSessionsSummary() {
      const sessions = await listFormaliaSessionsArchive({ mineOnly: false });
      return (sessions || []).slice(0, 12).map((s) => ({
        session_id: s.session_id,
        process_name: s.process_name || 'Flujo operativo',
        workspace_name: s.workspace_name || 'Sin espacio',
        turns_count: s.turns_count || 0,
        completeness_score: s.completeness_score || 0,
        updated_at: s.updated_at || s.created_at
      }));
    },

    async fetchPathwayMilestones({ userId, userEmail }) {
      try {
        const { data: completedStories, error } = await sb
          .from('stories')
          .select('id, module, action, benefit, status, updated_at')
          .eq('project_id', 'pathway')
          .eq('status', 'Completado')
          .limit(5);
        if (!error && Array.isArray(completedStories) && completedStories.length > 0) {
          return completedStories.map((st) => ({
            external_ref_id: `PW-STORY-${st.id}`,
            title: `Pathway · ${st.module || 'Meta'}: ${st.action?.slice(0, 80) || st.id}`,
            content: st.benefit || 'Hito sincronizado desde Pathway App.',
            recorded_at: st.updated_at || new Date().toISOString(),
            client_timezone: 'America/Lima',
            duration_minutes: 35,
            progress_percent: 100
          }));
        }
      } catch (_) {}
      return fallbackMemoryRepo.fetchPathwayMilestones({ userId, userEmail });
    },

    async saveChatMessage(msg) {
      await fallbackMemoryRepo.saveChatMessage(msg);
      try {
        if (msg.user_id) {
          await sb.from('pathcom_chat_messages').insert(msg);
        }
      } catch (_) {}
      return msg;
    },

    async listChatMessages(userId) {
      if (!userId) return [];
      try {
        const { data, error } = await sb
          .from('pathcom_chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(40);
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (_) {}
      return fallbackMemoryRepo.listChatMessages(userId);
    }
  };
}
