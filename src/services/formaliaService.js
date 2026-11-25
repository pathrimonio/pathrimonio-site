import {
  applyGraphPatches,
  createInitialProcessGraph,
  generateFormaliaSessionId
} from '../lib/formalia/schema';
import { extractProcessTurn } from '../lib/formalia/extractorEngine';
import {
  generateEngineeringHandoff,
  graphToPlantUML,
  mapProcessToQuoteConfig
} from '../lib/formalia/compilers';

const FORMALIA_STORAGE_KEY = 'pathrimonio_formalia_session_v1';
const MAX_TURNS = 15;

export function createWelcomeMessage() {
  return {
    id: `msg_${Date.now()}_welcome`,
    role: 'assistant',
    content:
      'Hola, soy FormalIA. Cuéntame en tus propias palabras: ¿qué proceso de tu negocio te genera hoy más desorden? (Ej. Ventas, Despachos, Pedidos)',
    quick_replies: [
      'Recibimos pedidos por WhatsApp, anotamos en Excel y despachamos en ruta',
      'Comercio / Bodega: ventas en caja, control de stock e inventario manual',
      'Restaurante / Delivery: comandas, cocina y entregas con demora'
    ],
    phase: '1_context',
    timestamp: new Date().toISOString()
  };
}

export function loadLocalFormaliaSession() {
  try {
    const raw = localStorage.getItem(FORMALIA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.session_id && parsed.process_graph) {
        return parsed;
      }
    }
  } catch (_) {}
  return null;
}

export function saveLocalFormaliaSession(session) {
  try {
    localStorage.setItem(FORMALIA_STORAGE_KEY, JSON.stringify(session));
  } catch (_) {}
}

export function clearLocalFormaliaSession() {
  try {
    localStorage.removeItem(FORMALIA_STORAGE_KEY);
  } catch (_) {}
}

async function tryApiJson(url, options) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    const data = await res.json();
    if (!res.ok) return { _apiError: true, status: res.status, ...data };
    return data;
  } catch (_) {
    return null;
  }
}

export async function startFormaliaSession() {
  const apiRes = await tryApiJson('/api/v1/formalia/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (apiRes && !apiRes._apiError && apiRes.session_id) {
    const session = {
      session_id: apiRes.session_id,
      process_graph: apiRes.process_graph,
      messages: [apiRes.greeting || createWelcomeMessage()],
      turns_count: apiRes.turns_count || 0,
      max_turns: apiRes.max_turns || MAX_TURNS
    };
    saveLocalFormaliaSession(session);
    return session;
  }

  const sessionId = generateFormaliaSessionId();
  const graph = createInitialProcessGraph(sessionId);
  const session = {
    session_id: sessionId,
    process_graph: graph,
    messages: [createWelcomeMessage()],
    turns_count: 0,
    max_turns: MAX_TURNS
  };
  saveLocalFormaliaSession(session);
  return session;
}

export async function sendFormaliaMessage({ sessionId, message, currentGraph, turnsCount }) {
  if (turnsCount >= MAX_TURNS) {
    throw new Error(`Alcanzaste el límite de ${MAX_TURNS} turnos para esta sesión gratuita. Descarga tu diagrama o cotiza tu sistema.`);
  }

  const apiRes = await tryApiJson(`/api/v1/formalia/sessions/${encodeURIComponent(sessionId)}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, process_graph: currentGraph })
  });

  if (apiRes && !apiRes._apiError && apiRes.process_graph) {
    return apiRes;
  }

  // Fallback cliente determinista / Gemini directo
  const nextTurn = turnsCount + 1;
  const extraction = await extractProcessTurn({
    userMessage: message,
    currentGraph,
    turnCount: nextTurn
  });

  const updatedGraph = applyGraphPatches(currentGraph, extraction.graph_patch);
  updatedGraph.completeness_score = extraction.completeness_score;
  if (extraction.phase) updatedGraph.phase = extraction.phase;

  return {
    session_id: sessionId,
    assistant_message: extraction.assistant_message,
    quick_replies: extraction.quick_replies,
    graph_patch: extraction.graph_patch,
    completeness_score: updatedGraph.completeness_score,
    phase: updatedGraph.phase,
    turns_count: nextTurn,
    max_turns: MAX_TURNS,
    process_graph: updatedGraph,
    engine_source: extraction.engine_source
  };
}

export async function convertFormaliaToQuote({ sessionId, graph }) {
  const apiRes = await tryApiJson(`/api/v1/formalia/sessions/${encodeURIComponent(sessionId)}/to-quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ process_graph: graph })
  });

  if (apiRes && !apiRes._apiError && apiRes.configuration) {
    return apiRes;
  }

  return mapProcessToQuoteConfig(graph);
}

export async function submitQuoteWithFormaliaHandoff(quotePayload, formaliaGraph = null) {
  const handoff = formaliaGraph ? generateEngineeringHandoff(formaliaGraph) : null;
  const fullPayload = {
    ...quotePayload,
    formalia_session_id: formaliaGraph?.session_id || quotePayload.formalia_session_id || null,
    process_graph: formaliaGraph || undefined,
    engineering_handoff: handoff
  };

  const apiRes = await tryApiJson('/api/v1/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullPayload)
  });

  if (apiRes && !apiRes._apiError) {
    return apiRes;
  }

  return {
    status: 'local_ok',
    quote_id: quotePayload.quote_id,
    formalia_session_id: fullPayload.formalia_session_id,
    handoff_generated: Boolean(handoff),
    engineering_handoff: handoff
  };
}

export function downloadPlantUMLFile(graph) {
  const puml = graphToPlantUML(graph);
  const blob = new Blob([puml], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${graph?.session_id || 'formalia'}-carriles.puml`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCanonicalJSONFile(graph) {
  const json = JSON.stringify(graph, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${graph?.session_id || 'formalia'}-process-graph.json`;
  a.click();
  URL.revokeObjectURL(url);
}
