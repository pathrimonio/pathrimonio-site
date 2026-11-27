import React, { useState } from 'react';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';

export default function Navbar({
  onOpenPortal,
  onOpenRegister,
  theme,
  onToggleTheme,
  onNavigate,
  isSubpage = false
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Roles & Control', href: isSubpage ? '/#roles' : '#roles' },
    { name: 'Arquitectura', href: isSubpage ? '/#arquitectura' : '#arquitectura' },
    { name: 'Socios', href: isSubpage ? '/#socios' : '#socios' },
    { name: 'FORMALIA', href: '/formalia' },
    { name: 'Cotizador', href: isSubpage ? '/#cotizador' : '#cotizador' },
    { name: 'FAQ', href: isSubpage ? '/#faq' : '#faq' },
  ];

  const handleNavClick = (href) => (e) => {
    setMobileMenuOpen(false);
    if (onNavigate && href.startsWith('/')) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  const isDarkTheme = theme !== 'light';

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors ${
        isDarkTheme
          ? 'bg-black border-white/10 text-[#D9DADC]'
          : 'bg-white border-black/10 text-[#2B2D31]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <a
          href="/"
          onClick={(e) => {
            if (isSubpage && onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
          className="flex items-center gap-2.5 text-[var(--text-primary)] font-semibold tracking-tight text-lg group"
        >
          <img
            src="/assets/images/icono_202609011609.jpg"
            alt="Pathrimonio"
            className="w-8 h-8 rounded-[6px] object-cover shrink-0 transition-transform group-hover:scale-105 shadow-xs border border-[var(--border-subtle)]"
          />
          <img
            src="/assets/images/Banner_PATHRIMONIO_COMPANY.png"
            alt="Pathrimonio Company"
            className={`h-9 sm:h-10 w-auto object-contain rounded-[6px] bg-black shrink-0 transition-transform group-hover:scale-[1.02] ${
              isDarkTheme ? 'px-0 border border-transparent' : 'px-1.5 border border-black/15 shadow-xs'
            }`}
          />
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={handleNavClick(link.href)}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle Button (Gray #2B2D31 <-> Silver #D9DADC) */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a contraste Silver' : 'Cambiar a primario Gray'}
            title={theme === 'dark' ? 'Alternar contraste Silver' : 'Activar base Gray #2B2D31'}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] rounded-[6px] transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={15} strokeWidth={1.75} className="text-[#FFC93C]" />
            ) : (
              <Moon size={15} strokeWidth={1.75} />
            )}
          </button>

          <button
            onClick={onOpenPortal}
            className="px-3.5 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] rounded-[6px] transition-all cursor-pointer"
          >
            Portal Operativo
          </button>
          <a
            href={isSubpage ? '/#cotizador' : '#cotizador'}
            onClick={handleNavClick(isSubpage ? '/#cotizador' : '#cotizador')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#2B2D31] bg-[#FFC93C] hover:bg-[#FFD561] active:scale-[0.98] rounded-[6px] transition-all shadow-sm cursor-pointer"
          >
            <span>Cotizar ($1/día)</span>
            <ArrowRight size={13} strokeWidth={1.75} />
          </a>
        </div>

        {/* Mobile Menu & Theme Buttons */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a contraste Silver' : 'Cambiar a primario Gray'}
            className="p-2 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={18} strokeWidth={1.75} className="text-[#FFC93C]" />
            ) : (
              <Moon size={18} strokeWidth={1.75} />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`sm:hidden border-b border-[var(--border-subtle)] px-6 py-4 flex flex-col gap-3 ${
            isDarkTheme ? 'bg-black' : 'bg-white'
          }`}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={handleNavClick(link.href)}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1.5 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
            <div className="flex items-center justify-between py-1.5 px-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Contraste</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[6px]"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={13} className="text-[#FFC93C]" />
                    <span>Silver</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} />
                    <span>Gray Base</span>
                  </>
                )}
              </button>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenPortal(); }}
              className="w-full text-center py-2 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[6px]"
            >
              Portal Operativo (Ingreso)
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
              className="w-full text-center py-2 text-xs font-medium text-[var(--text-on-silver)] bg-[var(--bg-silver)] hover:bg-[var(--bg-silver-hover)] rounded-[6px]"
            >
              Crear Cuenta Colaborador
            </button>
            <a
              href={isSubpage ? '/#cotizador' : '#cotizador'}
              onClick={handleNavClick(isSubpage ? '/#cotizador' : '#cotizador')}
              className="w-full text-center py-2 text-xs font-semibold text-[#2B2D31] bg-[#FFC93C] hover:bg-[#FFD561] rounded-[6px]"
            >
              Cotizar Sistema a Medida
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
