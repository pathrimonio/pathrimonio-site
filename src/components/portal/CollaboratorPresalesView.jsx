import React, { useEffect, useState } from 'react';
import {
  IMPLEMENTATION_STATUS_STEPS,
  fetchIncomingQuotes,
  updateQuoteReviewStatus,
  computeLiveDiffsAgainstBaseline
} from '../../services/platformService';
import { fetchFormaliaArchive } from '../../services/formaliaService';
import { graphToPlantUML } from '../../lib/formalia/compilers';
import BlueprintScreenRenderer from '../landing/formalia/BlueprintScreenRenderer';
import SectionInfoPopover from './SectionInfoPopover';

const QUOTE_STATUS_OPTIONS = [
  { id: 'nuevo_lead', label: 'Nuevo Lead' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'cotizacion_enviada', label: 'Cotización Formal Enviada' },
  { id: 'cerrado_ganado', label: 'Cerrado Ganado (Activar Socio)' },
  { id: 'cerrado_perdido', label: 'Archivado / No Procedió' }
];

export default function CollaboratorPresalesView({
  currentUser,
  isAdmin = false,
  implementationRequests = [],
  actors = [],
  stories = [],
  interfaces = [],
  onAdvanceImplementationStatus,
  onReviewModification,
  onNavigateTab,
  onSelectProject,
  onNotify
}) {
  const [subTab, setSubTab] = useState('requests'); // 'quotes' | 'requests' | 'dossiers'
  const [quotes, setQuotes] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [loadingDossiers, setLoadingDossiers] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [dossierOriginFilter, setDossierOriginFilter] = useState('all'); // 'all' | 'anonymous' | 'account'
  const [quoteNotesDraft, setQuoteNotesDraft] = useState('');
  const [expandedDiffReqId, setExpandedDiffReqId] = useState(null);

  const loadData = async () => {
    setLoadingQuotes(true);
    setLoadingDossiers(true);
    try {
      const [qList, dList] = await Promise.all([
        fetchIncomingQuotes(currentUser),
        fetchFormaliaArchive({
          userId: currentUser?.id || null,
          userEmail: currentUser?.email || null,
          role: currentUser?.role || 'Colaborador'
        })
      ]);
      setQuotes(qList || []);
      setDossiers(dList || []);
      if (!selectedQuote && (qList || []).length > 0) {
        setSelectedQuote(qList[0]);
        setQuoteNotesDraft(qList[0].tech_notes || '');
      }
      if (!selectedDossier && (dList || []).length > 0) {
        setSelectedDossier(dList[0]);
      }
    } finally {
      setLoadingQuotes(false);
      setLoadingDossiers(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.email, currentUser?.role]);

  const totalPendingDiffs = implementationRequests.reduce((acc, req) => {
    const diffs = computeLiveDiffsAgainstBaseline(req, actors, stories, interfaces);
    return acc + diffs.filter((d) => d.review_status === 'pending').length;
  }, 0);

  const handleSaveQuoteReview = async (nextStatus) => {
    if (!selectedQuote) return;
    const updated = await updateQuoteReviewStatus(selectedQuote.quote_id, {
      status: nextStatus || selectedQuote.status,
      techNotes: quoteNotesDraft,
      reviewerUser: currentUser
    });
    setQuotes((prev) => prev.map((q) => (q.quote_id === updated.quote_id ? updated : q)));
    setSelectedQuote(updated);
    onNotify?.(`Cotización ${updated.quote_id} actualizada.`);
  };

  const downloadTextFile = (filename, content, mime = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-jakarta text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
            Preventa, Cotizaciones & Revisión Técnica
            <SectionInfoPopover
              title="Mesa Técnica Pathrimonio"
              description="Vista operativa de Colaborador y Admin para revisar cotizaciones entrantes, aprobar cambios post-envío de clientes y descargar expedientes FORMALIA."
            />
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {isAdmin
              ? 'Acceso Administrador: supervisión técnica completa de preventa y solicitudes.'
              : 'Vista enfocada en preventa, análisis y desarrollo: las tarifas globales (pricing-config) y eliminación de socios están protegidas solo para Administrador.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab?.('architecture')}
            className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant hover:border-primary text-xs font-medium text-white cursor-pointer"
          >
            Architecture (Archifly)
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab?.('files')}
            className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant hover:border-primary text-xs font-medium text-white cursor-pointer"
          >
            Files (Métodos Abstractos)
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <div className="text-[11px] font-mono text-on-surface-variant uppercase">Cotizaciones Entrantes</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{quotes.length}</div>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <div className="text-[11px] font-mono text-on-surface-variant uppercase">Solicitudes Web</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{implementationRequests.length}</div>
        </div>
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4">
          <div className="text-[11px] font-mono text-amber-300 uppercase">Diffs por Revisar</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{totalPendingDiffs}</div>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <div className="text-[11px] font-mono text-on-surface-variant uppercase">Expedientes FORMALIA</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{dossiers.length}</div>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant pb-3">
        {[
          { id: 'requests', label: `Solicitudes & Diffs Post-Envío (${implementationRequests.length})` },
          { id: 'quotes', label: `Cotizaciones Entrantes (${quotes.length})` },
          { id: 'dossiers', label: `Expedientes FORMALIA & Blueprints (${dossiers.length})` }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === t.id
                ? 'bg-primary text-[#18181b] shadow-sm'
                : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Solicitudes Web & Diffs Post-Envío */}
      {subTab === 'requests' && (
        <div className="space-y-4">
          {implementationRequests.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 text-center text-xs text-on-surface-variant">
              No hay solicitudes de "Implementar en solución web" registradas aún.
            </div>
          ) : (
            implementationRequests.map((req) => {
              const diffs = computeLiveDiffsAgainstBaseline(req, actors, stories, interfaces);
              const pendingCount = diffs.filter((d) => d.review_status === 'pending').length;
              const isExpanded = expandedDiffReqId === req.id || pendingCount > 0;
              const statusLabel = IMPLEMENTATION_STATUS_STEPS.find((s) => s.id === req.status)?.label || req.status;

              return (
                <div
                  key={req.id}
                  className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-primary font-bold">
                          {req.id}
                        </span>
                        <h3 className="text-sm font-bold text-white">{req.title}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-[10px] font-bold text-primary">
                          {statusLabel}
                        </span>
                        {pendingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                            {pendingCount} cambio(s) post-envío sin aprobar
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        Cliente: <strong className="text-white">{req.user_name}</strong> ({req.user_email}) · Proyecto Portal: <span className="font-mono">{req.project_id}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={req.status}
                        onChange={(e) => onAdvanceImplementationStatus?.(req, e.target.value)}
                        className="bg-surface-container-highest border border-outline-variant rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                      >
                        {IMPLEMENTATION_STATUS_STEPS.map((st) => (
                          <option key={st.id} value={st.id}>
                            Estado: {st.label}
                          </option>
                        ))}
                      </select>

                      {req.project_id && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject?.(req.project_id);
                            onNavigateTab?.('stories');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant hover:border-primary text-xs text-white cursor-pointer"
                        >
                          Abrir HUs del Proyecto
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedDiffReqId(expandedDiffReqId === req.id ? null : req.id)}
                        className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface-variant hover:text-white cursor-pointer"
                      >
                        {isExpanded ? 'Ocultar detalle' : `Ver diffs (${diffs.length})`}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-2.5 pt-2 border-t border-outline-variant/60">
                      {diffs.length === 0 ? (
                        <p className="text-xs text-on-surface-variant">Sin modificaciones posteriores al snapshot enviado.</p>
                      ) : (
                        diffs.map((diff) => (
                          <div
                            key={diff.id}
                            className="p-3.5 rounded-xl bg-surface-container border border-amber-500/30 flex flex-col gap-2.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-white uppercase">
                                  {diff.entity_type} · {diff.entity_id}
                                </span>
                                <span className="text-xs font-bold text-white">{diff.entity_label}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    diff.review_status === 'approved'
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                      : diff.review_status === 'observed'
                                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                  }`}
                                >
                                  {diff.review_status === 'approved'
                                    ? 'Aprobado'
                                    : diff.review_status === 'observed'
                                      ? 'Observado'
                                      : 'Pendiente revisión'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onReviewModification?.(req, diff, 'approved', 'Validado por equipo técnico.')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold cursor-pointer"
                                >
                                  ✓ Aprobar cambio
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const note = window.prompt('Motivo u observación para el cliente:', diff.reviewer_note || '');
                                    if (note !== null) onReviewModification?.(req, diff, 'observed', note);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[11px] font-semibold cursor-pointer"
                                >
                                  Observar
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              {(diff.field_diffs || []).map((fd, i) => (
                                <div key={i} className="text-[11px] flex flex-wrap gap-2 text-on-surface-variant">
                                  <span className="font-mono text-primary">{fd.label}:</span>
                                  <span className="line-through text-rose-300/80">{String(fd.from)}</span>
                                  <span className="text-emerald-300">→ {String(fd.to)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Cotizaciones Entrantes */}
      {subTab === 'quotes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {loadingQuotes ? (
              <p className="text-xs text-on-surface-variant">Cargando cotizaciones...</p>
            ) : quotes.length === 0 ? (
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 text-center text-xs text-on-surface-variant">
                No se encontraron cotizaciones registradas aún.
              </div>
            ) : (
              quotes.map((q) => (
                <button
                  key={q.quote_id}
                  type="button"
                  onClick={() => {
                    setSelectedQuote(q);
                    setQuoteNotesDraft(q.tech_notes || '');
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedQuote?.quote_id === q.quote_id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-surface-container-low border-outline-variant hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-primary font-bold">{q.quote_id}</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] text-white font-mono">
                      ${q.pricing_summary?.monthly_total ?? 0}/mes
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {q.business_discovery?.company_name || q.lead_contact?.name || 'Empresa sin nombre'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant flex items-center justify-between mt-1">
                    <span>{q.lead_contact?.name} · {q.lead_contact?.whatsapp}</span>
                    <span className="text-primary">{q.status || 'nuevo_lead'}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-4">
            {!selectedQuote ? (
              <p className="text-xs text-on-surface-variant">Selecciona una cotización para inspeccionar su expediente técnico.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {selectedQuote.business_discovery?.company_name || selectedQuote.lead_contact?.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">
                      {selectedQuote.quote_id} · WhatsApp: {selectedQuote.lead_contact?.whatsapp} · Email: {selectedQuote.lead_contact?.email || selectedQuote.user_email || 'No provisto'}
                    </p>
                  </div>
                  <select
                    value={selectedQuote.status || 'nuevo_lead'}
                    onChange={(e) => handleSaveQuoteReview(e.target.value)}
                    className="bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {QUOTE_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant">
                    <div className="text-[10px] font-mono text-on-surface-variant">Total Mensual</div>
                    <div className="text-base font-bold font-mono text-primary">
                      ${selectedQuote.pricing_summary?.monthly_total ?? 0} USD
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant">
                    <div className="text-[10px] font-mono text-on-surface-variant">Roles / Usuarios</div>
                    <div className="text-base font-bold font-mono text-white">
                      {selectedQuote.configuration?.total_admin_users ?? 0} admin
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant">
                    <div className="text-[10px] font-mono text-on-surface-variant">Sesión FORMALIA</div>
                    <div className="text-xs font-mono text-white truncate">
                      {selectedQuote.formalia_session_id || 'Directa'}
                    </div>
                  </div>
                </div>

                {selectedQuote.configuration?.custom_requirements_note && (
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface-variant">
                    <strong className="text-white block mb-1">Requerimientos / Blueprint adjunto:</strong>
                    {selectedQuote.configuration.custom_requirements_note}
                  </div>
                )}

                {selectedQuote.engineering_handoff && (
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant text-xs space-y-1">
                    <div className="font-mono font-bold text-primary text-[11px]">Handoff Técnico Compilado</div>
                    <pre className="text-[11px] text-on-surface-variant whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
                      {JSON.stringify(selectedQuote.engineering_handoff, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[11px] font-mono text-on-surface-variant">Notas internas de Preventa / Análisis</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={quoteNotesDraft}
                      onChange={(e) => setQuoteNotesDraft(e.target.value)}
                      placeholder="Anotación de alcance técnico o seguimiento..."
                      className="flex-1 bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveQuoteReview(selectedQuote.status)}
                      className="px-4 py-2 rounded-xl bg-primary text-[#18181b] text-xs font-bold cursor-pointer"
                    >
                      Guardar Nota
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Expedientes FORMALIA (JSON, PUML, Blueprints) */}
      {subTab === 'dossiers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 space-y-2 max-h-[540px] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant mb-2">
              {[
                { id: 'all', label: `Todos (${dossiers.length})` },
                { id: 'anonymous', label: `Visitantes anónimos (${dossiers.filter((d) => !d.user_email && !d.saved_to_account).length})` },
                { id: 'account', label: `Con cuenta (${dossiers.filter((d) => Boolean(d.user_email || d.saved_to_account)).length})` }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setDossierOriginFilter(opt.id);
                    const matching = dossiers.filter((d) => {
                      const isAnon = !d.user_email && !d.saved_to_account;
                      if (opt.id === 'anonymous') return isAnon;
                      if (opt.id === 'account') return !isAnon;
                      return true;
                    });
                    if (matching.length > 0 && (!selectedDossier || !matching.some((m) => m.session_id === selectedDossier.session_id))) {
                      setSelectedDossier(matching[0]);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-space font-semibold transition-colors cursor-pointer ${
                    dossierOriginFilter === opt.id
                      ? 'bg-primary text-[#18181b]'
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {loadingDossiers ? (
              <p className="text-xs text-on-surface-variant">Cargando expedientes FORMALIA...</p>
            ) : dossiers.filter((d) => {
              const isAnon = !d.user_email && !d.saved_to_account;
              if (dossierOriginFilter === 'anonymous') return isAnon;
              if (dossierOriginFilter === 'account') return !isAnon;
              return true;
            }).length === 0 ? (
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 text-center text-xs text-on-surface-variant">
                No hay sesiones FORMALIA archivadas en este filtro.
              </div>
            ) : (
              dossiers
                .filter((d) => {
                  const isAnon = !d.user_email && !d.saved_to_account;
                  if (dossierOriginFilter === 'anonymous') return isAnon;
                  if (dossierOriginFilter === 'account') return !isAnon;
                  return true;
                })
                .map((d) => {
                  const isAnon = !d.user_email && !d.saved_to_account;
                  return (
                    <button
                      key={d.session_id}
                      type="button"
                      onClick={() => setSelectedDossier(d)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedDossier?.session_id === d.session_id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-surface-container-low border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-primary font-bold">{d.session_id}</span>
                        <div className="flex items-center gap-1.5">
                          {isAnon && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 text-[9px] font-mono font-bold">
                              Sin sesión
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-on-surface-variant">{d.completeness_score || 0}%</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-white mt-1 truncate">
                        {d.process_graph?.business_context?.company_name || d.workspace_name || 'Empresa'} — {d.canvas_title || d.process_name || 'Proceso'}
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                        {d.user_email || 'Visitante anónimo (recopilado)'}
                        {d.project_id ? ` · ${d.project_id}` : ''} · {(d.messages || []).length} msgs · {(d.process_graph?.steps || []).length} pasos
                      </div>
                    </button>
                  );
                })
            )}
          </div>

          <div className="lg:col-span-8 rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-4">
            {!selectedDossier ? (
              <p className="text-xs text-on-surface-variant">Selecciona un expediente para inspeccionar su chat, JSON, .puml y Web Blueprint.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {selectedDossier.process_graph?.business_context?.company_name || selectedDossier.workspace_name || 'Expediente FORMALIA'}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">
                      {selectedDossier.session_id} · Usuario: {selectedDossier.user_email || 'Visitante sin sesión (Recopilado)'}
                      {selectedDossier.project_id ? ` · Proyecto: ${selectedDossier.project_id}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        downloadTextFile(
                          `${selectedDossier.session_id}.puml`,
                          graphToPlantUML(selectedDossier.process_graph || {})
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant hover:border-primary text-xs font-mono text-white cursor-pointer"
                    >
                      Descargar .PUML
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadTextFile(
                          `${selectedDossier.session_id}.json`,
                          JSON.stringify(selectedDossier.process_graph || {}, null, 2),
                          'application/json'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant hover:border-primary text-xs font-mono text-primary cursor-pointer"
                    >
                      Descargar .JSON
                    </button>
                  </div>
                </div>

                {(selectedDossier.messages || []).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-primary font-bold">
                      Chat Recopilado ({selectedDossier.messages.length} mensajes)
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container border border-outline-variant space-y-2 max-h-48 overflow-y-auto">
                      {selectedDossier.messages.map((m, idx) => (
                        <div key={m.id || idx} className="text-xs">
                          <span className={`font-mono font-bold mr-1.5 ${m.role === 'user' ? 'text-amber-300' : 'text-cyan-300'}`}>
                            {m.role === 'user' ? 'Usuario:' : 'FORMALIA:'}
                          </span>
                          <span className="text-on-surface-variant">{m.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-primary font-bold">PlantUML Generado</div>
                  <pre className="p-3 rounded-xl bg-surface-container border border-outline-variant text-[11px] text-on-surface-variant font-mono max-h-52 overflow-y-auto whitespace-pre-wrap">
                    {graphToPlantUML(selectedDossier.process_graph || {})}
                  </pre>
                </div>

                {implementationRequests.find((r) => r.session_id === selectedDossier.session_id)?.web_blueprint?.ui_screens?.[0] && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-primary font-bold">Maquetación UI del Blueprint Adjunto</div>
                    <BlueprintScreenRenderer
                      screen={implementationRequests.find((r) => r.session_id === selectedDossier.session_id).web_blueprint.ui_screens[0]}
                      themeConfig={implementationRequests.find((r) => r.session_id === selectedDossier.session_id).web_blueprint.theme_config}
                      editable={false}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
