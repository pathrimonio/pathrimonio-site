import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function InterfaceControlsBar({ 
  interfaces = [],
  stories = [],
  projectActors = [],
  onNotify,
  onConfirmClientReview,
  activeProject,
  onOpenRegisterModal
}) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const totalInterfaces = interfaces.length;
  const approvedInterfaces = interfaces.filter(i => i.status === 'Aprobado por Cliente' || i.status === 'Aprobado').length;
  const approvalRate = totalInterfaces > 0 ? Math.round((approvedInterfaces / totalInterfaces) * 100) : 0;
  const reviewPending = interfaces.filter(i => i.status === 'En Revisión');
  const draftCount = interfaces.filter(i => i.status === 'Borrador').length;
  
  // Interfaces with linked stories coverage
  const coveredWithStories = interfaces.filter(i => i.linkedStories && i.linkedStories.length > 0).length;
  const coverageRate = totalInterfaces > 0 ? Math.round((coveredWithStories / totalInterfaces) * 100) : 0;

  // Distinct roles covered across these interfaces
  const distinctRolesInInterfaces = new Set(
    interfaces.flatMap(i => Array.isArray(i.roles) ? i.roles : (i.role ? [i.role] : []))
  );

  // Export JSON specification bundle
  const handleExportSpecsJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(interfaces, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pathrimonio_interface_specs_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onNotify?.("Paquete de especificaciones UI exportado en formato JSON.");
    } catch (_) {
      onNotify?.("Error al exportar especificaciones.");
    }
  };

  // Confirm client review: mark all in-review interfaces as approved by the client.
  const handleConfirmReview = () => {
    const approvedCount = onConfirmClientReview?.(reviewPending) ?? 0;
    setIsReviewModalOpen(false);
    if (approvedCount > 0) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.3 }
      });
    }
  };

  return (
    <>
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-3 sm:px-4 lg:px-5 py-4">
      <div className="w-full flex flex-col gap-y-4">
        
        {/* Top Title & Macro Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">
                {activeProject?.icon || 'devices'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2.5 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  {activeProject ? `${activeProject.name} — Interfaces UI` : 'Formalización de Interfaces de Software'}
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium tracking-wide">
                  {activeProject?.category || 'UI/UX Specs'}
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                Fichas de pantalla: Imagen de la interfaz y cuadro formal de especificación con Objetivo, Contenido, Reglas y Detalles
              </p>
            </div>
          </div>

          {/* Metrics & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Metric: Aprobación Cliente */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-space">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-on-surface-variant">Aprobadas por Cliente:</span>
              <span className="font-mono text-emerald-400 font-bold">{approvedInterfaces}/{totalInterfaces}</span>
              <span className="font-mono text-[10px] text-on-surface-variant">({approvalRate}%)</span>
            </div>

            {/* Metric: Trazabilidad US */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-space">
              <span className="material-symbols-outlined text-primary text-[15px]">hub</span>
              <span className="text-on-surface-variant">Trazabilidad con US:</span>
              <span className="font-mono text-primary font-bold">{coverageRate}%</span>
            </div>

            {/* Metric: Roles Cubiertos */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-space">
              <span className="material-symbols-outlined text-primary text-[15px]">badge</span>
              <span className="text-on-surface-variant">Roles Cubiertos:</span>
              <span className="font-mono text-primary font-bold">{distinctRolesInInterfaces.size}</span>
              {projectActors.length > 0 && (
                <span className="font-mono text-[10px] text-on-surface-variant">/{projectActors.length}</span>
              )}
            </div>

            {/* Export specs button */}
            <button
              onClick={handleExportSpecsJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs font-semibold transition-all shadow-sm"
              title="Descargar especificaciones en JSON para desarrolladores"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span className="hidden sm:inline">Exportar Specs</span>
            </button>

            {/* Confirm client review button */}
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high border border-outline-variant hover:border-emerald-500/50 text-white hover:text-emerald-400 font-space text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px] text-emerald-400">fact_check</span>
              <span>Confirmar Revisión</span>
            </button>

            {/* Register new interface button */}
            {onOpenRegisterModal && (
              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Registrar Interfaz</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </section>

    {isReviewModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-review-title"
      >
        <div className="w-full max-w-lg bg-surface-container border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-outline-variant/60 bg-surface-container-low">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </span>
              <div>
                <h2 id="client-review-title" className="font-space text-base font-bold text-white">
                  Confirmar revisión con el cliente
                </h2>
                <p className="font-jakarta text-xs text-on-surface-variant">
                  Revisado por el cliente
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="font-jakarta text-sm text-on-surface leading-relaxed">
              ¿Confirmás que el cliente revisó y aprobó las interfaces en revisión de{' '}
              <strong className="text-white">{activeProject?.name || 'este proyecto'}</strong>?
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-surface-container-lowest border border-outline-variant p-3 text-center">
                <span className="block font-mono text-lg font-bold text-primary">{reviewPending.length}</span>
                <span className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant">En revisión</span>
              </div>
              <div className="rounded-xl bg-surface-container-lowest border border-outline-variant p-3 text-center">
                <span className="block font-mono text-lg font-bold text-emerald-400">{approvedInterfaces}</span>
                <span className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant">Aprobadas</span>
              </div>
              <div className="rounded-xl bg-surface-container-lowest border border-outline-variant p-3 text-center">
                <span className="block font-mono text-lg font-bold text-on-surface-variant">{draftCount}</span>
                <span className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant">Borradores</span>
              </div>
            </div>

            {reviewPending.length > 0 && (
              <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/60 p-3">
                <p className="font-jakarta text-[11px] text-on-surface-variant leading-relaxed">
                  Las {reviewPending.length} interfaces en revisión pasarán a{' '}
                  <strong className="text-emerald-400">Aprobado por Cliente</strong> y se registrará la fecha de aprobación. Los borradores no se modifican.
                </p>
              </div>
            )}

            {reviewPending.length === 0 && (
              <p className="font-jakarta text-xs text-amber-400">
                No hay interfaces en revisión para confirmar. Podés aprobar fichas individualmente desde cada tarjeta.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-outline-variant/60 bg-surface-container-low">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white font-space text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmReview}
              disabled={reviewPending.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="material-symbols-outlined text-[17px]">verified</span>
              <span>Confirmar revisión</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
