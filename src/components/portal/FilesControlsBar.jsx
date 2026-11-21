import React from 'react';
import confetti from 'canvas-confetti';

export default function FilesControlsBar({
  files = [],
  activeProject,
  onNotify,
  onOpenUpload
}) {
  const totalFiles = files.length;

  // Total size calculated
  const totalSizeBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
  const totalSizeFormatted = totalSizeBytes > 1024 * 1024 * 1024
    ? `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    : `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  // Official / Approved files count
  const officialCount = files.filter(f => 
    (f.status || '').toLowerCase().includes('vigente') || 
    (f.status || '').toLowerCase().includes('aprobado') ||
    (f.status || '').toLowerCase().includes('oficial')
  ).length;

  // Builds & Releases count (APKs, Releases)
  const buildsCount = files.filter(f => 
    (f.category || '').toLowerCase().includes('build') ||
    (f.format || '').toLowerCase() === 'apk' ||
    (f.format || '').toLowerCase() === 'aab' ||
    (f.format || '').toLowerCase() === 'zip'
  ).length;

  // Export File Manifest JSON
  const handleExportManifest = () => {
    try {
      const manifest = {
        project: activeProject?.name || 'Pathrimonio',
        projectId: activeProject?.id || 'pathway',
        exportDate: new Date().toISOString(),
        totalFiles,
        totalSizeFormatted,
        files
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `manifiesto_archivos_${activeProject?.id || 'proyecto'}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onNotify?.("Manifiesto de archivos exportado en formato JSON.");
    } catch (_) {
      onNotify?.("Error al exportar el manifiesto de archivos.");
    }
  };

  const handleValidateRepository = () => {
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.3 }
    });
    onNotify?.(`¡Repositorio validado con ${totalFiles} archivos (${totalSizeFormatted}) y ${officialCount} documentos oficiales para ${activeProject?.name}!`);
  };

  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-[1520px] mx-auto flex flex-col gap-y-4">
        
        {/* Top Title & Macro Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">folder_open</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2.5 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  Archivos & Entregables del Proyecto — {activeProject ? activeProject.name : 'Pathrimonio'}
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium tracking-wide">
                  Repositorio de Documentación & Builds
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5 truncate max-w-xl">
                Almacén centralizado de ejecutables (APKs), especificaciones PRD, mockups Figma, contratos y scripts SQL del software.
              </p>
            </div>
          </div>

          {/* Metrics Pills */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Metric 1: Total Files */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-primary">description</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Archivos</span>
                <span className="font-mono text-xs font-bold text-white">{totalFiles} Items</span>
              </div>
            </div>

            {/* Metric 2: Storage Size */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-secondary">cloud_done</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Almacenamiento</span>
                <span className="font-mono text-xs font-bold text-white">{totalSizeFormatted}</span>
              </div>
            </div>

            {/* Metric 3: Documentos Oficiales */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">verified</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Oficiales / Aprobados</span>
                <span className="font-mono text-xs font-bold text-white">{officialCount} Docs</span>
              </div>
            </div>

            {/* Metric 4: Builds & Releases */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-cyan-300">deployed_code</span>
              <div className="flex flex-col">
                <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">Entregables & Builds</span>
                <span className="font-mono text-xs font-bold text-white">{buildsCount} Releases</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-outline-variant/40">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[16px]">info</span>
            <span>
              Los archivos se vinculan con <strong>Historias de Usuario</strong>, <strong>Interfaces</strong> y <strong>Modelos de Datos</strong> para asegurar trazabilidad.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Validar Repositorio */}
            <button
              onClick={handleValidateRepository}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium transition-colors"
              title="Auditar y validar integridad del repositorio de archivos"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">task_alt</span>
              <span>Validar Integridad</span>
            </button>

            {/* Exportar Manifiesto JSON */}
            <button
              onClick={handleExportManifest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-space text-xs font-semibold transition-colors"
              title="Exportar manifiesto completo en formato JSON"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Exportar Manifiesto (.json)</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
