import React, { useState, useMemo, useEffect, useRef } from 'react';
import InterfaceCard from './InterfaceCard';
import { 
  PLATFORM_OPTIONS, 
  INTERFACE_STATUS_OPTIONS, 
  INTERFACE_MODULE_OPTIONS 
} from '../../data/initialInterfaces';

export default function InterfaceFeed({
  interfaces = [],
  projectActors = [],
  modules = INTERFACE_MODULE_OPTIONS.filter(m => m !== 'Todos'),
  onEditInterface,
  onDuplicateInterface,
  onDeleteInterface,
  onQuickStatusChange,
  onToggleCriterion,
  searchQuery,
  setSearchQuery,
  builderRoles = [],
  onOpenRegisterModal
}) {
  const [selectedPlatform, setSelectedPlatform] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedModule, setSelectedModule] = useState('Todos');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'id' | 'status'
  const [viewMode, setViewMode] = useState('horizontal'); // 'horizontal' | 'stack'
  const [expandedCards, setExpandedCards] = useState({});
  const scrollContainerRef = useRef(null);

  const toggleCardExpanded = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollHorizontally = (offset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // If the active module filter is deleted from the catalog, fall back to "Todos".
  useEffect(() => {
    if (selectedModule !== 'Todos' && !modules.includes(selectedModule)) {
      setSelectedModule('Todos');
    }
  }, [modules, selectedModule]);

  // Extract all unique business role options from projectActors, existing interfaces, and builder roles
  const allRoleOptions = useMemo(() => {
    const actorNames = projectActors.map(a => a.name);
    const interfaceRoles = interfaces.flatMap(i => Array.isArray(i.roles) ? i.roles : (i.role ? [i.role] : []));
    const set = new Set([...actorNames, ...interfaceRoles, ...(builderRoles || [])].filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projectActors, interfaces, builderRoles]);

  // If the active role filter is no longer available, fall back to "Todos".
  useEffect(() => {
    if (selectedRole !== 'Todos' && !allRoleOptions.includes(selectedRole)) {
      setSelectedRole('Todos');
    }
  }, [allRoleOptions, selectedRole]);

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

    // Business Role filter
    const itemRoles = Array.isArray(item.roles) ? item.roles : (item.role ? [item.role] : []);
    const matchRole = selectedRole === 'Todos' || 
      itemRoles.some(r => r.toLowerCase().trim() === selectedRole.toLowerCase().trim());

    // Text search
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchPlatform && matchStatus && matchModule && matchRole;

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
      (item.linkedStories && item.linkedStories.some(us => us.toLowerCase().includes(q))) ||
      itemRoles.some(r => r.toLowerCase().includes(q));

    return matchPlatform && matchStatus && matchModule && matchRole && matchText;
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

  // Global expansion state based on computed sortedInterfaces
  const allExpanded = sortedInterfaces.length > 0 && sortedInterfaces.every(i => expandedCards[i.id]);

  const toggleAllCards = () => {
    const nextState = !allExpanded;
    const newMap = {};
    sortedInterfaces.forEach(i => {
      newMap[i.id] = nextState;
    });
    setExpandedCards(newMap);
  };

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
          {/* Search box (Adaptive Width) */}
          <div className="relative flex-1 min-w-[240px] sm:min-w-[280px] lg:min-w-[320px] w-full sm:w-auto flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-xl focus-within:border-primary transition-colors">
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

          {/* Actions & Quick Stats */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-space sm:ml-auto w-full sm:w-auto justify-between sm:justify-end">
            {onOpenRegisterModal && (
              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary font-space text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Registrar Interfaz</span>
              </button>
            )}

            <div className="px-2.5 py-1 rounded-xl bg-surface-container border border-outline-variant flex items-center gap-1.5 text-white shrink-0">
              <span className="text-on-surface-variant">Total:</span>
              <span className="font-mono font-bold text-primary">{totalCount}</span>
            </div>

            <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5 text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="hidden xs:inline">Aprobadas:</span>
              <span className="font-mono font-bold">{approvedCount}</span>
              <span className="text-[10px] opacity-80 font-mono">({approvalRate}%)</span>
            </div>

            <div className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center gap-1.5 text-sky-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              <span className="hidden xs:inline">Revisión:</span>
              <span className="font-mono font-bold">{reviewCount}</span>
            </div>

            <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-amber-400 shrink-0">
              <span className="hidden xs:inline">Borrador:</span>
              <span className="font-mono font-bold">{draftCount}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Selectors (Platform, Status, Module, Business Role, Sort) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-outline-variant/60">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            {/* Business Role Filter */}
            <div className="flex-1 sm:flex-initial min-w-[130px] sm:min-w-[145px] flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-lowest border border-outline-variant px-2.5 py-1 rounded-xl focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-[15px] text-primary shrink-0">badge</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={`w-full min-w-0 max-w-full bg-transparent text-xs font-jakarta focus:outline-none cursor-pointer truncate ${
                  selectedRole !== 'Todos'
                    ? 'text-primary font-bold'
                    : 'text-white'
                }`}
              >
                <option value="Todos" className="bg-surface-container-highest text-white">Todos los Roles ({allRoleOptions.length})</option>
                {allRoleOptions.map(r => (
                  <option key={r} value={r} className="bg-surface-container-highest text-white">{r}</option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div className="flex-1 sm:flex-initial min-w-[110px] sm:min-w-[125px] flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-lowest border border-outline-variant px-2.5 py-1 rounded-xl focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-[15px] text-cyan-400 shrink-0">devices</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-xs font-jakarta text-white focus:outline-none cursor-pointer truncate"
              >
                {PLATFORM_OPTIONS.map(plat => (
                  <option key={plat} value={plat} className="bg-surface-container-highest text-white">{plat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 sm:flex-initial min-w-[110px] sm:min-w-[125px] flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-lowest border border-outline-variant px-2.5 py-1 rounded-xl focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-[15px] text-emerald-400 shrink-0">verified</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-xs font-jakarta text-white focus:outline-none cursor-pointer truncate"
              >
                {INTERFACE_STATUS_OPTIONS.map(st => (
                  <option key={st} value={st} className="bg-surface-container-highest text-white">{st}</option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div className="flex-1 sm:flex-initial min-w-[125px] sm:min-w-[140px] flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-lowest border border-outline-variant px-2.5 py-1 rounded-xl focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-[15px] text-tertiary shrink-0">view_quilt</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-xs font-jakarta text-white focus:outline-none cursor-pointer truncate"
              >
                {['Todos', ...modules].map(mod => (
                  <option key={mod} value={mod} className="bg-surface-container-highest text-white">{mod}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-2 sm:ml-auto shrink-0 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex-1 sm:flex-initial min-w-[115px] sm:min-w-[125px] flex items-center gap-1 text-xs text-on-surface-variant font-space bg-surface-container-lowest border border-outline-variant px-2.5 py-1 rounded-xl focus-within:border-primary transition-colors overflow-hidden">
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant shrink-0">sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full min-w-0 max-w-full bg-transparent text-xs font-space text-white focus:outline-none cursor-pointer truncate"
              >
                <option value="priority" className="bg-surface-container-highest text-white">Prioridad</option>
                <option value="status" className="bg-surface-container-highest text-white">Estado</option>
                <option value="id" className="bg-surface-container-highest text-white">Código ID</option>
              </select>
            </div>

            {/* Toggle view mode */}
            <div className="flex items-center border border-outline-variant rounded-md overflow-hidden bg-surface-container-lowest">
              <button
                onClick={() => setViewMode('horizontal')}
                className={`p-1.5 transition-colors ${viewMode === 'horizontal' ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:text-white'}`}
                title="Vista Horizontal (Tarjetas en hilera)"
              >
                <span className="material-symbols-outlined text-[16px]">view_column</span>
              </button>
              <button
                onClick={() => setViewMode('stack')}
                className={`p-1.5 transition-colors ${viewMode === 'stack' ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:text-white'}`}
                title="Vista Apilada (Vertical)"
              >
                <span className="material-symbols-outlined text-[16px]">view_agenda</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pill if Role is Selected */}
        {selectedRole !== 'Todos' && (
          <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/40 text-xs">
            <span className="text-on-surface-variant text-[11px] font-space flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[14px]">filter_alt</span>
              <span>Filtrado por Rol de Negocio:</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-space text-xs font-semibold">
              <span>{selectedRole}</span>
              <button 
                onClick={() => setSelectedRole('Todos')}
                className="hover:text-white ml-0.5 text-primary"
                title="Quitar filtro de rol"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              ({filteredInterfaces.length} {filteredInterfaces.length === 1 ? 'interfaz coincidente' : 'interfaces coincidentes'})
            </span>
          </div>
        )}

      </div>

      {/* Interface Cards Feed */}
      {sortedInterfaces.length > 0 ? (
        viewMode === 'horizontal' ? (
          <div className="flex flex-col gap-3">
            {/* Barra de Navegación del Flujo Horizontal */}
            <div className="flex items-center justify-between px-1 text-xs font-space text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant text-white text-[11px] font-semibold shadow-sm">
                  <span className="material-symbols-outlined text-[15px] text-primary">view_column</span>
                  <span>Flujo Horizontal de Interfaces</span>
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  • {sortedInterfaces.length} {sortedInterfaces.length === 1 ? 'pantalla' : 'pantallas'}
                </span>
              </div>

              {/* Botón Extender/Colapsar Todas + Flechas de Desplazamiento */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAllCards}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant hover:border-primary text-white text-[11px] font-space transition-colors cursor-pointer shadow-sm"
                  title={allExpanded ? 'Colapsar especificaciones de todas las interfaces' : 'Extender especificaciones de todas las interfaces'}
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    {allExpanded ? 'unfold_less' : 'unfold_more'}
                  </span>
                  <span>{allExpanded ? 'Colapsar Todas' : 'Extender Todas'}</span>
                </button>

                <div className="flex items-center gap-1 border-l border-outline-variant/60 pl-2">
                  <button
                    type="button"
                    onClick={() => scrollHorizontally(-480)}
                    className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white transition-colors cursor-pointer shadow-sm"
                    title="Desplazar interfaces a la izquierda"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollHorizontally(480)}
                    className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white transition-colors cursor-pointer shadow-sm"
                    title="Desplazar interfaces a la derecha"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contenedor de Fichas con Scroll Horizontal */}
            <div 
              ref={scrollContainerRef}
              className="flex flex-row items-start gap-5 overflow-x-auto pb-6 pt-1 px-1 scroll-smooth snap-x snap-proximity"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {sortedInterfaces.map(item => (
                <InterfaceCard
                  key={item.id}
                  item={item}
                  onEdit={onEditInterface}
                  onDuplicate={onDuplicateInterface}
                  onDelete={onDeleteInterface}
                  onQuickStatusChange={onQuickStatusChange}
                  onToggleCriterion={onToggleCriterion}
                  isExpanded={expandedCards[item.id] ?? false}
                  onToggleExpand={() => toggleCardExpanded(item.id)}
                  layoutMode="horizontal"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {sortedInterfaces.map(item => (
              <InterfaceCard
                key={item.id}
                item={item}
                onEdit={onEditInterface}
                onDuplicate={onDuplicateInterface}
                onDelete={onDeleteInterface}
                onQuickStatusChange={onQuickStatusChange}
                onToggleCriterion={onToggleCriterion}
                isExpanded={expandedCards[item.id] ?? true}
                onToggleExpand={() => toggleCardExpanded(item.id)}
                layoutMode="stack"
              />
            ))}
          </div>
        )
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
            Intenta ajustar los criterios de búsqueda o registra una nueva pantalla en el sistema.
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center mt-2">
            {(searchQuery || selectedPlatform !== 'Todas' || selectedStatus !== 'Todos' || selectedModule !== 'Todos' || selectedRole !== 'Todos') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPlatform('Todas');
                  setSelectedStatus('Todos');
                  setSelectedModule('Todos');
                  setSelectedRole('Todos');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container border border-outline-variant text-white hover:text-primary font-space text-xs font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">clear_all</span>
                <span>Restablecer Filtros</span>
              </button>
            )}

            {onOpenRegisterModal && (
              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">add_circle</span>
                <span>Registrar Nueva Interfaz</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
