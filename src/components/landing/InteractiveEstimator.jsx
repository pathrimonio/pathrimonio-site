import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  Building2,
  Store,
  Briefcase,
  Utensils,
  Stethoscope,
  Factory,
  Layers,
  FileText,
  Table,
  Clock,
  Grid,
  AlertTriangle,
  Package,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  BarChart3,
  Database,
  Copy,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';

import {
  INDUSTRIES,
  CURRENT_METHODS,
  PAIN_POINTS,
  ADMIN_ROLES,
  END_CUSTOMER_TIERS,
  INTERFACE_OPTIONS,
  DATA_AND_APIS_OPTIONS,
  COMMITMENT_MODES,
  calculateQuotePricing,
  generateQuoteId,
  formatWhatsAppMessage
} from '../../data/pricingRules';
import { submitQuoteWithFormaliaHandoff } from '../../services/formaliaService';

const STORAGE_KEY = 'pathrimonio_quote_wizard_v2';
const PATHRIMONIO_WHATSAPP_NUMBER = '51950293223';

export default function InteractiveEstimator({ onOpenContact, preloadedFormaliaData = null }) {
  // ── 1. Estado inicial
  const [quoteState, setQuoteState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.business_discovery && parsed.configuration) {
          return parsed;
        }
      }
    } catch (_) {}

    return {
      currentStep: 1,
      business_discovery: {
        company_name: '',
        industry: 'logistica_transporte',
        current_method: 'excel_y_whatsapp',
        custom_method_detail: '',
        main_pain_point: 'desorden_en_despachos_y_caja',
        custom_pain_detail: ''
      },
      configuration: {
        admin_roles: [
          { role: 'gerencia', count: 1 },
          { role: 'almacen', count: 1 },
          { role: 'despacho', count: 1 }
        ],
        end_customers_tier: 'hasta_100_base',
        interfaces: ['web_operativa', 'portal_clientes'],
        data_and_apis: ['historial_ilimitado'],
        custom_requirements_note: ''
      },
      commitment_plan: 'semestral_setup_gratis',
      lead_contact: {
        name: '',
        whatsapp: '',
        email: ''
      }
    };
  });

  const [activeStep, setActiveStep] = useState(quoteState.currentStep || 1);
  const [tarifaSocio, setTarifaSocio] = useState(true);
  const [successQuote, setSuccessQuote] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [isPreloadedFromFormalia, setIsPreloadedFromFormalia] = useState(false);

  // Precarga automática determinista cuando el usuario viene desde FormalIA (SDD Sección 5)
  useEffect(() => {
    if (!preloadedFormaliaData || !preloadedFormaliaData.configuration) return;
    setQuoteState((prev) => ({
      ...prev,
      currentStep: 2,
      business_discovery: {
        ...prev.business_discovery,
        ...(preloadedFormaliaData.business_discovery || {})
      },
      configuration: {
        ...prev.configuration,
        ...(preloadedFormaliaData.configuration || {})
      },
      commitment_plan: preloadedFormaliaData.commitment_plan || prev.commitment_plan
    }));
    setActiveStep(2);
    setTarifaSocio(true);
    setIsPreloadedFromFormalia(true);
    setSuccessQuote(null);
  }, [preloadedFormaliaData?.preloadedAt]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...quoteState, currentStep: activeStep }));
    } catch (_) {}
  }, [quoteState, activeStep]);

  // ── 2. Cálculo de Precios reactivo
  const pricing = useMemo(() => {
    const base = calculateQuotePricing({
      admin_roles: quoteState.configuration.admin_roles,
      end_customers_tier: quoteState.configuration.end_customers_tier,
      interfaces: quoteState.configuration.interfaces,
      data_and_apis: quoteState.configuration.data_and_apis,
      commitment_plan: quoteState.commitment_plan
    });

    if (!tarifaSocio) {
      // Tarifa mercado tradicional (ej: $90/mes por rol y setup obligatorio de $500)
      const traditionalRolesTotal = base.totalAdminUsers * 90;
      const traditionalMonthly = traditionalRolesTotal + base.monthlyCustomersExtra + base.monthlyInterfaces + base.monthlyDataAndApis;
      return {
        ...base,
        monthlyRolesBase: traditionalRolesTotal,
        monthlyTotal: traditionalMonthly,
        dailyEquivalent: Number((traditionalMonthly / 30).toFixed(2)),
        setupFee: 500,
        setupFeeSavings: 0
      };
    }

    return base;
  }, [quoteState, tarifaSocio]);

  // ── 3. Acciones de usuario
  const handleUpdateDiscovery = (field, value) => {
    setQuoteState(prev => {
      const updatedDiscovery = { ...prev.business_discovery, [field]: value };
      if (field === 'industry') {
        const indObj = INDUSTRIES.find(i => i.id === value);
        if (indObj && indObj.suggestedRoles) {
          const newRoles = indObj.suggestedRoles.map(rId => ({ role: rId, count: 1 }));
          return {
            ...prev,
            business_discovery: updatedDiscovery,
            configuration: { ...prev.configuration, admin_roles: newRoles }
          };
        }
      }
      return { ...prev, business_discovery: updatedDiscovery };
    });
  };

  const handleRoleCountChange = (roleId, delta) => {
    setQuoteState(prev => {
      const currentRoles = [...prev.configuration.admin_roles];
      const existingIndex = currentRoles.findIndex(r => r.role === roleId);

      if (existingIndex >= 0) {
        const newCount = currentRoles[existingIndex].count + delta;
        if (newCount <= 0) {
          currentRoles.splice(existingIndex, 1);
        } else {
          currentRoles[existingIndex] = { ...currentRoles[existingIndex], count: Math.min(newCount, 50) };
        }
      } else if (delta > 0) {
        currentRoles.push({ role: roleId, count: 1 });
      }

      return {
        ...prev,
        configuration: {
          ...prev.configuration,
          admin_roles: currentRoles
        }
      };
    });
  };

  const handleToggleInterface = (interfaceId) => {
    if (interfaceId === 'web_operativa') return;
    setQuoteState(prev => {
      const current = prev.configuration.interfaces || [];
      const updated = current.includes(interfaceId)
        ? current.filter(i => i !== interfaceId)
        : [...current, interfaceId];
      return {
        ...prev,
        configuration: { ...prev.configuration, interfaces: updated }
      };
    });
  };

  const handleToggleDataPackage = (pkgId) => {
    setQuoteState(prev => {
      const current = prev.configuration.data_and_apis || [];
      const updated = current.includes(pkgId)
        ? current.filter(d => d !== pkgId)
        : [...current, pkgId];
      return {
        ...prev,
        configuration: { ...prev.configuration, data_and_apis: updated }
      };
    });
  };

  const goToStep = (stepNumber) => {
    setValidationError('');
    if (activeStep === 2 && stepNumber > 2 && pricing.totalAdminUsers === 0) {
      setValidationError('Debes seleccionar al menos 1 rol operativo para continuar.');
      return;
    }
    setActiveStep(stepNumber);
    const element = document.getElementById('cotizador');
    if (element && window.innerWidth < 1024) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Reiniciar la cotización?')) {
      localStorage.removeItem(STORAGE_KEY);
      setActiveStep(1);
      setValidationError('');
    }
  };

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();
    setValidationError('');

    if (!quoteState.lead_contact.name.trim()) {
      setValidationError('Por favor ingresa tu nombre de contacto.');
      return;
    }
    if (!quoteState.lead_contact.whatsapp.trim()) {
      setValidationError('Por favor ingresa tu número de WhatsApp.');
      return;
    }

    const quoteId = generateQuoteId();
    const payload = {
      quote_id: quoteId,
      formalia_session_id: preloadedFormaliaData?.formalia_session_id || null,
      timestamp: new Date().toISOString(),
      business_discovery: quoteState.business_discovery,
      configuration: {
        admin_roles: quoteState.configuration.admin_roles,
        total_admin_users: pricing.totalAdminUsers,
        end_customers_tier: quoteState.configuration.end_customers_tier,
        interfaces: quoteState.configuration.interfaces,
        data_and_apis: quoteState.configuration.data_and_apis,
        custom_requirements_note: quoteState.configuration.custom_requirements_note
      },
      pricing_summary: {
        tarifa_socio_activa: tarifaSocio,
        commitment_plan: quoteState.commitment_plan,
        currency: 'USD',
        monthly_total: pricing.monthlyTotal,
        daily_equivalent: pricing.dailyEquivalent,
        setup_fee: pricing.setupFee,
        setup_fee_savings: pricing.setupFeeSavings,
        is_enterprise: pricing.isEnterprise
      },
      lead_contact: quoteState.lead_contact
    };

    // Handoff asíncrono Preventa -> Desarrollo (POST /api/v1/quotes)
    submitQuoteWithFormaliaHandoff(payload, preloadedFormaliaData?.process_graph).catch(() => {});

    setSuccessQuote(payload);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (_) {}

    // Mensaje WhatsApp
    const waText = formatWhatsAppMessage(payload);
    const waUrl = `https://wa.me/${PATHRIMONIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  };

  // Helper para renderizar iconos de rubros
  const getIndustryIcon = (id) => {
    switch (id) {
      case 'logistica_transporte': return Building2;
      case 'comercio_retail': return Store;
      case 'servicios_profesionales': return Briefcase;
      case 'restaurantes_alimentos': return Utensils;
      case 'salud_clinicas': return Stethoscope;
      case 'manufactura_taller': return Factory;
      default: return Layers;
    }
  };

  return (
    <section id="cotizador" className="w-full py-20 lg:py-28 bg-[#FAFAFA] dark:bg-[#09090B] border-b border-[#E4E4E7] dark:border-[#27272A] transition-colors">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#F4F4F5] dark:bg-[#18181B] text-[#52525B] dark:text-[#A1A1AA] text-xs font-mono mb-3">
            <span className="text-[#09090B] dark:text-[#F4F4F5] font-semibold">COTIZADOR INTERACTIVO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#09090B] dark:text-[#F4F4F5] tracking-[-0.02em] mb-4">
            Diseña tu sistema operativo sin sorpresas.
          </h2>
          <p className="text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            Transparencia radical: calcula el valor exacto de tu software a <strong className="text-[#09090B] dark:text-[#F4F4F5]">$1 USD al día por rol</strong> y recibe una propuesta formal en minutos.
          </p>
        </div>

        {/* Banner Ruta Guiada o Precarga desde FormalIA (SDD Sección 2.1 y 5) */}
        {isPreloadedFromFormalia ? (
          <div className="mb-6 p-3.5 rounded-[10px] bg-[#FFFBEB] dark:bg-amber-500/10 border border-[#FFC000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#09090B] dark:text-[#F4F4F5]">
              <Sparkles size={16} className="text-[#9A6700] dark:text-[#FFC000] shrink-0" />
              <span>
                <strong>Configuración precargada desde tu mapa en FormalIA.</strong> Puedes ajustar cualquier rol o módulo libremente.
              </span>
            </div>
            <a
              href="#formalia"
              className="text-xs font-medium text-[#9A6700] dark:text-[#FFC000] hover:underline whitespace-nowrap"
            >
              Volver a editar en FormalIA →
            </a>
          </div>
        ) : (
          <div className="mb-6 p-3.5 rounded-[10px] bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              <Sparkles size={15} className="text-[#9A6700] dark:text-[#FFC000] shrink-0" />
              <span>¿No estás seguro de qué roles o módulos necesitas? Deja que <strong className="text-[#09090B] dark:text-[#F4F4F5]">FormalIA</strong> mapee tu operación y llene esto por ti.</span>
            </div>
            <a
              href="#formalia"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[#9A6700] dark:text-[#FFC000] text-xs font-semibold hover:border-[#FFC000] transition-colors whitespace-nowrap"
            >
              <span>Mapea tu negocio gratis con FormalIA</span>
              <ArrowRight size={13} />
            </a>
          </div>
        )}

        {/* Indicador de Progreso Minimalista (4 Pasos) */}
        <div className="mb-10 bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] rounded-[8px] p-2 sm:p-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Tu Negocio' },
              { num: 2, label: 'Roles y Equipo' },
              { num: 3, label: 'Canales y Clientes' },
              { num: 4, label: 'Modalidad y Envío' }
            ].map(step => {
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => goToStep(step.num)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-[6px] text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#FFC000] text-[#09090B] font-semibold'
                      : isPast
                      ? 'bg-[#FFFBEB] dark:bg-amber-500/10 text-[#9A6700] dark:text-[#FFC000] dark:text-[#FFC000] font-medium'
                      : 'text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    isActive ? 'bg-white dark:bg-[#18181B] text-[#9A6700] dark:text-[#FFC000] dark:text-[#FFC000] font-bold' : isPast ? 'bg-[#FFC000] text-[#09090B]' : 'bg-[#E4E4E7] dark:bg-[#27272A] text-[#52525B] dark:text-[#A1A1AA]'
                  }`}>
                    {step.num}
                  </span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerta de Validación */}
        {validationError && (
          <div className="mb-6 p-4 rounded-[6px] bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle size={16} strokeWidth={1.5} className="shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Split-Screen: 65% Izquierda (Wizard) / 35% Derecha (Sticky Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: 65% (8/12 cols) */}
          <div className="lg:col-span-8 bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] rounded-[10px] p-6 sm:p-8">
            {/* PASO 1: TU NEGOCIO */}
            {activeStep === 1 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#09090B] dark:text-[#F4F4F5] mb-1">1. Contexto de tu Negocio</h3>
                  <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">Indícanos tu rubro para pre-configurar los módulos ideales.</p>
                </div>

                {/* Nombre de la empresa */}
                <div>
                  <label className="block text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] mb-2">
                    Nombre de tu empresa, cooperativa o colectivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={quoteState.business_discovery.company_name}
                    onChange={(e) => handleUpdateDiscovery('company_name', e.target.value)}
                    placeholder="Ej. Distribuidora Santa María SAC"
                    className="w-full bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] focus:border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2.5 text-sm text-[#09090B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] dark:placeholder:text-[#71717A]"
                  />
                </div>

                {/* Selector de Rubro */}
                <div>
                  <label className="block text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] mb-2.5">
                    ¿Cuál es tu rubro u operación principal?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INDUSTRIES.map(ind => {
                      const isSelected = quoteState.business_discovery.industry === ind.id;
                      const IconComp = getIndustryIcon(ind.id);
                      return (
                        <div
                          key={ind.id}
                          onClick={() => handleUpdateDiscovery('industry', ind.id)}
                          className={`p-3.5 rounded-[6px] border cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-[#FFC000]'
                              : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#FFC000] text-[#09090B]' : 'bg-[#F4F4F5] dark:bg-[#27272A] text-[#52525B] dark:text-[#A1A1AA]'
                          }`}>
                            <IconComp size={16} strokeWidth={1.5} />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] leading-tight mb-0.5">
                              {ind.name}
                            </span>
                            <span className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-tight block">
                              {ind.tagline}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Método Actual con opción de Otro */}
                <div>
                  <label className="block text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] mb-2.5">
                    ¿Cómo registran la información hoy?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CURRENT_METHODS.map(m => {
                      const isSelected = quoteState.business_discovery.current_method === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleUpdateDiscovery('current_method', m.id)}
                          className={`p-3.5 rounded-[6px] border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-[#FFC000]'
                              : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46]'
                          }`}
                        >
                          <span className="block text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] mb-1">{m.name}</span>
                          <span className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-tight block">{m.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  {quoteState.business_discovery.current_method === 'otro_metodo' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={quoteState.business_discovery.custom_method_detail}
                        onChange={(e) => handleUpdateDiscovery('custom_method_detail', e.target.value)}
                        placeholder="Especifica tu herramienta o método actual..."
                        className="w-full bg-[#FFFFFF] dark:bg-[#18181B] border border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[#09090B] dark:text-[#F4F4F5]"
                      />
                    </div>
                  )}
                </div>

                {/* Cuello de Botella con opción de Otro */}
                <div>
                  <label className="block text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] mb-2.5">
                    ¿Cuál es el dolor operativo más urgente a resolver?
                  </label>
                  <div className="flex flex-col gap-2">
                    {PAIN_POINTS.map(p => {
                      const isSelected = quoteState.business_discovery.main_pain_point === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleUpdateDiscovery('main_pain_point', p.id)}
                          className={`p-3 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-[#FFC000]'
                              : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#FFC000]' : 'bg-[#D4D4D8]'}`}></span>
                            <div>
                              <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5] block">{p.name}</span>
                              <span className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">{p.desc}</span>
                            </div>
                          </div>
                          {isSelected && <Check size={14} strokeWidth={2} className="text-[#9A6700] dark:text-[#FFC000]" />}
                        </div>
                      );
                    })}
                  </div>

                  {quoteState.business_discovery.main_pain_point === 'otro_dolor' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={quoteState.business_discovery.custom_pain_detail}
                        onChange={(e) => handleUpdateDiscovery('custom_pain_detail', e.target.value)}
                        placeholder="Describe el desafío principal de tu operación..."
                        className="w-full bg-[#FFFFFF] dark:bg-[#18181B] border border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[#09090B] dark:text-[#F4F4F5]"
                      />
                    </div>
                  )}
                </div>

                {/* Botón Siguiente */}
                <div className="pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex justify-end">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] text-[#09090B] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Continuar a Roles</span>
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: ROLES DE TU EQUIPO */}
            {activeStep === 2 && (
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#09090B] dark:text-[#F4F4F5] mb-1">2. Roles de tu Equipo</h3>
                    <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">
                      Costo base: <strong className="text-[#09090B] font-mono">$1 USD/día ($30/mes)</strong> por rol administrativo activo.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#52525B] dark:text-[#A1A1AA] block">Total Roles</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-[#9A6700] dark:text-[#FFC000]">
                      {pricing.totalAdminUsers}
                    </span>
                  </div>
                </div>

                {/* Lista de Roles */}
                <div className="flex flex-col gap-3">
                  {ADMIN_ROLES.map(role => {
                    const selectedRole = quoteState.configuration.admin_roles.find(r => r.role === role.id);
                    const count = selectedRole ? selectedRole.count : 0;
                    const isSelected = count > 0;

                    return (
                      <div
                        key={role.id}
                        className={`p-4 rounded-[8px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-[#FFC000]'
                            : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A]'
                        }`}
                      >
                        <div className="max-w-md">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">{role.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#F4F4F5] dark:bg-[#27272A] text-[#52525B] dark:text-[#A1A1AA]">
                              $30/mes
                            </span>
                          </div>
                          <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">{role.desc}</p>
                        </div>

                        {/* Contador */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleRoleCountChange(role.id, -1)}
                            disabled={count === 0}
                            className="w-8 h-8 rounded-[4px] border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#09090B] dark:text-[#F4F4F5] transition-colors cursor-pointer"
                          >
                            <Minus size={13} strokeWidth={2} />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-sm text-[#09090B] dark:text-[#F4F4F5] tabular-nums">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRoleCountChange(role.id, 1)}
                            className="w-8 h-8 rounded-[4px] border border-[#FFC000] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] flex items-center justify-center text-[#09090B] transition-colors cursor-pointer"
                          >
                            <Plus size={13} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botones de Navegación */}
                <div className="pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] text-xs font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] text-[#09090B] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Continuar a Canales</span>
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: CANALES Y CLIENTES */}
            {activeStep === 3 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#09090B] dark:text-[#F4F4F5] mb-1">3. Canales e Interfaces</h3>
                  <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">Define los puntos de contacto con tus clientes y almacenamiento de datos.</p>
                </div>

                {/* Clientes Finales */}
                <div>
                  <label className="block text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] mb-2.5">
                    Volumen mensual de clientes finales activos
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {END_CUSTOMER_TIERS.map(tier => {
                      const isSelected = quoteState.configuration.end_customers_tier === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setQuoteState(p => ({ ...p, configuration: { ...p.configuration, end_customers_tier: tier.id } }))}
                          className={`p-3.5 rounded-[6px] border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-[#FFC000]'
                              : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">{tier.name}</span>
                            <span className="text-xs font-mono font-bold text-[#9A6700] dark:text-[#FFC000] tabular-nums">
                              {tier.monthlyPrice === 0 ? 'Incluido' : `+$${tier.monthlyPrice}/mes`}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">{tier.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interfaces Adicionales */}
                <div>
                  <label className="block text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] mb-2.5">
                    Interfaces adicionales de interacción
                  </label>
                  <div className="flex flex-col gap-2.5">
                    {INTERFACE_OPTIONS.map(opt => {
                      const isChecked = quoteState.configuration.interfaces.includes(opt.id);
                      const isRequired = opt.includedAlways;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleToggleInterface(opt.id)}
                          className={`p-3.5 rounded-[6px] border transition-all flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'bg-[#FFFBEB] border-[#FFC000]'
                              : 'bg-[#FFFFFF] border-[#E4E4E7] hover:border-[#D4D4D8]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-[#09090B] dark:text-[#F4F4F5]">{opt.name}</span>
                              {isRequired && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded">
                                  Base Obligatoria
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">{opt.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono font-bold text-[#9A6700] dark:text-[#FFC000] tabular-nums">
                              {opt.monthlyPrice === 0 ? '$0' : `+$${opt.monthlyPrice}/mes`}
                            </span>
                            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                              isChecked ? 'bg-[#FFC000] border-[#FFC000] text-[#09090B]' : 'border-[#D4D4D8] dark:border-[#3F3F46] bg-white dark:bg-[#18181B]'
                            }`}>
                              {isChecked && <Check size={11} strokeWidth={2.5} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Paquetes de Datos & APIs */}
                <div>
                  <label className="block text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] mb-2.5">
                    Historial extendido e integraciones
                  </label>
                  <div className="flex flex-col gap-2.5">
                    {DATA_AND_APIS_OPTIONS.map(pkg => {
                      const isChecked = quoteState.configuration.data_and_apis.includes(pkg.id);
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => handleToggleDataPackage(pkg.id)}
                          className={`p-3.5 rounded-[6px] border transition-all flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'bg-[#FFFBEB] border-[#FFC000]'
                              : 'bg-[#FFFFFF] border-[#E4E4E7] hover:border-[#D4D4D8]'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[#09090B] dark:text-[#F4F4F5] block mb-0.5">{pkg.name}</span>
                            <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">{pkg.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono font-bold text-[#9A6700] dark:text-[#FFC000] tabular-nums">
                              {pkg.monthlyPrice === 0 ? '$0' : `+$${pkg.monthlyPrice}/mes`}
                            </span>
                            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                              isChecked ? 'bg-[#FFC000] border-[#FFC000] text-[#09090B]' : 'border-[#D4D4D8] dark:border-[#3F3F46] bg-white dark:bg-[#18181B]'
                            }`}>
                              {isChecked && <Check size={11} strokeWidth={2.5} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botones de Navegación */}
                <div className="pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] text-xs font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] text-[#09090B] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Continuar a Modalidad</span>
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: MODALIDAD Y ENVÍO */}
            {activeStep === 4 && (
              <form onSubmit={handleFinalSubmit} className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#09090B] dark:text-[#F4F4F5] mb-1">4. Modalidad y Datos de Envío</h3>
                  <p className="text-xs text-[#52525B] dark:text-[#A1A1AA]">Elige tu tipo de compromiso y recibe tu propuesta técnica.</p>
                </div>

                {/* Modalidad de Compromiso */}
                <div>
                  <label className="block text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] mb-2.5">
                    Plan de permanencia y costo de implementación
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COMMITMENT_MODES.map(mode => {
                      const isSelected = quoteState.commitment_plan === mode.id;
                      const isRecommended = mode.id === 'semestral_setup_gratis';
                      return (
                        <div
                          key={mode.id}
                          onClick={() => setQuoteState(p => ({ ...p, commitment_plan: mode.id }))}
                          className={`p-4 rounded-[8px] border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-2 border-[#FFC000]'
                              : 'bg-[#FFFFFF] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A] hover:border-[#D4D4D8] dark:hover:border-[#3F3F46]'
                          }`}
                        >
                          {isRecommended && (
                            <span className="absolute -top-2.5 right-3 bg-[#FFC000] text-[#09090B] text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full">
                              $0 SETUP
                            </span>
                          )}
                          <span className="block text-xs font-bold text-[#09090B] dark:text-[#F4F4F5] mb-1">{mode.name}</span>
                          <span className="text-xs font-mono font-bold text-[#9A6700] dark:text-[#FFC000] block mb-2 tabular-nums">
                            {mode.setupPrice === 0 ? 'Setup: $0 USD' : `Setup: $${mode.setupPrice} USD (pago único)`}
                          </span>
                          <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">{mode.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Datos de Contacto */}
                <div className="pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex flex-col gap-4">
                  <span className="text-xs font-semibold text-[#09090B] dark:text-[#F4F4F5]">¿A quién enviamos la cotización?</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-[#52525B] dark:text-[#A1A1AA] mb-1">Tu nombre completo *</label>
                      <input
                        type="text"
                        required
                        value={quoteState.lead_contact.name}
                        onChange={(e) => setQuoteState(p => ({ ...p, lead_contact: { ...p.lead_contact, name: e.target.value } }))}
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] focus:border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[#09090B] dark:text-[#F4F4F5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#52525B] dark:text-[#A1A1AA] mb-1">WhatsApp de contacto *</label>
                      <input
                        type="tel"
                        required
                        value={quoteState.lead_contact.whatsapp}
                        onChange={(e) => setQuoteState(p => ({ ...p, lead_contact: { ...p.lead_contact, whatsapp: e.target.value } }))}
                        placeholder="Ej. +51 987 654 321"
                        className="w-full bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] focus:border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[#09090B] dark:text-[#F4F4F5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#52525B] dark:text-[#A1A1AA] mb-1">Correo electrónico (opcional)</label>
                    <input
                      type="email"
                      value={quoteState.lead_contact.email}
                      onChange={(e) => setQuoteState(p => ({ ...p, lead_contact: { ...p.lead_contact, email: e.target.value } }))}
                      placeholder="nombre@empresa.com"
                      className="w-full bg-[#FFFFFF] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] focus:border-[#FFC000] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[#09090B] dark:text-[#F4F4F5]"
                    />
                  </div>
                </div>

                {/* Botones de Navegación */}
                <div className="pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] text-xs font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] text-[#09090B] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <MessageSquare size={14} strokeWidth={1.5} />
                    <span>Enviar Cotización por WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Columna Derecha: 35% (4/12 cols) - Sticky Summary */}
          <div className="lg:col-span-4 sticky top-20 bg-[#FFFFFF] dark:bg-[#111113] border border-[#E4E4E7] dark:border-[#27272A] rounded-[10px] p-6 flex flex-col gap-6">
            {/* Header del Resumen + Switch Tarifa Socio */}
            <div className="pb-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#09090B] dark:text-[#F4F4F5] uppercase tracking-wider">
                  Resumen en Tiempo Real
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reiniciar cotizador"
                  className="text-[#A1A1AA] dark:text-[#71717A] hover:text-[#09090B] dark:hover:text-[#F4F4F5] p-1 transition-colors"
                >
                  <RotateCcw size={13} strokeWidth={1.5} />
                </button>
              </div>

              {/* Switch Tarifa Socio */}
              <div className="p-2.5 rounded-[6px] bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tarifaSocioSwitch"
                    checked={tarifaSocio}
                    onChange={(e) => setTarifaSocio(e.target.checked)}
                    className="w-4 h-4 text-[#9A6700] dark:text-[#FFC000] rounded border-zinc-300 focus:ring-amber-400 cursor-pointer accent-[#FFC000]"
                  />
                  <label htmlFor="tarifaSocioSwitch" className="text-xs font-medium text-[#09090B] dark:text-[#F4F4F5] cursor-pointer">
                    Tarifa Socio ($1/día)
                  </label>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[#9A6700] dark:text-[#FFC000] bg-white dark:bg-[#18181B] px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">
                  {tarifaSocio ? 'ACTIVA' : 'INACTIVA'}
                </span>
              </div>
            </div>

            {/* Precios Principales (Tabular Nums - Cero CLS) */}
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs text-[#52525B] dark:text-[#A1A1AA]">Mensualidad Total</span>
                {!tarifaSocio && (
                  <span className="text-xs font-mono text-[#A1A1AA] line-through">
                    ${(pricing.monthlyTotal * 0.45).toFixed(0)} USD
                  </span>
                )}
                {tarifaSocio && (
                  <span className="text-xs font-mono text-[#A1A1AA] line-through">
                    ${(pricing.totalAdminUsers * 90) + (pricing.monthlyCustomersExtra + pricing.monthlyInterfaces + pricing.monthlyDataAndApis)} USD
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold font-mono tabular-nums text-[#09090B] dark:text-[#F4F4F5]">
                  ${pricing.monthlyTotal} USD
                </span>
                <span className="text-xs text-[#52525B] dark:text-[#A1A1AA]">/ mes</span>
              </div>

              <div className="text-xs text-[#9A6700] dark:text-[#FFC000] font-mono tabular-nums font-semibold">
                ≈ ${pricing.dailyEquivalent} USD al día
              </div>
            </div>

            {/* Setup Fee */}
            <div className="p-3 rounded-[6px] bg-[#FAFAFA] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between text-xs">
              <span className="text-[#52525B] dark:text-[#A1A1AA]">Implementación (Setup):</span>
              <div className="flex items-center gap-2 font-mono tabular-nums">
                {pricing.setupFeeSavings > 0 && (
                  <span className="text-[#A1A1AA] line-through">$500 USD</span>
                )}
                <span className={`font-bold ${pricing.setupFee === 0 ? 'text-[#9A6700] dark:text-[#FFC000]' : 'text-[#09090B] dark:text-[#F4F4F5]'}`}>
                  ${pricing.setupFee} USD
                </span>
              </div>
            </div>

            {/* Desglose de Configuración */}
            <div className="pt-2 flex flex-col gap-2 text-xs text-[#52525B] dark:text-[#A1A1AA]">
              <div className="flex justify-between">
                <span>Roles administrativos ({pricing.totalAdminUsers}):</span>
                <span className="font-mono tabular-nums text-[#09090B] dark:text-[#F4F4F5] font-medium">
                  ${pricing.monthlyRolesBase} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span>Clientes e infraestructura:</span>
                <span className="font-mono tabular-nums text-[#09090B] dark:text-[#F4F4F5] font-medium">
                  ${pricing.monthlyCustomersExtra + pricing.monthlyInterfaces + pricing.monthlyDataAndApis} USD
                </span>
              </div>
            </div>

            {/* Caja Discreta de Beneficios Incluidos */}
            <div className="pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex flex-col gap-2">
              <span className="text-[11px] font-mono font-semibold text-[#09090B] dark:text-[#F4F4F5] uppercase tracking-wider">
                Garantías de la Alianza
              </span>
              <div className="flex items-center gap-2 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                <Check size={13} strokeWidth={2} className="text-[#9A6700] dark:text-[#FFC000]" />
                <span>Base de datos 100% propia (SQLite/Postgres)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                <Check size={13} strokeWidth={2} className="text-[#9A6700] dark:text-[#FFC000]" />
                <span>Arquitectura Offline-First sin cortes</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                <Check size={13} strokeWidth={2} className="text-[#9A6700] dark:text-[#FFC000]" />
                <span>Soporte continuo y sin costo por hora</span>
              </div>
            </div>

            {/* Botón de Acción en el Resumen */}
            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="w-full py-2.5 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] text-[#09090B] text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Completar y Enviar Cotización
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full py-2.5 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] dark:hover:bg-[#FFD133] text-[#09090B] text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Enviar a WhatsApp Ahora
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
