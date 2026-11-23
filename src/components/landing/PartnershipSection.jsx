import React, { useState } from 'react';
import { Check, X, Users, Gift, Sparkles, ArrowRight } from 'lucide-react';

export default function PartnershipSection() {
  const [referralsCount, setReferralsCount] = useState(2);

  // Regla del micro-simulador: 2 referidos = 1 rol × 2 meses o 2 roles × 1 mes
  // Para N referidos:
  // Crédito equivalente: (N / 2) * 60 USD (cada 2 referidos bonifican $60 USD = 2 meses de 1 rol o 1 mes de 2 roles)
  const creditValue = Math.floor(referralsCount / 2) * 60 + (referralsCount % 2 === 1 ? 15 : 0);
  const monthsBonifiedSingleRole = Math.floor(referralsCount / 2) * 2;
  const rolesBonifiedSingleMonth = Math.floor(referralsCount / 2) * 2;

  return (
    <section id="socios" className="w-full py-20 lg:py-28 bg-[#FAFAFA] border-b border-[#E4E4E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#F4F4F5] text-[#52525B] text-xs font-mono mb-3">
            <span>SECCIÓN 03</span>
            <span>/</span>
            <span className="text-[#09090B] font-semibold">PROGRAMA DE SOCIOS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#09090B] tracking-[-0.02em] mb-4">
            Modelo cooperativo frente al desarrollo de software tradicional.
          </h2>
          <p className="text-base text-[#52525B] leading-relaxed">
            Eliminamos las barreras financieras que dejan fuera a los negocios locales y colectivos. 
            Compara el modelo tradicional con nuestro compromiso de permanencia e impacto mutuo.
          </p>
        </div>

        {/* Comparativa 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-14">
          {/* Columna Estándar Tradicional */}
          <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[10px] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7] mb-6">
                <div>
                  <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider block mb-1">Modelo Comercial</span>
                  <h3 className="text-xl font-bold text-[#09090B]">Desarrollo Tradicional</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-[#F4F4F5] text-[#52525B] rounded-[4px]">
                  Mercado ERP
                </span>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-[#09090B] font-mono tabular-nums mb-1">
                  $2,500 – $5,000+
                </div>
                <p className="text-xs text-[#52525B]">Costo inicial de setup + tarifas de mantenimiento por hora</p>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm text-[#52525B]">
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.5} className="text-[#A1A1AA] shrink-0 mt-0.5" />
                  <span>Cobro elevado de implementación inicial sin garantía de adopción.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.5} className="text-[#A1A1AA] shrink-0 mt-0.5" />
                  <span>Costo por hora técnica ante cualquier ajuste o requerimiento nuevo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.5} className="text-[#A1A1AA] shrink-0 mt-0.5" />
                  <span>Dependencia de nube propietaria y trabas para exportar tu base de datos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={16} strokeWidth={1.5} className="text-[#A1A1AA] shrink-0 mt-0.5" />
                  <span>Cero reinversión comunitaria ni soporte presencial en el territorio.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-8 border-t border-[#E4E4E7] text-xs text-[#A1A1AA] font-mono">
              Enfoque extractivo de licencias
            </div>
          </div>

          {/* Columna Socio ($1/día) Destacada */}
          <div className="bg-[#F0FDFA] border-2 border-[#0F766E] rounded-[10px] p-8 flex flex-col justify-between shadow-sm relative">
            <div className="absolute -top-3 right-6 bg-[#0F766E] text-white text-[11px] font-mono font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider">
              Recomendado para PYMEs
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-teal-200/60 mb-6">
                <div>
                  <span className="text-xs font-mono text-[#0F766E] font-medium uppercase tracking-wider block mb-1">Alianza Pathrimonio</span>
                  <h3 className="text-xl font-bold text-[#09090B]">Programa de Socios</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-white text-[#0F766E] border border-teal-200 rounded-[4px] font-medium">
                  $1 USD / día
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-[#09090B] font-mono tabular-nums">$30 USD</span>
                  <span className="text-sm text-[#52525B]">/ mes por rol activo</span>
                </div>
                <p className="text-xs text-[#0F766E] font-medium">
                  Costo de implementación: <span className="underline font-bold">$0 USD</span> con permanencia de 6 meses
                </p>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm text-[#09090B]">
                <li className="flex items-start gap-3">
                  <Check size={16} strokeWidth={2} className="text-[#0F766E] shrink-0 mt-0.5" />
                  <span><strong>$0 USD en setup:</strong> Tu sistema puesto en marcha sin descapitalizar tu caja.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={16} strokeWidth={2} className="text-[#0F766E] shrink-0 mt-0.5" />
                  <span><strong>Soporte continuo y mejoras:</strong> Mantenimiento, respaldos y ajustes operativos incluidos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={16} strokeWidth={2} className="text-[#0F766E] shrink-0 mt-0.5" />
                  <span><strong>Soberanía total:</strong> Exporta tu base de datos SQLite/PostgreSQL en cualquier momento.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={16} strokeWidth={2} className="text-[#0F766E] shrink-0 mt-0.5" />
                  <span><strong>Retorno a la comunidad:</strong> Tu membresía financia proyectos formativos en Pathway.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-8 border-t border-teal-200/60 flex items-center justify-between">
              <span className="text-xs text-[#0F766E] font-mono font-medium">Código abierto y datos propios</span>
              <a
                href="#cotizador"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-[#115E59]"
              >
                <span>Activar tarifa socio</span>
                <ArrowRight size={13} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Bloque Compacto: Micro-Simulador de Créditos */}
        <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[10px] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E4E4E7]">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#0F766E] font-medium mb-1.5">
                <Gift size={14} strokeWidth={1.5} />
                <span>RECIPROCIDAD COMUNITARIA</span>
              </div>
              <h3 className="text-xl font-bold text-[#09090B] tracking-tight">
                Simulador de Créditos por Referidos
              </h3>
              <p className="text-sm text-[#52525B] mt-1 max-w-xl">
                Regla institucional: <strong className="text-[#09090B]">2 negocios referidos = 1 rol × 2 meses</strong> (o 2 roles × 1 mes completamente bonificados).
              </p>
            </div>

            {/* Selector de Referidos */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-[#52525B] font-medium">Negocios aliados:</span>
              <div className="inline-flex items-center bg-[#F4F4F5] p-1 rounded-[6px] border border-[#E4E4E7]">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setReferralsCount(num)}
                    className={`px-3 py-1 text-xs font-mono font-semibold rounded-[4px] transition-all cursor-pointer ${
                      referralsCount === num
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'text-[#52525B] hover:text-[#09090B]'
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
            <div className="p-4 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
              <span className="text-xs text-[#52525B] block mb-1">Ahorro en mensualidad</span>
              <div className="text-2xl font-bold text-[#09090B] font-mono tabular-nums">
                ${creditValue} USD
              </div>
              <span className="text-[11px] text-[#A1A1AA]">en créditos operativos</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
              <span className="text-xs text-[#52525B] block mb-1">Opción A (Meses libres)</span>
              <div className="text-2xl font-bold text-[#0F766E] font-mono tabular-nums">
                {monthsBonifiedSingleRole > 0 ? `${monthsBonifiedSingleRole} meses` : 'En acumulación'}
              </div>
              <span className="text-[11px] text-[#52525B]">de 1 rol bonificado al 100%</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#FAFAFA] border border-[#E4E4E7]">
              <span className="text-xs text-[#52525B] block mb-1">Opción B (Roles libres)</span>
              <div className="text-2xl font-bold text-[#0F766E] font-mono tabular-nums">
                {rolesBonifiedSingleMonth > 0 ? `${rolesBonifiedSingleMonth} roles` : 'En acumulación'}
              </div>
              <span className="text-[11px] text-[#52525B]">por 1 mes completo sin costo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
