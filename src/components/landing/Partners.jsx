import React from 'react';

export default function Partners() {
  const partners = [
    { name: "BioGlobal AID", icon: "vital_signs" },
    { name: "AquaFund", icon: "water_drop" },
    { name: "MicroEthic Labs", icon: "account_balance" },
    { name: "Network 2030", icon: "hub" },
    { name: "Andes Solidario", icon: "handshake" }
  ];

  return (
    <section className="w-full py-8 bg-surface-container-low border-y border-outline-variant/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 max-w-sm">
          <span className="material-symbols-outlined text-primary text-[24px]">handshake</span>
          <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
            Impulsando el cambio junto a entidades de impacto global, cooperativas y fondos de desarrollo social:
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {partners.map((partner, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group"
            >
              <span className="material-symbols-outlined text-white text-[20px] group-hover:text-primary transition-colors">
                {partner.icon}
              </span>
              <span className="font-space text-sm font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
