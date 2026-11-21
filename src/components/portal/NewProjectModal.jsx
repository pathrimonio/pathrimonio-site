import React, { useState } from 'react';
import { PROJECT_CATEGORIES, PROJECT_ICONS } from '../../data/initialProjects';

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  onNotify
}) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software a Medida');
  const [client, setClient] = useState('');
  const [icon, setIcon] = useState('dashboard');
  const [color, setColor] = useState('amber');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotify?.('Por favor ingresa el nombre del nuevo software o proyecto.');
      return;
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProjectId = slug || `project-${Date.now()}`;

    const newProject = {
      id: newProjectId,
      name: name.trim(),
      shortName: shortName.trim() || name.trim(),
      subtitle: subtitle.trim() || 'Desarrollo de Software Sistemático',
      description: description.trim() || 'Proyecto de software registrado en el portal de Pathrimonio.',
      category,
      client: client.trim() || 'Cliente Externo',
      icon,
      color,
      status: 'Fase Inicial / Requerimientos',
      version: 'v0.1.0',
      modules: ['General', 'Autenticación', 'Módulo Principal']
    };

    onCreateProject(newProject);
    onNotify?.(`¡Proyecto "${newProject.name}" creado y activado!`);

    // Reset
    setName('');
    setShortName('');
    setSubtitle('');
    setDescription('');
    setClient('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space">
              <span className="material-symbols-outlined text-[20px]">add_box</span>
            </div>
            <div>
              <h2 className="font-space text-base font-bold text-white">
                Crear Nuevo Software / Proyecto
              </h2>
              <p className="font-jakarta text-xs text-on-surface-variant">
                Registra un nuevo sistema para gestionar sus historias de usuario e interfaces
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Nombre y Nombre Corto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-space text-white">
                Nombre del Software / Proyecto *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. App de Logística & Rutas"
                className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-space text-white">Nombre Corto</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="ej. Logística"
                className="h-9 px-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Subtítulo / Propósito */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">
              Subtítulo / Objetivo Central
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="ej. Trazabilidad de entregas en tiempo real para transportistas"
              className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Categoría y Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-space text-white">Tipo de Software</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
              >
                {PROJECT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-space text-white">Cliente / Organización</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="ej. Empresa Aliada o Pathrimonio"
                className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-space text-white">Icono Representativo</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                    icon === ic 
                      ? 'bg-primary text-on-primary border-primary shadow-sm scale-105' 
                      : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">Descripción Funcional</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del alcance, usuarios objetivo y metas de este software..."
              className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.01]"
            >
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span>Crear y Activar Software</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
