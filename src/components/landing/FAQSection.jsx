import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '¿Cómo funciona exactamente el modelo de $1 USD/día por rol?',
    a: 'Cada rol operativo activo (por ejemplo, Caja, Almacén o Ventas) tiene un costo fijo de $30 USD al mes ($1 USD por día). No cobramos licencias por dispositivo ni restricciones ocultas por volumen de transacciones dentro del plan acordado. Si tu negocio solo necesita 2 roles, pagas exactamente $60 USD al mes.'
  },
  {
    q: '¿Cómo funciona el $0 de costo de implementación (Setup Fee)?',
    a: 'En el desarrollo tradicional, los proveedores cobran entre $2,500 y $5,000 USD de entrada. En Pathrimonio, al optar por un compromiso de permanencia de 6 meses en el Programa de Socios, asumimos el 100% del costo de configuración, modelado de datos y puesta en marcha ($0 USD de setup).'
  },
  {
    q: '¿Qué ocurre si se corta la conexión a internet en mi local o almacén?',
    a: 'Nuestra arquitectura es 100% Offline-First con base de datos local SQLite. Tu equipo puede registrar ventas, despachos, pesajes e inventario sin internet de forma continua. En cuanto se detecta conexión (por Wi-Fi o datos móviles), los cambios se sincronizan de manera segura en segundo plano sin duplicar registros.'
  },
  {
    q: '¿Nuestra organización es dueña de su base de datos?',
    a: 'Absolutamente sí. Uno de nuestros principios inquebrantables es la Soberanía Tecnológica: tu información no queda secuestrada por ningún software propietario. Puedes solicitar y descargar la copia completa de tu base de datos en formato SQL o CSV en cualquier momento.'
  },
  {
    q: '¿Cómo se acumulan y aplican los créditos por referidos?',
    a: 'Mantenemos una política clara de reciprocidad comunitaria: por cada 2 negocios, cooperativas o comités vecinales que comiencen a operar con nosotros por tu recomendación, recibes $60 USD en créditos operativos. Esto equivale a 2 meses bonificados de 1 rol, o 1 mes completo libre de costo para 2 roles.'
  },
  {
    q: '¿Cómo se conecta mi software con la aplicación Pathway?',
    a: 'Pathway es nuestra app comunitaria para iOS/Android y Web. Si representas a una cooperativa, comercio barrial o junta vecinal, puedes activar un canal público en Pathway para que tus miembros o vecinos sigan el avance de proyectos de impacto, hitos de obra o metas de financiamiento colectivo con total transparencia.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E4E4E7]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#F4F4F5] text-[#52525B] text-xs font-mono mb-3">
            <span>SECCIÓN 06</span>
            <span>/</span>
            <span className="text-[#09090B] font-semibold">PREGUNTAS FRECUENTES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#09090B] tracking-[-0.02em] mb-4">
            Claridad técnica y transparencia sin rodeos.
          </h2>
          <p className="text-base text-[#52525B] leading-relaxed">
            Respondemos directamente a las dudas habituales sobre nuestros modelos de cobro, arquitectura offline y garantías de soberanía.
          </p>
        </div>

        {/* Acordeón Minimalista Separado por Líneas de 1px */}
        <div className="border-t border-[#E4E4E7]">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-[#E4E4E7]">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full py-5 flex items-center justify-between text-left group transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base font-semibold transition-colors pr-6 ${
                    isOpen ? 'text-[#9A6700]' : 'text-[#09090B] group-hover:text-[#9A6700]'
                  }`}>
                    {faq.q}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#9A6700]' : 'text-[#A1A1AA] group-hover:text-[#09090B]'
                  }`}>
                    <ChevronDown size={18} strokeWidth={1.5} />
                  </div>
                </button>

                {isOpen && (
                  <div className="pb-6 pr-6 animate-in fade-in duration-150">
                    <p className="text-sm text-[#52525B] leading-relaxed">
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
          <p className="text-xs text-[#52525B]">
            ¿Tienes un caso atípico o requieres integración de hardware propio?{' '}
            <a
              href="https://wa.me/51950293223?text=Hola,%20quisiera%20hacer%20una%20consulta%20técnica%20sobre%20el%20software%20de%20Pathrimonio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9A6700] font-semibold underline underline-offset-2 hover:text-[#B45309]"
            >
              Consulta directa por WhatsApp con un ingeniero
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
