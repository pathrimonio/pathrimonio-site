import React from 'react';

export default function Footer({ onOpenContact }) {
  const PATHWAY_WEB = "https://pathrimonio-pathway.vercel.app/";
  const PATHWAY_PLAYSTORE = "https://play.google.com/store/apps/details?id=com.pathrimonio.pathway.app";

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-surface-container border border-outline-variant flex items-center justify-center">
                <img src="/assets/images/logo.png" alt="Pathrimonio" className="w-5 h-5 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-space text-lg tracking-tight text-white font-bold leading-none">
                  PATH<span className="text-primary">RIMONIO</span>
                </span>
                <span className="font-space text-[10px] text-primary font-semibold tracking-wide mt-1">
                  Impulsamos el desarrollo comunitario
                </span>
              </div>
            </div>

            <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Compañía de desarrollo de software enfocada en crear productos intuitivos, aplicaciones móviles y soluciones digitales de alto impacto.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-medium">
                Producto MVP: Pathway (En espera de aprobación en Play Store)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Nuestros Servicios
            </h3>
            <ul className="flex flex-col gap-2 font-jakarta text-xs text-on-surface-variant">
              <li>Desarrollo de Apps Móviles</li>
              <li>Plataformas Web Modernas</li>
              <li>Diseño de Producto &amp; UX/UI</li>
              <li>Soluciones Offline-First</li>
              <li>Desarrollo de Software a Medida</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Producto MVP: Pathway
            </h3>
            <ul className="flex flex-col gap-2 font-jakarta text-xs text-on-surface-variant">
              <li>
                <a 
                  href={PATHWAY_WEB} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors text-left flex items-center gap-1.5 text-white font-medium"
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">language</span>
                  Probar Pathway Web
                </a>
              </li>
              <li>
                <a 
                  href={PATHWAY_PLAYSTORE} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors text-left flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">shop</span>
                  Ficha en Google Play
                </a>
              </li>
              <li>Seguimiento de Metas &amp; Hitos</li>
              <li>Bitácora Personal de Hábitos</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Contacto &amp; Alianzas
            </h3>
            <ul className="flex flex-col gap-2 font-jakarta text-xs text-on-surface-variant">
              <li>
                <a href="#cotizador" className="hover:text-primary transition-colors text-left flex items-center gap-1.5 text-primary font-medium">
                  <span className="material-symbols-outlined text-[15px] text-primary">calculate</span>
                  Cotizador ($1/día)
                </a>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-primary transition-colors text-left flex items-center gap-1.5 text-white font-medium">
                  <span className="material-symbols-outlined text-[15px] text-primary">chat</span>
                  Iniciar un Proyecto
                </button>
              </li>
              <li>
                <a href="#futuro" className="hover:text-primary transition-colors text-left flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">rocket_launch</span>
                  Próximos Productos
                </a>
              </li>
              <li>
                <a href="#metodologia" className="hover:text-primary transition-colors text-left flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">psychology</span>
                  Cómo Trabajamos
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/50 flex flex-col md:flex-row items-center justify-between gap-4 font-jakarta text-xs text-on-surface-variant">
          <span>© 2026 Pathrimonio. Todos los derechos reservados. Impulsamos el desarrollo comunitario.</span>
          <div className="flex items-center gap-6 font-space text-[11px] uppercase tracking-wider">
            <a href="#cotizador" className="hover:text-primary transition-colors text-primary font-bold">Cotizador ($1/día)</a>
            <a href="#pathway" className="hover:text-primary transition-colors">App Pathway</a>
            <a href="#servicios" className="hover:text-primary transition-colors">Servicios</a>
            <a href="#futuro" className="hover:text-primary transition-colors">Visión</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
