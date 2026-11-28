import React from 'react';
import { Check } from 'lucide-react';

export const ESTIMATOR_STEPS = [
  { num: 1, title: 'Tu Negocio' },
  { num: 2, title: 'Roles y Equipo' },
  { num: 3, title: 'Canales y Clientes' },
  { num: 4, title: 'Modalidad y Envío' }
];

export default function EstimatorStepper({ activeStep, onStepClick }) {
  const current = ESTIMATOR_STEPS.find((s) => s.num === activeStep) || ESTIMATOR_STEPS[0];
  const progressPct = (activeStep / ESTIMATOR_STEPS.length) * 100;

  return (
    <div className="mb-8">
      {/* Vista Móvil (< 640px): Barra lineal de progreso + Paso X de 4 sin truncar */}
      <div className="sm:hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[10px] p-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Paso {activeStep} de {ESTIMATOR_STEPS.length}
          </span>
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {current.title}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[var(--bg-page)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent-primary)] transition-[width] duration-200 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Vista Tablet / Escritorio (>= 640px): 4 pasos horizontales conectados */}
      <div className="hidden sm:flex items-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[10px] px-4 py-3 gap-2">
        {ESTIMATOR_STEPS.map((step, index) => {
          const isActive = activeStep === step.num;
          const isPast = activeStep > step.num;
          return (
            <React.Fragment key={step.num}>
              <button
                type="button"
                onClick={() => onStepClick(step.num)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[7px] text-xs transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] font-bold shadow-xs'
                    : isPast
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium hover:border-[var(--accent-border)] border border-transparent'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]/60'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    isActive
                      ? 'bg-[var(--accent-text-on-solid)] text-[var(--accent-primary)] font-bold'
                      : isPast
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] font-bold'
                      : 'bg-[var(--bg-page)] border border-[var(--border-strong)] text-[var(--text-muted)]'
                  }`}
                >
                  {isPast ? <Check size={11} strokeWidth={2.5} /> : step.num}
                </span>
                <span>{step.title}</span>
              </button>

              {index < ESTIMATOR_STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`flex-1 h-px transition-colors ${
                    isPast ? 'bg-[var(--accent-primary)]/60' : 'bg-[var(--border-subtle)]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
