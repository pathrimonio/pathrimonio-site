import React from 'react';

export default function CaseStudies() {
  const architectures = [
    {
      category: "Salud & Cadena Crítica",
      title: "Patrón de Trazabilidad y Cadena de Frío",
      problem: "Diseñado para el control de insumos y biológicos en distritos aislados sin conectividad continua.",
      feature1Title: "Persistencia Desconectada",
      feature1Desc: "Firma criptográfica en dispositivo con SQLite local cifrado",
      feature2Title: "Sincronización Idempotente",
      feature2Desc: "Conciliación automática de lotes al detectar señal 2G/satelital",
      tags: ["Rust", "WebAssembly", "PostgreSQL", "Offline SQLite"],
      standard: "Arquitectura de Grado de Misión Crítica"
    },
    {
      category: "Inclusión Financiera",
      title: "Protocolo de Fondos y Microcrédito Comunitario",
      problem: "Diseñado para cooperativas y asambleas que requieren gobernanza contable transparente sin bancos intermediarios.",
      feature1Title: "Desembolsos Multifactoriales",
      feature1Desc: "Autorizaciones seguras con verificación local fuera de línea",
      feature2Title: "Consenso Distribuido",
      feature2Desc: "Libros contables auditables y verificables en asambleas públicas",
      tags: ["Go", "Consensus Raft", "Flutter", "Docker"],
      standard: "Arquitectura Criptográfica Auditada"
    },
    {
      category: "Recursos Críticos & Agua",
      title: "Red Telemétrica de Monitoreo Comunitario",
      problem: "Diseñado para el seguimiento continuo de acuíferos, caudales y bombas solares en ecosistemas rurales vulnerables.",
      feature1Title: "Transmisión Ultra-Baja Potencia",
      feature1Desc: "Topología de radio LoRaWAN con alcance de más de 15 km",
      feature2Title: "Analítica en Series de Tiempo",
      feature2Desc: "Detección temprana de anomalías y alertas tempranas de sequía",
      tags: ["C++ Embedded", "LoRaWAN", "TimescaleDB", "React"],
      standard: "Arquitectura de Sensores Autónomos"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface-container-lowest" id="soluciones">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Intro */}
        <div className="flex flex-col gap-2 max-w-3xl">
          <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
            Patrones de Arquitectura de Software
          </span>
          <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
            Arquitecturas de Solución con Propósito Humano
          </h2>
          <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Patrones de ingeniería diseñados para operar bajo restricciones extremas de conectividad, hardware y energía, garantizando soberanía de datos y resiliencia perpetua.
          </p>
        </div>

        {/* Architectures Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {architectures.map((arch, idx) => (
            <div 
              key={idx}
              className="bg-surface-container border border-outline-variant/70 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg hover:border-primary/40 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-space text-xs uppercase font-bold tracking-wider">
                    {arch.category}
                  </span>
                  <span className="font-space text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[14px]">architecture</span>
                    Blueprint
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-space text-lg sm:text-xl text-white font-bold group-hover:text-primary transition-colors leading-snug">
                    {arch.title}
                  </h3>
                  <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {arch.problem}
                  </p>
                </div>

                {/* Technical Guarantees Block */}
                <div className="bg-surface-container-high border border-outline-variant/50 p-4 rounded-lg flex flex-col gap-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-space text-[10px] text-primary uppercase tracking-wider font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">offline_bolt</span>
                      {arch.feature1Title}
                    </span>
                    <span className="font-jakarta text-xs text-white">
                      {arch.feature1Desc}
                    </span>
                  </div>
                  <div className="h-px bg-outline-variant/40 w-full"></div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-space text-[10px] text-primary uppercase tracking-wider font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">sync_alt</span>
                      {arch.feature2Title}
                    </span>
                    <span className="font-jakarta text-xs text-white">
                      {arch.feature2Desc}
                    </span>
                  </div>
                </div>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {arch.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/50 text-on-surface-variant font-space text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Status */}
              <div className="bg-surface-container-high border-t border-outline-variant/60 px-6 py-3 flex items-center justify-between">
                <span className="font-space text-xs text-on-surface-variant font-medium">
                  {arch.standard}
                </span>
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
