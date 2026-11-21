import React, { useState } from 'react';
import { generatePlantUML, generateFullProjectSQL } from '../../data/initialDataModels';

// Helper to parse FK string formats:
// "tb_metas(id)", "nucleo.tb_servicio(servicio_id)", "tb_metas(id) ON DELETE CASCADE", "tb_ventas.id", etc.
function parseForeignKey(fk) {
  if (!fk) return null;
  const clean = fk.replace(/ON DELETE.*$/i, '').replace(/ON UPDATE.*$/i, '').trim();

  // Case 1: table(column) or schema.table(column)
  let m = clean.match(/^([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)\s*\(\s*([a-zA-Z0-9_]+)\s*\)/);
  if (m) return { sourceTable: m[1], sourceCol: m[2] };

  // Case 2: schema.table.column
  m = clean.match(/^([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$/);
  if (m) return { sourceTable: m[1], sourceCol: m[2] };

  // Case 3: table.column (no schema)
  m = clean.match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$/);
  if (m) return { sourceTable: m[1], sourceCol: m[2] };

  // Case 4: bare table name
  m = clean.match(/^([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)$/);
  if (m) return { sourceTable: m[1], sourceCol: 'id' };

  return null;
}

// Helper to match table name with or without schema prefix
function matchesTableName(table, nameToMatch) {
  if (!table || !nameToMatch) return false;
  const tName = (table.tableName || '').toLowerCase().trim();
  const target = nameToMatch.toLowerCase().trim();

  if (tName === target) return true;
  if (target.includes('.') && target.split('.')[1] === tName) return true;
  if (tName.includes('.') && tName.split('.')[1] === target) return true;
  return false;
}

export default function DERModal({
  isOpen,
  onClose,
  tables = [],
  projectName = "Pathway (App MVP)",
  onNotify
}) {
  const [activeTab, setActiveTab] = useState('logical'); // 'logical' | 'physical' | 'puml' | 'sql'
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [expandedTableIds, setExpandedTableIds] = useState(new Set());
  const [searchFilter, setSearchFilter] = useState('');
  const [filterOnlyConnected, setFilterOnlyConnected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedPuml, setCopiedPuml] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  // Compute all relationships across tables
  const relationships = [];
  tables.forEach(table => {
    (table.attributes || []).forEach(attr => {
      if (attr.foreignKey) {
        const parsed = parseForeignKey(attr.foreignKey);
        if (parsed) {
          relationships.push({
            id: `${table.tableName}_${attr.name}_${parsed.sourceTable}`,
            sourceTable: parsed.sourceTable,
            sourceColumn: parsed.sourceCol,
            targetTable: table.tableName,
            targetColumn: attr.name,
            foreignKey: attr.name,
            cardinality: '1:N',
            nullable: attr.isNullable,
            description: attr.description
          });
        }
      }
    });
  });

  // Toggle individual table expansion
  const toggleExpandTable = (tableId) => {
    setExpandedTableIds(prev => {
      const next = new Set(prev);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  };

  // Expand all / Collapse all attributes
  const handleExpandAll = () => {
    setExpandedTableIds(new Set(tables.map(t => t.id)));
    onNotify?.('Todos los atributos desglosados en el modelo lógico.');
  };

  const handleCollapseAll = () => {
    setExpandedTableIds(new Set());
    onNotify?.('Atributos comprimidos en el modelo lógico.');
  };

  // Handle relationship pill click
  const handleSelectRelationship = (rel) => {
    if (selectedRelationship?.id === rel.id) {
      setSelectedRelationship(null);
      onNotify?.('Resaltado de relación desactivado. Mostrando todas las entidades.');
    } else {
      setSelectedRelationship(rel);
      onNotify?.(`Relación seleccionada: ${rel.sourceTable} ───< 1:N >─── ${rel.targetTable} (fk: ${rel.foreignKey})`);
    }
  };

  // Filter tables for logical model view
  const filteredTables = tables.filter(table => {
    // Search query
    const q = searchFilter.toLowerCase().trim();
    const matchSearch = !q || (
      table.tableName.toLowerCase().includes(q) ||
      (table.name && table.name.toLowerCase().includes(q)) ||
      (table.attributes && table.attributes.some(a => a.name.toLowerCase().includes(q)))
    );

    // Only connected filter
    if (!filterOnlyConnected) return matchSearch;

    const hasRelations = relationships.some(r => 
      matchesTableName(table, r.sourceTable) || matchesTableName(table, r.targetTable)
    );
    return matchSearch && hasRelations;
  });

  const connectedCount = tables.filter(t => 
    relationships.some(r => matchesTableName(t, r.sourceTable) || matchesTableName(t, r.targetTable))
  ).length;

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
        className="w-full max-w-7xl h-[94vh] bg-surface-container-low border border-outline-variant rounded-2xl shadow-2xl flex flex-col overflow-hidden"
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
                  Diagrama Entidad-Relación (DER) & Modelo Lógico
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-space text-[11px] font-semibold">
                  {projectName}
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                {tables.length} entidades modeladas • {relationships.length} conexiones de llave foránea activas
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

        {/* ── View Mode Navigation Tabs ── */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-outline-variant/60 bg-surface-container-lowest text-xs font-space">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* TAB 1: MODELO LÓGICO */}
            <button
              onClick={() => setActiveTab('logical')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'logical'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">hub</span>
              <span>Modelo Lógico (Relaciones & Conexiones)</span>
            </button>

            {/* TAB 2: DER FÍSICO DETALLADO */}
            <button
              onClick={() => setActiveTab('physical')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'physical'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">schema</span>
              <span>DER Físico (Detalle Completo)</span>
            </button>

            {/* TAB 3: PLANTUML */}
            <button
              onClick={() => setActiveTab('puml')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'puml'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">account_tree</span>
              <span>PlantUML (.puml)</span>
            </button>

            {/* TAB 4: SCRIPT SQL */}
            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'sql'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">code</span>
              <span>Script SQL DDL (.sql)</span>
            </button>
          </div>

          {/* Zoom controls for canvas */}
          {(activeTab === 'logical' || activeTab === 'physical') && (
            <div className="hidden sm:flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg border border-outline-variant mb-2 shrink-0">
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
                onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
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
              TAB 1: MODELO LÓGICO (RELACIONES & CONEXIONES)
          ════════════════════════════════════════════ */}
          {activeTab === 'logical' && (
            <div 
              className="flex flex-col gap-6 transition-transform origin-top-left"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            >
              
              {/* ── 1. Interactive Relationships Header & Clickable Pills ── */}
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                    <h3 className="font-space text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Conexiones y Relaciones entre Tablas ({relationships.length})
                    </h3>
                  </div>
                  <span className="text-on-surface-variant text-[11px] font-jakarta">
                    Haz clic en una relación para <strong>resaltar las tablas involucradas</strong> en el modelo lógico.
                  </span>
                </div>

                {/* Relationships Pills Flow */}
                {relationships.length === 0 ? (
                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 text-xs text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">info</span>
                    <span>No se han definido llaves foráneas en este proyecto aún. Puedes agregarlas editando una tabla o importando un script SQL con sentencias REFERENCES.</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {relationships.map((rel) => {
                      const isSelected = selectedRelationship?.id === rel.id;
                      return (
                        <button
                          key={rel.id}
                          type="button"
                          onClick={() => handleSelectRelationship(rel)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-200 cursor-pointer select-none text-left ${
                            isSelected
                              ? 'bg-primary/20 border-2 border-primary ring-2 ring-primary/50 shadow-[0_0_18px_rgba(245,166,35,0.45)] scale-105'
                              : 'bg-surface-container-highest border border-outline-variant/80 hover:border-primary/50 text-white'
                          }`}
                          title={`Hacer clic para resaltar la conexión: ${rel.sourceTable} y ${rel.targetTable}`}
                        >
                          <span className="text-white font-bold">{rel.sourceTable}</span>
                          <span className="text-emerald-400 font-bold">───&lt; 1:N &gt;───</span>
                          <span className="text-cyan-300 font-bold">{rel.targetTable}</span>
                          <span className="text-on-surface-variant text-[11px] bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant">
                            fk: {rel.foreignKey}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping ml-0.5"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Active Highlight Banner */}
                {selectedRelationship && (
                  <div className="bg-primary/10 border border-primary/50 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-space animate-fadeIn mt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[18px] animate-pulse">link</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-bold">Relación Activa:</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold">
                            👑 [Padre] {selectedRelationship.sourceTable} ({selectedRelationship.sourceColumn || 'id'})
                          </span>
                          <span className="text-emerald-400 font-mono font-bold">───&lt; 1:N &gt;───</span>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                            🔗 [Hija] {selectedRelationship.targetTable} ({selectedRelationship.foreignKey})
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-[11px] font-jakarta mt-0.5">
                          Mostrando tablas involucradas resaltadas en dorado y cian. Los atributos clave se han desglosado automáticamente.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRelationship(null)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white font-space text-xs transition-colors flex items-center gap-1.5 ml-auto"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                      <span>Quitar Resaltado (Ver Todas)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── 2. Toolbar & Compression Controls ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-space">
                
                {/* Search Bar & Filter */}
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
                  <div className="relative flex-1 max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filtrar entidades en el modelo lógico..."
                      className="w-full h-8 bg-surface-container border border-outline-variant rounded-xl pl-9 pr-3 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setFilterOnlyConnected(!filterOnlyConnected)}
                    className={`px-3 py-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1.5 ${
                      filterOnlyConnected
                        ? 'bg-primary/20 border-primary text-primary font-semibold'
                        : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">polyline</span>
                    <span>Solo conectadas ({connectedCount})</span>
                  </button>
                </div>

                {/* Attribute Expand / Collapse Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExpandAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white transition-colors"
                    title="Desglosar y mostrar todos los atributos de todas las tablas"
                  >
                    <span className="material-symbols-outlined text-primary text-[16px]">unfold_more</span>
                    <span>Desglosar Atributos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCollapseAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white transition-colors"
                    title="Mantener comprimidos los atributos para una vista compacta de relaciones"
                  >
                    <span className="material-symbols-outlined text-cyan-400 text-[16px]">unfold_less</span>
                    <span>Comprimir Atributos</span>
                  </button>
                </div>

              </div>

              {/* ── 3. Logical Model Grid of Entities ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {filteredTables.map((table) => {
                  const pks = (table.attributes || []).filter(a => a.isPrimary);
                  const fks = (table.attributes || []).filter(a => a.foreignKey);

                  // Relationship highlighting state
                  const isSource = selectedRelationship && matchesTableName(table, selectedRelationship.sourceTable);
                  const isTarget = selectedRelationship && matchesTableName(table, selectedRelationship.targetTable);
                  const isHighlighted = isSource || isTarget;
                  const isDimmed = selectedRelationship && !isHighlighted;

                  // Expansion state: either user toggled it manually OR it's highlighted by an active relationship!
                  const isExpanded = expandedTableIds.has(table.id) || isHighlighted;

                  return (
                    <div
                      key={table.id}
                      className={`rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                        isSource
                          ? 'border-2 border-amber-400 ring-4 ring-amber-400/25 bg-surface-container shadow-[0_0_30px_rgba(245,166,35,0.4)] scale-[1.02] z-20'
                          : isTarget
                          ? 'border-2 border-cyan-400 ring-4 ring-cyan-400/25 bg-surface-container shadow-[0_0_30px_rgba(34,211,238,0.4)] scale-[1.02] z-20'
                          : isDimmed
                          ? 'opacity-25 grayscale-[50%] scale-[0.98] border border-outline-variant bg-surface-container-low'
                          : 'bg-surface-container-low border border-outline-variant hover:border-primary/60 shadow-md'
                      }`}
                    >
                      {/* Relationship Role Highlight Banner */}
                      {isSource && (
                        <div className="bg-amber-500/20 border-b border-amber-500/40 px-3.5 py-1.5 flex items-center justify-between text-amber-300 font-space text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                            <span>TABLA ORIGEN / PADRE (PK: {selectedRelationship.sourceColumn || 'id'})</span>
                          </div>
                          <span className="font-mono text-[11px] bg-amber-500/30 px-2 py-0.5 rounded">LADO 1</span>
                        </div>
                      )}

                      {isTarget && (
                        <div className="bg-cyan-500/20 border-b border-cyan-500/40 px-3.5 py-1.5 flex items-center justify-between text-cyan-300 font-space text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">link</span>
                            <span>TABLA DESTINO / HIJA (FK: {selectedRelationship.foreignKey})</span>
                          </div>
                          <span className="font-mono text-[11px] bg-cyan-500/30 px-2 py-0.5 rounded">LADO N</span>
                        </div>
                      )}

                      {/* Entity Header */}
                      <div className="bg-surface-container p-3.5 border-b border-outline-variant flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`material-symbols-outlined text-[20px] shrink-0 ${
                            isSource ? 'text-amber-400' : isTarget ? 'text-cyan-400' : 'text-primary'
                          }`}>
                            table_chart
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-mono text-sm font-bold text-white tracking-wide truncate">
                              {table.tableName}
                            </h4>
                            <span className="font-jakarta text-[11px] text-on-surface-variant truncate block">
                              {table.name}
                            </span>
                          </div>
                        </div>

                        {/* Breakdown Accordion Icon Button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleExpandTable(table.id)}
                            className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
                              isExpanded
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-surface-container-highest border-outline-variant text-on-surface-variant hover:text-white hover:border-primary/50'
                            }`}
                            title={isExpanded ? "Comprimir atributos de esta tabla" : "Desglosar campos y atributos"}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* ── COMPRESSED STATE (Campos Atributos Comprimidos) ── */}
                      {!isExpanded ? (
                        <div className="p-3.5 flex flex-col gap-2.5 bg-surface-container-lowest/40">
                          {/* Quick Keys Summary */}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            {pks.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                                <span className="font-bold">PK:</span>
                                <span>{pks.map(p => p.name).join(', ')}</span>
                              </div>
                            )}

                            {fks.length > 0 ? (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px]">
                                <span className="font-bold">FK:</span>
                                <span>{fks.map(f => f.name).join(', ')}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-on-surface-variant/60 font-space">Sin llaves foráneas</span>
                            )}
                          </div>

                          {/* Compressed Attributes Hint */}
                          <button
                            type="button"
                            onClick={() => toggleExpandTable(table.id)}
                            className="w-full py-2 px-3 rounded-xl bg-surface-container-highest/60 hover:bg-surface-container-highest border border-dashed border-outline-variant text-left flex items-center justify-between text-xs font-space text-on-surface-variant hover:text-white transition-colors group"
                          >
                            <span className="truncate">
                              {table.attributes?.length || 0} atributos comprimidos
                            </span>
                            <span className="flex items-center gap-1 text-primary text-[11px] font-medium group-hover:underline">
                              <span>Desglosar</span>
                              <span className="material-symbols-outlined text-[14px]">expand_more</span>
                            </span>
                          </button>
                        </div>
                      ) : (
                        /* ── DESGLOSADO / EXPANDED STATE (Campos Visibles) ── */
                        <div className="p-3 divide-y divide-outline-variant/30 text-xs bg-surface-container-lowest/30 animate-fadeIn">
                          {(table.attributes || []).map((col) => {
                            const isHighlightedCol = 
                              (isSource && col.isPrimary && col.name === (selectedRelationship?.sourceColumn || 'id')) ||
                              (isTarget && col.foreignKey && col.name === selectedRelationship?.foreignKey);

                            return (
                              <div
                                key={col.id}
                                className={`py-1.5 px-2 flex items-center justify-between gap-2 rounded transition-colors ${
                                  isHighlightedCol
                                    ? isSource 
                                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200' 
                                      : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
                                    : 'hover:bg-surface-container-highest/40'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {col.isPrimary ? (
                                    <span 
                                      className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30 flex items-center justify-center shrink-0" 
                                      title="Primary Key (Llave Primaria)"
                                    >
                                      PK
                                    </span>
                                  ) : col.foreignKey ? (
                                    <span 
                                      className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/30 flex items-center justify-center shrink-0" 
                                      title={`Foreign Key: ${col.foreignKey}`}
                                    >
                                      FK
                                    </span>
                                  ) : (
                                    <span className="w-5 h-5 flex items-center justify-center text-on-surface-variant/40 shrink-0 font-mono text-[10px]">
                                      •
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`font-mono text-xs truncate ${
                                      col.isPrimary 
                                        ? 'text-amber-300 font-bold' 
                                        : col.foreignKey 
                                        ? 'text-cyan-300 font-medium' 
                                        : 'text-white'
                                    }`}>
                                      {col.name}
                                    </span>

                                    {/* Specific connection tag */}
                                    {isHighlightedCol && (
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-space font-bold uppercase tracking-wider shrink-0 ${
                                        isSource ? 'bg-amber-400 text-black' : 'bg-cyan-400 text-black'
                                      }`}>
                                        {isSource ? 'PK Referenciada' : 'FK Vinculada'}
                                      </span>
                                    )}
                                  </div>
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
                            );
                          })}
                        </div>
                      )}

                      {/* Entity Footer */}
                      <div className="bg-surface-container/60 p-2.5 border-t border-outline-variant/60 flex items-center justify-between text-[11px] font-space text-on-surface-variant">
                        <span>{table.storageTarget?.includes('SQLite') ? 'SQLite Móvil' : 'PostgreSQL'}</span>
                        <span>{pks.length} PK • {fks.length} FK</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════
              TAB 2: DER FÍSICO (DETALLE COMPLETO DE ATRIBUTOS)
          ════════════════════════════════════════════ */}
          {activeTab === 'physical' && (
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
              TAB 3: CÓDIGO PLANTUML (.PUML)
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
              TAB 4: SCRIPT SQL DDL (.SQL)
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
            <span>Modelo Lógico & DER conforme a arquitectura de datos de Pathrimonio</span>
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
