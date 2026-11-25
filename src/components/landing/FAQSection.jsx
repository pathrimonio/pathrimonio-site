import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../../data/faqData';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 lg:py-28 bg-[#FFFFFF] dark:bg-[#09090B] border-b border-[#E4E4E7] dark:border-[#27272A] transition-colors">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#F4F4F5] dark:bg-[#18181B] text-[#52525B] dark:text-[#A1A1AA] text-xs font-mono mb-3">
            <span className="text-[#09090B] dark:text-[#F4F4F5] font-semibold">PREGUNTAS FRECUENTES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#09090B] dark:text-[#F4F4F5] tracking-[-0.02em] mb-4">
            Claridad técnica y transparencia sin rodeos.
          </h2>
          <p className="text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Respondemos directamente a las dudas habituales sobre nuestros modelos de cobro, arquitectura offline y garantías de soberanía.
          </p>
        </div>

        {/* Acordeón Minimalista Separado por Líneas de 1px */}
        <div className="border-t border-[#E4E4E7] dark:border-[#27272A]">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-[#E4E4E7] dark:border-[#27272A]">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full py-5 flex items-center justify-between text-left group transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base font-semibold transition-colors pr-6 ${
                    isOpen ? 'text-[#9A6700] dark:text-[#FFC000]' : 'text-[#09090B] dark:text-[#F4F4F5] group-hover:text-[#9A6700] dark:group-hover:text-[#FFC000]'
                  }`}>
                    {faq.q}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#9A6700] dark:text-[#FFC000]' : 'text-[#A1A1AA] dark:text-[#71717A] group-hover:text-[#09090B] dark:group-hover:text-[#F4F4F5]'
                  }`}>
                    <ChevronDown size={18} strokeWidth={1.5} />
                  </div>
                </button>

                {isOpen && (
                  <div className="pb-6 pr-6 animate-in fade-in duration-150">
                    <p className="text-sm text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
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
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
            ¿Tienes un caso atípico o requieres integración de hardware propio?{' '}
            <a
              href="https://wa.me/51950293223?text=Hola,%20quisiera%20hacer%20una%20consulta%20técnica%20sobre%20el%20software%20de%20Pathrimonio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9A6700] dark:text-[#FFC000] font-semibold underline underline-offset-2 hover:text-[#B45309] dark:hover:text-amber-300"
            >
              Consulta directa por WhatsApp con un ingeniero
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
