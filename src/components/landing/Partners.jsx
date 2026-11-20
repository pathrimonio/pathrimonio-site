import React from 'react';

export default function Partners() {
  const techStack = [
    { name: "Rust & WASM", icon: "memory", desc: "Seguridad de memoria" },
    { name: "Go & Raft", icon: "hub", desc: "Consenso distribuido" },
    { name: "Offline SQLite", icon: "database", desc: "Persistencia local AES-256" },
    { name: "Protocolo LoRaWAN", icon: "sensors", desc: "Telemetría de bajo consumo" },
    { name: "PostgreSQL", icon: "storage", desc: "Series de datos de impacto" },
    { name: "Linux & Open Core", icon: "terminal", desc: "Soberanía tecnológica" }
  ];

  return (
    <section className="w-full py-8 bg-surface-container-low border-y border-outline-variant/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5 max-w-sm">
          <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
          <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
            Construido sobre estándares abiertos, protocolos de alta disponibilidad y código auditable:
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
          {techStack.map((tech, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container/60 border border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container transition-all group"
            >
              <span className="material-symbols-outlined text-primary text-[18px] group-hover:scale-110 transition-transform">
                {tech.icon}
              </span>
              <div className="flex flex-col">
                <span className="font-space text-xs font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                  {tech.name}
                </span>
                <span className="font-jakarta text-[10px] text-on-surface-variant hidden sm:inline">
                  {tech.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
