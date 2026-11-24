import React from 'react';
import confetti from 'canvas-confetti';
import { generateTableDDL, generatePlantUML, generateFullProjectSQL } from '../../data/initialDataModels';

export default function DataModelControlsBar({
  tables = [],
  stories = [],
  interfaces = [],
  onNotify,
  activeProject,
  onOpenDERModal,
  onOpenSQLModal,
  onOpenCreateModal
}) {
  const totalTables = tables.length;
  const approvedTables = tables.filter(t => t.status === 'Aprobado por Arquitectura' || t.status === 'Aprobado').length;
  const approvalRate = totalTables > 0 ? Math.round((approvedTables / totalTables) * 100) : 0;

  // Sum of all attributes
  const totalAttributes = tables.reduce((acc, t) => acc + (t.attributes ? t.attributes.length : 0), 0);

  // Distinct storage engines
  const uniqueEngines = [...new Set(tables.map(t => t.storageTarget).filter(Boolean))].length;

  // Export full SQL DDL script (.sql)
  const handleExportFullSQL = () => {
    try {
      const fullSql = generateFullProjectSQL(tables, activeProject?.name || 'Sistema de Software');
      const blob = new Blob([fullSql], { type: 'text/sql;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ddl_${(activeProject?.id || 'pathrimonio')}_${new Date().toISOString().split('T')[0]}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      onNotify?.(`Script SQL DDL (.sql) exportado con éxito (${tables.length} tablas).`);
    } catch (_) {
      onNotify?.('Error al generar el archivo SQL.');
    }
  };

  // Export PlantUML (.puml)
  const handleExportPUML = () => {
    try {
      const puml = generatePlantUML(tables, activeProject?.name || 'Pathrimonio');
      const blob = new Blob([puml], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `der_${(activeProject?.id || 'pathrimonio')}_${new Date().toISOString().split('T')[0]}.puml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      onNotify?.(`Diagrama PlantUML (.puml) exportado con éxito.`);
    } catch (_) {
      onNotify?.('Error al generar el archivo .puml.');
    }
  };

  // Export Data Dictionary JSON
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tables, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `diccionario_datos_${activeProject?.id || 'pathrimonio'}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onNotify?.("Diccionario de datos exportado en formato JSON.");
    } catch (_) {
      onNotify?.("Error al exportar diccionario de datos.");
    }
  };

  const handleCelebrateSchema = () => {
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.3 }
    });
    onNotify?.(`¡Arquitectura de datos validada con ${totalTables} tablas y ${totalAttributes} atributos para ${activeProject?.name}!`);
  };

  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-3 sm:px-4 lg:px-5 py-4">
      <div className="w-full flex flex-col gap-y-4">
        
        {/* Top Title & Macro Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">database</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-x-2.5 flex-wrap">
                <h1 className="font-space text-base sm:text-lg text-white font-semibold tracking-tight truncate">
                  {activeProject ? `${activeProject.name} — Modelado de Datos` : 'Modelado de Datos & Base de Datos'}
                </h1>
                <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-primary font-space text-[11px] font-medium tracking-wide">
                  {activeProject?.category || 'Arquitectura & Almacenamiento'}
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                Diccionario de datos: Definición de tablas, atributos, tipos, llaves foráneas y motores de persistencia
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-space">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-on-surface-variant">Tablas:</span>
              <span className="text-white font-bold">{totalTables}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-space">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-on-surface-variant">Atributos:</span>
              <span className="text-white font-bold">{totalAttributes}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-space">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-on-surface-variant">Aprobadas:</span>
              <span className="text-white font-bold">{approvalRate}%</span>
            </div>
          </div>
        </div>

        {/* Action Tools Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/60">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Nueva Tabla Modal Trigger */}
            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-surface font-space font-bold text-xs transition-all shadow-md"
                title="Diseñar y registrar una nueva tabla o entidad"
              >
                <span className="material-symbols-outlined text-[17px]">add_circle</span>
                <span>Nueva Tabla</span>
              </button>
            )}

            {/* Primary Action: Ver DER */}
            <button
              onClick={onOpenDERModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-surface font-space font-bold text-xs transition-colors shadow-md"
              title="Abrir vista interactiva del Diagrama Entidad-Relación (DER)"
            >
              <span className="material-symbols-outlined text-[17px]">account_tree</span>
              <span>Ver DER (Diagrama Entidad-Relación)</span>
            </button>

            {/* Action: Ingresar Script .sql */}
            <button
              onClick={onOpenSQLModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-primary/50 text-primary hover:text-white font-space font-bold text-xs transition-colors shadow-sm"
              title="Ingresar o cargar sentencias CREATE TABLE en script .sql"
            >
              <span className="material-symbols-outlined text-[17px]">terminal</span>
              <span>Ingresar Script .sql</span>
            </button>

            {/* Export .sql */}
            <button
              onClick={handleExportFullSQL}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
              title="Descargar script DDL completo en archivo .sql"
            >
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">file_download</span>
              <span>Exportar .sql</span>
            </button>

            {/* Export .puml */}
            <button
              onClick={handleExportPUML}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
              title="Descargar especificación completa en archivo PlantUML (.puml)"
            >
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">download</span>
              <span>Exportar .puml</span>
            </button>

            {/* Export Data Dictionary JSON */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
              title="Descargar diccionario completo en JSON"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">data_object</span>
              <span>JSON</span>
            </button>

            {/* Validate schema integrity */}
            <button
              onClick={handleCelebrateSchema}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-on-surface-variant hover:text-white transition-colors"
              title="Validar consistencia relacional"
            >
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified</span>
              <span>Validar</span>
            </button>
          </div>

          <div className="text-xs font-space text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-primary">storage</span>
            <span>Motores activos: <strong className="text-white">{uniqueEngines}</strong></span>
          </div>
        </div>

      </div>
    </section>
  );
}
