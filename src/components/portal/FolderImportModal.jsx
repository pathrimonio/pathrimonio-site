import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getFileVisualInfo } from '../../data/initialFiles';
import {
  buildTreeFromFileList,
  formatBytes,
  summarizeTree
} from '../../data/projectTree';

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
      <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="font-space text-[9px] uppercase tracking-wider text-on-surface-variant">{label}</p>
        <p className="font-mono text-xs font-bold text-white truncate">{value}</p>
      </div>
    </div>
  );
}

export default function FolderImportModal({
  isOpen = false,
  onClose,
  projects = [],
  defaultProjectId,
  onImport,
  onNotify
}) {
  const [projectId, setProjectId] = useState('');
  const [rootName, setRootName] = useState('');
  const [nodes, setNodes] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);
  const [ignoreCommon, setIgnoreCommon] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const fallbackProject = defaultProjectId && defaultProjectId !== 'all'
      ? defaultProjectId
      : (projects[0]?.id || '');
    setProjectId(fallbackProject);
    setRootName('');
    setNodes([]);
    setRawFiles([]);
    setIgnoreCommon(true);
    setScanning(false);
    setImporting(false);
    setTruncated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const summary = useMemo(() => summarizeTree(nodes), [nodes]);
  const previewNodes = useMemo(() => nodes.slice(0, 60), [nodes]);
  const canImport = Boolean(
    projectId &&
    nodes.length > 0 &&
    summary.files > 0 &&
    !truncated &&
    !importing &&
    !scanning
  );

  const rebuild = (files, ignore) => {
    const result = buildTreeFromFileList(files, { ignoreCommon: ignore });
    setRootName(result.rootName);
    setNodes(result.nodes);
    setTruncated(result.truncated);
  };

  const handleFolderSelected = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;
    setRawFiles(files);
    setScanning(true);
    window.setTimeout(() => {
      rebuild(files, ignoreCommon);
      setScanning(false);
    }, 0);
  };

  const handleToggleIgnore = (checked) => {
    setIgnoreCommon(checked);
    if (rawFiles.length > 0) {
      setScanning(true);
      window.setTimeout(() => {
        rebuild(rawFiles, checked);
        setScanning(false);
      }, 0);
    }
  };

  const handlePickFolder = () => {
    inputRef.current?.click();
  };

  const handleImport = async () => {
    if (!canImport) return;
    setImporting(true);
    try {
      const normalizedRootName = rootName.trim() || 'root';
      const importNodes = nodes.map((node) => (
        node.path === '' ? { ...node, name: normalizedRootName } : node
      ));
      const ok = await onImport?.({
        projectId,
        rootName: normalizedRootName,
        nodes: importNodes
      });
      if (ok) onClose?.();
    } catch (error) {
      console.error('[FolderImport] import', error);
      onNotify?.('No se pudo importar la carpeta. Revisá la conexión con Supabase.');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose?.(); }}
    >
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-surface-container border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-outline-variant/60 bg-surface-container-lowest">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">create_new_folder</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-space text-sm font-bold text-white">Cargar Carpeta Raíz</h2>
              <p className="font-jakarta text-[11px] text-on-surface-variant">
                Importá la estructura del repositorio sin subir el contenido de los archivos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant">
                Proyecto destino
              </label>
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="h-10 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 text-xs font-jakarta text-white focus:outline-none focus:border-primary"
              >
                {projects.length === 0 && (
                  <option value="">No hay proyectos disponibles</option>
                )}
                {projects.map((project) => (
                  <option key={project.id} value={project.id} className="bg-surface-container-lowest text-white">
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">info</span>
              <p className="font-jakarta text-[10px] text-on-surface-variant max-w-[280px]">
                Se guardan nombres, rutas, extensiones y tamaños. No se sube el contenido de los archivos.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container-lowest border border-dashed border-outline">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[22px] text-primary mt-0.5">folder_open</span>
              <div>
                <p className="font-space text-xs font-semibold text-white">Carpeta raíz del repositorio</p>
                <p className="font-jakarta text-[11px] text-on-surface-variant mt-0.5">
                  Seleccioná la carpeta que contiene el proyecto. El navegador lee la estructura local; no sube archivos.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePickFolder}
                disabled={scanning}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-on-primary font-space text-[11px] font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">drive_folder_upload</span>
                {scanning ? 'Leyendo carpeta...' : rootName ? 'Cambiar carpeta' : 'Seleccionar carpeta'}
              </button>
              {rootName && (
                <span className="font-mono text-[10px] text-on-surface-variant truncate max-w-[240px]">
                  {rootName}
                </span>
              )}
            </div>

            <input
              ref={(element) => {
                inputRef.current = element;
                if (element) {
                  element.setAttribute('webkitdirectory', '');
                  element.setAttribute('directory', '');
                }
              }}
              type="file"
              multiple
              className="hidden"
              onChange={handleFolderSelected}
            />

            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreCommon}
                onChange={(event) => handleToggleIgnore(event.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="font-jakarta text-[11px] text-on-surface-variant">
                Omitir carpetas pesadas (node_modules, .git, dist, build, .next, coverage, vendor, etc.)
              </span>
            </label>

            <p className="font-jakarta text-[10px] text-on-surface-variant/70">
              Nota: el selector del navegador no incluye carpetas vacías. Si el árbol es muy grande, seleccioná una subcarpeta como raíz.
            </p>
          </div>

          {nodes.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <SummaryItem icon="description" label="Archivos" value={summary.files} />
                <SummaryItem icon="folder" label="Carpetas" value={summary.folders} />
                <SummaryItem icon="cloud_done" label="Tamaño" value={summary.totalSizeFormatted} />
                <SummaryItem icon="data_object" label="Nodos" value={nodes.length} />
              </div>

              {truncated && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="material-symbols-outlined text-[18px] text-amber-300 mt-0.5">warning</span>
                  <p className="font-jakarta text-[11px] text-amber-200">
                    Se superó el límite de nodos permitido. Omití carpetas pesadas o seleccioná una subcarpeta más pequeña como raíz.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Nombre de la raíz
                </label>
                <input
                  type="text"
                  value={rootName}
                  onChange={(event) => setRootName(event.target.value)}
                  className="h-10 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 text-xs font-mono text-white focus:outline-none focus:border-primary"
                  placeholder="Nombre de la carpeta raíz"
                />
                <p className="font-jakarta text-[10px] text-on-surface-variant/70">
                  Si ya existe un árbol con este nombre en el proyecto, se reemplaza.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Vista previa
                  </label>
                  <span className="font-mono text-[10px] text-on-surface-variant">{nodes.length} nodos</span>
                </div>
                <div className="max-h-52 overflow-y-auto p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
                  {previewNodes.map((node) => {
                    const visual = node.isDirectory ? null : getFileVisualInfo(node.name);
                    return (
                      <div
                        key={`preview-${node.path}`}
                        className="flex items-center gap-1.5 py-0.5"
                        style={{ paddingLeft: `${Math.min(node.depth, 8) * 12}px` }}
                      >
                        {node.isDirectory ? (
                          <span className="material-symbols-outlined text-[14px] text-primary shrink-0">folder</span>
                        ) : (
                          <span className={`material-symbols-outlined text-[14px] shrink-0 ${visual.colorClass.split(' ')[0]}`}>
                            {visual.icon}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-white truncate">{node.name}</span>
                        {!node.isDirectory && (
                          <span className="ml-auto font-mono text-[9px] text-on-surface-variant shrink-0">
                            {formatBytes(node.sizeBytes)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {nodes.length > previewNodes.length && (
                    <p className="pt-1 font-jakarta text-[10px] text-on-surface-variant">
                      … y {nodes.length - previewNodes.length} nodos más.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-outline-variant/60 bg-surface-container-lowest">
          <p className="font-jakarta text-[10px] text-on-surface-variant">
            Proyecto: <span className="text-white font-semibold">{projects.find((project) => project.id === projectId)?.name || '—'}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white font-space text-[11px] font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!canImport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-on-primary font-space text-[11px] font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              {importing ? 'Importando...' : `Importar ${summary.files} archivos`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
