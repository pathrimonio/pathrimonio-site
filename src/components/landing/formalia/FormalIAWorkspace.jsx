import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  GitBranch,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  createInitialProcessGraph,
  SDD_EXAMPLE_LOGISTICS_GRAPH
} from '../../../lib/formalia/schema';
import {
  startFormaliaSession,
  sendFormaliaMessage,
  convertFormaliaToQuote,
  loadLocalFormaliaSession,
  saveLocalFormaliaSession,
  clearLocalFormaliaSession,
  createWelcomeMessage,
  buildVersionSnapshot,
  registerGeneratedArtifact
} from '../../../services/formaliaService';
import FormalIAChatPanel from './FormalIAChatPanel';
import FormalIACanvasPanel from './FormalIACanvasPanel';

const INITIAL_SSR_GRAPH = createInitialProcessGraph('FIA-2026-INIT');
const INITIAL_SSR_WELCOME = {
  id: 'msg_welcome_init',
  role: 'assistant',
  content:
    'Hola, soy FORMALIA. Cuéntame en tus propias palabras: ¿qué proceso de tu negocio te genera hoy más desorden? (Ej. Ventas, Despachos, Pedidos)',
  quick_replies: [
    'Recibimos pedidos por WhatsApp, anotamos en Excel y despachamos en ruta',
    'Comercio / Bodega: ventas en caja, control de stock e inventario manual',
    'Restaurante / Delivery: comandas, cocina y entregas con demora'
  ],
  phase: '1_context',
  timestamp: '2026-11-25T00:00:00.000Z'
};

export default function FormalIAWorkspace({
  onPreloadQuote,
  isStandalonePage = false,
  onBackHome
}) {
  const [session, setSession] = useState({
    session_id: INITIAL_SSR_GRAPH.session_id,
    process_graph: INITIAL_SSR_GRAPH,
    messages: [INITIAL_SSR_WELCOME],
    versions: [],
    generated_files: [],
    turns_count: 0,
    max_turns: 15
  });
  const [clientHydrated, setClientHydrated] = useState(false);

  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'diagram'
  const [diagramUpdatedBadge, setDiagramUpdatedBadge] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Hidrata sesión desde localStorage o inicia sesión remota tras montaje en cliente (SSR-safe)
  useEffect(() => {
    setClientHydrated(true);
    const saved = loadLocalFormaliaSession();
    if (saved) {
      setSession({
        versions: [],
        generated_files: [],
        ...saved
      });
    } else {
      startFormaliaSession().then((newSess) => {
        setSession(newSess);
      });
    }
  }, []);

  useEffect(() => {
    if (!clientHydrated || session.session_id === 'FIA-2026-INIT') return;
    saveLocalFormaliaSession(session);
  }, [session, clientHydrated]);

  const handleSendMessage = async (text) => {
    setErrorMsg('');
    const userMsg = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg]
    }));

    setIsExtracting(true);
    try {
      const res = await sendFormaliaMessage({
        sessionId: session.session_id,
        message: text,
        currentGraph: session.process_graph,
        turnsCount: session.turns_count,
        existingVersions: session.versions || [],
        existingFiles: session.generated_files || []
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

      setSession((prev) => ({
        ...prev,
        process_graph: res.process_graph,
        turns_count: res.turns_count,
        versions: res.versions || prev.versions || [],
        generated_files: res.generated_files || prev.generated_files || [],
        messages: [...prev.messages, assistantMsg]
      }));

      setDiagramUpdatedBadge(true);
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar tu mensaje.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleResetSession = async () => {
    clearLocalFormaliaSession();
    setErrorMsg('');
    setDiagramUpdatedBadge(false);
    const fresh = await startFormaliaSession();
    setSession(fresh);
  };

  const handleLoadExample = () => {
    const exampleGraph = structuredClone(SDD_EXAMPLE_LOGISTICS_GRAPH);
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
      1
    );

    setSession({
      session_id: exampleGraph.session_id,
      process_graph: exampleGraph,
      messages: exampleMessages,
      versions: [snapshot],
      generated_files: [pumlArtifact],
      turns_count: 1,
      max_turns: 15
    });
    registerGeneratedArtifact(pumlArtifact).catch(() => {});
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

  const handleApplyToQuote = async (graph) => {
    const targetGraph = graph || session.process_graph;
    const preloadedConfig = await convertFormaliaToQuote({
      sessionId: session.session_id,
      graph: targetGraph
    });

    setIsExpanded(false);
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

  return (
    <section
      id="formalia"
      className={`w-full ${isStandalonePage ? 'py-10 lg:py-14' : 'py-20 lg:py-24'} bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Encabezado de Sección */}
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
            </div>

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
          <div className={`flex flex-col md:flex-row ${isExpanded ? 'flex-1 min-h-0' : 'md:h-[650px]'}`}>
            
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
                maxTurns={session.max_turns || 15}
                isExtracting={isExtracting}
                errorMessage={errorMsg}
                onSendMessage={handleSendMessage}
                onResetSession={handleResetSession}
                onLoadExample={handleLoadExample}
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
                onApplyToQuote={handleApplyToQuote}
                onRecordArtifact={handleRecordArtifact}
                onRestoreVersion={handleRestoreVersion}
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
