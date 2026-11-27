import React from 'react';
import {
  GraduationCap,
  Trophy,
  Scale,
  Route,
  ArrowUpRight,
  Smartphone,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function ImpactPathwayBento({ communityImpact = null }) {
  const eduMetric = communityImpact?.education?.metric || '+120 hrs';
  const eduLabel = communityImpact?.education?.label || 'talleres comunitarios';
  const sportsMetric = communityImpact?.sports?.metric || '8 ligas';
  const sportsLabel = communityImpact?.sports?.label || 'equipos respaldados';
  const valuesMetric = communityImpact?.values?.metric || '0% fees';
  const valuesLabel = communityImpact?.values?.label || 'cero intermediación';
  const pathwayTitle = communityImpact?.pathway?.title || 'Pathway: El mapa vivo de desarrollo comunitario';
  return (
    <section
      id="impacto"
      className="w-full py-20 lg:py-28 bg-[var(--bg-silver)] text-[var(--text-on-silver)] border-b border-[var(--border-silver)] transition-colors"
    >
      <div className="site-container">
        {/* Encabezado (Sobre Silver #D9DADC -> Tinta #2B2D31) */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#2B2D31] text-[#D9DADC] text-xs font-mono mb-3">
            <span className="font-semibold">IMPACTO Y PATHWAY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-on-silver)] tracking-[-0.02em] mb-4">
            Cada línea de código revierte en la comunidad.
          </h2>
          <p className="text-base text-[var(--text-secondary-on-silver)] leading-relaxed">
            Pathrimonio no es solo desarrollo de software: es una plataforma de articulación comunitaria.
            Conectamos herramientas operativas con proyectos formativos, deportivos y de transparencia ciudadana.
          </p>
        </div>

        {/* Bento Grid Asimétrico de 4 Celdas: Tarjetas Gray #2B2D31 sobre Silver #D9DADC */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Celda 1: Educación */}
          <div className="card-on-silver p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[6px] bg-[#363940] border border-[#D9DADC]/15 flex items-center justify-center text-[#D9DADC] mb-5">
                <GraduationCap size={20} strokeWidth={1.6} />
              </div>
              <span className="text-[11px] font-mono font-medium text-[#9699A1] uppercase tracking-wider block mb-1">
                Pilar I · Formación
              </span>
              <h3 className="text-lg font-bold text-[#D9DADC] mb-2 tracking-tight">
                Educación y Alfabetización Técnica
              </h3>
              <p className="text-sm text-[#B8BAC0] leading-relaxed mb-6">
                Talleres prácticos de capacitación para operarios de almacén, cajeros y jóvenes de barrios locales en el uso de herramientas digitales sin barreras.
              </p>
            </div>
            <div className="pt-4 border-t border-[#D9DADC]/15 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#D9DADC]">{eduMetric}</span>
              <span className="text-xs text-[#9699A1]">{eduLabel}</span>
            </div>
          </div>

          {/* Celda 2: Deporte */}
          <div className="card-on-silver p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[6px] bg-[#363940] border border-[#D9DADC]/15 flex items-center justify-center text-[#D9DADC] mb-5">
                <Trophy size={20} strokeWidth={1.6} />
              </div>
              <span className="text-[11px] font-mono font-medium text-[#9699A1] uppercase tracking-wider block mb-1">
                Pilar II · Cohesión
              </span>
              <h3 className="text-lg font-bold text-[#D9DADC] mb-2 tracking-tight">
                Deporte e Integración Vecinal
              </h3>
              <p className="text-sm text-[#B8BAC0] leading-relaxed mb-6">
                Fomento y auspicio solidario a ligas de fútbol, campeonatos escolares y actividades al aire libre organizadas por juntas vecinales aliadas.
              </p>
            </div>
            <div className="pt-4 border-t border-[#D9DADC]/15 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#D9DADC]">{sportsMetric}</span>
              <span className="text-xs text-[#9699A1]">{sportsLabel}</span>
            </div>
          </div>

          {/* Celda 3: Valores & Transparencia */}
          <div className="card-on-silver p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[6px] bg-[#363940] border border-[#FFC93C]/40 flex items-center justify-center text-[#FFC93C] mb-5">
                <Scale size={20} strokeWidth={1.6} />
              </div>
              <span className="text-[11px] font-mono font-medium text-[#9699A1] uppercase tracking-wider block mb-1">
                Pilar III · Ética
              </span>
              <h3 className="text-lg font-bold text-[#D9DADC] mb-2 tracking-tight">
                Valores y Transparencia Radical
              </h3>
              <p className="text-sm text-[#B8BAC0] leading-relaxed mb-6">
                Prohibición estricta de comisiones por transacción sobre las ventas de nuestros socios. Código abierto, trazabilidad y datos bajo tu posesión.
              </p>
            </div>
            <div className="pt-4 border-t border-[#D9DADC]/15 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#FFC93C]">{valuesMetric}</span>
              <span className="text-xs text-[#9699A1]">{valuesLabel}</span>
            </div>
          </div>

          {/* Celda 4: Celda Destacada Pathway (Ocupa 3 columnas en LG) */}
          <div className="md:col-span-2 lg:col-span-3 bg-[#2B2D31] text-[#D9DADC] border-2 border-[#FFC93C] rounded-[10px] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#363940] border border-[#FFC93C]/40 text-[#FFC93C] text-xs font-mono font-medium mb-3">
                <Route size={13} strokeWidth={1.6} />
                <span>BENEFICIO VINCULADO · APP MVP</span>
              </div>
              <h3 className="text-2xl font-bold text-[#D9DADC] mb-2 tracking-tight">
                {pathwayTitle}
              </h3>
              <p className="text-sm text-[#B8BAC0] leading-relaxed mb-4">
                Como socio o usuario del software Pathrimonio, tu proyecto puede vincularse a la aplicación móvil{' '}
                <strong className="text-[#D9DADC]">Pathway</strong>. Permite a cooperativas, comités y redes de tiendas publicar metas colectivas de financiamiento y rendición de cuentas en tiempo real ante su propia comunidad.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#D9DADC]">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} strokeWidth={1.75} className="text-[#FFC93C]" />
                  <span>Tablero de hitos públicos</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} strokeWidth={1.75} className="text-[#FFC93C]" />
                  <span>Seguimiento de aportes verificables</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} strokeWidth={1.75} className="text-[#FFC93C]" />
                  <span>Disponible en Android y Web</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <a
                href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold transition-colors"
              >
                <Smartphone size={14} strokeWidth={1.75} />
                <span>Google Play (Pathway)</span>
                <ExternalLink size={12} strokeWidth={1.75} />
              </a>
              <a
                href="#cotizador"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#D9DADC] hover:bg-[#E6E7E9] text-[#2B2D31] text-xs font-semibold transition-colors"
              >
                <span>Vincular mi proyecto</span>
                <ArrowUpRight size={13} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
