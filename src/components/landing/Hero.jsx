import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Laptop, Database } from 'lucide-react';

export default function Hero({ onOpenPortal }) {
  return (
    <section className="relative w-full pt-20 pb-24 md:pt-28 md:pb-32 bg-[#FAFAFA] border-b border-[#E4E4E7] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-[680px] mx-auto text-center flex flex-col items-center">
          {/* Badge Minimalista */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFBEB] border border-amber-200/80 text-[#9A6700] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC000]"></span>
            <span>Programa de Socios Pathrimonio</span>
          </div>

          {/* H1 Contundente */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#09090B] leading-[1.08] tracking-[-0.02em] mb-6">
            Sistemas de gestión y software a medida para la economía real.
          </h1>

          {/* Subtítulo Claro */}
          <p className="text-base sm:text-lg text-[#52525B] leading-relaxed mb-8 max-w-[620px]">
            Construimos herramientas operativas a <strong className="text-[#09090B] font-semibold">$1 USD/día por rol</strong>. 
            Sin licencias prohibitivas ni candados técnicos: garantizamos arquitectura offline-first, acompañamiento humano y soberanía total de datos para tu negocio o comunidad.
          </p>

          {/* Máximo 2 Botones */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-12">
            <a
              href="#cotizador"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] text-[#09090B] text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <span>Cotizar Sistema ($1/día)</span>
              <ArrowRight size={15} strokeWidth={1.5} />
            </a>
            <a
              href="#socios"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#09090B] text-sm font-medium transition-colors cursor-pointer"
            >
              <span>Ver Programa de Socios</span>
            </a>
          </div>

          {/* Garantías de Confianza Institucional */}
          <div className="pt-6 border-t border-[#E4E4E7] w-full flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#52525B]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} strokeWidth={1.5} className="text-[#9A6700]" />
              <span>100% Offline-First (SQLite Local)</span>
            </span>
            <span className="text-[#D4D4D8] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Database size={14} strokeWidth={1.5} className="text-[#9A6700]" />
              <span>Soberanía absoluta de código y base de datos</span>
            </span>
            <span className="text-[#D4D4D8] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Shield size={14} strokeWidth={1.5} className="text-[#9A6700]" />
              <span>$0 costo de setup con permanencia</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
