import React from 'react';

export default function Hero({ onOpenContact, onOpenPortal }) {
  const scrollToPathway = () => {
    const el = document.getElementById('pathway');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCotizador = () => {
    const el = document.getElementById('cotizador');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full overflow-hidden bg-surface-container-lowest pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-outline-variant/60">
      {/* Ambient Luminous Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -top-12 right-12 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 animate-hero-enter">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Narrative & Community Mission */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-high border border-outline-variant rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-space text-xs tracking-wide text-primary font-semibold">
                Desarrollo Comunitario &amp; Software de Impacto · LATAM
              </span>
            </div>

            {/* Master Headline */}
            <h1 className="font-space text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.14] text-balance">
              Tecnología accesible para las{' '}
              <span className="text-primary underline decoration-primary/40 underline-offset-8">
                comunidades y negocios
              </span>{' '}
              que mueven nuestra economía.
            </h1>

            {/* Narrative Body */}
            <p className="font-jakarta text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              En <strong className="text-white">Pathrimonio</strong> diseñamos software para la economía real: cooperativas de productores, redes comerciales locales, comités vecinales y PYMEs. Creamos aplicaciones móviles y plataformas web que eliminan intermediarios, ordenan la operación diaria y convierten grandes metas colectivas en pasos alcanzables.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={scrollToCotizador}
                className="btn-interactive inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-on-primary font-space text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:shadow-[0_0_36px_rgba(245,166,35,0.55)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">calculate</span>
                <span>Cotizar Software ($1 USD/día)</span>
              </button>

              <button 
                onClick={scrollToPathway}
                className="btn-interactive inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs sm:text-sm font-semibold tracking-wide hover:bg-surface-container-highest transition-all duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">route</span>
                <span>Ver Pathway (App MVP)</span>
              </button>
            </div>

            {/* Link to requirements portal */}
            <div className="flex items-center gap-2 text-xs font-space text-on-surface-variant">
              <span>¿Colaboras con nosotros?</span>
              <button
                onClick={onOpenPortal}
                className="text-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Acceder a Historias de Usuario &amp; Roles</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Quality and Community Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/60">
              <div className="flex items-center gap-2.5 text-on-surface">
                <span className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">offline_pin</span>
                </span>
                <div className="flex flex-col">
                  <span className="font-space text-xs uppercase font-bold text-white">100% Offline-First</span>
                  <span className="font-jakarta text-[11px] text-on-surface-variant">Funciona en campo sin señal</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-on-surface">
                <span className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </span>
                <div className="flex flex-col">
                  <span className="font-space text-xs uppercase font-bold text-white">$1 USD/día por rol</span>
                  <span className="font-jakarta text-[11px] text-on-surface-variant">Transparencia comercial pura</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-on-surface">
                <span className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">security</span>
                </span>
                <div className="flex flex-col">
                  <span className="font-space text-xs uppercase font-bold text-white">Soberanía de Datos</span>
                  <span className="font-jakarta text-[11px] text-on-surface-variant">Tu comunidad es la dueña</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Living MVP Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="card-hover relative bg-surface-container-low border border-outline-variant p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
              
              {/* Card Header: Product MVP Status */}
              <div className="flex items-center justify-between pb-3 bg-surface-container/60 -mx-6 -mt-6 px-6 pt-4 rounded-t-2xl border-b border-outline-variant/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                  <span className="font-space text-xs uppercase tracking-wider text-white font-bold">
                    Producto Destacado (MVP)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-bold uppercase">
                  En Aprobación Google Play
                </span>
              </div>

              {/* App Presentation Mockup */}
              <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/70 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest border border-primary/30 p-2 flex items-center justify-center shrink-0 shadow-md">
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
                      Gestor de metas comunitarias, proyectos e hitos diarios
                    </p>
                  </div>
                </div>

                {/* Example of Community Goal Tracking inside App */}
                <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-space text-xs font-bold text-white truncate max-w-[210px]">
                      Meta: Red de Acopio y Tienda Comunitaria
                    </span>
                    <span className="font-space text-xs text-primary font-bold">75%</span>
                  </div>
                  
                  {/* Progress Bar with Luminous Glow */}
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(245,166,35,0.7)]" style={{ width: '75%' }}></div>
                  </div>

                  {/* Steps Checklist */}
                  <div className="flex flex-col gap-1.5 pt-1 font-jakarta text-xs">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0">check_circle</span>
                      <span className="truncate">Paso 1: Mapeo de roles de negocio y socios</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0">check_circle</span>
                      <span className="truncate">Paso 2: Registro offline de pesaje y stock</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary/70 text-[16px] shrink-0">pending</span>
                      <span className="truncate">Paso 3: Catálogo digital directo sin comisiones</span>
                    </div>
                  </div>
                </div>

                {/* App CTA strip */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <a 
                    href="https://pathrimonio-pathway.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-center rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider hover:bg-[#e09419] transition-colors shadow-sm"
                  >
                    Probar en la Web
                  </a>
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-center rounded bg-surface-container-high border border-outline-variant text-white font-space text-xs font-bold uppercase tracking-wider hover:border-primary/50 transition-colors"
                  >
                    Google Play
                  </a>
                </div>
              </div>

              {/* Status Note */}
              <div className="bg-surface-container-high border border-outline-variant/60 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-jakarta text-xs text-white font-medium">Versión Web 100% activa hoy</span>
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
