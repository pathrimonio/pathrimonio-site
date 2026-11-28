import React, { useState } from 'react';
import { Check, X, ShieldAlert, Clock } from 'lucide-react';
import { formatPathTimestamp } from '../../services/pathcomService';

export default function PathcomApprovalsQueue({
  approvals = [],
  actor,
  onResolveApproval
}) {
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});

  const pendingItems = approvals.filter((a) => a.status === 'PENDING');
  const resolvedItems = approvals.filter((a) => a.status !== 'PENDING');

  const handleDecision = async (item, status) => {
    setBusyId(item.id);
    try {
      await onResolveApproval({
        id: item.id,
        status,
        review_note: notes[item.id] || ''
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Bandeja de Aprobaciones Human-in-the-Loop
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Ningún cambio CMS o certificación comercial llega a producción sin aprobación explícita.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-[6px] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent-text)] font-mono tabular-nums text-xs font-bold">
          {pendingItems.length} pendiente(s)
        </span>
      </div>

      {pendingItems.length === 0 ? (
        <div className="p-6 rounded-[10px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] text-center">
          No hay solicitudes pendientes en <code className="font-mono">pathcom_action_queue</code>.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pendingItems.map((item) => {
            const payload = item.payload_json || {};
            const prev = payload.previous_live;
            const next = payload.proposed_live;
            const ts = formatPathTimestamp(item.created_at);
            const adminOnlyBlocked =
              payload.requires_admin_certification && actor?.roleCode !== 'admin';

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-[12px] border border-[var(--accent-border)] bg-[var(--bg-surface)] flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent-text)]">
                      {item.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] font-mono text-[10px] text-[var(--text-primary)]">
                      {item.tool_name}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] inline-flex items-center gap-1">
                      <Clock size={11} />
                      <span>{ts.compact}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                    Solicitado por {item.requested_by_email || item.requested_by_role}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {item.action_summary}
                </p>

                {/* Vista previa legible del cambio (Diff) */}
                {next && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-[8px] bg-[var(--bg-page)] border border-[var(--border-subtle)]">
                      <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] block mb-1">
                        Estado actual en vivo
                      </span>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {prev?.name || 'Sin publicación previa'}
                      </div>
                      <p className="text-[var(--text-secondary)] mt-1">
                        {prev?.public_summary || '—'}
                      </p>
                    </div>
                    <div className="p-3 rounded-[8px] bg-[var(--bg-page)] border border-[var(--accent-border)]">
                      <span className="font-mono text-[10px] uppercase text-[var(--accent-text)] block mb-1">
                        Cambio propuesto tras aprobar
                      </span>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {next.name} ({next.status})
                      </div>
                      <p className="text-[var(--text-secondary)] mt-1">{next.public_summary}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
                  <input
                    type="text"
                    value={notes[item.id] || ''}
                    onChange={(e) => setNotes((p) => ({ ...p, [item.id]: e.target.value }))}
                    placeholder="Nota opcional de revisión..."
                    className="flex-1 rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => handleDecision(item, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <X size={13} />
                      <span>Rechazar</span>
                    </button>

                    <button
                      type="button"
                      disabled={busyId === item.id || adminOnlyBlocked}
                      title={
                        adminOnlyBlocked
                          ? 'La certificación comercial PATRIMONIO_VALIDADO requiere rol Admin'
                          : 'Aprobar y aplicar cambio'
                      }
                      onClick={() => handleDecision(item, 'APPROVED')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#FFC000] hover:bg-[#e5ad00] text-[#09090B] text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      <span>{busyId === item.id ? 'Aplicando...' : 'Aprobar'}</span>
                    </button>
                  </div>
                </div>

                {adminOnlyBlocked && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                    <ShieldAlert size={13} />
                    <span>Requiere rol Admin para aprobar esta certificación comercial.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {resolvedItems.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Historial reciente ({resolvedItems.length})
          </h4>
          <div className="space-y-2">
            {resolvedItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="px-3.5 py-2.5 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <span className="text-[var(--text-primary)] font-medium">{item.action_summary}</span>
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'APPROVED'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {item.status} · {item.reviewed_by || 'staff'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
