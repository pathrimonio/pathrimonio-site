import React, { useState } from 'react';
import { exportStoriesToCSV, exportStoriesToJiraJSON } from '../../utils/exportUtils';
import confetti from 'canvas-confetti';

export default function ControlsBar({ 
  stories, 
  activeModule, 
  setActiveModule,
  onNotify,
  activeProject,
  onNavigateToActors,
  actorsCount = 0,
  onOpenCreateModal
}) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const modules = [
    { id: "Todos", label: "All Modules" },
    { id: "Autenticación & KYC", label: "Autenticación & KYC" },
    { id: "Gestión de Crédito", label: "Gestión de Crédito" },
    { id: "Pasarela de Pagos", label: "Pasarela de Pagos" },
    { id: "Reportes de Impacto", label: "Reportes de Impacto" }
  ];

  // Calculate counts per module
  const getModuleCount = (modId) => {
    if (modId === "Todos") return stories.length;
    return stories.filter(s => s.module === modId).length;
  };

  // Progress metrics calculation
  const approvedCount = stories.filter(s => s.status.toLowerCase().includes("aprobado") || s.status.toLowerCase().includes("approved")).length;
  const totalCount = stories.length;
  const progressPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  const handleExportCSV = () => {
    setExportMenuOpen(false);
    exportStoriesToCSV(stories);
    onNotify?.("Historias exportadas a formato CSV con éxito.");
  };

  const handleExportJira = () => {
    setExportMenuOpen(false);
    exportStoriesToJiraJSON(stories);
    onNotify?.("Historias exportadas en formato Jira JSON con éxito.");
  };

  const handleSubmitAll = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 }
    });
    onNotify?.(`¡${stories.length} historias enviadas al equipo de desarrollo para estimación de Sprint 14!`);
  };

  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-3 sm:px-4 lg:px-5 py-4">
      <div className="w-full flex flex-col gap-y-4">
        
        {/* Top Title & Project Macro Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0">
              <span className="material-symbols-outlined text-[22px] fill">
                {activeProject?.icon || 'folder_special'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2.5 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  Historias de Usuario
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium tracking-wide">
                  {activeProject?.status || 'Sprint Planning'}
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5 truncate">
                {activeProject?.subtitle || activeProject?.description || 'Portal de requerimientos y desarrollo de software'}
              </p>
            </div>
          </div>

          {/* Progress Widget & Primary Action CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Progress Widget */}
            <div className="flex items-center gap-x-2.5 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded">
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-x-4">
                  <span className="font-space text-[11px] text-on-surface-variant uppercase tracking-wider">
                    Progreso
                  </span>
                  <span className="font-space text-[11px] font-semibold text-primary font-mono">
                    {approvedCount} / {totalCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-28 sm:w-32 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(245,166,35,0.7)] transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="h-8 px-3 rounded bg-surface-container-low border border-outline-variant text-white hover:bg-surface-container-high transition-colors font-space text-xs font-medium flex items-center gap-x-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">file_download</span>
                <span>Exportar</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-surface-container-high border border-outline-variant rounded shadow-xl py-1 z-30">
                  <button 
                    onClick={handleExportCSV}
                    className="w-full px-3 py-2 text-left font-space text-xs text-white hover:bg-surface-container hover:text-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">table_view</span>
                    <span>Descargar CSV</span>
                  </button>
                  <button 
                    onClick={handleExportJira}
                    className="w-full px-3 py-2 text-left font-space text-xs text-white hover:bg-surface-container hover:text-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">integration_instructions</span>
                    <span>Descargar Jira JSON</span>
                  </button>
                </div>
              )}
            </div>

            {/* Actores & Roles Navigation Button */}
            {onNavigateToActors && (
              <button 
                onClick={onNavigateToActors}
                className="h-8 px-3 rounded bg-surface-container-low border border-outline-variant hover:border-primary/50 text-white font-space text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Gestionar roles y actores del negocio antes de crear historias"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
                <span>Actores & Roles {actorsCount > 0 ? `(${actorsCount})` : ''}</span>
              </button>
            )}

            {/* Crear Historia Modal Trigger */}
            {onOpenCreateModal && (
              <button 
                onClick={onOpenCreateModal}
                className="h-8 px-3.5 rounded bg-primary text-on-primary hover:bg-[#e09419] transition-all font-space text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,166,35,0.25)] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Crear Historia</span>
              </button>
            )}

            {/* Submit All to Dev Team Button */}
            <button 
              onClick={handleSubmitAll}
              className="h-8 px-3.5 rounded bg-primary text-on-primary hover:bg-[#e09419] transition-all font-space text-xs font-semibold flex items-center gap-x-1.5 shadow-[0_0_12px_rgba(245,166,35,0.25)] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Submit All to Dev</span>
            </button>
          </div>
        </div>

        {/* Module Filter Horizontal Scroller */}
        <div className="flex items-center justify-between gap-x-4 pt-1">
          <div className="flex items-center gap-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {modules.map((m) => {
              const isSelected = activeModule === m.id;
              const count = getModuleCount(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id)}
                  className={`px-3 py-1 rounded font-space text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-on-primary font-semibold shadow-[0_0_8px_rgba(245,166,35,0.3)]'
                      : 'bg-surface-container-low border border-outline-variant hover:border-primary/40 text-on-surface-variant hover:text-white'
                  }`}
                >
                  <span>{m.label}</span>
                  <span className={`px-1 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-x-2 text-on-surface-variant font-space text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(245,166,35,0.8)]"></span>
            <span>Colaboración en tiempo real activa (5 analistas)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
