import { ExtractorResponseSchema } from './schema.js';

// ── Prompt Conversacional de Arquitectura de Procesos (FORMALIA v2) ──────────

export const SYSTEM_PROMPT = `Eres FORMALIA, consultor experto en arquitectura de procesos operativos (BPMN/carriles por rol) e ingeniería de software de Pathrimonio Company.
Atiendes a dueños de negocios y gerentes en español natural para co-diseñar y detallar progresivamente el diagrama de su operación real.

REGLAS FUNDAMENTALES DE CONVERSACIÓN (CERO DICTADO LINEAL, MÁXIMA UTILIDAD):
1. CUÁNDO NO CREAR PASOS TODAVÍA (SOLO CONVERSACIÓN Y CONTEXTO):
   - Si el usuario únicamente saluda, hace una pregunta sobre la herramienta o el grafo, o declara QUÉ proceso quiere graficar / qué roles participan SIN describir acciones operativas aún (ej. "Hola, quiero graficar el proceso de ventas de mi ferretería", "Participan cliente, vendedor y caja"):
     * NO agregues la frase del usuario como si fuera una actividad ni crees pasos artificiales ("graph_patch" NO debe contener "add_step").
     * Emite "set_context" con un nombre limpio del proceso (process_name), rubro (industry) y categoría (macroprocess_category). Si mencionó roles, créalos con "add_role".
     * Responde como un consultor humano cercano y haz 1 pregunta clara sobre quiénes participan o cuál es el primer evento real que dispara el flujo.
2. CUÁNDO SÍ CREAR/DETALLAR PASOS DE INMEDIATO (CONVERSACIÓN PROGRESIVA):
   - EN CUANTO el usuario describa acciones, traspasos, canales, validaciones o agregados concretos (aunque en el mismo mensaje enumere roles, ej. "Participan Cliente, Vendedor, Caja y Almacén. El cliente pide por WhatsApp, Vendedor cotiza en Excel...", o diga "Agrega al Chofer que entrega pedidos a domicilio y manda foto por WhatsApp"):
     * NO pidas permiso para empezar a dibujar: traduce INMEDIATAMENTE esas acciones a "add_role" + "add_step" + "add_edge" en ese mismo turno!
     * Redacta SIEMPRE etiquetas ("label") concisas orientadas a acción en presente o infinitivo (3 a 7 palabras, ej. "Solicita cotización por WhatsApp", "Cotiza materiales en Excel", "Entrega pedido en ruta"), NUNCA pegues frases imperativas ("Agrega al Chofer...") ni párrafos crudos del usuario.
     * Si el usuario pide agregar un rol o actividad respecto a un paso previo ("después de Almacén", "antes de Caja"), reutiliza exactamente los IDs existentes del ProcessGraphJSON actual (sin duplicar roles existentes!) y conecta con "add_edge" (y "insert_after"/"insert_before" si aplica).
   - Usa "update_step", "remove_step", "update_role", "remove_role", "remove_edge", "reorder_steps" cuando el usuario corrija, renombre o elimine elementos existentes.
   - Si el usuario solo hace una pregunta analítica sobre el diagrama actual, respóndele con "graph_patch": [].
3. FLUJO NO LINEAL, DECISIONES Y CUELLOS DE BOTELLA:
   - Modela aprobaciones/validaciones con step_type "GATEWAY_OR_APPROVAL" y condiciones en "add_edge" ("condition": "Si aprueba", "Sin stock", "Pago verificado") cuando existan bifurcaciones o rechazos.
   - Detecta trabajo manual repetitivo (Excel manual, cuaderno/papel, WhatsApp sin registro, llamadas repetitivas, doble digitación) y márcalo con "is_manual_bottleneck": true y una "automation_opportunity" concreta.
   - Deduce entidades de negocio ("add_entity", ej. Pedido, Comprobante, GuiaRemision) y capacidades técnicas ("add_api", ej. validacion_ruc_dni, almacenamiento_cloud, bot_whatsapp) conforme aparezcan en la conversación.
4. TONO Y RITMO DE RESPUESTA:
   - Español claro, ejecutivo y amable (2 a 4 líneas por respuesta + exactamente 1 pregunta siguiente de alto valor para seguir detallando el gráfico).
   - Incluye 2 a 4 "quick_replies" útiles, contextuales al rubro y al punto exacto de la charla (nunca genéricos si ya conoces su negocio).
5. CONTRATO JSON ESTRICTO:
   - Responde ÚNICAMENTE con un objeto JSON válido (sin markdown ni texto fuera del JSON) que cumpla:
     {
       "assistant_message": string,
       "quick_replies": string[] (2 a 4 opciones naturales para continuar),
       "graph_patch": array de operaciones { "op": ... },
       "completeness_score": number (0..100),
       "phase": "1_context" | "2_roles_steps" | "3_handoffs_data" | "4_gaps_validation" | "5_synthesis",
       "dialogue_state": "discovering_scope" | "clarifying_actors" | "mapping_flow" | "refining_details" | "ready_for_synthesis"
     }
   - Operaciones válidas en "graph_patch":
     * { "op": "set_context", "company_name"?: string, "industry"?: string, "macroprocess_category"?: "estrategico"|"operativo_core"|"soporte", "process_name"?: string }
     * { "op": "add_role", "actor": { "id": "act_..."|"role_...", "name": string, "type": "EXTERNAL_CUSTOMER"|"INTERNAL_ADMIN_ROLE"|"EXTERNAL_PARTNER"|"AUTOMATED_SYSTEM", "is_field_role": boolean } }
     * { "op": "update_role", "id": string, "name"?: string, "type"?: ..., "is_field_role"?: boolean }
     * { "op": "remove_role", "id": string }
     * { "op": "add_step", "step": { "id": "stp_...", "actor_id": string, "label": string, "step_type": "TRIGGER"|"TASK"|"GATEWAY_OR_APPROVAL"|"NOTIFICATION"|"END", "channel": "whatsapp"|"excel_manual"|"cuaderno_papel"|"correo"|"llamada"|"sistema_externo"|"presencial"|"web_portal"|"app_movil", "artifacts": string[], "is_manual_bottleneck": boolean, "automation_opportunity"?: string|null }, "insert_after"?: string, "insert_before"?: string }
     * { "op": "update_step", "id": string, "actor_id"?: string, "label"?: string, "step_type"?: ..., "channel"?: string, "artifacts"?: string[], "is_manual_bottleneck"?: boolean, "automation_opportunity"?: string|null }
     * { "op": "remove_step", "id": string }
     * { "op": "reorder_steps", "step_ids": string[] }
     * { "op": "add_edge", "from": string, "to": string, "condition"?: string|null }
     * { "op": "remove_edge", "from": string, "to": string }
     * { "op": "flag_bottleneck", "step_id": string, "is_manual_bottleneck": boolean, "automation_opportunity"?: string }
     * { "op": "add_artifact", "step_id": string, "artifact": string }
     * { "op": "add_entity", "entity": string }
     * { "op": "add_api", "api": string }`;

// ── Detección de Dominio e Intención Conversacional ───────────────────────────

const DOMAIN_PROFILES = [
  {
    industry: 'logistica_transporte',
    macroprocess: 'operativo_core',
    defaultProcess: 'Recepción, Seguimiento y Despacho de Envíos',
    domainLabel: 'logística y despachos',
    pattern: /(env[ií]o|flete|transporte|carga|encomienda|despach|ruta|reparto|chofer|distribuidor|bulto|flota|delivery)/i,
    suggestedRoles: 'Cliente, Ventas/Recepción, Caja, Almacén y Chofer',
    quickReplies: [
      'Participan Cliente, Ventas, Caja, Almacén y Chofer en ruta',
      'El cliente escribe por WhatsApp pidiendo envío y cotizamos manualmente',
      'Todo inicia cuando entra un pedido mayorista que requiere guía y cobranza'
    ]
  },
  {
    industry: 'restaurante_alimentos',
    macroprocess: 'operativo_core',
    defaultProcess: 'Toma de Pedidos, Cocina y Entrega',
    domainLabel: 'restaurante / alimentos',
    pattern: /(restaurante|poller[ií]a|cafeter[ií]a|panader[ií]a|cocina|mesa|mozo|comanda|plato|men[uú]|pastel)/i,
    suggestedRoles: 'Cliente, Mozo/Caja, Cocina y Repartidor',
    quickReplies: [
      'Atendemos en salón con mozo, pasamos comanda a cocina y cobramos en caja',
      'Recibimos pedidos por WhatsApp y Rappi, cocina prepara y sale el motorizado',
      'El cuello de botella es el cuadre de caja y pedidos duplicados en hora punta'
    ]
  },
  {
    industry: 'servicios_clinica',
    macroprocess: 'operativo_core',
    defaultProcess: 'Agendamiento, Triaje y Atención de Pacientes',
    domainLabel: 'salud / clínica',
    pattern: /(cl[ií]nica|consultorio|m[eé]dic|paciente|cita|agenda|historia|odont|dental|laboratorio|terapia|veterinar)/i,
    suggestedRoles: 'Paciente, Admisión/Recepción, Profesional de Salud y Caja',
    quickReplies: [
      'El paciente pide cita por WhatsApp, Recepción valida horario y pasa al médico',
      'Usamos historias en papel/Word y confirmamos citas manualmente un día antes',
      'Luego de la consulta, Caja cobra y programa el siguiente control'
    ]
  },
  {
    industry: 'taller_automotriz',
    macroprocess: 'operativo_core',
    defaultProcess: 'Recepción de Vehículo, Diagnóstico y Entrega',
    domainLabel: 'taller / servicio técnico',
    pattern: /(taller|mec[aá]nic|veh[ií]cul|auto|mantenimiento|reparaci[oó]n|repuesto|servicio t[eé]cnico|soporte t[eé]cnico)/i,
    suggestedRoles: 'Cliente, Asesor de Servicio, Técnico/Mecánico y Almacén/Caja',
    quickReplies: [
      'Ingresa el vehículo, el asesor abre orden en papel y el técnico diagnostica',
      'Cotizamos repuestos por WhatsApp; si el cliente aprueba, recién reparamos',
      'Al terminar avisamos al cliente y emitimos comprobante en Caja'
    ]
  },
  {
    industry: 'inmobiliaria_proyectos',
    macroprocess: 'operativo_core',
    defaultProcess: 'Captación de Leads, Visitas y Cierre Comercial',
    domainLabel: 'inmobiliaria / proyectos',
    pattern: /(inmobiliaria|propiedad|alquiler|departamento|contrato|lote|obra|construcci[oó]n|arquitect)/i,
    suggestedRoles: 'Prospecto/Cliente, Asesor Comercial, Área Legal y Administración',
    quickReplies: [
      'Llega el lead por web o WhatsApp, el asesor agenda visita y envía proforma',
      'Si el cliente separa, Legal revisa documentos antes de firmar contrato',
      'Llevamos el seguimiento de cuotas y leads en hojas de Excel sueltas'
    ]
  },
  {
    industry: 'comercio_retail',
    macroprocess: 'operativo_core',
    defaultProcess: 'Cotización, Venta y Control de Inventario',
    domainLabel: 'comercio / ventas',
    pattern: /(ferreter|bodega|tienda|venta|comercio|stock|inventario|ecommerce|cat[aá]logo|boleta|factur|mayorista)/i,
    suggestedRoles: 'Cliente, Vendedor, Caja y Almacén',
    quickReplies: [
      'Participan Cliente, Vendedor, Caja y Almacén',
      'El cliente consulta precio/stock, el vendedor verifica en almacén y pasa a caja',
      'Vendemos en mostrador y por WhatsApp pero el stock se descuenta tarde en Excel'
    ]
  },
  {
    industry: 'administracion_finanzas',
    macroprocess: 'soporte',
    defaultProcess: 'Aprobación de Compras, Pagos y Conciliación',
    domainLabel: 'administración y finanzas',
    pattern: /(compra|proveedor|orden de compra|pago|tesorer[ií]a|contab|reembolso|planilla|rrhh|recursos humanos|aprobaci[oó]n)/i,
    suggestedRoles: 'Área Solicitante, Compras, Gerencia/Aprobador y Tesorería',
    quickReplies: [
      'El área pide un requerimiento por correo, Compras cotiza y Gerencia aprueba',
      'Recibimos facturas por correo y validamos contra guía antes de programar pago',
      'Queremos eliminar aprobaciones perdidas en chats de WhatsApp'
    ]
  }
];

function detectDomainProfile(text = '', currentContext = {}) {
  const matched = DOMAIN_PROFILES.find((p) => p.pattern.test(text));
  if (matched) return matched;
  if (currentContext?.industry) {
    const byIndustry = DOMAIN_PROFILES.find((p) => p.industry === currentContext.industry);
    if (byIndustry) return byIndustry;
  }
  return {
    industry: currentContext?.industry || 'servicios_generales',
    macroprocess: currentContext?.macroprocess_category || 'operativo_core',
    defaultProcess: 'Flujo Operativo Principal',
    domainLabel: 'tu operación',
    suggestedRoles: 'Cliente, Atención/Ventas, Operación y Administración',
    quickReplies: [
      'Participan Cliente, Ventas, Operaciones y Caja/Facturación',
      'Todo inicia cuando un cliente escribe por WhatsApp o llega presencialmente',
      'Usamos Excel y WhatsApp para coordinar entre áreas y queremos ordenarlo'
    ]
  };
}

function detectCompanyName(text) {
  const match = text.match(/(?:empresa|negocio|compa[ñn][ií]a|ferreter[ií]a|tienda|cl[ií]nica|restaurante|distribuidora|taller)\s+(?:llamad[oa]\s+)?([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9&.\-\s]{2,34}?)(?=\s*(?:[,.]|donde|que|para|y\s+queremos|sac|eirl|srl|$))/i);
  if (match) {
    return match[1].trim();
  }
  const sacMatch = text.match(/([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9&\-\s]{2,32}\s+(?:SAC|S\.A\.C\.|S\.A\.|SRL|EIRL))/);
  return sacMatch ? sacMatch[1].trim() : null;
}

function extractTopicProcessName(text, fallbackName) {
  const topicMatch = text.match(/(?:proceso|flujo|diagrama|operaci[oó]n|circuito)\s+(?:de\s+)?([a-záéíóúñ0-9\s,\-/]{4,55}?)(?=\s*(?:de\s+mi|en\s+mi|para\s+mi|[.?!]|$))/i);
  if (topicMatch && topicMatch[1]) {
    const raw = topicMatch[1]
      .replace(/^(la|el|los|las)\s+/i, '')
      .replace(/\s+(y\s+)?$/i, '')
      .trim();
    if (raw.length >= 4 && !/^(eso|esto|algo|negocio|empresa)$/i.test(raw)) {
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
  }
  return fallbackName;
}

// ── Detectores de Actores, Canales y Artefactos ─────────────────────────────

const ACTOR_PATTERNS = [
  { id: 'act_cliente', name: 'Cliente', type: 'EXTERNAL_CUSTOMER', is_field_role: false, regex: /(cliente|usuario final|comprador|solicitante|paciente|prospecto)/i },
  { id: 'role_ventas', name: 'Ventas / Atención', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, regex: /(venta|vendedor|asesor|recepci[oó]n|admisi[oó]n|mostrador|atenci[oó]n|cotizador|mozo)/i },
  { id: 'role_caja', name: 'Caja / Facturación', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, regex: /(caja|cajero|cobranza|facturaci[oó]n|tesorer[ií]a|pago)/i },
  { id: 'role_almacen', name: 'Almacén / Inventario', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, regex: /(almac[eé]n|almacenero|inventario|bodega|stock|despacho interno)/i },
  { id: 'role_operaciones', name: 'Operaciones / Producción', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, regex: /(cocina|producci[oó]n|t[eé]cnico|mec[aá]nico|m[eé]dico|doctor|odont[oó]logo|operaciones|taller|preparaci[oó]n)/i },
  { id: 'role_despacho', name: 'Despacho / Ruta', type: 'INTERNAL_ADMIN_ROLE', is_field_role: true, regex: /(chofer|conductor|repartidor|motorizado|delivery|despachador|en ruta|campo|mensajero)/i },
  { id: 'role_gerencia', name: 'Gerencia / Supervisor', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, regex: /(gerencia|gerente|jefe|administrador|supervisor|aprobador|due[ñn]o)/i },
  { id: 'role_compras', name: 'Compras / Proveedores', type: 'EXTERNAL_PARTNER', is_field_role: false, regex: /(compra|proveedor|abastecimiento)/i }
];

function extractMatchingRoles(text) {
  const found = [];
  for (const spec of ACTOR_PATTERNS) {
    if (spec.regex.test(text)) {
      found.push({
        id: spec.id,
        name: spec.name,
        type: spec.type,
        is_field_role: spec.is_field_role
      });
    }
  }
  return found;
}

function inferChannel(text) {
  if (/whatsapp|wsp|chat|telegram/i.test(text)) return 'whatsapp';
  if (/excel|hoja de c[aá]lculo|sheets/i.test(text)) return 'excel_manual';
  if (/cuaderno|papel|libreta|talonario|f[ií]sico|impreso|manualmente/i.test(text)) return 'cuaderno_papel';
  if (/sunat|boleta|factura|erp|sistema|pos|crm/i.test(text)) return 'sistema_externo';
  if (/correo|email|gmail|outlook/i.test(text)) return 'correo';
  if (/llamada|tel[eé]fono/i.test(text)) return 'llamada';
  if (/app|m[oó]vil|celular/i.test(text)) return 'app_movil';
  if (/web|formulario|portal/i.test(text)) return 'web_portal';
  return 'presencial';
}

function inferStepType(text, existingStepCount, idx, totalClauses) {
  if (/(aprob|valid|verific|revis|chequ|autoriz|confirma.*pago|evalu|si\s+hay\s+stock|depende)/i.test(text)) {
    return 'GATEWAY_OR_APPROVAL';
  }
  if (/(avis|notific|alerta|env[ií]a.*foto|responde|confirma.*cliente)/i.test(text)) {
    return 'NOTIFICATION';
  }
  if (existingStepCount === 0 && idx === 0) return 'TRIGGER';
  if (idx === totalClauses - 1 && /(entreg.*destino|cierre|finaliz|concluy|archivo\s+final|termina)/i.test(text)) {
    return 'END';
  }
  return 'TASK';
}

function inferArtifactsAndEntities(text) {
  const artifacts = [];
  const entities = [];
  const apis = [];

  if (/pedido|orden|solicitud|requerimiento|comanda/i.test(text)) {
    artifacts.push('orden_pedido');
    entities.push('OrdenPedido');
  }
  if (/cotizaci[oó]n|proforma|presupuesto|tarifa/i.test(text)) {
    artifacts.push('cotizacion');
    entities.push('Cotizacion');
  }
  if (/ruc|dni|boleta|factura|comprobante|yape|plin|pago/i.test(text)) {
    artifacts.push('comprobante_pago');
    entities.push('ComprobantePago');
    apis.push('validacion_ruc_dni');
  }
  if (/gu[ií]a|remisi[oó]n|etiqueta|bulto/i.test(text)) {
    artifacts.push('guia_despacho');
    entities.push('GuiaDespacho');
  }
  if (/foto|firma|evidencia|conformidad/i.test(text)) {
    artifacts.push('evidencia_entrega');
    entities.push('EvidenciaEntrega');
    apis.push('almacenamiento_cloud');
  }
  if (/stock|inventario|almac[eé]n|producto/i.test(text)) {
    artifacts.push('registro_stock');
    entities.push('ProductoStock');
  }
  if (/whatsapp|mensaje|aviso/i.test(text)) {
    apis.push('notificaciones_whatsapp');
  }
  if (/historial|seguimiento|reporte|auditor[ií]a/i.test(text)) {
    apis.push('historial_ilimitado');
  }

  return { artifacts, entities, apis };
}

function inferBottleneck(text, channel) {
  const isManual =
    channel === 'excel_manual' ||
    channel === 'cuaderno_papel' ||
    /(manual|demora|pierde|demasiado tiempo|error|duplic|desorden|retrasa|a mano|doble|en papel)/i.test(text);

  if (!isManual) return { isManual: false, opportunity: null };

  if (channel === 'excel_manual') {
    return { isManual: true, opportunity: 'Reemplazar hoja Excel manual por formulario digital centralizado' };
  }
  if (channel === 'cuaderno_papel') {
    return { isManual: true, opportunity: 'Digitalizar registro físico con trazabilidad y alertas en tiempo real' };
  }
  return { isManual: true, opportunity: 'Automatizar traspaso y validación entre áreas para eliminar reprocesos' };
}

// ── Clasificador Conversacional de Intención (Fallback Inteligente) ───────────

const META_INTENT_REGEX =
  /^(?:hola|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|hey|saludos|qué\s+tal|que\s+tal|ay[uú]dame|necesito|quiero|quisiera|vamos\s+a|me\s+gustar[ií]a|estoy\s+buscando|deseo)\b/i;

const DIAGRAM_VERB_REGEX =
  /\b(graficar|diagramar|mapear|dibujar|hacer\s+(?:un|el)\s+(?:diagrama|flujo|mapa|proceso)|armar\s+(?:el|un)\s+(?:flujo|proceso|diagrama)|modelar|documentar|ordenar)\b/i;

const ACTION_SEQUENCE_REGEX =
  /\b(?:cuando|primero|luego|despu[eé]s|entonces|(?:recib|solicit|pide|pidi|escrib|env[ií]|registr|anot|pas|valid|verific|cobr|emit|prepar|despach|entreg|aprueb|aprob|rechaz|compr|agend|atiend|atend|ingres|gener|sub|descarg|cotiz|confirm|revis|calcul|factur)[a-záéíóúñ]*)\b/i;

const EDIT_COMMAND_REGEX =
  /\b(elimina|borra|quita|sacar|saca|cambia|renombra|corrige|actualiza|edita)\b/i;

const GRAPH_QUESTION_REGEX =
  /(\?|qu[eé]\s+cuellos|qu[eé]\s+falta|c[oó]mo\s+ves|qu[eé]\s+sistema|recomiendas|resumen|explica|para\s+qu[eé]\s+sirve|c[oó]mo\s+funciona)/i;

function isConversationalScopeOpener(userMessage, existingStepsCount) {
  const clean = userMessage.trim();
  const wordCount = clean.split(/\s+/).length;

  // Saludo puro o mensaje muy corto
  if (wordCount <= 4 && /^(hola|buenas|buenos|hey|ok|listo|empecemos|si|sí|dale|claro)/i.test(clean)) {
    return true;
  }

  // Declaración de intención: "Quiero graficar X", "Necesito mapear mi proceso de Y" sin describir pasos concretos todavía
  if (
    (META_INTENT_REGEX.test(clean) || DIAGRAM_VERB_REGEX.test(clean)) &&
    !ACTION_SEQUENCE_REGEX.test(clean) &&
    existingStepsCount === 0
  ) {
    return true;
  }

  // Incluso si hay algo escrito antes, si dice explícitamente "quiero graficar X" sin secuencia de acciones
  if (DIAGRAM_VERB_REGEX.test(clean) && !ACTION_SEQUENCE_REGEX.test(clean)) {
    return true;
  }

  return false;
}

const INTRO_ACTOR_CLAUSE_REGEX = /^(?:participan|intervienen|somos|involucrados|los\s+roles\s+son|y\s+también)\b/i;

function splitClauses(userMessage) {
  return userMessage
    .split(/(?:\.|;|\n|\s+y\s+(?:luego|despu[eé]s|finalmente|por\s+[uú]ltimo)\s+|\s*,\s*(?=(?:luego|despu[eé]s|entonces|finalmente|el\s+cliente|la\s+clienta|el\s+vendedor|vendedor\s+\w+|ventas\s+\w+|recepci[oó]n\s+\w+|caja\s+\w+|almac[eé]n\s+\w+|chofer\s+\w+|cocina\s+\w+|gerencia\s+\w+|compras\s+\w+))|\s+luego\s+|\s+despu[eé]s\s+|\s*->\s*)/i)
    .map((s) => s.replace(/^(?:primero|luego|despu[eé]s|entonces|finalmente|por\s+[uú]ltimo|y\s+también)\s+/i, '').trim())
    .filter((s) => s.length >= 6);
}

function summarizeActionLabel(clause) {
  let clean = clause
    .replace(/^(?:adem[aá]s\s*,?\s*|tambi[eé]n\s*,?\s*)/i, '')
    .replace(/^(?:agrega|a[ñn]ade|suma|pon|incluye|coloca|mete)\s+(?:al|a\s+la|a\s+los|a)?\s*(?:[a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)\s+(?:que\s+|para\s+que\s+|para\s+)?/i, '')
    .replace(/\b(?:despu[eé]s\s+de|antes\s+de)\s+[a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?/gi, '')
    .replace(/^(?:el\s+cliente|la\s+clienta|ventas|recepci[oó]n|caja|almac[eé]n|el\s+chofer|chofer|cocina|el\s+vendedor|vendedor|gerencia|el\s+[aá]rea)\s+/i, '')
    .replace(/^,\s*|\s*,$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (!clean) clean = clause.trim();
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  if (clean.length > 68) {
    clean = `${clean.slice(0, 65).trim()}...`;
  }
  return clean;
}

function computeCompleteness(graph) {
  let score = 8;
  if (graph.business_context?.process_name && graph.business_context.process_name !== 'Operación por mapear') {
    score += 10;
  }
  if ((graph.actors || []).length >= 2) score += 14;
  else if ((graph.actors || []).length === 1) score += 7;

  const stepScore = Math.min(36, (graph.steps || []).length * 6);
  score += stepScore;

  if ((graph.transitions || []).length >= 3) score += 12;
  else if ((graph.transitions || []).length >= 1) score += 6;

  const hasBottleneck = (graph.steps || []).some((s) => s.is_manual_bottleneck);
  if (hasBottleneck) score += 10;
  const hasGatewayOrEnd = (graph.steps || []).some(
    (s) => s.step_type === 'GATEWAY_OR_APPROVAL' || s.step_type === 'END'
  );
  if (hasGatewayOrEnd) score += 10;

  return Math.min(100, Math.round(score));
}

function computePhase(graph, score) {
  const stepCount = (graph.steps || []).length;
  const roleCount = (graph.actors || []).length;
  if (stepCount === 0 && roleCount <= 1) return '1_context';
  if (stepCount < 2 || roleCount < 2) return '2_roles_steps';
  if (score < 70) return '3_handoffs_data';
  if (score < 88) return '4_gaps_validation';
  return '5_synthesis';
}

// ── Extractor Conversacional de Respaldo (Intent-Aware Fallback) ─────────────

export function runDeterministicProcessExtractor(
  userMessage,
  currentGraph,
  turnCount = 1,
  conversationHistory = []
) {
  const cleanMsg = String(userMessage || '').trim();
  const patches = [];
  const profile = detectDomainProfile(
    `${cleanMsg} ${conversationHistory.map((m) => m.content || '').join(' ')}`,
    currentGraph.business_context
  );
  const existingSteps = currentGraph?.steps || [];
  const existingActors = currentGraph?.actors || [];

  const mentionedCompany = detectCompanyName(cleanMsg);
  const detectedTopic = extractTopicProcessName(cleanMsg, profile.defaultProcess);

  const shouldSetContext =
    mentionedCompany ||
    currentGraph?.business_context?.process_name === 'Operación por mapear' ||
    DIAGRAM_VERB_REGEX.test(cleanMsg);

  if (shouldSetContext) {
    patches.push({
      op: 'set_context',
      company_name: mentionedCompany || currentGraph.business_context?.company_name || '',
      industry: profile.industry,
      macroprocess_category: profile.macroprocess,
      process_name: detectedTopic
    });
  }

  // 1. Consulta o pregunta analítica sobre el flujo existente (sin inventar pasos)
  if (
    GRAPH_QUESTION_REGEX.test(cleanMsg) &&
    !ACTION_SEQUENCE_REGEX.test(cleanMsg) &&
    !DIAGRAM_VERB_REGEX.test(cleanMsg)
  ) {
    const score = computeCompleteness(currentGraph);
    const phase = computePhase(currentGraph, score);
    const bottlenecks = existingSteps.filter((s) => s.is_manual_bottleneck);

    let reply;
    if (existingSteps.length === 0) {
      reply =
        'Primero conversemos qué proceso quieres mapear, qué áreas participan y cómo arranca una solicitud real. Con eso iré dibujando cada carril y actividad sin inventar pasos.';
    } else if (/cuello|demora|problema|mejor/i.test(cleanMsg)) {
      reply =
        bottlenecks.length > 0
          ? `Hasta ahora detecté ${bottlenecks.length} cuello(s) manual(es), por ejemplo "${bottlenecks[0].label}". ¿En qué otro paso sientes que se repiten datos en Excel, papel o WhatsApp?`
          : `Llevamos ${existingSteps.length} pasos en ${existingActors.length} carriles y aún no marcamos fricciones manuales. ¿En cuál de estos pasos suelen digitar datos dos veces o esperar confirmación?`;
    } else {
      reply = `Actualmente tenemos ${existingActors.length} roles y ${existingSteps.length} pasos mapeados para "${currentGraph.business_context?.process_name || 'tu flujo'}". ¿Quieres agregar más detalle, una validación o corregir algún paso?`;
    }

    return {
      assistant_message: reply,
      quick_replies: existingSteps.length === 0
        ? profile.quickReplies
        : [
            'Quiero agregar una validación cuando no hay stock o pago',
            'Hay un paso manual en Excel o WhatsApp que nos retrasa',
            'El flujo ya está completo, revisemos los artefactos finales'
          ],
      graph_patch: patches,
      completeness_score: score,
      phase,
      dialogue_state: existingSteps.length === 0 ? 'discovering_scope' : 'refining_details',
      engine_source: 'conversational_fallback'
    };
  }

  // 2. Comando explícito de eliminación de paso en chat
  if (EDIT_COMMAND_REGEX.test(cleanMsg) && /\b(paso|actividad|nodo|carril|rol)\b/i.test(cleanMsg)) {
    const stepNumMatch = cleanMsg.match(/paso\s*#?\s*(\d+)/i);
    if (stepNumMatch && existingSteps.length > 0) {
      const idx = Number(stepNumMatch[1]) - 1;
      const targetStep = existingSteps[idx];
      if (targetStep) {
        patches.push({ op: 'remove_step', id: targetStep.id });
        const simulated = {
          ...currentGraph,
          steps: existingSteps.filter((s) => s.id !== targetStep.id)
        };
        const score = computeCompleteness(simulated);
        return {
          assistant_message: `Listo, quité el paso #${idx + 1} ("${targetStep.label}") del diagrama. ¿Qué paso debería ir en su lugar o cómo seguimos?`,
          quick_replies: [
            'Agrega qué ocurre después del paso anterior',
            'Cambia el rol responsable del siguiente paso',
            'Continuemos con el cierre del proceso'
          ],
          graph_patch: patches,
          completeness_score: score,
          phase: computePhase(simulated, score),
          dialogue_state: 'refining_details',
          engine_source: 'conversational_fallback'
        };
      }
    }
  }

  // 3. Apertura conversacional / Declaración de intención ("Quiero graficar las ventas de mi negocio")
  if (isConversationalScopeOpener(cleanMsg, existingSteps.length)) {
    const mentionedRoles = extractMatchingRoles(cleanMsg);
    mentionedRoles.forEach((role) => {
      patches.push({ op: 'add_role', actor: role });
    });

    const isPureGreeting = cleanMsg.split(/\s+/).length <= 4 && /^(hola|buenas|buenos|hey|saludos)/i.test(cleanMsg);
    const processLabel = detectedTopic || profile.defaultProcess;
    const simulatedGraph = {
      ...currentGraph,
      business_context: {
        ...currentGraph.business_context,
        company_name: mentionedCompany || currentGraph.business_context?.company_name || '',
        industry: profile.industry,
        process_name: processLabel
      },
      actors: [...existingActors, ...mentionedRoles.filter((r) => !existingActors.some((a) => a.id === r.id))]
    };
    const score = computeCompleteness(simulatedGraph);

    const assistantMessage = isPureGreeting
      ? '¡Hola! Soy FORMALIA. Antes de dibujar nada en el lienzo, cuéntame qué proceso de tu negocio quieres diagramar (por ejemplo ventas, compras, despachos o atención a clientes).'
      : mentionedRoles.length >= 2
        ? `¡Perfecto! Entiendo que vamos a diagramar "${processLabel}" (${profile.domainLabel}) y ya abrí carriles base para ${mentionedRoles.map((r) => r.name).join(', ')}. ¿Cómo arranca el primer paso real cuando llega un cliente o solicitud?`
        : `¡Entendido! Vamos a diseñar juntos el mapa de "${processLabel}" para ${profile.domainLabel}. Antes de colocar la primera caja, ¿qué áreas o roles participan normalmente y cómo llega la primera solicitud?`;

    return {
      assistant_message: assistantMessage,
      quick_replies: profile.quickReplies,
      graph_patch: patches,
      completeness_score: score,
      phase: '1_context',
      dialogue_state: mentionedRoles.length > 0 ? 'clarifying_actors' : 'discovering_scope',
      engine_source: 'conversational_fallback'
    };
  }

  // 4. Turno donde solo enumeran roles ("Participan cliente, vendedor, caja y almacén")
  const explicitRoles = extractMatchingRoles(cleanMsg);
  const hasVerbsOrActions = ACTION_SEQUENCE_REGEX.test(cleanMsg);
  if (explicitRoles.length >= 2 && !hasVerbsOrActions && cleanMsg.split(/\s+/).length <= 22) {
    explicitRoles.forEach((role) => patches.push({ op: 'add_role', actor: role }));
    const mergedActors = [
      ...existingActors,
      ...explicitRoles.filter((r) => !existingActors.some((a) => a.id === r.id))
    ];
    const simulated = { ...currentGraph, actors: mergedActors };
    const score = computeCompleteness(simulated);

    return {
      assistant_message: `Excelente, dejé listos ${mergedActors.length} carriles (${mergedActors.map((a) => a.name).join(', ')}). Ahora cuéntame el inicio real del flujo: ¿quién da el primer paso, por qué canal entra y qué hace con esa información?`,
      quick_replies: profile.quickReplies.slice(1).concat([
        'El cliente escribe por WhatsApp y Ventas registra el pedido en Excel'
      ]).slice(0, 3),
      graph_patch: patches,
      completeness_score: score,
      phase: '2_roles_steps',
      dialogue_state: 'clarifying_actors',
      engine_source: 'conversational_fallback'
    };
  }

  // 5. Descripción concreta de pasos, traspasos, canales y excepciones
  const clauses = splitClauses(cleanMsg);
  const existingActorIds = new Set(existingActors.map((a) => a.id));
  const stepCounterStart = existingSteps.length;
  let lastStepId = existingSteps.length > 0 ? existingSteps[existingSteps.length - 1].id : null;
  const addedSteps = [];

  if (explicitRoles.length === 0 && existingActors.length === 0) {
    patches.push({
      op: 'add_role',
      actor: { id: 'role_operaciones', name: 'Operaciones', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false }
    });
    existingActorIds.add('role_operaciones');
  } else {
    explicitRoles.forEach((role) => {
      const resolved = resolveOrReuseActor(role, existingActors);
      if (resolved && !existingActorIds.has(resolved.id)) {
        patches.push({ op: 'add_role', actor: resolved });
        existingActorIds.add(resolved.id);
      }
    });
  }

function resolveOrReuseActor(spec, existingActors = []) {
  if (!spec) return null;
  const keywordMap = [
    { match: /(cliente|comprador|paciente|prospecto)/i, specId: 'act_cliente' },
    { match: /(venta|vendedor|asesor|recepci[oó]n|atenci[oó]n|mozo)/i, specId: 'role_ventas' },
    { match: /(caja|cajero|cobranza|facturaci[oó]n|tesorer[ií]a)/i, specId: 'role_caja' },
    { match: /(almac[eé]n|almacenero|inventario|bodega|stock)/i, specId: 'role_almacen' },
    { match: /(chofer|conductor|repartidor|motorizado|delivery|despacho|ruta)/i, specId: 'role_despacho' },
    { match: /(geren|jefe|administrador|supervisor)/i, specId: 'role_gerencia' },
    { match: /(compra|proveedor)/i, specId: 'role_compras' }
  ];

  // Reutilizar un carril ya creado por el LLM si coincide semánticamente (evita duplicados)
  for (const entry of keywordMap) {
    if (entry.specId === spec.id) {
      const existing = existingActors.find((a) => entry.match.test(a.name || '') || a.id === spec.id);
      if (existing) return existing;
    }
  }
  return spec;
}

  const actionableClauses = clauses.filter((c) => {
    const cleanClause = c.replace(/^y\s+/i, '').trim();
    const words = cleanClause.split(/\s+/).length;
    if (words < 2) return false;
    if (INTRO_ACTOR_CLAUSE_REGEX.test(cleanClause)) return false;
    if (META_INTENT_REGEX.test(cleanClause) && !ACTION_SEQUENCE_REGEX.test(cleanClause)) return false;
    return ACTION_SEQUENCE_REGEX.test(cleanClause) || words >= 5;
  });

  if (actionableClauses.length > 0) {
    actionableClauses.forEach((clause, cIdx) => {
      const clauseRoles = extractMatchingRoles(clause);
      let targetActor = resolveOrReuseActor(clauseRoles[0], existingActors);

      if (!targetActor && cIdx === 0 && /cliente|nos\s+escrib|pide|solicit/i.test(clause)) {
        targetActor = resolveOrReuseActor(
          { id: 'act_cliente', name: 'Cliente', type: 'EXTERNAL_CUSTOMER', is_field_role: false },
          existingActors
        );
      } else if (!targetActor) {
        targetActor =
          resolveOrReuseActor(explicitRoles[0], existingActors) ||
          existingActors[0] ||
          { id: 'role_operaciones', name: 'Operaciones', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false };
      }

      if (!existingActorIds.has(targetActor.id)) {
        patches.push({ op: 'add_role', actor: targetActor });
        existingActorIds.add(targetActor.id);
      }

      const channel = inferChannel(clause);
      const stepType = inferStepType(clause, stepCounterStart + cIdx, cIdx, actionableClauses.length);
      const bottleneck = inferBottleneck(clause, channel);
      const { artifacts, entities, apis } = inferArtifactsAndEntities(clause);

      entities.forEach((entity) => patches.push({ op: 'add_entity', entity }));
      apis.forEach((api) => patches.push({ op: 'add_api', api }));

      const stepId = `stp_${stepCounterStart + addedSteps.length + 1}_${turnCount}`;
      const label = summarizeActionLabel(clause);

      const newStep = {
        id: stepId,
        actor_id: targetActor.id,
        label,
        step_type: stepType,
        channel,
        artifacts,
        is_manual_bottleneck: bottleneck.isManual,
        automation_opportunity: bottleneck.opportunity
      };

      patches.push({ op: 'add_step', step: newStep });
      addedSteps.push(newStep);

      if (lastStepId) {
        let condition = null;
        if (/si\s+(?:no\s+hay|falta|rechaz)/i.test(clause)) condition = 'Excepción / Falta requisito';
        else if (/si\s+(?:aprueba|hay|confirma|paga)/i.test(clause)) condition = 'Condición aprobada';
        else if (/pag[oa]/i.test(clause)) condition = 'Pago verificado';
        else if (/stock|almac[eé]n/i.test(clause)) condition = 'Orden validada';

        patches.push({ op: 'add_edge', from: lastStepId, to: stepId, condition });
      }
      lastStepId = stepId;
    });
  }

  // Simular grafo para calcular score y siguiente pregunta natural
  const totalStepsAfter = existingSteps.length + addedSteps.length;
  const simulatedGraph = {
    ...currentGraph,
    business_context: { ...currentGraph.business_context, industry: profile.industry, process_name: detectedTopic },
    actors: Array.from(existingActorIds).map((id) => ({ id })),
    steps: [...existingSteps, ...addedSteps],
    transitions: new Array(Math.max(0, totalStepsAfter - 1)).fill({})
  };

  const completenessScore = computeCompleteness(simulatedGraph);
  const nextPhase = computePhase(simulatedGraph, completenessScore);

  let assistantMessage;
  let quickReplies;

  if (addedSteps.length === 0) {
    assistantMessage =
      'Tomo nota. Para ubicar la actividad correcta en el diagrama, cuéntame exactamente qué hace un rol en ese momento (por ejemplo quién atiende el pedido y en qué herramienta lo registra).';
    quickReplies = profile.quickReplies;
  } else if (nextPhase === '2_roles_steps') {
    assistantMessage = `Agregué "${addedSteps[addedSteps.length - 1].label}" al flujo. ¿Qué rol toma la posta inmediatamente después y qué canal usan (WhatsApp, Excel, sistema o papel)?`;
    quickReplies = [
      'Pasa a Caja para validar el pago y emitir boleta/factura',
      'Almacén revisa el stock manualmente antes de preparar el pedido',
      'Aprobación pendiente por WhatsApp de Gerencia antes de avanzar'
    ];
  } else if (nextPhase === '3_handoffs_data') {
    assistantMessage = `Vamos dando forma al flujo (${totalStepsAfter} pasos). ¿Existe alguna validación crítica (stock, crédito, aprobación) o algún caso donde el pedido retroceda o se rechace?`;
    quickReplies = [
      'Si no hay stock se avisa al cliente o se pide reposición a Compras',
      'Lo más lento hoy es pasar los datos del WhatsApp al Excel sin errores',
      'Al final despachamos con guía y enviamos foto de entrega por WhatsApp'
    ];
  } else if (nextPhase === '4_gaps_validation') {
    assistantMessage = `El diagrama va muy completo (${completenessScore}%). ¿Cómo se cierra formalmente este proceso y qué paso sientes que te consume más tiempo manual hoy?`;
    quickReplies = [
      'Termina cuando el cliente confirma recepción con foto y boleta',
      'El mayor cuello de botella es conciliar los pagos y el inventario al final del día',
      'Ya refleja nuestra operación real; revisemos la exportación técnica'
    ];
  } else {
    assistantMessage = `¡Excelente! Tu mapa de procesos está listo al ${completenessScore}% con roles, validaciones y puntos de mejora. Puedes seguir ajustando cualquier paso aquí o pasar a exportar / cotizar el sistema.`;
    quickReplies = [
      'Agrega un paso adicional de seguimiento post-venta',
      '¿Qué módulos de software cubrirían los cuellos detectados?',
      'Explícame el resumen para pasar al Cotizador'
    ];
  }

  return {
    assistant_message: assistantMessage,
    quick_replies: quickReplies.slice(0, 4),
    graph_patch: patches,
    completeness_score: completenessScore,
    phase: nextPhase,
    dialogue_state: totalStepsAfter >= 4 ? 'ready_for_synthesis' : 'mapping_flow',
    engine_source: 'conversational_fallback'
  };
}

// ── Resolución de API Keys en Servidor / Dev ─────────────────────────────────

function readServerEnv(name) {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return String(process.env[name]).trim();
    }
  } catch {
    return '';
  }
  return '';
}

function getGeminiApiKey() {
  // Solo secretos de servidor (Vercel Serverless Node Runtime — nunca exponer en bundle cliente)
  return (
    readServerEnv('GEMINI_API_KEY') ||
    readServerEnv('GOOGLE_API_KEY') ||
    readServerEnv('GOOGLE_GENERATIVE_AI_API_KEY') ||
    readServerEnv('VITE_GEMINI_API_KEY')
  );
}

function getOpenAiCompatibleConfig() {
  const openAiKey = readServerEnv('OPENAI_API_KEY');
  if (openAiKey) {
    return {
      provider: 'openai',
      apiKey: openAiKey,
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: readServerEnv('OPENAI_MODEL') || 'gpt-4o-mini'
    };
  }
  const deepseekKey = readServerEnv('DEEPSEEK_API_KEY');
  if (deepseekKey) {
    return {
      provider: 'deepseek',
      apiKey: deepseekKey,
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat'
    };
  }
  return null;
}

// ── Normalización Tolerante del JSON devuelto por el LLM ─────────────────────

const VALID_MACROPROCESS = new Set(['estrategico', 'operativo_core', 'soporte']);
const VALID_ACTOR_TYPES = new Set(['EXTERNAL_CUSTOMER', 'INTERNAL_ADMIN_ROLE', 'EXTERNAL_PARTNER', 'AUTOMATED_SYSTEM']);
const VALID_STEP_TYPES = new Set(['TRIGGER', 'TASK', 'GATEWAY_OR_APPROVAL', 'NOTIFICATION', 'END']);
const VALID_PHASES = new Set(['1_context', '2_roles_steps', '3_handoffs_data', '4_gaps_validation', '5_synthesis']);
const VALID_DIALOGUE_STATES = new Set(['discovering_scope', 'clarifying_actors', 'mapping_flow', 'refining_details', 'ready_for_synthesis']);

function sanitizeExtractorPayload(rawObj, currentGraph) {
  const safe = rawObj && typeof rawObj === 'object' ? { ...rawObj } : {};

  if (typeof safe.assistant_message !== 'string' || !safe.assistant_message.trim()) {
    throw new Error('Respuesta LLM sin assistant_message');
  }
  safe.assistant_message = safe.assistant_message.trim();

  const rawReplies = Array.isArray(safe.quick_replies) ? safe.quick_replies : [];
  const cleanReplies = rawReplies
    .map((r) => String(r || '').trim())
    .filter(Boolean)
    .slice(0, 4);
  safe.quick_replies = cleanReplies.length > 0
    ? cleanReplies
    : [
        'Continuemos detallando el siguiente paso',
        'Quiero agregar un rol o validación',
        '¿Qué cuellos de botella ves hasta ahora?'
      ];

  const numericScore = Number(String(safe.completeness_score ?? '').replace(/[^\d.]/g, ''));
  safe.completeness_score = Number.isFinite(numericScore)
    ? Math.min(100, Math.max(0, Math.round(numericScore)))
    : computeCompleteness(currentGraph);

  if (safe.phase && !VALID_PHASES.has(safe.phase)) {
    delete safe.phase;
  }
  if (safe.dialogue_state && !VALID_DIALOGUE_STATES.has(safe.dialogue_state)) {
    delete safe.dialogue_state;
  }

  const rawPatches = Array.isArray(safe.graph_patch) ? safe.graph_patch : [];
  const normalizedPatches = [];

  for (const p of rawPatches) {
    if (!p || typeof p !== 'object' || !p.op) continue;
    switch (p.op) {
      case 'set_context':
        normalizedPatches.push({
          op: 'set_context',
          ...(p.company_name != null ? { company_name: String(p.company_name) } : {}),
          ...(p.industry ? { industry: String(p.industry) } : {}),
          ...(VALID_MACROPROCESS.has(p.macroprocess_category) ? { macroprocess_category: p.macroprocess_category } : {}),
          ...(p.process_name ? { process_name: String(p.process_name) } : {})
        });
        break;
      case 'add_role':
        if (p.actor?.id && p.actor?.name) {
          normalizedPatches.push({
            op: 'add_role',
            actor: {
              id: String(p.actor.id),
              name: String(p.actor.name),
              type: VALID_ACTOR_TYPES.has(p.actor.type) ? p.actor.type : 'INTERNAL_ADMIN_ROLE',
              is_field_role: Boolean(p.actor.is_field_role)
            }
          });
        }
        break;
      case 'update_role':
        if (p.id) {
          normalizedPatches.push({
            op: 'update_role',
            id: String(p.id),
            ...(p.name ? { name: String(p.name) } : {}),
            ...(VALID_ACTOR_TYPES.has(p.type) ? { type: p.type } : {}),
            ...(p.is_field_role !== undefined ? { is_field_role: Boolean(p.is_field_role) } : {})
          });
        }
        break;
      case 'remove_role':
        if (p.id) normalizedPatches.push({ op: 'remove_role', id: String(p.id) });
        break;
      case 'add_step':
        if (p.step?.id && p.step?.label) {
          normalizedPatches.push({
            op: 'add_step',
            step: {
              id: String(p.step.id),
              actor_id: String(p.step.actor_id || 'role_operaciones'),
              label: String(p.step.label),
              step_type: VALID_STEP_TYPES.has(p.step.step_type) ? p.step.step_type : 'TASK',
              channel: String(p.step.channel || 'presencial'),
              artifacts: Array.isArray(p.step.artifacts) ? p.step.artifacts.map(String) : [],
              is_manual_bottleneck: Boolean(p.step.is_manual_bottleneck),
              automation_opportunity: p.step.automation_opportunity ? String(p.step.automation_opportunity) : null
            },
            ...(p.insert_after ? { insert_after: String(p.insert_after) } : {}),
            ...(p.insert_before ? { insert_before: String(p.insert_before) } : {})
          });
        }
        break;
      case 'update_step':
        if (p.id) {
          normalizedPatches.push({
            op: 'update_step',
            id: String(p.id),
            ...(p.actor_id ? { actor_id: String(p.actor_id) } : {}),
            ...(p.label ? { label: String(p.label) } : {}),
            ...(VALID_STEP_TYPES.has(p.step_type) ? { step_type: p.step_type } : {}),
            ...(p.channel ? { channel: String(p.channel) } : {}),
            ...(Array.isArray(p.artifacts) ? { artifacts: p.artifacts.map(String) } : {}),
            ...(p.is_manual_bottleneck !== undefined ? { is_manual_bottleneck: Boolean(p.is_manual_bottleneck) } : {}),
            ...(p.automation_opportunity !== undefined
              ? { automation_opportunity: p.automation_opportunity ? String(p.automation_opportunity) : null }
              : {})
          });
        }
        break;
      case 'remove_step':
        if (p.id) normalizedPatches.push({ op: 'remove_step', id: String(p.id) });
        break;
      case 'reorder_steps':
        if (Array.isArray(p.step_ids)) {
          normalizedPatches.push({ op: 'reorder_steps', step_ids: p.step_ids.map(String) });
        }
        break;
      case 'add_edge':
        if (p.from && p.to) {
          normalizedPatches.push({
            op: 'add_edge',
            from: String(p.from),
            to: String(p.to),
            condition: p.condition != null ? String(p.condition) : null
          });
        }
        break;
      case 'remove_edge':
        if (p.from && p.to) {
          normalizedPatches.push({ op: 'remove_edge', from: String(p.from), to: String(p.to) });
        }
        break;
      case 'flag_bottleneck':
        if (p.step_id) {
          normalizedPatches.push({
            op: 'flag_bottleneck',
            step_id: String(p.step_id),
            is_manual_bottleneck: p.is_manual_bottleneck ?? true,
            ...(p.automation_opportunity ? { automation_opportunity: String(p.automation_opportunity) } : {})
          });
        }
        break;
      case 'add_artifact':
        if (p.step_id && p.artifact) {
          normalizedPatches.push({ op: 'add_artifact', step_id: String(p.step_id), artifact: String(p.artifact) });
        }
        break;
      case 'add_entity':
        if (p.entity) normalizedPatches.push({ op: 'add_entity', entity: String(p.entity) });
        break;
      case 'add_api':
        if (p.api) normalizedPatches.push({ op: 'add_api', api: String(p.api) });
        break;
      default:
        break;
    }
  }

  safe.graph_patch = normalizedPatches;
  return ExtractorResponseSchema.parse(safe);
}

function buildConversationContents(conversationHistory = [], userMessage, currentGraph, turnCount) {
  const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-12) : [];
  const geminiContents = [];

  for (const msg of recentHistory) {
    if (!msg || !msg.content) continue;
    const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
    // Fusionar si dos turnos seguidos tuvieran el mismo rol para cumplir intercalado estricto de Gemini
    if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === role) {
      geminiContents[geminiContents.length - 1].parts[0].text += `\n${msg.content}`;
    } else {
      geminiContents.push({
        role,
        parts: [{ text: String(msg.content) }]
      });
    }
  }

  // Gemini requiere que la secuencia no empiece o termine mal; si el último fue 'user' por duplicado, evitar duplicarlo
  const graphContextBlock = [
    `[ESTADO ACTUAL DEL GRAFO — Turno ${turnCount}/15]`,
    JSON.stringify(currentGraph),
    ``,
    `[MENSAJE ACTUAL DEL USUARIO]`,
    userMessage,
    ``,
    `Responde conversacionalmente en español y devuelve el JSON con graph_patch incremental (sin inventar pasos si el usuario solo te indicó qué tema quiere diagramar o hizo una consulta).`
  ].join('\n');

  if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === 'user') {
    const lastText = geminiContents[geminiContents.length - 1].parts[0].text.trim();
    if (lastText === userMessage.trim()) {
      geminiContents[geminiContents.length - 1].parts[0].text = graphContextBlock;
    } else {
      geminiContents[geminiContents.length - 1].parts[0].text += `\n\n${graphContextBlock}`;
    }
  } else {
    geminiContents.push({
      role: 'user',
      parts: [{ text: graphContextBlock }]
    });
  }

  return geminiContents;
}

function maskApiFingerprint(key = '') {
  const clean = String(key || '').trim();
  if (!clean) return '';
  if (clean.length <= 10) return `${clean.slice(0, 3)}••••`;
  return `${clean.slice(0, 5)}••••${clean.slice(-4)}`;
}

function readOpenAiRateLimitHeaders(res) {
  if (!res?.headers) return {};
  const headers = {
    limit_requests: res.headers.get('x-ratelimit-limit-requests'),
    remaining_requests: res.headers.get('x-ratelimit-remaining-requests'),
    limit_tokens: res.headers.get('x-ratelimit-limit-tokens'),
    remaining_tokens: res.headers.get('x-ratelimit-remaining-tokens'),
    reset_requests: res.headers.get('x-ratelimit-reset-requests')
  };
  return Object.fromEntries(Object.entries(headers).filter(([, v]) => Boolean(v)));
}

async function callGeminiConversational({ apiKey, userMessage, currentGraph, turnCount, conversationHistory }) {
  const candidates = [
    { model: 'gemini-flash-lite-latest', extraConfig: {} },
    { model: 'gemini-3-flash-preview', extraConfig: { thinkingConfig: { thinkingLevel: 'minimal' } } },
    { model: 'gemini-3.1-flash-lite-preview', extraConfig: {} }
  ];
  const contents = buildConversationContents(conversationHistory, userMessage, currentGraph, turnCount);
  const keyFingerprint = maskApiFingerprint(apiKey);
  const attemptLogs = [];
  let lastErr = null;

  for (const { model, extraConfig } of candidates) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8500);
    const t0 = Date.now();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents,
          generationConfig: {
            temperature: 0.35,
            responseMimeType: 'application/json',
            ...extraConfig
          }
        })
      });

      const latencyMs = Date.now() - t0;

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        lastErr = errPayload?.error?.message || `HTTP ${response.status} (${model})`;
        attemptLogs.push({
          key_id: 'server_gemini',
          key_label: 'Google Gemini API (Servidor Formalia)',
          key_fingerprint: keyFingerprint,
          provider: 'gemini',
          model,
          source_module: 'formalia',
          scope: 'server',
          http_status: response.status,
          success: false,
          prompt_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
          latency_ms: latencyMs,
          error_message: lastErr
        });
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const usageMeta = data?.usageMetadata || {};
      const promptTokens = Number(usageMeta.promptTokenCount) || 0;
      const outputTokens =
        (Number(usageMeta.candidatesTokenCount) || 0) + (Number(usageMeta.thoughtsTokenCount) || 0);
      const totalTokens = Number(usageMeta.totalTokenCount) || (promptTokens + outputTokens);

      if (!rawText) {
        lastErr = `Respuesta vacía en ${model}`;
        attemptLogs.push({
          key_id: 'server_gemini',
          key_label: 'Google Gemini API (Servidor Formalia)',
          key_fingerprint: keyFingerprint,
          provider: 'gemini',
          model,
          source_module: 'formalia',
          scope: 'server',
          http_status: 502,
          success: false,
          prompt_tokens: promptTokens,
          output_tokens: outputTokens,
          total_tokens: totalTokens,
          latency_ms: latencyMs,
          error_message: lastErr
        });
        continue;
      }

      const cleanJsonText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = sanitizeExtractorPayload(JSON.parse(cleanJsonText), currentGraph);
      attemptLogs.push({
        key_id: 'server_gemini',
        key_label: 'Google Gemini API (Servidor Formalia)',
        key_fingerprint: keyFingerprint,
        provider: 'gemini',
        model,
        source_module: 'formalia',
        scope: 'server',
        http_status: 200,
        success: true,
        prompt_tokens: promptTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        latency_ms: latencyMs
      });

      return {
        ...parsed,
        engine_source: 'gemini_llm',
        llm_model: model,
        attempt_logs: attemptLogs
      };
    } catch (err) {
      lastErr = err?.message || `Error invocando ${model}`;
      attemptLogs.push({
        key_id: 'server_gemini',
        key_label: 'Google Gemini API (Servidor Formalia)',
        key_fingerprint: keyFingerprint,
        provider: 'gemini',
        model,
        source_module: 'formalia',
        scope: 'server',
        http_status: err?.name === 'AbortError' ? 504 : 500,
        success: false,
        prompt_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        latency_ms: Date.now() - t0,
        error_message: lastErr
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  const error = new Error(lastErr || 'No se obtuvo respuesta válida de Gemini');
  error.attemptLogs = attemptLogs;
  throw error;
}

async function callOpenAiCompatibleConversational({ config, userMessage, currentGraph, turnCount, conversationHistory }) {
  const historyMsgs = (conversationHistory || [])
    .slice(-12)
    .filter((m) => m && m.content)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content)
    }));

  const keyId = `server_${config.provider}`;
  const keyFingerprint = maskApiFingerprint(config.apiKey);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);
  const t0 = Date.now();

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.35,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...historyMsgs,
          {
            role: 'user',
            content: `[ESTADO ACTUAL DEL GRAFO — Turno ${turnCount}/15]\n${JSON.stringify(currentGraph)}\n\n[MENSAJE ACTUAL DEL USUARIO]\n${userMessage}`
          }
        ]
      })
    });

    const latencyMs = Date.now() - t0;
    const rateLimitInfo = readOpenAiRateLimitHeaders(response);

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `HTTP ${response.status}`;
      const error = new Error(errMsg);
      error.attemptLogs = [
        {
          key_id: keyId,
          key_label: `${config.provider.toUpperCase()} API (Respaldo Servidor)`,
          key_fingerprint: keyFingerprint,
          provider: config.provider,
          model: config.model,
          source_module: 'formalia',
          scope: 'server',
          http_status: response.status,
          success: false,
          prompt_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
          latency_ms: latencyMs,
          rate_limit_info: rateLimitInfo,
          error_message: errMsg
        }
      ];
      throw error;
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('Respuesta vacía de OpenAI/DeepSeek');

    const usage = data?.usage || {};
    const promptTokens = Number(usage.prompt_tokens) || 0;
    const outputTokens = Number(usage.completion_tokens) || 0;
    const totalTokens = Number(usage.total_tokens) || (promptTokens + outputTokens);

    const cleanJsonText = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = sanitizeExtractorPayload(JSON.parse(cleanJsonText), currentGraph);
    return {
      ...parsed,
      engine_source: `${config.provider}_llm`,
      llm_model: config.model,
      attempt_logs: [
        {
          key_id: keyId,
          key_label: `${config.provider.toUpperCase()} API (Respaldo Servidor)`,
          key_fingerprint: keyFingerprint,
          provider: config.provider,
          model: config.model,
          source_module: 'formalia',
          scope: 'server',
          http_status: 200,
          success: true,
          prompt_tokens: promptTokens,
          output_tokens: outputTokens,
          total_tokens: totalTokens,
          latency_ms: latencyMs,
          rate_limit_info: rateLimitInfo
        }
      ]
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Orquestador Principal (LLM Conversacional + Fallback Inteligente) ────────

export async function extractProcessTurn({
  userMessage,
  currentGraph,
  turnCount = 1,
  conversationHistory = []
}) {
  const attemptLogs = [];
  const geminiKey = getGeminiApiKey();

  if (geminiKey) {
    try {
      const res = await callGeminiConversational({
        apiKey: geminiKey,
        userMessage,
        currentGraph,
        turnCount,
        conversationHistory
      });
      return res;
    } catch (err) {
      if (Array.isArray(err?.attemptLogs)) attemptLogs.push(...err.attemptLogs);
      if (typeof console !== 'undefined') {
        console.warn('[FORMALIA] Fallo en Gemini LLM, intentando respaldo:', err?.message || err);
      }
    }
  }

  const openAiConfig = getOpenAiCompatibleConfig();
  if (openAiConfig) {
    try {
      const res = await callOpenAiCompatibleConversational({
        config: openAiConfig,
        userMessage,
        currentGraph,
        turnCount,
        conversationHistory
      });
      return {
        ...res,
        attempt_logs: [...attemptLogs, ...(res.attempt_logs || [])]
      };
    } catch (err) {
      if (Array.isArray(err?.attemptLogs)) attemptLogs.push(...err.attemptLogs);
      if (typeof console !== 'undefined') {
        console.warn('[FORMALIA] Fallo en OpenAI/DeepSeek, usando motor conversacional local:', err?.message || err);
      }
    }
  }

  const fallbackResult = runDeterministicProcessExtractor(
    userMessage,
    currentGraph,
    turnCount,
    conversationHistory
  );

  return {
    ...fallbackResult,
    attempt_logs: attemptLogs
  };
}
