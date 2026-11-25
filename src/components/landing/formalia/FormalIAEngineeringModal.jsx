import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  ListChecks,
  Database,
  Shield,
  MessageSquare,
  History,
  FileCode2,
  RotateCcw,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { generateEngineeringHandoff } from '../../../lib/formalia/compilers';
import {
  buildChatMarkdown,
  downloadCanonicalJSONFile,
  downloadChatTranscriptFile,
  downloadPlantUMLFile
} from '../../../services/formaliaService';

function formatBytes(bytes = 0) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function FormalIAEngineeringModal({
  isOpen,
  onClose,
  graph,
  messages = [],
  versions = [],
  generatedFiles = [],
  initialTab = 'plantuml',
  onRecordArtifact,
  onRestoreVersion
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedKey, setCopiedKey] = useState(null);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handoff = useMemo(() => {
    if (!graph) return null;
    return generateEngineeringHandoff(graph);
  }, [graph]);

  if (!isOpen || !handoff) return null;

  const currentVersionLabel = versions.length > 0 ? versions[versions.length - 1].version_label : 'v1';
  const currentVersionNum = versions.length > 0 ? versions[versions.length - 1].version_number : 1;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPuml = () => {
    const fileMeta = downloadPlantUMLFile(graph, currentVersionLabel);
    onRecordArtifact?.({
      id: `${graph.session_id}_puml_${currentVersionLabel}_${Date.now()}`,
      session_id: graph.session_id,
      version_number: currentVersionNum,
      version_label: currentVersionLabel,
      artifact_kind: 'puml',
      file_name: fileMeta.fileName,
      mime_type: fileMeta.mimeType,
      content_text: fileMeta.contentText,
      size_bytes: fileMeta.sizeBytes,
      change_summary: 'Exportación manual PlantUML desde FORMALIA Studio',
      chat_turns_at: messages.filter((m) => m.role === 'user').length
    });
  };

  const handleDownloadJson = () => {
    const fileMeta = downloadCanonicalJSONFile(graph, currentVersionLabel);
    onRecordArtifact?.({
      id: `${graph.session_id}_json_${currentVersionLabel}_${Date.now()}`,
      session_id: graph.session_id,
      version_number: currentVersionNum,
      version_label: currentVersionLabel,
      artifact_kind: 'json',
      file_name: fileMeta.fileName,
      mime_type: fileMeta.mimeType,
      content_text: fileMeta.contentText,
      size_bytes: fileMeta.sizeBytes,
      change_summary: 'Exportación de ProcessGraphJSON canónico',
      chat_turns_at: messages.filter((m) => m.role === 'user').length
    });
  };

  const handleDownloadChat = (format) => {
    const fakeSession = {
      session_id: graph.session_id,
      process_graph: graph,
      messages,
      versions,
      turns_count: messages.filter((m) => m.role === 'user').length,
      max_turns: 15
    };
    const fileMeta = downloadChatTranscriptFile(fakeSession, format, currentVersionLabel);
    onRecordArtifact?.({
      id: `${graph.session_id}_chat_${format}_${currentVersionLabel}_${Date.now()}`,
      session_id: graph.session_id,
      version_number: currentVersionNum,
      version_label: currentVersionLabel,
      artifact_kind: 'chat_transcript',
      file_name: fileMeta.fileName,
      mime_type: fileMeta.mimeType,
      content_text: fileMeta.contentText,
      size_bytes: fileMeta.sizeBytes,
      change_summary: `Transcripción de chat FORMALIA (${messages.length} mensajes)`,
      chat_turns_at: fakeSession.turns_count
    });
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Paquete Técnico y Versiones FORMALIA"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] rounded-[16px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-[#FFC000] text-[#09090B] font-mono text-[10px] font-bold">
                FORMALIA · {currentVersionLabel}
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-[#09090B] dark:text-[#F4F4F5]">
                Paquete Técnico, Chat y Versiones FORMALIA — {handoff.process_name || 'Proceso'}
              </h3>
            </div>
            <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
              Sesión <span className="font-mono">{handoff.session_id}</span> · {messages.length} mensajes recopilados · {versions.length} versiones · {generatedFiles.length} archivos generados.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal FORMALIA"
            className="p-2 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'plantuml', label: 'Código PlantUML (.puml)', icon: Code2 },
            { id: 'versions', label: `Archivos & Versiones (${versions.length} · ${generatedFiles.length})`, icon: History },
            { id: 'chat', label: `Chat Recopilado (${messages.length})`, icon: MessageSquare },
            { id: 'stories', label: `Historias (${handoff.user_stories.length})`, icon: ListChecks },
            { id: 'rbac', label: `Entidades & RBAC (${handoff.rbac_rules.length})`, icon: Shield },
            { id: 'json', label: 'ProcessGraphJSON', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-[#FFC000] text-[#09090B] dark:text-[#F4F4F5]'
                    : 'border-transparent text-[#71717A] hover:text-[#09090B] dark:hover:text-[#F4F4F5]'
                }`}
              >
                <Icon size={14} className={active ? 'text-[#9A6700] dark:text-[#FFC000]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#FAFAFA] dark:bg-[#09090B]/40">
          {activeTab === 'plantuml' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Diagrama de actividad con carriles (<span className="font-mono">|Rol|</span>) versión <span className="font-mono font-semibold">{currentVersionLabel}</span>.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(handoff.plantuml, 'puml')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] hover:border-[#FFC000] cursor-pointer"
                  >
                    {copiedKey === 'puml' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedKey === 'puml' ? 'Copiado' : 'Copiar .puml'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPuml}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFC000] text-[#09090B] text-xs font-semibold hover:bg-[#E5AC00] cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Descargar .puml ({currentVersionLabel})</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-[10px] bg-[#09090B] text-[#F4F4F5] border border-[#27272A] font-mono text-xs overflow-x-auto leading-relaxed">
                {handoff.plantuml}
              </pre>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-6">
              {/* Timeline de Versiones del Proceso */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#52525B] dark:text-[#A1A1AA] mb-2.5">
                  Versiones del Proceso FORMALIA ({versions.length})
                </h4>
                {versions.length === 0 ? (
                  <p className="text-xs text-[#71717A] p-4 rounded-[10px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113]">
                    Envía al menos un mensaje en el chat de FORMALIA o carga el ejemplo para generar la versión <span className="font-mono">v1</span>.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {[...versions].reverse().map((v) => (
                      <div
                        key={v.version_label}
                        className="p-3.5 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-[#FFC000] text-[#09090B] font-mono text-[11px] font-bold">
                              {v.version_label}
                            </span>
                            <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5]">
                              {v.actors_count} roles · {v.steps_count} pasos · {v.completeness_score}% completitud
                            </span>
                            <span className="text-[11px] font-mono text-[#71717A]">
                              {v.created_at ? new Date(v.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] truncate">
                            {v.change_summary}
                          </p>
                        </div>

                        {onRestoreVersion && (
                          <button
                            type="button"
                            onClick={() => {
                              onRestoreVersion(v);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] hover:border-[#FFC000] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] cursor-pointer shrink-0"
                          >
                            <RotateCcw size={12} />
                            <span>Restaurar {v.version_label}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Archivos Generados y Exportados */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#52525B] dark:text-[#A1A1AA] mb-2.5">
                  Archivos Generados con FORMALIA ({generatedFiles.length})
                </h4>
                {generatedFiles.length === 0 ? (
                  <p className="text-xs text-[#71717A] p-4 rounded-[10px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113]">
                    Los archivos <span className="font-mono">.puml</span>, <span className="font-mono">.png</span>, <span className="font-mono">.pdf</span>, <span className="font-mono">.json</span> y transcripciones de chat aparecerán aquí automáticamente.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {generatedFiles.map((file) => {
                      const Icon = file.artifact_kind === 'png'
                        ? ImageIcon
                        : file.artifact_kind === 'pdf'
                          ? FileText
                          : file.artifact_kind === 'chat_transcript'
                            ? MessageSquare
                            : FileCode2;
                      return (
                        <div
                          key={file.id}
                          className="p-3 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-[6px] bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[#9A6700] dark:text-[#FFC000] flex items-center justify-center shrink-0">
                              <Icon size={15} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] truncate">
                                  {file.file_name}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-[#F4F4F5] dark:bg-[#18181B] font-mono text-[9px] text-[#52525B] dark:text-[#A1A1AA] border border-[#E4E4E7] dark:border-[#27272A]">
                                  {file.version_label}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#71717A] truncate">
                                {file.artifact_kind.toUpperCase()} · {formatBytes(file.size_bytes)}
                              </p>
                            </div>
                          </div>

                          {(file.content_text || (file.data_url && file.artifact_kind === 'png')) && (
                            <button
                              type="button"
                              onClick={() => handleDownloadArchivedFile(file)}
                              className="p-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] hover:border-[#FFC000] text-[#09090B] dark:text-[#F4F4F5] cursor-pointer shrink-0"
                              title="Descargar archivo"
                            >
                              <Download size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Chat completo recopilado en esta sesión de FORMALIA ({messages.length} mensajes).
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleCopy(buildChatMarkdown({ session_id: graph.session_id, process_graph: graph, messages, turns_count: messages.filter((m) => m.role === 'user').length }), 'chat_md')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] hover:border-[#FFC000] cursor-pointer"
                  >
                    {copiedKey === 'chat_md' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedKey === 'chat_md' ? 'Copiado' : 'Copiar Chat'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadChat('md')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] hover:border-[#FFC000] cursor-pointer"
                  >
                    <Download size={13} />
                    <span>.md</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadChat('json')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFC000] text-[#09090B] text-xs font-semibold hover:bg-[#E5AC00] cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Descargar Chat .json</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-3 rounded-[10px] border text-xs ${
                      m.role === 'user'
                        ? 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#3F3F46]'
                        : 'bg-[#FFFBEB]/50 dark:bg-amber-500/[0.06] border-amber-200 dark:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold uppercase text-[#9A6700] dark:text-[#FFC000]">
                        {m.role === 'user' ? 'Usuario' : 'FORMALIA'}
                      </span>
                      <span className="font-mono text-[10px] text-[#71717A]">
                        {m.timestamp ? new Date(m.timestamp).toLocaleString('es-PE') : ''}
                      </span>
                    </div>
                    <p className="text-[#09090B] dark:text-[#F4F4F5] leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stories' && (
            <div className="space-y-3">
              {handoff.user_stories.length === 0 ? (
                <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Aún no hay pasos suficientes en el diagrama para generar historias. Describe pasos en el chat primero.
                </p>
              ) : (
                handoff.user_stories.map((story) => (
                  <div
                    key={story.id}
                    className="p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#F4F4F5] border border-[#E4E4E7] dark:border-[#27272A]">
                          {story.id}
                        </span>
                        <span className="text-xs font-semibold text-[#9A6700] dark:text-[#FFC000]">
                          {story.role}
                        </span>
                      </div>
                      {story.is_priority_automation && (
                        <span className="px-2 py-0.5 rounded bg-[#FFC000]/20 border border-[#FFC000]/40 text-[#9A6700] dark:text-[#FFC000] text-[10px] font-mono font-semibold">
                          Automatización Prioritaria
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#09090B] dark:text-[#F4F4F5] leading-relaxed">
                      <strong>Como</strong> {story.role}, <strong>quiero</strong> {story.action} <strong>para</strong> {story.benefit}.
                    </p>
                    <div className="pt-2 border-t border-[#E4E4E7] dark:border-[#27272A] space-y-1">
                      {story.acceptance_criteria.map((c, idx) => (
                        <div key={idx} className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] flex items-start gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <div className="p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A]">
                <h4 className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] mb-2">
                  Entidades de Base de Datos Detectadas ({handoff.entities.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {handoff.entities.map((ent) => (
                    <span
                      key={ent}
                      className="px-2.5 py-1 rounded-[6px] bg-[#F4F4F5] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] font-mono text-xs text-[#09090B] dark:text-[#F4F4F5]"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {handoff.rbac_rules.map((rule) => (
                  <div
                    key={rule.actor_id}
                    className="p-4 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5]">
                        {rule.role_name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#FFFBEB] dark:bg-amber-500/10 text-[#9A6700] dark:text-[#FFC000] font-mono text-[10px] border border-amber-200 dark:border-amber-500/30">
                        {rule.actor_type === 'EXTERNAL_CUSTOMER' ? 'Externo' : 'Socio $1/día'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                      {rule.access_scope}
                    </span>
                    {rule.permitted_actions.length > 0 && (
                      <ul className="text-[11px] text-[#09090B] dark:text-[#E4E4E7] list-disc list-inside space-y-0.5">
                        {rule.permitted_actions.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Modelo Canónico de Procesos (<span className="font-mono">ProcessGraphJSON</span>) — Fuente única de verdad.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(graph, null, 2), 'json')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] hover:border-[#FFC000] cursor-pointer"
                  >
                    {copiedKey === 'json' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedKey === 'json' ? 'Copiado' : 'Copiar JSON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFC000] text-[#09090B] text-xs font-semibold hover:bg-[#E5AC00] cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Descargar .json ({currentVersionLabel})</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-[10px] bg-[#09090B] text-[#F4F4F5] border border-[#27272A] font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(graph, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
