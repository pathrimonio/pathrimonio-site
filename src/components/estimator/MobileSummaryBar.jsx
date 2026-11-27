import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import EstimatorSummary from './EstimatorSummary';

export default function MobileSummaryBar({
  isOpen,
  onToggleOpen,
  onClose,
  summaryProps
}) {
  const { pricing, tarifaSocio } = summaryProps;

  return (
    <div className="lg:hidden">
      {/* Bottom Sheet desplegable con el contenido completo de EstimatorSummary */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-xs"
          />
          <div className="relative z-10 max-h-[82vh] overflow-y-auto rounded-t-[16px] bg-[var(--bg-page)] p-3 border-t border-[var(--border-strong)] shadow-2xl">
            <EstimatorSummary {...summaryProps} onCloseMobileSheet={onClose} />
          </div>
        </div>
      )}

      {/* Barra fija inferior (< 1024px) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-strong)] px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono tabular-nums text-[var(--text-primary)]">
                ${pricing.monthlyTotal} USD/mes
              </span>
              {tarifaSocio && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFC000] text-[#09090B]">
                  Socio
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono tabular-nums text-[var(--text-secondary)] block">
              ≈ ${pricing.dailyEquivalent}/día · {pricing.totalAdminUsers}{' '}
              {pricing.totalAdminUsers === 1 ? 'rol' : 'roles'}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            aria-expanded={isOpen}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#FFC000] hover:bg-[#FFD038] text-[#09090B] text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            <span>{isOpen ? 'Ocultar' : 'Ver desglose'}</span>
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
