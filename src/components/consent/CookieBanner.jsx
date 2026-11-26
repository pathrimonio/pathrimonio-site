import React from 'react';
import { ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useConsent } from '../../context/ConsentContext';

export default function CookieBanner({ onNavigate }) {
  const { showBanner, acceptAll, rejectNonEssential, openPreferencesModal } = useConsent();

  if (!showBanner) return null;

  const handleCookiePolicyClick = (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/legal/cookies');
    }
  };

  return (
    <aside
      role="region"
      aria-label="Aviso de privacidad y preferencias de cookies"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-[440px] z-[80] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-[12px] p-4 sm:p-5 shadow-2xl transition-colors"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-[6px] bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)] shrink-0 mt-0.5">
          <ShieldCheck size={17} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight leading-snug">
            Control real de tus cookies
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
            Solo usamos almacenamiento técnico esencial (tema y borrador de tu cotización). Los scripts de analítica o marketing están{' '}
            <strong className="text-[var(--text-primary)]">bloqueados por defecto</strong> hasta tu autorización.{' '}
            <a
              href="/legal/cookies"
              onClick={handleCookiePolicyClick}
              className="text-[var(--accent-text)] font-medium underline underline-offset-2 hover:opacity-80"
            >
              Política de Cookies
            </a>
            .
          </p>
        </div>
      </div>

      {/* Equilibrio visual obligatorio sin dark patterns (SDD 3.4) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <button
          type="button"
          onClick={acceptAll}
          className="flex-1 inline-flex items-center justify-center px-3.5 py-2 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          Aceptar todas
        </button>

        <button
          type="button"
          onClick={rejectNonEssential}
          className="flex-1 inline-flex items-center justify-center px-3.5 py-2 rounded-[6px] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          Rechazar no esenciales
        </button>

        <button
          type="button"
          onClick={openPreferencesModal}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <SlidersHorizontal size={13} strokeWidth={1.75} />
          <span>Configurar</span>
        </button>
      </div>
    </aside>
  );
}
