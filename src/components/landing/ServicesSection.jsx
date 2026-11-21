import React from 'react';

export default function ServicesSection() {
  const services = [
    {
      title: "Desarrollo de Apps Móviles",
      desc: "Creamos aplicaciones fluidas para Android e iOS con tecnología moderna, listas para publicar en Google Play Store y Apple App Store.",
      icon: "smartphone",
      badge: "Android & iOS"
    },
    {
      title: "Plataformas Web a Medida",
      desc: "Desarrollamos sitios web, portales y aplicaciones SaaS rápidas, responsivas y optimizadas para brindar la mejor experiencia en cualquier navegador.",
      icon: "web",
      badge: "Frontend & Backend"
    },
    {
      title: "Diseño de Producto & UX/UI",
      desc: "Diseñamos interfaces atractivas, limpias y fáciles de usar, asegurando que cada funcionalidad sea intuitiva para tus usuarios finales.",
      icon: "design_services",
      badge: "Centrado en el Usuario"
    },
    {
      title: "Arquitectura Offline-First",
      desc: "Especialistas en crear software que sigue funcionando incluso cuando el usuario pierde la conexión a internet, sincronizando datos al reconectarse.",
      icon: "cloud_sync",
      badge: "Alta Disponibilidad"
    }
  ];

  return (
    <section className="w-full py-16 lg:py-24 bg-surface-container-low border-y border-outline-variant/60" id="servicios">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
              Lo Que Hacemos
            </span>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Servicios de Desarrollo de Software
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Acompañamos a emprendedores, empresas y organizaciones en cada etapa: desde la concepción del producto hasta su despliegue y crecimiento.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-white font-space text-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span>Estándares de Calidad de Software</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, idx) => (
            <div 
              key={idx}
              className="bg-surface-container border border-outline-variant/70 p-6 rounded-xl flex flex-col justify-between hover:border-primary/50 hover:bg-surface-container-high transition-all duration-300 group shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">{svc.icon}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-space text-[10px] font-semibold">
                    {svc.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-space text-lg text-white font-bold group-hover:text-primary transition-colors">
                    {svc.title}
                  </h3>
                  <p className="font-jakarta text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {svc.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
