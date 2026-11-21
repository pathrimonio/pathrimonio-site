import React, { useState } from 'react';
import { generateTableDDL } from '../../data/initialDataModels';

export default function DataModelCard({
  table,
  onEdit,
  onDuplicate,
  onDelete,
  onQuickStatusChange,
  onOpenDetail
}) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [showAllAttributes, setShowAllAttributes] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aprobado por Arquitectura':
      case 'Aprobado':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: 'verified',
          label: 'Aprobado por Arquitectura'
        };
      case 'En Revisión':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          dot: 'bg-sky-400 animate-pulse',
          icon: 'hourglass_top',
          label: 'En Revisión'
        };
      case 'Deprecado':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          dot: 'bg-red-400',
          icon: 'cancel',
          label: 'Deprecado'
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

  const getStorageBadge = (target) => {
    if (target?.includes('SQLite')) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        icon: 'phone_android',
        label: 'SQLite Cifrado · Móvil'
      };
    }
    if (target?.includes('Supabase')) {
      return {
        bg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
        icon: 'cloud_sync',
        label: 'PostgreSQL · Supabase'
      };
    }
    if (target?.includes('AWS RDS')) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        icon: 'cloud',
        label: 'PostgreSQL · AWS RDS'
      };
    }
    if (target?.includes('Redis')) {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        icon: 'memory',
        label: 'Redis · In-Memory'
      };
    }
    return {
      bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      icon: 'database',
      label: target || 'Base de Datos'
    };
  };

  const statusMeta = getStatusBadge(table.status);
  const storageMeta = getStorageBadge(table.storageTarget);
  const attributes = table.attributes || [];
  const primaryKeysCount = attributes.filter(a => a.isPrimary).length;
  const foreignKeysCount = attributes.filter(a => a.foreignKey).length;

  const displayedAttributes = showAllAttributes ? attributes : attributes.slice(0, 6);

  const handleCopyDDL = (e) => {
    e.stopPropagation();
    const ddl = generateTableDDL(table);
    navigator.clipboard?.writeText(ddl);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <article className="group bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex flex-col gap-5 hover:border-primary/50 transition-all duration-200 shadow-md hover:shadow-xl">
      
      {/* ── 1. Header: Nombre Físico, Título & Estados ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/60 pb-4">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest border border-primary/30 flex items-center justify-center font-space font-bold text-sm text-primary shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[22px]">table_chart</span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm sm:text-base font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">
                {table.tableName}
              </span>
              <span className="font-space text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {table.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-space text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-medium">
                {table.module}
              </span>
              <span className="font-space text-[11px] text-on-surface-variant font-mono">
                {attributes.length} columnas ({primaryKeysCount} PK, {foreignKeysCount} FK)
              </span>
            </div>
          </div>
        </div>

        {/* Badges: Storage Engine + Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-space font-medium ${storageMeta.bg}`}>
            <span className="material-symbols-outlined text-[15px]">{storageMeta.icon}</span>
            <span>{storageMeta.label}</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-space font-semibold ${statusMeta.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}></span>
            <span className="material-symbols-outlined text-[15px]">{statusMeta.icon}</span>
            <span>{statusMeta.label}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Storage & Persistence Spec Banner ── */}
      <div className="bg-surface-container-highest/60 border border-outline-variant/80 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-start gap-2 text-xs">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">hard_drive</span>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span className="font-space font-semibold text-white uppercase text-[11px] tracking-wide">Ubicación & Cifrado:</span>
            <span className="font-jakarta text-on-surface-variant">{table.storageLocation || 'Almacenamiento gestionado en servidor cloud'}</span>
          </div>
        </div>

        {table.syncStrategy && (
          <div className="flex items-start gap-2 text-xs border-t border-outline-variant/40 pt-2">
            <span className="material-symbols-outlined text-cyan-400 text-[18px] shrink-0 mt-0.5">sync_alt</span>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="font-space font-semibold text-cyan-300 uppercase text-[11px] tracking-wide">Sincronización:</span>
              <span className="font-jakarta text-on-surface-variant">{table.syncStrategy}</span>
            </div>
          </div>
        )}

        {table.description && (
          <p className="font-jakarta text-xs text-on-surface-variant italic mt-1 leading-relaxed border-t border-outline-variant/40 pt-2">
            "{table.description}"
          </p>
        )}
      </div>

      {/* ── 3. Structured Attributes / Columns Table ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[16px]">view_column</span>
            <span className="font-space text-xs font-bold text-white uppercase tracking-wider">
              Atributos y Estructura de Campos ({attributes.length})
            </span>
          </div>
          {attributes.length > 6 && (
            <button
              onClick={() => setShowAllAttributes(!showAllAttributes)}
              className="text-primary hover:text-white font-space text-xs flex items-center gap-1 transition-colors"
            >
              <span>{showAllAttributes ? 'Ver menos' : `Ver todos (${attributes.length})`}</span>
              <span className="material-symbols-outlined text-[14px]">
                {showAllAttributes ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-highest/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-space font-semibold uppercase tracking-wider text-on-surface-variant">
                <th className="py-2.5 px-3 w-12 text-center">Clave</th>
                <th className="py-2.5 px-3">Atributo</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Nulo</th>
                <th className="py-2.5 px-3">Default</th>
                <th className="py-2.5 px-3 min-w-[200px]">Descripción / Regla</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-xs font-jakarta">
              {displayedAttributes.map((attr) => (
                <tr key={attr.id} className="hover:bg-surface-container/60 transition-colors">
                  {/* Key Type (PK / FK) */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {attr.isPrimary && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30" title="Primary Key (Clave Primaria)">
                        PK
                      </span>
                    )}
                    {attr.foreignKey && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/30 ml-1" title={`Foreign Key -> ${attr.foreignKey}`}>
                        FK
                      </span>
                    )}
                    {!attr.isPrimary && !attr.foreignKey && (
                      <span className="text-on-surface-variant/40">—</span>
                    )}
                  </td>

                  {/* Attribute Name */}
                  <td className="py-2.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                    {attr.name}
                  </td>

                  {/* Data Type */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      {attr.type}
                    </span>
                  </td>

                  {/* Nullable */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {attr.isNullable ? (
                      <span className="text-amber-400/80 font-mono text-[11px]">NULL</span>
                    ) : (
                      <span className="text-emerald-400 font-mono text-[11px] font-semibold">NOT NULL</span>
                    )}
                  </td>

                  {/* Default Value */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                    {attr.defaultValue || '—'}
                  </td>

                  {/* Description & Foreign Key target */}
                  <td className="py-2.5 px-3 text-on-surface-variant leading-relaxed">
                    <div>{attr.description}</div>
                    {attr.foreignKey && (
                      <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">link</span>
                        <span>Referencia: {attr.foreignKey}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Cross References & Author Metadata ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/60 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {table.linkedStory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant text-white font-space text-[11px]">
              <span className="text-primary font-bold">US:</span> {table.linkedStory}
            </span>
          )}
          {table.linkedInterface && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant text-white font-space text-[11px]">
              <span className="text-cyan-400 font-bold">UI:</span> {table.linkedInterface}
            </span>
          )}
          <span className="text-on-surface-variant font-space text-[11px]">
            {table.version || 'v1.0'} • {table.author || 'Equipo de Arquitectura'}
          </span>
        </div>

        {/* Actions toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Copy DDL SQL */}
          <button
            onClick={handleCopyDDL}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-all shadow-sm"
            title="Copiar script CREATE TABLE en SQL"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">
              {copiedSql ? 'check' : 'code'}
            </span>
            <span>{copiedSql ? 'Copiado SQL' : 'Copiar DDL'}</span>
          </button>

          {/* Quick Approve / Change status */}
          <button
            onClick={() => onQuickStatusChange?.(table, table.status === 'Aprobado por Arquitectura' ? 'En Revisión' : 'Aprobado por Arquitectura')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
            title="Alternar estado de aprobación"
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-400">
              {table.status === 'Aprobado por Arquitectura' ? 'undo' : 'verified'}
            </span>
            <span>{table.status === 'Aprobado por Arquitectura' ? 'Desaprobar' : 'Aprobar'}</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={() => onDuplicate?.(table)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white transition-colors"
            title="Duplicar esquema de tabla"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete?.(table.id)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-red-500/20 border border-outline-variant hover:border-red-500/30 text-on-surface-variant hover:text-red-400 transition-colors"
            title="Eliminar entidad"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>

          {/* Edit / Inspect Detail */}
          <button
            onClick={() => onOpenDetail?.(table)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-surface font-space font-semibold text-xs transition-colors shadow-sm"
            title="Inspeccionar y editar tabla"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>Editar Esquema</span>
          </button>
        </div>
      </div>

    </article>
  );
}
