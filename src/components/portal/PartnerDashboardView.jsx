import React, { useEffect, useState } from 'react';
import {
  DEFAULT_PARTNER_WORKSHOPS,
  buildReferralCodeForUser,
  fetchReferralsAndWallet,
  createReferralLead,
  redeemPartnerCredits
} from '../../services/platformService';
import SectionInfoPopover from './SectionInfoPopover';

export default function PartnerDashboardView({
  currentUser,
  portalUsers = [],
  projects = [],
  implementationRequests = [],
  pricingConfig = null,
  onUserUpdated,
  onNavigateTab,
  onNotify
}) {
  const [referrals, setReferrals] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Registro rápido de referido
  const [refCompany, setRefCompany] = useState('');
  const [refEmail, setRefEmail] = useState('');
  const [submittingRef, setSubmittingRef] = useState(false);

  // Canje de créditos de socio
  const [redeemMonths, setRedeemMonths] = useState(2);
  const [targetProjectId, setTargetProjectId] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const referralCode = currentUser?.referral_code || buildReferralCodeForUser(currentUser);
  const unitRolePriceUsd = Number(pricingConfig?.admin_role_monthly_usd ?? 30);
  const paidReferralsCount = referrals.filter((r) => r.status === 'pagado_aprobado').length;
  const approvedCreditsSum = referrals
    .filter((r) => r.status === 'pagado_aprobado')
    .reduce((acc, r) => acc + Number(r.credits_awarded_usd || 0), 0);
  const spentCreditsSum = redemptions.reduce((acc, r) => acc + Number(r.credits_used_usd || 0), 0);

  const walletBalanceUsd = Number(
    currentUser?.credit_balance_usd !== undefined && currentUser?.credit_balance_usd !== null
      ? currentUser.credit_balance_usd
      : Math.max(0, approvedCreditsSum - spentCreditsSum)
  );
  const bonusMonths = Number(currentUser?.bonus_role_months || 0);

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetchReferralsAndWallet(currentUser, portalUsers);
      setReferrals(res.referrals || []);
      setRedemptions(res.redemptions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser?.email]);

  const handleCopyReferral = () => {
    try {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      onNotify?.(`Código de referido ${referralCode} copiado al portapapeles.`);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (_) {}
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!refCompany.trim()) return;
    setSubmittingRef(true);
    try {
      await createReferralLead({
        user: currentUser,
        referredCompany: refCompany.trim(),
        referredEmail: refEmail.trim(),
        referralCode
      });
      setRefCompany('');
      setRefEmail('');
      onNotify?.('Referido registrado. Cuando Admin apruebe su primer pago recibirás tus Créditos de Socio.');
      await refreshData();
    } catch (err) {
      onNotify?.(err.message || 'No se pudo registrar el referido.', 'error');
    } finally {
      setSubmittingRef(false);
    }
  };

  const handleRedeemCredits = async (e) => {
    e.preventDefault();
    setRedeeming(true);
    try {
      const res = await redeemPartnerCredits({
        user: { ...currentUser, credit_balance_usd: walletBalanceUsd, bonus_role_months: bonusMonths },
        roleMonths: redeemMonths,
        unitPriceUsd: unitRolePriceUsd,
        targetProjectId: targetProjectId || projects[0]?.id || null
      });
      onUserUpdated?.({
        credit_balance_usd: res.nextBalance,
        bonus_role_months: res.nextBonusMonths
      });
      onNotify?.(`Canje exitoso: +${redeemMonths} mes(es) de rol operativo activados.`);
      await refreshData();
    } catch (err) {
      onNotify?.(err.message || 'Saldo de créditos insuficiente para este canje.', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-jakarta text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">workspace_premium</span>
            Panel de Socio & Billetera de Créditos
            <SectionInfoPopover
              title="Alianza Socio / Cliente Pathrimonio"
              description="Gestiona tu código de referido, canjea Créditos de Socio para extender roles, sigue tus proyectos y accede a talleres en vivo y beneficios Pathway."
            />
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Membresía activa · Hasta <strong className="text-primary">45 turnos diarios de IA</strong> en FORMALIA (reinicio 00:00 UTC) + beneficios exclusivos de alianza.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low border border-primary/40 rounded-xl px-3.5 py-2">
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase text-on-surface-variant">Tu Código de Referido</div>
            <div className="text-sm font-mono font-bold text-primary tracking-wider">{referralCode}</div>
          </div>
          <button
            type="button"
            onClick={handleCopyReferral}
            className="ml-2 px-2.5 py-1.5 rounded-lg bg-primary text-[#18181b] text-xs font-bold hover:brightness-110 cursor-pointer"
          >
            {copiedCode ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* KPIs Billetera & Referidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-primary/35 bg-primary/10 p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-primary font-semibold">Saldo Billetera Socio</span>
          <div className="text-2xl font-bold font-mono text-white">${walletBalanceUsd} USD</div>
          <p className="text-[11px] text-on-surface-variant">Equivalente a {Math.floor(walletBalanceUsd / unitRolePriceUsd)} mes(es) de rol</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-on-surface-variant">Meses de Rol Canjeados</span>
          <div className="text-2xl font-bold font-mono text-white">+{bonusMonths} meses</div>
          <p className="text-[11px] text-on-surface-variant">Regla: 2 referidos = 1 rol x 2 meses</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-on-surface-variant">Referidos Pagados</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{paidReferralsCount}</div>
          <p className="text-[11px] text-on-surface-variant">{referrals.length} registrados en total</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-on-surface-variant">Proyectos & Solicitudes</span>
          <div className="text-2xl font-bold font-mono text-white">{projects.length} / {implementationRequests.length}</div>
          <p className="text-[11px] text-on-surface-variant">Activos bajo tu organización</p>
        </div>
      </div>

      {/* Grid: Canjear Créditos + Registrar Referido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Canje de Créditos */}
        <form
          onSubmit={handleRedeemCredits}
          className="lg:col-span-5 rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-4"
        >
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">redeem</span>
              Canjear Créditos de Socio
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Usa tu saldo acumulado (${unitRolePriceUsd} USD por mes de rol adicional) para extender suscripciones o agregar usuarios administradores.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-on-surface-variant mb-1">Meses / Roles a activar</label>
              <select
                value={redeemMonths}
                onChange={(e) => setRedeemMonths(Number(e.target.value))}
                className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value={1}>1 mes adicional (-${unitRolePriceUsd} USD)</option>
                <option value={2}>1 rol x 2 meses (-${unitRolePriceUsd * 2} USD)</option>
                <option value={4}>2 roles x 2 meses (-${unitRolePriceUsd * 4} USD)</option>
              </select>
            </div>

            {projects.length > 0 && (
              <div>
                <label className="block text-[11px] font-mono text-on-surface-variant mb-1">Aplicar al proyecto</label>
                <select
                  value={targetProjectId || projects[0]?.id || ''}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={redeeming || walletBalanceUsd < redeemMonths * unitRolePriceUsd}
            className="w-full py-2.5 rounded-xl bg-primary text-[#18181b] text-xs font-bold hover:brightness-110 disabled:opacity-45 cursor-pointer"
          >
            {redeeming
              ? 'Procesando canje...'
              : walletBalanceUsd < redeemMonths * unitRolePriceUsd
                ? `Saldo insuficiente (requiere $${redeemMonths * unitRolePriceUsd} USD)`
                : `Canjear $${redeemMonths * unitRolePriceUsd} USD ahora`}
          </button>
        </form>

        {/* Referidos + Nuevo Referido */}
        <div className="lg:col-span-7 rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">share</span>
                Historial de Referidos ({referrals.length})
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Registra empresas recomendadas; cuando Administrador apruebe su pago, tus créditos ingresan automáticamente.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateReferral} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              value={refCompany}
              onChange={(e) => setRefCompany(e.target.value)}
              placeholder="Empresa referida (ej. Ferretería Solís)"
              required
              className="sm:col-span-5 bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs text-white placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
            />
            <input
              type="email"
              value={refEmail}
              onChange={(e) => setRefEmail(e.target.value)}
              placeholder="correo@empresa.com (opcional)"
              className="sm:col-span-4 bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs text-white placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={submittingRef}
              className="sm:col-span-3 px-3 py-2 rounded-xl bg-surface-container border border-primary/50 text-primary hover:bg-primary hover:text-[#18181b] text-xs font-bold transition-colors cursor-pointer"
            >
              {submittingRef ? 'Guardando...' : '+ Referir PYME'}
            </button>
          </form>

          {loading ? (
            <p className="text-xs text-on-surface-variant">Cargando referidos...</p>
          ) : referrals.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-3 text-center bg-surface-container rounded-xl border border-outline-variant">
              Aún no tienes referidos registrados. Comparte tu código <strong className="text-primary">{referralCode}</strong> para acumular Créditos de Socio.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface-container border border-outline-variant text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{ref.referred_company}</div>
                    <div className="text-[11px] text-on-surface-variant">
                      {ref.referred_email || 'Sin correo'} · {new Date(ref.created_at).toLocaleDateString('es-PE')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">+${ref.credits_awarded_usd ?? unitRolePriceUsd} USD</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ref.status === 'pagado_aprobado'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {ref.status === 'pagado_aprobado' ? 'Aprobado y Acreditado' : 'Pendiente Pago'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Talleres en Vivo + Beneficios Pathway + Proyectos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Talleres */}
        <div className="lg:col-span-7 rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">live_tv</span>
            Talleres en Vivo de la Red de Socios
          </h3>
          <div className="space-y-2.5">
            {DEFAULT_PARTNER_WORKSHOPS.map((ws) => (
              <div
                key={ws.id}
                className="p-3.5 rounded-xl bg-surface-container border border-outline-variant flex flex-wrap items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-[200px] flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-mono font-bold">
                      {ws.modality || 'En Vivo'}
                    </span>
                    <span className="text-xs font-bold text-white">{ws.title}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {ws.schedule} · {ws.host}
                  </p>
                </div>
                <a
                  href={ws.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-surface-container-highest border border-primary/40 hover:bg-primary hover:text-[#18181b] text-xs font-semibold text-primary transition-colors"
                >
                  Reservar Cupo →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Beneficios Pathway + Estado de Proyectos */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
              Beneficios Exclusivos en Pathway
            </h3>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span><strong className="text-white">0% comisiones por transacción</strong> en ventas y pedidos B2C dentro de la app Pathway.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span><strong className="text-white">Posicionamiento verificado</strong> con insignia Socio Pathrimonio para tu marca local.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span><strong className="text-white">Sincronización directa</strong> con FORMALIA (45 turnos IA/día) y soporte prioritario de arquitectura.</span>
              </li>
            </ul>
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab?.('implementationStatus')}
                className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant hover:border-primary text-xs font-medium text-white cursor-pointer"
              >
                Ver estado de mis solicitudes
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab?.('formalia')}
                className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/40 text-xs font-semibold text-primary cursor-pointer"
              >
                Abrir FORMALIA (45/día)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
