import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { DEFAULT_PRICING_CONFIG } from '../data/pricingRules.js';
import { getRoleQuotaPolicy, normalizeRoleCode, isInternalStaffRole } from '../auth/permissionsConfig.js';
import { compileProcessToPortalBundle, generateEngineeringHandoff } from '../lib/formalia/compilers.js';

const DAILY_USAGE_LOCAL_KEY = 'pathrimonio_daily_usage_v1';
const SETTINGS_LOCAL_KEY = 'pathrimonio_platform_settings_v1';
const WORKSPACES_LOCAL_KEY = 'pathrimonio_formalia_workspaces_v1';
const IMPL_LOCAL_KEY = 'pathrimonio_implementation_requests_v1';
const REFERRALS_LOCAL_KEY = 'pathrimonio_referrals_v1';
const REDEMPTIONS_LOCAL_KEY = 'pathrimonio_credit_redemptions_v1';

export const DEFAULT_COMMUNITY_IMPACT = {
  education: {
    pilar: 'Pilar I · Formación',
    title: 'Educación y Alfabetización Técnica',
    description:
      'Talleres prácticos de capacitación para operarios de almacén, cajeros y jóvenes de barrios locales en el uso de herramientas digitales sin barreras.',
    metric: '+120 hrs',
    label: 'talleres comunitarios'
  },
  sports: {
    pilar: 'Pilar II · Cohesión',
    title: 'Deporte e Integración Vecinal',
    description:
      'Fomento y auspicio solidario a ligas de fútbol, campeonatos escolares y actividades al aire libre organizadas por juntas vecinales aliadas.',
    metric: '8 ligas',
    label: 'equipos respaldados'
  },
  values: {
    pilar: 'Pilar III · Ética',
    title: 'Valores y Transparencia Radical',
    description:
      'Prohibición estricta de comisiones por transacción sobre las ventas de nuestros socios. Código abierto, trazabilidad y datos bajo tu posesión.',
    metric: '0% fees',
    label: 'cero intermediación'
  },
  pathway: {
    badge: 'BENEFICIO VINCULADO · APP MVP',
    title: 'Pathway: El mapa vivo de desarrollo comunitario',
    description:
      'Como socio o usuario del software Pathrimonio, tu proyecto puede vincularse a la aplicación móvil Pathway para publicar metas colectivas de financiamiento y rendición de cuentas en tiempo real.'
  }
};

export const IMPLEMENTATION_STATUS_STEPS = [
  { id: 'enviada', label: 'Solicitud Enviada', icon: 'send', desc: 'Tu expediente web y tus historias de usuario fueron recibidos.' },
  { id: 'en_revision', label: 'En Revisión Técnica', icon: 'manage_search', desc: 'Analistas y desarrolladores revisan tus flujos y pantallas.' },
  { id: 'revisada_cotizada', label: 'Revisada · Procede a Pago', icon: 'receipt_long', desc: 'Alcance validado. Puedes confirmar suscripción o canjear créditos.' },
  { id: 'pago_aprobado', label: 'Pago Confirmado', icon: 'verified', desc: 'Activación aprobada y asignada al sprint de ingeniería.' },
  { id: 'en_desarrollo', label: 'Solución en Desarrollo', icon: 'code', desc: 'Tu aplicación web y base offline-first se encuentran en construcción.' },
  { id: 'entregada', label: 'Entregada / En Producción', icon: 'rocket_launch', desc: 'Solución operativa desplegada y activa.' }
];

export const DEFAULT_PARTNER_WORKSHOPS = [
  {
    id: 'WS-LIVE-01',
    title: 'Taller en Vivo: De Carriles FORMALIA a Despliegue SQLite Offline',
    schedule: 'Todos los Jueves · 19:00 PET (UTC-5)',
    host: 'Arquitectura Pathrimonio',
    modality: 'Google Meet / Sala Socios',
    url: 'https://www.pathrimonio.site/#contacto'
  },
  {
    id: 'WS-LIVE-02',
    title: 'Clínica de Inventario, Caja SUNAT y Bots WhatsApp para PYMEs',
    schedule: 'Martes quincenal · 18:30 PET (UTC-5)',
    host: 'Equipo Preventa & Producto',
    modality: 'Transmisión Exclusiva Socios',
    url: 'https://www.pathrimonio.site/#contacto'
  }
];

function safeReadJson(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

export function getUtcDateKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC (resets 00:00 UTC)
}

export function getNextUtcResetLabel() {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const diffMs = nextMidnight.getTime() - now.getTime();
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return `Reinicia 00:00 UTC (en ${hrs}h ${mins}m)`;
}

// ── 1. Platform Settings (pricing-config & community-impact) ─────────────────

export async function fetchPlatformSettings() {
  const cached = safeReadJson(SETTINGS_LOCAL_KEY, {});
  const mergeCommunityImpact = (raw = {}) => ({
    ...DEFAULT_COMMUNITY_IMPACT,
    ...(raw || {}),
    education: { ...DEFAULT_COMMUNITY_IMPACT.education, ...(raw?.education || {}) },
    sports: { ...DEFAULT_COMMUNITY_IMPACT.sports, ...(raw?.sports || {}) },
    values: { ...DEFAULT_COMMUNITY_IMPACT.values, ...(raw?.values || {}) },
    pathway: { ...DEFAULT_COMMUNITY_IMPACT.pathway, ...(raw?.pathway || {}) }
  });

  const basePricing = {
    ...DEFAULT_PRICING_CONFIG,
    ...(cached.pricing_config || cached.pricingConfig || {})
  };
  const baseImpact = mergeCommunityImpact(cached.community_impact || cached.communityImpact || {});
  const baseWorkshops = Array.isArray(cached.partner_workshops || cached.partnerWorkshops)
    ? (cached.partner_workshops || cached.partnerWorkshops)
    : DEFAULT_PARTNER_WORKSHOPS;

  const formatResult = (pricingCfg, impactCfg, workshops) => ({
    pricing_config: pricingCfg,
    pricingConfig: pricingCfg,
    community_impact: impactCfg,
    communityImpact: impactCfg,
    partner_workshops: workshops,
    partnerWorkshops: workshops
  });

  const base = formatResult(basePricing, baseImpact, baseWorkshops);

  if (!isSupabaseConfigured || !supabase) return base;

  try {
    const { data, error } = await supabase.from('platform_settings').select('key, value, updated_by, updated_at');
    if (!error && Array.isArray(data)) {
      let nextPricing = basePricing;
      let nextImpact = baseImpact;
      let nextWorkshops = baseWorkshops;
      data.forEach((row) => {
        if (row.key === 'pricing_config' && row.value) {
          nextPricing = { ...DEFAULT_PRICING_CONFIG, ...row.value };
        }
        if (row.key === 'community_impact' && row.value) {
          nextImpact = mergeCommunityImpact(row.value);
        }
        if (row.key === 'partner_workshops' && Array.isArray(row.value)) {
          nextWorkshops = row.value;
        }
      });
      const next = formatResult(nextPricing, nextImpact, nextWorkshops);
      safeWriteJson(SETTINGS_LOCAL_KEY, {
        pricing_config: nextPricing,
        community_impact: nextImpact,
        partner_workshops: nextWorkshops
      });
      return next;
    }
  } catch (_) {}

  return base;
}

export async function savePlatformSetting(key, value, actorUser) {
  if (normalizeRoleCode(actorUser) !== 'admin') {
    throw new Error('Solo el Administrador puede modificar la configuración global de Pathrimonio.');
  }

  const cached = safeReadJson(SETTINGS_LOCAL_KEY, {});
  const updated = { ...cached, [key]: value };
  safeWriteJson(SETTINGS_LOCAL_KEY, updated);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('platform_settings').upsert({
      key,
      value,
      updated_by: actorUser?.email || 'Admin',
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    await recordSystemAudit({
      actorEmail: actorUser?.email,
      actorRole: actorUser?.role || 'Admin',
      actionType: `update_${key}`,
      targetId: key,
      summary: `Actualizó configuración global "${key}".`,
      metadata: { key }
    });
  }

  return value;
}

// ── 2. Cuotas Diarias de IA (5 / 15 / 45 / Ilimitado) y Workspaces ───────────

export async function getFormaliaQuotaStatus(user, currentSessionTurns = 0) {
  const roleCode = normalizeRoleCode(user);
  const policy = getRoleQuotaPolicy(user);
  const utcDate = getUtcDateKey();

  if (roleCode === 'guest') {
    return {
      roleCode,
      policy,
      used: currentSessionTurns,
      limit: policy.aiTurnsLimit,
      remaining: Math.max(0, policy.aiTurnsLimit - currentSessionTurns),
      periodLabel: 'por sesión (Visitante)',
      resetLabel: 'Crea una cuenta gratis para 15 turnos/día'
    };
  }

  const subjectKey = String(user?.email || user?.id || 'user').trim().toLowerCase();
  const rowId = `${subjectKey}_${utcDate}`;
  const localMap = safeReadJson(DAILY_USAGE_LOCAL_KEY, {});
  let usedToday = Number(localMap[rowId]?.turns_used || 0);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('formalia_daily_usage')
        .select('turns_used')
        .eq('id', rowId)
        .maybeSingle();
      if (data && typeof data.turns_used === 'number') {
        usedToday = Math.max(usedToday, data.turns_used);
      }
    } catch (_) {}
  }

  return {
    roleCode,
    policy,
    used: usedToday,
    limit: policy.aiTurnsLimit,
    remaining: Math.max(0, policy.aiTurnsLimit - usedToday),
    periodLabel: policy.aiQuotaPeriod === 'unlimited' ? 'sin tope diario' : 'turnos IA hoy',
    resetLabel: policy.aiQuotaPeriod === 'unlimited' ? 'Acceso completo Administrador' : getNextUtcResetLabel()
  };
}

export async function consumeFormaliaTurn(user) {
  const roleCode = normalizeRoleCode(user);
  if (roleCode === 'guest') return null;

  const policy = getRoleQuotaPolicy(user);
  const utcDate = getUtcDateKey();
  const subjectKey = String(user?.email || user?.id || 'user').trim().toLowerCase();
  const rowId = `${subjectKey}_${utcDate}`;
  const localMap = safeReadJson(DAILY_USAGE_LOCAL_KEY, {});
  const current = Number(localMap[rowId]?.turns_used || 0);
  const nextCount = current + 1;

  localMap[rowId] = {
    id: rowId,
    usage_date_utc: utcDate,
    subject_key: subjectKey,
    user_email: subjectKey,
    role_code: roleCode,
    turns_used: nextCount,
    daily_limit: policy.aiTurnsLimit,
    updated_at: new Date().toISOString()
  };
  safeWriteJson(DAILY_USAGE_LOCAL_KEY, localMap);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing } = await supabase
        .from('formalia_daily_usage')
        .select('turns_used')
        .eq('id', rowId)
        .maybeSingle();
      const syncedCount = Math.max(nextCount, Number(existing?.turns_used || 0) + 1);
      await supabase.from('formalia_daily_usage').upsert({
        id: rowId,
        usage_date_utc: utcDate,
        subject_key: subjectKey,
        user_email: subjectKey,
        role_code: roleCode,
        turns_used: syncedCount,
        daily_limit: policy.aiTurnsLimit,
        updated_at: new Date().toISOString()
      });
      localMap[rowId].turns_used = syncedCount;
      safeWriteJson(DAILY_USAGE_LOCAL_KEY, localMap);
      return syncedCount;
    } catch (_) {}
  }

  return nextCount;
}

export async function fetchUserWorkspaces(user) {
  if (!user?.email) return [];
  const cleanEmail = String(user.email).trim().toLowerCase();
  const allLocal = safeReadJson(WORKSPACES_LOCAL_KEY, []);
  let list = allLocal.filter((w) => String(w.user_email || '').toLowerCase() === cleanEmail);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('formalia_workspaces')
        .select('*')
        .ilike('user_email', cleanEmail)
        .order('updated_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const merged = new Map();
        data.forEach((w) => merged.set(w.id, w));
        list.forEach((w) => { if (!merged.has(w.id)) merged.set(w.id, w); });
        list = Array.from(merged.values());
      }
    } catch (_) {}
  }

  if (list.length === 0) {
    const defaultWs = {
      id: `WS-${Date.now().toString().slice(-6)}`,
      user_id: user.id || null,
      user_email: cleanEmail,
      name: user.organization || 'Mi Workspace Principal',
      industry: 'logistica_transporte',
      project_id: user.initialProject || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    list = [defaultWs];
    safeWriteJson(WORKSPACES_LOCAL_KEY, [defaultWs, ...allLocal.filter((w) => w.id !== defaultWs.id)]);
    if (isSupabaseConfigured && supabase) {
      try { await supabase.from('formalia_workspaces').upsert(defaultWs); } catch (_) {}
    }
  }

  return list;
}

export async function createUserWorkspace({ user, name, industry = 'otro_sector' }) {
  if (!user?.email) throw new Error('Inicia sesión para crear Workspaces permanentes.');
  const policy = getRoleQuotaPolicy(user);
  const existing = await fetchUserWorkspaces(user);
  if (existing.length >= policy.maxWorkspaces) {
    throw new Error(`Alcanzaste el límite de ${policy.maxWorkspaces} Workspaces para tu perfil ${policy.label}.`);
  }

  const cleanEmail = String(user.email).trim().toLowerCase();
  const ws = {
    id: `WS-${Date.now().toString().slice(-6)}`,
    user_id: user.id || null,
    user_email: cleanEmail,
    name: String(name || 'Nuevo Workspace').trim(),
    industry,
    project_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const allLocal = safeReadJson(WORKSPACES_LOCAL_KEY, []);
  safeWriteJson(WORKSPACES_LOCAL_KEY, [ws, ...allLocal]);

  if (isSupabaseConfigured && supabase) {
    try { await supabase.from('formalia_workspaces').upsert(ws); } catch (_) {}
  }

  return ws;
}

// ── 3. "Implementar en solución web" & Tracking / Diffs / Revisión Técnica ───

export function buildWebBlueprint(graph, customOptions = {}) {
  const handoff = generateEngineeringHandoff(graph);
  const ctx = graph?.business_context || {};
  const company = customOptions.companyName || ctx.company_name || 'Mi Negocio';
  const processName = customOptions.processName || ctx.process_name || 'Operación Web';

  const theme = {
    preset: customOptions.themePreset || 'pathrimonio-yellow',
    primaryColor: customOptions.primaryColor || '#FFC93C',
    surfaceColor: customOptions.surfaceColor || '#2B2D31',
    accentTextColor: '#09090B',
    fontHeading: 'Space Grotesk',
    fontBody: 'Plus Jakarta Sans',
    mode: customOptions.colorMode || 'dark'
  };

  const sections = (handoff.suggested_interfaces || []).map((iface, idx) => ({
    id: `SEC-${idx + 1}`,
    title: iface.title,
    platform: iface.platform,
    roles: iface.roles,
    layoutType: idx === 0 ? 'hero-operations' : iface.platform?.includes('Móvil') ? 'mobile-checklist' : 'data-table-action',
    objective: iface.objective,
    blocks: [
      `Cabecera ${company} — ${iface.title}`,
      iface.content,
      `Control RBAC: ${iface.roles.join(', ')}`
    ]
  }));

  return {
    version: '1.0',
    generated_at: new Date().toISOString(),
    company_name: company,
    process_name: processName,
    theme,
    hero: {
      headline: customOptions.heroHeadline || `${company} — ${processName}`,
      subheadline:
        customOptions.heroSubheadline ||
        `Plataforma operativa a medida con ${graph?.actors?.length || 0} roles, ${handoff.user_stories.length} flujos de trabajo y base SQLite offline-first.`,
      ctaPrimary: customOptions.ctaPrimary || 'Operar Sistema'
    },
    pages: [
      { route: '/', name: 'Inicio & Acceso Operativo', roles: graph?.actors?.map((a) => a.name) || [] },
      ...sections.map((s, idx) => ({
        route: `/modulo-${idx + 1}`,
        name: s.title,
        roles: s.roles,
        layoutType: s.layoutType
      }))
    ],
    sections,
    stories_count: handoff.user_stories.length,
    interfaces_count: handoff.suggested_interfaces.length,
    tables_count: handoff.suggested_data_models.length
  };
}

function normalizeSnapshotRecord(entityType, item) {
  if (!item) return null;
  if (entityType === 'actor') {
    return {
      id: item.id,
      name: item.name || '',
      category: item.category || '',
      permissionLevel: item.permissionLevel || '',
      description: item.description || '',
      status: item.status || ''
    };
  }
  if (entityType === 'story') {
    return {
      id: item.id,
      module: item.module || '',
      priority: item.priority || '',
      role: item.role || '',
      action: item.action || '',
      benefit: item.benefit || '',
      status: item.status || '',
      criteriaTexts: (item.criteria || []).map((c) => c.text).join(' | ')
    };
  }
  return {
    id: item.id,
    title: item.title || '',
    module: item.module || '',
    platform: item.platform || '',
    status: item.status || '',
    roles: (item.roles || []).join(', '),
    objetivo: item.fields?.objetivo || '',
    contenido: item.fields?.contenido || '',
    reglas: item.fields?.reglas || ''
  };
}

const DIFF_LABELS = {
  name: 'Nombre del Rol',
  category: 'Categoría',
  permissionLevel: 'Nivel de Permiso',
  description: 'Descripción',
  module: 'Módulo',
  priority: 'Prioridad',
  role: 'Rol',
  action: 'Acción (Quiero)',
  benefit: 'Beneficio (Para que)',
  criteriaTexts: 'Criterios DoD',
  title: 'Título de Interfaz',
  platform: 'Plataforma',
  roles: 'Roles con Acceso',
  objetivo: 'Objetivo UI',
  contenido: 'Contenido / Componentes',
  reglas: 'Reglas de Negocio',
  status: 'Estado'
};

export function computeLiveDiffsAgainstBaseline(request, currentActors = [], currentStories = [], currentInterfaces = []) {
  if (!request?.submitted_snapshot) return [];
  const base = request.submitted_snapshot;
  const projectId = request.project_id;
  const existingReviews = new Map((request.pending_modifications || []).map((m) => [`${m.entity_type}:${m.entity_id}`, m]));

  const diffs = [];

  const inspectList = (entityType, baseList = [], liveList = []) => {
    const projectLive = liveList.filter((item) => item.projectId === projectId);
    const baseById = new Map((baseList || []).map((item) => [item.id, item]));
    const liveById = new Map(projectLive.map((item) => [item.id, item]));

    projectLive.forEach((liveItem) => {
      const baseItem = baseById.get(liveItem.id);
      const rev = existingReviews.get(`${entityType}:${liveItem.id}`);
      if (!baseItem) {
        diffs.push({
          id: `MOD-${entityType}-${liveItem.id}`,
          entity_type: entityType,
          entity_id: liveItem.id,
          entity_label: liveItem.name || liveItem.title || `${liveItem.id} (${liveItem.role || 'HU'})`,
          change_kind: 'created',
          before: null,
          after: liveItem,
          field_diffs: [{ field: 'registro', label: 'Nuevo Registro Post-Envío', from: '— (No existía)', to: liveItem.name || liveItem.title || liveItem.action }],
          review_status: rev?.review_status || 'pending',
          reviewer_note: rev?.reviewer_note || ''
        });
        return;
      }

      const normBase = normalizeSnapshotRecord(entityType, baseItem);
      const normLive = normalizeSnapshotRecord(entityType, liveItem);
      const changedFields = [];
      Object.keys(normLive).forEach((key) => {
        if (key === 'id') return;
        if (String(normBase?.[key] || '') !== String(normLive?.[key] || '')) {
          changedFields.push({
            field: key,
            label: DIFF_LABELS[key] || key,
            from: normBase?.[key] || '(vacío)',
            to: normLive?.[key] || '(vacío)'
          });
        }
      });

      if (changedFields.length > 0) {
        diffs.push({
          id: `MOD-${entityType}-${liveItem.id}`,
          entity_type: entityType,
          entity_id: liveItem.id,
          entity_label: liveItem.name || liveItem.title || `${liveItem.id} (${liveItem.role || 'HU'})`,
          change_kind: 'updated',
          before: baseItem,
          after: liveItem,
          field_diffs: changedFields,
          review_status: rev?.review_status || 'pending',
          reviewer_note: rev?.reviewer_note || ''
        });
      }
    });

    (baseList || []).forEach((baseItem) => {
      if (!liveById.has(baseItem.id)) {
        const rev = existingReviews.get(`${entityType}:${baseItem.id}`);
        diffs.push({
          id: `MOD-${entityType}-${baseItem.id}`,
          entity_type: entityType,
          entity_id: baseItem.id,
          entity_label: baseItem.name || baseItem.title || `${baseItem.id} (${baseItem.role || 'HU'})`,
          change_kind: 'deleted',
          before: baseItem,
          after: null,
          field_diffs: [{ field: 'registro', label: 'Eliminado Post-Envío', from: baseItem.name || baseItem.title || baseItem.action, to: 'Eliminado por cliente' }],
          review_status: rev?.review_status || 'pending',
          reviewer_note: rev?.reviewer_note || ''
        });
      }
    });
  };

  inspectList('actor', base.actors || [], currentActors);
  inspectList('story', base.stories || [], currentStories);
  inspectList('interface', base.interfaces || [], currentInterfaces);

  return diffs;
}

export async function fetchImplementationRequests(user) {
  const local = safeReadJson(IMPL_LOCAL_KEY, []);
  const isStaff = isInternalStaffRole(user);
  const cleanEmail = String(user?.email || '').trim().toLowerCase();

  let list = local;
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('implementation_requests').select('*').order('updated_at', { ascending: false }).limit(80);
      if (!isStaff && cleanEmail) {
        query = query.ilike('user_email', cleanEmail);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        list = data;
        if (isStaff) {
          safeWriteJson(IMPL_LOCAL_KEY, data);
        } else if (cleanEmail) {
          const otherUsers = local.filter(
            (r) => String(r.user_email || '').trim().toLowerCase() !== cleanEmail
          );
          safeWriteJson(IMPL_LOCAL_KEY, [...data, ...otherUsers]);
        }
      }
    } catch (_) {}
  }

  return list
    .filter((r) => isStaff || (cleanEmail && String(r.user_email || '').toLowerCase() === cleanEmail))
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
}

export async function createOrUpdateImplementationRequest({
  user,
  session,
  graph,
  editedStories = null,
  webBlueprint,
  quoteId = null
}) {
  if (!user?.email) throw new Error('Inicia sesión para implementar en solución web.');
  const cleanEmail = String(user.email).trim().toLowerCase();
  const company = webBlueprint?.company_name || graph?.business_context?.company_name || user.organization || 'Mi Proyecto Web';
  const processName = webBlueprint?.process_name || graph?.business_context?.process_name || 'Solución Web';
  const slug = `${company}-${graph?.session_id || Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || `web-${Date.now()}`;

  const projectId = `cli-${slug}`;
  const bundle = compileProcessToPortalBundle(graph, projectId);

  // Aplicar HUs validadas/modificadas por el usuario en el modal previo al envío
  const sessSuffix = String(graph?.session_id || Date.now()).replace(/[^A-Za-z0-9]/g, '').slice(-4) || 'WEB';
  const finalStories = Array.isArray(editedStories) && editedStories.length > 0
    ? editedStories.map((st, idx) => ({
        id: bundle.stories[idx]?.id || `US-WEB-${sessSuffix}-${String(idx + 1).padStart(2, '0')}`,
        projectId,
        module: st.module || processName,
        priority: st.priority || 'Alta',
        status: 'En Revisión Técnica',
        role: st.role || 'Operador',
        action: st.action || st.title || 'gestionar este proceso',
        benefit: st.benefit || st.description || 'operar con trazabilidad y rapidez en la web',
        criteria: (st.acceptance_criteria || st.criteria || []).map((c, cIdx) =>
          typeof c === 'string'
            ? { id: `c${cIdx + 1}`, text: c, checked: false }
            : { id: c.id || `c${cIdx + 1}`, text: c.text, checked: Boolean(c.checked) }
        ),
        attachmentsCount: 0,
        attachmentName: null,
        author: user.name || cleanEmail,
        createdAt: 'Enviado a Implementar',
        sourceSessionId: graph?.session_id || null
      }))
    : bundle.stories;

  const projectObj = {
    id: projectId,
    name: `${company} — ${processName}`,
    shortName: company,
    subtitle: `Solución Web FORMALIA · ${finalStories.length} HUs · ${bundle.interfaces.length} Interfaces`,
    description: `Proyecto generado desde "Implementar en solución web" por ${user.name || cleanEmail}.`,
    category: 'Solución Web PYME',
    icon: 'language',
    color: 'amber',
    status: 'Solicitud Enviada',
    client: company,
    version: 'v1.0.0',
    modules: [processName, 'Portal Web', 'Operaciones'],
    owner_email: cleanEmail,
    owner_user_id: user.id || null,
    source_type: 'client_web'
  };

  const nowIso = new Date().toISOString();
  const submittedSnapshot = {
    submitted_at: nowIso,
    actors: structuredClone(bundle.actors),
    stories: structuredClone(finalStories),
    interfaces: structuredClone(bundle.interfaces),
    dataModels: structuredClone(bundle.dataModels),
    web_blueprint: structuredClone(webBlueprint)
  };

  const reqRecord = {
    id: `IMP-${Date.now().toString().slice(-6)}`,
    user_id: user.id || null,
    user_email: cleanEmail,
    user_name: user.name || cleanEmail,
    project_id: projectId,
    session_id: session?.session_id || graph?.session_id || null,
    workspace_id: session?.workspace_id || null,
    quote_id: quoteId,
    title: `${company} — ${processName}`,
    company_name: company,
    status: 'enviada',
    web_blueprint: webBlueprint,
    submitted_snapshot: submittedSnapshot,
    pending_modifications: [],
    status_history: [
      {
        status: 'enviada',
        label: 'Solicitud Enviada',
        by: cleanEmail,
        at: nowIso,
        note: `Se enviaron ${bundle.actors.length} roles, ${finalStories.length} historias y ${bundle.interfaces.length} interfaces.`
      }
    ],
    tech_notes: '',
    assigned_collaborator: null,
    created_at: nowIso,
    updated_at: nowIso
  };

  const existingLocal = safeReadJson(IMPL_LOCAL_KEY, []);
  safeWriteJson(IMPL_LOCAL_KEY, [reqRecord, ...existingLocal.filter((r) => r.project_id !== projectId)]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('implementation_requests').upsert(reqRecord);
      await recordSystemAudit({
        actorEmail: cleanEmail,
        actorRole: user.role || 'Usuario Registrado',
        actionType: 'submit_implementation',
        targetId: reqRecord.id,
        summary: `Envió solicitud web "${reqRecord.title}" (${finalStories.length} HUs, ${bundle.interfaces.length} UIs).`
      });
    } catch (_) {}
  }

  return {
    reqRecord,
    request: reqRecord,
    projectObj,
    project: projectObj,
    finalStories,
    bundle: {
      ...bundle,
      stories: finalStories
    }
  };
}

export async function saveImplementationRequestChanges(updatedReq) {
  const stamped = { ...updatedReq, updated_at: new Date().toISOString() };
  const existingLocal = safeReadJson(IMPL_LOCAL_KEY, []);
  safeWriteJson(IMPL_LOCAL_KEY, [stamped, ...existingLocal.filter((r) => r.id !== stamped.id)]);
  if (isSupabaseConfigured && supabase) {
    try { await supabase.from('implementation_requests').upsert(stamped); } catch (_) {}
  }
  return stamped;
}

export async function advanceImplementationStatus(reqRecord, { nextStatus, reviewerUser, note = '' }) {
  if (!isInternalStaffRole(reviewerUser)) {
    throw new Error('Solo el equipo técnico (Colaborador) o Administrador puede cambiar el estado de atención.');
  }
  const stepMeta = IMPLEMENTATION_STATUS_STEPS.find((s) => s.id === nextStatus);
  const entry = {
    status: nextStatus,
    label: stepMeta?.label || nextStatus,
    by: reviewerUser?.email || 'Equipo Técnico',
    at: new Date().toISOString(),
    note: note || `Estado actualizado a "${stepMeta?.label || nextStatus}".`
  };
  const nextReq = {
    ...reqRecord,
    status: nextStatus,
    tech_notes: note || reqRecord.tech_notes,
    assigned_collaborator: reqRecord.assigned_collaborator || reviewerUser?.email || null,
    status_history: [...(reqRecord.status_history || []), entry]
  };
  await saveImplementationRequestChanges(nextReq);
  await recordSystemAudit({
    actorEmail: reviewerUser?.email,
    actorRole: reviewerUser?.role,
    actionType: 'advance_implementation_status',
    targetId: reqRecord.id,
    summary: `Cambió estado de ${reqRecord.id} a "${entry.label}".`
  });
  return nextReq;
}

export async function reviewLiveModification(reqRecord, liveDiffItem, { decision, reviewerUser, note = '' }) {
  if (!isInternalStaffRole(reviewerUser)) {
    throw new Error('Cada modificación debe pasar por revisión del equipo técnico o Administrador.');
  }
  const nowIso = new Date().toISOString();
  const prevSnapshot = structuredClone(reqRecord.submitted_snapshot || { actors: [], stories: [], interfaces: [] });

  if (decision === 'approved') {
    const key = liveDiffItem.entity_type === 'actor'
      ? 'actors'
      : liveDiffItem.entity_type === 'story'
        ? 'stories'
        : 'interfaces';
    const currentList = prevSnapshot[key] || [];
    if (liveDiffItem.change_kind === 'deleted') {
      prevSnapshot[key] = currentList.filter((item) => item.id !== liveDiffItem.entity_id);
    } else if (liveDiffItem.after) {
      const idx = currentList.findIndex((item) => item.id === liveDiffItem.entity_id);
      if (idx >= 0) currentList[idx] = structuredClone(liveDiffItem.after);
      else currentList.unshift(structuredClone(liveDiffItem.after));
      prevSnapshot[key] = currentList;
    }
  }

  const prevMods = (reqRecord.pending_modifications || []).filter(
    (m) => !(m.entity_type === liveDiffItem.entity_type && m.entity_id === liveDiffItem.entity_id)
  );

  const reviewedEntry = {
    ...liveDiffItem,
    review_status: decision,
    reviewer_email: reviewerUser?.email,
    reviewer_note: note,
    reviewed_at: nowIso
  };

  const nextReq = {
    ...reqRecord,
    submitted_snapshot: prevSnapshot,
    pending_modifications: decision === 'approved' ? prevMods : [reviewedEntry, ...prevMods],
    status_history: [
      ...(reqRecord.status_history || []),
      {
        status: reqRecord.status,
        label: decision === 'approved' ? `Cambio aprobado (${liveDiffItem.entity_id})` : `Cambio observado (${liveDiffItem.entity_id})`,
        by: reviewerUser?.email || 'Equipo Técnico',
        at: nowIso,
        note: note || `${liveDiffItem.entity_label}: ${decision}`
      }
    ]
  };

  await saveImplementationRequestChanges(nextReq);
  await recordSystemAudit({
    actorEmail: reviewerUser?.email,
    actorRole: reviewerUser?.role,
    actionType: 'review_modification',
    targetId: `${reqRecord.id}:${liveDiffItem.entity_id}`,
    summary: `Revisión técnica (${decision}) de ${liveDiffItem.entity_label}.`
  });
  return nextReq;
}

// ── 4. Panel de Socio: Referidos, Billetera y Canje de Créditos ──────────────

export function buildReferralCodeForUser(user) {
  if (user?.referral_code) return user.referral_code;
  const initials = String(user?.name || user?.email || 'PA')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase() || 'SOC';
  const suffix = String(user?.id || user?.email || '2026').slice(-4).toUpperCase().replace(/[^A-Z0-9]/g, '7');
  return `SOCIO-${initials}-${suffix}`;
}

export async function fetchReferralsAndWallet(user, portalUsers = []) {
  const isAdmin = normalizeRoleCode(user) === 'admin';
  const cleanEmail = String(user?.email || '').trim().toLowerCase();
  const localRefs = safeReadJson(REFERRALS_LOCAL_KEY, []);
  const localRedemptions = safeReadJson(REDEMPTIONS_LOCAL_KEY, []);

  let referrals = localRefs;
  let redemptions = localRedemptions;

  if (isSupabaseConfigured && supabase) {
    try {
      const [refRes, redRes] = await Promise.all([
        supabase.from('referral_records').select('*').order('created_at', { ascending: false }),
        supabase.from('credit_redemptions').select('*').order('created_at', { ascending: false })
      ]);
      if (!refRes.error && Array.isArray(refRes.data)) referrals = refRes.data;
      if (!redRes.error && Array.isArray(redRes.data)) redemptions = redRes.data;
    } catch (_) {}
  }

  const scopedReferrals = isAdmin
    ? referrals
    : referrals.filter((r) => String(r.referrer_email || '').toLowerCase() === cleanEmail);
  const scopedRedemptions = isAdmin
    ? redemptions
    : redemptions.filter((c) => String(c.partner_email || '').toLowerCase() === cleanEmail);

  const profileMatch = (portalUsers || []).find((u) => String(u.email || '').toLowerCase() === cleanEmail);
  const earnedUsd = scopedReferrals
    .filter((r) => String(r.referrer_email || '').toLowerCase() === cleanEmail && r.status === 'aprobado_acreditado')
    .reduce((acc, r) => acc + Number(r.credits_awarded_usd || 0), 0);
  const spentUsd = scopedRedemptions
    .filter((c) => String(c.partner_email || '').toLowerCase() === cleanEmail)
    .reduce((acc, c) => acc + Number(c.credits_used_usd || 0), 0);

  const walletBalanceUsd = Math.max(
    Number(profileMatch?.credit_balance_usd || 0),
    earnedUsd - spentUsd
  );

  return {
    referralCode: buildReferralCodeForUser(profileMatch || user),
    walletBalanceUsd: Math.max(0, walletBalanceUsd),
    earnedUsd,
    spentUsd,
    bonusRoleMonths: Math.floor(Math.max(0, walletBalanceUsd) / 30),
    referrals: scopedReferrals,
    redemptions: scopedRedemptions
  };
}

export async function createReferralLead({ user, referredCompany, referredEmail, referralCode }) {
  const cleanEmail = String(user?.email || '').trim().toLowerCase();
  const record = {
    id: `REF-${Date.now().toString().slice(-6)}`,
    referrer_email: cleanEmail,
    referrer_name: user?.name || cleanEmail,
    referral_code: referralCode || buildReferralCodeForUser(user),
    referred_company: String(referredCompany || '').trim(),
    referred_email: String(referredEmail || '').trim().toLowerCase() || null,
    payment_amount_usd: 30,
    credits_awarded_usd: 30,
    role_months_awarded: 1,
    status: 'pendiente_pago',
    created_at: new Date().toISOString()
  };

  const localRefs = safeReadJson(REFERRALS_LOCAL_KEY, []);
  safeWriteJson(REFERRALS_LOCAL_KEY, [record, ...localRefs]);

  if (isSupabaseConfigured && supabase) {
    try { await supabase.from('referral_records').upsert(record); } catch (_) {}
  }

  return record;
}

export async function approveReferralPayment(referralRecord, adminUser, creditRule = { usd_per_credit_month: 30 }) {
  if (normalizeRoleCode(adminUser) !== 'admin') {
    throw new Error('Solo el Administrador puede aprobar pagos de referidos y disparar créditos.');
  }
  const usdAwarded = Number(referralRecord.credits_awarded_usd || creditRule.usd_per_credit_month || 30);
  const approved = {
    ...referralRecord,
    status: 'aprobado_acreditado',
    credits_awarded_usd: usdAwarded,
    approved_by: adminUser?.email || 'Admin',
    approved_at: new Date().toISOString()
  };

  const localRefs = safeReadJson(REFERRALS_LOCAL_KEY, []);
  safeWriteJson(REFERRALS_LOCAL_KEY, localRefs.map((r) => (r.id === approved.id ? approved : r)));

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('referral_records').upsert(approved);
      const { data: partnerRow } = await supabase
        .from('portal_users')
        .select('*')
        .ilike('email', approved.referrer_email)
        .maybeSingle();
      if (partnerRow) {
        const nextBalance = Number(partnerRow.credit_balance_usd || 0) + usdAwarded;
        const nextMonths = Number(partnerRow.bonus_role_months || 0) + Number(approved.role_months_awarded || 1);
        await supabase
          .from('portal_users')
          .update({ credit_balance_usd: nextBalance, bonus_role_months: nextMonths })
          .eq('id', partnerRow.id);
      }
      await recordSystemAudit({
        actorEmail: adminUser?.email,
        actorRole: adminUser?.role || 'Admin',
        actionType: 'approve_referral_payout',
        targetId: approved.id,
        summary: `Aprobó pago referido ${approved.referred_company} (+$${usdAwarded} USD créditos a ${approved.referrer_email}).`
      });
    } catch (_) {}
  }

  return approved;
}

export async function redeemPartnerCredits({ user, roleMonths = 1, unitPriceUsd = 30, targetProjectId = null }) {
  const costUsd = Number(roleMonths) * Number(unitPriceUsd);
  const cleanEmail = String(user?.email || '').trim().toLowerCase();
  const redemption = {
    id: `RED-${Date.now().toString().slice(-6)}`,
    partner_email: cleanEmail,
    credits_used_usd: costUsd,
    role_months_extended: Number(roleMonths),
    target_project_id: targetProjectId,
    note: `Canje de ${roleMonths} mes(es)/rol operativo en Pathrimonio.`,
    created_at: new Date().toISOString()
  };

  const localReds = safeReadJson(REDEMPTIONS_LOCAL_KEY, []);
  safeWriteJson(REDEMPTIONS_LOCAL_KEY, [redemption, ...localReds]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('credit_redemptions').upsert(redemption);
      await recordSystemAudit({
        actorEmail: cleanEmail,
        actorRole: user?.role || 'Socio / Cliente',
        actionType: 'redeem_partner_credits',
        targetId: redemption.id,
        summary: `Canjeó $${costUsd} USD en créditos por ${roleMonths} mes(es) de rol.`
      });
    } catch (_) {}
  }

  return redemption;
}

// ── 5. Cotizaciones Entrantes & Auditoría ────────────────────────────────────

export async function fetchIncomingQuotes(user) {
  const isStaff = isInternalStaffRole(user);
  const cleanEmail = String(user?.email || '').trim().toLowerCase();

  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(80);
    if (!isStaff && cleanEmail) {
      query = query.or(`user_email.ilike.${cleanEmail},lead_contact->>email.ilike.${cleanEmail}`);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data)) return data;
  } catch (_) {}
  return [];
}

export async function updateQuoteReviewStatus(quoteId, { status, techNotes, reviewerUser }) {
  if (!isInternalStaffRole(reviewerUser)) {
    throw new Error('Solo el equipo técnico o Administrador puede actualizar cotizaciones.');
  }
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('quotes')
    .update({
      status,
      tech_notes: techNotes || null,
      assigned_to: reviewerUser?.email || null
    })
    .eq('quote_id', quoteId)
    .select()
    .maybeSingle();
  if (error) throw error;
  await recordSystemAudit({
    actorEmail: reviewerUser?.email,
    actorRole: reviewerUser?.role,
    actionType: 'update_quote_status',
    targetId: quoteId,
    summary: `Actualizó cotización ${quoteId} a "${status}".`
  });
  return data;
}

export async function recordSystemAudit({ actorEmail, actorRole, actionType, targetId = null, summary, metadata = {} }) {
  if (!isSupabaseConfigured || !supabase) return null;
  const row = {
    id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    actor_email: actorEmail || 'sistema',
    actor_role: actorRole || 'system',
    action_type: actionType,
    target_id: targetId,
    summary,
    metadata,
    created_at: new Date().toISOString()
  };
  try {
    await supabase.from('system_audit_logs').insert(row);
  } catch (_) {}
  return row;
}

export async function fetchSystemAuditLogs(limit = 60) {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('system_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (!error && Array.isArray(data)) return data;
  } catch (_) {}
  return [];
}
