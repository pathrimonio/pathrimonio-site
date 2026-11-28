import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ShieldCheck } from 'lucide-react';
import {
  END_CUSTOMER_TIERS,
  INTERFACE_OPTIONS,
  DATA_AND_APIS_OPTIONS
} from '../../../data/pricingRules';

export default function StepChannels({
  configuration,
  defaultExpandedExtensions = false,
  onSelectCustomerTier,
  onToggleInterface,
  onToggleDataPackage,
  onOpenContact,
  onBack,
  onNext
}) {
  const [extensionsOpen, setExtensionsOpen] = useState(defaultExpandedExtensions);

  useEffect(() => {
    if (defaultExpandedExtensions) {
      setExtensionsOpen(true);
    }
  }, [defaultExpandedExtensions]);

  const selectedDataCount = (configuration.data_and_apis || []).length;
  const hasHardwareTrigger = (configuration.data_and_apis || []).includes('integracion_hardware_erp');

  return (
    <div className="animate-step-enter flex flex-col gap-7">
      <div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
          3. Canales y Capacidad
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Ajusta el alcance de clientes, vistas adicionales y extensiones opcionales.
        </p>
      </div>

      {/* 1. Clientes finales activos: Grid compacto de 3 columnas */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-medium text-[var(--text-primary)]">
            Volumen mensual de clientes activos
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]"
            title="Si superas los 100 clientes en el mes, el sistema nunca se bloquea."
          >
            <ShieldCheck size={13} className="text-[var(--accent-text)] shrink-0" />
            <span>Sin bloqueos si superas el tramo</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {END_CUSTOMER_TIERS.map((tier) => {
            const isSelected = configuration.end_customers_tier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onSelectCustomerTier(tier.id)}
                title={tier.desc}
                className={`p-3 rounded-[8px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-[var(--bg-subtle)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-border)]'
                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                  {tier.name.replace(' activos/mes', '')}
                </span>
                <span className="text-[11px] font-mono font-bold text-[var(--accent-text)] tabular-nums">
                  {tier.monthlyPrice === 0 ? 'Incluido' : `+$${tier.monthlyPrice}/mes`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interfaces adicionales: Grid de 2 columnas con tarjetas toggle */}
      <div>
        <span className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
          Interfaces y canales de interacción
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {INTERFACE_OPTIONS.map((opt) => {
            const isChecked = (configuration.interfaces || []).includes(opt.id);
            const isRequired = Boolean(opt.includedAlways);
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isRequired}
                onClick={() => onToggleInterface(opt.id)}
                className={`p-3.5 rounded-[8px] border text-left transition-all flex items-start justify-between gap-3 ${
                  isRequired ? 'cursor-default' : 'cursor-pointer'
                } ${
                  isChecked
                    ? 'bg-[var(--bg-subtle)] border-[var(--accent-border)]'
                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {opt.name}
                    </span>
                    {isRequired && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent-border)] rounded">
                        Incluida
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span className="text-xs font-mono font-bold text-[var(--accent-text)] tabular-nums">
                    {opt.monthlyPrice === 0 ? '$0' : `+$${opt.monthlyPrice}`}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                      isChecked
                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-text-on-solid)]'
                        : 'border-[var(--border-strong)] bg-[var(--bg-page)]'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={2.5} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Extensiones opcionales dentro de acordeón colapsable */}
      <div className="t-acc rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-page)]" data-open={extensionsOpen ? 'true' : 'false'}>
        <button
          type="button"
          onClick={() => setExtensionsOpen((prev) => !prev)}
          aria-expanded={extensionsOpen}
          className="w-full px-4 py-3 flex items-center justify-between text-left gap-3 cursor-pointer"
        >
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            Extensiones y conexiones externas (Opcional — {selectedDataCount}{' '}
            {selectedDataCount === 1 ? 'seleccionada' : 'seleccionadas'})
          </span>
          <ChevronDown
            size={16}
            className="t-acc-chevron text-[var(--text-secondary)] shrink-0"
          />
        </button>

        <div className="t-acc-panel">
          <div className="t-acc-panel-inner">
            <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {DATA_AND_APIS_OPTIONS.map((pkg) => {
                  const isChecked = (configuration.data_and_apis || []).includes(pkg.id);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => onToggleDataPackage(pkg.id)}
                      title={pkg.desc}
                      className={`h-9 sm:h-10 px-3.5 rounded-[8px] border text-xs transition-all cursor-pointer inline-flex items-center gap-2 ${
                        isChecked
                          ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-text-on-solid)] font-semibold shadow-xs'
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <span>{pkg.name}</span>
                      <span
                        className={`text-[11px] font-mono tabular-nums ${
                          isChecked ? 'text-[var(--accent-text-on-solid)]/80 font-bold' : 'text-[var(--accent-text)]'
                        }`}
                      >
                        {pkg.monthlyPrice === 0 ? 'A medida' : `+$${pkg.monthlyPrice}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasHardwareTrigger && onOpenContact && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
                  <span>¿Quieres confirmar compatibilidad de balanzas o impresoras?</span>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="font-semibold text-[var(--accent-text)] underline underline-offset-4 cursor-pointer"
                  >
                    Coordinar validación técnica
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <span>Atrás</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn-accent group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold cursor-pointer"
        >
          <span>Continuar a Modalidad</span>
          <ArrowRight
            size={14}
            strokeWidth={2}
            className="transition-transform duration-150 group-hover:translate-x-[3px]"
          />
        </button>
      </div>
    </div>
  );
}
