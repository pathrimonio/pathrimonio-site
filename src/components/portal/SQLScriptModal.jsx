import React, { useState, useRef, useEffect } from 'react';
import { 
  STORAGE_TARGET_OPTIONS, 
  DATA_MODULE_OPTIONS, 
  parseSQLScript 
} from '../../data/initialDataModels';

const SAMPLE_SQL_SCRIPT = `-- ══════════════════════════════════════════════════════════
-- Ejemplo de Script DDL SQL para Pathrimonio
-- Puedes pegar una o múltiples tablas CREATE TABLE
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tb_pedidos_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden VARCHAR(50) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(255) NOT NULL,
    monto_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    estado_orden VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    fecha_entrega_estimada DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_detalles_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES tb_pedidos_clientes(id) ON DELETE CASCADE,
    producto_nombre VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

COMMENT ON COLUMN tb_pedidos_clientes.numero_orden IS 'Código correlativo de orden de compra comercial';
COMMENT ON COLUMN tb_pedidos_clientes.monto_total IS 'Importe total con impuestos incluidos';
`;

const SAMPLE_LOGISTICS_SQL = `-- ══════════════════════════════════════════════════════════
-- Ejemplo de Logística y Transporte (nucleo.tb_servicio & tb_item_carga)
-- Relación 1:N entre Servicio Maestro e Ítems de Carga
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nucleo.tb_servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_servicio VARCHAR(50) NOT NULL UNIQUE,
    cliente_solicitante VARCHAR(255) NOT NULL,
    tipo_servicio VARCHAR(50) NOT NULL DEFAULT 'Carga Terrestre',
    estado_servicio VARCHAR(30) NOT NULL DEFAULT 'programado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_item_carga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servicio_id UUID NOT NULL REFERENCES nucleo.tb_servicio(id) ON DELETE CASCADE,
    descripcion_item VARCHAR(255) NOT NULL,
    peso_kg DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    volumen_m3 DECIMAL(10,2) NOT NULL DEFAULT 0.10,
    es_peligrosa BOOLEAN NOT NULL DEFAULT false
);

COMMENT ON COLUMN nucleo.tb_servicio.codigo_servicio IS 'Identificador correlativo del despacho o servicio logístico';
COMMENT ON COLUMN tb_item_carga.servicio_id IS 'Llave foránea que asocia el ítem de carga con el servicio maestro';
`;

export default function SQLScriptModal({
  isOpen,
  onClose,
  onImportTables,
  activeProject,
  onNotify
}) {
  const availableModules = (activeProject?.modules && activeProject.modules.length > 0)
    ? activeProject.modules
    : DATA_MODULE_OPTIONS.filter(m => m !== 'Todos');

  const defaultModule = availableModules[0] || 'General / Modelo Central';

  const [sqlText, setSqlText] = useState(SAMPLE_SQL_SCRIPT);
  const [targetStorage, setTargetStorage] = useState(
    activeProject?.id === 'pathway' 
      ? 'SQLite Cifrado (Offline-First Móvil)' 
      : 'PostgreSQL (Supabase Cloud)'
  );
  const [targetModule, setTargetModule] = useState(defaultModule);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const fileInputRef = useRef(null);

  // Sync module default if active project changes
  useEffect(() => {
    if (availableModules.length > 0 && !availableModules.includes(targetModule)) {
      setTargetModule(availableModules[0]);
    }
  }, [activeProject]);

  if (!isOpen) return null;

  // Handle live parsing
  const handleParse = (textToParse = sqlText) => {
    if (!textToParse?.trim()) {
      onNotify?.('Por favor ingresa o carga un script SQL primero.');
      return;
    }
    const results = parseSQLScript(
      textToParse,
      activeProject?.id || 'pathway',
      targetModule,
      targetStorage
    );
    setParsedPreview(results);
    if (results.length === 0) {
      onNotify?.('No se detectaron sentencias CREATE TABLE válidas en el script.');
    } else {
      setActiveTab('preview');
      onNotify?.(`¡Script analizado con éxito! Se detectaron ${results.length} tablas.`);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.sql') && !file.name.endsWith('.txt')) {
        onNotify?.('Por favor selecciona un archivo con extensión .sql');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setSqlText(content);
          handleParse(content);
          onNotify?.(`Archivo "${file.name}" cargado exitosamente.`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Confirm import into state (Direct single-click import supported from either editor or preview)
  const handleConfirmImport = () => {
    const tablesToImport = parseSQLScript(
      sqlText,
      activeProject?.id || 'pathway',
      targetModule,
      targetStorage
    );

    if (!tablesToImport || tablesToImport.length === 0) {
      onNotify?.('No se detectaron sentencias CREATE TABLE válidas en el script SQL.');
      return;
    }

    onImportTables?.(tablesToImport);
    onNotify?.(`¡${tablesToImport.length} entidades de datos importadas correctamente al proyecto "${activeProject?.name || 'Software Activo'}"!`);
    onClose();
  };

  const totalCols = (parsedPreview || []).reduce((acc, t) => acc + (t.attributes?.length || 0), 0);
  const totalPKs = (parsedPreview || []).reduce((acc, t) => acc + (t.attributes?.filter(a => a.isPrimary).length || 0), 0);
  const totalFKs = (parsedPreview || []).reduce((acc, t) => acc + (t.attributes?.filter(a => a.foreignKey).length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-5xl h-[90vh] bg-surface-container-low border border-outline-variant rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── Modal Header ── */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-outline-variant/60 bg-surface-container-lowest gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-space shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">terminal</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-space text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Ingresar Script SQL (.sql)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-space text-[11px] font-semibold">
                  {activeProject?.name || 'Software Activo'}
                </span>
              </div>
              <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                Pega sentencias CREATE TABLE o sube un archivo .sql para generar entidades y atributos automáticamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* ── Configuration & View Switcher Bar ── */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-outline-variant/60 bg-surface-container-lowest gap-3 text-xs font-space">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'editor'
                  ? 'bg-surface-container-highest text-primary border border-primary/40'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Editor de Script SQL</span>
            </button>

            <button
              onClick={() => handleParse()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'preview'
                  ? 'bg-surface-container-highest text-cyan-300 border border-cyan-400/40'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Vista Previa {parsedPreview ? `(${parsedPreview.length} tablas)` : ''}</span>
            </button>
          </div>

          {/* Target Engine & Module selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant">
              <span className="text-on-surface-variant text-[11px]">Motor:</span>
              <select
                value={targetStorage}
                onChange={(e) => setTargetStorage(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                {STORAGE_TARGET_OPTIONS.filter(o => o !== 'Todos').map(opt => (
                  <option key={opt} value={opt} className="bg-surface-container-highest text-white">{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant">
              <span className="text-on-surface-variant text-[11px]">Módulo del Software:</span>
              <select
                value={targetModule}
                onChange={(e) => setTargetModule(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                {availableModules.map(mod => (
                  <option key={mod} value={mod} className="bg-surface-container-highest text-white">{mod}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Modal Content ── */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col gap-4">
          
          {/* TAB 1: SQL EDITOR */}
          {activeTab === 'editor' && (
            <div className="flex flex-col gap-3 h-full">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-space text-white font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">code</span>
                  <span>Sentencias DDL SQL (CREATE TABLE, PRIMARY KEY, FOREIGN KEY, COMMENT ON)</span>
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".sql,.txt"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-cyan-400 text-[15px]">upload_file</span>
                    <span>Cargar archivo .sql</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSqlText(SAMPLE_LOGISTICS_SQL);
                      onNotify?.('Plantilla Logística (nucleo.tb_servicio & tb_item_carga) cargada.');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-space text-cyan-300 hover:text-white transition-colors"
                    title="Insertar ejemplo logístico con relación nucleo.tb_servicio y tb_item_carga"
                  >
                    <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                    <span>nucleo.tb_servicio & tb_item_carga</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSqlText(SAMPLE_SQL_SCRIPT);
                      onNotify?.('Plantilla E-Commerce (tb_pedidos & tb_detalles) cargada.');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-space text-on-surface-variant hover:text-white transition-colors"
                    title="Insertar plantilla de ejemplo e-commerce"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                    <span>Ejemplo Pedidos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSqlText('')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-space text-on-surface-variant hover:text-red-400 transition-colors"
                    title="Limpiar editor"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              {/* Textarea Code Editor */}
              <div className="flex-1 min-h-[340px] relative">
                <textarea
                  value={sqlText}
                  onChange={(e) => setSqlText(e.target.value)}
                  placeholder="CREATE TABLE tb_ejemplo (&#10;    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),&#10;    nombre VARCHAR(255) NOT NULL,&#10;    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP&#10;);"
                  className="w-full h-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 font-mono text-xs text-primary leading-relaxed focus:outline-none focus:border-primary transition-colors resize-none selection:bg-primary selection:text-surface"
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {/* TAB 2: LIVE PARSING PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex flex-col gap-5">
              {parsedPreview && parsedPreview.length > 0 ? (
                <>
                  {/* Summary Bar */}
                  <div className="bg-surface-container-highest/60 border border-outline-variant rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
                      <span className="font-space text-xs font-bold text-white uppercase tracking-wider">
                        Estructura Detectada Correctamente
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="bg-surface-container px-2 py-1 rounded border border-outline-variant text-white">
                        <strong className="text-primary">{parsedPreview.length}</strong> Tablas
                      </span>
                      <span className="bg-surface-container px-2 py-1 rounded border border-outline-variant text-white">
                        <strong className="text-cyan-400">{totalCols}</strong> Atributos
                      </span>
                      <span className="bg-surface-container px-2 py-1 rounded border border-outline-variant text-white">
                        <strong className="text-amber-400">{totalPKs}</strong> PK
                      </span>
                      <span className="bg-surface-container px-2 py-1 rounded border border-outline-variant text-white">
                        <strong className="text-emerald-400">{totalFKs}</strong> FK
                      </span>
                    </div>
                  </div>

                  {/* List of Extracted Tables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parsedPreview.map((table) => (
                      <div
                        key={table.id}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 shadow-md"
                      >
                        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-primary text-[18px]">table_chart</span>
                            <span className="font-mono text-xs font-bold text-white truncate">{table.tableName}</span>
                            <span className="text-on-surface-variant text-[11px] font-space">({table.name})</span>
                          </div>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                            {table.attributes.length} cols
                          </span>
                        </div>

                        {/* Columns list */}
                        <div className="divide-y divide-outline-variant/30 text-xs">
                          {table.attributes.map((attr) => (
                            <div key={attr.id} className="py-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {attr.isPrimary && (
                                  <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold flex items-center justify-center shrink-0">
                                    PK
                                  </span>
                                )}
                                {attr.foreignKey && (
                                  <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[9px] font-bold flex items-center justify-center shrink-0" title={attr.foreignKey}>
                                    FK
                                  </span>
                                )}
                                <span className="font-mono text-xs text-white truncate">{attr.name}</span>
                              </div>

                              <div className="flex items-center gap-2 font-mono text-[10px]">
                                <span className="text-cyan-300">{attr.type}</span>
                                {!attr.isNullable && (
                                  <span className="text-emerald-400 font-bold text-[9px]">NN</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-10 text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[28px] text-on-surface-variant">search_off</span>
                  <span className="font-space text-sm font-bold text-white">Sin tablas detectadas</span>
                  <p className="font-jakarta text-xs text-on-surface-variant">
                    Regresa a la pestaña "Editor de Script SQL" y haz clic en "Analizar Script".
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Modal Footer ── */}
        <div className="flex flex-wrap items-center justify-between p-4 border-t border-outline-variant/60 bg-surface-container-lowest gap-3 text-xs font-space">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[16px]">info</span>
            <span>Las tablas importadas se sincronizan automáticamente con el DER interactivo y los exportadores</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs text-white transition-colors"
            >
              Cancelar
            </button>

            {activeTab === 'editor' ? (
              <button
                type="button"
                onClick={() => handleParse()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/40 text-primary font-bold text-xs transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">manage_search</span>
                <span>Analizar Script</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-white text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Editar SQL</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-surface font-space font-bold text-xs transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-[17px]">download_done</span>
              <span>Importar e Incorporar Tablas</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
