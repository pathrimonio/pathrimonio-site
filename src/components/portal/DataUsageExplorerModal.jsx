import React, { useState, useMemo, useEffect } from 'react';

// Helper to determine database schema
function getDataModelSchema(table) {
  const raw = `${table?.storageTarget || ''} ${table?.storageLocation || ''}`.toLowerCase();
  if (raw.includes('sqlite')) return 'main';
  if (raw.includes('postgres') || raw.includes('supabase')) return 'public';
  return 'public';
}

// Helper to parse FK string
function parseForeignKey(fk) {
  if (!fk) return null;
  const clean = fk.replace(/ON DELETE.*$/i, '').replace(/ON UPDATE.*$/i, '').trim();

  let m = clean.match(/^([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)\s*\(\s*([a-zA-Z0-9_]+)\s*\)/);
  if (m) return { sourceTable: m[1], sourceCol: m[2] };

  m = clean.match(/^([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$/);
  if (m) return { sourceTable: m[1], sourceCol: m[2] };

  m = clean.match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)$/);
  if (m) return { sourceTable: m[1], sourceCol: m[2] };

  m = clean.match(/^([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)$/);
  if (m) return { sourceTable: m[1], sourceCol: 'id' };

  return null;
}

export default function DataUsageExplorerModal({
  isOpen,
  onClose,
  tables = [],
  selected = [],
  onChange,
  onNotify
}) {
  const [activeTab, setActiveTab] = useState('physical'); // 'physical' | 'logical'
  const [searchFilter, setSearchFilter] = useState('');
  const [onlySelectedTables, setOnlySelectedTables] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute all relationships across tables
  const relationships = useMemo(() => {
    const rels = [];
    tables.forEach((table) => {
      (table.attributes || []).forEach((attr) => {
        if (attr.foreignKey) {
          const parsed = parseForeignKey(attr.foreignKey);
          if (parsed) {
            rels.push({
              id: `${table.tableName}_${attr.name}_${parsed.sourceTable}`,
              sourceTable: parsed.sourceTable,
              sourceColumn: parsed.sourceCol,
              targetTable: table.tableName,
              targetColumn: attr.name,
              foreignKey: attr.name,
              cardinality: '1:N'
            });
          }
        }
      });
    });
    return rels;
  }, [tables]);

  // Map of selected keys for O(1) lookup
  const selectedKeysSet = useMemo(() => {
    return new Set((selected || []).map((ref) => ref.key));
  }, [selected]);

  const isFieldSelected = (key) => selectedKeysSet.has(key);

  // Build field object matching DataUsagePicker structure
  const buildFieldItem = (table, attr) => {
    const schema = getDataModelSchema(table);
    return {
      key: `${table.id}:${attr.id || attr.name}`,
      tableId: table.id,
      tableName: table.tableName || table.name,
      tableLabel: table.name || table.tableName,
      schema,
      attribute: attr.name,
      type: attr.type,
      isPrimary: !!attr.isPrimary,
      foreignKey: attr.foreignKey || null
    };
  };

  // Toggle selection of a single field
  const handleToggleField = (table, attr) => {
    const item = buildFieldItem(table, attr);
    if (isFieldSelected(item.key)) {
      const next = (selected || []).filter((ref) => ref.key !== item.key);
      onChange?.(next);
      onNotify?.(`Campo "${table.tableName}.${attr.name}" desvinculado de la interfaz.`);
    } else {
      const next = [...(selected || []), item];
      onChange?.(next);
      onNotify?.(`Campo "${table.tableName}.${attr.name}" vinculado a la interfaz.`);
    }
  };

  // Remove a specific field from footer chip
  const handleRemoveFieldByKey = (key) => {
    const next = (selected || []).filter((ref) => ref.key !== key);
    onChange?.(next);
  };

  // Filter tables according to search query and selection filter
  const filteredTables = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return tables.filter((table) => {
      const schema = getDataModelSchema(table);
      const tableName = (table.tableName || '').toLowerCase();
      const tableLabel = (table.name || '').toLowerCase();
      const storage = (table.storageTarget || '').toLowerCase();

      // Check if any attributes match
      const matchingAttrs = (table.attributes || []).filter((attr) => {
        if (!q) return true;
        return (
          attr.name.toLowerCase().includes(q) ||
          (attr.type || '').toLowerCase().includes(q) ||
          (attr.description || '').toLowerCase().includes(q) ||
          (attr.foreignKey || '').toLowerCase().includes(q)
        );
      });

      const matchesSearch =
        !q ||
        tableName.includes(q) ||
        tableLabel.includes(q) ||
        schema.includes(q) ||
        storage.includes(q) ||
        matchingAttrs.length > 0;

      if (!matchesSearch) return false;

      if (onlySelectedTables) {
        const hasSelected = (table.attributes || []).some((attr) =>
          isFieldSelected(`${table.id}:${attr.id || attr.name}`)
        );
        if (!hasSelected) return false;
      }

      return true;
    });
  }, [tables, searchFilter, onlySelectedTables, selectedKeysSet]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-7xl bg-surface-container border border-outline-variant rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/60 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">schema</span>
            </span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-space text-base sm:text-lg font-bold text-white tracking-wide">
                  Explorador de Datos — Selección para Interfaz
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold">
                  DER FÍSICO
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant truncate">
                Haz clic en cualquier campo o atributo para agregarlo o removerlo de esta pantalla en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Counter badge of linked fields */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant text-xs font-space">
              <span className="material-symbols-outlined text-[15px] text-emerald-400">database</span>
              <span className="text-on-surface-variant">Campos vinculados:</span>
              <span className="font-mono text-emerald-400 font-bold">{selected.length}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-on-surface-variant hover:text-white p-1.5 rounded-lg transition-colors hover:bg-surface-container-high"
              title="Cerrar explorador"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* ── Navigation Tabs & Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between px-6 border-b border-outline-variant/60 bg-surface-container-lowest gap-3 text-xs font-space">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* TAB 1: DER FÍSICO DETALLADO (Active by default) */}
            <button
              type="button"
              onClick={() => setActiveTab('physical')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'physical'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">schema</span>
              <span>DER Físico (Detalle Completo)</span>
            </button>

            {/* TAB 2: MODELO LÓGICO */}
            <button
              type="button"
              onClick={() => setActiveTab('logical')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'logical'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">hub</span>
              <span>Modelo Lógico (Relaciones &amp; Conexiones)</span>
            </button>
          </div>

          {/* Quick Filter & Zoom */}
          <div className="flex items-center gap-2.5 py-1.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar entidad o atributo..."
                className="h-8 pl-8 pr-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder:text-on-surface-variant/60 focus:border-amber-400 focus:outline-none w-48 sm:w-60"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white text-[12px]"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>

            {/* Filter Toggle: Only with selected */}
            <button
              type="button"
              onClick={() => setOnlySelectedTables(!onlySelectedTables)}
              className={`h-8 px-2.5 rounded-lg border text-xs font-space flex items-center gap-1.5 transition-colors cursor-pointer ${
                onlySelectedTables
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:text-white'
              }`}
              title="Mostrar solo entidades con campos actualmente vinculados"
            >
              <span className="material-symbols-outlined text-[14px]">
                {onlySelectedTables ? 'check_box' : 'check_box_outline_blank'}
              </span>
              <span>Solo vinculados</span>
            </button>

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-surface-container-low border border-outline-variant px-1.5 py-1 rounded-lg">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.1))}
                className="p-0.5 rounded text-on-surface-variant hover:text-white"
                title="Reducir zoom"
              >
                <span className="material-symbols-outlined text-[14px]">zoom_out</span>
              </button>
              <span className="font-mono text-[10px] text-white px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(1.25, prev + 0.1))}
                className="p-0.5 rounded text-on-surface-variant hover:text-white"
                title="Aumentar zoom"
              >
                <span className="material-symbols-outlined text-[14px]">zoom_in</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content View Area ── */}
        <div className="flex-1 overflow-auto bg-surface-container-lowest/50 p-4 sm:p-6">
          {filteredTables.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[44px] text-on-surface-variant/40">table_chart_view</span>
              <p className="font-space text-sm text-white font-semibold">
                No se encontraron entidades coincidentes
              </p>
              <p className="font-jakarta text-xs text-on-surface-variant max-w-md">
                Prueba borrando el filtro de búsqueda o desmarcando "Solo vinculados" para explorar todas las tablas del proyecto.
              </p>
              {(searchFilter || onlySelectedTables) && (
                <button
                  type="button"
                  onClick={() => { setSearchFilter(''); setOnlySelectedTables(false); }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant text-xs font-space text-primary hover:underline cursor-pointer"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          ) : (
            <div
              className="flex flex-col gap-6 transition-transform origin-top-left"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            >
              {/* Relationships summary banner */}
              {relationships.length > 0 && activeTab === 'physical' && (
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[18px]">polyline</span>
                    <span className="font-space text-xs font-bold text-white uppercase tracking-wider">
                      Relaciones y Llaves Foráneas Detectadas ({relationships.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {relationships.map((rel) => (
                      <div
                        key={rel.id}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-container-highest border border-outline-variant/80 font-mono text-[11px]"
                      >
                        <span className="text-white font-bold">{rel.sourceTable}</span>
                        <span className="text-emerald-400 font-bold">───&lt; 1:N &gt;───</span>
                        <span className="text-cyan-300 font-bold">{rel.targetTable}</span>
                        <span className="text-on-surface-variant text-[10px] bg-surface-container px-1 rounded border border-outline-variant">
                          fk: {rel.foreignKey}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── DER FÍSICO DETALLADO: Grid de Tarjetas de Entidades ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
                {filteredTables.map((table) => {
                  const schema = getDataModelSchema(table);
                  const pks = (table.attributes || []).filter((a) => a.isPrimary);
                  const fks = (table.attributes || []).filter((a) => a.foreignKey);

                  const selectedInTable = (table.attributes || []).filter((attr) =>
                    isFieldSelected(`${table.id}:${attr.id || attr.name}`)
                  ).length;

                  return (
                    <div
                      key={table.id}
                      className={`bg-surface-container-low border-2 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 flex flex-col ${
                        selectedInTable > 0
                          ? 'border-emerald-500/60 ring-1 ring-emerald-500/20'
                          : 'border-outline-variant hover:border-amber-400/60'
                      }`}
                    >
                      {/* Entity Header */}
                      <div className="bg-surface-container p-3.5 border-b border-outline-variant flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">table_chart</span>
                          <div className="min-w-0">
                            <h3 className="font-mono text-sm font-bold text-white tracking-wide truncate">
                              {table.tableName}
                            </h3>
                            <span className="font-jakarta text-[11px] text-on-surface-variant truncate block">
                              {table.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {selectedInTable > 0 && (
                            <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                              {selectedInTable} en interfaz
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                            {schema}
                          </span>
                        </div>
                      </div>

                      {/* Columns List (Schema View with Click-to-Select) */}
                      <div className="p-2.5 divide-y divide-outline-variant/30 text-xs">
                        {(table.attributes || []).map((col) => {
                          const fieldKey = `${table.id}:${col.id || col.name}`;
                          const isSelected = isFieldSelected(fieldKey);

                          return (
                            <div
                              key={col.id || col.name}
                              onClick={() => handleToggleField(table, col)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleToggleField(table, col);
                                }
                              }}
                              className={`py-2 px-2.5 flex items-center justify-between gap-2 rounded-lg transition-all cursor-pointer group ${
                                isSelected
                                  ? 'bg-emerald-500/15 border border-emerald-500/40 shadow-sm'
                                  : 'hover:bg-surface-container-high/60 border border-transparent'
                              }`}
                              title={
                                isSelected
                                  ? `Hacer clic para desvincular ${col.name} de la interfaz`
                                  : `Hacer clic para vincular ${col.name} a la interfaz`
                              }
                            >
                              {/* Left: Indicator, PK/FK, Name, Type */}
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
                                  <span className="w-5 h-5 flex items-center justify-center text-on-surface-variant/40 shrink-0 font-mono text-[10px]">
                                    •
                                  </span>
                                )}

                                <div className="flex flex-col min-w-0">
                                  <span className={`font-mono text-xs truncate ${
                                    isSelected
                                      ? 'text-emerald-300 font-bold'
                                      : col.isPrimary
                                      ? 'text-amber-300 font-semibold'
                                      : col.foreignKey
                                      ? 'text-cyan-300 font-medium'
                                      : 'text-white'
                                  }`}>
                                    {col.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-on-surface-variant truncate">
                                    {col.type} {!col.isNullable && '· NN'}
                                  </span>
                                </div>
                              </div>

                              {/* Right: State Button / Badge */}
                              <div className="flex items-center gap-1 shrink-0">
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[11px] font-space font-bold shadow-sm">
                                    <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                                    <span>Vinculado</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant text-on-surface-variant group-hover:border-amber-400 group-hover:text-amber-300 text-[11px] font-space transition-colors">
                                    <span className="material-symbols-outlined text-[13px] text-amber-400">add</span>
                                    <span>Vincular</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
        </div>

        {/* ── Modal Footer: Selected items chips & Action ── */}
        <div className="p-4 border-t border-outline-variant/60 bg-surface-container-low flex flex-col gap-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-space text-white font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
                <span>Campos seleccionados en esta interfaz ({selected.length}):</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-hover text-xs font-space font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Listo / Volver a la Interfaz</span>
              </button>
            </div>
          </div>

          {/* Chips list of currently selected fields */}
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
              {selected.map((item) => (
                <span
                  key={item.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-surface-container-high border border-outline-variant text-white shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-on-surface-variant text-[11px]">{item.tableName}.</span>
                  <span className="font-bold text-white">{item.attribute}</span>
                  <span className="text-[10px] text-on-surface-variant font-sans">({item.type || 'tipo'})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFieldByKey(item.key)}
                    className="hover:text-red-400 ml-1 text-on-surface-variant transition-colors"
                    title="Remover campo"
                  >
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="font-jakarta text-[11px] italic text-on-surface-variant">
              Ningún campo seleccionado aún. Haz clic sobre cualquier atributo de las entidades del DER para vincularlo.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
