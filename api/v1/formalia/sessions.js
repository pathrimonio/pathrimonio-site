import {
  createInitialProcessGraph,
  generateFormaliaSessionId,
  normalizeWorkspaceMeta
} from '../../../src/lib/formalia/schema.js';
import {
  saveSession,
  getClientIp,
  checkIpSessionQuota,
  getAiQuotaStatus,
  claimAnonymousSessionToAccount,
  checkUserWorkspaceCaps,
  ANON_SESSION_AI_LIMIT,
  AUTH_USER_DAILY_AI_LIMIT,
  getAiDailyLimitForRole
} from '../../_lib/store.js';

export default async function handler(req, res) {
  const action = req.query?.action || req.body?.action || null;
  const ip = getClientIp(req);

  // GET /api/v1/formalia/quota (rewritten to ?action=quota)
  if (req.method === 'GET' && action === 'quota') {
    const quota = await getAiQuotaStatus({
      userId: req.query?.user_id || null,
      userEmail: req.query?.user_email || null,
      userRole: req.query?.user_role || null,
      ip,
      sessionId: req.query?.session_id || null
    });
    return res.status(200).json(quota);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  // POST /api/v1/formalia/sessions/claim (rewritten to ?action=claim)
  if (action === 'claim') {
    const result = await claimAnonymousSessionToAccount({
      anonymousSessionId: body.anonymous_session_id,
      userId: body.user_id || null,
      userEmail: body.user_email || null,
      userName: body.user_name || null,
      workspaceId: body.workspace_id || null,
      workspaceName: body.workspace_name || null,
      fallbackSession: body.fallback_session || null
    });
    if (!result.ok) {
      return res.status(400).json(result);
    }
    const quota = await getAiQuotaStatus({
      userId: body.user_id || null,
      userEmail: body.user_email || null,
      userRole: body.user_role || null,
      ip,
      sessionId: result.session?.session_id
    });
    return res.status(200).json({ ...result, quota });
  }

  // POST /api/v1/formalia/sessions (Crear nuevo lienzo / sesión)
  const isAuthenticated = Boolean(body.user_id || body.user_email);

  if (!isAuthenticated) {
    const quota = checkIpSessionQuota(ip);
    if (!quota.allowed) {
      return res.status(429).json({
        error: 'Límite temporal de sesiones alcanzado. Intenta nuevamente más tarde.'
      });
    }
  } else {
    const caps = await checkUserWorkspaceCaps({
      userId: body.user_id || null,
      userEmail: body.user_email || null,
      userRole: body.user_role || null,
      workspaceId: body.workspace_id || null,
      projectId: body.project_id || null,
      creatingNewWorkspace: Boolean(body.creating_new_workspace)
    });
    if (!caps.allowed) {
      return res.status(429).json(caps);
    }
  }

  const sessionId = generateFormaliaSessionId();
  const hasWorkspaceInput = Boolean(
    body.workspace_id || body.workspace_name || body.project_id || body.canvas_title
  );
  const workspaceMeta = hasWorkspaceInput
    ? normalizeWorkspaceMeta({
        workspace_id: body.workspace_id,
        workspace_name: body.workspace_name,
        project_id: body.project_id,
        canvas_title: body.canvas_title
      })
    : null;

  const initialGraph = createInitialProcessGraph(sessionId, workspaceMeta);

  const greeting = {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content:
      workspaceMeta && workspaceMeta.canvas_title !== 'Lienzo principal'
        ? `Hola, soy FORMALIA. Abrimos el lienzo "${workspaceMeta.canvas_title}" dentro de "${workspaceMeta.workspace_name}". Cuéntame qué flujo o subproceso vas a mapear aquí para ir construyéndolo juntos paso a paso.`
        : 'Hola, soy FORMALIA. Cuéntame en tus propias palabras qué proceso de tu negocio quieres graficar (por ejemplo ventas, pedidos, despachos o atención). Primero conversamos el alcance y luego vamos detallando juntos cada rol y actividad en el diagrama.',
    quick_replies: [
      'Quiero graficar el proceso de pedidos y despachos de mi distribuidora',
      'Quiero diagramar las ventas en mostrador y control de stock de mi ferretería',
      'Necesito mapear la atención de clientes, citas y cobranza de mi clínica'
    ],
    phase: '1_context',
    timestamp: new Date().toISOString()
  };

  const record = await saveSession({
    session_id: sessionId,
    process_graph: initialGraph,
    messages: [greeting],
    turns_count: 0,
    completeness_score: initialGraph.completeness_score,
    ...(body.user_id ? { user_id: body.user_id } : {}),
    ...(body.user_email ? { user_email: body.user_email } : {}),
    ...(body.user_name ? { user_name: body.user_name } : {}),
    ...(isAuthenticated || body.saved_to_account ? { saved_to_account: true } : {}),
    ...(workspaceMeta || {}),
    process_name:
      workspaceMeta?.canvas_title && workspaceMeta.canvas_title !== 'Lienzo principal'
        ? workspaceMeta.canvas_title
        : initialGraph.business_context.process_name,
    created_at: new Date().toISOString()
  });

  const quotaStatus = await getAiQuotaStatus({
    userId: body.user_id || null,
    userEmail: body.user_email || null,
    userRole: body.user_role || null,
    ip,
    sessionId: record.session_id
  });

  return res.status(201).json({
    session_id: record.session_id,
    greeting,
    process_graph: record.process_graph,
    workspace_id: record.workspace_id || null,
    workspace_name: record.workspace_name || null,
    project_id: record.project_id || null,
    canvas_title: record.canvas_title || null,
    turns_count: record.turns_count,
    max_turns: quotaStatus?.daily_limit || getAiDailyLimitForRole(body.user_role, isAuthenticated),
    quota: quotaStatus
  });
}
