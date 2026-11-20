import React from 'react';

export default function Manifesto() {
  const principles = [
    {
      num: "1.",
      title: "Ética por Diseño",
      desc: "Rechazamos patrones oscuros de monetización o captura de datos que vulneren la dignidad del usuario final."
    },
    {
      num: "2.",
      title: "Perpetuidad de Sistemas",
      desc: "Construimos software mantenible que subsiste a los ciclos de subvención y financiamiento corporativo."
    },
    {
      num: "3.",
      title: "Verificación Abierta",
      desc: "Cada métrica de impacto es rastreable mediante auditorías públicas, sin vanidad ni métricas infladas."
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface relative overflow-hidden" id="manifiesto">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          <span className="font-space text-xs sm:text-sm uppercase tracking-widest text-primary font-bold">
            El Manifiesto de Pathrimonio
          </span>
        </div>

        <div className="max-w-5xl">
          <blockquote className="font-space text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-tight">
            “El código nunca ha sido neutral. Cada línea de arquitectura que escribimos o consolida privilegios o construye un futuro deliberadamente equitativo.”
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
