import React from 'react';
import { ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';
import { COMMITMENT_MODES } from '../../../data/pricingRules';

export default function StepConfirm({
  commitmentPlan,
  leadContact,
  privacyAccepted,
  successQuote,
  onSelectCommitment,
  onUpdateContact,
  onTogglePrivacy,
  onNavigate,
  onBack,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="animate-step-enter flex flex-col gap-7">
      <div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
          4. Modalidad y Datos de Envío
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Elige tu modalidad de permanencia y recibe tu propuesta detallada por WhatsApp.
        </p>
      </div>

      {/* Modalidad de Compromiso */}
      <div>
        <span className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
          Plan de permanencia e implementación
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMMITMENT_MODES.map((mode) => {
            const isSelected = commitmentPlan === mode.id;
            const isRecommended = mode.id === 'semestral_setup_gratis';
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectCommitment(mode.id)}
                className={`p-4 rounded-[8px] border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[var(--bg-subtle)] border-2 border-[#FFC000]'
                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-2.5 right-3 bg-[#FFC000] text-[#09090B] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    $0 Implementación
                  </span>
                )}
                <span className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  {mode.name}
                </span>
                <span className="text-xs font-mono font-bold text-[var(--accent-text)] block mb-1.5 tabular-nums">
                  {mode.setupPrice === 0
                    ? 'Implementación: $0 USD'
                    : `Implementación: $${mode.setupPrice} USD (pago único)`}
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {mode.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-4">
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          ¿A quién enviamos la cotización?
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="est-lead-name" className="block text-[11px] text-[var(--text-secondary)] mb-1">
              Tu nombre completo *
            </label>
            <input
              id="est-lead-name"
              type="text"
              required
              value={leadContact.name}
              onChange={(e) => onUpdateContact('name', e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full bg-[var(--bg-page)] border border-[var(--border-strong)] focus:border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div>
            <label htmlFor="est-lead-wa" className="block text-[11px] text-[var(--text-secondary)] mb-1">
              WhatsApp de contacto *
            </label>
            <input
              id="est-lead-wa"
              type="tel"
              required
              value={leadContact.whatsapp}
              onChange={(e) => onUpdateContact('whatsapp', e.target.value)}
              placeholder="Ej. +51 987 654 321"
              className="w-full bg-[var(--bg-page)] border border-[var(--border-strong)] focus:border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="est-lead-email" className="block text-[11px] text-[var(--text-secondary)] mb-1">
            Correo electrónico (opcional)
          </label>
          <input
            id="est-lead-email"
            type="email"
            value={leadContact.email}
            onChange={(e) => onUpdateContact('email', e.target.value)}
            placeholder="nombre@empresa.com"
            className="w-full bg-[var(--bg-page)] border border-[var(--border-strong)] focus:border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* Checkbox obligatorio Política de Privacidad (#quote-privacy-checkbox inmutable) */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-[var(--text-primary)] cursor-pointer select-none">
            <input
              type="checkbox"
              id="quote-privacy-checkbox"
              checked={privacyAccepted}
              onChange={(e) => onTogglePrivacy(e.target.checked)}
              required
              className="w-4 h-4 mt-0.5 rounded border-[var(--border-strong)] accent-[#FFC000] shrink-0 cursor-pointer"
            />
            <span className="leading-relaxed">
              He leído y acepto la{' '}
              <a
                href="/legal/privacidad"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate('/legal/privacidad');
                  }
                }}
                className="text-[var(--accent-text)] font-semibold underline decoration-[#FFC000] underline-offset-2"
              >
                Política de Privacidad
              </a>{' '}
              para recibir mi cotización.
            </span>
          </label>
        </div>
      </div>

      {successQuote && (
        <div className="p-4 rounded-[8px] border border-emerald-500/40 bg-emerald-500/15 flex items-start gap-3 text-xs">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--text-primary)] block">
              Cotización {successQuote.quote_id} generada y consentimiento registrado (v.{successQuote.privacy_policy_version}).
            </strong>
            <span className="text-[var(--text-secondary)]">
              Si no se abrió WhatsApp automáticamente, puedes volver a pulsar el botón de envío.
            </span>
          </div>
        </div>
      )}

      {/* Navegación y Submit */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <span>Atrás</span>
        </button>

        <button
          type="submit"
          disabled={!privacyAccepted}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[6px] bg-[#FFC000] hover:bg-[#FFD038] disabled:opacity-45 disabled:cursor-not-allowed text-[#09090B] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
        >
          <MessageSquare size={14} strokeWidth={2} />
          <span>Enviar Cotización por WhatsApp</span>
        </button>
      </div>
    </form>
  );
}
