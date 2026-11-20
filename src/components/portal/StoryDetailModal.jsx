import React, { useState, useEffect } from 'react';

export default function StoryDetailModal({ story, isOpen, onClose, onUpdateStory }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (story) {
      setFormData({ ...story });
    }
  }, [story]);

  if (!isOpen || !formData) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateStory(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface-container border border-outline-variant rounded-xl shadow-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-space text-lg font-bold text-primary font-mono">{formData.id}</span>
            <span className="text-white font-space font-semibold text-sm">— Detalle de Requerimiento</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white">Módulo</label>
              <input 
                type="text" 
                value={formData.module} 
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                className="h-8 bg-surface-container-lowest border border-outline-variant rounded px-2.5 text-xs text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white">Prioridad</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="h-8 bg-surface-container-lowest border border-outline-variant rounded px-2 text-xs text-white"
              >
                <option>Baja</option>
                <option>Media</option>
                <option>Alta</option>
                <option>Bloqueante</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white">Como (Rol)</label>
            <input 
              type="text" 
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="h-8 bg-surface-container-lowest border border-outline-variant rounded px-2.5 text-xs text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white">Quiero (Acción)</label>
            <textarea 
              rows="3"
              value={formData.action} 
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded p-2.5 text-xs text-white resize-none"
            ></textarea>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white">Para que (Beneficio)</label>
            <textarea 
              rows="2"
              value={formData.benefit} 
              onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded p-2.5 text-xs text-white resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white">Estado de Aprobación</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-8 bg-surface-container-lowest border border-outline-variant rounded px-2 text-xs text-white"
              >
                <option>Aprobado por PO</option>
                <option>Under Review</option>
                <option>Draft</option>
                <option>Approved</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white">Autor</label>
              <input 
                type="text" 
                value={formData.author} 
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="h-8 bg-surface-container-lowest border border-outline-variant rounded px-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/60">
            <button 
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded text-xs font-space text-on-surface-variant hover:text-white"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider"
            >
              Guardar Cambios
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
