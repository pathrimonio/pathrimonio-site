import React from 'react';
import InterfaceMockupPreview from './InterfaceMockupPreview';

export default function InterfaceCard({
  item,
  onEdit,
  onDuplicate,
  onDelete,
  onQuickStatusChange
}) {
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
          label: 'En Revisión'
        };
      case 'Rechazado':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          dot: 'bg-red-400',
          icon: 'cancel',
          label: 'Requiere Ajustes'
        };
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          icon: 'edit_note',
          label: 'Borrador'
        };
    }
  };

  const statusMeta = getStatusBadge(item.status);
  const fields = item.fields || {};

  return (
    <article className="group bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex flex-col gap-5 hover:border-primary/50 transition-all duration-200 shadow-md hover:shadow-xl">
      
      {/* ── 1. Header: Número y Título de Pantalla + Estado ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/60 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-surface-container-highest border border-primary/30 flex items-center justify-center font-space font-bold text-sm text-primary">
              {item.number || 'UI'}
            </span>
            <h3 className="font-space text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors tracking-tight">
              {item.fullName || `${item.number}. ${item.title}`}
            </h3>
          </div>

          <span className="font-space text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-medium">
            {item.module}
          </span>

          {item.platform && (
            <span className="font-space text-[10px] text-on-surface-variant font-mono">
              • {item.platform}
            </span>
          )}
        </div>

        {/* Status Pill */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-space font-semibold ${statusMeta.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}></span>
          <span className="material-symbols-outlined text-[15px]">{statusMeta.icon}</span>
          <span>{statusMeta.label}</span>
        </div>
      </div>

      {/* ── 2. SECCIÓN VISUAL: Imagen / Wireframe de la Interfaz ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-on-surface-variant font-space px-1">
          <span className="flex items-center gap-1.5 font-semibold text-white/90">
            <span className="material-symbols-outlined text-[16px] text-primary">image</span>
            <span>Vista de Interfaz</span>
          </span>
          <span className="text-[11px] font-mono text-on-surface-variant">
            {item.image ? 'Captura / Mockup cargado' : 'Wireframe referencial UI'}
          </span>
        </div>

        <InterfaceMockupPreview
          image={item.image}
          placeholderType={item.imagePlaceholder || 'dashboard'}
          title={item.fullName}
          onImageClick={() => onEdit?.(item)}
        />
      </div>

      {/* ── 3. CUADRO CON SUS DETALLES (Campo | Detalle) ── */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-space text-white/90 font-semibold px-1 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">table_chart</span>
          <span>Cuadro de Especificación Técnica:</span>
        </span>

        <div className="overflow-hidden border border-outline-variant/80 rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container-high/80 text-on-surface border-b border-outline-variant/70 font-space text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-bold text-primary w-28 sm:w-36 border-r border-outline-variant/60">
                  Campo
                </th>
                <th className="py-2.5 px-4 font-bold text-white">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 font-jakarta text-xs">
              
              {/* Fila: Objetivo */}
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="py-3 px-4 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                  Objetivo
                </td>
                <td className="py-3 px-4 text-on-surface font-medium leading-relaxed">
                  {fields.objetivo || 'Sin objetivo especificado.'}
                </td>
              </tr>

              {/* Fila: Contenido */}
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="py-3 px-4 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                  Contenido
                </td>
                <td className="py-3 px-4 text-on-surface leading-relaxed">
                  {fields.contenido || 'Sin contenido especificado.'}
                </td>
              </tr>

              {/* Fila: Reglas */}
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="py-3 px-4 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                  Reglas
                </td>
                <td className="py-3 px-4 text-on-surface leading-relaxed">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-white font-mono text-[11px]">
                    {fields.reglas || 'Sin reglas especificadas.'}
                  </span>
                </td>
              </tr>

              {/* Fila: Detalles */}
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="py-3 px-4 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                  Detalles
                </td>
                <td className="py-3 px-4 text-on-surface-variant leading-relaxed">
                  {fields.detalles || 'Sin detalles adicionales.'}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Footer: Trazabilidad y Acciones ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/60">
        {/* Trazabilidad y metadatos */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {item.linkedStory && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-outline-variant font-mono text-[11px]">
              <span className="text-on-surface-variant">Historia:</span>
              <span className="text-primary font-bold">{item.linkedStory}</span>
            </div>
          )}
          <span className="text-on-surface-variant font-space text-[11px]">
            {item.version || 'v1.0'} • {item.author || 'Equipo'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick status change for client */}
          {item.status !== 'Aprobado por Cliente' ? (
            <button
              onClick={() => onQuickStatusChange?.(item.id, 'Aprobado por Cliente')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-space text-xs font-semibold transition-colors"
              title="Aprobar formalmente con el cliente"
            >
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Aprobar</span>
            </button>
          ) : (
            <button
              onClick={() => onQuickStatusChange?.(item.id, 'En Revisión')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-400 font-space text-xs font-semibold transition-colors"
              title="Solicitar revisión técnica"
            >
              <span className="material-symbols-outlined text-[15px]">sync</span>
              <span>Reabrir</span>
            </button>
          )}

          <button
            onClick={() => onDuplicate?.(item)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
            title="Duplicar ficha de interfaz"
          >
            <span className="material-symbols-outlined text-[17px]">content_copy</span>
          </button>

          <button
            onClick={() => onDelete?.(item.id)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-surface-container transition-colors"
            title="Eliminar interfaz"
          >
            <span className="material-symbols-outlined text-[17px]">delete</span>
          </button>

          {/* Edit / Formalize button */}
          <button
            onClick={() => onEdit?.(item)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-white hover:text-primary font-space text-xs font-semibold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>Editar Ficha</span>
          </button>
        </div>
      </div>

    </article>
  );
}
