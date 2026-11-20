import React from 'react';

export default function Footer({ onNavigatePortal, onOpenContact }) {
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
              <span className="font-space text-lg tracking-tight text-white font-bold">
                PATH<span className="text-primary">RIMONIO</span>
              </span>
            </div>

            <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Arquitectura de software sistemática y de alta precisión impulsada por propósito humano y soberanía tecnológica sin concesiones.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-medium">
                Diseñado para tolerancia a fallas y resiliencia offline
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Patrones Tech
            </h3>
            <ul className="flex flex-col gap-2 font-jakarta text-xs text-on-surface-variant">
              <li className="hover:text-primary transition-colors cursor-pointer">Infraestructura Offline-First</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Protocolos de Consenso Raft</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Criptografía Ed25519 &amp; AES</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Telemetría de Redes LoRaWAN</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Bases Embebidas SQLite</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Compromiso Ético
            </h3>
            <ul className="flex flex-col gap-2 font-jakarta text-xs text-on-surface-variant">
              <li className="hover:text-primary transition-colors cursor-pointer">Gobernanza Open Core</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Inclusión Digital Radical</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Auditoría Algorítmica Pública</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Cero Rastreadores Invasivos</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Perpetuidad de Sistemas</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-space text-xs uppercase text-white font-bold tracking-wider">
              Ecosistema &amp; Apps
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
                  Pathway Web App
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
                  Pathway en Google Play
                </a>
              </li>
              <li>
                <button onClick={onNavigatePortal} className="hover:text-primary transition-colors text-left flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">view_kanban</span>
                  Portal de Historias (Core Hub)
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-primary transition-colors text-left flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                  Iniciar Proyecto
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/50 flex flex-col md:flex-row items-center justify-between gap-4 font-jakarta text-xs text-on-surface-variant">
          <span>© 2026 Pathrimonio. Todos los derechos reservados. Arquitectura y progreso sin concesiones.</span>
          <div className="flex items-center gap-6 font-space text-[11px] uppercase tracking-wider">
            <a href="#pathway" className="hover:text-primary transition-colors text-primary font-bold">App Pathway</a>
            <a href="#soluciones" className="hover:text-primary transition-colors">Patrones de Software</a>
            <a href="#estandares" className="hover:text-primary transition-colors">Auditoría SHA-256</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
