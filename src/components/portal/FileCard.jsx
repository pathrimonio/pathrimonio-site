import React, { useState } from 'react';
import { getFileVisualInfo } from '../../data/initialFiles';

export default function FileCard({
  file,
  onPreview,
  onEdit,
  onDelete,
  onDuplicate,
  onNotify
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const visualInfo = getFileVisualInfo(file.name, file.category);

  // Status badge styling
  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('vigente') || s.includes('oficial') || s.includes('aprobado')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (s.includes('revisión') || s.includes('revision') || s.includes('play store')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
    if (s.includes('borrador') || s.includes('draft')) {
      return 'bg-surface-container-highest text-on-surface-variant border-outline-variant';
    }
    return 'bg-primary/10 text-primary border-primary/30';
  };

  // Download simulation / blob generator
  const handleDownload = () => {
    try {
      const content = file.contentPreview || `Pathrimonio Project File: ${file.name}\nVersión: ${file.version}\nProyecto: ${file.projectId}\nDescripción: ${file.description}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      onNotify?.(`Descargando archivo: "${file.name}"`);
    } catch (_) {
      onNotify?.('Error al iniciar la descarga.');
    }
  };

  // Copy shareable link / path
  const handleCopyLink = () => {
    const link = `${window.location.origin}/#portal?tab=files&file=${encodeURIComponent(file.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      onNotify?.(`Enlace del archivo "${file.name}" copiado al portapapeles.`);
    }
  };

  return (
    <article className="group bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-primary/50 transition-all duration-200 shadow-md hover:shadow-xl">
      
      {/* ── Top Row: File Icon, Name & Status ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Visual Icon */}
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${visualInfo.colorClass}`}>
              <span className="material-symbols-outlined text-[26px]">
                {visualInfo.icon}
              </span>
            </div>

            {/* Filename & Category */}
            <div className="flex flex-col min-w-0">
              <h3 
                onClick={() => onPreview?.(file)}
                className="font-mono text-sm font-bold text-white group-hover:text-primary transition-colors truncate cursor-pointer tracking-tight"
                title={file.name}
              >
                {file.name}
              </h3>

              <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs">
                <span className="font-space text-[11px] text-on-surface-variant font-medium">
                  {file.category}
                </span>
                <span className="text-on-surface-variant/40">•</span>
                <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.2 rounded font-bold">
                  {file.version || 'v1.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-lg border font-space text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadge(file.status)}`}>
            {file.status || 'Vigente'}
          </span>
        </div>

        {/* Description */}
        <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed line-clamp-2">
          {file.description || 'Sin descripción adicional para este archivo.'}
        </p>

        {/* Linked Entity Chip if exists */}
        {file.linkedEntity && (
          <div className="flex items-center gap-1.5 pt-0.5 text-xs">
            <span className="material-symbols-outlined text-primary text-[14px]">link</span>
            <span className="font-space text-[11px] text-white">Vinculado a:</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-mono text-[10px] text-cyan-300 font-semibold truncate max-w-[220px]">
              {file.linkedEntity}
            </span>
          </div>
        )}

        {/* Tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {file.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/60 font-space text-[10px] text-on-surface-variant"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Row: Meta & Action Buttons ── */}
      <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-2 flex-wrap">
        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
          <span className="text-white font-bold">{file.sizeFormatted}</span>
          <span>•</span>
          <span>{file.uploadedAt}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white transition-colors"
            title="Descargar archivo"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white transition-colors"
            title="Copiar enlace o referencia"
          >
            <span className="material-symbols-outlined text-[17px]">
              {copiedLink ? 'check' : 'link'}
            </span>
          </button>

          {/* Inspect / Preview Button */}
          <button
            type="button"
            onClick={() => onPreview?.(file)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-space text-xs font-semibold transition-colors"
            title="Ver detalles y previsualizar archivo"
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            <span>Ver Ficha</span>
          </button>

          {/* Duplicate Button */}
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(file)}
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white transition-colors"
              title="Duplicar archivo"
            >
              <span className="material-symbols-outlined text-[17px]">content_copy</span>
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(file.id)}
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-error transition-colors"
              title="Eliminar archivo"
            >
              <span className="material-symbols-outlined text-[17px]">delete</span>
            </button>
          )}
        </div>
      </div>

    </article>
  );
}
