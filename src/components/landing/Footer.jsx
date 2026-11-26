import React from 'react';
import { ExternalLink, SlidersHorizontal, BookOpenCheck } from 'lucide-react';
import { useConsent } from '../../context/ConsentContext';

export default function Footer({ onOpenContact, onNavigate }) {
  const { openPreferencesModal } = useConsent();

  const handleLinkClick = (path) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <footer className="w-full bg-[#232529] text-[#D9DADC] border-t border-[#D9DADC]/15 py-16 transition-colors">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* 4 Columnas Compactas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#D9DADC]/15">
          {/* Columna 1: Brand & Misión */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/images/icono_202609011609.jpg"
                alt="Pathrimonio"
                className="w-7 h-7 rounded-[6px] object-cover shrink-0 border border-[#D9DADC]/20"
              />
              <span className="font-semibold text-base text-[#D9DADC] tracking-tight">Pathrimonio</span>
            </div>
            <p className="text-xs text-[#B8BAC0] leading-relaxed mb-4">
              Ingeniería de software sobria, accesible y de alto rendimiento. Construimos herramientas para la economía real y fortalecemos el tejido comunitario en América Latina.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#FFC93C] bg-[#2B2D31] px-2.5 py-1 rounded-[4px] border border-[#FFC93C]/35 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C]"></span>
              <span>100% Soberanía Tecnológica</span>
            </div>
          </div>

          {/* Columna 2: Soluciones & Roles */}
          <div className="flex flex-col">
            <span className="text-xs font-mono font-semibold text-[#D9DADC] uppercase tracking-wider mb-4">
              Soluciones
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-[#B8BAC0]">
              <li>
                <a href="#roles" className="hover:text-[#D9DADC] transition-colors">
                  Control por Roles Administrativos
                </a>
              </li>
              <li>
                <a href="#cotizador" className="hover:text-[#D9DADC] transition-colors">
                  Cotizador Interactivo ($1/día)
                </a>
              </li>
              <li>
                <a href="#arquitectura" className="hover:text-[#D9DADC] transition-colors">
                  Arquitectura Offline-First (SQLite)
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-[#D9DADC] transition-colors">
                  Automatización de WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Ecosistema & Comunidad */}
          <div className="flex flex-col">
            <span className="text-xs font-mono font-semibold text-[#D9DADC] uppercase tracking-wider mb-4">
              Ecosistema
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-[#B8BAC0]">
              <li>
                <a href="#socios" className="hover:text-[#D9DADC] transition-colors">
                  Programa de Socios
                </a>
              </li>
              <li>
                <a href="#socios" className="hover:text-[#D9DADC] transition-colors">
                  Simulador de Créditos por Referidos
                </a>
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#D9DADC] transition-colors"
                >
                  <span>Pathway App (Google Play)</span>
                  <ExternalLink size={11} strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <a href="#impacto" className="hover:text-[#D9DADC] transition-colors">
                  Transparencia y Proyectos de Base
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Confianza & Contacto */}
          <div className="flex flex-col">
            <span className="text-xs font-mono font-semibold text-[#D9DADC] uppercase tracking-wider mb-4">
              Contacto Directo
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-[#B8BAC0]">
              <li>
                <a
                  href="https://wa.me/51950293223?text=Hola,%20quisiera%20contactar%20al%20equipo%20de%20Pathrimonio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FFC93C] font-medium hover:text-[#FFD561]"
                >
                  <span>WhatsApp: +51 950 293 223</span>
                </a>
              </li>
              <li>
                <a href="mailto:soporte@pathrimonio.site" className="hover:text-[#D9DADC] transition-colors">
                  soporte@pathrimonio.site
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#D9DADC] transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="text-left hover:text-[#D9DADC] transition-colors cursor-pointer"
                >
                  Solicitar Consulta Técnica
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Legal & Privacidad (SDD Pilar 1) */}
        <div className="pt-6 pb-4 border-b border-[#D9DADC]/15 flex flex-wrap items-center justify-between gap-4 text-xs text-[#B8BAC0]">
          <nav aria-label="Enlaces legales" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="/legal/aviso-legal"
              onClick={handleLinkClick('/legal/aviso-legal')}
              className="hover:text-[#D9DADC] transition-colors"
            >
              Aviso Legal y Términos
            </a>
            <a
              href="/legal/privacidad"
              onClick={handleLinkClick('/legal/privacidad')}
              className="hover:text-[#D9DADC] transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="/legal/cookies"
              onClick={handleLinkClick('/legal/cookies')}
              className="hover:text-[#D9DADC] transition-colors"
            >
              Política de Cookies
            </a>
            <a
              href="/legal/libro-reclamaciones"
              onClick={handleLinkClick('/legal/libro-reclamaciones')}
              className="inline-flex items-center gap-1.5 text-[#D9DADC] font-medium hover:text-[#FFC93C] transition-colors"
            >
              <BookOpenCheck size={13} strokeWidth={1.75} className="text-[#FFC93C]" />
              <span>Libro de Reclamaciones</span>
            </a>
          </nav>

          <button
            type="button"
            onClick={openPreferencesModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#2B2D31] border border-[#D9DADC]/20 hover:border-[#FFC93C]/60 text-xs font-medium text-[#D9DADC] transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={12} strokeWidth={1.75} className="text-[#FFC93C]" />
            <span>Configurar cookies</span>
          </button>
        </div>

        {/* Barra Inferior */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9699A1]">
          <div className="flex items-center gap-2">
            <span>© 2026 Pathrimonio Company. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Hecho para la economía real</span>
            <span>•</span>
            <span className="text-[#FFC93C]">Sistemas Verificados</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
