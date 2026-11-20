import React from 'react';

export default function Hero({ onNavigatePortal, onOpenContact }) {
  return (
    <section className="relative w-full overflow-hidden bg-surface-container-lowest pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Ambient Luminous Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -top-12 right-12 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Narrative & Primary CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-high border border-outline-variant rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-space text-xs uppercase tracking-widest text-primary font-semibold">
                Ingeniería de Software con Propósito Social
              </span>
            </div>

            {/* Master Headline */}
            <h1 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] text-balance">
              Desarrollo sistemático de software para acelerar el{' '}
              <span className="text-primary underline decoration-primary/40 underline-offset-8">
                progreso humano y social
              </span>.
            </h1>

            {/* Description Body */}
            <p className="font-jakarta text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Diseñamos y desplegamos infraestructura digital crítica, plataformas de alta disponibilidad y soluciones de analítica de datos para organizaciones civiles, cooperativas y gobiernos que generan bienestar tangible en comunidades vulnerables.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={onNavigatePortal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-primary text-on-primary font-space text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:shadow-[0_0_36px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">view_kanban</span>
                <span>Portal de Historias de Usuario</span>
                <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">v2.4</span>
              </button>

              <a 
                href="#soluciones"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs sm:text-sm font-semibold tracking-wide hover:bg-surface-container-highest transition-all duration-200"
              >
                <span>Explorar Soluciones e Impacto</span>
                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              </a>
            </div>

            {/* Live Engineering Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-outline-variant/60">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                <span className="font-space text-xs uppercase tracking-wider font-medium">ISO 27001 &amp; SOC 2 Ready</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">public</span>
                <span className="font-space text-xs uppercase tracking-wider font-medium">Estándar Open Source Social</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">offline_bolt</span>
                <span className="font-space text-xs uppercase tracking-wider font-medium">Offline-First Resilient</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Tech & Telemetry Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-surface-container-low border border-outline-variant p-6 rounded-xl shadow-2xl flex flex-col gap-4">
              
              {/* Top Card Header: Live Telemetry Indicator */}
              <div className="flex items-center justify-between pb-3 bg-surface-container/60 -mx-6 -mt-6 px-6 pt-4 rounded-t-xl border-b border-outline-variant/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                  <span className="font-space text-xs uppercase tracking-wider text-white font-bold">
                    Consola Central de Operaciones
                  </span>
                </div>
                <span className="font-space text-xs text-primary uppercase font-mono font-bold">
                  LATAM-V5.3
                </span>
              </div>

              {/* Central Graphic Component with Arrow Emblem */}
              <div className="relative flex flex-col items-center justify-center p-6 bg-surface-container rounded-lg overflow-hidden group border border-outline-variant/60">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent z-10 pointer-events-none"></div>
                
                <div className="relative z-20 flex flex-col items-center gap-3 py-2 text-center">
                  <div className="w-24 h-24 relative flex items-center justify-center">
                    <img 
                      alt="Símbolo de Crecimiento Sistemático Pathrimonio" 
                      className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(245,166,35,0.5)] group-hover:scale-105 transition-transform duration-300" 
                      src="/assets/images/hero-arrow.png" 
                    />
                  </div>
                  <div>
                    <span className="font-space text-[11px] text-on-surface-variant uppercase tracking-widest block font-medium">
                      Índice Compuesto de Transformación
                    </span>
                    <span className="font-space text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      +348.6%
                    </span>
                  </div>
                </div>

                {/* Animated Vector Grid Backdrop */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="heroGridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#heroGridPattern)" />
                </svg>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Metric Tile 1 */}
                <div className="bg-surface-container border border-outline-variant/50 p-4 rounded-lg flex flex-col gap-1">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="font-space text-[11px] uppercase tracking-wider font-semibold">Beneficiarios</span>
                    <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                  </div>
                  <span className="font-space text-2xl font-bold text-white">450K+</span>
                  <span className="font-jakarta text-xs text-primary flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> Cobertura directa
                  </span>
                </div>

                {/* Metric Tile 2 */}
                <div className="bg-surface-container border border-outline-variant/50 p-4 rounded-lg flex flex-col gap-1">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="font-space text-[11px] uppercase tracking-wider font-semibold">SLA Sistemas</span>
                    <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                  </div>
                  <span className="font-space text-2xl font-bold text-white">99.98%</span>
                  <span className="font-jakarta text-xs text-primary flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Misión crítica
                  </span>
                </div>
              </div>

              {/* Overlapping Live Deployment Strip */}
              <div className="bg-surface-container-high border border-outline-variant/60 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-jakarta text-xs text-white font-medium">18 Despliegues activos</span>
                </div>
                <span className="font-space text-[11px] text-primary font-bold uppercase tracking-wider">
                  5 Regiones Globales
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
