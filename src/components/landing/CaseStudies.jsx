import React from 'react';

export default function CaseStudies() {
  const cases = [
    {
      id: "BIO-889",
      badge: "Salud & Logística",
      title: "Plataforma BioSalud",
      desc: "Trazabilidad criptográfica de cadena de frío y distribución de vacunas en 14 distritos aislados de la selva y zonas montañosas.",
      kpi1Label: "Pérdida de inventario",
      kpi1Val: "-82%",
      kpi2Label: "Dosis Seguras",
      kpi2Val: "190,000+",
      tags: ["Rust", "WebAssembly", "PostgreSQL", "Offline SQLite"],
      deployTime: "En despliegue activo: 24 meses"
    },
    {
      id: "RAIZ-402",
      badge: "Inclusión Financiera",
      title: "Red Raíces",
      desc: "Protocolo de microcréditos peer-to-peer y ahorro comunitario sin intermediación bancaria extractiva, auditado por asambleas locales.",
      kpi1Label: "Capital Desplegado",
      kpi1Val: "$4.2M USD",
      kpi2Label: "Tasa Cumplimiento",
      kpi2Val: "98.4%",
      tags: ["Go", "Consensus Raft", "Flutter", "Docker"],
      deployTime: "Cooperativas integradas: 34"
    },
    {
      id: "H2O-119",
      badge: "Recursos Críticos",
      title: "AguaViva IoT",
      desc: "Red telemétrica de bajo costo para monitoreo de niveles freáticos, salinidad y control de flujo en bombas solares de agua potable.",
      kpi1Label: "Agua Salvaguardada",
      kpi1Val: "12.8M L",
      kpi2Label: "Pozos Monitoreados",
      kpi2Val: "320",
      tags: ["C++ Embedded", "LoRaWAN", "TimescaleDB", "React"],
      deployTime: "Autonomía por sensor: 5 años"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface-container-lowest" id="soluciones">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Intro */}
        <div className="flex flex-col gap-2 max-w-3xl">
          <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
            Despliegues en Producción
          </span>
          <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
            Soluciones de Alto Impacto y Casos Verificados
          </h2>
          <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Cada solución aborda una necesidad crítica de derechos fundamentales respaldada por infraestructura de código de alto rendimiento.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div 
              key={c.id}
              className="bg-surface-container border border-outline-variant/70 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg hover:border-primary/40 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-space text-xs uppercase font-bold tracking-wider">
                    {c.badge}
                  </span>
                  <span className="font-space text-xs text-on-surface-variant font-mono">
                    ID: {c.id}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-space text-xl text-white font-bold group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                {/* KPI Metric Block */}
                <div className="bg-surface-container-high border border-outline-variant/50 p-3.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-space text-[10px] text-on-surface-variant block uppercase tracking-wider">
                      {c.kpi1Label}
                    </span>
                    <span className="font-space text-lg sm:text-xl font-bold text-primary">
                      {c.kpi1Val}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-space text-[10px] text-on-surface-variant block uppercase tracking-wider">
                      {c.kpi2Label}
                    </span>
                    <span className="font-space text-lg sm:text-xl font-bold text-white">
                      {c.kpi2Val}
                    </span>
                  </div>
                </div>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/50 text-on-surface-variant font-space text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer status */}
              <div className="bg-surface-container-high border-t border-outline-variant/60 px-6 py-3 flex items-center justify-between">
                <span className="font-space text-xs text-on-surface-variant">
                  {c.deployTime}
                </span>
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
