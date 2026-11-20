import React, { useState } from 'react';

export default function Navbar({ onNavigatePortal, onOpenContact }) {
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
              Desarrollo Sistemático
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          <button 
            onClick={() => scrollToSection('metodologia')} 
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
          >
            Metodología
          </button>
          <button 
            onClick={() => scrollToSection('soluciones')} 
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
          >
            Arquitecturas
          </button>
          <button 
            onClick={() => scrollToSection('estandares')} 
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
          >
            Estándares &amp; Auditoría
          </button>
          <button 
            onClick={() => scrollToSection('manifiesto')} 
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
          >
            Manifiesto
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          {/* Direct link to Portal App */}
          <button 
            onClick={onNavigatePortal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-surface-container-high border border-primary/30 hover:border-primary text-white hover:text-primary font-space text-xs font-semibold uppercase tracking-wider transition-all duration-200"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">view_kanban</span>
            <span className="hidden sm:inline">Portal Historias</span>
            <span className="sm:hidden">Portal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          </button>

          {/* Iniciar Proyecto Primary Button */}
          <button 
            onClick={onOpenContact}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span>Iniciar Proyecto</span>
          </button>

          {/* Mobile hamburger menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded text-on-surface-variant hover:text-white hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex flex-col gap-3">
          <button 
            onClick={() => scrollToSection('metodologia')} 
            className="text-left py-2 text-sm text-on-surface-variant hover:text-white font-medium"
          >
            Metodología
          </button>
          <button 
            onClick={() => scrollToSection('soluciones')} 
            className="text-left py-2 text-sm text-on-surface-variant hover:text-white font-medium"
          >
            Arquitecturas
          </button>
          <button 
            onClick={() => scrollToSection('estandares')} 
            className="text-left py-2 text-sm text-on-surface-variant hover:text-white font-medium"
          >
            Estándares &amp; Auditoría
          </button>
          <button 
            onClick={() => scrollToSection('manifiesto')} 
            className="text-left py-2 text-sm text-on-surface-variant hover:text-white font-medium"
          >
            Manifiesto
          </button>
          <div className="pt-2 border-t border-outline-variant flex flex-col gap-2">
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigatePortal(); }}
              className="w-full py-2.5 rounded bg-surface-container text-primary font-space text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">view_kanban</span>
              Abrir Portal de Historias de Usuario
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
