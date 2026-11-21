import React, { useState } from 'react';

export default function InterfaceCard({
  item,
  onEdit,
  onDuplicate,
  onDelete,
  onQuickStatusChange,
  onToggleCriterion
}) {
  const [showCriteria, setShowCriteria] = useState(false);

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aprobado por Cliente':
      case 'Aprobado':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: 'verified',
          label: 'Aprobado por Cliente'
        };
      case 'En Revisión':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          dot: 'bg-sky-400 animate-pulse',
          icon: 'hourglass_top',
          label: 'En Revisión de Diseño'
        };
      case 'Rechazado':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          dot: 'bg-red-400',
          icon: 'cancel',
          label: 'Requiere Ajustes'
        };
      case 'Deprecado':
        return {
          bg: 'bg-zinc-800 border-zinc-700 text-zinc-400',
          dot: 'bg-zinc-500',
          icon: 'archive',
          label: 'Deprecado'
        };
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          icon: 'edit_note',
          label: 'Borrador Técnico'
        };
    }
  };

  // Priority badge styling helper
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Bloqueante':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'Alta':
        return 'text-primary border-primary/30 bg-primary/10';
      case 'Media':
        return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
      default:
        return 'text-on-surface-variant border-outline-variant bg-surface-container';
    }
  };

  const statusMeta = getStatusBadge(item.status);
  const priorityClass = getPriorityBadge(item.priority);

  // Acceptance criteria completion
  const criteriaList = item.visualCriteria || [];
  const checkedCount = criteriaList.filter(c => c.checked).length;
  const totalCriteria = criteriaList.length;
  const progressPercent = totalCriteria > 0 ? Math.round((checkedCount / totalCriteria) * 100) : 0;

  return (
    <article className="group bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-4 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-lg">
      
      {/* Top Header: ID, Platform, Priority & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-outline-variant/60 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-space font-mono text-sm font-bold text-primary px-2.5 py-0.5 rounded bg-surface-container-highest border border-primary/30">
            {item.id}
          </span>
          <span className="font-space text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-on-surface-variant font-medium">
            {item.platform}
          </span>
          <span className="font-space text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/60 text-white/80 font-mono">
            {item.interfaceType}
          </span>
          <span className={`font-space text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-semibold ${priorityClass}`}>
            {item.priority}
          </span>
        </div>

        {/* Status Pill */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-space font-medium ${statusMeta.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}></span>
          <span className="material-symbols-outlined text-[14px]">{statusMeta.icon}</span>
          <span>{statusMeta.label}</span>
        </div>
      </div>

      {/* Screen Title & Module */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-space text-base sm:text-lg font-bold text-white group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <span className="font-mono text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded shrink-0">
            {item.version || 'v1.0'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[15px] text-primary">category</span>
          <span className="font-medium text-white/90">{item.module}</span>
          <span>•</span>
          <span>Autor: {item.author}</span>
        </div>
      </div>

      {/* Description & User Goal */}
      <div className="bg-surface-container/60 border border-outline-variant/50 rounded-lg p-3.5 flex flex-col gap-2.5 text-xs font-jakarta">
        <div>
          <span className="font-space text-[11px] uppercase tracking-wider text-primary font-bold block mb-0.5">
            Comportamiento Funcional:
          </span>
          <p className="text-white/90 leading-relaxed">
            {item.description}
          </p>
        </div>

        {item.userGoal && (
          <div className="pt-2 border-t border-outline-variant/40 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">target</span>
            <div>
              <span className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Objetivo de Usuario:
              </span>
              <p className="text-on-surface-variant leading-relaxed">
                {item.userGoal}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Wireframe reference & Linked User Stories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Wireframe ref */}
        <div className="flex items-center gap-2 p-2 rounded bg-surface-container border border-outline-variant/60">
          <span className="material-symbols-outlined text-primary text-[18px]">design_services</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-space text-on-surface-variant uppercase tracking-wider">
              Artefacto / Wireframe
            </span>
            <span className="text-white font-mono text-[11px] truncate" title={item.wireframeRef}>
              {item.wireframeRef || 'Sin wireframe adjunto'}
            </span>
          </div>
        </div>

        {/* Linked User Stories */}
        <div className="flex items-center gap-2 p-2 rounded bg-surface-container border border-outline-variant/60">
          <span className="material-symbols-outlined text-primary text-[18px]">link</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-space text-on-surface-variant uppercase tracking-wider">
              Historias Vinculadas
            </span>
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              {item.linkedStories && item.linkedStories.length > 0 ? (
                item.linkedStories.map(usId => (
                  <span key={usId} className="px-1.5 py-0.2 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] font-bold">
                    {usId}
                  </span>
                ))
              ) : (
                <span className="text-on-surface-variant text-[11px] italic">Sin historias asociadas</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Acceptance Criteria Progress */}
      {totalCriteria > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-space">
            <button
              onClick={() => setShowCriteria(!showCriteria)}
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-white transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                {showCriteria ? 'expand_less' : 'expand_more'}
              </span>
              <span className="font-semibold text-white">
                Criterios de Aceptación Visual ({checkedCount}/{totalCriteria})
              </span>
            </button>
            <span className="font-mono text-primary font-bold text-[11px]">
              {progressPercent}% validado
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                progressPercent === 100 ? 'bg-emerald-400' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Expandable criteria list */}
          {showCriteria && (
            <div className="mt-2 flex flex-col gap-1.5 pl-2 border-l-2 border-primary/30">
              {criteriaList.map((crit, idx) => (
                <label 
                  key={crit.id || idx}
                  className="flex items-start gap-2 text-xs text-on-surface-variant hover:text-white cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={crit.checked}
                    onChange={() => onToggleCriterion?.(item.id, crit.id)}
                    className="mt-0.5 rounded border-outline-variant text-primary focus:ring-0 bg-surface-container"
                  />
                  <span className={crit.checked ? 'line-through text-on-surface-variant/70' : 'text-white/90'}>
                    {crit.text}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-outline-variant/60">
        <div className="flex items-center gap-1">
          {/* Quick status change for client/PO */}
          {item.status !== 'Aprobado por Cliente' ? (
            <button
              onClick={() => onQuickStatusChange?.(item.id, 'Aprobado por Cliente')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-space text-xs font-semibold transition-colors"
              title="Aprobar formalmente esta interfaz"
            >
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>Aprobar UI</span>
            </button>
          ) : (
            <button
              onClick={() => onQuickStatusChange?.(item.id, 'En Revisión')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-400 font-space text-xs font-semibold transition-colors"
              title="Solicitar nueva revisión"
            >
              <span className="material-symbols-outlined text-[15px]">sync</span>
              <span>Reabrir</span>
            </button>
          )}

          <button
            onClick={() => onDuplicate?.(item)}
            className="p-1.5 rounded text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
            title="Duplicar Interfaz para otra variante/pantalla"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>

          <button
            onClick={() => onDelete?.(item.id)}
            className="p-1.5 rounded text-on-surface-variant hover:text-red-400 hover:bg-surface-container transition-colors"
            title="Eliminar registro"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>

        {/* Open Detailed Spec Modal */}
        <button
          onClick={() => onEdit?.(item)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs font-semibold transition-all shadow-sm"
        >
          <span>Formalizar / Detalle</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      </div>

    </article>
  );
}
