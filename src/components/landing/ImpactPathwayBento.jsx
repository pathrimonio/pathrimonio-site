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

export default function ImpactPathwayBento() {
  return (
    <section id="impacto" className="w-full py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E4E4E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#F4F4F5] text-[#52525B] text-xs font-mono mb-3">
            <span>SECCIÓN 04</span>
            <span>/</span>
            <span className="text-[#09090B] font-semibold">IMPACTO Y PATHWAY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#09090B] tracking-[-0.02em] mb-4">
            Cada línea de código revierte en la comunidad.
          </h2>
          <p className="text-base text-[#52525B] leading-relaxed">
            Pathrimonio no es solo desarrollo de software: es una plataforma de articulación comunitaria. 
            Conectamos herramientas operativas con proyectos formativos, deportivos y de transparencia ciudadana.
          </p>
        </div>

        {/* Bento Grid Asimétrico de 4 Celdas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Celda 1: Educación */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[6px] bg-[#F4F4F5] flex items-center justify-center text-[#09090B] mb-5">
                <GraduationCap size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-mono font-medium text-[#52525B] uppercase tracking-wider block mb-1">
                Pilar I · Formación
              </span>
              <h3 className="text-lg font-bold text-[#09090B] mb-2 tracking-tight">
                Educación y Alfabetización Técnica
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed mb-6">
                Talleres prácticos de capacitación para operarios de almacén, cajeros y jóvenes de barrios locales en el uso de herramientas digitales sin barreras.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E4E4E7] flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#09090B]">+120 hrs</span>
              <span className="text-xs text-[#52525B]">talleres comunitarios</span>
            </div>
          </div>

          {/* Celda 2: Deporte */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[6px] bg-[#F4F4F5] flex items-center justify-center text-[#09090B] mb-5">
                <Trophy size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-mono font-medium text-[#52525B] uppercase tracking-wider block mb-1">
                Pilar II · Cohesión
              </span>
              <h3 className="text-lg font-bold text-[#09090B] mb-2 tracking-tight">
                Deporte e Integración Vecinal
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed mb-6">
                Fomento y auspicio solidario a ligas de fútbol, campeonatos escolares y actividades al aire libre organizadas por juntas vecinales aliadas.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E4E4E7] flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#09090B]">8 ligas</span>
              <span className="text-xs text-[#52525B]">equipos respaldados</span>
            </div>
          </div>

          {/* Celda 3: Valores & Transparencia */}
          <div className="card-minimal p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[6px] bg-[#F4F4F5] flex items-center justify-center text-[#09090B] mb-5">
                <Scale size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-mono font-medium text-[#52525B] uppercase tracking-wider block mb-1">
                Pilar III · Ética
              </span>
              <h3 className="text-lg font-bold text-[#09090B] mb-2 tracking-tight">
                Valores y Transparencia Radical
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed mb-6">
                Prohibición estricta de comisiones por transacción sobre las ventas de nuestros socios. Código abierto, trazabilidad y datos bajo tu posesión.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E4E4E7] flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#9A6700]">0% fees</span>
              <span className="text-xs text-[#52525B]">cero intermediación</span>
            </div>
          </div>

          {/* Celda 4: Celda Destacada Pathway (Ocupa 3 columnas en LG) */}
          <div className="md:col-span-2 lg:col-span-3 bg-[#FFFBEB] border border-amber-200 rounded-[10px] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-white border border-amber-200/80 text-[#9A6700] text-xs font-mono font-medium mb-3">
                <Route size={13} strokeWidth={1.5} />
                <span>BENEFICIO VINCULADO · APP MVP</span>
              </div>
              <h3 className="text-2xl font-bold text-[#09090B] mb-2 tracking-tight">
                Pathway: El mapa vivo de desarrollo comunitario
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed mb-4">
                Como socio o usuario del software Pathrimonio, tu proyecto puede vincularse a la aplicación móvil <strong>Pathway</strong>. Permite a cooperativas, comités y redes de tiendas publicar metas colectivas de financiamiento y rendición de cuentas en tiempo real ante su propia comunidad.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#09090B]">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} strokeWidth={1.5} className="text-[#9A6700]" />
                  <span>Tablero de hitos públicos</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} strokeWidth={1.5} className="text-[#9A6700]" />
                  <span>Seguimiento de aportes verificables</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} strokeWidth={1.5} className="text-[#9A6700]" />
                  <span>Disponible en Android y Web</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <a
                href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] text-[#09090B] text-xs font-semibold transition-colors"
              >
                <Smartphone size={14} strokeWidth={1.5} />
                <span>Google Play (Pathway)</span>
                <ExternalLink size={12} strokeWidth={1.5} />
              </a>
              <a
                href="#cotizador"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-white hover:bg-[#F4F4F5] border border-amber-200 text-[#09090B] text-xs font-medium transition-colors"
              >
                <span>Vincular mi proyecto</span>
                <ArrowUpRight size={13} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
