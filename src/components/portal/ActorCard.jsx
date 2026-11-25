import React, { useState } from 'react';

export default function ActorCard({
  actor,
  onEdit,
  onDuplicate,
  onDelete,
  onSelectForStory,
  linkedStoriesCount = 0,
  linkedInterfacesCount = 0,
  onNotify
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper for avatar colors
  const getColorClasses = (color) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        };
      case 'sky':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        };
      default:
        return {
          bg: 'bg-primary/10 text-primary border-primary/30',
          badge: 'bg-primary/10 text-primary border-primary/30'
        };
    }
  };

  const colorStyles = getColorClasses(actor.color);

  // Share direct link for collaborators to complete user stories for this role
  const handleCopyCollaboratorLink = () => {
    const origin = window.location.origin;
    const roleParam = encodeURIComponent(actor.name);
    const link = `${origin}/#portal?tab=stories&role=${roleParam}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      onNotify?.(`Enlace de colaboración copiado. Compártelo con "${actor.assignedWorkerName || actor.name}" para que complete sus Historias de Usuario.`);
    }
  };

  return (
    <article className="group w-1/4 shrink-0 bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex flex-col gap-5 hover:border-primary/50 transition-all duration-200 shadow-md hover:shadow-xl">
      
      {/* ── 1. Header: Avatar, Nombre de Rol & Nivel de Permiso ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant/60 pb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-space font-bold shrink-0 shadow-inner ${colorStyles.bg}`}>
            <span className="material-symbols-outlined text-[26px]">
              {actor.avatarIcon || 'person'}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-space text-base sm:text-lg font-bold text-white group-hover:text-primary transition-colors tracking-tight truncate">
                {actor.name}
              </h3>
              {actor.isPrimaryRole && (
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 font-space text-[10px] font-bold uppercase tracking-wider">
                  Rol Principal
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
              <span className="font-space text-[11px] text-on-surface-variant font-medium">
                {actor.category}
              </span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="font-mono text-[11px] text-primary">
                {linkedStoriesCount} {linkedStoriesCount === 1 ? 'Historia' : 'Historias'}
              </span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="font-mono text-[11px] text-emerald-400">
                {linkedInterfacesCount} {linkedInterfacesCount === 1 ? 'Interfaz' : 'Interfaces'}
              </span>
            </div>
          </div>
        </div>

        {/* Permission Level Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-space font-semibold ${colorStyles.badge}`}>
          <span className="material-symbols-outlined text-[15px]">security</span>
          <span>{actor.permissionLevel}</span>
        </div>
      </div>

      {/* ── 2. Description (Business Context) ── */}
      <div className="bg-surface-container-highest/50 border border-outline-variant/70 rounded-xl p-3.5 flex flex-col gap-1.5">
        <span className="font-space font-semibold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[15px]">info</span>
          <span>Contexto & Responsabilidad del Negocio</span>
        </span>
        <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
          {actor.description}
        </p>
      </div>

      {/* ── 3. Permitted System Areas / Modules ── */}
      <div className="flex flex-col gap-2">
        <span className="font-space text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-cyan-400 text-[15px]">lock_open</span>
          <span>Áreas de Negocio con Permiso ({actor.systemAreas?.length || 0})</span>
        </span>

        <div className="flex flex-wrap gap-1.5">
          {(actor.systemAreas || []).map((area, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest border border-outline-variant text-[11px] font-mono text-cyan-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>{area}</span>
            </span>
          ))}
          {(!actor.systemAreas || actor.systemAreas.length === 0) && (
            <span className="text-on-surface-variant text-xs italic">
              Sin áreas de negocio asignadas aún (definido por equipo de desarrollo).
            </span>
          )}
        </div>
      </div>

      {/* ── 4. Collaborator Assignment & Shareable Link ── */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined text-[15px]">badge</span>
          </div>
          <div className="min-w-0">
            <span className="font-space text-white font-medium block truncate text-[11px]">
              {actor.assignedWorkerName || 'Colaborador Asignado'}
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant truncate block">
              {actor.assignedWorker || 'Sin asignar'}
            </span>
          </div>
        </div>

        {/* Copy Shareable link button */}
        <button
          onClick={handleCopyCollaboratorLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant hover:border-primary/50 text-xs font-space text-white transition-colors shadow-sm ml-auto"
          title="Copiar enlace directo para que el trabajador responsable complete sus HUs"
        >
          <span className="material-symbols-outlined text-[15px] text-cyan-400">
            {copiedLink ? 'check' : 'share'}
          </span>
          <span>{copiedLink ? '¡Enlace Copiado!' : 'Compartir con Trabajador'}</span>
        </button>
      </div>

      {/* ── 5. Actions Footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/60 text-xs">
        <div className="flex items-center gap-2">
          {/* Quick trigger to create User Story with this role */}
          <button
            onClick={() => onSelectForStory?.(actor.name)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-space font-semibold text-xs transition-colors"
            title="Crear nueva Historia de Usuario actuando como este Rol"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            <span>Crear HU como este Rol</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Duplicate */}
          <button
            onClick={() => onDuplicate?.(actor)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white transition-colors"
            title="Duplicar definición de actor"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete?.(actor.id)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-red-500/20 border border-outline-variant hover:border-red-500/30 text-on-surface-variant hover:text-red-400 transition-colors"
            title="Eliminar rol"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit?.(actor)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space font-medium text-xs transition-colors"
            title="Editar detalles y permisos del actor"
          >
            <span className="material-symbols-outlined text-[15px]">edit</span>
            <span>Editar</span>
          </button>
        </div>
      </div>

    </article>
  );
}
