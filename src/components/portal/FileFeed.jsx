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
  onNotify,
  onOpenUpload
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
      {/* ── Search & Filter Controls ── */}
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center gap-2.5 sm:gap-3 shadow-sm">
        
        {/* Search Bar & View Mode Toggle (Adaptive Width) */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px] sm:min-w-[280px] lg:min-w-[320px] w-full">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre (ej. Pathway, APK, PRD), tag, vinculación o autor..."
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl pl-10 pr-9 py-2 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
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

        {/* Dropdown Filters & Actions (Adaptive Width Group) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-space w-full lg:w-auto shrink-0 justify-between sm:justify-start">
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            
            {/* Category Filter */}
            <div className="w-full min-w-0 sm:w-auto sm:min-w-[135px] flex items-center gap-1.5 bg-surface-container-highest px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0">category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                {FILE_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat} className="bg-surface-container-highest text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full min-w-0 sm:w-auto sm:min-w-[125px] flex items-center gap-1.5 bg-surface-container-highest px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">verified</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                {FILE_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-surface-container-highest text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div className="col-span-2 sm:col-span-1 w-full min-w-0 sm:w-auto sm:min-w-[120px] flex items-center gap-1.5 bg-surface-container-highest px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-cyan-300 text-[16px] shrink-0">extension</span>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
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
                className="text-xs text-primary hover:underline flex items-center gap-1 py-1 px-1.5 whitespace-nowrap cursor-pointer shrink-0"
                title="Limpiar filtros activos"
              >
                <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>

          {/* Sort By & Upload Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <div className="flex-1 sm:flex-initial min-w-0 sm:min-w-[130px] flex items-center gap-1.5 bg-surface-container-highest px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] shrink-0">sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                <option value="date" className="bg-surface-container-highest text-white">Fecha de Subida</option>
                <option value="name" className="bg-surface-container-highest text-white">Alfabético</option>
                <option value="size" className="bg-surface-container-highest text-white">Tamaño de Archivo</option>
                <option value="version" className="bg-surface-container-highest text-white">Versión</option>
              </select>
            </div>

            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] shrink-0"
                title="Subir o registrar nuevo archivo o entregable"
              >
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                <span>Subir Archivo</span>
              </button>
            )}
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
            No hay archivos o entregables que coincidan con los filtros seleccionados. Prueba limpiando la búsqueda o sube un nuevo archivo al repositorio.
          </p>
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>Subir Primer Archivo</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
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
