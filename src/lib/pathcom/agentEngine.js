import { DEFAULT_PATHCOM_MODULE_FLAGS } from './rbacPolicy.js';
import { executePathcomTool } from './toolExecutor.js';

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

const GEMINI_FUNCTION_DECLARATIONS = [
  {
    name: 'path_log_tool',
    description: 'Gestiona la línea de tiempo cronológica de avances del usuario (create_log, list_timeline, summarize_progress).',
    parameters: {
      type: 'OBJECT',
      properties: {
        operation: { type: 'STRING', enum: ['create_log', 'list_timeline', 'summarize_progress'] },
        title: { type: 'STRING', description: 'Título corto del avance para create_log' },
        content: { type: 'STRING', description: 'Descripción detallada del avance realizado' },
        duration_minutes: { type: 'NUMBER', description: 'Duración invertida en minutos (opcional)' },
        progress_percent: { type: 'NUMBER', description: 'Porcentaje acumulado 0-100' },
        market_path_id: { type: 'STRING', description: 'ID opcional de ruta del Market' }
      },
      required: ['operation']
    }
  },
  {
    name: 'market_curator_tool',
    description: 'Consulta o compila rutas en Pathrimonio Market y registra validaciones de pares.',
    parameters: {
      type: 'OBJECT',
      properties: {
        operation: {
          type: 'STRING',
          enum: ['list_market', 'get_market_path', 'compile_logs_to_path', 'submit_for_review', 'record_validation']
        },
        market_path_id: { type: 'STRING' },
        title: { type: 'STRING' },
        category: { type: 'STRING' },
        summary: { type: 'STRING' },
        score: { type: 'NUMBER' },
        feedback: { type: 'STRING' },
        submit_immediately: { type: 'BOOLEAN' },
        request_patrimonio_validated: { type: 'BOOLEAN' }
      },
      required: ['operation']
    }
  },
  {
    name: 'projects_ops_tool',
    description: 'Lista proyectos publicados/propios, actualiza borradores de proyecto o consulta resúmenes internos de Formalia.',
    parameters: {
      type: 'OBJECT',
      properties: {
        operation: { type: 'STRING', enum: ['list_projects', 'update_project_draft', 'get_formalia_summary'] },
        project_id: { type: 'STRING' },
        draft_name: { type: 'STRING' },
        draft_status: { type: 'STRING', enum: ['DISCOVERY', 'IN_PROGRESS', 'LIVE'] },
        draft_summary: { type: 'STRING' }
      },
      required: ['operation']
    }
  },
  {
    name: 'site_cms_tool',
    description: 'Prepara borradores CMS (DRAFT) o solicita aprobación para publicar cambios web en pathcom_action_queue.',
    parameters: {
      type: 'OBJECT',
      properties: {
        operation: { type: 'STRING', enum: ['create_section_draft', 'request_publish'] },
        project_id: { type: 'STRING' },
        draft_name: { type: 'STRING' },
        draft_status: { type: 'STRING', enum: ['DISCOVERY', 'IN_PROGRESS', 'LIVE'] },
        draft_summary: { type: 'STRING' }
      },
      required: ['operation']
    }
  },
  {
    name: 'pathway_bridge_tool',
    description: 'Sincroniza e importa hitos registrados en la app Pathway hacia path_logs sin duplicados.',
    parameters: {
      type: 'OBJECT',
      properties: {
        operation: { type: 'STRING', enum: ['fetch_user_milestones', 'import_pathway_logs'] }
      },
      required: ['operation']
    }
  }
];

function buildSystemPrompt(actor, clientTimezone) {
  return `Eres Pathcom (Pathrimonio Community & Operations Manager) dentro de pathrimonio.site.
Tu rol actual ante el usuario autenticado o visitante:
- Rol RBAC efectivo verificado por el servidor: "${actor.roleCode}"
- Zona horaria del usuario: "${clientTimezone}"

Reglas estrictas:
1. Usa herramientas (function calling) cuando el usuario pida registrar avances, ver su línea de tiempo, explorar o compilar rutas de Pathrimonio Market, consultar proyectos, preparar borradores CMS o sincronizar Pathway.
2. Nunca muestres JSON crudo en tu respuesta; responde en español claro, directo y conciso con el resumen legible de la acción ejecutada.
3. Respeta la gobernanza: si el servidor rechaza una tool por RBAC (rbac_denied: true), informa claramente al usuario que su rol actual ("${actor.roleCode}") no tiene permisos para esa acción y qué alternativa sí puede usar.
4. Ningún cambio de site_cms_tool se publica directo en la landing: siempre queda en DRAFT o en la cola pathcom_action_queue esperando aprobación.
5. Si pregunta por clubes como "Pathrimonio Fit", explica que está reservado en arquitectura como extensión desacoplada para una fase futura.`;
}

function parseDeterministicIntent(message = '', clientTimezone = 'America/Lima') {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();

  if (/(club|pathrimonio\s*fit|fitness|deportivo\s+fit)/i.test(lower)) {
    return {
      toolName: 'clubs_domain_tool',
      operation: 'list_clubs',
      args: {}
    };
  }

  if (/(publicar|publica).*(landing|portada|web|sitio|cms)|(enviar.*aprobaci[oó]n|solicitar.*publicaci[oó]n)/i.test(lower)) {
    const projectMatch = text.match(/proyecto\s+["']?([a-zA-Z0-9_-]+)/i);
    return {
      toolName: 'site_cms_tool',
      operation: 'request_publish',
      args: {
        project_id: projectMatch?.[1] || 'core-hub',
        draft_summary: text.length > 30 ? text : undefined
      }
    };
  }

  if (/(borrador|draft).*(cms|web|proyecto|resumen|core)/i.test(lower)) {
    const projectMatch = text.match(/(?:proyecto|para)\s+["']?([a-zA-Z0-9_-]+)/i);
    const cleanedSummary = text
      .replace(/^.*?(?:resumen|draft|borrador)\s*(?:para|de|:)?\s*/i, '')
      .trim();
    return {
      toolName: 'site_cms_tool',
      operation: 'create_section_draft',
      args: {
        project_id: projectMatch?.[1]?.toLowerCase() === 'core' ? 'core-hub' : (projectMatch?.[1] || 'core-hub'),
        draft_summary: cleanedSummary || 'Actualización operativa propuesta desde Pathcom.'
      }
    };
  }

  if (/(formalia|expediente)/i.test(lower)) {
    return {
      toolName: 'projects_ops_tool',
      operation: 'get_formalia_summary',
      args: {}
    };
  }

  if (/(pathway|hito|sincroniz)/i.test(lower)) {
    return {
      toolName: 'pathway_bridge_tool',
      operation: /(ver|listar|consultar|fetch)/i.test(lower) ? 'fetch_user_milestones' : 'import_pathway_logs',
      args: { client_timezone: clientTimezone }
    };
  }

  if (/(compilar|compila|crear\s+gu[ií]a|armar\s+ruta).*(market|gu[ií]a|ruta)/i.test(lower)) {
    const titleMatch = text.match(/(?:t[ií]tulo|llamada|sobre)\s+["']?([^"'\n]+)/i);
    return {
      toolName: 'market_curator_tool',
      operation: 'compile_logs_to_path',
      args: {
        title: titleMatch?.[1]?.trim(),
        submit_immediately: /(revisi[oó]n|publicar|market)/i.test(lower)
      }
    };
  }

  if (/(calificar|validar|puntuar).*(mp-|ruta)/i.test(lower)) {
    const idMatch = text.match(/(MP-[A-Z0-9-]+)/i);
    const scoreMatch = text.match(/\b([1-5])\s*(?:estrellas?|\/\s*5)?\b/i);
    return {
      toolName: 'market_curator_tool',
      operation: 'record_validation',
      args: {
        market_path_id: idMatch?.[1] || 'MP-2026-002',
        score: scoreMatch ? Number(scoreMatch[1]) : 5,
        feedback: text
      }
    };
  }

  if (/(market|rutas?\s+validadas|gu[ií]as)/i.test(lower)) {
    return {
      toolName: 'market_curator_tool',
      operation: 'list_market',
      args: {}
    };
  }

  if (/(proyectos?|site_projects|portafolio)/i.test(lower)) {
    return {
      toolName: 'projects_ops_tool',
      operation: 'list_projects',
      args: {}
    };
  }

  if (/(l[ií]nea\s+de\s+tiempo|timeline|mis\s+avances|resumen\s+de\s+progreso|cu[aá]ntos\s+minutos)/i.test(lower)) {
    return {
      toolName: 'path_log_tool',
      operation: /(resumen|minutos|total)/i.test(lower) ? 'summarize_progress' : 'list_timeline',
      args: {}
    };
  }

  if (/(registrar|anotar|guardar|log|avance|hoy\s+comple)/i.test(lower)) {
    const minMatch = text.match(/(\d+)\s*(?:min|minutos)/i);
    const pctMatch = text.match(/(\d+)\s*%/);
    const cleanedTitle = text
      .replace(/^(?:registrar|anotar|guardar)\s+(?:avance|registro|log)\s*:?\s*/i, '')
      .replace(/\(\s*\d+\s*min[^)]*\)/gi, '')
      .trim();
    return {
      toolName: 'path_log_tool',
      operation: 'create_log',
      args: {
        title: cleanedTitle || 'Avance operativo registrado en Pathcom',
        content: text,
        duration_minutes: minMatch ? Number(minMatch[1]) : 30,
        progress_percent: pctMatch ? Number(pctMatch[1]) : 50,
        client_timezone: clientTimezone
      }
    };
  }

  return null;
}

function summarizeToolExecutions(toolResults = [], actor) {
  if (!toolResults.length) {
    return actor.roleCode === 'guest'
      ? 'Soy Pathcom. Puedo mostrarte los proyectos publicados de pathrimonio.site y las rutas validadas en Pathrimonio Market. Para registrar avances cronológicos con hora exacta, inicia sesión.'
      : 'Soy Pathcom. Puedo registrar tu avance con hora exacta, mostrar tu línea de tiempo, compilar rutas para Pathrimonio Market o consultar los proyectos actuales.';
  }

  const denied = toolResults.find((r) => r.rbac_denied || r.code === 'FEATURE_DISABLED');
  if (denied) {
    return denied.error;
  }

  return toolResults
    .map((r) => (r.ok ? r.summary : `No se pudo completar (${r.tool_name}): ${r.error}`))
    .join('\n');
}

async function runGeminiToolTurn({ message, actor, repo, featureFlags, clientTimezone, history, creds }) {
  const attemptLogs = [];
  const maskKey = (k) => (k.length <= 10 ? `${k.slice(0, 3)}••••` : `${k.slice(0, 5)}••••${k.slice(-4)}`);
  const models = ['gemini-flash-lite-latest', 'gemini-3-flash-preview'];

  const recentContents = (Array.isArray(history) ? history.slice(-6) : [])
    .filter((m) => m && m.content)
    .map((m) => ({
      role: m.sender === 'user' || m.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m.content) }]
    }));

  const contents = [...recentContents, { role: 'user', parts: [{ text: message }] }];

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
            system_instruction: { parts: [{ text: buildSystemPrompt(actor, clientTimezone) }] },
            contents,
            tools: [{ functionDeclarations: GEMINI_FUNCTION_DECLARATIONS }],
            generationConfig: { temperature: 0.25 }
          })
        }
      );

      const latencyMs = Date.now() - t0;
      if (!res.ok) {
        attemptLogs.push({
          key_id: 'server_gemini',
          key_label: 'Google Gemini API (Servidor Pathcom)',
          key_fingerprint: maskKey(creds.apiKey),
          provider: 'gemini',
          model,
          source_module: 'pathcom',
          scope: 'server',
          http_status: res.status,
          success: false,
          latency_ms: latencyMs
        });
        continue;
      }

      const json = await res.json();
      const usage = json?.usageMetadata || {};
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const fnCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall);
      const textParts = parts.filter((p) => p.text).map((p) => p.text).join('\n').trim();

      attemptLogs.push({
        key_id: 'server_gemini',
        key_label: 'Google Gemini API (Servidor Pathcom)',
        key_fingerprint: maskKey(creds.apiKey),
        provider: 'gemini',
        model,
        source_module: 'pathcom',
        scope: 'server',
        http_status: 200,
        success: true,
        prompt_tokens: Number(usage.promptTokenCount) || 0,
        output_tokens: Number(usage.candidatesTokenCount) || 0,
        total_tokens: Number(usage.totalTokenCount) || 0,
        latency_ms: latencyMs
      });

      const toolExecutions = [];
      for (const call of fnCalls) {
        const op = call.args?.operation || 'list_market';
        const args = { ...(call.args || {}), client_timezone: clientTimezone };
        const execResult = await executePathcomTool({
          actor,
          toolName: call.name,
          operation: op,
          args,
          repo,
          featureFlags
        });
        toolExecutions.push(execResult);
      }

      // Si Gemini no invocó ninguna tool pero el texto sugiere intención explícita, usar parser determinista
      if (toolExecutions.length === 0) {
        const intent = parseDeterministicIntent(message, clientTimezone);
        if (intent) {
          const execResult = await executePathcomTool({
            actor,
            toolName: intent.toolName,
            operation: intent.operation,
            args: intent.args,
            repo,
            featureFlags
          });
          toolExecutions.push(execResult);
        }
      }

      const hasDenied = toolExecutions.some((t) => t.rbac_denied);
      const replyText =
        hasDenied || toolExecutions.length > 0
          ? summarizeToolExecutions(toolExecutions, actor)
          : textParts || summarizeToolExecutions([], actor);

      return {
        ok: true,
        reply_text: replyText,
        tool_executions: toolExecutions,
        rbac_denied: hasDenied,
        engine_source: 'gemini_tool_calling',
        llm_model: model,
        attempt_logs: attemptLogs
      };
    } catch (_) {
      // Siguiente candidato o fallback
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, attempt_logs: attemptLogs };
}

/**
 * Ejecuta un turno conversacional de Pathcom usando LLM Tool Calling o motor determinista local.
 */
export async function runPathcomAgentTurn({
  message,
  actor,
  repo,
  featureFlags = DEFAULT_PATHCOM_MODULE_FLAGS,
  clientTimezone = 'America/Lima',
  history = []
}) {
  const cleanMsg = String(message || '').trim();
  const creds = getAiCredentials();

  if (creds?.provider === 'gemini') {
    const llmResult = await runGeminiToolTurn({
      message: cleanMsg,
      actor,
      repo,
      featureFlags,
      clientTimezone,
      history,
      creds
    });
    if (llmResult.ok) {
      return llmResult;
    }
  }

  // Respaldo determinista confiable con el mismo enforcement RBAC
  const intent = parseDeterministicIntent(cleanMsg, clientTimezone);
  const toolExecutions = [];
  if (intent) {
    const execResult = await executePathcomTool({
      actor,
      toolName: intent.toolName,
      operation: intent.operation,
      args: intent.args,
      repo,
      featureFlags
    });
    toolExecutions.push(execResult);
  }

  const hasDenied = toolExecutions.some((t) => t.rbac_denied);
  return {
    ok: true,
    reply_text: summarizeToolExecutions(toolExecutions, actor),
    tool_executions: toolExecutions,
    rbac_denied: hasDenied,
    engine_source: 'deterministic_tool_router',
    llm_model: null,
    attempt_logs: []
  };
}
