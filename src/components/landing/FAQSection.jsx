import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from '../../data/faqData';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 lg:py-28 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
          {/* Columna Izquierda: Contexto Editorial y Contacto Directo */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-mono mb-3">
              <span className="font-semibold">PREGUNTAS FRECUENTES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] mb-4">
              Claridad técnica y transparencia sin rodeos.
            </h2>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[44ch]">
              Respondemos directamente a las dudas habituales sobre nuestros modelos de cobro, arquitectura offline y garantías de soberanía.
            </p>

            <div className="p-5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                ¿Tienes un caso operativo específico o requieres integración con balanzas, impresoras térmicas o hardware propio?
              </p>
              <a
                href="https://wa.me/51950293223?text=Hola,%20quisiera%20hacer%20una%20consulta%20técnica%20sobre%20el%20software%20de%20Pathrimonio"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-text)] underline decoration-[#FFC93C] underline-offset-4 hover:opacity-85 transition-opacity"
              >
                <span>Consulta directa por WhatsApp con un ingeniero</span>
                <ArrowRight
                  size={13}
                  strokeWidth={2}
                  className="transition-transform duration-150 group-hover:translate-x-[3px]"
                />
              </a>
            </div>
          </div>

          {/* Columna Derecha: Acordeón Fluido transitions.dev (#21 grid-rows) */}
          <div className="lg:col-span-8 border-t border-[var(--border-subtle)]">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="t-acc border-b border-[var(--border-subtle)]"
                  data-open={isOpen ? 'true' : 'false'}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="w-full py-5 lg:py-6 flex items-center justify-between text-left group transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-base sm:text-lg font-semibold transition-colors pr-6 ${
                        isOpen
                          ? 'text-[var(--accent-text)]'
                          : 'text-[var(--text-primary)] group-hover:text-[var(--accent-text)]'
                      }`}
                    >
                      {faq.q}
                    </span>
                    <div
                      className={`t-acc-chevron w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isOpen
                          ? 'bg-[#FFC93C] text-[#2B2D31]'
                          : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      <ChevronDown size={18} strokeWidth={1.75} />
                    </div>
                  </button>

                  <div className="t-acc-panel">
                    <div className="t-acc-panel-inner">
                      <p className="pb-6 pr-8 text-sm sm:text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-[74ch]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
