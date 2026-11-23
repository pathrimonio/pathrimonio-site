import React, { useState, useEffect } from 'react';
import { ROLE_SUGGESTIONS } from '../../data/initialStories';

export default function StoryBuilder({ 
  isOpen = false,
  onClose,
  onSaveStory, 
  onNotify, 
  activeProjectId = 'pathway',
  projectActors = [],
  selectedRole = null,
  onNavigateToActors
}) {
  const [module, setModule] = useState('Gestión de Crédito');
  const [role, setRole] = useState(selectedRole || (projectActors[0]?.name) || 'Oficial de Crédito Comunitario');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');

  const [action, setAction] = useState('Solicitar un microcrédito sin conexión a internet y sincronizar las actas biométricas automáticamente al recuperar cobertura celular.');
  const [benefit, setBenefit] = useState('Las comunidades remotas puedan financiar cosechas sin retrasos por latencia ni pérdidas de expedientes físicos.');
  const [priority, setPriority] = useState('Alta');
  const [criteria, setCriteria] = useState([
    { id: '1', text: 'El formulario guarda datos localmente en SQLite cifrado', checked: true },
    { id: '2', text: 'Notificación clara de estado pendiente de sincronización', checked: true },
    { id: '3', text: 'Validación de firma biométrica opcional para testigos', checked: false }
  ]);
  const [newCriterionText, setNewCriterionText] = useState('');
  const [attachment, setAttachment] = useState({
    name: 'wireframe_offline_flow_v2.png',
    size: '1.4 MB',
    time: 'Subido hace 5 min'
  });

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync role if selectedRole changes from external trigger
  useEffect(() => {
    if (selectedRole) {
      setRole(selectedRole);
      setIsCustomRole(false);
    }
  }, [selectedRole]);

  // If project changes and current role is not in the new project's actors, update gracefully
  useEffect(() => {
    if (projectActors.length > 0) {
      const match = projectActors.some(a => a.name.toLowerCase() === role.toLowerCase());
      if (!match && !isCustomRole && !selectedRole) {
        setRole(projectActors[0].name);
      }
    }
  }, [activeProjectId, projectActors]);

  // Current active actor metadata
  const currentActor = projectActors.find(a => a.name.toLowerCase() === role.toLowerCase());

  const handleRoleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomRole(true);
      setCustomRoleInput('');
    } else {
      setIsCustomRole(false);
      setRole(val);
    }
  };

  const handleToggleCriterion = (id) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleRemoveCriterion = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleAddCriterion = (e) => {
    e?.preventDefault();
    if (!newCriterionText.trim()) return;
    setCriteria([
      ...criteria,
      { id: Date.now().toString(), text: newCriterionText.trim(), checked: true }
    ]);
    setNewCriterionText('');
  };

  const handleSubmit = (status = 'Approved') => {
    const effectiveRole = isCustomRole ? customRoleInput.trim() : role.trim();

    if (!effectiveRole || !action.trim() || !benefit.trim()) {
      onNotify?.('Por favor completa los tres campos de la fórmula de historia (Rol, Acción y Beneficio).');
      return;
    }

    const newStory = {
      id: `US-${Math.floor(100 + Math.random() * 900)}`,
      projectId: activeProjectId === 'all' ? 'pathway' : activeProjectId,
      module,
      role: effectiveRole,
      action: action.trim(),
      benefit: benefit.trim(),
      priority,
      status: status === 'Draft' ? 'Draft' : 'Aprobado por PO',
      criteria: [...criteria],
      attachmentsCount: attachment ? 1 : 0,
      attachmentName: attachment ? attachment.name : null,
      author: 'Usuario Activo',
      createdAt: 'Justo ahora',
      image: null
    };

    onSaveStory(newStory);
    onNotify?.(`Historia ${newStory.id} guardada exitosamente bajo el rol "${effectiveRole}".`);
    onClose?.();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (file) {
      setAttachment({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        time: 'Subido ahora'
      });
      onNotify?.(`Archivo ${file.name} adjuntado.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="relative w-full max-w-2xl bg-surface-container border border-outline-variant rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Sticky Header */}
        <div className="bg-surface-container-low shrink-0 border-b border-outline-variant/60 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space">
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-space text-sm sm:text-base text-white font-bold">
                  Nueva Historia de Usuario
                </h2>
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-semibold uppercase tracking-wider">
                  Modo Guiado
                </span>
              </div>
              <p className="font-jakarta text-[11px] text-on-surface-variant">
                Escribe requerimientos claros y medibles sin jerga técnica.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-container-highest transition-colors"
            title="Cerrar modal (Esc)"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 flex items-start gap-x-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 shrink-0">lightbulb</span>
            <p className="font-jakarta text-xs text-on-surface leading-relaxed">
              <strong className="text-white">Tip de producto:</strong> Selecciona el <strong className="text-primary">Rol del Negocio</strong> registrado para asegurar coherencia con los permisos y áreas de negocio.
            </p>
          </div>

      {/* Structured Formula Inputs */}
      <div className="flex flex-col gap-y-3.5">
        
        {/* Module Selection */}
        <div className="flex flex-col gap-y-1">
          <label className="font-space text-xs text-white flex items-center justify-between">
            <span className="font-medium">Módulo del Software</span>
            <span className="text-on-surface-variant font-space text-[10px] uppercase">Requerido</span>
          </label>
          <div className="relative">
            <select 
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 pr-8 font-jakarta text-xs text-white appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option>Gestión de Crédito</option>
              <option>Autenticación & KYC</option>
              <option>Pasarela de Pagos</option>
              <option>Reportes de Impacto</option>
              <option>Metas & Hábitos</option>
              <option>Gestión & Monitoreo</option>
              <option>Ventas & Facturación</option>
              <option>Inventario & Alertas</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-on-surface-variant text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* ── 1. Role Section (Combobox from Business Actors) ── */}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-space text-xs text-white flex items-center gap-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 font-space text-[10px] text-primary font-bold">1</span>
              <span className="font-medium">As a... (Como...)</span>
            </label>
            
            <div className="flex items-center gap-2">
              <span className="font-space text-[10px] text-on-surface-variant">Rol o Actor</span>
              {onNavigateToActors && (
                <button
                  type="button"
                  onClick={onNavigateToActors}
                  className="text-primary hover:underline font-space text-[10px] flex items-center gap-0.5"
                  title="Gestionar matriz de roles y actores"
                >
                  <span className="material-symbols-outlined text-[12px]">add</span>
                  <span>Nuevo Rol</span>
                </button>
              )}
            </div>
          </div>

          {/* Combobox Dropdown */}
          {!isCustomRole ? (
            <div className="relative">
              <select
                value={role}
                onChange={handleRoleSelectChange}
                className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 pr-8 font-jakarta text-xs text-white appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-medium"
              >
                {/* Registered Project Actors */}
                {projectActors.length > 0 && (
                  <optgroup label={`Roles Registrados en Proyecto (${projectActors.length})`}>
                    {projectActors.map((actor) => (
                      <option key={actor.id} value={actor.name}>
                        {actor.name} ({actor.category} — {actor.permissionLevel})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Global Role Suggestions */}
                <optgroup label="Sugerencias Adicionales">
                  {ROLE_SUGGESTIONS.map((r, i) => (
                    <option key={`sug-${i}`} value={r}>{r}</option>
                  ))}
                </optgroup>

                {/* Option to type custom */}
                <option value="__custom__">+ Escribir otro rol personalizado...</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-on-surface-variant text-[18px]">
                unfold_more
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                placeholder="Escribe el nombre del rol personalizado..."
                className="flex-1 h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsCustomRole(false)}
                className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white font-space text-[11px] transition-colors"
                title="Volver a seleccionar de la lista de roles"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Smart Actor Card Preview when registered actor is selected */}
          {currentActor && !isCustomRole && (
            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/70 flex flex-col gap-2 mt-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    {currentActor.avatarIcon || 'person'}
                  </span>
                  <span className="font-space text-xs font-bold text-white truncate">
                    {currentActor.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-semibold shrink-0">
                  {currentActor.permissionLevel}
                </span>
              </div>

              <p className="font-jakarta text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                {currentActor.description}
              </p>

              {/* System areas with permission */}
              {currentActor.systemAreas?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="font-space text-[10px] text-on-surface-variant">Permisos en:</span>
                  {currentActor.systemAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant/60 font-mono text-[9px] text-white"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}

              {/* Collaborator note if assigned */}
              {currentActor.assignedWorkerName && (
                <div className="flex items-center gap-1 text-[10px] text-primary pt-0.5 font-space">
                  <span className="material-symbols-outlined text-[13px]">person_check</span>
                  <span>Asignado a: <strong>{currentActor.assignedWorkerName}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 2. Action Section ── */}
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <label className="font-space text-xs text-white flex items-center gap-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 font-space text-[10px] text-primary font-bold">2</span>
              <span className="font-medium">I want to... (Quiero...)</span>
            </label>
            <span className="font-space text-[10px] text-on-surface-variant">Funcionalidad</span>
          </div>
          <textarea 
            rows="3"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Describe la acción concreta..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          />
        </div>

        {/* ── 3. Benefit Section ── */}
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <label className="font-space text-xs text-white flex items-center gap-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 font-space text-[10px] text-primary font-bold">3</span>
              <span className="font-medium">So that... (Para que...)</span>
            </label>
            <span className="font-space text-[10px] text-on-surface-variant">Valor de negocio</span>
          </div>
          <textarea 
            rows="2"
            value={benefit}
            onChange={(e) => setBenefit(e.target.value)}
            placeholder="¿Cuál es el beneficio directo para el usuario o negocio?"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          />
        </div>

        {/* Acceptance Criteria Checklist (DoD) */}
        <div className="flex flex-col gap-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="font-space text-xs text-white flex items-center gap-x-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">checklist</span>
              <span className="font-medium">Criterios de Aceptación (DoD)</span>
            </label>
            <span className="font-space text-[10px] text-primary font-semibold font-mono">
              {criteria.length} definidos
            </span>
          </div>

          <div className="flex flex-col gap-y-1.5 max-h-48 overflow-y-auto pr-1">
            {criteria.map((c) => (
              <div 
                key={c.id}
                className="flex items-center justify-between gap-x-2 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/60 group hover:border-outline transition-colors"
              >
                <label className="flex items-center gap-x-2 cursor-pointer flex-1 min-w-0">
                  <input 
                    type="checkbox"
                    checked={c.checked}
                    onChange={() => handleToggleCriterion(c.id)}
                    className="w-3.5 h-3.5 rounded-sm bg-surface-container border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className={`font-jakarta text-xs truncate ${c.checked ? 'text-white' : 'text-on-surface-variant line-through'}`}>
                    {c.text}
                  </span>
                </label>
                <button 
                  type="button"
                  onClick={() => handleRemoveCriterion(c.id)}
                  className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar criterio"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>

          {/* Add Criteria Input */}
          <div className="flex items-center gap-x-1.5 pt-0.5">
            <input 
              type="text"
              value={newCriterionText}
              onChange={(e) => setNewCriterionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCriterion(e)}
              placeholder="+ Escribir nuevo criterio..."
              className="h-8 flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 font-jakarta text-xs text-white placeholder-on-surface-variant/60 focus:outline-none focus:border-primary"
            />
            <button 
              type="button"
              onClick={handleAddCriterion}
              className="h-8 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-[11px] transition-colors flex items-center gap-x-1 shrink-0"
            >
              <span className="material-symbols-outlined text-[14px] text-primary">add</span>
              <span>Agregar</span>
            </button>
          </div>
        </div>

        {/* Priority Segmented Control */}
        <div className="flex flex-col gap-y-1.5 pt-1">
          <label className="font-space text-xs text-white font-medium">
            Nivel de Prioridad del Requerimiento
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-lowest border border-outline-variant rounded-xl">
            {['Baja', 'Media', 'Alta', 'Bloqueante'].map((p) => {
              const isSelected = priority === p;
              let activeClass = 'bg-surface-container text-white';
              if (isSelected) {
                if (p === 'Bloqueante') activeClass = 'bg-error-container text-error font-bold border border-error/40';
                else if (p === 'Alta') activeClass = 'bg-primary text-on-primary font-bold shadow-[0_0_8px_rgba(245,166,35,0.3)]';
                else if (p === 'Media') activeClass = 'bg-surface-container-highest text-white font-bold';
                else activeClass = 'bg-surface-container-high text-white font-bold';
              }
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1 text-center font-space text-[11px] rounded-lg transition-all ${
                    isSelected ? activeClass : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact File Dropzone */}
        <div className="flex flex-col gap-y-1.5">
          <label className="font-space text-xs text-white font-medium">
            Material de Apoyo y Wireframes
          </label>
          <label 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="p-3.5 rounded-xl bg-surface-container-lowest border border-dashed border-outline hover:border-primary transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <input type="file" className="hidden" onChange={handleFileDrop} />
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform text-[22px]">
              cloud_upload
            </span>
            <p className="font-jakarta text-xs text-white mt-1">
              Arrastra wireframes aquí, o <span className="text-primary font-medium underline">explorar</span>
            </p>
            <p className="font-space text-[10px] text-on-surface-variant">PNG, Figma, PDF (máx. 25MB)</p>
          </label>

          {/* Attached file chip preview */}
          {attachment && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-lowest border border-outline-variant">
              <div className="flex items-center gap-x-2 min-w-0">
                <span className="material-symbols-outlined text-primary text-[18px]">image</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-space text-xs text-white truncate font-medium">
                    {attachment.name}
                  </span>
                  <span className="font-space text-[10px] text-on-surface-variant">
                    {attachment.size} • {attachment.time}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1 rounded text-on-surface-variant hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}
        </div>

      </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="bg-surface-container-low shrink-0 border-t border-outline-variant/60 p-4 flex items-center justify-end gap-2.5">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-xs transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit('Draft')}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-xs transition-colors"
          >
            Guardar Borrador
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit('Approved')}
            className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] transition-all font-space text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,166,35,0.25)] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Guardar Historia</span>
          </button>
        </div>

      </div>
    </div>
  );
}
