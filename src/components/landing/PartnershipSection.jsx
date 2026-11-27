import React, { useState } from 'react';
import { Check, X, Gift, ArrowRight } from 'lucide-react';

export default function PartnershipSection({ pricingConfig = null }) {
  const [referralsCount, setReferralsCount] = useState(2);

  const unitRolePrice = Number(pricingConfig?.admin_role_monthly_usd ?? 30);
  const dailyRateLabel = Number((unitRolePrice / 30).toFixed(2).replace(/\.00$/, ''));
  const reqPartners = Math.max(1, Number(pricingConfig?.referral_credit_rule?.referrals_required ?? 2));
  const rewardMonths = Math.max(1, Number(pricingConfig?.referral_credit_rule?.bonus_role_months ?? 2));
  const fullPairs = Math.floor(referralsCount / reqPartners);
  const creditValue =
    fullPairs * unitRolePrice * rewardMonths +
    (referralsCount % reqPartners === 1 ? Math.round((unitRolePrice * rewardMonths) / (reqPartners * 2)) : 0);
  const monthsBonifiedSingleRole = fullPairs * rewardMonths;
  const rolesBonifiedSingleMonth = fullPairs * rewardMonths;

  return (
    <section id="socios" className="w-full py-20 lg:py-28 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors">
      <div className="site-container">
        {/* Encabezado */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-mono mb-3">
            <span className="font-semibold">PROGRAMA DE SOCIOS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
            Modelo cooperativo frente al desarrollo de software tradicional.
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Eliminamos las barreras financieras que dejan fuera a los negocios locales y colectivos.
            Compara el modelo tradicional con nuestro compromiso de permanencia e impacto mutuo.
          </p>
        </div>

        {/* Comparativa 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-14">
          {/* Columna Estándar Tradicional (Gray Recessed) */}
          <div className="bg-[var(--bg-surface-deep)] border border-[var(--border-subtle)] rounded-[10px] p-8 flex flex-col justify-between text-[#D9DADC]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#D9DADC]/15 mb-6">
                <div>
                  <span className="text-xs font-mono text-[#9699A1] uppercase tracking-wider block mb-1">Modelo Comercial</span>
                  <h3 className="text-xl font-bold text-[#D9DADC]">Desarrollo Tradicional</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-[#2B2D31] text-[#B8BAC0] border border-[#D9DADC]/15 rounded-[4px]">
                  Mercado ERP
                </span>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-[#D9DADC] font-mono tabular-nums mb-1">
                  $2,500 – $5,000+
                </div>
                <p className="text-xs text-[#B8BAC0]">Costo inicial de setup + tarifas de mantenimiento por hora</p>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm text-[#B8BAC0]">
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.5} className="text-[#9699A1] shrink-0 mt-0.5" />
                  <span>Cobro elevado de implementación inicial sin garantía de adopción.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.5} className="text-[#9699A1] shrink-0 mt-0.5" />
                  <span>Costo por hora técnica ante cualquier ajuste o requerimiento nuevo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.5} className="text-[#9699A1] shrink-0 mt-0.5" />
                  <span>Dependencia de nube propietaria y trabas para exportar tu base de datos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.5} className="text-[#9699A1] shrink-0 mt-0.5" />
                  <span>Cero reinversión comunitaria ni soporte presencial en el territorio.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-8 border-t border-[#D9DADC]/15 text-xs text-[#9699A1] font-mono">
              Enfoque extractivo de licencias
            </div>
          </div>

          {/* Columna Socio ($1/día) Destacada en Silver #D9DADC + Borde & CTA Yellow #FFC93C */}
          <div className="bg-[var(--bg-silver)] border-2 border-[#FFC93C] rounded-[10px] p-8 flex flex-col justify-between shadow-sm relative text-[var(--text-on-silver)]">
            <div className="absolute -top-3 right-6 bg-[#FFC93C] text-[#2B2D31] text-[11px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border border-[#2B2D31]/15">
              Recomendado para PYMEs
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-silver)] mb-6">
                <div>
                  <span className="text-xs font-mono text-[var(--text-secondary-on-silver)] font-medium uppercase tracking-wider block mb-1">
                    Alianza Pathrimonio
                  </span>
                  <h3 className="text-xl font-bold text-[var(--text-on-silver)]">Programa de Socios</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-[#2B2D31] text-[#FFC93C] rounded-[4px] font-semibold">
                  ${dailyRateLabel} USD / día
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-[var(--text-on-silver)] font-mono tabular-nums">${unitRolePrice} USD</span>
                  <span className="text-sm text-[var(--text-secondary-on-silver)]">/ mes por rol activo</span>
                </div>
                <p className="text-xs text-[var(--text-on-silver)] font-medium">
                  Costo de implementación:{' '}
                  <span className="font-mono font-bold bg-[#2B2D31] text-[#FFC93C] px-1.5 py-0.5 rounded-[4px]">$0 USD</span>{' '}
                  con permanencia de 6 meses
                </p>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm text-[var(--text-on-silver)]">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#2B2D31] text-[#FFC93C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span><strong>$0 USD en setup:</strong> Tu sistema puesto en marcha sin descapitalizar tu caja.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#2B2D31] text-[#FFC93C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span><strong>Soporte continuo y mejoras:</strong> Mantenimiento, respaldos y ajustes operativos incluidos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#2B2D31] text-[#FFC93C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span><strong>Soberanía total:</strong> Exporta tu base de datos SQLite/PostgreSQL en cualquier momento.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#2B2D31] text-[#FFC93C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span><strong>Retorno a la comunidad:</strong> Tu membresía financia proyectos formativos en Pathway.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-8 border-t border-[var(--border-silver)] flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-secondary-on-silver)] font-mono font-medium">
                Código abierto y datos propios
              </span>
              <a
                href="#cotizador"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-xs font-bold text-[#2B2D31] transition-colors shrink-0 border border-[#2B2D31]/15"
              >
                <span>Activar tarifa socio</span>
                <ArrowRight size={13} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>

        {/* Bloque Compacto: Micro-Simulador de Créditos */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[10px] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent-text)] font-medium mb-1.5">
                <Gift size={14} strokeWidth={1.75} />
                <span>RECIPROCIDAD COMUNITARIA</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Simulador de Créditos por Referidos
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
                Regla institucional:{' '}
                <strong className="text-[var(--text-primary)]">2 negocios referidos = 1 rol × 2 meses</strong> (o 2 roles × 1 mes completamente bonificados).
              </p>
            </div>

            {/* Selector de Referidos */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Negocios aliados:</span>
              <div className="inline-flex items-center bg-[var(--bg-page)] p-1 rounded-[6px] border border-[var(--border-subtle)]">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setReferralsCount(num)}
                    className={`px-3 py-1 text-xs font-mono font-semibold rounded-[4px] transition-all cursor-pointer ${
                      referralsCount === num
                        ? 'bg-[#FFC93C] text-[#2B2D31] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {num} {num === 1 ? 'negocio' : 'negocios'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resultado del Simulador */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-[8px] bg-[#232529] border border-[#D9DADC]/15">
              <span className="text-xs text-[#B8BAC0] block mb-1">Ahorro en mensualidad</span>
              <div className="text-2xl font-bold text-[#D9DADC] font-mono tabular-nums">
                ${creditValue} USD
              </div>
              <span className="text-[11px] text-[#9699A1]">en créditos operativos</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#232529] border border-[#D9DADC]/15">
              <span className="text-xs text-[#B8BAC0] block mb-1">Opción A (Meses libres)</span>
              <div className="text-2xl font-bold text-[#FFC93C] font-mono tabular-nums">
                {monthsBonifiedSingleRole > 0 ? `${monthsBonifiedSingleRole} meses` : 'En acumulación'}
              </div>
              <span className="text-[11px] text-[#B8BAC0]">de 1 rol bonificado al 100%</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#232529] border border-[#D9DADC]/15">
              <span className="text-xs text-[#B8BAC0] block mb-1">Opción B (Roles libres)</span>
              <div className="text-2xl font-bold text-[#FFC93C] font-mono tabular-nums">
                {rolesBonifiedSingleMonth > 0 ? `${rolesBonifiedSingleMonth} roles` : 'En acumulación'}
              </div>
              <span className="text-[11px] text-[#B8BAC0]">por 1 mes completo sin costo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
