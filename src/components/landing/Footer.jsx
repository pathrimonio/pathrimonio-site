import React from 'react';
import { ExternalLink, SlidersHorizontal, BookOpenCheck, MessageSquare } from 'lucide-react';
import { useConsent } from '../../context/ConsentContext';
import { LEGAL_ENTITY } from '../../config/siteConfig';

export default function Footer({ onNavigate }) {
  const { openPreferencesModal } = useConsent();

  const handleLinkClick = (path) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <footer className="w-full bg-[var(--hsl-dark-deep)] text-[var(--hsl-dark-text)] border-t border-[var(--hsl-dark-border)] py-14 transition-colors">
      <div className="site-container">
        {/* Cabecera minimalista del Footer */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-[var(--hsl-dark-border)]">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/assets/images/logo-sin-fondo-oscuro.png"
                alt="Pathrimonio Company"
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="font-semibold text-base text-[var(--hsl-dark-text)] tracking-tight">
                Pathrimonio Company
              </span>
            </div>
            <p className="text-xs text-[var(--hsl-dark-text-secondary)] leading-relaxed">
              Software a medida estructurado por roles para ordenar negocios reales y fortalecer el desarrollo comunitario.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/pathcom"
              onClick={handleLinkClick('/pathcom')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[var(--hsl-dark-card)] border border-[var(--hsl-dark-border)] hover:border-[var(--accent-primary)]/60 text-xs font-medium text-[var(--hsl-dark-text)] transition-colors"
            >
              <span>Pathcom &amp; Market</span>
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[var(--hsl-dark-card)] border border-[var(--hsl-dark-border)] hover:border-[var(--accent-primary)]/60 text-xs font-medium text-[var(--hsl-dark-text)] transition-colors"
            >
              <span>Pathway App (Google Play)</span>
              <ExternalLink size={12} strokeWidth={1.75} className="text-[var(--accent-primary)]" />
            </a>

            <a
              href="https://wa.me/51950293223?text=Hola,%20quisiera%20contactar%20al%20equipo%20de%20Pathrimonio"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <MessageSquare size={13} strokeWidth={2} />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>

        {/* Barra Legal & Cookies */}
        <div className="pt-6 pb-4 border-b border-[var(--hsl-dark-border)] flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--hsl-dark-text-secondary)]">
          <nav aria-label="Enlaces legales" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="/legal/aviso-legal"
              onClick={handleLinkClick('/legal/aviso-legal')}
              className="hover:text-[var(--hsl-dark-text)] transition-colors"
            >
              Aviso Legal
            </a>
            <a
              href="/legal/privacidad"
              onClick={handleLinkClick('/legal/privacidad')}
              className="hover:text-[var(--hsl-dark-text)] transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="/legal/cookies"
              onClick={handleLinkClick('/legal/cookies')}
              className="hover:text-[var(--hsl-dark-text)] transition-colors"
            >
              Política de Cookies
            </a>
            <a
              href="/legal/libro-reclamaciones"
              onClick={handleLinkClick('/legal/libro-reclamaciones')}
              className="inline-flex items-center gap-1.5 text-[var(--hsl-dark-text)] font-medium hover:text-[var(--accent-primary)] transition-colors"
            >
              <BookOpenCheck size={13} strokeWidth={1.75} className="text-[var(--accent-primary)]" />
              <span>Libro de Reclamaciones</span>
            </a>
          </nav>

          <button
            type="button"
            onClick={openPreferencesModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--hsl-dark-card)] border border-[var(--hsl-dark-border)] hover:border-[var(--accent-primary)]/60 text-xs font-medium text-[var(--hsl-dark-text)] transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={12} strokeWidth={1.75} className="text-[var(--accent-primary)]" />
            <span>Configurar cookies</span>
          </button>
        </div>

        {/* Pie inferior */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--hsl-dark-text-muted)]">
          <span>© 2026 Pathrimonio Company. Todos los derechos reservados.</span>
          <a href={`mailto:${LEGAL_ENTITY.email}`} className="hover:text-[var(--hsl-dark-text)] transition-colors">
            {LEGAL_ENTITY.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
