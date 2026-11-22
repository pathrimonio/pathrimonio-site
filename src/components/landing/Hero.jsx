import React from 'react';

export default function Hero({ onOpenContact }) {
  const scrollToPathway = () => {
    const el = document.getElementById('pathway');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full overflow-hidden bg-surface-container-lowest pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Ambient Luminous Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -top-12 right-12 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Narrative & Primary CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-high border border-outline-variant rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-space text-xs tracking-wide text-primary font-semibold">
                Impulsamos el desarrollo comunitario
              </span>
            </div>

            {/* Master Headline */}
            <h1 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] text-balance">
              Creamos productos de software intuitivos que{' '}
              <span className="text-primary underline decoration-primary/40 underline-offset-8">
                hacen realidad tus metas
              </span>.
            </h1>

            {/* Description Body */}
            <p className="font-jakarta text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              En <strong className="text-white">Pathrimonio</strong> diseñamos y desarrollamos aplicaciones móviles y plataformas web orientadas a la facilidad de uso y resultados concretos. Nuestro objetivo actual es posicionar nuestro producto MVP, <strong className="text-primary">Pathway</strong>, mientras preparamos el lanzamiento de nuevas herramientas digitales.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={scrollToPathway}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-on-primary font-space text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:shadow-[0_0_36px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">route</span>
                <span>Conoce Pathway (App de Metas)</span>
              </button>

              <button 
                onClick={onOpenContact}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs sm:text-sm font-semibold tracking-wide hover:bg-surface-container-highest transition-all duration-200"
              >
                <span>Hablemos de tu Proyecto</span>
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </button>
            </div>

            {/* Quality Commitment Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-outline-variant/60">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">phone_android</span>
                <span className="font-space text-xs uppercase tracking-wider font-medium">Apps Móviles Nativas</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">web</span>
                <span className="font-space text-xs uppercase tracking-wider font-medium">Plataformas Web Modernas</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">offline_pin</span>
                <span className="font-space text-xs uppercase tracking-wider font-medium">Funciona Sin Conexión</span>
              </div>
            </div>

          </div>

          {/* Right Column: MVP Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-surface-container-low border border-outline-variant p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
              
              {/* Card Header: Product MVP Status */}
              <div className="flex items-center justify-between pb-3 bg-surface-container/60 -mx-6 -mt-6 px-6 pt-4 rounded-t-2xl border-b border-outline-variant/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                  <span className="font-space text-xs uppercase tracking-wider text-white font-bold">
                    Producto Destacado (MVP)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-bold uppercase">
                  En Aprobación Play Store
                </span>
              </div>

              {/* App Presentation Mockup */}
              <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/70 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest border border-primary/30 p-2 flex items-center justify-center shrink-0">
                    <img 
                      src="/assets/images/icon_pathway.png" 
                      alt="Pathway App" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-space text-base font-bold text-white">
                      Pathway
                    </h3>
                    <p className="font-jakarta text-xs text-on-surface-variant">
                      Convierte tus grandes objetivos en pasos diarios
                    </p>
                  </div>
                </div>

                {/* Example of Goals tracking inside app */}
                <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-space text-xs font-bold text-white">
                      Meta: Lanzar mi negocio digital
                    </span>
                    <span className="font-space text-xs text-primary font-bold">75%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(245,166,35,0.7)]" style={{ width: '75%' }}></div>
                  </div>

                  {/* Steps Checklist */}
                  <div className="flex flex-col gap-1.5 pt-1 font-jakarta text-xs">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                      <span>Paso 1: Definir propuesta de valor</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                      <span>Paso 2: Desarrollar prototipo funcional</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary/70 text-[16px]">pending</span>
                      <span>Paso 3: Lanzamiento en Play Store (En revisión)</span>
                    </div>
                  </div>
                </div>

                {/* App CTA strip */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <a 
                    href="https://pathrimonio-pathway.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-center rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider hover:bg-[#e09419] transition-colors"
                  >
                    Probar en la Web
                  </a>
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-center rounded bg-surface-container-high border border-outline-variant text-white font-space text-xs font-bold uppercase tracking-wider hover:border-primary/50 transition-colors"
                  >
                    Ver en Play Store
                  </a>
                </div>
              </div>

              {/* Status Note */}
              <div className="bg-surface-container-high border border-outline-variant/60 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-jakarta text-xs text-white font-medium">Versión Web ya activa</span>
                </div>
                <span className="font-space text-[11px] text-primary font-bold uppercase tracking-wider">
                  Acceso Inmediato
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
