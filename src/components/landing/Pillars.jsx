import React from 'react';

export default function Pillars() {
  const principles = [
    {
      num: "01",
      title: "Soberanía y Datos Propios",
      icon: "key",
      desc: "La base de datos y los registros pertenecen exclusivamente a tu comunidad u organización. No retenemos información ni aplicamos bloqueos por suscripción.",
      tag: "Propiedad Comunitaria"
    },
    {
      num: "02",
      title: "Resiliencia Offline-First",
      icon: "cloud_off",
      desc: "Diseñado para la realidad de campo: si se corta la conexión o estás en una zona sin cobertura móvil, el sistema sigue operando y sincroniza al volver la señal.",
      tag: "Cero Interrupciones"
    },
    {
      num: "03",
      title: "Usabilidad Inclusiva",
      icon: "accessibility_new",
      desc: "Eliminamos la jerga técnica innecesaria. Cada pantalla, botón y formulario está pensado para que cualquier trabajador o socio lo comprenda de inmediato.",
      tag: "Diseño para Todos"
    },
    {
      num: "04",
      title: "Acompañamiento en Terreno",
      icon: "handshake",
      desc: "El desarrollo de software no termina al compilar. Capacitamos a los colaboradores de cada área y adaptamos el sistema a la medida de su flujo real.",
      tag: "Crecimiento Compartido"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface-container-lowest border-b border-outline-variant/60" id="metodologia">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
              Manifiesto de Desarrollo
            </span>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Principios Inquebrantables de Nuestro Software
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Creemos que el desarrollo de software adquiere su verdadero valor cuando dignifica el trabajo de las personas y fortalece los lazos de confianza en la comunidad.
            </p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant font-space text-xs uppercase bg-surface-container-high px-3.5 py-1.5 rounded-lg border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
            <span>Compromiso Ético</span>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((pillar) => (
            <div 
              key={pillar.num}
              className="card-hover bg-surface-container border border-outline-variant/60 p-6 rounded-2xl flex flex-col justify-between group shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-space text-3xl font-bold text-outline-variant group-hover:text-primary transition-colors">
                    {pillar.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest border border-outline-variant/80 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
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
