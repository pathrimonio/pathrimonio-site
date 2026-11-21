import React, { useState, useRef } from 'react';
import { 
  FILE_CATEGORY_OPTIONS, 
  FILE_STATUS_OPTIONS 
} from '../../data/initialFiles';

export default function FileUploader({
  onSaveFile,
  onNotify,
  activeProjectId
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(FILE_CATEGORY_OPTIONS[1] || 'Builds & Entregables (APKs / Releases)');
  const [version, setVersion] = useState('v1.0');
  const [status, setStatus] = useState(FILE_STATUS_OPTIONS[1] || 'Vigente / Oficial');
  const [uploadedBy, setUploadedBy] = useState('Usuario Activo');
  const [linkedEntity, setLinkedEntity] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [description, setDescription] = useState('');
  const [fileSizeFormatted, setFileSizeFormatted] = useState('1.5 MB');
  const [fileSizeBytes, setFileSizeBytes] = useState(1572864);
  const [contentPreview, setContentPreview] = useState('');

  const fileInputRef = useRef(null);

  // Quick Preset Loader
  const loadPreset = (preset) => {
    switch (preset) {
      case 'apk':
        setName(`App_${activeProjectId || 'pathway'}_Release_v1.0.5.apk`);
        setCategory('Builds & Entregables (APKs / Releases)');
        setVersion('v1.0.5-prod');
        setStatus('En Revisión');
        setDescription('Paquete de release firmado en formato APK para pruebas en dispositivos reales y envío a producción en Play Store.');
        setTagsInput('Android, APK, Producción, Release, Play Store');
        setLinkedEntity('US-201');
        setFileSizeFormatted('39.2 MB');
        setFileSizeBytes(41104179);
        setContentPreview('Android Binary Package - SHA256: d41d8cd98f00b204e9800998ecf8427e');
        break;
      case 'prd':
        setName(`Documento_Especificacion_SRS_${activeProjectId || 'software'}_v2.pdf`);
        setCategory('Documentación & PRD');
        setVersion('v2.0');
        setStatus('Vigente / Oficial');
        setDescription('Documento formal de requerimientos funcionales, arquitectura de componentes, casos de uso y matriz de aceptación con el cliente.');
        setTagsInput('PRD, SRS, Requerimientos, Especificación');
        setLinkedEntity('INT-03');
        setFileSizeFormatted('4.8 MB');
        setFileSizeBytes(5033164);
        setContentPreview('Software Requirements Specification (SRS) - Formalización de objetivos, módulos y flujos de usuario.');
        break;
      case 'sql':
        setName(`Migracion_Evolutiva_Esquema_${activeProjectId || 'db'}.sql`);
        setCategory('Arquitectura & SQL');
        setVersion('v1.1');
        setStatus('Vigente / Oficial');
        setDescription('Script SQL con creación de tablas relacionales, índices B-Tree, restricciones de integridad referencial y llaves foráneas.');
        setTagsInput('SQL, DDL, Base de Datos, Migración');
        setLinkedEntity('tb_metas');
        setFileSizeFormatted('145 KB');
        setFileSizeBytes(148480);
        setContentPreview(`-- Script SQL DDL de Migración
CREATE TABLE IF NOT EXISTS tb_modulo_core (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`);
        break;
      case 'figma':
        setName(`Prototipo_Interactivo_UI_UX_${activeProjectId || 'pathway'}.fig`);
        setCategory('Diseños & Prototipos (UI/UX)');
        setVersion('v3.0');
        setStatus('Aprobado por Cliente');
        setDescription('Prototipo navegable en Figma con design tokens, paleta Systematic Dark (#131314) y micro-interacciones de feedback háptico.');
        setTagsInput('Figma, UI, UX, Prototipo, Wireframe');
        setLinkedEntity('INT-01');
        setFileSizeFormatted('22.4 MB');
        setFileSizeBytes(23488102);
        setContentPreview('Figma Project File - Diseños Mobile & Web con autolayout y componentes interactivos.');
        break;
      default:
        break;
    }
    onNotify?.('Plantilla de archivo cargada en el formulario.');
  };

  // Handle file drop / upload
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (file) {
      setName(file.name);
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      // Auto categorize
      if (ext === 'apk' || ext === 'aab') setCategory('Builds & Entregables (APKs / Releases)');
      else if (ext === 'pdf' || ext === 'doc' || ext === 'docx') setCategory('Documentación & PRD');
      else if (ext === 'sql' || ext === 'ddl') setCategory('Arquitectura & SQL');
      else if (ext === 'fig' || ext === 'png' || ext === 'jpg') setCategory('Diseños & Prototipos (UI/UX)');

      // Size calculation
      setFileSizeBytes(file.size);
      const formatted = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      setFileSizeFormatted(formatted);

      // Read text snippet if text file
      if (file.type.includes('text') || ext === 'sql' || ext === 'json' || ext === 'txt') {
        const reader = new FileReader();
        reader.onload = (re) => setContentPreview(re.target?.result?.slice(0, 500) || '');
        reader.readAsText(file);
      } else {
        setContentPreview(`Archivo binario: ${file.name} (${formatted})`);
      }

      onNotify?.(`Archivo "${file.name}" cargado para registro.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      onNotify?.('Por favor ingresa o sube un archivo.');
      return;
    }

    const ext = (name.split('.').pop() || 'bin').toLowerCase();
    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newFile = {
      id: `FILE-${Date.now().toString().slice(-4)}`,
      projectId: activeProjectId || 'pathway',
      name: name.trim(),
      category,
      format: ext,
      sizeBytes: fileSizeBytes,
      sizeFormatted: fileSizeFormatted,
      version: version.trim() || 'v1.0',
      status,
      uploadedBy: uploadedBy.trim() || 'Usuario Activo',
      uploadedAt: new Date().toISOString().split('T')[0],
      description: description.trim() || 'Archivo incorporado al repositorio del proyecto.',
      tags: tagsArray.length > 0 ? tagsArray : [category],
      linkedEntity: linkedEntity.trim() || null,
      downloadUrl: `#download-${ext}`,
      contentPreview: contentPreview || `Pathrimonio Project File: ${name.trim()}`
    };

    onSaveFile(newFile);
    onNotify?.(`¡Archivo "${newFile.name}" guardado exitosamente en el repositorio!`);

    // Reset
    setName('');
    setDescription('');
    setTagsInput('');
    setLinkedEntity('');
    setContentPreview('');
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col gap-5 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">upload_file</span>
            <h2 className="font-space text-base text-white font-semibold">Subir o Registrar Archivo</h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-semibold uppercase tracking-wider">
            Repositorio
          </span>
        </div>
        <p className="font-jakarta text-xs text-on-surface-variant">
          Centraliza documentación PRD, builds de Android (APKs), scripts SQL y contratos vinculados al software.
        </p>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="font-space text-[11px] text-on-surface-variant">Plantillas rápidas:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => loadPreset('apk')}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-emerald-400 hover:text-white font-space text-[11px] transition-colors flex items-center gap-1"
            >
              <span>🤖</span>
              <span>Build APK</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset('prd')}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-red-400 hover:text-white font-space text-[11px] transition-colors flex items-center gap-1"
            >
              <span>📄</span>
              <span>PRD / SRS</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset('sql')}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-cyan-400 hover:text-white font-space text-[11px] transition-colors flex items-center gap-1"
            >
              <span>💾</span>
              <span>Script SQL</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset('figma')}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-purple-400 hover:text-white font-space text-[11px] transition-colors flex items-center gap-1"
            >
              <span>🎨</span>
              <span>Prototipo Figma</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Dropzone */}
        <div className="flex flex-col gap-1.5">
          <label className="font-space text-xs text-white font-medium">
            Seleccionar o Arrastrar Archivo
          </label>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="p-4 rounded-xl bg-surface-container-lowest border border-dashed border-outline hover:border-primary transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileDrop} 
              className="hidden" 
            />
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform text-[26px]">
              cloud_upload
            </span>
            <p className="font-jakarta text-xs text-white mt-1">
              Arrastra tu archivo aquí o <span className="text-primary font-medium underline">explorar</span>
            </p>
            <p className="font-space text-[10px] text-on-surface-variant">
              APK, PDF, SQL, Figma, PNG, XLSX, ZIP (máx. 100MB)
            </p>
          </label>
        </div>

        {/* Nombre del Archivo */}
        <div className="flex flex-col gap-1">
          <label className="font-space text-xs text-white flex items-center justify-between">
            <span className="font-medium">Nombre del Archivo</span>
            <span className="text-on-surface-variant font-space text-[10px] uppercase">Requerido</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Pathway_App_MVP_Release_v1.0.apk, Especificacion_PRD.pdf..."
            className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-mono text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        {/* Categoría y Versión */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Categoría */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              {FILE_CATEGORY_OPTIONS.filter(c => c !== 'Todas').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Versión */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">Versión Documental</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Ej: v1.0, v1.0.4-prod, Final"
              className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-mono text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Estado y Subido Por */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">Estado del Entregable</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              {FILE_STATUS_OPTIONS.filter(s => s !== 'Todos').map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Subido Por */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">Responsable / Autor</label>
            <input
              type="text"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              placeholder="Ej: Jhan C. (Product Owner), Gerencia"
              className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Entidad Vinculada (Historia, Interfaz, Tabla) */}
        <div className="flex flex-col gap-1">
          <label className="font-space text-xs text-white flex items-center justify-between">
            <span className="font-medium">Vinculación con Requerimientos</span>
            <span className="text-on-surface-variant font-space text-[10px]">Opcional</span>
          </label>
          <input
            type="text"
            value={linkedEntity}
            onChange={(e) => setLinkedEntity(e.target.value)}
            placeholder="Ej: US-201, INT-04, tb_metas..."
            className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Etiquetas (Tags) */}
        <div className="flex flex-col gap-1">
          <label className="font-space text-xs text-white flex items-center justify-between">
            <span className="font-medium">Etiquetas (Separadas por comas)</span>
            <span className="text-on-surface-variant font-space text-[10px]">Búsqueda rápida</span>
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Ej: Android, Play Store, Producción, Release"
            className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label className="font-space text-xs text-white font-medium">
            Descripción y Notas de Entrega
          </label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el contenido, propósito para el cliente o instrucciones para el equipo de desarrollo..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-2 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-space text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">cloud_done</span>
          <span>Guardar en Repositorio de Archivos</span>
        </button>
      </form>
    </div>
  );
}
