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
import { PRIVACY_POLICY_VERSION } from '../../config/siteConfig';

const STORAGE_KEY = 'pathrimonio_quote_wizard_v2';
const PATHRIMONIO_WHATSAPP_NUMBER = '51950293223';

const DEFAULT_QUOTE_STATE = {
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

export default function InteractiveEstimator({
  onOpenContact,
  onNavigate,
  preloadedFormaliaData = null,
  pricingConfig = null,
  currentUser = null
}) {
  const unitSocioPrice = Number(pricingConfig?.admin_role_monthly_usd ?? 30);
  const unitTradPrice = Number(pricingConfig?.traditional_role_monthly_usd ?? 90);
  const tradSetupFee = Number(pricingConfig?.traditional_setup_fee_usd ?? pricingConfig?.setup_fee_no_permanence_usd ?? 500);
  const dailySocioLabel = Number((unitSocioPrice / 30).toFixed(2).replace(/\.00$/, ''));
  // ── 1. Estado inicial determinista (SSR-safe; hidrata borrador tras montar)
  const [quoteState, setQuoteState] = useState(DEFAULT_QUOTE_STATE);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const [activeStep, setActiveStep] = useState(1);
  const [tarifaSocio, setTarifaSocio] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [successQuote, setSuccessQuote] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [isPreloadedFromFormalia, setIsPreloadedFromFormalia] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.business_discovery && parsed.configuration) {
          setQuoteState(parsed);
          if (parsed.currentStep) setActiveStep(parsed.currentStep);
        }
      }
    } catch (_) {}
    setDraftHydrated(true);
  }, []);

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
    if (!draftHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...quoteState, currentStep: activeStep }));
    } catch (_) {}
  }, [quoteState, activeStep, draftHydrated]);

  // ── 2. Cálculo de Precios reactivo
  const pricing = useMemo(() => {
    const base = calculateQuotePricing(
      {
        admin_roles: quoteState.configuration.admin_roles,
        end_customers_tier: quoteState.configuration.end_customers_tier,
        interfaces: quoteState.configuration.interfaces,
        data_and_apis: quoteState.configuration.data_and_apis,
        commitment_plan: quoteState.commitment_plan
      },
      pricingConfig
    );

    if (!tarifaSocio) {
      const traditionalRolesTotal = base.totalAdminUsers * unitTradPrice;
      const traditionalMonthly = traditionalRolesTotal + base.monthlyCustomersExtra + base.monthlyInterfaces + base.monthlyDataAndApis;
      return {
        ...base,
        monthlyRolesBase: traditionalRolesTotal,
        monthlyTotal: traditionalMonthly,
        dailyEquivalent: Number((traditionalMonthly / 30).toFixed(2)),
        setupFee: tradSetupFee,
        setupFeeSavings: 0
      };
    }

    return base;
  }, [quoteState, tarifaSocio, pricingConfig, unitTradPrice, tradSetupFee]);

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
    if (!privacyAccepted) {
      setValidationError('Debes leer y aceptar la Política de Privacidad para recibir tu cotización.');
      return;
    }

    const acceptedAt = new Date().toISOString();
    const quoteId = generateQuoteId();
    const payload = {
      quote_id: quoteId,
      formalia_session_id: preloadedFormaliaData?.formalia_session_id || null,
      web_blueprint_id: preloadedFormaliaData?.web_blueprint_id || null,
      user_email: quoteState.lead_contact?.email || currentUser?.email || null,
      user_id: currentUser?.id || null,
      timestamp: acceptedAt,
      privacy_policy_accepted: true,
      privacy_policy_version: PRIVACY_POLICY_VERSION,
      accepted_at: acceptedAt,
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
    <section id="cotizador" className="w-full py-20 lg:py-28 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-mono mb-3">
            <span className="font-semibold">COTIZADOR INTERACTIVO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
            Diseña tu sistema operativo sin sorpresas.
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Transparencia radical: calcula el valor exacto de tu software a{' '}
            <strong className="text-[var(--text-primary)]">$1 USD al día por rol</strong> y recibe una propuesta formal en minutos.
          </p>
        </div>

        {/* Banner Ruta Guiada o Precarga desde FORMALIA (SDD Sección 2.1 y 5) */}
        {isPreloadedFromFormalia ? (
          <div className="mb-6 p-3.5 rounded-[10px] bg-[var(--accent-soft)] border border-[#FFC93C] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)]">
              <Sparkles size={16} className="text-[var(--accent-text)] shrink-0" />
              <span>
                <strong>
                  {preloadedFormaliaData?.web_blueprint_id
                    ? `Solución Web (${preloadedFormaliaData.web_blueprint_id}) y roles precargados desde FORMALIA.`
                    : 'Configuración precargada desde tu mapa en FORMALIA.'}
                </strong>{' '}
                Puedes ajustar cualquier rol o módulo libremente.
              </span>
            </div>
            <a
              href="/formalia"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/formalia');
                }
              }}
              className="text-xs font-medium text-[var(--accent-text)] hover:underline whitespace-nowrap"
            >
              Volver a editar en FORMALIA →
            </a>
          </div>
        ) : (
          <div className="mb-6 p-3.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
              <Sparkles size={15} className="text-[var(--accent-text)] shrink-0" />
              <span>
                ¿No estás seguro de qué roles o módulos necesitas? Deja que{' '}
                <strong className="text-[var(--text-primary)]">FORMALIA</strong> mapee tu operación y llene esto por ti.
              </span>
            </div>
            <a
              href="/formalia"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/formalia');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--bg-silver)] hover:bg-[var(--bg-silver-hover)] border border-[var(--border-silver)] text-[var(--text-on-silver)] text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <span>Mapea tu negocio gratis con FORMALIA</span>
              <ArrowRight size={13} />
            </a>
          </div>
        )}

        {/* Indicador de Progreso Minimalista (4 Pasos) */}
        <div className="mb-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[8px] p-2 sm:p-3">
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
                      ? 'bg-[#FFC93C] text-[#2B2D31] font-semibold'
                      : isPast
                      ? 'bg-[var(--bg-subtle)] border border-[#FFC93C]/40 text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    isActive
                      ? 'bg-[#2B2D31] text-[#FFC93C] font-bold'
                      : isPast
                      ? 'bg-[#FFC93C] text-[#2B2D31] font-bold'
                      : 'bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
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
          <div className="mb-6 p-4 rounded-[6px] bg-red-500/15 border border-red-400/40 text-[var(--text-primary)] text-xs flex items-center gap-2">
            <AlertTriangle size={16} strokeWidth={1.75} className="shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Split-Screen: 65% Izquierda (Wizard Gray) / 35% Derecha (Sticky Summary Silver) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: 65% (8/12 cols) */}
          <div className="lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[10px] p-6 sm:p-8">
            {/* PASO 1: TU NEGOCIO */}
            {activeStep === 1 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">1. Contexto de tu Negocio</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Indícanos tu rubro para pre-configurar los módulos ideales.</p>
                </div>

                {/* Nombre de la empresa */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-2">
                    Nombre de tu empresa, cooperativa o colectivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={quoteState.business_discovery.company_name}
                    onChange={(e) => handleUpdateDiscovery('company_name', e.target.value)}
                    placeholder="Ej. Distribuidora Santa María SAC"
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-strong)] focus:border-[#FFC93C] focus:outline-hidden rounded-[6px] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>

                {/* Selector de Rubro */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
                              ? 'bg-[var(--bg-subtle)] border-[#FFC93C]'
                              : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#FFC93C] text-[#2B2D31]' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                          }`}>
                            <IconComp size={16} strokeWidth={1.6} />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-[var(--text-primary)] leading-tight mb-0.5">
                              {ind.name}
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] leading-tight block">
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
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
                              ? 'bg-[var(--bg-subtle)] border-[#FFC93C]'
                              : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <span className="block text-xs font-semibold text-[var(--text-primary)] mb-1">{m.name}</span>
                          <span className="text-[11px] text-[var(--text-secondary)] leading-tight block">{m.desc}</span>
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
                        className="w-full bg-[var(--bg-page)] border border-[#FFC93C] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                  )}
                </div>

                {/* Cuello de Botella con opción de Otro */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
                              ? 'bg-[var(--bg-subtle)] border-[#FFC93C]'
                              : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#FFC93C]' : 'bg-[var(--border-strong)]'}`}></span>
                            <div>
                              <span className="text-xs font-semibold text-[var(--text-primary)] block">{p.name}</span>
                              <span className="text-[11px] text-[var(--text-secondary)]">{p.desc}</span>
                            </div>
                          </div>
                          {isSelected && <Check size={14} strokeWidth={2.25} className="text-[var(--accent-text)]" />}
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
                        className="w-full bg-[var(--bg-page)] border border-[#FFC93C] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                  )}
                </div>

                {/* Botón Siguiente */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Continuar a Roles</span>
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: ROLES DE TU EQUIPO */}
            {activeStep === 2 && (
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">2. Roles de tu Equipo</h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Costo base: <strong className="text-[var(--text-primary)] font-mono">$1 USD/día ($30/mes)</strong> por rol administrativo activo.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[var(--text-secondary)] block">Total Roles</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-[var(--accent-text)]">
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
                            ? 'bg-[var(--bg-subtle)] border-[#FFC93C]'
                            : 'bg-[var(--bg-page)] border-[var(--border-subtle)]'
                        }`}
                      >
                        <div className="max-w-md">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[var(--text-primary)]">{role.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                              ${unitSocioPrice}/mes
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{role.desc}</p>
                        </div>

                        {/* Contador */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleRoleCountChange(role.id, -1)}
                            disabled={count === 0}
                            className="w-8 h-8 rounded-[4px] border border-[var(--border-strong)] bg-[var(--bg-page)] hover:bg-[var(--bg-subtle)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[var(--text-primary)] transition-colors cursor-pointer"
                          >
                            <Minus size={13} strokeWidth={2} />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-sm text-[var(--text-primary)] tabular-nums">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRoleCountChange(role.id, 1)}
                            className="w-8 h-8 rounded-[4px] border border-[#FFC93C] bg-[#FFC93C] hover:bg-[#FFD561] flex items-center justify-center text-[#2B2D31] transition-colors cursor-pointer"
                          >
                            <Plus size={13} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botones de Navegación */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Continuar a Canales</span>
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: CANALES Y CLIENTES */}
            {activeStep === 3 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">3. Canales e Interfaces</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Define los puntos de contacto con tus clientes y almacenamiento de datos.</p>
                </div>

                {/* Clientes Finales */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
                              ? 'bg-[var(--bg-subtle)] border-[#FFC93C]'
                              : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[var(--text-primary)]">{tier.name}</span>
                            <span className="text-xs font-mono font-bold text-[var(--accent-text)] tabular-nums">
                              {tier.monthlyPrice === 0 ? 'Incluido' : `+$${tier.monthlyPrice}/mes`}
                            </span>
                          </div>
                          <span className="text-[11px] text-[var(--text-secondary)]">{tier.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interfaces Adicionales */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
                              ? 'bg-[var(--bg-subtle)] border-[#FFC93C]'
                              : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-[var(--text-primary)]">{opt.name}</span>
                              {isRequired && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent-border)] rounded">
                                  Base Obligatoria
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)]">{opt.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono font-bold text-[var(--accent-text)] tabular-nums">
                              {opt.monthlyPrice === 0 ? '$0' : `+$${opt.monthlyPrice}/mes`}
                            </span>
                            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                              isChecked ? 'bg-[#FFC93C] border-[#FFC93C] text-[#2B2D31]' : 'border-[var(--border-strong)] bg-[var(--bg-page)]'
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
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
                              ? 'bg-[var(--bg-subtle)] border-[#FFC93C]'
                              : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-[var(--text-primary)] block mb-0.5">{pkg.name}</span>
                            <p className="text-[11px] text-[var(--text-secondary)]">{pkg.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono font-bold text-[var(--accent-text)] tabular-nums">
                              {pkg.monthlyPrice === 0 ? '$0' : `+$${pkg.monthlyPrice}/mes`}
                            </span>
                            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                              isChecked ? 'bg-[#FFC93C] border-[#FFC93C] text-[#2B2D31]' : 'border-[var(--border-strong)] bg-[var(--bg-page)]'
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
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Continuar a Modalidad</span>
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: MODALIDAD Y ENVÍO */}
            {activeStep === 4 && (
              <form onSubmit={handleFinalSubmit} className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">4. Modalidad y Datos de Envío</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Elige tu tipo de compromiso y recibe tu propuesta técnica.</p>
                </div>

                {/* Modalidad de Compromiso */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-2.5">
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
                              ? 'bg-[var(--bg-subtle)] border-2 border-[#FFC93C]'
                              : 'bg-[var(--bg-page)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          {isRecommended && (
                            <span className="absolute -top-2.5 right-3 bg-[#FFC93C] text-[#2B2D31] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                              $0 SETUP
                            </span>
                          )}
                          <span className="block text-xs font-bold text-[var(--text-primary)] mb-1">{mode.name}</span>
                          <span className="text-xs font-mono font-bold text-[var(--accent-text)] block mb-2 tabular-nums">
                            {mode.setupPrice === 0 ? 'Setup: $0 USD' : `Setup: $${mode.setupPrice} USD (pago único)`}
                          </span>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{mode.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Datos de Contacto */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-4">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">¿A quién enviamos la cotización?</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Tu nombre completo *</label>
                      <input
                        type="text"
                        required
                        value={quoteState.lead_contact.name}
                        onChange={(e) => setQuoteState(p => ({ ...p, lead_contact: { ...p.lead_contact, name: e.target.value } }))}
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-[var(--bg-page)] border border-[var(--border-strong)] focus:border-[#FFC93C] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[var(--text-secondary)] mb-1">WhatsApp de contacto *</label>
                      <input
                        type="tel"
                        required
                        value={quoteState.lead_contact.whatsapp}
                        onChange={(e) => setQuoteState(p => ({ ...p, lead_contact: { ...p.lead_contact, whatsapp: e.target.value } }))}
                        placeholder="Ej. +51 987 654 321"
                        className="w-full bg-[var(--bg-page)] border border-[var(--border-strong)] focus:border-[#FFC93C] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Correo electrónico (opcional)</label>
                    <input
                      type="email"
                      value={quoteState.lead_contact.email}
                      onChange={(e) => setQuoteState(p => ({ ...p, lead_contact: { ...p.lead_contact, email: e.target.value } }))}
                      placeholder="nombre@empresa.com"
                      className="w-full bg-[var(--bg-page)] border border-[var(--border-strong)] focus:border-[#FFC93C] focus:outline-hidden rounded-[6px] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                  </div>

                  {/* Checkbox obligatorio Política de Privacidad (SDD Pilar 1) */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-[var(--text-primary)] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="quote-privacy-checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => {
                          setPrivacyAccepted(e.target.checked);
                          if (e.target.checked && validationError) setValidationError('');
                        }}
                        required
                        className="w-4 h-4 mt-0.5 rounded border-[var(--border-strong)] accent-[#FFC93C] shrink-0 cursor-pointer"
                      />
                      <span className="leading-relaxed">
                        He leído y acepto la{' '}
                        <a
                          href="/legal/privacidad"
                          onClick={(e) => {
                            if (onNavigate) {
                              e.preventDefault();
                              onNavigate('/legal/privacidad');
                            }
                          }}
                          className="text-[var(--accent-text)] font-semibold underline decoration-[#FFC93C] underline-offset-2"
                        >
                          Política de Privacidad
                        </a>{' '}
                        para recibir mi cotización.
                      </span>
                    </label>
                  </div>
                </div>

                {successQuote && (
                  <div className="p-4 rounded-[8px] border border-emerald-500/40 bg-emerald-500/15 flex items-start gap-3 text-xs">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-primary)] block">
                        Cotización {successQuote.quote_id} generada y consentimiento registrado (v.{successQuote.privacy_policy_version}).
                      </strong>
                      <span className="text-[var(--text-secondary)]">
                        Si no se abrió WhatsApp automáticamente, puedes volver a pulsar el botón de envío.
                      </span>
                    </div>
                  </div>
                )}

                {/* Botones de Navegación */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} strokeWidth={1.5} />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!privacyAccepted}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] disabled:opacity-45 disabled:cursor-not-allowed text-[#2B2D31] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <MessageSquare size={14} strokeWidth={1.75} />
                    <span>Enviar Cotización por WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Columna Derecha: 35% (4/12 cols) - Sticky Summary en Silver #D9DADC */}
          <div className="lg:col-span-4 sticky top-20 bg-[var(--bg-silver)] border border-[var(--border-silver)] text-[var(--text-on-silver)] rounded-[10px] p-6 flex flex-col gap-6">
            {/* Header del Resumen + Switch Tarifa Socio */}
            <div className="pb-4 border-b border-[var(--border-silver)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[var(--text-on-silver)] uppercase tracking-wider">
                  Resumen en Tiempo Real
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reiniciar cotizador"
                  className="text-[var(--text-secondary-on-silver)] hover:text-[var(--text-on-silver)] p-1 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} strokeWidth={1.75} />
                </button>
              </div>

              {/* Switch Tarifa Socio */}
              <div className="p-2.5 rounded-[6px] bg-[#2B2D31]/10 border border-[var(--border-silver)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tarifaSocioSwitch"
                    checked={tarifaSocio}
                    onChange={(e) => setTarifaSocio(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer accent-[#2B2D31]"
                  />
                  <label htmlFor="tarifaSocioSwitch" className="text-xs font-semibold text-[var(--text-on-silver)] cursor-pointer">
                    Tarifa Socio (${dailySocioLabel}/día)
                  </label>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    tarifaSocio
                      ? 'bg-[#2B2D31] text-[#FFC93C]'
                      : 'bg-[var(--bg-page)]/20 text-[var(--text-on-silver)]'
                  }`}
                >
                  {tarifaSocio ? 'ACTIVA' : 'INACTIVA'}
                </span>
              </div>
            </div>

            {/* Precios Principales (Tabular Nums - Cero CLS) */}
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs text-[var(--text-secondary-on-silver)] font-medium">Mensualidad Total</span>
                {!tarifaSocio && (
                  <span className="text-xs font-mono text-[var(--text-secondary-on-silver)] line-through">
                    ${(pricing.monthlyTotal * 0.45).toFixed(0)} USD
                  </span>
                )}
                {tarifaSocio && (
                  <span className="text-xs font-mono text-[var(--text-secondary-on-silver)] line-through">
                    ${(pricing.totalAdminUsers * unitTradPrice) + (pricing.monthlyCustomersExtra + pricing.monthlyInterfaces + pricing.monthlyDataAndApis)} USD
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-[var(--text-on-silver)]">
                  ${pricing.monthlyTotal} USD
                </span>
                <span className="text-xs text-[var(--text-secondary-on-silver)]">/ mes</span>
              </div>

              <div className="inline-flex items-center px-2 py-0.5 rounded bg-[#2B2D31] text-[#FFC93C] text-xs font-mono tabular-nums font-semibold">
                ≈ ${pricing.dailyEquivalent} USD al día
              </div>
            </div>

            {/* Setup Fee */}
            <div className="p-3 rounded-[6px] bg-[#2B2D31] text-[#D9DADC] border border-[#2B2D31]/20 flex items-center justify-between text-xs">
              <span className="text-[#B8BAC0]">Implementación (Setup):</span>
              <div className="flex items-center gap-2 font-mono tabular-nums">
                {pricing.setupFeeSavings > 0 && (
                  <span className="text-[#9699A1] line-through">${tradSetupFee} USD</span>
                )}
                <span className={`font-bold ${pricing.setupFee === 0 ? 'text-[#FFC93C]' : 'text-[#D9DADC]'}`}>
                  ${pricing.setupFee} USD
                </span>
              </div>
            </div>

            {/* Desglose de Configuración */}
            <div className="pt-2 flex flex-col gap-2 text-xs text-[var(--text-secondary-on-silver)]">
              <div className="flex justify-between">
                <span>Roles administrativos ({pricing.totalAdminUsers}):</span>
                <span className="font-mono tabular-nums text-[var(--text-on-silver)] font-semibold">
                  ${pricing.monthlyRolesBase} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span>Clientes e infraestructura:</span>
                <span className="font-mono tabular-nums text-[var(--text-on-silver)] font-semibold">
                  ${pricing.monthlyCustomersExtra + pricing.monthlyInterfaces + pricing.monthlyDataAndApis} USD
                </span>
              </div>
            </div>

            {/* Caja Discreta de Beneficios Incluidos */}
            <div className="pt-4 border-t border-[var(--border-silver)] flex flex-col gap-2">
              <span className="text-[11px] font-mono font-bold text-[var(--text-on-silver)] uppercase tracking-wider">
                Garantías de la Alianza
              </span>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary-on-silver)]">
                <span className="w-4 h-4 rounded-full bg-[#2B2D31] text-[#FFC93C] flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={2.5} />
                </span>
                <span>Base de datos 100% propia (SQLite/Postgres)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary-on-silver)]">
                <span className="w-4 h-4 rounded-full bg-[#2B2D31] text-[#FFC93C] flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={2.5} />
                </span>
                <span>Arquitectura Offline-First sin cortes</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary-on-silver)]">
                <span className="w-4 h-4 rounded-full bg-[#2B2D31] text-[#FFC93C] flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={2.5} />
                </span>
                <span>Soporte continuo y sin costo por hora</span>
              </div>
            </div>

            {/* Botón de Acción Principal (10% Yellow #FFC93C Call-to-Click) */}
            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="w-full py-2.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] border border-[#2B2D31]/15 text-[#2B2D31] text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
              >
                Completar y Enviar Cotización
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!privacyAccepted}
                className="w-full py-2.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] disabled:opacity-45 disabled:cursor-not-allowed border border-[#2B2D31]/15 text-[#2B2D31] text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
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
