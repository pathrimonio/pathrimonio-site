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
  const [status, setStatus] = useState('Borrador');
  const [linkedStory, setLinkedStory] = useState(() => existingStories[0]?.id || '');
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

  // Keep the linked story valid when the project stories change.
  useEffect(() => {
    if (linkedStory && !existingStories.some((story) => story.id === linkedStory)) {
      setLinkedStory(existingStories[0]?.id || '');
    }
  }, [existingStories, linkedStory]);

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

  // Image handling (multiple images support)
  const [images, setImages] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // Files to base64 reader (supports multiple files)
  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    const validFiles = fileList.filter((f) => f.size <= 8 * 1024 * 1024);
    if (validFiles.length < fileList.length) {
      onNotify?.('Algunas imágenes superaban el límite de 8MB y fueron omitidas.');
    }
    if (validFiles.length === 0) return;

    let loaded = [];
    let count = 0;
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        loaded.push(event.target.result);
        count++;
        if (count === validFiles.length) {
          setImages((prev) => {
            const next = [...prev, ...loaded];
            setActiveImageIdx(next.length - 1);
            return next;
          });
          onNotify?.(`¡${validFiles.length} imagen(es) agregada(s) correctamente!`);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleUrlApply = () => {
    const trimmed = imageUrlInput.trim();
    if (trimmed) {
      setImages((prev) => {
        const next = [...prev, trimmed];
        setActiveImageIdx(next.length - 1);
        return next;
      });
      setImageUrlInput('');
      onNotify?.('Enlace de imagen agregado a la interfaz.');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (activeImageIdx >= next.length) {
        setActiveImageIdx(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.unshift(moved);
      return copy;
    });
    setActiveImageIdx(0);
    onNotify?.('Imagen establecida como portada principal de la interfaz.');
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
      image: images[0] || null,
      images: [...images],
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
    onNotify?.(`¡Ficha de interfaz "${fullName}" registrada exitosamente con ${images.length} imágenes y ${selectedRoles.length} roles asignados!`);

    // Reset some fields
    setTitle('');
    setNumber(prev => (parseInt(prev, 10) + 1).toString());
    setObjetivo('');
    setContenido('');
    setReglas('');
    setDetalles('');
    setImages([]);
    setActiveImageIdx(0);
    setImageUrlInput('');
    setImageAspect(null);
    setDataUsage([]);
    setStatus('Borrador');
    setLinkedStory(existingStories[0]?.id || '');
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
            setImages([]);
            setActiveImageIdx(0);
            setImageUrlInput('');
            setImageAspect(null);
            setDataUsage([]);
            setStatus('Borrador');
            setLinkedStory(existingStories[0]?.id || '');
          }}
          className="text-on-surface-variant hover:text-white p-1 rounded transition-colors"
          title="Limpiar formulario"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* 1. Módulo, Número, Nombre e Historia vinculada */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 flex flex-col gap-1">
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
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-space text-white">Número</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="ej. 4"
              className="w-full h-9 px-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-space font-bold text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-6 flex flex-col gap-1">
            <label className="text-xs font-space text-white flex items-center justify-between">
              <span>Nombre de la Interfaz *</span>
              <span className="text-[10px] text-on-surface-variant">Ej: Dashboard</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Dashboard"
              className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-6 sm:col-start-7 flex flex-col gap-1">
            <label className="text-xs font-space text-white">Historia de Usuario Vinculada</label>
            <select
              value={linkedStory}
              onChange={(e) => setLinkedStory(e.target.value)}
              className="w-full h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-mono text-white focus:border-primary focus:outline-none"
            >
              <option value="">Sin historia vinculada</option>
              {existingStories.map(story => (
                <option key={story.id} value={story.id}>
                  {story.id} — {story.module} ({story.role})
                </option>
              ))}
            </select>
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
            {/* Roles Asignados a esta Interfaz */}
            {selectedRoles.map((roleName) => (
              <span
                key={roleName}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-space bg-primary/20 border border-primary text-white font-bold shadow-sm"
              >
                <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                <span>{roleName}</span>
                <button
                  type="button"
                  onClick={() => handleToggleRole(roleName)}
                  className="hover:text-red-400 ml-0.5 text-on-surface-variant transition-colors"
                  title="Remover rol"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            ))}

            {/* Roles disponibles en el proyecto no asignados aún */}
            {projectActors.filter(a => !selectedRoles.includes(a.name)).map((actor) => (
              <button
                type="button"
                key={actor.id || actor.name}
                onClick={() => handleToggleRole(actor.name)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-space bg-surface-container border border-outline-variant text-on-surface-variant hover:text-white hover:border-outline-variant/80 transition-all cursor-pointer"
                title={`${actor.category} — ${actor.description || ''}`}
              >
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                  {actor.avatarIcon || 'person'}
                </span>
                <span>{actor.name}</span>
              </button>
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
        <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-space text-white font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">add_photo_alternate</span>
              <span>Imágenes o Wireframes de la Pantalla:</span>
            </span>
            {images.length > 0 && (
              <span className="text-[11px] font-mono text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">photo_library</span>
                <span>{images.length} {images.length === 1 ? 'imagen' : 'imágenes'}</span>
              </span>
            )}
          </div>

          {images.length > 0 ? (
            <div className="flex flex-col gap-3">
              {/* Visor de la imagen actualmente seleccionada */}
              <div className={`relative rounded-lg overflow-hidden border border-outline-variant p-2 bg-surface-container flex items-center justify-center max-h-52 ${classifyAspect(imageAspect) === 'phone' ? 'max-w-[240px] mx-auto' : ''}`}>
                <img
                  src={images[activeImageIdx] || images[0]}
                  alt={`Preview ${activeImageIdx + 1}`}
                  onLoad={(event) => {
                    const el = event.currentTarget;
                    if (el.naturalWidth && el.naturalHeight) {
                      setImageAspect(el.naturalWidth / el.naturalHeight);
                    }
                  }}
                  className="max-h-48 object-contain rounded"
                />

                {/* Badges on active preview */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/20">
                    {activeImageIdx + 1} / {images.length}
                  </span>
                  {activeImageIdx === 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 font-space text-[10px] font-bold">
                      ★ Portada
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(activeImageIdx)}
                      className="px-2 py-0.5 rounded-full bg-black/75 hover:bg-primary hover:text-on-primary text-white font-space text-[10px] border border-white/20 transition-colors cursor-pointer"
                      title="Convertir esta imagen en la portada principal"
                    >
                      Hacer portada
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveImage(activeImageIdx)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors cursor-pointer shadow"
                  title="Quitar esta imagen"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>

              {/* Tira de miniaturas de la galería */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {images.map((src, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-surface-container flex items-center justify-center ${
                        activeImageIdx === idx
                          ? 'border-primary ring-2 ring-primary/40 scale-105'
                          : 'border-outline-variant/60 opacity-70 hover:opacity-100 hover:border-outline-variant'
                      }`}
                      title={`Ver imagen ${idx + 1}`}
                    >
                      <img src={src} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-on-primary font-mono text-[8px] font-bold text-center leading-tight py-0.5 pointer-events-none">
                        PORTADA
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-[10px]">close</span>
                    </button>
                  </div>
                ))}

                {/* Botón para añadir más imágenes */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 rounded-lg border-2 border-dashed border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary flex flex-col items-center justify-center gap-0.5 shrink-0 transition-colors bg-surface-container/30 cursor-pointer"
                  title="Subir más imágenes desde tu dispositivo"
                >
                  <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                  <span className="font-space text-[9px] font-semibold">+ Más</span>
                </button>
              </div>

              {/* URL input para añadir más por enlace */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/40">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlApply(); } }}
                  placeholder="Pegar otra URL de imagen (Figma / Web)..."
                  className="h-8 px-2.5 bg-surface-container border border-outline-variant rounded text-[11px] font-mono text-white flex-1 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="px-2.5 h-8 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space shrink-0 cursor-pointer"
                >
                  + Añadir URL
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant hover:border-primary rounded-lg p-3 text-center cursor-pointer transition-colors bg-surface-container/40"
              >
                <span className="material-symbols-outlined text-primary text-[24px]">cloud_upload</span>
                <p className="text-[11px] text-white font-space mt-1 font-semibold">
                  Haz clic para subir una o varias imágenes (PNG, JPG)
                </p>
                <span className="text-[10px] text-on-surface-variant">
                  Puedes seleccionar múltiples capturas a la vez o agregar por URL
                </span>
              </div>

              {/* URL fallback */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlApply(); } }}
                  placeholder="O pega URL de imagen (Figma / Web)..."
                  className="h-8 px-2.5 bg-surface-container border border-outline-variant rounded text-[11px] font-mono text-white flex-1 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="px-2.5 h-8 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space shrink-0 cursor-pointer"
                >
                  Cargar
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

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
            <label className="text-xs font-space text-white">Estado Inicial</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            >
              <option value="Borrador">Borrador</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Aprobado por Cliente">Aprobado por Cliente</option>
            </select>
          </div>
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
