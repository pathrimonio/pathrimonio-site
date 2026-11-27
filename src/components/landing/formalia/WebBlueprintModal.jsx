import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  AppWindow,
  ListChecks,
  Palette,
  Layout,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Check,
  AlertTriangle,
  Loader2,
  Cpu
} from 'lucide-react';
import {
  THEME_PRESETS,
  createDefaultWebBlueprint
} from '../../../lib/formalia/blueprintSchema';
import { mergeCanvasGraphs } from '../../../lib/formalia/blueprintGenerator';
import {
  fetchWorkspaceBlueprint,
  saveManualBlueprint,
  generateWorkspaceBlueprintStories,
  generateWorkspaceBlueprintLayout
} from '../../../services/formaliaService';
import { mapProcessToQuoteConfig } from '../../../lib/formalia/compilers';
import BlueprintScreenRenderer from './BlueprintScreenRenderer';

const ACCENT_SWATCHES = ['#FFC93C', '#FFC000', '#2563EB', '#10B981', '#F43F5E', '#8B5CF6'];

export default function WebBlueprintModal({
  isOpen,
  onClose,
  workspace,
  canvases = [],
  activeSession,
  currentUser = null,
  quota = null,
  onQuotaUpdated,
  onPreloadQuote,
  onOpenSaveLogin
}) {
  const workspaceId = workspace?.workspace_id || activeSession?.workspace_id || 'ws_general';
  const workspaceName = workspace?.workspace_name || activeSession?.workspace_name || 'Mi Negocio / General';

  const availableCanvases = useMemo(() => {
    const map = new Map();
    (canvases || []).forEach((c) => c?.session_id && map.set(c.session_id, c));
    if (activeSession?.session_id) map.set(activeSession.session_id, activeSession);
    return Array.from(map.values());
  }, [canvases, activeSession]);

  const [step, setStep] = useState(1); // 1: Historias | 2: Theme Studio | 3: UI Blueprint
  const [loading, setLoading] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  const [blueprint, setBlueprint] = useState(() =>
    createDefaultWebBlueprint(workspaceId, availableCanvases.map((c) => c.session_id))
  );
  const [selectedCanvasIds, setSelectedCanvasIds] = useState([]);
  const [activeRoleTab, setActiveRoleTab] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');

  // Estados de edición manual de Historias (Paso 1)
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [storyDraft, setStoryDraft] = useState({
    role: '',
    title: '',
    description: '',
    acceptance_criteria: '',
    suggested_fields: '',
    priority: 'Alta'
  });

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setErrorMsg('');
    fetchWorkspaceBlueprint(workspaceId)
      .then((bp) => {
        if (cancelled) return;
        const defaultIds =
          bp.source_canvas_ids?.length > 0
            ? bp.source_canvas_ids
            : availableCanvases.map((c) => c.session_id).slice(0, 1);
        setBlueprint(bp);
        setSelectedCanvasIds(defaultIds);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, workspaceId]);

  const selectedCanvases = useMemo(() => {
    const picked = availableCanvases.filter((c) => selectedCanvasIds.includes(c.session_id));
    return picked.length > 0 ? picked : availableCanvases;
  }, [availableCanvases, selectedCanvasIds]);

  const combinedGraph = useMemo(
    () => mergeCanvasGraphs(selectedCanvases, workspaceName),
    [selectedCanvases, workspaceName]
  );

  const detectedRoles = useMemo(() => {
    const roles = new Set([
      ...(blueprint.user_stories || []).map((s) => s.role),
      ...(combinedGraph.actors || []).map((a) => a.name),
      ...(blueprint.ui_screens || []).map((s) => s.role)
    ].filter(Boolean));
    const arr = Array.from(roles);
    return arr.length > 0 ? arr : ['Operador Principal'];
  }, [blueprint.user_stories, blueprint.ui_screens, combinedGraph.actors]);

  useEffect(() => {
    if (!activeRoleTab || !detectedRoles.includes(activeRoleTab)) {
      setActiveRoleTab(detectedRoles[0] || '');
    }
  }, [detectedRoles, activeRoleTab]);

  if (!isOpen) return null;

  const remainingTurns = typeof quota?.remaining_turns === 'number' ? quota.remaining_turns : (currentUser ? 15 : 5);
  const dailyLimit = quota?.daily_limit || (currentUser ? 15 : 5);
  const isQuotaExhausted = remainingTurns <= 0;

  const persistManualPatch = async (patch, noticeText = '') => {
    setBlueprint((prev) => ({
      ...prev,
      ...patch,
      updated_at: new Date().toISOString()
    }));
    const saved = await saveManualBlueprint(workspaceId, patch);
    setBlueprint(saved);
    if (noticeText) {
      setStatusNotice(noticeText);
      setTimeout(() => setStatusNotice(''), 2500);
    }
  };

  const handleToggleCanvasSource = (sessionId) => {
    const exists = selectedCanvasIds.includes(sessionId);
    const next = exists
      ? selectedCanvasIds.filter((id) => id !== sessionId)
      : [...selectedCanvasIds, sessionId];
    if (next.length === 0) return;
    setSelectedCanvasIds(next);
    persistManualPatch({ source_canvas_ids: next });
  };

  // ── Paso 1: Generación de Historias (con IA o Base Manual 0 turnos) ──
  const handleGenerateStories = async (useAi = true) => {
    setErrorMsg('');
    if (useAi && isQuotaExhausted) {
      setErrorMsg('No te quedan turnos de IA hoy. Puedes generar la base determinista o agregar historias manualmente sin costo.');
      return;
    }
    setAiBusy(true);
    try {
      const res = await generateWorkspaceBlueprintStories({
        workspaceId,
        workspaceName,
        canvases: selectedCanvases,
        userId: currentUser?.id || null,
        userEmail: currentUser?.email || null,
        useAi
      });
      setBlueprint(res.blueprint);
      if (res.quota) onQuotaUpdated?.(res.quota);
      setStatusNotice(
        useAi
          ? `Se generaron ${res.user_stories?.length || 0} historias de usuario con IA (1 turno consumido).`
          : `Base determinista generada (${res.user_stories?.length || 0} historias · 0 turnos IA).`
      );
    } catch (err) {
      setErrorMsg(err.message || 'No se pudieron generar historias.');
      if (err.quota) onQuotaUpdated?.(err.quota);
    } finally {
      setAiBusy(false);
    }
  };

  const handleSaveStoryDraft = async (e) => {
    e.preventDefault();
    const role = storyDraft.role.trim() || detectedRoles[0] || 'Operador';
    const title = storyDraft.title.trim();
    if (!title) return;

    const criteriaArr = storyDraft.acceptance_criteria
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const fieldsArr = storyDraft.suggested_fields
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const stories = [...(blueprint.user_stories || [])];
    if (editingStoryId) {
      const next = stories.map((st) =>
        st.id === editingStoryId
          ? {
              ...st,
              role,
              title,
              description: storyDraft.description.trim() || st.description,
              acceptance_criteria: criteriaArr.length > 0 ? criteriaArr : st.acceptance_criteria,
              suggested_fields: fieldsArr.length > 0 ? fieldsArr : st.suggested_fields,
              priority: storyDraft.priority
            }
          : st
      );
      await persistManualPatch({ user_stories: next }, 'Historia actualizada manualmente (0 turnos IA)');
    } else {
      const newStory = {
        id: `US-${String(stories.length + 1).padStart(2, '0')}`,
        role,
        title,
        description:
          storyDraft.description.trim() ||
          `Como ${role}, quiero ${title.toLowerCase()} para operar sin reprocesos manuales.`,
        acceptance_criteria:
          criteriaArr.length > 0
            ? criteriaArr
            : [`Acceso habilitado para ${role}`, 'Registro auditable guardado'],
        suggested_fields: fieldsArr.length > 0 ? fieldsArr : ['Código', 'Detalle', 'Estado'],
        priority: storyDraft.priority,
        linked_step_id: null,
        linked_canvas_id: selectedCanvasIds[0] || null
      };
      await persistManualPatch({ user_stories: [...stories, newStory] }, 'Historia agregada manualmente (0 turnos IA)');
    }

    setEditingStoryId(null);
    setIsAddingStory(false);
    setStoryDraft({
      role: '',
      title: '',
      description: '',
      acceptance_criteria: '',
      suggested_fields: '',
      priority: 'Alta'
    });
  };

  const handleMoveStory = async (idx, dir) => {
    const target = idx + dir;
    const arr = [...(blueprint.user_stories || [])];
    if (target < 0 || target >= arr.length) return;
    const [moved] = arr.splice(idx, 1);
    arr.splice(target, 0, moved);
    await persistManualPatch({ user_stories: arr });
  };

  const handleDeleteStory = async (id) => {
    const next = (blueprint.user_stories || []).filter((s) => s.id !== id);
    await persistManualPatch({ user_stories: next }, 'Historia eliminada (0 turnos IA)');
  };

  // ── Paso 3: Maquetación UI por Rol ──
  const handleGenerateLayout = async ({ useAi = true, onlyActiveRole = false } = {}) => {
    setErrorMsg('');
    if (useAi && isQuotaExhausted) {
      setErrorMsg('Sin turnos de IA disponibles. Puedes generar la maqueta base (0 turnos) o editar bloques manualmente.');
      return;
    }
    setAiBusy(true);
    try {
      const res = await generateWorkspaceBlueprintLayout({
        workspaceId,
        workspaceName,
        stories: blueprint.user_stories || [],
        canvases: selectedCanvases,
        themeConfig: blueprint.theme_config,
        targetRole: onlyActiveRole ? activeRoleTab : null,
        refinementPrompt: onlyActiveRole ? refinementPrompt : '',
        existingScreens: blueprint.ui_screens || [],
        userId: currentUser?.id || null,
        userEmail: currentUser?.email || null,
        useAi
      });
      setBlueprint(res.blueprint);
      if (onlyActiveRole) setRefinementPrompt('');
      if (res.quota) onQuotaUpdated?.(res.quota);
      setStatusNotice(
        useAi
          ? 'Pantallas UI actualizadas con IA (1 turno consumido).'
          : 'Maqueta declarativa base creada (0 turnos IA).'
      );
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo maquetar la vista.');
      if (err.quota) onQuotaUpdated?.(err.quota);
    } finally {
      setAiBusy(false);
    }
  };

  const activeScreen =
    (blueprint.ui_screens || []).find((s) => s.role === activeRoleTab) ||
    (blueprint.ui_screens || [])[0] ||
    null;

  const handleUpdateActiveScreen = async (updatedScreen) => {
    const screens = blueprint.ui_screens || [];
    const exists = screens.some((s) => s.screen_id === updatedScreen.screen_id);
    const nextScreens = exists
      ? screens.map((s) => (s.screen_id === updatedScreen.screen_id ? updatedScreen : s))
      : [...screens, updatedScreen];
    await persistManualPatch({ ui_screens: nextScreens });
  };

  const handleAddManualBlock = async (blockType) => {
    const baseScreen = activeScreen || {
      screen_id: `scr_${Date.now().toString(36).slice(-4)}`,
      role: activeRoleTab || 'Operador',
      title: `Módulo de ${activeRoleTab || 'Operador'}`,
      subtitle: 'Vista editada manualmente',
      components: []
    };
    const templateMap = {
      kpi_row: {
        id: `blk_${Date.now()}_kpi`,
        type: 'kpi_row',
        items: [
          { label: 'Operaciones Hoy', sample_value: '18', delta: '+10%' },
          { label: 'Pendientes', sample_value: '4', delta: 'Activo' },
          { label: 'Eficiencia', sample_value: '96%', delta: 'Meta' }
        ]
      },
      action_form: {
        id: `blk_${Date.now()}_form`,
        type: 'action_form',
        title: `Registro rápido — ${baseScreen.role}`,
        fields: ['Referencia / Cliente', 'Detalle', 'Estado'],
        primary_action: 'Guardar registro'
      },
      data_table: {
        id: `blk_${Date.now()}_tbl`,
        type: 'data_table',
        title: `Listado operativo — ${baseScreen.role}`,
        columns: ['Código', 'Descripción', 'Estado', 'Acción'],
        toolbar_actions: ['Buscar', 'Filtrar']
      },
      status_board: {
        id: `blk_${Date.now()}_board`,
        type: 'status_board',
        title: `Tablero de Estados — ${baseScreen.role}`,
        columns: [
          { name: 'Pendiente', cards: ['REG-108 · Por revisar'] },
          { name: 'En Proceso', cards: ['REG-107 · En gestión'] },
          { name: 'Completado', cards: ['REG-106 · Cerrado'] }
        ]
      }
    };
    const newBlock = templateMap[blockType];
    if (!newBlock) return;
    await handleUpdateActiveScreen({
      ...baseScreen,
      components: [...(baseScreen.components || []), newBlock]
    });
    setStatusNotice(`Bloque "${blockType}" añadido manualmente (0 turnos IA).`);
  };

  const handleBridgeToQuote = () => {
    const baseConfig = mapProcessToQuoteConfig(combinedGraph);
    const presetLabel = THEME_PRESETS[blueprint.theme_config?.preset]?.label || 'Personalizado';
    const noteLines = [
      `Blueprint Web ID: ${blueprint.blueprint_id}`,
      `Espacio: ${workspaceName} (${selectedCanvases.length} lienzos)`,
      `Historias: ${(blueprint.user_stories || []).length} · Pantallas UI: ${(blueprint.ui_screens || []).length}`,
      `Tema Visual: ${presetLabel} (${blueprint.theme_config?.primary_color || '#FFC000'})`
    ];
    const enriched = {
      ...baseConfig,
      configuration: {
        ...baseConfig.configuration,
        custom_requirements_note: noteLines.join(' | ')
      },
      web_blueprint_id: blueprint.blueprint_id,
      web_blueprint: blueprint,
      process_graph: combinedGraph,
      preloadedAt: Date.now()
    };
    onClose();
    onPreloadQuote?.(enriched);
  };

  const theme = blueprint.theme_config || {};

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Implementar en solución web"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl h-[92vh] bg-[var(--bg-page)] border border-[var(--border-strong)] rounded-[16px] shadow-2xl overflow-hidden flex flex-col">
        {/* Cabecera Superior */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-deep)] text-[#D9DADC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[8px] bg-[#FFC93C] text-[#2B2D31] flex items-center justify-center shrink-0">
              <AppWindow size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  Implementar en Solución Web
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#2B2D31] border border-[#D9DADC]/20 font-mono text-[10px] text-[#FFC93C]">
                  {workspaceName} · {blueprint.blueprint_id}
                </span>
              </div>
              <p className="text-[11px] text-[#9699A1] truncate">
                Transforma tus diagramas en historias por rol, tema visual y maquetas interactivas declarativas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-[6px] border font-mono text-[11px] ${
                isQuotaExhausted
                  ? 'bg-red-500/15 border-red-500/40 text-red-300'
                  : 'bg-[#2B2D31] border-[#FFC93C]/40 text-[#FFC93C]'
              }`}
            >
              {remainingTurns}/{dailyLimit} turnos IA disp.
            </span>

            {!currentUser && onOpenSaveLogin && (
              <button
                type="button"
                onClick={onOpenSaveLogin}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[#FFC93C]/40 bg-[#FFC93C]/10 text-[11px] text-[#FFC93C] font-semibold hover:bg-[#FFC93C]/20 cursor-pointer"
              >
                <span>Guardar en cuenta (15/día)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[#9699A1] hover:text-white hover:bg-[#2B2D31] cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stepper 3 Pestañas */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 1, label: `1. Historias por Rol (${(blueprint.user_stories || []).length})`, icon: ListChecks },
              { id: 2, label: '2. Tema Visual (Theme Studio)', icon: Palette },
              { id: 3, label: `3. Maquetación UI (${(blueprint.ui_screens || []).length})`, icon: Layout }
            ].map((item) => {
              const Icon = item.icon;
              const active = step === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#FFC93C] border-[#FFC93C] text-[#2B2D31]'
                      : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={13} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {statusNotice && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <Check size={12} />
              <span>{statusNotice}</span>
            </span>
          )}
        </div>

        {/* Cuerpo Principal Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/35 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
              <Loader2 size={20} className="animate-spin text-[#FFC93C]" />
              <span>Cargando blueprint de solución web...</span>
            </div>
          ) : (
            <>
              {/* ═══ PASO 1: HISTORIAS DE USUARIO POR ROL ═══ */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Selector de Lienzos Fuente del Workspace */}
                  <div className="p-4 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          Lienzos de origen incluidos en esta solución web
                        </h3>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Detectados {combinedGraph.actors.length} roles y {combinedGraph.steps.length} pasos en los lienzos marcados.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={aiBusy}
                          onClick={() => handleGenerateStories(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:border-[#FFC93C] text-xs font-medium text-[var(--text-primary)] cursor-pointer disabled:opacity-50"
                        >
                          <Cpu size={13} className="text-[var(--accent-text)]" />
                          <span>Generar base (0 turnos IA)</span>
                        </button>

                        <button
                          type="button"
                          disabled={aiBusy || isQuotaExhausted}
                          onClick={() => handleGenerateStories(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {aiBusy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                          <span>Generar con IA (1 turno)</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {availableCanvases.map((c) => {
                        const checked = selectedCanvasIds.includes(c.session_id);
                        const title = c.canvas_title || c.process_graph?.business_context?.process_name || c.session_id;
                        return (
                          <button
                            key={c.session_id}
                            type="button"
                            onClick={() => handleToggleCanvasSource(c.session_id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-xs transition-colors cursor-pointer ${
                              checked
                                ? 'bg-[#FFC93C]/15 border-[#FFC93C] text-[var(--text-primary)] font-semibold'
                                : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                            }`}
                          >
                            <Check size={12} className={checked ? 'text-[#FFC93C]' : 'opacity-30'} />
                            <span>{title}</span>
                            <span className="font-mono text-[10px] opacity-70">
                              ({c.process_graph?.steps?.length || 0}p)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toolbar Edición Manual Libre */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                      Historias por Rol ({(blueprint.user_stories || []).length}) — Edición manual ilimitada
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStoryId(null);
                        setStoryDraft({
                          role: detectedRoles[0] || '',
                          title: '',
                          description: '',
                          acceptance_criteria: '',
                          suggested_fields: '',
                          priority: 'Alta'
                        });
                        setIsAddingStory(!isAddingStory);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-[#FFC93C] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                    >
                      <Plus size={13} className="text-[#FFC93C]" />
                      <span>Agregar Historia manual (0 turnos)</span>
                    </button>
                  </div>

                  {/* Formulario Agregar / Editar Historia Manual */}
                  {(isAddingStory || editingStoryId) && (
                    <form
                      onSubmit={handleSaveStoryDraft}
                      className="p-4 rounded-[12px] border border-[#FFC93C]/60 bg-[var(--bg-surface)] space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Rol</label>
                          <input
                            type="text"
                            value={storyDraft.role}
                            onChange={(e) => setStoryDraft({ ...storyDraft, role: e.target.value })}
                            placeholder="Ej: Almacén"
                            className="w-full h-9 px-3 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Título corto *</label>
                          <input
                            type="text"
                            required
                            value={storyDraft.title}
                            onChange={(e) => setStoryDraft({ ...storyDraft, title: e.target.value })}
                            placeholder="Ej: Registrar salida de mercadería con guía"
                            className="w-full h-9 px-3 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Historia (Como / Quiero / Para)</label>
                        <input
                          type="text"
                          value={storyDraft.description}
                          onChange={(e) => setStoryDraft({ ...storyDraft, description: e.target.value })}
                          placeholder="Como Almacén, quiero registrar la salida con guía para notificar a Despacho sin usar WhatsApp."
                          className="w-full h-9 px-3 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                            Criterios de aceptación (1 por línea)
                          </label>
                          <textarea
                            rows={2}
                            value={storyDraft.acceptance_criteria}
                            onChange={(e) => setStoryDraft({ ...storyDraft, acceptance_criteria: e.target.value })}
                            placeholder="Validar stock disponible&#10;Generar código de guía único"
                            className="w-full p-2.5 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                            Campos de datos sugeridos (separados por coma)
                          </label>
                          <input
                            type="text"
                            value={storyDraft.suggested_fields}
                            onChange={(e) => setStoryDraft({ ...storyDraft, suggested_fields: e.target.value })}
                            placeholder="Cliente, Guía de Remisión, Bultos, Responsable"
                            className="w-full h-9 px-3 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingStory(false);
                            setEditingStoryId(null);
                          }}
                          className="px-3 py-1.5 rounded-[8px] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-[8px] bg-[#FFC93C] text-[#2B2D31] text-xs font-bold cursor-pointer"
                        >
                          {editingStoryId ? 'Actualizar Historia' : 'Guardar Historia'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Lista de Historias */}
                  {(blueprint.user_stories || []).length === 0 ? (
                    <div className="p-8 rounded-[12px] border border-dashed border-[var(--border-strong)] text-center text-xs text-[var(--text-secondary)]">
                      Aún no hay historias de usuario cargadas. Haz clic en <strong>Generar con IA (1 turno)</strong> o <strong>Generar base (0 turnos IA)</strong> para extraerlas desde tus diagramas.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {(blueprint.user_stories || []).map((st, idx) => (
                        <div
                          key={st.id || idx}
                          className="p-4 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-[#FFC93C] text-[#2B2D31] font-mono text-[10px] font-bold">
                                {st.id}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-primary)]">
                                {st.role}
                              </span>
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                {st.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveStory(idx, -1)}
                                disabled={idx === 0}
                                className="p-1 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#FFC93C] disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveStory(idx, 1)}
                                disabled={idx === (blueprint.user_stories || []).length - 1}
                                className="p-1 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#FFC93C] disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStoryId(st.id);
                                  setIsAddingStory(false);
                                  setStoryDraft({
                                    role: st.role || '',
                                    title: st.title || '',
                                    description: st.description || '',
                                    acceptance_criteria: (st.acceptance_criteria || []).join('\n'),
                                    suggested_fields: (st.suggested_fields || []).join(', '),
                                    priority: st.priority || 'Media'
                                  });
                                }}
                                className="p-1 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#FFC93C] cursor-pointer"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStory(st.id)}
                                className="p-1 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-[var(--text-secondary)]">{st.description}</p>

                          {(st.suggested_fields || []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {st.suggested_fields.map((f, fIdx) => (
                                <span
                                  key={fIdx}
                                  className="px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-primary)]"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ PASO 2: THEME STUDIO (0 TURNOS IA) ═══ */}
              {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="p-4 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        1. Preset visual base (0 turnos IA)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {Object.values(THEME_PRESETS).map((preset) => {
                          const selected = theme.preset === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() =>
                                persistManualPatch(
                                  {
                                    theme_config: {
                                      preset: preset.id,
                                      primary_color: preset.primary_color,
                                      radius: preset.radius,
                                      font_mode: preset.font_mode
                                    }
                                  },
                                  `Tema "${preset.label}" guardado`
                                )
                              }
                              className={`p-3 rounded-[10px] border text-left transition-all cursor-pointer ${
                                selected
                                  ? 'border-[#FFC93C] bg-[#FFC93C]/10'
                                  : 'border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[var(--border-strong)]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-bold text-[var(--text-primary)]">{preset.label}</span>
                                <span
                                  className="w-4 h-4 rounded-full border border-white/20"
                                  style={{ background: preset.bg_page }}
                                />
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)]">{preset.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
                          2. Color primario de acento
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="color"
                            value={theme.primary_color || '#FFC000'}
                            onChange={(e) =>
                              persistManualPatch({
                                theme_config: { ...theme, primary_color: e.target.value }
                              })
                            }
                            className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent"
                          />
                          {ACCENT_SWATCHES.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() =>
                                persistManualPatch({
                                  theme_config: { ...theme, primary_color: hex }
                                })
                              }
                              className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                                (theme.primary_color || '').toUpperCase() === hex
                                  ? 'border-white scale-110'
                                  : 'border-transparent'
                              }`}
                              style={{ background: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                            3. Bordes y densidad
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'none', label: 'Recto' },
                              { id: 'sm', label: 'Suave' },
                              { id: 'md', label: 'Medio' },
                              { id: 'lg', label: 'Redondeado' }
                            ].map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() =>
                                  persistManualPatch({
                                    theme_config: { ...theme, radius: r.id }
                                  })
                                }
                                className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                                  theme.radius === r.id
                                    ? 'bg-[#FFC93C] border-[#FFC93C] text-[#2B2D31] font-bold'
                                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                            4. Tipografía principal
                          </label>
                          <div className="flex gap-1.5">
                            {[
                              { id: 'sans', label: 'Sans Moderna' },
                              { id: 'mono', label: 'Mono Operativa' }
                            ].map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() =>
                                  persistManualPatch({
                                    theme_config: { ...theme, font_mode: f.id }
                                  })
                                }
                                className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                                  theme.font_mode === f.id
                                    ? 'bg-[#FFC93C] border-[#FFC93C] text-[#2B2D31] font-bold'
                                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vista previa en vivo del Theme Studio */}
                  <div className="lg:col-span-6 space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                      Vista previa en vivo de tu paleta
                    </h4>
                    <BlueprintScreenRenderer
                      themeConfig={theme}
                      editable={false}
                      screen={{
                        screen_id: 'preview_theme',
                        role: detectedRoles[0] || 'Ventas / Operación',
                        title: `Módulo Operativo — ${workspaceName}`,
                        subtitle: 'Así lucirán tus botones, formularios, KPIs y tablas con el tema seleccionado.',
                        components: [
                          {
                            id: 'p_kpi',
                            type: 'kpi_row',
                            items: [
                              { label: 'Operaciones Activas', sample_value: '28', delta: '+12%' },
                              { label: 'Por Validar', sample_value: '5', delta: 'En cola' },
                              { label: 'Ahorro Diario', sample_value: '2.5 h', delta: 'Automático' }
                            ]
                          },
                          {
                            id: 'p_form',
                            type: 'action_form',
                            title: 'Ejemplo de Formulario Operativo',
                            fields: ['Cliente / Referencia', 'Monto / Cantidad'],
                            primary_action: 'Confirmar y Enviar'
                          }
                        ]
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ═══ PASO 3: MAQUETACIÓN DE INTERFACES ASISTIDA POR IA ═══ */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Navegador por Rol ("Ver interfaz como:") */}
                  <div className="p-4 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          Ver interfaz como:
                        </span>
                        {detectedRoles.map((roleName) => (
                          <button
                            key={roleName}
                            type="button"
                            onClick={() => setActiveRoleTab(roleName)}
                            className={`px-3 py-1 rounded-[8px] border text-xs font-semibold transition-colors cursor-pointer ${
                              activeRoleTab === roleName
                                ? 'bg-[#FFC93C] border-[#FFC93C] text-[#2B2D31]'
                                : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {roleName}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={aiBusy}
                          onClick={() => handleGenerateLayout({ useAi: false, onlyActiveRole: false })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:border-[#FFC93C] text-xs font-medium text-[var(--text-primary)] cursor-pointer"
                        >
                          <Cpu size={13} className="text-[var(--accent-text)]" />
                          <span>Maqueta base (0 turnos IA)</span>
                        </button>

                        <button
                          type="button"
                          disabled={aiBusy || isQuotaExhausted}
                          onClick={() => handleGenerateLayout({ useAi: true, onlyActiveRole: false })}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {aiBusy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                          <span>Maquetar todas con IA (1 turno)</span>
                        </button>
                      </div>
                    </div>

                    {/* Caja de refinamiento IA por rol + Bloques manuales */}
                    <div className="flex flex-col md:flex-row gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!refinementPrompt.trim()) return;
                          handleGenerateLayout({ useAi: true, onlyActiveRole: true });
                        }}
                        className="flex-1 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={refinementPrompt}
                          onChange={(e) => setRefinementPrompt(e.target.value)}
                          disabled={aiBusy || isQuotaExhausted}
                          placeholder={
                            isQuotaExhausted
                              ? 'Turnos IA agotados — usa los botones de bloques manuales a la derecha'
                              : `Refinar vista de ${activeRoleTab} con IA (ej: Agrega filtro por fecha y exportar PDF)...`
                          }
                          className="flex-1 h-9 px-3 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={aiBusy || isQuotaExhausted || !refinementPrompt.trim()}
                          className="h-9 px-3.5 rounded-[8px] border border-[#FFC93C] bg-[#FFC93C]/15 text-[#FFC93C] hover:bg-[#FFC93C]/25 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                          <Sparkles size={12} />
                          <span>Refinar (1 turno)</span>
                        </button>
                      </form>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">Añadir bloque (0 IA):</span>
                        {[
                          { type: 'kpi_row', label: '+ KPI' },
                          { type: 'action_form', label: '+ Form' },
                          { type: 'data_table', label: '+ Tabla' },
                          { type: 'status_board', label: '+ Kanban' }
                        ].map((b) => (
                          <button
                            key={b.type}
                            type="button"
                            onClick={() => handleAddManualBlock(b.type)}
                            className="h-9 px-2.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[#FFC93C] text-[11px] font-mono text-[var(--text-primary)] cursor-pointer"
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Previsualizador Seguro Declarativo */}
                  <BlueprintScreenRenderer
                    screen={activeScreen}
                    themeConfig={theme}
                    editable={true}
                    onUpdateScreen={handleUpdateActiveScreen}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Discreto de Flujo & Puente Orgánico al Cotizador */}
        <div className="px-4 sm:px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-page)] text-xs font-medium text-[var(--text-primary)] cursor-pointer"
              >
                ← Paso anterior
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-3.5 py-1.5 rounded-[8px] bg-[#FFC93C] text-[#2B2D31] text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Siguiente paso</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[11px] text-[var(--text-secondary)]">
              Ediciones manuales guardadas automáticamente sin consumo de IA.
            </span>
            {onPreloadQuote && (
              <button
                type="button"
                onClick={handleBridgeToQuote}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] border border-[#FFC93C]/50 bg-[#FFC93C]/10 hover:bg-[#FFC93C] hover:text-[#2B2D31] text-[#FFC93C] text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Cotizar desarrollo con Pathrimonio</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
