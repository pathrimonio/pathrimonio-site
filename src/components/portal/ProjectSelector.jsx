import React, { useState, useRef, useEffect } from 'react';

export default function ProjectSelector({
  projects = [],
  activeProjectId,
  onSelectProject,
  onOpenNewProjectModal
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || {
    id: 'pathway',
    name: 'Pathway (App MVP)',
    icon: 'route',
    category: 'Producto Propio (MVP)'
  };

  const isAllSelected = activeProjectId === 'all';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl bg-surface-container border border-outline-variant hover:border-primary/50 transition-all text-left group shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">
              {isAllSelected ? 'folder_copy' : (activeProject.icon || 'apps')}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-space text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <span>Proyecto Activo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            </span>
            <span className="font-space text-xs font-bold text-white truncate max-w-[140px]">
              {isAllSelected ? 'Todos los Proyectos' : activeProject.name}
            </span>
          </div>
        </div>

        <span className={`material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-surface-container-high border border-outline-variant/80 rounded-xl shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn">
          
          <div className="px-2 py-1 text-[10px] font-space text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/60 flex items-center justify-between">
            <span>Cambiar de Software</span>
            <span className="font-mono text-primary">{projects.length} disponibles</span>
          </div>

          {/* Project List */}
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto py-1">
            {projects.map((proj) => {
              const isSelected = activeProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    onSelectProject(proj.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-primary/15 border border-primary/40 text-white font-semibold'
                      : 'hover:bg-surface-container text-on-surface-variant hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {proj.icon || 'apps'}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-space text-xs truncate max-w-[150px]">{proj.name}</span>
                      <span className="text-[10px] text-on-surface-variant/80 font-jakarta truncate">
                        {proj.category || proj.subtitle}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                      check
                    </span>
                  )}
                </button>
              );
            })}

            {/* All Projects Option */}
            <button
              type="button"
              onClick={() => {
                onSelectProject('all');
                setIsOpen(false);
              }}
              className={`flex items-center justify-between p-2 rounded-lg text-left transition-all border-t border-outline-variant/40 mt-1 ${
                isAllSelected
                  ? 'bg-primary/15 border border-primary/40 text-white font-semibold'
                  : 'hover:bg-surface-container text-on-surface-variant hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  dashboard_customize
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-space text-xs">Todos los Proyectos</span>
                  <span className="text-[10px] text-on-surface-variant/80 font-jakarta">
                    Vista consolidada de todo el software
                  </span>
                </div>
              </div>
              {isAllSelected && (
                <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                  check
                </span>
              )}
            </button>
          </div>

          {/* Create New Project CTA */}
          <div className="pt-1.5 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNewProjectModal();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Nuevo Software / Proyecto</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
