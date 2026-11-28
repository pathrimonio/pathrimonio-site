import React, { useState } from 'react';
import {
  Check,
  X,
  Gift,
  ArrowRight,
  GraduationCap,
  Trophy,
  Route,
  ExternalLink
} from 'lucide-react';

export default function PartnershipSection({ pricingConfig = null, communityImpact = null }) {
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

  const eduMetric = communityImpact?.education?.metric || '+120 hrs';
  const eduLabel = communityImpact?.education?.label || 'talleres en vivo';
  const sportsMetric = communityImpact?.sports?.metric || '8 ligas';
  const sportsLabel = communityImpact?.sports?.label || 'iniciativas vecinales';

  return (
    <section
      id="socios"
      className="w-full py-20 lg:py-28 bg-[var(--bg-silver)] text-[var(--text-on-silver)] border-b border-[var(--border-silver)] transition-colors"
    >
      <div className="site-container">
        {/* Encabezado */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--hsl-dark-card)] border border-[var(--hsl-dark-border)] text-[var(--accent-primary)] text-xs font-mono mb-3">
            <span className="font-semibold">PROGRAMA DE SOCIOS & PROPÓSITO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--text-on-silver)] tracking-[-0.025em] leading-[1.1] mb-4">
            Una alianza justa para PYMEs, con retorno directo en tu comunidad.
          </h2>
          <p className="text-base text-[var(--text-secondary-on-silver)] leading-relaxed max-w-[62ch]">
            Nuestro modelo de{' '}
            <strong className="font-semibold text-[var(--text-on-silver)]">${dailyRateLabel} USD/día por rol</strong>{' '}
            elimina las barreras financieras de entrada a cambio de permanencia y crecimiento compartido entre negocios reales.
          </p>
        </div>

        {/* 1. Comparativa limpia: Tarifa Estándar vs Tarifa Socio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-stretch mb-8">
          {/* Columna Tarifa Estándar (HSL oscuro 10-12%) */}
          <div className="bg-[var(--hsl-dark-card)] border border-[var(--hsl-dark-border)] rounded-[12px] p-7 sm:p-8 flex flex-col justify-between text-[var(--hsl-dark-text)]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--hsl-dark-border)] mb-6">
                <div>
                  <span className="text-xs font-mono text-[var(--hsl-dark-text-muted)] uppercase tracking-wider block mb-1">
                    Modelo Tradicional
                  </span>
                  <h3 className="text-xl font-bold text-[var(--hsl-dark-text)]">Tarifa Estándar</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-[var(--hsl-dark-subtle)] text-[var(--hsl-dark-text-secondary)] border border-[var(--hsl-dark-border)] rounded-[4px]">
                  Mercado Habitual
                </span>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-[var(--hsl-dark-text)] font-mono tabular-nums mb-1">
                  $2,500 – $5,000+
                </div>
                <p className="text-xs text-[var(--hsl-dark-text-secondary)]">
                  Inversión inicial elevada antes de poder usar tu sistema
                </p>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm text-[var(--hsl-dark-text-secondary)]">
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.6} className="text-[var(--hsl-dark-text-muted)] shrink-0 mt-0.5" />
                  <span>Descapitalizas tu caja al inicio sin saber si el equipo lo adoptará.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.6} className="text-[var(--hsl-dark-text-muted)] shrink-0 mt-0.5" />
                  <span>Cobros por hora cada vez que cambia una pantalla o tarifa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.6} className="text-[var(--hsl-dark-text-muted)] shrink-0 mt-0.5" />
                  <span>Trabas contractuales y dependencia cuando quieres exportar tus datos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.6} className="text-[var(--hsl-dark-text-muted)] shrink-0 mt-0.5" />
                  <span>Cero retorno comunitario ni acompañamiento en tu territorio.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-8 border-t border-[var(--hsl-dark-border)] text-xs text-[var(--hsl-dark-text-muted)] font-mono">
              Barrera financiera para negocios en crecimiento
            </div>
          </div>

          {/* Columna Tarifa Socio ($1/día — HSL card elevado 12% + borde dorado) */}
          <div className="bg-[var(--hsl-dark-card)] border-2 border-[var(--accent-primary)] rounded-[12px] p-7 sm:p-8 flex flex-col justify-between shadow-lg relative text-[var(--hsl-dark-text)]">
            <div className="absolute -top-3 right-6 bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] text-[11px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Tarifa Socio · Beneficio Activo
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--hsl-dark-border)] mb-6">
                <div>
                  <span className="text-xs font-mono text-[var(--accent-primary)] font-medium uppercase tracking-wider block mb-1">
                    Alianza Pathrimonio
                  </span>
                  <h3 className="text-xl font-bold text-[var(--hsl-dark-text)]">Tarifa Socio</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] rounded-[4px] font-bold">
                  ${dailyRateLabel} USD / día
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-3xl font-bold text-[var(--hsl-dark-text)] font-mono tabular-nums">${unitRolePrice} USD</span>
                  <span className="text-sm text-[var(--hsl-dark-text-secondary)]">/ mes por rol activo</span>
                </div>
                <p className="text-xs text-[var(--hsl-dark-text)] font-medium">
                  Implementación inicial:{' '}
                  <span className="font-mono font-bold bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] px-2 py-0.5 rounded-[4px]">
                    $0 USD
                  </span>{' '}
                  con permanencia de 6 meses
                </p>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm text-[var(--hsl-dark-text)]">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span>
                    <strong>$0 en implementación:</strong> diseñamos y ponemos tu sistema en marcha sin descapitalizarte.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span>
                    <strong>Ajustes y acompañamiento incluidos:</strong> mejoras operativas y soporte humano continuo.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span>
                    <strong>Propiedad total de tus datos:</strong> exporta tus registros libremente en cualquier momento.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span>
                    <strong>Propósito comunitario real:</strong> tu membresía financia talleres y deporte local.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-8 border-t border-[var(--hsl-dark-border)] flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--hsl-dark-text-secondary)] font-mono">
                Sin comisiones por venta
              </span>
              <a
                href="#cotizador"
                className="btn-accent group inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold shrink-0 cursor-pointer"
              >
                <span>Cotizar mi sistema</span>
                <ArrowRight size={13} strokeWidth={2} className="transition-transform duration-150 group-hover:translate-x-[3px]" />
              </a>
            </div>
          </div>
        </div>

        {/* 2. Bucle de crecimiento en una línea clara */}
        <div className="bg-[var(--hsl-dark-card)] text-[var(--hsl-dark-text)] border border-[var(--hsl-dark-border)] rounded-[12px] p-5 sm:p-6 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--hsl-dark-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
              <Gift size={18} strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-primary)] block mb-0.5">
                Bucle de crecimiento compartido
              </span>
              <p className="text-sm sm:text-base font-semibold text-[var(--hsl-dark-text)]">
                Por cada negocio que refieras, ganas créditos para sumar roles o meses gratis.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="inline-flex items-center bg-[var(--hsl-dark-page)] p-1 rounded-[8px] border border-[var(--hsl-dark-border)]">
              {[1, 2, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setReferralsCount(num)}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-[6px] transition-all cursor-pointer ${
                    referralsCount === num
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)]'
                      : 'text-[var(--hsl-dark-text-secondary)] hover:text-[var(--hsl-dark-text)]'
                  }`}
                >
                  {num} {num === 1 ? 'ref.' : 'refs.'}
                </button>
              ))}
            </div>

            <div className="px-3.5 py-2 rounded-[8px] bg-[var(--hsl-dark-subtle)] border border-[var(--accent-border)] flex items-baseline gap-2.5">
              <span className="text-lg font-bold font-mono tabular-nums text-[var(--accent-primary)]">
                ${creditValue} USD
              </span>
              <span className="text-xs text-[var(--hsl-dark-text-secondary)] font-mono tabular-nums">
                {monthsBonifiedSingleRole > 0
                  ? `(${monthsBonifiedSingleRole} meses o ${monthsBonifiedSingleRole} roles)`
                  : '(en acumulación)'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Impacto real y ecosistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card-on-silver p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-[6px] bg-[var(--hsl-dark-subtle)] border border-[var(--hsl-dark-border)] flex items-center justify-center text-[var(--accent-primary)]">
                  <GraduationCap size={18} strokeWidth={1.7} />
                </div>
                <span className="text-xs font-mono font-bold text-[var(--accent-primary)] tabular-nums">
                  {eduMetric} · {eduLabel}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--hsl-dark-text)] mb-1.5">
                Talleres en vivo de educación y valores
              </h3>
              <p className="text-xs text-[var(--hsl-dark-text-secondary)] leading-relaxed">
                Cada suscripción financia capacitaciones presenciales y en vivo para equipos operativos, jóvenes y emprendedores locales.
              </p>
            </div>
          </div>

          <div className="card-on-silver p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-[6px] bg-[var(--hsl-dark-subtle)] border border-[var(--hsl-dark-border)] flex items-center justify-center text-[var(--accent-primary)]">
                  <Trophy size={18} strokeWidth={1.7} />
                </div>
                <span className="text-xs font-mono font-bold text-[var(--accent-primary)] tabular-nums">
                  {sportsMetric} · {sportsLabel}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--hsl-dark-text)] mb-1.5">
                Iniciativas deportivas comunitarias
              </h3>
              <p className="text-xs text-[var(--hsl-dark-text-secondary)] leading-relaxed">
                Respaldamos campeonatos escolares, ligas de barrio y actividades deportivas impulsadas por organizaciones vecinales.
              </p>
            </div>
          </div>

          <div className="card-on-silver p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-[6px] bg-[var(--hsl-dark-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-primary)]">
                  <Route size={18} strokeWidth={1.7} />
                </div>
                <a
                  href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[var(--accent-primary)] hover:underline"
                >
                  <span>App Pathway</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <h3 className="text-base font-bold text-[var(--hsl-dark-text)] mb-1.5">
                Beneficios exclusivos en Pathway
              </h3>
              <p className="text-xs text-[var(--hsl-dark-text-secondary)] leading-relaxed">
                Vincula tu cooperativa, tienda o proyecto a nuestra app comunitaria para compartir hitos públicos y metas transparentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
