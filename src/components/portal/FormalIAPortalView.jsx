import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchFormaliaArchive,
  downloadChatTranscriptFile,
  downloadPlantUMLFile,
  downloadCanonicalJSONFile
} from '../../services/formaliaService';
import { generateEngineeringHandoff } from '../../lib/formalia/compilers';

function formatBytes(bytes = 0) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function FormalIAPortalView({ activeProjectId, onSaveToProjectFiles, onNotify }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [detailTab, setDetailTab] = useState('chat'); // 'chat' | 'files' | 'handoff'

  const loadSessions = async () => {
    setLoading(true);
    try {
      const list = await fetchFormaliaArchive();
      setSessions(list);
      if (list.length > 0 && !selectedSessionId) {
        setSelectedSessionId(list[0].session_id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => {
      const ctx = s.process_graph?.business_context || {};
      return (
        (s.session_id || '').toLowerCase().includes(q) ||
        (ctx.company_name || '').toLowerCase().includes(q) ||
        (ctx.process_name || '').toLowerCase().includes(q) ||
        (s.linked_quote_id || '').toLowerCase().includes(q)
      );
    });
  }, [sessions, searchQuery]);

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
      projectId: activeProjectId === 'all' ? 'pathrimonio-site' : activeProjectId,
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
      {/* Subheader métricas FORMALIA */}
      <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-3 sm:px-4 lg:px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  FORMALIA — Chats, Archivos & Versiones
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium">
                  Archivo Histórico & Trazabilidad
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                Recopilación centralizada de conversaciones FORMALIA, artefactos generados (.puml, PNG, PDF, JSON) y versiones evolutivas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-primary">forum</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase">Sesiones</span>
                <span className="font-mono text-xs font-bold text-white">{sessions.length} Chats</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">history</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase">Versiones</span>
                <span className="font-mono text-xs font-bold text-white">{totalVersions} Snapshots</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-cyan-400">folder_zip</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase">Archivos</span>
                <span className="font-mono text-xs font-bold text-white">{totalFiles} Generados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cuerpo principal */}
      <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5 flex flex-col gap-5">
        
        {/* Barra de Búsqueda Adaptativa */}
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center gap-2.5 sm:gap-3 shadow-sm">
          <div className="relative flex-1 min-w-[240px] sm:min-w-[280px] w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar sesión FORMALIA por ID (FIA-...), empresa, proceso o cotización..."
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl pl-10 pr-9 py-2 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

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
              Inicia una conversación en FORMALIA desde la portada principal para que los chats, archivos (.puml, PNG, PDF, JSON) y sus versiones aparezcan aquí automáticamente.
            </p>
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
                      <h4 className="font-space text-sm font-bold text-white truncate">
                        {ctx.company_name || 'Sesión sin nombre comercial'}
                      </h4>
                      <p className="font-jakarta text-xs text-on-surface-variant truncate">
                        {ctx.process_name || 'Operación por mapear'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-on-surface-variant pt-1 border-t border-outline-variant/50">
                      <span>{(sess.messages || []).length} msgs</span>
                      <span>•</span>
                      <span>{(sess.versions || []).length} ver</span>
                      <span>•</span>
                      <span>{(sess.generated_files || []).length} archivos</span>
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

            {/* Columna Derecha: Detalle de Chat, Archivos y Versiones */}
            {selectedSession && (
              <div className="lg:col-span-8 bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-outline-variant bg-surface-container flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{selectedSession.session_id}</span>
                      <h3 className="font-space text-sm sm:text-base font-bold text-white">
                        {selectedSession.process_graph?.business_context?.company_name || 'Empresa por definir'}
                      </h3>
                    </div>
                    <p className="font-jakarta text-xs text-on-surface-variant">
                      {selectedSession.process_graph?.business_context?.process_name || 'Proceso operativo'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
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
                    { id: 'chat', label: `Chat Recopilado (${(selectedSession.messages || []).length})`, icon: 'forum' },
                    { id: 'files', label: `Archivos & Versiones (${(selectedSession.versions || []).length} ver · ${(selectedSession.generated_files || []).length} arch)`, icon: 'folder_copy' },
                    { id: 'handoff', label: `PlantUML & HUs (${handoff?.user_stories?.length || 0})`, icon: 'integration_instructions' }
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

                  {detailTab === 'handoff' && handoff && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-space text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                          Código PlantUML Compilado
                        </h4>
                        <pre className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant font-mono text-xs text-white overflow-x-auto">
                          {handoff.plantuml}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-space text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                          Borrador de Historias de Usuario ({handoff.user_stories.length})
                        </h4>
                        <div className="space-y-2">
                          {handoff.user_stories.map((st) => (
                            <div key={st.id} className="p-3 rounded-xl bg-surface-container border border-outline-variant text-xs">
                              <span className="font-mono text-primary font-bold mr-2">{st.id}</span>
                              <span className="text-white">
                                <strong>Como</strong> {st.role}, <strong>quiero</strong> {st.action} <strong>para</strong> {st.benefit}.
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
    </div>
  );
}
