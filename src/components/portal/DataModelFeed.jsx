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
  setSearchQuery
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
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
        
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tabla (ej. tb_metas, tb_ventas), atributo (ej. user_id), motor o regla..."
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

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-space">
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Storage Engine Filter */}
            <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant">
              <span className="text-on-surface-variant font-medium text-[11px]">Motor:</span>
              <select
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {STORAGE_TARGET_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="bg-surface-container-highest text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant">
              <span className="text-on-surface-variant font-medium text-[11px]">Estado:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {TABLE_STATUS_OPTIONS.map(st => (
                  <option key={st} value={st} className="bg-surface-container-highest text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant">
              <span className="text-on-surface-variant font-medium text-[11px]">Módulo:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                {DATA_MODULE_OPTIONS.map(mod => (
                  <option key={mod} value={mod} className="bg-surface-container-highest text-white">
                    {mod}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-[11px]">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-highest text-white px-2.5 py-1.5 rounded-xl border border-outline-variant font-medium focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-surface-container-highest text-white">Más Recientes / Importadas</option>
              <option value="name" className="bg-surface-container-highest text-white">Nombre de Tabla</option>
              <option value="attributes" className="bg-surface-container-highest text-white">Nº de Atributos</option>
              <option value="status" className="bg-surface-container-highest text-white">Estado de Arquitectura</option>
            </select>
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
          {tables.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-surface font-space font-bold text-xs transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              <span>Mostrar Todas las Entidades ({tables.length})</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
