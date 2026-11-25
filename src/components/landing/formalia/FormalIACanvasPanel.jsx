import React, { useState, useMemo, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { exportDiagramAsPNG, exportDiagramAsPDF } from '../../../lib/formalia/diagramExport';
import FormalIAEngineeringModal from './FormalIAEngineeringModal';

// ── Iconos y etiquetas de canal ───────────────────────────────────────────────

function getChannelBadge(channel) {
  switch (channel) {
    case 'whatsapp':
      return { label: 'WhatsApp', icon: MessageSquare, tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' };
    case 'excel_manual':
      return { label: 'Excel Manual', icon: FileSpreadsheet, tone: 'text-amber-700 dark:text-[#FFC000] bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' };
    case 'cuaderno_papel':
      return { label: 'Papel / Cuaderno', icon: BookOpen, tone: 'text-amber-700 dark:text-[#FFC000] bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' };
    case 'sistema_externo':
      return { label: 'Sistema / SUNAT', icon: Cpu, tone: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30' };
    case 'app_movil':
      return { label: 'App Móvil', icon: Smartphone, tone: 'text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30' };
    default:
      return { label: channel || 'Operación', icon: Globe, tone: 'text-[#52525B] dark:text-[#A1A1AA] bg-[#F4F4F5] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A]' };
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
          ? 'bg-[#FAFAFA]/80 dark:bg-[#111113]/80 border-[#E4E4E7] dark:border-[#27272A]'
          : 'bg-[#FFFFFF]/80 dark:bg-[#09090B]/70 border-[#E4E4E7] dark:border-[#27272A]'
      }`}
    >
      <div
        className={`w-[190px] shrink-0 p-3.5 border-r border-[#E4E4E7] dark:border-[#27272A] flex flex-col justify-center gap-1.5 ${
          isExternal
            ? 'bg-[#F4F4F5] dark:bg-[#18181B]'
            : 'bg-[#FFFBEB]/60 dark:bg-amber-500/[0.04]'
        }`}
      >
        <span
          className={`inline-flex self-start px-2 py-0.5 rounded-[4px] font-mono text-[9px] font-semibold uppercase tracking-wider border ${
            isExternal
              ? 'bg-[#FFFFFF] dark:bg-[#27272A] text-[#52525B] dark:text-[#A1A1AA] border-[#D4D4D8] dark:border-[#3F3F46]'
              : 'bg-[#FFC000] text-[#09090B] border-[#FFC000]'
          }`}
        >
          {isExternal ? 'Externo' : 'Rol Socio ($1/día)'}
        </span>
        <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] leading-snug">
          {data.actorName}
        </span>
        <span className="text-[10px] font-mono text-[#71717A] dark:text-[#71717A]">
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
      className={`w-[230px] rounded-[10px] border p-3 shadow-xs transition-all bg-[#FFFFFF] dark:bg-[#111113] ${
        data.is_manual_bottleneck
          ? 'border-[#FFC000] ring-1 ring-[#FFC000]/40'
          : 'border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46]'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#FFC000] !border-0"
      />

      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#F4F4F5] border border-[#E4E4E7] dark:border-[#27272A]">
          #{data.orderIndex} · {data.step_type === 'GATEWAY_OR_APPROVAL' ? 'VALIDACIÓN' : data.step_type === 'TRIGGER' ? 'INICIO' : data.step_type === 'END' ? 'CIERRE' : 'TAREA'}
        </span>

        {data.is_manual_bottleneck && (
          <span
            title={data.automation_opportunity || 'Cuello de botella manual'}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FFC000] text-[#09090B] font-mono text-[9px] font-bold"
          >
            <AlertTriangle size={10} />
            <span>Manual</span>
          </span>
        )}
      </div>

      <p className="text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] leading-snug mb-2">
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
            className="px-1.5 py-0.5 rounded-[4px] bg-[#F4F4F5] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] font-mono text-[9px] text-[#52525B] dark:text-[#A1A1AA]"
          >
            {art}
          </span>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[#09090B] dark:!bg-[#F4F4F5] !border-0"
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
  isExtracting = false,
  onApplyToQuote
}) {
  const [activeView, setActiveView] = useState('swimlanes'); // 'swimlanes' | 'macro' | 'bottlenecks'
  const [isExporting, setIsExporting] = useState(false);
  const [isEngineeringOpen, setIsEngineeringOpen] = useState(false);
  const canvasCaptureRef = useRef(null);

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
      labelStyle: { fontSize: 10, fontWeight: 600, fill: '#52525B' },
      labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.92 },
      style: { stroke: '#FFC000', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#FFC000',
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

  const handleExportPNG = async () => {
    try {
      setIsExporting(true);
      await exportDiagramAsPNG(canvasCaptureRef.current, graph);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportDiagramAsPDF(canvasCaptureRef.current, graph);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#09090B]">
      
      {/* ── Selector Superior de 3 Vistas Sincronizadas ── */}
      <div className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 p-1 rounded-[8px] bg-[#F4F4F5] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'swimlanes', label: 'Carriles por Rol', icon: Layers },
            { id: 'macro', label: 'Macroprocesos', icon: GitBranch },
            { id: 'bottlenecks', label: `Datos y Cuellos (${bottlenecks.length})`, icon: AlertTriangle }
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
                    ? 'bg-[#FFFFFF] dark:bg-[#27272A] text-[#09090B] dark:text-[#F4F4F5] shadow-xs border border-[#E4E4E7] dark:border-[#3F3F46]'
                    : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5]'
                }`}
              >
                <Icon size={13} className={active ? 'text-[#9A6700] dark:text-[#FFC000]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#52525B] dark:text-[#A1A1AA]">
          <span className="px-2 py-0.5 rounded bg-[#F4F4F5] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A]">
            {actors.length} roles · {steps.length} pasos
          </span>
        </div>
      </div>

      {/* ── Lienzo Central Vivo (Instantánea < 100ms entre vistas) ── */}
      <div
        ref={canvasCaptureRef}
        className="relative flex-1 min-h-[420px] lg:min-h-[480px] overflow-hidden bg-[#FAFAFA] dark:bg-[#09090B]"
      >
        {/* Overlay suave durante actualización LLM sin parpadeos */}
        {isExtracting && (
          <div
            data-export-ignore="true"
            className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF]/95 dark:bg-[#18181B]/95 border border-[#FFC000] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] shadow-md backdrop-blur-xs"
          >
            <Loader2 size={13} className="animate-spin text-[#FFC000]" />
            <span>Actualizando diagrama...</span>
          </div>
        )}

        {/* VISTA 1: CARRILES POR ROL (React Flow) */}
        {activeView === 'swimlanes' && (
          steps.length === 0 && actors.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-[10px] bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[#9A6700] dark:text-[#FFC000] flex items-center justify-center mb-3">
                <Sparkles size={22} />
              </div>
              <h4 className="text-sm font-semibold text-[#09090B] dark:text-[#F4F4F5] mb-1">
                Tu Mapa de Carriles aparecerá aquí en vivo
              </h4>
              <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] max-w-md leading-relaxed">
                Elige una respuesta rápida en el panel izquierdo o describe tu operación. Cada rol detectado abrirá su propio carril con sus pasos y traspasos.
              </p>
            </div>
          ) : (
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
                <Background gap={20} size={1} color="#D4D4D8" />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          )
        )}

        {/* VISTA 2: MACROPROCESOS */}
        {activeView === 'macro' && (
          <div className="h-full overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h4 className="text-sm font-semibold text-[#09090B] dark:text-[#F4F4F5]">
                  Mapa de Macroprocesos — {ctx.company_name || 'Tu Negocio'}
                </h4>
                <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Clasificación automática en Estrategia, Operación Core y Soporte Técnico.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#FFC000] text-[#09090B] font-mono text-[11px] font-semibold">
                {ctx.macroprocess_category === 'estrategico'
                  ? 'Estratégico'
                  : ctx.macroprocess_category === 'soporte'
                    ? 'Soporte'
                    : 'Operativo Core'}
              </span>
            </div>

            {/* Nivel 1: Estratégicos */}
            <div className="p-4 rounded-[10px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] mb-2.5">
                1. Procesos Estratégicos (Dirección & Control)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {['Dirección & Rentabilidad', 'Planificación Comercial', 'Auditoría de Márgenes'].map((item) => (
                  <div
                    key={item}
                    className="px-3 py-2.5 rounded-[8px] bg-[#FAFAFA] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] text-xs font-medium text-[#09090B] dark:text-[#F4F4F5]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Nivel 2: Operativos (Core) */}
            <div className="p-4 rounded-[10px] border-2 border-[#FFC000] bg-[#FFFBEB]/40 dark:bg-amber-500/[0.04]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A6700] dark:text-[#FFC000] font-semibold">
                  2. Procesos Operativos (Core) — {ctx.process_name || 'Flujo Mapeado'}
                </span>
                <span className="text-[11px] font-mono text-[#52525B] dark:text-[#A1A1AA]">
                  {steps.length} eslabones detectados
                </span>
              </div>
              {steps.length === 0 ? (
                <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Describe el flujo operativo en el chat para ver la cadena de valor completa.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {steps.map((s, idx) => {
                    const actor = actors.find((a) => a.id === s.actor_id);
                    return (
                      <React.Fragment key={s.id}>
                        <div
                          className={`p-3 rounded-[8px] border min-w-[160px] flex-1 bg-[#FFFFFF] dark:bg-[#111113] ${
                            s.is_manual_bottleneck
                              ? 'border-[#FFC000]'
                              : 'border-[#E4E4E7] dark:border-[#27272A]'
                          }`}
                        >
                          <div className="text-[10px] font-mono text-[#9A6700] dark:text-[#FFC000] font-semibold mb-1">
                            {idx + 1}. {actor?.name || 'Operador'}
                          </div>
                          <div className="text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] leading-snug">
                            {s.label}
                          </div>
                        </div>
                        {idx < steps.length - 1 && (
                          <ArrowRight size={14} className="text-[#FFC000] shrink-0 hidden sm:block" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nivel 3: Soporte */}
            <div className="p-4 rounded-[10px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] mb-2.5">
                3. Procesos de Soporte & Automatización Pathrimonio
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  'Validación RUC/DNI & Facturación',
                  'Respaldo Cloud & SQLite Offline',
                  'Control de Accesos RBAC por Rol'
                ].map((item) => (
                  <div
                    key={item}
                    className="px-3 py-2.5 rounded-[8px] bg-[#FAFAFA] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]"
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
            {/* Cuellos de botella manuales resaltados con insignia ámbar #FFC000 */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#09090B] dark:text-[#F4F4F5] flex items-center gap-2">
                  <AlertTriangle size={15} className="text-[#FFC000]" />
                  <span>Pasos Manuales y Cuellos de Botella ({bottlenecks.length})</span>
                </h4>
              </div>

              {bottlenecks.length === 0 ? (
                <div className="p-4 rounded-[10px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113] text-xs text-[#52525B] dark:text-[#A1A1AA]">
                  Aún no se detectan pasos críticos manuales. Menciona si usas Excel, papel o WhatsApp para resaltar dónde automatizar.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {bottlenecks.map((b) => {
                    const actor = actors.find((a) => a.id === b.actor_id);
                    return (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-[10px] border border-[#FFC000] bg-[#FFFBEB]/60 dark:bg-amber-500/10 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFC000] text-[#09090B] font-mono text-[10px] font-bold">
                            <AlertTriangle size={11} />
                            <span>CUELLO DE BOTELLA · {actor?.name || 'Rol'}</span>
                          </span>
                          <span className="font-mono text-[10px] text-[#9A6700] dark:text-[#FFC000]">
                            Canal actual: {b.channel}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5]">
                          {b.label}
                        </p>
                        {b.automation_opportunity && (
                          <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
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
              <div className="p-4 rounded-[10px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113]">
                <h5 className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] flex items-center gap-1.5 mb-2.5">
                  <Database size={13} className="text-[#9A6700] dark:text-[#FFC000]" />
                  <span>Entidades & Formularios Intercambiados</span>
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
                      className="px-2 py-1 rounded-[6px] bg-[#F4F4F5] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] font-mono text-[11px] text-[#09090B] dark:text-[#F4F4F5]"
                    >
                      {item}
                    </span>
                  ))}
                  {steps.length === 0 && (
                    <span className="text-xs text-[#71717A]">Sin entidades extraídas aún.</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-[10px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113]">
                <h5 className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] flex items-center gap-1.5 mb-2.5">
                  <Cpu size={13} className="text-[#9A6700] dark:text-[#FFC000]" />
                  <span>APIs & Módulos Técnicos Sugeridos</span>
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {(eng.external_apis_needed || []).map((api) => (
                    <span
                      key={api}
                      className="px-2 py-1 rounded-[6px] bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 font-mono text-[11px] text-[#9A6700] dark:text-[#FFC000]"
                    >
                      {api}
                    </span>
                  ))}
                  {(eng.external_apis_needed || []).length === 0 && (
                    <span className="text-xs text-[#71717A]">Se detectarán al mencionar boletas, RUC, fotos o WhatsApp.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Barra de Acciones Inferior (SDD Sección 2.2) ── */}
      <div className="px-4 py-3 border-t border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111113] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={isExporting || steps.length === 0}
            onClick={handleExportPNG}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46] text-[11px] font-medium text-[#09090B] dark:text-[#F4F4F5] transition-colors cursor-pointer disabled:opacity-40"
            title="Descargar Diagrama gratis en PNG"
          >
            <Download size={13} />
            <span>PNG</span>
          </button>

          <button
            type="button"
            disabled={isExporting || steps.length === 0}
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46] text-[11px] font-medium text-[#09090B] dark:text-[#F4F4F5] transition-colors cursor-pointer disabled:opacity-40"
            title="Descargar Diagrama gratis en PDF"
          >
            <FileText size={13} />
            <span>PDF</span>
          </button>

          <button
            type="button"
            disabled={steps.length === 0}
            onClick={() => setIsEngineeringOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] hover:border-[#FFC000] text-[11px] font-medium text-[#09090B] dark:text-[#F4F4F5] transition-colors cursor-pointer disabled:opacity-40"
            title="Inspeccionar PlantUML (.puml), Historias de Usuario y JSON canónico"
          >
            <Code2 size={13} className="text-[#9A6700] dark:text-[#FFC000]" />
            <span>.puml & Handoff</span>
          </button>
        </div>

        {/* CTA Principal en #FFC000 */}
        <button
          type="button"
          onClick={() => onApplyToQuote?.(graph)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] text-[#09090B] text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-[0.99]"
        >
          <span>
            Cotizar este sistema en Pathrimonio
            {internalRolesCount > 0 ? ` (${internalRolesCount} ${internalRolesCount === 1 ? 'rol' : 'roles'} · $${internalRolesCount}/día)` : ''}
          </span>
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Modal de Handoff Ingeniería (.puml / HUs / RBAC / JSON) */}
      <FormalIAEngineeringModal
        isOpen={isEngineeringOpen}
        onClose={() => setIsEngineeringOpen(false)}
        graph={graph}
      />
    </div>
  );
}
