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
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const FORMALIA_STORAGE_KEY = 'pathrimonio_formalia_session_v1';
const FORMALIA_ARCHIVE_KEY = 'pathrimonio_formalia_archive_v1';
const MAX_TURNS = 15;

export function createWelcomeMessage() {
  return {
    id: `msg_${Date.now()}_welcome`,
    role: 'assistant',
    content:
      'Hola, soy FORMALIA. Cuéntame en tus propias palabras: ¿qué proceso de tu negocio te genera hoy más desorden? (Ej. Ventas, Despachos, Pedidos)',
    quick_replies: [
      'Recibimos pedidos por WhatsApp, anotamos en Excel y despachamos en ruta',
      'Comercio / Bodega: ventas en caja, control de stock e inventario manual',
      'Restaurante / Delivery: comandas, cocina y entregas con demora'
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
      versions: [],
      generated_files: [],
      turns_count: apiRes.turns_count || 0,
      max_turns: apiRes.max_turns || MAX_TURNS,
      created_at: new Date().toISOString()
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
    versions: [],
    generated_files: [],
    turns_count: 0,
    max_turns: MAX_TURNS,
    created_at: new Date().toISOString()
  };
  saveLocalFormaliaSession(session);
  return session;
}

export async function sendFormaliaMessage({
  sessionId,
  message,
  currentGraph,
  turnsCount,
  existingVersions = [],
  existingFiles = []
}) {
  if (turnsCount >= MAX_TURNS) {
    throw new Error(`Alcanzaste el límite de ${MAX_TURNS} turnos para esta sesión gratuita. Descarga tu diagrama o cotiza tu sistema.`);
  }

  const apiRes = await tryApiJson(`/api/v1/formalia/sessions/${encodeURIComponent(sessionId)}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, process_graph: currentGraph })
  });

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
    max_turns: MAX_TURNS,
    process_graph: updatedGraph,
    version: snapshot,
    versions: [...existingVersions, snapshot],
    generated_files: [...existingFiles.filter((f) => f.id !== pumlArtifact.id), pumlArtifact],
    engine_source: extraction.engine_source
  };
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

  // Enviar al endpoint serverless
  await tryApiJson(`/api/v1/formalia/sessions/${encodeURIComponent(normalized.session_id)}/artifacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized)
  });

  return normalized;
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

export async function fetchFormaliaArchive() {
  const localArchive = loadLocalFormaliaArchive();
  const active = loadLocalFormaliaSession();
  const mergedMap = new Map();

  if (active) mergedMap.set(active.session_id, active);
  localArchive.forEach((s) => {
    if (!mergedMap.has(s.session_id)) mergedMap.set(s.session_id, s);
  });

  // 1. Intentar API serverless
  const apiRes = await tryApiJson('/api/v1/formalia/archive', { method: 'GET' });
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
      const { data: sessions } = await supabase
        .from('formalia_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(40);
      const { data: artifacts } = await supabase
        .from('formalia_artifact_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(150);

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

  return Array.from(mergedMap.values()).sort(
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
