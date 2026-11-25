import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function SectionInfoPopover({ title, description }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 12 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const hoverCloseTimer = useRef(null);

  const isOpen = pinned || hovered;

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el || typeof window === 'undefined') return;
    const rect = el.getBoundingClientRect();
    const popupWidth = Math.min(340, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - popupWidth - 12));
    const preferTop = rect.bottom + 140 > window.innerHeight && rect.top > 150;
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

  if (!description) return null;

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
    }, 120);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPinned((prev) => !prev);
        }}
        onMouseEnter={openHover}
        onMouseLeave={scheduleCloseHover}
        onFocus={openHover}
        onBlur={() => setHovered(false)}
        aria-label={title ? `Descripción de ${title}` : 'Información de sección'}
        aria-expanded={isOpen}
        title="Ver descripción de la sección"
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors shrink-0 cursor-pointer ${
          isOpen
            ? 'bg-primary/15 border-primary/50 text-primary'
            : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary/40'
        }`}
      >
        <span className="material-symbols-outlined text-[14px] leading-none">info</span>
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={title || 'Información de sección'}
            onMouseEnter={openHover}
            onMouseLeave={scheduleCloseHover}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: coords.width || 340,
              transform: coords.preferTop ? 'translateY(-100%)' : 'none',
              zIndex: 9999
            }}
            className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.65)] text-left"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-primary font-space text-[11px] font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>{title || 'Descripción'}</span>
              </div>
              {pinned && (
                <button
                  type="button"
                  onClick={() => {
                    setPinned(false);
                    setHovered(false);
                  }}
                  aria-label="Cerrar información"
                  className="text-on-surface-variant hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
            <p className="font-jakarta text-xs text-on-surface leading-relaxed">
              {description}
            </p>
          </div>,
          document.body
        )}
    </>
  );
}
