import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

export default function InterfaceHotspotOverlay({
  children,
  image,
  hotspots = [],
  onUpdateHotspots,
  isEditable = false,
  dataModels = [],
  existingInterfaces = [],
  currentInterfaceId,
  onNavigateToInterface,
  currentImageIndex = 0,
  onSyncDataUsage,
  onNotify
}) {
  const containerRef = useRef(null);

  // Modes: 'interact' (view & click) | 'draw_box' (drag to select area) | 'point' (click to drop pin)
  const [editorMode, setEditorMode] = useState('interact');
  const [showHotspots, setShowHotspots] = useState(true);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentBox, setCurrentBox] = useState(null);

  // Active / Selected Hotspot for Tooltip or Editing
  const [activeHotspotId, setActiveHotspotId] = useState(null);
  const [editingHotspot, setEditingHotspot] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Form state for hotspot config modal
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    linkType: 'database', // 'database' | 'interface' | 'both' | 'note'
    // Database link
    selectedTableId: '',
    selectedAttributeName: '',
    // Interface link
    selectedInterfaceId: '',
    actionTrigger: 'Al hacer clic (Navegación directa)',
    colorTheme: 'primary' // 'primary' | 'emerald' | 'cyan' | 'amber'
  });

  // Hotspots for current image in gallery
  const currentImageHotspots = useMemo(() => {
    return (hotspots || []).filter(h => (h.imageIndex ?? 0) === currentImageIndex);
  }, [hotspots, currentImageIndex]);

  // Active hotspot data for the floating card (rendered in a portal to escape clipping).
  const popoverRef = useRef(null);
  const activeHotspot = useMemo(
    () => currentImageHotspots.find(h => h.id === activeHotspotId) || null,
    [currentImageHotspots, activeHotspotId]
  );
  const activeHotspotIndex = useMemo(
    () => currentImageHotspots.findIndex(h => h.id === activeHotspotId),
    [currentImageHotspots, activeHotspotId]
  );
  const [popoverPosition, setPopoverPosition] = useState(null);

  const activeIsDb = activeHotspot && (activeHotspot.linkType === 'database' || activeHotspot.linkType === 'both');
  const activeIsInt = activeHotspot && (activeHotspot.linkType === 'interface' || activeHotspot.linkType === 'both');
  const activeThemeBadge = activeHotspot
    ? (activeIsDb && activeIsInt
        ? 'bg-amber-500 text-surface'
        : activeIsInt
        ? 'bg-cyan-500 text-surface'
        : 'bg-emerald-500 text-surface')
    : '';

  // Smart floating popover position calculation
  useEffect(() => {
    if (!activeHotspot || !containerRef.current) {
      setPopoverPosition(null);
      return;
    }

    const updatePosition = () => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const isBox = activeHotspot.width > 0 && activeHotspot.height > 0;
      
      // Calculate exact screen coordinates of anchor
      const anchorLeft = containerRect.left + (activeHotspot.x / 100) * containerRect.width;
      const anchorTop = containerRect.top + (activeHotspot.y / 100) * containerRect.height;
      const anchorWidth = isBox ? (activeHotspot.width / 100) * containerRect.width : 28;
      const anchorHeight = isBox ? (activeHotspot.height / 100) * containerRect.height : 28;
      
      const anchorCenterX = isBox ? anchorLeft + anchorWidth / 2 : anchorLeft;
      const anchorCenterY = isBox ? anchorTop + anchorHeight / 2 : anchorTop;

      // Popover element measurements
      const popoverEl = popoverRef.current;
      const popoverWidth = popoverEl?.offsetWidth || Math.min(290, window.innerWidth * 0.9);
      const popoverHeight = popoverEl?.offsetHeight || 220;

      const gap = 10;
      const screenPadding = 12;

      // Check space available above vs below
      const spaceBelow = window.innerHeight - (isBox ? anchorTop + anchorHeight : anchorCenterY + 14) - gap;
      const spaceAbove = (isBox ? anchorTop : anchorCenterY - 14) - gap;

      let top;
      let placement = 'below';

      if (spaceBelow >= popoverHeight || spaceBelow >= spaceAbove) {
        // Place below anchor
        top = isBox ? anchorTop + anchorHeight + gap : anchorCenterY + 16 + gap;
        placement = 'below';
      } else {
        // Place above anchor
        top = isBox ? anchorTop - popoverHeight - gap : anchorCenterY - 16 - popoverHeight - gap;
        placement = 'above';
      }

      // Clamp vertical position so it stays fully visible on screen
      top = Math.max(screenPadding, Math.min(top, window.innerHeight - popoverHeight - screenPadding));

      // Calculate horizontal placement centered on anchorCenterX
      let left = anchorCenterX - popoverWidth / 2;
      left = Math.max(screenPadding, Math.min(left, window.innerWidth - popoverWidth - screenPadding));

      setPopoverPosition({ left, top, width: popoverWidth, placement });
    };

    updatePosition();
    const rafId = requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [activeHotspot, currentImageIndex]);

  // Close active popover when pressing Escape or clicking outside
  useEffect(() => {
    if (!activeHotspotId) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveHotspotId(null);
      }
    };

    const handleOutsideClick = (e) => {
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
      if (containerRef.current && containerRef.current.contains(e.target)) {
        // Handled by canvas or marker click
        return;
      }
      setActiveHotspotId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeHotspotId]);

  // Handle pointer down (drawing start)
  const handleMouseDown = (e) => {
    if (!isEditable || editorMode === 'interact') return;
    if (e.button !== 0) return; // Left click only

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  // Handle pointer move (drawing area)
  const handleMouseMove = (e) => {
    if (!isDrawing || !startPos) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const curX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const curY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const left = Math.min(startPos.x, curX);
    const top = Math.min(startPos.y, curY);
    const width = Math.abs(curX - startPos.x);
    const height = Math.abs(curY - startPos.y);

    setCurrentBox({
      x: Math.round(left * 100) / 100,
      y: Math.round(top * 100) / 100,
      width: Math.round(width * 100) / 100,
      height: Math.round(height * 100) / 100
    });
  };

  // Handle pointer up (drawing complete -> open config)
  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) {
      setIsDrawing(false);
      setStartPos(null);
      return;
    }

    setIsDrawing(false);
    const isBox = currentBox.width >= 1.5 && currentBox.height >= 1.5;

    const newHotspot = {
      id: `hp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      imageIndex: currentImageIndex,
      title: isBox ? `Área Seleccionada #${currentImageHotspots.length + 1}` : `Punto de Interés #${currentImageHotspots.length + 1}`,
      description: '',
      x: isBox ? currentBox.x : Math.round(startPos.x * 100) / 100,
      y: isBox ? currentBox.y : Math.round(startPos.y * 100) / 100,
      width: isBox ? currentBox.width : 0,
      height: isBox ? currentBox.height : 0,
      linkType: 'database',
      colorTheme: 'primary'
    };

    openConfigForNew(newHotspot);
    setCurrentBox(null);
    setStartPos(null);
  };

  // Open modal to configure a newly drawn hotspot
  const openConfigForNew = (hotspot) => {
    const defaultTable = dataModels[0];
    const defaultAttr = defaultTable?.attributes?.[0];
    const otherInterfaces = existingInterfaces.filter(i => i.id !== currentInterfaceId);
    const defaultTargetInterface = otherInterfaces[0] || existingInterfaces[0];

    setFormData({
      id: hotspot.id,
      title: hotspot.title || '',
      description: '',
      x: hotspot.x,
      y: hotspot.y,
      width: hotspot.width,
      height: hotspot.height,
      linkType: 'database',
      selectedTableId: defaultTable?.id || '',
      selectedAttributeName: defaultAttr?.name || '',
      selectedInterfaceId: defaultTargetInterface?.id || '',
      actionTrigger: 'Al hacer clic (Navegación directa)',
      colorTheme: 'primary'
    });
    setEditingHotspot(null);
    setIsConfigModalOpen(true);
  };

  // Open modal to edit an existing hotspot
  const openConfigForEdit = (hotspot, e) => {
    e?.stopPropagation();
    const otherInterfaces = existingInterfaces.filter(i => i.id !== currentInterfaceId);

    setFormData({
      id: hotspot.id,
      title: hotspot.title || '',
      description: hotspot.description || '',
      x: hotspot.x,
      y: hotspot.y,
      width: hotspot.width,
      height: hotspot.height,
      linkType: hotspot.linkType || (hotspot.databaseLink ? 'database' : hotspot.interfaceLink ? 'interface' : 'note'),
      selectedTableId: hotspot.databaseLink?.tableId || dataModels.find(t => t.tableName === hotspot.databaseLink?.tableName)?.id || dataModels[0]?.id || '',
      selectedAttributeName: hotspot.databaseLink?.attributeName || '',
      selectedInterfaceId: hotspot.interfaceLink?.interfaceId || otherInterfaces[0]?.id || '',
      actionTrigger: hotspot.interfaceLink?.action || 'Al hacer clic (Navegación directa)',
      colorTheme: hotspot.colorTheme || (hotspot.linkType === 'interface' ? 'cyan' : 'emerald')
    });
    setActiveHotspotId(null);
    setEditingHotspot(hotspot);
    setIsConfigModalOpen(true);
  };

  // Save hotspot from modal
  const handleSaveHotspot = (e) => {
    e?.preventDefault();
    if (!formData.title.trim()) {
      onNotify?.('Por favor ingresa un título para el punto de referencia.');
      return;
    }

    let databaseLink = null;
    if (formData.linkType === 'database' || formData.linkType === 'both') {
      const table = dataModels.find(t => t.id === formData.selectedTableId || t.tableName === formData.selectedTableId);
      if (table) {
        const attr = (table.attributes || []).find(a => a.name === formData.selectedAttributeName) || table.attributes?.[0];
        databaseLink = {
          tableId: table.id,
          tableName: table.tableName,
          tableLabel: table.name,
          schema: table.storageLocation?.toLowerCase().includes('sqlite') ? 'main' : 'public',
          attributeName: attr?.name || formData.selectedAttributeName || 'id',
          attributeType: attr?.type || 'VARCHAR(255)',
          isPrimary: Boolean(attr?.isPrimary),
          foreignKey: attr?.foreignKey || null
        };

        // Sync with interface dataUsage
        onSyncDataUsage?.({
          key: `${table.id}:${databaseLink.attributeName}`,
          tableId: table.id,
          tableName: table.tableName,
          tableLabel: table.name,
          schema: databaseLink.schema,
          attribute: databaseLink.attributeName,
          type: databaseLink.attributeType,
          isPrimary: databaseLink.isPrimary,
          foreignKey: databaseLink.foreignKey
        });
      }
    }

    let interfaceLink = null;
    if (formData.linkType === 'interface' || formData.linkType === 'both') {
      const targetInt = existingInterfaces.find(i => i.id === formData.selectedInterfaceId);
      if (targetInt) {
        interfaceLink = {
          interfaceId: targetInt.id,
          interfaceNumber: targetInt.number || '',
          interfaceTitle: targetInt.fullName || targetInt.title,
          action: formData.actionTrigger || 'Al hacer clic (Navegación directa)'
        };
      }
    }

    const savedItem = {
      id: formData.id,
      imageIndex: currentImageIndex,
      title: formData.title.trim(),
      description: formData.description.trim(),
      x: formData.x,
      y: formData.y,
      width: formData.width,
      height: formData.height,
      linkType: formData.linkType,
      colorTheme: formData.linkType === 'interface' ? 'cyan' : formData.linkType === 'both' ? 'amber' : 'emerald',
      databaseLink,
      interfaceLink
    };

    let updated;
    if (editingHotspot) {
      updated = hotspots.map(h => h.id === editingHotspot.id ? savedItem : h);
      onNotify?.(`Punto de referencia "${savedItem.title}" actualizado.`);
    } else {
      updated = [...hotspots, savedItem];
      onNotify?.(`Punto de referencia "${savedItem.title}" creado con éxito.`);
    }

    onUpdateHotspots?.(updated);
    setIsConfigModalOpen(false);
    setEditingHotspot(null);
    setActiveHotspotId(savedItem.id);
  };

  // Delete a hotspot
  const handleDeleteHotspot = (idToDelete, e) => {
    e?.stopPropagation();
    const updated = hotspots.filter(h => h.id !== idToDelete);
    onUpdateHotspots?.(updated);
    if (activeHotspotId === idToDelete) setActiveHotspotId(null);
    if (isConfigModalOpen && formData.id === idToDelete) setIsConfigModalOpen(false);
    onNotify?.('Punto de referencia eliminado.');
  };

  // Navigation click
  const handleHotspotClick = (h, e) => {
    e?.stopPropagation();
    setActiveHotspotId(prev => prev === h.id ? null : h.id);

    // If in preview mode and hotspot has interface link, clicking navigates
    if (!isEditable && h.interfaceLink?.interfaceId && onNavigateToInterface) {
      const targetInt = existingInterfaces.find(i => i.id === h.interfaceLink.interfaceId);
      if (targetInt) {
        onNavigateToInterface(targetInt);
      }
    }
  };

  // Currently selected table in modal
  const selectedTableObj = dataModels.find(t => t.id === formData.selectedTableId || t.tableName === formData.selectedTableId);
  const tableAttributes = selectedTableObj?.attributes || [];

  return (
    <div className="flex flex-col gap-3 w-full">
      
      {/* ── Control Bar for Interactive Hotspots ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-surface-container-highest/60 border border-outline-variant/80 rounded-xl text-xs font-space">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <span className="material-symbols-outlined text-primary text-[17px]">ads_click</span>
            <span>Puntos Interactivos:</span>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono text-[11px] font-bold">
            {currentImageHotspots.length} {currentImageHotspots.length === 1 ? 'punto' : 'puntos'}
          </span>

          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
              showHotspots
                ? 'bg-surface-container text-white border-outline-variant hover:border-primary'
                : 'bg-surface-container-low text-on-surface-variant border-transparent hover:text-white'
            }`}
            title={showHotspots ? 'Ocultar puntos en la imagen' : 'Mostrar puntos en la imagen'}
          >
            <span className="material-symbols-outlined text-[15px]">
              {showHotspots ? 'visibility' : 'visibility_off'}
            </span>
            <span>{showHotspots ? 'Visibles' : 'Ocultos'}</span>
          </button>
        </div>

        {/* Editor Mode Selector (Only when editable) */}
        {isEditable && (
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant">
            <button
              type="button"
              onClick={() => setEditorMode('interact')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                editorMode === 'interact'
                  ? 'bg-primary text-surface font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              title="Modo interactivo: explorar y probar clics"
            >
              <span className="material-symbols-outlined text-[14px]">touch_app</span>
              <span>Probar / Ver</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorMode('draw_box')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                editorMode === 'draw_box'
                  ? 'bg-primary text-surface font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              title="Seleccionar área: arrastra sobre la imagen para crear un recuadro interactivo"
            >
              <span className="material-symbols-outlined text-[14px]">crop_free</span>
              <span>+ Seleccionar Área</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorMode('point')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                editorMode === 'point'
                  ? 'bg-primary text-surface font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              title="Añadir punto pin: haz clic sobre la imagen para marcar un punto"
            >
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span>+ Pin</span>
            </button>
          </div>
        )}
      </div>

      {/* Guide notice when drawing is active */}
      {isEditable && editorMode === 'draw_box' && (
        <div className="p-2 px-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between text-xs font-space text-primary animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] animate-pulse">draw</span>
            <span><strong>Modo Selección de Área activo:</strong> Haz clic y arrastra sobre la imagen para marcar un elemento o botón.</span>
          </div>
          <button
            type="button"
            onClick={() => setEditorMode('interact')}
            className="text-[11px] underline hover:text-white"
          >
            Finalizar
          </button>
        </div>
      )}

      {isEditable && editorMode === 'point' && (
        <div className="p-2 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs font-space text-cyan-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] animate-pulse">pin_drop</span>
            <span><strong>Modo Pin activo:</strong> Haz clic en cualquier elemento de la interfaz para añadir un marcador directo.</span>
          </div>
          <button
            type="button"
            onClick={() => setEditorMode('interact')}
            className="text-[11px] underline hover:text-white"
          >
            Finalizar
          </button>
        </div>
      )}

      {/* ── Visual Canvas Container (Wraps the image / mockup preview) ── */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative select-none overflow-hidden rounded-xl ${
          isEditable && (editorMode === 'draw_box' || editorMode === 'point')
            ? 'cursor-crosshair ring-2 ring-primary/40'
            : ''
        }`}
      >
        {/* Render child image or mockup */}
        {children}

        {/* ── Active Drawing Selection Rectangle ── */}
        {isDrawing && currentBox && (
          <div
            className="absolute border-2 border-primary bg-primary/25 rounded pointer-events-none shadow-[0_0_15px_rgba(245,166,35,0.4)] z-30 flex items-start justify-end p-1"
            style={{
              left: `${currentBox.x}%`,
              top: `${currentBox.y}%`,
              width: `${currentBox.width}%`,
              height: `${currentBox.height}%`
            }}
          >
            <span className="px-1.5 py-0.5 rounded bg-black/80 text-primary font-mono text-[9px] font-bold">
              {Math.round(currentBox.width)}% × {Math.round(currentBox.height)}%
            </span>
          </div>
        )}

        {/* ── Existing Hotspots Overlay ── */}
        {showHotspots && currentImageHotspots.map((h, idx) => {
          const isBox = h.width > 0 && h.height > 0;
          const isActive = activeHotspotId === h.id;
          const isDb = h.linkType === 'database' || h.linkType === 'both';
          const isInt = h.linkType === 'interface' || h.linkType === 'both';

          // Color themes
          const themeBorder = isDb && isInt 
            ? 'border-amber-400 bg-amber-500/20 text-amber-300' 
            : isInt 
            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' 
            : 'border-emerald-400 bg-emerald-500/20 text-emerald-300';

          const themeBadge = isDb && isInt 
            ? 'bg-amber-500 text-surface' 
            : isInt 
            ? 'bg-cyan-500 text-surface' 
            : 'bg-emerald-500 text-surface';

          return (
            <React.Fragment key={h.id}>
              {isBox ? (
                /* Bounding Box Area */
                <div
                  onClick={(e) => handleHotspotClick(h, e)}
                  style={{
                    left: `${h.x}%`,
                    top: `${h.y}%`,
                    width: `${h.width}%`,
                    height: `${h.height}%`
                  }}
                  className={`absolute z-20 rounded border-2 transition-all duration-200 cursor-pointer ${themeBorder} ${
                    isActive 
                      ? 'ring-4 ring-white/60 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.01]' 
                      : 'hover:scale-[1.008] hover:border-white shadow-md'
                  }`}
                  title={`${idx + 1}. ${h.title}`}
                >
                  {/* Badge in top-left corner */}
                  <div className={`absolute -top-3 -left-2 px-1.5 py-0.5 rounded-full font-mono text-[10px] font-bold flex items-center gap-0.5 shadow-md ${themeBadge}`}>
                    <span>{idx + 1}</span>
                    <span className="material-symbols-outlined text-[11px]">
                      {isInt ? 'open_in_new' : 'database'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Point / Pin Marker */
                <div
                  onClick={(e) => handleHotspotClick(h, e)}
                  style={{
                    left: `${h.x}%`,
                    top: `${h.y}%`
                  }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                >
                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shadow-xl transition-transform hover:scale-125 ${themeBadge} ${
                    isActive ? 'ring-4 ring-white animate-bounce' : ''
                  }`}>
                    <span>{idx + 1}</span>
                    <span className="absolute -inset-1 rounded-full border border-current animate-ping opacity-60 pointer-events-none"></span>
                  </div>
                </div>
              )}

            </React.Fragment>
          );
        })}
      </div>

      {activeHotspot && popoverPosition && createPortal(
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: `${popoverPosition.left}px`,
            top: `${popoverPosition.top}px`,
            width: `${popoverPosition.width}px`,
            maxHeight: 'calc(100vh - 24px)'
          }}
          className="z-[99999] p-4 rounded-xl bg-surface-container border border-outline-variant shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95)] text-xs font-space animate-fadeIn flex flex-col gap-3 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-outline-variant/60 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 shadow-sm ${activeThemeBadge}`}>
                {activeHotspotIndex + 1}
              </span>
              <strong className="text-white truncate font-bold text-xs">{activeHotspot.title}</strong>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveHotspotId(null); }}
              className="text-on-surface-variant hover:text-white p-0.5 rounded hover:bg-surface-container-high transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          </div>

          {/* Target Details */}
          {activeHotspot.databaseLink && (
            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-emerald-500/40 flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">database</span>
                <span>Campo de Base de Datos</span>
              </span>
              <div className="font-mono text-white text-[11px] font-bold">
                {activeHotspot.databaseLink.tableName}.<span className="text-emerald-300">{activeHotspot.databaseLink.attributeName}</span>
              </div>
              <div className="text-[10px] text-on-surface-variant flex items-center gap-2">
                <span>Tipo: <strong className="text-white">{activeHotspot.databaseLink.attributeType}</strong></span>
                {activeHotspot.databaseLink.isPrimary && (
                  <span className="px-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px]">PK</span>
                )}
                {activeHotspot.databaseLink.foreignKey && (
                  <span className="px-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">FK</span>
                )}
              </div>
            </div>
          )}

          {activeHotspot.interfaceLink && (
            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-cyan-500/40 flex flex-col gap-1.5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                <span>Navegación de Pantalla</span>
              </span>
              <div className="font-space text-white text-xs font-bold truncate">
                {activeHotspot.interfaceLink.interfaceNumber ? `${activeHotspot.interfaceLink.interfaceNumber}. ` : ''}{activeHotspot.interfaceLink.interfaceTitle}
              </div>
              <p className="font-jakarta text-[10px] text-on-surface-variant">
                {activeHotspot.interfaceLink.action || 'Al hacer clic'}
              </p>

              {onNavigateToInterface && (
                <button
                  type="button"
                  onClick={() => {
                    const target = existingInterfaces.find(i => i.id === activeHotspot.interfaceLink.interfaceId);
                    if (target) onNavigateToInterface(target);
                  }}
                  className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-surface font-space font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <span>Navegar a esta Pantalla</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              )}
            </div>
          )}

          {activeHotspot.description && (
            <p className="font-jakarta text-[11px] text-on-surface-variant bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/60">
              {activeHotspot.description}
            </p>
          )}

          {isEditable && (
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/40">
              <button
                type="button"
                onClick={(e) => openConfigForEdit(activeHotspot, e)}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteHotspot(activeHotspot.id, e)}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:underline font-semibold"
              >
                <span className="material-symbols-outlined text-[13px]">delete</span>
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* ── Hotspot List & Management Panel ── */}
      {currentImageHotspots.length > 0 && (
        <div className="bg-surface-container-lowest/80 border border-outline-variant/80 rounded-xl p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-space text-xs font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">pin_invoke</span>
              <span>Puntos de Referencia e Interactividad Definidos</span>
            </span>

            <span className="text-[11px] font-mono text-on-surface-variant">
              {currentImageHotspots.filter(h => h.databaseLink).length} a BD • {currentImageHotspots.filter(h => h.interfaceLink).length} a Pantallas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentImageHotspots.map((h, idx) => {
              const isSelected = activeHotspotId === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setActiveHotspotId(prev => prev === h.id ? null : h.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-white shadow-sm'
                      : 'bg-surface-container-highest/40 border-outline-variant/60 hover:border-primary/40 text-on-surface-variant hover:text-white'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-mono text-[10px] font-bold text-primary shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-space text-xs font-bold text-white truncate">{h.title}</span>
                      
                      {h.databaseLink && (
                        <span className="font-mono text-[10px] text-emerald-400 truncate flex items-center gap-0.5 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">database</span>
                          <span>{h.databaseLink.tableName}.{h.databaseLink.attributeName}</span>
                        </span>
                      )}

                      {h.interfaceLink && (
                        <span className="font-space text-[10px] text-cyan-300 truncate flex items-center gap-0.5 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                          <span>{h.interfaceLink.interfaceTitle}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditable && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => openConfigForEdit(h, e)}
                        className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors"
                        title="Editar punto"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHotspot(h.id, e)}
                        className="p-1 rounded text-on-surface-variant hover:text-red-400 transition-colors"
                        title="Eliminar punto"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modal: Configurar Punto de Referencia ── */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-surface-container-low border border-outline-variant rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-xs font-space max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold">
                  <span className="material-symbols-outlined text-[18px]">ads_click</span>
                </div>
                <div>
                  <h3 className="font-space text-sm font-bold text-white">
                    {editingHotspot ? 'Editar Punto de Referencia' : 'Nuevo Punto de Referencia'}
                  </h3>
                  <p className="font-jakarta text-[11px] text-on-surface-variant">
                    Asigna un campo de la base de datos o una pantalla de destino
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveHotspot} className="flex flex-col gap-4">
              {/* Título / Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white font-bold uppercase text-[11px] tracking-wider flex items-center gap-1">
                  <span>Título / Elemento en Pantalla:</span>
                  <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Botón Iniciar Sesión, Campo Correo, Tarjeta de Resumen..."
                  className="w-full h-9 px-3 bg-surface-container border border-outline-variant rounded-lg font-space text-xs text-white focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
                  autoFocus
                />
              </div>

              {/* Selector de Tipo de Enlace */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white font-bold uppercase text-[11px] tracking-wider">
                  ¿A qué corresponde este punto de referencia?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, linkType: 'database' })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      formData.linkType === 'database'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                        : 'bg-surface-container border-outline-variant/60 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">database</span>
                    <span className="text-[11px]">Campo BD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, linkType: 'interface' })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      formData.linkType === 'interface'
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                        : 'bg-surface-container border-outline-variant/60 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    <span className="text-[11px]">Otra Pantalla</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, linkType: 'both' })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      formData.linkType === 'both'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold shadow-sm'
                        : 'bg-surface-container border-outline-variant/60 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">device_hub</span>
                    <span className="text-[11px]">Ambos (BD + UI)</span>
                  </button>
                </div>
              </div>

              {/* SECCIÓN 1: ASIGNACIÓN DE CAMPO BD */}
              {(formData.linkType === 'database' || formData.linkType === 'both') && (
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/30 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="material-symbols-outlined text-[16px]">database</span>
                    <span>Vincular a Campo de la Base de Datos</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Tabla */}
                    <div className="flex flex-col gap-1">
                      <label className="text-on-surface-variant text-[10px] uppercase font-bold">Tabla / Entidad:</label>
                      <select
                        value={formData.selectedTableId}
                        onChange={(e) => {
                          const newTableId = e.target.value;
                          const t = dataModels.find(item => item.id === newTableId || item.tableName === newTableId);
                          setFormData({
                            ...formData,
                            selectedTableId: newTableId,
                            selectedAttributeName: t?.attributes?.[0]?.name || ''
                          });
                        }}
                        className="h-8 px-2 bg-surface-container border border-outline-variant rounded text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      >
                        {dataModels.map(t => (
                          <option key={t.id} value={t.id} className="bg-surface-container text-white">
                            {t.tableName} ({t.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Atributo / Campo */}
                    <div className="flex flex-col gap-1">
                      <label className="text-on-surface-variant text-[10px] uppercase font-bold">Columna / Atributo:</label>
                      <select
                        value={formData.selectedAttributeName}
                        onChange={(e) => setFormData({ ...formData, selectedAttributeName: e.target.value })}
                        className="h-8 px-2 bg-surface-container border border-outline-variant rounded text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      >
                        {tableAttributes.map(a => (
                          <option key={a.name} value={a.name} className="bg-surface-container text-white">
                            {a.name} ({a.type}) {a.isPrimary ? '· PK' : ''} {a.foreignKey ? '· FK' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedTableObj && (
                    <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono">
                      <span>Motor: <strong className="text-white">{selectedTableObj.storageTarget?.includes('SQLite') ? 'SQLite Móvil' : 'PostgreSQL'}</strong></span>
                      <span>•</span>
                      <span>Módulo del Software: <strong className="text-white">{selectedTableObj.module}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* SECCIÓN 2: ASIGNACIÓN DE PANTALLA DESTINO */}
              {(formData.linkType === 'interface' || formData.linkType === 'both') && (
                <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/30 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>Vincular a Otra Pantalla / Flujo UI</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-on-surface-variant text-[10px] uppercase font-bold">Pantalla a la que lleva:</label>
                    <select
                      value={formData.selectedInterfaceId}
                      onChange={(e) => setFormData({ ...formData, selectedInterfaceId: e.target.value })}
                      className="h-8 px-2 bg-surface-container border border-outline-variant rounded text-xs font-space text-white focus:outline-none focus:border-cyan-500"
                    >
                      {existingInterfaces
                        .filter(i => i.id !== currentInterfaceId)
                        .map(i => (
                          <option key={i.id} value={i.id} className="bg-surface-container text-white">
                            {i.number ? `${i.number}. ` : ''}{i.title} ({i.module})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-on-surface-variant text-[10px] uppercase font-bold">Acción / Disparador:</label>
                    <input
                      type="text"
                      value={formData.actionTrigger}
                      onChange={(e) => setFormData({ ...formData, actionTrigger: e.target.value })}
                      placeholder="Ej. Clic abre modal, Redirige tras enviar formulario..."
                      className="h-8 px-2.5 bg-surface-container border border-outline-variant rounded text-xs font-jakarta text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Descripción / Comportamiento UX */}
              <div className="flex flex-col gap-1.5">
                <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                  Detalles o Reglas de Comportamiento (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej. Valida formato de email antes de enviar; si falla muestra toast en rojo..."
                  className="p-2.5 bg-surface-container border border-outline-variant rounded-lg font-jakarta text-xs text-white focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-variant/50"
                />
              </div>

              {/* Botones del Modal */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
                {editingHotspot ? (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHotspot(formData.id, e)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Eliminar</span>
                  </button>
                ) : <div></div>}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-white hover:bg-surface-container-high transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-surface font-bold shadow-md transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Guardar Punto</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
