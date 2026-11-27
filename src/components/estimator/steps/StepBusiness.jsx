import React from 'react';
import {
  ArrowRight,
  Building2,
  Store,
  Briefcase,
  Utensils,
  Stethoscope,
  Factory,
  Layers
} from 'lucide-react';
import { INDUSTRIES, CURRENT_METHODS, PAIN_POINTS } from '../../../data/pricingRules';

function getIndustryIcon(id) {
  switch (id) {
    case 'logistica_transporte':
      return Building2;
    case 'comercio_retail':
      return Store;
    case 'servicios_profesionales':
      return Briefcase;
    case 'restaurantes_alimentos':
      return Utensils;
    case 'salud_clinicas':
      return Stethoscope;
    case 'manufactura_taller':
      return Factory;
    default:
      return Layers;
  }
}

export default function StepBusiness({ discovery, onUpdateDiscovery, onNext }) {
  return (
    <div className="animate-step-enter flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
          1. Contexto de tu Negocio
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Indícanos tu rubro y situación actual para sugerirte la configuración ideal.
        </p>
      </div>

      {/* Nombre de empresa opcional */}
      <div>
        <label
          htmlFor="est-company-name"
          className="block text-xs font-medium text-[var(--text-primary)] mb-1.5"
        >
          Nombre de tu empresa, cooperativa o colectivo (opcional)
        </label>
        <input
          id="est-company-name"
          type="text"
          value={discovery.company_name}
          onChange={(e) => onUpdateDiscovery('company_name', e.target.value)}
          placeholder="Ej. Distribuidora Santa María SAC"
          className="w-full bg-[var(--bg-page)] border border-[var(--border-strong)] focus:border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Rubro: Grid compacto (2 col móvil, 3-4 col escritorio, ícono + nombre sin párrafos largos) */}
      <div>
        <span className="block text-xs font-medium text-[var(--text-primary)] mb-2">
          ¿Cuál es tu rubro principal?
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {INDUSTRIES.map((ind) => {
            const isSelected = discovery.industry === ind.id;
            const IconComp = getIndustryIcon(ind.id);
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => onUpdateDiscovery('industry', ind.id)}
                className={`p-3 rounded-[8px] border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-[var(--bg-subtle)] border-[#FFC000] ring-1 ring-[#FFC000]/40'
                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#FFC000] text-[#09090B]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  <IconComp size={15} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight line-clamp-2">
                  {ind.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Método actual: Chips seleccionables compactos */}
      <div>
        <span className="block text-xs font-medium text-[var(--text-primary)] mb-2">
          ¿Cómo registran la información hoy?
        </span>
        <div className="flex flex-wrap gap-2">
          {CURRENT_METHODS.map((method) => {
            const isSelected = discovery.current_method === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onUpdateDiscovery('current_method', method.id)}
                title={method.desc}
                className={`h-9 sm:h-10 px-3.5 rounded-[8px] border text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#FFC000] border-[#FFC000] text-[#09090B] font-semibold shadow-xs'
                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span>{method.name}</span>
              </button>
            );
          })}
        </div>

        {discovery.current_method === 'otro_metodo' && (
          <div className="mt-2.5">
            <input
              type="text"
              value={discovery.custom_method_detail}
              onChange={(e) => onUpdateDiscovery('custom_method_detail', e.target.value)}
              placeholder="Especifica tu herramienta o método actual..."
              className="w-full bg-[var(--bg-page)] border border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        )}
      </div>

      {/* Cuello de botella: Chips seleccionables compactos */}
      <div>
        <span className="block text-xs font-medium text-[var(--text-primary)] mb-2">
          ¿Qué cuello de botella urge resolver primero?
        </span>
        <div className="flex flex-wrap gap-2">
          {PAIN_POINTS.map((pain) => {
            const isSelected = discovery.main_pain_point === pain.id;
            return (
              <button
                key={pain.id}
                type="button"
                onClick={() => onUpdateDiscovery('main_pain_point', pain.id)}
                title={pain.desc}
                className={`h-9 sm:h-10 px-3.5 rounded-[8px] border text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#FFC000] border-[#FFC000] text-[#09090B] font-semibold shadow-xs'
                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span>{pain.name}</span>
              </button>
            );
          })}
        </div>

        {discovery.main_pain_point === 'otro_cuello_de_botella' && (
          <div className="mt-2.5">
            <input
              type="text"
              value={discovery.custom_pain_detail}
              onChange={(e) => onUpdateDiscovery('custom_pain_detail', e.target.value)}
              placeholder="Describe el desafío principal de tu operación..."
              className="w-full bg-[var(--bg-page)] border border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        )}
      </div>

      {/* Siguiente */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FFC000] hover:bg-[#FFD038] active:scale-[0.985] text-[#09090B] text-xs font-bold transition-all cursor-pointer"
        >
          <span>Continuar a Roles</span>
          <ArrowRight
            size={14}
            strokeWidth={2}
            className="transition-transform duration-150 group-hover:translate-x-[3px]"
          />
        </button>
      </div>
    </div>
  );
}
