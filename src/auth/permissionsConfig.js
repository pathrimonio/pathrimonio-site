// Configuración centralizada de Roles y Matriz de Permisos para el Workspace de Pathrimonio

export const ROLE_PERMISSIONS_STORAGE_KEY = 'pathrimonio_role_permissions_v1';
export const PORTAL_USERS_STORAGE_KEY = 'pathrimonio_portal_users_v2';

export const SYSTEM_MODULES = [
  { id: 'stories', label: 'Historias de Usuario', icon: 'view_kanban', badge: 'US', desc: 'Requerimientos funcionales y criterios de aceptación' },
  { id: 'actors', label: 'Actores & Roles', icon: 'badge', badge: 'ROL', desc: 'Matriz de usuarios del negocio y permisos de acceso' },
  { id: 'interfaces', label: 'Interfaces de Software', icon: 'devices', badge: 'UI/UX', desc: 'Fichas de interfaces, mockups y puntos interactivos' },
  { id: 'architecture', label: 'Arquitectura de Software', icon: 'account_tree', badge: 'ARCH', desc: 'Capas Clean/Hexagonal, contratos abstractos y síntesis con archify' },
  { id: 'dataModel', label: 'Arquitectura de Datos', icon: 'database', badge: 'DB', desc: 'Tablas relacionales, DER y esquemas de arquitectura' },
  { id: 'files', label: 'Archivos & Manifiestos', icon: 'folder_open', badge: 'FILES', desc: 'Entregables, diagramas y contratos' },
  { id: 'formalia', label: 'FORMALIA (Chats & Archivos)', icon: 'auto_awesome', badge: 'IA', desc: 'Chats recopilados, archivos generados (.puml, PNG, PDF) y versiones' },
  { id: 'backlog', label: 'Backlog', icon: 'format_list_bulleted', badge: 'PLAN', desc: 'Priorización consolidada de historias' },
  { id: 'sprints', label: 'Sprints & Ciclos', icon: 'timelapse', badge: 'AGILE', desc: 'Métricas de velocidad y cadencia de desarrollo' },
  { id: 'docs', label: 'Docs de Arquitectura', icon: 'article', badge: 'DOCS', desc: 'Estándares de arquitectura, manifiestos y guías técnicas' },
  { id: 'settings', label: 'Administración & Usuarios', icon: 'admin_panel_settings', badge: 'ADMIN', desc: 'Gestión de colaboradores, roles y permisos de acceso' }
];

export const SYSTEM_ACTIONS = [
  { id: 'canCreateRoles', label: 'Crear y registrar roles del negocio', module: 'actors' },
  { id: 'canCreateStories', label: 'Crear y registrar historias de usuario', module: 'stories' },
  { id: 'canCreateInterfaces', label: 'Crear y registrar interfaces de software', module: 'interfaces' },
  { id: 'canManageArchitecture', label: 'Analizar y sincronizar arquitectura con archify', module: 'architecture' },
  { id: 'canManageDataModels', label: 'Modelar tablas y ejecutar scripts SQL', module: 'dataModel' },
  { id: 'canManageFiles', label: 'Subir y administrar archivos del proyecto', module: 'files' },
  { id: 'canManageUsers', label: 'Determinar roles y permisos de acceso de usuarios', module: 'settings' }
];

export const DEFAULT_ROLE_DEFINITIONS = {
  'Admin': {
    id: 'Admin',
    name: 'Administrador Sistémico',
    desc: 'Acceso total de administración técnica, control de proyectos, configuración y gestión de usuarios.',
    color: 'text-primary',
    badgeColor: 'bg-primary/20 text-primary border-primary/40',
    avatarBg: 'bg-primary',
    allowedTabs: ['actors', 'stories', 'interfaces', 'architecture', 'dataModel', 'files', 'formalia', 'backlog', 'sprints', 'docs', 'settings'],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canManageArchitecture: true,
      canManageDataModels: true,
      canManageFiles: true,
      canManageUsers: true
    }
  },
  'Colaborador': {
    id: 'Colaborador',
    name: 'Colaborador de Proyecto (Registro)',
    desc: 'Acceso para colaboradores: diseño de requerimientos, interfaces, arquitectura de software y entregables.',
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    avatarBg: 'bg-amber-600',
    allowedTabs: ['actors', 'stories', 'interfaces', 'architecture', 'dataModel', 'files', 'formalia', 'backlog', 'sprints', 'docs'],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canManageArchitecture: true,
      canManageDataModels: true,
      canManageFiles: true,
      canManageUsers: false
    }
  },
  'Product Owner': {
    id: 'Product Owner',
    name: 'Product Owner / Gestor',
    desc: 'Gestión de alcance, historias de usuario, interfaces, backlog y sprints del producto.',
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    avatarBg: 'bg-emerald-600',
    allowedTabs: ['actors', 'stories', 'interfaces', 'architecture', 'formalia', 'backlog', 'sprints', 'docs'],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canManageArchitecture: true,
      canManageDataModels: false,
      canManageFiles: false,
      canManageUsers: false
    }
  },
  'Desarrollador': {
    id: 'Desarrollador',
    name: 'Desarrollador de Software',
    desc: 'Ingeniería de software, interfaces, historias, arquitectura de datos y esquemas relacionales.',
    color: 'text-purple-400',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    avatarBg: 'bg-purple-500',
    allowedTabs: ['actors', 'stories', 'interfaces', 'architecture', 'dataModel', 'files', 'formalia', 'docs'],
    actions: {
      canCreateRoles: true,
      canCreateStories: true,
      canCreateInterfaces: true,
      canManageArchitecture: true,
      canManageDataModels: true,
      canManageFiles: true,
      canManageUsers: false
    }
  },
  'Auditora de Impacto': {
    id: 'Auditora de Impacto',
    name: 'Auditor de Impacto',
    desc: 'Monitoreo de trazabilidad, cumplimiento de criterios y auditoría de requerimientos.',
    color: 'text-teal-400',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    avatarBg: 'bg-teal-500',
    allowedTabs: ['actors', 'stories', 'interfaces', 'architecture', 'docs'],
    actions: {
      canCreateRoles: false,
      canCreateStories: false,
      canCreateInterfaces: false,
      canManageArchitecture: false,
      canManageDataModels: false,
      canManageFiles: false,
      canManageUsers: false
    }
  }
};

export function loadRoleDefinitions() {
  try {
    const raw = localStorage.getItem(ROLE_PERMISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULT_ROLE_DEFINITIONS };
      Object.keys(parsed).forEach(roleKey => {
        const defaultRole = DEFAULT_ROLE_DEFINITIONS[roleKey] || {};
        const parsedRole = parsed[roleKey] || {};
        const allowedTabs = Array.isArray(parsedRole.allowedTabs) ? [...parsedRole.allowedTabs] : (defaultRole.allowedTabs || []);
        // Guarantee 'architecture' and 'files' are available for all roles
        if (!allowedTabs.includes('architecture')) {
          const insertIdx = allowedTabs.indexOf('interfaces');
          if (insertIdx !== -1) {
            allowedTabs.splice(insertIdx + 1, 0, 'architecture');
          } else {
            allowedTabs.push('architecture');
          }
        }
        if (!allowedTabs.includes('files')) {
          allowedTabs.push('files');
        }
        merged[roleKey] = {
          ...defaultRole,
          ...parsedRole,
          allowedTabs,
          actions: {
            ...defaultRole.actions,
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
  // Los módulos de consulta técnica y arquitectura son universales en el portal
  if (tabId === 'architecture' || tabId === 'files' || tabId === 'docs' || tabId === 'dataModel') {
    return true;
  }
  const defs = roleDefinitions || DEFAULT_ROLE_DEFINITIONS;
  const roleConfig = defs[role] || defs['Colaborador'];
  if (!roleConfig) return true;
  return roleConfig.allowedTabs ? roleConfig.allowedTabs.includes(tabId) : true;
}

export function isActionAllowedForRole(role, actionId, roleDefinitions) {
  const defs = roleDefinitions || DEFAULT_ROLE_DEFINITIONS;
  const roleConfig = defs[role] || defs['Colaborador'];
  if (!roleConfig || !roleConfig.actions) return false;
  return Boolean(roleConfig.actions[actionId]);
}
