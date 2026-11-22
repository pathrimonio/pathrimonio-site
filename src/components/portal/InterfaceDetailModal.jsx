import React, { useState, useEffect, useRef } from 'react';
import InterfaceMockupPreview from './InterfaceMockupPreview';
import InterfaceHotspotOverlay from './InterfaceHotspotOverlay';
import DataUsagePicker from './DataUsagePicker';
import DataUsageList from './DataUsageList';
import { getEffectiveAspect } from '../../utils/aspectRatio';
import { useImageAspect } from '../../utils/useImageAspect';

export default function InterfaceDetailModal({
  item,
  isOpen,
  onClose,
  onUpdateInterface,
  existingStories = [],
  projectActors = [],
  dataModels = [],
  existingInterfaces = [],
  onAddRole,
  onNotify
}) {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [showAddRoleInput, setShowAddRoleInput] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [navHistory, setNavHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      const parsed = JSON.parse(JSON.stringify(item));
      if (!parsed.roles || !Array.isArray(parsed.roles)) {
        parsed.roles = parsed.role ? [parsed.role] : [];
      }
      const rawImages = Array.isArray(parsed.images) && parsed.images.length > 0
        ? parsed.images
        : (parsed.image ? [parsed.image] : []);
      parsed.images = rawImages;
      parsed.image = rawImages[0] || null;
      parsed.hotspots = Array.isArray(parsed.hotspots) ? parsed.hotspots : [];
      setFormData(parsed);
      setActiveImageIndex(0);
      setIsEditing(true);
      setShowAddRoleInput(false);
      setNewRoleInput('');
      setNewImageUrl('');
      setShowUploadZone(false);
      setNavHistory([]);
    }
  }, [item]);

  const currentImages = Array.isArray(formData?.images) && formData.images.length > 0
    ? formData.images
    : (formData?.image ? [formData.image] : []);
  const activeImage = currentImages[activeImageIndex] || currentImages[0] || formData?.image || null;
  const detectedRatio = useImageAspect(activeImage, formData?.imageAspect);

  if (!isOpen || !formData) return null;

  const fields = formData.fields || {};
  const currentRoles = Array.isArray(formData.roles) ? formData.roles : (formData.role ? [formData.role] : []);
  const effectiveAspect = getEffectiveAspect(formData, detectedRatio);
  const isPhoneLayout = effectiveAspect === 'phone';

  const handleToggleRole = (roleName) => {
    const updated = currentRoles.includes(roleName)
      ? currentRoles.filter(r => r !== roleName)
      : [...currentRoles, roleName];
    setFormData({
      ...formData,
      roles: updated
    });
  };

  const handleAddCustomRole = () => {
    const trimmed = newRoleInput.trim();
    if (!trimmed) return;
    if (!currentRoles.includes(trimmed)) {
      setFormData({
        ...formData,
        roles: [...currentRoles, trimmed]
      });
    }
    onAddRole?.(trimmed);
    setNewRoleInput('');
    setShowAddRoleInput(false);
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      fields: {
        ...formData.fields,
        [fieldName]: value
      }
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let loaded = [];
    let count = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        loaded.push(event.target.result);
        count++;
        if (count === files.length) {
          setFormData((prev) => {
            const currentList = Array.isArray(prev.images) && prev.images.length > 0
              ? prev.images
              : (prev.image ? [prev.image] : []);
            const nextImages = [...currentList, ...loaded];
            return {
              ...prev,
              images: nextImages,
              image: nextImages[0] || null
            };
          });
          setActiveImageIndex(currentImages.length);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const currentList = Array.isArray(prev.images) && prev.images.length > 0
        ? prev.images
        : (prev.image ? [prev.image] : []);
      const nextImages = [...currentList, trimmed];
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || null
      };
    });
    setActiveImageIndex(currentImages.length);
    setNewImageUrl('');
    onNotify?.('¡Imagen agregada por URL correctamente!');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const currentList = Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []);
      const nextImages = currentList.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || null
      };
    });
    if (activeImageIndex >= indexToRemove && activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    }
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const list = [...(Array.isArray(prev.images) ? prev.images : (prev.image ? [prev.image] : []))];
      if (index >= list.length) return prev;
      const [moved] = list.splice(index, 1);
      list.unshift(moved);
      return {
        ...prev,
        images: list,
        image: list[0] || null
      };
    });
    setActiveImageIndex(0);
  };

  const handleUpdateDataUsageItem = (key, updatedFields) => {
    setFormData(prev => ({
      ...prev,
      dataUsage: (prev.dataUsage || []).map(ref => ref.key === key ? { ...ref, ...updatedFields } : ref)
    }));
  };

  const handleAddDataUsageItem = (newItem) => {
    setFormData(prev => ({
      ...prev,
      dataUsage: [...(prev.dataUsage || []), newItem]
    }));
  };

  const handleRemoveDataUsageItem = (key) => {
    setFormData(prev => ({
      ...prev,
      dataUsage: (prev.dataUsage || []).filter(ref => ref.key !== key)
    }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    const toSave = {
      ...formData,
      images: currentImages,
      image: currentImages[0] || null
    };
    onUpdateInterface?.(toSave);
    onClose?.();
  };

  const handleSetStatus = (newStatus) => {
    const updated = {
      ...formData,
      status: newStatus,
      reviewedBy: newStatus.includes('Aprobado') ? 'Cliente / PO' : formData.reviewedBy,
      approvedAt: newStatus.includes('Aprobado') ? new Date().toISOString().split('T')[0] : formData.approvedAt
    };
    setFormData(updated);
    onUpdateInterface?.(updated);
  };

  const handleNavigateToInterface = (targetInterface) => {
    if (!targetInterface) return;
    setNavHistory(prev => [...prev, formData]);
    const parsed = JSON.parse(JSON.stringify(targetInterface));
    if (!parsed.roles || !Array.isArray(parsed.roles)) {
      parsed.roles = parsed.role ? [parsed.role] : [];
    }
    const rawImages = Array.isArray(parsed.images) && parsed.images.length > 0
      ? parsed.images
      : (parsed.image ? [parsed.image] : []);
    parsed.images = rawImages;
    parsed.image = rawImages[0] || null;
    parsed.hotspots = Array.isArray(parsed.hotspots) ? parsed.hotspots : [];
    setFormData(parsed);
    setActiveImageIndex(0);
    onNotify?.(`Simulación de flujo: Navegando a "${parsed.fullName || parsed.title}"`);
  };

  const handleBackNavigation = () => {
    if (navHistory.length === 0) return;
    const prev = navHistory[navHistory.length - 1];
    setNavHistory(h => h.slice(0, -1));
    setFormData(prev);
    setActiveImageIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-surface-container border border-outline-variant rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/60 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-8 h-8 rounded-lg bg-surface-container-highest border border-primary/30 flex items-center justify-center font-space font-bold text-sm text-primary">
              {formData.number || 'UI'}
            </span>
            <div className="flex flex-col">
              <h2 className="font-space text-lg font-bold text-white flex items-center gap-2">
                <span>{formData.fullName || `${formData.number}. ${formData.title}`}</span>
                <span className="font-mono text-xs text-on-surface-variant font-normal">
                  ({formData.module})
                </span>
              </h2>
              <span className="font-jakarta text-xs text-on-surface-variant">
                Ficha de Formalización de Pantalla &amp; Aprobación con el Cliente
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-space font-semibold flex items-center gap-1.5 transition-colors ${
                isEditing
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-high border-outline-variant text-white hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isEditing ? 'visibility' : 'edit_note'}
              </span>
              <span>{isEditing ? 'Ver Vista Previa' : 'Editar Ficha'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Interactive Prototype Navigation Banner */}
        {navHistory.length > 0 && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-cyan-950/60 border-b border-cyan-800/40 text-cyan-300 text-xs font-space animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-cyan-400 animate-pulse">navigation</span>
              <span>Flujo Interactivo: Viendo <strong>{formData.fullName || formData.title}</strong></span>
            </div>
            <button
              type="button"
              onClick={handleBackNavigation}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-white font-bold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Volver a {navHistory[navHistory.length - 1].number ? `${navHistory[navHistory.length - 1].number}. ` : ''}{navHistory[navHistory.length - 1].title}</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          
          <div className={isPhoneLayout
            ? 'grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start'
            : 'flex flex-col gap-6'}>

          {/* 1. SECCIÓN DE IMAGEN / MOCKUP */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant font-space">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="material-symbols-outlined text-[16px] text-primary">photo_library</span>
                  <span>Visualización de la Interfaz</span>
                </span>
                {currentImages.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono text-[10px] font-bold">
                    {currentImages.length} {currentImages.length === 1 ? 'imagen' : 'imágenes'}
                  </span>
                )}
              </div>

              {/* Botón para alternar zona de carga */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowUploadZone((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-space text-primary hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">upload</span>
                  <span>+ Subir Imágenes</span>
                </button>
              </div>
            </div>

            {/* Panel de subida de imágenes si está abierto */}
            {showUploadZone && (
              <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-space text-white font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">add_photo_alternate</span>
                    <span>Imágenes o Wireframes de la Pantalla:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUploadZone(false)}
                    className="text-on-surface-variant hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                    title="Cerrar panel de carga"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
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
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="O pega URL de imagen (Figma / Web)..."
                      className="h-8 px-2.5 bg-surface-container border border-outline-variant rounded text-[11px] font-mono text-white flex-1 focus:border-primary focus:outline-none"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-2.5 h-8 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary text-xs font-space shrink-0 cursor-pointer"
                    >
                      Cargar
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Visor Mockup Preview con Puntos Interactivos */}
            <InterfaceHotspotOverlay
              image={activeImage}
              hotspots={formData.hotspots || []}
              onUpdateHotspots={(updated) => {
                const next = { ...formData, hotspots: updated };
                setFormData(next);
                onUpdateInterface?.(next);
              }}
              isEditable={isEditing}
              dataModels={dataModels}
              existingInterfaces={existingInterfaces}
              currentInterfaceId={formData.id}
              currentImageIndex={activeImageIndex}
              onNavigateToInterface={handleNavigateToInterface}
              onSyncDataUsage={(newUsageItem) => {
                const existing = formData.dataUsage || [];
                const exists = existing.some(u => 
                  (u.tableId === newUsageItem.tableId || u.tableName === newUsageItem.tableName) &&
                  u.attribute === newUsageItem.attribute
                );
                if (!exists) {
                  const next = {
                    ...formData,
                    dataUsage: [...existing, newUsageItem]
                  };
                  setFormData(next);
                  onUpdateInterface?.(next);
                }
              }}
              onNotify={onNotify}
            >
              <InterfaceMockupPreview
                image={activeImage}
                images={currentImages}
                activeIndex={activeImageIndex}
                onNextImage={() => setActiveImageIndex((prev) => (prev + 1) % currentImages.length)}
                onPrevImage={() => setActiveImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)}
                placeholderType={formData.imagePlaceholder || 'dashboard'}
                title={formData.fullName}
                aspectRatio={effectiveAspect}
                disableZoomBanner={true}
              />
            </InterfaceHotspotOverlay>

            {/* Tira de miniaturas de la galería */}
            {currentImages.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {currentImages.map((src, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-surface-container flex items-center justify-center ${
                        activeImageIndex === idx
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
                    {idx !== 0 && isEditing && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSetPrimaryImage(idx); }}
                        className="absolute bottom-0 left-0 right-0 bg-black/80 hover:bg-primary hover:text-on-primary text-white font-mono text-[8px] text-center leading-tight py-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Hacer portada"
                      >
                        PORTADA
                      </button>
                    )}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
                        title="Eliminar imagen"
                      >
                        <span className="material-symbols-outlined text-[10px]">close</span>
                      </button>
                    )}
                  </div>
                ))}

                {/* Botón para añadir más imágenes directamente desde la tira */}
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
            )}
          </div>

          {/* 2. CUADRO DE DETALLES Y DATOS UTILIZADOS */}
          <div className={isPhoneLayout ? "flex flex-col gap-5" : "grid grid-cols-1 md:grid-cols-2 gap-5 items-start"}>
            {/* Cuadro de Detalles */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-space text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">table_chart</span>
                  <span>Cuadro de Detalles de la Interfaz:</span>
                </h3>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {formData.fullName}
                </span>
              </div>

              <div className="overflow-hidden border border-outline-variant/80 rounded-xl bg-surface-container-lowest shadow-md">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container-high/80 text-on-surface border-b border-outline-variant/70 font-space text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5 font-bold text-primary w-32 sm:w-44 border-r border-outline-variant/60">
                        Campo
                      </th>
                      <th className="py-3 px-5 font-bold text-white">
                        Detalle
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-jakarta text-xs">
                    
                    {/* Fila: Objetivo */}
                    <tr>
                      <td className="py-3.5 px-5 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                        Objetivo
                      </td>
                      <td className="py-3.5 px-5 text-on-surface leading-relaxed">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={fields.objetivo || ''}
                            onChange={(e) => handleFieldChange('objetivo', e.target.value)}
                            className="w-full p-2 bg-surface-container border border-outline-variant rounded text-xs text-white focus:border-primary focus:outline-none"
                          />
                        ) : (
                          <p className="font-medium text-white/90">{fields.objetivo}</p>
                        )}
                      </td>
                    </tr>

                    {/* Fila: Contenido */}
                    <tr>
                      <td className="py-3.5 px-5 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                        Contenido
                      </td>
                      <td className="py-3.5 px-5 text-on-surface leading-relaxed">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={fields.contenido || ''}
                            onChange={(e) => handleFieldChange('contenido', e.target.value)}
                            className="w-full p-2 bg-surface-container border border-outline-variant rounded text-xs text-white focus:border-primary focus:outline-none"
                          />
                        ) : (
                          <p>{fields.contenido}</p>
                        )}
                      </td>
                    </tr>

                    {/* Fila: Reglas */}
                    <tr>
                      <td className="py-3.5 px-5 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                        Reglas
                      </td>
                      <td className="py-3.5 px-5 text-on-surface leading-relaxed">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={fields.reglas || ''}
                            onChange={(e) => handleFieldChange('reglas', e.target.value)}
                            className="w-full p-2 bg-surface-container border border-outline-variant rounded text-xs text-white focus:border-primary focus:outline-none"
                          />
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant text-white font-mono text-[11px] inline-block">
                            {fields.reglas}
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Fila: Detalles */}
                    <tr>
                      <td className="py-3.5 px-5 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                        Detalles
                      </td>
                      <td className="py-3.5 px-5 text-on-surface-variant leading-relaxed">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={fields.detalles || ''}
                            onChange={(e) => handleFieldChange('detalles', e.target.value)}
                            className="w-full p-2 bg-surface-container border border-outline-variant rounded text-xs text-white focus:border-primary focus:outline-none"
                          />
                        ) : (
                          <p>{fields.detalles}</p>
                        )}
                      </td>
                    </tr>

                    {/* Fila: Roles del Negocio Asignados */}
                    <tr>
                      <td className="py-3.5 px-5 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                        Roles del Negocio
                      </td>
                      <td className="py-3.5 px-5 text-on-surface leading-relaxed">
                        {isEditing ? (
                          <div className="flex flex-col gap-3">
                            <p className="text-[11px] text-on-surface-variant font-jakarta">
                              Selecciona los roles de usuario que interactúan con esta pantalla:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {/* Roles Asignados a esta pantalla */}
                              {currentRoles.map((roleName) => (
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

                              {/* Roles disponibles en el proyecto no asignados */}
                              {projectActors.filter(a => !currentRoles.includes(a.name)).map((actor) => (
                                <button
                                  type="button"
                                  key={actor.id || actor.name}
                                  onClick={() => handleToggleRole(actor.name)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-space bg-surface-container border border-outline-variant text-on-surface-variant hover:text-white transition-all cursor-pointer"
                                  title={`${actor.category} — ${actor.description || ''}`}
                                >
                                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                                    {actor.avatarIcon || 'person'}
                                  </span>
                                  <span>{actor.name}</span>
                                </button>
                              ))}
                            </div>

                            {/* Add custom role in edit mode */}
                            {showAddRoleInput ? (
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={newRoleInput}
                                  onChange={(e) => setNewRoleInput(e.target.value)}
                                  placeholder="Nombre del rol del negocio..."
                                  className="h-8 px-2.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-jakarta text-white flex-1 focus:border-primary focus:outline-none"
                                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomRole(); } }}
                                />
                                <button
                                  type="button"
                                  onClick={handleAddCustomRole}
                                  className="px-3 h-8 rounded-lg bg-primary text-on-primary font-space text-xs font-bold"
                                >
                                  Añadir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowAddRoleInput(false)}
                                  className="px-2 h-8 rounded-lg text-on-surface-variant hover:text-white text-xs font-space"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setShowAddRoleInput(true)}
                                  className="inline-flex items-center gap-1 text-[11px] font-space text-primary hover:underline cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[14px]">add</span>
                                  <span>+ Asignar otro rol del negocio</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {currentRoles.length > 0 ? (
                              currentRoles.map((roleName, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-space bg-surface-container-high border border-outline-variant text-white shadow-sm"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                  <span className="font-semibold">{roleName}</span>
                                </span>
                              ))
                            ) : (
                              <span className="italic text-on-surface-variant text-[11px]">
                                Sin roles asignados
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

            {/* Datos utilizados por la interfaz */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-space text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">database</span>
                  <span>Datos Utilizados en esta Interfaz:</span>
                </h4>
                {Array.isArray(formData.dataUsage) && formData.dataUsage.length > 0 && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-semibold">
                    {formData.dataUsage.length} {formData.dataUsage.length === 1 ? 'campo' : 'campos'}
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="flex flex-col gap-2.5">
                  <p className="text-[11px] text-on-surface-variant font-jakarta">
                    Busca campos en el modelado de datos o agrégalos manualmente. Puedes modificar directamente cualquier campo desde la tabla.
                  </p>
                  <DataUsagePicker
                    tables={dataModels}
                    selected={formData.dataUsage || []}
                    onChange={(next) => setFormData({ ...formData, dataUsage: next })}
                  />
                  <DataUsageList
                    items={formData.dataUsage || []}
                    onRemove={handleRemoveDataUsageItem}
                    onUpdate={handleUpdateDataUsageItem}
                    onAdd={handleAddDataUsageItem}
                    tables={dataModels}
                  />
                </div>
              ) : (
                (formData.dataUsage || []).length > 0 ? (
                  <DataUsageList items={formData.dataUsage} />
                ) : (
                  <div className="overflow-hidden border border-outline-variant/80 rounded-xl bg-surface-container-lowest p-4 text-center flex flex-col items-center justify-center gap-1 shadow-sm min-h-[120px]">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-[24px]">database</span>
                    <span className="text-xs font-jakarta italic text-on-surface-variant/70">
                      Sin datos asociados a esta interfaz.
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
          </div>

          {/* 3. Panel de Aprobación Formal y Cliente */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                <div>
                  <h4 className="font-space text-xs font-bold text-white">
                    Formalización y Comunicación con el Cliente
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Revisión contractual de la pantalla previa a programación
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-space font-bold border bg-surface-container border-primary/40 text-primary">
                {formData.status}
              </span>
            </div>

            {/* Quick approval buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/60">
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
                <span>Solicitar Ajustes</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/60 bg-surface-container-low shrink-0">
          <div className="text-xs text-on-surface-variant font-space">
            {formData.reviewedBy ? `Aprobado por: ${formData.reviewedBy} (${formData.approvedAt})` : 'Pendiente de firma de cliente'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs transition-colors"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.01] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Guardar Ficha</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
