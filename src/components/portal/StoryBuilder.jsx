import React, { useState } from 'react';
import { ROLE_SUGGESTIONS } from '../../data/initialStories';

export default function StoryBuilder({ onSaveStory, onNotify }) {
  const [module, setModule] = useState('Gestión de Crédito');
  const [role, setRole] = useState('Oficial de Crédito Comunitario');
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
    if (!role.trim() || !action.trim() || !benefit.trim()) {
      onNotify?.('Por favor completa los tres campos de la fórmula de historia.');
      return;
    }

    const newStory = {
      id: `US-${Math.floor(100 + Math.random() * 900)}`,
      module,
      role: role.trim(),
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
    onNotify?.(`Historia ${newStory.id} guardada exitosamente.`);
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

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-lg p-5 flex flex-col gap-y-4 shadow-sm">
      
      {/* Card Header & Product Tip */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
            <h2 className="font-space text-base text-white font-semibold">Guided Story Builder</h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-semibold uppercase tracking-wider">
            Modo Guiado
          </span>
        </div>
        <p className="font-jakarta text-xs text-on-surface-variant">
          Escribe requerimientos claros y medibles sin jerga técnica.
        </p>

        <div className="p-2.5 rounded bg-surface-container border border-outline-variant/60 flex items-start gap-x-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 shrink-0">lightbulb</span>
          <p className="font-jakarta text-xs text-on-surface leading-relaxed">
            <strong className="text-white">Tip de producto:</strong> Enfócate en el beneficio del usuario final. El equipo de arquitectura deducirá el esquema de microservicios.
          </p>
        </div>
      </div>

      {/* Structured Formula Inputs */}
      <div className="flex flex-col gap-y-3.5">
        
        {/* Module Selection */}
        <div className="flex flex-col gap-y-1">
          <label className="font-space text-xs text-white flex items-center justify-between">
            <span className="font-medium">Módulo de Software</span>
            <span className="text-on-surface-variant font-space text-[10px] uppercase">Requerido</span>
          </label>
          <div className="relative">
            <select 
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full h-8 bg-surface-container-lowest border border-outline-variant rounded px-2.5 pr-8 font-jakarta text-xs text-white appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option>Gestión de Crédito</option>
              <option>Autenticación & KYC</option>
              <option>Pasarela de Pagos</option>
              <option>Reportes de Impacto</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1.5 pointer-events-none text-on-surface-variant text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Role Section */}
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <label className="font-space text-xs text-white flex items-center gap-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 font-space text-[10px] text-primary font-bold">1</span>
              <span className="font-medium">As a... (Como...)</span>
            </label>
            <span className="font-space text-[10px] text-on-surface-variant">Rol o actor</span>
          </div>
          <input 
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ej: Beneficiario Rural, Administrador..."
            className="w-full h-8 bg-surface-container-lowest border border-outline-variant rounded px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center gap-x-1.5 flex-wrap pt-0.5">
            <span className="font-space text-[10px] text-on-surface-variant">Sugeridos:</span>
            {ROLE_SUGGESTIONS.slice(0, 3).map((r, i) => (
              <button 
                key={i}
                type="button"
                onClick={() => setRole(r)}
                className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-on-surface-variant hover:text-white font-space text-[10px] transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Action Section */}
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
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          ></textarea>
        </div>

        {/* Benefit Section */}
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
            placeholder="¿Cuál es el beneficio directo para el usuario o cooperativa?"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          ></textarea>
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
                className="flex items-center justify-between gap-x-2 p-2 rounded bg-surface-container-lowest border border-outline-variant/60 group hover:border-outline transition-colors"
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
              className="h-7 flex-1 bg-surface-container-lowest border border-outline-variant rounded px-2.5 font-jakarta text-xs text-white placeholder-on-surface-variant/60 focus:outline-none focus:border-primary"
            />
            <button 
              type="button"
              onClick={handleAddCriterion}
              className="h-7 px-2.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-[11px] transition-colors flex items-center gap-x-1 shrink-0"
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
          <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-lowest border border-outline-variant rounded">
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
                  className={`py-1 text-center font-space text-[11px] rounded transition-all ${
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
            className="p-3.5 rounded bg-surface-container-lowest border border-dashed border-outline hover:border-primary transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
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
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant">
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

      {/* Action Footer */}
      <div className="flex items-center gap-x-2 pt-1 border-t border-outline-variant/60">
        <button 
          type="button"
          onClick={() => handleSubmit('Approved')}
          className="h-9 flex-1 rounded bg-primary text-on-primary hover:bg-[#e09419] transition-all font-space text-xs font-semibold flex items-center justify-center gap-x-1.5 shadow-[0_0_12px_rgba(245,166,35,0.25)] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Guardar Historia de Usuario</span>
        </button>
        <button 
          type="button"
          onClick={() => handleSubmit('Draft')}
          className="h-9 px-3.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-xs transition-colors"
        >
          Borrador
        </button>
      </div>

    </div>
  );
}
