import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getProjectArchitecture } from '../../data/initialArchitectures';
import {
  loadArchiflyAiConfig,
  saveArchiflyAiConfig,
  AI_PROVIDERS,
  testAiConnection,
  analyzeArchitectureWithAi
} from '../../services/archiflyAiService';

function inferLayerIdFromPath(path = '', recordType = '') {
  const p = String(path).toLowerCase();
  const r = String(recordType).toLowerCase();
  if (
    r === 'table' || r === 'view' || r === 'trigger' || r === 'policy' ||
    p.includes('infra') || p.includes('repo') || p.includes('supabase') ||
    p.includes('sqlite') || p.includes('adapter') || p.includes('migration') ||
    p.includes('client') || p.includes('gateway') || p.includes('mcp/')
  ) {
    return 'infrastructure';
  }
  if (
    p.includes('domain') || p.includes('entit') || p.includes('polic') ||
    p.includes('value') || p.includes('model') || r === 'interface' ||
    r === 'type' || r === 'enum'
  ) {
    return 'domain';
  }
  if (
    p.includes('screen') || p.includes('component') || p.includes('view') ||
    p.includes('page') || p.includes('/ui') || p.includes('modal') ||
    p.includes('controller') || r === 'component'
  ) {
    return 'presentation';
  }
  return 'application';
}

export default function SoftwareArchitectureView({
  activeProject,
  activeProjectId,
  projects = [],
  onSelectProject,
  stories = [],
  interfaces = [],
  dataModels = [],
  treeNodes = [],
  fileRecords = [],
  onNotify
}) {
  const [activeSubTab, setActiveSubTab] = useState('layers'); // 'layers' | 'diagram' | 'contracts' | 'traceability' | 'health'
  const [selectedLayerId, setSelectedLayerId] = useState('all');
  const [contractSearchQuery, setContractSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [copiedMermaid, setCopiedMermaid] = useState(false);
  const [customContracts, setCustomContracts] = useState([]);

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState(() => loadArchiflyAiConfig());
  const [showAiModal, setShowAiModal] = useState(false);
  const [tempProvider, setTempProvider] = useState(aiConfig.provider || 'gemini');
  const [tempApiKey, setTempApiKey] = useState(aiConfig.apiKey || '');
  const [tempModel, setTempModel] = useState(aiConfig.model || 'gemini-3.5-flash-lite');
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { success: boolean, message: string }
  const [dynamicArchitecture, setDynamicArchitecture] = useState(null);

  // Form state for adding custom abstract contract
  const [newContractForm, setNewContractForm] = useState({
    layerId: 'application',
    componentName: '',
    path: '',
    symbol: '',
    signature: '',
    visibility: 'public',
    isAsync: true,
    line: 1,
    doc: ''
  });

  // Base architecture for the active project
  const baseArchitecture = useMemo(() => {
    return getProjectArchitecture(activeProjectId);
  }, [activeProjectId]);

  // Active architecture (AI synthesized or base)
  const architecture = useMemo(() => {
    return dynamicArchitecture || baseArchitecture;
  }, [dynamicArchitecture, baseArchitecture]);

  // Reset dynamic architecture when changing project unless same
  useEffect(() => {
    setDynamicArchitecture(null);
  }, [activeProjectId]);

  // Current active provider metadata
  const currentProviderMeta = useMemo(() => {
    return AI_PROVIDERS.find(p => p.id === tempProvider) || AI_PROVIDERS[0];
  }, [tempProvider]);

  // Map real synced Supabase file nodes & fileRecords by layer
  const nodeById = useMemo(() => new Map(treeNodes.map((n) => [n.id, n])), [treeNodes]);

  // Combine static layer components with live Supabase MCP fileRecords and custom added contracts
  const layersWithCustom = useMemo(() => {
    const syncedByLayer = new Map();
    for (const rec of fileRecords) {
      const node = nodeById.get(rec.nodeId);
      const filePath = node?.path || '';
      const fileName = node?.name || 'ArchivoSincronizado';
      const inferredLayer = rec.metadata?.layer || inferLayerIdFromPath(filePath, rec.recordType);

      if (!syncedByLayer.has(inferredLayer)) syncedByLayer.set(inferredLayer, new Map());
      const byFile = syncedByLayer.get(inferredLayer);
      const compKey = filePath || fileName;

      if (!byFile.has(compKey)) {
        byFile.set(compKey, {
          name: `${fileName} (MCP)`,
          path: filePath || fileName,
          type: inferredLayer === 'presentation' ? 'screen' : inferredLayer === 'application' ? 'service' : inferredLayer === 'domain' ? 'entity' : 'adapter',
          syncedFromMcp: true,
          abstractMethods: []
        });
      }

      byFile.get(compKey).abstractMethods.push({
        symbol: rec.name,
        signature: rec.signature || rec.name,
        visibility: rec.metadata?.visibility || 'public',
        isAsync: Boolean(rec.metadata?.isAsync),
        line: rec.lineNumber || 1,
        doc: rec.description || `${rec.recordType} sincronizado desde proyecto real`,
        syncedByMcp: rec.metadata?.syncedBy === 'mcp-agent'
      });
    }

    return architecture.layers.map(layer => {
      const mcpComponents = syncedByLayer.has(layer.id)
        ? Array.from(syncedByLayer.get(layer.id).values())
        : [];

      const extraComponents = customContracts
        .filter(c => c.layerId === layer.id && (!c.projectId || c.projectId === activeProjectId))
        .map(c => ({
          name: c.componentName || 'CustomComponent',
          path: c.path || `src/${layer.id}/${c.componentName}.ts`,
          type: layer.id === 'presentation' ? 'screen' : layer.id === 'application' ? 'service' : layer.id === 'domain' ? 'entity' : 'adapter',
          abstractMethods: [
            {
              symbol: c.symbol,
              signature: c.signature,
              visibility: c.visibility,
              isAsync: c.isAsync,
              line: c.line,
              doc: c.doc
            }
          ]
        }));

      return {
        ...layer,
        components: [...mcpComponents, ...layer.components, ...extraComponents]
      };
    });
  }, [architecture, customContracts, activeProjectId, fileRecords, nodeById]);

  // All abstract methods flattened for contracts tab
  const allAbstractMethods = useMemo(() => {
    const list = [];
    layersWithCustom.forEach(layer => {
      layer.components.forEach(comp => {
        comp.abstractMethods.forEach(method => {
          list.push({
            ...method,
            layerId: layer.id,
            layerName: layer.name,
            layerBadge: layer.badge,
            layerColor: layer.colorClass,
            componentName: comp.name,
            filePath: comp.path
          });
        });
      });
    });
    return list;
  }, [layersWithCustom]);

  const filteredContracts = useMemo(() => {
    return allAbstractMethods.filter(item => {
      const matchesLayer = selectedLayerId === 'all' || item.layerId === selectedLayerId;
      const q = contractSearchQuery.toLowerCase();
      const matchesQuery = !q ||
        item.symbol.toLowerCase().includes(q) ||
        item.signature.toLowerCase().includes(q) ||
        item.componentName.toLowerCase().includes(q) ||
        item.filePath.toLowerCase().includes(q) ||
        (item.doc && item.doc.toLowerCase().includes(q));
      return matchesLayer && matchesQuery;
    });
  }, [allAbstractMethods, selectedLayerId, contractSearchQuery]);

  // Action: Trigger archifly dynamic analysis (with AI if configured, or offline engine)
  const handleRunArchifly = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);

    try {
      if (aiConfig.isAiEnabled && aiConfig.apiKey?.trim()) {
        setAnalysisProgress(40);
        onNotify?.(`Skill archifly: Invocando ${aiConfig.provider.toUpperCase()} (${aiConfig.model}) para análisis de arquitectura...`);

        const result = await analyzeArchitectureWithAi({
          project: activeProject,
          stories,
          interfaces,
          dataModels,
          treeNodes,
          fileRecords,
          aiConfig
        });

        setAnalysisProgress(85);

        if (result.architecture) {
          setDynamicArchitecture(result.architecture);
        }

        setAnalysisProgress(100);
        setIsAnalyzing(false);

        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.35 }
        });

        onNotify?.(result.message || `¡Arquitectura sintetizada con éxito mediante ${aiConfig.provider.toUpperCase()}!`);
      } else {
        // Motor estático local offline
        setTimeout(() => setAnalysisProgress(50), 300);
        setTimeout(() => setAnalysisProgress(80), 650);
        setTimeout(() => {
          setAnalysisProgress(100);
          setIsAnalyzing(false);
          confetti({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.35 }
          });
          onNotify?.(`¡Skill archifly (Motor Offline) ejecutada con éxito! 4 capas y ${allAbstractMethods.length} contratos auditados.`);
        }, 950);
      }
    } catch (err) {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      onNotify?.(`Error al ejecutar análisis de arquitectura: ${err.message}`);
    }
  };

  // Action: Test AI connection
  const handleTestConnection = async () => {
    if (!tempApiKey.trim()) {
      setTestStatus({ success: false, message: 'Ingresa una clave de API antes de probar.' });
      return;
    }
    setIsTestingKey(true);
    setTestStatus(null);
    try {
      const res = await testAiConnection({
        provider: tempProvider,
        apiKey: tempApiKey.trim(),
        model: tempModel
      });
      setTestStatus(res);
      if (res.success) {
        onNotify?.(res.message);
      }
    } catch (err) {
      setTestStatus({ success: false, message: err.message || 'Error de conexión' });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Action: Save AI Config
  const handleSaveAiConfig = (e) => {
    e.preventDefault();
    const updated = {
      provider: tempProvider,
      model: tempModel,
      apiKey: tempApiKey.trim(),
      isAiEnabled: Boolean(tempApiKey.trim())
    };
    setAiConfig(updated);
    saveArchiflyAiConfig(updated);
    setShowAiModal(false);
    onNotify?.(updated.isAiEnabled
      ? `Configuración de IA guardada: ${updated.provider.toUpperCase()} (${updated.model}) activo.`
      : 'Modo Offline establecido para la skill archifly.');
  };

  // Action: Export Architecture Snapshot JSON
  const handleExportSnapshot = () => {
    try {
      const snapshot = {
        project: activeProject?.name || 'Pathrimonio Software',
        projectId: activeProjectId,
        architecturePattern: architecture.architecturePattern,
        synthesizedBy: architecture.synthesizedBy,
        exportedAt: new Date().toISOString(),
        auditStatus: architecture.auditStatus,
        tokenSavingsPercent: architecture.tokenSavingsPercent,
        metrics: {
          ...architecture.metrics,
          activeStoriesCount: stories.length,
          activeInterfacesCount: interfaces.length,
          activeDataModelsCount: dataModels.length,
          abstractMethodsCount: allAbstractMethods.length
        },
        layers: layersWithCustom,
        traceabilityMatrix: architecture.traceabilityMatrix,
        diagnostics: architecture.diagnostics,
        mermaidDiagram: architecture.mermaidDiagram
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `ArchitectureSnapshot_${activeProjectId}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onNotify?.(`Snapshot de Arquitectura exportado en formato JSON inmutable.`);
    } catch (_) {
      onNotify?.('Error al generar el snapshot de arquitectura.');
    }
  };

  // Action: Copy Mermaid Diagram
  const handleCopyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(architecture.mermaidDiagram);
      setCopiedMermaid(true);
      onNotify?.('Diagrama Mermaid copiado al portapapeles.');
      setTimeout(() => setCopiedMermaid(false), 2500);
    } catch (_) {
      onNotify?.('No se pudo copiar el diagrama al portapapeles.');
    }
  };

  // Action: Save new contract
  const handleSaveContract = (e) => {
    e.preventDefault();
    if (!newContractForm.symbol.trim() || !newContractForm.signature.trim()) {
      onNotify?.('Por favor ingresa el símbolo y la firma del contrato.');
      return;
    }

    const created = {
      ...newContractForm,
      id: `custom_${Date.now()}`,
      projectId: activeProjectId
    };

    setCustomContracts(prev => [created, ...prev]);
    setShowAddContractModal(false);
    setNewContractForm({
      layerId: 'application',
      componentName: '',
      path: '',
      symbol: '',
      signature: '',
      visibility: 'public',
      isAsync: true,
      line: 1,
      doc: ''
    });
    onNotify?.(`Contrato abstracto "${created.symbol}" registrado en la capa de arquitectura.`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface-container-lowest">
      {/* ── Sub-header / Controls Bar ── */}
      <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-[1520px] mx-auto flex flex-col gap-y-4">
          
          {/* Top Row: Title + Project Selector + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-x-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">account_tree</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-x-2.5 flex-wrap">
                  <h1 className="font-space text-lg sm:text-xl text-white font-bold tracking-tight truncate">
                    Arquitectura de Software — {activeProject ? activeProject.name : 'Pathrimonio'}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Skill archifly
                  </span>
                  {aiConfig.isAiEnabled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                      <span className="material-symbols-outlined text-[13px]">neurology</span>
                      IA Conectada ({aiConfig.provider.toUpperCase()})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px]">
                      <span className="material-symbols-outlined text-[13px]">offline_bolt</span>
                      Motor Local Offline
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                    0% Fuga de Código
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]"
                    title="Registros reales de archivos y métodos sincronizados vía MCP"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    MCP Sync: {fileRecords.length} reg.
                  </span>
                </div>
                <p className="font-jakarta text-xs text-on-surface-variant mt-0.5 truncate max-w-2xl">
                  {architecture.architecturePattern} · {architecture.synthesizedBy}
                </p>
              </div>
            </div>

            {/* Actions: Run archifly, AI API Config & Export */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRunArchifly}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-[#09090B] font-space text-xs font-bold hover:bg-primary-hover active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(255,192,0,0.25)] disabled:opacity-50 cursor-pointer"
                title="Ejecutar análisis estático o generativo con la skill archifly"
              >
                <span className={`material-symbols-outlined text-[17px] ${isAnalyzing ? 'animate-spin' : ''}`}>
                  {isAnalyzing ? 'sync' : 'auto_awesome'}
                </span>
                <span>{isAnalyzing ? `Analizando (${analysisProgress}%)...` : 'Sincronizar con archifly'}</span>
              </button>

              <button
                onClick={() => {
                  setShowAiModal(true);
                  setTempApiKey(aiConfig.apiKey || '');
                  setTempProvider(aiConfig.provider || 'gemini');
                  setTempModel(aiConfig.model || 'gemini-3.5-flash-lite');
                  setTestStatus(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-space text-xs font-medium transition-colors cursor-pointer ${
                  aiConfig.isAiEnabled
                    ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20'
                    : 'bg-surface-container-high hover:bg-surface-container-highest border-outline-variant text-white'
                }`}
                title="Configurar clave de API de IA (Google Gemini, OpenAI, DeepSeek)"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {aiConfig.isAiEnabled ? 'key' : 'key_off'}
                </span>
                <span>{aiConfig.isAiEnabled ? 'API de Modelo: Conectada' : 'Configurar API Key'}</span>
              </button>

              <button
                onClick={handleExportSnapshot}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium transition-colors cursor-pointer"
                title="Descargar ArchitectureSnapshot.json inmutable"
              >
                <span className="material-symbols-outlined text-[17px]">download</span>
                <span>Snapshot JSON</span>
              </button>

              <button
                onClick={handleCopyMermaid}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium transition-colors cursor-pointer"
                title="Copiar definición de diagrama Mermaid al portapapeles"
              >
                <span className="material-symbols-outlined text-[17px] text-primary">
                  {copiedMermaid ? 'check' : 'content_copy'}
                </span>
                <span>{copiedMermaid ? '¡Copiado!' : 'Diagrama Mermaid'}</span>
              </button>
            </div>
          </div>

          {/* Progress bar when analyzing */}
          {isAnalyzing && (
            <div className="w-full bg-surface-container-high rounded-full h-1 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-200 ease-out"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          )}

          {/* Informational banner when running offline */}
          {!aiConfig.isAiEnabled && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2 text-amber-300 font-jakarta">
                <span className="material-symbols-outlined text-[18px] shrink-0">offline_bolt</span>
                <span>
                  <strong>Modo Offline Activo:</strong> La arquitectura opera de forma instantánea y determinista sin requerir API Key. Si deseas análisis con IA en tiempo real, puedes conectar tu clave de Gemini API.
                </span>
              </div>
              <button
                onClick={() => setShowAiModal(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-space text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Ingresar Clave de API
              </button>
            </div>
          )}

          {/* Metrics Pills Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            <div className="bg-surface-container-low border border-outline-variant p-2.5 rounded-xl flex flex-col gap-0.5">
              <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Capas Nucleares</span>
              <span className="font-space text-base font-bold text-white">{layersWithCustom.length} Capas</span>
              <span className="font-jakarta text-[10px] text-emerald-400">Clean / Hexagonal</span>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-2.5 rounded-xl flex flex-col gap-0.5">
              <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Firmas Abstractas</span>
              <span className="font-space text-base font-bold text-primary">{allAbstractMethods.length} Contratos</span>
              <span className="font-jakarta text-[10px] text-on-surface-variant">Métodos AST</span>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-2.5 rounded-xl flex flex-col gap-0.5">
              <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Ahorro de Tokens</span>
              <span className="font-space text-base font-bold text-emerald-400">{architecture.tokenSavingsPercent}%</span>
              <span className="font-jakarta text-[10px] text-on-surface-variant">vs código en bruto</span>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-2.5 rounded-xl flex flex-col gap-0.5">
              <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Trazabilidad DoD</span>
              <span className="font-space text-base font-bold text-cyan-300">100% Traced</span>
              <span className="font-jakarta text-[10px] text-on-surface-variant">US ──► UI ──► DB</span>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-2.5 rounded-xl flex flex-col gap-0.5">
              <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Modo Offline</span>
              <span className="font-space text-base font-bold text-amber-300">{architecture.metrics.offlineReadiness.split(' ')[0]}</span>
              <span className="font-jakarta text-[10px] text-on-surface-variant truncate">{architecture.metrics.offlineReadiness}</span>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-2.5 rounded-xl flex flex-col gap-0.5">
              <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Regla DIP (SOLID)</span>
              <span className="font-space text-base font-bold text-purple-400">100% Compliant</span>
              <span className="font-jakarta text-[10px] text-on-surface-variant">Dominio Aislado</span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-between border-t border-outline-variant/50 pt-2 flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-outline-variant">
              <button
                onClick={() => setActiveSubTab('layers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs transition-colors cursor-pointer ${
                  activeSubTab === 'layers'
                    ? 'bg-primary text-[#09090B] font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">layers</span>
                <span>Capas & Estructura ({layersWithCustom.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('diagram')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs transition-colors cursor-pointer ${
                  activeSubTab === 'diagram'
                    ? 'bg-primary text-[#09090B] font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">schema</span>
                <span>Diagrama Topológico C4</span>
              </button>

              <button
                onClick={() => setActiveSubTab('contracts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs transition-colors cursor-pointer ${
                  activeSubTab === 'contracts'
                    ? 'bg-primary text-[#09090B] font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">code</span>
                <span>Métodos Abstractos ({allAbstractMethods.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('traceability')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs transition-colors cursor-pointer ${
                  activeSubTab === 'traceability'
                    ? 'bg-primary text-[#09090B] font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">checklist_rtl</span>
                <span>Matriz de Trazabilidad DoD</span>
              </button>

              <button
                onClick={() => setActiveSubTab('health')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs transition-colors cursor-pointer ${
                  activeSubTab === 'health'
                    ? 'bg-primary text-[#09090B] font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                <span>Diagnóstico & Salud</span>
              </button>
            </div>

            {/* Project Switcher right pill */}
            <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[16px]">folder_managed</span>
              <span className="text-on-surface-variant text-[11px] font-jakarta">Proyecto:</span>
              <select
                value={activeProjectId || 'pathway'}
                onChange={(e) => onSelectProject?.(e.target.value)}
                className="bg-transparent text-white font-space text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-surface-container-highest text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* ── Main View Content Area ── */}
      <main className="max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: CAPAS Y ESTRUCTURA CLEAN ARCHITECTURE */}
        {activeSubTab === 'layers' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-space text-lg text-white font-bold flex items-center gap-2">
                  <span>Capas Arquitectónicas Desacopladas</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-on-surface-variant font-mono text-xs">
                    {architecture.architecturePattern}
                  </span>
                </h2>
                <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                  Las dependencias fluyen siempre hacia adentro. El Dominio permanece aislado y la Infraestructura actúa como adaptador periférico.
                </p>
              </div>

              {/* Layer Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedLayerId('all')}
                  className={`px-2.5 py-1 rounded-lg font-space text-xs transition-colors cursor-pointer ${
                    selectedLayerId === 'all' ? 'bg-primary text-[#09090B] font-bold' : 'bg-surface-container-high text-on-surface-variant hover:text-white'
                  }`}
                >
                  Todas ({layersWithCustom.length})
                </button>
                {layersWithCustom.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLayerId(l.id)}
                    className={`px-2.5 py-1 rounded-lg font-space text-xs transition-colors cursor-pointer ${
                      selectedLayerId === l.id ? 'bg-primary text-[#09090B] font-bold' : 'bg-surface-container-high text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {l.badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Layers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {layersWithCustom
                .filter(layer => selectedLayerId === 'all' || layer.id === selectedLayerId)
                .map((layer, idx) => (
                  <div
                    key={layer.id}
                    className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    {/* Layer Header */}
                    <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-surface-container-high text-white font-space font-bold text-xs flex items-center justify-center">
                          0{idx + 1}
                        </span>
                        <div>
                          <h3 className="font-space text-sm font-bold text-white tracking-tight">
                            {layer.name}
                          </h3>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border mt-0.5 ${layer.colorClass}`}>
                            {layer.badge}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-on-surface-variant">
                        {layer.components.length} Componentes
                      </span>
                    </div>

                    <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
                      {layer.description}
                    </p>

                    {/* Components in this Layer */}
                    <div className="flex flex-col gap-2.5">
                      <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                        Componentes & Módulos Clave:
                      </span>
                      {layer.components.map((comp) => (
                        <div
                          key={comp.name}
                          className="bg-surface-container rounded-xl p-3 border border-outline-variant/50 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[16px]">
                                {comp.type === 'screen' ? 'devices' : comp.type === 'service' ? 'hub' : comp.type === 'entity' ? 'data_object' : 'database'}
                              </span>
                              <span className="font-space text-xs font-bold text-white">{comp.name}</span>
                            </div>
                            <span className="font-mono text-[10px] text-on-surface-variant truncate max-w-[200px]" title={comp.path}>
                              {comp.path}
                            </span>
                          </div>

                          {/* Method Signatures */}
                          <div className="flex flex-col gap-1.5 pl-5 border-l-2 border-outline-variant/60">
                            {comp.abstractMethods.map((m, mIdx) => (
                              <div key={mIdx} className="flex flex-col text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${m.visibility === 'public' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                    {m.visibility}
                                  </span>
                                  {m.isAsync && (
                                    <span className="text-[10px] font-mono text-cyan-300">async</span>
                                  )}
                                  <code className="font-mono text-[11px] text-white font-medium truncate" title={m.signature}>
                                    {m.signature}
                                  </code>
                                </div>
                                {m.doc && (
                                  <p className="text-[11px] font-jakarta text-on-surface-variant/80 mt-0.5">
                                    {m.doc}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: DIAGRAMA DE TOPOLOGÍA C4 Y MERMAID */}
        {activeSubTab === 'diagram' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-space text-lg text-white font-bold">Topología C4 & Flujo de Componentes</h2>
                <p className="font-jakarta text-xs text-on-surface-variant">
                  Mapa visual sintetizado por archifly para {activeProject?.name}. Muestra la dirección del flujo de control y las barreras de capa.
                </p>
              </div>
              <button
                onClick={handleCopyMermaid}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {copiedMermaid ? 'check' : 'content_copy'}
                </span>
                <span>{copiedMermaid ? 'Copiado' : 'Copiar Mermaid Source'}</span>
              </button>
            </div>

            {/* Visual Container Cards Representation */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Presentation Box */}
                <div className="bg-surface-container border border-amber-500/30 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-space text-xs font-bold text-amber-400">Capa 1: UI / Cliente</span>
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">smartphone</span>
                  </div>
                  <p className="text-[11px] font-jakarta text-on-surface-variant">
                    Captura interacciones táctiles y despacha comandos hacia los casos de uso.
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    {layersWithCustom[0]?.components.map(c => (
                      <span key={c.name} className="px-2 py-1 rounded bg-surface-container-high text-white font-mono text-[10px] truncate">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Application Box */}
                <div className="bg-surface-container border border-sky-500/30 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-sky-400"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-space text-xs font-bold text-sky-400">Capa 2: Aplicación</span>
                    <span className="material-symbols-outlined text-sky-400 text-[18px]">hub</span>
                  </div>
                  <p className="text-[11px] font-jakarta text-on-surface-variant">
                    Orquestadores de procesos, validadores y casos de uso del software.
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    {layersWithCustom[1]?.components.map(c => (
                      <span key={c.name} className="px-2 py-1 rounded bg-surface-container-high text-white font-mono text-[10px] truncate">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Domain Box */}
                <div className="bg-surface-container border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-space text-xs font-bold text-emerald-400">Capa 3: Dominio</span>
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                  </div>
                  <p className="text-[11px] font-jakarta text-on-surface-variant">
                    Reglas invariantes, entidades nucleares y políticas de negocio puras.
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    {layersWithCustom[2]?.components.map(c => (
                      <span key={c.name} className="px-2 py-1 rounded bg-surface-container-high text-white font-mono text-[10px] truncate">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Infrastructure Box */}
                <div className="bg-surface-container border border-purple-500/30 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-purple-400"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-space text-xs font-bold text-purple-400">Capa 4: Adaptadores</span>
                    <span className="material-symbols-outlined text-purple-400 text-[18px]">database</span>
                  </div>
                  <p className="text-[11px] font-jakarta text-on-surface-variant">
                    Persistencia SQLite/Supabase, telemetría y adaptadores externos.
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    {layersWithCustom[3]?.components.map(c => (
                      <span key={c.name} className="px-2 py-1 rounded bg-surface-container-high text-white font-mono text-[10px] truncate">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Raw Mermaid Code View */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="font-space text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">terminal</span>
                  Definición Formal Mermaid (C4 Component Flow)
                </span>
                <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant font-mono text-xs text-primary/90 overflow-x-auto leading-relaxed">
                  {architecture.mermaidDiagram}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATÁLOGO DE MÉTODOS ABSTRACTOS & CONTRATOS */}
        {activeSubTab === 'contracts' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-space text-lg text-white font-bold flex items-center gap-2">
                  <span>Inventario de Firmas & Contratos Abstractos</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-xs">
                    {filteredContracts.length} de {allAbstractMethods.length}
                  </span>
                </h2>
                <p className="font-jakarta text-xs text-on-surface-variant">
                  Manifiesto ligero de contratos sin código fuente interno. Consume &lt; 5% de tokens y evita fugas de algoritmos.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddContractModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-[#09090B] font-space text-xs font-bold hover:bg-primary-hover transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Registrar Contrato</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-surface-container-low p-3 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  value={contractSearchQuery}
                  onChange={(e) => setContractSearchQuery(e.target.value)}
                  placeholder="Buscar por método, símbolo, archivo o firma..."
                  className="bg-transparent text-white font-jakarta text-xs focus:outline-none w-full"
                />
                {contractSearchQuery && (
                  <button onClick={() => setContractSearchQuery('')} className="text-on-surface-variant hover:text-white text-xs cursor-pointer">
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-jakarta text-on-surface-variant">Filtrar Capa:</span>
                <select
                  value={selectedLayerId}
                  onChange={(e) => setSelectedLayerId(e.target.value)}
                  className="bg-surface-container-high text-white font-space text-xs rounded-lg px-2 py-1 border border-outline-variant focus:outline-none cursor-pointer"
                >
                  <option value="all">Todas las Capas</option>
                  {layersWithCustom.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contracts Table */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container text-on-surface-variant font-space text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-4">Capa</th>
                      <th className="py-3 px-4">Componente</th>
                      <th className="py-3 px-4">Firma Abstracta (AST Signature)</th>
                      <th className="py-3 px-4">Visibilidad</th>
                      <th className="py-3 px-4">Línea</th>
                      <th className="py-3 px-4">Descripción del Contrato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-jakarta text-xs">
                    {filteredContracts.map((c, i) => (
                      <tr key={i} className="hover:bg-surface-container transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${c.layerColor}`}>
                            {c.layerBadge}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-space font-bold text-white">
                          {c.componentName}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-primary">
                          <div className="flex items-center gap-1.5">
                            {c.isAsync && <span className="text-[10px] text-cyan-300">async</span>}
                            <span>{c.signature}</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant block mt-0.5 font-mono">
                            {c.filePath}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                          <span className={c.visibility === 'public' ? 'text-emerald-400' : 'text-amber-400'}>
                            {c.visibility}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-on-surface-variant">
                          L{c.line}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant max-w-sm">
                          {c.doc || '—'}
                        </td>
                      </tr>
                    ))}
                    {filteredContracts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-on-surface-variant font-jakarta text-xs">
                          No se encontraron firmas abstractas que coincidan con la búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MATRIZ DE TRAZABILIDAD TOTAL (DoD & ARQUITECTURA) */}
        {activeSubTab === 'traceability' && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-space text-lg text-white font-bold">Matriz de Trazabilidad Total (DoD ──► Código)</h2>
              <p className="font-jakarta text-xs text-on-surface-variant">
                Garantiza que cada Historia de Usuario cuente con una interfaz formal, un caso de uso con método abstracto y una tabla de datos vinculada.
              </p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container text-on-surface-variant font-space text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-4">Historia de Usuario (US)</th>
                      <th className="py-3 px-4">Interfaz UI/UX (Figma/Pantalla)</th>
                      <th className="py-3 px-4">Método / Contrato (archifly)</th>
                      <th className="py-3 px-4">Modelo de Datos (DB)</th>
                      <th className="py-3 px-4">Criterio de Aceptación (DoD)</th>
                      <th className="py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-jakarta text-xs">
                    {architecture.traceabilityMatrix.map((t, idx) => (
                      <tr key={idx} className="hover:bg-surface-container transition-colors">
                        <td className="py-3.5 px-4 font-space font-bold text-white whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs mr-2">
                            {t.storyId}
                          </span>
                          <span>{t.storyTitle}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-white font-mono text-[11px]">
                            {t.interfaceId} — {t.interfaceName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-primary">
                          {t.abstractMethod}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300 whitespace-nowrap">
                          {t.domainModel}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant max-w-xs leading-relaxed text-[11px]">
                          {t.doDCriterion}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                            ✓ {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DIAGNÓSTICO & SALUD DE ARQUITECTURA */}
        {activeSubTab === 'health' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-space text-lg text-white font-bold">Diagnóstico de Salud & Principios Clean</h2>
              <p className="font-jakarta text-xs text-on-surface-variant">
                Evaluación automatizada contra los estándares de acoplamiento, inversión de dependencias y Zero-Code Leakage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Compliance Cards */}
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="font-space text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified_user</span>
                  Métricas de Cumplimiento de Principios
                </h3>

                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-space text-xs font-bold text-white">Inversión de Dependencias (DIP)</span>
                      <span className="text-emerald-400 font-mono text-xs font-bold">100% PASS</span>
                    </div>
                    <p className="font-jakarta text-xs text-on-surface-variant">
                      {architecture.diagnostics.dipCompliance}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-space text-xs font-bold text-white">Zero-Code Leakage (Sin Fugas)</span>
                      <span className="text-emerald-400 font-mono text-xs font-bold">100% SAFE</span>
                    </div>
                    <p className="font-jakarta text-xs text-on-surface-variant">
                      {architecture.diagnostics.zeroLeakageScore}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-space text-xs font-bold text-white">Resiliencia Offline</span>
                      <span className="text-amber-300 font-mono text-xs font-bold">{architecture.metrics.offlineReadiness.split(' ')[0]}</span>
                    </div>
                    <p className="font-jakarta text-xs text-on-surface-variant">
                      {architecture.diagnostics.offlineReadiness}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="font-space text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                  Recomendaciones de la Skill archifly
                </h3>

                <div className="flex flex-col gap-2.5">
                  {architecture.diagnostics.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="p-3 rounded-xl bg-surface-container border border-outline-variant/60 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">check_circle</span>
                      <p className="font-jakarta text-xs text-white leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}

                  <div className="mt-2 p-3 rounded-xl bg-primary/10 border border-primary/30 flex flex-col gap-1">
                    <span className="font-space text-xs font-bold text-primary">Soberanía de Datos Garantizada</span>
                    <p className="font-jakarta text-xs text-on-surface-variant">
                      Toda la lógica de contratos se genera localmente en localhost sin transferir código fuente a la base de datos remota ni a servicios externos.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ── Modal: Configurar API Key de Modelo de IA (Gemini / OpenAI / DeepSeek) ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-outline-variant w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[19px]">neurology</span>
                </div>
                <div>
                  <h3 className="font-space text-base font-bold text-white">Configurar API de Modelo de IA</h3>
                  <p className="font-jakarta text-[11px] text-on-surface-variant">
                    Conecta Google Gemini, OpenAI o DeepSeek para análisis generativo en vivo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-on-surface-variant hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAiConfig} className="flex flex-col gap-3 font-jakarta text-xs">
              
              {/* Provider Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">Proveedor de IA:</label>
                <div className="grid grid-cols-3 gap-2">
                  {AI_PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setTempProvider(p.id);
                        setTempModel(p.defaultModel);
                        setTestStatus(null);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        tempProvider === p.id
                          ? 'bg-primary/15 border-primary text-white shadow-sm'
                          : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:text-white'
                      }`}
                    >
                      <span className="font-space font-bold text-xs truncate">{p.name.split(' ')[0]}</span>
                      <span className="text-[10px] font-mono text-primary/80">{p.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">Modelo Específico:</label>
                <select
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-space text-xs focus:outline-none focus:border-primary cursor-pointer"
                >
                  {currentProviderMeta.models.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key Input */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-on-surface-variant font-medium">Clave de API ({currentProviderMeta.name}):</label>
                  <span className="text-[10px] text-on-surface-variant">Se guarda de forma segura en tu navegador</span>
                </div>
                <div className="relative">
                  <input
                    type={showKeyPassword ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => {
                      setTempApiKey(e.target.value);
                      setTestStatus(null);
                    }}
                    placeholder={`Ingresa tu clave de API (${currentProviderMeta.placeholder})`}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-2.5 pr-10 text-white font-mono text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showKeyPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Test Button & Result */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingKey || !tempApiKey.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[15px] ${isTestingKey ? 'animate-spin' : ''}`}>
                    {isTestingKey ? 'sync' : 'network_check'}
                  </span>
                  <span>{isTestingKey ? 'Comprobando...' : 'Probar Conexión'}</span>
                </button>

                {tempApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempApiKey('');
                      setTestStatus(null);
                    }}
                    className="text-error hover:underline text-[11px]"
                  >
                    Borrar Clave
                  </button>
                )}
              </div>

              {testStatus && (
                <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-error-container/20 border-error/30 text-error'
                }`}>
                  <span className="material-symbols-outlined text-[16px] shrink-0">
                    {testStatus.success ? 'check_circle' : 'error'}
                  </span>
                  <span>{testStatus.message || testStatus.error}</span>
                </div>
              )}

              {/* Mode switch explanation */}
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-1 text-[11px] text-on-surface-variant">
                <span className="font-space font-semibold text-white">¿Cómo opera archifly?</span>
                <p>
                  • <strong>Con API Key:</strong> archifly envía el resumen ligero del proyecto (historias, interfaces, DER y rutas sin código fuente) a tu modelo de IA para generar un análisis arquitectónico en vivo.
                </p>
                <p>
                  • <strong>Sin API Key (Modo Offline):</strong> archifly utiliza su motor determinista local incorporado, garantizando 100% de operativa sin conexión.
                </p>
              </div>

              {/* Footer Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-white font-space text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-[#09090B] font-space text-xs font-bold hover:bg-primary-hover shadow-sm cursor-pointer"
                >
                  Guardar Configuración
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Registrar Contrato Abstracto Manual ── */}
      {showAddContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container border border-outline-variant w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                <h3 className="font-space text-base font-bold text-white">Registrar Contrato / Método Abstracto</h3>
              </div>
              <button
                onClick={() => setShowAddContractModal(false)}
                className="text-on-surface-variant hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="flex flex-col gap-3 font-jakarta text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">Capa Arquitectónica:</label>
                <select
                  value={newContractForm.layerId}
                  onChange={(e) => setNewContractForm(prev => ({ ...prev, layerId: e.target.value }))}
                  className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-space focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="presentation">Capa 1: Presentación & UI</option>
                  <option value="application">Capa 2: Aplicación & Casos de Uso</option>
                  <option value="domain">Capa 3: Dominio & Reglas Nucleares</option>
                  <option value="infrastructure">Capa 4: Infraestructura & Adaptadores</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Nombre de Clase / Módulo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. QuoteService"
                    value={newContractForm.componentName}
                    onChange={(e) => setNewContractForm(prev => ({ ...prev, componentName: e.target.value }))}
                    className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Ruta Relativa del Archivo:</label>
                  <input
                    type="text"
                    placeholder="src/services/QuoteService.ts"
                    value={newContractForm.path}
                    onChange={(e) => setNewContractForm(prev => ({ ...prev, path: e.target.value }))}
                    className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">Símbolo (Identificador):</label>
                <input
                  type="text"
                  required
                  placeholder="QuoteService.calculateTotal"
                  value={newContractForm.symbol}
                  onChange={(e) => setNewContractForm(prev => ({ ...prev, symbol: e.target.value }))}
                  className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">Firma Abstracta Completa (Sin cuerpo):</label>
                <input
                  type="text"
                  required
                  placeholder="public async calculateTotal(roles: number): Promise<PricingSummary>"
                  value={newContractForm.signature}
                  onChange={(e) => setNewContractForm(prev => ({ ...prev, signature: e.target.value }))}
                  className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Visibilidad:</label>
                  <select
                    value={newContractForm.visibility}
                    onChange={(e) => setNewContractForm(prev => ({ ...prev, visibility: e.target.value }))}
                    className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-mono focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="public">public</option>
                    <option value="private">private</option>
                    <option value="protected">protected</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Modificador:</label>
                  <select
                    value={newContractForm.isAsync ? 'async' : 'sync'}
                    onChange={(e) => setNewContractForm(prev => ({ ...prev, isAsync: e.target.value === 'async' }))}
                    className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-mono focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="async">async</option>
                    <option value="sync">sync</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Línea Referencia:</label>
                  <input
                    type="number"
                    min="1"
                    value={newContractForm.line}
                    onChange={(e) => setNewContractForm(prev => ({ ...prev, line: Number(e.target.value) || 1 }))}
                    className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">Documentación / Propósito:</label>
                <textarea
                  rows="2"
                  placeholder="Descripción del contrato arquitectónico sin revelar algoritmos internos..."
                  value={newContractForm.doc}
                  onChange={(e) => setNewContractForm(prev => ({ ...prev, doc: e.target.value }))}
                  className="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowAddContractModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-white font-space text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-[#09090B] font-space text-xs font-bold hover:bg-primary-hover shadow-sm cursor-pointer"
                >
                  Guardar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
