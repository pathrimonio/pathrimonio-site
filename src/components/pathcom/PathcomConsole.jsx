import React, { useEffect, useState } from 'react';
import {
  Bot,
  Send,
  Clock,
  Store,
  FolderGit2,
  ShieldCheck,
  Sparkles,
  Plus,
  Smartphone,
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  DEFAULT_PATHCOM_MODULE_FLAGS,
  createManualPathLog,
  detectBrowserTimezone,
  fetchPathcomBootstrap,
  resolvePathcomApproval,
  sendPathcomChat,
  submitSiteProjectCms,
  syncPathwayLogs,
  validateMarketPath
} from '../../services/pathcomService';
import { getQuickActionsForRole } from '../../lib/pathcom/rbacPolicy';
import PathTimeline from './PathTimeline';
import PathMarketView from './PathMarketView';
import PathcomApprovalsQueue from './PathcomApprovalsQueue';

const ROLE_DISPLAY = {
  guest: 'Visitante',
  user: 'Usuario',
  partner: 'Socio',
  collaborator: 'Colaborador',
  admin: 'Admin'
};

export default function PathcomConsole({
  currentUser = null,
  isStandalonePage = false,
  onBackHome,
  onOpenPortal,
  onSiteProjectsChange,
  onNotify
}) {
  const [activeViewTab, setActiveViewTab] = useState('console');
  const [loading, setLoading] = useState(true);
  const [actor, setActor] = useState({ roleCode: 'guest', authenticated: false, userName: 'Visitante' });
  const [featureFlags, setFeatureFlags] = useState(DEFAULT_PATHCOM_MODULE_FLAGS);
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [marketPaths, setMarketPaths] = useState([]);
  const [siteProjects, setSiteProjects] = useState([]);
  const [approvals, setApprovals] = useState([]);

  // Chat input
  const [promptInput, setPromptInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);

  // Registro manual de path_log
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [logDuration, setLogDuration] = useState(30);
  const [logProgress, setLogProgress] = useState(50);
  const [logBusy, setLogBusy] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);

  // Editor CMS borrador (collaborator/admin)
  const [cmsProjectId, setCmsProjectId] = useState('core-hub');
  const [cmsDraftName, setCmsDraftName] = useState('');
  const [cmsDraftStatus, setCmsDraftStatus] = useState('IN_PROGRESS');
  const [cmsDraftSummary, setCmsDraftSummary] = useState('');
  const [cmsBusy, setCmsBusy] = useState(false);

  const clientTz = detectBrowserTimezone();
  const isStaff = ['collaborator', 'admin'].includes(actor.roleCode);
  const canSyncPathway = ['partner', 'collaborator', 'admin'].includes(actor.roleCode);
  const quickActions = getQuickActionsForRole(actor.roleCode);
  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  const loadBootstrap = async () => {
    setLoading(true);
    try {
      const data = await fetchPathcomBootstrap(currentUser);
      setActor(data.actor);
      setFeatureFlags(data.featureFlags || DEFAULT_PATHCOM_MODULE_FLAGS);
      setMarketPaths(data.marketPaths || []);
      setSiteProjects(data.siteProjects || []);
      setLogs(data.logs || []);
      setApprovals(data.approvals || []);
      onSiteProjectsChange?.(data.siteProjects || []);
      setMessages(
        data.messages?.length
          ? data.messages
          : [
              {
                id: 'welcome-pathcom',
                sender: 'assistant',
                content:
                  data.actor.roleCode === 'guest'
                    ? 'Hola, soy Pathcom. Puedes explorar los proyectos publicados en pathrimonio.site y las rutas verificadas de Pathrimonio Market. Inicia sesión para registrar tus avances con hora exacta.'
                    : `Hola ${data.actor.userName}, soy Pathcom (rol activo: ${ROLE_DISPLAY[data.actor.roleCode] || data.actor.roleCode}). ¿Registramos tu avance de hoy, compilamos una ruta o revisamos proyectos?`,
                tool_executions: []
              }
            ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBootstrap();
  }, [currentUser?.email, currentUser?.role]);

  const handleSendChat = async (textOverride = null) => {
    const text = String(textOverride ?? promptInput).trim();
    if (!text || chatBusy) return;
    if (!textOverride) setPromptInput('');

    const userBubble = {
      id: `local-u-${Date.now()}`,
      sender: 'user',
      content: text,
      tool_executions: []
    };
    setMessages((prev) => [...prev, userBubble]);
    setChatBusy(true);
    try {
      const res = await sendPathcomChat(text, currentUser);
      setMessages((prev) => [
        ...prev,
        {
          id: `local-a-${Date.now()}`,
          sender: 'assistant',
          content: res.reply_text,
          tool_executions: res.tool_executions || [],
          rbac_denied: Boolean(res.rbac_denied)
        }
      ]);
      // Refrescar estado si alguna herramienta mutó datos
      if ((res.tool_executions || []).some((t) => t.ok)) {
        await loadBootstrap();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-err-${Date.now()}`,
          sender: 'assistant',
          content: err?.message || 'No se pudo procesar la consulta en Pathcom.',
          rbac_denied: err?.status === 403
        }
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  const handleManualLogSubmit = async (e) => {
    e.preventDefault();
    if (!actor.authenticated) {
      onOpenPortal?.();
      return;
    }
    if (!logTitle.trim()) return;
    setLogBusy(true);
    try {
      const created = await createManualPathLog(
        {
          title: logTitle,
          content: logContent || logTitle,
          duration_minutes: Number(logDuration) || 0,
          progress_percent: Number(logProgress) || 0
        },
        currentUser
      );
      setLogTitle('');
      setLogContent('');
      onNotify?.(`Avance "${created.title}" sellado por el servidor.`);
      await loadBootstrap();
    } catch (err) {
      onNotify?.(err?.message || 'Error al registrar avance.');
    } finally {
      setLogBusy(false);
    }
  };

  const handlePathwaySync = async () => {
    if (!actor.authenticated) {
      onOpenPortal?.();
      return;
    }
    setSyncBusy(true);
    try {
      const res = await syncPathwayLogs(currentUser);
      const count = res?.imported_logs?.length || 0;
      onNotify?.(
        count > 0
          ? `${count} hito(s) importado(s) desde Pathway con su hora original.`
          : 'Tus metas de Pathway ya estaban al día.'
      );
      await loadBootstrap();
    } catch (err) {
      onNotify?.(err?.message || 'El puente con Pathway requiere perfil Socio o Técnico.');
    } finally {
      setSyncBusy(false);
    }
  };

  const handleCmsAction = async (requestPublish) => {
    setCmsBusy(true);
    try {
      await submitSiteProjectCms(
        {
          project_id: cmsProjectId,
          draft_name: cmsDraftName || undefined,
          draft_status: cmsDraftStatus,
          draft_summary: cmsDraftSummary || undefined,
          request_publish: requestPublish
        },
        currentUser
      );
      onNotify?.(
        requestPublish
          ? 'Borrador enviado a Bandeja de Aprobaciones antes de publicar.'
          : 'Borrador CMS guardado en estado DRAFT.'
      );
      await loadBootstrap();
    } catch (err) {
      onNotify?.(err?.message || 'No se pudo procesar el borrador CMS.');
    } finally {
      setCmsBusy(false);
    }
  };

  const handleResolveApproval = async (payload) => {
    const res = await resolvePathcomApproval(payload, currentUser);
    if (res?.site_projects) {
      setSiteProjects(res.site_projects);
      onSiteProjectsChange?.(res.site_projects);
    }
    onNotify?.(`Solicitud ${payload.id} marcada como ${payload.status}.`);
    await loadBootstrap();
  };

  const navTabs = [
    { id: 'console', label: 'Consola Pathcom', icon: Bot },
    { id: 'timeline', label: `Línea de Tiempo (${logs.length})`, icon: Clock },
    { id: 'market', label: `Pathrimonio Market (${marketPaths.length})`, icon: Store },
    {
      id: 'ops',
      label: isStaff ? `Proyectos & Aprobaciones (${pendingCount})` : `Proyectos Activos (${siteProjects.length})`,
      icon: isStaff ? ShieldCheck : FolderGit2
    }
  ];

  return (
    <section className="w-full py-10 sm:py-14">
      <div className="site-container">
        {/* Cabecera */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <div>
            {isStandalonePage && onBackHome && (
              <button
                type="button"
                onClick={onBackHome}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Volver al inicio</span>
              </button>
            )}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs font-mono font-semibold text-[var(--text-primary)]">
                <Sparkles size={12} className="text-[var(--accent-text)]" />
                <span>AGENTE PATHCOM · V1</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[var(--accent-soft)] border border-[var(--accent-border)] font-mono text-[11px] font-semibold text-[var(--accent-text)]">
                Rol: {ROLE_DISPLAY[actor.roleCode] || actor.roleCode}
              </span>
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                Zona horaria: {clientTz}
              </span>
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-muted)]">
                Clubes (Fit): {featureFlags.clubs_enabled ? 'Activo' : 'Fase Futura'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.025em]">
              Operaciones, Rutas Cronológicas y Pathrimonio Market
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-[68ch]">
              Registra avances reales con hora exacta sellada en servidor, compila conocimiento validado por pares y gestiona proyectos con aprobación humana.
            </p>
          </div>

          {!actor.authenticated && onOpenPortal && (
            <button
              type="button"
              onClick={onOpenPortal}
              className="btn-accent inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold shrink-0 cursor-pointer"
            >
              <Lock size={13} />
              <span>Iniciar sesión para registrar avances</span>
            </button>
          )}
        </div>

        {/* Selector de vistas */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-6 border-b border-[var(--border-subtle)]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeViewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveViewTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] shadow-xs'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs font-mono text-[var(--text-secondary)]">
            Cargando consola de Pathcom y registros cronológicos...
          </div>
        ) : (
          <>
            {/* TAB 1: CONSOLA CONVERSACIONAL + TARJETAS COMPACTAS DE HERRAMIENTAS */}
            {activeViewTab === 'console' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                      <Bot size={15} className="text-[var(--accent-text)]" />
                      <span>Consola Conversacional Pathcom</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      Tool Calling + RBAC en servidor
                    </span>
                  </div>

                  {/* Mensajes */}
                  <div className="p-4 sm:p-5 space-y-4 max-h-[460px] overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-2 ${
                          msg.sender === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[90%] sm:max-w-[82%] rounded-[10px] px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                            msg.sender === 'user'
                              ? 'bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] font-medium'
                              : msg.rbac_denied
                                ? 'bg-red-500/10 border border-red-500/35 text-[var(--text-primary)]'
                                : 'bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)]'
                          }`}
                        >
                          {msg.content}
                        </div>

                        {/* Tarjetas compactas de confirmación (cero JSON crudo) */}
                        {Array.isArray(msg.tool_executions) && msg.tool_executions.length > 0 && (
                          <div className="flex flex-col gap-1.5 max-w-[90%] sm:max-w-[82%]">
                            {msg.tool_executions.map((exec, idx) => (
                              <div
                                key={`${msg.id}-tool-${idx}`}
                                className={`px-3 py-2 rounded-[8px] border text-xs flex items-start gap-2 ${
                                  exec.ok
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--text-primary)]'
                                    : 'bg-amber-500/10 border-amber-500/35 text-[var(--text-primary)]'
                                }`}
                              >
                                {exec.ok ? (
                                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <span className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)] block">
                                    {exec.tool_name} · {exec.operation}
                                  </span>
                                  <span>{exec.ok ? exec.summary : exec.error}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Acciones rápidas según rol + Input */}
                  <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-page)]/50 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {quickActions.map((qa) => (
                        <button
                          key={qa.id}
                          type="button"
                          disabled={chatBusy}
                          onClick={() => handleSendChat(qa.prompt)}
                          className="px-2.5 py-1 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChat();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder={
                          actor.authenticated
                            ? 'Ej: Registrar avance: Cierre de caja por rol completado (40 min, 75%)'
                            : 'Pregunta sobre rutas del Market o proyectos publicados...'
                        }
                        className="flex-1 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-strong)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                      <button
                        type="submit"
                        disabled={chatBusy || !promptInput.trim()}
                        className="btn-accent inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        <Send size={13} />
                        <span>{chatBusy ? 'Ejecutando...' : 'Enviar'}</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Columna lateral: Resumen rápido de Línea de Tiempo */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="p-5 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                        Últimos registros con hora
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveViewTab('timeline')}
                        className="text-[11px] text-[var(--accent-text)] font-semibold hover:underline cursor-pointer"
                      >
                        Ver todo →
                      </button>
                    </div>
                    <PathTimeline compact logs={logs.slice(0, 3)} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LÍNEA DE TIEMPO + CAPTURA DIRECTA DE PATH LOGS + PUENTE PATHWAY */}
            {activeViewTab === 'timeline' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <form
                    onSubmit={handleManualLogSubmit}
                    className="p-5 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Nuevo Registro de Ruta
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-500">
                        Hora sellada en servidor
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      value={logTitle}
                      onChange={(e) => setLogTitle(e.target.value)}
                      placeholder="Ej: Configuración de arqueo ciego en Caja"
                      className="w-full rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />

                    <textarea
                      rows={3}
                      value={logContent}
                      onChange={(e) => setLogContent(e.target.value)}
                      placeholder="Detalle de lo ejecutado, validación o aprendizaje del paso..."
                      className="w-full rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-secondary)] mb-1">
                          Duración (min)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={logDuration}
                          onChange={(e) => setLogDuration(e.target.value)}
                          className="w-full rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono tabular-nums text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-secondary)] mb-1">
                          Avance (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={logProgress}
                          onChange={(e) => setLogProgress(e.target.value)}
                          className="w-full rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono tabular-nums text-[var(--text-primary)]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={logBusy}
                      className="btn-accent inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <Plus size={14} />
                      <span>
                        {actor.authenticated
                          ? logBusy
                            ? 'Registrando...'
                            : 'Registrar con hora verificada'
                          : 'Inicia sesión para registrar'}
                      </span>
                    </button>
                  </form>

                  {/* Puente con Pathway */}
                  <div className="p-5 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                      <Smartphone size={14} className="text-sky-400" />
                      <span>Puente con Pathway App</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Importa tus metas completadas desde Pathway conservando sus marcas de tiempo originales sin duplicados.
                    </p>
                    <button
                      type="button"
                      disabled={syncBusy || !canSyncPathway}
                      onClick={handlePathwaySync}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs font-semibold text-[var(--text-primary)] hover:border-sky-400 cursor-pointer disabled:opacity-50"
                    >
                      <span>
                        {canSyncPathway
                          ? syncBusy
                            ? 'Sincronizando...'
                            : 'Importar hitos de Pathway'
                          : 'Disponible desde rol Socio / Equipo'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <PathTimeline
                    logs={logs}
                    emptyText="Registra tu primer avance para iniciar tu línea de tiempo con fecha y hora exacta."
                  />
                </div>
              </div>
            )}

            {/* TAB 3: PATHRIMONIO MARKET */}
            {activeViewTab === 'market' && (
              <PathMarketView
                marketPaths={marketPaths}
                actor={actor}
                onValidatePath={async (id, payload) => {
                  await validateMarketPath(id, payload, currentUser);
                  onNotify?.('Validación por pares registrada correctamente.');
                  await loadBootstrap();
                }}
                onRunAgentCommand={async (cmd) => {
                  setActiveViewTab('console');
                  await handleSendChat(cmd);
                }}
                onRequireAuth={onOpenPortal}
                onNotify={onNotify}
              />
            )}

            {/* TAB 4: PROYECTOS PUBLICADOS, BORRADORES CMS Y BANDEJA DE APROBACIONES */}
            {activeViewTab === 'ops' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">
                    Proyectos de Pathrimonio ({siteProjects.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {siteProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-5 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                              {proj.status}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--text-muted)]">
                              {proj.cms_state === 'DRAFT' ? 'CON BORRADOR DRAFT' : 'PUBLICADO'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                            {proj.name}
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {proj.public_summary}
                          </p>
                          {isStaff && proj.draft_summary && (
                            <div className="mt-3 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-[var(--text-primary)]">
                              <strong className="block font-mono text-[10px] text-amber-400">
                                Borrador pendiente:
                              </strong>
                              <span>{proj.draft_summary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isStaff && (
                  <>
                    <div className="p-5 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        CMS Asistido (`site_cms_tool`) — Crear borrador DRAFT o enviar a aprobación
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={cmsProjectId}
                          onChange={(e) => setCmsProjectId(e.target.value)}
                          placeholder="ID proyecto (ej: core-hub)"
                          className="rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-primary)]"
                        />
                        <input
                          type="text"
                          value={cmsDraftName}
                          onChange={(e) => setCmsDraftName(e.target.value)}
                          placeholder="Título propuesto (opcional)"
                          className="rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-primary)]"
                        />
                        <select
                          value={cmsDraftStatus}
                          onChange={(e) => setCmsDraftStatus(e.target.value)}
                          className="rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-primary)]"
                        >
                          <option value="DISCOVERY">DISCOVERY</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="LIVE">LIVE</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={cmsDraftSummary}
                        onChange={(e) => setCmsDraftSummary(e.target.value)}
                        placeholder="Resumen público propuesto para el proyecto..."
                        className="w-full rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-primary)]"
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={cmsBusy}
                          onClick={() => handleCmsAction(false)}
                          className="px-4 py-2 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                        >
                          Guardar solo DRAFT
                        </button>
                        <button
                          type="button"
                          disabled={cmsBusy}
                          onClick={() => handleCmsAction(true)}
                          className="btn-accent px-4 py-2 text-xs font-bold cursor-pointer"
                        >
                          Encolar para aprobación
                        </button>
                      </div>
                    </div>

                    <PathcomApprovalsQueue
                      approvals={approvals}
                      actor={actor}
                      onResolveApproval={handleResolveApproval}
                    />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
