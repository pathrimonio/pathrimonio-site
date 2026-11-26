import {
  ADMIN_ROLES,
  calculateQuotePricing
} from '../../data/pricingRules.js';

// ── 1. Compilador Determinista a PlantUML (SDD Sección 6.1) ──────────────────

function sanitizeSwimlaneName(name) {
  return (name || 'Rol').replace(/\|/g, '/').trim();
}

function sanitizeLabel(text) {
  return (text || 'Actividad').replace(/[;\n\r]/g, ' ').trim();
}

/**
 * Convierte ProcessGraphJSON en código PlantUML válido de diagrama de actividad con carriles (swimlanes).
 */
export function graphToPlantUML(graph) {
  const company = graph?.business_context?.company_name || 'PYME Pathrimonio';
  const processName = graph?.business_context?.process_name || 'Proceso Operativo';
  const actors = graph?.actors || [];
  const steps = graph?.steps || [];
  const transitions = graph?.transitions || [];

  const actorById = new Map(actors.map((a) => [a.id, a]));
  const lines = [
    `@startuml`,
    `title ${sanitizeLabel(company)} — ${sanitizeLabel(processName)}`,
    `skinparam backgroundColor #FAFAFA`,
    `skinparam swimlaneBorderColor #D4D4D8`,
    `skinparam swimlaneTitleBackgroundColor #F4F4F5`,
    `skinparam activityBackgroundColor #FFFFFF`,
    `skinparam activityBorderColor #09090B`,
    `skinparam noteBackgroundColor #FFFBEB`,
    `skinparam noteBorderColor #FFC000`,
    ``
  ];

  if (steps.length === 0) {
    lines.push(`|Inicio|`);
    lines.push(`start`);
    lines.push(`:Describe tu proceso en FORMALIA para generar los carriles;`);
    lines.push(`stop`);
    lines.push(`@enduml`);
    return lines.join('\n');
  }

  // Orden topológico simple respetando transiciones si existen
  const orderedSteps = [];
  const visited = new Set();
  const outgoing = new Map();
  transitions.forEach((t) => {
    if (!outgoing.has(t.from)) outgoing.set(t.from, []);
    outgoing.get(t.from).push(t);
  });

  const inDegree = new Map(steps.map((s) => [s.id, 0]));
  transitions.forEach((t) => {
    if (inDegree.has(t.to)) {
      inDegree.set(t.to, (inDegree.get(t.to) || 0) + 1);
    }
  });

  const queue = steps.filter((s) => (inDegree.get(s.id) || 0) === 0);
  if (queue.length === 0 && steps.length > 0) queue.push(steps[0]);

  const stepById = new Map(steps.map((s) => [s.id, s]));
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current.id)) continue;
    visited.add(current.id);
    orderedSteps.push(current);
    const edges = outgoing.get(current.id) || [];
    for (const edge of edges) {
      const target = stepById.get(edge.to);
      if (target && !visited.has(target.id)) {
        queue.push(target);
      }
    }
  }
  // Asegurar pasos huérfanos
  steps.forEach((s) => {
    if (!visited.has(s.id)) orderedSteps.push(s);
  });

  let currentLane = null;
  orderedSteps.forEach((step, idx) => {
    const actor = actorById.get(step.actor_id);
    const laneName = sanitizeSwimlaneName(actor?.name || step.actor_id);

    if (laneName !== currentLane) {
      lines.push(`|${laneName}|`);
      currentLane = laneName;
    }

    if (idx === 0) {
      lines.push(`start`);
    }

    const incomingTransition = transitions.find((t) => t.to === step.id && t.condition);
    if (incomingTransition?.condition) {
      lines.push(`-> ${sanitizeLabel(incomingTransition.condition)};`);
    }

    if (step.step_type === 'GATEWAY_OR_APPROVAL') {
      lines.push(`if (${sanitizeLabel(step.label)}?) then (Aprobado)`);
      lines.push(`  :Continuar flujo;`);
      lines.push(`else (Observado)`);
      lines.push(`  :Notificar ajuste;`);
      lines.push(`endif`);
    } else {
      lines.push(`:${sanitizeLabel(step.label)};`);
    }

    if (step.is_manual_bottleneck) {
      const tip = step.automation_opportunity
        ? `Cuello de botella manual — Oportunidad: ${sanitizeLabel(step.automation_opportunity)}`
        : 'Cuello de botella manual detectado por FORMALIA';
      lines.push(`note right`);
      lines.push(`  ${tip}`);
      lines.push(`end note`);
    } else if (step.artifacts && step.artifacts.length > 0) {
      lines.push(`note right: Artefacto: ${step.artifacts.join(', ')}`);
    }

    if (idx === orderedSteps.length - 1) {
      lines.push(`stop`);
    }
  });

  lines.push(``);
  lines.push(`@enduml`);
  return lines.join('\n');
}

// ── 2. Motor de Mapeo Determinista: FormalIA → Cotizador (SDD Sección 5) ─────

const ROLE_KEYWORDS = [
  { roleId: 'ventas', keywords: ['venta', 'comercial', 'recepcion', 'recepción', 'cotiz', 'pedido', 'asesor'] },
  { roleId: 'caja', keywords: ['caja', 'cajero', 'factur', 'boleta', 'comprobante', 'pago', 'cobro'] },
  { roleId: 'almacen', keywords: ['almacen', 'almacén', 'bodega', 'stock', 'inventario', 'kardex', 'bulto'] },
  { roleId: 'despacho', keywords: ['despacho', 'ruta', 'chofer', 'reparto', 'repartidor', 'envio', 'envío', 'flota', 'delivery', 'mensajero'] },
  { roleId: 'compras', keywords: ['compra', 'proveedor', 'abastecimiento', 'adquisic'] },
  { roleId: 'cobranzas', keywords: ['cobranza', 'credito', 'crédito', 'finanza', 'contab', 'tesorer'] },
  { roleId: 'atencion', keywords: ['atencion', 'atención', 'soporte', 'postventa', 'cita', 'triaje', 'medico', 'médico', 'consulta'] },
  { roleId: 'gerencia', keywords: ['gerencia', 'director', 'administrador', 'admin', 'supervisor', 'jefe', 'dueño'] }
];

function matchAdminRoleId(actorName, usedIds) {
  const lower = (actorName || '').toLowerCase();
  for (const entry of ROLE_KEYWORDS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.roleId;
    }
  }
  // Fallback deterministic slot not yet used
  const fallback = ADMIN_ROLES.find((r) => !usedIds.has(r.id));
  return fallback ? fallback.id : 'gerencia';
}

/**
 * Traduce ProcessGraphJSON al estado inicial del Cotizador de 4 pasos de Pathrimonio.
 */
export function mapProcessToQuoteConfig(graph) {
  const actors = graph?.actors || [];
  const steps = graph?.steps || [];
  const ctx = graph?.business_context || {};
  const eng = graph?.engineering_artifacts || {};

  // A. Actores internos -> admin_roles ($30/mes = $1/día cada uno)
  const internalActors = actors.filter((a) => a.type === 'INTERNAL_ADMIN_ROLE');
  const roleCountMap = new Map();
  const usedRoleIds = new Set();

  internalActors.forEach((actor) => {
    const matchedId = matchAdminRoleId(actor.name, usedRoleIds);
    usedRoleIds.add(matchedId);
    roleCountMap.set(matchedId, (roleCountMap.get(matchedId) || 0) + 1);
  });

  // Si todavía no se extrajeron actores, sugerir base mínima 1 gerencia
  if (roleCountMap.size === 0) {
    roleCountMap.set('gerencia', 1);
  }

  const admin_roles = Array.from(roleCountMap.entries()).map(([role, count]) => ({
    role,
    count
  }));

  // B. Interfaces sugeridas
  const interfaces = new Set(['web_operativa']);

  // Actores externos (Cliente Final) con pasos de consulta/seguimiento -> portal_clientes
  const hasExternalCustomer = actors.some((a) => a.type === 'EXTERNAL_CUSTOMER');
  const hasTrackingOrQuery = steps.some((s) =>
    /consulta|estado|seguimiento|portal|tarifa|rastreo|cita|pedido/i.test(s.label || '')
  );
  if (hasExternalCustomer && (hasTrackingOrQuery || steps.length >= 2)) {
    interfaces.add('portal_clientes');
  }

  // Pasos por canal whatsapp -> bot_whatsapp
  const hasWhatsappChannel = steps.some(
    (s) => s.channel === 'whatsapp' || /whatsapp|wsp/i.test(s.label || '')
  );
  if (hasWhatsappChannel) {
    interfaces.add('bot_whatsapp');
  }

  // Actores de campo / ruta / despacho -> app_movil
  const hasFieldRole = actors.some(
    (a) =>
      a.is_field_role ||
      /chofer|repartidor|ruta|campo|técnico|tecnico|brigada|motorizado|despacho/i.test(a.name || '')
  );
  if (hasFieldRole) {
    interfaces.add('app_movil');
  }

  // Gerencia o métricas -> dashboard_bi
  const hasBiNeed =
    actors.some((a) => /gerencia|direcci/i.test(a.name || '')) ||
    steps.some((s) => /reporte|métrica|indicador|cuadre|arqueo/i.test(s.label || ''));
  if (hasBiNeed) {
    interfaces.add('dashboard_bi');
  }

  // C. Datos y APIs
  const data_and_apis = new Set(['historial_ilimitado']);
  const neededApis = eng.external_apis_needed || [];
  const validApiSet = new Set([
    'historial_ilimitado',
    'validacion_ruc_dni',
    'pasarela_pagos',
    'almacenamiento_cloud',
    'integracion_hardware_erp'
  ]);
  neededApis.forEach((api) => {
    if (validApiSet.has(api)) data_and_apis.add(api);
  });

  // Inferir de labels si no vino explícito
  steps.forEach((s) => {
    const lbl = (s.label || '').toLowerCase();
    if (/ruc|dni|sunat|boleta|factura|comprobante/.test(lbl)) {
      data_and_apis.add('validacion_ruc_dni');
    }
    if (/foto|evidencia|guía|guia|archivo|pdf|escane/.test(lbl)) {
      data_and_apis.add('almacenamiento_cloud');
    }
    if (/tarjeta|yape|plin|qr|link de pago|pasarela/.test(lbl)) {
      data_and_apis.add('pasarela_pagos');
    }
  });

  // D. Método actual y cuellos de botella
  const channels = new Set(steps.map((s) => s.channel));
  let current_method = 'excel_y_whatsapp';
  if (channels.has('cuaderno_papel') && !channels.has('excel_manual')) {
    current_method = 'cuaderno_papel';
  } else if (channels.has('sistema_externo') && !channels.has('excel_manual')) {
    current_method = 'multiples_apps';
  }

  const bottlenecks = steps.filter((s) => s.is_manual_bottleneck);
  let main_pain_point = 'desorden_en_despachos_y_caja';
  const allLabels = steps.map((s) => s.label || '').join(' ').toLowerCase();
  if (/stock|inventario|bodega|almacén|almacen/.test(allLabels)) {
    main_pain_point = 'fuga_de_inventario';
  } else if (/cotiz|respuesta|demora|esperando|whatsapp/.test(allLabels)) {
    main_pain_point = 'clientes_esperando_respuestas';
  } else if (/cobranza|crédito|deuda|pago/.test(allLabels)) {
    main_pain_point = 'cobranzas_lentas_y_pendientes';
  }

  const bottleneckDetails = bottlenecks
    .map((b) => `• ${b.label}${b.automation_opportunity ? ` (Automatización: ${b.automation_opportunity})` : ''}`)
    .join('\n');

  const custom_requirements_note = [
    `Proceso mapeado en FORMALIA: "${ctx.process_name || 'Operación Principal'}" (${steps.length} pasos, ${actors.length} actores).`,
    bottlenecks.length > 0
      ? `Cuellos de botella detectados:\n${bottleneckDetails}`
      : 'Sin cuellos de botella críticos marcados manualmente.',
    internalActors.length > 0
      ? `Roles detectados: ${internalActors.map((a) => a.name).join(', ')}.`
      : ''
  ]
    .filter(Boolean)
    .join('\n');

  const configuration = {
    admin_roles,
    end_customers_tier: 'hasta_100_base',
    interfaces: Array.from(interfaces),
    data_and_apis: Array.from(data_and_apis),
    custom_requirements_note
  };

  const pricing = calculateQuotePricing({
    ...configuration,
    commitment_plan: 'semestral_setup_gratis'
  });

  return {
    formalia_session_id: graph?.session_id || null,
    business_discovery: {
      company_name: ctx.company_name || '',
      industry: ctx.industry || 'logistica_transporte',
      current_method,
      custom_method_detail: '',
      main_pain_point,
      custom_pain_detail: bottlenecks.length > 0 ? bottlenecks.map((b) => b.label).join('; ') : ''
    },
    configuration,
    commitment_plan: 'semestral_setup_gratis',
    pricing_preview: pricing,
    mapping_summary: {
      internal_roles_count: internalActors.length || 1,
      external_actors_count: actors.filter((a) => a.type === 'EXTERNAL_CUSTOMER').length,
      bottlenecks_count: bottlenecks.length,
      detected_interfaces: Array.from(interfaces),
      detected_apis: Array.from(data_and_apis)
    }
  };
}

// ── 3. Handoff Preventa → Desarrollo (SDD Sección 6.2) ──────────────────────

function slugifyToken(text = '') {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function toSnakeTableName(entityName = '') {
  const withUnderscores = String(entityName || 'entidad')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2');
  return slugifyToken(withUnderscores) || 'registro_operativo';
}

function getChannelLabel(channel = 'presencial') {
  const map = {
    whatsapp: 'WhatsApp',
    excel_manual: 'Excel / Planilla',
    cuaderno_papel: 'Registro Físico / Papel',
    correo: 'Correo Electrónico',
    llamada: 'Teléfono',
    sistema_externo: 'Sistema / SUNAT',
    presencial: 'Ventanilla / Presencial',
    web_portal: 'Portal Web',
    app_movil: 'App Móvil'
  };
  return map[channel] || channel || 'Operación Web';
}

function inferPlatformForActor(actor, actorSteps = []) {
  if (actor?.is_field_role || actorSteps.some((s) => s.channel === 'app_movil')) {
    return 'Android / Móvil Offline';
  }
  if (actor?.type === 'EXTERNAL_CUSTOMER') {
    const usesWhatsapp = actorSteps.some((s) => s.channel === 'whatsapp');
    return usesWhatsapp ? 'Web Portal + WhatsApp Bot' : 'Web Portal Clientes';
  }
  return 'Web & Mobile';
}

/**
 * Genera el paquete completo de ingeniería a partir de ProcessGraphJSON:
 * PlantUML, Historias de Usuario, Interfaces sugeridas, Entidades/Tablas y matriz RBAC.
 */
export function generateEngineeringHandoff(graph) {
  const actors = graph?.actors || [];
  const steps = graph?.steps || [];
  const ctx = graph?.business_context || {};
  const eng = graph?.engineering_artifacts || {};
  const actorById = new Map(actors.map((a) => [a.id, a]));
  const moduleName = ctx.process_name && ctx.process_name !== 'Operación por mapear'
    ? ctx.process_name
    : 'Operación FORMALIA';

  // 1. Código PlantUML
  const plantuml = graphToPlantUML(graph);

  // 2. Entidades y modelos de datos derivados de ingeniería + artefactos (deduplicados por nombre snake_case)
  const candidatesEntities = [
    ...(eng.detected_entities || []),
    ...steps.flatMap((s) => (s.artifacts || []).map((a) =>
      String(a || '')
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')
    ))
  ].filter(Boolean);

  const uniqueByTable = new Map();
  for (const name of candidatesEntities) {
    const tbl = toSnakeTableName(name);
    if (!uniqueByTable.has(tbl)) uniqueByTable.set(tbl, name);
  }
  const entities = uniqueByTable.size > 0
    ? Array.from(uniqueByTable.values())
    : ['Cliente', 'RegistroOperativo', 'Comprobante'];

  // 3. Historias de Usuario detalladas (1 por actividad mapeada)
  const user_stories = steps.map((step, idx) => {
    const actor = actorById.get(step.actor_id);
    const roleName = actor?.name || 'Operador';
    const artifactText =
      step.artifacts && step.artifacts.length > 0
        ? `generar y auditar ${step.artifacts.join(', ')}`
        : 'mantener trazabilidad en tiempo real sin pérdida de información';
    const priority =
      step.is_manual_bottleneck || step.step_type === 'GATEWAY_OR_APPROVAL' || step.step_type === 'TRIGGER'
        ? 'Alta'
        : 'Media';

    const targetInterfaceTitle =
      actor?.type === 'EXTERNAL_CUSTOMER'
        ? `Portal / Canal ${getChannelLabel(step.channel)} — ${roleName}`
        : actor?.is_field_role
          ? `App Móvil de Campo — ${roleName}`
          : `Módulo Operativo — ${roleName}`;

    return {
      id: `HU-FIA-${String(idx + 1).padStart(2, '0')}`,
      step_id: step.id,
      step_type: step.step_type || 'TASK',
      module: moduleName,
      priority,
      role: roleName,
      actor_type: actor?.type || 'INTERNAL_ADMIN_ROLE',
      action: step.label.charAt(0).toLowerCase() + step.label.slice(1),
      benefit: artifactText,
      channel_origin: step.channel,
      channel_label: getChannelLabel(step.channel),
      artifacts: step.artifacts || [],
      target_interface: targetInterfaceTitle,
      is_priority_automation: Boolean(step.is_manual_bottleneck),
      automation_opportunity: step.automation_opportunity || null,
      acceptance_criteria: [
        `Permitir al rol "${roleName}" ejecutar la actividad desde ${targetInterfaceTitle} con soporte offline-first.`,
        step.artifacts?.length > 0
          ? `Persistir y auditar [${step.artifacts.join(', ')}] con usuario y marca temporal inmutable.`
          : 'Registrar usuario responsable y marca de tiempo de transición al siguiente carril.',
        step.is_manual_bottleneck && step.automation_opportunity
          ? `Automatización objetivo: ${step.automation_opportunity}.`
          : 'Aplicar control RBAC del rol antes de habilitar el paso siguiente del flujo.'
      ]
    };
  });

  // 4. Interfaces de Software sugeridas por actor y canal
  const suggested_interfaces = actors.map((actor, idx) => {
    const ownedSteps = steps.filter((s) => s.actor_id === actor.id);
    const ownedStories = user_stories.filter((u) => u.role === actor.name);
    const platform = inferPlatformForActor(actor, ownedSteps);
    const isCustomer = actor.type === 'EXTERNAL_CUSTOMER';
    const isField = Boolean(actor.is_field_role);
    const title = isCustomer
      ? `Portal & Canal de Atención — ${actor.name}`
      : isField
        ? `App de Ruta y Evidencias — ${actor.name}`
        : `Bandeja Operativa — ${actor.name}`;
    const artifacts = Array.from(new Set(ownedSteps.flatMap((s) => s.artifacts || [])));
    const bottlenecks = ownedSteps.filter((s) => s.is_manual_bottleneck);

    return {
      number: `FIA-${idx + 1}`,
      title,
      module: moduleName,
      platform,
      roles: [actor.name],
      linked_story_id: ownedStories[0]?.id || null,
      objective:
        ownedSteps.length > 0
          ? `Digitalizar ${ownedSteps.length} actividad(es) de ${actor.name} (${ownedSteps.map((s) => s.label).join(' → ')}) eliminando reprocesos manuales.`
          : `Habilitar vista operativa dedicada para el rol ${actor.name} en ${moduleName}.`,
      content:
        ownedSteps.length > 0
          ? `Acciones clave: ${ownedSteps.map((s) => s.label).join('; ')}.${artifacts.length > 0 ? ` Documentos/registros: ${artifacts.join(', ')}.` : ''}`
          : `Panel de trabajo y consulta de estado para ${actor.name}.`,
      rules:
        bottlenecks.length > 0
          ? bottlenecks.map((b) => b.automation_opportunity || `Automatizar "${b.label}"`).join(' · ')
          : `Acceso acotado exclusivamente al rol ${actor.name} según matriz RBAC.`,
      details: `Generado desde FORMALIA (${ownedSteps.length} pasos · canales: ${Array.from(new Set(ownedSteps.map((s) => getChannelLabel(s.channel)))).join(', ') || 'Web'}).`
    };
  });

  // 5. Modelos de datos relacionales derivados
  const suggested_data_models = entities.map((entityName, idx) => {
    const tableName = toSnakeTableName(entityName);
    const matchingStepIdx = steps.findIndex((s) =>
      (s.artifacts || []).some((a) => slugifyToken(a).includes(tableName) || tableName.includes(slugifyToken(a)))
    );
    const linkedStory = matchingStepIdx >= 0 ? user_stories[matchingStepIdx]?.id : user_stories[0]?.id || null;

    return {
      idx: idx + 1,
      tableName,
      name: `${entityName} (${moduleName})`,
      module: moduleName,
      linkedStory,
      description: `Entidad operativa "${entityName}" detectada por FORMALIA para trazabilidad de ${moduleName}.`,
      attributes: [
        { id: 'c1', name: 'id', type: 'UUID', isPrimary: true, isNullable: false, isUnique: true, defaultValue: 'gen_random_uuid()', description: 'Identificador único del registro.' },
        { id: 'c2', name: 'estado', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, defaultValue: "'pendiente'", description: 'Estado actual dentro del flujo de carriles.' },
        { id: 'c3', name: 'actor_responsable', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, defaultValue: null, description: 'Rol o usuario propietario de la etapa actual.' },
        { id: 'c4', name: 'canal_origen', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, defaultValue: "'web'", description: 'Canal de captura (WhatsApp, Web, App Móvil).' },
        { id: 'c5', name: 'metadata_operativa', type: 'JSONB', isPrimary: false, isNullable: true, isUnique: false, defaultValue: "'{}'::jsonb", description: 'Datos adjuntos y artefactos capturados.' },
        { id: 'c6', name: 'created_at', type: 'TIMESTAMPTZ', isPrimary: false, isNullable: false, isUnique: false, defaultValue: 'now()', description: 'Fecha/hora inmutable de creación.' }
      ]
    };
  });

  // 6. Reglas RBAC derivadas de los carriles
  const rbac_rules = actors.map((actor) => {
    const ownedSteps = steps.filter((s) => s.actor_id === actor.id);
    return {
      actor_id: actor.id,
      role_name: actor.name,
      actor_type: actor.type,
      access_scope:
        actor.type === 'EXTERNAL_CUSTOMER'
          ? 'Portal / Autogestión Restringida (Solo registros propios)'
          : 'Módulo Operativo ($1 USD/día Socio)',
      permitted_actions: ownedSteps.map((s) => s.label),
      managed_artifacts: Array.from(new Set(ownedSteps.flatMap((s) => s.artifacts || [])))
    };
  });

  return {
    session_id: graph?.session_id,
    generated_at: new Date().toISOString(),
    process_name: ctx.process_name,
    company_name: ctx.company_name,
    plantuml,
    user_stories,
    suggested_interfaces,
    suggested_data_models,
    entities,
    external_apis_needed: eng.external_apis_needed || [],
    rbac_rules
  };
}

/**
 * Formatea las Historias de Usuario generadas en Markdown descargable/copiable.
 */
export function handoffStoriesToMarkdown(handoff) {
  if (!handoff) return '';
  const lines = [
    `# Backlog Inicial — ${handoff.process_name || 'Proceso FORMALIA'}`,
    `Sesión: ${handoff.session_id || 'FIA'} · Empresa: ${handoff.company_name || 'Por definir'}`,
    ``,
    `## Historias de Usuario (${handoff.user_stories?.length || 0})`,
    ``
  ];
  (handoff.user_stories || []).forEach((st) => {
    lines.push(`### ${st.id} [${st.priority}] — ${st.role}`);
    lines.push(`**Como** ${st.role}, **quiero** ${st.action}, **para** ${st.benefit}.`);
    lines.push(`- Canal actual: ${st.channel_label || st.channel_origin}`);
    lines.push(`- Interfaz sugerida: ${st.target_interface}`);
    lines.push(`- Criterios de aceptación:`);
    (st.acceptance_criteria || []).forEach((c) => lines.push(`  - [ ] ${c}`));
    lines.push(``);
  });
  return lines.join('\n');
}

/**
 * Compila un ProcessGraphJSON en entidades nativas del Portal SDD (Actores, Historias, Tablas, Interfaces y Archivo .puml).
 * Usa IDs deterministas por sesión para permitir actualizaciones idempotentes al re-promover un flujo refinado.
 */
export function compileProcessToPortalBundle(graph, targetProjectId = 'pathway') {
  const handoff = generateEngineeringHandoff(graph);
  const rawActors = graph?.actors || [];
  const rawSteps = graph?.steps || [];
  const sessToken = slugifyToken(graph?.session_id || 'fia').slice(-8) || 'fia';
  const todayIso = new Date().toISOString();
  const todayDate = todayIso.split('T')[0];

  // 1. Actores del Negocio
  const actors = rawActors.map((actor, idx) => {
    const isExternal = actor.type === 'EXTERNAL_CUSTOMER';
    const isPartner = actor.type === 'EXTERNAL_PARTNER';
    const ownedSteps = rawSteps.filter((s) => s.actor_id === actor.id);
    return {
      id: `ACT-FIA-${sessToken}-${String(idx + 1).padStart(2, '0')}`,
      projectId: targetProjectId,
      name: actor.name,
      category: isExternal
        ? 'Cliente / Usuario Externo'
        : isPartner
          ? 'Aliado Externo'
          : actor.is_field_role
            ? 'Operación de Campo / Ruta'
            : 'Operaciones & Administración',
      avatarIcon: isExternal ? 'person' : actor.is_field_role ? 'local_shipping' : 'badge',
      color: isExternal ? 'cyan' : actor.is_field_role ? 'amber' : 'primary',
      description:
        ownedSteps.length > 0
          ? `Rol mapeado desde FORMALIA (${handoff.process_name || 'Flujo'}). Actividades: ${ownedSteps.map((s) => s.label).join(', ')}.`
          : `Rol del proceso "${handoff.process_name || 'FORMALIA'}".`,
      permissionLevel: isExternal ? 'Autogestión Restringida' : 'Operativo / Escritura',
      systemAreas: ownedSteps.map((s) => s.label),
      assignedWorker: '',
      assignedWorkerName: '',
      status: 'Activo',
      isPrimaryRole: idx === 0 || ownedSteps.some((s) => s.step_type === 'TRIGGER'),
      createdAt: todayDate
    };
  });

  // 2. Historias de Usuario
  const stories = handoff.user_stories.map((st, idx) => ({
    id: `US-FIA-${sessToken}-${String(idx + 1).padStart(2, '0')}`,
    projectId: targetProjectId,
    module: st.module || handoff.process_name || 'Operación FORMALIA',
    priority: st.priority || 'Alta',
    status: 'En Progreso',
    role: st.role,
    action: st.action,
    benefit: st.benefit,
    criteria: (st.acceptance_criteria || []).map((text, cIdx) => ({
      id: `c${cIdx + 1}`,
      text,
      checked: false
    })),
    attachmentsCount: (st.artifacts || []).length,
    attachmentName: st.artifacts?.[0] ? `${st.artifacts[0]}.json` : null,
    author: 'FORMALIA Studio',
    createdAt: `FORMALIA (${graph?.session_id || 'live'})`,
    sourceSessionId: graph?.session_id || null
  }));

  const storyIdByDraftId = new Map(
    handoff.user_stories.map((st, idx) => [st.id, stories[idx]?.id])
  );

  // 3. Modelos de Datos
  const dataModels = handoff.suggested_data_models.map((dm, idx) => ({
    id: `TBL-FIA-${sessToken}-${String(idx + 1).padStart(2, '0')}`,
    projectId: targetProjectId,
    tableName: dm.tableName,
    name: dm.name,
    module: dm.module,
    storageTarget: 'PostgreSQL + SQLite Offline',
    storageLocation: 'Supabase Cloud + Dispositivo Local',
    syncStrategy: 'Sincronización offline-first con trazabilidad de cambios',
    status: 'En Diseño',
    description: dm.description,
    linkedStory: storyIdByDraftId.get(dm.linkedStory) || stories[0]?.id || null,
    linkedInterface: null,
    author: 'FORMALIA Studio',
    approvedAt: null,
    version: 'v1.0',
    attributes: dm.attributes
  }));

  // 4. Interfaces de Software
  const interfaces = handoff.suggested_interfaces.map((iface, idx) => ({
    id: `INT-FIA-${sessToken}-${String(idx + 1).padStart(2, '0')}`,
    projectId: targetProjectId,
    number: iface.number,
    title: iface.title,
    fullName: `${iface.number}. ${iface.title}`,
    module: iface.module,
    status: 'En Revisión',
    platform: iface.platform,
    image: null,
    imagePlaceholder: 'formalia',
    fields: {
      objetivo: iface.objective,
      contenido: iface.content,
      reglas: iface.rules,
      detalles: iface.details
    },
    roles: iface.roles,
    linkedStory: storyIdByDraftId.get(iface.linked_story_id) || stories[0]?.id || null,
    dataUsage: dataModels.slice(0, 2).map((dm) => ({
      key: `${dm.id}:c2`,
      tableId: dm.id,
      tableName: dm.tableName,
      tableLabel: dm.name,
      schema: 'public',
      attribute: 'estado',
      type: 'TEXT',
      isPrimary: false
    })),
    author: 'FORMALIA Studio',
    reviewedBy: null,
    approvedAt: null,
    version: 'v1.0',
    ultimaFechaModificacion: todayIso,
    ultima_fecha_modificacion: todayIso
  }));

  // 5. Archivo PlantUML para Archivos & Manifiestos
  const file = {
    id: `FILE-FIA-${sessToken}-puml`,
    projectId: targetProjectId,
    name: `FORMALIA-${graph?.session_id || sessToken}-flujo.puml`,
    category: 'Diagramas & Arquitectura',
    format: 'PUML',
    sizeBytes: handoff.plantuml.length,
    sizeFormatted: `${Math.max(1, Math.round(handoff.plantuml.length / 1024))} KB`,
    version: 'v1.0',
    status: 'Aprobado',
    author: 'FORMALIA Studio',
    uploadedBy: 'FORMALIA Studio',
    uploadedAt: todayDate,
    description: `Especificación PlantUML y carriles de "${handoff.process_name || 'Proceso'}" (${actors.length} roles, ${stories.length} HUs).`,
    tags: ['FORMALIA', graph?.session_id || 'SDD', 'PlantUML'],
    linkedEntity: stories[0]?.id || null,
    fileContent: handoff.plantuml,
    contentPreview: handoff.plantuml.slice(0, 600),
    createdAt: todayDate
  };

  return {
    handoff,
    actors,
    stories,
    interfaces,
    dataModels,
    file
  };
}
