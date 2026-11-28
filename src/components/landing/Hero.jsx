import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Layers, Sparkles } from 'lucide-react';

export default function Hero({ onOpenPortal, onNavigate, theme = 'dark' }) {
  const isDarkTheme = theme !== 'light';
  const [tilt, setTilt] = useState({ rotateX: 4, rotateY: -6, spotX: 60, spotY: 36, active: false });

  const handlePointerMove = (e) => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: Number((-normY * 14 + 2).toFixed(2)),
      rotateY: Number((normX * 16 - 3).toFixed(2)),
      spotX: Math.round(((e.clientX - rect.left) / rect.width) * 100),
      spotY: Math.round(((e.clientY - rect.top) / rect.height) * 100),
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 4, rotateY: -6, spotX: 60, spotY: 36, active: false });
  };

  return (
    <section className="relative w-full min-h-[calc(100svh-4rem)] flex items-center py-12 sm:py-16 lg:py-20 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors overflow-hidden">
      {/* Iluminación direccional acorde al tema */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDarkTheme
            ? 'radial-gradient(65% 75% at 78% 45%, rgba(255, 192, 0, 0.06), transparent 68%)'
            : 'radial-gradient(65% 75% at 78% 45%, rgba(255, 192, 0, 0.14), transparent 68%)',
        }}
      />

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
          {/* Bloque 1 — Columna Izquierda: Qué vendes, por qué cuesta $1/día y doble puerta de entrada */}
          <div className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Gancho visible de Programa de Socios */}
            <div
              className="hero-enter inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-medium mb-6"
              style={{ '--stagger-idx': 0 }}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
              <span>Programa de Socios · Desde <strong className="font-semibold">$1 USD/día por rol</strong></span>
            </div>

            {/* Titular directo: qué haces y para quién */}
            <h1
              className="hero-enter text-4xl sm:text-5xl xl:text-[58px] 2xl:text-[64px] font-bold text-[var(--text-primary)] leading-[1.06] tracking-[-0.028em] mb-6 max-w-[18ch]"
              style={{ '--stagger-idx': 1 }}
            >
              Software a medida para ordenar tu PYME, estructurado por roles.
            </h1>

            {/* Propuesta clara sin tecnicismos */}
            <p
              className="hero-enter text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[56ch]"
              style={{ '--stagger-idx': 2 }}
            >
              Cada colaborador trabaja únicamente en la pantalla que necesita —sin compartir contraseñas ni perder registros— por{' '}
              <strong className="text-[var(--text-primary)] font-semibold">$1 USD/día por rol</strong> y{' '}
              <strong className="text-[var(--text-primary)] font-semibold">$0 de implementación</strong> con el Programa de Socios.
            </p>

            {/* Dos botones máximo: Cotizar o FormalIA */}
            <div
              className="hero-enter flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3.5 w-full sm:w-auto mb-10"
              style={{ '--stagger-idx': 3 }}
            >
              <a
                href="#cotizador"
                className="btn-accent group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm shadow-sm cursor-pointer"
              >
                <span>Cotizar mi sistema</span>
                <ArrowRight
                  size={15}
                  strokeWidth={1.85}
                  className="transition-transform duration-150 group-hover:translate-x-[3px]"
                />
              </a>
              <a
                href="/formalia"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate('/formalia');
                  }
                }}
                className="btn-secondary-ghost group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 !bg-[var(--bg-silver)] hover:!bg-[var(--bg-silver-hover)] !border-[var(--border-silver)] !text-[var(--text-on-silver)] text-sm font-semibold cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-[var(--hsl-dark-card)] text-[var(--accent-primary)] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
                  <Sparkles size={11} strokeWidth={2} />
                </span>
                <span>Mapear mi negocio gratis con Formalia</span>
              </a>
            </div>

            {/* 3 garantías limpias de riesgo cero */}
            <div
              className="hero-enter pt-6 border-t border-[var(--border-subtle)] w-full flex flex-wrap items-center justify-center lg:justify-start gap-y-2.5 gap-x-5 text-xs text-[var(--text-secondary)]"
              style={{ '--stagger-idx': 4 }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Layers size={14} strokeWidth={1.75} className="text-[var(--accent-text)] shrink-0" />
                <span>Pantallas y permisos por rol</span>
              </span>
              <span className="text-[var(--border-strong)] hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} strokeWidth={1.75} className="text-[var(--accent-text)] shrink-0" />
                <span>$0 implementación con permanencia</span>
              </span>
              <span className="text-[var(--border-strong)] hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} strokeWidth={1.75} className="text-[var(--accent-text)] shrink-0" />
                <span>Eres dueño total de tus registros</span>
              </span>
            </div>
          </div>

          {/* Columna Derecha: Escenario Arquitectónico 3D Protagonista */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="hero-3d-enter relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[520px] xl:max-w-[590px] 2xl:max-w-[640px] aspect-square flex items-center justify-center select-none"
              style={{ perspective: '1200px' }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[6%] rounded-[36px] transition-transform duration-500 ease-out"
                style={{
                  transform: `rotateX(${58 + tilt.rotateX * 0.35}deg) rotateZ(${-18 + tilt.rotateY * 0.25}deg) translateZ(-65px)`,
                  backgroundImage: isDarkTheme
                    ? 'linear-gradient(to right, rgba(217,218,220,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(217,218,220,0.09) 1px, transparent 1px)'
                    : 'linear-gradient(to right, rgba(43,45,49,0.11) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,45,49,0.11) 1px, transparent 1px)',
                  backgroundSize: '34px 34px',
                  WebkitMaskImage: 'radial-gradient(closest-side, rgba(0,0,0,0.95) 36%, transparent 94%)',
                  maskImage: 'radial-gradient(closest-side, rgba(0,0,0,0.95) 36%, transparent 94%)',
                }}
              />

              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-[9%] rounded-full border transition-transform duration-300 ease-out ${
                  isDarkTheme ? 'border-white/10' : 'border-black/10'
                }`}
                style={{
                  background: isDarkTheme
                    ? `radial-gradient(circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(255, 192, 0, 0.16), rgba(255, 255, 255, 0.02) 48%, transparent 74%)`
                    : `radial-gradient(circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(255, 192, 0, 0.24), rgba(255, 255, 255, 0.45) 48%, transparent 74%)`,
                  transform: `rotateX(${tilt.rotateX * 0.45}deg) rotateY(${tilt.rotateY * 0.45}deg) translateZ(-36px)`,
                }}
              />
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-[17%] rounded-full border border-dashed transition-transform duration-300 ease-out ${
                  isDarkTheme ? 'border-white/12' : 'border-black/12'
                }`}
                style={{
                  transform: `rotateX(${tilt.rotateX * 0.6}deg) rotateY(${tilt.rotateY * 0.6}deg) translateZ(-18px)`,
                }}
              />

              <div
                aria-hidden="true"
                className={`pointer-events-none absolute top-[11%] left-1/2 -translate-x-1/2 w-px h-3 ${
                  isDarkTheme ? 'bg-[var(--accent-primary)]/50' : 'bg-[var(--text-primary)]/35'
                }`}
              />
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-[11%] left-1/2 -translate-x-1/2 w-px h-3 ${
                  isDarkTheme ? 'bg-[var(--accent-primary)]/40' : 'bg-[var(--text-primary)]/30'
                }`}
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[14%] right-[14%] w-52 h-52 rounded-full bg-[var(--accent-primary)]/20 blur-3xl transition-transform duration-300"
                style={{
                  transform: `translate3d(${tilt.rotateY * 0.6}px, ${tilt.rotateX * -0.6}px, 0)`,
                }}
              />

              <div
                className={`relative w-[92%] h-[92%] flex items-center justify-center will-change-transform ${
                  tilt.active
                    ? 'transition-transform duration-150 ease-out'
                    : 'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.active ? 1.03 : 1})`,
                }}
              >
                <div className="hero-3d-float w-full h-full flex items-center justify-center">
                  <img
                    src={
                      isDarkTheme
                        ? '/assets/images/hero-render-dark.png'
                        : '/assets/images/hero-render-light.png'
                    }
                    alt="Emblema tridimensional de Pathrimonio"
                    className={`w-full h-full object-contain pointer-events-none transition-opacity duration-200 ${
                      isDarkTheme
                        ? 'drop-shadow-[0_32px_52px_rgba(0,0,0,0.52)]'
                        : 'drop-shadow-[0_28px_42px_rgba(24,25,28,0.22)]'
                    }`}
                  />
                </div>
              </div>

              <div
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-[6%] w-[64%] h-6 rounded-full blur-2xl transition-transform duration-300 ${
                  isDarkTheme ? 'bg-black/55' : 'bg-black/20'
                }`}
                style={{
                  transform: `translate3d(${tilt.rotateY * -0.5}px, 0, 0)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
