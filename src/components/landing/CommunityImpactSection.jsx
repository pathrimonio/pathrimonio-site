import React, { useState } from 'react';

const COMMUNITY_SCENARIOS = [
  {
    id: 'cooperativas',
    tag: 'Sector Productivo & Rural',
    title: 'Cooperativas y Asociaciones de Productores',
    icon: 'agriculture',
    problem: 'Pérdida de cuadernos de campo, pesajes inconsistentes y demoras de días para calcular las liquidaciones de cada socio.',
    solution: 'App móvil offline para captura de entregas en campo, cálculo de rendimientos y visor de cuenta corriente para cada productor.',
    roles: ['Líder de Acopio', 'Técnico de Campo', 'Socio Productor'],
    stories: [
      'HU: Registrar lote cosechado y peso bruto sin necesidad de conexión a internet.',
      'HU: Consultar liquidación neta y adelantos de pago desde el teléfono celular.'
    ],
    metric: '100% de trazabilidad en pesaje y cero extravíos de notas físicas.'
  },
  {
    id: 'comercio',
    tag: 'Economía de Barrio',
    title: 'Comercios Locales & Redes de Distribución',
    icon: 'storefront',
    problem: 'Pedidos dispersos en chats de WhatsApp, inventario desfasado y comisiones abusivas (20% a 30%) cobradas por plataformas extranjeras.',
    solution: 'Catálogo web directo conectado a base de datos propia, pedidos estructurados por WhatsApp y control de caja y stock por $1 USD/día.',
    roles: ['Dueño / Administrador', 'Cajero / Despachador', 'Cliente Vecinal'],
    stories: [
      'HU: Recibir pedidos ordenados con comprobante y stock descontado en tiempo real.',
      'HU: Generar cuadre de caja diario en 2 clics para evitar fugas de dinero.'
    ],
    metric: 'El 100% del margen y los datos de clientes permanecen en el negocio local.'
  },
  {
    id: 'vecinal',
    tag: 'Organización de Base',
    title: 'Comités Vecinales & Fondos Colectivos',
    icon: 'diversity_3',
    problem: 'Descoordinación en faenas comunitarias, falta de trazabilidad en aportes de vecinos y desconfianza en la rendición de cuentas.',
    solution: 'Portal de metas comunitarias compartidas (con Pathway), registro de hitos de obra y tablero público de transparencia presupuestal.',
    roles: ['Coordinador Comunal', 'Tesorero Vecinal', 'Vecino Participante'],
    stories: [
      'HU: Publicar avance porcentual de obras y metas comunitarias con fotos de respaldo.',
      'HU: Rendir cuentas de cada aporte vecinal con recibo digital verificable.'
    ],
    metric: 'Confianza y participación ciudadana respaldada por evidencia abierta.'
  }
];

export default function CommunityImpactSection({ onOpenContact, onOpenPortal }) {
  const [activeTab, setActiveTab] = useState('cooperativas');
  const activeScenario = COMMUNITY_SCENARIOS.find(s => s.id === activeTab) || COMMUNITY_SCENARIOS[0];

  return (
    <section className="w-full py-20 lg:py-28 bg-surface-container-low border-b border-outline-variant/60" id="comunidad">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-space text-xs font-bold uppercase tracking-wider w-fit">
              <span className="material-symbols-outlined text-[16px]">groups_3</span>
              <span>Desarrollo Comunitario en Acción</span>
            </div>
            <h2 className="font-space text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Software al Servicio de la Economía Real
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              No creamos tecnología para inflar métricas en un Silicon Valley lejano. Construimos herramientas prácticas para las cooperativas, comerciantes, comités vecinales y pequeñas empresas que sostienen a nuestras comunidades.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-white font-space text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Impacto Social Medible</span>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COMMUNITY_SCENARIOS.map((sc) => {
            const isSelected = sc.id === activeTab;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveTab(sc.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-surface-container-high border-primary text-white shadow-lg ring-1 ring-primary/40'
                    : 'bg-surface-container border-outline-variant/60 hover:border-primary/40 text-on-surface-variant hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">{sc.icon}</span>
                  </div>
                  <span className="font-space text-[10px] uppercase font-bold text-primary">
                    {sc.tag}
                  </span>
                </div>
                <span className="font-space text-sm font-bold text-white line-clamp-1">
                  {sc.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Detail Card */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left: Problem and Solution narrative */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">{activeScenario.icon}</span>
              </div>
              <div>
                <span className="font-space text-xs uppercase text-primary font-bold tracking-wider">
                  {activeScenario.tag}
                </span>
                <h3 className="font-space text-xl sm:text-2xl font-bold text-white">
                  {activeScenario.title}
                </h3>
              </div>
            </div>

            {/* Pain Point vs Solution Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/60 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-red-400 font-space text-xs font-bold uppercase">
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  <span>El Desafío Tradicional</span>
                </div>
                <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
                  {activeScenario.problem}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-emerald-500/30 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-space text-xs font-bold uppercase">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Solución Pathrimonio</span>
                </div>
                <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
                  {activeScenario.solution}
                </p>
              </div>
            </div>

            {/* Impact Metric Banner */}
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3 text-xs font-space text-primary">
              <span className="material-symbols-outlined text-[20px] shrink-0">trending_up</span>
              <span><strong>Impacto directo:</strong> {activeScenario.metric}</span>
            </div>
          </div>

          {/* Right: Technical Spec Preview (Bridge to Portal) */}
          <div className="w-full lg:w-96 rounded-xl bg-surface-container-lowest border border-outline-variant p-5 flex flex-col gap-4 shadow-lg shrink-0">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <div className="flex items-center gap-1.5 text-white font-space text-xs font-bold">
                <span className="material-symbols-outlined text-primary text-[16px]">terminal</span>
                <span>Ficha de Requerimientos</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Verificada en Portal
              </span>
            </div>

            {/* Roles defined */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-space text-on-surface-variant font-bold">
                Roles de Negocio Asociados:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeScenario.roles.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/60 text-white font-space text-[11px] font-medium">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* User Stories preview */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] uppercase font-space text-on-surface-variant font-bold">
                Historias de Usuario (HU) Clave:
              </span>
              <div className="flex flex-col gap-2">
                {activeScenario.stories.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-surface-container/60 border border-outline-variant/40 font-jakarta text-[11px] text-on-surface leading-tight flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[14px] shrink-0 mt-0.5">bookmark</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to Portal */}
            <button
              onClick={onOpenPortal}
              className="mt-2 w-full py-2.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">open_in_new</span>
              <span>Explorar en el Portal de Software</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
