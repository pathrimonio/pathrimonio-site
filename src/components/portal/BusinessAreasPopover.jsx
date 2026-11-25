import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

export default function BusinessAreasPopover({ actors = [] }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 12, width: 360, preferTop: false });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const hoverCloseTimer = useRef(null);

  // Aggregate unique areas and their covering actors
  const areasData = useMemo(() => {
    const map = new Map();
    actors.forEach(actor => {
      (actor.systemAreas || []).forEach(area => {
        const trimmed = (area || '').trim();
        if (!trimmed) return;
        if (!map.has(trimmed)) {
          map.set(trimmed, []);
        }
        map.get(trimmed).push({
          id: actor.id,
          name: actor.name,
          category: actor.category,
          permissionLevel: actor.permissionLevel,
          avatarIcon: actor.avatarIcon
        });
      });
    });

    return Array.from(map.entries())
      .map(([name, coveringActors]) => ({
        name,
        coveringActors,
        count: coveringActors.length
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [actors]);

  const totalAreasCovered = areasData.length;
  const isOpen = pinned || hovered;

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el || typeof window === 'undefined') return;
    const rect = el.getBoundingClientRect();
    const popupWidth = Math.min(380, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - popupWidth - 12));
    const preferTop = rect.bottom + 280 > window.innerHeight && rect.top > 280;
    const top = preferTop ? Math.max(12, rect.top - 8) : rect.bottom + 8;
    setCoords({ top, left, preferTop, width: popupWidth });
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    updatePosition();
    const handleViewportChange = () => updatePosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }
      setPinned(false);
      setHovered(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPinned(false);
        setHovered(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => () => {
    if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current);
  }, []);

  const openHover = () => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    setHovered(true);
  };

  const scheduleCloseHover = () => {
    if (hoverCloseTimer.current) window.clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = window.setTimeout(() => {
      setHovered(false);
    }, 150);
  };

  const tooltipSummary = areasData.length > 0
    ? `Áreas de negocio cubiertas (${totalAreasCovered}):\n• ` + areasData.map(a => `${a.name} (${a.count} roles)`).join('\n• ')
    : 'No hay áreas de negocio asignadas a ningún rol.';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPinned(prev => !prev);
        }}
        onMouseEnter={openHover}
        onMouseLeave={scheduleCloseHover}
        onFocus={openHover}
        onBlur={() => setHovered(false)}
        className="flex items-center gap-2 bg-surface-container-low border border-outline-variant hover:border-secondary/60 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer group shadow-sm hover:shadow-md"
        title={tooltipSummary}
        aria-label="Ver detalle de áreas de negocio cubiertas"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-[18px] text-secondary group-hover:scale-110 transition-transform">
          domain_verification
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-space text-[10px] text-on-surface-variant uppercase tracking-wider group-hover:text-white transition-colors">
              Áreas de Negocio
            </span>
            <span className="material-symbols-outlined text-[13px] text-on-surface-variant/60 group-hover:text-secondary transition-colors">
              info
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-white group-hover:text-secondary transition-colors">
            {totalAreasCovered} {totalAreasCovered === 1 ? 'Área' : 'Áreas'}
          </span>
        </div>
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Detalle de áreas de negocio"
            onMouseEnter={openHover}
            onMouseLeave={scheduleCloseHover}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: coords.width || 360,
              transform: coords.preferTop ? 'translateY(-100%)' : 'none',
              zIndex: 9999
            }}
            className="bg-[#18181b] border border-[#3f3f46] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.75)] text-left flex flex-col gap-3 animate-fadeIn"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#3f3f46]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">domain_verification</span>
                </div>
                <div>
                  <h4 className="font-space text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Áreas de Negocio Cubiertas</span>
                    <span className="px-1.5 py-0.2 rounded bg-secondary/20 text-secondary border border-secondary/30 text-[10px] font-mono font-bold">
                      {totalAreasCovered}
                    </span>
                  </h4>
                  <p className="font-jakarta text-[11px] text-on-surface-variant">
                    Módulos y dominios de negocio con roles asignados
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPinned(false);
                  setHovered(false);
                }}
                className="text-on-surface-variant hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer shrink-0"
                title="Cerrar (Esc)"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* List of Areas */}
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {areasData.length === 0 ? (
                <div className="py-4 text-center text-on-surface-variant font-jakarta text-xs">
                  No hay áreas de negocio registradas en los roles actuales.
                </div>
              ) : (
                areasData.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/60 hover:border-secondary/40 transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                        <span className="font-space text-xs font-bold text-white truncate" title={area.name}>
                          {area.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-secondary font-semibold shrink-0">
                        {area.count} {area.count === 1 ? 'rol' : 'roles'}
                      </span>
                    </div>

                    {/* Roles covering this area */}
                    <div className="flex items-center gap-1 flex-wrap pl-3.5">
                      {area.coveringActors.map((actor, aIdx) => (
                        <span
                          key={aIdx}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/60 font-jakarta text-[10px] text-on-surface-variant"
                          title={`Rol: ${actor.name} (${actor.permissionLevel})`}
                        >
                          <span className="material-symbols-outlined text-[11px] text-primary">
                            {actor.avatarIcon || 'person'}
                          </span>
                          <span className="truncate max-w-[140px]">{actor.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Tip */}
            <div className="pt-2 border-t border-[#3f3f46]/60 flex items-center justify-between text-[10px] text-on-surface-variant/80 font-space">
              <span>Vinculadas con Historias & Requerimientos</span>
              <span className="text-secondary font-mono">100% Cobertura</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
