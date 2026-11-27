import { applyGraphPatches, createInitialProcessGraph } from '../../../../../src/lib/formalia/schema.js';
import { extractProcessTurn } from '../../../../../src/lib/formalia/extractorEngine.js';
import { graphToPlantUML } from '../../../../../src/lib/formalia/compilers.js';
import {
  getSession,
  saveSession,
  saveArtifactVersion,
  recordApiUsageEvent,
  getClientIp,
  getAiQuotaStatus,
  recordAiQuotaTurn
} from '../../../../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const ip = getClientIp(req);
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

  if (body.account_link && (body.account_link.saved_to_account || body.account_link.user_email || body.account_link.user_id || body.account_link.workspace_id)) {
    if (body.account_link.user_id) session.user_id = body.account_link.user_id;
    if (body.account_link.user_email) session.user_email = body.account_link.user_email;
    if (body.account_link.user_name) session.user_name = body.account_link.user_name;
    if (body.account_link.workspace_id) session.workspace_id = body.account_link.workspace_id;
    if (body.account_link.workspace_name) session.workspace_name = body.account_link.workspace_name;
    if (body.account_link.project_id !== undefined) session.project_id = body.account_link.project_id;
    if (body.account_link.canvas_title) session.canvas_title = body.account_link.canvas_title;
    if (body.account_link.saved_to_account || body.account_link.user_id || body.account_link.user_email) {
      session.saved_to_account = true;
    }
  }

  const effectiveUserId = body.account_link?.user_id || session.user_id || null;
  const effectiveUserEmail = body.account_link?.user_email || session.user_email || null;
  const effectiveUserRole = body.account_link?.user_role || body.user_role || session.user_role || null;

  // Validación estricta de cuota de IA ANTES de invocar el LLM (5 anon / 15 user / 45 socio)
  const quotaBefore = await getAiQuotaStatus({
    userId: effectiveUserId,
    userEmail: effectiveUserEmail,
    userRole: effectiveUserRole,
    ip,
    sessionId: id
  });

  if (!quotaBefore.allowed) {
    const errMsg = quotaBefore.is_authenticated
      ? `Usaste tus ${quotaBefore.daily_limit} turnos de IA de hoy; se renuevan mañana (00:00 UTC). Puedes seguir editando tus diagramas, historias y maquetas manualmente.`
      : 'Alcanzaste los 5 turnos gratuitos de IA de esta sesión. Inicia sesión gratis para conservar tu diagrama y obtener 15 turnos diarios de IA.';
    return res.status(429).json({
      error: errMsg,
      code: 'AI_QUOTA_EXCEEDED',
      reset_at: quotaBefore.reset_at,
      quota: quotaBefore,
      turns_count: session.turns_count || 0,
      process_graph: session.process_graph
    });
  }

  const baseGraph = clientGraph || session.process_graph;
  const nextTurn = (session.turns_count || 0) + 1;
  const conversationHistory =
    (Array.isArray(req.body?.history) && req.body.history.length > 0 ? req.body.history : null) ||
    (Array.isArray(req.body?.messages) && req.body.messages.length > 0 ? req.body.messages : null) ||
    (Array.isArray(session.messages) ? session.messages : []);

  const extraction = await extractProcessTurn({
    userMessage,
    currentGraph: baseGraph,
    turnCount: nextTurn,
    conversationHistory
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

  const versionNumber = (session.versions?.length || 0) + 1;
  const versionLabel = `v${versionNumber}`;
  const pumlCode = graphToPlantUML(updatedGraph);
  const versionSnapshot = {
    version_number: versionNumber,
    version_label: versionLabel,
    created_at: new Date().toISOString(),
    turns_count: nextTurn,
    completeness_score: updatedGraph.completeness_score,
    actors_count: updatedGraph.actors?.length || 0,
    steps_count: updatedGraph.steps?.length || 0,
    change_summary: userMessage.slice(0, 110),
    process_graph: updatedGraph,
    plantuml: pumlCode
  };

  session.versions = [...(session.versions || []), versionSnapshot];
  await saveSession(session);

  if (Array.isArray(extraction.attempt_logs) && extraction.attempt_logs.length > 0) {
    await Promise.all(
      extraction.attempt_logs.map((ev) => recordApiUsageEvent(ev).catch(() => null))
    );
  }

  await saveArtifactVersion({
    id: `${id}_puml_${versionLabel}`,
    session_id: id,
    version_number: versionNumber,
    version_label: versionLabel,
    artifact_kind: 'puml',
    file_name: `FORMALIA-${id}-${versionLabel}.puml`,
    mime_type: 'text/plain',
    content_text: pumlCode,
    size_bytes: Buffer.byteLength(pumlCode, 'utf8'),
    change_summary: `Turno ${nextTurn}: ${userMessage.slice(0, 80)}`,
    chat_turns_at: nextTurn,
    created_at: versionSnapshot.created_at
  });

  await recordAiQuotaTurn({
    userId: effectiveUserId,
    userEmail: effectiveUserEmail,
    ip,
    sessionId: id,
    workspaceId: session.workspace_id || updatedGraph?.workspace_meta?.workspace_id || null,
    actionType: 'PROCESS_CHAT'
  });

  const quotaAfter = await getAiQuotaStatus({
    userId: effectiveUserId,
    userEmail: effectiveUserEmail,
    userRole: effectiveUserRole,
    ip,
    sessionId: id
  });

  return res.status(200).json({
    session_id: id,
    assistant_message: extraction.assistant_message,
    quick_replies: extraction.quick_replies,
    graph_patch: extraction.graph_patch,
    completeness_score: updatedGraph.completeness_score,
    phase: updatedGraph.phase,
    turns_count: nextTurn,
    max_turns: quotaAfter.daily_limit,
    quota: quotaAfter,
    process_graph: updatedGraph,
    version: versionSnapshot,
    versions: session.versions,
    engine_source: extraction.engine_source
  });
}
