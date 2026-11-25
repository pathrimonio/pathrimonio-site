import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  Wand2
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
  const roles = patches.filter((p) => p.op === 'add_role').length;
  const steps = patches.filter((p) => p.op === 'add_step').length;
  const bottlenecks = patches.filter((p) => p.op === 'add_step' && p.step?.is_manual_bottleneck).length +
    patches.filter((p) => p.op === 'flag_bottleneck').length;
  const entities = patches.filter((p) => p.op === 'add_entity').length;

  const chips = [];
  if (roles > 0) chips.push(`+${roles} rol${roles > 1 ? 'es' : ''}`);
  if (steps > 0) chips.push(`+${steps} paso${steps > 1 ? 's' : ''}`);
  if (bottlenecks > 0) chips.push(`${bottlenecks} cuello${bottlenecks > 1 ? 's' : ''} de botella`);
  if (entities > 0) chips.push(`+${entities} entidad${entities > 1 ? 'es' : ''}`);
  return chips;
}

export default function FormalIAChatPanel({
  messages = [],
  completenessScore = 0,
  currentPhase = '1_context',
  turnsCount = 0,
  maxTurns = 15,
  isExtracting = false,
  errorMessage = '',
  onSendMessage,
  onResetSession,
  onLoadExample
}) {
  const [inputText, setInputText] = useState('');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isExtracting]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isExtracting || turnsCount >= maxTurns) return;
    setInputText('');
    onSendMessage(clean);
  };

  const handleQuickReply = (replyText) => {
    if (isExtracting || turnsCount >= maxTurns) return;
    onSendMessage(replyText);
  };

  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const activeQuickReplies = latestAssistantMsg?.quick_replies || [];
  const isLimitReached = turnsCount >= maxTurns;

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] dark:bg-[#111113] border-b lg:border-b-0 lg:border-r border-[#E4E4E7] dark:border-[#27272A]">
      
      {/* ── Header Entrevistador + Barra de Progreso ── */}
      <div className="p-4 border-b border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#09090B]/60 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[6px] bg-[#FFC000] text-[#09090B] flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#09090B] dark:text-[#F4F4F5] tracking-tight truncate">
                  Entrevistador FormalIA
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-[#FFFBEB] dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[#9A6700] dark:text-[#FFC000] font-mono text-[10px] font-medium">
                  {turnsCount}/{maxTurns} turnos
                </span>
              </div>
              <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] truncate">
                Describe tu operación en español; extraigo roles y carriles en vivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onLoadExample}
              disabled={isExtracting}
              title="Cargar caso ejemplo: Transportes del Norte SAC"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] hover:border-[#FFC000] text-[11px] font-medium text-[#09090B] dark:text-[#F4F4F5] transition-colors cursor-pointer"
            >
              <Wand2 size={12} className="text-[#9A6700] dark:text-[#FFC000]" />
              <span className="hidden sm:inline">Ejemplo SDD</span>
            </button>

            <button
              type="button"
              onClick={onResetSession}
              disabled={isExtracting}
              title="Reiniciar conversación y lienzo"
              className="p-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#F4F4F5] transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Barra de Completitud (0% - 100%) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Completitud del proceso
            </span>
            <span className="font-mono font-semibold text-[#09090B] dark:text-[#F4F4F5] tabular-nums">
              {completenessScore}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#E4E4E7] dark:bg-[#27272A] overflow-hidden">
            <div
              className="h-full bg-[#FFC000] transition-all duration-500 ease-out rounded-full"
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
                      ? 'bg-[#FFC000] border-[#FFC000] text-[#09090B] font-semibold'
                      : isPast
                        ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-[#9A6700] dark:text-[#FFC000]'
                        : 'bg-[#F4F4F5] dark:bg-[#18181B] border-[#E4E4E7] dark:border-[#27272A] text-[#71717A] dark:text-[#71717A]'
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
                    ? 'bg-[#09090B] dark:bg-[#F4F4F5] text-[#FFFFFF] dark:text-[#09090B] border-transparent'
                    : 'bg-[#FFFBEB] dark:bg-amber-500/10 text-[#9A6700] dark:text-[#FFC000] border-amber-200 dark:border-amber-500/30'
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3.5 py-2.5 rounded-[10px] text-[13px] leading-relaxed border ${
                    isUser
                      ? 'bg-[#09090B] dark:bg-[#27272A] text-[#FFFFFF] border-[#09090B] dark:border-[#3F3F46]'
                      : 'bg-[#FAFAFA] dark:bg-[#18181B] text-[#09090B] dark:text-[#F4F4F5] border-[#E4E4E7] dark:border-[#27272A]'
                  }`}
                >
                  {msg.content}
                </div>

                {patchChips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {patchChips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono text-[10px]"
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
            <div className="w-7 h-7 rounded-[6px] bg-[#FFFBEB] dark:bg-amber-500/10 text-[#9A6700] dark:text-[#FFC000] border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0">
              <Bot size={14} className="animate-pulse" />
            </div>
            <div className="px-3.5 py-2.5 rounded-[10px] bg-[#FAFAFA] dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] text-xs text-[#52525B] dark:text-[#A1A1AA] flex items-center gap-2">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC000] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC000] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC000] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>FormalIA está actualizando carriles y roles...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-[8px] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-[#9A6700] dark:text-[#FFC000] flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* ── Chips de Respuesta Rápida + Caja de Entrada ── */}
      <div className="p-3.5 border-t border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#09090B]/60 flex flex-col gap-2.5">
        {activeQuickReplies.length > 0 && !isLimitReached && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
              Respuestas rápidas sugeridas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeQuickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isExtracting}
                  onClick={() => handleQuickReply(reply)}
                  className="text-left px-2.5 py-1.5 rounded-[6px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] hover:border-[#FFC000] hover:bg-[#FFFBEB] dark:hover:bg-amber-500/10 text-[11px] font-medium text-[#09090B] dark:text-[#F4F4F5] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
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
                ? 'Límite de 15 turnos alcanzado — descarga tu diagrama o cotiza'
                : 'Describe qué rol recibe el pedido, qué usa (WhatsApp/Excel) y qué pasa después...'
            }
            className="flex-1 min-w-0 h-10 px-3.5 rounded-[8px] border border-[#E4E4E7] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#18181B] text-xs text-[#09090B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#FFC000] transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isExtracting || isLimitReached}
            aria-label="Enviar mensaje a FormalIA"
            className="h-10 px-4 rounded-[8px] bg-[#FFC000] hover:bg-[#E5AC00] text-[#09090B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Mapear</span>
          </button>
        </form>
      </div>
    </div>
  );
}
