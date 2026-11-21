import React, { useState, useEffect } from 'react';
import { 
  STORAGE_TARGET_OPTIONS, 
  DATA_TYPE_OPTIONS, 
  TABLE_STATUS_OPTIONS, 
  DATA_MODULE_OPTIONS,
  generateTableDDL 
} from '../../data/initialDataModels';

export default function DataModelDetailModal({
  table,
  isOpen,
  onClose,
  onUpdateTable,
  existingStories = [],
  existingInterfaces = []
}) {
  const [activeTab, setActiveTab] = useState('attributes'); // 'attributes' | 'sql' | 'security'
  const [copiedSql, setCopiedSql] = useState(false);

  // Form states
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (table) {
      setFormData(JSON.parse(JSON.stringify(table)));
    }
  }, [table]);

  if (!isOpen || !formData) return null;

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttributeChange = (attrId, field, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: (prev.attributes || []).map(a => {
        if (a.id === attrId) {
          if (field === 'isPrimary' && value === true) {
            return { ...a, isPrimary: true, isNullable: false, isUnique: true };
          }
          return { ...a, [field]: value };
        }
        return a;
      })
    }));
  };

  const handleAddAttribute = () => {
    const newId = 'col_' + Date.now();
    setFormData(prev => ({
      ...prev,
      attributes: [
        ...(prev.attributes || []),
        {
          id: newId,
          name: 'nuevo_campo',
          type: 'VARCHAR(100)',
          isPrimary: false,
          isNullable: true,
          isUnique: false,
          foreignKey: '',
          defaultValue: '',
          description: ''
        }
      ]
    }));
  };

  const handleRemoveAttribute = (attrId) => {
    if ((formData.attributes || []).length <= 1) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter(a => a.id !== attrId)
    }));
  };

  const handleSave = () => {
    if (!formData.tableName?.trim()) return;
    onUpdateTable(formData);
    onClose();
  };

  const currentDDL = generateTableDDL(formData);

  const handleCopyDDL = () => {
    navigator.clipboard?.writeText(currentDDL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-surface-container-low border border-outline-variant rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/60 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space">
              <span className="material-symbols-outlined text-[22px]">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {formData.tableName}
                </span>
                <h2 className="font-space text-lg font-bold text-white tracking-tight">
                  {formData.name}
                </h2>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                Especificación técnica del esquema y almacenamiento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-outline-variant/60 bg-surface-container-lowest text-xs font-space">
          <button
            onClick={() => setActiveTab('attributes')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors ${
              activeTab === 'attributes'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_column</span>
            <span>Diccionario de Atributos ({formData.attributes?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors ${
              activeTab === 'sql'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            <span>Script SQL DDL</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors ${
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">security</span>
            <span>Persistencia & Seguridad</span>
          </button>
        </div>

        {/* ── Modal Body (Tab Content) ── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          
          {/* TAB 1: ATTRIBUTES */}
          {activeTab === 'attributes' && (
            <div className="flex flex-col gap-5">
              {/* Basic metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
                    Nombre Físico (SQL)
                  </label>
                  <input
                    type="text"
                    value={formData.tableName}
                    onChange={(e) => handleFieldChange('tableName', e.target.value)}
                    className="bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
                    Título de la Entidad
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-jakarta text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-space text-xs font-semibold text-white uppercase tracking-wider">
                    Estado de Arquitectura
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="bg-surface-container-highest border border-outline-variant rounded-xl px-3 py-2 text-xs font-space text-white focus:outline-none focus:border-primary"
                  >
                    {TABLE_STATUS_OPTIONS.filter(s => s !== 'Todos').map(st => (
                      <option key={st} value={st} className="bg-surface-container text-white">{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attributes Table Builder */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-space text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">list</span>
                    <span>Columnas y Tipos de Datos</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-space text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>+ Añadir Atributo</span>
                  </button>
                </div>

                <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-highest/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-space font-semibold uppercase text-on-surface-variant">
                        <th className="py-2.5 px-3">Nombre</th>
                        <th className="py-2.5 px-3">Tipo</th>
                        <th className="py-2.5 px-3 text-center">PK</th>
                        <th className="py-2.5 px-3 text-center">Nulo</th>
                        <th className="py-2.5 px-3">Referencia FK</th>
                        <th className="py-2.5 px-3">Default</th>
                        <th className="py-2.5 px-3">Descripción</th>
                        <th className="py-2.5 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/40 text-xs">
                      {(formData.attributes || []).map((attr) => (
                        <tr key={attr.id} className="hover:bg-surface-container/60 transition-colors">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={attr.name}
                              onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 font-mono font-bold text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <select
                              value={attr.type}
                              onChange={(e) => handleAttributeChange(attr.id, 'type', e.target.value)}
                              className="bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 font-mono text-cyan-300 text-xs focus:outline-none focus:border-primary"
                            >
                              {DATA_TYPE_OPTIONS.map(t => (
                                <option key={t} value={t} className="bg-surface-container text-white">{t}</option>
                              ))}
                            </select>
                          </td>

                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={attr.isPrimary}
                              onChange={(e) => handleAttributeChange(attr.id, 'isPrimary', e.target.checked)}
                              className="accent-primary"
                            />
                          </td>

                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={attr.isNullable}
                              disabled={attr.isPrimary}
                              onChange={(e) => handleAttributeChange(attr.id, 'isNullable', e.target.checked)}
                              className="accent-primary"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={attr.foreignKey || ''}
                              onChange={(e) => handleAttributeChange(attr.id, 'foreignKey', e.target.value)}
                              placeholder="tb_ref(id)"
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 font-mono text-cyan-400 text-xs focus:outline-none focus:border-primary"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={attr.defaultValue || ''}
                              onChange={(e) => handleAttributeChange(attr.id, 'defaultValue', e.target.value)}
                              placeholder="default"
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 font-mono text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </td>

                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={attr.description || ''}
                              onChange={(e) => handleAttributeChange(attr.id, 'description', e.target.value)}
                              placeholder="Propósito..."
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 font-jakarta text-on-surface-variant text-xs focus:outline-none focus:border-primary"
                            />
                          </td>

                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(attr.id)}
                              className="text-on-surface-variant hover:text-red-400 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SQL DDL */}
          {activeTab === 'sql' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="font-jakarta text-xs text-on-surface-variant">
                  Código de inicialización DDL compatible con el motor <strong className="text-white">{formData.storageTarget}</strong>:
                </p>

                <button
                  type="button"
                  onClick={handleCopyDDL}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-surface font-space font-semibold text-xs transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedSql ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedSql ? '¡Copiado al Portapapeles!' : 'Copiar Script SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 font-mono text-xs text-primary leading-relaxed overflow-x-auto selection:bg-primary selection:text-surface">
                  <code>{currentDDL}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & PERSISTENCE */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-4 text-xs font-jakarta">
              <div className="bg-surface-container-highest/60 border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">enhanced_encryption</span>
                  <h4 className="font-space text-sm font-bold text-white">Políticas de Persistencia & Cifrado</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="font-space font-semibold text-white block mb-1">Motor Destino:</span>
                    <p className="text-on-surface-variant">{formData.storageTarget}</p>
                  </div>
                  <div>
                    <span className="font-space font-semibold text-white block mb-1">Ubicación de Archivo / Base:</span>
                    <p className="text-on-surface-variant">{formData.storageLocation}</p>
                  </div>
                  <div>
                    <span className="font-space font-semibold text-white block mb-1">Estrategia de Sincronización:</span>
                    <p className="text-on-surface-variant">{formData.syncStrategy}</p>
                  </div>
                  <div>
                    <span className="font-space font-semibold text-white block mb-1">Seguridad en Reposo:</span>
                    <p className="text-emerald-400 font-medium">Cifrado de disco AES-256 habilitado</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-highest/60 border border-outline-variant rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-[20px]">vpn_key</span>
                  <h4 className="font-space text-sm font-bold text-white">Row Level Security (RLS)</h4>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Las tablas en PostgreSQL / Supabase implementan políticas de RLS donde cada usuario autenticado sólo tiene permisos de lectura y escritura para registros donde <code className="text-primary font-mono bg-surface-container px-1 rounded">user_id = auth.uid()</code>, impidiendo accesos cruzados no autorizados.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-between p-4 border-t border-outline-variant/60 bg-surface-container-lowest">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-space">
            <span className="material-symbols-outlined text-primary text-[16px]">info</span>
            <span>Versión de esquema: {formData.version || 'v1.0'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-surface font-space font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
