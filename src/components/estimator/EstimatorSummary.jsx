import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import {
  END_CUSTOMER_TIERS,
  INTERFACE_OPTIONS,
  DATA_AND_APIS_OPTIONS
} from '../../data/pricingRules';

export default function EstimatorSummary({
  pricing,
  configuration,
  pricingConfig = null,
  tarifaSocio,
  unitSocioPrice = 30,
  unitTradPrice,
  tradSetupFee,
  dailySocioLabel,
  activeStep,
  privacyAccepted,
  onToggleTarifaSocio,
  onReset,
  onResetCustomerTier,
  onRemoveInterface,
  onRemoveDataPackage,
  onGoToStep4,
  onSubmit,
  onCloseMobileSheet
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!confirmReset) return undefined;
    const timer = setTimeout(() => setConfirmReset(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmReset]);

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    onReset();
  };

  const traditionalCompareTotal =
    pricing.totalAdminUsers * unitTradPrice +
    pricing.monthlyCustomersExtra +
    pricing.monthlyInterfaces +
    pricing.monthlyDataAndApis;
  const socioMonthlySavings = Math.max(0, traditionalCompareTotal - pricing.monthlyTotal);

  const selectedTier = END_CUSTOMER_TIERS.find(
    (t) => t.id === configuration.end_customers_tier
  );

  const selectedInterfaces = (configuration.interfaces || [])
    .map((id) => {
      const opt = INTERFACE_OPTIONS.find((item) => item.id === id);
      if (!opt) return null;
      const override = pricingConfig?.interface_prices?.[id];
      const price = override !== undefined ? Number(override) : opt.monthlyPrice;
      return { ...opt, resolvedPrice: price };
    })
    .filter(Boolean);

  const selectedDataPackages = (configuration.data_and_apis || [])
    .map((id) => {
      const opt = DATA_AND_APIS_OPTIONS.find((item) => item.id === id);
      if (!opt) return null;
      const override = pricingConfig?.api_prices?.[id];
      const price = override !== undefined ? Number(override) : opt.monthlyPrice;
      return { ...opt, resolvedPrice: price };
    })
    .filter(Boolean);

  return (
    <div className="bg-[var(--bg-silver)] border border-[var(--border-silver)] text-[var(--text-on-silver)] rounded-[12px] p-5 sm:p-6 flex flex-col gap-5 shadow-xs">
      {/* Cabecera + Confirmación inline de reinicio en 2 clics */}
      <div className="pb-4 border-b border-[var(--border-silver)]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono font-bold text-[var(--text-on-silver)] uppercase tracking-wider">
            Resumen en Tiempo Real
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetClick}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-medium transition-colors cursor-pointer ${
                confirmReset
                  ? 'bg-red-500/15 text-red-500 border border-red-500/40 font-semibold'
                  : 'text-[var(--text-secondary-on-silver)] hover:text-[var(--text-on-silver)] hover:bg-[var(--bg-silver-subtle)]'
              }`}
            >
              <RotateCcw size={12} strokeWidth={1.75} />
              <span>{confirmReset ? '¿Confirmar?' : 'Reiniciar'}</span>
            </button>

            {onCloseMobileSheet && (
              <button
                type="button"
                onClick={onCloseMobileSheet}
                aria-label="Cerrar resumen"
                className="p-1 rounded-[5px] text-[var(--text-secondary-on-silver)] hover:text-[var(--text-on-silver)] cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Switch Tarifa Socio Protagónico (pista 44x24px) */}
        <div className="p-3 rounded-[8px] bg-[var(--bg-silver-subtle)] border border-[var(--border-silver)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--text-on-silver)]">
                Tarifa Socio (${dailySocioLabel}/día)
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary-on-silver)] block font-medium tabular-nums">
              {tarifaSocio
                ? `Ahorras $${socioMonthlySavings}/mes como Socio`
                : `Actívala para ahorrar $${Math.max(0, pricing.totalAdminUsers * Math.max(0, unitTradPrice - unitSocioPrice))}/mes`}
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={tarifaSocio}
            aria-label="Alternar Tarifa Socio"
            onClick={() => onToggleTarifaSocio(!tarifaSocio)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200 cursor-pointer ${
              tarifaSocio
                ? 'bg-[var(--accent-primary)] border-[var(--accent-text-on-solid)]/25'
                : 'bg-[var(--hsl-dark-subtle)]/40 border-[var(--border-silver)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-[var(--accent-text-on-solid)] shadow-xs transition-transform duration-200 ${
                tarifaSocio ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Total Mensual + Diario */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-[var(--text-secondary-on-silver)] font-medium">
            Mensualidad Total
          </span>
          {tarifaSocio && socioMonthlySavings > 0 && (
            <span className="text-xs font-mono text-[var(--text-secondary-on-silver)] line-through tabular-nums">
              ${traditionalCompareTotal} USD
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold font-mono tabular-nums text-[var(--text-on-silver)]">
            ${pricing.monthlyTotal} USD
          </span>
          <span className="text-xs text-[var(--text-secondary-on-silver)]">/ mes</span>
        </div>

        <div className="inline-flex items-center px-2.5 py-0.5 rounded-[5px] bg-[var(--hsl-dark-card)] text-[var(--accent-primary)] border border-[var(--hsl-dark-border)] text-xs font-mono tabular-nums font-semibold">
          ≈ ${pricing.dailyEquivalent} USD al día
        </div>
      </div>

      {/* Implementación (Setup) */}
      <div className="p-3 rounded-[8px] bg-[var(--hsl-dark-card)] text-[var(--hsl-dark-text)] border border-[var(--hsl-dark-border)] flex items-center justify-between text-xs">
        <span className="text-[var(--hsl-dark-text-secondary)]">Implementación inicial:</span>
        <div className="flex items-center gap-2 font-mono tabular-nums">
          {pricing.setupFeeSavings > 0 && (
            <span className="text-[var(--hsl-dark-text-muted)] line-through">${tradSetupFee} USD</span>
          )}
          <span className={`font-bold ${pricing.setupFee === 0 ? 'text-[var(--accent-primary)]' : 'text-[var(--hsl-dark-text)]'}`}>
            ${pricing.setupFee} USD
          </span>
        </div>
      </div>

      {/* Desglose Granular Interactivo */}
      <div className="flex flex-col gap-2 text-xs border-t border-[var(--border-silver)] pt-4">
        <span className="text-[11px] font-mono font-bold text-[var(--text-on-silver)] uppercase tracking-wider mb-1">
          Desglose de tu plan
        </span>

        {/* Roles */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[var(--text-secondary-on-silver)]">
            Roles operativos ({pricing.totalAdminUsers})
          </span>
          <span className="font-mono tabular-nums text-[var(--text-on-silver)] font-semibold">
            ${pricing.monthlyRolesBase} USD
          </span>
        </div>

        {/* Tramo clientes > base con botón × */}
        {pricing.monthlyCustomersExtra > 0 && selectedTier && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[var(--text-secondary-on-silver)] truncate">
              {selectedTier.name.replace(' activos/mes', '')}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono tabular-nums text-[var(--text-on-silver)] font-semibold">
                +${pricing.monthlyCustomersExtra} USD
              </span>
              <button
                type="button"
                onClick={onResetCustomerTier}
                aria-label="Volver al tramo base de clientes"
                title="Volver a hasta 100 clientes (incluido)"
                className="w-4 h-4 rounded flex items-center justify-center text-[var(--text-secondary-on-silver)] hover:text-red-500 hover:bg-[var(--bg-silver-subtle)] transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Interfaces seleccionadas */}
        {selectedInterfaces.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2">
            <span className="text-[var(--text-secondary-on-silver)] truncate">{item.name}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono tabular-nums text-[var(--text-on-silver)] font-semibold">
                {item.resolvedPrice === 0 ? 'Incluida' : `+$${item.resolvedPrice} USD`}
              </span>
              {!item.includedAlways && (
                <button
                  type="button"
                  onClick={() => onRemoveInterface(item.id)}
                  aria-label={`Quitar ${item.name}`}
                  title={`Quitar ${item.name}`}
                  className="w-4 h-4 rounded flex items-center justify-center text-[var(--text-secondary-on-silver)] hover:text-red-500 hover:bg-[var(--bg-silver-subtle)] transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Extensiones y conexiones externas seleccionadas */}
        {selectedDataPackages.map((pkg) => (
          <div key={pkg.id} className="flex items-center justify-between gap-2">
            <span className="text-[var(--text-secondary-on-silver)] truncate">{pkg.name}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono tabular-nums text-[var(--text-on-silver)] font-semibold">
                {pkg.resolvedPrice === 0 ? 'A medida' : `+$${pkg.resolvedPrice} USD`}
              </span>
              <button
                type="button"
                onClick={() => onRemoveDataPackage(pkg.id)}
                aria-label={`Quitar ${pkg.name}`}
                title={`Quitar ${pkg.name}`}
                className="w-4 h-4 rounded flex items-center justify-center text-[var(--text-secondary-on-silver)] hover:text-red-500 hover:bg-[var(--bg-silver-subtle)] transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Garantías limpias */}
      <div className="pt-3.5 border-t border-[var(--border-silver)] flex flex-col gap-2">
        <span className="text-[11px] font-mono font-bold text-[var(--text-on-silver)] uppercase tracking-wider">
          Garantías de la Alianza
        </span>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary-on-silver)]">
          <span className="w-4 h-4 rounded-full bg-[var(--hsl-dark-card)] text-[var(--accent-primary)] flex items-center justify-center shrink-0">
            <Check size={10} strokeWidth={2.5} />
          </span>
          <span>Propiedad total sobre tu sistema y tus datos</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary-on-silver)]">
          <span className="w-4 h-4 rounded-full bg-[var(--hsl-dark-card)] text-[var(--accent-primary)] flex items-center justify-center shrink-0">
            <Check size={10} strokeWidth={2.5} />
          </span>
          <span>Operación continua sin bloqueos por volumen</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary-on-silver)]">
          <span className="w-4 h-4 rounded-full bg-[var(--hsl-dark-card)] text-[var(--accent-primary)] flex items-center justify-center shrink-0">
            <Check size={10} strokeWidth={2.5} />
          </span>
          <span>Soporte humano y mejoras sin costo por hora</span>
        </div>
      </div>

      {/* CTA Principal */}
      {activeStep < 4 ? (
        <button
          type="button"
          onClick={onGoToStep4}
          className="btn-accent w-full py-2.5 text-xs font-bold cursor-pointer text-center shadow-xs"
        >
          Completar y Enviar Cotización
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!privacyAccepted}
          className="btn-accent w-full py-2.5 disabled:opacity-45 disabled:cursor-not-allowed text-xs font-bold cursor-pointer text-center shadow-xs"
        >
          Enviar a WhatsApp Ahora
        </button>
      )}
    </div>
  );
}
