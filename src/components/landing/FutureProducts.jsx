import React from 'react';

export default function FutureProducts({ onOpenContact }) {
  const directions = [
    {
      title: "Nuevos Productos en Incubación",
      desc: "Diseñamos y probamos internamente nuevas herramientas enfocadas en la productividad, el aprendizaje práctico y el bienestar comunitario.",
      icon: "rocket_launch",
      badge: "I+D Pathrimonio"
    },
    {
      title: "Desarrollo de Software para Empresas y Startups",
      desc: "Transformamos tu visión en una aplicación móvil o web con la misma calidad, velocidad y dedicación con la que construimos Pathway.",
      icon: "code_blocks",
      badge: "Software a Medida"
    },
    {
      title: "Herramientas de Colaboración y Comunidad",
      desc: "Creando plataformas que permiten a equipos y organizaciones trabajar de forma transparente, coordinada y sin fricciones.",
      icon: "diversity_3",
      badge: "Impacto Colectivo"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface-container-lowest border-t border-outline-variant/60" id="futuro">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
              Visión y Próximos Pasos
            </span>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Más Allá de Pathway: El Futuro de Nuestro Software
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Pathway es nuestro primer gran hito. Nuestro compromiso es continuar creando software accesible, útil y de alto nivel que resuelva problemas reales para personas y organizaciones.
            </p>
          </div>
          <button
            onClick={onOpenContact}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <span>Proponer un Proyecto</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Directions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {directions.map((dir, idx) => (
            <div 
              key={idx}
              className="bg-surface-container border border-outline-variant/70 rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 group shadow-sm hover:shadow-xl"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest border border-outline-variant flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">{dir.icon}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-space text-[10px] font-bold uppercase tracking-wider">
                    {dir.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-space text-lg text-white font-bold group-hover:text-primary transition-colors">
                    {dir.title}
                  </h3>
                  <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {dir.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/40 mt-4 flex items-center gap-1 text-primary font-space text-xs font-medium">
                <span>En constante evolución</span>
                <span className="material-symbols-outlined text-[14px]">trending_flat</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
