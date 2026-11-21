import React, { useState } from 'react';

export default function Navbar({ onOpenContact, onOpenPortal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="h-20 w-full px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center group-hover:border-primary/50 transition-colors shadow-sm">
            <img src="/assets/images/logo.png" alt="Pathrimonio Logo" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-space text-lg font-bold tracking-tight text-white flex items-center">
              PATH<span className="text-primary">RIMONIO</span>
            </span>
            <span className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Software Development
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => scrollToSection('pathway')} 
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-primary hover:text-white hover:bg-surface-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">route</span>
            <span>Pathway (App MVP)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          </button>
          <button 
            onClick={() => scrollToSection('servicios')} 
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
          >
            Servicios
          </button>
          <button 
            onClick={() => scrollToSection('metodologia')} 
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
          >
            Cómo Trabajamos
          </button>
          <button 
            onClick={() => scrollToSection('futuro')} 
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
          >
            Visión &amp; Futuro
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenPortal}
            title="Ir al Portal"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs font-semibold tracking-wide transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">login</span>
            <span>Ir al Portal</span>
          </button>

          {/* Contacto / Iniciar Proyecto */}
          <button 
            onClick={onOpenContact}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Hablemos</span>
          </button>

          {/* Mobile hamburger menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-on-surface-variant hover:text-white hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex flex-col gap-3">
          <button 
            onClick={() => scrollToSection('pathway')} 
            className="text-left py-2 text-sm text-primary font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">route</span>
            Pathway (App de Metas MVP)
          </button>
          <button 
            onClick={() => scrollToSection('servicios')} 
            className="text-left py-2 text-sm text-on-surface-variant hover:text-white font-medium"
          >
            Servicios de Desarrollo
          </button>
          <button 
            onClick={() => scrollToSection('metodologia')} 
            className="text-left py-2 text-sm text-on-surface-variant hover:text-white font-medium"
          >
            Cómo Trabajamos
          </button>
          <button 
            onClick={() => scrollToSection('futuro')} 
            className="text-left py-2 text-sm text-on-surface-variant hover:text-white font-medium"
          >
            Visión &amp; Próximos Productos
          </button>
          <div className="pt-2 border-t border-outline-variant flex flex-col gap-2">
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenPortal?.(); }}
              className="w-full py-2.5 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs font-semibold tracking-wide flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">login</span>
              Ir al Portal
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenContact(); }}
              className="w-full py-2.5 rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Contactar al Equipo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
