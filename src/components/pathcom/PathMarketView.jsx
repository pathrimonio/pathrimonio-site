import React, { useState } from 'react';
import {
  Star,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Send,
  ShieldCheck
} from 'lucide-react';
import PathTimeline from './PathTimeline';
import { submitSiteProjectCms } from '../../services/pathcomService';

const STATUS_BADGE = {
  VALIDATED: {
    label: 'VALIDADO',
    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35'
  },
  PEER_REVIEW: {
    label: 'REVISIÓN POR PARES',
    cls: 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-border)]'
  },
  DRAFT: {
    label: 'BORRADOR',
    cls: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
  }
};

export default function PathMarketView({
  marketPaths = [],
  actor,
  onValidatePath,
  onRunAgentCommand,
  onRequireAuth,
  onNotify
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [expandedId, setExpandedId] = useState(marketPaths[0]?.id || null);
  const [ratingTargetId, setRatingTargetId] = useState(null);
  const [score, setScore] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Todas', ...Array.from(new Set(marketPaths.map((p) => p.category).filter(Boolean)))];
  const filtered =
    selectedCategory === 'Todas'
      ? marketPaths
      : marketPaths.filter((p) => p.category === selectedCategory);

  const isStaff = ['collaborator', 'admin'].includes(actor?.roleCode);

  const handleSubmitValidation = async (e, pathId) => {
    e.preventDefault();
    if (!actor?.authenticated) {
      onRequireAuth?.();
      return;
    }
    setSubmitting(true);
    try {
      await onValidatePath(pathId, { score: Number(score), feedback });
      setRatingTargetId(null);
      setFeedback('');
      setScore(5);
    } catch (err) {
      onNotify?.(err?.message || 'No se pudo registrar la validación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Filtros de categoría */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const active = cat === selectedCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] font-semibold'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {actor?.authenticated && (
          <button
            type="button"
            onClick={() =>
              onRunAgentCommand?.('Compila mis registros recientes en una guía estructurada para Pathrimonio Market')
            }
            className="btn-accent inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold cursor-pointer"
          >
            <Send size={13} />
            <span>Compilar mi ruta al Market</span>
          </button>
        )}
      </div>

      {/* Catálogo */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          const badge = STATUS_BADGE[item.status] || STATUS_BADGE.PEER_REVIEW;
          const isAuthor = Boolean(actor?.userId && item.author_user_id === actor.userId);
          const steps = Array.isArray(item.steps_json) ? item.steps_json : [];

          return (
            <div
              key={item.id}
              className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
            >
              <div className="p-5 sm:p-6 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                      {item.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-[4px] border font-mono text-[10px] font-semibold ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                    {item.is_patrimonio_validated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)] font-mono text-[10px] font-bold">
                        <Award size={11} />
                        <span>PATRIMONIO VALIDADO</span>
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                      · {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-[var(--text-primary)]">
                    <span className="inline-flex items-center gap-1">
                      <Star size={13} className="text-[var(--accent-primary)] fill-current" />
                      <strong>{Number(item.avg_rating || 0).toFixed(2)}</strong>
                      <span className="text-[var(--text-muted)]">({item.validations_count || 0})</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                      <Clock size={12} />
                      <span>{item.total_duration_minutes || 0} min</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    Autor: <strong className="text-[var(--text-primary)]">{item.author_name || item.author_user_id}</strong> · {steps.length} paso(s) auditables
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--bg-page)] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-primary)] cursor-pointer transition-colors"
                    >
                      <span>{isExpanded ? 'Ocultar recorrido' : 'Inspeccionar horas y pasos'}</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {!isAuthor && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!actor?.authenticated) {
                            onRequireAuth?.();
                            return;
                          }
                          setRatingTargetId(ratingTargetId === item.id ? null : item.id);
                        }}
                        className="btn-accent inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer"
                      >
                        <Star size={12} />
                        <span>Calificar</span>
                      </button>
                    )}

                    {isStaff && !item.is_patrimonio_validated && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await onRunAgentCommand?.(
                              `Solicitar certificación PATRIMONIO_VALIDADO para la ruta ${item.id}`
                            );
                          } catch (_) {
                            await submitSiteProjectCms({ id: item.id }, actor);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 cursor-pointer"
                      >
                        <ShieldCheck size={12} />
                        <span>Encolar certificación</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Formulario de validación por pares */}
                {ratingTargetId === item.id && (
                  <form
                    onSubmit={(e) => handleSubmitValidation(e, item.id)}
                    className="mt-2 p-4 rounded-[8px] bg-[var(--bg-page)] border border-[var(--border-strong)] flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        Califica la claridad y trazabilidad de esta ruta (1–5)
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setScore(n)}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                              score >= n
                                ? 'bg-[var(--accent-primary)] text-[var(--accent-text-on-solid)]'
                                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Comenta si los tiempos reales y pasos te resultaron aplicables..."
                      className="w-full rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRatingTargetId(null)}
                        className="px-3 py-1.5 rounded-[6px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-accent px-4 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-60"
                      >
                        {submitting ? 'Guardando...' : 'Enviar validación'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Línea de tiempo auditable antes de calificar */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-[var(--border-subtle)] bg-[var(--bg-page)]/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[var(--text-secondary)]">
                      Recorrido cronológico real vinculado ({steps.length} pasos · {item.total_duration_minutes || 0} min)
                    </span>
                  </div>
                  <PathTimeline
                    compact
                    logs={steps.map((st, idx) => ({
                      ...st,
                      id: st.log_id || `${item.id}-step-${idx}`,
                      user_name: item.author_name,
                      verified_timestamp: true
                    }))}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
