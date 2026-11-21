import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
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

const STORAGE_KEY = 'pathrimonio_quote_wizard_v1';
const PATHRIMONIO_WHATSAPP_NUMBER = '51950293223'; // Número oficial de asesoría técnica Pathrimonio

export default function InteractiveEstimator({ onOpenContact }) {
  // ── 1. Estado inicial persistente
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
        main_pain_point: 'desorden_en_despachos_y_caja'
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
  const [successQuote, setSuccessQuote] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Guardar en localStorage reactivamente
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...quoteState, currentStep: activeStep }));
    } catch (_) {}
  }, [quoteState, activeStep]);

  // ── 2. Cálculo en tiempo real del motor de precios
  const pricing = useMemo(() => {
    return calculateQuotePricing({
      admin_roles: quoteState.configuration.admin_roles,
      end_customers_tier: quoteState.configuration.end_customers_tier,
      interfaces: quoteState.configuration.interfaces,
      data_and_apis: quoteState.configuration.data_and_apis,
      commitment_plan: quoteState.commitment_plan
    });
  }, [quoteState]);

  // ── 3. Manejadores de cambios
  const handleUpdateDiscovery = (field, value) => {
    setQuoteState(prev => {
      const updatedDiscovery = { ...prev.business_discovery, [field]: value };
      
      // Si cambia de rubro, podemos auto-sugerir roles si el usuario está en el paso 1
      if (field === 'industry') {
        const indObj = INDUSTRIES.find(i => i.id === value);
        if (indObj && indObj.suggestedRoles) {
          const newRoles = indObj.suggestedRoles.map(rId => ({ role: rId, count: 1 }));
          return {
            ...prev,
            business_discovery: updatedDiscovery,
            configuration: {
              ...prev.configuration,
              admin_roles: newRoles
            }
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

  const handleApplyIndustrySuggestedRoles = () => {
    const indObj = INDUSTRIES.find(i => i.id === quoteState.business_discovery.industry);
    if (!indObj) return;
    const newRoles = indObj.suggestedRoles.map(rId => ({ role: rId, count: 1 }));
    setQuoteState(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        admin_roles: newRoles
      }
    }));
  };

  const handleToggleInterface = (interfaceId) => {
    if (interfaceId === 'web_operativa') return; // Siempre fija
    setQuoteState(prev => {
      const current = prev.configuration.interfaces || [];
      const updated = current.includes(interfaceId)
        ? current.filter(i => i !== interfaceId)
        : [...current, interfaceId];
      return {
        ...prev,
        configuration: {
          ...prev.configuration,
          interfaces: updated
        }
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
        configuration: {
          ...prev.configuration,
          data_and_apis: updated
        }
      };
    });
  };

  const handleCustomerTierChange = (tierId) => {
    setQuoteState(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        end_customers_tier: tierId
      }
    }));
  };

  const handleCommitmentChange = (modeId) => {
    setQuoteState(prev => ({
      ...prev,
      commitment_plan: modeId
    }));
  };

  const handleLeadContactChange = (field, value) => {
    setQuoteState(prev => ({
      ...prev,
      lead_contact: {
        ...prev.lead_contact,
        [field]: value
      }
    }));
  };

  // ── 4. Navegación de Pasos con Validaciones
  const goToStep = (stepNumber) => {
    setValidationError('');
    
    // Validación Paso 2 -> 3: Bloqueo de 0 roles
    if (activeStep === 2 && stepNumber > 2) {
      if (pricing.totalAdminUsers === 0) {
        setValidationError('Debes seleccionar al menos 1 rol administrativo para continuar.');
        return;
      }
    }

    setActiveStep(stepNumber);
    // En mobile, hacer scroll hacia la cabecera del cotizador
    const element = document.getElementById('cotizador-wizard');
    if (element && window.innerWidth < 1024) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetQuote = () => {
    if (window.confirm('¿Deseas reiniciar la cotización y volver a los valores iniciales?')) {
      const defaultState = {
        currentStep: 1,
        business_discovery: {
          company_name: '',
          industry: 'logistica_transporte',
          current_method: 'excel_y_whatsapp',
          main_pain_point: 'desorden_en_despachos_y_caja'
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
      setQuoteState(defaultState);
      setActiveStep(1);
      setValidationError('');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // ── 5. Envío y Generación de Payload
  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();
    setValidationError('');

    if (!quoteState.lead_contact.name.trim()) {
      setValidationError('Por favor ingresa tu nombre completo o de contacto.');
      return;
    }
    if (!quoteState.lead_contact.whatsapp.trim()) {
      setValidationError('Por favor ingresa tu número de WhatsApp para enviarte la propuesta.');
      return;
    }

    const quoteId = generateQuoteId();
    const payload = {
      quote_id: quoteId,
      timestamp: new Date().toISOString(),
      business_discovery: {
        company_name: quoteState.business_discovery.company_name || 'Sin nombre especificado',
        industry: quoteState.business_discovery.industry,
        current_method: quoteState.business_discovery.current_method,
        main_pain_point: quoteState.business_discovery.main_pain_point
      },
      configuration: {
        admin_roles: quoteState.configuration.admin_roles,
        total_admin_users: pricing.totalAdminUsers,
        end_customers_tier: quoteState.configuration.end_customers_tier,
        interfaces: quoteState.configuration.interfaces,
        data_and_apis: quoteState.configuration.data_and_apis,
        custom_requirements_note: quoteState.configuration.custom_requirements_note
      },
      pricing_summary: {
        commitment_plan: quoteState.commitment_plan,
        currency: 'USD',
        monthly_total: pricing.monthlyTotal,
        daily_equivalent: pricing.dailyEquivalent,
        setup_fee: pricing.setupFee,
        setup_fee_savings: pricing.setupFeeSavings,
        is_enterprise: pricing.isEnterprise
      },
      lead_contact: {
        name: quoteState.lead_contact.name,
        whatsapp: quoteState.lead_contact.whatsapp,
        email: quoteState.lead_contact.email || ''
      }
    };

    // Guardar en histórico local
    try {
      const history = JSON.parse(localStorage.getItem('pathrimonio_quotes_history') || '[]');
      history.unshift(payload);
      localStorage.setItem('pathrimonio_quotes_history', JSON.stringify(history.slice(0, 15)));
    } catch (_) {}

    setSuccessQuote(payload);

    // Efecto Confetti de celebración
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}
  };

  const handleCopyPayload = () => {
    if (!successQuote) return;
    navigator.clipboard.writeText(JSON.stringify(successQuote, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadJSON = () => {
    if (!successQuote) return;
    const blob = new Blob([JSON.stringify(successQuote, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizacion_pathrimonio_${successQuote.quote_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openWhatsAppProposal = () => {
    if (!successQuote) return;
    const encodedMsg = formatWhatsAppMessage(successQuote);
    const url = `https://wa.me/${PATHRIMONIO_WHATSAPP_NUMBER}?text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  // Roles seleccionados actualmente para lectura rápida
  const selectedRolesMap = useMemo(() => {
    const map = {};
    (quoteState.configuration.admin_roles || []).forEach(r => {
      map[r.role] = r.count;
    });
    return map;
  }, [quoteState.configuration.admin_roles]);

  return (
    <section id="cotizador" className="w-full py-20 lg:py-28 bg-surface-container-lowest border-y border-outline-variant/60 relative">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-10">
        
        {/* Header de Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-space text-xs font-bold uppercase tracking-wider w-fit">
              <span className="material-symbols-outlined text-[16px]">calculate</span>
              <span>Cotizador Interactivo • Transparencia Total</span>
              <span className="bg-primary text-on-primary px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">$1/día por rol</span>
            </div>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl text-white font-bold tracking-tight">
              Diseña tu Sistema Operativo en 4 Pasos
            </h2>
            <p className="font-jakarta text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Sin jerga técnica ni cotizaciones infladas. Calcula la inversión exacta para tu negocio con una base simple: <strong className="text-white">$1 USD al día por rol administrativo</strong> y añade canales según crezca tu operación.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetQuote}
              title="Reiniciar a valores predeterminados"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-surface-container border border-outline-variant hover:border-primary/40 text-on-surface-variant hover:text-white font-space text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
            <div className="px-3.5 py-2 rounded bg-surface-container-high border border-outline-variant text-right">
              <span className="block font-space text-[10px] uppercase tracking-wider text-on-surface-variant">Infraestructura</span>
              <span className="block font-space text-xs text-white font-semibold">100% Gestionada en Cloud</span>
            </div>
          </div>
        </div>

        {/* Wizard Stepper Tabs */}
        <div id="cotizador-wizard" className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-surface-container p-1.5 rounded-xl border border-outline-variant">
          {[
            { step: 1, label: '1. Tu Negocio', sub: 'Discovery operativo', icon: 'store' },
            { step: 2, label: '2. Roles de tu Equipo', sub: '$1/día por rol', icon: 'group' },
            { step: 3, label: '3. Clientes & Canales', sub: 'Escala e interfaces', icon: 'hub' },
            { step: 4, label: '4. Modalidad & Envío', sub: 'Propuesta y cierre', icon: 'send' }
          ].map(tab => {
            const isActive = activeStep === tab.step;
            const isCompleted = activeStep > tab.step;
            return (
              <button
                key={tab.step}
                onClick={() => goToStep(tab.step)}
                className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-surface-container-highest border border-primary/40 text-white shadow-sm'
                    : isCompleted
                    ? 'text-white hover:bg-surface-container-high/60'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high/40'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-space text-xs font-bold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-glow-amber'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-space text-xs font-bold truncate ${isActive ? 'text-primary' : 'text-white'}`}>
                    {tab.label}
                  </span>
                  <span className="font-jakarta text-[11px] text-on-surface-variant truncate">
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Alerta de Validación */}
        {validationError && (
          <div className="p-3.5 rounded-lg bg-error-container/40 border border-error/50 text-error flex items-center gap-2.5 font-jakarta text-xs animate-shake">
            <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            SPLIT-SCREEN: 65% ASISTENTE WIZARD / 35% STICKY SUMMARY
        ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA (65%): ASISTENTE */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* ── PASO 1: TU NEGOCIO ── */}
            {activeStep === 1 && (
              <div className="bg-surface-container border border-outline-variant rounded-xl p-6 sm:p-8 flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
                  <span className="font-space text-xs font-bold text-primary uppercase tracking-wider">
                    Paso 1 de 4 • Perfil Operativo
                  </span>
                  <h3 className="font-space text-2xl text-white font-bold">
                    Cuéntanos sobre tu negocio y operación actual
                  </h3>
                  <p className="font-jakarta text-xs text-on-surface-variant">
                    Esto nos permite sugerir los roles internos y módulos que realmente necesitas para automatizar tu día a día.
                  </p>
                </div>

                {/* Nombre de la empresa */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                    Nombre de tu Empresa o Proyecto (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Distribuidora del Norte SAC, Clínica Dental San Lucas..."
                    value={quoteState.business_discovery.company_name}
                    onChange={(e) => handleUpdateDiscovery('company_name', e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant focus:border-primary px-4 py-2.5 rounded-lg text-white font-jakarta text-sm outline-none transition-colors"
                  />
                </div>

                {/* Rubro / Industria */}
                <div className="flex flex-col gap-2.5">
                  <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                    Rubro o Sector de tu Negocio
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INDUSTRIES.map(ind => {
                      const isSelected = quoteState.business_discovery.industry === ind.id;
                      return (
                        <div
                          key={ind.id}
                          onClick={() => handleUpdateDiscovery('industry', ind.id)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-white shadow-sm'
                              : 'bg-surface-container-highest/60 border-outline-variant/80 hover:border-primary/40 text-on-surface-variant hover:text-white'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            <span className="material-symbols-outlined text-[20px]">{ind.icon}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-space text-xs font-bold text-white flex items-center gap-1.5">
                              {ind.name}
                              {isSelected && <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>}
                            </span>
                            <span className="font-jakarta text-[11px] text-on-surface-variant leading-tight mt-0.5">
                              {ind.tagline}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Banner de roles sugeridos para este rubro */}
                <div className="p-3.5 rounded-lg bg-surface-container-high border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                    <p className="font-jakarta text-xs text-white">
                      Para este rubro preparamos una plantilla sugerida de roles.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyIndustrySuggestedRoles}
                    className="px-3 py-1.5 rounded bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-space text-[11px] font-bold uppercase transition-colors shrink-0"
                  >
                    Cargar Roles Sugeridos
                  </button>
                </div>

                {/* Herramienta Actual */}
                <div className="flex flex-col gap-2.5">
                  <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                    ¿Cómo gestionas tu operación hoy en día?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CURRENT_METHODS.map(method => {
                      const isSelected = quoteState.business_discovery.current_method === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => handleUpdateDiscovery('current_method', method.id)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-white'
                              : 'bg-surface-container-highest/60 border-outline-variant/80 hover:border-primary/40 text-on-surface-variant hover:text-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            <span className="material-symbols-outlined text-[18px]">{method.icon}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-space text-xs font-bold text-white">
                              {method.name}
                            </span>
                            <span className="font-jakarta text-[11px] text-on-surface-variant leading-tight mt-0.5">
                              {method.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cuello de botella principal */}
                <div className="flex flex-col gap-2.5">
                  <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                    ¿Cuál es tu mayor cuello de botella o dolor actual?
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {PAIN_POINTS.map(pain => {
                      const isSelected = quoteState.business_discovery.main_pain_point === pain.id;
                      return (
                        <div
                          key={pain.id}
                          onClick={() => handleUpdateDiscovery('main_pain_point', pain.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-white'
                              : 'bg-surface-container-highest/60 border-outline-variant/80 hover:border-primary/40 text-on-surface-variant hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                              {pain.icon}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-space text-xs font-bold text-white">{pain.name}</span>
                              <span className="font-jakarta text-[11px] text-on-surface-variant">{pain.desc}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-primary bg-primary text-on-primary' : 'border-outline'
                          }`}>
                            {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botón avanzar paso 1 */}
                <div className="flex justify-end pt-4 border-t border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-glow-amber hover:shadow-glow-amber-lg transition-all"
                  >
                    <span>Configurar Roles ($1/día)</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── PASO 2: ROLES DE TU EQUIPO ── */}
            {activeStep === 2 && (
              <div className="bg-surface-container border border-outline-variant rounded-xl p-6 sm:p-8 flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-space text-xs font-bold text-primary uppercase tracking-wider">
                      Paso 2 de 4 • Motor de Precios Base
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      $1 USD/día = $30 USD/mes por usuario
                    </span>
                  </div>
                  <h3 className="font-space text-2xl text-white font-bold">
                    Define los roles y accesos de tu equipo
                  </h3>
                  <p className="font-jakarta text-xs text-on-surface-variant">
                    Cada usuario administrativo tiene interfaz web operativa propia, permisos delimitados y registro de auditoría. Mínimo 1 rol obligatorio.
                  </p>
                </div>

                {/* Sub-resumen de usuarios */}
                <div className="p-4 rounded-lg bg-surface-container-high border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">badge</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-space text-sm font-bold text-white">
                        {pricing.totalAdminUsers} Usuario(s) Administrativo(s) Activo(s)
                      </span>
                      <span className="font-jakarta text-xs text-on-surface-variant">
                        Costo base mensual: <strong className="text-primary font-mono">${pricing.monthlyRolesBase} USD/mes</strong> (${pricing.totalAdminUsers} USD/día)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyIndustrySuggestedRoles}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-highest border border-outline-variant text-primary font-space text-[11px] font-bold uppercase transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>Re-aplicar Plantilla de Rubro</span>
                  </button>
                </div>

                {/* Bloqueo visual de 0 roles */}
                {pricing.totalAdminUsers === 0 && (
                  <div className="p-3 rounded-lg bg-error-container/40 border border-error/50 text-error flex items-center gap-2 font-jakarta text-xs">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span><strong>Bloqueo activo:</strong> Debes añadir al menos 1 usuario para avanzar al Paso 3.</span>
                  </div>
                )}

                {/* Grid de Roles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ADMIN_ROLES.map(role => {
                    const count = selectedRolesMap[role.id] || 0;
                    const isSelected = count > 0;

                    return (
                      <div
                        key={role.id}
                        className={`p-4 rounded-lg border transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-surface-container-highest border-primary/50 text-white shadow-sm'
                            : 'bg-surface-container-highest/40 border-outline-variant hover:border-outline text-on-surface-variant'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                            }`}>
                              <span className="material-symbols-outlined text-[18px]">{role.icon}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-space text-xs font-bold text-white">
                                {role.name}
                              </span>
                              <span className="text-[10px] font-mono text-primary font-semibold">
                                {role.badge}
                              </span>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono font-bold text-white bg-surface-container px-2 py-0.5 rounded border border-outline-variant shrink-0">
                            ${role.monthlyPrice}/mes
                          </span>
                        </div>

                        <p className="font-jakarta text-[11px] text-on-surface-variant leading-relaxed">
                          {role.desc}
                        </p>

                        {/* Selector de cantidad (+ / -) */}
                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
                          <span className="font-space text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                            Usuarios asignados:
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRoleCountChange(role.id, -1)}
                              disabled={count === 0}
                              className={`w-7 h-7 rounded flex items-center justify-center border transition-colors ${
                                count > 0
                                  ? 'bg-surface-container hover:bg-surface-container-high border-outline-variant text-white'
                                  : 'opacity-40 cursor-not-allowed border-outline-variant/40 text-on-surface-variant'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>

                            <span className="font-mono text-sm font-bold text-white w-6 text-center">
                              {count}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRoleCountChange(role.id, 1)}
                              className="w-7 h-7 rounded flex items-center justify-center bg-primary text-on-primary hover:bg-primary/90 font-bold shadow-sm transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botones de navegación Paso 2 */}
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Paso 1: Negocio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    disabled={pricing.totalAdminUsers === 0}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-space text-xs font-bold uppercase tracking-wider transition-all ${
                      pricing.totalAdminUsers > 0
                        ? 'bg-primary text-on-primary shadow-glow-amber hover:shadow-glow-amber-lg'
                        : 'opacity-50 cursor-not-allowed bg-surface-container-high text-on-surface-variant border border-outline-variant'
                    }`}
                  >
                    <span>Clientes e Interfaces</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── PASO 3: CLIENTES E INTERFACES ── */}
            {activeStep === 3 && (
              <div className="bg-surface-container border border-outline-variant rounded-xl p-6 sm:p-8 flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
                  <span className="font-space text-xs font-bold text-primary uppercase tracking-wider">
                    Paso 3 de 4 • Escala, Canales &amp; APIs
                  </span>
                  <h3 className="font-space text-2xl text-white font-bold">
                    Elige el volumen de clientes y canales adicionales
                  </h3>
                  <p className="font-jakarta text-xs text-on-surface-variant">
                    Diseña la arquitectura a tu medida: activa portales web de autoservicio, apps móviles, bots inteligentes o paquetes de datos.
                  </p>
                </div>

                {/* 1. Clientes Finales Activos */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                      Volumen de Clientes Finales Activos al Mes
                    </label>
                    <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Soft-cap: sin bloqueos de servidor
                    </span>
                  </div>

                  {/* Micro-copy educativo */}
                  <div className="p-3 rounded-lg bg-surface-container-high border border-outline-variant flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">info</span>
                    <p className="font-jakarta text-[11px] text-on-surface-variant">
                      <strong className="text-white">Garantía Pathrimonio:</strong> Si en un mes récord superas tu bloque de clientes, el sistema <em>nunca</em> se bloquea ni interrumpe la operación de tus clientes; solo se ajusta en tu siguiente ciclo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {END_CUSTOMER_TIERS.map(tier => {
                      const isSelected = quoteState.configuration.end_customers_tier === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => handleCustomerTierChange(tier.id)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-white shadow-sm'
                              : 'bg-surface-container-highest/60 border-outline-variant hover:border-primary/40 text-on-surface-variant hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-space text-xs font-bold text-white">
                              {tier.name}
                            </span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              tier.monthlyPrice === 0
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-surface-container text-primary border border-outline-variant'
                            }`}>
                              {tier.badge}
                            </span>
                          </div>

                          <p className="font-jakarta text-[11px] text-on-surface-variant leading-tight">
                            {tier.desc}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
                            <span className="font-mono text-xs font-bold text-white">
                              {tier.monthlyPrice === 0 ? '$0 USD (Base)' : `+$${tier.monthlyPrice} USD/mes`}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary text-on-primary' : 'border-outline'
                            }`}>
                              {isSelected && <span className="material-symbols-outlined text-[12px]">check</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interfaces Adicionales (Canales) */}
                <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/60">
                  <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                    Interfaces &amp; Canales Digitales Disponibles
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {INTERFACE_OPTIONS.map(opt => {
                      const isSelected = quoteState.configuration.interfaces.includes(opt.id);

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleToggleInterface(opt.id)}
                          className={`p-4 rounded-lg border transition-all flex flex-col justify-between gap-3 ${
                            opt.includedAlways
                              ? 'bg-emerald-500/5 border-emerald-500/30 cursor-default'
                              : isSelected
                              ? 'bg-primary/10 border-primary cursor-pointer shadow-sm'
                              : 'bg-surface-container-highest/60 border-outline-variant hover:border-outline cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                                opt.includedAlways
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : isSelected
                                  ? 'bg-primary text-on-primary'
                                  : 'bg-surface-container text-on-surface-variant'
                              }`}>
                                <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-space text-xs font-bold text-white">
                                  {opt.name}
                                </span>
                                <span className="text-[10px] font-mono text-primary font-semibold">
                                  {opt.tag}
                                </span>
                              </div>
                            </div>

                            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                              opt.includedAlways
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-surface-container text-white border-outline-variant'
                            }`}>
                              {opt.includedAlways ? 'Incluida ($0)' : `+$${opt.monthlyPrice}/mes`}
                            </span>
                          </div>

                          <p className="font-jakarta text-[11px] text-on-surface-variant leading-relaxed">
                            {opt.desc}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
                            <span className="font-jakarta text-[11px] text-on-surface-variant font-medium">
                              {opt.includedAlways ? 'Núcleo administrativo por defecto' : (isSelected ? 'Activado para tu cotización' : 'Click para activar')}
                            </span>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              opt.includedAlways
                                ? 'border-emerald-500 bg-emerald-500 text-on-primary'
                                : isSelected
                                ? 'border-primary bg-primary text-on-primary'
                                : 'border-outline'
                            }`}>
                              {(opt.includedAlways || isSelected) && (
                                <span className="material-symbols-outlined text-[14px]">check</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Paquetes de Datos e Integraciones */}
                <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/60">
                  <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                    Paquetes de Datos &amp; Integraciones
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DATA_AND_APIS_OPTIONS.map(pkg => {
                      const isSelected = quoteState.configuration.data_and_apis.includes(pkg.id);

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => handleToggleDataPackage(pkg.id)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-white shadow-sm'
                              : 'bg-surface-container-highest/60 border-outline-variant hover:border-outline text-on-surface-variant'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                            }`}>
                              <span className="material-symbols-outlined text-[16px]">{pkg.icon}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-space text-xs font-bold text-white flex items-center gap-1.5">
                                {pkg.name}
                                {pkg.isEnterpriseTrigger && (
                                  <span className="text-[9px] bg-amber-500/20 text-primary border border-primary/30 px-1 py-0.2 rounded font-mono font-bold">
                                    Enterprise
                                  </span>
                                )}
                              </span>
                              <span className="font-jakarta text-[11px] text-on-surface-variant leading-tight mt-0.5">
                                {pkg.desc}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-mono text-xs font-bold text-white">
                              {pkg.monthlyPrice > 0 ? `+$${pkg.monthlyPrice}/m` : 'A medida'}
                            </span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary text-on-primary' : 'border-outline'
                            }`}>
                              {isSelected && <span className="material-symbols-outlined text-[12px]">check</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regla Enterprise Visual Banner */}
                {pricing.isEnterprise && (
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-primary/40 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">corporate_fare</span>
                    <div className="flex flex-col gap-1">
                      <span className="font-space text-xs font-bold text-white uppercase tracking-wider">
                        Modalidad: Proyecto Enterprise &amp; A Medida Complejo
                      </span>
                      <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
                        Has configurado más de 15 roles, alto volumen de clientes o integración con hardware de planta. Tu cotización incluye este estimado referencial y el siguiente paso te permitirá agendar una <strong>evaluación técnica directa</strong> con nuestros ingenieros.
                      </p>
                    </div>
                  </div>
                )}

                {/* Botones de navegación Paso 3 */}
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Paso 2: Roles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-glow-amber hover:shadow-glow-amber-lg transition-all"
                  >
                    <span>Modalidad y Envío</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── PASO 4: MODALIDAD Y ENVÍO ── */}
            {activeStep === 4 && (
              <form onSubmit={handleFinalSubmit} className="bg-surface-container border border-outline-variant rounded-xl p-6 sm:p-8 flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4">
                  <span className="font-space text-xs font-bold text-primary uppercase tracking-wider">
                    Paso 4 de 4 • Cierre de Cotización
                  </span>
                  <h3 className="font-space text-2xl text-white font-bold">
                    Elige tu modalidad de compromiso y recibe tu propuesta
                  </h3>
                  <p className="font-jakarta text-xs text-on-surface-variant">
                    Configuración transparente. Ahorra el 100% del Setup Fee con la permanencia semestral recomendada.
                  </p>
                </div>

                {/* Selector de Modalidad (Permanencia 6 meses vs Sin permanencia) */}
                <div className="flex flex-col gap-3">
                  <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                    Modalidad de Implementación &amp; Setup Fee
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COMMITMENT_MODES.map(mode => {
                      const isSelected = quoteState.commitment_plan === mode.id;

                      return (
                        <div
                          key={mode.id}
                          onClick={() => handleCommitmentChange(mode.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                            isSelected
                              ? 'bg-surface-container-highest border-primary shadow-glow-amber text-white'
                              : 'bg-surface-container-highest/40 border-outline-variant hover:border-outline text-on-surface-variant'
                          }`}
                        >
                          {mode.setupPrice === 0 && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-on-primary font-space text-[10px] font-bold uppercase px-3 py-0.5 rounded-bl">
                              ¡100% Bonificado!
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <span className="font-space text-sm font-bold text-white flex items-center gap-2">
                              {mode.name}
                              <span className="text-[10px] font-mono text-primary font-semibold">
                                {mode.badge}
                              </span>
                            </span>
                            <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
                              {mode.desc}
                            </p>
                          </div>

                          {/* Precio del Setup Fee con ahorro resaltado */}
                          <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-space text-[10px] uppercase text-on-surface-variant font-semibold">
                                Costo de Implementación:
                              </span>
                              <div className="flex items-center gap-2">
                                {mode.setupPrice === 0 ? (
                                  <>
                                    <span className="line-through font-mono text-xs text-on-surface-variant">
                                      ${mode.originalSetupPrice} USD
                                    </span>
                                    <span className="font-mono text-base font-bold text-emerald-400">
                                      $0 USD
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-mono text-base font-bold text-white">
                                    ${mode.setupPrice} USD
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-primary bg-primary text-on-primary' : 'border-outline'
                            }`}>
                              {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formulario de Contacto del Lead */}
                <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/60">
                  <label className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                    Tus Datos para Enviar la Propuesta Formal
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-jakarta text-xs text-on-surface-variant">Nombre y Apellido *</span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carlos Mendoza"
                        value={quoteState.lead_contact.name}
                        onChange={(e) => handleLeadContactChange('name', e.target.value)}
                        className="bg-surface-container-highest border border-outline-variant focus:border-primary px-3.5 py-2 rounded-lg text-white font-jakarta text-xs outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="font-jakarta text-xs text-on-surface-variant">WhatsApp / Teléfono *</span>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. +51 999 888 777"
                        value={quoteState.lead_contact.whatsapp}
                        onChange={(e) => handleLeadContactChange('whatsapp', e.target.value)}
                        className="bg-surface-container-highest border border-outline-variant focus:border-primary px-3.5 py-2 rounded-lg text-white font-jakarta text-xs outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="font-jakarta text-xs text-on-surface-variant">Correo Corporativo / Personal (Opcional)</span>
                      <input
                        type="email"
                        placeholder="carlos@empresa.com"
                        value={quoteState.lead_contact.email}
                        onChange={(e) => handleLeadContactChange('email', e.target.value)}
                        className="bg-surface-container-highest border border-outline-variant focus:border-primary px-3.5 py-2 rounded-lg text-white font-jakarta text-xs outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="font-jakarta text-xs text-on-surface-variant">Razón Social / Empresa</span>
                      <input
                        type="text"
                        placeholder="Distribuidora del Norte SAC"
                        value={quoteState.business_discovery.company_name}
                        onChange={(e) => handleUpdateDiscovery('company_name', e.target.value)}
                        className="bg-surface-container-highest border border-outline-variant focus:border-primary px-3.5 py-2 rounded-lg text-white font-jakarta text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Notas o requerimiento especial */}
                  <div className="flex flex-col gap-1">
                    <span className="font-jakarta text-xs text-on-surface-variant">
                      ¿Tienes algún requerimiento específico o duda técnica? (Opcional)
                    </span>
                    <textarea
                      rows={2}
                      placeholder="Ej. Queremos que los clientes puedan ver el estado de su envío en mapa o imprimir tickets en térmicas..."
                      value={quoteState.configuration.custom_requirements_note}
                      onChange={(e) => setQuoteState(prev => ({
                        ...prev,
                        configuration: { ...prev.configuration, custom_requirements_note: e.target.value }
                      }))}
                      className="bg-surface-container-highest border border-outline-variant focus:border-primary px-3.5 py-2 rounded-lg text-white font-jakarta text-xs outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Acciones de Cierre */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-xs font-semibold w-full sm:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Paso 3: Interfaces</span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-glow-amber hover:shadow-glow-amber-lg hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {pricing.isEnterprise ? 'calendar_month' : 'rocket_launch'}
                    </span>
                    <span>
                      {pricing.isEnterprise ? 'Agendar Evaluación Técnica' : 'Generar Cotización y Recibir Propuesta'}
                    </span>
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* COLUMNA DERECHA (35%): STICKY SUMMARY (RESUMEN EN TIEMPO REAL) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-4">
            
            <div className="bg-surface-container border border-outline-variant rounded-xl p-5 sm:p-6 shadow-xl flex flex-col gap-5 relative overflow-hidden">
              
              {/* Top accent badge */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-space text-xs uppercase tracking-wider text-white font-bold">
                    Resumen en Vivo
                  </span>
                </div>
                <span className="font-mono text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  Paso {activeStep} / 4
                </span>
              </div>

              {/* Indicador de Inversión Mensual y Diaria */}
              <div className="flex flex-col gap-1 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant">
                <span className="font-space text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Inversión Mensual Estimada
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-space text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    ${pricing.monthlyTotal.toFixed(2)}
                  </span>
                  <span className="font-space text-xs text-primary font-bold uppercase">
                    USD / mes
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 mt-1">
                  <span className="font-jakarta text-[11px] text-on-surface-variant">
                    Equivalente diario:
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ${pricing.dailyEquivalent.toFixed(2)} USD / día
                  </span>
                </div>
              </div>

              {/* Setup Fee Badge */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high border border-outline-variant text-xs">
                <div className="flex flex-col">
                  <span className="font-space text-[10px] uppercase text-on-surface-variant font-semibold">
                    Implementación (Setup Fee):
                  </span>
                  <span className="font-jakarta text-[11px] text-white">
                    {quoteState.commitment_plan === 'semestral_setup_gratis' ? 'Permanencia 6 meses' : 'Sin permanencia'}
                  </span>
                </div>
                <div className="text-right">
                  {pricing.setupFee === 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="line-through font-mono text-[11px] text-on-surface-variant">$350 USD</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">¡$0 GRATIS!</span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs font-bold text-white">$350 USD</span>
                  )}
                </div>
              </div>

              {/* Desglose Reactivo de lo Seleccionado */}
              <div className="flex flex-col gap-2.5">
                <span className="font-space text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Desglose Detallado:
                </span>

                <div className="flex flex-col gap-1.5 text-xs">
                  {/* Roles */}
                  <div className="flex items-center justify-between py-1 border-b border-outline-variant/30 text-on-surface-variant">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="material-symbols-outlined text-[15px] text-primary">group</span>
                      <span>Roles ({pricing.totalAdminUsers} usuarios)</span>
                    </span>
                    <span className="font-mono font-bold text-white">${pricing.monthlyRolesBase} USD</span>
                  </div>

                  {/* Detalle por rol */}
                  {quoteState.configuration.admin_roles.map(r => {
                    const rObj = ADMIN_ROLES.find(ar => ar.id === r.role);
                    return (
                      <div key={r.role} className="flex items-center justify-between pl-5 text-[11px] text-on-surface-variant">
                        <span>• {rObj ? rObj.name : r.role} (x{r.count})</span>
                        <span className="font-mono">${r.count * 30}</span>
                      </div>
                    );
                  })}

                  {/* Clientes */}
                  <div className="flex items-center justify-between py-1 border-b border-outline-variant/30 text-on-surface-variant pt-2">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="material-symbols-outlined text-[15px] text-primary">groups</span>
                      <span>Clientes Finales</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {pricing.monthlyCustomersExtra === 0 ? '$0' : `+$${pricing.monthlyCustomersExtra} USD`}
                    </span>
                  </div>

                  {/* Interfaces */}
                  <div className="flex items-center justify-between py-1 border-b border-outline-variant/30 text-on-surface-variant pt-2">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="material-symbols-outlined text-[15px] text-primary">desktop_windows</span>
                      <span>Canales e Interfaces ({quoteState.configuration.interfaces.length})</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {pricing.monthlyInterfaces === 0 ? '$0' : `+$${pricing.monthlyInterfaces} USD`}
                    </span>
                  </div>

                  {/* Paquetes de datos */}
                  {quoteState.configuration.data_and_apis.length > 0 && (
                    <div className="flex items-center justify-between py-1 border-b border-outline-variant/30 text-on-surface-variant pt-2">
                      <span className="flex items-center gap-1.5 text-white">
                        <span className="material-symbols-outlined text-[15px] text-primary">database</span>
                        <span>APIs &amp; Integraciones ({quoteState.configuration.data_and_apis.length})</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        {pricing.monthlyDataAndApis === 0 ? '$0' : `+$${pricing.monthlyDataAndApis} USD`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón rápido del Sticky según el paso actual */}
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={() => goToStep(activeStep + 1)}
                  disabled={activeStep === 2 && pricing.totalAdminUsers === 0}
                  className={`w-full py-3 rounded-lg font-space text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    activeStep === 2 && pricing.totalAdminUsers === 0
                      ? 'opacity-40 cursor-not-allowed bg-surface-container-high text-on-surface-variant'
                      : 'bg-primary text-on-primary shadow-glow-amber hover:shadow-glow-amber-lg'
                  }`}
                >
                  <span>Avanzar al Paso {activeStep + 1}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-full py-3.5 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-glow-amber hover:shadow-glow-amber-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Confirmar &amp; Generar Cotización</span>
                </button>
              )}

              {/* Garantía & soporte */}
              <div className="flex items-center gap-2 pt-2 text-[10px] text-on-surface-variant font-jakarta">
                <span className="material-symbols-outlined text-emerald-400 text-[14px]">verified_user</span>
                <span>Sin servidores que mantener. Soporte y mantenimiento incluidos.</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════
          MODAL DE ÉXITO & ENTREGA DE COTIZACIÓN (CONFETTI + JSON)
      ════════════════════════════════════════════════════════════ */}
      {successQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-surface-container border border-primary/40 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSuccessQuote(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Header éxito */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <div className="flex flex-col">
                <div className="inline-flex items-center gap-2">
                  <span className="font-space text-xs font-bold text-primary uppercase">
                    Cotización Estructurada Generada
                  </span>
                  <span className="font-mono text-xs font-bold text-white bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant">
                    {successQuote.quote_id}
                  </span>
                </div>
                <h3 className="font-space text-2xl text-white font-bold tracking-tight">
                  ¡Propuesta Lista para {successQuote.business_discovery.company_name || 'tu Negocio'}!
                </h3>
              </div>
            </div>

            {/* Resumen Financiero Destacado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant">
              <div className="flex flex-col">
                <span className="font-space text-[10px] uppercase text-on-surface-variant">Mensualidad Total</span>
                <span className="font-space text-2xl font-bold text-white">
                  ${successQuote.pricing_summary.monthly_total.toFixed(2)} USD
                </span>
                <span className="font-mono text-[11px] text-emerald-400">
                  ${successQuote.pricing_summary.daily_equivalent.toFixed(2)} USD/día
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-space text-[10px] uppercase text-on-surface-variant">Costo Implementación</span>
                <span className="font-space text-xl font-bold text-emerald-400">
                  {successQuote.pricing_summary.setup_fee === 0 ? '$0 USD ¡GRATIS!' : '$350 USD'}
                </span>
                <span className="font-jakarta text-[11px] text-on-surface-variant">
                  {successQuote.pricing_summary.commitment_plan === 'semestral_setup_gratis' ? 'Ahorro de $350 USD' : 'Pago único'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-space text-[10px] uppercase text-on-surface-variant">Roles y Usuarios</span>
                <span className="font-space text-xl font-bold text-white">
                  {successQuote.configuration.total_admin_users} Usuarios
                </span>
                <span className="font-jakarta text-[11px] text-on-surface-variant">
                  {successQuote.configuration.admin_roles.length} roles configurados
                </span>
              </div>
            </div>

            {/* Opciones de Envío Directo */}
            <div className="flex flex-col gap-3">
              <span className="font-space text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                ¿Cómo deseas recibir y revisar tu propuesta?
              </span>

              {/* Botón WhatsApp */}
              <button
                type="button"
                onClick={openWhatsAppProposal}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Enviar Resumen a WhatsApp de Asesoría Técnica</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Copiar Resumen JSON */}
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="py-2.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    {copySuccess ? 'check' : 'content_copy'}
                  </span>
                  <span>{copySuccess ? '¡Copiado al Portapapeles!' : 'Copiar Resumen (JSON)'}</span>
                </button>

                {/* Descargar JSON */}
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="py-2.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                  <span>Descargar Ficha (.json)</span>
                </button>
              </div>
            </div>

            {/* Payload preview comprimido */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase text-on-surface-variant">
                Contrato de Datos Estructurado (Payload POST /api/v1/quotes)
              </span>
              <pre className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant font-mono text-[10px] text-on-surface-variant overflow-x-auto max-h-36">
                {JSON.stringify(successQuote, null, 2)}
              </pre>
            </div>

            {/* Footer modal */}
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60">
              <span className="font-jakarta text-xs text-on-surface-variant">
                Contacto registrado: <strong className="text-white">{successQuote.lead_contact.name}</strong> ({successQuote.lead_contact.whatsapp})
              </span>
              <button
                type="button"
                onClick={() => setSuccessQuote(null)}
                className="px-4 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-white font-space text-xs uppercase"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
