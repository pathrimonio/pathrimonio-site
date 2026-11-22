import React from 'react';
import confetti from 'canvas-confetti';

export default function ActorsControlsBar({
  actors = [],
  stories = [],
  activeProject,
  onNotify,
  onNavigateToStories,
  onOpenCreateModal
}) {
  const totalActors = actors.length;

  // Unique system areas covered
  const coveredAreas = new Set();
  actors.forEach(a => {
    (a.systemAreas || []).forEach(area => coveredAreas.add(area));
  });
  const totalAreasCovered = coveredAreas.size;

  // Unique business users assigned to roles (email first, name as fallback)
  const collaboratorKeys = new Set();
  actors.forEach(a => {
    const key = (a.assignedWorker || a.assignedWorkerName || '').trim().toLowerCase();
    if (key) collaboratorKeys.add(key);
  });
  const collaboratorsCount = collaboratorKeys.size;

  // Stories linked to any actor
  const storiesLinkedCount = stories.filter(s => 
    actors.some(a => a.name.toLowerCase() === (s.role || '').toLowerCase())
  ).length;

  // Export Matrix JSON
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(actors, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `matriz_actores_${activeProject?.id || 'proyecto'}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onNotify?.("Matriz de actores y roles exportada en formato JSON.");
    } catch (_) {
      onNotify?.("Error al exportar la matriz de roles.");
    }
  };

  const handleCelebrateCoverage = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.3 }
    });
    onNotify?.(`¡Matriz de actores validada con ${totalActors} roles cubriendo ${totalAreasCovered} áreas clave para ${activeProject?.name}!`);
  };

  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-[1520px] mx-auto flex flex-col gap-y-4">
        
        {/* Top Title & Macro Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2.5 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  Actores & Roles del Negocio — {activeProject ? activeProject.name : 'Pathrimonio'}
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium tracking-wide">
                  Formalización de Requerimientos
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5 truncate max-w-xl">
                Define quiénes interactúan con el software, sus responsabilidades y permisos por área antes de formular Historias de Usuario.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Metric 1: Actores */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Actores</span>
                <span className="font-mono text-xs font-bold text-white">{totalActors} Registrados</span>
              </div>
            </div>

            {/* Metric 2: Áreas cubiertas */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-secondary">domain_verification</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Áreas con Permiso</span>
                <span className="font-mono text-xs font-bold text-white">{totalAreasCovered} Áreas</span>
              </div>
            </div>

            {/* Metric 3: Colaboradores */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-tertiary">share</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Colaboradores</span>
                <span className="font-mono text-xs font-bold text-white">{collaboratorsCount} Usuarios</span>
              </div>
            </div>

            {/* Metric 4: HU vinculadas */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">task_alt</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">HU Vinculadas</span>
                <span className="font-mono text-xs font-bold text-white">{storiesLinkedCount} Historias</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-outline-variant/40">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[16px]">info</span>
            <span>
              Los roles registrados aparecen automáticamente en el <strong>Combobox</strong> de redacción de Historias de Usuario.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Registrar Actor Modal Trigger */}
            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold shadow-[0_0_12px_rgba(245,166,35,0.25)] active:scale-[0.98] transition-all"
                title="Registrar nuevo rol o actor del negocio"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Registrar Actor</span>
              </button>
            )}

            {/* Ir a Historias de Usuario */}
            {onNavigateToStories && (
              <button
                onClick={onNavigateToStories}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium transition-colors"
                title="Ir a redactar Historias de Usuario"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">view_kanban</span>
                <span>Redactar HU con estos Roles</span>
              </button>
            )}

            {/* Validar Cobertura */}
            <button
              onClick={handleCelebrateCoverage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium transition-colors"
              title="Validar cobertura de roles del negocio"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
              <span>Validar Cobertura</span>
            </button>

            {/* Exportar Matriz JSON */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-space text-xs font-semibold transition-colors"
              title="Descargar matriz en JSON"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Exportar Matriz (.json)</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
