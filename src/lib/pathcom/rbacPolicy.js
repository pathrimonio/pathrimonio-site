// ============================================================
// PATHCOM — Política RBAC Declarativa & Registro de Herramientas
// ============================================================

export const PATHCOM_ROLE_CODES = ['guest', 'user', 'partner', 'collaborator', 'admin'];

export const DEFAULT_PATHCOM_MODULE_FLAGS = {
  market_enabled: true,
  pathway_bridge_enabled: true,
  site_cms_enabled: true,
  clubs_enabled: false,
  clubs_reserved: ['pathrimonio_fit']
};

/**
 * Registro declarativo de herramientas de Pathcom.
 * Permite habilitar futuros dominios (ej. clubes / Pathrimonio Fit)
 * mediante feature flags sin refactorizar el núcleo del agente.
 */
export const PATHCOM_TOOL_REGISTRY = {
  path_log_tool: {
    name: 'path_log_tool',
    domain: 'core',
    featureFlag: null,
    label: 'Registro Cronológico de Rutas',
    operations: {
      create_log: {
        allowedRoles: ['user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Registra un avance en lenguaje natural con hora sellada en servidor.'
      },
      list_timeline: {
        allowedRoles: ['guest', 'user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Lista la línea de tiempo cronológica de avances.'
      },
      summarize_progress: {
        allowedRoles: ['guest', 'user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Resume horas acumuladas, avances e hitos de una ruta.'
      }
    }
  },
  market_curator_tool: {
    name: 'market_curator_tool',
    domain: 'market',
    featureFlag: 'market_enabled',
    label: 'Pathrimonio Market',
    operations: {
      list_market: {
        allowedRoles: ['guest', 'user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Consulta el catálogo público de rutas en Pathrimonio Market.'
      },
      get_market_path: {
        allowedRoles: ['guest', 'user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Obtiene el detalle paso a paso y trazabilidad temporal de una ruta.'
      },
      compile_logs_to_path: {
        allowedRoles: ['user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Compila registros cronológicos path_logs en una guía estructurada (DRAFT).'
      },
      submit_for_review: {
        allowedRoles: ['user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Envía una ruta compilada a revisión comunitaria (PEER_REVIEW) o cola de validación.'
      },
      record_validation: {
        allowedRoles: ['user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Registra una calificación (1–5) y feedback de pares sobre una ruta.'
      }
    }
  },
  projects_ops_tool: {
    name: 'projects_ops_tool',
    domain: 'operations',
    featureFlag: null,
    label: 'Operaciones y Proyectos Activos',
    operations: {
      list_projects: {
        allowedRoles: ['guest', 'user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Lista proyectos publicados (o todos/propios según rol RBAC).'
      },
      update_project_draft: {
        allowedRoles: ['collaborator', 'admin'],
        requiresApproval: false,
        description: 'Actualiza únicamente el borrador (DRAFT) de un proyecto.'
      },
      get_formalia_summary: {
        allowedRoles: ['collaborator', 'admin'],
        requiresApproval: false,
        description: 'Consulta resúmenes internos de expedientes de Formalia.'
      }
    }
  },
  site_cms_tool: {
    name: 'site_cms_tool',
    domain: 'cms',
    featureFlag: 'site_cms_enabled',
    label: 'CMS del Sitio Web',
    operations: {
      create_section_draft: {
        allowedRoles: ['collaborator', 'admin'],
        requiresApproval: false,
        description: 'Prepara un cambio de contenido en estado DRAFT sin publicar en vivo.'
      },
      request_publish: {
        allowedRoles: ['collaborator', 'admin'],
        requiresApproval: true,
        description: 'Envía un borrador a pathcom_action_queue para aprobación humana antes de publicar.'
      }
    }
  },
  pathway_bridge_tool: {
    name: 'pathway_bridge_tool',
    domain: 'pathway',
    featureFlag: 'pathway_bridge_enabled',
    label: 'Puente con Pathway',
    operations: {
      fetch_user_milestones: {
        allowedRoles: ['partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Consulta metas y pasos registrados en la app Pathway.'
      },
      import_pathway_logs: {
        allowedRoles: ['partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Importa registros de Pathway hacia path_logs con sus marcas de tiempo originales.'
      }
    }
  },
  clubs_domain_tool: {
    name: 'clubs_domain_tool',
    domain: 'clubs_future',
    featureFlag: 'clubs_enabled',
    label: 'Clubes Comunitarios (Fase Futura · ej. Pathrimonio Fit)',
    operations: {
      list_clubs: {
        allowedRoles: ['user', 'partner', 'collaborator', 'admin'],
        requiresApproval: false,
        description: 'Extensión desacoplada reservada para fase futura.'
      }
    }
  }
};

/**
 * Valida en servidor si el rol activo puede invocar una herramienta/operación.
 */
export function canExecutePathcomTool({
  roleCode = 'guest',
  toolName,
  operation,
  featureFlags = DEFAULT_PATHCOM_MODULE_FLAGS,
  targetUserId = null,
  actorUserId = null
}) {
  const safeRole = PATHCOM_ROLE_CODES.includes(roleCode) ? roleCode : 'guest';
  const toolSpec = PATHCOM_TOOL_REGISTRY[toolName];

  if (!toolSpec) {
    return {
      allowed: false,
      code: 'UNKNOWN_TOOL',
      reason: `La herramienta "${toolName}" no está registrada en Pathcom.`
    };
  }

  const effectiveFlags = { ...DEFAULT_PATHCOM_MODULE_FLAGS, ...(featureFlags || {}) };
  if (toolSpec.featureFlag && effectiveFlags[toolSpec.featureFlag] === false) {
    return {
      allowed: false,
      code: 'FEATURE_DISABLED',
      reason: `El módulo "${toolSpec.label}" se encuentra desactivado por configuración (reservado para fase futura).`
    };
  }

  const opSpec = toolSpec.operations?.[operation];
  if (!opSpec) {
    return {
      allowed: false,
      code: 'UNKNOWN_OPERATION',
      reason: `La operación "${operation}" no existe dentro de ${toolName}.`
    };
  }

  if (!opSpec.allowedRoles.includes(safeRole)) {
    return {
      allowed: false,
      code: 'RBAC_FORBIDDEN',
      reason: `No cuentas con permisos suficientes (rol actual: ${safeRole}) para ejecutar "${toolSpec.label} → ${operation}".`
    };
  }

  // Aislamiento de líneas de tiempo privadas ajenas para guest/user/partner
  if (
    toolName === 'path_log_tool' &&
    operation === 'summarize_progress' &&
    targetUserId &&
    actorUserId &&
    targetUserId !== actorUserId &&
    !['collaborator', 'admin'].includes(safeRole)
  ) {
    return {
      allowed: false,
      code: 'RBAC_FORBIDDEN',
      reason: 'Solo colaboradores o administradores pueden consultar resúmenes privados de otro integrante.'
    };
  }

  return { allowed: true };
}

/**
 * Determina si un rol puede listar o resolver la bandeja pathcom_action_queue.
 */
export function canReviewApprovalItem({ roleCode = 'guest', actionType = 'read', item = null }) {
  const safeRole = PATHCOM_ROLE_CODES.includes(roleCode) ? roleCode : 'guest';
  if (!['collaborator', 'admin'].includes(safeRole)) {
    return {
      allowed: false,
      code: 'RBAC_FORBIDDEN',
      reason: 'La bandeja de aprobaciones está restringida a los roles collaborator y admin.'
    };
  }

  if (actionType === 'resolve' && item?.payload_json?.requires_admin_certification && safeRole !== 'admin') {
    return {
      allowed: false,
      code: 'RBAC_FORBIDDEN',
      reason: 'La certificación comercial PATRIMONIO_VALIDADO requiere aprobación final de un administrador.'
    };
  }

  return { allowed: true };
}

/**
 * Filtra proyectos de site_projects según privilegios RBAC.
 */
export function filterVisibleSiteProjects(projects = [], actor = {}) {
  const safeRole = PATHCOM_ROLE_CODES.includes(actor?.roleCode) ? actor.roleCode : 'guest';
  const list = Array.isArray(projects) ? projects : [];

  if (['collaborator', 'admin'].includes(safeRole)) {
    return list;
  }

  if (safeRole === 'partner') {
    const partnerKeys = new Set(
      [actor.userId, actor.userEmail, actor.partnerId].filter(Boolean).map((v) => String(v).toLowerCase())
    );
    return list
      .filter((p) => p.is_published || (p.client_partner_id && partnerKeys.has(String(p.client_partner_id).toLowerCase())))
      .map((p) => sanitizePublicProject(p, partnerKeys));
  }

  return list.filter((p) => Boolean(p.is_published)).map((p) => sanitizePublicProject(p));
}

function sanitizePublicProject(project, partnerKeys = new Set()) {
  const ownsProject =
    project.client_partner_id && partnerKeys.has(String(project.client_partner_id).toLowerCase());
  if (ownsProject) return project;
  return {
    id: project.id,
    name: project.name,
    client_partner_id: project.client_partner_id || null,
    status: project.status,
    public_summary: project.public_summary,
    cms_state: 'PUBLISHED',
    is_published: Boolean(project.is_published),
    updated_at: project.updated_at
  };
}

/**
 * Acciones rápidas contextuales mostradas en la Consola de Pathcom según rol.
 */
export function getQuickActionsForRole(roleCode = 'guest') {
  const safeRole = PATHCOM_ROLE_CODES.includes(roleCode) ? roleCode : 'guest';
  const base = [
    {
      id: 'qa_market',
      label: 'Explorar Pathrimonio Market',
      prompt: 'Muéstrame las rutas validadas disponibles en Pathrimonio Market'
    },
    {
      id: 'qa_projects',
      label: 'Ver proyectos activos',
      prompt: 'Lista los proyectos actuales publicados en pathrimonio.site'
    }
  ];

  if (safeRole === 'guest') return base;

  const memberActions = [
    {
      id: 'qa_log',
      label: 'Registrar avance de hoy',
      prompt: 'Registrar avance: Avance operativo del módulo de ventas (45 min, progreso 65%)'
    },
    {
      id: 'qa_timeline',
      label: 'Ver mi línea de tiempo',
      prompt: 'Muestra mi línea de tiempo de avances con fecha y hora exacta'
    },
    {
      id: 'qa_compile',
      label: 'Compilar mi ruta para el Market',
      prompt: 'Compila mis registros recientes en una guía estructurada para Pathrimonio Market'
    }
  ];

  if (safeRole === 'partner') {
    return [
      ...memberActions,
      {
        id: 'qa_pathway',
        label: 'Sincronizar metas Pathway',
        prompt: 'Sincroniza mis hitos registrados en Pathway hacia mi línea de tiempo'
      },
      ...base
    ];
  }

  if (['collaborator', 'admin'].includes(safeRole)) {
    return [
      {
        id: 'qa_draft',
        label: 'Crear borrador CMS',
        prompt: 'Crea un borrador CMS para actualizar el resumen de Core Hub PYME y envíalo a aprobación'
      },
      {
        id: 'qa_formalia',
        label: 'Ver expedientes Formalia',
        prompt: 'Muéstrame el resumen de los expedientes recientes de Formalia'
      },
      ...memberActions,
      ...base
    ];
  }

  return [...memberActions, ...base];
}
