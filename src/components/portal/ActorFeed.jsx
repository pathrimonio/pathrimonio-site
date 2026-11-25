import React, { useState } from 'react';
import ActorCard from './ActorCard';
import { 
  ACTOR_CATEGORY_OPTIONS, 
  PERMISSION_LEVEL_OPTIONS 
} from '../../data/initialActors';

export default function ActorFeed({
  actors = [],
  stories = [],
  interfaces = [],
  onEditActor,
  onDuplicateActor,
  onDeleteActor,
  onSelectForStory,
  searchQuery,
  setSearchQuery,
  onNotify,
  onOpenCreateModal
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedPermission, setSelectedPermission] = useState('Todos');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'stories' | 'permission'

  // Filter actors
  const filteredActors = actors.filter(actor => {
    // Category filter
    const matchCategory = selectedCategory === 'Todas' || actor.category === selectedCategory;

    // Permission level filter
    const matchPermission = selectedPermission === 'Todos' || actor.permissionLevel === selectedPermission;

    // Search query
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchCategory && matchPermission;

    const matchQ =
      actor.name.toLowerCase().includes(q) ||
      (actor.description && actor.description.toLowerCase().includes(q)) ||
      (actor.category && actor.category.toLowerCase().includes(q)) ||
      (actor.assignedWorkerName && actor.assignedWorkerName.toLowerCase().includes(q)) ||
      (actor.assignedWorker && actor.assignedWorker.toLowerCase().includes(q)) ||
      (actor.systemAreas && actor.systemAreas.some(area => area.toLowerCase().includes(q)));

    return matchCategory && matchPermission && matchQ;
  });

  // Calculate linked stories count helper
  const getLinkedStoriesCount = (actorName) => {
    if (!actorName) return 0;
    return stories.filter(s => (s.role || '').toLowerCase().trim() === actorName.toLowerCase().trim()).length;
  };

  // Calculate linked interfaces count helper
  const getLinkedInterfacesCount = (actorName) => {
    if (!actorName) return 0;
    return interfaces.filter(item => {
      const roles = Array.isArray(item.roles) ? item.roles : (item.role ? [item.role] : []);
      return roles.some(r => r.toLowerCase().trim() === actorName.toLowerCase().trim());
    }).length;
  };

  // Sort actors
  const sortedActors = [...filteredActors].sort((a, b) => {
    // Primary roles first
    if (a.isPrimaryRole && !b.isPrimaryRole) return -1;
    if (!a.isPrimaryRole && b.isPrimaryRole) return 1;

    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'stories') {
      return getLinkedStoriesCount(b.name) - getLinkedStoriesCount(a.name);
    }
    if (sortBy === 'permission') {
      return (a.permissionLevel || '').localeCompare(b.permissionLevel || '');
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
            placeholder="Buscar por rol (ej. Administrador, Cajero), área de negocio (ej. Ventas), o colaborador..."
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
          
          {/* Category & Permission Filters (2-column on mobile, inline flex on desktop) */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            
            {/* Category Filter */}
            <div className="min-w-0 sm:min-w-[140px] flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0">category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                {ACTOR_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat} className="bg-surface-container-highest text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Permission Level Filter */}
            <div className="min-w-0 sm:min-w-[140px] flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">shield</span>
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
                className="w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                {PERMISSION_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-surface-container-highest text-white">
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By, Reset & Action Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            
            {/* Sort Filter */}
            <div className="flex-1 sm:flex-initial min-w-0 sm:min-w-[130px] flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-xl border border-outline-variant hover:border-outline focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] shrink-0">sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate text-xs"
              >
                <option value="name" className="bg-surface-container-highest text-white">Alfabético</option>
                <option value="stories" className="bg-surface-container-highest text-white">HU Vinculadas</option>
                <option value="permission" className="bg-surface-container-highest text-white">Nivel de Permiso</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedCategory !== 'Todas' || selectedPermission !== 'Todos' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('Todas');
                  setSelectedPermission('Todos');
                  setSearchQuery('');
                }}
                className="text-xs text-primary hover:underline flex items-center gap-1 py-1 px-1.5 whitespace-nowrap cursor-pointer shrink-0"
                title="Limpiar filtros activos"
              >
                <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}

            {/* Registrar Button */}
            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] shrink-0"
                title="Registrar nuevo rol o actor del negocio"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Registrar</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Total Count Indicator ── */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant font-space px-1">
        <span>Mostrando <strong>{sortedActors.length}</strong> de {actors.length} actores registrados</span>
        <span>Haz clic en <strong>"Compartir"</strong> para invitar a tus colaboradores</span>
      </div>

      {/* ── Actors Cards Grid ── */}
      {sortedActors.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">group_off</span>
          </div>
          <h3 className="font-space text-base font-bold text-white">No se encontraron actores o roles</h3>
          <p className="font-jakarta text-xs text-on-surface-variant max-w-md">
            No hay roles que coincidan con los filtros seleccionados. Prueba limpiando la búsqueda o registra un nuevo actor de negocio.
          </p>
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Registrar Primer Actor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-row gap-4 overflow-x-auto pb-2">
          {sortedActors.map((actor) => (
            <ActorCard
              key={actor.id}
              actor={actor}
              onEdit={onEditActor}
              onDuplicate={onDuplicateActor}
              onDelete={onDeleteActor}
              onSelectForStory={onSelectForStory}
              linkedStoriesCount={getLinkedStoriesCount(actor.name)}
              linkedInterfacesCount={getLinkedInterfacesCount(actor.name)}
              onNotify={onNotify}
            />
          ))}
        </div>
      )}

    </div>
  );
}
