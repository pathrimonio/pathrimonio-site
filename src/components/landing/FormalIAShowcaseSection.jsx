import React, { useState } from 'react';
import { Sparkles, MessageSquareText, ArrowRight, CheckCircle2, Workflow } from 'lucide-react';

const BEFORE_AFTER_CASES = [
  {
    id: 'distribuidora',
    label: 'Reparto & Almacén',
    naturalPrompt:
      '“Recibimos pedidos por WhatsApp toda la mañana. Mi almacenero arma las cajas sin orden, el chofer sale a repartir y cobra contraentrega, pero al cerrar la tarde nos descuadran las cuentas.”',
    ownerRole: 'Dueño de distribuidora',
    resultSummary: 'Diagrama de 4 áreas conectado en segundos',
    steps: [
      { role: 'Atención', task: 'Registra pedido confirmado', status: 'Entrada' },
      { role: 'Almacén', task: 'Descuenta stock y arma guía', status: 'Preparación' },
      { role: 'Despacho', task: 'Asigna ruta y confirma entrega', status: 'En calle' },
      { role: 'Caja', task: 'Concilia cobro contraentrega', status: 'Cierre OK' }
    ]
  },
  {
    id: 'tienda',
    label: 'Tienda & Mostrador',
    naturalPrompt:
      '“Vendemos en mostrador y también nos piden cotizaciones por celular. A veces vendemos productos que ya no quedan en estante y dos personas usan la misma hoja de cálculo para cobrar.”',
    ownerRole: 'Comercio minorista / mayorista',
    resultSummary: 'Flujo separado por permisos sin perder ventas',
    steps: [
      { role: 'Ventas', task: 'Cotiza con precios actualizados', status: 'Cotizado' },
      { role: 'Caja', task: 'Cobra por turno con usuario propio', status: 'Pagado' },
      { role: 'Almacén', task: 'Reserva stock al instante', status: 'Stock real' },
      { role: 'Gerencia', task: 'Revisa cierre diario y márgenes', status: 'Control' }
    ]
  }
];

export default function FormalIAShowcaseSection({ onNavigate }) {
  const [selectedCaseId, setSelectedCaseId] = useState('distribuidora');
  const currentCase = BEFORE_AFTER_CASES.find((c) => c.id === selectedCaseId) || BEFORE_AFTER_CASES[0];

  return (
    <section
      id="formalia-demo"
      className="w-full py-20 lg:py-28 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors"
    >
      <div className="site-container">
        {/* Encabezado: Autoridad clara sin explicar tecnología interna */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-mono mb-3">
              <Sparkles size={12} className="text-[var(--accent-text)]" />
              <span className="font-semibold">FORMALIA · DIAGNÓSTICO GRATUITO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] mb-4">
              Primero ordenamos tu negocio contigo, antes de escribir una sola línea de software.
            </h2>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-[60ch]">
              No necesitas saber diseñar sistemas. Describe en palabras simples cómo opera hoy tu empresa y obtén tu mapa visual de procesos gratis para detectar qué roles necesitas ordenadamente.
            </p>
          </div>

          {/* Selector de escenario antes/después */}
          <div className="inline-flex items-center gap-1 p-1 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0 self-start lg:self-end">
            {BEFORE_AFTER_CASES.map((item) => {
              const active = item.id === selectedCaseId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCaseId(item.id)}
                  className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demostración Antes -> Después */}
        <div
          key={currentCase.id}
          className="tab-panel-enter grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* ANTES: Lenguaje Natural */}
          <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--border-subtle)] mb-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-primary)]">
                  <MessageSquareText size={15} className="text-[var(--accent-text)]" />
                  <span>1. ANTES · EN TUS PROPIAS PALABRAS</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">Lenguaje natural</span>
              </div>

              <div className="p-5 rounded-[10px] bg-[var(--bg-page)] border border-[var(--border-strong)] mb-5">
                <span className="text-[11px] font-mono text-[var(--text-muted)] block mb-2">
                  {currentCase.ownerRole} escribe:
                </span>
                <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed font-medium">
                  {currentCase.naturalPrompt}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
              <CheckCircle2 size={14} className="text-[var(--accent-text)] shrink-0" />
              <span>Sin plantillas complicadas ni formularios interminables</span>
            </div>
          </div>

          {/* DESPUÉS: Diagrama de procesos ordenado por roles (HSL 8% / 12% / 94%) */}
          <div className="lg:col-span-7 bg-[var(--hsl-dark-page)] text-[var(--hsl-dark-text)] border border-[var(--hsl-dark-border)] rounded-[12px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--hsl-dark-border)] mb-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[var(--accent-primary)]">
                  <Workflow size={15} />
                  <span>2. DESPUÉS · TU DIAGRAMA LISTO POR ROLES</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--hsl-dark-text-secondary)] bg-[var(--hsl-dark-card)] px-2.5 py-0.5 rounded border border-[var(--hsl-dark-border)]">
                  {currentCase.resultSummary}
                </span>
              </div>

              {/* Barra de pulso de flujo conectado (3.2s ciclo suave, Diagrams.md) */}
              <div className="hidden xl:flex items-center justify-between px-10 mb-3" aria-hidden="true">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] ring-4 ring-[var(--accent-primary)]/20" />
                <div className="flex-1 h-[2px] mx-2 bg-[var(--hsl-dark-border)] relative overflow-hidden rounded-full">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent animate-[flowSignal_3.2s_linear_infinite]" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]/80" />
                <div className="flex-1 h-[2px] mx-2 bg-[var(--hsl-dark-border)] relative overflow-hidden rounded-full">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent animate-[flowSignal_3.2s_linear_infinite_0.45s]" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]/80" />
                <div className="flex-1 h-[2px] mx-2 bg-[var(--hsl-dark-border)] relative overflow-hidden rounded-full">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent animate-[flowSignal_3.2s_linear_infinite_0.9s]" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
              </div>

              {/* Flujo visual interactivo paso a paso (Diagrams.md: líneas limpias + pulso sutil) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 relative my-2">
                {currentCase.steps.map((step, idx) => (
                  <div
                    key={step.role}
                    className="relative rounded-[10px] bg-[var(--hsl-dark-card)] border border-[var(--hsl-dark-border)] p-4 flex flex-col justify-between gap-3 transition-colors hover:border-[var(--accent-primary)]/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)]">
                        0{idx + 1} · {step.role}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]/80" />
                    </div>
                    <p className="text-xs sm:text-[13px] font-semibold text-[var(--hsl-dark-text)] leading-snug">
                      {step.task}
                    </p>
                    <div className="pt-2 border-t border-[var(--hsl-dark-border)] flex items-center justify-between text-[10px] font-mono text-[var(--hsl-dark-text-secondary)]">
                      <span>Estado</span>
                      <span className="text-[var(--accent-primary)]">{step.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Puerta de entrada directa a FormalIA */}
            <div className="pt-6 mt-6 border-t border-[var(--hsl-dark-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-xs text-[var(--hsl-dark-text-secondary)]">
                Llévate tu mapa operativo gratis y, si decides construirlo, úsalo directo en tu cotización.
              </span>
              <a
                href="/formalia"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate('/formalia');
                  }
                }}
                className="btn-accent group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shrink-0 cursor-pointer"
              >
                <span>Mapear mi negocio gratis con Formalia</span>
                <ArrowRight size={14} strokeWidth={2} className="transition-transform duration-150 group-hover:translate-x-[3px]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
