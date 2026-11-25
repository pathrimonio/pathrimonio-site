import React from 'react';
import SectionInfoPopover from './SectionInfoPopover';
import BusinessAreasPopover from './BusinessAreasPopover';

export default function ActorsControlsBar({
  actors = [],
  stories = [],
  projectUsers = [],
  onManageUsers
}) {
  const totalActors = actors.length;

  // Unique system areas covered
  const coveredAreas = new Set();
  actors.forEach(a => {
    (a.systemAreas || []).forEach(area => coveredAreas.add(area));
  });
  const totalAreasCovered = coveredAreas.size;

  // Real portal users with access to the active project.
  const collaboratorsCount = projectUsers.length;

  // Stories linked to any actor
  const storiesLinkedCount = stories.filter(s => 
    actors.some(a => a.name.toLowerCase() === (s.role || '').toLowerCase())
  ).length;

  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-3 sm:px-4 lg:px-5 py-4">
      <div className="w-full flex flex-col gap-y-4">
        
        {/* Top Title & Macro Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  Actores & Roles del Negocio
                </h1>
                <SectionInfoPopover
                  title="Actores & Roles del Negocio"
                  description={
                    <>
                      Define quiénes interactúan con el software, sus responsabilidades y permisos por área de negocio antes de formular Historias de Usuario.{' '}
                      <span>Los roles registrados aparecen automáticamente en el <strong>Combobox</strong> de redacción de Historias de Usuario.</span>
                    </>
                  }
                />
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium tracking-wide">
                  Formalización de Requerimientos
                </span>
              </div>
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

            {/* Metric 2: Áreas de negocio cubiertas (con popover detallado) */}
            <BusinessAreasPopover actors={actors} />

            {/* Metric 3: Usuarios del proyecto */}
            <button
              type="button"
              onClick={onManageUsers}
              disabled={!onManageUsers}
              className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl text-left enabled:cursor-pointer enabled:hover:border-primary/50 transition-colors disabled:cursor-default"
              title="Usuarios del portal con acceso real a este proyecto"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">group</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Colaboradores</span>
                <span className="font-mono text-xs font-bold text-white">{collaboratorsCount} Usuarios</span>
              </div>
            </button>

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

      </div>
    </section>
  );
}
