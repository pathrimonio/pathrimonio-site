import React from 'react';
import confetti from 'canvas-confetti';

export default function InterfaceControlsBar({ 
  interfaces = [],
  stories = [],
  onNotify
}) {
  const totalInterfaces = interfaces.length;
  const approvedInterfaces = interfaces.filter(i => i.status === 'Aprobado por Cliente' || i.status === 'Aprobado').length;
  const approvalRate = totalInterfaces > 0 ? Math.round((approvedInterfaces / totalInterfaces) * 100) : 0;
  
  // Interfaces with linked stories coverage
  const coveredWithStories = interfaces.filter(i => i.linkedStories && i.linkedStories.length > 0).length;
  const coverageRate = totalInterfaces > 0 ? Math.round((coveredWithStories / totalInterfaces) * 100) : 0;

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

  // Formal presentation to client
  const handlePresentToClient = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.3 }
    });
    onNotify?.(`¡Catálogo de ${totalInterfaces} interfaces (${approvedInterfaces} aprobadas) preparado para sesión de revisión con el cliente!`);
  };

  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-[1520px] mx-auto flex flex-col gap-y-4">
        
        {/* Top Title & Macro Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">devices</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2.5 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  Formalización de Interfaces de Software &amp; Comunicación Cliente
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium tracking-wide">
                  UI/UX Specs &amp; Contratos Visuales
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                Definición formal de pantallas, comportamientos y criterios de aceptación visual validados antes de programar
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

            {/* Export specs button */}
            <button
              onClick={handleExportSpecsJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs font-semibold transition-all shadow-sm"
              title="Descargar especificaciones en JSON para desarrolladores"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span className="hidden sm:inline">Exportar Specs</span>
            </button>

            {/* Present to client button */}
            <button
              onClick={handlePresentToClient}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[17px]">present_to_all</span>
              <span>Revisión con Cliente</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
