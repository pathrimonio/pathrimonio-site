import React, { useState, useEffect } from 'react';
import { 
  INTERFACE_MODULE_OPTIONS, 
  PLATFORM_OPTIONS, 
  INTERFACE_TYPE_OPTIONS,
  INTERFACE_STATUS_OPTIONS 
} from '../../data/initialInterfaces';

export default function InterfaceDetailModal({
  item,
  isOpen,
  onClose,
  onUpdateInterface,
  existingStories = []
}) {
  const [activeTab, setActiveTab] = useState('spec'); // 'spec' | 'criteria' | 'traceability'
  const [formData, setFormData] = useState(null);

  // Local state for new entries in modal
  const [newCriterionText, setNewCriterionText] = useState('');
  const [newElement, setNewElement] = useState('');
  const [newBehavior, setNewBehavior] = useState('');
  const [newEntryPoint, setNewEntryPoint] = useState('');

  useEffect(() => {
    if (item) {
      setFormData(JSON.parse(JSON.stringify(item)));
    }
  }, [item]);

  if (!isOpen || !formData) return null;

  // Handle saving the full modal
  const handleSave = (e) => {
    e?.preventDefault();
    onUpdateInterface?.(formData);
    onClose();
  };

  // Toggle visual criterion
  const handleToggleCriterion = (criterionId) => {
    setFormData({
      ...formData,
      visualCriteria: (formData.visualCriteria || []).map(c => 
        c.id === criterionId ? { ...c, checked: !c.checked } : c
      )
    });
  };

  // Add new visual criterion
  const handleAddCriterion = (e) => {
    e?.preventDefault();
    if (!newCriterionText.trim()) return;
    setFormData({
      ...formData,
      visualCriteria: [
        ...(formData.visualCriteria || []),
        { id: Date.now().toString(), text: newCriterionText.trim(), checked: true }
      ]
    });
    setNewCriterionText('');
  };

  // Remove criterion
  const handleRemoveCriterion = (criterionId) => {
    setFormData({
      ...formData,
      visualCriteria: (formData.visualCriteria || []).filter(c => c.id !== criterionId)
    });
  };

  // Add UI annotation
  const handleAddAnnotation = (e) => {
    e?.preventDefault();
    if (!newElement.trim() || !newBehavior.trim()) return;
    setFormData({
      ...formData,
      annotations: [
        ...(formData.annotations || []),
        { id: Date.now().toString(), element: newElement.trim(), behavior: newBehavior.trim() }
      ]
    });
    setNewElement('');
    setNewBehavior('');
  };

  // Remove annotation
  const handleRemoveAnnotation = (id) => {
    setFormData({
      ...formData,
      annotations: (formData.annotations || []).filter(a => a.id !== id)
    });
  };

  // Entry points add/remove
  const handleAddEntryPoint = (e) => {
    e?.preventDefault();
    if (!newEntryPoint.trim()) return;
    if (!formData.entryPoints.includes(newEntryPoint.trim())) {
      setFormData({
        ...formData,
        entryPoints: [...formData.entryPoints, newEntryPoint.trim()]
      });
    }
    setNewEntryPoint('');
  };

  const handleRemoveEntryPoint = (point) => {
    setFormData({
      ...formData,
      entryPoints: formData.entryPoints.filter(p => p !== point)
    });
  };

  // Toggle linked story
  const handleToggleStoryLink = (storyId) => {
    const current = formData.linkedStories || [];
    if (current.includes(storyId)) {
      setFormData({ ...formData, linkedStories: current.filter(id => id !== storyId) });
    } else {
      setFormData({ ...formData, linkedStories: [...current, storyId] });
    }
  };

  // Formal approval action
  const handleSetStatus = (newStatus, reviewer = null) => {
    const updated = {
      ...formData,
      status: newStatus,
      reviewedBy: reviewer || (newStatus.includes('Aprobado') ? 'Cliente / PO' : formData.reviewedBy),
      approvedAt: newStatus.includes('Aprobado') ? new Date().toISOString().split('T')[0] : formData.approvedAt
    };
    setFormData(updated);
    onUpdateInterface?.(updated);
  };

  // Criteria stats
  const criteriaList = formData.visualCriteria || [];
  const checkedCount = criteriaList.filter(c => c.checked).length;
  const totalCriteria = criteriaList.length;
  const criteriaPercent = totalCriteria > 0 ? Math.round((checkedCount / totalCriteria) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-surface-container border border-outline-variant rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/60 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-space font-mono text-base font-bold text-primary px-2.5 py-1 rounded bg-surface-container-highest border border-primary/30">
              {formData.id}
            </span>
            <div className="flex flex-col">
              <h2 className="font-space text-base font-bold text-white flex items-center gap-2">
                <span>{formData.name}</span>
                <span className="font-mono text-xs text-on-surface-variant font-normal">
                  ({formData.version || 'v1.0'})
                </span>
              </h2>
              <span className="font-jakarta text-xs text-on-surface-variant">
                Formalización de Contrato de Pantalla UI/UX
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-outline-variant/60 bg-surface-container-lowest shrink-0">
          <button
            onClick={() => setActiveTab('spec')}
            className={`pb-2.5 px-3 font-space text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'spec'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Especificación &amp; Wireframe</span>
          </button>

          <button
            onClick={() => setActiveTab('criteria')}
            className={`pb-2.5 px-3 font-space text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'criteria'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">checklist</span>
            <span>Criterios Visuales ({checkedCount}/{totalCriteria})</span>
          </button>

          <button
            onClick={() => setActiveTab('traceability')}
            className={`pb-2.5 px-3 font-space text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'traceability'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Aprobación &amp; Trazabilidad US</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          
          {/* TAB 1: ESPECIFICACIÓN & WIREFRAME */}
          {activeTab === 'spec' && (
            <div className="flex flex-col gap-4">
              
              {/* Row 1: Basic Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-space text-white">Nombre de Pantalla</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-space text-white">Módulo</label>
                  <select
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white"
                  >
                    {INTERFACE_MODULE_OPTIONS.filter(m => m !== 'Todos').map(mod => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Platform, Type, Priority, Version */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-space text-white">Plataforma</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white"
                  >
                    {PLATFORM_OPTIONS.filter(p => p !== 'Todas').map(plat => (
                      <option key={plat} value={plat}>{plat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-space text-white">Tipo</label>
                  <select
                    value={formData.interfaceType}
                    onChange={(e) => setFormData({ ...formData, interfaceType: e.target.value })}
                    className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white"
                  >
                    {INTERFACE_TYPE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-space text-white">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Bloqueante">Bloqueante</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-space text-white">Versión</label>
                  <input
                    type="text"
                    value={formData.version || 'v1.0'}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-space text-white">Comportamiento Funcional</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white"
                />
              </div>

              {/* User Goal */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-space text-white">Objetivo del Usuario</label>
                <input
                  type="text"
                  value={formData.userGoal || ''}
                  onChange={(e) => setFormData({ ...formData, userGoal: e.target.value })}
                  className="h-8 px-3 bg-surface-container-lowest border border-outline-variant rounded text-xs font-jakarta text-white"
                />
              </div>

              {/* Wireframe Reference */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-space text-white">Referencia de Wireframe o Mockup</label>
                <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">image</span>
                  <input
                    type="text"
                    value={formData.wireframeRef || ''}
                    onChange={(e) => setFormData({ ...formData, wireframeRef: e.target.value })}
                    className="bg-transparent text-xs font-mono text-white flex-1 focus:outline-none"
                    placeholder="ej. wireframe_dashboard_v2.png"
                  />
                </div>
              </div>

              {/* UI Annotations */}
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/60">
                <label className="text-xs font-space text-white">Anotaciones de Comportamiento UI</label>
                <div className="flex flex-col gap-1.5">
                  {(formData.annotations || []).map(ann => (
                    <div key={ann.id} className="p-2 rounded bg-surface-container-lowest border border-outline-variant flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-space font-semibold text-primary">{ann.element}: </span>
                        <span className="text-white/90">{ann.behavior}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAnnotation(ann.id)}
                        className="text-on-surface-variant hover:text-red-400 p-0.5"
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
                    placeholder="Elemento UI"
                    className="sm:col-span-5 h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newBehavior}
                    onChange={(e) => setNewBehavior(e.target.value)}
                    placeholder="Comportamiento esperado"
                    className="sm:col-span-5 h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAnnotation}
                    className="sm:col-span-2 h-8 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space"
                  >
                    Añadir
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CRITERIOS VISUALES */}
          {activeTab === 'criteria' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <div>
                  <h4 className="font-space text-xs font-bold text-white">Progreso de Validación Visual</h4>
                  <p className="text-[11px] text-on-surface-variant font-jakarta">
                    Marca los criterios aceptados durante las sesiones de revisión con el cliente.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-bold text-primary">{criteriaPercent}%</span>
                  <span className="block text-[10px] text-on-surface-variant">({checkedCount} de {totalCriteria})</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${criteriaPercent === 100 ? 'bg-emerald-400' : 'bg-primary'}`}
                  style={{ width: `${criteriaPercent}%` }}
                />
              </div>

              {/* List */}
              <div className="flex flex-col gap-2">
                {criteriaList.map(crit => (
                  <div key={crit.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant hover:border-primary/40 transition-colors">
                    <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                      <input
                        type="checkbox"
                        checked={crit.checked}
                        onChange={() => handleToggleCriterion(crit.id)}
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-0 bg-surface-container"
                      />
                      <span className={`text-xs ${crit.checked ? 'text-white' : 'text-on-surface-variant'}`}>
                        {crit.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(crit.id)}
                      className="text-on-surface-variant hover:text-red-400 p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Criterion */}
              <div className="flex gap-2 pt-2 border-t border-outline-variant/60">
                <input
                  type="text"
                  value={newCriterionText}
                  onChange={(e) => setNewCriterionText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCriterion(e); }}
                  placeholder="Nuevo criterio de aceptación de pantalla..."
                  className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-white placeholder-on-surface-variant/60 flex-1 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCriterion}
                  className="px-4 h-9 rounded-lg bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space font-semibold"
                >
                  Añadir Criterio
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TRAZABILIDAD & APROBACIÓN CLIENTE */}
          {activeTab === 'traceability' && (
            <div className="flex flex-col gap-5">
              
              {/* Formal Approval Banner */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
                    <div>
                      <h4 className="font-space text-sm font-bold text-white">
                        Estado de Aprobación Formal con el Cliente
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Formalización contractual previa al pase a Sprint de programación
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-space font-bold border bg-surface-container border-primary/40 text-primary">
                    {formData.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface-container/60 p-3 rounded-lg border border-outline-variant/60">
                  <div>
                    <span className="text-on-surface-variant block font-space text-[10px] uppercase">Revisado Por:</span>
                    <span className="text-white font-medium">{formData.reviewedBy || 'Pendiente de sesión de revisión'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block font-space text-[10px] uppercase">Fecha de Aprobación:</span>
                    <span className="text-white font-medium">{formData.approvedAt || 'Sin fecha de firma'}</span>
                  </div>
                </div>

                {/* State Transition Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => handleSetStatus('Aprobado por Cliente')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-space text-xs font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Aprobar Formalmente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus('En Revisión')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-400 font-space text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                    <span>Enviar a Revisión</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus('Rechazado')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-space text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    <span>Solicitar Cambios</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus('Borrador')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant hover:text-white font-space text-xs transition-colors"
                  >
                    <span>Mover a Borrador</span>
                  </button>
                </div>
              </div>

              {/* Linked User Stories */}
              <div className="flex flex-col gap-3">
                <h4 className="font-space text-xs font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
                  <span>Historias de Usuario Vinculadas (Trazabilidad)</span>
                </h4>

                <div className="flex flex-wrap gap-2">
                  {existingStories.map(story => {
                    const isLinked = (formData.linkedStories || []).includes(story.id);
                    return (
                      <button
                        key={story.id}
                        type="button"
                        onClick={() => handleToggleStoryLink(story.id)}
                        className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                          isLinked 
                            ? 'bg-primary/10 border-primary text-white shadow-sm' 
                            : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xs font-bold text-primary">{story.id}</span>
                          <span className={`material-symbols-outlined text-[16px] ${isLinked ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {isLinked ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                        </div>
                        <span className="text-[11px] font-space font-medium text-white line-clamp-1">
                          {story.role}
                        </span>
                        <span className="text-[10px] text-on-surface-variant line-clamp-2 font-jakarta">
                          {story.action}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/60 bg-surface-container-low shrink-0">
          <div className="text-xs text-on-surface-variant font-space">
            Autor: <span className="text-white">{formData.author}</span> • {formData.createdAt}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Guardar Especificación</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
