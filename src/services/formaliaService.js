import {
  applyGraphPatches,
  createInitialProcessGraph,
  extractWorkspaceMeta,
  generateFormaliaSessionId,
  normalizeWorkspaceMeta
} from '../lib/formalia/schema.js';
import {
  ANON_SESSION_AI_LIMIT,
  AUTH_USER_DAILY_AI_LIMIT,
  getAiDailyLimitForRole,
  createDefaultWebBlueprint,
  sanitizeUiScreensPayload
} from '../lib/formalia/blueprintSchema.js';
import {
  generateBlueprintStories,
  generateBlueprintLayout
} from '../lib/formalia/blueprintGenerator.js';
import { extractProcessTurn } from '../lib/formalia/extractorEngine.js';
import {
  generateEngineeringHandoff,
  graphToPlantUML,
  mapProcessToQuoteConfig
} from '../lib/formalia/compilers.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const FORMALIA_STORAGE_KEY = 'pathrimonio_formalia_session_v1';
const FORMALIA_ARCHIVE_KEY = 'pathrimonio_formalia_archive_v1';
const FORMALIA_WORKSPACES_KEY = 'pathrimonio_formalia_workspaces_v1';
const FORMALIA_BLUEPRINTS_KEY = 'pathrimonio_formalia_blueprints_v1';
const MAX_TURNS = ANON_SESSION_AI_LIMIT;

export function createWelcomeMessage() {
  return {
    id: `msg_${Date.now()}_welcome`,
    role: 'assistant',
    content:
      'Hola, soy FORMALIA. Cuéntame en tus propias palabras qué proceso de tu negocio quieres graficar (por ejemplo ventas, pedidos, despachos o atención). Primero conversamos el alcance y luego vamos detallando juntos cada rol y actividad en el diagrama.',
    quick_replies: [
      'Quiero graficar el proceso de pedidos y despachos de mi distribuidora',
      'Quiero diagramar las ventas en mostrador y control de stock de mi ferretería',
      'Necesito mapear la atención de clientes, citas y cobranza de mi clínica'
    ],
    phase: '1_context',
    timestamp: new Date().toISOString()
  };
}

function normalizeBrandingInSession(sess) {
  if (!sess) return sess;
  return {
    ...sess,
    messages: (sess.messages || []).map((m) => ({
      ...m,
      content: typeof m.content === 'string' ? m.content.replace(/FormalIA/g, 'FORMALIA') : m.content
    }))
  };
}

export function loadLocalFormaliaSession() {
  try {
    const raw = localStorage.getItem(FORMALIA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.session_id && parsed.process_graph) {
        return normalizeBrandingInSession({
          versions: [],
          generated_files: [],
          ...parsed
        });
      }
    }
  } catch (_) {}
  return null;
}

export function loadLocalFormaliaArchive() {
  try {
    const raw = localStorage.getItem(FORMALIA_ARCHIVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeBrandingInSession);
    }
  } catch (_) {}
  return [];
}

export function upsertSessionInLocalArchive(session) {
  if (!session || !session.session_id) return;
  try {
    const archive = loadLocalFormaliaArchive();
    const idx = archive.findIndex((s) => s.session_id === session.session_id);
    const stamped = {
      ...session,
      updated_at: new Date().toISOString(),
      created_at: session.created_at || new Date().toISOString()
    };
    if (idx >= 0) {
      archive[idx] = stamped;
    } else {
      archive.unshift(stamped);
    }
    localStorage.setItem(FORMALIA_ARCHIVE_KEY, JSON.stringify(archive.slice(0, 30)));
  } catch (_) {}
}

export function saveLocalFormaliaSession(session) {
  try {
    localStorage.setItem(FORMALIA_STORAGE_KEY, JSON.stringify(session));
    upsertSessionInLocalArchive(session);
  } catch (_) {}
}

export function loadLocalWorkspaces() {
  try {
    const raw = localStorage.getItem(FORMALIA_WORKSPACES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((w) => w && w.workspace_id);
    }
  } catch (_) {}
  return [];
}

export function saveLocalWorkspace(ws) {
  if (!ws || (!ws.workspace_id && !ws.workspace_name)) return null;
  const cleanName = String(ws.workspace_name || 'Espacio sin nombre').trim();
  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 28);
  const normalized = {
    workspace_id: ws.workspace_id || (ws.project_id ? `ws_proj_${ws.project_id}` : `ws_${slug || 'neg'}_${Date.now().toString(36).slice(-4)}`),
    workspace_name: cleanName,
    project_id: ws.project_id ? String(ws.project_id) : null,
    category: ws.category || (ws.project_id ? 'proyecto_portal' : 'negocio'),
    created_at: ws.created_at || new Date().toISOString()
  };
  try {
    const list = loadLocalWorkspaces();
    const idx = list.findIndex((item) => item.workspace_id === normalized.workspace_id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...normalized };
    } else {
      list.unshift(normalized);
    }
    localStorage.setItem(FORMALIA_WORKSPACES_KEY, JSON.stringify(list.slice(0, 40)));
  } catch (_) {}
  return normalized;
}

export function normalizeSessionWorkspace(sess) {
  if (!sess || !sess.session_id) return sess;
  const meta = extractWorkspaceMeta(sess);
  const nextGraph = sess.process_graph
    ? {
        ...sess.process_graph,
        workspace_meta: {
          ...(sess.process_graph.workspace_meta || {}),
          ...meta
        }
      }
    : sess.process_graph;
  return {
    ...sess,
    workspace_id: meta.workspace_id,
    workspace_name: meta.workspace_name,
    project_id: meta.project_id,
    canvas_title: meta.canvas_title,
    process_name: sess.process_name || nextGraph?.business_context?.process_name || meta.canvas_title,
    process_graph: nextGraph
  };
}

export function buildWorkspaceDirectory({
  sessions = [],
  portalProjects = [],
  customWorkspaces = []
} = {}) {
  const wsMap = new Map();

  // 1. Registrar proyectos del Portal como espacios de trabajo automáticos
  (portalProjects || []).forEach((proj) => {
    if (!proj || !proj.id) return;
    const wsId = `ws_proj_${proj.id}`;
    wsMap.set(wsId, {
      workspace_id: wsId,
      workspace_name: proj.name || `Proyecto ${proj.id}`,
      project_id: String(proj.id),
      source: 'project',
      canvases: []
    });
  });

  // 2. Registrar espacios personalizados (Negocios / Áreas)
  const localWs = customWorkspaces.length > 0 ? customWorkspaces : loadLocalWorkspaces();
  localWs.forEach((w) => {
    if (!w || !w.workspace_id) return;
    if (!wsMap.has(w.workspace_id)) {
      wsMap.set(w.workspace_id, {
        workspace_id: w.workspace_id,
        workspace_name: w.workspace_name || 'Espacio de Trabajo',
        project_id: w.project_id || null,
        source: w.project_id ? 'project' : 'custom',
        canvases: []
      });
    }
  });

  // 3. Agrupar todos los lienzos (sesiones FormalIA) en sus espacios
  (sessions || []).forEach((rawSess) => {
    if (!rawSess || !rawSess.session_id) return;
    const s = normalizeSessionWorkspace(rawSess);
    let targetWsId = s.workspace_id || (s.project_id ? `ws_proj_${s.project_id}` : 'ws_general');
    if (s.project_id && wsMap.has(`ws_proj_${s.project_id}`)) {
      targetWsId = `ws_proj_${s.project_id}`;
    }
    if (!wsMap.has(targetWsId)) {
      wsMap.set(targetWsId, {
        workspace_id: targetWsId,
        workspace_name: s.workspace_name || 'Mi Negocio / General',
        project_id: s.project_id || null,
        source: targetWsId === 'ws_general' ? 'default' : 'custom',
        canvases: []
      });
    }
    const bucket = wsMap.get(targetWsId);
    if (!bucket.canvases.some((c) => c.session_id === s.session_id)) {
      bucket.canvases.push(s);
    }
  });

  // Garantizar al menos 1 espacio base para usuarios logueados sin sesiones previas
  if (wsMap.size === 0) {
    wsMap.set('ws_general', {
      workspace_id: 'ws_general',
      workspace_name: 'Mi Negocio / General',
      project_id: null,
      source: 'default',
      canvases: []
    });
  }

  return Array.from(wsMap.values()).map((ws) => ({
    ...ws,
    canvases: [...ws.canvases].sort(
      (a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)
    )
  }));
}

export function removeSessionFromLocalArchive(sessionId) {
  if (!sessionId) return;
  try {
    const archive = loadLocalFormaliaArchive().filter((s) => s.session_id !== sessionId);
    localStorage.setItem(FORMALIA_ARCHIVE_KEY, JSON.stringify(archive));
    const active = loadLocalFormaliaSession();
    if (active && active.session_id === sessionId) {
      localStorage.removeItem(FORMALIA_STORAGE_KEY);
    }
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

export function buildVersionSnapshot(graph, existingVersions = [], summary = '', turnsCount = 0) {
  const versionNumber = (existingVersions?.length || 0) + 1;
  const versionLabel = `v${versionNumber}`;
  const plantuml = graphToPlantUML(graph);
  const createdAt = new Date().toISOString();

  const snapshot = {
    version_number: versionNumber,
    version_label: versionLabel,
    created_at: createdAt,
    turns_count: turnsCount,
    completeness_score: graph?.completeness_score || 0,
    actors_count: graph?.actors?.length || 0,
    steps_count: graph?.steps?.length || 0,
    change_summary: summary || 'Actualización del proceso en FORMALIA',
    process_graph: structuredClone(graph),
    plantuml
  };

  const pumlArtifact = {
    id: `${graph?.session_id || 'FIA'}_puml_${versionLabel}`,
    session_id: graph?.session_id || 'FIA',
    version_number: versionNumber,
    version_label: versionLabel,
    artifact_kind: 'puml',
    file_name: `FORMALIA-${graph?.session_id || 'FIA'}-${versionLabel}.puml`,
    mime_type: 'text/plain',
    content_text: plantuml,
    data_url: null,
    size_bytes: new Blob([plantuml]).size,
    change_summary: summary || `Versión ${versionLabel}`,
    chat_turns_at: turnsCount,
    created_at: createdAt
  };

  return { snapshot, pumlArtifact };
}

export async function startFormaliaSession(options = {}) {
  const {
    workspaceId = null,
    workspaceName = null,
    projectId = null,
    canvasTitle = null,
    currentUser = null,
    creatingNewWorkspace = false
  } = options || {};

  const hasWorkspace = Boolean(workspaceId || workspaceName || projectId || canvasTitle);
  const workspaceMeta = hasWorkspace
    ? normalizeWorkspaceMeta({
        workspace_id: workspaceId,
        workspace_name: workspaceName,
        project_id: projectId,
        canvas_title: canvasTitle || 'Lienzo principal'
      })
    : currentUser
      ? normalizeWorkspaceMeta({
          workspace_id: 'ws_general',
          workspace_name: 'Mi Negocio / General',
          canvas_title: canvasTitle || 'Lienzo principal'
        })
      : null;

  const userId = currentUser?.id && UUID_REGEX.test(String(currentUser.id)) ? String(currentUser.id) : null;
  const userEmail = currentUser?.email ? String(currentUser.email).trim().toLowerCase() : null;
  const userName = currentUser?.name || currentUser?.full_name || null;
  const defaultLimit = getAiDailyLimitForRole(currentUser?.role, Boolean(currentUser));

  const apiRes = await tryApiJson('/api/v1/formalia/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(workspaceMeta || {}),
      ...(userId ? { user_id: userId } : {}),
      ...(userEmail ? { user_email: userEmail } : {}),
      ...(userName ? { user_name: userName } : {}),
      ...(currentUser?.role ? { user_role: currentUser.role } : {}),
      ...(creatingNewWorkspace ? { creating_new_workspace: true } : {}),
      ...(currentUser ? { saved_to_account: true } : {})
    })
  });

  if (apiRes?._apiError && apiRes.code) {
    const err = new Error(apiRes.error || 'No se pudo abrir un nuevo lienzo.');
    err.code = apiRes.code;
    throw err;
  }

  if (apiRes && !apiRes._apiError && apiRes.session_id) {
    const session = normalizeSessionWorkspace({
      session_id: apiRes.session_id,
      process_graph: apiRes.process_graph,
      messages: [apiRes.greeting || createWelcomeMessage()],
      versions: [],
      generated_files: [],
      turns_count: apiRes.turns_count || 0,
      max_turns: apiRes.quota?.daily_limit || apiRes.max_turns || defaultLimit,
      ...(workspaceMeta || {}),
      ...(userId ? { user_id: userId } : {}),
      ...(userEmail ? { user_email: userEmail } : {}),
      ...(userName ? { user_name: userName } : {}),
      ...(currentUser ? { saved_to_account: true } : {}),
      created_at: new Date().toISOString()
    });
    saveLocalFormaliaSession(session);
    if (currentUser) {
      saveFormaliaSessionToAccount(session, { userId, email: userEmail, name: userName }).catch(() => {});
    }
    return session;
  }

  const sessionId = generateFormaliaSessionId();
  const graph = createInitialProcessGraph(sessionId, workspaceMeta);
  const welcome = createWelcomeMessage();
  if (workspaceMeta && workspaceMeta.canvas_title && workspaceMeta.canvas_title !== 'Lienzo principal') {
    welcome.content = `Hola, soy FORMALIA. Abrimos el lienzo "${workspaceMeta.canvas_title}" dentro de "${workspaceMeta.workspace_name}". Cuéntame qué flujo o subproceso vas a mapear aquí para ir construyéndolo juntos paso a paso.`;
  }
  const session = normalizeSessionWorkspace({
    session_id: sessionId,
    process_graph: graph,
    messages: [welcome],
    versions: [],
    generated_files: [],
    turns_count: 0,
    max_turns: defaultLimit,
    ...(workspaceMeta || {}),
    ...(userId ? { user_id: userId } : {}),
    ...(userEmail ? { user_email: userEmail } : {}),
    ...(userName ? { user_name: userName } : {}),
    ...(currentUser ? { saved_to_account: true } : {}),
    created_at: new Date().toISOString()
  });
  saveLocalFormaliaSession(session);
  if (currentUser) {
    saveFormaliaSessionToAccount(session, { userId, email: userEmail, name: userName }).catch(() => {});
  }
  return session;
}

export async function sendFormaliaMessage({
  sessionId,
  message,
  currentGraph,
  turnsCount,
  conversationHistory,
  existingVersions = [],
  existingFiles = [],
  accountLink = null,
  maxTurnsAllowed = null
}) {
  const effectiveMax = maxTurnsAllowed || (accountLink?.user_email || accountLink?.user_id ? AUTH_USER_DAILY_AI_LIMIT : ANON_SESSION_AI_LIMIT);
  if (turnsCount >= effectiveMax && !accountLink?.user_email && !accountLink?.user_id) {
    const err = new Error('Alcanzaste los 5 turnos gratuitos de IA de esta sesión. Inicia sesión para conservar tu diagrama y obtener 15 turnos diarios.');
    err.code = 'AI_QUOTA_EXCEEDED';
    throw err;
  }

  const rawHistory = Array.isArray(conversationHistory)
    ? conversationHistory
    : loadLocalFormaliaSession()?.messages || [];
  const compactHistory = rawHistory
    .filter((m) => m && m.role && m.content)
    .slice(-14)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content)
    }));

  const apiRes = await tryApiJson(`/api/v1/formalia/sessions/${encodeURIComponent(sessionId)}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      process_graph: currentGraph,
      history: compactHistory,
      ...(accountLink ? { account_link: accountLink } : {})
    })
  });

  if (apiRes?._apiError) {
    const err = new Error(apiRes.error || 'Se alcanzó el límite de turnos de IA.');
    err.code = apiRes.code || (apiRes.status === 429 ? 'AI_QUOTA_EXCEEDED' : 'API_ERROR');
    err.status = apiRes.status;
    err.quota = apiRes.quota || null;
    err.reset_at = apiRes.reset_at || null;
    if (apiRes.status === 429 || apiRes.code === 'AI_QUOTA_EXCEEDED' || apiRes.status === 400) {
      throw err;
    }
  }

  if (apiRes && !apiRes._apiError && apiRes.process_graph) {
    const nextVersion = apiRes.version || buildVersionSnapshot(
      apiRes.process_graph,
      existingVersions,
      message.slice(0, 100),
      apiRes.turns_count
    ).snapshot;
    const pumlArt = {
      id: `${sessionId}_puml_${nextVersion.version_label}`,
      session_id: sessionId,
      version_number: nextVersion.version_number,
      version_label: nextVersion.version_label,
      artifact_kind: 'puml',
      file_name: `FORMALIA-${sessionId}-${nextVersion.version_label}.puml`,
      mime_type: 'text/plain',
      content_text: nextVersion.plantuml || graphToPlantUML(apiRes.process_graph),
      size_bytes: (nextVersion.plantuml || '').length,
      change_summary: `Turno ${apiRes.turns_count}: ${message.slice(0, 80)}`,
      chat_turns_at: apiRes.turns_count,
      created_at: nextVersion.created_at
    };

    return {
      ...apiRes,
      versions: apiRes.versions || [...existingVersions, nextVersion],
      generated_files: [...existingFiles.filter((f) => f.id !== pumlArt.id), pumlArt]
    };
  }

  // Fallback cliente conversacional / dev
  const nextTurn = turnsCount + 1;
  const extraction = await extractProcessTurn({
    userMessage: message,
    currentGraph,
    turnCount: nextTurn,
    conversationHistory: compactHistory
  });

  const updatedGraph = applyGraphPatches(currentGraph, extraction.graph_patch);
  updatedGraph.completeness_score = extraction.completeness_score;
  if (extraction.phase) updatedGraph.phase = extraction.phase;

  const { snapshot, pumlArtifact } = buildVersionSnapshot(
    updatedGraph,
    existingVersions,
    `Turno ${nextTurn}: ${message.slice(0, 90)}`,
    nextTurn
  );

  // Persistir archivo de versión también en servidor/Supabase si está disponible
  registerGeneratedArtifact(pumlArtifact).catch(() => {});

  return {
    session_id: sessionId,
    assistant_message: extraction.assistant_message,
    quick_replies: extraction.quick_replies,
    graph_patch: extraction.graph_patch,
    completeness_score: updatedGraph.completeness_score,
    phase: updatedGraph.phase,
    turns_count: nextTurn,
    max_turns: effectiveMax,
    process_graph: updatedGraph,
    version: snapshot,
    versions: [...existingVersions, snapshot],
    generated_files: [...existingFiles.filter((f) => f.id !== pumlArtifact.id), pumlArtifact],
    engine_source: extraction.engine_source
  };
}

export async function fetchFormaliaQuota({ sessionId = null, userId = null, userEmail = null, userRole = null, fallbackTurns = 0 } = {}) {
  const params = new URLSearchParams();
  if (sessionId) params.set('session_id', sessionId);
  if (userId) params.set('user_id', userId);
  if (userEmail) params.set('user_email', String(userEmail).trim().toLowerCase());
  if (userRole) params.set('user_role', String(userRole).trim());
  const qs = params.toString() ? `?${params.toString()}` : '';

  const apiRes = await tryApiJson(`/api/v1/formalia/quota${qs}`, { method: 'GET' });
  if (apiRes && !apiRes._apiError && typeof apiRes.remaining_turns === 'number') {
    return apiRes;
  }

  const isAuth = Boolean(userId || userEmail);
  const limit = getAiDailyLimitForRole(userRole, isAuth);
  const used = isAuth ? 0 : Math.min(limit, Number(fallbackTurns) || 0);
  const now = new Date();
  const nextUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)).toISOString();
  return {
    allowed: used < limit,
    code: used < limit ? null : 'AI_QUOTA_EXCEEDED',
    remaining_turns: Math.max(0, limit - used),
    used_turns: used,
    daily_limit: limit,
    session_turns_used: used,
    session_limit: limit,
    reset_at: nextUtc,
    is_authenticated: isAuth
  };
}

export async function claimFormaliaSession({ anonymousSession, account = {}, workspaceName = null }) {
  if (!anonymousSession || !anonymousSession.session_id) {
    return { ok: false, error: 'Sesión anónima inválida' };
  }
  const userId = account.userId && UUID_REGEX.test(String(account.userId)) ? String(account.userId) : null;
  const userEmail = account.email ? String(account.email).trim().toLowerCase() : null;
  const userName = account.name ? String(account.name).trim() : null;

  const apiRes = await tryApiJson('/api/v1/formalia/sessions/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      anonymous_session_id: anonymousSession.session_id,
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      workspace_name: workspaceName || undefined,
      fallback_session: anonymousSession
    })
  });

  if (apiRes && !apiRes._apiError && apiRes.ok && apiRes.session) {
    const normalized = normalizeSessionWorkspace(apiRes.session);
    saveLocalFormaliaSession(normalized);
    if (normalized.workspace_id && normalized.workspace_name) {
      saveLocalWorkspace({
        workspace_id: normalized.workspace_id,
        workspace_name: normalized.workspace_name,
        category: 'negocio'
      });
    }
    return {
      ok: true,
      session: normalized,
      workspace_id: normalized.workspace_id,
      workspace_name: normalized.workspace_name,
      quota: apiRes.quota || null
    };
  }

  return saveFormaliaSessionToAccount(
    {
      ...anonymousSession,
      ...(workspaceName ? { workspace_name: workspaceName } : {})
    },
    account
  );
}

/**
 * Aplica modificaciones manuales (agregar/editar/borrar roles, pasos, conexiones) sin consumir turnos de IA.
 */
export function applyManualGraphPatches(session, patches = [], summaryLabel = 'Edición manual del diagrama') {
  if (!session || !session.process_graph) return session;
  const nextGraph = applyGraphPatches(session.process_graph, patches);
  const { snapshot, pumlArtifact } = buildVersionSnapshot(
    nextGraph,
    session.versions || [],
    summaryLabel,
    session.turns_count || 0
  );
  const nextSession = normalizeSessionWorkspace({
    ...session,
    process_graph: nextGraph,
    versions: [...(session.versions || []), snapshot],
    generated_files: [
      ...(session.generated_files || []).filter((f) => f.id !== pumlArtifact.id),
      pumlArtifact
    ],
    updated_at: new Date().toISOString()
  });
  saveLocalFormaliaSession(nextSession);
  return nextSession;
}

// ── Persistencia & Generación "Implementar en Solución Web" (Web Blueprints) ─

function loadLocalBlueprintsMap() {
  try {
    const raw = localStorage.getItem(FORMALIA_BLUEPRINTS_KEY);
    if (raw) return JSON.parse(raw) || {};
  } catch (_) {}
  return {};
}

function saveLocalBlueprintEntry(workspaceId, bp) {
  try {
    const all = loadLocalBlueprintsMap();
    all[workspaceId] = bp;
    localStorage.setItem(FORMALIA_BLUEPRINTS_KEY, JSON.stringify(all));
  } catch (_) {}
}

export async function fetchWorkspaceBlueprint(workspaceId = 'ws_general') {
  const cleanId = String(workspaceId || 'ws_general');
  const localMap = loadLocalBlueprintsMap();
  const apiRes = await tryApiJson(`/api/v1/workspaces/${encodeURIComponent(cleanId)}/blueprint`, {
    method: 'GET'
  });
  if (apiRes && !apiRes._apiError && apiRes.blueprint) {
    saveLocalBlueprintEntry(cleanId, apiRes.blueprint);
    return apiRes.blueprint;
  }
  return localMap[cleanId] || createDefaultWebBlueprint(cleanId);
}

export async function saveManualBlueprint(workspaceId = 'ws_general', patch = {}) {
  const cleanId = String(workspaceId || 'ws_general');
  const localMap = loadLocalBlueprintsMap();
  const prev = localMap[cleanId] || createDefaultWebBlueprint(cleanId);
  const nextLocal = {
    ...prev,
    ...patch,
    workspace_id: cleanId,
    ...(patch.ui_screens !== undefined ? { ui_screens: sanitizeUiScreensPayload(patch.ui_screens) } : {}),
    updated_at: new Date().toISOString()
  };
  saveLocalBlueprintEntry(cleanId, nextLocal);

  const apiRes = await tryApiJson(`/api/v1/workspaces/${encodeURIComponent(cleanId)}/blueprint`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  });

  if (apiRes && !apiRes._apiError && apiRes.blueprint) {
    saveLocalBlueprintEntry(cleanId, apiRes.blueprint);
    return apiRes.blueprint;
  }
  return nextLocal;
}

export async function generateWorkspaceBlueprintStories({
  workspaceId = 'ws_general',
  workspaceName = 'Mi Negocio',
  canvases = [],
  userId = null,
  userEmail = null,
  userRole = null,
  useAi = true
}) {
  const cleanId = String(workspaceId || 'ws_general');
  const apiRes = await tryApiJson(`/api/v1/workspaces/${encodeURIComponent(cleanId)}/blueprint/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspace_name: workspaceName,
      canvas_ids: canvases.map((c) => c.session_id).filter(Boolean),
      canvases,
      user_id: userId,
      user_email: userEmail,
      user_role: userRole,
      use_ai: useAi
    })
  });

  if (apiRes?._apiError) {
    const err = new Error(apiRes.error || 'No se pudieron generar historias.');
    err.code = apiRes.code || 'API_ERROR';
    err.quota = apiRes.quota || null;
    if (apiRes.status === 429 || apiRes.code === 'AI_QUOTA_EXCEEDED') throw err;
  }

  if (apiRes && !apiRes._apiError && apiRes.blueprint) {
    saveLocalBlueprintEntry(cleanId, apiRes.blueprint);
    return apiRes;
  }

  // Fallback dev local
  const gen = await generateBlueprintStories({ workspaceName, canvases, useAi: false });
  const bp = await saveManualBlueprint(cleanId, {
    source_canvas_ids: canvases.map((c) => c.session_id).filter(Boolean),
    user_stories: gen.stories
  });
  return { blueprint: bp, user_stories: bp.user_stories, source: gen.source };
}

export async function generateWorkspaceBlueprintLayout({
  workspaceId = 'ws_general',
  workspaceName = 'Mi Negocio',
  stories = [],
  canvases = [],
  themeConfig = {},
  targetRole = null,
  refinementPrompt = '',
  existingScreens = [],
  userId = null,
  userEmail = null,
  userRole = null,
  useAi = true
}) {
  const cleanId = String(workspaceId || 'ws_general');
  const apiRes = await tryApiJson(`/api/v1/workspaces/${encodeURIComponent(cleanId)}/blueprint/layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspace_name: workspaceName,
      user_stories: stories,
      theme_config: themeConfig,
      target_role: targetRole,
      refinement_prompt: refinementPrompt,
      existing_screens: existingScreens,
      canvases,
      user_id: userId,
      user_email: userEmail,
      user_role: userRole,
      use_ai: useAi
    })
  });

  if (apiRes?._apiError) {
    const err = new Error(apiRes.error || 'No se pudo maquetar la interfaz.');
    err.code = apiRes.code || 'API_ERROR';
    err.quota = apiRes.quota || null;
    if (apiRes.status === 429 || apiRes.code === 'AI_QUOTA_EXCEEDED') throw err;
  }

  if (apiRes && !apiRes._apiError && apiRes.blueprint) {
    saveLocalBlueprintEntry(cleanId, apiRes.blueprint);
    return apiRes;
  }

  // Fallback dev local
  const layoutRes = await generateBlueprintLayout({
    workspaceName,
    stories,
    canvases,
    themeConfig,
    targetRole,
    refinementPrompt,
    existingScreens,
    useAi: false
  });
  const bp = await saveManualBlueprint(cleanId, {
    user_stories: stories,
    theme_config: themeConfig,
    ui_screens: layoutRes.ui_screens
  });
  return { blueprint: bp, ui_screens: bp.ui_screens, source: layoutRes.source };
}

export async function registerGeneratedArtifact(artifact) {
  if (!artifact || !artifact.session_id) return artifact;
  const normalized = {
    id: artifact.id || `${artifact.session_id}_${artifact.artifact_kind}_${Date.now()}`,
    session_id: artifact.session_id,
    version_number: Number(artifact.version_number) || 1,
    version_label: artifact.version_label || `v${Number(artifact.version_number) || 1}`,
    artifact_kind: artifact.artifact_kind || 'json',
    file_name: artifact.file_name,
    mime_type: artifact.mime_type || 'application/octet-stream',
    content_text: artifact.content_text || null,
    data_url: artifact.data_url || null,
    size_bytes: Number(artifact.size_bytes) || 0,
    change_summary: artifact.change_summary || '',
    chat_turns_at: Number(artifact.chat_turns_at) || 0,
    created_at: artifact.created_at || new Date().toISOString()
  };

  // Actualizar sesión local y archivo
  const active = loadLocalFormaliaSession();
  if (active && active.session_id === normalized.session_id) {
    const nextFiles = [
      ...(active.generated_files || []).filter((f) => f.id !== normalized.id),
      normalized
    ];
    saveLocalFormaliaSession({ ...active, generated_files: nextFiles });
  }

  // Enviar al endpoint serverless; en dev local persistir directo en Supabase
  const apiSaved = await tryApiJson(`/api/v1/formalia/sessions/${encodeURIComponent(normalized.session_id)}/artifacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized)
  });

  if (!apiSaved && isSupabaseConfigured && supabase) {
    try {
      await supabase.from('formalia_artifact_versions').upsert({
        id: normalized.id,
        session_id: normalized.session_id,
        version_number: normalized.version_number,
        version_label: normalized.version_label,
        artifact_kind: normalized.artifact_kind,
        file_name: normalized.file_name,
        mime_type: normalized.mime_type,
        content_text: normalized.content_text,
        data_url: normalized.data_url,
        size_bytes: normalized.size_bytes,
        change_summary: normalized.change_summary,
        chat_turns_at: normalized.chat_turns_at,
        created_at: normalized.created_at
      });
    } catch (_) {}
  }

  return normalized;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let supabaseWorkspaceColsUnsupported = false;

/**
 * Vincula y persiste una sesión FORMALIA completa (chat + grafo + versiones + archivos)
 * a una cuenta de usuario para que nunca expire y sea retomable en el Portal.
 */
export async function saveFormaliaSessionToAccount(session, account = {}) {
  if (!session || !session.session_id) {
    return { ok: false, error: 'Sesión FORMALIA inválida' };
  }

  const userId = account.userId && UUID_REGEX.test(String(account.userId)) ? String(account.userId) : null;
  const userEmail = account.email ? String(account.email).trim().toLowerCase() : (session.user_email || null);
  const userName = account.name ? String(account.name).trim() : (session.user_name || null);
  const wsMeta = extractWorkspaceMeta(session);
  const processName =
    session.canvas_title ||
    session.process_graph?.business_context?.process_name ||
    session.process_graph?.process_name ||
    session.process_name ||
    wsMeta.canvas_title ||
    null;

  const syncedGraph = {
    ...(session.process_graph || {}),
    workspace_meta: wsMeta
  };

  const stampedSession = {
    ...session,
    process_graph: syncedGraph,
    workspace_id: wsMeta.workspace_id,
    workspace_name: wsMeta.workspace_name,
    project_id: wsMeta.project_id,
    canvas_title: wsMeta.canvas_title,
    user_id: userId || session.user_id || null,
    user_email: userEmail,
    user_name: userName,
    process_name: processName,
    saved_to_account: true,
    expires_at: '2099-12-31T23:59:59Z',
    updated_at: new Date().toISOString()
  };

  saveLocalFormaliaSession(stampedSession);

  // 1. Sincronizar primero por endpoint serverless (service_role, fallback de columnas transparente en backend sin errores 400 en consola)
  const apiSync = await tryApiJson('/api/v1/formalia/archive', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: stampedSession.session_id,
      ...wsMeta,
      user_id: stampedSession.user_id,
      user_email: stampedSession.user_email,
      user_name: stampedSession.user_name,
      saved_to_account: true,
      session: stampedSession
    })
  });
  if (apiSync && !apiSync._apiError && apiSync.session) {
    return { ok: true, session: stampedSession, cloudSynced: true };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { ok: true, session: stampedSession, cloudSynced: false };
  }

  const basePayload = {
    session_id: stampedSession.session_id,
    process_graph: stampedSession.process_graph || {},
    messages: stampedSession.messages || [],
    versions: stampedSession.versions || [],
    generated_files: stampedSession.generated_files || [],
    turns_count: stampedSession.turns_count || 0,
    completeness_score: stampedSession.process_graph?.completeness_score || 0,
    expires_at: stampedSession.expires_at,
    updated_at: stampedSession.updated_at
  };

  const extendedPayload = {
    ...basePayload,
    user_id: stampedSession.user_id,
    user_email: stampedSession.user_email,
    user_name: stampedSession.user_name,
    process_name: processName,
    saved_to_account: true
  };

  const fullWorkspacePayload = {
    ...extendedPayload,
    workspace_id: wsMeta.workspace_id,
    workspace_name: wsMeta.workspace_name,
    project_id: wsMeta.project_id,
    canvas_title: wsMeta.canvas_title
  };

  let error = null;
  if (!supabaseWorkspaceColsUnsupported) {
    const firstTry = await supabase
      .from('formalia_sessions')
      .upsert(fullWorkspacePayload, { onConflict: 'session_id' });
    error = firstTry.error;
    if (error) {
      supabaseWorkspaceColsUnsupported = true;
    }
  } else {
    const directExt = await supabase
      .from('formalia_sessions')
      .upsert(extendedPayload, { onConflict: 'session_id' });
    error = directExt.error;
  }

  // Si aún falta alguna columna workspace en BD remota, reintentar sin columnas workspace (workspace_meta sigue en process_graph)
  if (error) {
    const retryExt = await supabase
      .from('formalia_sessions')
      .upsert(extendedPayload, { onConflict: 'session_id' });
    error = retryExt.error;
  }

  // Si user_id provoca violación FK o aún falta alguna columna en BD remota, reintentar sin user_id
  if (error && stampedSession.user_id) {
    const retry = await supabase
      .from('formalia_sessions')
      .upsert({ ...extendedPayload, user_id: null }, { onConflict: 'session_id' });
    error = retry.error;
  }

  if (error) {
    const legacy = await supabase
      .from('formalia_sessions')
      .upsert(basePayload, { onConflict: 'session_id' });
    if (legacy.error) {
      return { ok: false, session: stampedSession, cloudSynced: false, error: legacy.error.message };
    }
  }

  // Persistir artefactos generados en tabla formalia_artifact_versions
  if (Array.isArray(stampedSession.generated_files) && stampedSession.generated_files.length > 0) {
    const rows = stampedSession.generated_files.map((art) => ({
      id: art.id || `${stampedSession.session_id}_${art.artifact_kind || 'file'}_${Date.now()}`,
      session_id: stampedSession.session_id,
      version_number: Number(art.version_number) || 1,
      version_label: art.version_label || `v${Number(art.version_number) || 1}`,
      artifact_kind: art.artifact_kind || 'puml',
      file_name: art.file_name || `FORMALIA-${stampedSession.session_id}.txt`,
      mime_type: art.mime_type || 'text/plain',
      content_text: art.content_text || null,
      data_url: art.data_url || null,
      size_bytes: Number(art.size_bytes) || 0,
      change_summary: art.change_summary || '',
      chat_turns_at: Number(art.chat_turns_at) || 0,
      created_at: art.created_at || new Date().toISOString()
    }));
    try {
      await supabase.from('formalia_artifact_versions').upsert(rows);
    } catch (_) {}
  }

  return { ok: true, session: stampedSession, cloudSynced: true };
}

export async function renameOrMoveFormaliaCanvas({
  session,
  canvasTitle = null,
  workspaceId = null,
  workspaceName = null,
  projectId = undefined,
  currentUser = null
}) {
  if (!session || !session.session_id) return null;
  const existingMeta = extractWorkspaceMeta(session);
  const nextMeta = normalizeWorkspaceMeta({
    workspace_id: workspaceId !== null ? workspaceId : existingMeta.workspace_id,
    workspace_name: workspaceName !== null ? workspaceName : existingMeta.workspace_name,
    project_id: projectId !== undefined ? projectId : existingMeta.project_id,
    canvas_title: canvasTitle !== null ? canvasTitle : existingMeta.canvas_title
  });

  const nextGraph = {
    ...(session.process_graph || {}),
    workspace_meta: nextMeta,
    business_context: {
      ...(session.process_graph?.business_context || {}),
      ...(canvasTitle ? { process_name: canvasTitle } : {}),
      ...(workspaceName ? { company_name: workspaceName } : {})
    }
  };

  const updatedMessages =
    (session.turns_count || 0) === 0 &&
    Array.isArray(session.messages) &&
    session.messages.length === 1 &&
    session.messages[0]?.role === 'assistant' &&
    canvasTitle
      ? [
          {
            ...session.messages[0],
            content: `Hola, soy FORMALIA. Abrimos el lienzo "${nextMeta.canvas_title}" dentro de "${nextMeta.workspace_name}". Cuéntame qué flujo o subproceso vas a mapear aquí para ir construyéndolo juntos paso a paso.`
          }
        ]
      : session.messages;

  const updated = normalizeSessionWorkspace({
    ...session,
    workspace_id: nextMeta.workspace_id,
    workspace_name: nextMeta.workspace_name,
    project_id: nextMeta.project_id,
    canvas_title: nextMeta.canvas_title,
    process_name: nextMeta.canvas_title,
    process_graph: nextGraph,
    messages: updatedMessages,
    updated_at: new Date().toISOString()
  });

  saveLocalFormaliaSession(updated);

  if (currentUser || updated.saved_to_account) {
    await saveFormaliaSessionToAccount(updated, {
      userId: currentUser?.id || updated.user_id,
      email: currentUser?.email || updated.user_email,
      name: currentUser?.name || currentUser?.full_name || updated.user_name
    }).catch(() => {});
  } else {
    await tryApiJson('/api/v1/formalia/archive', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: updated.session_id,
        ...nextMeta,
        session: updated
      })
    });
  }

  return updated;
}

export async function deleteFormaliaCanvas(sessionId) {
  if (!sessionId) return false;
  removeSessionFromLocalArchive(sessionId);

  await tryApiJson(`/api/v1/formalia/archive?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'DELETE'
  });

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('formalia_artifact_versions').delete().eq('session_id', sessionId);
      await supabase.from('formalia_sessions').delete().eq('session_id', sessionId);
    } catch (_) {}
  }

  return true;
}

/**
 * Sincroniza silenciosamente cambios posteriores en una sesión ya vinculada a una cuenta.
 */
export async function syncLinkedFormaliaSession(session) {
  if (!session || !session.session_id) return null;
  if (!session.saved_to_account && !session.user_email && !session.user_id) return null;
  return saveFormaliaSessionToAccount(session, {
    userId: session.user_id,
    email: session.user_email,
    name: session.user_name
  });
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

export function buildChatMarkdown(session) {
  const ctx = session?.process_graph?.business_context || {};
  const lines = [
    `# Transcripción de Chat FORMALIA — ${session?.session_id || ''}`,
    `- **Empresa:** ${ctx.company_name || 'No especificada'}`,
    `- **Proceso:** ${ctx.process_name || 'Por definir'}`,
    `- **Completitud:** ${session?.process_graph?.completeness_score || 0}%`,
    `- **Turnos:** ${session?.turns_count || 0}/${session?.max_turns || 15}`,
    ``,
    `---`,
    ``
  ];

  (session?.messages || []).forEach((m, idx) => {
    const speaker = m.role === 'user' ? '👤 Usuario' : '✨ FORMALIA';
    lines.push(`### ${idx + 1}. ${speaker} (${m.timestamp || ''})`);
    lines.push(m.content || '');
    if (m.graph_patch && m.graph_patch.length > 0) {
      lines.push(`\n> *Patches aplicados:* ${m.graph_patch.map((p) => p.op).join(', ')}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}

export function downloadPlantUMLFile(graph, versionLabel = 'v1') {
  const puml = graphToPlantUML(graph);
  const fileName = `FORMALIA-${graph?.session_id || 'diagrama'}-${versionLabel}.puml`;
  const blob = new Blob([puml], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return { fileName, contentText: puml, mimeType: 'text/plain', sizeBytes: blob.size };
}

export function downloadCanonicalJSONFile(graph, versionLabel = 'v1') {
  const json = JSON.stringify(graph, null, 2);
  const fileName = `FORMALIA-${graph?.session_id || 'graph'}-${versionLabel}.json`;
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return { fileName, contentText: json, mimeType: 'application/json', sizeBytes: blob.size };
}

export function downloadChatTranscriptFile(session, format = 'md', versionLabel = 'v1') {
  const content = format === 'json'
    ? JSON.stringify({ session_id: session.session_id, messages: session.messages, versions_count: session.versions?.length || 0 }, null, 2)
    : buildChatMarkdown(session);
  const mimeType = format === 'json' ? 'application/json' : 'text/markdown';
  const fileName = `FORMALIA-${session?.session_id || 'chat'}-chat-${versionLabel}.${format}`;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return { fileName, contentText: content, mimeType, sizeBytes: blob.size };
}

const PRIVILEGED_REVIEWER_ROLES = new Set([
  'Admin',
  'Administrador',
  'Colaborador',
  'Desarrollador',
  'Fintech Lead',
  'Auditora de Impacto'
]);

export async function fetchFormaliaArchive({ userId = null, userEmail = null, role = null, workspaceId = null } = {}) {
  const localArchive = loadLocalFormaliaArchive();
  const active = loadLocalFormaliaSession();
  const localIds = new Set();
  const mergedMap = new Map();

  if (active && active.session_id) {
    localIds.add(active.session_id);
    mergedMap.set(active.session_id, normalizeSessionWorkspace(active));
  }
  localArchive.forEach((s) => {
    if (s && s.session_id) {
      localIds.add(s.session_id);
      if (!mergedMap.has(s.session_id)) mergedMap.set(s.session_id, normalizeSessionWorkspace(s));
    }
  });

  const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : null;
  const isPrivilegedReviewer = role ? PRIVILEGED_REVIEWER_ROLES.has(role) : true;
  const mineOnly = Boolean((userId || cleanEmail) && !isPrivilegedReviewer);

  const belongsToCurrentUser = (sess) => {
    if (!userId && !cleanEmail) return false;
    if (userId && sess.user_id && sess.user_id === userId) return true;
    if (cleanEmail && sess.user_email && String(sess.user_email).trim().toLowerCase() === cleanEmail) return true;
    return false;
  };

  const params = new URLSearchParams();
  if (userId) params.set('user_id', userId);
  if (cleanEmail) params.set('user_email', cleanEmail);
  if (mineOnly) params.set('mine_only', '1');
  const qs = params.toString() ? `?${params.toString()}` : '';

  // 1. Intentar API serverless
  const apiRes = await tryApiJson(`/api/v1/formalia/archive${qs}`, { method: 'GET' });
  if (apiRes && !apiRes._apiError && Array.isArray(apiRes.sessions)) {
    apiRes.sessions.forEach((remote) => {
      const local = mergedMap.get(remote.session_id);
      mergedMap.set(remote.session_id, {
        ...local,
        ...remote,
        messages: remote.messages?.length ? remote.messages : (local?.messages || []),
        versions: remote.versions?.length ? remote.versions : (local?.versions || []),
        generated_files: mergeArtifacts(local?.generated_files, remote.generated_files)
      });
    });
  } else if (isSupabaseConfigured && supabase) {
    // 2. Consulta directa a Supabase si API route no respondió (ej. Vite dev local)
    try {
      let sessQuery = supabase
        .from('formalia_sessions')
        .select('*')
        .not('session_id', 'like', 'SYS-%')
        .order('updated_at', { ascending: false })
        .limit(60);

      if (mineOnly) {
        const filters = [];
        if (userId && UUID_REGEX.test(String(userId))) filters.push(`user_id.eq.${userId}`);
        if (cleanEmail) filters.push(`user_email.ilike.${cleanEmail}`);
        if (filters.length > 0) {
          sessQuery = sessQuery.or(filters.join(','));
        }
      }

      const { data: sessions } = await sessQuery;
      const { data: artifacts } = await supabase
        .from('formalia_artifact_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(180);

      if (sessions) {
        const bySession = new Map();
        (artifacts || []).forEach((a) => {
          if (!bySession.has(a.session_id)) bySession.set(a.session_id, []);
          bySession.get(a.session_id).push(a);
        });
        sessions.forEach((remote) => {
          const local = mergedMap.get(remote.session_id);
          mergedMap.set(remote.session_id, {
            ...local,
            ...remote,
            messages: remote.messages?.length ? remote.messages : (local?.messages || []),
            versions: remote.versions?.length ? remote.versions : (local?.versions || []),
            generated_files: mergeArtifacts(local?.generated_files, bySession.get(remote.session_id) || remote.generated_files)
          });
        });
      }
    } catch (_) {}
  }

  return Array.from(mergedMap.values())
    .filter((s) => !String(s.session_id || '').startsWith('SYS-'))
    .map(normalizeSessionWorkspace)
    .filter((s) => {
      if (!mineOnly) return true;
      if (belongsToCurrentUser(s)) return true;
      // Permitir sesión local solo si aún es anónima (sin dueño distinto)
      const sOwner = String(s.user_email || '').trim().toLowerCase();
      return localIds.has(s.session_id) && (!sOwner || sOwner === cleanEmail);
    })
    .filter((s) => !workspaceId || s.workspace_id === workspaceId)
    .map((s) => ({
      ...s,
      is_mine: belongsToCurrentUser(s)
    }))
    .sort(
      (a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)
    );
}

function mergeArtifacts(a = [], b = []) {
  const map = new Map();
  [...(a || []), ...(b || [])].forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  return Array.from(map.values()).sort(
    (x, y) => new Date(y.created_at || 0) - new Date(x.created_at || 0)
  );
}
