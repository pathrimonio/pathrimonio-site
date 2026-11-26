import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminApiUsage,
  probeServerApiKeys,
  saveApiKeyQuotaLimit,
  PLAN_TIER_PRESETS
} from '../../services/apiUsageService';

function formatNumber(n = 0) {
  return new Intl.NumberFormat('es-PE').format(Number(n) || 0);
}

function formatTimeLima(iso) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(iso));
  } catch {
    return String(iso).slice(11, 19);
  }
}

function getProviderMeta(provider) {
  switch (provider) {
    case 'gemini':
      return { name: 'Google Gemini', icon: 'auto_awesome', accent: 'text-amber-300 bg-amber-500/15 border-amber-500/35' };
    case 'openai':
      return { name: 'OpenAI', icon: 'bolt', accent: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/35' };
    case 'deepseek':
      return { name: 'DeepSeek', icon: 'psychology', accent: 'text-sky-300 bg-sky-500/15 border-sky-500/35' };
    default:
      return { name: provider || 'API', icon: 'api', accent: 'text-primary bg-primary/15 border-primary/35' };
  }
}

function getStatusPill(healthStatus) {
  switch (healthStatus) {
    case 'healthy':
      return { label: 'Conectada · Operativa', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35', dot: 'bg-emerald-400' };
    case 'warning':
      return { label: 'Alerta (>= 70% cuota)', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/35', dot: 'bg-amber-400' };
    case 'critical':
      return { label: 'Crítico (>= 90% cuota)', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/35', dot: 'bg-rose-400' };
    case 'rate_limited':
      return { label: 'Límite Alcanzado (429)', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/40', dot: 'bg-rose-400' };
    case 'error':
      return { label: 'Error de Proveedor', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/35', dot: 'bg-rose-400' };
    default:
      return { label: 'Sin Clave Conectada', cls: 'bg-surface-container-highest text-on-surface-variant border-outline-variant', dot: 'bg-outline' };
  }
}

function getProgressBarClass(pct = 0) {
  if (pct >= 90) return 'bg-rose-500';
  if (pct >= 70) return 'bg-amber-400';
  return 'bg-primary';
}

export default function AdminApiUsageView({ currentUser, onNotify }) {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProbing, setIsProbing] = useState(false);
  const [editingKeyId, setEditingKeyId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingQuota, setSavingQuota] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchAdminApiUsage(7);
      setUsageData(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProbeKeys = async () => {
    setIsProbing(true);
    try {
      const res = await probeServerApiKeys();
      if (res?.summary) setUsageData(res.summary);
      const activeCount = Object.values(res?.probes || {}).filter((p) => p.healthy).length;
      onNotify?.(`Verificación completada: ${activeCount} clave(s) de servidor respondieron correctamente.`);
    } catch (err) {
      onNotify?.(err?.message || 'No se pudo probar las claves conectadas.');
    } finally {
      setIsProbing(false);
    }
  };

  const openEditQuota = (keyItem) => {
    if (editingKeyId === keyItem.key_id) {
      setEditingKeyId(null);
      setEditDraft(null);
      return;
    }
    setEditingKeyId(keyItem.key_id);
    setEditDraft({
      key_id: keyItem.key_id,
      provider: keyItem.provider,
      label: keyItem.label,
      tier: keyItem.tier || 'free',
      daily_request_limit: keyItem.daily_request_limit || 1500,
      rpm_limit: keyItem.rpm_limit || 15,
      daily_token_limit: keyItem.daily_token_limit || 250000,
      notes: keyItem.notes || ''
    });
  };

  const handleApplyTierPreset = (tierKey) => {
    if (!editDraft) return;
    if (tierKey === 'custom') {
      setEditDraft({ ...editDraft, tier: 'custom' });
      return;
    }
    const preset = PLAN_TIER_PRESETS[editDraft.provider]?.[tierKey];
    if (preset) {
      setEditDraft({
        ...editDraft,
        tier: tierKey,
        daily_request_limit: preset.daily_request_limit,
        rpm_limit: preset.rpm_limit,
        daily_token_limit: preset.daily_token_limit
      });
    }
  };

  const handleSaveQuota = async (e) => {
    e.preventDefault();
    if (!editDraft) return;
    setSavingQuota(true);
    try {
      const res = await saveApiKeyQuotaLimit({
        ...editDraft,
        updated_by: currentUser?.name || currentUser?.email || 'Admin'
      });
      if (res?.summary) setUsageData(res.summary);
      else await loadData(true);
      setEditingKeyId(null);
      setEditDraft(null);
      onNotify?.(`Límites diarios actualizados para ${editDraft.label}.`);
    } catch (err) {
      onNotify?.(err?.message || 'Error guardando límites de cuota.');
    } finally {
      setSavingQuota(false);
    }
  };

  if (loading && !usageData) {
    return (
      <div className="p-8 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-center gap-3 text-xs font-space text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-primary text-[20px]">progress_activity</span>
        <span>Cargando telemetría diaria de API y límites por clave conectada...</span>
      </div>
    );
  }

  const summary = usageData?.summary || {};
  const keys = usageData?.keys || [];
  const dailySeries = usageData?.daily_series || [];
  const recentLogs = usageData?.recent_logs || [];
  const maxDayReqs = Math.max(1, ...dailySeries.map((d) => d.requests || 0));

  return (
    <div className="flex flex-col gap-5">
      {/* Barra de Control y Contexto */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant font-mono text-[11px] text-white">
            <span className="material-symbols-outlined text-primary text-[15px]">calendar_today</span>
            <span>Corte diario: {usageData?.today_date || 'Hoy'} ({usageData?.timezone || 'America/Lima'})</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant font-mono text-[11px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">database</span>
            <span>
              Almacén:{' '}
              {usageData?.storage_backend === 'supabase_table'
                ? 'Supabase (api_usage_logs)'
                : usageData?.storage_backend === 'supabase_telemetry_ledger'
                  ? 'Supabase Telemetry Ledger'
                  : 'Memoria / Local'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container text-xs font-space font-semibold text-white hover:border-primary/50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            onClick={handleProbeKeys}
            disabled={isProbing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-[#e09419] text-xs font-space font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isProbing ? 'animate-spin' : ''}`}>
              {isProbing ? 'sync' : 'verified_user'}
            </span>
            <span>{isProbing ? 'Verificando claves...' : 'Probar Claves Conectadas'}</span>
          </button>
        </div>
      </div>

      {/* KPIs Globales del Día */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-space text-on-surface-variant uppercase tracking-wider">
            <span>Peticiones Hoy</span>
            <span className="material-symbols-outlined text-primary text-[18px]">query_stats</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-space text-2xl font-bold text-white tabular-nums">
              {formatNumber(summary.requests_today)}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              / {formatNumber(summary.daily_request_limit_total)} ({summary.request_usage_pct || 0}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressBarClass(summary.request_usage_pct)}`}
              style={{ width: `${Math.min(100, Math.max(2, summary.request_usage_pct || 0))}%` }}
            />
          </div>
          <span className="font-jakarta text-[11px] text-on-surface-variant">
            Disponible hoy: <strong className="text-white">{formatNumber(Math.max(0, (summary.daily_request_limit_total || 0) - (summary.requests_today || 0)))} req</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-space text-on-surface-variant uppercase tracking-wider">
            <span>Tokens Consumidos Hoy</span>
            <span className="material-symbols-outlined text-amber-400 text-[18px]">token</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-space text-2xl font-bold text-white tabular-nums">
              {formatNumber(summary.tokens_today)}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              / {formatNumber(summary.daily_token_limit_total)} ({summary.token_usage_pct || 0}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressBarClass(summary.token_usage_pct)}`}
              style={{ width: `${Math.min(100, Math.max(2, summary.token_usage_pct || 0))}%` }}
            />
          </div>
          <span className="font-jakarta text-[11px] text-on-surface-variant">
            Entrada: <strong className="text-white">{formatNumber(summary.prompt_tokens_today)}</strong> · Salida: <strong className="text-white">{formatNumber(summary.output_tokens_today)}</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-space text-on-surface-variant uppercase tracking-wider">
            <span>Claves Conectadas</span>
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">vpn_key</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-space text-2xl font-bold text-white tabular-nums">
              {summary.connected_keys_count || 0}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              de {summary.total_keys_count || 0} ranuras detectadas
            </span>
          </div>
          <span className="font-jakarta text-[11px] text-on-surface-variant mt-auto">
            Cero exposición de secretos: solo huellas enmascaradas en servidor y BYOK local.
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-space text-on-surface-variant uppercase tracking-wider">
            <span>Salud &amp; Latencia Media</span>
            <span className="material-symbols-outlined text-sky-400 text-[18px]">speed</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-space text-2xl font-bold text-white tabular-nums">
              {summary.success_rate_pct ?? 100}% OK
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              {summary.avg_latency_ms || 0} ms prom.
            </span>
          </div>
          <span className="font-jakarta text-[11px] text-on-surface-variant mt-auto">
            Bloqueos por cuota (HTTP 429) hoy:{' '}
            <strong className={summary.rate_limited_today > 0 ? 'text-rose-400' : 'text-emerald-400'}>
              {summary.rate_limited_today || 0}
            </strong>
          </span>
        </div>
      </div>

      {/* Tarjetas por Clave Conectada y Límites Diarios */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-space text-sm font-bold text-white">
              Estado y Límites Diarios por Clave Conectada
            </h2>
            <p className="font-jakarta text-xs text-on-surface-variant">
              Consumo real capturado desde <code>usageMetadata</code> / <code>usage</code> y cabeceras <code>x-ratelimit-*</code> comparado contra el límite de plan configurado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {keys.map((k) => {
            const prov = getProviderMeta(k.provider);
            const pill = getStatusPill(k.health_status);
            const usage = k.usage_today || {};
            const isEditing = editingKeyId === k.key_id;

            return (
              <div
                key={k.key_id}
                className="p-4 rounded-xl bg-surface-container border border-outline-variant flex flex-col gap-3.5"
              >
                {/* Header Clave */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${prov.accent}`}>
                      <span className="material-symbols-outlined text-[19px]">{prov.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-space text-sm font-bold text-white leading-snug">{k.label}</span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-mono text-[10px] text-on-surface-variant uppercase">
                          {k.scope === 'client_byok' ? 'BYOK Navegador' : 'Servidor Vercel'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-on-surface-variant flex-wrap">
                        <span>{prov.name}</span>
                        <span>·</span>
                        <span>
                          {k.connected && k.key_fingerprint
                            ? `Clave: ${k.key_fingerprint}`
                            : 'Sin variable configurada'}
                        </span>
                        {k.active_env_var && k.connected && (
                          <>
                            <span>·</span>
                            <span className="text-primary">{k.active_env_var}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-space text-[10px] font-semibold shrink-0 ${pill.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
                    <span>{pill.label}</span>
                  </span>
                </div>

                {/* Barras de Límite Diario (Peticiones + Tokens + RPM) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/60">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-space text-on-surface-variant">Peticiones Diarias (RPD)</span>
                      <span className="font-mono font-bold text-white">
                        {formatNumber(usage.requests)} / {formatNumber(k.daily_request_limit)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarClass(usage.request_pct)}`}
                        style={{ width: `${Math.min(100, usage.requests > 0 ? Math.max(3, usage.request_pct) : 0)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
                      <span>Restante: {formatNumber(usage.remaining_requests)}</span>
                      <span>RPM actual: {usage.rpm_current || 0} / {k.rpm_limit}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-space text-on-surface-variant">Tokens Diarios (TPD)</span>
                      <span className="font-mono font-bold text-white">
                        {formatNumber(usage.total_tokens)} / {formatNumber(k.daily_token_limit)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarClass(usage.token_pct)}`}
                        style={{ width: `${Math.min(100, usage.total_tokens > 0 ? Math.max(3, usage.token_pct) : 0)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
                      <span>In: {formatNumber(usage.prompt_tokens)} · Out: {formatNumber(usage.output_tokens)}</span>
                      <span>Lat: {usage.avg_latency_ms || 0} ms</span>
                    </div>
                  </div>
                </div>

                {/* Modelos activos hoy y resultado de verificación en vivo */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(k.models_today && k.models_today.length > 0 ? k.models_today : (k.configured_models || []).map((m) => ({ model: m, requests: 0 }))).map((m) => (
                      <span
                        key={m.model}
                        className="px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant font-mono text-[10px] text-on-surface"
                      >
                        {m.model}{m.requests > 0 ? ` · ${m.requests} req` : ''}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditQuota(k)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline-variant bg-surface-container-low hover:border-primary text-[11px] font-space font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px] text-primary">tune</span>
                    <span>{isEditing ? 'Cerrar límite' : `Configurar límite (${String(k.tier || 'free').toUpperCase()})`}</span>
                  </button>
                </div>

                {/* Info de último probe o rate-limit upstream */}
                {(k.probe || k.upstream_rate_limits) && (
                  <div className="px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-[11px] font-mono text-on-surface-variant flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {k.probe?.message || 'Cabeceras upstream detectadas'}
                      {k.probe?.latency_ms ? ` (${k.probe.latency_ms} ms)` : ''}
                    </span>
                    {k.upstream_rate_limits?.remaining_requests && (
                      <span className="text-emerald-400">
                        x-ratelimit-remaining: {k.upstream_rate_limits.remaining_requests}/{k.upstream_rate_limits.limit_requests || '?'} req
                      </span>
                    )}
                    {k.probe?.balance && (
                      <span className="text-primary">Saldo: {k.probe.balance}</span>
                    )}
                  </div>
                )}

                {/* Editor Inline de Cuota */}
                {isEditing && editDraft && (
                  <form
                    onSubmit={handleSaveQuota}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-primary/40 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-space text-xs font-bold text-white">
                        Ajustar Límites de Cuota ({k.label})
                      </span>
                      <div className="flex items-center gap-1.5">
                        {['free', 'tier1', 'custom'].map((tKey) => (
                          <button
                            key={tKey}
                            type="button"
                            onClick={() => handleApplyTierPreset(tKey)}
                            className={`px-2 py-0.5 rounded font-mono text-[10px] border cursor-pointer ${
                              editDraft.tier === tKey
                                ? 'bg-primary text-on-primary border-primary font-bold'
                                : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-white'
                            }`}
                          >
                            {tKey === 'free' ? 'Free Tier' : tKey === 'tier1' ? 'Tier 1 Pago' : 'Personalizado'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <label className="flex flex-col gap-1 text-[11px] font-space text-on-surface-variant">
                        <span>Peticiones / Día (RPD)</span>
                        <input
                          type="number"
                          min="1"
                          value={editDraft.daily_request_limit}
                          onChange={(e) => setEditDraft({ ...editDraft, tier: 'custom', daily_request_limit: Number(e.target.value) })}
                          className="bg-surface-container-highest border border-outline-variant rounded-lg px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] font-space text-on-surface-variant">
                        <span>Límite por Minuto (RPM)</span>
                        <input
                          type="number"
                          min="1"
                          value={editDraft.rpm_limit}
                          onChange={(e) => setEditDraft({ ...editDraft, tier: 'custom', rpm_limit: Number(e.target.value) })}
                          className="bg-surface-container-highest border border-outline-variant rounded-lg px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] font-space text-on-surface-variant">
                        <span>Tokens / Día (TPD)</span>
                        <input
                          type="number"
                          min="1000"
                          step="1000"
                          value={editDraft.daily_token_limit}
                          onChange={(e) => setEditDraft({ ...editDraft, tier: 'custom', daily_token_limit: Number(e.target.value) })}
                          className="bg-surface-container-highest border border-outline-variant rounded-lg px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingKeyId(null); setEditDraft(null); }}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-space text-on-surface-variant hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingQuota}
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-space font-semibold hover:bg-[#e09419] cursor-pointer disabled:opacity-50"
                      >
                        {savingQuota ? 'Guardando...' : 'Guardar Límite'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de Últimos 7 Días + Bitácora Reciente */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Serie 7 días */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-space text-sm font-bold text-white">Consumo Diario (7 Días)</h3>
            <span className="font-mono text-[10px] text-on-surface-variant">America/Lima</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {dailySeries.map((day) => {
              const barWidth = day.requests > 0 ? Math.max(6, Math.round((day.requests / maxDayReqs) * 100)) : 0;
              const isToday = day.date === usageData?.today_date;
              return (
                <div key={day.date} className="flex items-center gap-2.5 text-[11px]">
                  <span className={`font-mono w-20 shrink-0 ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {day.date.slice(5)}{isToday ? ' (Hoy)' : ''}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className={`h-full rounded-full ${day.errors > 0 && day.success === 0 ? 'bg-rose-500' : 'bg-primary'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="font-mono text-white w-14 text-right shrink-0">{day.requests} req</span>
                  <span className="font-mono text-on-surface-variant w-16 text-right shrink-0">
                    {formatNumber(day.tokens)} tok
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabla Bitácora Reciente */}
        <div className="xl:col-span-2 rounded-xl bg-surface-container border border-outline-variant overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-outline-variant/80 bg-surface-container-low flex items-center justify-between">
            <h3 className="font-space text-sm font-bold text-white">Bitácora Reciente de Consumo API</h3>
            <span className="font-mono text-[11px] text-on-surface-variant">
              Últimas {recentLogs.length} llamadas registradas
            </span>
          </div>

          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-xs font-jakarta text-on-surface-variant">
              Aún no hay llamadas LLM registradas en el período actual. Interactúa con <strong>FORMALIA</strong> o usa <strong>Probar Claves Conectadas</strong> para ver el consumo en tiempo real.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[340px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/70 bg-surface-container-low/60 text-[10px] font-space text-on-surface-variant uppercase tracking-wider">
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Módulo / Clave</th>
                    <th className="py-2.5 px-3">Modelo</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Tokens</th>
                    <th className="py-2.5 px-3 text-right">Latencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-xs font-jakarta">
                  {recentLogs.map((log) => (
                    <tr key={log.id || `${log.created_at}_${log.model}`} className="hover:bg-surface-container-low/40">
                      <td className="py-2 px-3 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                        {log.usage_date?.slice(5)} {formatTimeLima(log.created_at)}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-[11px] uppercase">{log.source_module}</span>
                          <span className="font-mono text-[10px] text-on-surface-variant">
                            {log.key_fingerprint || log.key_id}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-white whitespace-nowrap">
                        {log.model}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          title={log.error_message || ''}
                          className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                            log.success
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                              : log.http_status === 429
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                          }`}
                        >
                          HTTP {log.http_status || (log.success ? 200 : 500)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[11px] text-white whitespace-nowrap">
                        {formatNumber(log.total_tokens)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                        {log.latency_ms ? `${log.latency_ms} ms` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
