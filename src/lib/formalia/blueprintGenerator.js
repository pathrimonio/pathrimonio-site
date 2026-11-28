import { generateEngineeringHandoff } from './compilers.js';
import {
  sanitizeUiScreensPayload,
  THEME_PRESETS
} from './blueprintSchema.js';

function getServerEnv(name) {
  return (typeof process !== 'undefined' && process.env && process.env[name])
    ? String(process.env[name]).trim()
    : '';
}

function getAiCredentials() {
  const geminiKey =
    getServerEnv('GEMINI_API_KEY') ||
    getServerEnv('GOOGLE_API_KEY') ||
    getServerEnv('GOOGLE_GENERATIVE_AI_API_KEY') ||
    getServerEnv('VITE_GEMINI_API_KEY');
  if (geminiKey) return { provider: 'gemini', apiKey: geminiKey };

  const openAiKey = getServerEnv('OPENAI_API_KEY');
  if (openAiKey) {
    return {
      provider: 'openai',
      apiKey: openAiKey,
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: getServerEnv('OPENAI_MODEL') || 'gpt-4o-mini'
    };
  }

  const deepseekKey = getServerEnv('DEEPSEEK_API_KEY');
  if (deepseekKey) {
    return {
      provider: 'deepseek',
      apiKey: deepseekKey,
      endpoint: 'https://api.deepseek.com/chat/completions',
      model: 'deepseek-chat'
    };
  }

  return null;
}

async function requestStructuredJsonFromLlm({ systemPrompt, userPrompt }) {
  const creds = getAiCredentials();
  if (!creds) return { ok: false, data: null, attemptLogs: [] };

  const attemptLogs = [];
  const maskKey = (k) => (k.length <= 10 ? `${k.slice(0, 3)}••••` : `${k.slice(0, 5)}••••${k.slice(-4)}`);

  if (creds.provider === 'gemini') {
    const models = ['gemini-flash-lite-latest', 'gemini-3-flash-preview'];
    for (const model of models) {
      const t0 = Date.now();
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 9000);
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(creds.apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ctrl.signal,
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: { temperature: 0.25, responseMimeType: 'application/json' }
            })
          }
        );
        const latencyMs = Date.now() - t0;
        if (!res.ok) {
          attemptLogs.push({
            key_id: 'server_gemini',
            key_label: 'Google Gemini API (Servidor Formalia)',
            key_fingerprint: maskKey(creds.apiKey),
            provider: 'gemini',
            model,
            source_module: 'blueprint',
            http_status: res.status,
            success: false,
            latency_ms: latencyMs
          });
          continue;
        }
        const json = await res.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usage = json?.usageMetadata || {};
        const clean = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(clean);
        attemptLogs.push({
          key_id: 'server_gemini',
          key_label: 'Google Gemini API (Servidor Formalia)',
          key_fingerprint: maskKey(creds.apiKey),
          provider: 'gemini',
          model,
          source_module: 'blueprint',
          http_status: 200,
          success: true,
          prompt_tokens: Number(usage.promptTokenCount) || 0,
          output_tokens: Number(usage.candidatesTokenCount) || 0,
          total_tokens: Number(usage.totalTokenCount) || 0,
          latency_ms: latencyMs
        });
        return { ok: true, data: parsed, provider: 'gemini', model, attemptLogs };
      } catch (_) {
        // continuar al siguiente candidato o fallback determinista
      } finally {
        clearTimeout(timer);
      }
    }
  } else {
    const t0 = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 11000);
    try {
      const res = await fetch(creds.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${creds.apiKey}`
        },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: creds.model,
          temperature: 0.25,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      const latencyMs = Date.now() - t0;
      if (res.ok) {
        const json = await res.json();
        const rawText = json?.choices?.[0]?.message?.content || '';
        const parsed = JSON.parse(rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
        attemptLogs.push({
          key_id: `server_${creds.provider}`,
          key_label: `${creds.provider.toUpperCase()} API (Respaldo Servidor)`,
          key_fingerprint: maskKey(creds.apiKey),
          provider: creds.provider,
          model: creds.model,
          source_module: 'blueprint',
          http_status: 200,
          success: true,
          prompt_tokens: Number(json?.usage?.prompt_tokens) || 0,
          output_tokens: Number(json?.usage?.completion_tokens) || 0,
          total_tokens: Number(json?.usage?.total_tokens) || 0,
          latency_ms: latencyMs
        });
        return { ok: true, data: parsed, provider: creds.provider, model: creds.model, attemptLogs };
      }
    } catch (_) {
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, data: null, attemptLogs };
}

/**
 * Fusiona múltiples lienzos de un mismo Espacio de Trabajo en una vista unificada para Handoff/Blueprint.
 */
export function mergeCanvasGraphs(canvases = [], workspaceName = 'Espacio Formalia') {
  const validCanvases = (canvases || []).filter((c) => c && (c.process_graph || c.actors || c.steps));
  const actorMap = new Map();
  const actorIdRedirect = new Map();
  const combinedSteps = [];
  const combinedTransitions = [];
  const entitiesSet = new Set();
  const apisSet = new Set();

  validCanvases.forEach((canvasItem, cIdx) => {
    const graph = canvasItem.process_graph || canvasItem;
    const canvasId = canvasItem.session_id || graph.session_id || `canvas_${cIdx + 1}`;
    const actors = graph.actors || [];
    const steps = graph.steps || [];
    const transitions = graph.transitions || [];

    actors.forEach((actor) => {
      const normName = String(actor.name || actor.id || 'Operador').trim().toLowerCase();
      if (!actorMap.has(normName)) {
        actorMap.set(normName, {
          ...actor,
          id: actor.id || `act_${actorMap.size + 1}`
        });
      }
      actorIdRedirect.set(`${canvasId}:${actor.id}`, actorMap.get(normName).id);
    });

    const stepIdRedirect = new Map();
    steps.forEach((step, sIdx) => {
      const remappedActorId =
        actorIdRedirect.get(`${canvasId}:${step.actor_id}`) ||
        step.actor_id ||
        'role_general';
      const newStepId = `${canvasId}_${step.id || `stp_${sIdx + 1}`}`;
      stepIdRedirect.set(step.id, newStepId);
      combinedSteps.push({
        ...step,
        id: newStepId,
        original_step_id: step.id,
        source_canvas_id: canvasId,
        source_canvas_title: canvasItem.canvas_title || graph?.business_context?.process_name || 'Lienzo',
        actor_id: remappedActorId
      });
    });

    transitions.forEach((tr) => {
      const from = stepIdRedirect.get(tr.from);
      const to = stepIdRedirect.get(tr.to);
      if (from && to) {
        combinedTransitions.push({ ...tr, from, to });
      }
    });

    (graph.engineering_artifacts?.detected_entities || []).forEach((e) => entitiesSet.add(e));
    (graph.engineering_artifacts?.external_apis_needed || []).forEach((a) => apisSet.add(a));
  });

  const firstGraph = validCanvases[0]?.process_graph || validCanvases[0] || {};
  return {
    session_id: validCanvases[0]?.session_id || 'WS-COMBINED',
    completeness_score: firstGraph.completeness_score || 65,
    business_context: {
      company_name: workspaceName || firstGraph?.business_context?.company_name || 'Mi Negocio',
      industry: firstGraph?.business_context?.industry || 'otro_sector',
      macroprocess_category: firstGraph?.business_context?.macroprocess_category || 'operativo_core',
      process_name:
        validCanvases.length > 1
          ? `${workspaceName} (${validCanvases.length} flujos)`
          : (validCanvases[0]?.canvas_title || firstGraph?.business_context?.process_name || 'Solución Web')
    },
    actors: Array.from(actorMap.values()),
    steps: combinedSteps,
    transitions: combinedTransitions,
    engineering_artifacts: {
      detected_entities: Array.from(entitiesSet),
      external_apis_needed: Array.from(apisSet)
    }
  };
}

function buildDeterministicStories(combinedGraph) {
  const handoff = generateEngineeringHandoff(combinedGraph);
  const stepsById = new Map((combinedGraph.steps || []).map((s) => [s.id, s]));

  const stories = (handoff.user_stories || []).map((st, idx) => {
    const step = stepsById.get(st.linked_step_id);
    const artifacts = (step?.artifacts || st.artifacts || []).map((a) =>
      String(a).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
    const titleWords = String(st.action || '').trim();
    const cleanTitle = titleWords
      ? titleWords.charAt(0).toUpperCase() + titleWords.slice(1, 58)
      : `Operación ${st.role}`;

    return {
      id: `US-${String(idx + 1).padStart(2, '0')}`,
      role: st.role,
      title: cleanTitle,
      description: `Como ${st.role}, quiero ${st.action} para ${st.benefit}.`,
      acceptance_criteria: st.acceptance_criteria || [
        `El rol ${st.role} accede a su módulo operativo con trazabilidad y fecha/hora.`,
        `Se elimina el registro aislado (${st.channel_label || 'manual'}).`
      ],
      suggested_fields:
        artifacts.length > 0
          ? artifacts
          : ['Código / Referencia', 'Responsable', 'Estado', 'Observaciones'],
      linked_step_id: step?.original_step_id || st.linked_step_id || null,
      linked_canvas_id: step?.source_canvas_id || null,
      priority: st.priority || 'Media'
    };
  });

  // Si aún no hay pasos dibujados pero sí roles o es lienzo nuevo, crear historia base por rol
  if (stories.length === 0 && (combinedGraph.actors || []).length > 0) {
    return combinedGraph.actors.map((actor, idx) => ({
      id: `US-${String(idx + 1).padStart(2, '0')}`,
      role: actor.name,
      title: `Panel operativo para ${actor.name}`,
      description: `Como ${actor.name}, quiero gestionar y consultar mis registros asignados para mantener trazabilidad en línea.`,
      acceptance_criteria: [
        `Vista dedicada al rol ${actor.name}.`,
        'Registro con historial auditable y estados claros.'
      ],
      suggested_fields: ['Código', 'Cliente / Referencia', 'Estado', 'Fecha'],
      linked_step_id: null,
      linked_canvas_id: combinedGraph.session_id || null,
      priority: 'Alta'
    }));
  }

  return stories;
}

export async function generateBlueprintStories({
  workspaceName = 'Mi Negocio',
  canvases = [],
  useAi = true
}) {
  const combinedGraph = mergeCanvasGraphs(canvases, workspaceName);
  const deterministicStories = buildDeterministicStories(combinedGraph);

  if (!useAi || (combinedGraph.steps || []).length === 0) {
    return {
      stories: deterministicStories,
      source: 'deterministic',
      attempt_logs: []
    };
  }

  const systemPrompt = `Eres Arquitecto de Producto en Pathrimonio.
Convierte el flujo de procesos consolidado en Historias de Usuario claras, prácticas y listas para diseñar pantallas web por rol.
Responde SOLO en JSON con forma:
{
  "user_stories": [
    {
      "id": "US-01",
      "role": "Nombre del rol exacto del flujo",
      "title": "Título corto accionable (3-7 palabras)",
      "description": "Como <rol>, quiero <acción concreta> para <beneficio medible>.",
      "acceptance_criteria": ["criterio 1", "criterio 2"],
      "suggested_fields": ["Campo 1", "Campo 2", "Campo 3"],
      "linked_step_id": "id o null",
      "priority": "Alta" | "Media" | "Baja"
    }
  ]
}`;

  const userPrompt = `Espacio/Negocio: ${workspaceName}
Roles detectados: ${JSON.stringify(combinedGraph.actors.map((a) => ({ id: a.id, name: a.name, type: a.type })))}
Pasos del flujo: ${JSON.stringify(combinedGraph.steps.map((s) => ({ id: s.original_step_id || s.id, actor_id: s.actor_id, label: s.label, channel: s.channel, artifacts: s.artifacts, bottleneck: s.is_manual_bottleneck })))}
Genera historias agrupables por rol con criterios de aceptación concretos y campos sugeridos de captura.`;

  const aiRes = await requestStructuredJsonFromLlm({ systemPrompt, userPrompt });
  if (aiRes.ok && Array.isArray(aiRes.data?.user_stories) && aiRes.data.user_stories.length > 0) {
    const cleanStories = aiRes.data.user_stories.map((st, idx) => ({
      id: st.id || `US-${String(idx + 1).padStart(2, '0')}`,
      role: String(st.role || 'Operador'),
      title: String(st.title || 'Actividad del rol'),
      description: String(st.description || ''),
      acceptance_criteria: Array.isArray(st.acceptance_criteria) ? st.acceptance_criteria.map(String) : [],
      suggested_fields: Array.isArray(st.suggested_fields) ? st.suggested_fields.map(String) : ['Referencia', 'Estado'],
      linked_step_id: st.linked_step_id || deterministicStories[idx]?.linked_step_id || null,
      linked_canvas_id: deterministicStories[idx]?.linked_canvas_id || canvases[0]?.session_id || null,
      priority: ['Alta', 'Media', 'Baja'].includes(st.priority) ? st.priority : 'Media'
    }));
    return {
      stories: cleanStories,
      source: aiRes.provider || 'llm',
      attempt_logs: aiRes.attemptLogs || []
    };
  }

  return {
    stories: deterministicStories,
    source: 'deterministic_fallback',
    attempt_logs: aiRes.attemptLogs || []
  };
}

function buildDeterministicScreensForRoles({
  workspaceName = 'Solución Web',
  stories = [],
  canvases = [],
  existingScreens = [],
  targetRole = null,
  refinementPrompt = ''
}) {
  const combined = mergeCanvasGraphs(canvases, workspaceName);
  const roleNames = Array.from(
    new Set([
      ...(targetRole ? [targetRole] : []),
      ...(stories || []).map((s) => s.role),
      ...(combined.actors || []).map((a) => a.name)
    ].filter(Boolean))
  );

  if (roleNames.length === 0) {
    roleNames.push('Operador Principal');
  }

  const lowerRefine = String(refinementPrompt || '').toLowerCase();
  const wantsDateFilter = /(fecha|rango|calendario|filtro)/.test(lowerRefine);
  const wantsExportPdf = /(pdf|excel|exportar|imprimir)/.test(lowerRefine);
  const wantsKanban = /(kanban|tablero|estado|etapa|seguimiento)/.test(lowerRefine);

  const generated = roleNames.map((roleName, idx) => {
    const prevScreen = (existingScreens || []).find((s) => s.role === roleName);
    const roleStories = (stories || []).filter((s) => s.role === roleName);
    const primaryStory = roleStories[0];
    const fields = Array.from(
      new Set(roleStories.flatMap((s) => s.suggested_fields || []))
    ).slice(0, 6);

    const formFields = fields.length > 0
      ? fields
      : ['Código / Cliente', 'Detalle Operativo', 'Monto / Cantidad', 'Estado'];

    const tableCols = [
      'Código',
      ...formFields.slice(0, 3),
      'Estado',
      'Acción'
    ];

    const toolbarActions = [];
    if (wantsDateFilter || prevScreen?.components?.some((c) => c.toolbar_actions?.includes('Filtrar por fecha'))) {
      toolbarActions.push('Filtrar por fecha');
    }
    if (wantsExportPdf || prevScreen?.components?.some((c) => c.toolbar_actions?.includes('Exportar PDF'))) {
      toolbarActions.push('Exportar PDF');
    }

    const components = [
      {
        id: `blk_kpi_${idx + 1}`,
        type: 'kpi_row',
        hidden: false,
        items: [
          { label: 'Registros Hoy', sample_value: String(12 + idx * 5), delta: '+14%' },
          { label: 'Pendientes de Atención', sample_value: String(3 + idx), delta: 'En turno' },
          { label: 'Tiempo Promedio', sample_value: '4 min', delta: '-65% manual' }
        ]
      },
      {
        id: `blk_form_${idx + 1}`,
        type: 'action_form',
        hidden: false,
        title: primaryStory?.title || `Registrar acción de ${roleName}`,
        fields: wantsDateFilter && !formFields.some((f) => /fecha/i.test(f))
          ? [...formFields, 'Fecha de registro']
          : formFields,
        primary_action: primaryStory
          ? `Ejecutar: ${primaryStory.title.slice(0, 28)}`
          : `Guardar y notificar`
      },
      {
        id: `blk_table_${idx + 1}`,
        type: 'data_table',
        hidden: false,
        title: `Bandeja Operativa — ${roleName}`,
        columns: Array.from(new Set(tableCols)),
        toolbar_actions: toolbarActions,
        sample_rows: [
          ['REG-104', 'Cliente Referencia SAC', 'En proceso', 'Ver detalle'],
          ['REG-103', 'Operación Programada', 'Completado', 'Historial']
        ].map((row) =>
          Array.from({ length: Array.from(new Set(tableCols)).length }, (_, colIdx) => row[colIdx] || 'Activo')
        )
      }
    ];

    if (wantsKanban || roleStories.length >= 2) {
      components.push({
        id: `blk_board_${idx + 1}`,
        type: 'status_board',
        hidden: false,
        title: `Seguimiento de Estados (${roleName})`,
        columns: [
          { name: 'Por Iniciar', cards: [`REG-105 · ${roleStories[0]?.title || 'Nuevo ingreso'}`] },
          { name: 'En Proceso', cards: [`REG-104 · Validación operativa`] },
          { name: 'Listo / Entregado', cards: [`REG-102 · Cierre validado`] }
        ]
      });
    }

    return {
      screen_id: prevScreen?.screen_id || `scr_${idx + 1}_${roleName.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 18)}`,
      role: roleName,
      title: prevScreen?.title || `Módulo de ${roleName}`,
      subtitle: primaryStory?.description || `Interfaz operativa diseñada para ${roleName}`,
      components
    };
  });

  if (targetRole && existingScreens.length > 0) {
    const refreshedMap = new Map(generated.map((g) => [g.role, g]));
    const merged = existingScreens.map((scr) => refreshedMap.get(scr.role) || scr);
    generated.forEach((g) => {
      if (!merged.some((m) => m.role === g.role)) merged.push(g);
    });
    return sanitizeUiScreensPayload(merged);
  }

  return sanitizeUiScreensPayload(generated);
}

export async function generateBlueprintLayout({
  workspaceName = 'Solución Web',
  stories = [],
  canvases = [],
  themeConfig = {},
  targetRole = null,
  refinementPrompt = '',
  existingScreens = [],
  useAi = true
}) {
  const deterministicScreens = buildDeterministicScreensForRoles({
    workspaceName,
    stories,
    canvases,
    existingScreens,
    targetRole,
    refinementPrompt
  });

  if (!useAi) {
    return {
      ui_screens: deterministicScreens,
      source: 'deterministic',
      attempt_logs: []
    };
  }

  const presetLabel = THEME_PRESETS[themeConfig?.preset]?.label || 'Minimalista Oscuro';
  const systemPrompt = `Eres Diseñador UI de Aplicaciones Empresariales (SDD).
NO generes HTML ni CSS libre. Genera ÚNICAMENTE un esquema declarativo JSON seguro usando EXCLUSIVAMENTE estos 4 tipos de bloque en "components":
1. { "type": "kpi_row", "items": [{ "label": string, "sample_value": string, "delta"?: string }] }
2. { "type": "action_form", "title": string, "fields": string[], "primary_action": string }
3. { "type": "data_table", "title": string, "columns": string[], "toolbar_actions"?: string[], "sample_rows"?: string[][] }
4. { "type": "status_board", "title": string, "columns": [{ "name": string, "cards": string[] }] }

Formato exacto de salida JSON:
{
  "ui_screens": [
    {
      "screen_id": "scr_...",
      "role": "Nombre exacto del rol",
      "title": "Título de pantalla",
      "subtitle": "Subtítulo breve",
      "components": [...]
    }
  ]
}`;

  const targetStories = targetRole
    ? (stories || []).filter((s) => s.role === targetRole)
    : (stories || []);

  const userPrompt = `Negocio/Espacio: ${workspaceName}
Tema visual seleccionado: ${presetLabel} (${themeConfig?.primary_color || '#FFC000'})
${targetRole ? `Refinar específicamente pantalla para el rol: "${targetRole}"` : 'Genera 1 pantalla práctica por cada rol principal.'}
${refinementPrompt ? `INSTRUCCIÓN DE REFINAMIENTO DEL USUARIO: "${refinementPrompt}"` : ''}
Historias de Usuario disponibles: ${JSON.stringify(targetStories)}
${targetRole && existingScreens.length > 0 ? `Pantalla previa de este rol: ${JSON.stringify(existingScreens.find((s) => s.role === targetRole) || null)}` : ''}`;

  const aiRes = await requestStructuredJsonFromLlm({ systemPrompt, userPrompt });
  if (aiRes.ok && Array.isArray(aiRes.data?.ui_screens) && aiRes.data.ui_screens.length > 0) {
    const sanitized = sanitizeUiScreensPayload(aiRes.data.ui_screens);
    if (sanitized.length > 0) {
      let merged = sanitized;
      if (targetRole && existingScreens.length > 0) {
        const updatedRoleScreen = sanitized.find((s) => s.role.toLowerCase() === targetRole.toLowerCase()) || sanitized[0];
        merged = existingScreens.map((s) =>
          s.role.toLowerCase() === targetRole.toLowerCase() ? { ...updatedRoleScreen, role: s.role } : s
        );
      }
      return {
        ui_screens: merged,
        source: aiRes.provider || 'llm',
        attempt_logs: aiRes.attemptLogs || []
      };
    }
  }

  return {
    ui_screens: deterministicScreens,
    source: 'deterministic_fallback',
    attempt_logs: aiRes.attemptLogs || []
  };
}
