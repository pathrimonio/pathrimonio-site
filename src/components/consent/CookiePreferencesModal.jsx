import React, { useEffect, useState } from 'react';
import { X, Lock, BarChart3, Megaphone, ShieldCheck } from 'lucide-react';
import { useConsent } from '../../context/ConsentContext';

export default function CookiePreferencesModal({ onNavigate }) {
  const {
    isModalOpen,
    preferences,
    consentRecord,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    closePreferencesModal
  } = useConsent();

  const [analyticsEnabled, setAnalyticsEnabled] = useState(Boolean(preferences?.analytics));
  const [marketingEnabled, setMarketingEnabled] = useState(Boolean(preferences?.marketing));

  useEffect(() => {
    if (isModalOpen) {
      setAnalyticsEnabled(Boolean(preferences?.analytics));
      setMarketingEnabled(Boolean(preferences?.marketing));
    }
  }, [isModalOpen, preferences]);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closePreferencesModal();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, closePreferencesModal]);

  if (!isModalOpen) return null;

  const handlePolicyLink = (e) => {
    closePreferencesModal();
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/legal/cookies');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePreferencesModal();
      }}
    >
      <div className="w-full max-w-lg bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-[12px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)]">
              <ShieldCheck size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="cookie-modal-title" className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
                Configuración de Cookies y Privacidad
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Control granular por categoría · Ley N.º 29733 &amp; Opt-in estricto
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closePreferencesModal}
            aria-label="Cerrar panel de cookies"
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-3.5">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Elige qué categorías permites activar. Si desactivas una categoría previamente aceptada, revocamos su ejecución y eliminamos sus cookies asociadas en el navegador.{' '}
            <a
              href="/legal/cookies"
              onClick={handlePolicyLink}
              className="text-[var(--accent-text)] font-medium underline underline-offset-2"
            >
              Ver inventario completo
            </a>
            .
          </p>

          {/* Categoría 1: Necesarias (Siempre activas) */}
          <div className="p-3.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Lock size={15} className="text-[var(--accent-text)] shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    Necesarias / Técnicas
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--accent-text)]">
                    SIEMPRE ACTIVAS
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">
                  Imprescindibles para recordar tu tema claro/oscuro (<code className="font-mono">pathrimonio_theme</code>), conservar el borrador del Cotizador y FORMALIA, y guardar esta elección.
                </p>
              </div>
            </div>
            <div
              aria-label="Cookies necesarias activadas siempre"
              className="w-10 h-5 rounded-full bg-[#FFC93C]/80 border border-[#FFC93C] flex items-center justify-end px-0.5 shrink-0 opacity-85 cursor-not-allowed"
            >
              <span className="w-4 h-4 rounded-full bg-[#2B2D31]" />
            </div>
          </div>

          {/* Categoría 2: Analíticas */}
          <div className="p-3.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-page)] flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <BarChart3 size={15} className="text-[var(--text-secondary)] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[var(--text-primary)] block">
                  Analíticas y Rendimiento
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">
                  Nos ayudan a medir de forma agregada qué secciones de ingeniería y cotización resultan más útiles (GA4 / Clarity / PostHog). Bloqueadas si no aceptas.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analyticsEnabled}
              aria-label="Activar cookies analíticas"
              onClick={() => setAnalyticsEnabled((prev) => !prev)}
              className={`w-10 h-5 rounded-full border transition-colors flex items-center px-0.5 shrink-0 cursor-pointer ${
                analyticsEnabled
                  ? 'bg-[#FFC93C] border-[#FFC93C] justify-end'
                  : 'bg-[var(--bg-subtle)] border-[var(--border-strong)] justify-start'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full transition-colors ${
                  analyticsEnabled ? 'bg-[#2B2D31]' : 'bg-[var(--text-secondary)]'
                }`}
              />
            </button>
          </div>

          {/* Categoría 3: Marketing */}
          <div className="p-3.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-page)] flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Megaphone size={15} className="text-[var(--text-secondary)] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[var(--text-primary)] block">
                  Marketing y Atribución
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">
                  Permiten medir campañas informativas externas (Meta Pixel / Google Ads / LinkedIn Tag). No se cargan ni envían señales sin tu autorización explícita.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={marketingEnabled}
              aria-label="Activar cookies de marketing"
              onClick={() => setMarketingEnabled((prev) => !prev)}
              className={`w-10 h-5 rounded-full border transition-colors flex items-center px-0.5 shrink-0 cursor-pointer ${
                marketingEnabled
                  ? 'bg-[#FFC93C] border-[#FFC93C] justify-end'
                  : 'bg-[var(--bg-subtle)] border-[var(--border-strong)] justify-start'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full transition-colors ${
                  marketingEnabled ? 'bg-[#2B2D31]' : 'bg-[var(--text-secondary)]'
                }`}
              />
            </button>
          </div>

          {consentRecord?.updated_at && (
            <p className="text-[11px] font-mono text-[var(--text-muted)]">
              Último registro ({consentRecord.version}): {new Date(consentRecord.updated_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Footer Actions — Equilibrio visual estricto */}
        <div className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            type="button"
            onClick={rejectNonEssential}
            className="px-3.5 py-2 rounded-[6px] bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
          >
            Rechazar no esenciales
          </button>
          <button
            type="button"
            onClick={() =>
              savePreferences({
                analytics: analyticsEnabled,
                marketing: marketingEnabled
              })
            }
            className="px-3.5 py-2 rounded-[6px] bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
          >
            Guardar preferencias
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="px-4 py-2 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold transition-colors cursor-pointer"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
