import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  Wand2,
  Save
} from 'lucide-react';

const PHASE_LABELS = [
  { id: '1_context', short: '1. Contexto' },
  { id: '2_roles_steps', short: '2. Roles' },
  { id: '3_handoffs_data', short: '3. Traspasos' },
  { id: '4_gaps_validation', short: '4. Vacíos' },
  { id: '5_synthesis', short: '5. Cierre' }
];

function summarizePatches(patches = []) {
  if (!patches || patches.length === 0) return [];
  const contextPatch = patches.find((p) => p.op === 'set_context' && p.process_name);
  const roles = patches.filter((p) => p.op === 'add_role').length;
  const steps = patches.filter((p) => p.op === 'add_step').length;
  const updated = patches.filter((p) => p.op === 'update_step' || p.op === 'update_role').length;
  const removed = patches.filter((p) => p.op === 'remove_step' || p.op === 'remove_role').length;
  const bottlenecks = patches.filter((p) => p.op === 'add_step' && p.step?.is_manual_bottleneck).length +
    patches.filter((p) => p.op === 'flag_bottleneck').length;
  const entities = patches.filter((p) => p.op === 'add_entity').length;

  const chips = [];
  if (contextPatch?.process_name && steps === 0 && roles === 0) {
    chips.push(`Tema: ${contextPatch.process_name}`);
  }
  if (roles > 0) chips.push(`+${roles} rol${roles > 1 ? 'es' : ''}`);
  if (steps > 0) chips.push(`+${steps} paso${steps > 1 ? 's' : ''}`);
  if (updated > 0) chips.push(`~${updated} ajuste${updated > 1 ? 's' : ''}`);
  if (removed > 0) chips.push(`-${removed} quitado${removed > 1 ? 's' : ''}`);
  if (bottlenecks > 0) chips.push(`${bottlenecks} cuello${bottlenecks > 1 ? 's' : ''} de botella`);
  if (entities > 0) chips.push(`+${entities} entidad${entities > 1 ? 'es' : ''}`);
  return chips;
}

export default function FormalIAChatPanel({
  messages = [],
  completenessScore = 0,
  currentPhase = '1_context',
  turnsCount = 0,
  maxTurns = 5,
  quota = null,
  isExtracting = false,
  errorMessage = '',
  hasUnsavedContent = false,
  isSavedToAccount = false,
  savedAccountEmail = '',
  onSendMessage,
  onResetSession,
  onLoadExample,
  onSaveSession,
  onOpenPortal
}) {
  const [inputText, setInputText] = useState('');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isExtracting]);

  const effectiveLimit = quota?.daily_limit || maxTurns || 5;
  const remainingTurns =
    typeof quota?.remaining_turns === 'number'
      ? quota.remaining_turns
      : Math.max(0, effectiveLimit - (turnsCount || 0));
  const usedTurns =
    typeof quota?.used_turns === 'number'
      ? quota.used_turns
      : (turnsCount || 0);
  const isAuthenticatedQuota = Boolean(quota?.is_authenticated || isSavedToAccount);
  const isLimitReached = remainingTurns <= 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isExtracting || isLimitReached) return;
    setInputText('');
    onSendMessage(clean);
  };

  const handleQuickReply = (replyText) => {
    if (isExtracting || isLimitReached) return;
    onSendMessage(replyText);
  };

  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const activeQuickReplies = latestAssistantMsg?.quick_replies || [];

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--bg-surface)] border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">

      {/* ── Header Entrevistador + Barra de Progreso ── */}
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-page)] flex flex-col gap-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[6px] bg-[#FFC93C] text-[#2B2D31] flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight truncate">
                  Entrevistador FORMALIA
                </h3>
                <span
                  title={
                    isAuthenticatedQuota
                      ? `Cuota diaria de IA (se reinicia a las 00:00 UTC). Edición manual ilimitada.`
                      : `Modo prueba anónimo (${effectiveLimit} turnos IA). Inicia sesión para 15 turnos/día.`
                  }
                  className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-medium ${
                    isLimitReached
                      ? 'bg-red-500/15 border-red-500/40 text-red-300'
                      : 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]'
                  }`}
                >
                  {remainingTurns}/{effectiveLimit} IA disp.
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] truncate">
                Conversa sobre tu negocio; vamos detallando el diagrama paso a paso
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onLoadExample}
              disabled={isExtracting}
              title="Cargar caso ejemplo: Transportes del Norte SAC"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-[#FFC93C] text-[11px] font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Wand2 size={12} className="text-[var(--accent-text)]" />
              <span className="hidden sm:inline">Ejemplo SDD</span>
            </button>

            {/* Guardar conversación / Estado guardado */}
            {onSaveSession && (
              <button
                type="button"
                onClick={onSaveSession}
                disabled={isExtracting || (!hasUnsavedContent && !isSavedToAccount)}
                title={
                  isSavedToAccount
                    ? `Conversación guardada en ${savedAccountEmail || 'tu cuenta'}`
                    : hasUnsavedContent
                      ? 'Crear cuenta o ingresar para guardar esta conversación'
                      : 'Envía al menos 1 mensaje para poder guardar'
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] border text-[11px] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSavedToAccount
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : hasUnsavedContent
                      ? 'border-[#FFC93C] bg-[#FFC93C] text-[#2B2D31] hover:bg-[#FFD561]'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                }`}
              >
                {isSavedToAccount ? <CheckCircle2 size={12} /> : <Save size={12} />}
                <span className="hidden sm:inline">{isSavedToAccount ? 'Guardado' : 'Guardar'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onResetSession}
              disabled={isExtracting}
              title="Reiniciar conversación y lienzo"
              className="p-1.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Barra de Completitud (0% - 100%) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[var(--text-secondary)]">
              Completitud del proceso
            </span>
            <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
              {completenessScore}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
            <div
              className="h-full bg-[#FFC93C] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, completenessScore))}%` }}
            />
          </div>

          {/* Indicador de fases de la máquina de estados */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            {PHASE_LABELS.map((phase) => {
              const isActive = currentPhase === phase.id;
              const phaseIdx = PHASE_LABELS.findIndex((p) => p.id === phase.id);
              const currentIdx = PHASE_LABELS.findIndex((p) => p.id === currentPhase);
              const isPast = phaseIdx < currentIdx;

              return (
                <span
                  key={phase.id}
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono whitespace-nowrap border transition-colors ${
                    isActive
                      ? 'bg-[#FFC93C] border-[#FFC93C] text-[#2B2D31] font-semibold'
                      : isPast
                        ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {phase.short}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Historial de Conversación ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px] max-h-[420px] lg:max-h-none"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const patchChips = !isUser ? summarizePatches(msg.graph_patch) : [];

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 border ${
                  isUser
                    ? 'bg-[var(--bg-silver)] text-[var(--text-on-silver)] border-transparent'
                    : 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-border)]'
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3.5 py-2.5 rounded-[10px] text-[13px] leading-relaxed border ${
                    isUser
                      ? 'bg-[var(--bg-silver)] text-[var(--text-on-silver)] border-[var(--border-silver)] font-medium'
                      : 'bg-[var(--bg-page)] text-[var(--text-primary)] border-[var(--border-subtle)]'
                  }`}
                >
                  {msg.content}
                </div>

                {patchChips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {patchChips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]"
                      >
                        <CheckCircle2 size={10} />
                        <span>{chip}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isExtracting && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-[6px] bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
              <Bot size={14} className="animate-pulse" />
            </div>
            <div className="px-3.5 py-2.5 rounded-[10px] bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>FORMALIA está actualizando carriles y roles...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-[8px] bg-[var(--accent-soft)] border border-[var(--accent-border)] text-xs text-[var(--accent-text)] flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* ── Chips de Respuesta Rápida + Caja de Entrada ── */}
      <div className="p-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-page)] flex flex-col gap-2.5">
        {activeQuickReplies.length > 0 && !isLimitReached && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Respuestas rápidas sugeridas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeQuickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isExtracting}
                  onClick={() => handleQuickReply(reply)}
                  className="text-left px-2.5 py-1.5 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#FFC93C] text-[11px] font-medium text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Banner Guardar o estado sincronizado con cuenta */}
        {onSaveSession && hasUnsavedContent && !isSavedToAccount && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-[8px] bg-[#FFC93C]/10 border border-[#FFC93C]/30">
            <div className="flex items-center gap-2 min-w-0">
              <Save size={13} className="text-[#FFC93C] shrink-0" />
              <span className="text-[11px] text-[var(--text-secondary)] leading-tight">
                <strong className="text-[var(--text-primary)]">Guarda esta conversación</strong>{' '}
                creando una cuenta para retomar tu chat luego en el Portal.
              </span>
            </div>
            <button
              type="button"
              onClick={onSaveSession}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-[#FFC93C] text-[#2B2D31] text-[11px] font-semibold hover:bg-[#FFD561] transition-colors cursor-pointer"
            >
              <Save size={11} />
              <span>Guardar</span>
            </button>
          </div>
        )}

        {onSaveSession && isSavedToAccount && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-[8px] bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 min-w-0 truncate">
              <CheckCircle2 size={12} className="shrink-0" />
              <span className="truncate">
                Guardado en <strong>{savedAccountEmail || 'tu cuenta'}</strong> · sincronización automática
              </span>
            </span>
            {onOpenPortal && (
              <button
                type="button"
                onClick={onOpenPortal}
                className="shrink-0 text-[11px] font-semibold text-[#FFC93C] hover:underline cursor-pointer whitespace-nowrap"
              >
                Ir al Portal →
              </button>
            )}
          </div>
        )}

        {isLimitReached && (
          <div className="p-3 rounded-[8px] bg-[#FFC93C]/10 border border-[#FFC93C]/40 flex flex-col gap-2">
            <div className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
              <AlertTriangle size={14} className="text-[#FFC93C] shrink-0 mt-0.5" />
              <span>
                {isAuthenticatedQuota
                  ? `Usaste tus ${effectiveLimit} turnos de IA de hoy (${usedTurns}/${effectiveLimit}); se renuevan mañana (00:00 UTC). Puedes seguir editando tus diagramas, historias y maquetas manualmente.`
                  : 'Agotaste los 5 turnos de prueba con IA en esta sesión. Inicia sesión gratis para conservar tu diagrama y obtener 15 turnos diarios de IA, o edita tu diagrama manualmente.'}
              </span>
            </div>
            {!isAuthenticatedQuota && onSaveSession && (
              <button
                type="button"
                onClick={onSaveSession}
                className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FFC93C] text-[#2B2D31] text-[11px] font-bold hover:bg-[#FFD561] cursor-pointer"
              >
                <Save size={12} />
                <span>Iniciar sesión para 15 turnos diarios</span>
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isExtracting || isLimitReached}
            placeholder={
              isLimitReached
                ? isAuthenticatedQuota
                  ? 'Turnos de IA de hoy agotados — usa las herramientas manuales sin límite'
                  : '5 turnos gratuitos usados — inicia sesión para 15/día o edita manualmente'
                : 'Cuéntame qué proceso quieres graficar o detalla un rol, paso o cambio...'
            }
            className="flex-1 min-w-0 h-10 px-3.5 rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#FFC93C] transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isExtracting || isLimitReached}
            aria-label="Enviar mensaje a FORMALIA"
            className="h-10 px-4 rounded-[8px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
}
