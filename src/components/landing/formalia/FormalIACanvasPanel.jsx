import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Layers,
  GitBranch,
  AlertTriangle,
  ListChecks,
  Download,
  FileText,
  ArrowRight,
  Code2,
  MessageSquare,
  FileSpreadsheet,
  BookOpen,
  Globe,
  Smartphone,
  Cpu,
  Database,
  CheckCircle2,
  Loader2,
  Sparkles,
  History,
  Copy,
  Check,
  Rocket,
  ExternalLink
} from 'lucide-react';
import {
  generateEngineeringHandoff,
  handoffStoriesToMarkdown
} from '../../../lib/formalia/compilers';
import { exportDiagramAsPNG, exportDiagramAsPDF } from '../../../lib/formalia/diagramExport';
import FormalIAEngineeringModal from './FormalIAEngineeringModal';

// ── Iconos y etiquetas de canal ───────────────────────────────────────────────

function getChannelBadge(channel) {
  switch (channel) {
    case 'whatsapp':
      return { label: 'WhatsApp', icon: MessageSquare, tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' };
    case 'excel_manual':
      return { label: 'Excel Manual', icon: FileSpreadsheet, tone: 'text-[var(--accent-text)] bg-[var(--accent-soft)] border-[var(--accent-border)]' };
    case 'cuaderno_papel':
      return { label: 'Papel / Cuaderno', icon: BookOpen, tone: 'text-[var(--accent-text)] bg-[var(--accent-soft)] border-[var(--accent-border)]' };
    case 'sistema_externo':
      return { label: 'Sistema / SUNAT', icon: Cpu, tone: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
    case 'app_movil':
      return { label: 'App Móvil', icon: Smartphone, tone: 'text-violet-400 bg-violet-500/10 border-violet-500/30' };
    default:
      return { label: channel || 'Operación', icon: Globe, tone: 'text-[var(--text-secondary)] bg-[var(--bg-subtle)] border-[var(--border-subtle)]' };
  }
}

// ── Nodos Personalizados de React Flow ────────────────────────────────────────

function SwimlaneBandNode({ data }) {
  const isExternal = data.actorType === 'EXTERNAL_CUSTOMER';
  return (
    <div
      style={{ width: data.laneWidth, height: data.laneHeight }}
      className={`rounded-[10px] border transition-colors flex overflow-hidden pointer-events-none ${
        data.laneIndex % 2 === 0
          ? 'bg-[var(--bg-surface)]/90 border-[var(--border-subtle)]'
          : 'bg-[var(--bg-page)]/90 border-[var(--border-subtle)]'
      }`}
    >
      <div
        className={`w-[190px] shrink-0 p-3.5 border-r border-[var(--border-subtle)] flex flex-col justify-center gap-1.5 ${
          isExternal
            ? 'bg-[var(--bg-subtle)]'
            : 'bg-[var(--accent-soft)]'
        }`}
      >
        <span
          className={`inline-flex self-start px-2 py-0.5 rounded-[4px] font-mono text-[9px] font-semibold uppercase tracking-wider border ${
            isExternal
              ? 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-strong)]'
              : 'bg-[#FFC93C] text-[#2B2D31] border-[#FFC93C]'
          }`}
        >
          {isExternal ? 'Externo' : 'Rol Socio ($1/día)'}
        </span>
        <span className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
          {data.actorName}
        </span>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          {data.stepsCount} {data.stepsCount === 1 ? 'actividad' : 'actividades'}
        </span>
      </div>
      <div className="flex-1" />
    </div>
  );
}

function ProcessStepNode({ data }) {
  const ch = getChannelBadge(data.channel);
  const ChannelIcon = ch.icon;

  return (
    <div
      className={`w-[230px] rounded-[10px] border p-3 shadow-xs transition-all bg-[var(--bg-surface)] ${
        data.is_manual_bottleneck
          ? 'border-[#FFC93C] ring-1 ring-[#FFC93C]/40'
          : 'border-[var(--border-strong)]'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#FFC93C] !border-0"
      />

      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
          #{data.orderIndex} · {data.step_type === 'GATEWAY_OR_APPROVAL' ? 'VALIDACIÓN' : data.step_type === 'TRIGGER' ? 'INICIO' : data.step_type === 'END' ? 'CIERRE' : 'TAREA'}
        </span>

        {data.is_manual_bottleneck && (
          <span
            title={data.automation_opportunity || 'Cuello de botella manual'}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FFC93C] text-[#2B2D31] font-mono text-[9px] font-bold"
          >
            <AlertTriangle size={10} />
            <span>Manual</span>
          </span>
        )}
      </div>

      <p className="text-xs font-medium text-[var(--text-primary)] leading-snug mb-2">
        {data.label}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] border text-[10px] font-medium ${ch.tone}`}>
          <ChannelIcon size={10} />
          <span>{ch.label}</span>
        </span>
        {(data.artifacts || []).slice(0, 2).map((art, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 rounded-[4px] bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono text-[9px] text-[var(--text-secondary)]"
          >
            {art}
          </span>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[var(--text-primary)] !border-0"
      />
    </div>
  );
}

const NODE_TYPES = {
  swimlaneBand: SwimlaneBandNode,
  processStep: ProcessStepNode
};

// ── Componente Principal del Lienzo Multi-Vista ───────────────────────────────

export default function FormalIACanvasPanel({
  graph,
  messages = [],
  versions = [],
  generatedFiles = [],
  isExtracting = false,
  isPortalEmbedded = false,
  targetProjectName = '',
  onPromoteToProject,
  onOpenInPortal,
  onApplyToQuote,
  onRecordArtifact,
  onRestoreVersion
}) {
  const [activeView, setActiveView] = useState('swimlanes'); // 'swimlanes' | 'macro' | 'bottlenecks' | 'stories'
  const [isExporting, setIsExporting] = useState(false);
  const [isEngineeringOpen, setIsEngineeringOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState('plantuml');
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [copiedBacklog, setCopiedBacklog] = useState(false);
  const canvasCaptureRef = useRef(null);

  const handoff = useMemo(() => generateEngineeringHandoff(graph), [graph]);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const actors = graph?.actors || [];
  const steps = graph?.steps || [];
  const transitions = graph?.transitions || [];
  const ctx = graph?.business_context || {};
  const eng = graph?.engineering_artifacts || {};

  // Cálculo determinista de nodos y aristas React Flow (cero superposición)
  const { flowNodes, flowEdges } = useMemo(() => {
    const laneHeight = 140;
    const laneGap = 12;
    const stepColWidth = 265;
    const leftColumnWidth = 220;
    const totalLaneWidth = Math.max(820, leftColumnWidth + steps.length * stepColWidth + 80);

    const actorIndexMap = new Map(actors.map((a, idx) => [a.id, idx]));
    const nodes = [];

    // 1. Bandas de carriles por actor
    actors.forEach((actor, laneIdx) => {
      const stepsInLane = steps.filter((s) => s.actor_id === actor.id).length;
      nodes.push({
        id: `lane_${actor.id}`,
        type: 'swimlaneBand',
        position: { x: 16, y: 16 + laneIdx * (laneHeight + laneGap) },
        draggable: false,
        selectable: false,
        zIndex: -1,
        data: {
          actorName: actor.name,
          actorType: actor.type,
          laneIndex: laneIdx,
          laneWidth: totalLaneWidth,
          laneHeight,
          stepsCount: stepsInLane
        }
      });
    });

    // 2. Nodos de pasos dentro de su carril correspondiente
    steps.forEach((step, idx) => {
      const laneIdx = actorIndexMap.has(step.actor_id) ? actorIndexMap.get(step.actor_id) : 0;
      nodes.push({
        id: step.id,
        type: 'processStep',
        position: {
          x: leftColumnWidth + 24 + idx * stepColWidth,
          y: 16 + laneIdx * (laneHeight + laneGap) + 16
        },
        zIndex: 10,
        data: {
          ...step,
          orderIndex: idx + 1
        }
      });
    });

    // 3. Aristas secuenciales con etiquetas de condición
    const edges = transitions.map((t, idx) => ({
      id: `edge_${t.from}_${t.to}_${idx}`,
      source: t.from,
      target: t.to,
      type: 'smoothstep',
      animated: true,
      label: t.condition || undefined,
      labelStyle: { fontSize: 10, fontWeight: 600, fill: '#2B2D31' },
      labelBgStyle: { fill: '#D9DADC', fillOpacity: 0.95 },
      style: { stroke: '#FFC93C', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#FFC93C',
        width: 18,
        height: 18
      }
    }));

    return { flowNodes: nodes, flowEdges: edges };
  }, [actors, steps, transitions]);

  const bottlenecks = useMemo(() => steps.filter((s) => s.is_manual_bottleneck), [steps]);
  const internalRolesCount = useMemo(
    () => actors.filter((a) => a.type === 'INTERNAL_ADMIN_ROLE').length,
    [actors]
  );

  const currentVersionLabel = versions.length > 0 ? versions[versions.length - 1].version_label : 'v1';
  const currentVersionNum = versions.length > 0 ? versions[versions.length - 1].version_number : 1;

  const handleExportPNG = async () => {
    try {
      setIsExporting(true);
      const fileMeta = await exportDiagramAsPNG(canvasCaptureRef.current, graph, currentVersionLabel);
      onRecordArtifact?.({
        id: `${graph.session_id}_png_${currentVersionLabel}_${Date.now()}`,
        session_id: graph.session_id,
        version_number: currentVersionNum,
        version_label: currentVersionLabel,
        artifact_kind: 'png',
        file_name: fileMeta.fileName,
        mime_type: fileMeta.mimeType,
        data_url: fileMeta.dataUrl,
        size_bytes: fileMeta.sizeBytes,
        change_summary: `Diagrama exportado en PNG (${activeView})`,
        chat_turns_at: messages.filter((m) => m.role === 'user').length
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const fileMeta = await exportDiagramAsPDF(canvasCaptureRef.current, graph, currentVersionLabel);
      onRecordArtifact?.({
        id: `${graph.session_id}_pdf_${currentVersionLabel}_${Date.now()}`,
        session_id: graph.session_id,
        version_number: currentVersionNum,
        version_label: currentVersionLabel,
        artifact_kind: 'pdf',
        file_name: fileMeta.fileName,
        mime_type: fileMeta.mimeType,
        data_url: fileMeta.dataUrl,
        size_bytes: fileMeta.sizeBytes,
        change_summary: `Documento PDF generado desde FORMALIA (${activeView})`,
        chat_turns_at: messages.filter((m) => m.role === 'user').length
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-page)]">

      {/* ── Selector Superior de 4 Vistas Sincronizadas ── */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 p-1 rounded-[8px] bg-[var(--bg-page)] border border-[var(--border-subtle)] overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'swimlanes', label: 'Carriles por Rol', icon: Layers },
            { id: 'macro', label: 'Macroprocesos', icon: GitBranch },
            { id: 'bottlenecks', label: `Datos y Cuellos (${bottlenecks.length})`, icon: AlertTriangle },
            { id: 'stories', label: `Historias de Usuario (${handoff.user_stories.length})`, icon: ListChecks }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] shadow-xs border border-[#FFC93C]/60'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={13} className={active ? 'text-[var(--accent-text)]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
          <span className="px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)]">
            {actors.length} roles · {steps.length} pasos
          </span>
        </div>
      </div>

      {/* ── Lienzo Central Vivo (Instantánea < 100ms entre vistas) ── */}
      <div
        ref={canvasCaptureRef}
        className="relative flex-1 min-h-[420px] lg:min-h-[480px] overflow-hidden bg-[var(--bg-page)]"
      >
        {/* Overlay suave durante actualización LLM sin parpadeos */}
        {isExtracting && (
          <div
            data-export-ignore="true"
            className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)]/95 border border-[#FFC93C] text-xs font-medium text-[var(--text-primary)] shadow-md backdrop-blur-xs"
          >
            <Loader2 size={13} className="animate-spin text-[#FFC93C]" />
            <span>Actualizando diagrama...</span>
          </div>
        )}

        {/* VISTA 1: CARRILES POR ROL (React Flow) */}
        {activeView === 'swimlanes' && (
          steps.length === 0 && actors.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-[10px] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-text)] flex items-center justify-center mb-3">
                <Sparkles size={22} />
              </div>
              {ctx.process_name && ctx.process_name !== 'Operación por mapear' ? (
                <>
                  <span className="mb-2 px-2.5 py-0.5 rounded-[4px] bg-[#FFC93C] text-[#2B2D31] font-mono text-[10px] font-bold uppercase tracking-wider">
                    Alcance Conversado
                  </span>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    {ctx.process_name}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md leading-relaxed">
                    FORMALIA ya registró el enfoque de tu diagrama. Responde en el chat qué roles participan y cómo inicia el primer paso real para abrir los carriles en vivo.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Tu Mapa de Carriles aparecerá aquí en vivo
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md leading-relaxed">
                    Conversemos primero qué proceso deseas graficar. A medida que definas roles y actividades en el chat, cada carril se irá dibujando aquí sin inventar pasos.
                  </p>
                </>
              )}
            </div>
          ) : isClientMounted ? (
            <div className="w-full h-[460px] lg:h-[520px]">
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={NODE_TYPES}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.35}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
              >
                <Background gap={20} size={1} color="rgba(217,218,220,0.16)" />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
              <p className="text-xs text-[var(--text-secondary)]">
                Carriles mapeados: {actors.map((a) => a.name).join(', ')} ({steps.length} pasos)
              </p>
            </div>
          )
        )}

        {/* VISTA 2: MACROPROCESOS */}
        {activeView === 'macro' && (
          <div className="h-full overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Mapa de Macroprocesos — {ctx.company_name || 'Tu Negocio'}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Clasificación automática en Estrategia, Operación Core y Soporte Técnico.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#FFC93C] text-[#2B2D31] font-mono text-[11px] font-semibold">
                {ctx.macroprocess_category === 'estrategico'
                  ? 'Estratégico'
                  : ctx.macroprocess_category === 'soporte'
                    ? 'Soporte'
                    : 'Operativo Core'}
              </span>
            </div>

            {/* Nivel 1: Estratégicos */}
            <div className="p-4 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                1. Procesos Estratégicos (Dirección &amp; Control)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {['Dirección & Rentabilidad', 'Planificación Comercial', 'Auditoría de Márgenes'].map((item) => (
                  <div
                    key={item}
                    className="px-3 py-2.5 rounded-[8px] bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Nivel 2: Operativos (Core) */}
            <div className="p-4 rounded-[10px] border-2 border-[#FFC93C] bg-[var(--accent-soft)]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-text)] font-semibold">
                  2. Procesos Operativos (Core) — {ctx.process_name || 'Flujo Mapeado'}
                </span>
                <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                  {steps.length} eslabones detectados
                </span>
              </div>
              {steps.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)]">
                  Describe el flujo operativo en el chat para ver la cadena de valor completa.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {steps.map((s, idx) => {
                    const actor = actors.find((a) => a.id === s.actor_id);
                    return (
                      <React.Fragment key={s.id}>
                        <div
                          className={`p-3 rounded-[8px] border min-w-[160px] flex-1 bg-[var(--bg-surface)] ${
                            s.is_manual_bottleneck
                              ? 'border-[#FFC93C]'
                              : 'border-[var(--border-subtle)]'
                          }`}
                        >
                          <div className="text-[10px] font-mono text-[var(--accent-text)] font-semibold mb-1">
                            {idx + 1}. {actor?.name || 'Operador'}
                          </div>
                          <div className="text-xs font-medium text-[var(--text-primary)] leading-snug">
                            {s.label}
                          </div>
                        </div>
                        {idx < steps.length - 1 && (
                          <ArrowRight size={14} className="text-[var(--accent-text)] shrink-0 hidden sm:block" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nivel 3: Soporte */}
            <div className="p-4 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                3. Procesos de Soporte &amp; Automatización Pathrimonio
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  'Validación RUC/DNI & Facturación',
                  'Respaldo Cloud & SQLite Offline',
                  'Control de Accesos RBAC por Rol'
                ].map((item) => (
                  <div
                    key={item}
                    className="px-3 py-2.5 rounded-[8px] bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VISTA 3: DATOS Y CUELLOS DE BOTELLA */}
        {activeView === 'bottlenecks' && (
          <div className="h-full overflow-y-auto p-5 space-y-4">
            {/* Cuellos de botella manuales */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <AlertTriangle size={15} className="text-[var(--accent-text)]" />
                  <span>Pasos Manuales y Cuellos de Botella ({bottlenecks.length})</span>
                </h4>
              </div>

              {bottlenecks.length === 0 ? (
                <div className="p-4 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)]">
                  Aún no se detectan pasos críticos manuales. Menciona si usas Excel, papel o WhatsApp para resaltar dónde automatizar.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {bottlenecks.map((b) => {
                    const actor = actors.find((a) => a.id === b.actor_id);
                    return (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-[10px] border border-[#FFC93C] bg-[var(--accent-soft)] flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFC93C] text-[#2B2D31] font-mono text-[10px] font-bold">
                            <AlertTriangle size={11} />
                            <span>CUELLO DE BOTELLA · {actor?.name || 'Rol'}</span>
                          </span>
                          <span className="font-mono text-[10px] text-[var(--accent-text)]">
                            Canal actual: {b.channel}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          {b.label}
                        </p>
                        {b.automation_opportunity && (
                          <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                            <span><strong>Oportunidad:</strong> {b.automation_opportunity}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Artefactos, Entidades y APIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <h5 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 mb-2.5">
                  <Database size={13} className="text-[var(--accent-text)]" />
                  <span>Entidades &amp; Formularios Intercambiados</span>
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(
                    new Set([
                      ...(eng.detected_entities || []),
                      ...steps.flatMap((s) => s.artifacts || [])
                    ])
                  ).map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-primary)]"
                    >
                      {item}
                    </span>
                  ))}
                  {steps.length === 0 && (
                    <span className="text-xs text-[var(--text-muted)]">Sin entidades extraídas aún.</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <h5 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 mb-2.5">
                  <Cpu size={13} className="text-[var(--accent-text)]" />
                  <span>APIs &amp; Módulos Técnicos Sugeridos</span>
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {(eng.external_apis_needed || []).map((api) => (
                    <span
                      key={api}
                      className="px-2 py-1 rounded-[6px] bg-[var(--accent-soft)] border border-[var(--accent-border)] font-mono text-[11px] text-[var(--accent-text)]"
                    >
                      {api}
                    </span>
                  ))}
                  {(eng.external_apis_needed || []).length === 0 && (
                    <span className="text-xs text-[var(--text-muted)]">Se detectarán al mencionar boletas, RUC, fotos o WhatsApp.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 4: HISTORIAS DE USUARIO Y SÍNTESIS PARA DESARROLLO */}
        {activeView === 'stories' && (
          <div className="h-full overflow-y-auto p-5 space-y-4">
            <div className="p-4 rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <ListChecks size={15} className="text-[var(--accent-text)]" />
                  <span>Backlog de Software Derivado — {ctx.process_name || 'Operación'}</span>
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {handoff.user_stories.length} historias de usuario · {handoff.suggested_interfaces.length} interfaces · {handoff.suggested_data_models.length} tablas relacionales listas para desarrollo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={handoff.user_stories.length === 0}
                  onClick={() => {
                    navigator.clipboard?.writeText(handoffStoriesToMarkdown(handoff));
                    setCopiedBacklog(true);
                    setTimeout(() => setCopiedBacklog(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:border-[#FFC93C] text-[11px] font-medium text-[var(--text-primary)] cursor-pointer disabled:opacity-40"
                >
                  {copiedBacklog ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedBacklog ? 'Backlog copiado' : 'Copiar .md'}</span>
                </button>

                {onPromoteToProject && (
                  <button
                    type="button"
                    disabled={handoff.user_stories.length === 0 && actors.length === 0}
                    onClick={() => onPromoteToProject(graph)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                  >
                    <Rocket size={12} />
                    <span>Materializar en {targetProjectName || 'Proyecto SDD'}</span>
                  </button>
                )}

                {!onPromoteToProject && onOpenInPortal && (
                  <button
                    type="button"
                    disabled={handoff.user_stories.length === 0 && actors.length === 0}
                    onClick={() => onOpenInPortal(graph)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                  >
                    <ExternalLink size={12} />
                    <span>Desarrollar en Portal de Colaboradores</span>
                  </button>
                )}
              </div>
            </div>

            {handoff.user_stories.length === 0 ? (
              <div className="p-8 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center">
                <p className="text-xs text-[var(--text-secondary)]">
                  Detalla el flujo en el chat izquierdo para generar automáticamente las Historias de Usuario, Interfaces y Entidades de Software.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {handoff.user_stories.map((st) => (
                    <div
                      key={st.id}
                      className={`p-3.5 rounded-[10px] border bg-[var(--bg-surface)] ${
                        st.is_priority_automation
                          ? 'border-[#FFC93C]/70'
                          : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-[#FFC93C] text-[#2B2D31] font-mono text-[10px] font-bold">
                            {st.id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-primary)]">
                            {st.role}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)]">
                            {st.target_interface}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                            st.priority === 'Alta'
                              ? 'bg-[#FFC93C]/20 text-[var(--accent-text)] border border-[#FFC93C]/40'
                              : 'bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                          }`}
                        >
                          Prioridad {st.priority}{st.is_priority_automation ? ' · Automatizar' : ''}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-primary)] leading-relaxed mb-2">
                        <strong>Como</strong> {st.role}, <strong>quiero</strong> {st.action} <strong>para</strong> {st.benefit}.
                      </p>

                      <ul className="space-y-1 pl-3 border-l-2 border-[#FFC93C]/40">
                        {(st.acceptance_criteria || []).map((c, idx) => (
                          <li key={idx} className="text-[11px] text-[var(--text-secondary)]">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Interfaces y Tablas Derivadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <h5 className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                      Interfaces de Software Sugeridas ({handoff.suggested_interfaces.length})
                    </h5>
                    <div className="space-y-1.5">
                      {handoff.suggested_interfaces.map((iface) => (
                        <div key={iface.number} className="p-2 rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[11px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[var(--text-primary)]">{iface.title}</span>
                            <span className="font-mono text-[10px] text-[var(--accent-text)]">{iface.platform}</span>
                          </div>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">{iface.objective}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <h5 className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                      Entidades / Tablas Derivadas ({handoff.suggested_data_models.length})
                    </h5>
                    <div className="space-y-1.5">
                      {handoff.suggested_data_models.map((dm) => (
                        <div key={dm.tableName} className="p-2 rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[11px] flex items-center justify-between gap-2">
                          <div>
                            <span className="font-mono font-semibold text-[var(--text-primary)]">{dm.tableName}</span>
                            <p className="text-[10px] text-[var(--text-secondary)]">{dm.attributes.length} columnas · vinculada a {dm.linkedStory || 'flujo'}</p>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent-text)] font-mono text-[9px]">
                            PostgreSQL
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Barra de Acciones Inferior (SDD Sección 2.2) ── */}
      <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={isExporting || steps.length === 0}
            onClick={handleExportPNG}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:border-[#FFC93C]/60 text-[11px] font-medium text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40"
            title="Descargar Diagrama gratis en PNG"
          >
            <Download size={13} />
            <span>PNG</span>
          </button>

          <button
            type="button"
            disabled={isExporting || steps.length === 0}
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:border-[#FFC93C]/60 text-[11px] font-medium text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40"
            title="Descargar Diagrama gratis en PDF"
          >
            <FileText size={13} />
            <span>PDF</span>
          </button>

          <button
            type="button"
            disabled={steps.length === 0}
            onClick={() => {
              setModalInitialTab('plantuml');
              setIsEngineeringOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:border-[#FFC93C] text-[11px] font-medium text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40"
            title="Inspeccionar PlantUML (.puml), Historias de Usuario y JSON canónico"
          >
            <Code2 size={13} className="text-[var(--accent-text)]" />
            <span>.puml &amp; Handoff</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalInitialTab('versions');
              setIsEngineeringOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:border-[#FFC93C] text-[11px] font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Ver chat recopilado, archivos generados y versiones"
          >
            <History size={13} className="text-[var(--accent-text)]" />
            <span>Chat &amp; Versiones ({versions.length} · {generatedFiles.length})</span>
          </button>

          {!isPortalEmbedded && onOpenInPortal && (
            <button
              type="button"
              disabled={steps.length === 0}
              onClick={() => onOpenInPortal(graph)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[#FFC93C]/50 bg-[var(--accent-soft)] hover:border-[#FFC93C] text-[11px] font-semibold text-[var(--accent-text)] transition-colors cursor-pointer disabled:opacity-40"
              title="Llevar este diagrama al Portal de Colaboradores para generar Roles, HUs e Interfaces"
            >
              <ExternalLink size={12} />
              <span>Abrir en Portal SDD</span>
            </button>
          )}
        </div>

        {/* CTA Principal en Yellow #FFC93C */}
        {isPortalEmbedded && onPromoteToProject ? (
          <button
            type="button"
            disabled={steps.length === 0 && actors.length === 0}
            onClick={() => onPromoteToProject(graph)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-[0.99] disabled:opacity-40"
          >
            <Rocket size={14} strokeWidth={2} />
            <span>
              Materializar en {targetProjectName || 'Proyecto'} ({actors.length} roles · {handoff.user_stories.length} HUs)
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onApplyToQuote?.(graph)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-[0.99]"
          >
            <span>
              Cotizar este sistema en Pathrimonio
              {internalRolesCount > 0 ? ` (${internalRolesCount} ${internalRolesCount === 1 ? 'rol' : 'roles'} · $${internalRolesCount}/día)` : ''}
            </span>
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Modal de Handoff Ingeniería, Chat y Versiones FORMALIA */}
      <FormalIAEngineeringModal
        isOpen={isEngineeringOpen}
        onClose={() => setIsEngineeringOpen(false)}
        graph={graph}
        messages={messages}
        versions={versions}
        generatedFiles={generatedFiles}
        initialTab={modalInitialTab}
        onRecordArtifact={onRecordArtifact}
        onRestoreVersion={onRestoreVersion}
      />
    </div>
  );
}
