import React, { useState, useEffect } from 'react';
import { 
  PERMISSION_LEVEL_OPTIONS, 
  ACTOR_CATEGORY_OPTIONS, 
  SYSTEM_AREA_OPTIONS 
} from '../../data/initialActors';

const AVATAR_OPTIONS = [
  { icon: 'person', label: 'Usuario / Persona' },
  { icon: 'psychology', label: 'Psicología / Metas' },
  { icon: 'admin_panel_settings', label: 'Admin / Seguridad' },
  { icon: 'point_of_sale', label: 'Ventas / Caja' },
  { icon: 'inventory_2', label: 'Inventario / Almacén' },
  { icon: 'shield_person', label: 'Oficial de Campo' },
  { icon: 'verified_user', label: 'Auditor / Cumplimiento' },
  { icon: 'route', label: 'Ruta / Progreso' },
  { icon: 'groups', label: 'Equipo / Comunidad' }
];

const COLOR_OPTIONS = [
  { id: 'emerald', label: 'Verde Esmeralda', bg: 'bg-emerald-500' },
  { id: 'sky', label: 'Azul Cielo', bg: 'bg-sky-500' },
  { id: 'purple', label: 'Púrpura', bg: 'bg-purple-500' },
  { id: 'cyan', label: 'Cian Neón', bg: 'bg-cyan-500' },
  { id: 'amber', label: 'Ámbar Cálido', bg: 'bg-amber-500' },
  { id: 'primary', label: 'Dorado Pathrimonio', bg: 'bg-primary' }
];

export default function ActorDetailModal({
  actor,
  isOpen,
  onClose,
  onUpdateActor,
  existingStories = [],
  onNotify
}) {
  const [formData, setFormData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newAreaInput, setNewAreaInput] = useState('');

  useEffect(() => {
    if (actor) {
      setFormData({
        ...actor,
        systemAreas: actor.systemAreas || []
      });
    }
  }, [actor]);

  if (!isOpen || !formData) return null;

  const toggleArea = (area) => {
    const current = formData.systemAreas || [];
    if (current.includes(area)) {
      if (current.length === 1) return;
      setFormData({
        ...formData,
        systemAreas: current.filter(a => a !== area)
      });
    } else {
      setFormData({
        ...formData,
        systemAreas: [...current, area]
      });
    }
  };

  const handleAddCustomArea = (e) => {
    e.preventDefault();
    const clean = newAreaInput.trim();
    if (!clean) return;
    const current = formData.systemAreas || [];
    if (!current.includes(clean)) {
      setFormData({
        ...formData,
        systemAreas: [...current, clean]
      });
      setNewAreaInput('');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateActor(formData);
    onClose();
  };

  const handleCopyLink = () => {
    const origin = window.location.origin;
    const roleParam = encodeURIComponent(formData.name);
    const link = `${origin}/#portal?tab=stories&role=${roleParam}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      onNotify?.(`Enlace para "${formData.assignedWorkerName || formData.name}" copiado al portapapeles.`);
    }
  };

  // Linked stories
  const linkedStories = existingStories.filter(s => (s.role || '').toLowerCase().trim() === formData.name.toLowerCase().trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <div className="flex items-center gap-3">
            <span className="font-space text-lg font-bold text-primary font-mono">{formData.id}</span>
            <span className="text-white font-space font-semibold text-base">
              — Ficha Formal de Actor / Rol del Negocio
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* Row 1: Nombre & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Nombre del Rol o Actor</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 text-xs text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Categoría</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 text-xs text-white focus:outline-none focus:border-primary"
              >
                {ACTOR_CATEGORY_OPTIONS.filter(c => c !== 'Todas').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Permisos & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Nivel de Permisos en el Sistema</label>
              <select 
                value={formData.permissionLevel}
                onChange={(e) => setFormData({ ...formData, permissionLevel: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 text-xs text-white focus:outline-none focus:border-primary"
              >
                {PERMISSION_LEVEL_OPTIONS.filter(p => p !== 'Todos').map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Estado del Rol</label>
              <select 
                value={formData.status || 'Activo'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="Activo">Activo</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Inactivo / Descontinuado">Inactivo / Descontinuado</option>
              </select>
            </div>
          </div>

          {/* Row 3: Ícono & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-space text-xs text-white font-medium">Ícono Identificador</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AVATAR_OPTIONS.map((item) => (
                  <button
                    key={item.icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarIcon: item.icon })}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                      formData.avatarIcon === item.icon
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-space text-xs text-white font-medium">Color de Tarjeta</label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: col.id })}
                    className={`w-6 h-6 rounded-full ${col.bg} transition-transform ${
                      formData.color === col.id ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-container scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={col.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Descripción */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">
              Descripción y Responsabilidades del Negocio
            </label>
            <textarea 
              rows="3"
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Row 5: Áreas de Negocio con Permisos */}
          <div className="flex flex-col gap-2">
            <label className="font-space text-xs text-white flex items-center justify-between">
              <span className="font-medium">Áreas de Negocio con Permisos</span>
              <span className="text-primary font-mono text-[10px]">
                {formData.systemAreas?.length || 0} autorizadas
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-surface-container-lowest border border-outline-variant rounded-xl">
              {SYSTEM_AREA_OPTIONS.map((area) => {
                const checked = formData.systemAreas?.includes(area);
                return (
                  <label
                    key={area}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                      checked ? 'bg-primary/10 text-white' : 'hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleArea(area)}
                      className="rounded border-outline-variant text-primary focus:ring-0"
                    />
                    <span className="font-jakarta text-[11px] truncate">{area}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newAreaInput}
                onChange={(e) => setNewAreaInput(e.target.value)}
                placeholder="Añadir otra área de negocio..."
                className="flex-1 h-8 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddCustomArea}
                className="h-8 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-white font-space text-xs transition-colors"
              >
                + Agregar
              </button>
            </div>
          </div>

          {/* Row 6: Asignación de Trabajador & Enlace de Colaboración */}
          <div className="p-3 bg-surface-container/60 border border-outline-variant/80 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">share</span>
                <span className="font-space text-xs font-semibold text-white">
                  Colaborador Asignado & Enlace Compartible
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-highest hover:bg-surface-container text-white font-space text-[11px] border border-outline-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedLink ? 'check' : 'content_copy'}
                </span>
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.assignedWorkerName || ''}
                onChange={(e) => setFormData({ ...formData, assignedWorkerName: e.target.value })}
                placeholder="Nombre del trabajador"
                className="h-8 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
              />
              <input
                type="email"
                value={formData.assignedWorker || ''}
                onChange={(e) => setFormData({ ...formData, assignedWorker: e.target.value })}
                placeholder="Email corporativo"
                className="h-8 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Row 7: Historias vinculadas */}
          {linkedStories.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="font-space text-xs text-white font-medium">
                Historias de Usuario formuladas para este Rol ({linkedStories.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {linkedStories.map(s => (
                  <span
                    key={s.id}
                    className="px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant font-mono text-[11px] text-primary"
                  >
                    {s.id}: Como {s.role}, quiero {s.action?.slice(0, 30)}...
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Primary Role checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.isPrimaryRole || false}
              onChange={(e) => setFormData({ ...formData, isPrimaryRole: e.target.checked })}
              className="rounded border-outline-variant text-primary focus:ring-0"
            />
            <span className="font-space text-xs text-white">Marcar como Rol Principal del Proyecto</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-white font-space text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
            >
              Guardar Cambios
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
