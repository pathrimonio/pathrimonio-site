import React, { useState } from 'react';
import InterfaceCard from './InterfaceCard';
import { 
  PLATFORM_OPTIONS, 
  INTERFACE_STATUS_OPTIONS, 
  INTERFACE_MODULE_OPTIONS 
} from '../../data/initialInterfaces';

export default function InterfaceFeed({
  interfaces = [],
  onEditInterface,
  onDuplicateInterface,
  onDeleteInterface,
  onQuickStatusChange,
  onToggleCriterion,
  searchQuery,
  setSearchQuery
}) {
  const [selectedPlatform, setSelectedPlatform] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedModule, setSelectedModule] = useState('Todos');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'id' | 'status'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compact'

  // Priority weights
  const priorityWeight = {
    'Bloqueante': 4,
    'Alta': 3,
    'Media': 2,
    'Baja': 1
  };

  // Status weights
  const statusWeight = {
    'En Revisión': 4,
    'Borrador': 3,
    'Rechazado': 2,
    'Aprobado por Cliente': 1,
    'Aprobado': 1,
    'Deprecado': 0
  };

  // Filtering
  const filteredInterfaces = interfaces.filter(item => {
    // Platform filter
    const matchPlatform = selectedPlatform === 'Todas' || 
      item.platform === selectedPlatform || 
      (selectedPlatform !== 'Todas' && item.platform === 'Ambas Plataformas');

    // Status filter
    const matchStatus = selectedStatus === 'Todos' || item.status === selectedStatus;

    // Module filter
    const matchModule = selectedModule === 'Todos' || item.module === selectedModule;

    // Text search
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchPlatform && matchStatus && matchModule;

    const f = item.fields || {};
    const matchText =
      item.id.toLowerCase().includes(q) ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.fullName && item.fullName.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.module && item.module.toLowerCase().includes(q)) ||
      (f.objetivo && f.objetivo.toLowerCase().includes(q)) ||
      (f.contenido && f.contenido.toLowerCase().includes(q)) ||
      (f.reglas && f.reglas.toLowerCase().includes(q)) ||
      (f.detalles && f.detalles.toLowerCase().includes(q)) ||
      (item.linkedStory && item.linkedStory.toLowerCase().includes(q)) ||
      (item.linkedStories && item.linkedStories.some(us => us.toLowerCase().includes(q)));

    return matchPlatform && matchStatus && matchModule && matchText;
  });

  // Sorting
  const sortedInterfaces = [...filteredInterfaces].sort((a, b) => {
    if (sortBy === 'priority') {
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    }
    if (sortBy === 'status') {
      return (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
    }
    return b.id.localeCompare(a.id);
  });

  // Calculate summary counts
  const totalCount = interfaces.length;
  const approvedCount = interfaces.filter(i => i.status === 'Aprobado por Cliente' || i.status === 'Aprobado').length;
  const reviewCount = interfaces.filter(i => i.status === 'En Revisión').length;
  const draftCount = interfaces.filter(i => i.status === 'Borrador').length;
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Controls & Metrics Bar */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        
        {/* Row 1: Search and Quick Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-lg w-full sm:max-w-md focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-primary text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre (ej. 4. Dashboard), objetivo, reglas..."
              className="bg-transparent text-xs font-jakarta text-white placeholder-on-surface-variant/70 focus:outline-none w-full"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-space">
            <div className="px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant flex items-center gap-1.5 text-white">
              <span className="text-on-surface-variant">Total:</span>
              <span className="font-mono font-bold text-primary">{totalCount}</span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Aprobadas:</span>
              <span className="font-mono font-bold">{approvedCount}</span>
              <span className="text-[10px] opacity-80 font-mono">({approvalRate}%)</span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center gap-1.5 text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              <span>En Revisión:</span>
              <span className="font-mono font-bold">{reviewCount}</span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-amber-400">
              <span>Borrador:</span>
              <span className="font-mono font-bold">{draftCount}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Selectors (Platform, Status, Module, Sort) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-outline-variant/60">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform Filter */}
            <div className="flex items-center gap-1 text-xs text-on-surface-variant">
              <span className="font-space text-[11px] hidden sm:inline">Plataforma:</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded-md text-xs font-jakarta text-white focus:border-primary focus:outline-none"
              >
                {PLATFORM_OPTIONS.map(plat => (
                  <option key={plat} value={plat}>{plat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs text-on-surface-variant">
              <span className="font-space text-[11px] hidden sm:inline">Estado:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded-md text-xs font-jakarta text-white focus:border-primary focus:outline-none"
              >
                {INTERFACE_STATUS_OPTIONS.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div className="flex items-center gap-1 text-xs text-on-surface-variant">
              <span className="font-space text-[11px] hidden sm:inline">Módulo:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded-md text-xs font-jakarta text-white focus:border-primary focus:outline-none max-w-[160px] truncate"
              >
                {INTERFACE_MODULE_OPTIONS.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-on-surface-variant font-space">
              <span className="hidden sm:inline">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded-md text-xs font-space text-white focus:border-primary focus:outline-none"
              >
                <option value="priority">Prioridad</option>
                <option value="status">Estado</option>
                <option value="id">Código ID</option>
              </select>
            </div>

            {/* Toggle view mode */}
            <div className="flex items-center border border-outline-variant rounded-md overflow-hidden bg-surface-container-lowest">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:text-white'}`}
                title="Vista de Tarjetas"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 transition-colors ${viewMode === 'compact' ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:text-white'}`}
                title="Vista Compacta"
              >
                <span className="material-symbols-outlined text-[16px]">view_agenda</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Interface Cards Feed */}
      {sortedInterfaces.length > 0 ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1' : 'grid-cols-1'}`}>
          {sortedInterfaces.map(item => (
            <InterfaceCard
              key={item.id}
              item={item}
              onEdit={onEditInterface}
              onDuplicate={onDuplicateInterface}
              onDelete={onDeleteInterface}
              onQuickStatusChange={onQuickStatusChange}
              onToggleCriterion={onToggleCriterion}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary mb-1">
            <span className="material-symbols-outlined text-[32px]">devices_other</span>
          </div>
          <h3 className="font-space text-base font-bold text-white">
            No se encontraron interfaces con los filtros actuales
          </h3>
          <p className="font-jakarta text-xs text-on-surface-variant max-w-md">
            Intenta ajustar los criterios de búsqueda o registra una nueva pantalla utilizando el formulario de formalización a la izquierda.
          </p>
          {(searchQuery || selectedPlatform !== 'Todas' || selectedStatus !== 'Todos' || selectedModule !== 'Todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('Todas');
                setSelectedStatus('Todos');
                setSelectedModule('Todos');
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container border border-outline-variant text-white hover:text-primary font-space text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">clear_all</span>
              <span>Restablecer Filtros</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
