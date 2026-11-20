import React from 'react';

export default function Footer({ onNavigatePortal, onOpenContact }) {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-surface-container border border-outline-variant flex items-center justify-center">
                <img src="/assets/images/logo.png" alt="Pathrimonio" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-space text-lg tracking-tight text-white font-bold">
                PATH<span className="text-primary">RIMONIO</span>
              </span>
            </div>

            <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Arquitectura de software de alta precisión impulsada por propósito sistémico y progreso social medible a escala regional y global.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-medium">
                Sistemas operando al 99.98% uptime
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Divisiones Tech
            </h3>
            <ul className="flex flex-col gap-2 font-jakarta text-xs text-on-surface-variant">
              <li className="hover:text-primary transition-colors cursor-pointer">Infraestructura Distribuida</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Algoritmos de Gobernanza</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Arquitectura Tokenizada</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Pipelines Criptográficos</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Offline Data Stores</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Compromiso Social
            </h3>
            <ul className="flex flex-col gap-2 font-jakarta text-xs text-on-surface-variant">
              <li className="hover:text-primary transition-colors cursor-pointer">Métricas de Impacto Abierto</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Inclusión Patrimonial</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Auditoría de Algoritmos</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Iniciativa Open Core</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Comités Comunitarios</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Accesos Directos
            </h3>
            <ul className="flex flex-col gap-2 font-jakarta text-xs text-on-surface-variant">
              <li>
                <button onClick={onNavigatePortal} className="hover:text-primary transition-colors text-left flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">view_kanban</span>
                  Portal de Historias (App)
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-primary transition-colors text-left flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>
                  Agendar Sesión Técnica
                </button>
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">Whitepaper de Arquitectura</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Protocolos de Privacidad</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/50 flex flex-col md:flex-row items-center justify-between gap-4 font-jakarta text-xs text-on-surface-variant">
          <span>© 2026 Pathrimonio. Todos los derechos reservados. Arquitectura y progreso sin concesiones.</span>
          <div className="flex items-center gap-6 font-space text-[11px] uppercase tracking-wider">
            <a href="#manifiesto" className="hover:text-primary transition-colors">Manifiesto Sistémico</a>
            <a href="#soluciones" className="hover:text-primary transition-colors">Repositorio de Casos</a>
            <button onClick={onNavigatePortal} className="text-primary hover:underline font-bold">Portal Core Hub</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
