import { z } from 'zod';

// ── 1. Esquemas Canónicos Zod (ProcessGraphJSON — SDD Sección 4) ─────────────

export const ActorTypeEnum = z.enum([
  'EXTERNAL_CUSTOMER',
  'INTERNAL_ADMIN_ROLE',
  'EXTERNAL_PARTNER',
  'AUTOMATED_SYSTEM'
]);

export const StepTypeEnum = z.enum([
  'TRIGGER',
  'TASK',
  'GATEWAY_OR_APPROVAL',
  'NOTIFICATION',
  'END'
]);

export const ChannelEnum = z.enum([
  'whatsapp',
  'excel_manual',
  'cuaderno_papel',
  'correo',
  'llamada',
  'sistema_externo',
  'presencial',
  'web_portal',
  'app_movil'
]);

export const MacroprocessCategoryEnum = z.enum([
  'estrategico',
  'operativo_core',
  'soporte'
]);

export const ActorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: ActorTypeEnum.default('INTERNAL_ADMIN_ROLE'),
  is_field_role: z.boolean().optional().default(false)
});

export const StepSchema = z.object({
  id: z.string().min(1),
  actor_id: z.string().min(1),
  label: z.string().min(1),
  step_type: StepTypeEnum.default('TASK'),
  channel: z.string().default('presencial'),
  artifacts: z.array(z.string()).default([]),
  is_manual_bottleneck: z.boolean().default(false),
  automation_opportunity: z.string().nullable().optional()
});

export const TransitionSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  condition: z.string().nullable().optional()
});

export const BusinessContextSchema = z.object({
  company_name: z.string().default(''),
  industry: z.string().default('logistica_transporte'),
  macroprocess_category: MacroprocessCategoryEnum.default('operativo_core'),
  process_name: z.string().default('Proceso Principal de Operación')
});

export const EngineeringArtifactsSchema = z.object({
  detected_entities: z.array(z.string()).default([]),
  external_apis_needed: z.array(z.string()).default([])
});

export const ProcessGraphSchema = z.object({
  session_id: z.string(),
  phase: z.enum([
    '1_context',
    '2_roles_steps',
    '3_handoffs_data',
    '4_gaps_validation',
    '5_synthesis'
  ]).default('1_context'),
  completeness_score: z.number().min(0).max(100).default(10),
  business_context: BusinessContextSchema,
  actors: z.array(ActorSchema).default([]),
  steps: z.array(StepSchema).default([]),
  transitions: z.array(TransitionSchema).default([]),
  engineering_artifacts: EngineeringArtifactsSchema.default({
    detected_entities: [],
    external_apis_needed: []
  })
});

// ── 2. Esquema de Operaciones Incrementales (graph_patch — SDD Sección 3.2) ──

export const GraphPatchOpSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('set_context'),
    company_name: z.string().optional(),
    industry: z.string().optional(),
    macroprocess_category: MacroprocessCategoryEnum.optional(),
    process_name: z.string().optional()
  }),
  z.object({
    op: z.literal('add_role'),
    actor: ActorSchema
  }),
  z.object({
    op: z.literal('update_role'),
    id: z.string().min(1),
    name: z.string().min(1).optional(),
    type: ActorTypeEnum.optional(),
    is_field_role: z.boolean().optional()
  }),
  z.object({
    op: z.literal('remove_role'),
    id: z.string().min(1)
  }),
  z.object({
    op: z.literal('add_step'),
    step: StepSchema,
    insert_after: z.string().optional(),
    insert_before: z.string().optional()
  }),
  z.object({
    op: z.literal('update_step'),
    id: z.string().min(1),
    actor_id: z.string().min(1).optional(),
    label: z.string().min(1).optional(),
    step_type: StepTypeEnum.optional(),
    channel: z.string().optional(),
    artifacts: z.array(z.string()).optional(),
    is_manual_bottleneck: z.boolean().optional(),
    automation_opportunity: z.string().nullable().optional()
  }),
  z.object({
    op: z.literal('remove_step'),
    id: z.string().min(1)
  }),
  z.object({
    op: z.literal('reorder_steps'),
    step_ids: z.array(z.string().min(1))
  }),
  z.object({
    op: z.literal('add_edge'),
    from: z.string(),
    to: z.string(),
    condition: z.string().nullable().optional()
  }),
  z.object({
    op: z.literal('remove_edge'),
    from: z.string(),
    to: z.string()
  }),
  z.object({
    op: z.literal('flag_bottleneck'),
    step_id: z.string(),
    is_manual_bottleneck: z.boolean().default(true),
    automation_opportunity: z.string().optional()
  }),
  z.object({
    op: z.literal('add_artifact'),
    step_id: z.string(),
    artifact: z.string()
  }),
  z.object({
    op: z.literal('add_entity'),
    entity: z.string()
  }),
  z.object({
    op: z.literal('add_api'),
    api: z.string()
  })
]);

export const ExtractorResponseSchema = z.object({
  assistant_message: z.string().min(1),
  quick_replies: z.array(z.string()).min(1).max(4),
  graph_patch: z.array(GraphPatchOpSchema).default([]),
  completeness_score: z.number().min(0).max(100),
  phase: z.enum([
    '1_context',
    '2_roles_steps',
    '3_handoffs_data',
    '4_gaps_validation',
    '5_synthesis'
  ]).optional(),
  dialogue_state: z.enum([
    'discovering_scope',
    'clarifying_actors',
    'mapping_flow',
    'refining_details',
    'ready_for_synthesis'
  ]).optional()
});

// ── 3. Fábrica Inicial y Aplicación Determinista de Patches ──────────────────

export function generateFormaliaSessionId() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FIA-2026-${randomSuffix}`;
}

export function createInitialProcessGraph(sessionId = generateFormaliaSessionId()) {
  return {
    session_id: sessionId,
    phase: '1_context',
    completeness_score: 5,
    business_context: {
      company_name: '',
      industry: 'otro_sector',
      macroprocess_category: 'operativo_core',
      process_name: 'Operación por mapear'
    },
    actors: [],
    steps: [],
    transitions: [],
    engineering_artifacts: {
      detected_entities: [],
      external_apis_needed: []
    }
  };
}

function humanizeActorId(actorId = '') {
  const raw = String(actorId || '')
    .replace(/^(act_|role_)/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  if (!raw) return 'Rol Operativo';
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Aplica de forma pura e idempotente una lista de operaciones graph_patch sobre ProcessGraphJSON.
 */
export function applyGraphPatches(currentGraph, patches = []) {
  const next = structuredClone(currentGraph);
  next.actors = Array.isArray(next.actors) ? next.actors : [];
  next.steps = Array.isArray(next.steps) ? next.steps : [];
  next.transitions = Array.isArray(next.transitions) ? next.transitions : [];
  next.engineering_artifacts = next.engineering_artifacts || {
    detected_entities: [],
    external_apis_needed: []
  };

  for (const patch of patches) {
    if (!patch || !patch.op) continue;

    switch (patch.op) {
      case 'set_context': {
        if (patch.company_name !== undefined && patch.company_name !== null) {
          next.business_context.company_name = String(patch.company_name).trim();
        }
        if (patch.industry) next.business_context.industry = patch.industry;
        if (patch.macroprocess_category) {
          next.business_context.macroprocess_category = patch.macroprocess_category;
        }
        if (patch.process_name) next.business_context.process_name = String(patch.process_name).trim();
        break;
      }

      case 'add_role': {
        if (!patch.actor?.id || !patch.actor?.name) break;
        const exists = next.actors.some(
          (a) =>
            a.id === patch.actor.id ||
            a.name.trim().toLowerCase() === patch.actor.name.trim().toLowerCase()
        );
        if (!exists) {
          next.actors.push({
            id: patch.actor.id,
            name: patch.actor.name.trim(),
            type: patch.actor.type || 'INTERNAL_ADMIN_ROLE',
            is_field_role: Boolean(patch.actor.is_field_role)
          });
        }
        break;
      }

      case 'update_role': {
        const actor = next.actors.find((a) => a.id === patch.id);
        if (actor) {
          if (patch.name) actor.name = patch.name.trim();
          if (patch.type) actor.type = patch.type;
          if (patch.is_field_role !== undefined) actor.is_field_role = Boolean(patch.is_field_role);
        }
        break;
      }

      case 'remove_role': {
        const removedStepIds = new Set(
          next.steps.filter((s) => s.actor_id === patch.id).map((s) => s.id)
        );
        next.actors = next.actors.filter((a) => a.id !== patch.id);
        next.steps = next.steps.filter((s) => s.actor_id !== patch.id);
        next.transitions = next.transitions.filter(
          (t) => !removedStepIds.has(t.from) && !removedStepIds.has(t.to)
        );
        break;
      }

      case 'add_step': {
        if (!patch.step?.id || !patch.step?.label) break;
        // Garantizar que el actor exista para evitar nodos huérfanos en el lienzo
        let resolvedActorId = patch.step.actor_id;
        if (resolvedActorId) {
          const matchingActor = next.actors.find(
            (a) =>
              a.id === resolvedActorId ||
              a.name.trim().toLowerCase() === resolvedActorId.trim().toLowerCase()
          );
          if (matchingActor) {
            resolvedActorId = matchingActor.id;
          } else {
            next.actors.push({
              id: resolvedActorId,
              name: humanizeActorId(resolvedActorId),
              type: /^act_cliente/i.test(resolvedActorId) ? 'EXTERNAL_CUSTOMER' : 'INTERNAL_ADMIN_ROLE',
              is_field_role: /(despacho|ruta|chofer|campo|motorizado|tecnico)/i.test(resolvedActorId)
            });
          }
        }

        const existingIdx = next.steps.findIndex((s) => s.id === patch.step.id);
        const normalizedStep = {
          id: patch.step.id,
          actor_id: resolvedActorId || next.actors[0]?.id || 'role_operaciones',
          label: patch.step.label.trim(),
          step_type: patch.step.step_type || 'TASK',
          channel: patch.step.channel || 'presencial',
          artifacts: Array.isArray(patch.step.artifacts) ? patch.step.artifacts : [],
          is_manual_bottleneck: Boolean(patch.step.is_manual_bottleneck),
          automation_opportunity: patch.step.automation_opportunity || null
        };

        if (existingIdx >= 0) {
          next.steps[existingIdx] = { ...next.steps[existingIdx], ...normalizedStep };
        } else if (patch.insert_after) {
          const afterIdx = next.steps.findIndex((s) => s.id === patch.insert_after);
          if (afterIdx >= 0) {
            next.steps.splice(afterIdx + 1, 0, normalizedStep);
          } else {
            next.steps.push(normalizedStep);
          }
        } else if (patch.insert_before) {
          const beforeIdx = next.steps.findIndex((s) => s.id === patch.insert_before);
          if (beforeIdx >= 0) {
            next.steps.splice(beforeIdx, 0, normalizedStep);
          } else {
            next.steps.push(normalizedStep);
          }
        } else {
          next.steps.push(normalizedStep);
        }
        break;
      }

      case 'update_step': {
        const step = next.steps.find((s) => s.id === patch.id);
        if (step) {
          if (patch.actor_id) {
            const matchingActor = next.actors.find(
              (a) =>
                a.id === patch.actor_id ||
                a.name.trim().toLowerCase() === patch.actor_id.trim().toLowerCase()
            );
            step.actor_id = matchingActor ? matchingActor.id : patch.actor_id;
          }
          if (patch.label) step.label = patch.label.trim();
          if (patch.step_type) step.step_type = patch.step_type;
          if (patch.channel) step.channel = patch.channel;
          if (Array.isArray(patch.artifacts)) step.artifacts = patch.artifacts;
          if (patch.is_manual_bottleneck !== undefined) {
            step.is_manual_bottleneck = Boolean(patch.is_manual_bottleneck);
          }
          if (patch.automation_opportunity !== undefined) {
            step.automation_opportunity = patch.automation_opportunity;
          }
        }
        break;
      }

      case 'remove_step': {
        next.steps = next.steps.filter((s) => s.id !== patch.id);
        next.transitions = next.transitions.filter(
          (t) => t.from !== patch.id && t.to !== patch.id
        );
        break;
      }

      case 'reorder_steps': {
        if (Array.isArray(patch.step_ids) && patch.step_ids.length > 0) {
          const orderMap = new Map(patch.step_ids.map((id, i) => [id, i]));
          next.steps.sort((a, b) => {
            const idxA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
            const idxB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
            return idxA - idxB;
          });
        }
        break;
      }

      case 'add_edge': {
        const existingEdge = next.transitions.find(
          (t) => t.from === patch.from && t.to === patch.to
        );
        if (patch.from && patch.to && patch.from !== patch.to) {
          if (existingEdge) {
            if (patch.condition !== undefined) {
              existingEdge.condition = patch.condition;
            }
          } else {
            next.transitions.push({
              from: patch.from,
              to: patch.to,
              condition: patch.condition ?? null
            });
          }
        }
        break;
      }

      case 'remove_edge': {
        next.transitions = next.transitions.filter(
          (t) => !(t.from === patch.from && t.to === patch.to)
        );
        break;
      }

      case 'flag_bottleneck': {
        const step = next.steps.find((s) => s.id === patch.step_id);
        if (step) {
          step.is_manual_bottleneck = patch.is_manual_bottleneck ?? true;
          if (patch.automation_opportunity) {
            step.automation_opportunity = patch.automation_opportunity;
          }
        }
        break;
      }

      case 'add_artifact': {
        const step = next.steps.find((s) => s.id === patch.step_id);
        if (step && patch.artifact && !step.artifacts.includes(patch.artifact)) {
          step.artifacts.push(patch.artifact);
        }
        break;
      }

      case 'add_entity': {
        if (
          patch.entity &&
          !next.engineering_artifacts.detected_entities.includes(patch.entity)
        ) {
          next.engineering_artifacts.detected_entities.push(patch.entity);
        }
        break;
      }

      case 'add_api': {
        if (
          patch.api &&
          !next.engineering_artifacts.external_apis_needed.includes(patch.api)
        ) {
          next.engineering_artifacts.external_apis_needed.push(patch.api);
        }
        break;
      }

      default:
        break;
    }
  }

  // Limpiar transiciones huérfanas que apunten a pasos inexistentes
  const validStepIds = new Set(next.steps.map((s) => s.id));
  next.transitions = next.transitions.filter(
    (t) => validStepIds.has(t.from) && validStepIds.has(t.to) && t.from !== t.to
  );

  return next;
}

// ── 4. Ejemplo Referencial del SDD (Transportes del Norte SAC) ───────────────

export const SDD_EXAMPLE_LOGISTICS_GRAPH = {
  session_id: 'FIA-2026-4410',
  phase: '5_synthesis',
  completeness_score: 100,
  business_context: {
    company_name: 'Transportes del Norte SAC',
    industry: 'logistica_transporte',
    macroprocess_category: 'operativo_core',
    process_name: 'Recepción y Despacho de Mercadería'
  },
  actors: [
    { id: 'act_cliente', name: 'Cliente Final', type: 'EXTERNAL_CUSTOMER', is_field_role: false },
    { id: 'role_ventas', name: 'Recepción / Ventas', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false },
    { id: 'role_caja', name: 'Caja', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false },
    { id: 'role_almacen', name: 'Almacén', type: 'INTERNAL_ADMIN_ROLE', is_field_role: false },
    { id: 'role_despacho', name: 'Despacho / Ruta', type: 'INTERNAL_ADMIN_ROLE', is_field_role: true }
  ],
  steps: [
    {
      id: 'stp_1',
      actor_id: 'act_cliente',
      label: 'Solicita envío y consulta tarifa por WhatsApp',
      step_type: 'TRIGGER',
      channel: 'whatsapp',
      artifacts: ['datos_envio'],
      is_manual_bottleneck: false,
      automation_opportunity: 'Bot de WhatsApp para cotización automática'
    },
    {
      id: 'stp_2',
      actor_id: 'role_ventas',
      label: 'Registra orden en Excel y pasa monto a Caja',
      step_type: 'TASK',
      channel: 'excel_manual',
      artifacts: ['orden_servicio'],
      is_manual_bottleneck: true,
      automation_opportunity: 'Registro digital único con cálculo automático de flete'
    },
    {
      id: 'stp_3',
      actor_id: 'role_caja',
      label: 'Valida RUC/DNI, confirma pago y emite comprobante',
      step_type: 'GATEWAY_OR_APPROVAL',
      channel: 'sistema_externo',
      artifacts: ['comprobante_pago'],
      is_manual_bottleneck: false,
      automation_opportunity: null
    },
    {
      id: 'stp_4',
      actor_id: 'role_almacen',
      label: 'Verifica bultos en cuaderno y arma guía física',
      step_type: 'TASK',
      channel: 'cuaderno_papel',
      artifacts: ['guia_remision', 'etiqueta_bulto'],
      is_manual_bottleneck: true,
      automation_opportunity: 'Control de stock por código QR y guía electrónica'
    },
    {
      id: 'stp_5',
      actor_id: 'role_despacho',
      label: 'Entrega en destino y envía foto al cliente',
      step_type: 'END',
      channel: 'whatsapp',
      artifacts: ['evidencia_entrega'],
      is_manual_bottleneck: false,
      automation_opportunity: 'App móvil de chofer con firma y alerta automática'
    }
  ],
  transitions: [
    { from: 'stp_1', to: 'stp_2', condition: 'Tarifa aceptada' },
    { from: 'stp_2', to: 'stp_3', condition: 'Orden registrada' },
    { from: 'stp_3', to: 'stp_4', condition: 'Pago confirmado' },
    { from: 'stp_4', to: 'stp_5', condition: 'Carga lista' }
  ],
  engineering_artifacts: {
    detected_entities: ['Cliente', 'OrdenServicio', 'ComprobantePago', 'GuiaDespacho', 'EvidenciaEntrega'],
    external_apis_needed: ['validacion_ruc_dni', 'almacenamiento_cloud', 'historial_ilimitado']
  }
};
