import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Shield, Database, Sparkles } from 'lucide-react';

export default function Hero({ onOpenPortal, onNavigate, theme = 'dark' }) {
  const isDarkTheme = theme !== 'light';
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, active: false });

  const handlePointerMove = (e) => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: Number((-normY * 14).toFixed(2)),
      rotateY: Number((normX * 16).toFixed(2)),
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, active: false });
  };

  return (
    <section className="relative w-full pt-14 pb-20 md:pt-24 md:pb-28 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          {/* Columna Izquierda: Propuesta de Valor y Acciones */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Badge Minimalista */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C]"></span>
              <span>Programa de Socios Pathrimonio</span>
            </div>

            {/* H1 Contundente */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] xl:text-[56px] font-bold text-[var(--text-primary)] leading-[1.08] tracking-[-0.02em] mb-6">
              Sistemas de gestión y software a medida para la economía real.
            </h1>

            {/* Subtítulo Claro */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[600px]">
              Construimos herramientas operativas a{' '}
              <strong className="text-[var(--text-primary)] font-semibold">$1 USD/día por rol</strong>.{' '}
              Sin licencias prohibitivas ni candados técnicos: garantizamos arquitectura offline-first, acompañamiento humano y soberanía total de datos para tu negocio o comunidad.
            </p>

            {/* Rutas Complementarias: 10% Yellow CTA vs 30% Silver Secondary */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 w-full sm:w-auto mb-10">
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
            <div className="pt-6 border-t border-[var(--border-subtle)] w-full flex flex-wrap items-center justify-center lg:justify-start gap-y-2.5 gap-x-5 text-xs text-[var(--text-secondary)]">
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

          {/* Columna Derecha: Emblema 3D Renderizado con Profundidad */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="relative w-[270px] sm:w-[330px] lg:w-[410px] aspect-square flex items-center justify-center [perspective:1100px] select-none"
            >
              {/* Plano de profundidad arquitectónico sutil */}
              <div
                aria-hidden="true"
                className={`absolute inset-8 rounded-full border transition-transform duration-500 ${
                  isDarkTheme ? 'border-white/10' : 'border-black/10'
                }`}
                style={{
                  background: isDarkTheme
                    ? 'radial-gradient(circle at 55% 42%, rgba(255, 201, 60, 0.14), rgba(255, 255, 255, 0.03) 48%, transparent 72%)'
                    : 'radial-gradient(circle at 55% 42%, rgba(255, 201, 60, 0.22), rgba(255, 255, 255, 0.45) 48%, transparent 72%)',
                  transform: tilt.active
                    ? `translate3d(${tilt.rotateY * -0.5}px, ${tilt.rotateX * 0.5}px, -40px)`
                    : 'translate3d(0, 0, -40px)',
                }}
              />
              <div
                aria-hidden="true"
                className={`absolute inset-16 rounded-full border border-dashed pointer-events-none ${
                  isDarkTheme ? 'border-white/10' : 'border-black/10'
                }`}
              />
              <div
                aria-hidden="true"
                className="absolute top-12 right-10 w-40 h-40 rounded-full bg-[#FFC93C]/20 blur-3xl pointer-events-none"
              />

              {/* Render 3D principal sin fondo según tema */}
              <div
                className="relative w-[88%] h-[88%] flex items-center justify-center transition-transform duration-300 ease-out will-change-transform"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: tilt.active
                    ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.03)`
                    : 'rotateX(4deg) rotateY(-6deg) scale(1)',
                }}
              >
                <img
                  src={
                    isDarkTheme
                      ? '/assets/images/hero-render-dark.png'
                      : '/assets/images/hero-render-light.png'
                  }
                  alt="Emblema tridimensional de Pathrimonio"
                  className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
                    isDarkTheme
                      ? 'drop-shadow-[0_26px_42px_rgba(0,0,0,0.45)]'
                      : 'drop-shadow-[0_22px_34px_rgba(24,25,28,0.20)]'
                  }`}
                />
              </div>

              {/* Sombra de apoyo en superficie */}
              <div
                aria-hidden="true"
                className={`absolute bottom-5 w-3/5 h-5 rounded-full blur-xl pointer-events-none ${
                  isDarkTheme ? 'bg-black/50' : 'bg-black/20'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
