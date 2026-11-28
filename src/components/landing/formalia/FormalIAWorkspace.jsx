import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  GitBranch,
  Maximize2,
  Minimize2,
  FolderKanban,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Lock,
  AppWindow
} from 'lucide-react';
import {
  createInitialProcessGraph,
  extractWorkspaceMeta,
  generateFormaliaSessionId,
  SDD_EXAMPLE_LOGISTICS_GRAPH
} from '../../../lib/formalia/schema';
import { getAiDailyLimitForRole } from '../../../lib/formalia/blueprintSchema';
import {
  startFormaliaSession,
  sendFormaliaMessage,
  convertFormaliaToQuote,
  loadLocalFormaliaSession,
  saveLocalFormaliaSession,
  clearLocalFormaliaSession,
  createWelcomeMessage,
  buildVersionSnapshot,
  registerGeneratedArtifact,
  syncLinkedFormaliaSession,
  persistFormaliaSessionDraft,
  saveFormaliaSessionToAccount,
  fetchFormaliaArchive,
  loadLocalWorkspaces,
  saveLocalWorkspace,
  buildWorkspaceDirectory,
  normalizeSessionWorkspace,
  renameOrMoveFormaliaCanvas,
  deleteFormaliaCanvas,
  fetchFormaliaQuota,
  applyManualGraphPatches
} from '../../../services/formaliaService';
import FormalIAChatPanel from './FormalIAChatPanel';
import FormalIACanvasPanel from './FormalIACanvasPanel';
import FormalIASaveModal from './FormalIASaveModal';
import WebBlueprintModal from './WebBlueprintModal';

const INITIAL_SSR_GRAPH = createInitialProcessGraph('FIA-2026-INIT');
const INITIAL_SSR_WELCOME = {
  id: 'msg_welcome_init',
  role: 'assistant',
  content:
    'Hola, soy FORMALIA. Cuéntame en tus propias palabras qué proceso de tu negocio quieres graficar (por ejemplo ventas, pedidos, despachos o atención). Primero conversamos el alcance y luego vamos detallando juntos cada rol y actividad en el diagrama.',
  quick_replies: [
    'Quiero graficar el proceso de pedidos y despachos de mi distribuidora',
    'Quiero diagramar las ventas en mostrador y control de stock de mi ferretería',
    'Necesito mapear la atención de clientes, citas y cobranza de mi clínica'
  ],
  phase: '1_context',
  timestamp: '2026-11-25T00:00:00.000Z'
};

export default function FormalIAWorkspace({
  onPreloadQuote,
  isStandalonePage = false,
  isPortalEmbedded = false,
  currentUser = null,
  targetProjectName = '',
  portalProjects = [],
  activeProjectId = null,
  initialSessionOverride = null,
  onPromoteToProject,
  onSubmitImplementation,
  onOpenInPortal,
  onBackHome,
  onSessionListChanged
}) {
  const [session, setSession] = useState({
    session_id: INITIAL_SSR_GRAPH.session_id,
    process_graph: INITIAL_SSR_GRAPH,
    messages: [INITIAL_SSR_WELCOME],
    versions: [],
    generated_files: [],
    turns_count: 0,
    max_turns: getAiDailyLimitForRole(currentUser?.role, Boolean(currentUser && (currentUser.id || currentUser.email)))
  });
  const [clientHydrated, setClientHydrated] = useState(false);

  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'diagram'
  const [diagramUpdatedBadge, setDiagramUpdatedBadge] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [quota, setQuota] = useState(null);

  // Espacios de trabajo y múltiples lienzos (habilitado tras iniciar sesión)
  const isAuthenticated = Boolean(currentUser && (currentUser.id || currentUser.email));
  const [accountSessions, setAccountSessions] = useState([]);
  const [customWorkspaces, setCustomWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    activeProjectId && activeProjectId !== 'all' ? `ws_proj_${activeProjectId}` : 'ws_general'
  );
  const [accountDirectoryReady, setAccountDirectoryReady] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);
  const [newCanvasTitle, setNewCanvasTitle] = useState('');
  const [renamingSessionId, setRenamingSessionId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [workspaceBusy, setWorkspaceBusy] = useState(false);
  const prevPortalProjectRef = useRef(activeProjectId);

  // Hidrata sesión desde localStorage o inicia sesión remota tras montaje en cliente (SSR-safe)
  useEffect(() => {
    setClientHydrated(true);
    setCustomWorkspaces(loadLocalWorkspaces());

    if (initialSessionOverride && initialSessionOverride.session_id) {
      const normalized = normalizeSessionWorkspace({
        versions: [],
        generated_files: [],
        ...initialSessionOverride
      });
      saveLocalFormaliaSession(normalized);
      setSession(normalized);
      setSessionSaved(Boolean(normalized.saved_to_account));
      const meta = extractWorkspaceMeta(normalized);
      if (meta.workspace_id) setActiveWorkspaceId(meta.workspace_id);
      return;
    }

    const saved = loadLocalFormaliaSession();
    const savedOwner = String(saved?.user_email || '').trim().toLowerCase();
    const activeEmail = String(currentUser?.email || '').trim().toLowerCase();
    const isForeignSavedSession = Boolean(
      saved &&
        ((isAuthenticated && savedOwner && activeEmail && savedOwner !== activeEmail) ||
          (!isAuthenticated && (saved.saved_to_account || savedOwner)))
    );
    if (isForeignSavedSession) {
      clearLocalFormaliaSession();
    }

    if (saved && saved.session_id && saved.session_id !== 'FIA-2026-INIT' && !isForeignSavedSession) {
      const normalizedSaved = normalizeSessionWorkspace(saved);
      const normalizedMessages =
        (normalizedSaved.turns_count || 0) === 0 && (normalizedSaved.messages || []).length <= 1
          ? [createWelcomeMessage()]
          : normalizedSaved.messages;
      setSession({
        versions: [],
        generated_files: [],
        ...normalizedSaved,
        messages: normalizedMessages
      });
      setSessionSaved(Boolean(normalizedSaved.saved_to_account));
      const meta = extractWorkspaceMeta(normalizedSaved);
      if (meta.workspace_id) setActiveWorkspaceId(meta.workspace_id);
    } else {
      const initWsId =
        isPortalEmbedded && activeProjectId && activeProjectId !== 'all'
          ? `ws_proj_${activeProjectId}`
          : 'ws_general';
      const initWsName =
        isPortalEmbedded && activeProjectId && activeProjectId !== 'all'
          ? (targetProjectName || `Proyecto ${activeProjectId}`)
          : 'Mi Negocio / General';
      startFormaliaSession(
        isAuthenticated
          ? {
              workspaceId: initWsId,
              workspaceName: initWsName,
              projectId: isPortalEmbedded && activeProjectId && activeProjectId !== 'all' ? activeProjectId : null,
              canvasTitle: 'Lienzo principal',
              currentUser
            }
          : {}
      ).then((newSess) => {
        setSession(newSess);
        setSessionSaved(Boolean(newSess.saved_to_account));
      });
    }
  }, [initialSessionOverride]);

  // Escucha reclamo automático de sesión anónima tras iniciar sesión en el Portal
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onClaimed = (ev) => {
      const claimedSess = ev?.detail;
      if (!claimedSess?.session_id) return;
      const normalized = normalizeSessionWorkspace(claimedSess);
      setSession(normalized);
      setSessionSaved(true);
      if (normalized.workspace_id) setActiveWorkspaceId(normalized.workspace_id);
      setAccountSessions((prev) => [
        normalized,
        ...prev.filter((s) => s.session_id !== normalized.session_id)
      ]);
      onSessionListChanged?.();
    };
    window.addEventListener('pathrimonio-formalia-claimed', onClaimed);
    return () => window.removeEventListener('pathrimonio-formalia-claimed', onClaimed);
  }, []);

  // Al iniciar sesión (en Portal o en /formalia), carga todos sus espacios y lienzos en la nube/local
  useEffect(() => {
    if (!isAuthenticated) {
      setAccountSessions([]);
      setAccountDirectoryReady(false);
      return;
    }

    let cancelled = false;
    setCustomWorkspaces(loadLocalWorkspaces());
    fetchFormaliaArchive({
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      role: currentUser?.role
    }).then((list) => {
      if (cancelled) return;
      const cleanCurrentEmail = String(currentUser?.email || '').trim().toLowerCase();
      const ownedOrLocal = (list || []).filter(
        (s) =>
          s.is_mine ||
          (s.user_email && String(s.user_email).trim().toLowerCase() === cleanCurrentEmail) ||
          (!s.user_email && s.session_id === session.session_id)
      );
      setAccountSessions(ownedOrLocal.map(normalizeSessionWorkspace));
      setAccountDirectoryReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, currentUser?.id, currentUser?.email]);

  // Sincroniza cuota real de IA (5 anónima / 15 usuario / 45 socio / 120 colab / 999 admin)
  useEffect(() => {
    if (!clientHydrated) return;
    let cancelled = false;
    fetchFormaliaQuota({
      sessionId: session.session_id,
      userId: currentUser?.id || null,
      userEmail: currentUser?.email || null,
      userRole: currentUser?.role || null,
      fallbackTurns: session.turns_count || 0
    }).then((q) => {
      if (!cancelled && q) setQuota(q);
    });
    return () => {
      cancelled = true;
    };
  }, [clientHydrated, session.session_id, isAuthenticated, currentUser?.id, currentUser?.email, currentUser?.role]);

  useEffect(() => {
    if (!clientHydrated || session.session_id === 'FIA-2026-INIT') return;
    saveLocalFormaliaSession(session);
    if (isAuthenticated) {
      const normalized = normalizeSessionWorkspace(session);
      setAccountSessions((prev) => {
        const exists = prev.some((s) => s.session_id === normalized.session_id);
        if (!exists) return [normalized, ...prev];
        return prev.map((s) => (s.session_id === normalized.session_id ? normalized : s));
      });
    }
  }, [session, clientHydrated, isAuthenticated]);

  const workspaceDirectory = useMemo(() => {
    if (!isAuthenticated) return [];
    const byId = new Map();
    accountSessions.forEach((s) => {
      if (s && s.session_id && s.session_id !== 'FIA-2026-INIT') {
        byId.set(s.session_id, normalizeSessionWorkspace(s));
      }
    });
    if (session && session.session_id && session.session_id !== 'FIA-2026-INIT') {
      byId.set(session.session_id, normalizeSessionWorkspace(session));
    }
    return buildWorkspaceDirectory({
      sessions: Array.from(byId.values()),
      portalProjects,
      customWorkspaces
    });
  }, [isAuthenticated, accountSessions, session, portalProjects, customWorkspaces]);

  const activeWorkspace = useMemo(() => {
    if (workspaceDirectory.length === 0) return null;
    return (
      workspaceDirectory.find((w) => w.workspace_id === activeWorkspaceId) ||
      workspaceDirectory[0]
    );
  }, [workspaceDirectory, activeWorkspaceId]);

  const activeWorkspaceCanvases = activeWorkspace?.canvases || [];
  const totalAccountCanvases = useMemo(
    () => workspaceDirectory.reduce((acc, w) => acc + (w.canvases?.length || 0), 0),
    [workspaceDirectory]
  );

  // Sincroniza automáticamente al cambiar el Proyecto Activo desde la barra superior del Portal
  useEffect(() => {
    if (!isPortalEmbedded || !isAuthenticated || !accountDirectoryReady) return;
    if (prevPortalProjectRef.current === activeProjectId) return;
    prevPortalProjectRef.current = activeProjectId;
    if (!activeProjectId || activeProjectId === 'all') return;

    const targetWsId = `ws_proj_${activeProjectId}`;
    setActiveWorkspaceId(targetWsId);
    const matchingWs = workspaceDirectory.find((w) => w.workspace_id === targetWsId);
    if (matchingWs && matchingWs.canvases.length > 0) {
      const nextCanvas = matchingWs.canvases[0];
      saveLocalFormaliaSession(nextCanvas);
      setSession(nextCanvas);
      setSessionSaved(Boolean(nextCanvas.saved_to_account));
    }
  }, [isPortalEmbedded, isAuthenticated, accountDirectoryReady, activeProjectId, workspaceDirectory]);

  // Si ya está vinculado a cuenta (o usuario autenticado con turnos), mantener cambios sincronizados en la nube
  useEffect(() => {
    if (!clientHydrated || session.session_id === 'FIA-2026-INIT') return;
    const isLinked = Boolean(sessionSaved || session.saved_to_account);
    const autoBindAuth = Boolean(isAuthenticated && ((session.turns_count || 0) > 0 || (session.canvas_title && session.workspace_id)));
    if (!isLinked && !autoBindAuth) return;

    const timer = window.setTimeout(() => {
      const wsMeta = extractWorkspaceMeta(session);
      const payload = autoBindAuth && !isLinked
        ? {
            ...session,
            ...wsMeta,
            user_id: currentUser.id,
            user_email: currentUser.email,
            user_name: currentUser.name,
            saved_to_account: true
          }
        : { ...session, ...wsMeta };
      syncLinkedFormaliaSession(payload).catch(() => {});
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    clientHydrated,
    sessionSaved,
    isAuthenticated,
    currentUser,
    session.session_id,
    session.saved_to_account,
    session.workspace_id,
    session.canvas_title,
    session.turns_count,
    session.messages?.length,
    session.generated_files?.length,
    session.versions?.length
  ]);

  const handleSelectWorkspace = async (nextWsId) => {
    if (!nextWsId || nextWsId === activeWorkspace?.workspace_id) return;
    setErrorMsg('');
    setConfirmDeleteId(null);
    setRenamingSessionId(null);
    setActiveWorkspaceId(nextWsId);

    const targetWs = workspaceDirectory.find((w) => w.workspace_id === nextWsId);
    if (targetWs && targetWs.canvases.length > 0) {
      const nextCanvas = normalizeSessionWorkspace(targetWs.canvases[0]);
      saveLocalFormaliaSession(nextCanvas);
      setSession(nextCanvas);
      setSessionSaved(Boolean(nextCanvas.saved_to_account));
      setDiagramUpdatedBadge(false);
      return;
    }

    if (targetWs && isAuthenticated) {
      setWorkspaceBusy(true);
      try {
        const fresh = await startFormaliaSession({
          workspaceId: targetWs.workspace_id,
          workspaceName: targetWs.workspace_name,
          projectId: targetWs.project_id,
          canvasTitle: 'Lienzo principal',
          currentUser
        });
        setSession(fresh);
        setSessionSaved(true);
        setAccountSessions((prev) => [fresh, ...prev.filter((s) => s.session_id !== fresh.session_id)]);
        onSessionListChanged?.();
      } finally {
        setWorkspaceBusy(false);
      }
    }
  };

  const handleCreateWorkspace = async (e) => {
    if (e) e.preventDefault();
    const cleanName = newWorkspaceName.trim();
    if (!cleanName || !isAuthenticated) return;

    setWorkspaceBusy(true);
    setErrorMsg('');
    try {
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 28);
      const proposedId = `ws_${slug || 'neg'}_${Date.now().toString(36).slice(-4)}`;
      const fresh = await startFormaliaSession({
        workspaceId: proposedId,
        workspaceName: cleanName,
        projectId: null,
        canvasTitle: 'Lienzo principal',
        creatingNewWorkspace: true,
        currentUser
      });
      const createdWs = saveLocalWorkspace({
        workspace_id: proposedId,
        workspace_name: cleanName,
        category: 'negocio'
      });
      setCustomWorkspaces(loadLocalWorkspaces());
      setNewWorkspaceName('');
      setIsCreatingWorkspace(false);
      setActiveWorkspaceId(createdWs.workspace_id);
      setSession(fresh);
      setSessionSaved(true);
      setAccountSessions((prev) => [fresh, ...prev.filter((s) => s.session_id !== fresh.session_id)]);
      onSessionListChanged?.();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo crear el espacio de trabajo.');
    } finally {
      setWorkspaceBusy(false);
    }
  };

  const handleCreateCanvas = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated || !activeWorkspace) return;
    const title = newCanvasTitle.trim() || `Lienzo ${activeWorkspaceCanvases.length + 1}`;

    setWorkspaceBusy(true);
    setErrorMsg('');
    try {
      const fresh = await startFormaliaSession({
        workspaceId: activeWorkspace.workspace_id,
        workspaceName: activeWorkspace.workspace_name,
        projectId: activeWorkspace.project_id,
        canvasTitle: title,
        currentUser
      });
      setNewCanvasTitle('');
      setIsCreatingCanvas(false);
      setSession(fresh);
      setSessionSaved(true);
      setDiagramUpdatedBadge(false);
      setAccountSessions((prev) => [fresh, ...prev.filter((s) => s.session_id !== fresh.session_id)]);
      onSessionListChanged?.();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo abrir el nuevo lienzo.');
    } finally {
      setWorkspaceBusy(false);
    }
  };

  const handleSwitchCanvas = (canvasObj) => {
    if (!canvasObj || canvasObj.session_id === session.session_id) return;
    setErrorMsg('');
    setConfirmDeleteId(null);
    setRenamingSessionId(null);
    const normalized = normalizeSessionWorkspace(canvasObj);
    saveLocalFormaliaSession(normalized);
    setSession(normalized);
    setSessionSaved(Boolean(normalized.saved_to_account));
    setDiagramUpdatedBadge(false);
  };

  const handleStartRenameCanvas = (canvasObj, e) => {
    e?.stopPropagation();
    const currentLabel =
      canvasObj.canvas_title ||
      canvasObj.process_graph?.business_context?.process_name ||
      'Lienzo principal';
    setRenamingSessionId(canvasObj.session_id);
    setRenameDraft(currentLabel);
    setConfirmDeleteId(null);
  };

  const handleCommitRenameCanvas = async (e) => {
    if (e) e.preventDefault();
    const cleanTitle = renameDraft.trim();
    if (!renamingSessionId || !cleanTitle) {
      setRenamingSessionId(null);
      return;
    }

    const targetCanvas =
      renamingSessionId === session.session_id
        ? session
        : accountSessions.find((s) => s.session_id === renamingSessionId);

    setRenamingSessionId(null);
    if (!targetCanvas) return;

    const updated = await renameOrMoveFormaliaCanvas({
      session: targetCanvas,
      canvasTitle: cleanTitle,
      currentUser
    });
    if (updated) {
      if (updated.session_id === session.session_id) {
        setSession(updated);
      }
      setAccountSessions((prev) =>
        prev.map((s) => (s.session_id === updated.session_id ? updated : s))
      );
      onSessionListChanged?.();
    }
  };

  const handleDeleteCanvas = async (targetSessionId, e) => {
    e?.stopPropagation();
    if (!targetSessionId) return;
    setWorkspaceBusy(true);
    try {
      await deleteFormaliaCanvas(targetSessionId);
      const remaining = accountSessions.filter((s) => s.session_id !== targetSessionId);
      setAccountSessions(remaining);
      setConfirmDeleteId(null);

      if (targetSessionId === session.session_id) {
        const wsId = activeWorkspace?.workspace_id || 'ws_general';
        const sameWsSibling = remaining.find((s) => extractWorkspaceMeta(s).workspace_id === wsId);
        if (sameWsSibling) {
          const normalized = normalizeSessionWorkspace(sameWsSibling);
          saveLocalFormaliaSession(normalized);
          setSession(normalized);
          setSessionSaved(Boolean(normalized.saved_to_account));
        } else if (activeWorkspace) {
          const fresh = await startFormaliaSession({
            workspaceId: activeWorkspace.workspace_id,
            workspaceName: activeWorkspace.workspace_name,
            projectId: activeWorkspace.project_id,
            canvasTitle: 'Lienzo principal',
            currentUser
          });
          setSession(fresh);
          setSessionSaved(true);
          setAccountSessions((prev) => [fresh, ...prev.filter((s) => s.session_id !== fresh.session_id)]);
        }
      }
      onSessionListChanged?.();
    } finally {
      setWorkspaceBusy(false);
    }
  };

  const handleSendMessage = async (text) => {
    setErrorMsg('');
    const effectiveSessionId =
      session.session_id && session.session_id !== 'FIA-2026-INIT'
        ? session.session_id
        : generateFormaliaSessionId();
    const baseGraph = {
      ...(session.process_graph || createInitialProcessGraph(effectiveSessionId)),
      session_id: effectiveSessionId
    };
    const userMsg = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setSession((prev) => ({
      ...prev,
      session_id: effectiveSessionId,
      process_graph: baseGraph,
      messages: [...prev.messages, userMsg]
    }));

    setIsExtracting(true);
    try {
      const currentMeta = extractWorkspaceMeta({ ...session, session_id: effectiveSessionId, process_graph: baseGraph });
      const effectiveLink = (sessionSaved || session.saved_to_account || isAuthenticated)
        ? {
            user_id: session.user_id || currentUser?.id || null,
            user_email: session.user_email || currentUser?.email || null,
            user_name: session.user_name || currentUser?.name || null,
            user_role: currentUser?.role || null,
            saved_to_account: true,
            workspace_id: currentMeta.workspace_id,
            workspace_name: currentMeta.workspace_name,
            project_id: currentMeta.project_id,
            canvas_title: currentMeta.canvas_title
          }
        : null;

      const res = await sendFormaliaMessage({
        sessionId: effectiveSessionId,
        message: text,
        currentGraph: baseGraph,
        turnsCount: session.turns_count,
        conversationHistory: session.messages || [],
        existingVersions: session.versions || [],
        existingFiles: session.generated_files || [],
        accountLink: effectiveLink,
        maxTurnsAllowed: quota?.daily_limit || getAiDailyLimitForRole(currentUser?.role, isAuthenticated)
      });

      const assistantMsg = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: res.assistant_message,
        quick_replies: res.quick_replies,
        graph_patch: res.graph_patch,
        phase: res.phase,
        timestamp: new Date().toISOString()
      };

      const preservedGraph = {
        ...res.process_graph,
        session_id: res.session_id || effectiveSessionId,
        workspace_meta: res.process_graph?.workspace_meta || currentMeta
      };

      setSession((prev) => ({
        ...prev,
        ...currentMeta,
        session_id: res.session_id || effectiveSessionId,
        process_graph: preservedGraph,
        turns_count: res.turns_count,
        max_turns: res.max_turns || prev.max_turns,
        versions: res.versions || prev.versions || [],
        generated_files: res.generated_files || prev.generated_files || [],
        messages: [...prev.messages, assistantMsg],
        ...(isAuthenticated && currentUser && !prev.saved_to_account
          ? {
              user_id: currentUser.id,
              user_email: currentUser.email,
              user_name: currentUser.name,
              saved_to_account: true
            }
          : {})
      }));

      if (res.quota) {
        setQuota(res.quota);
      } else {
        setQuota((prev) =>
          prev
            ? {
                ...prev,
                used_turns: (prev.used_turns || 0) + 1,
                remaining_turns: Math.max(0, (prev.remaining_turns ?? prev.daily_limit ?? 5) - 1)
              }
            : prev
        );
      }

      setDiagramUpdatedBadge(true);
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar tu mensaje.');
      if (err.quota) {
        setQuota(err.quota);
      } else if (err.code === 'AI_QUOTA_EXCEEDED') {
        const fallbackLimit = getAiDailyLimitForRole(currentUser?.role, isAuthenticated);
        setQuota((prev) => (prev ? { ...prev, remaining_turns: 0, allowed: false } : { remaining_turns: 0, daily_limit: fallbackLimit, is_authenticated: isAuthenticated, allowed: false }));
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleManualPatch = (patches, summaryLabel) => {
    setErrorMsg('');
    const effectiveId =
      session.session_id && session.session_id !== 'FIA-2026-INIT'
        ? session.session_id
        : generateFormaliaSessionId();
    const baseSession = effectiveId === session.session_id
      ? session
      : {
          ...session,
          session_id: effectiveId,
          process_graph: { ...(session.process_graph || createInitialProcessGraph(effectiveId)), session_id: effectiveId }
        };
    const updated = applyManualGraphPatches(baseSession, patches, summaryLabel);
    setSession(updated);
    setDiagramUpdatedBadge(true);
    persistFormaliaSessionDraft(updated).catch(() => {});
  };

  const handleResetSession = async () => {
    clearLocalFormaliaSession();
    setErrorMsg('');
    setDiagramUpdatedBadge(false);
    const keepWs = isAuthenticated && activeWorkspace;
    setSessionSaved(Boolean(keepWs));
    setSession({
      session_id: 'FIA-2026-INIT',
      process_graph: createInitialProcessGraph('FIA-2026-INIT'),
      messages: [createWelcomeMessage()],
      versions: [],
      generated_files: [],
      turns_count: 0,
      max_turns: getAiDailyLimitForRole(currentUser?.role, isAuthenticated)
    });
    const fresh = await startFormaliaSession(
      keepWs
        ? {
            workspaceId: activeWorkspace.workspace_id,
            workspaceName: activeWorkspace.workspace_name,
            projectId: activeWorkspace.project_id,
            canvasTitle: session.canvas_title || 'Lienzo principal',
            currentUser
          }
        : {}
    );
    setSession(fresh);
  };

  const handleLoadExample = () => {
    const targetSessionId =
      session.session_id && session.session_id !== 'FIA-2026-INIT'
        ? session.session_id
        : generateFormaliaSessionId();
    const existingMeta = extractWorkspaceMeta({ ...session, session_id: targetSessionId });
    const exampleGraph = {
      ...structuredClone(SDD_EXAMPLE_LOGISTICS_GRAPH),
      session_id: targetSessionId,
      ...(isAuthenticated && (existingMeta.workspace_id || existingMeta.project_id)
        ? { workspace_meta: existingMeta }
        : {})
    };
    const exampleMessages = [
      createWelcomeMessage(),
      {
        id: 'msg_demo_u1',
        role: 'user',
        content:
          'Somos Transportes del Norte SAC. El cliente pide cotización por WhatsApp, Recepción/Ventas anota la orden en Excel y pasa a Caja. Caja valida RUC/DNI y emite comprobante; luego Almacén verifica en cuaderno y Despacho entrega con foto.',
        timestamp: new Date().toISOString()
      },
      {
        id: 'msg_demo_a1',
        role: 'assistant',
        content:
          'Detectamos 4 roles internos ($4/día como Socio), 5 pasos y 2 cuellos de botella manuales (Excel y cuaderno). ¿Deseas ver tu cotización estimada?',
        quick_replies: [
          'Agregar aprobación de Gerencia antes del despacho',
          'Cotizar este sistema ahora en Pathrimonio'
        ],
        graph_patch: [
          { op: 'add_role', actor: exampleGraph.actors[0] },
          { op: 'add_role', actor: exampleGraph.actors[1] },
          { op: 'add_role', actor: exampleGraph.actors[2] },
          { op: 'add_role', actor: exampleGraph.actors[3] },
          { op: 'add_role', actor: exampleGraph.actors[4] },
          ...exampleGraph.steps.map((s) => ({ op: 'add_step', step: s }))
        ],
        phase: '5_synthesis',
        timestamp: new Date().toISOString()
      }
    ];

    const { snapshot, pumlArtifact } = buildVersionSnapshot(
      exampleGraph,
      [],
      'Ejemplo SDD cargado: Transportes del Norte SAC (5 roles, 5 pasos)',
      0
    );

    const nextExampleSession = normalizeSessionWorkspace({
      ...session,
      session_id: targetSessionId,
      process_graph: exampleGraph,
      messages: exampleMessages,
      versions: [snapshot],
      generated_files: [pumlArtifact],
      turns_count: 0,
      max_turns: getAiDailyLimitForRole(currentUser?.role, isAuthenticated)
    });
    setSessionSaved(Boolean(isAuthenticated && nextExampleSession.saved_to_account));
    setSession(nextExampleSession);
    persistFormaliaSessionDraft(nextExampleSession).catch(() => {});
    setDiagramUpdatedBadge(true);
    setErrorMsg('');
  };

  const handleRecordArtifact = (artifact) => {
    setSession((prev) => ({
      ...prev,
      generated_files: [
        ...(prev.generated_files || []).filter((f) => f.id !== artifact.id),
        artifact
      ]
    }));
    registerGeneratedArtifact(artifact).catch(() => {});
  };

  const handleRestoreVersion = (versionObj) => {
    if (!versionObj?.process_graph) return;
    const restoredGraph = structuredClone(versionObj.process_graph);
    const restoreNote = {
      id: `msg_${Date.now()}_restore`,
      role: 'assistant',
      content: `Versión ${versionObj.version_label} restaurada en el lienzo (${restoredGraph.actors?.length || 0} roles, ${restoredGraph.steps?.length || 0} pasos).`,
      quick_replies: ['Continuar editando desde aquí', 'Cotizar este sistema en Pathrimonio'],
      phase: restoredGraph.phase || '5_synthesis',
      timestamp: new Date().toISOString()
    };

    setSession((prev) => ({
      ...prev,
      process_graph: restoredGraph,
      messages: [...prev.messages, restoreNote]
    }));
    setDiagramUpdatedBadge(true);
  };

  const handleApplyToQuote = async (graph, preloadedOverride = null) => {
    setIsExpanded(false);
    if (preloadedOverride && preloadedOverride.configuration) {
      onPreloadQuote?.(preloadedOverride);
      const el = document.getElementById('cotizador');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const targetGraph = graph || session.process_graph;
    const preloadedConfig = await convertFormaliaToQuote({
      sessionId: session.session_id,
      graph: targetGraph
    });

    onPreloadQuote?.({
      ...preloadedConfig,
      process_graph: targetGraph,
      preloadedAt: Date.now()
    });

    const el = document.getElementById('cotizador');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const stepsCount = session.process_graph?.steps?.length || 0;
  const currentVersionLabel =
    session.versions?.length > 0
      ? session.versions[session.versions.length - 1].version_label
      : 'v0';
  const hasUserMessages =
    (session.turns_count || 0) > 0 ||
    (session.messages || []).some((m) => m.role === 'user') ||
    (session.process_graph?.steps?.length || 0) > 0 ||
    (session.process_graph?.actors?.length || 0) > 0;
  const isSavedToAccount = Boolean(isAuthenticated && (sessionSaved || session.saved_to_account));
  const savedAccountEmail = isAuthenticated ? (session.user_email || currentUser?.email || '') : '';

  return (
    <>
    <section
      id="formalia"
      data-theme={isPortalEmbedded ? 'dark' : undefined}
      className={`w-full ${
        isPortalEmbedded
          ? 'py-0 bg-transparent border-0'
          : `${isStandalonePage ? 'py-10 lg:py-14' : 'py-20 lg:py-24'} bg-[var(--bg-page)] border-b border-[var(--border-subtle)]`
      } transition-colors`}
    >
      <div className={isPortalEmbedded ? 'w-full' : 'site-container'}>

        {/* Encabezado de Sección (solo en vista pública / standalone) */}
        {!isPortalEmbedded && (
        <div className="max-w-3xl mx-auto text-center mb-10">
          {isStandalonePage && onBackHome && (
            <div className="mb-4">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onBackHome();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span>← Volver al inicio de Pathrimonio</span>
              </a>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-medium mb-4">
            <Sparkles size={13} className="text-[var(--accent-text)]" />
            <span>Módulo Conversacional FORMALIA · Gratis y sin registro</span>
          </div>
          {isStandalonePage ? (
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-3">
              Mapea tu negocio en carriles vivos antes de cotizar
            </h1>
          ) : (
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-3">
              Mapea tu negocio en carriles vivos antes de cotizar
            </h2>
          )}
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Cuéntale a FORMALIA cómo trabaja tu equipo hoy. Al instante obtienes tu diagrama de roles, cuellos de botella en PNG/PDF, historial versionado y tu sistema precargado a{' '}
            <strong className="text-[var(--text-primary)]">$1 USD/día por rol</strong>.
          </p>
        </div>
        )}

        {/* Contenedor Split-Screen (O Fullscreen expandible) */}
        <div
          className={
            isExpanded
              ? 'fixed inset-0 z-[70] bg-[var(--bg-page)] p-2 sm:p-4 flex flex-col'
              : 'relative rounded-[16px] border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-lg overflow-hidden flex flex-col'
          }
        >
          {/* Barra superior del Studio Split-Screen */}
          <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-deep)] text-[#D9DADC] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-[#FFC93C]" />
              <span className="font-mono text-xs font-semibold text-[#D9DADC]">
                FORMALIA Studio
              </span>
              <span className="hidden sm:inline font-mono text-[11px] text-[#9699A1]">
                · Sesión {session.session_id}
              </span>
              {session.versions?.length > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-[#2B2D31] border border-[#FFC93C]/40 font-mono text-[10px] font-semibold text-[#FFC93C]">
                  {currentVersionLabel} · {session.generated_files?.length || 0} archivos
                </span>
              )}
              {isSavedToAccount && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 font-mono text-[10px] font-semibold text-emerald-400">
                  Guardado{savedAccountEmail ? ` · ${savedAccountEmail}` : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowBlueprintModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-[#D9DADC]/25 bg-[#2B2D31] text-[11px] font-medium text-[#D9DADC] hover:border-[#FFC93C] hover:text-[#FFC93C] cursor-pointer transition-colors"
                title="Transforma tus diagramas en historias por rol, tema visual y maquetas UI"
              >
                <AppWindow size={12} className="text-[#FFC93C]" />
                <span>Implementar en solución web</span>
              </button>

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => (!isPortalEmbedded ? setShowSaveModal(true) : onOpenInPortal?.(session.process_graph))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-[#FFC93C]/40 bg-[#FFC93C]/10 text-[11px] font-medium text-[#FFC93C] hover:bg-[#FFC93C]/20 cursor-pointer transition-colors"
                  title="Inicia sesión para conservar tu diagrama, acceder a + lienzos por espacio y obtener 15 turnos diarios de IA"
                >
                  <Lock size={12} />
                  <span className="hidden sm:inline">Inicia sesión para + lienzos por espacio</span>
                  <span className="sm:hidden">+ Lienzos</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-[#D9DADC]/20 bg-[#2B2D31] text-[11px] font-medium text-[#D9DADC] hover:border-[#FFC93C]/60 cursor-pointer"
                title={isExpanded ? 'Contraer espacio de trabajo' : 'Expandir a pantalla completa'}
              >
                {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isExpanded ? 'Contraer' : 'Pantalla completa'}</span>
              </button>
            </div>
          </div>

          {/* Barra de Espacios de Trabajo (Proyecto / Negocio) y Múltiples Lienzos (solo usuario logueado) */}
          {isAuthenticated && activeWorkspace && (
            <div className="px-3 sm:px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[#1F2125] text-[#D9DADC] flex flex-col gap-2">
              {/* Fila 1: Selector de Espacio de Trabajo + Nuevo Espacio */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#FFC93C] shrink-0">
                    <FolderKanban size={14} />
                    <span>Espacio (Proyecto/Negocio):</span>
                  </span>

                  <select
                    aria-label="Seleccionar espacio de trabajo Formalia"
                    value={activeWorkspace.workspace_id}
                    onChange={(e) => handleSelectWorkspace(e.target.value)}
                    disabled={workspaceBusy}
                    className="bg-[#2B2D31] border border-[#D9DADC]/20 rounded-[8px] px-2.5 py-1 text-xs font-medium text-[#FFFFFF] focus:outline-none focus:border-[#FFC93C] cursor-pointer max-w-[260px]"
                  >
                    {workspaceDirectory.map((ws) => (
                      <option key={ws.workspace_id} value={ws.workspace_id}>
                        {ws.source === 'project' ? 'Proyecto · ' : ws.source === 'custom' ? 'Negocio · ' : ''}
                        {ws.workspace_name} ({ws.canvases.length})
                      </option>
                    ))}
                  </select>

                  {!isCreatingWorkspace ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingWorkspace(true);
                        setIsCreatingCanvas(false);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] border border-[#D9DADC]/25 bg-[#2B2D31] hover:border-[#FFC93C] text-[11px] font-medium text-[#D9DADC] hover:text-[#FFC93C] transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Nuevo Espacio</span>
                    </button>
                  ) : (
                    <form onSubmit={handleCreateWorkspace} className="inline-flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="Ej: Ferretería Norte SAC..."
                        className="bg-[#141518] border border-[#FFC93C]/60 rounded-[8px] px-2.5 py-1 text-xs text-white placeholder:text-[#9699A1] focus:outline-none w-44 sm:w-52"
                      />
                      <button
                        type="submit"
                        disabled={!newWorkspaceName.trim() || workspaceBusy}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#FFC93C] text-[#09090B] text-[11px] font-bold hover:bg-[#eab22c] disabled:opacity-50 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Crear</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingWorkspace(false);
                          setNewWorkspaceName('');
                        }}
                        className="p-1 rounded-[6px] text-[#9699A1] hover:text-white cursor-pointer"
                        title="Cancelar"
                      >
                        <X size={13} />
                      </button>
                    </form>
                  )}
                </div>

                <span className="hidden lg:inline font-mono text-[10px] text-[#9699A1]">
                  {workspaceDirectory.length} espacios · {totalAccountCanvases} lienzos guardados
                </span>
              </div>

              {/* Fila 2: Pestañas de Lienzos del Espacio Activo + Nuevo Lienzo */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#9699A1] shrink-0 mr-1">
                  <Layers size={13} />
                  <span>Lienzos:</span>
                </span>

                {activeWorkspaceCanvases.map((canvasItem) => {
                  const isCurrentCanvas = canvasItem.session_id === session.session_id;
                  const canvasLabel =
                    canvasItem.canvas_title ||
                    canvasItem.process_graph?.business_context?.process_name ||
                    canvasItem.process_name ||
                    'Lienzo principal';
                  const canvasSteps = canvasItem.process_graph?.steps?.length || 0;
                  const canvasPct = canvasItem.process_graph?.completeness_score ?? canvasItem.completeness_score ?? 0;

                  if (renamingSessionId === canvasItem.session_id) {
                    return (
                      <form
                        key={canvasItem.session_id}
                        onSubmit={handleCommitRenameCanvas}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] border border-[#FFC93C] bg-[#141518] shrink-0"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          className="bg-transparent text-xs text-white focus:outline-none w-32 px-1"
                        />
                        <button
                          type="submit"
                          className="p-0.5 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                          title="Guardar nombre"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingSessionId(null)}
                          className="p-0.5 text-[#9699A1] hover:text-white cursor-pointer"
                          title="Cancelar"
                        >
                          <X size={12} />
                        </button>
                      </form>
                    );
                  }

                  return (
                    <div
                      key={canvasItem.session_id}
                      onClick={() => handleSwitchCanvas(canvasItem)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleSwitchCanvas(canvasItem);
                      }}
                      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border text-xs transition-all shrink-0 cursor-pointer ${
                        isCurrentCanvas
                          ? 'bg-[#2B2D31] border-[#FFC93C] text-[#FFFFFF] shadow-xs'
                          : 'bg-[#17191C] border-[#D9DADC]/15 text-[#9699A1] hover:border-[#D9DADC]/40 hover:text-[#D9DADC]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrentCanvas ? 'bg-[#FFC93C]' : 'bg-[#6F737D]'}`} />
                      <span className="font-medium max-w-[150px] truncate">{canvasLabel}</span>
                      <span className="font-mono text-[10px] opacity-75">
                        {canvasPct}% · {canvasSteps}p
                      </span>

                      {isCurrentCanvas && (
                        <div className="inline-flex items-center gap-0.5 ml-1 pl-1 border-l border-[#D9DADC]/20">
                          <button
                            type="button"
                            onClick={(e) => handleStartRenameCanvas(canvasItem, e)}
                            className="p-0.5 rounded text-[#9699A1] hover:text-[#FFC93C] cursor-pointer"
                            title="Renombrar lienzo"
                          >
                            <Pencil size={11} />
                          </button>
                          {confirmDeleteId === canvasItem.session_id ? (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCanvas(canvasItem.session_id, e)}
                              className="px-1 py-0.2 rounded bg-red-500/20 text-red-300 text-[10px] font-bold hover:bg-red-500/30 cursor-pointer"
                              title="Confirmar eliminación"
                            >
                              Borrar?
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(canvasItem.session_id);
                              }}
                              className="p-0.5 rounded text-[#9699A1] hover:text-red-400 cursor-pointer"
                              title="Eliminar lienzo"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!isCreatingCanvas ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCanvas(true);
                      setIsCreatingWorkspace(false);
                    }}
                    disabled={workspaceBusy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#FFC93C] text-[#09090B] text-[11px] font-bold hover:bg-[#eab22c] transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Nuevo Lienzo</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateCanvas} className="inline-flex items-center gap-1.5 shrink-0">
                    <input
                      type="text"
                      autoFocus
                      value={newCanvasTitle}
                      onChange={(e) => setNewCanvasTitle(e.target.value)}
                      placeholder={`Lienzo ${activeWorkspaceCanvases.length + 1} (ej: Almacén)`}
                      className="bg-[#141518] border border-[#FFC93C]/60 rounded-[8px] px-2.5 py-1 text-xs text-white placeholder:text-[#9699A1] focus:outline-none w-44"
                    />
                    <button
                      type="submit"
                      disabled={workspaceBusy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#FFC93C] text-[#09090B] text-[11px] font-bold hover:bg-[#eab22c] cursor-pointer"
                    >
                      <Check size={12} />
                      <span>Abrir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCanvas(false);
                        setNewCanvasTitle('');
                      }}
                      className="p-1 rounded-[6px] text-[#9699A1] hover:text-white cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Pestañas Móviles (< 768px — SDD Criterio 5) */}
          <div className="grid grid-cols-2 md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <button
              type="button"
              onClick={() => setMobileTab('chat')}
              className={`py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                mobileTab === 'chat'
                  ? 'border-[#FFC93C] text-[var(--text-primary)] bg-[var(--accent-soft)]'
                  : 'border-transparent text-[var(--text-secondary)]'
              }`}
            >
              <MessageSquare size={14} />
              <span>Chat FORMALIA</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileTab('diagram');
                setDiagramUpdatedBadge(false);
              }}
              className={`relative py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                mobileTab === 'diagram'
                  ? 'border-[#FFC93C] text-[var(--text-primary)] bg-[var(--accent-soft)]'
                  : 'border-transparent text-[var(--text-secondary)]'
              }`}
            >
              <GitBranch size={14} />
              <span>{`Ver mi Diagrama (${stepsCount} pasos)`}</span>
              {diagramUpdatedBadge && mobileTab !== 'diagram' && (
                <span className="w-2 h-2 rounded-full bg-[#FFC93C] animate-ping" />
              )}
            </button>
          </div>

          {/* Split-Screen 40% Izquierda / 60% Derecha en Desktop */}
          <div className={`flex flex-col md:flex-row ${isExpanded ? 'flex-1 min-h-0' : 'md:h-[680px]'}`}>
            
            {/* Panel Izquierdo (40%) */}
            <div
              className={`w-full md:w-[40%] h-full ${
                mobileTab === 'chat' ? 'block' : 'hidden md:block'
              }`}
            >
              <FormalIAChatPanel
                messages={session.messages}
                completenessScore={session.process_graph?.completeness_score || 0}
                currentPhase={session.process_graph?.phase || '1_context'}
                turnsCount={session.turns_count || 0}
                maxTurns={quota?.daily_limit || getAiDailyLimitForRole(currentUser?.role, isAuthenticated) || session.max_turns}
                quota={quota}
                isExtracting={isExtracting}
                errorMessage={errorMsg}
                hasUnsavedContent={hasUserMessages && !isSavedToAccount}
                isSavedToAccount={isSavedToAccount}
                savedAccountEmail={savedAccountEmail}
                onSendMessage={handleSendMessage}
                onResetSession={handleResetSession}
                onLoadExample={handleLoadExample}
                onSaveSession={!isPortalEmbedded ? () => setShowSaveModal(true) : undefined}
                onOpenPortal={onOpenInPortal ? () => onOpenInPortal(session.process_graph) : undefined}
              />
            </div>

            {/* Panel Derecho (60%) */}
            <div
              className={`w-full md:w-[60%] h-full ${
                mobileTab === 'diagram' ? 'block' : 'hidden md:block'
              }`}
            >
              <FormalIACanvasPanel
                graph={session.process_graph}
                messages={session.messages}
                versions={session.versions || []}
                generatedFiles={session.generated_files || []}
                isExtracting={isExtracting}
                isPortalEmbedded={isPortalEmbedded}
                targetProjectName={targetProjectName}
                onPromoteToProject={onPromoteToProject}
                onOpenInPortal={onOpenInPortal}
                onApplyToQuote={handleApplyToQuote}
                onRecordArtifact={handleRecordArtifact}
                onRestoreVersion={handleRestoreVersion}
                onManualPatch={handleManualPatch}
              />
            </div>

          </div>
        </div>

      </div>
    </section>

    {/* Modal Guardar / Claim Sesión FORMALIA */}
    {showSaveModal && (
      <FormalIASaveModal
        session={session}
        currentUser={currentUser}
        portalProjects={portalProjects}
        activeProjectId={activeProjectId}
        onClose={() => setShowSaveModal(false)}
        onSaved={({ session: savedSess, quota: updatedQuota }) => {
          if (savedSess) {
            const normalizedSaved = normalizeSessionWorkspace(savedSess);
            setSession(normalizedSaved);
            if (normalizedSaved.workspace_id) {
              setActiveWorkspaceId(normalizedSaved.workspace_id);
            }
            setAccountSessions((prev) => [
              normalizedSaved,
              ...prev.filter((s) => s.session_id !== normalizedSaved.session_id)
            ]);
          }
          if (updatedQuota) {
            setQuota(updatedQuota);
          }
          setSessionSaved(true);
          onSessionListChanged?.();
        }}
        onGoToPortal={({ needsEmailConfirm } = {}) => {
          setShowSaveModal(false);
          if (onOpenInPortal) {
            onOpenInPortal(session.process_graph, { needsEmailConfirm });
          } else {
            window.location.href = needsEmailConfirm
              ? '/#portal?tab=formalia&mode=login'
              : '/#portal?tab=formalia';
          }
        }}
      />
    )}

    {/* Flujo "Implementar en Solución Web" (3 Pasos) */}
    <WebBlueprintModal
      isOpen={showBlueprintModal}
      onClose={() => setShowBlueprintModal(false)}
      workspace={activeWorkspace || { workspace_id: session.workspace_id || 'ws_general', workspace_name: session.workspace_name || 'Mi Negocio / General' }}
      canvases={activeWorkspaceCanvases.length > 0 ? activeWorkspaceCanvases : [session]}
      activeSession={session}
      currentUser={currentUser}
      quota={quota}
      onQuotaUpdated={setQuota}
      onPreloadQuote={(data) => handleApplyToQuote(null, data)}
      onSubmitImplementation={async (payload) => {
        if (onSubmitImplementation) {
          return onSubmitImplementation(payload);
        }
        if (onPromoteToProject) {
          return onPromoteToProject(payload.combinedGraph || session.process_graph, payload);
        }
        if (onOpenInPortal) {
          onOpenInPortal(payload.combinedGraph || session.process_graph, payload);
        } else {
          window.location.href = '/#portal?tab=implementationStatus';
        }
      }}
      onOpenSaveLogin={() => {
        setShowBlueprintModal(false);
        setShowSaveModal(true);
      }}
    />
    </>
  );
}
