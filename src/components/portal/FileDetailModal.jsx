import React, { useState, useEffect } from 'react';
import { 
  FILE_CATEGORY_OPTIONS, 
  FILE_STATUS_OPTIONS,
  getFileVisualInfo
} from '../../data/initialFiles';

export default function FileDetailModal({
  file,
  isOpen,
  onClose,
  onUpdateFile,
  onNotify
}) {
  const [formData, setFormData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (file) {
      setFormData({
        ...file,
        tagsInput: (file.tags || []).join(', ')
      });
    }
  }, [file]);

  if (!isOpen || !formData) return null;

  const visualInfo = getFileVisualInfo(formData.name, formData.category);

  const handleSave = (e) => {
    e.preventDefault();
    const updatedTags = (formData.tagsInput || '')
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const updated = {
      ...formData,
      tags: updatedTags
    };

    onUpdateFile?.(updated);
    onNotify?.(`Metadatos de "${updated.name}" actualizados.`);
    onClose();
  };

  const handleDownload = () => {
    try {
      const content = formData.contentPreview || `Pathrimonio Project File: ${formData.name}\nVersión: ${formData.version}\nProyecto: ${formData.projectId}\nDescripción: ${formData.description}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', formData.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      onNotify?.(`Descargando "${formData.name}"`);
    } catch (_) {
      onNotify?.('Error al descargar el archivo.');
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/#portal?tab=files&file=${encodeURIComponent(formData.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      onNotify?.(`Enlace del archivo "${formData.name}" copiado.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${visualInfo.colorClass}`}>
              <span className="material-symbols-outlined text-[20px]">{visualInfo.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-space text-lg font-bold text-primary font-mono">{formData.id}</span>
                <span className="text-white font-space font-semibold text-base truncate max-w-md">
                  — {formData.name}
                </span>
              </div>
              <p className="font-jakarta text-[11px] text-on-surface-variant">
                {formData.category} • {formData.sizeFormatted} • Subido el {formData.uploadedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
              title="Copiar enlace del archivo"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedLink ? 'check' : 'link'}
              </span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Preview Box */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-space">
            <span className="text-on-surface-variant flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-primary text-[16px]">preview</span>
              <span>Previsualización del Archivo / Registro</span>
            </span>
            <span className="font-mono text-cyan-300 text-[11px] font-bold">
              Formato: {formData.format?.toUpperCase()}
            </span>
          </div>

          {formData.contentPreview ? (
            <pre className="bg-surface-container border border-outline-variant/60 rounded-lg p-3 font-mono text-xs text-white max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {formData.contentPreview}
            </pre>
          ) : (
            <div className="p-3 bg-surface-container rounded-lg text-xs font-jakarta text-on-surface-variant text-center">
              Archivo binario sin previsualización en texto plano disponible.
            </div>
          )}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* Row 1: Nombre & Versión */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Nombre del Archivo</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-mono text-xs text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Versión</label>
              <input 
                type="text" 
                value={formData.version || ''} 
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 font-mono text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Row 2: Categoría y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Categoría</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 text-xs text-white focus:outline-none focus:border-primary"
              >
                {FILE_CATEGORY_OPTIONS.filter(c => c !== 'Todas').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Estado del Entregable</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 text-xs text-white focus:outline-none focus:border-primary"
              >
                {FILE_STATUS_OPTIONS.filter(s => s !== 'Todos').map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Responsable & Entidad Vinculada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Responsable / Subido Por</label>
              <input 
                type="text" 
                value={formData.uploadedBy || ''} 
                onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Vinculación (Historia / Interfaz / Tabla)</label>
              <input 
                type="text" 
                value={formData.linkedEntity || ''} 
                onChange={(e) => setFormData({ ...formData, linkedEntity: e.target.value })}
                placeholder="Ej: US-201, INT-04, tb_metas"
                className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-mono text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Row 4: Etiquetas */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">Etiquetas (Separadas por comas)</label>
            <input 
              type="text" 
              value={formData.tagsInput || ''} 
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
              placeholder="Android, Producción, Release"
              className="h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Row 5: Descripción */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">Descripción y Notas de Entrega</label>
            <textarea 
              rows="3"
              value={formData.description || ''} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-white font-space text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">download</span>
              <span>Descargar Archivo</span>
            </button>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-white font-space text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
              >
                Guardar Cambios
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
