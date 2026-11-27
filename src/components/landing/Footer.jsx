import React from 'react';
import { ExternalLink, SlidersHorizontal, BookOpenCheck, MessageSquare } from 'lucide-react';
import { useConsent } from '../../context/ConsentContext';

export default function Footer({ onNavigate }) {
  const { openPreferencesModal } = useConsent();

  const handleLinkClick = (path) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <footer className="w-full bg-[#232529] text-[#D9DADC] border-t border-[#D9DADC]/15 py-14 transition-colors">
      <div className="site-container">
        {/* Cabecera minimalista del Footer: Marca, Ecosistema y Contacto WhatsApp */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-[#D9DADC]/15">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/assets/images/logo-sin-fondo-oscuro.png"
                alt="Pathrimonio Company"
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="font-semibold text-base text-white tracking-tight">
                Pathrimonio Company
              </span>
            </div>
            <p className="text-xs text-[#B8BAC0] leading-relaxed">
              Software a medida estructurado por roles para ordenar negocios reales y fortalecer el desarrollo comunitario.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.pathrimonio.pathway"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#2B2D31] border border-[#D9DADC]/20 hover:border-[#FFC000]/60 text-xs font-medium text-[#D9DADC] transition-colors"
            >
              <span>Pathway App (Google Play)</span>
              <ExternalLink size={12} strokeWidth={1.75} className="text-[#FFC000]" />
            </a>

            <a
              href="https://wa.me/51950293223?text=Hola,%20quisiera%20contactar%20al%20equipo%20de%20Pathrimonio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#FFC000] hover:bg-[#FFD038] active:scale-[0.985] text-[#2B2D31] text-xs font-bold transition-all"
            >
              <MessageSquare size={13} strokeWidth={2} />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>

        {/* Barra Legal & Cookies */}
        <div className="pt-6 pb-4 border-b border-[#D9DADC]/15 flex flex-wrap items-center justify-between gap-4 text-xs text-[#B8BAC0]">
          <nav aria-label="Enlaces legales" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="/legal/aviso-legal"
              onClick={handleLinkClick('/legal/aviso-legal')}
              className="hover:text-[#D9DADC] transition-colors"
            >
              Aviso Legal
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
              className="inline-flex items-center gap-1.5 text-[#D9DADC] font-medium hover:text-[#FFC000] transition-colors"
            >
              <BookOpenCheck size={13} strokeWidth={1.75} className="text-[#FFC000]" />
              <span>Libro de Reclamaciones</span>
            </a>
          </nav>

          <button
            type="button"
            onClick={openPreferencesModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#2B2D31] border border-[#D9DADC]/20 hover:border-[#FFC000]/60 text-xs font-medium text-[#D9DADC] transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={12} strokeWidth={1.75} className="text-[#FFC000]" />
            <span>Configurar cookies</span>
          </button>
        </div>

        {/* Pie inferior */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9699A1]">
          <span>© 2026 Pathrimonio Company. Todos los derechos reservados.</span>
          <a href="mailto:soporte@pathrimonio.site" className="hover:text-[#D9DADC] transition-colors">
            soporte@pathrimonio.site
          </a>
        </div>
      </div>
    </footer>
  );
}
