import React from 'react';

export default function ServicesSection() {
  const services = [
    {
      title: "Apps Móviles Nativas & Offline-First",
      desc: "Desarrollamos aplicaciones para Android e iOS preparadas para trabajar en terreno sin señal continua. Los datos se guardan en el dispositivo y se sincronizan de inmediato al reconectar.",
      icon: "smartphone",
      badge: "Android & iOS · SQLite Local",
      focus: "Operación de campo, acopio y ventas rurales"
    },
    {
      title: "Plataformas Web Operativas & Portales",
      desc: "Sistemas de gestión, cuadros de mando y portales de socios rápidos y transparentes. Construidos con React y PostgreSQL para soportar miles de registros sin lentitud.",
      icon: "web",
      badge: "Full-Stack Web · PostgreSQL",
      focus: "Administración, control de socios y caja"
    },
    {
      title: "Automatización & Flujos con WhatsApp",
      desc: "Conectamos las conversaciones de WhatsApp directamente a tu base de datos para registrar pedidos, confirmar despachos y enviar estados de cuenta automáticos.",
      icon: "quick_reference_all",
      badge: "APIs & Webhooks · Cero Fugas",
      focus: "Atención directa sin pagar comisiones"
    },
    {
      title: "Diseño Participativo & Prototipado UI",
      desc: "Especificamos cada rol y pantalla junto con las personas que usarán el software. Validamos mockups interactivos e historias de usuario antes de programar una sola línea.",
      icon: "design_services",
      badge: "Validación Temprana · HU Claras",
      focus: "Cero fricción para el usuario de base"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface border-b border-outline-variant/60" id="servicios">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="font-space text-xs text-primary uppercase tracking-widest font-bold">
              Capacidades Técnicas
            </span>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Ingeniería de Software con Sentido Práctico
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Combinamos estándares modernos de desarrollo de software con un profundo entendimiento de la realidad operativa de cooperativas, organizaciones sociales y empresas locales.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-white font-space text-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">code</span>
            <span>Arquitectura Modular &amp; Escalable</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, idx) => (
            <div 
              key={idx}
              className="card-hover bg-surface-container border border-outline-variant/70 p-6 rounded-2xl flex flex-col justify-between group shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-surface-container-highest border border-outline-variant flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">{svc.icon}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-semibold border border-outline-variant/60">
                    {svc.badge}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-space text-lg text-white font-bold group-hover:text-primary transition-colors">
                    {svc.title}
                  </h3>
                  <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
                    {svc.desc}
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-outline-variant/40 mt-4 flex items-center gap-1.5 text-primary font-space text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                <span className="truncate">{svc.focus}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
