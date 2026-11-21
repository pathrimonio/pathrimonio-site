import React, { useState } from 'react';
import FileCard from './FileCard';
import { 
  FILE_CATEGORY_OPTIONS, 
  FILE_STATUS_OPTIONS,
  getFileVisualInfo
} from '../../data/initialFiles';

export default function FileFeed({
  files = [],
  onPreviewFile,
  onEditFile,
  onDeleteFile,
  onDuplicateFile,
  searchQuery,
  setSearchQuery,
  onNotify
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedFormat, setSelectedFormat] = useState('Todos');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'name' | 'size' | 'version'

  // Formats list present in files
  const availableFormats = ['Todos', ...new Set(files.map(f => (f.format || '').toUpperCase()).filter(Boolean))];

  // Filtering
  const filteredFiles = files.filter(file => {
    // Category filter
    const matchCat = selectedCategory === 'Todas' || file.category === selectedCategory;

    // Status filter
    const matchStatus = selectedStatus === 'Todos' || file.status === selectedStatus;

    // Format filter
    const matchFormat = selectedFormat === 'Todos' || (file.format || '').toUpperCase() === selectedFormat;

    // Search query
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchCat && matchStatus && matchFormat;

    const matchQ =
      file.name.toLowerCase().includes(q) ||
      (file.description && file.description.toLowerCase().includes(q)) ||
      (file.category && file.category.toLowerCase().includes(q)) ||
      (file.version && file.version.toLowerCase().includes(q)) ||
      (file.uploadedBy && file.uploadedBy.toLowerCase().includes(q)) ||
      (file.linkedEntity && file.linkedEntity.toLowerCase().includes(q)) ||
      (file.tags && file.tags.some(t => t.toLowerCase().includes(q)));

    return matchCat && matchStatus && matchFormat && matchQ;
  });

  // Sorting
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'size') {
      return (b.sizeBytes || 0) - (a.sizeBytes || 0);
    }
    if (sortBy === 'version') {
      return (b.version || '').localeCompare(a.version || '');
    }
    // Default by upload date
    return (b.uploadedAt || '').localeCompare(a.uploadedAt || '');
  });

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* ── Search & Filter Controls ── */}
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
        
        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre (ej. Pathway, APK, PRD), tag, vinculación o autor..."
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center bg-surface-container-highest p-1 rounded-xl border border-outline-variant shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-primary text-black font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              title="Vista en Cuadrícula (Tarjetas)"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                viewMode === 'table'
                  ? 'bg-primary text-black font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              title="Vista en Lista / Explorador de Archivos"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-space">
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[16px]">category</span>
              <label className="text-on-surface-variant text-[11px]">Categoría:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[170px] truncate"
              >
                {FILE_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat} className="bg-surface-container-highest text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
              <label className="text-on-surface-variant text-[11px]">Estado:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {FILE_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-surface-container-highest text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-cyan-300 text-[16px]">extension</span>
              <label className="text-on-surface-variant text-[11px]">Formato:</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {availableFormats.map((fmt) => (
                  <option key={fmt} value={fmt} className="bg-surface-container-highest text-white">
                    {fmt}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedCategory !== 'Todas' || selectedStatus !== 'Todos' || selectedFormat !== 'Todos' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('Todas');
                  setSelectedStatus('Todos');
                  setSelectedFormat('Todos');
                  setSearchQuery('');
                }}
                className="text-xs text-primary hover:underline flex items-center gap-1 py-1 px-2"
              >
                <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant ml-auto">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">sort</span>
            <label className="text-on-surface-variant text-[11px]">Ordenar:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="date" className="bg-surface-container-highest text-white">Fecha de Subida</option>
              <option value="name" className="bg-surface-container-highest text-white">Alfabético</option>
              <option value="size" className="bg-surface-container-highest text-white">Tamaño de Archivo</option>
              <option value="version" className="bg-surface-container-highest text-white">Versión</option>
            </select>
          </div>
        </div>

      </div>

      {/* ── Total Indicator ── */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant font-space px-1">
        <span>Mostrando <strong>{sortedFiles.length}</strong> de {files.length} archivos en el repositorio</span>
        <span>Haz clic en <strong>"Ver Ficha"</strong> para inspeccionar o descargar</span>
      </div>

      {/* ── Empty State ── */}
      {sortedFiles.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">folder_off</span>
          </div>
          <h3 className="font-space text-base font-bold text-white">No se encontraron archivos</h3>
          <p className="font-jakarta text-xs text-on-surface-variant max-w-md">
            No hay archivos o entregables que coincidan con los filtros seleccionados. Prueba limpiando la búsqueda o sube un nuevo archivo desde el panel izquierdo.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onPreview={onPreviewFile}
              onEdit={onEditFile}
              onDelete={onDeleteFile}
              onDuplicate={onDuplicateFile}
              onNotify={onNotify}
            />
          ))}
        </div>
      ) : (
        /* ── TABLE / LIST VIEW (Explorador de Archivos) ── */
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-highest border-b border-outline-variant font-space text-on-surface-variant text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Archivo & Formato</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3">Versión</th>
                  <th className="py-3 px-3">Tamaño</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Responsable</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 font-jakarta">
                {sortedFiles.map((file) => {
                  const visual = getFileVisualInfo(file.name, file.category);
                  return (
                    <tr 
                      key={file.id}
                      className="hover:bg-surface-container-high/50 transition-colors group"
                    >
                      {/* Name & Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`material-symbols-outlined text-[20px] ${visual.colorClass.split(' ')[0]}`}>
                            {visual.icon}
                          </span>
                          <span 
                            onClick={() => onPreviewFile?.(file)}
                            className="font-mono text-xs font-bold text-white group-hover:text-primary transition-colors cursor-pointer truncate max-w-xs"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-on-surface-variant font-space text-[11px] truncate max-w-[140px]">
                        {file.category}
                      </td>

                      {/* Version */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded font-bold">
                          {file.version}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-3 font-mono text-[11px] text-white">
                        {file.sizeFormatted}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-space font-semibold bg-surface-container border border-outline-variant text-white">
                          {file.status}
                        </span>
                      </td>

                      {/* Uploader */}
                      <td className="py-3 px-3 text-on-surface-variant text-[11px] truncate max-w-[120px]">
                        {file.uploadedBy}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 font-mono text-[11px] text-on-surface-variant">
                        {file.uploadedAt}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPreviewFile?.(file)}
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-primary transition-colors"
                            title="Ver Ficha y Previsualizar"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteFile?.(file.id)}
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-error transition-colors"
                            title="Eliminar archivo"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
