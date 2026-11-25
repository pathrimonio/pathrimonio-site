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
    lines.push(`:Describe tu proceso en FormalIA para generar los carriles;`);
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
        : 'Cuello de botella manual detectado por FormalIA';
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
    `Proceso mapeado en FormalIA: "${ctx.process_name || 'Operación Principal'}" (${steps.length} pasos, ${actors.length} actores).`,
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

/**
 * Genera el paquete completo de ingeniería a partir de ProcessGraphJSON:
 * PlantUML, borrador de Historias de Usuario y matriz de Entidades/RBAC.
 */
export function generateEngineeringHandoff(graph) {
  const actors = graph?.actors || [];
  const steps = graph?.steps || [];
  const ctx = graph?.business_context || {};
  const eng = graph?.engineering_artifacts || {};
  const actorById = new Map(actors.map((a) => [a.id, a]));

  // 1. Código PlantUML
  const plantuml = graphToPlantUML(graph);

  // 2. Borrador de Historias de Usuario (1 por step interno o crítico)
  const user_stories = steps.map((step, idx) => {
    const actor = actorById.get(step.actor_id);
    const roleName = actor?.name || 'Operador';
    const artifactText =
      step.artifacts && step.artifacts.length > 0
        ? `generar/actualizar ${step.artifacts.join(', ')}`
        : 'mantener trazabilidad en tiempo real sin pérdida de información';

    return {
      id: `HU-FIA-${String(idx + 1).padStart(2, '0')}`,
      role: roleName,
      actor_type: actor?.type || 'INTERNAL_ADMIN_ROLE',
      action: step.label.charAt(0).toLowerCase() + step.label.slice(1),
      benefit: artifactText,
      channel_origin: step.channel,
      is_priority_automation: Boolean(step.is_manual_bottleneck),
      acceptance_criteria: [
        `Permitir al rol "${roleName}" ejecutar la acción de forma offline-first con sincronización automática.`,
        step.artifacts?.length > 0
          ? `Persistir y auditar el artefacto [${step.artifacts.join(', ')}] con marca temporal.`
          : 'Registrar usuario responsable y marca de tiempo inmutable.',
        step.is_manual_bottleneck && step.automation_opportunity
          ? `Automatización objetivo: ${step.automation_opportunity}.`
          : 'Validar permisos RBAC antes de autorizar la transición al siguiente carril.'
      ]
    };
  });

  // 3. Entidades y reglas RBAC derivadas de los carriles
  const entities = eng.detected_entities?.length
    ? eng.detected_entities
    : ['Cliente', 'RegistroOperativo', 'Comprobante'];

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
    entities,
    external_apis_needed: eng.external_apis_needed || [],
    rbac_rules
  };
}
