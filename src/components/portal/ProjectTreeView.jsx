import React, { useEffect, useMemo, useState } from 'react';
import { getFileVisualInfo } from '../../data/initialFiles';
import { formatBytes, summarizeTree } from '../../data/projectTree';

const keyOf = (rootName, path) => `${rootName}\u0000${path}`;

export default function ProjectTreeView({
  nodes = [],
  loading = false,
  activeProject,
  activeProjectId,
  onSelectFile,
  onImportFolder,
  onRefresh
}) {
  const [expanded, setExpanded] = useState(() => new Set());
  const [query, setQuery] = useState('');

  const tree = useMemo(() => {
    const byKey = new Map();
    nodes.forEach((node) => {
      byKey.set(keyOf(node.rootName, node.path), { ...node, children: [] });
    });

    const roots = [];
    byKey.forEach((node) => {
      if (node.path === '') {
        roots.push(node);
        return;
      }
      const parent = byKey.get(keyOf(node.rootName, node.parentPath));
      if (parent) parent.children.push(node);
      else roots.push(node);
    });

    const sortNodes = (list) => {
      list.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' });
      });
      list.forEach((node) => sortNodes(node.children));
    };
    sortNodes(roots);

    return { roots };
  }, [nodes]);

  const rootKeys = useMemo(
    () => nodes.filter((node) => node.path === '').map((node) => keyOf(node.rootName, node.path)),
    [nodes]
  );
  const rootSignature = rootKeys.join('|');

  useEffect(() => {
    if (rootKeys.length === 0) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      rootKeys.forEach((key) => next.add(key));
      return next;
    });
    // rootKeys is represented by rootSignature to avoid re-expanding on record count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootSignature]);

  const summary = useMemo(() => summarizeTree(nodes), [nodes]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return nodes
      .filter((node) => !node.isDirectory && (
        node.name.toLowerCase().includes(q) ||
        node.path.toLowerCase().includes(q)
      ))
      .slice(0, 200);
  }, [nodes, query]);

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderNode = (node, level = 0) => {
    const key = keyOf(node.rootName, node.path);
    const isExpanded = expanded.has(key);
    const hasChildren = node.children.length > 0;
    const visual = node.isDirectory ? null : getFileVisualInfo(node.name);

    return (
      <div key={key}>
        <button
          type="button"
          onClick={() => {
            if (node.isDirectory) toggle(key);
            else onSelectFile?.(node);
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-container-high/60 text-left transition-colors"
          style={{ paddingLeft: `${8 + level * 16}px` }}
          title={node.isDirectory ? node.path || node.name : node.path}
        >
          {node.isDirectory ? (
            <span className={`material-symbols-outlined text-[16px] text-on-surface-variant transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              chevron_right
            </span>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {node.isDirectory ? (
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
              {isExpanded ? 'folder_open' : 'folder'}
            </span>
          ) : (
            <span className={`material-symbols-outlined text-[18px] shrink-0 ${visual.colorClass.split(' ')[0]}`}>
              {visual.icon}
            </span>
          )}

          <span className={`font-mono text-xs truncate ${node.isDirectory ? 'text-white font-semibold' : 'text-on-surface-variant'}`}>
            {node.name}
          </span>

          {!node.isDirectory && node.extension && (
            <span className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-[9px] font-mono text-on-surface-variant shrink-0">
              {node.extension.toUpperCase()}
            </span>
          )}

          <span className="ml-auto flex items-center gap-2 shrink-0">
            {!node.isDirectory && node.recordCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[9px] font-bold">
                {node.recordCount} reg.
              </span>
            )}
            {!node.isDirectory && (
              <span className="font-mono text-[10px] text-on-surface-variant">
                {formatBytes(node.sizeBytes)}
              </span>
            )}
            {node.isDirectory && hasChildren && (
              <span className="font-mono text-[10px] text-on-surface-variant">
                {node.children.length} items
              </span>
            )}
          </span>
        </button>

        {node.isDirectory && isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (activeProjectId === 'all') {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm p-10 text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[30px]">account_tree</span>
        </div>
        <div>
          <h3 className="font-space text-sm font-bold text-white">Seleccioná un proyecto</h3>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1 max-w-md">
            El árbol de archivos se carga por proyecto. Usá el selector de proyecto en la barra superior para ver la estructura de un repositorio específico.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm p-10 text-center flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-[30px] text-primary animate-spin">progress_activity</span>
        <p className="font-jakarta text-xs text-on-surface-variant">Cargando árbol de archivos...</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm p-10 text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[30px]">account_tree</span>
        </div>
        <div>
          <h3 className="font-space text-sm font-bold text-white">No hay árbol cargado</h3>
          <p className="font-jakarta text-xs text-on-surface-variant mt-1 max-w-md">
            Cargá la carpeta raíz del repositorio para obtener la estructura de carpetas, archivos y extensiones de {activeProject?.name || 'este proyecto'}.
          </p>
        </div>
        {onImportFolder && (
          <button
            type="button"
            onClick={onImportFolder}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-on-primary font-space text-[11px] font-bold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
            Cargar Carpeta Raíz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-outline-variant/60 bg-surface-container-lowest">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[22px]">account_tree</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-space text-sm font-bold text-white truncate">Árbol del Proyecto</h2>
            <p className="font-jakarta text-[11px] text-on-surface-variant truncate">
              {activeProject?.name || 'Proyecto'} · {summary.files} archivos · {summary.folders} carpetas · {summary.totalSizeFormatted} · {summary.recordCount} registros
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white font-space text-[10px] font-bold transition-colors"
              title="Actualizar el árbol desde Supabase"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              Actualizar
            </button>
          )}
          {onImportFolder && (
            <button
              type="button"
              onClick={onImportFolder}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary text-on-primary font-space text-[10px] font-bold hover:bg-primary/90 transition-colors"
              title="Cargar la estructura de una carpeta raíz"
            >
              <span className="material-symbols-outlined text-[15px]">create_new_folder</span>
              Cargar Carpeta
            </button>
          )}
        </div>
      </div>

      <div className="p-3 border-b border-outline-variant/40 bg-surface-container-lowest/60">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar archivo por nombre o ruta..."
            className="w-full h-9 bg-surface-container border border-outline-variant rounded-xl pl-9 pr-8 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-on-surface-variant hover:text-white"
              title="Limpiar búsqueda"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-2">
        {query ? (
          searchResults.length === 0 ? (
            <div className="p-6 text-center font-jakarta text-xs text-on-surface-variant">
              Sin resultados para “{query}”.
            </div>
          ) : (
            <div className="flex flex-col">
              {searchResults.map((node) => {
                const visual = getFileVisualInfo(node.name);
                return (
                  <button
                    key={node.id || `${node.rootName}-${node.path}`}
                    type="button"
                    onClick={() => onSelectFile?.(node)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-container-high/60 text-left transition-colors"
                  >
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${visual.colorClass.split(' ')[0]}`}>
                      {visual.icon}
                    </span>
                    <span className="font-mono text-xs text-white truncate">{node.name}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant truncate">
                      {node.rootName} / {node.path}
                    </span>
                    <span className="ml-auto flex items-center gap-2 shrink-0">
                      {node.recordCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[9px] font-bold">
                          {node.recordCount} reg.
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-on-surface-variant">
                        {formatBytes(node.sizeBytes)}
                      </span>
                    </span>
                  </button>
                );
              })}
              {searchResults.length === 200 && (
                <p className="px-2 py-2 font-jakarta text-[10px] text-on-surface-variant">
                  Mostrando los primeros 200 resultados. Afiná la búsqueda para ver más.
                </p>
              )}
            </div>
          )
        ) : (
          <div className="flex flex-col">
            {tree.roots.map((root) => renderNode(root, 0))}
          </div>
        )}
      </div>
    </div>
  );
}
