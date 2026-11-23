import React from 'react';
import { ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export default function Footer({ onOpenContact }) {
  return (
    <footer className="w-full bg-[#FFFFFF] dark:bg-[#09090B] border-t border-[#E4E4E7] dark:border-[#27272A] py-16 transition-colors">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* 4 Columnas Compactas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#E4E4E7] dark:border-[#27272A]">
          {/* Columna 1: Brand & Misión */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-[6px] bg-[#FFC000] flex items-center justify-center text-[#09090B] shrink-0">
                <ShieldCheck size={16} strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-base text-[#09090B] dark:text-[#F4F4F5] tracking-tight">Pathrimonio</span>
            </div>
            <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-4">
              Ingeniería de software sobria, accesible y de alto rendimiento. Construimos herramientas para la economía real y fortalecemos el tejido comunitario en América Latina.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#9A6700] dark:text-[#FFC000] bg-[#FFFBEB] dark:bg-amber-500/10 px-2 py-1 rounded-[4px] border border-amber-200/80 dark:border-amber-500/30 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC000]"></span>
              <span>100% Soberanía Tecnológica</span>
            </div>
          </div>

          {/* Columna 2: Soluciones & Roles */}
          <div className="flex flex-col">
            <span className="text-xs font-mono font-semibold text-[#09090B] dark:text-[#F4F4F5] uppercase tracking-wider mb-4">
              Soluciones
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              <li>
                <a href="#roles" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  Control por Roles Administrativos
                </a>
              </li>
              <li>
                <a href="#cotizador" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  Cotizador Interactivo ($1/día)
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  Sistemas Offline-First (SQLite)
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  Automatización de WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Ecosistema & Comunidad */}
          <div className="flex flex-col">
            <span className="text-xs font-mono font-semibold text-[#09090B] dark:text-[#F4F4F5] uppercase tracking-wider mb-4">
              Ecosistema
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              <li>
                <a href="#socios" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  Programa de Socios
                </a>
              </li>
              <li>
                <a href="#socios" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  Simulador de Créditos por Referidos
                </a>
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors"
                >
                  <span>Pathway App (Google Play)</span>
                  <ExternalLink size={11} strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <a href="#impacto" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  Transparencia y Proyectos de Base
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Confianza & Contacto */}
          <div className="flex flex-col">
            <span className="text-xs font-mono font-semibold text-[#09090B] dark:text-[#F4F4F5] uppercase tracking-wider mb-4">
              Contacto Directo
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              <li>
                <a
                  href="https://wa.me/51950293223?text=Hola,%20quisiera%20contactar%20al%20equipo%20de%20Pathrimonio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#9A6700] dark:text-[#FFC000] font-medium hover:text-[#B45309] dark:hover:text-amber-300"
                >
                  <span>WhatsApp: +51 950 293 223</span>
                </a>
              </li>
              <li>
                <a href="mailto:soporte@pathrimonio.site" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  soporte@pathrimonio.site
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="text-left hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors cursor-pointer"
                >
                  Solicitar Consulta Técnica
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA] dark:text-[#71717A]">
          <div className="flex items-center gap-2">
            <span>© 2026 Pathrimonio Company. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Hecho para la economía real</span>
            <span>•</span>
            <span className="text-[#9A6700] dark:text-[#FFC000]">Sistemas Verificados</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
