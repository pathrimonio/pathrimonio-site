import React from 'react';
import { Clock, CheckCircle2, Globe, Smartphone, ShieldCheck } from 'lucide-react';
import { formatPathTimestamp } from '../../services/pathcomService';

/**
 * Línea de tiempo cronológica vertical con fecha y hora exacta en formato tabular-nums.
 */
export default function PathTimeline({
  logs = [],
  emptyText = 'Aún no hay registros cronológicos en esta ruta.',
  compact = false
}) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 rounded-[10px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] text-center text-xs text-[var(--text-secondary)]">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="relative pl-5 sm:pl-6 space-y-4">
      <div
        aria-hidden="true"
        className="absolute left-[9px] top-2 bottom-2 w-px bg-[var(--border-strong)]"
      />

      {logs.map((item, idx) => {
        const ts = formatPathTimestamp(item.recorded_at, item.client_timezone || 'America/Lima');
        const isPathway = String(item.source || 'WEB').toUpperCase() === 'PATHWAY';
        const progress = Math.min(100, Math.max(0, Number(item.progress_percent ?? 0)));

        return (
          <div key={item.id || item.log_id || idx} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-5 sm:-left-6 top-3.5 w-3 h-3 rounded-full border-2 border-[var(--bg-page)] ${
                isPathway ? 'bg-[#38BDF8]' : 'bg-[var(--accent-primary)]'
              }`}
            />

            <article
              className={`rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--border-strong)] ${
                compact ? 'p-3.5' : 'p-4 sm:p-5'
              }`}
            >
              {/* Cabecera con fecha, hora exacta HH:mm en tabular-nums y origen */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[var(--border-subtle)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] px-2.5 py-0.5 rounded-[5px] border border-[var(--border-subtle)]">
                    <Clock size={12} className="text-[var(--accent-text)]" />
                    <span>{ts.compact}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-semibold uppercase tracking-wider border ${
                      isPathway
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        : 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-border)]'
                    }`}
                  >
                    {isPathway ? <Smartphone size={10} /> : <Globe size={10} />}
                    <span>{isPathway ? 'Pathway' : 'Web'}</span>
                  </span>

                  {item.verified_timestamp !== false && (
                    <span
                      title={`Sello temporal verificado (${ts.timeZone})`}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-500"
                    >
                      <ShieldCheck size={11} />
                      <span>Verificado</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-[11px] font-mono tabular-nums text-[var(--text-secondary)]">
                  {item.duration_minutes !== null && item.duration_minutes !== undefined && (
                    <span>{item.duration_minutes} min</span>
                  )}
                  <span className="font-bold text-[var(--text-primary)]">{progress}%</span>
                </div>
              </div>

              {/* Contenido del paso */}
              <h4 className="text-sm font-semibold text-[var(--text-primary)] leading-snug mb-1">
                {item.title}
              </h4>
              {item.content && (
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                  {item.content}
                </p>
              )}

              {/* Barra discreta de progreso + autor */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {item.user_name && (
                  <span className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-[180px] inline-flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-[var(--accent-text)] shrink-0" />
                    <span>{item.user_name}</span>
                  </span>
                )}
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}
