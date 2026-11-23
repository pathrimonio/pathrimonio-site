import React from 'react';

export default function Manifesto() {
  const principles = [
    {
      num: "01.",
      title: "Utilidad en la Vida Real",
      desc: "Desarrollamos herramientas que resuelven cuellos de botella cotidianos en bodegas, chacras, talleres y comités, eliminando pasos redundantes."
    },
    {
      num: "02.",
      title: "Transparencia sin Letra Chica",
      desc: "Garantizamos costos claros desde el primer día, modelos abiertos de estimación y el compromiso de no atar tus datos a cláusulas forzadas."
    },
    {
      num: "03.",
      title: "Artesanía en el Código",
      desc: "Cuidamos el rendimiento, los tiempos de carga y la estética visual para que usar nuestras aplicaciones sea una experiencia rápida, sólida y digna."
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface-container-lowest relative overflow-hidden border-b border-outline-variant/60" id="manifiesto">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          <span className="font-space text-xs sm:text-sm uppercase tracking-widest text-primary font-bold">
            Voz &amp; Filosofía de Pathrimonio
          </span>
        </div>

        <div className="max-w-5xl">
          <blockquote className="font-space text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-tight">
            “El mejor software no es el que acumula funciones complejas para impresionar ingenieros; es el que le devuelve el control a una comunidad y le permite construir su futuro con confianza.”
          </blockquote>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-outline-variant/60">
          {principles.map((p, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <span className="font-space text-base text-white font-bold flex items-center gap-2">
                <span className="text-primary font-mono">{p.num}</span>
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
