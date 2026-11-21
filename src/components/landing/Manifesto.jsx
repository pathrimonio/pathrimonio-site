import React from 'react';

export default function Manifesto() {
  const principles = [
    {
      num: "1.",
      title: "Utilidad Real",
      desc: "Creamos herramientas que resuelven necesidades cotidianas concretas, eliminando la complejidad innecesaria."
    },
    {
      num: "2.",
      title: "Transparencia y Respeto",
      desc: "Cuidamos la privacidad del usuario y su tiempo; construimos productos honestos sin letra chica ni patrones confusos."
    },
    {
      num: "3.",
      title: "Pasión por el Detalle",
      desc: "Cuidamos cada interacción visual y cada línea de código para que la experiencia sea rápida, confiable y agradable."
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface relative overflow-hidden" id="manifiesto">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          <span className="font-space text-xs sm:text-sm uppercase tracking-widest text-primary font-bold">
            Nuestra Filosofía
          </span>
        </div>

        <div className="max-w-5xl">
          <blockquote className="font-space text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-tight">
            “El mejor software es el que no se interpone en tu camino, sino el que te impulsa a dar el siguiente paso con confianza.”
          </blockquote>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-outline-variant/60">
          {principles.map((p, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <span className="font-space text-base text-white font-bold flex items-center gap-2">
                <span className="text-primary">{p.num}</span>
                {p.title}
              </span>
              <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
