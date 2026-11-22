import React, { useEffect, useMemo, useRef, useState } from 'react';
import DataUsageExplorerModal from './DataUsageExplorerModal';

function getDataModelSchema(table) {
  const raw = `${table?.storageTarget || ''} ${table?.storageLocation || ''}`.toLowerCase();
  if (raw.includes('sqlite')) return 'main';
  if (raw.includes('postgres') || raw.includes('supabase')) return 'public';
  return 'public';
}

/**
 * Buscador con sugerencias de campos del Modelado de Datos.
 * Cada sugerencia incluye campo, tipo, tabla y esquema.
 */
export default function DataUsagePicker({ tables = [], selected = [], onChange, onNotify }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const rootRef = useRef(null);

  const index = useMemo(() => tables.flatMap((table) => {
    const schema = getDataModelSchema(table);
    return (table.attributes || [])
      .filter((attr) => attr && attr.name)
      .map((attr) => ({
        key: `${table.id}:${attr.id || attr.name}`,
        tableId: table.id,
        tableName: table.tableName || table.name,
        tableLabel: table.name || table.tableName,
        schema,
        attribute: attr.name,
        type: attr.type,
        isPrimary: !!attr.isPrimary,
        foreignKey: attr.foreignKey || null
      }));
  }), [tables]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((item) =>
      item.attribute.toLowerCase().includes(q) ||
      (item.tableName || '').toLowerCase().includes(q) ||
      (item.tableLabel || '').toLowerCase().includes(q) ||
      item.schema.toLowerCase().includes(q) ||
      (item.type || '').toLowerCase().includes(q)
    ).slice(0, 12);
  }, [index, query]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isSelected = (key) => selected.some((ref) => ref.key === key);

  const add = (item) => {
    if (isSelected(item.key)) {
      onNotify?.('Ese campo ya está agregado a la interfaz.');
      return;
    }
    onChange?.([...selected, item]);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const first = results.find((item) => !isSelected(item.key));
      if (first) add(first);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar campo, tabla o esquema en Modelado de Datos..."
            className="h-9 w-full pl-8 pr-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-jakarta text-white placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsExplorerOpen(true)}
          className="h-9 px-3 rounded-lg bg-surface-container border border-amber-400/50 hover:border-amber-400 text-amber-300 hover:bg-amber-500/15 text-xs font-space font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
          title="Explorar y seleccionar campos en el DER Físico (Detalle Completo)"
        >
          <span className="material-symbols-outlined text-[17px] text-amber-400">schema</span>
          <span>Explorar</span>
        </button>
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container shadow-2xl">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-[11px] italic text-on-surface-variant">
              Sin coincidencias en el modelo de datos.
            </p>
          ) : (
            results.map((item) => {
              const already = isSelected(item.key);
              return (
                <button
                  type="button"
                  key={item.key}
                  disabled={already}
                  onClick={() => add(item)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-left transition-colors ${
                    already ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-high'
                  }`}
                >
                  <span className="min-w-0 flex flex-col">
                    <span className="font-mono text-xs text-white truncate">
                      {item.attribute}
                      <span className="text-on-surface-variant"> · {item.type || 'sin tipo'}</span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant truncate">
                      {item.schema}.{item.tableName} — {item.tableLabel}
                    </span>
                  </span>
                  <span className={`material-symbols-outlined text-[16px] shrink-0 ${already ? 'text-emerald-400' : 'text-primary'}`}>
                    {already ? 'check_circle' : 'add_circle'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Modal Explorador DER Físico (Detalle Completo) */}
      <DataUsageExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        tables={tables}
        selected={selected}
        onChange={onChange}
        onNotify={onNotify}
      />
    </div>
  );
}
