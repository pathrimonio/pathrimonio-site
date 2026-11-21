import React from 'react';

/**
 * Tabla de datos utilizados por una interfaz.
 * Muestra campo, tipo, tabla y esquema. Si recibe onRemove, agrega el botón de quitar.
 */
export default function DataUsageList({ items = [], onRemove }) {
  if (!items.length) return null;

  return (
    <div className="overflow-x-auto border border-outline-variant/80 rounded-xl bg-surface-container-lowest shadow-sm">
      <table className="w-full text-left text-[11px] border-collapse">
        <thead className="bg-surface-container-high/80 text-on-surface border-b border-outline-variant/70 font-space uppercase tracking-wider">
          <tr>
            <th className="py-2 px-3 font-bold text-primary border-r border-outline-variant/60">Campo</th>
            <th className="py-2 px-3 font-bold text-white border-r border-outline-variant/60">Tipo</th>
            <th className="py-2 px-3 font-bold text-white border-r border-outline-variant/60">Tabla</th>
            <th className="py-2 px-3 font-bold text-white">Esquema</th>
            {onRemove && <th className="py-2 px-2 w-8"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/40 font-jakarta">
          {items.map((ref) => (
            <tr key={ref.key} className="hover:bg-surface-container/30 transition-colors">
              <td className="py-1.5 px-3 font-mono text-primary whitespace-nowrap">
                {ref.attribute}
                {ref.isPrimary && <span className="ml-1 text-[9px] text-emerald-400" title="Clave primaria">PK</span>}
              </td>
              <td className="py-1.5 px-3 font-mono text-on-surface-variant whitespace-nowrap">{ref.type || '—'}</td>
              <td className="py-1.5 px-3 font-mono text-white truncate" title={ref.tableLabel || ref.tableName}>
                {ref.tableName}
              </td>
              <td className="py-1.5 px-3 font-mono text-on-surface-variant whitespace-nowrap">{ref.schema}</td>
              {onRemove && (
                <td className="py-1.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(ref.key)}
                    className="p-0.5 rounded text-on-surface-variant hover:text-red-400 hover:bg-surface-container-high transition-colors"
                    title="Quitar dato de la interfaz"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
