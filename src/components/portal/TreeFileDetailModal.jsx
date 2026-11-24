import React, { useEffect, useMemo, useState } from 'react';
import { getFileVisualInfo } from '../../data/initialFiles';
import { formatBytes } from '../../data/projectTree';
import { getRecordTypeMeta, getRecordTypesForExtension } from '../../data/fileRecordTypes';

export default function TreeFileDetailModal({
  isOpen = false,
  node,
  onClose,
  onLoadRecords,
  onAddRecord,
  onDeleteRecord,
  onNotify
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [name, setName] = useState('');
  const [signature, setSignature] = useState('');
  const [description, setDescription] = useState('');
  const [lineNumber, setLineNumber] = useState('');

  const recordTypes = useMemo(
    () => getRecordTypesForExtension(node?.extension),
    [node?.extension]
  );
  const activeType = useMemo(
    () => recordTypes.find((item) => item.value === recordType) || recordTypes[0],
    [recordTypes, recordType]
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !node?.id) return undefined;
    let cancelled = false;
    setRecords([]);
    setLoading(true);

    Promise.resolve(onLoadRecords?.(node.id))
      .then((rows) => {
        if (!cancelled) setRecords(Array.isArray(rows) ? rows : []);
      })
      .catch((error) => {
        console.error('[FileRecords] load', error);
        if (!cancelled) onNotify?.('No se pudieron cargar los registros del archivo.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, node?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const firstType = getRecordTypesForExtension(node?.extension)[0];
    setRecordType(firstType?.value || 'record');
    setName('');
    setSignature('');
    setDescription('');
    setLineNumber('');
  }, [isOpen, node?.id, node?.extension]);

  if (!isOpen || !node) return null;

  const visualInfo = getFileVisualInfo(node.name);
  const displayedCount = loading ? (node.recordCount || 0) : records.length;
  const extensionLabel = node.extension ? `.${node.extension}` : 'sin extensión';

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!node?.id || !name.trim() || saving) return;

    const parsedLine = lineNumber.trim() ? Number(lineNumber) : null;
    if (lineNumber.trim() && !Number.isFinite(parsedLine)) {
      onNotify?.('La línea debe ser un número.');
      return;
    }

    setSaving(true);
    try {
      const created = await onAddRecord?.({
        nodeId: node.id,
        projectId: node.projectId,
        recordType: recordType || activeType?.value || 'record',
        name: name.trim(),
        signature: signature.trim(),
        description: description.trim(),
        lineNumber: parsedLine
      });

      if (created) {
        setRecords((prev) => [...prev, created]);
        setName('');
        setSignature('');
        setDescription('');
        setLineNumber('');
      }
    } catch (error) {
      console.error('[FileRecords] add', error);
      onNotify?.('No se pudo agregar el registro.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!record?.id || deletingId) return;
    setDeletingId(record.id);
    try {
      const ok = await onDeleteRecord?.(record);
      if (ok) {
        setRecords((prev) => prev.filter((item) => item.id !== record.id));
      }
    } catch (error) {
      console.error('[FileRecords] delete', error);
      onNotify?.('No se pudo eliminar el registro.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose?.(); }}
    >
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-surface-container border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-outline-variant/60 bg-surface-container-lowest">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${visualInfo.colorClass}`}>
              <span className="material-symbols-outlined text-[22px]">{visualInfo.icon}</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-space text-sm font-bold text-white truncate">{node.name}</h2>
              <p className="font-mono text-[10px] text-on-surface-variant truncate">
                {node.rootName} / {node.path}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant text-[9px] font-mono text-on-surface-variant">
                  {extensionLabel}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant text-[9px] font-mono text-on-surface-variant">
                  {formatBytes(node.sizeBytes)}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-[9px] font-mono text-primary font-bold">
                  {displayedCount} registros
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">data_object</span>
            <div>
              <p className="font-space text-xs font-semibold text-white">Registros abstractos del archivo</p>
              <p className="font-jakarta text-[11px] text-on-surface-variant mt-0.5">
                Agregá métodos, variables, clases, tablas o elementos propios de un archivo {extensionLabel}. Los tipos disponibles se adaptan a la extensión.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAdd}
            className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 flex flex-col gap-2.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-space text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Tipo de registro
                </label>
                <select
                  value={recordType}
                  onChange={(event) => setRecordType(event.target.value)}
                  className="h-9 bg-surface-container border border-outline-variant rounded-lg px-2 text-xs font-jakarta text-white focus:outline-none focus:border-primary"
                >
                  {recordTypes.map((item) => (
                    <option key={item.value} value={item.value} className="bg-surface-container text-white">
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-space text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={activeType?.namePlaceholder || 'Nombre'}
                  required
                  className="h-9 bg-surface-container border border-outline-variant rounded-lg px-2 text-xs font-mono text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-space text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Firma / Valor
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(event) => setSignature(event.target.value)}
                  placeholder={activeType?.signaturePlaceholder || '...'}
                  className="h-9 bg-surface-container border border-outline-variant rounded-lg px-2 text-xs font-mono text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-space text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Línea
                </label>
                <input
                  type="number"
                  min="1"
                  value={lineNumber}
                  onChange={(event) => setLineNumber(event.target.value)}
                  placeholder="—"
                  className="h-9 bg-surface-container border border-outline-variant rounded-lg px-2 text-xs font-mono text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-space text-[9px] uppercase tracking-wider text-on-surface-variant">
                Descripción <span className="normal-case tracking-normal text-on-surface-variant/60">(opcional)</span>
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Qué hace, para qué sirve o dónde se usa..."
                className="bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 text-xs font-jakarta text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary text-on-primary font-space text-[11px] font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {saving ? 'Agregando...' : 'Agregar registro'}
            </button>
          </form>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-space text-[10px] uppercase tracking-wider text-on-surface-variant">
                Registros cargados
              </h3>
              <span className="font-mono text-[10px] text-on-surface-variant">{records.length}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8">
                <span className="material-symbols-outlined text-[20px] text-primary animate-spin">progress_activity</span>
                <span className="font-jakarta text-xs text-on-surface-variant">Cargando registros...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-surface-container-lowest border border-dashed border-outline">
                <span className="material-symbols-outlined text-[26px] text-on-surface-variant/60">data_object</span>
                <p className="font-jakarta text-xs text-on-surface-variant mt-1">
                  Sin registros abstractos todavía. Agregá el primero usando el formulario.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {records.map((record) => {
                  const meta = getRecordTypeMeta(record.recordType);
                  return (
                    <div
                      key={record.id}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 shrink-0">
                        {meta.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[9px] font-bold uppercase">
                            {meta.label}
                          </span>
                          <span className="font-mono text-xs text-white font-semibold break-all">{record.name}</span>
                          {record.lineNumber && (
                            <span className="font-mono text-[10px] text-on-surface-variant">L{record.lineNumber}</span>
                          )}
                        </div>
                        {record.signature && (
                          <pre className="font-mono text-[10px] text-cyan-300 whitespace-pre-wrap break-words mt-0.5">
                            {record.signature}
                          </pre>
                        )}
                        {record.description && (
                          <p className="font-jakarta text-[10px] text-on-surface-variant mt-0.5">
                            {record.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(record)}
                        disabled={deletingId === record.id}
                        className="p-1 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0"
                        title="Eliminar registro"
                      >
                        <span className={`material-symbols-outlined text-[15px] ${deletingId === record.id ? 'animate-spin' : ''}`}>
                          {deletingId === record.id ? 'progress_activity' : 'delete'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 border-t border-outline-variant/60 bg-surface-container-lowest">
          <p className="font-jakarta text-[10px] text-on-surface-variant">
            Los registros se guardan en Supabase y quedan vinculados a este archivo.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white font-space text-[11px] font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
