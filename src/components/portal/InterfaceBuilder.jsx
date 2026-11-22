import React, { useState, useEffect, useRef } from 'react';
import ModuleSelect from './ModuleSelect';
import DataUsagePicker from './DataUsagePicker';
import DataUsageList from './DataUsageList';
import { ASPECT_RATIO_LABELS, classifyAspect } from '../../utils/aspectRatio';

export default function InterfaceBuilder({
  onSaveInterface,
  onNotify,
  existingStories = [],
  activeProjectId = 'pathway',
  projectActors = [],
  modules = [],
  onAddModule,
  onRenameModule,
  onDeleteModule,
  existingInterfaces = [],
  dataModels = [],
  onAddRole,
  onRolesChange
}) {
  const [number, setNumber] = useState('4');
  const [title, setTitle] = useState('Dashboard');
  const [module, setModule] = useState(() => modules[0] || 'Sin módulo');
  const [platform, setPlatform] = useState('Web & Mobile');
  const [status, setStatus] = useState('Aprobado por Cliente');
  const [linkedStory, setLinkedStory] = useState('US-104');
  const [imageAspect, setImageAspect] = useState(null);
  const [dataUsage, setDataUsage] = useState([]);

  // Business roles assigned to this interface
  const [selectedRoles, setSelectedRoles] = useState(() => {
    if (projectActors && projectActors.length > 0) {
      return [projectActors[0].name];
    }
    return [];
  });
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [showAddCustomRole, setShowAddCustomRole] = useState(false);

  // Notify parent of roles on mount or when selectedRoles change
  useEffect(() => {
    onRolesChange?.(selectedRoles);
  }, [selectedRoles, onRolesChange]);

  // Sync roles only if activeProjectId changes, without wiping user custom roles within the same project
  const prevProjectIdRef = useRef(activeProjectId);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (prevProjectIdRef.current !== activeProjectId) {
      prevProjectIdRef.current = activeProjectId;
      if (projectActors && projectActors.length > 0) {
        const next = [projectActors[0].name];
        setSelectedRoles(next);
        onRolesChange?.(next);
      } else {
        setSelectedRoles([]);
        onRolesChange?.([]);
      }
    } else if (!initializedRef.current && projectActors && projectActors.length > 0 && selectedRoles.length === 0) {
      initializedRef.current = true;
      const next = [projectActors[0].name];
      setSelectedRoles(next);
      onRolesChange?.(next);
    }
  }, [activeProjectId, projectActors, onRolesChange, selectedRoles.length]);

  // Keep the selected module valid when the catalog changes (rename/delete).
  useEffect(() => {
    if (modules.length > 0 && !modules.includes(module)) {
      setModule(modules[0]);
    }
  }, [modules]);

  const handleToggleRole = (roleName) => {
    setSelectedRoles(prev => {
      const next = prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName];
      onRolesChange?.(next);
      return next;
    });
  };

  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim();
    if (!trimmed) return;
    if (!selectedRoles.includes(trimmed)) {
      const next = [...selectedRoles, trimmed];
      setSelectedRoles(next);
      onRolesChange?.(next);
    }
    onAddRole?.(trimmed);
    setCustomRoleInput('');
    setShowAddCustomRole(false);
  };

  // Fields table
  const [objetivo, setObjetivo] = useState('Monitorear ventas, ingresos, egresos y alertas en tiempo real.');
  const [contenido, setContenido] = useState('Ventas, ingresos, egresos, alertas de inventario y accesos rápidos.');
  const [reglas, setReglas] = useState('Solo administrador.');
  const [detalles, setDetalles] = useState('Datos en tiempo real.');

  // Image handling
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // File to base64 reader
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onNotify?.('La imagen supera el límite de 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        onNotify?.('Imagen de interfaz cargada correctamente.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlApply = () => {
    if (imageUrlInput.trim()) {
      setImagePreview(imageUrlInput.trim());
      setImageAspect(null);
      onNotify?.('Enlace de imagen de interfaz aplicado.');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      onNotify?.('Por favor ingresa el título de la interfaz.');
      return;
    }
    if (!objetivo.trim()) {
      onNotify?.('Por favor completa el campo Objetivo de la interfaz.');
      return;
    }
    if (selectedRoles.length === 0) {
      onNotify?.('Por favor asigna al menos un rol del negocio a la interfaz.');
      return;
    }
    if (!module) {
      onNotify?.('Por favor selecciona o crea un módulo para la interfaz.');
      return;
    }

    const numClean = number.trim() || '1';
    const titleClean = title.trim();
    const fullName = `${numClean}. ${titleClean}`;

    const newId = `INT-${Math.floor(10 + Math.random() * 90)}`;

    const newInterface = {
      id: newId,
      projectId: activeProjectId === 'all' ? 'pathway' : activeProjectId,
      number: numClean,
      title: titleClean,
      fullName,
      module,
      platform,
      status,
      imageAspect,
      dataUsage,
      roles: [...selectedRoles],
      image: imagePreview,
      imagePlaceholder: titleClean.toLowerCase().includes('dash') ? 'dashboard' :
                        titleClean.toLowerCase().includes('login') ? 'login' :
                        titleClean.toLowerCase().includes('meta') ? 'goal_create' :
                        titleClean.toLowerCase().includes('paso') ? 'steps_roadmap' :
                        titleClean.toLowerCase().includes('onboard') ? 'onboarding' : 'dashboard',
      fields: {
        objetivo: objetivo.trim(),
        contenido: contenido.trim(),
        reglas: reglas.trim(),
        detalles: detalles.trim()
      },
      linkedStory,
      author: 'Usuario Activo',
      reviewedBy: status.includes('Aprobado') ? 'Cliente / PO' : null,
      approvedAt: status.includes('Aprobado') ? new Date().toISOString().split('T')[0] : null,
      version: 'v1.0'
    };

    onSaveInterface?.(newInterface);
    onNotify?.(`¡Ficha de interfaz "${fullName}" registrada exitosamente con ${selectedRoles.length} roles asignados!`);

    // Reset some fields
    setTitle('');
    setNumber(prev => (parseInt(prev, 10) + 1).toString());
    setObjetivo('');
    setContenido('');
    setReglas('');
    setDetalles('');
    setImagePreview(null);
    setImageUrlInput('');
    setImageAspect(null);
    setDataUsage([]);
    if (projectActors.length > 0) {
      setSelectedRoles([projectActors[0].name]);
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col gap-5 shadow-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
          </div>
          <div>
            <h2 className="font-space text-sm font-bold text-white flex items-center gap-2">
              <span>Nueva Ficha de Interfaz</span>
              <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 text-[10px] font-mono">
                UI SPEC
              </span>
            </h2>
            <p className="font-jakarta text-[11px] text-on-surface-variant">
              Imagen de la interfaz + cuadro formal de especificación
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setTitle('');
            setObjetivo('');
            setContenido('');
            setReglas('');
            setDetalles('');
            setImagePreview(null);
            setImageAspect(null);
            setDataUsage([]);
          }}
          className="text-on-surface-variant hover:text-white p-1 rounded transition-colors"
          title="Limpiar formulario"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* 1. Título y Número */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-3 flex flex-col gap-1">
            <label className="text-xs font-space text-white">Número</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="ej. 4"
              className="h-9 px-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-space font-bold text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-9 flex flex-col gap-1">
            <label className="text-xs font-space text-white flex items-center justify-between">
              <span>Nombre de la Interfaz *</span>
              <span className="text-[10px] text-on-surface-variant">Ej: Dashboard</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Dashboard"
              className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 2. Asignación de Roles del Negocio */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-space text-white font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
              <span>Roles del Negocio Asignados *</span>
            </label>
            <span className="text-[11px] font-mono text-primary font-bold">
              {selectedRoles.length} {selectedRoles.length === 1 ? 'rol asignado' : 'roles asignados'}
            </span>
          </div>
          <p className="font-jakarta text-[11px] text-on-surface-variant">
            Selecciona los roles del negocio que interactúan o tienen permisos en esta pantalla:
          </p>

          {/* Role Chips Toggle Group */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {projectActors.map((actor) => {
              const isSelected = selectedRoles.includes(actor.name);
              return (
                <button
                  type="button"
                  key={actor.id || actor.name}
                  onClick={() => handleToggleRole(actor.name)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-space transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/20 border border-primary text-white font-bold shadow-sm'
                      : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:text-white hover:border-outline-variant/80'
                  }`}
                  title={`${actor.category} — ${actor.description || ''}`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {isSelected ? 'check_circle' : (actor.avatarIcon || 'person')}
                  </span>
                  <span>{actor.name}</span>
                </button>
              );
            })}

            {/* Any selected custom roles that are not in projectActors */}
            {selectedRoles.filter(r => !projectActors.some(a => a.name === r)).map((customRole) => (
              <span
                key={customRole}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-space bg-primary/20 border border-primary text-white font-bold shadow-sm"
              >
                <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                <span>{customRole}</span>
                <button
                  type="button"
                  onClick={() => handleToggleRole(customRole)}
                  className="hover:text-red-400 ml-0.5 text-on-surface-variant"
                  title="Remover rol"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            ))}
          </div>

          {/* Add custom / additional role */}
          {showAddCustomRole ? (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                placeholder="Nombre del rol del negocio..."
                className="h-8 px-2.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-jakarta text-white flex-1 focus:border-primary focus:outline-none"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomRole(); } }}
              />
              <button
                type="button"
                onClick={handleAddCustomRole}
                className="px-3 h-8 rounded-lg bg-primary text-on-primary font-space text-xs font-bold"
              >
                Asignar
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustomRole(false)}
                className="px-2 h-8 rounded-lg text-on-surface-variant hover:text-white text-xs font-space"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowAddCustomRole(true)}
                className="inline-flex items-center gap-1 text-[11px] font-space text-primary hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>+ Asignar otro rol del negocio</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Sección de Imagen de la Interfaz */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
          <span className="text-xs font-space text-white font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">add_photo_alternate</span>
            <span>Imagen o Wireframe de la Pantalla:</span>
          </span>

          {imagePreview ? (
            <div className={`relative rounded-lg overflow-hidden border border-outline-variant p-2 bg-surface-container flex items-center justify-center max-h-48 ${classifyAspect(imageAspect) === 'phone' ? 'max-w-[240px] mx-auto' : ''}`}>
              <img
                src={imagePreview}
                alt="Preview"
                onLoad={(event) => {
                  const el = event.currentTarget;
                  if (el.naturalWidth && el.naturalHeight) {
                    setImageAspect(el.naturalWidth / el.naturalHeight);
                  }
                }}
                className="max-h-44 object-contain rounded"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                title="Quitar imagen"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant hover:border-primary rounded-lg p-3 text-center cursor-pointer transition-colors bg-surface-container/40"
              >
                <span className="material-symbols-outlined text-primary text-[24px]">cloud_upload</span>
                <p className="text-[11px] text-white font-space mt-1">Haz clic para subir imagen o wireframe (PNG, JPG)</p>
                <span className="text-[10px] text-on-surface-variant">O déjalo vacío para usar el mockup interactivo generado</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* URL fallback */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="O pega URL de imagen (Figma / Web)..."
                  className="h-8 px-2.5 bg-surface-container border border-outline-variant rounded text-[11px] font-mono text-white flex-1 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="px-2.5 h-8 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space"
                >
                  Cargar
                </button>
              </div>
            </div>
          )}

          {imageAspect && (
            <span className="text-[10px] font-jakarta text-on-surface-variant">
              Relación detectada automáticamente:{' '}
              <span className="text-primary font-semibold">
                {ASPECT_RATIO_LABELS[classifyAspect(imageAspect)] || '—'}
              </span>
            </span>
          )}
        </div>

        {/* 3. Cuadro con sus Detalles (Exact format: Campo | Detalle) */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-space text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">list_alt</span>
            <span>Cuadro con sus Detalles:</span>
          </span>

          {/* Campo: Objetivo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white flex items-center justify-between">
              <span className="font-semibold text-primary">Objetivo *</span>
              <span className="text-[10px] text-on-surface-variant font-mono">¿Qué busca lograr?</span>
            </label>
            <textarea
              rows={2}
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="ej. Monitorear ventas, ingresos, egresos y alertas en tiempo real."
              className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Campo: Contenido */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white flex items-center justify-between">
              <span className="font-semibold text-primary">Contenido *</span>
              <span className="text-[10px] text-on-surface-variant font-mono">¿Qué elementos incluye?</span>
            </label>
            <textarea
              rows={2}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="ej. Ventas, ingresos, egresos, alertas de inventario y accesos rápidos."
              className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Campo: Reglas */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white flex items-center justify-between">
              <span className="font-semibold text-primary">Reglas</span>
              <span className="text-[10px] text-on-surface-variant font-mono">¿Qué restricciones aplican?</span>
            </label>
            <textarea
              rows={2}
              value={reglas}
              onChange={(e) => setReglas(e.target.value)}
              placeholder="ej. Solo administrador."
              className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Campo: Detalles */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white flex items-center justify-between">
              <span className="font-semibold text-primary">Detalles</span>
              <span className="text-[10px] text-on-surface-variant font-mono">Aspectos técnicos / comportamiento</span>
            </label>
            <textarea
              rows={2}
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              placeholder="ej. Datos en tiempo real."
              className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Datos utilizados por la interfaz */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
          <span className="text-xs font-space text-white font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">database</span>
            <span>Datos Utilizados en esta Interfaz</span>
          </span>
          <p className="font-jakarta text-[11px] text-on-surface-variant">
            Busca campos del Modelado de Datos. Cada sugerencia incluye la tabla y el esquema al que pertenece.
          </p>
          <DataUsagePicker
            tables={dataModels}
            selected={dataUsage}
            onChange={setDataUsage}
            onNotify={onNotify}
          />
          <DataUsageList
            items={dataUsage}
            onRemove={(key) => setDataUsage(prev => prev.filter(ref => ref.key !== key))}
            onUpdate={(key, updated) => setDataUsage(prev => prev.map(ref => ref.key === key ? { ...ref, ...updated } : ref))}
            onAdd={(newItem) => setDataUsage(prev => [...prev, newItem])}
            tables={dataModels}
            onNotify={onNotify}
          />
        </div>

        {/* 5. Metadatos complementarios */}
        <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/60">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">Módulo</label>
            <ModuleSelect
              value={module}
              modules={modules}
              onChange={setModule}
              onAdd={onAddModule}
              onRename={onRenameModule}
              onDelete={onDeleteModule}
              interfaces={existingInterfaces}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">Estado Inicial</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            >
              <option value="Aprobado por Cliente">Aprobado por Cliente</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Borrador">Borrador</option>
            </select>
          </div>
        </div>

        {/* Historia vinculada */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-space text-white">Historia de Usuario Vinculada</label>
          <select
            value={linkedStory}
            onChange={(e) => setLinkedStory(e.target.value)}
            className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-mono text-white focus:border-primary focus:outline-none"
          >
            {existingStories.map(story => (
              <option key={story.id} value={story.id}>
                {story.id} — {story.module} ({story.role})
              </option>
            ))}
          </select>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.01] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[17px]">save</span>
          <span>Registrar Ficha de Pantalla</span>
        </button>

      </form>
    </div>
  );
}
