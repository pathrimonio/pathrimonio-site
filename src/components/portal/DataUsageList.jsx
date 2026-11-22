import React, { useState, useMemo } from 'react';

const COMMON_SQL_TYPES = [
  'VARCHAR(255)',
  'VARCHAR(100)',
  'TEXT',
  'INTEGER',
  'BIGINT',
  'NUMERIC(12,2)',
  'BOOLEAN',
  'TIMESTAMP',
  'DATE',
  'UUID',
  'JSONB',
  'FLOAT'
];

/**
 * Tabla interactiva de datos utilizados por una interfaz.
 * Permite visualizar, modificar filas en línea (Campo, Tipo, Tabla, Esquema, PK),
 * quitar datos y agregar nuevos campos manualmente.
 */
export default function DataUsageList({
  items = [],
  onRemove,
  onUpdate,
  onAdd,
  tables = [],
  onNotify
}) {
  const [editingKey, setEditingKey] = useState(null);
  const [editDraft, setEditDraft] = useState({
    attribute: '',
    type: '',
    tableName: '',
    schema: 'public',
    isPrimary: false
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState({
    attribute: '',
    type: 'VARCHAR(255)',
    tableName: '',
    schema: 'public',
    isPrimary: false
  });

  // Extraer nombres de tablas únicas del modelado de datos para autocompletado
  const availableTableNames = useMemo(() => {
    const names = new Set();
    tables.forEach(t => {
      if (t.tableName) names.add(t.tableName);
      if (t.name) names.add(t.name);
    });
    // También incluir las tablas de los items existentes
    items.forEach(it => {
      if (it.tableName) names.add(it.tableName);
    });
    return Array.from(names).filter(Boolean);
  }, [tables, items]);

  // Iniciar edición de una fila
  const handleStartEdit = (ref) => {
    setEditingKey(ref.key);
    setEditDraft({
      attribute: ref.attribute || '',
      type: ref.type || '',
      tableName: ref.tableName || '',
      schema: ref.schema || 'public',
      isPrimary: !!ref.isPrimary
    });
  };

  // Guardar modificación de la fila
  const handleSaveEdit = (key) => {
    const trimmedAttr = editDraft.attribute.trim();
    const trimmedTable = editDraft.tableName.trim();

    if (!trimmedAttr) {
      onNotify?.('El nombre del campo / atributo es obligatorio.');
      return;
    }
    if (!trimmedTable) {
      onNotify?.('El nombre de la tabla es obligatorio.');
      return;
    }

    onUpdate?.(key, {
      attribute: trimmedAttr,
      type: editDraft.type.trim() || 'VARCHAR(255)',
      tableName: trimmedTable,
      tableLabel: trimmedTable,
      schema: editDraft.schema.trim() || 'public',
      isPrimary: !!editDraft.isPrimary
    });

    setEditingKey(null);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
  };

  // Guardar nuevo campo manual
  const handleAddNewField = () => {
    const trimmedAttr = newField.attribute.trim();
    const trimmedTable = newField.tableName.trim();

    if (!trimmedAttr) {
      onNotify?.('Ingresa el nombre del campo o atributo.');
      return;
    }
    if (!trimmedTable) {
      onNotify?.('Ingresa el nombre de la tabla.');
      return;
    }

    const uniqueKey = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    onAdd?.({
      key: uniqueKey,
      tableId: uniqueKey,
      tableName: trimmedTable,
      tableLabel: trimmedTable,
      schema: newField.schema.trim() || 'public',
      attribute: trimmedAttr,
      type: newField.type.trim() || 'VARCHAR(255)',
      isPrimary: !!newField.isPrimary
    });

    setNewField({
      attribute: '',
      type: 'VARCHAR(255)',
      tableName: availableTableNames[0] || '',
      schema: 'public',
      isPrimary: false
    });
    setShowAddForm(false);
  };

  const hasActions = !!(onUpdate || onRemove);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Datalists globales para autocompletado */}
      <datalist id="common-sql-types-list">
        {COMMON_SQL_TYPES.map(t => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <datalist id="available-tables-list">
        {availableTableNames.map(t => (
          <option key={t} value={t} />
        ))}
      </datalist>

      {/* Formulario desplegable para agregar nuevo dato manualmente */}
      {onAdd && (
        <div>
          {showAddForm ? (
            <div className="p-3.5 rounded-xl bg-surface-container border border-primary/50 flex flex-col gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                <span className="text-xs font-space font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Agregar Nuevo Dato Utilizado</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-space text-primary uppercase font-bold">
                    Campo / Atributo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. monto_total"
                    value={newField.attribute}
                    onChange={(e) => setNewField({ ...newField, attribute: e.target.value })}
                    className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-lg text-xs font-mono text-primary outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-space text-white uppercase font-semibold">
                    Tipo de Dato
                  </label>
                  <input
                    type="text"
                    list="common-sql-types-list"
                    placeholder="VARCHAR(255)"
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                    className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-lg text-xs font-mono text-white outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-space text-white uppercase font-semibold">
                    Tabla *
                  </label>
                  <input
                    type="text"
                    required
                    list="available-tables-list"
                    placeholder="ej. tb_pedido"
                    value={newField.tableName}
                    onChange={(e) => setNewField({ ...newField, tableName: e.target.value })}
                    className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-lg text-xs font-mono text-white outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-space text-on-surface-variant uppercase font-semibold">
                    Esquema &amp; Clave
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="public"
                      value={newField.schema}
                      onChange={(e) => setNewField({ ...newField, schema: e.target.value })}
                      className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-lg text-xs font-mono text-on-surface-variant outline-none flex-1 transition-colors"
                    />
                    <label className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 cursor-pointer bg-surface-container-lowest border border-outline-variant px-2 h-8 rounded-lg shrink-0">
                      <input
                        type="checkbox"
                        checked={newField.isPrimary}
                        onChange={(e) => setNewField({ ...newField, isPrimary: e.target.checked })}
                        className="accent-primary"
                      />
                      <span>PK</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
                <span className="text-[11px] font-jakarta text-on-surface-variant">
                  Puedes ingresar cualquier campo existente o nuevo para documentar la pantalla.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-space text-on-surface-variant hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewField}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:scale-[1.01]"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Agregar Dato a la Interfaz</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-space text-primary hover:text-primary/80 transition-colors font-semibold p-1"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Agregar Campo Manualmente (nuevo dato o tabla)</span>
            </button>
          )}
        </div>
      )}

      {/* Tabla de Datos Utilizados */}
      {items.length > 0 ? (
        <div className="overflow-x-auto border border-outline-variant/80 rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-surface-container-high/80 text-on-surface border-b border-outline-variant/70 font-space uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3 font-bold text-primary border-r border-outline-variant/60">Campo</th>
                <th className="py-2 px-3 font-bold text-white border-r border-outline-variant/60">Tipo</th>
                <th className="py-2 px-3 font-bold text-white border-r border-outline-variant/60">Tabla</th>
                <th className="py-2 px-3 font-bold text-white border-r border-outline-variant/60">Esquema</th>
                {hasActions && <th className="py-2 px-2 text-right w-20">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 font-jakarta">
              {items.map((ref) => {
                const isThisRowEditing = editingKey === ref.key;

                if (isThisRowEditing) {
                  return (
                    <tr key={ref.key} className="bg-primary/5 border-l-2 border-primary animate-fadeIn">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={editDraft.attribute}
                            onChange={(e) => setEditDraft({ ...editDraft, attribute: e.target.value })}
                            placeholder="Nombre campo"
                            className="w-full h-7 px-2 bg-surface-container border border-primary rounded font-mono text-xs text-primary font-bold outline-none"
                          />
                          <label className="flex items-center gap-0.5 text-[9px] font-mono text-emerald-400 font-bold bg-surface-container px-1 py-1 rounded border border-outline-variant cursor-pointer shrink-0" title="Clave Primaria">
                            <input
                              type="checkbox"
                              checked={editDraft.isPrimary}
                              onChange={(e) => setEditDraft({ ...editDraft, isPrimary: e.target.checked })}
                              className="accent-primary"
                            />
                            <span>PK</span>
                          </label>
                        </div>
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          list="common-sql-types-list"
                          value={editDraft.type}
                          onChange={(e) => setEditDraft({ ...editDraft, type: e.target.value })}
                          placeholder="VARCHAR..."
                          className="w-full h-7 px-2 bg-surface-container border border-outline-variant focus:border-primary rounded font-mono text-xs text-white outline-none"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          list="available-tables-list"
                          value={editDraft.tableName}
                          onChange={(e) => setEditDraft({ ...editDraft, tableName: e.target.value })}
                          placeholder="tb_tabla"
                          className="w-full h-7 px-2 bg-surface-container border border-outline-variant focus:border-primary rounded font-mono text-xs text-white outline-none"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editDraft.schema}
                          onChange={(e) => setEditDraft({ ...editDraft, schema: e.target.value })}
                          placeholder="public"
                          className="w-full h-7 px-2 bg-surface-container border border-outline-variant focus:border-primary rounded font-mono text-xs text-on-surface-variant outline-none"
                        />
                      </td>

                      <td className="py-2 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(ref.key)}
                            className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Guardar modificación del campo"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
                            title="Cancelar edición"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={ref.key} className="hover:bg-surface-container/30 transition-colors">
                    <td className="py-1.5 px-3 font-mono text-primary whitespace-nowrap">
                      {ref.attribute}
                      {ref.isPrimary && (
                        <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30" title="Clave primaria">
                          PK
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-on-surface-variant whitespace-nowrap">
                      {ref.type || '—'}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-white truncate" title={ref.tableLabel || ref.tableName}>
                      {ref.tableName}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-on-surface-variant whitespace-nowrap">
                      {ref.schema || 'public'}
                    </td>
                    {hasActions && (
                      <td className="py-1.5 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {onUpdate && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(ref)}
                              className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                              title="Modificar este dato (campo, tipo, tabla, esquema)"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                          )}
                          {onRemove && (
                            <button
                              type="button"
                              onClick={() => onRemove(ref.key)}
                              className="p-1 rounded text-on-surface-variant hover:text-red-400 hover:bg-surface-container-high transition-colors"
                              title="Quitar dato de la interfaz"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !showAddForm && (
          <span className="text-[11px] font-jakarta italic text-on-surface-variant">
            Aún no agregaste datos a esta interfaz.
          </span>
        )
      )}
    </div>
  );
}
