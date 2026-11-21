import React from 'react';

export default function PathwaySection() {
  const WEB_URL = "https://pathrimonio-pathway.vercel.app/";
  const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.pathrimonio.pathway.app";

  const steps = [
    {
      num: "01",
      title: "Define tu Gran Meta",
      desc: "Elige lo que quieres lograr: lanzar un proyecto, aprender una habilidad, mejorar tu salud o alcanzar una meta financiera.",
      icon: "flag"
    },
    {
      num: "02",
      title: "Desglosa en Pasos Claros",
      desc: "Convierte una meta grande en hitos y acciones manejables para saber con precisión qué paso dar cada día.",
      icon: "checklist"
    },
    {
      num: "03",
      title: "Sigue tu Avance en el Mapa",
      desc: "Visualiza tu trayectoria en un recorrido interactivo donde cada tarea completada suma al porcentaje real de tu objetivo.",
      icon: "trending_up"
    },
    {
      num: "04",
      title: "Bitácora de Progreso",
      desc: "Registra tus aprendizajes, notas y pequeñas victorias diarias para mantener la motivación y el hábito.",
      icon: "menu_book"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface relative overflow-hidden border-t border-outline-variant/60" id="pathway">
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute -bottom-10 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-space text-xs font-bold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>Producto Insignia MVP</span>
            </div>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Pathway — App para Registrar Metas y los Pasos para Lograrlas
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Muchas metas se abandonan porque no sabemos qué hacer a continuación. Pathway te ayuda a estructurar tu camino: define tu objetivo, divídelo en pasos sencillos y avanza con claridad todos los días.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col sm:items-end gap-1">
            <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-space text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
              <span>En Espera de Aprobación en Play Store</span>
            </span>
            <span className="font-jakarta text-xs text-on-surface-variant">
              Versión Web 100% funcional y disponible hoy
            </span>
          </div>
        </div>

        {/* Hero Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-container-low border border-outline-variant/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Decorative Grid */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>

          {/* Left: How it works & CTAs */}
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
                  Pathway
                </span>
                <span className="font-jakarta text-xs text-primary font-medium">
                  De la Idea a la Meta, Paso a Paso
                </span>
              </div>
            </div>

            <p className="font-jakarta text-sm text-on-surface-variant leading-relaxed">
              Ya sea que quieras lanzar un emprendimiento, finalizar tus estudios o construir un hábito duradero, Pathway convierte tus intenciones en un plan de acción visual e intuitivo.
            </p>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {steps.map((st, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-primary/40 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0 font-space text-xs font-bold">
                    {st.num}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-space text-xs font-bold text-white">
                      {st.title}
                    </span>
                    <span className="font-jakarta text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                      {st.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Dual Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-outline-variant/60">
              {/* Web App Link */}
              <a 
                href={WEB_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-primary text-on-primary font-space text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:shadow-[0_0_36px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">language</span>
                <span>Probar la Versión Web</span>
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
                <span>Ficha en Google Play</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-jakarta text-xs">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[15px]">check</span>
                Gratis para comenzar
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[15px]">wifi_off</span>
                Uso sin conexión disponible
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[15px]">devices</span>
                Sincronización en tus dispositivos
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
                  APP EN VIVO
                </span>
              </div>

              {/* Sample Road / Camino Visual Card */}
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/70 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-space text-xs uppercase text-primary font-bold">Meta Activa</span>
                  <span className="font-space text-xs text-white font-mono font-bold">78% Completado</span>
                </div>
                <h4 className="font-space text-sm font-bold text-white">
                  Aprender Desarrollo y Lanzar mi App
                </h4>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(245,166,35,0.7)]" style={{ width: '78%' }}></div>
                </div>

                {/* Milestone nodes checklist */}
                <div className="flex flex-col gap-2 pt-1 font-jakarta text-xs">
                  <div className="flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                    <span>Paso 1: Definir alcance y diseño funcional</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                    <span>Paso 2: Desarrollar la aplicación MVP</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[16px]">hourglass_top</span>
                    <span>Paso 3: Esperando aprobación en Play Store</span>
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
                  <span className="text-primary font-medium">Día 24</span>
                </div>
                <p className="font-jakarta text-[11px] text-on-surface-variant italic">
                  “Un paso diario, por pequeño que parezca, mantiene la meta en movimiento.”
                </p>
              </div>

              {/* Bottom Quick Launch Pill */}
              <div className="flex items-center justify-between pt-1">
                <a 
                  href={WEB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-1/2 text-center py-2 px-2 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider mr-1.5 hover:bg-[#e09419] transition-colors"
                >
                  Abrir Web
                </a>
                <a 
                  href={PLAYSTORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-1/2 text-center py-2 px-2 rounded-lg bg-surface-container border border-outline-variant text-white font-space text-xs font-bold uppercase tracking-wider ml-1.5 hover:border-primary/50 transition-colors"
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
