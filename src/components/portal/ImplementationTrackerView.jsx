import React, { useMemo, useState } from 'react';
import {
  IMPLEMENTATION_STATUS_STEPS,
  computeLiveDiffsAgainstBaseline
} from '../../services/platformService';
import BlueprintScreenRenderer from '../landing/formalia/BlueprintScreenRenderer';
import SectionInfoPopover from './SectionInfoPopover';

const DIFF_KIND_BADGES = {
  created: {
    label: 'Nuevo post-envío',
    cls: 'bg-sky-500/15 text-sky-300 border-sky-500/35'
  },
  updated: {
    label: 'Editado post-envío',
    cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40'
  },
  deleted: {
    label: 'Eliminado post-envío',
    cls: 'bg-rose-500/15 text-rose-300 border-rose-500/40'
  }
};

const REVIEW_STATUS_BADGES = {
  pending: {
    label: 'Pendiente revisión técnica',
    cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40'
  },
  approved: {
    label: 'Aprobado por equipo técnico',
    cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
  },
  observed: {
    label: 'Observado por equipo técnico',
    cls: 'bg-rose-500/15 text-rose-300 border-rose-500/40'
  }
};

export default function ImplementationTrackerView({
  currentUser,
  requests = [],
  projects = [],
  actors = [],
  stories = [],
  interfaces = [],
  activeProjectId = null,
  onSelectProject,
  onNavigateTab,
  canReview = false,
  onAdvanceStatus,
  onReviewDiff
}) {
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [showBlueprintPreview, setShowBlueprintPreview] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  const scopedRequests = useMemo(() => {
    if (canReview && activeProjectId) {
      const byProj = requests.filter((r) => r.project_id === activeProjectId);
      if (byProj.length > 0) return byProj;
    }
    if (canReview) return requests;
    const email = String(currentUser?.email || '').trim().toLowerCase();
    return requests.filter((r) => String(r.user_email || '').trim().toLowerCase() === email);
  }, [requests, canReview, activeProjectId, currentUser?.email]);

  const activeRequest = useMemo(() => {
    if (selectedReqId) {
      const found = scopedRequests.find((r) => r.id === selectedReqId);
      if (found) return found;
    }
    if (activeProjectId) {
      const byProj = scopedRequests.find((r) => r.project_id === activeProjectId);
      if (byProj) return byProj;
    }
    return scopedRequests[0] || null;
  }, [scopedRequests, selectedReqId, activeProjectId]);

  const liveDiffs = useMemo(() => {
    if (!activeRequest) return [];
    return computeLiveDiffsAgainstBaseline(activeRequest, actors, stories, interfaces);
  }, [activeRequest, actors, stories, interfaces]);

  const pendingDiffCount = liveDiffs.filter((d) => d.review_status === 'pending').length;
  const activeStepIndex = activeRequest
    ? Math.max(0, IMPLEMENTATION_STATUS_STEPS.findIndex((s) => s.id === activeRequest.status))
    : 0;

  const openProjectTab = (tabId) => {
    if (activeRequest?.project_id && onSelectProject) {
      onSelectProject(activeRequest.project_id);
    }
    onNavigateTab?.(tabId);
  };

  if (scopedRequests.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-jakarta text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">rocket_launch</span>
              Estado de Implementación Web & Cambios
              <SectionInfoPopover
                title="Seguimiento de Solicitud Web"
                description="Controla el nivel de atención de tus proyectos enviados desde 'Implementar en solución web' en FORMALIA."
              />
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Aquí verás cada solicitud enviada desde FORMALIA, su avance hasta entrega y las diferencias modificadas después del envío.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">auto_awesome_motion</span>
          </div>
          <div className="max-w-lg mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-white">Aún no has enviado un proyecto desde FORMALIA</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Entra a la sección <strong className="text-white">FORMALIA Studio</strong>, conversa tu proceso o abre <strong className="text-primary">"Implementar en solución web"</strong> para generar tus Historias, Tema y Maquetación y enviarlas aquí.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab?.('formalia')}
              className="px-4 py-2 rounded-xl bg-primary text-[#18181b] font-semibold text-xs hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              Ir a FORMALIA Studio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bp = activeRequest?.web_blueprint || {};
  const snap = activeRequest?.submitted_snapshot || {};

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-jakarta text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
            Estado de Solicitud Web & Diffs Post-Envío
            <SectionInfoPopover
              title="Línea Base vs Modificaciones Post-Envío"
              description="Todo lo que envías desde 'Implementar en solución web' queda guardado como línea base inmutable. Cualquier edición posterior en Actores, Historias o Interfaces se resalta visualmente y requiere revisión técnica."
            />
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Trazabilidad completa desde tu envío en FORMALIA hasta desarrollo, con revisión técnica por cada cambio posterior.
          </p>
        </div>

        {scopedRequests.length > 1 && (
          <select
            value={activeRequest?.id || ''}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
          >
            {scopedRequests.map((req) => (
              <option key={req.id} value={req.id}>
                {req.id} — {req.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Acceso directo a las 4 subvistas habilitadas */}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
              {activeRequest.id} · Proyecto {activeRequest.project_id}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant text-[10px] font-mono text-white">
              {projects.find((p) => p.id === activeRequest.project_id)?.name || activeRequest.title}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Edita libremente tus 4 módulos habilitados del Portal; cualquier ajuste posterior al envío quedará marcado para revisión del equipo Pathrimonio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'actors', label: 'Actores', icon: 'groups' },
            { id: 'stories', label: 'Historias HU', icon: 'menu_book' },
            { id: 'interfaces', label: 'Interfaces UI', icon: 'web' },
            { id: 'formalia', label: 'FORMALIA', icon: 'hub' }
          ].map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => openProjectTab(sub.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">{sub.icon}</span>
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Visual de Atención */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Nivel de Atención de la Solicitud</h3>
            <p className="text-[11px] text-on-surface-variant">
              Enviada el {new Date(activeRequest.created_at || Date.now()).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              {activeRequest.quote_id ? ` · Vinculada a Cotización ${activeRequest.quote_id}` : ''}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary text-xs font-bold font-mono">
            {IMPLEMENTATION_STATUS_STEPS[activeStepIndex]?.label || activeRequest.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {IMPLEMENTATION_STATUS_STEPS.map((st, idx) => {
            const done = idx <= activeStepIndex;
            const current = idx === activeStepIndex;
            return (
              <div
                key={st.id}
                className={`p-3 rounded-xl border transition-all ${
                  current
                    ? 'bg-primary/15 border-primary text-white shadow-sm'
                    : done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-surface-container border-outline-variant/60 text-on-surface-variant opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-[10px] font-bold">PASO {idx + 1}</span>
                  <span className="material-symbols-outlined text-[15px]">
                    {current ? 'pending' : done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-snug">{st.label}</p>
              </div>
            );
          })}
        </div>

        {canReview && onAdvanceStatus && (
          <div className="pt-3 border-t border-outline-variant/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex-1 min-w-[220px]">
              <input
                type="text"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Nota técnica o de cotización para el cliente (opcional)..."
                className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {IMPLEMENTATION_STATUS_STEPS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  disabled={st.id === activeRequest.status}
                  onClick={() => {
                    onAdvanceStatus(activeRequest, st.id, reviewNote);
                    setReviewNote('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-outline-variant bg-surface-container hover:border-primary text-[11px] text-white disabled:opacity-35 cursor-pointer"
                >
                  Mover a: {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeRequest.reviewer_notes && (
          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface-variant">
            <span className="text-primary font-semibold">Nota del equipo Pathrimonio: </span>
            {activeRequest.reviewer_notes}
          </div>
        )}
      </div>

      {/* Comparativa: Línea Base Inmutable vs Diferencias Live en Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Columna izquierda: Resumen de lo enviado */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              Snapshot Inmutable Enviado
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant">
                <div className="text-lg font-bold font-mono text-white">{(snap.actors || []).length}</div>
                <div className="text-[10px] text-on-surface-variant">Actores base</div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant">
                <div className="text-lg font-bold font-mono text-white">{(snap.stories || []).length}</div>
                <div className="text-[10px] text-on-surface-variant">Historias base</div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant">
                <div className="text-lg font-bold font-mono text-white">{(snap.interfaces || []).length}</div>
                <div className="text-[10px] text-on-surface-variant">Interfaces base</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Blueprint ID:</span>
                <span className="font-mono text-white">{bp.blueprint_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tema elegido:</span>
                <span className="font-mono text-primary">{bp.theme_config?.preset || 'minimal_dark'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Pantallas UI diseñadas:</span>
                <span className="font-mono text-white">{(bp.ui_screens || []).length}</span>
              </div>
            </div>

            {(bp.ui_screens || []).length > 0 && (
              <button
                type="button"
                onClick={() => setShowBlueprintPreview(!showBlueprintPreview)}
                className="w-full py-2 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-xs font-semibold text-primary cursor-pointer"
              >
                {showBlueprintPreview ? 'Ocultar vista previa Web Blueprint' : 'Ver Web Blueprint enviado'}
              </button>
            )}
          </div>
        </div>

        {/* Columna derecha: Detalle visual de Modificaciones Post-Envío */}
        <div className="lg:col-span-8 rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">difference</span>
                Cambios Post-Envío Detectados ({liveDiffs.length})
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Cada creación, edición o eliminación sobre tus Actores, Historias o Interfaces posteriores al envío aparece aquí marcada para revisión técnica.
              </p>
            </div>
            {pendingDiffCount > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                {pendingDiffCount} pendiente(s) de revisión técnica
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold">
                Sin cambios pendientes
              </span>
            )}
          </div>

          {liveDiffs.length === 0 ? (
            <div className="p-6 rounded-xl bg-surface-container border border-outline-variant text-center text-xs text-on-surface-variant">
              Los registros actuales del Portal coinciden al 100% con el paquete original enviado desde FORMALIA. Si editas una Historia, Actor o Interfaz en el Portal, las diferencias aparecerán automáticamente aquí.
            </div>
          ) : (
            <div className="space-y-3">
              {liveDiffs.map((diff) => {
                const kindMeta = DIFF_KIND_BADGES[diff.change_kind] || DIFF_KIND_BADGES.updated;
                const revMeta = REVIEW_STATUS_BADGES[diff.review_status] || REVIEW_STATUS_BADGES.pending;

                return (
                  <div
                    key={diff.id}
                    className="rounded-xl border border-amber-500/30 bg-surface-container p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-white uppercase">
                          {diff.entity_type} · {diff.entity_id}
                        </span>
                        <span className="text-xs font-bold text-white">{diff.entity_label}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${kindMeta.cls}`}>
                          {kindMeta.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${revMeta.cls}`}>
                          {revMeta.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {(diff.field_diffs || []).map((fd, fIdx) => (
                        <div
                          key={fIdx}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[11px] rounded-lg bg-surface-container-low p-2.5 border border-outline-variant/60"
                        >
                          <div className="md:col-span-3 font-mono font-semibold text-primary">
                            {fd.label}
                          </div>
                          <div className="md:col-span-4 text-rose-300/90 line-through break-words">
                            {String(fd.from || '—')}
                          </div>
                          <div className="md:col-span-5 text-emerald-300 font-medium break-words">
                            → {String(fd.to || '—')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {diff.reviewer_note && (
                      <div className="text-[11px] text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant">
                        <strong className="text-white">Observación técnica:</strong> {diff.reviewer_note}
                      </div>
                    )}

                    {canReview && onReviewDiff && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onReviewDiff(activeRequest, diff, 'approved')}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold cursor-pointer"
                        >
                          ✓ Aprobar cambio
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const note = window.prompt('Ingresa la observación técnica para este cambio:', diff.reviewer_note || '');
                            if (note !== null) onReviewDiff(activeRequest, diff, 'observed', note);
                          }}
                          className="px-3 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[11px] font-semibold cursor-pointer"
                        >
                          Observar / Ajustar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Blueprint si el cliente lo expande */}
      {showBlueprintPreview && (bp.ui_screens || []).length > 0 && (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Previsualización Declarativa de Pantallas del Blueprint</h3>
          <div className="space-y-4">
            {bp.ui_screens.map((scr) => (
              <BlueprintScreenRenderer
                key={scr.screen_id}
                screen={scr}
                themeConfig={bp.theme_config}
                editable={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
