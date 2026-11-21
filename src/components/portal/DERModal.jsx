import React, { useState } from 'react';
import { generatePlantUML, generateFullProjectSQL } from '../../data/initialDataModels';

export default function DERModal({
  isOpen,
  onClose,
  tables = [],
  projectName = "Pathway (App MVP)",
  onNotify
}) {
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'puml' | 'sql'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedPuml, setCopiedPuml] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  // Compute all relationships across tables
  const relationships = [];
  tables.forEach(table => {
    (table.attributes || []).forEach(attr => {
      if (attr.foreignKey) {
        const match = attr.foreignKey.match(/^([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)/);
        if (match) {
          relationships.push({
            id: `${table.tableName}_${attr.name}`,
            sourceTable: match[1],
            targetTable: table.tableName,
            foreignKey: attr.name,
            cardinality: '1:N'
          });
        }
      }
    });
  });

  const pumlCode = generatePlantUML(tables, projectName);
  const sqlCode = generateFullProjectSQL(tables, projectName);

  // File download helper
  const handleDownloadFile = (content, filename, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      onNotify?.(`Archivo "${filename}" descargado con éxito.`);
    } catch (_) {
      onNotify?.('Error al descargar el archivo.');
    }
  };

  const handleDownloadPUML = () => {
    const cleanName = (projectName || 'schema').toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const filename = `der_${cleanName}_${new Date().toISOString().split('T')[0]}.puml`;
    handleDownloadFile(pumlCode, filename, 'text/plain;charset=utf-8');
  };

  const handleDownloadSQL = () => {
    const cleanName = (projectName || 'schema').toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const filename = `ddl_${cleanName}_${new Date().toISOString().split('T')[0]}.sql`;
    handleDownloadFile(sqlCode, filename, 'text/sql;charset=utf-8');
  };

  const handleCopyPUML = () => {
    navigator.clipboard?.writeText(pumlCode);
    setCopiedPuml(true);
    setTimeout(() => setCopiedPuml(false), 2000);
    onNotify?.('Código PlantUML copiado al portapapeles.');
  };

  const handleCopySQL = () => {
    navigator.clipboard?.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    onNotify?.('Script SQL copiado al portapapeles.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-6xl h-[92vh] bg-surface-container-low border border-outline-variant rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── Modal Header ── */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-outline-variant/60 bg-surface-container-lowest gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">account_tree</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-space text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Diagrama Entidad-Relación (DER)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-space text-[11px] font-semibold">
                  {projectName}
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                {tables.length} entidades modeladas • {relationships.length} relaciones de llave foránea activas
              </p>
            </div>
          </div>

          {/* Quick Export & Close actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPUML}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors shadow-sm"
              title="Descargar diagrama en formato PlantUML (.puml)"
            >
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">download</span>
              <span>Exportar .puml</span>
            </button>

            <button
              onClick={handleDownloadSQL}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors shadow-sm"
              title="Descargar script completo en formato SQL (.sql)"
            >
              <span className="material-symbols-outlined text-primary text-[16px]">file_download</span>
              <span>Exportar .sql</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors ml-1"
              title="Cerrar DER"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* ── View Mode Tabs ── */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-outline-variant/60 bg-surface-container-lowest text-xs font-space">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors ${
                activeTab === 'diagram'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">schema</span>
              <span>Diagrama Gráfico (DER Visual)</span>
            </button>

            <button
              onClick={() => setActiveTab('puml')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors ${
                activeTab === 'puml'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>PlantUML (.puml)</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors ${
                activeTab === 'sql'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
              <span>Script SQL DDL (.sql)</span>
            </button>
          </div>

          {/* Zoom controls for diagram view */}
          {activeTab === 'diagram' && (
            <div className="hidden sm:flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg border border-outline-variant mb-2">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                className="p-1 rounded text-on-surface-variant hover:text-white"
                title="Reducir zoom"
              >
                <span className="material-symbols-outlined text-[15px]">zoom_out</span>
              </button>
              <span className="font-mono text-[11px] text-white px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                className="p-1 rounded text-on-surface-variant hover:text-white"
                title="Aumentar zoom"
              >
                <span className="material-symbols-outlined text-[15px]">zoom_in</span>
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded text-on-surface-variant hover:text-white text-[10px] font-mono ml-1"
                title="Restablecer zoom"
              >
                100%
              </button>
            </div>
          )}
        </div>

        {/* ── Content View Area ── */}
        <div className="flex-1 overflow-auto bg-surface-container-lowest/50 p-4 sm:p-6">
          
          {/* ════════════════════════════════════════════
              TAB 1: DIAGRAMA GRÁFICO (DER VISUAL)
          ════════════════════════════════════════════ */}
          {activeTab === 'diagram' && (
            <div 
              className="flex flex-col gap-8 transition-transform origin-top-left"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            >
              
              {/* Relationships summary pills banner */}
              {relationships.length > 0 && (
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">polyline</span>
                    <span className="font-space text-xs font-bold text-white uppercase tracking-wider">
                      Relaciones y Llaves Foráneas Detectadas ({relationships.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {relationships.map((rel) => (
                      <div 
                        key={rel.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-highest border border-outline-variant/80 font-mono text-xs"
                      >
                        <span className="text-white font-bold">{rel.sourceTable}</span>
                        <span className="text-emerald-400 font-bold">───&lt; 1:N &gt;───</span>
                        <span className="text-cyan-300 font-bold">{rel.targetTable}</span>
                        <span className="text-on-surface-variant text-[11px] bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant">
                          fk: {rel.foreignKey}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid of Entity Schema Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {tables.map((table) => {
                  const pks = (table.attributes || []).filter(a => a.isPrimary);
                  const fks = (table.attributes || []).filter(a => a.foreignKey);

                  return (
                    <div
                      key={table.id}
                      className="bg-surface-container-low border-2 border-outline-variant rounded-2xl overflow-hidden shadow-lg hover:border-primary transition-all duration-200 flex flex-col"
                    >
                      {/* Entity Header */}
                      <div className="bg-surface-container p-3.5 border-b border-outline-variant flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-primary text-[18px] shrink-0">table_chart</span>
                          <div className="min-w-0">
                            <h3 className="font-mono text-sm font-bold text-white tracking-wide truncate">
                              {table.tableName}
                            </h3>
                            <span className="font-jakarta text-[11px] text-on-surface-variant truncate block">
                              {table.name}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded shrink-0">
                          {table.storageTarget?.includes('SQLite') ? 'SQLite Móvil' : 'PostgreSQL'}
                        </span>
                      </div>

                      {/* Columns List (Schema View) */}
                      <div className="p-3 divide-y divide-outline-variant/30 text-xs">
                        {(table.attributes || []).map((col) => (
                          <div
                            key={col.id}
                            className="py-1.5 px-2 flex items-center justify-between gap-2 hover:bg-surface-container-highest/40 rounded transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {col.isPrimary ? (
                                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30 flex items-center justify-center shrink-0" title="Primary Key">
                                  PK
                                </span>
                              ) : col.foreignKey ? (
                                <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/30 flex items-center justify-center shrink-0" title={`Foreign Key: ${col.foreignKey}`}>
                                  FK
                                </span>
                              ) : (
                                <span className="w-5 h-5 flex items-center justify-center text-on-surface-variant/40 shrink-0 text-center font-mono text-[10px]">
                                  •
                                </span>
                              )}

                              <span className={`font-mono text-xs truncate ${col.isPrimary ? 'text-amber-300 font-bold' : col.foreignKey ? 'text-cyan-300 font-medium' : 'text-white'}`}>
                                {col.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                              <span className="text-on-surface-variant text-[10px]">
                                {col.type}
                              </span>
                              {!col.isNullable && (
                                <span className="text-emerald-400 font-bold text-[9px] bg-emerald-950/40 px-1 rounded">
                                  NN
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Entity Footer */}
                      <div className="bg-surface-container/60 p-2.5 border-t border-outline-variant/60 flex items-center justify-between text-[11px] font-space text-on-surface-variant">
                        <span>{table.attributes?.length || 0} atributos</span>
                        <span>{pks.length} PK • {fks.length} FK</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB 2: CÓDIGO PLANTUML (.PUML)
          ════════════════════════════════════════════ */}
          {activeTab === 'puml' && (
            <div className="flex flex-col gap-4">
              
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-cyan-400 text-[22px]">integration_instructions</span>
                  <div>
                    <h3 className="font-space text-sm font-bold text-white">Especificación Estándar PlantUML (.puml)</h3>
                    <p className="font-jakarta text-xs text-on-surface-variant">
                      Diagrama compatible con extensiones de VSCode, PlantText, IntelliJ IDEA, GitLab y GitHub Docs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPUML}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-cyan-400 text-[16px]">
                      {copiedPuml ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedPuml ? '¡Copiado!' : 'Copiar PUML'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPUML}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-space font-semibold text-xs transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Descargar .puml</span>
                  </button>
                </div>
              </div>

              {/* PUML Code display */}
              <div className="relative">
                <pre className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto selection:bg-cyan-600 selection:text-white">
                  <code>{pumlCode}</code>
                </pre>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB 3: SCRIPT SQL DDL (.SQL)
          ════════════════════════════════════════════ */}
          {activeTab === 'sql' && (
            <div className="flex flex-col gap-4">
              
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[22px]">terminal</span>
                  <div>
                    <h3 className="font-space text-sm font-bold text-white">Script DDL SQL Completo</h3>
                    <p className="font-jakarta text-xs text-on-surface-variant">
                      Sentencias CREATE TABLE, restricciones PRIMARY KEY, FOREIGN KEY y comentarios COMMENT ON COLUMN
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySQL}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      {copiedSql ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSQL}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-surface font-space font-bold text-xs transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_download</span>
                    <span>Descargar .sql</span>
                  </button>
                </div>
              </div>

              {/* SQL Code display */}
              <div className="relative">
                <pre className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 font-mono text-xs text-primary leading-relaxed overflow-x-auto selection:bg-primary selection:text-surface">
                  <code>{sqlCode}</code>
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-between p-4 border-t border-outline-variant/60 bg-surface-container-lowest text-xs font-space">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
            <span>DER generado conforme a arquitectura y persistencia de Pathrimonio</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
