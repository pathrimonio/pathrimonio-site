import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import {
  INDUSTRIES,
  DEFAULT_QUOTE_STATE,
  calculateQuotePricing,
  buildQuotePayload,
  formatWhatsAppMessage
} from '../../data/pricingRules';
import { submitQuoteWithFormaliaHandoff } from '../../services/formaliaService';
import { PRIVACY_POLICY_VERSION } from '../../config/siteConfig';
import EstimatorStepper from './EstimatorStepper';
import EstimatorSummary from './EstimatorSummary';
import MobileSummaryBar from './MobileSummaryBar';
import StepBusiness from './steps/StepBusiness';
import StepRoles from './steps/StepRoles';
import StepChannels from './steps/StepChannels';
import StepConfirm from './steps/StepConfirm';

const STORAGE_KEY = 'pathrimonio_quote_wizard_v2';
const PATHRIMONIO_WHATSAPP_NUMBER = '51950293223';

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

  const [quoteState, setQuoteState] = useState(DEFAULT_QUOTE_STATE);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [tarifaSocio, setTarifaSocio] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [successQuote, setSuccessQuote] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [isPreloadedFromFormalia, setIsPreloadedFromFormalia] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.business_discovery && parsed?.configuration) {
        setQuoteState(parsed);
        if (parsed.currentStep) setActiveStep(parsed.currentStep);
      }
    } catch (_) {}
    setDraftHydrated(true);
  }, []);

  useEffect(() => {
    if (!preloadedFormaliaData?.configuration) return;
    setQuoteState((prev) => ({
      ...prev,
      currentStep: 2,
      business_discovery: { ...prev.business_discovery, ...(preloadedFormaliaData.business_discovery || {}) },
      configuration: { ...prev.configuration, ...(preloadedFormaliaData.configuration || {}) },
      commitment_plan: preloadedFormaliaData.commitment_plan || prev.commitment_plan
    }));
    setActiveStep(2);
    setTarifaSocio(true);
    setIsPreloadedFromFormalia(true);
    setSuccessQuote(null);
  }, [preloadedFormaliaData?.preloadedAt]);

  useEffect(() => {
    if (!draftHydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...quoteState, currentStep: activeStep })); } catch (_) {}
  }, [quoteState, activeStep, draftHydrated]);

  const pricing = useMemo(() => {
    const base = calculateQuotePricing({ ...quoteState.configuration, commitment_plan: quoteState.commitment_plan }, pricingConfig);
    if (tarifaSocio) return base;
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
  }, [quoteState, tarifaSocio, pricingConfig, unitTradPrice, tradSetupFee]);

  const handleUpdateDiscovery = (field, value) => {
    setQuoteState((prev) => {
      const updatedDiscovery = { ...prev.business_discovery, [field]: value };
      const indObj = field === 'industry' ? INDUSTRIES.find((i) => i.id === value) : null;
      if (indObj?.suggestedRoles) {
        return { ...prev, business_discovery: updatedDiscovery, configuration: { ...prev.configuration, admin_roles: indObj.suggestedRoles.map((rId) => ({ role: rId, count: 1 })) } };
      }
      return { ...prev, business_discovery: updatedDiscovery };
    });
  };

  const handleRoleCountChange = (roleId, delta) => {
    setQuoteState((prev) => {
      const roles = [...prev.configuration.admin_roles];
      const idx = roles.findIndex((r) => r.role === roleId);
      if (idx >= 0) {
        const next = roles[idx].count + delta;
        if (next <= 0) roles.splice(idx, 1);
        else roles[idx] = { ...roles[idx], count: Math.min(next, 50) };
      } else if (delta > 0) roles.push({ role: roleId, count: 1 });
      return { ...prev, configuration: { ...prev.configuration, admin_roles: roles } };
    });
  };

  const handleToggleConfigItem = (key, id) => {
    if (key === 'interfaces' && id === 'web_operativa') return;
    setQuoteState((prev) => {
      const list = prev.configuration[key] || [];
      const updated = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      return { ...prev, configuration: { ...prev.configuration, [key]: updated } };
    });
  };

  const goToStep = (stepNumber) => {
    setValidationError('');
    if (activeStep === 2 && stepNumber > 2 && pricing.totalAdminUsers === 0) {
      setValidationError('Debes seleccionar al menos 1 rol operativo para continuar.');
      return;
    }
    setActiveStep(stepNumber);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      document.getElementById('cotizador')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setQuoteState(DEFAULT_QUOTE_STATE);
    setActiveStep(1);
    setTarifaSocio(true);
    setIsPreloadedFromFormalia(false);
    setSuccessQuote(null);
    setValidationError('');
  };

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();
    setValidationError('');
    if (!quoteState.lead_contact.name.trim()) return setValidationError('Por favor ingresa tu nombre de contacto.');
    if (!quoteState.lead_contact.whatsapp.trim()) return setValidationError('Por favor ingresa tu número de WhatsApp.');
    if (!privacyAccepted) return setValidationError('Debes leer y aceptar la Política de Privacidad para recibir tu cotización.');
    const payload = buildQuotePayload({
      quoteState,
      pricing,
      tarifaSocio,
      preloadedFormaliaData,
      currentUser,
      privacyVersion: PRIVACY_POLICY_VERSION
    });
    submitQuoteWithFormaliaHandoff(payload, preloadedFormaliaData?.process_graph).catch(() => {});
    setSuccessQuote(payload);
    setMobileSummaryOpen(false);
    try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } }); } catch (_) {}
    window.open(`https://wa.me/${PATHRIMONIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(formatWhatsAppMessage(payload))}`, '_blank');
  };

  const handleFormaliaLink = (e) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate('/formalia');
  };

  const summaryProps = {
    pricing, configuration: quoteState.configuration, pricingConfig, tarifaSocio, unitSocioPrice,
    unitTradPrice, tradSetupFee, dailySocioLabel, activeStep, privacyAccepted,
    onToggleTarifaSocio: setTarifaSocio, onReset: handleReset,
    onResetCustomerTier: () => setQuoteState((p) => ({ ...p, configuration: { ...p.configuration, end_customers_tier: 'hasta_100_base' } })),
    onRemoveInterface: (id) => handleToggleConfigItem('interfaces', id),
    onRemoveDataPackage: (id) => handleToggleConfigItem('data_and_apis', id),
    onGoToStep4: () => { setMobileSummaryOpen(false); goToStep(4); },
    onSubmit: handleFinalSubmit
  };

  return (
    <section id="cotizador" className="w-full py-20 lg:py-28 pb-24 lg:pb-28 bg-[var(--bg-page)] border-b border-[var(--border-subtle)] transition-colors">
      <div className="site-container">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-mono mb-3">
            <span className="font-semibold">COTIZADOR INTERACTIVO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] mb-4">
            Diseña tu sistema operativo sin sorpresas.
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-[60ch]">
            Calcula al instante el valor exacto de tu sistema desde <strong className="text-[var(--text-primary)]">$1 USD al día por rol</strong> y activa la Tarifa Socio para ahorrar en tu mensualidad.
          </p>
        </div>

        <div className={`mb-6 p-3.5 rounded-[10px] border flex flex-wrap items-center justify-between gap-3 ${isPreloadedFromFormalia ? 'bg-[var(--accent-soft)] border-[var(--accent-primary)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'}`}>
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)]">
            <Sparkles size={15} className="text-[var(--accent-text)] shrink-0" />
            <span>
              {isPreloadedFromFormalia
                ? <><strong>{preloadedFormaliaData?.web_blueprint_id ? `Solución Web (${preloadedFormaliaData.web_blueprint_id}) y roles precargados desde FormalIA.` : 'Configuración precargada desde tu mapa en FormalIA.'}</strong> Puedes ajustar cualquier rol libremente.</>
                : <>¿Todavía no tienes claros qué roles necesitas? Describe tu operación en <strong className="text-[var(--text-primary)]">FormalIA</strong> y obtén tu diagrama gratis primero.</>}
            </span>
          </div>
          <a href="/formalia" onClick={handleFormaliaLink} className={isPreloadedFromFormalia ? 'text-xs font-medium text-[var(--accent-text)] hover:underline whitespace-nowrap' : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--bg-silver)] hover:bg-[var(--bg-silver-hover)] border border-[var(--border-silver)] text-[var(--text-on-silver)] text-xs font-semibold transition-colors whitespace-nowrap'}>
            <span>{isPreloadedFromFormalia ? 'Volver a editar en FormalIA →' : 'Mapear mi negocio gratis con FormalIA'}</span>
            {!isPreloadedFromFormalia && <ArrowRight size={13} />}
          </a>
        </div>

        <EstimatorStepper activeStep={activeStep} onStepClick={goToStep} />

        {validationError && (
          <div className="mb-6 p-3.5 rounded-[8px] bg-red-500/15 border border-red-400/40 text-[var(--text-primary)] text-xs flex items-center gap-2">
            <AlertTriangle size={15} strokeWidth={1.75} className="shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-5 sm:p-8">
            {activeStep === 1 && <StepBusiness discovery={quoteState.business_discovery} onUpdateDiscovery={handleUpdateDiscovery} onNext={() => goToStep(2)} />}
            {activeStep === 2 && <StepRoles adminRoles={quoteState.configuration.admin_roles} totalAdminUsers={pricing.totalAdminUsers} unitSocioPrice={unitSocioPrice} onRoleCountChange={handleRoleCountChange} onBack={() => goToStep(1)} onNext={() => goToStep(3)} />}
            {activeStep === 3 && <StepChannels configuration={quoteState.configuration} defaultExpandedExtensions={Boolean(preloadedFormaliaData?.configuration?.data_and_apis?.length)} onSelectCustomerTier={(tierId) => setQuoteState((p) => ({ ...p, configuration: { ...p.configuration, end_customers_tier: tierId } }))} onToggleInterface={(id) => handleToggleConfigItem('interfaces', id)} onToggleDataPackage={(id) => handleToggleConfigItem('data_and_apis', id)} onOpenContact={onOpenContact} onBack={() => goToStep(2)} onNext={() => goToStep(4)} />}
            {activeStep === 4 && <StepConfirm commitmentPlan={quoteState.commitment_plan} leadContact={quoteState.lead_contact} privacyAccepted={privacyAccepted} successQuote={successQuote} onSelectCommitment={(modeId) => setQuoteState((p) => ({ ...p, commitment_plan: modeId }))} onUpdateContact={(field, val) => setQuoteState((p) => ({ ...p, lead_contact: { ...p.lead_contact, [field]: val } }))} onTogglePrivacy={(checked) => { setPrivacyAccepted(checked); if (checked && validationError) setValidationError(''); }} onNavigate={onNavigate} onBack={() => goToStep(3)} onSubmit={handleFinalSubmit} />}
          </div>
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20"><EstimatorSummary {...summaryProps} /></div>
        </div>
      </div>

      <MobileSummaryBar isOpen={mobileSummaryOpen} onToggleOpen={() => setMobileSummaryOpen((p) => !p)} onClose={() => setMobileSummaryOpen(false)} summaryProps={summaryProps} />
    </section>
  );
}
