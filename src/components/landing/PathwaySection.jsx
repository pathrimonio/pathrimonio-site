import React from 'react';

export default function PathwaySection() {
  const WEB_URL = "https://pathrimonio-pathway.vercel.app/";
  const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.pathrimonio.pathway.app";

  const features = [
    {
      title: "Hitos y Progreso Ponderado",
      desc: "Metas estructuradas en hitos y actividades con cálculo matemático exacto de avance según pesos asignados.",
      icon: "route"
    },
    {
      title: "Mapa Visual del Recorrido",
      desc: "Visualización gráfica interactiva de tu trayectoria, nodos completados y proyección hacia el propósito.",
      icon: "map"
    },
    {
      title: "Bitácora Append-Only",
      desc: "Registro inmutable de reflexiones, aprendizajes y evidencias diarias sin riesgo de pérdida de historial.",
      icon: "history_edu"
    },
    {
      title: "Arquitectura Offline-First",
      desc: "Sincronización local persistente que te permite registrar avances sin conexión y reconciliar automáticamente.",
      icon: "cloud_sync"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface relative overflow-hidden border-t border-outline-variant/60" id="pathway">
      {/* Glow Ambient Highlights */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute -bottom-10 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col gap-12">
        
        {/* Top Header & Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-space text-xs font-bold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>Ecosistema de Software Pathrimonio</span>
            </div>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Pathway <span className="text-on-surface-variant font-normal text-2xl lg:text-3xl">(Pathwoy)</span> — App de Metas y Caminos de Progreso
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              La plataforma móvil y web para descomponer grandes propósitos en rutas ejecutables, medir el avance con rigor matemático y mantener una bitácora inmutable de crecimiento personal y comunitario.
            </p>
          </div>

          {/* Quick Dual Action Buttons (Desktop top right) */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <a 
              href={WEB_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-[0_0_16px_rgba(245,166,35,0.35)] hover:shadow-[0_0_24px_rgba(245,166,35,0.55)] hover:scale-[1.02] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">language</span>
              <span>Página Web</span>
            </a>
            <a 
              href={PLAYSTORE_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary/50 text-white hover:text-primary font-space text-xs font-bold uppercase tracking-wider transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a1.91 1.91 0 0 1-.61-.913V2.727c.143-.377.362-.697.609-.913zm11.235 11.238l2.298 2.298-11.455 6.613 9.157-8.911zm0-2.104l-9.157-8.91L17.142 8.65l-2.298 2.298zm1.052 1.052l3.437-1.984a1.868 1.868 0 0 1 0 3.238l-3.437-1.254z"/>
              </svg>
              <span>Play Store</span>
            </a>
          </div>
        </div>

        {/* Hero Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-container-low border border-outline-variant/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Decorative Grid */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>

          {/* Left: Product Value & Download Buttons */}
          <div className="lg:col-span-7 flex flex-col gap-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest border border-primary/30 flex items-center justify-center p-2 shadow-lg">
                <img 
                  src="/assets/images/icon_pathway.png" 
                  alt="Icono Pathway" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-space text-lg font-bold text-white tracking-tight">
                  Pathway by Pathrimonio
                </span>
                <span className="font-jakarta text-xs text-primary font-medium">
                  Rutas, Hitos y Bitácora de Objetivos
                </span>
              </div>
            </div>

            <p className="font-jakarta text-sm text-on-surface-variant leading-relaxed">
              Desarrollada bajo estándares de ingeniería limpia, Pathway te permite crear <strong className="text-white">Caminos</strong> de metas desglosados en hitos ponderados, visualizar mapas de avance, mantener un hábito reflexivo con bitácoras diarias y sincronizar datos en modo offline-first.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-container border border-outline-variant/50 hover:border-primary/30 transition-colors">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">
                    {feat.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-space text-xs font-bold text-white">
                      {feat.title}
                    </span>
                    <span className="font-jakarta text-[11px] text-on-surface-variant leading-normal">
                      {feat.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Dual Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-outline-variant/60">
              {/* Web App Link */}
              <a 
                href={WEB_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-primary text-on-primary font-space text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:shadow-[0_0_36px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">language</span>
                <span>Ir a la Página Web</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>

              {/* Google Play Store Link */}
              <a 
                href={PLAYSTORE_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:bg-surface-container-highest"
              >
                <svg className="w-5 h-5 fill-current text-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.91 1.91 0 0 1-.61-.913V2.727c.143-.377.362-.697.609-.913zm11.235 11.238l2.298 2.298-11.455 6.613 9.157-8.911zm0-2.104l-9.157-8.91L17.142 8.65l-2.298 2.298zm1.052 1.052l3.437-1.984a1.868 1.868 0 0 1 0 3.238l-3.437-1.254z"/>
                </svg>
                <span>Google Play Store</span>
              </a>
            </div>

            <div className="flex items-center gap-4 text-on-surface-variant font-space text-[11px]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[14px]">smartphone</span>
                Android App nativa (com.pathrimonio.pathway.app)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[14px]">web</span>
                PWA Web de alta disponibilidad
              </span>
            </div>
          </div>

          {/* Right: Interactive Visual Mockup / Device Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col gap-5 shadow-2xl relative">
              
              {/* App Bar Simulation */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div className="flex items-center gap-2">
                  <img 
                    src="/assets/images/logo_pathway_sinfondo.png" 
                    alt="Pathway Logo" 
                    className="h-6 object-contain"
                  />
                </div>
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-space text-[10px] font-bold">
                  LIVE APP
                </span>
              </div>

              {/* Sample Road / Camino Visual Card */}
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/70 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-space text-xs uppercase text-primary font-bold">Camino Activo</span>
                  <span className="font-space text-xs text-white font-mono font-bold">78% Completado</span>
                </div>
                <h4 className="font-space text-sm font-bold text-white">
                  Despliegue de Infraestructura Cívica
                </h4>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(245,166,35,0.7)]" style={{ width: '78%' }}></div>
                </div>

                {/* Milestone nodes checklist */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                    <span>Hito 1: Relevamiento y diagnóstico territorial</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white">
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                    <span>Hito 2: Arquitectura de base offline</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-[16px]">radio_button_unchecked</span>
                    <span>Hito 3: Validación con comités comunitarios</span>
                  </div>
                </div>
              </div>

              {/* Mini Bitácora Preview */}
              <div className="bg-surface-container-high/60 p-3.5 rounded-lg border border-outline-variant/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-space text-on-surface-variant">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[14px]">edit_note</span>
                    Bitácora de Hoy
                  </span>
                  <span>Modo Seguro</span>
                </div>
                <p className="font-jakarta text-[11px] text-on-surface-variant italic">
                  “Progreso consistente en la sincronización local sin latencia en campo.”
                </p>
              </div>

              {/* Bottom Quick Launch Pill */}
              <div className="flex items-center justify-between pt-1">
                <a 
                  href={WEB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-1/2 text-center py-2 px-2 rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider mr-1.5 hover:bg-[#e09419] transition-colors"
                >
                  Abrir Web
                </a>
                <a 
                  href={PLAYSTORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-1/2 text-center py-2 px-2 rounded bg-surface-container border border-outline-variant text-white font-space text-xs font-bold uppercase tracking-wider ml-1.5 hover:border-primary/50 transition-colors"
                >
                  Google Play
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
