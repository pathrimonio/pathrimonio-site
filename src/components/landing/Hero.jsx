import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Database, Sparkles } from 'lucide-react';

export default function Hero({ onOpenPortal, onNavigate }) {
  return (
    <section className="relative w-full pt-20 pb-24 md:pt-28 md:pb-32 bg-[#FAFAFA] dark:bg-[#09090B] border-b border-[#E4E4E7] dark:border-[#27272A] transition-colors overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-[680px] mx-auto text-center flex flex-col items-center">
          {/* Badge Minimalista */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 text-[#9A6700] dark:text-[#FFC000] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC000]"></span>
            <span>Programa de Socios Pathrimonio</span>
          </div>

          {/* H1 Contundente */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#09090B] dark:text-[#F4F4F5] leading-[1.08] tracking-[-0.02em] mb-6">
            Sistemas de gestión y software a medida para la economía real.
          </h1>

          {/* Subtítulo Claro */}
          <p className="text-base sm:text-lg text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-[620px]">
            Construimos herramientas operativas a <strong className="text-[#09090B] dark:text-[#F4F4F5] font-semibold">$1 USD/día por rol</strong>. 
            Sin licencias prohibitivas ni candados técnicos: garantizamos arquitectura offline-first, acompañamiento humano y soberanía total de datos para tu negocio o comunidad.
          </p>

          {/* Rutas Complementarias: Directa vs FormalIA (SDD 2.1) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-12">
            <a
              href="#cotizador"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] text-[#09090B] text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <span>Cotizar mis roles ahora</span>
              <ArrowRight size={15} strokeWidth={1.5} />
            </a>
            <a
              href="/formalia"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/formalia');
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111113] hover:bg-[#FFFBEB] dark:hover:bg-amber-500/10 border border-[#E4E4E7] dark:border-[#27272A] hover:border-[#FFC000] text-[#09090B] dark:text-[#F4F4F5] text-sm font-medium transition-colors cursor-pointer"
            >
              <Sparkles size={15} strokeWidth={1.75} className="text-[#9A6700] dark:text-[#FFC000]" />
              <span>Mapea tu negocio gratis con FORMALIA</span>
            </a>
          </div>

          {/* Garantías de Confianza Institucional */}
          <div className="pt-6 border-t border-[#E4E4E7] dark:border-[#27272A] w-full flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#52525B] dark:text-[#A1A1AA]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} strokeWidth={1.5} className="text-[#9A6700] dark:text-[#FFC000]" />
              <span>100% Offline-First (SQLite Local)</span>
            </span>
            <span className="text-[#D4D4D8] dark:text-[#3F3F46] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Database size={14} strokeWidth={1.5} className="text-[#9A6700] dark:text-[#FFC000]" />
              <span>Soberanía absoluta de código y base de datos</span>
            </span>
            <span className="text-[#D4D4D8] dark:text-[#3F3F46] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Shield size={14} strokeWidth={1.5} className="text-[#9A6700] dark:text-[#FFC000]" />
              <span>$0 costo de setup con permanencia</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
