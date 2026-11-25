import React, { useState } from 'react';
import DataModelCard from './DataModelCard';
import { 
  STORAGE_TARGET_OPTIONS, 
  TABLE_STATUS_OPTIONS, 
  DATA_MODULE_OPTIONS 
} from '../../data/initialDataModels';

export default function DataModelFeed({
  tables = [],
  onEditTable,
  onDuplicateTable,
  onDeleteTable,
  onQuickStatusChange,
  searchQuery,
  setSearchQuery,
  onOpenCreateModal
}) {
  const [selectedStorage, setSelectedStorage] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedModule, setSelectedModule] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'name' | 'attributes' | 'status'

  const handleClearAllFilters = () => {
    setSelectedStorage('Todos');
    setSelectedStatus('Todos');
    setSelectedModule('Todos');
    setSearchQuery?.('');
  };

  const newlyImportedCount = tables.filter(t => t.isNewlyImported || t.author === 'Importador SQL').length;

  // Filtering
  const filteredTables = tables.filter(table => {
    // Storage target filter
    const matchStorage = selectedStorage === 'Todos' || table.storageTarget === selectedStorage;

    // Status filter
    const matchStatus = selectedStatus === 'Todos' || table.status === selectedStatus;

    // Module filter
    const matchModule = selectedModule === 'Todos' || table.module === selectedModule;

    // Search query
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchStorage && matchStatus && matchModule;

    const matchQ = 
      table.tableName.toLowerCase().includes(q) ||
      table.name.toLowerCase().includes(q) ||
      (table.description && table.description.toLowerCase().includes(q)) ||
      (table.storageTarget && table.storageTarget.toLowerCase().includes(q)) ||
      (table.storageLocation && table.storageLocation.toLowerCase().includes(q)) ||
      (table.attributes && table.attributes.some(a => 
        a.name.toLowerCase().includes(q) || 
        a.type.toLowerCase().includes(q) || 
        (a.description && a.description.toLowerCase().includes(q))
      ));

    return matchStorage && matchStatus && matchModule && matchQ;
  });

  // Sorting
  const sortedTables = [...filteredTables].sort((a, b) => {
    if (sortBy === 'recent') {
      return (b.isNewlyImported ? 1 : 0) - (a.isNewlyImported ? 1 : 0);
    }
    if (sortBy === 'name') {
      return a.tableName.localeCompare(b.tableName);
    }
    if (sortBy === 'attributes') {
      return (b.attributes?.length || 0) - (a.attributes?.length || 0);
    }
    if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    }
    return 0;
  });

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* ── Search & Filter Controls ── */}
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center gap-2.5 sm:gap-3 shadow-sm">
        
        {/* Search Bar (Adaptive Width) */}
        <div className="relative flex-1 min-w-[240px] sm:min-w-[260px] lg:min-w-[300px] w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tabla (ej. tb_metas, tb_ventas), atributo (ej. user_id), motor o regla..."
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

        {/* Dropdown Filters & Actions (Adaptive Width Group) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-space w-full lg:w-auto shrink-0 justify-between sm:justify-start">
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            
            {/* Storage Engine Filter */}
            <div className="w-full min-w-0 sm:w-auto sm:min-w-[130px] flex items-center gap-1.5 bg-surface-container-highest px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors overflow-hidden">
              <span className="text-on-surface-variant font-medium text-[11px] shrink-0">Motor:</span>
              <select
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                {STORAGE_TARGET_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="bg-surface-container-highest text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full min-w-0 sm:w-auto sm:min-w-[130px] flex items-center gap-1.5 bg-surface-container-highest px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors overflow-hidden">
              <span className="text-on-surface-variant font-medium text-[11px] shrink-0">Estado:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                {TABLE_STATUS_OPTIONS.map(st => (
                  <option key={st} value={st} className="bg-surface-container-highest text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div className="col-span-2 sm:col-span-1 w-full min-w-0 sm:w-auto sm:min-w-[145px] flex items-center gap-1.5 bg-surface-container-highest px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors overflow-hidden">
              <span className="text-on-surface-variant font-medium text-[11px] shrink-0">Módulo:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                {DATA_MODULE_OPTIONS.map(mod => (
                  <option key={mod} value={mod} className="bg-surface-container-highest text-white">
                    {mod}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Sort By & Nueva Tabla Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <div className="flex-1 sm:flex-initial min-w-0 sm:min-w-[140px] flex items-center gap-1.5 bg-surface-container-highest px-2.5 sm:px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] shrink-0">sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                <option value="recent" className="bg-surface-container-highest text-white">Más Recientes</option>
                <option value="name" className="bg-surface-container-highest text-white">Nombre de Tabla</option>
                <option value="attributes" className="bg-surface-container-highest text-white">Nº de Atributos</option>
                <option value="status" className="bg-surface-container-highest text-white">Estado Arquitectura</option>
              </select>
            </div>

            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-[#e09419] text-on-primary font-space font-semibold text-xs transition-all shadow-sm whitespace-nowrap cursor-pointer active:scale-[0.98] shrink-0"
                title="Diseñar nueva tabla"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Nueva Tabla</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Table Count & Filter Feedback ── */}
      <div className="flex items-center justify-between text-xs font-space px-1">
        <span className="text-on-surface-variant">
          Mostrando <strong className="text-white">{sortedTables.length}</strong> de {tables.length} entidades de datos
        </span>
        {(selectedStorage !== 'Todos' || selectedStatus !== 'Todos' || selectedModule !== 'Todos' || searchQuery) && (
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[13px]">filter_alt_off</span>
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* ── Tables List ── */}
      {sortedTables.length > 0 ? (
        <div className="flex flex-col gap-5">
          {sortedTables.map((table) => (
            <DataModelCard
              key={table.id}
              table={table}
              onEdit={onEditTable}
              onDuplicate={onDuplicateTable}
              onDelete={onDeleteTable}
              onQuickStatusChange={onQuickStatusChange}
              onOpenDetail={onEditTable}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h3 className="font-space text-base font-bold text-white">
            No se encontraron tablas con los filtros seleccionados
          </h3>
          <p className="font-jakarta text-xs text-on-surface-variant max-w-md">
            {tables.length > 0
              ? `Hay ${tables.length} entidades en este proyecto, pero los filtros activos (motor, módulo o búsqueda) las están ocultando.`
              : 'No hay entidades de datos registradas en este proyecto todavía.'}
          </p>
          {tables.length > 0 ? (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-surface font-space font-bold text-xs transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              <span>Mostrar Todas las Entidades ({tables.length})</span>
            </button>
          ) : (
            onOpenCreateModal && (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-surface font-space font-bold text-xs transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Diseñar Primera Tabla</span>
              </button>
            )
          )}
        </div>
      )}

    </div>
  );
}
