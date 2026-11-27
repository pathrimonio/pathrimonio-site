// Configuración centralizada de Roles (5 Perfiles) y Matriz RBAC de Pathrimonio

export const ROLE_PERMISSIONS_STORAGE_KEY = 'pathrimonio_role_permissions_v2';
export const PORTAL_USERS_STORAGE_KEY = 'pathrimonio_portal_users_v2';

export const SYSTEM_MODULES = [
  { id: 'actors', label: 'Actores & Roles', icon: 'badge', badge: 'ROL', desc: 'Matriz de usuarios del negocio y permisos de acceso' },
  { id: 'stories', label: 'Historias de Usuario', icon: 'view_kanban', badge: 'US', desc: 'Requerimientos funcionales y criterios de aceptación' },
  { id: 'interfaces', label: 'Interfaces de Software', icon: 'devices', badge: 'UI/UX', desc: 'Fichas de interfaces, mockups y puntos interactivos' },
  { id: 'formalia', label: 'FORMALIA (Flujos → HUs)', icon: 'auto_awesome', badge: 'IA', desc: 'Workspaces, lienzos permanentes, chats y solución web' },
  { id: 'implementationStatus', label: 'Estado de Solicitud & Diff', icon: 'fact_check', badge: 'SOL', desc: 'Seguimiento de revisión, pago, desarrollo y cambios post-envío' },
  { id: 'partnerPanel', label: 'Panel de Socio', icon: 'workspace_premium', badge: 'SOCIO', desc: 'Código de referido, Billetera de Créditos, proyectos, talleres y Pathway' },
  { id: 'presalesReview', label: 'Cotizaciones & Expedientes', icon: 'assignment_turned_in', badge: 'REV', desc: 'Cotizaciones entrantes, expedientes FORMALIA (JSON/.puml/web_blueprints) y revisiones' },
  { id: 'architecture', label: 'Arquitectura de Software', icon: 'account_tree', badge: 'ARCH', desc: 'Capas Clean/Hexagonal, contratos abstractos y síntesis con archify' },
  { id: 'dataModel', label: 'Arquitectura de Datos', icon: 'database', badge: 'DB', desc: 'Tablas relacionales, DER y esquemas de arquitectura' },
  { id: 'files', label: 'Archivos & Manifiestos', icon: 'folder_open', badge: 'FILES', desc: 'Entregables, árboles AST y métodos abstractos' },
  { id: 'backlog', label: 'Backlog', icon: 'format_list_bulleted', badge: 'PLAN', desc: 'Priorización consolidada de historias' },
  { id: 'sprints', label: 'Sprints & Ciclos', icon: 'timelapse', badge: 'AGILE', desc: 'Métricas de velocidad y cadencia de desarrollo' },
  { id: 'docs', label: 'Docs de Arquitectura', icon: 'article', badge: 'DOCS', desc: 'Estándares de arquitectura, manifiestos y guías técnicas' },
  { id: 'settings', label: 'Administración Pathrimonio', icon: 'admin_panel_settings', badge: 'ADMIN', desc: 'Tarifas pricing-config, referidos, impacto comunitario, usuarios y auditoría' }
];

export const SYSTEM_ACTIONS = [
  { id: 'canCreateRoles', label: 'Crear y modificar roles del negocio en sus proyectos', module: 'actors' },
  { id: 'canCreateStories', label: 'Crear y modificar historias de usuario', module: 'stories' },
  { id: 'canCreateInterfaces', label: 'Crear y modificar interfaces / maquetación web', module: 'interfaces' },
  { id: 'canImplementWeb', label: 'Usar "Implementar en solución web" desde FORMALIA', module: 'formalia' },
  { id: 'canUsePartnerPanel', label: 'Acceder al Panel de Socio, referidos y canje de créditos', module: 'partnerPanel' },
  { id: 'canReviewSubmissions', label: 'Revisar cotizaciones, expedientes y cambios post-envío', module: 'presalesReview' },
  { id: 'canManageArchitecture', label: 'Analizar y sincronizar arquitectura con archify', module: 'architecture' },
  { id: 'canManageDataModels', label: 'Modelar tablas y ejecutar scripts SQL', module: 'dataModel' },
  { id: 'canManageFiles', label: 'Acceder a Files y métodos abstractos AST', module: 'files' },
  { id: 'canEditPricingConfig', label: 'Editar tarifas globales (pricing-config)', module: 'settings' },
  { id: 'canApproveReferrals', label: 'Aprobar pagos de referidos y disparar créditos', module: 'settings' },
  { id: 'canPublishImpact', label: 'Publicar métricas de Impacto Comunitario', module: 'settings' },
  { id: 'canManageUsers', label: 'Gestionar usuarios y asignar roles', module: 'settings' },
  { id: 'canDeletePartners', label: 'Eliminar socios o cuentas del sistema', module: 'settings' }
];

export const ROLE_QUOTA_POLICIES = {
  guest: {
    code: 'guest',
    label: 'Visitante',
    aiTurnsLimit: 5,
    aiQuotaPeriod: 'session',
    maxWorkspaces: 0,
    maxCanvases: 1,
    canEditManually: false,
    canSavePermanent: false,
    canImplementWeb: false
  },
  user: {
    code: 'user',
    label: 'Usuario Registrado',
    aiTurnsLimit: 15,
    aiQuotaPeriod: 'daily_utc',
    maxWorkspaces: 5,
    maxCanvases: 20,
    canEditManually: true,
    canSavePermanent: true,
    canImplementWeb: true
  },
  partner: {
    code: 'partner',
    label: 'Socio / Cliente',
    aiTurnsLimit: 45,
    aiQuotaPeriod: 'daily_utc',
    maxWorkspaces: 50,
    maxCanvases: 200,
    canEditManually: true,
    canSavePermanent: true,
    canImplementWeb: true
  },
  collaborator: {
    code: 'collaborator',
    label: 'Colaborador',
    aiTurnsLimit: 120,
    aiQuotaPeriod: 'daily_utc',
    maxWorkspaces: 100,
    maxCanvases: 500,
    canEditManually: true,
    canSavePermanent: true,
    canImplementWeb: true
  },
  admin: {
    code: 'admin',
    label: 'Administrador',
    aiTurnsLimit: 999,
    aiQuotaPeriod: 'unlimited',
    maxWorkspaces: 999,
    maxCanvases: 9999,
    canEditManually: true,
    canSavePermanent: true,
    canImplementWeb: true
  }
};

export const DEFAULT_ROLE_DEFINITIONS = {
  'Admin': {
    id: 'Admin',
    code: 'admin',
    name: 'Administrador',
    desc: 'Control total: editar pricing-config, aprobar pagos de referidos (créditos), publicar métricas de Impacto Comunitario, gestionar usuarios y auditar el sistema.',
    color: 'text-primary',
    badgeColor: 'bg-primary/20 text-primary border-primary/40',
    avatarBg: 'bg-primary',
    allowedTabs: [
      'actors', 'stories', 'interfaces', 'formalia', 'implementationStatus',
      'partnerPanel', 'presalesReview', 'architecture', 'dataModel', 'files',
      'backlog', 'sprints', 'docs', 'settings'
    ],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canImplementWeb: true,
      canUsePartnerPanel: true,
      canReviewSubmissions: true,
      canManageArchitecture: true,
      canManageDataModels: true,
      canManageFiles: true,
      canEditPricingConfig: true,
      canApproveReferrals: true,
      canPublishImpact: true,
      canManageUsers: true,
      canDeletePartners: true
    }
  },
  'Colaborador': {
    id: 'Colaborador',
    code: 'collaborator',
    name: 'Colaborador (Equipo Técnico)',
    desc: 'Equipo técnico, analistas o desarrolladores: cotizaciones entrantes, expedientes de FORMALIA (JSON, .puml, HUs, web_blueprints), Architecture (archifly) y Files (métodos abstractos). Sin cambios a tarifas ni borrar socios.',
    color: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    avatarBg: 'bg-cyan-600',
    allowedTabs: [
      'presalesReview', 'actors', 'stories', 'interfaces', 'formalia',
      'architecture', 'dataModel', 'files', 'backlog', 'sprints', 'docs'
    ],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canImplementWeb: true,
      canUsePartnerPanel: false,
      canReviewSubmissions: true,
      canManageArchitecture: true,
      canManageDataModels: true,
      canManageFiles: true,
      canEditPricingConfig: false,
      canApproveReferrals: false,
      canPublishImpact: false,
      canManageUsers: false,
      canDeletePartners: false
    }
  },
  'Socio / Cliente': {
    id: 'Socio / Cliente',
    code: 'partner',
    name: 'Socio / Cliente',
    desc: 'Empresa con membresía activa o desarrollo pactado: 45 turnos IA diarios en FORMALIA, 4 subvistas SDD + solicitud y Panel de Socio (referidos, créditos, proyectos, talleres, Pathway).',
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    avatarBg: 'bg-emerald-600',
    allowedTabs: ['actors', 'stories', 'interfaces', 'formalia', 'implementationStatus', 'partnerPanel'],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canImplementWeb: true,
      canUsePartnerPanel: true,
      canReviewSubmissions: false,
      canManageArchitecture: false,
      canManageDataModels: false,
      canManageFiles: false,
      canEditPricingConfig: false,
      canApproveReferrals: false,
      canPublishImpact: false,
      canManageUsers: false,
      canDeletePartners: false
    }
  },
  'Usuario Registrado': {
    id: 'Usuario Registrado',
    code: 'user',
    name: 'Usuario Registrado',
    desc: 'Emprendedor o PYME registrada en FORMALIA: 15 turnos IA diarios (00:00 UTC), hasta 5 Workspaces y 20 lienzos, edición manual ilimitada, "Implementar en solución web", 4 subvistas del portal y seguimiento de solicitud.',
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    avatarBg: 'bg-amber-600',
    allowedTabs: ['actors', 'stories', 'interfaces', 'formalia', 'implementationStatus'],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canImplementWeb: true,
      canUsePartnerPanel: false,
      canReviewSubmissions: false,
      canManageArchitecture: false,
      canManageDataModels: false,
      canManageFiles: false,
      canEditPricingConfig: false,
      canApproveReferrals: false,
      canPublishImpact: false,
      canManageUsers: false,
      canDeletePartners: false
    }
  },
  // Aliases técnicos internos heredados para compatibilidad de cuentas semilla
  'Desarrollador': {
    id: 'Desarrollador',
    code: 'collaborator',
    name: 'Desarrollador (Equipo Técnico)',
    desc: 'Perfil técnico de desarrollo: cotizaciones, expedientes FORMALIA, archify y Files AST.',
    color: 'text-purple-400',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    avatarBg: 'bg-purple-500',
    allowedTabs: [
      'presalesReview', 'actors', 'stories', 'interfaces', 'formalia',
      'architecture', 'dataModel', 'files', 'backlog', 'sprints', 'docs'
    ],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canImplementWeb: true,
      canUsePartnerPanel: false,
      canReviewSubmissions: true,
      canManageArchitecture: true,
      canManageDataModels: true,
      canManageFiles: true,
      canEditPricingConfig: false,
      canApproveReferrals: false,
      canPublishImpact: false,
      canManageUsers: false,
      canDeletePartners: false
    }
  },
  'Fintech Lead': {
    id: 'Fintech Lead',
    code: 'collaborator',
    name: 'Analista / Fintech Lead',
    desc: 'Analista de preventa y producto: revisión de cotizaciones, expedientes FORMALIA y arquitectura.',
    color: 'text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    avatarBg: 'bg-blue-500',
    allowedTabs: [
      'presalesReview', 'actors', 'stories', 'interfaces', 'formalia',
      'architecture', 'dataModel', 'files', 'backlog', 'sprints', 'docs'
    ],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canImplementWeb: true,
      canUsePartnerPanel: false,
      canReviewSubmissions: true,
      canManageArchitecture: true,
      canManageDataModels: true,
      canManageFiles: true,
      canEditPricingConfig: false,
      canApproveReferrals: false,
      canPublishImpact: false,
      canManageUsers: false,
      canDeletePartners: false
    }
  },
  'Auditora de Impacto': {
    id: 'Auditora de Impacto',
    code: 'collaborator',
    name: 'Auditor / Analista SDD',
    desc: 'Revisión técnica de expedientes FORMALIA, arquitectura y trazabilidad.',
    color: 'text-teal-400',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    avatarBg: 'bg-teal-500',
    allowedTabs: [
      'presalesReview', 'actors', 'stories', 'interfaces', 'formalia',
      'architecture', 'files', 'docs'
    ],
    actions: {
      canCreateRoles: false,
      canCreateStories: false,
      canCreateInterfaces: false,
      canImplementWeb: false,
      canUsePartnerPanel: false,
      canReviewSubmissions: true,
      canManageArchitecture: true,
      canManageDataModels: false,
      canManageFiles: true,
      canEditPricingConfig: false,
      canApproveReferrals: false,
      canPublishImpact: false,
      canManageUsers: false,
      canDeletePartners: false
    }
  }
};

export const ASSIGNABLE_PRIMARY_ROLES = [
  'Usuario Registrado',
  'Socio / Cliente',
  'Colaborador',
  'Admin'
];

export function normalizeRoleCode(roleOrUser) {
  const rawRole = typeof roleOrUser === 'string'
    ? roleOrUser
    : roleOrUser?.role;
  if (!rawRole) return typeof roleOrUser === 'object' && roleOrUser ? 'user' : 'guest';
  const clean = String(rawRole).trim().toLowerCase();
  if (clean === 'guest' || clean === 'visitante') return 'guest';
  if (clean === 'admin' || clean === 'administrador' || clean === 'administrador sistémico') return 'admin';
  if (clean === 'partner' || clean.includes('socio') || clean === 'cliente') return 'partner';
  if (
    clean === 'collaborator' ||
    clean === 'colaborador' ||
    clean === 'desarrollador' ||
    clean === 'fintech lead' ||
    clean === 'auditora de impacto'
  ) {
    return 'collaborator';
  }
  return 'user';
}

export function getRoleQuotaPolicy(roleOrUser) {
  const code = normalizeRoleCode(roleOrUser);
  return ROLE_QUOTA_POLICIES[code] || ROLE_QUOTA_POLICIES.guest;
}

export function isInternalStaffRole(roleOrUser) {
  const code = normalizeRoleCode(roleOrUser);
  return code === 'admin' || code === 'collaborator';
}

export function getRoleDefinition(role, roleDefinitions) {
  const defs = roleDefinitions || DEFAULT_ROLE_DEFINITIONS;
  if (defs[role]) return defs[role];
  const code = normalizeRoleCode(role);
  if (code === 'admin') return defs['Admin'] || DEFAULT_ROLE_DEFINITIONS['Admin'];
  if (code === 'partner') return defs['Socio / Cliente'] || DEFAULT_ROLE_DEFINITIONS['Socio / Cliente'];
  if (code === 'collaborator') return defs['Colaborador'] || DEFAULT_ROLE_DEFINITIONS['Colaborador'];
  return defs['Usuario Registrado'] || DEFAULT_ROLE_DEFINITIONS['Usuario Registrado'];
}

export function loadRoleDefinitions() {
  try {
    const raw = localStorage.getItem(ROLE_PERMISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULT_ROLE_DEFINITIONS };
      Object.keys(parsed).forEach(roleKey => {
        const defaultRole = DEFAULT_ROLE_DEFINITIONS[roleKey] || {};
        const parsedRole = parsed[roleKey] || {};
        merged[roleKey] = {
          ...defaultRole,
          ...parsedRole,
          allowedTabs: Array.isArray(parsedRole.allowedTabs)
            ? [...parsedRole.allowedTabs]
            : (defaultRole.allowedTabs || []),
          actions: {
            ...(defaultRole.actions || {}),
            ...(parsedRole.actions || {})
          }
        };
      });
      return merged;
    }
  } catch (_) {}
  return DEFAULT_ROLE_DEFINITIONS;
}

export function saveRoleDefinitions(definitions) {
  try {
    localStorage.setItem(ROLE_PERMISSIONS_STORAGE_KEY, JSON.stringify(definitions));
  } catch (e) {
    console.error('Error saving role definitions:', e);
  }
}

export function isTabAllowedForRole(role, tabId, roleDefinitions) {
  const roleConfig = getRoleDefinition(role, roleDefinitions);
  if (!roleConfig) return false;
  return Array.isArray(roleConfig.allowedTabs) ? roleConfig.allowedTabs.includes(tabId) : false;
}

export function isActionAllowedForRole(role, actionId, roleDefinitions) {
  const roleConfig = getRoleDefinition(role, roleDefinitions);
  if (!roleConfig || !roleConfig.actions) return false;
  return Boolean(roleConfig.actions[actionId]);
}

export function registerPortalUserLocally(user) {
  if (!user || !user.email || typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(PORTAL_USERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(u => u.email?.toLowerCase() !== user.email?.toLowerCase());
    const updated = [
      {
        id: user.id || `user_${Date.now()}`,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        organization: user.organization || 'PYME Pathrimonio',
        role: user.role || 'Usuario Registrado',
        avatar: user.avatar || String(user.name || user.email || 'US').slice(0, 2).toUpperCase(),
        color: user.color || 'bg-amber-600',
        status: user.status || 'active',
        referral_code: user.referral_code || null,
        credit_balance_usd: Number(user.credit_balance_usd || 0),
        bonus_role_months: Number(user.bonus_role_months || 0),
        permissions: user.permissions || ['create_role', 'create_story', 'create_interface', 'implement_web']
      },
      ...filtered
    ];
    localStorage.setItem(PORTAL_USERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (_) {}
}
