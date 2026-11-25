import { ExtractorResponseSchema } from './schema.js';

const SYSTEM_PROMPT = `
Eres FormalIA, el entrevistador técnico y arquitecto de procesos de Pathrimonio Company.
Tu misión es entrevistar al usuario en español claro y cotidiano para mapear su proceso de negocio en un modelo canónico incremental (ProcessGraphJSON).

REGLAS ESTRICTAS:
1. NUNCA dibujes ASCII art ni escribas código PlantUML en assistant_message.
2. assistant_message debe ser una respuesta empática muy breve + la siguiente pregunta concreta (MÁXIMO 2 líneas).
3. quick_replies debe tener entre 2 y 4 opciones cortas clicables coherentes con la pregunta actual.
4. Devuelve ÚNICAMENTE JSON válido con la estructura:
{
  "assistant_message": "string",
  "quick_replies": ["string", "string"],
  "graph_patch": [
    { "op": "set_context", "company_name": "...", "industry": "logistica_transporte|comercio_retail|servicios_profesionales|restaurantes_alimentos|salud_clinicas|manufactura_taller|otro_sector", "macroprocess_category": "estrategico|operativo_core|soporte", "process_name": "..." },
    { "op": "add_role", "actor": { "id": "role_...", "name": "...", "type": "EXTERNAL_CUSTOMER|INTERNAL_ADMIN_ROLE", "is_field_role": false } },
    { "op": "add_step", "step": { "id": "stp_...", "actor_id": "...", "label": "...", "step_type": "TRIGGER|TASK|GATEWAY_OR_APPROVAL|NOTIFICATION|END", "channel": "whatsapp|excel_manual|cuaderno_papel|correo|sistema_externo|presencial|web_portal|app_movil", "artifacts": ["..."], "is_manual_bottleneck": true, "automation_opportunity": "..." } },
    { "op": "add_edge", "from": "stp_1", "to": "stp_2", "condition": null },
    { "op": "flag_bottleneck", "step_id": "stp_...", "is_manual_bottleneck": true, "automation_opportunity": "..." },
    { "op": "add_entity", "entity": "OrdenServicio" },
    { "op": "add_api", "api": "validacion_ruc_dni|pasarela_pagos|almacenamiento_cloud|historial_ilimitado|integracion_hardware_erp" }
  ],
  "completeness_score": 0..100,
  "phase": "1_context|2_roles_steps|3_handoffs_data|4_gaps_validation|5_synthesis"
}

Fases de la máquina de estados:
- 1_context: Identificar rubro y proceso crítico principal.
- 2_roles_steps: Extraer actividades secuenciales y quién ejecuta cada una.
- 3_handoffs_data: Identificar traspasos, canales (WhatsApp, Excel, papel) y documentos/artefactos.
- 4_gaps_validation: Validar aprobaciones, validaciones de pago/stock y excepciones faltantes.
- 5_synthesis: Confirmar grafo listo y proponer cotización en Pathrimonio.
`;

// ── 1. Reglas de Extracción NLP Determinista (Fallback Instantáneo) ──────────

const INDUSTRY_MATCHERS = [
  { id: 'logistica_transporte', label: 'Logística & Transporte', rx: /logíst|logist|transporte|envío|envio|despacho|flota|carga|flete|courier|encomienda/i },
  { id: 'comercio_retail', label: 'Comercio & Retail', rx: /tienda|retail|comercio|venta|ferreter|bodega|minimarket|distribuidor|mayorista/i },
  { id: 'restaurantes_alimentos', label: 'Restaurantes & Gastronomía', rx: /restaur|comida|cocina|delivery|menú|menu|café|cafe|panader|gastronom/i },
  { id: 'salud_clinicas', label: 'Salud & Clínicas', rx: /clínic|clinic|salud|médic|medic|consultorio|paciente|cita|odont|laboratorio/i },
  { id: 'manufactura_taller', label: 'Manufactura & Producción', rx: /taller|fábrica|fabrica|producci|manufactura|confecci|insumo|planta|obra/i },
  { id: 'servicios_profesionales', label: 'Servicios Profesionales', rx: /agencia|consultor|servicio|estudio|contab|legal|inmobiliari|soporte/i }
];

const ROLE_DICTIONARY = [
  { id: 'act_cliente', name: 'Cliente Final', type: 'EXTERNAL_CUSTOMER', is_field_role: false, rx: /\b(cliente|paciente|comensal|comprador|usuario)\b/i },
  { id: 'role_ventas', name: 'Recepción / Ventas', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, rx: /\b(ventas?|vendedor|comercial|recepci[oó]n|asesor|mostrador|atenci[oó]n)\b/i },
  { id: 'role_caja', name: 'Caja & Facturación', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, rx: /\b(caja|cajer[oa]|facturaci[oó]n|cobro|tesorer[ií]a)\b/i },
  { id: 'role_almacen', name: 'Almacén & Stock', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, rx: /\b(almac[eé]n|almacenero|bodega|stock|inventario|cocina|preparaci[oó]n)\b/i },
  { id: 'role_despacho', name: 'Despacho & Ruta', type: 'INTERNAL_ADMIN_ROLE', is_field_role: true, rx: /\b(despacho|chofer|repartidor|motorizado|ruta|mensajero|delivery|campo|t[eé]cnico)\b/i },
  { id: 'role_compras', name: 'Compras & Proveedores', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, rx: /\b(compras?|proveedor|abastecimiento)\b/i },
  { id: 'role_gerencia', name: 'Gerencia / Supervisión', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false, rx: /\b(gerencia|gerente|admin|administrador|supervisor|jefe|director|due[ñn]o)\b/i }
];

function detectChannel(text) {
  const lower = text.toLowerCase();
  if (/whatsapp|wsp|chat/.test(lower)) return 'whatsapp';
  if (/excel|hoja|planilla|spreadsheet/.test(lower)) return 'excel_manual';
  if (/cuaderno|papel|talonario|f[ií]sic|manual|libreta/.test(lower)) return 'cuaderno_papel';
  if (/correo|email|mail/.test(lower)) return 'correo';
  if (/llamada|tel[eé]fono/.test(lower)) return 'llamada';
  if (/sistema|sunat|erp|pos/.test(lower)) return 'sistema_externo';
  return 'presencial';
}

function detectArtifacts(text) {
  const lower = text.toLowerCase();
  const artifacts = [];
  if (/orden|pedido|solicitud/.test(lower)) artifacts.push('orden_pedido');
  if (/cotiz|tarifa|presupuesto/.test(lower)) artifacts.push('cotizacion');
  if (/boleta|factura|comprobante|pago|recibo/.test(lower)) artifacts.push('comprobante_pago');
  if (/gu[ií]a|remisi[oó]n|bulto/.test(lower)) artifacts.push('guia_despacho');
  if (/foto|evidencia|firma/.test(lower)) artifacts.push('evidencia_entrega');
  if (/stock|inventario|kardex/.test(lower)) artifacts.push('control_stock');
  if (/historia|cita|ficha/.test(lower)) artifacts.push('ficha_registro');
  return artifacts;
}

function isBottleneckText(text) {
  return /excel|cuaderno|papel|whatsapp|manual|desorden|demora|pierde|extrav|doble|lento|tarda|error|fuga/i.test(text);
}

function splitClauses(message) {
  return message
    .split(/(?:\.|;|\by luego\b|\bdespu[eé]s\b|\bfinalmente\b|\by\b(?=\s+(?:el|la|en|se|pasa|env[ií]a|valida|cobra|registra|despacha|prepara|verifica|emite)))/i)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6);
}

function computeCompleteness(graph, additionalSteps = 0, additionalActors = 0) {
  const actorsCount = (graph?.actors?.length || 0) + additionalActors;
  const stepsCount = (graph?.steps?.length || 0) + additionalSteps;
  const hasContext = graph?.business_context?.industry !== 'otro_sector' || Boolean(graph?.business_context?.company_name);
  const hasGateway = (graph?.steps || []).some((s) => s.step_type === 'GATEWAY_OR_APPROVAL');
  const hasArtifacts = (graph?.steps || []).some((s) => (s.artifacts || []).length > 0);
  const hasBottleneck = (graph?.steps || []).some((s) => s.is_manual_bottleneck);

  let score = 10;
  if (hasContext) score += 15;
  score += Math.min(25, actorsCount * 7);
  score += Math.min(30, stepsCount * 8);
  if (hasArtifacts) score += 8;
  if (hasGateway) score += 6;
  if (hasBottleneck) score += 6;
  return Math.min(100, Math.max(10, score));
}

export function runDeterministicProcessExtractor(userMessage, currentGraph, turnCount = 1) {
  const text = (userMessage || '').trim();
  const patches = [];
  const existingActors = currentGraph?.actors || [];
  const existingSteps = currentGraph?.steps || [];
  let nextStepIdx = existingSteps.length + 1;
  let lastStepId = existingSteps.length > 0 ? existingSteps[existingSteps.length - 1].id : null;

  // 1. Detectar industria y nombre de empresa
  let detectedIndustry = null;
  for (const ind of INDUSTRY_MATCHERS) {
    if (ind.rx.test(text)) {
      detectedIndustry = ind.id;
      break;
    }
  }

  const companyMatch = text.match(/(?:empresa|negocio|somos|llamamos|en)\s+([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s&.]{2,32})/);
  const processMatch = text.match(/(?:proceso de|manejo de|desorden en|flujo de)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ\s]{4,40})/);

  if (detectedIndustry || companyMatch || processMatch) {
    patches.push({
      op: 'set_context',
      ...(companyMatch ? { company_name: companyMatch[1].trim() } : {}),
      ...(detectedIndustry ? { industry: detectedIndustry } : {}),
      ...(processMatch ? { process_name: processMatch[1].trim().replace(/^./, (c) => c.toUpperCase()) } : {})
    });
  }

  // 2. Detectar roles mencionados
  const newlyAddedActors = [];
  for (const roleDef of ROLE_DICTIONARY) {
    if (roleDef.rx.test(text)) {
      const alreadyExists = existingActors.some((a) => a.id === roleDef.id) || newlyAddedActors.some((a) => a.id === roleDef.id);
      if (!alreadyExists) {
        patches.push({
          op: 'add_role',
          actor: {
            id: roleDef.id,
            name: roleDef.name,
            type: roleDef.type,
            is_field_role: roleDef.is_field_role
          }
        });
        newlyAddedActors.push(roleDef);
      }
    }
  }

  const allKnownActors = [...existingActors, ...newlyAddedActors];

  // 3. Extraer pasos secuenciales de cláusulas
  const clauses = splitClauses(text);
  let addedStepsCount = 0;

  // Evitar crear pasos si es una respuesta muy corta tipo "Sí" o solo nombre de rubro
  const isActionableDescription = clauses.some((c) => c.split(/\s+/).length >= 3);

  if (isActionableDescription) {
    clauses.forEach((clause, cIdx) => {
      // Determinar actor responsable de esta cláusula
      let matchedActor = ROLE_DICTIONARY.find((r) => r.rx.test(clause));
      if (!matchedActor && allKnownActors.length > 0) {
        matchedActor = allKnownActors[allKnownActors.length - 1];
      }
      if (!matchedActor) {
        matchedActor = {
          id: 'role_operaciones',
          name: 'Operaciones',
          type: 'INTERNAL_ADMIN_ROLE',
          is_field_role: false
        };
        if (!existingActors.some((a) => a.id === matchedActor.id) && !newlyAddedActors.some((a) => a.id === matchedActor.id)) {
          patches.push({ op: 'add_role', actor: matchedActor });
          newlyAddedActors.push(matchedActor);
        }
      }

      const stepId = `stp_${nextStepIdx++}`;
      const channel = detectChannel(clause);
      const artifacts = detectArtifacts(clause);
      const bottleneck = isBottleneckText(clause);
      const isGateway = /valida|aprueba|verifica|revisa|confirma|autoriza|comprueba/i.test(clause);
      const isTrigger = existingSteps.length === 0 && addedStepsCount === 0;
      const isEnd = /entrega|finaliza|env[ií]a comprobante|cierra/i.test(clause) && cIdx === clauses.length - 1 && existingSteps.length >= 2;

      const cleanLabel = clause.charAt(0).toUpperCase() + clause.slice(1);
      const truncatedLabel = cleanLabel.length > 78 ? `${cleanLabel.slice(0, 75)}...` : cleanLabel;

      patches.push({
        op: 'add_step',
        step: {
          id: stepId,
          actor_id: matchedActor.id,
          label: truncatedLabel,
          step_type: isTrigger ? 'TRIGGER' : isGateway ? 'GATEWAY_OR_APPROVAL' : isEnd ? 'END' : 'TASK',
          channel,
          artifacts,
          is_manual_bottleneck: bottleneck,
          automation_opportunity: bottleneck
            ? `Digitalizar "${truncatedLabel.slice(0, 36)}" con registro único y alertas en vivo`
            : null
        }
      });

      if (lastStepId) {
        patches.push({
          op: 'add_edge',
          from: lastStepId,
          to: stepId,
          condition: isGateway ? 'Validado' : null
        });
      }

      lastStepId = stepId;
      addedStepsCount += 1;
    });
  }

  // 4. Entidades y APIs inferidas
  if (/ruc|dni|sunat|factura|boleta/i.test(text)) {
    patches.push({ op: 'add_api', api: 'validacion_ruc_dni' });
    patches.push({ op: 'add_entity', entity: 'ComprobantePago' });
  }
  if (/foto|gu[ií]a|pdf|evidencia|archivo/i.test(text)) {
    patches.push({ op: 'add_api', api: 'almacenamiento_cloud' });
    patches.push({ op: 'add_entity', entity: 'EvidenciaDigital' });
  }
  if (/pago|tarjeta|qr|yape|plin|link/i.test(text)) {
    patches.push({ op: 'add_api', api: 'pasarela_pagos' });
  }
  if (/pedido|orden/i.test(text)) {
    patches.push({ op: 'add_entity', entity: 'OrdenServicio' });
  }
  if (/stock|inventario|almac[eé]n/i.test(text)) {
    patches.push({ op: 'add_entity', entity: 'ProductoInventario' });
  }
  if (/cliente/i.test(text)) {
    patches.push({ op: 'add_entity', entity: 'Cliente' });
  }

  // 5. Determinar siguiente fase y pregunta guiada (máx 2 líneas)
  const totalSteps = existingSteps.length + addedStepsCount;
  const totalActors = allKnownActors.length;
  const completeness_score = computeCompleteness(currentGraph, addedStepsCount, newlyAddedActors.length);

  let phase = '1_context';
  let assistant_message = '';
  let quick_replies = [];

  if (totalSteps === 0) {
    phase = '2_roles_steps';
    assistant_message =
      'Entendido. Cuando llega un pedido o cliente nuevo, ¿quién lo recibe primero y qué pasos siguen hasta completar la atención?';
    quick_replies = [
      'El cliente escribe por WhatsApp, Ventas anota en Excel y pasa a Almacén',
      'Recepción toma el pedido presencial, Caja cobra y Cocina/Taller lo prepara',
      'Vendedor cotiza, Gerencia aprueba crédito y Despacho entrega en ruta'
    ];
  } else if (totalSteps < 3 || totalActors < 2) {
    phase = '3_handoffs_data';
    assistant_message =
      'Ya dibujé los primeros carriles. ¿Cómo se pasa la orden al siguiente responsable (WhatsApp, Excel, papel) y qué documento o dato intercambian?';
    quick_replies = [
      'Se pasan el pedido por WhatsApp y anotan en Excel',
      'Usamos guías o boletas en papel físico y luego Caja cuadra al cierre',
      'Almacén verifica stock y Despacho envía foto de entrega al cliente'
    ];
  } else if (!existingSteps.some((s) => s.step_type === 'GATEWAY_OR_APPROVAL') && turnCount < 5) {
    phase = '4_gaps_validation';
    assistant_message =
      'Perfecto, veo el flujo principal. Antes de entregar o cerrar, ¿quién valida el pago, el RUC/DNI o la disponibilidad de stock?';
    quick_replies = [
      'Caja valida pago/RUC y emite comprobante antes del despacho',
      'Almacén confirma stock físico y Despacho registra entrega con foto',
      'No hay validación formal y ahí ocurren nuestros mayores reclamos'
    ];
  } else {
    phase = '5_synthesis';
    const internalCount = Math.max(1, allKnownActors.filter((a) => a.type === 'INTERNAL_ADMIN_ROLE').length);
    const bottlenecksCount = existingSteps.filter((s) => s.is_manual_bottleneck).length + (isBottleneckText(text) ? 1 : 0);
    assistant_message = `Listo: detectamos ${internalCount} rol(es) internos, ${totalSteps} pasos y ${bottlenecksCount} punto(s) manuales críticos. ¿Deseas ajustar algún paso o cotizar este sistema en Pathrimonio?`;
    quick_replies = [
      'Agregar control de Gerencia y reportes automáticos',
      'El flujo está completo, quiero ver el diagrama y cotizar'
    ];
  }

  return {
    assistant_message,
    quick_replies: quick_replies.slice(0, 4),
    graph_patch: patches,
    completeness_score,
    phase
  };
}

// ── 2. Orquestador LLM (Gemini Structured Outputs con Fallback Seguro) ───────

function getGeminiApiKey() {
  try {
    const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {};
    return (viteEnv.VITE_GEMINI_API_KEY || viteEnv.VITE_AI_API_KEY || '').trim();
  } catch {
    return '';
  }
}

export async function extractProcessTurn({ userMessage, currentGraph, turnCount = 1 }) {
  const apiKey = getGeminiApiKey();

  // Intentar Gemini API si existe clave válida
  if (apiKey) {
    try {
      const model = 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nESTADO ACTUAL DEL GRAFO (ProcessGraphJSON):\n${JSON.stringify(currentGraph)}\n\nTURNO ACTUAL: ${turnCount}/15\nMENSAJE DEL USUARIO:\n"${userMessage}"`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsedJson = JSON.parse(rawText);
          const validated = ExtractorResponseSchema.safeParse(parsedJson);
          if (validated.success) {
            return {
              ...validated.data,
              engine_source: 'llm_gemini'
            };
          }
        }
      }
    } catch (_) {
      // Fallback silencioso y determinista garantizado (< 50ms)
    }
  }

  const deterministicResult = runDeterministicProcessExtractor(userMessage, currentGraph, turnCount);
  return {
    ...deterministicResult,
    engine_source: 'deterministic_extractor'
  };
}
