import React from 'react';

export default function Pillars() {
  const pillars = [
    {
      num: "01",
      title: "Arquitectura Resiliente & Segura",
      icon: "security",
      desc: "Sistemas de grado de defensa diseñados para tolerar particiones de red, caídas de energía y fallos en infraestructuras complejas sin pérdida de datos críticos.",
      tag: "Tolerancia a fallos bizantinos"
    },
    {
      num: "02",
      title: "Inteligencia de Datos para el Bienestar",
      icon: "insights",
      desc: "Modelos de predicción logística y analítica en tiempo real que optimizan la distribución de víveres, medicamentos y capital semilla donde más se requiere.",
      tag: "Modelado ético transparente"
    },
    {
      num: "03",
      title: "Accesibilidad e Inclusión Radical",
      icon: "wifi_off",
      desc: "Interfaces offline-first y protocolos de ultra-baja latencia creados para dispositivos modestos y conectividad satelital o 2G en comunidades aisladas.",
      tag: "Sub-50KB bundle payload"
    },
    {
      num: "04",
      title: "Soberanía Tecnológica & Open Core",
      icon: "terminal",
      desc: "Código auditable y programas de capacitación profunda que empoderan a equipos técnicos locales para mantener y evolucionar sus propias soluciones.",
      tag: "Licenciamiento sin ataduras"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface" id="metodologia">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
              Marcos de Ingeniería Sistemática
            </span>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Los Cuatro Pilares del Desarrollo Sistemático
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Nuestra arquitectura no depende de voluntarismo efímero. Aplicamos principios estrictos de resiliencia computacional y gobernanza abierta para garantizar impacto perpetuo.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-on-surface-variant font-space text-xs uppercase bg-surface-container-high px-3.5 py-1.5 rounded border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">memory</span>
            <span>Arquitectura Certificada v4.2</span>
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
