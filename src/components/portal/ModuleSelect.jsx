import React, { useEffect, useRef, useState } from 'react';

/**
 * Combobox de módulos con CRUD.
 * - Selecciona un módulo existente.
 * - Cada opción tiene iconos de editar y eliminar (con confirmación).
 * - Al pie, opción para crear un módulo nuevo.
 */
export default function ModuleSelect({
  value,
  modules = [],
  onChange,
  onAdd,
  onRename,
  onDelete,
  interfaces = []
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | 'add' | 'edit'
  const [draft, setDraft] = useState('');
  const [editingModule, setEditingModule] = useState(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        closeAndReset();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (mode) inputRef.current?.focus();
  }, [mode]);

  const usageCount = (name) => interfaces.filter((item) => item.module === name).length;

  const closeAndReset = () => {
    setMode(null);
    setDraft('');
    setEditingModule(null);
  };

  const startAdd = () => {
    setMode('add');
    setEditingModule(null);
    setDraft('');
  };

  const startEdit = (name) => {
    setMode('edit');
    setEditingModule(name);
    setDraft(name);
  };

  const commit = () => {
    const clean = draft.trim();
    if (!clean) {
      closeAndReset();
      return;
    }

    if (mode === 'add') {
      const added = onAdd?.(clean);
      if (added === false) return;
      onChange?.(clean);
      setOpen(false);
      closeAndReset();
      return;
    }

    if (mode === 'edit' && editingModule) {
      if (clean === editingModule) {
        closeAndReset();
        return;
      }
      const renamed = onRename?.(editingModule, clean);
      if (renamed === false) return;
      if (value === editingModule) onChange?.(clean);
      closeAndReset();
    }
  };

  const handleDelete = (name) => {
    const count = usageCount(name);
    const message = count > 0
      ? `¿Eliminar el módulo "${name}" de la base de datos?\n\n${count} interfaz(es) usan este módulo y quedarán sin módulo asignado.\n\nEsta acción no se puede deshacer.`
      : `¿Eliminar el módulo "${name}" de la base de datos?\n\nEsta acción no se puede deshacer.`;

    if (!window.confirm(message)) return;

    const remaining = modules.filter((mod) => mod !== name);
    onDelete?.(name);
    if (value === name) onChange?.(remaining[0] || '');
    if (editingModule === name) closeAndReset();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAndReset();
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-9 w-full px-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white flex items-center justify-between gap-2 focus:border-primary focus:outline-none"
      >
        <span className={`truncate ${value ? 'text-white' : 'text-on-surface-variant'}`}>
          {value || 'Selecciona un módulo'}
        </span>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-1 rounded-xl border border-outline-variant bg-surface-container shadow-2xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1" role="listbox">
            {modules.length === 0 && (
              <p className="px-3 py-2 text-[11px] italic text-on-surface-variant">
                Sin módulos registrados.
              </p>
            )}

            {modules.map((mod) => {
              const isEditing = mode === 'edit' && editingModule === mod;
              const isSelected = value === mod;
              return (
                <div
                  key={mod}
                  className={`flex items-center gap-1 px-1.5 py-0.5 ${isSelected ? 'bg-primary/10' : ''}`}
                >
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-7 min-w-0 flex-1 px-2 bg-surface-container-lowest border border-primary rounded-md text-xs font-jakarta text-white focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange?.(mod);
                        setOpen(false);
                      }}
                      title={mod}
                      className={`min-w-0 flex-1 text-left truncate px-2 py-1.5 rounded-md text-xs font-jakarta transition-colors hover:bg-surface-container-high ${
                        isSelected ? 'text-primary font-bold' : 'text-white'
                      }`}
                    >
                      {mod}
                    </button>
                  )}

                  <div className="flex items-center gap-0.5 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={commit}
                          className="p-1 rounded text-emerald-400 hover:bg-surface-container-high transition-colors"
                          title="Guardar nombre"
                        >
                          <span className="material-symbols-outlined text-[15px]">check</span>
                        </button>
                        <button
                          type="button"
                          onClick={closeAndReset}
                          className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
                          title="Cancelar"
                        >
                          <span className="material-symbols-outlined text-[15px]">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(mod)}
                          className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                          title="Editar módulo"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(mod)}
                          className="p-1 rounded text-on-surface-variant hover:text-red-400 hover:bg-surface-container-high transition-colors"
                          title="Eliminar módulo de la base de datos"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-outline-variant/60 bg-surface-container-low">
            {mode === 'add' ? (
              <div className="flex items-center gap-1 p-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nombre del nuevo módulo"
                  className="h-8 min-w-0 flex-1 px-2 bg-surface-container-lowest border border-primary rounded-md text-xs font-jakarta text-white placeholder:text-on-surface-variant/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={commit}
                  className="h-8 px-2.5 rounded-md bg-primary text-on-primary font-space text-[11px] font-bold"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={closeAndReset}
                  className="h-8 px-1.5 rounded-md text-on-surface-variant hover:text-white transition-colors"
                  title="Cancelar"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startAdd}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] font-space text-primary hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Nuevo módulo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
