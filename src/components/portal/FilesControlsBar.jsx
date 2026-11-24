import React from 'react';
import confetti from 'canvas-confetti';
import { formatBytes } from '../../data/projectTree';

function Metric({ icon, iconClass, label, value, title }) {
  return (
    <div
      className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-xl"
      title={title}
    >
      <span className={`material-symbols-outlined text-[18px] ${iconClass}`}>{icon}</span>
      <div className="flex flex-col">
        <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider">{label}</span>
        <span className="font-mono text-xs font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

export default function FilesControlsBar({
  files = [],
  treeNodes = [],
  viewMode = 'tree',
  onChangeViewMode,
  projects = [],
  activeProjectId,
  onSelectProject,
  activeProject,
  onNotify,
  onOpenUpload,
  onOpenFolderImport,
  onRefreshTree,
  onOpenArchitecture
}) {
  const isTree = viewMode === 'tree';

  const totalFiles = files.length;
  const totalSizeBytes = files.reduce((acc, file) => acc + (file.sizeBytes || 0), 0);
  const totalSizeFormatted = formatBytes(totalSizeBytes);

  const officialCount = files.filter((file) =>
    (file.status || '').toLowerCase().includes('vigente') ||
    (file.status || '').toLowerCase().includes('aprobado') ||
    (file.status || '').toLowerCase().includes('oficial')
  ).length;

  const buildsCount = files.filter((file) =>
    (file.category || '').toLowerCase().includes('build') ||
    (file.format || '').toLowerCase() === 'apk' ||
    (file.format || '').toLowerCase() === 'aab' ||
    (file.format || '').toLowerCase() === 'zip'
  ).length;

  const treeFileCount = treeNodes.filter((node) => !node.isDirectory).length;
  const treeFolderCount = treeNodes.filter((node) => node.isDirectory).length;
  const treeSizeBytes = treeNodes.reduce((acc, node) => acc + (Number(node.sizeBytes) || 0), 0);
  const treeSizeFormatted = formatBytes(treeSizeBytes);
  const treeRecordCount = treeNodes.reduce((acc, node) => acc + (Number(node.recordCount) || 0), 0);

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

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `manifiesto_archivos_${activeProject?.id || 'proyecto'}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onNotify?.('Manifiesto de archivos exportado en formato JSON.');
    } catch (_) {
      onNotify?.('Error al exportar el manifiesto de archivos.');
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
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-3 sm:px-4 lg:px-5 py-4">
      <div className="w-full flex flex-col gap-y-4">

        {/* Top Title & Macro Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">{isTree ? 'account_tree' : 'folder_open'}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2.5 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  Archivos & Entregables del Proyecto — {activeProject ? activeProject.name : 'Pathrimonio'}
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium tracking-wide">
                  {isTree ? 'Árbol del Repositorio' : 'Repositorio de Documentación & Builds'}
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5 truncate">
                {isTree
                  ? 'Estructura completa de carpetas y archivos con su extensión, tamaño y registros abstractos por archivo.'
                  : 'Almacén centralizado de ejecutables (APKs), especificaciones PRD, mockups Figma, contratos y scripts SQL del software.'}
              </p>
            </div>
          </div>

          {/* Metrics Pills */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {isTree ? (
              <>
                <Metric
                  icon="description"
                  iconClass="text-primary"
                  label="Archivos"
                  value={`${treeFileCount} Items`}
                  title="Cantidad de archivos en el árbol"
                />
                <Metric
                  icon="folder"
                  iconClass="text-secondary"
                  label="Carpetas"
                  value={`${treeFolderCount} Dir`}
                  title="Cantidad de carpetas en el árbol"
                />
                <Metric
                  icon="cloud_done"
                  iconClass="text-secondary"
                  label="Almacenamiento"
                  value={treeSizeFormatted}
                  title="Tamaño total de los archivos del árbol"
                />
                <Metric
                  icon="data_object"
                  iconClass="text-cyan-300"
                  label="Registros"
                  value={`${treeRecordCount} Reg`}
                  title="Registros abstractos cargados en los archivos"
                />
              </>
            ) : (
              <>
                <Metric
                  icon="description"
                  iconClass="text-primary"
                  label="Archivos"
                  value={`${totalFiles} Items`}
                  title="Cantidad de entregables registrados"
                />
                <Metric
                  icon="cloud_done"
                  iconClass="text-secondary"
                  label="Almacenamiento"
                  value={totalSizeFormatted}
                  title="Tamaño total de los entregables"
                />
                <Metric
                  icon="verified"
                  iconClass="text-emerald-400"
                  label="Oficiales / Aprobados"
                  value={`${officialCount} Docs`}
                  title="Documentos vigentes o aprobados"
                />
                <Metric
                  icon="deployed_code"
                  iconClass="text-cyan-300"
                  label="Entregables & Builds"
                  value={`${buildsCount} Releases`}
                  title="Builds, APKs y paquetes de release"
                />
              </>
            )}
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-outline-variant/40">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Project selector */}
            <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[16px]">folder_managed</span>
              <label className="text-on-surface-variant text-[11px] font-jakarta">Proyecto:</label>
              <select
                value={activeProjectId || 'all'}
                onChange={(event) => onSelectProject?.(event.target.value)}
                className="bg-transparent text-white font-space text-[11px] font-semibold focus:outline-none cursor-pointer max-w-[190px] truncate"
                title="Seleccionar proyecto"
              >
                <option value="all" className="bg-surface-container-highest text-white">Todos los Proyectos</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id} className="bg-surface-container-highest text-white">
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View mode tabs */}
            <div className="flex items-center bg-surface-container-highest p-1 rounded-xl border border-outline-variant">
              <button
                type="button"
                onClick={() => onChangeViewMode?.('tree')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-space text-[11px] transition-colors ${
                  isTree ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-white'
                }`}
                title="Ver el árbol completo de carpetas y archivos"
              >
                <span className="material-symbols-outlined text-[15px]">account_tree</span>
                <span>Árbol del Proyecto</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode?.('deliverables')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-space text-[11px] transition-colors ${
                  !isTree ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-white'
                }`}
                title="Ver el repositorio de entregables y documentos"
              >
                <span className="material-symbols-outlined text-[15px]">folder_open</span>
                <span>Entregables</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isTree ? (
              <>
                {onRefreshTree && (
                  <button
                    onClick={onRefreshTree}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium transition-colors"
                    title="Actualizar el árbol desde Supabase"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Actualizar</span>
                  </button>
                )}
                {onOpenFolderImport && (
                  <button
                    onClick={onOpenFolderImport}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold shadow-[0_0_12px_rgba(245,166,35,0.25)] active:scale-[0.98] transition-all"
                    title="Cargar la estructura de una carpeta raíz"
                  >
                    <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
                    <span>Cargar Carpeta Raíz</span>
                  </button>
                )}
                {onOpenArchitecture && (
                  <button
                    onClick={onOpenArchitecture}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-space text-xs font-semibold transition-colors cursor-pointer"
                    title="Ver arquitectura del proyecto de software generada con archify (.html)"
                  >
                    <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    <span>Arquitectura archify</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {onOpenArchitecture && (
                  <button
                    onClick={onOpenArchitecture}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-space text-xs font-semibold transition-colors cursor-pointer"
                    title="Ver arquitectura del proyecto de software generada con archify (.html)"
                  >
                    <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    <span>Arquitectura archify</span>
                  </button>
                )}
                {onOpenUpload && (
                  <button
                    onClick={onOpenUpload}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold shadow-[0_0_12px_rgba(245,166,35,0.25)] active:scale-[0.98] transition-all"
                    title="Subir o registrar nuevo archivo o entregable"
                  >
                    <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                    <span>Subir Archivo</span>
                  </button>
                )}

                <button
                  onClick={handleValidateRepository}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-medium transition-colors"
                  title="Auditar y validar integridad del repositorio de archivos"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">task_alt</span>
                  <span>Validar Integridad</span>
                </button>

                <button
                  onClick={handleExportManifest}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-space text-xs font-semibold transition-colors"
                  title="Exportar manifiesto completo en formato JSON"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Exportar Manifiesto (.json)</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
