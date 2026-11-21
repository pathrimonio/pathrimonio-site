import React from 'react';
import InterfaceMockupPreview from './InterfaceMockupPreview';
import DataUsageList from './DataUsageList';
import { getEffectiveAspect } from '../../utils/aspectRatio';
import { useImageAspect } from '../../utils/useImageAspect';

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
  const roles = Array.isArray(item.roles) ? item.roles : (item.role ? [item.role] : []);
  const detectedRatio = useImageAspect(item.image, item.imageAspect);
  const effectiveAspect = getEffectiveAspect(item, detectedRatio);
  const isPhoneLayout = effectiveAspect === 'phone';

  const hasDataUsage = Array.isArray(item.dataUsage) && item.dataUsage.length > 0;

  // ── Bloque: Cuadro de Especificación Técnica ──
  const specTableBlock = (
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

            {/* Fila: Roles del Negocio */}
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="py-3 px-4 font-space font-semibold text-white bg-surface-container/20 border-r border-outline-variant/40 align-top">
                Roles de Negocio
              </td>
              <td className="py-3 px-4 text-on-surface leading-relaxed">
                {roles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map((r, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-white font-space text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span>{r}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="italic text-on-surface-variant text-[11px]">Sin roles asignados</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Bloque: Datos Utilizados en esta Interfaz ──
  const dataUsageBlock = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-space text-white/90 font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">database</span>
          <span>Datos Utilizados en esta Interfaz</span>
        </span>
        {hasDataUsage && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-semibold">
            {item.dataUsage.length} {item.dataUsage.length === 1 ? 'campo' : 'campos'}
          </span>
        )}
      </div>

      {hasDataUsage ? (
        <DataUsageList items={item.dataUsage} />
      ) : (
        <div className="overflow-hidden border border-outline-variant/80 rounded-xl bg-surface-container-lowest p-4 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm min-h-[140px]">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-[26px]">database</span>
          <span className="text-xs font-jakarta italic text-on-surface-variant/70">
            Aún no se han asociado datos del modelado a esta interfaz.
          </span>
          <button
            type="button"
            onClick={() => onEdit?.(item)}
            className="mt-1 text-[11px] font-space text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">add_link</span>
            <span>Asignar datos desde el Modelado</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <article className="group bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex flex-col gap-5 hover:border-primary/50 transition-all duration-200 shadow-md hover:shadow-xl">
      
      {/* ── 1. Header: Número y Título de Pantalla + Estado ── */}
      <div className="flex flex-col gap-3 border-b border-outline-variant/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

        {/* Roles del Negocio Asignados */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-space text-on-surface-variant flex items-center gap-1 shrink-0 font-medium">
            <span className="material-symbols-outlined text-[15px] text-primary">badge</span>
            <span>Roles del Negocio:</span>
          </span>
          {roles.length > 0 ? (
            roles.map((r, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-space bg-surface-container border border-outline-variant text-white hover:border-primary/50 transition-colors shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>{r}</span>
              </span>
            ))
          ) : (
            <span className="text-[11px] font-jakarta italic text-on-surface-variant/60">
              Sin roles asignados
            </span>
          )}
        </div>
      </div>

      {/* ── 2. SECCIÓN PRINCIPAL: MOCKUP + ESPECIFICACIÓN Y DATOS ── */}
      {isPhoneLayout ? (
        /* INTERFACES VERTICALES (Phone):
           - Izquierda: Mockup vertical de teléfono
           - Derecha: Cuadro de Especificación Técnica y DEBAJO de él la sección Datos Utilizados en esta Interfaz */
        <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] gap-5 items-start">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-on-surface-variant font-space px-1">
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
              aspectRatio={effectiveAspect}
              onImageClick={() => onEdit?.(item)}
            />
          </div>

          <div className="flex flex-col gap-5 min-w-0">
            {specTableBlock}
            {dataUsageBlock}
          </div>
        </div>
      ) : (
        /* INTERFACES HORIZONTALES (Desktop / Tablet / Web):
           - Arriba: Mockup horizontal
           - Abajo: A lado derecho de Cuadro de Especificación Técnica -> Datos Utilizados en esta Interfaz */
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-on-surface-variant font-space px-1">
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
              aspectRatio={effectiveAspect}
              onImageClick={() => onEdit?.(item)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {specTableBlock}
            {dataUsageBlock}
          </div>
        </div>
      )}

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
