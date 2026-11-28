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
    { name: 'Roles', href: isSubpage ? '/#roles' : '#roles' },
    { name: 'FormalIA', href: isSubpage ? '/formalia' : '#formalia-demo' },
    { name: 'Socios', href: isSubpage ? '/#socios' : '#socios' },
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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <div className="site-container h-16 flex items-center justify-between gap-4">
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
            src={
              isDarkTheme
                ? '/assets/images/logo-sin-fondo-oscuro.png'
                : '/assets/images/logo-sin-fondo-claro.png'
            }
            alt="Pathrimonio"
            className="h-9 sm:h-10 w-auto aspect-square shrink-0 object-contain transition-transform group-hover:scale-105"
          />
          <img
            src={
              isDarkTheme
                ? '/assets/images/Banner_PATHRIMONIO_COMPANY.png'
                : '/assets/images/Banner_Blanco_PATHRIMONIO_COMPANY.png'
            }
            alt="Pathrimonio Company"
            className="h-8 sm:h-9 w-auto object-contain shrink-0 transition-transform group-hover:scale-[1.02]"
          />
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={handleNavClick(link.href)}
              className="nav-link-draw text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className="btn-secondary-ghost p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={15} strokeWidth={1.75} className="text-[var(--accent-primary)]" />
            ) : (
              <Moon size={15} strokeWidth={1.75} />
            )}
          </button>

          <button
            onClick={onOpenPortal}
            className="btn-secondary-ghost px-3.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            Portal Operativo
          </button>
          <a
            href={isSubpage ? '/#cotizador' : '#cotizador'}
            onClick={handleNavClick(isSubpage ? '/#cotizador' : '#cotizador')}
            className="btn-accent group inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs shadow-sm cursor-pointer"
          >
            <span>Cotizar mi sistema</span>
            <ArrowRight size={13} strokeWidth={1.75} className="transition-transform duration-150 group-hover:translate-x-[3px]" />
          </a>
        </div>

        {/* Mobile Menu & Theme Buttons */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className="p-2 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={18} strokeWidth={1.75} className="text-[var(--accent-primary)]" />
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
        <div className="sm:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-page)] px-6 py-4 flex flex-col gap-3">
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
                    <Sun size={13} className="text-[var(--accent-primary)]" />
                    <span>Claro (96%)</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} />
                    <span>Oscuro (8%)</span>
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
              className="btn-accent w-full text-center py-2.5 text-xs"
            >
              Cotizar mi sistema
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
