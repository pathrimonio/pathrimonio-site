import React from 'react';

export default function Pillars() {
  const pillars = [
    {
      num: "01",
      title: "Claridad y Foco en el Usuario",
      icon: "person_check",
      desc: "Evitamos la complejidad innecesaria. Cada pantalla, botón y flujo está pensado para que cualquier persona lo entienda y disfrute usarlo desde el primer día.",
      tag: "Experiencia Intuitiva"
    },
    {
      num: "02",
      title: "Desarrollo Ágil y Entregas Reales",
      icon: "rocket_launch",
      desc: "Construimos prototipos y MVPs funcionales en plazos claros, permitiendo validar productos reales con usuarios reales antes de sobredimensionar.",
      tag: "Validación Rápida"
    },
    {
      num: "03",
      title: "Rendimiento y Estabilidad",
      icon: "bolt",
      desc: "Aplicamos las mejores prácticas de programación moderna para asegurar que tu aplicación cargue al instante y funcione de manera fluida y confiable.",
      tag: "Cero Fricción"
    },
    {
      num: "04",
      title: "Acompañamiento y Evolución",
      icon: "trending_up",
      desc: "El lanzamiento es solo el comienzo. Te acompañamos en la recopilación de retroalimentación y en la evolución continua de tus productos digitales.",
      tag: "Crecimiento Continuo"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface" id="metodologia">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
              Nuestra Forma de Trabajar
            </span>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Software Construido con Disciplina y Sentido Práctico
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Trabajamos con procesos claros y transparentes, enfocados en entregar valor real para tu negocio y una experiencia impecable para tus usuarios.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-on-surface-variant font-space text-xs uppercase bg-surface-container-high px-3.5 py-1.5 rounded border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
            <span>Calidad Garantizada</span>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <div 
              key={pillar.num}
              className="bg-surface-container border border-outline-variant/60 p-6 rounded-xl flex flex-col justify-between hover:border-primary/40 hover:bg-surface-container-high transition-all duration-300 group shadow-sm hover:shadow-xl"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-space text-3xl font-bold text-outline-variant group-hover:text-primary transition-colors">
                    {pillar.num}
                  </span>
                  <div className="w-10 h-10 rounded bg-surface-container-highest border border-outline-variant/80 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">{pillar.icon}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-space text-lg text-white font-bold group-hover:text-primary transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
              <div className="pt-6 flex items-center gap-1.5 font-space text-xs text-primary font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>{pillar.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
