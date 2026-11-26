import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Database, Sparkles } from 'lucide-react';

export default function Hero({ onOpenPortal, onNavigate }) {
  return (
    <section className="relative w-full pt-20 pb-24 md:pt-28 md:pb-32 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-[680px] mx-auto text-center flex flex-col items-center">
          {/* Badge Minimalista */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C]"></span>
            <span>Programa de Socios Pathrimonio</span>
          </div>

          {/* H1 Contundente */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[var(--text-primary)] leading-[1.08] tracking-[-0.02em] mb-6">
            Sistemas de gestión y software a medida para la economía real.
          </h1>

          {/* Subtítulo Claro */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[620px]">
            Construimos herramientas operativas a{' '}
            <strong className="text-[var(--text-primary)] font-semibold">$1 USD/día por rol</strong>.{' '}
            Sin licencias prohibitivas ni candados técnicos: garantizamos arquitectura offline-first, acompañamiento humano y soberanía total de datos para tu negocio o comunidad.
          </p>

          {/* Rutas Complementarias: 10% Yellow CTA vs 30% Silver Secondary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-12">
            <a
              href="#cotizador"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] active:scale-[0.985] text-[#2B2D31] text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span>Cotizar mis roles ahora</span>
              <ArrowRight size={15} strokeWidth={1.75} />
            </a>
            <a
              href="/formalia"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/formalia');
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[var(--bg-silver)] hover:bg-[var(--bg-silver-hover)] border border-[var(--border-silver)] text-[var(--text-on-silver)] text-sm font-semibold transition-colors cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-[#2B2D31] text-[#FFC93C] flex items-center justify-center shrink-0">
                <Sparkles size={11} strokeWidth={2} />
              </span>
              <span>Mapea tu negocio gratis con FORMALIA</span>
            </a>
          </div>

          {/* Garantías de Confianza Institucional */}
          <div className="pt-6 border-t border-[var(--border-subtle)] w-full flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} strokeWidth={1.75} className="text-[var(--accent-text)]" />
              <span>100% Offline-First (SQLite Local)</span>
            </span>
            <span className="text-[var(--border-strong)] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Database size={14} strokeWidth={1.75} className="text-[var(--accent-text)]" />
              <span>Soberanía absoluta de código y base de datos</span>
            </span>
            <span className="text-[var(--border-strong)] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Shield size={14} strokeWidth={1.75} className="text-[var(--accent-text)]" />
              <span>$0 costo de setup con permanencia</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
