import React, { useState } from 'react';
import { 
  STORAGE_TARGET_OPTIONS, 
  DATA_TYPE_OPTIONS, 
  TABLE_STATUS_OPTIONS, 
  DATA_MODULE_OPTIONS 
} from '../../data/initialDataModels';

export default function DataModelBuilder({
  onSaveTable,
  onNotify,
  existingStories = [],
  existingInterfaces = [],
  activeProjectId = 'pathway'
}) {
  const [tableName, setTableName] = useState('');
  const [name, setName] = useState('');
  const [module, setModule] = useState(
    activeProjectId === 'portal-admin' 
      ? 'Gestión & Monitoreo' 
      : activeProjectId === 'core-hub'
        ? 'Gestión de Crédito'
        : 'Metas & Hábitos (Pathway)'
  );
  const [storageTarget, setStorageTarget] = useState(
    activeProjectId === 'pathway'
      ? 'SQLite Cifrado (Offline-First Móvil)'
      : 'PostgreSQL (Supabase Cloud)'
  );
  const [storageLocation, setStorageLocation] = useState(
    activeProjectId === 'pathway'
      ? 'Sandbox Móvil (SQLCipher) + Sincronización Supabase Cloud'
      : 'Cluster PostgreSQL Cloud (AWS / Supabase) con réplica de lectura'
  );
  const [syncStrategy, setSyncStrategy] = useState(
    activeProjectId === 'pathway'
      ? 'Offline-First bidireccional con resolución de conflictos por timestamp'
      : 'Lectura/Escritura en tiempo real con WebSockets'
  );
  const [status, setStatus] = useState('Aprobado por Arquitectura');
  const [linkedStory, setLinkedStory] = useState('');
  const [linkedInterface, setLinkedInterface] = useState('');
  const [description, setDescription] = useState('');

  // Dynamic attributes list
  const [attributes, setAttributes] = useState([
    {
      id: 'a1',
      name: 'id',
      type: 'UUID',
      isPrimary: true,
      isNullable: false,
      isUnique: true,
      foreignKey: '',
      defaultValue: 'gen_random_uuid()',
      description: 'Clave primaria única e inmutable'
    },
    {
      id: 'a2',
      name: 'titulo',
      type: 'VARCHAR(255)',
      isPrimary: false,
      isNullable: false,
      isUnique: false,
      foreignKey: '',
      defaultValue: '',
      description: 'Nombre o título descriptivo'
    },
    {
      id: 'a3',
      name: 'created_at',
      type: 'TIMESTAMP WITH TIME ZONE',
      isPrimary: false,
      isNullable: false,
      isUnique: false,
      foreignKey: '',
      defaultValue: 'CURRENT_TIMESTAMP',
      description: 'Fecha y hora de registro'
    }
  ]);

  // Handle adding new attribute row
  const handleAddAttribute = () => {
    const newId = 'attr_' + Date.now();
    setAttributes(prev => [
      ...prev,
      {
        id: newId,
        name: '',
        type: 'VARCHAR(100)',
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        foreignKey: '',
        defaultValue: '',
        description: ''
      }
    ]);
  };

  // Handle removing attribute row
  const handleRemoveAttribute = (attrId) => {
    if (attributes.length <= 1) {
      onNotify?.('La tabla debe contener al menos un atributo.');
      return;
    }
    setAttributes(prev => prev.filter(a => a.id !== attrId));
  };

  // Handle field change in attribute
  const handleAttributeChange = (attrId, field, value) => {
    setAttributes(prev => prev.map(a => {
      if (a.id === attrId) {
        // If isPrimary is checked, set isNullable = false
        if (field === 'isPrimary' && value === true) {
          return { ...a, isPrimary: true, isNullable: false, isUnique: true };
        }
        return { ...a, [field]: value };
      }
      return a;
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!tableName.trim()) {
      onNotify?.('Por favor ingresa el nombre físico de la tabla (ej. tb_usuarios).');
      return;
    }
    if (!name.trim()) {
      onNotify?.('Por favor ingresa el título descriptivo de la entidad.');
      return;
    }

    // Sanitize table name
    const cleanTableName = tableName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Validate attributes
    const validAttributes = attributes.filter(a => a.name.trim() !== '');
    if (validAttributes.length === 0) {
      onNotify?.('Debes definir al menos un atributo con nombre para la tabla.');
      return;
    }

    const newTable = {
      id: `TBL-${Date.now().toString().slice(-4)}`,
      projectId: activeProjectId === 'all' ? 'pathway' : activeProjectId,
      tableName: cleanTableName,
      name: name.trim(),
      module,
      storageTarget,
      storageLocation: storageLocation.trim() || 'Servidor Cloud Administrado',
      syncStrategy: syncStrategy.trim() || 'Estándar Transaccional ACID',
      status,
      description: description.trim() || `Entidad de datos para gestión de ${name.trim()}`,
      linkedStory: linkedStory || null,
      linkedInterface: linkedInterface || null,
      author: 'Jhan C.',
      approvedAt: status === 'Aprobado por Arquitectura' ? new Date().toISOString().split('T')[0] : null,
      version: 'v1.0',
      attributes: validAttributes.map(a => ({
        ...a,
        name: a.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      }))
    };

    onSaveTable(newTable);
    onNotify?.(`¡Entidad "${cleanTableName}" registrada con éxito en el catálogo de datos!`);

    // Reset some fields
    setTableName('');
    setName('');
    setDescription('');
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space font-bold text-sm">
            <span className="material-symbols-outlined text-[18px]">add_chart</span>
          </div>
          <div>
            <h2 className="font-space text-lg font-bold text-white tracking-tight">
              Diseñar Nueva Tabla
            </h2>
            <p className="font-jakarta text-xs text-on-surface-variant">
              Formaliza el esquema relacional, atributos y destino de persistencia
            </p>
          </div>
        </div>

        <span className="font-space text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-primary font-mono">
          SQL DDL
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Table Name & Descriptive Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Nombre Físico (SQL)</span>
              <span className="text-primary font-mono">*</span>
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="ej. tb_ventas o tb_metas"
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Nombre de Entidad</span>
              <span className="text-primary font-mono">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Registro de Ventas y Comprobantes"
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3.5 py-2 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
        </div>

        {/* Storage Target & Module */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[15px]">database</span>
              <span>Motor / Repositorio</span>
            </label>
            <select
              value={storageTarget}
              onChange={(e) => setStorageTarget(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-space text-white focus:outline-none focus:border-primary transition-colors"
            >
              {STORAGE_TARGET_OPTIONS.filter(o => o !== 'Todos').map(opt => (
                <option key={opt} value={opt} className="bg-surface-container-highest text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
              Módulo del Software
            </label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-space text-white focus:outline-none focus:border-primary transition-colors"
            >
              {DATA_MODULE_OPTIONS.filter(m => m !== 'Todos').map(mod => (
                <option key={mod} value={mod} className="bg-surface-container-highest text-white">
                  {mod}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Storage Location & Sync Strategy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
              Ubicación & Cifrado en Reposo
            </label>
            <input
              type="text"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="ej. SQLite Local (SQLCipher AES-256) + Supabase"
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3.5 py-2 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
              Estrategia de Sincronización
            </label>
            <input
              type="text"
              value={syncStrategy}
              onChange={(e) => setSyncStrategy(e.target.value)}
              placeholder="ej. Offline-first con resolución por timestamp"
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3.5 py-2 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Cross-linking: User Story & Interface */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
              Historia Vinculada
            </label>
            <select
              value={linkedStory}
              onChange={(e) => setLinkedStory(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-space text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">(Ninguna)</option>
              {existingStories.map(s => (
                <option key={s.id} value={s.id} className="bg-surface-container-highest text-white">
                  {s.id}: {s.role.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
              Interfaz Vinculada
            </label>
            <select
              value={linkedInterface}
              onChange={(e) => setLinkedInterface(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-space text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">(Ninguna)</option>
              {existingInterfaces.map(i => (
                <option key={i.id} value={i.id} className="bg-surface-container-highest text-white">
                  {i.fullName || `${i.number}. ${i.title}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
              Estado de Arquitectura
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-space text-white focus:outline-none focus:border-primary transition-colors"
            >
              {TABLE_STATUS_OPTIONS.filter(s => s !== 'Todos').map(st => (
                <option key={st} value={st} className="bg-surface-container-highest text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
            Propósito / Regla de Negocio
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Describe qué datos maneja la entidad, reglas de integridad o políticas de retención..."
            className="w-full bg-surface-container-highest border border-outline-variant rounded-xl p-3 text-xs font-jakarta text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* ── Atributos / Columnas Builder ── */}
        <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/60">
          <div className="flex items-center justify-between">
            <label className="font-space text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">list_alt</span>
              <span>Definición de Atributos / Columnas ({attributes.length})</span>
            </label>

            <button
              type="button"
              onClick={handleAddAttribute}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-space text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>+ Añadir Campo</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
            {attributes.map((attr, idx) => (
              <div
                key={attr.id}
                className="bg-surface-container-highest/60 border border-outline-variant rounded-xl p-3 flex flex-col gap-2 hover:border-outline-variant transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Name */}
                  <div className="flex-1 min-w-[120px]">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
                      placeholder="nombre_columna"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Type */}
                  <div className="w-36">
                    <select
                      value={attr.type}
                      onChange={(e) => handleAttributeChange(attr.id, 'type', e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-primary transition-colors"
                    >
                      {DATA_TYPE_OPTIONS.map(t => (
                        <option key={t} value={t} className="bg-surface-container text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PK checkbox */}
                  <label className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-xs font-mono cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={attr.isPrimary}
                      onChange={(e) => handleAttributeChange(attr.id, 'isPrimary', e.target.checked)}
                      className="rounded accent-primary"
                    />
                    <span className={attr.isPrimary ? 'text-amber-400 font-bold' : 'text-on-surface-variant'}>PK</span>
                  </label>

                  {/* Nullable checkbox */}
                  <label className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-xs font-mono cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={attr.isNullable}
                      onChange={(e) => handleAttributeChange(attr.id, 'isNullable', e.target.checked)}
                      disabled={attr.isPrimary}
                      className="rounded accent-primary"
                    />
                    <span className={attr.isNullable ? 'text-amber-400' : 'text-emerald-400'}>
                      {attr.isNullable ? 'NULL' : 'NOT NULL'}
                    </span>
                  </label>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(attr.id)}
                    className="p-1 rounded text-on-surface-variant hover:text-red-400 hover:bg-surface-container transition-colors"
                    title="Eliminar atributo"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Foreign Key input */}
                  <input
                    type="text"
                    value={attr.foreignKey || ''}
                    onChange={(e) => handleAttributeChange(attr.id, 'foreignKey', e.target.value)}
                    placeholder="FK: ej. tb_metas(id)"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1 text-[11px] font-mono text-cyan-400 placeholder:text-on-surface-variant/40 focus:outline-none focus:border-cyan-400 transition-colors"
                  />

                  {/* Default value input */}
                  <input
                    type="text"
                    value={attr.defaultValue || ''}
                    onChange={(e) => handleAttributeChange(attr.id, 'defaultValue', e.target.value)}
                    placeholder="Default: ej. CURRENT_TIMESTAMP"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1 text-[11px] font-mono text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                  />

                  {/* Description input */}
                  <input
                    type="text"
                    value={attr.description || ''}
                    onChange={(e) => handleAttributeChange(attr.id, 'description', e.target.value)}
                    placeholder="Descripción o regla de negocio..."
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1 text-[11px] font-jakarta text-on-surface-variant placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-surface font-space font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Guardar y Registrar Entidad de Datos</span>
          </button>
        </div>

      </form>
    </div>
  );
}
