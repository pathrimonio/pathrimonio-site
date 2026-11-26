import React from 'react';
import { ArrowLeft, FileText, Shield, Cookie, BookOpenCheck } from 'lucide-react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';
import { LEGAL_ENTITY, LEGAL_ROUTES } from '../../config/siteConfig';

const ROUTE_ICONS = {
  'aviso-legal': FileText,
  privacidad: Shield,
  cookies: Cookie,
  'libro-reclamaciones': BookOpenCheck
};

export default function LegalLayout({
  activeSlug,
  title,
  subtitle,
  theme,
  onToggleTheme,
  onNavigate,
  onOpenPortal,
  onOpenRegister,
  onOpenContact,
  children
}) {
  const handleLinkClick = (path) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[var(--bg-page)] text-[var(--text-primary)] min-h-screen transition-colors duration-200">
      <Navbar
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenPortal={onOpenPortal}
        onOpenRegister={onOpenRegister}
        onNavigate={onNavigate}
        isSubpage
      />

      <main className="flex-1 w-full">
        {/* Top bar / Breadcrumb + índice de documentos legales */}
        <div className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-3xl mx-auto px-6 py-8 sm:py-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <a
                href="/"
                onClick={handleLinkClick('/')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Volver al inicio</span>
              </a>

              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] text-[11px] font-mono">
                <span className="font-semibold text-[var(--text-primary)]">DOCUMENTACIÓN LEGAL</span>
                <span>·</span>
                <span>Act. {LEGAL_ENTITY.lastUpdated}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* Índice de rutas legales */}
            <nav aria-label="Documentos legales" className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-[var(--border-subtle)]">
              {LEGAL_ROUTES.map((route) => {
                const Icon = ROUTE_ICONS[route.slug] || FileText;
                const isActive = route.slug === activeSlug;
                return (
                  <a
                    key={route.path}
                    href={route.path}
                    onClick={handleLinkClick(route.path)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-colors ${
                      isActive
                        ? 'bg-[#FFC93C] border-[#FFC93C] text-[#2B2D31] font-semibold'
                        : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <Icon size={13} strokeWidth={1.75} />
                    <span>{route.shortTitle}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido principal centrado max-w-3xl */}
        <article className="max-w-3xl mx-auto px-6 py-10 sm:py-14 flex flex-col gap-8 text-sm text-[var(--text-secondary)] leading-relaxed">
          {children}
        </article>
      </main>

      <Footer onOpenContact={onOpenContact} onNavigate={onNavigate} />
    </div>
  );
}
