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

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFFFF]/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-[#E4E4E7] dark:border-[#27272A] transition-colors">
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
          className="flex items-center gap-2.5 text-[#09090B] dark:text-[#F4F4F5] font-semibold tracking-tight text-lg group"
        >
          <img
            src="/assets/images/icono_202609011609.jpg"
            alt="Pathrimonio"
            className="w-8 h-8 rounded-[6px] object-cover shrink-0 transition-transform group-hover:scale-105 shadow-xs"
          />
          <span className="font-semibold text-[17px] tracking-tight">Pathrimonio</span>
          <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-[#9A6700] dark:text-[#FFC000] bg-[#FFFBEB] dark:bg-amber-500/10 px-2 py-0.5 rounded-[4px] border border-amber-200/80 dark:border-amber-500/30">
            Company
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={handleNavClick(link.href)}
              className="text-sm font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors"
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
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="p-2 text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46] hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] rounded-[6px] transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={15} strokeWidth={1.75} className="text-[#FFC000]" />
            ) : (
              <Moon size={15} strokeWidth={1.75} />
            )}
          </button>

          <button
            onClick={onOpenPortal}
            className="px-3.5 py-1.5 text-xs font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46] hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] rounded-[6px] transition-all cursor-pointer"
          >
            Portal Operativo
          </button>
          <a
            href={isSubpage ? '/#cotizador' : '#cotizador'}
            onClick={handleNavClick(isSubpage ? '/#cotizador' : '#cotizador')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#09090B] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] rounded-[6px] transition-colors shadow-sm cursor-pointer"
          >
            <span>Cotizar ($1/día)</span>
            <ArrowRight size={13} strokeWidth={1.5} />
          </a>
        </div>

        {/* Mobile Menu & Theme Buttons */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-[6px] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={18} strokeWidth={1.75} className="text-[#FFC000]" />
            ) : (
              <Moon size={18} strokeWidth={1.75} />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[6px] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FFFFFF] dark:bg-[#09090B] border-b border-[#E4E4E7] dark:border-[#27272A] px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={handleNavClick(link.href)}
              className="text-sm font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] py-1.5 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-3 border-t border-[#E4E4E7] dark:border-[#27272A] flex flex-col gap-2">
            <div className="flex items-center justify-between py-1.5 px-1">
              <span className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">Tema</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] bg-[#F4F4F5] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-[6px]"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={13} className="text-[#FFC000]" />
                    <span>Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} />
                    <span>Modo Oscuro</span>
                  </>
                )}
              </button>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenPortal(); }}
              className="w-full text-center py-2 text-xs font-medium text-[#52525B] dark:text-[#A1A1AA] bg-[#F4F4F5] dark:bg-[#18181B] rounded-[6px]"
            >
              Portal Operativo (Ingreso)
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
              className="w-full text-center py-2 text-xs font-medium text-[#9A6700] dark:text-[#FFC000] bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 rounded-[6px]"
            >
              Crear Cuenta Colaborador
            </button>
            <a
              href={isSubpage ? '/#cotizador' : '#cotizador'}
              onClick={handleNavClick(isSubpage ? '/#cotizador' : '#cotizador')}
              className="w-full text-center py-2 text-xs font-semibold text-[#09090B] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] rounded-[6px]"
            >
              Cotizar Sistema a Medida
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
