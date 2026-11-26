import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../../data/faqData';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 lg:py-28 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-mono mb-3">
            <span className="font-semibold">PREGUNTAS FRECUENTES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
            Claridad técnica y transparencia sin rodeos.
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Respondemos directamente a las dudas habituales sobre nuestros modelos de cobro, arquitectura offline y garantías de soberanía.
          </p>
        </div>

        {/* Acordeón Minimalista Separado por Líneas de 1px */}
        <div className="border-t border-[var(--border-subtle)]">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full py-5 flex items-center justify-between text-left group transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-base font-semibold transition-colors pr-6 ${
                      isOpen
                        ? 'text-[var(--accent-text)]'
                        : 'text-[var(--text-primary)] group-hover:text-[var(--accent-text)]'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 bg-[#FFC93C] text-[#2B2D31]'
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <ChevronDown size={18} strokeWidth={1.75} />
                  </div>
                </button>

                {isOpen && (
                  <div className="pb-6 pr-6 animate-in fade-in duration-150">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contacto directo de pie de FAQ */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            ¿Tienes un caso atípico o requieres integración de hardware propio?{' '}
            <a
              href="https://wa.me/51950293223?text=Hola,%20quisiera%20hacer%20una%20consulta%20técnica%20sobre%20el%20software%20de%20Pathrimonio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-text)] font-semibold underline decoration-[#FFC93C] underline-offset-4 hover:opacity-85"
            >
              Consulta directa por WhatsApp con un ingeniero
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
