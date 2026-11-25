import { applyGraphPatches, createInitialProcessGraph } from '../../../../../src/lib/formalia/schema.js';
import { extractProcessTurn } from '../../../../../src/lib/formalia/extractorEngine.js';
import { getSession, saveSession, MAX_TURNS_PER_SESSION } from '../../../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const userMessage = (body.message || '').trim();
  const clientGraph = body.process_graph || null;

  if (!userMessage) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  let session = await getSession(id);
  if (!session) {
    session = {
      session_id: id,
      process_graph: clientGraph || createInitialProcessGraph(id),
      messages: [],
      turns_count: 0,
      completeness_score: clientGraph?.completeness_score || 5
    };
  }

  if (session.turns_count >= MAX_TURNS_PER_SESSION) {
    return res.status(429).json({
      error: `Límite máximo de ${MAX_TURNS_PER_SESSION} turnos por sesión anónima alcanzado. Descarga tu diagrama o cotiza tu sistema.`,
      turns_count: session.turns_count,
      process_graph: session.process_graph
    });
  }

  const baseGraph = clientGraph || session.process_graph;
  const nextTurn = (session.turns_count || 0) + 1;

  const extraction = await extractProcessTurn({
    userMessage,
    currentGraph: baseGraph,
    turnCount: nextTurn
  });

  let updatedGraph = applyGraphPatches(baseGraph, extraction.graph_patch);
  updatedGraph.completeness_score = extraction.completeness_score;
  if (extraction.phase) updatedGraph.phase = extraction.phase;

  const assistantMsg = {
    id: `msg_${Date.now()}_a`,
    role: 'assistant',
    content: extraction.assistant_message,
    quick_replies: extraction.quick_replies,
    graph_patch: extraction.graph_patch,
    phase: updatedGraph.phase,
    timestamp: new Date().toISOString()
  };

  session.process_graph = updatedGraph;
  session.turns_count = nextTurn;
  session.completeness_score = updatedGraph.completeness_score;
  session.messages = [
    ...(session.messages || []),
    { id: `msg_${Date.now()}_u`, role: 'user', content: userMessage, timestamp: new Date().toISOString() },
    assistantMsg
  ];

  await saveSession(session);

  return res.status(200).json({
    session_id: id,
    assistant_message: extraction.assistant_message,
    quick_replies: extraction.quick_replies,
    graph_patch: extraction.graph_patch,
    completeness_score: updatedGraph.completeness_score,
    phase: updatedGraph.phase,
    turns_count: nextTurn,
    max_turns: MAX_TURNS_PER_SESSION,
    process_graph: updatedGraph,
    engine_source: extraction.engine_source
  });
}
