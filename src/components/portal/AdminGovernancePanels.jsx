import React, { useEffect, useState } from 'react';
import {
  DEFAULT_COMMUNITY_IMPACT,
  fetchReferralsAndWallet,
  approveReferralPayment,
  fetchSystemAuditLogs
} from '../../services/platformService';
import { DEFAULT_PRICING_CONFIG } from '../../data/pricingRules';

export function AdminPricingPanel({ pricingConfig, onSavePricingConfig, currentUser, onNotify }) {
  const buildFormState = (cfg = {}) => ({
    admin_role_monthly_usd: Number(cfg.admin_role_monthly_usd ?? DEFAULT_PRICING_CONFIG.admin_role_monthly_usd),
    traditional_role_monthly_usd: Number(cfg.traditional_role_monthly_usd ?? DEFAULT_PRICING_CONFIG.traditional_role_monthly_usd),
    setup_fee_no_permanence_usd: Number(cfg.setup_fee_no_permanence_usd ?? DEFAULT_PRICING_CONFIG.setup_fee_no_permanence_usd),
    traditional_setup_fee_usd: Number(cfg.traditional_setup_fee_usd ?? DEFAULT_PRICING_CONFIG.traditional_setup_fee_usd),
    referrals_required: Number(cfg.referral_credit_rule?.referrals_required ?? 2),
    bonus_role_months: Number(cfg.referral_credit_rule?.bonus_role_months ?? 2)
  });

  const [form, setForm] = useState(() => buildFormState(pricingConfig));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(buildFormState(pricingConfig));
  }, [pricingConfig]);

  const socioUsd = Number(form.admin_role_monthly_usd) || 30;
  const reqCount = Math.max(1, Number(form.referrals_required) || 2);
  const rewardMonths = Math.max(1, Number(form.bonus_role_months) || 2);
  const autoCreditPerReferral = Math.round((socioUsd * rewardMonths) / reqCount);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const normalized = {
        ...DEFAULT_PRICING_CONFIG,
        ...(pricingConfig || {}),
        admin_role_monthly_usd: socioUsd,
        traditional_role_monthly_usd: Number(form.traditional_role_monthly_usd) || 90,
        setup_fee_no_permanence_usd: Number(form.setup_fee_no_permanence_usd) || 350,
        traditional_setup_fee_usd: Number(form.traditional_setup_fee_usd) || 500,
        referral_credit_rule: {
          referrals_required: reqCount,
          bonus_role_months: rewardMonths,
          usd_per_credit_month: socioUsd
        }
      };
      await onSavePricingConfig?.(normalized, currentUser);
      onNotify?.('Tarifario global (pricing-config) guardado y aplicado al Cotizador y Panel de Socios.');
    } catch (err) {
      onNotify?.(err.message || 'No se pudo guardar pricing-config.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-outline-variant bg-surface-container p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
        <div>
          <h3 className="font-space text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            Configuración Global de Tarifas (pricing-config)
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Solo Administrador puede ajustar estas tarifas. Se reflejan en tiempo real en la Landing Pública y en el canje de Créditos de Socios.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-primary/15 border border-primary/40 text-primary text-[10px] font-mono font-bold">
          SOLO ADMIN
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Tarifa Socio por Rol / Mes (USD)</label>
          <input
            type="number"
            min="1"
            value={form.admin_role_monthly_usd}
            onChange={(e) => setForm({ ...form, admin_role_monthly_usd: e.target.value })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Tarifa Mercado Referencial / Mes (USD)</label>
          <input
            type="number"
            min="1"
            value={form.traditional_role_monthly_usd}
            onChange={(e) => setForm({ ...form, traditional_role_monthly_usd: e.target.value })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Setup Sin Permanencia / Referencia (USD)</label>
          <input
            type="number"
            min="0"
            value={form.setup_fee_no_permanence_usd}
            onChange={(e) => setForm({ ...form, setup_fee_no_permanence_usd: e.target.value, traditional_setup_fee_usd: e.target.value })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Referidos requeridos por premio</label>
          <input
            type="number"
            min="1"
            value={form.referrals_required}
            onChange={(e) => setForm({ ...form, referrals_required: e.target.value })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Meses gratis de rol otorgados</label>
          <input
            type="number"
            min="1"
            value={form.bonus_role_months}
            onChange={(e) => setForm({ ...form, bonus_role_months: e.target.value })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Crédito automático por referido pagado (USD)</label>
          <div className="h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant flex items-center font-mono text-primary font-bold">
            ${autoCreditPerReferral} USD / referido
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
        <button
          type="button"
          onClick={() => setForm(buildFormState(DEFAULT_PRICING_CONFIG))}
          className="px-3.5 py-2 rounded-lg border border-outline-variant text-xs text-on-surface-variant hover:text-white cursor-pointer"
        >
          Restaurar estándar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-[#18181b] text-xs font-bold hover:brightness-110 cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Publicar Tarifario Global'}
        </button>
      </div>
    </form>
  );
}

export function AdminReferralsPanel({ currentUser, portalUsers = [], pricingConfig, onUpdatePortalUsers, onNotify }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const unitPrice = Number(pricingConfig?.admin_role_monthly_usd ?? 30);
  const reqCount = Math.max(1, Number(pricingConfig?.referral_credit_rule?.referrals_required ?? 2));
  const rewardMonths = Math.max(1, Number(pricingConfig?.referral_credit_rule?.bonus_role_months ?? 2));
  const creditRuleUsd = Math.round((unitPrice * rewardMonths) / reqCount);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await fetchReferralsAndWallet({ ...currentUser, role: 'Admin' }, portalUsers);
      setReferrals(res.referrals || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [portalUsers.length]);

  const handleApprove = async (refItem) => {
    setBusyId(refItem.id);
    try {
      const res = await approveReferralPayment(refItem, currentUser, creditRuleUsd);
      if (res?.updatedPartner) {
        const nextUsers = portalUsers.map((u) =>
          String(u.email || '').toLowerCase() === String(res.updatedPartner.email || '').toLowerCase()
            ? { ...u, credit_balance_usd: res.updatedPartner.credit_balance_usd }
            : u
        );
        onUpdatePortalUsers?.(nextUsers);
      }
      onNotify?.(
        `Pago de referido "${refItem.referred_company}" aprobado. Se acreditaron $${res.creditGranted} USD al Socio ${refItem.referrer_email}.`
      );
      await loadAll();
    } catch (err) {
      onNotify?.(err.message || 'No se pudo aprobar el pago del referido.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
        <div>
          <h3 className="font-space text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            Aprobación de Pagos de Referidos & Emisión de Créditos
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Al aprobar el pago de un referido, se abona automáticamente <strong className="text-primary">${creditRuleUsd} USD</strong> en Créditos de Socio.
          </p>
        </div>
        <button
          type="button"
          onClick={loadAll}
          className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface-variant hover:text-white cursor-pointer"
        >
          Actualizar lista
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-on-surface-variant">Cargando registros de referidos...</p>
      ) : referrals.length === 0 ? (
        <p className="text-xs text-on-surface-variant text-center py-6">No existen referidos registrados aún.</p>
      ) : (
        <div className="space-y-2.5">
          {referrals.map((ref) => (
            <div
              key={ref.id}
              className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-primary font-bold">{ref.id}</span>
                  <span className="font-bold text-white">{ref.referred_company}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-on-surface-variant">
                    Código: {ref.referral_code}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Socio que refirió: <strong className="text-white">{ref.referrer_email}</strong> · Empresa referida: {ref.referred_email || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-primary">+${ref.credits_awarded_usd || creditRuleUsd} USD</span>
                {ref.status === 'pagado_aprobado' ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                    ✓ Aprobado y Acreditado
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === ref.id}
                    onClick={() => handleApprove(ref)}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-[#18181b] font-bold text-xs hover:brightness-110 cursor-pointer disabled:opacity-50"
                  >
                    {busyId === ref.id ? 'Acreditando...' : 'Aprobar Pago y Abonar Crédito'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminImpactPanel({ communityImpact, onSaveCommunityImpact, currentUser, onNotify }) {
  const mergeState = (ci = {}) => ({
    education: { ...DEFAULT_COMMUNITY_IMPACT.education, ...(ci.education || {}) },
    sports: { ...DEFAULT_COMMUNITY_IMPACT.sports, ...(ci.sports || {}) },
    values: { ...DEFAULT_COMMUNITY_IMPACT.values, ...(ci.values || {}) },
    pathway: { ...DEFAULT_COMMUNITY_IMPACT.pathway, ...(ci.pathway || {}) }
  });

  const [form, setForm] = useState(() => mergeState(communityImpact));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(mergeState(communityImpact));
  }, [communityImpact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveCommunityImpact?.(form, currentUser);
      onNotify?.('Métricas de Impacto Comunitario publicadas y visibles en la Landing Page.');
    } catch (err) {
      onNotify?.(err.message || 'No se pudo publicar el Impacto Comunitario.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-outline-variant bg-surface-container p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
        <div>
          <h3 className="font-space text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">volunteer_activism</span>
            Publicador de Métricas de Impacto Comunitario (Educación, Deporte, Valores)
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Los cambios publicados aquí se sincronizan en vivo en la sección de Impacto Comunitario y Pathway de la Landing Pública.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Métrica Educación Tecnológica</label>
          <input
            type="text"
            value={form.education.metric}
            onChange={(e) => setForm({ ...form, education: { ...form.education, metric: e.target.value } })}
            placeholder="+120 hrs"
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Etiqueta Educación</label>
          <input
            type="text"
            value={form.education.label}
            onChange={(e) => setForm({ ...form, education: { ...form.education, label: e.target.value } })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Métrica Deporte Vecinal</label>
          <input
            type="text"
            value={form.sports.metric}
            onChange={(e) => setForm({ ...form, sports: { ...form.sports, metric: e.target.value } })}
            placeholder="8 ligas"
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Etiqueta Deporte</label>
          <input
            type="text"
            value={form.sports.label}
            onChange={(e) => setForm({ ...form, sports: { ...form.sports, label: e.target.value } })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Métrica Valores &amp; Comisiones</label>
          <input
            type="text"
            value={form.values.metric}
            onChange={(e) => setForm({ ...form, values: { ...form.values, metric: e.target.value } })}
            placeholder="0% fees"
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="font-space text-on-surface-variant">Etiqueta Valores</label>
          <input
            type="text"
            value={form.values.label}
            onChange={(e) => setForm({ ...form, values: { ...form.values, label: e.target.value } })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <label className="font-space text-on-surface-variant">Titular Tarjeta Pathway</label>
          <input
            type="text"
            value={form.pathway.title}
            onChange={(e) => setForm({ ...form, pathway: { ...form.pathway, title: e.target.value } })}
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
        <button
          type="button"
          onClick={() => setForm(mergeState(DEFAULT_COMMUNITY_IMPACT))}
          className="px-3.5 py-2 rounded-lg border border-outline-variant text-xs text-on-surface-variant hover:text-white cursor-pointer"
        >
          Restaurar estándar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-[#18181b] text-xs font-bold hover:brightness-110 cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Publicando...' : 'Publicar en Landing Pública'}
        </button>
      </div>
    </form>
  );
}

export function AdminAuditPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const list = await fetchSystemAuditLogs(80);
      setLogs(list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h3 className="font-space text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">history</span>
            Auditoría del Sistema (Trazabilidad RBAC)
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Bitácora de eventos administrativos, cambios de tarifario, aprobación de referidos y revisiones técnicas.
          </p>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface-variant hover:text-white cursor-pointer"
        >
          Refrescar
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-on-surface-variant">Cargando bitácora...</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-on-surface-variant text-center py-6">Aún no hay eventos registrados en la sesión.</p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-mono text-[10px] font-bold">
                    {log.action_type}
                  </span>
                  <span className="font-semibold text-white">{log.summary}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Actor: <strong className="text-white">{log.actor_email || 'Sistema'}</strong> ({log.actor_role || 'Admin'}) · Target: <span className="font-mono">{log.target_id || 'N/A'}</span>
                </p>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant">
                {new Date(log.created_at).toLocaleString('es-PE')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
