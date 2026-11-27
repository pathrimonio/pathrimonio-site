import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchFormaliaArchive,
  loadLocalFormaliaSession,
  loadLocalWorkspaces,
  buildWorkspaceDirectory,
  normalizeSessionWorkspace,
  downloadChatTranscriptFile,
  downloadPlantUMLFile,
  downloadCanonicalJSONFile
} from '../../services/formaliaService';
import { generateEngineeringHandoff } from '../../lib/formalia/compilers';
import FormalIAWorkspace from '../landing/formalia/FormalIAWorkspace';
import SectionInfoPopover from './SectionInfoPopover';

function formatBytes(bytes = 0) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function FormalIAPortalView({
  currentUser = null,
  activeProjectId,
  activeProjectName = 'Proyecto Activo',
  projects = [],
  onSaveToProjectFiles,
  onPromoteGraphToProject,
  onNavigatePortalTab,
  onNotify
}) {
  const [portalMode, setPortalMode] = useState('studio'); // 'studio' | 'archive'
  const [studioOverrideSession, setStudioOverrideSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState('all');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [detailTab, setDetailTab] = useState('handoff'); // 'handoff' | 'chat' | 'files'
  const [lastPromotion, setLastPromotion] = useState(null);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const rawList = await fetchFormaliaArchive({
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        role: currentUser?.role
      });
      const list = (rawList || []).map(normalizeSessionWorkspace);
      setSessions(list);
      if (list.length > 0 && !selectedSessionId) {
        setSelectedSessionId(list[0].session_id);
      }

      // Si el usuario entra desde otro dispositivo o con sesión vacía en localStorage,
      // retomar automáticamente su última conversación guardada en la cuenta.
      const localSess = loadLocalFormaliaSession();
      const localHasTurns =
        (localSess?.turns_count || 0) > 0 ||
        (localSess?.messages || []).some((m) => m.role === 'user');
      if (!studioOverrideSession && !localHasTurns && list.length > 0) {
        const ownedSession =
          list.find((s) => s.is_mine && ((s.turns_count || 0) > 0 || (s.messages || []).length > 1)) ||
          list.find((s) => s.saved_to_account && ((s.turns_count || 0) > 0 || (s.messages || []).length > 1));
        if (ownedSession) {
          setStudioOverrideSession(ownedSession);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [currentUser?.id, currentUser?.email, currentUser?.role]);

  const workspaceDirectory = useMemo(
    () =>
      buildWorkspaceDirectory({
        sessions,
        portalProjects: projects,
        customWorkspaces: typeof window !== 'undefined' ? loadLocalWorkspaces() : []
      }),
    [sessions, projects]
  );

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter((s) => {
      if (workspaceFilter !== 'all' && s.workspace_id !== workspaceFilter) return false;
      if (!q) return true;
      const ctx = s.process_graph?.business_context || {};
      return (
        (s.session_id || '').toLowerCase().includes(q) ||
        (s.workspace_name || '').toLowerCase().includes(q) ||
        (s.canvas_title || '').toLowerCase().includes(q) ||
        (ctx.company_name || '').toLowerCase().includes(q) ||
        (ctx.process_name || '').toLowerCase().includes(q) ||
        (s.user_email || '').toLowerCase().includes(q) ||
        (s.user_name || '').toLowerCase().includes(q) ||
        (s.linked_quote_id || '').toLowerCase().includes(q)
      );
    });
  }, [sessions, searchQuery, workspaceFilter]);

  const selectedSession = useMemo(() => {
    return (
      filteredSessions.find((s) => s.session_id === selectedSessionId) ||
      filteredSessions[0] ||
      null
    );
  }, [filteredSessions, selectedSessionId]);

  const handoff = useMemo(() => {
    if (!selectedSession?.process_graph) return null;
    return generateEngineeringHandoff(selectedSession.process_graph);
  }, [selectedSession]);

  const handleMaterializeGraph = (graph) => {
    if (!graph || !onPromoteGraphToProject) return;
    const summary = onPromoteGraphToProject(graph);
    if (summary) {
      setLastPromotion(summary);
    }
  };

  const handleDownloadArchivedFile = (file) => {
    if (file.data_url && file.artifact_kind === 'png') {
      const a = document.createElement('a');
      a.href = file.data_url;
      a.download = file.file_name;
      a.click();
      return;
    }
    if (file.content_text) {
      const blob = new Blob([file.content_text], { type: `${file.mime_type || 'text/plain'};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handlePromoteFileToProject = (file) => {
    if (!onSaveToProjectFiles) return;
    const category =
      file.artifact_kind === 'png' || file.artifact_kind === 'pdf'
        ? 'Diagramas & Arquitectura'
        : file.artifact_kind === 'chat_transcript'
          ? 'Documentación Funcional'
          : 'Especificaciones Técnicas';

    onSaveToProjectFiles({
      id: `FILE-FIA-${Date.now().toString().slice(-5)}`,
      projectId: activeProjectId === 'all' ? 'pathway' : activeProjectId,
      name: file.file_name,
      category,
      format: file.artifact_kind.toUpperCase(),
      size: formatBytes(file.size_bytes),
      version: file.version_label || 'v1',
      status: 'Aprobado',
      author: 'FORMALIA Engine',
      description: file.change_summary || `Archivo generado desde sesión FORMALIA ${file.session_id}`,
      tags: ['FORMALIA', file.session_id, file.version_label || 'v1'],
      fileContent: file.content_text || undefined,
      fileUrl: file.data_url || undefined,
      createdAt: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    });
    onNotify?.(`Archivo "${file.file_name}" guardado en Archivos & Manifiestos.`);
  };

  const totalFiles = sessions.reduce((acc, s) => acc + (s.generated_files?.length || 0), 0);
  const totalVersions = sessions.reduce((acc, s) => acc + (s.versions?.length || 0), 0);

  return (
    <div className="flex flex-col w-full">
      {/* Subheader FORMALIA integrado en Portal de Colaboradores */}
      <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-3 sm:px-4 lg:px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  FORMALIA — Flujos a Desarrollo SDD
                </h1>
                <SectionInfoPopover
                  title="FORMALIA en Portal de Colaboradores"
                  description="Conversa con FORMALIA para diagramar un proceso operativo en carriles, revisa en tiempo real sus Historias de Usuario e Interfaces sugeridas y materializa todo con un clic dentro del proyecto activo."
                />
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium">
                  Comunidad &amp; Síntesis SDD
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Switcher Estudio Vivo vs Archivo */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant">
              <button
                type="button"
                onClick={() => setPortalMode('studio')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs font-semibold transition-all cursor-pointer ${
                  portalMode === 'studio'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>Estudio en Vivo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalMode('archive');
                  loadSessions();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs font-semibold transition-all cursor-pointer ${
                  portalMode === 'archive'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                <span>Sesiones &amp; Handoff</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-current">
                  {sessions.length}
                </span>
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">history</span>
              <span className="font-mono text-xs text-white">{totalVersions} ver · {totalFiles} arch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Banner post-materialización hacia vistas del Portal */}
      {lastPromotion && (
        <div className="mx-3 sm:mx-4 lg:mx-5 mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-400 text-[22px] mt-0.5">rocket_launch</span>
            <div>
              <h3 className="font-space text-sm font-bold text-white">
                Flujo "{lastPromotion.processName}" materializado en {lastPromotion.projectName}
              </h3>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                Se generaron/actualizaron {lastPromotion.actorsCount} roles, {lastPromotion.storiesCount} historias de usuario, {lastPromotion.interfacesCount} interfaces y {lastPromotion.tablesCount} tablas de datos.
              </p>
            </div>
          </div>

          {onNavigatePortalTab && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigatePortalTab('actors')}
                className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant hover:border-primary text-xs font-space font-semibold text-white cursor-pointer"
              >
                Ver Roles ({lastPromotion.actorsCount})
              </button>
              <button
                type="button"
                onClick={() => onNavigatePortalTab('stories')}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-[#e09419] text-xs font-space font-semibold cursor-pointer"
              >
                Ver Historias ({lastPromotion.storiesCount})
              </button>
              <button
                type="button"
                onClick={() => onNavigatePortalTab('interfaces')}
                className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant hover:border-primary text-xs font-space font-semibold text-white cursor-pointer"
              >
                Ver Interfaces ({lastPromotion.interfacesCount})
              </button>
              <button
                type="button"
                onClick={() => onNavigatePortalTab('dataModel')}
                className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant hover:border-primary text-xs font-space font-semibold text-white cursor-pointer"
              >
                Ver Tablas ({lastPromotion.tablesCount})
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODO 1: ESTUDIO EN VIVO INTEGRADO EN EL PORTAL
      ══════════════════════════════════════════ */}
      {portalMode === 'studio' && (
        <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
          <FormalIAWorkspace
            isPortalEmbedded
            currentUser={currentUser}
            targetProjectName={activeProjectName}
            portalProjects={projects}
            activeProjectId={activeProjectId}
            initialSessionOverride={studioOverrideSession}
            onPromoteToProject={handleMaterializeGraph}
            onSessionListChanged={loadSessions}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODO 2: ARCHIVO HISTÓRICO & HANDOFF SDD
      ══════════════════════════════════════════ */}
      {portalMode === 'archive' && (
        <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5 flex flex-col gap-5">
          {/* Barra de Búsqueda + Filtro por Espacio Adaptativa */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center gap-2.5 sm:gap-3 shadow-sm">
            <div className="relative flex-1 min-w-[220px] sm:min-w-[260px] w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por lienzo, espacio, ID (FIA-...), empresa o proceso..."
                className="w-full bg-surface-container-highest border border-outline-variant rounded-xl pl-10 pr-9 py-2 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <select
              aria-label="Filtrar archivo por espacio de trabajo"
              value={workspaceFilter}
              onChange={(e) => setWorkspaceFilter(e.target.value)}
              className="bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-space text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Todos los espacios ({sessions.length})</option>
              {workspaceDirectory.map((ws) => (
                <option key={ws.workspace_id} value={ws.workspace_id}>
                  {ws.source === 'project' ? 'Proyecto · ' : 'Espacio · '}
                  {ws.workspace_name} ({ws.canvases.length})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadSessions}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-highest border border-outline-variant hover:border-primary text-white font-space text-xs font-semibold transition-all cursor-pointer shrink-0 sm:ml-auto"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">refresh</span>
              <span>Sincronizar</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-space text-on-surface-variant">
              Cargando chats, archivos y versiones recopiladas de FORMALIA...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-12 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[36px] text-primary">auto_awesome</span>
              <h3 className="font-space text-base font-bold text-white">No hay sesiones FORMALIA recopiladas aún</h3>
              <p className="font-jakarta text-xs text-on-surface-variant max-w-md">
                Usa la pestaña <strong>Estudio en Vivo</strong> arriba para diagramar un flujo ahora mismo o conversar desde la portada pública.
              </p>
              <button
                type="button"
                onClick={() => setPortalMode('studio')}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-space font-semibold cursor-pointer"
              >
                Abrir Estudio en Vivo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Columna Izquierda: Lista de Sesiones */}
              <div className="lg:col-span-4 flex flex-col gap-2.5 max-h-[720px] overflow-y-auto pr-1">
                {filteredSessions.map((sess) => {
                  const ctx = sess.process_graph?.business_context || {};
                  const isSelected = selectedSession?.session_id === sess.session_id;
                  return (
                    <button
                      key={sess.session_id}
                      type="button"
                      onClick={() => setSelectedSessionId(sess.session_id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-surface-container border-primary shadow-md'
                          : 'bg-surface-container-low border-outline-variant hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">
                          {sess.session_id}
                        </span>
                        <span className="font-mono text-[10px] text-on-surface-variant">
                          {sess.process_graph?.completeness_score || sess.completeness_score || 0}% · {sess.turns_count || 0} turnos
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded bg-surface-container-highest border border-outline-variant text-[10px] font-mono text-on-surface-variant">
                            {sess.workspace_name || 'Mi Negocio / General'}
                          </span>
                        </div>
                        <h4 className="font-space text-sm font-bold text-white truncate">
                          {sess.canvas_title || ctx.process_name || 'Lienzo principal'}
                        </h4>
                        <p className="font-jakarta text-xs text-on-surface-variant truncate">
                          {ctx.company_name || sess.workspace_name || 'Sesión de Comunidad'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-on-surface-variant pt-1 border-t border-outline-variant/50">
                        <span>{(sess.messages || []).length} msgs</span>
                        <span>•</span>
                        <span>{(sess.process_graph?.steps || []).length} pasos</span>
                        <span>•</span>
                        <span>{(sess.generated_files || []).length} archivos</span>
                        {(sess.is_mine || sess.saved_to_account) && (
                          <span className="px-1.5 py-0.5 rounded bg-[#FFC93C]/15 text-[#FFC93C] border border-[#FFC93C]/30">
                            {sess.user_email || 'Guardada'}
                          </span>
                        )}
                        {sess.linked_quote_id && (
                          <span className="ml-auto px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {sess.linked_quote_id}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Columna Derecha: Detalle de Handoff SDD, Chat y Archivos */}
              {selectedSession && (
                <div className="lg:col-span-8 bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-outline-variant bg-surface-container flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-primary">{selectedSession.session_id}</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-[11px] font-mono text-on-surface-variant">
                          Espacio: {selectedSession.workspace_name || 'Mi Negocio / General'}
                        </span>
                        <h3 className="font-space text-sm sm:text-base font-bold text-white">
                          {selectedSession.canvas_title || selectedSession.process_graph?.business_context?.process_name || 'Lienzo FORMALIA'}
                        </h3>
                      </div>
                      <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                        {selectedSession.process_graph?.business_context?.company_name || selectedSession.workspace_name || 'Proceso operativo'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setStudioOverrideSession(selectedSession);
                          setPortalMode('studio');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant hover:border-primary text-xs font-space font-semibold text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] text-primary">edit_note</span>
                        <span>Retomar en Estudio</span>
                      </button>

                      {onPromoteGraphToProject && (
                        <button
                          type="button"
                          onClick={() => handleMaterializeGraph(selectedSession.process_graph)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-[#e09419] text-xs font-space font-bold cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[15px]">rocket_launch</span>
                          <span>Materializar en {activeProjectName}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => downloadChatTranscriptFile(selectedSession, 'md', `v${selectedSession.versions?.length || 1}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant hover:border-primary text-xs font-space text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] text-primary">download</span>
                        <span>Chat .md</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPlantUMLFile(selectedSession.process_graph, `v${selectedSession.versions?.length || 1}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant hover:border-primary text-xs font-space text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] text-cyan-400">code</span>
                        <span>.puml</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadCanonicalJSONFile(selectedSession.process_graph, `v${selectedSession.versions?.length || 1}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant hover:border-primary text-xs font-space text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] text-emerald-400">data_object</span>
                        <span>.json</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-tabs */}
                  <div className="px-4 pt-2 border-b border-outline-variant flex items-center gap-3 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'handoff', label: `HUs, Interfaces & Tablas (${handoff?.user_stories?.length || 0})`, icon: 'integration_instructions' },
                      { id: 'chat', label: `Chat Recopilado (${(selectedSession.messages || []).length})`, icon: 'forum' },
                      { id: 'files', label: `Archivos & Versiones (${(selectedSession.versions || []).length} ver · ${(selectedSession.generated_files || []).length} arch)`, icon: 'folder_copy' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDetailTab(tab.id)}
                        className={`inline-flex items-center gap-1.5 py-2.5 px-2 text-xs font-space font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                          detailTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-on-surface-variant hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Contenido Tab */}
                  <div className="p-4 overflow-y-auto max-h-[580px] space-y-4">
                    {detailTab === 'handoff' && handoff && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-space text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                            Historias de Usuario Derivadas ({handoff.user_stories.length})
                          </h4>
                          <div className="space-y-2">
                            {handoff.user_stories.map((st) => (
                              <div key={st.id} className="p-3 rounded-xl bg-surface-container border border-outline-variant text-xs space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-primary font-bold">{st.id} · {st.role}</span>
                                  <span className="font-mono text-[10px] text-on-surface-variant">Prioridad {st.priority} · {st.target_interface}</span>
                                </div>
                                <p className="text-white">
                                  <strong>Como</strong> {st.role}, <strong>quiero</strong> {st.action} <strong>para</strong> {st.benefit}.
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant">
                            <h5 className="font-space text-xs font-bold text-white mb-2">
                              Interfaces Sugeridas ({handoff.suggested_interfaces?.length || 0})
                            </h5>
                            <div className="space-y-1.5">
                              {(handoff.suggested_interfaces || []).map((iface) => (
                                <div key={iface.number} className="text-[11px] p-2 rounded-lg bg-surface-container-low border border-outline-variant/60">
                                  <div className="font-semibold text-white">{iface.title}</div>
                                  <div className="font-mono text-[10px] text-primary">{iface.platform}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant">
                            <h5 className="font-space text-xs font-bold text-white mb-2">
                              Tablas Derivadas ({handoff.suggested_data_models?.length || 0})
                            </h5>
                            <div className="space-y-1.5">
                              {(handoff.suggested_data_models || []).map((dm) => (
                                <div key={dm.tableName} className="text-[11px] p-2 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                                  <span className="font-mono font-semibold text-white">{dm.tableName}</span>
                                  <span className="font-mono text-[10px] text-on-surface-variant">{dm.attributes.length} cols</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-space text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                            Código PlantUML Compilado
                          </h4>
                          <pre className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant font-mono text-xs text-white overflow-x-auto">
                            {handoff.plantuml}
                          </pre>
                        </div>
                      </div>
                    )}

                    {detailTab === 'chat' && (
                      <div className="space-y-3">
                        {(selectedSession.messages || []).map((m, idx) => (
                          <div
                            key={m.id || idx}
                            className={`p-3.5 rounded-xl border text-xs ${
                              m.role === 'user'
                                ? 'bg-surface-container-highest border-outline-variant'
                                : 'bg-primary/5 border-primary/30'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono text-[10px] font-bold uppercase text-primary">
                                {m.role === 'user' ? 'Usuario' : 'FORMALIA'}
                              </span>
                              <span className="font-mono text-[10px] text-on-surface-variant">
                                {m.timestamp ? new Date(m.timestamp).toLocaleString('es-PE') : ''}
                              </span>
                            </div>
                            <p className="font-jakarta text-white leading-relaxed">{m.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {detailTab === 'files' && (
                      <div className="space-y-5">
                        <div>
                          <h4 className="font-space text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                            Archivos Generados ({(selectedSession.generated_files || []).length})
                          </h4>
                          {(selectedSession.generated_files || []).length === 0 ? (
                            <p className="text-xs text-on-surface-variant">No hay archivos exportados aún en esta sesión.</p>
                          ) : (
                            <div className="space-y-2.5">
                              {selectedSession.generated_files.map((file) => (
                                <div
                                  key={file.id}
                                  className="p-3.5 rounded-xl bg-surface-container border border-outline-variant flex flex-wrap items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                                      <span className="material-symbols-outlined text-[18px]">
                                        {file.artifact_kind === 'png' ? 'image' : file.artifact_kind === 'pdf' ? 'picture_as_pdf' : 'description'}
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-space text-xs font-bold text-white truncate">{file.file_name}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono text-[10px] font-bold">
                                          {file.version_label}
                                        </span>
                                      </div>
                                      <p className="font-jakarta text-[11px] text-on-surface-variant truncate">
                                        {file.artifact_kind.toUpperCase()} · {formatBytes(file.size_bytes)} · {file.change_summary}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {(file.content_text || file.data_url) && (
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadArchivedFile(file)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant hover:border-primary text-xs font-space text-white cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">download</span>
                                        <span>Descargar</span>
                                      </button>
                                    )}
                                    {onSaveToProjectFiles && (
                                      <button
                                        type="button"
                                        onClick={() => handlePromoteFileToProject(file)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-[#e09419] text-xs font-space font-semibold cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">drive_file_move</span>
                                        <span>Guardar en Proyecto</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-space text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                            Snapshots de Versiones ({(selectedSession.versions || []).length})
                          </h4>
                          <div className="space-y-2">
                            {[...(selectedSession.versions || [])].reverse().map((v) => (
                              <div
                                key={v.version_label}
                                className="p-3 rounded-xl bg-surface-container-highest/60 border border-outline-variant flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-mono text-[10px] font-bold">
                                      {v.version_label}
                                    </span>
                                    <span className="text-xs font-space font-semibold text-white">
                                      {v.actors_count} roles · {v.steps_count} pasos · {v.completeness_score}%
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{v.change_summary}</p>
                                </div>
                                <span className="font-mono text-[10px] text-on-surface-variant shrink-0">
                                  {v.created_at ? new Date(v.created_at).toLocaleString('es-PE') : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
