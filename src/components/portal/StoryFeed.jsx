import React, { useState } from 'react';

export default function StoryFeed({ 
  stories, 
  onEditStory, 
  onDuplicateStory, 
  onDeleteStory,
  onToggleCriterion,
  searchQuery,
  setSearchQuery,
  onOpenCreateModal
}) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'compact'
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'id'
  const [expandedCriteria, setExpandedCriteria] = useState({});

  const toggleCriteriaExpand = (id) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Priority sorting helper
  const priorityWeight = {
    'Bloqueante': 4,
    'Alta': 3,
    'Media': 2,
    'Baja': 1
  };

  const sortedStories = [...stories].sort((a, b) => {
    if (sortBy === 'priority') {
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    }
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="flex flex-col gap-y-4">
      
      {/* Feed Controls Header */}
      <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-x-3 flex-1 min-w-[200px]">
          <div className="flex items-center gap-x-2 bg-surface-container-lowest border border-outline-variant px-3 py-1 rounded w-full max-w-xs focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar historias por rol o criterio..."
              className="bg-transparent text-xs font-jakarta text-white placeholder-on-surface-variant/70 focus:outline-none w-full"
            />
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant font-space text-[10px] text-on-surface-variant font-mono hidden sm:inline-block">
            {sortedStories.length} mostradas
          </span>
        </div>

        <div className="flex items-center gap-x-3">
          {/* Sorting */}
          <div className="flex items-center gap-x-1 text-on-surface-variant font-space text-xs">
            <span>Ordenar:</span>
            <button 
              onClick={() => setSortBy(sortBy === 'priority' ? 'id' : 'priority')}
              className="font-medium text-white flex items-center gap-x-0.5 hover:text-primary transition-colors"
            >
              <span>{sortBy === 'priority' ? 'Prioridad' : 'Código ID'}</span>
              <span className="material-symbols-outlined text-[14px] text-primary">swap_vert</span>
            </button>
          </div>

          {/* View Layout Toggle */}
          <div className="flex items-center p-0.5 bg-surface-container-lowest border border-outline-variant rounded">
            <button 
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded transition-colors ${viewMode === 'cards' ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:text-white'}`}
              title="Vista de Tarjetas"
            >
              <span className="material-symbols-outlined text-[16px]">view_agenda</span>
            </button>
            <button 
              onClick={() => setViewMode('compact')}
              className={`p-1 rounded transition-colors ${viewMode === 'compact' ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:text-white'}`}
              title="Vista Compacta"
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
            </button>
          </div>

          {/* Nueva Historia Button */}
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="h-8 px-3 rounded-lg bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Crear nueva Historia de Usuario"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span className="hidden sm:inline">Nueva Historia</span>
            </button>
          )}
        </div>
      </div>

      {/* Stories Feed List */}
      {sortedStories.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-12 flex flex-col items-center justify-center text-center gap-2">
          <span className="material-symbols-outlined text-outline-variant text-[40px]">search_off</span>
          <p className="font-space text-sm text-white font-semibold">No se encontraron historias</p>
          <p className="font-jakarta text-xs text-on-surface-variant">Prueba ajustando los filtros de módulo o la búsqueda.</p>
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="mt-3 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] font-space text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Crear Nueva Historia</span>
            </button>
          )}
        </div>
      ) : viewMode === 'compact' ? (
        /* Compact Table View */
        <div className="bg-surface-container-low border border-outline-variant rounded-lg overflow-x-auto">
          <table className="w-full text-left font-jakarta text-xs">
            <thead className="bg-surface-container font-space text-[11px] text-on-surface-variant uppercase border-b border-outline-variant">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Módulo del Software</th>
                <th className="p-3">Prioridad</th>
                <th className="p-3">Rol & Acción</th>
                <th className="p-3">Criterios</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {sortedStories.map(story => (
                <tr key={story.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-primary">{story.id}</td>
                  <td className="p-3 text-white font-medium">{story.module}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-space font-bold ${
                      story.priority === 'Bloqueante' ? 'bg-error-container text-error' :
                      story.priority === 'Alta' ? 'bg-primary/20 text-primary' :
                      'bg-surface-container-high text-on-surface'
                    }`}>
                      {story.priority}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <p className="text-white truncate font-medium">Como {story.role}</p>
                    <p className="text-on-surface-variant truncate">{story.action}</p>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-on-surface-variant">
                    {story.criteria.filter(c => c.checked).length}/{story.criteria.length} DoD
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onEditStory(story)}
                        className="p-1 rounded text-on-surface-variant hover:text-white"
                        title="Ver detalle"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                      <button 
                        onClick={() => onDuplicateStory(story)}
                        className="p-1 rounded text-on-surface-variant hover:text-white"
                        title="Duplicar"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                      <button 
                        onClick={() => onDeleteStory(story.id)}
                        className="p-1 rounded text-on-surface-variant hover:text-error"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Full Cards View */
        <div className="flex flex-row gap-x-3.5 overflow-x-auto pb-2">
          {sortedStories.map((story) => {
            const isBlocker = story.priority === 'Bloqueante';
            const isHigh = story.priority === 'Alta';
            const isExpanded = expandedCriteria[story.id];

            return (
              <article 
                key={story.id}
                className={`w-1/2 shrink-0 bg-surface-container-low rounded-lg p-4 shadow-sm hover:border-outline transition-colors flex flex-col gap-y-3 group ${
                  isBlocker ? 'border border-outline-variant hover:border-error/40' :
                  isHigh ? 'border-l-2 border-l-primary border-y border-r border-outline-variant' :
                  'border border-outline-variant'
                }`}
              >
                {/* Card Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-y-2">
                  <div className="flex items-center gap-x-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-bold font-mono">
                      {story.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-on-surface font-space text-[10px]">
                      {story.module}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-space text-[10px] font-bold flex items-center gap-x-1 ${
                      isBlocker 
                        ? 'bg-error-container border border-error/30 text-error' 
                        : isHigh 
                        ? 'bg-surface-container-high border border-outline-variant text-primary' 
                        : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isBlocker ? 'bg-error animate-pulse' : isHigh ? 'bg-primary' : 'bg-secondary'
                      }`}></span>
                      {story.priority.toUpperCase()}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant text-primary font-space text-[11px] font-medium flex items-center gap-x-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    {story.status}
                  </span>
                </div>

                {/* Story Body with Emphasized Formula */}
                <div className="font-jakarta text-xs leading-relaxed flex flex-col gap-y-1">
                  <p>
                    <strong className="text-primary font-space font-semibold tracking-wide mr-1.5">Como</strong>
                    <span className="text-white font-medium">{story.role},</span>
                  </p>
                  <p>
                    <strong className="text-primary font-space font-semibold tracking-wide mr-1.5">Quiero</strong>
                    <span className="text-on-surface">{story.action},</span>
                  </p>
                  <p>
                    <strong className="text-primary font-space font-semibold tracking-wide mr-1.5">Para que</strong>
                    <span className="text-on-surface-variant">{story.benefit}</span>
                  </p>
                </div>

                {/* Image Map Preview if present (e.g. US-104) */}
                {story.image && (
                  <div className="flex flex-col gap-y-1 pt-1">
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded border border-outline-variant relative overflow-hidden flex items-end p-2.5"
                      style={{ backgroundImage: `url('${story.image}')` }}
                    >
                      <div className="absolute inset-0 bg-background/50 mix-blend-multiply"></div>
                      <div className="relative bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded border border-outline-variant text-white font-space text-[11px] shadow-sm flex items-center gap-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(245,166,35,0.7)] animate-pulse"></span>
                        <span>{story.imageMeta || 'Georreferenciación de Impacto Territorial'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acceptance Criteria Area */}
                {story.criteria && story.criteria.length > 0 && (
                  <div className="p-2.5 rounded bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-y-1.5">
                    <div className="flex items-center justify-between text-on-surface font-space text-[11px]">
                      <span className="flex items-center gap-x-1 font-semibold text-white">
                        <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                        <span>
                          {story.criteria.filter(c => c.checked).length} / {story.criteria.length} Criterios de Aceptación Verificados
                        </span>
                      </span>
                      <button 
                        onClick={() => toggleCriteriaExpand(story.id)}
                        className="text-primary hover:underline text-xs flex items-center gap-0.5"
                      >
                        <span>{isExpanded ? 'Ocultar' : 'Ver detalle'}</span>
                        <span className="material-symbols-outlined text-[14px]">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>

                    {/* Criteria items chips or full list */}
                    {isExpanded ? (
                      <div className="flex flex-col gap-1 pt-1">
                        {story.criteria.map((c, idx) => (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-white">
                            <input 
                              type="checkbox"
                              checked={c.checked}
                              onChange={() => onToggleCriterion(story.id, c.id || idx)}
                              className="w-3.5 h-3.5 rounded-sm bg-surface-container border-outline-variant text-primary focus:ring-0 cursor-pointer"
                            />
                            <span className={`text-xs ${c.checked ? 'text-white' : 'text-on-surface-variant line-through'}`}>
                              {c.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {story.criteria.slice(0, 3).map((c, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-on-surface-variant font-space text-[10px]"
                          >
                            {c.checked ? '✓ ' : '○ '}{c.text}
                          </span>
                        ))}
                        {story.criteria.length > 3 && (
                          <span className="px-1.5 py-0.5 text-primary text-[10px] font-space">
                            +{story.criteria.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Meta & Quick Action Buttons */}
                <div className="flex items-center justify-between pt-1 text-on-surface-variant font-space text-[11px] border-t border-outline-variant/30">
                  <div className="flex items-center gap-x-3">
                    {story.attachmentsCount > 0 ? (
                      <span className="flex items-center gap-x-1 text-white">
                        <span className="material-symbols-outlined text-[15px] text-primary">attach_file</span>
                        {story.attachmentsCount} {story.attachmentsCount === 1 ? 'adjunto' : 'adjuntos'}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant">0 adjuntos</span>
                    )}
                    <span className="hidden sm:inline">
                      {story.createdAt} por <strong className="text-white">{story.author}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-x-1">
                    <button 
                      onClick={() => onEditStory(story)}
                      className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-white transition-colors" 
                      title="Editar o ver en detalle"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                    <button 
                      onClick={() => onDuplicateStory(story)}
                      className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-white transition-colors" 
                      title="Duplicar Historia"
                    >
                      <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    </button>
                    <button 
                      onClick={() => onDeleteStory(story.id)}
                      className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors" 
                      title="Eliminar Historia"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>

              </article>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Quick Metrics Bar */}
      <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(245,166,35,0.6)] animate-pulse"></span>
            <span className="font-space text-xs text-white font-medium">
              {stories.filter(s => s.status.includes('Aprobado') || s.status.includes('Approved')).length} Historias Listas para Dev
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-x-2 text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            <span className="font-space text-xs">
              {stories.filter(s => s.status === 'Draft').length} Borradores pendientes de firma
            </span>
          </div>
        </div>

        <button 
          onClick={() => alert("Registro Criptográfico SHA-256 verificado en bloque #9921")}
          className="font-space text-xs text-primary hover:underline flex items-center gap-x-1 font-medium"
        >
          <span>Ver Registro Histórico de Versiones</span>
          <span className="material-symbols-outlined text-[15px]">history</span>
        </button>
      </div>

    </div>
  );
}
