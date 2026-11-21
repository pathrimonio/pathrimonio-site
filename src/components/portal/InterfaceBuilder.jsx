import React, { useState } from 'react';
import { 
  INTERFACE_MODULE_OPTIONS, 
  PLATFORM_OPTIONS, 
  INTERFACE_TYPE_OPTIONS 
} from '../../data/initialInterfaces';

export default function InterfaceBuilder({ 
  onSaveInterface, 
  onNotify, 
  existingStories = [] 
}) {
  const [module, setModule] = useState('Metas & Hábitos (Pathway)');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Ambas Plataformas');
  const [interfaceType, setInterfaceType] = useState('Pantalla Principal');
  const [priority, setPriority] = useState('Alta');
  const [version, setVersion] = useState('v1.0');
  
  const [description, setDescription] = useState('');
  const [userGoal, setUserGoal] = useState('');
  
  // Entry points (chips)
  const [entryPoints, setEntryPoints] = useState(['Navegación principal', 'Acceso directo']);
  const [newEntryPoint, setNewEntryPoint] = useState('');

  // Wireframe
  const [wireframeRef, setWireframeRef] = useState('');

  // UI Annotations list (element + behavior)
  const [annotations, setAnnotations] = useState([
    { id: '1', element: 'Botón de Acción Principal', behavior: 'Valida los campos obligatorios y transiciona al siguiente paso' }
  ]);
  const [newElement, setNewElement] = useState('');
  const [newBehavior, setNewBehavior] = useState('');

  // Visual acceptance criteria
  const [criteria, setCriteria] = useState([
    { id: '1', text: 'Respeta la paleta oscura oficial con acentos ámbar #F5A623', checked: true },
    { id: '2', text: 'Diseño responsive y operable con una sola mano en móvil', checked: true }
  ]);
  const [newCriterionText, setNewCriterionText] = useState('');

  // Linked user stories
  const [selectedStories, setSelectedStories] = useState(['US-101']);

  // Handle entry point add/remove
  const handleAddEntryPoint = (e) => {
    e?.preventDefault();
    if (!newEntryPoint.trim()) return;
    if (!entryPoints.includes(newEntryPoint.trim())) {
      setEntryPoints([...entryPoints, newEntryPoint.trim()]);
    }
    setNewEntryPoint('');
  };

  const handleRemoveEntryPoint = (point) => {
    setEntryPoints(entryPoints.filter(p => p !== point));
  };

  // Handle UI Annotations add/remove
  const handleAddAnnotation = (e) => {
    e?.preventDefault();
    if (!newElement.trim() || !newBehavior.trim()) {
      onNotify?.('Completa el elemento y comportamiento para la anotación.');
      return;
    }
    setAnnotations([
      ...annotations,
      {
        id: Date.now().toString(),
        element: newElement.trim(),
        behavior: newBehavior.trim()
      }
    ]);
    setNewElement('');
    setNewBehavior('');
  };

  const handleRemoveAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  // Handle criteria add/remove/toggle
  const handleAddCriterion = (e) => {
    e?.preventDefault();
    if (!newCriterionText.trim()) return;
    setCriteria([
      ...criteria,
      { id: Date.now().toString(), text: newCriterionText.trim(), checked: true }
    ]);
    setNewCriterionText('');
  };

  const handleToggleCriterion = (id) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleRemoveCriterion = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  // Toggle story link
  const handleToggleStoryLink = (storyId) => {
    if (selectedStories.includes(storyId)) {
      setSelectedStories(selectedStories.filter(id => id !== storyId));
    } else {
      setSelectedStories([...selectedStories, storyId]);
    }
  };

  // Form submit
  const handleSubmit = (status = 'En Revisión') => {
    if (!name.trim()) {
      onNotify?.('Por favor indica el nombre de la pantalla o interfaz.');
      return;
    }
    if (!description.trim()) {
      onNotify?.('Por favor redacta la descripción funcional de la interfaz.');
      return;
    }

    const newId = `INT-${Math.floor(100 + Math.random() * 900)}`;

    const newInterface = {
      id: newId,
      module,
      name: name.trim(),
      platform,
      interfaceType,
      priority,
      status, // 'Borrador' | 'En Revisión' | 'Aprobado por Cliente'
      version: version.trim() || 'v1.0',
      description: description.trim(),
      userGoal: userGoal.trim(),
      entryPoints: [...entryPoints],
      wireframeRef: wireframeRef.trim() || `wireframe_${newId.toLowerCase()}_spec.png`,
      annotations: [...annotations],
      visualCriteria: [...criteria],
      linkedStories: [...selectedStories],
      author: 'Usuario Activo',
      createdAt: 'Justo ahora',
      reviewedBy: status === 'Aprobado por Cliente' ? 'Cliente / PO' : null,
      approvedAt: status === 'Aprobado por Cliente' ? new Date().toISOString().split('T')[0] : null
    };

    onSaveInterface?.(newInterface);
    onNotify?.(`¡Interfaz ${newId} (${name}) formalizada y registrada exitosamente!`);

    // Reset some fields for next entry
    setName('');
    setDescription('');
    setUserGoal('');
    setWireframeRef('');
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-5 shadow-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[18px]">design_services</span>
          </div>
          <div>
            <h2 className="font-space text-sm font-bold text-white flex items-center gap-2">
              <span>Formalizador de Interfaces</span>
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 text-[10px] font-mono">
                UI SPEC
              </span>
            </h2>
            <p className="font-jakarta text-[11px] text-on-surface-variant">
              Define y valida contratos de pantalla con el cliente antes del desarrollo
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setName('');
            setDescription('');
            setUserGoal('');
            setWireframeRef('');
          }}
          className="text-on-surface-variant hover:text-white p-1 rounded text-xs transition-colors"
          title="Limpiar formulario"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
        </button>
      </div>

      {/* Block 1: Identificación & Metadatos */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs font-space text-primary font-semibold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>1. Identificación de Pantalla</span>
        </div>

        {/* Nombre de Pantalla */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-space text-white flex items-center justify-between">
            <span>Nombre de la Pantalla / Flujo UI *</span>
            <span className="text-[10px] text-on-surface-variant font-mono">Ej: Dashboard de Metas</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Pantalla de Selección de Pasos Semanales"
            className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Módulo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">Módulo del Sistema</label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            >
              {INTERFACE_MODULE_OPTIONS.filter(m => m !== 'Todos').map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>

          {/* Plataforma */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">Plataforma Objetivo</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            >
              {PLATFORM_OPTIONS.filter(p => p !== 'Todas').map(plat => (
                <option key={plat} value={plat}>{plat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tipo de Interfaz */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">Tipo de Interfaz</label>
            <select
              value={interfaceType}
              onChange={(e) => setInterfaceType(e.target.value)}
              className="h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            >
              {INTERFACE_TYPE_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white focus:border-primary focus:outline-none"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Bloqueante">Bloqueante</option>
            </select>
          </div>

          {/* Versión */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-space text-white">Versión Spec</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v1.0"
              className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-mono text-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Block 2: Contenido Funcional y Objetivo */}
      <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/60">
        <div className="flex items-center gap-1.5 text-xs font-space text-primary font-semibold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">description</span>
          <span>2. Especificación Funcional</span>
        </div>

        {/* Descripción Funcional */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-space text-white">
            Comportamiento Funcional de la Pantalla *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe qué muestra la pantalla, qué interacciones permite y cómo responde a las acciones del usuario..."
            className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Objetivo del Usuario */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-space text-white">
            Objetivo de Usuario (User Goal)
          </label>
          <input
            type="text"
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            placeholder="ej. Crear un nuevo hábito diario en menos de 15 segundos"
            className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Puntos de Entrada (Chips) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-space text-white">Puntos de Entrada / Navegación</label>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {entryPoints.map(ep => (
              <span key={ep} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-[11px] text-white">
                <span>{ep}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEntryPoint(ep)}
                  className="text-on-surface-variant hover:text-red-400"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newEntryPoint}
              onChange={(e) => setNewEntryPoint(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddEntryPoint(e); }}
              placeholder="Añadir punto de acceso (ej. Push Notification)"
              className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white placeholder-on-surface-variant/60 flex-1 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddEntryPoint}
              className="px-2.5 h-8 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space"
            >
              Añadir
            </button>
          </div>
        </div>
      </div>

      {/* Block 3: Wireframe y Anotaciones UI */}
      <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/60">
        <div className="flex items-center gap-1.5 text-xs font-space text-primary font-semibold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">draw</span>
          <span>3. Wireframe &amp; Anotaciones de Interfaz</span>
        </div>

        {/* Referencia Wireframe */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-space text-white">
            Referencia de Wireframe o Mockup (Archivo / Link)
          </label>
          <input
            type="text"
            value={wireframeRef}
            onChange={(e) => setWireframeRef(e.target.value)}
            placeholder="ej. pathway_step_view_v3.png o https://figma.com/..."
            className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-mono text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Anotaciones UI Dinámicas */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-space text-white flex items-center justify-between">
            <span>Anotaciones de Comportamiento UI</span>
            <span className="text-[10px] text-on-surface-variant">Elemento → Reacción</span>
          </label>

          <div className="flex flex-col gap-1.5">
            {annotations.map(ann => (
              <div key={ann.id} className="p-2 rounded bg-surface-container border border-outline-variant/60 flex items-start justify-between gap-2 text-xs">
                <div className="flex flex-col">
                  <span className="font-space text-primary font-semibold text-[11px]">{ann.element}</span>
                  <span className="text-white/80 font-jakarta text-[11px]">{ann.behavior}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAnnotation(ann.id)}
                  className="text-on-surface-variant hover:text-red-400 p-1"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 pt-1">
            <input
              type="text"
              value={newElement}
              onChange={(e) => setNewElement(e.target.value)}
              placeholder="Elemento (ej. Botón Guardar)"
              className="sm:col-span-5 h-8 px-2.5 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
            />
            <input
              type="text"
              value={newBehavior}
              onChange={(e) => setNewBehavior(e.target.value)}
              placeholder="Comportamiento (ej. Muestra modal)"
              className="sm:col-span-5 h-8 px-2.5 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddAnnotation}
              className="sm:col-span-2 h-8 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space flex items-center justify-center"
              title="Añadir anotación"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Block 4: Criterios de Aceptación Visual */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-space text-primary font-semibold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">checklist</span>
            <span>4. Criterios de Aceptación Visual</span>
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono">
            {criteria.filter(c => c.checked).length}/{criteria.length} validados
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {criteria.map(crit => (
            <div key={crit.id} className="flex items-center justify-between gap-2 p-1.5 rounded bg-surface-container/60 border border-outline-variant/40">
              <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer select-none flex-1">
                <input
                  type="checkbox"
                  checked={crit.checked}
                  onChange={() => handleToggleCriterion(crit.id)}
                  className="rounded border-outline-variant text-primary focus:ring-0 bg-surface-container"
                />
                <span className={crit.checked ? 'text-white/90' : 'text-on-surface-variant line-through'}>
                  {crit.text}
                </span>
              </label>
              <button
                type="button"
                onClick={() => handleRemoveCriterion(crit.id)}
                className="text-on-surface-variant hover:text-red-400 p-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5">
          <input
            type="text"
            value={newCriterionText}
            onChange={(e) => setNewCriterionText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCriterion(e); }}
            placeholder="Añadir criterio visual (ej. Soporta tema oscuro y alto contraste)"
            className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white placeholder-on-surface-variant/60 flex-1 focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddCriterion}
            className="px-2.5 h-8 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space"
          >
            Añadir
          </button>
        </div>
      </div>

      {/* Block 5: Trazabilidad con Historias de Usuario */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/60">
        <div className="flex items-center gap-1.5 text-xs font-space text-primary font-semibold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">hub</span>
          <span>5. Trazabilidad con Historias de Usuario</span>
        </div>
        <p className="font-jakarta text-[11px] text-on-surface-variant">
          Vincula esta interfaz con las historias de requerimientos funcionales que materializa:
        </p>

        <div className="flex flex-wrap gap-1.5">
          {existingStories && existingStories.length > 0 ? (
            existingStories.map(story => {
              const isSelected = selectedStories.includes(story.id);
              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => handleToggleStoryLink(story.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs transition-all ${
                    isSelected 
                      ? 'bg-primary text-on-primary border-primary font-bold shadow-sm' 
                      : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-white hover:border-primary/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isSelected ? 'check' : 'add'}
                  </span>
                  <span>{story.id}</span>
                  <span className="text-[10px] font-sans font-normal opacity-80 max-w-[120px] truncate">
                    ({story.module})
                  </span>
                </button>
              );
            })
          ) : (
            <span className="text-xs text-on-surface-variant italic">No hay historias disponibles para vincular.</span>
          )}
        </div>
      </div>

      {/* Action Submit Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/60">
        <button
          type="button"
          onClick={() => handleSubmit('Borrador')}
          className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs font-semibold transition-all"
        >
          Guardar Borrador
        </button>

        <button
          type="button"
          onClick={() => handleSubmit('En Revisión')}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
          <span>Enviar a Revisión Cliente</span>
        </button>
      </div>

    </div>
  );
}
