import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle2,
  TrendingUp,
  Send
} from 'lucide-react';
import { resolveThemeCssVars } from '../../../lib/formalia/blueprintSchema';

/**
 * Renderizador Declarativo Seguro de UI (Catálogo Cerrado Anti-XSS).
 * Solo renderiza componentes React puros permitidos: kpi_row, action_form, data_table, status_board.
 */
export default function BlueprintScreenRenderer({
  screen,
  themeConfig,
  editable = false,
  onUpdateScreen
}) {
  const vars = resolveThemeCssVars(themeConfig);
  const [newColDraft, setNewColDraft] = useState({});
  const [newFieldDraft, setNewFieldDraft] = useState({});
  const [formPreviewNotice, setFormPreviewNotice] = useState('');

  if (!screen) {
    return (
      <div
        style={{ background: vars['--bp-bg'], color: vars['--bp-muted'], fontFamily: vars['--bp-font'] }}
        className="p-8 rounded-[12px] border text-center text-xs"
      >
        Selecciona un rol o genera la maqueta base para previsualizar esta pantalla.
      </div>
    );
  }

  const components = Array.isArray(screen.components) ? screen.components : [];

  const updateComponents = (nextComps) => {
    onUpdateScreen?.({ ...screen, components: nextComps });
  };

  const moveBlock = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= components.length) return;
    const copy = [...components];
    const [moved] = copy.splice(idx, 1);
    copy.splice(target, 0, moved);
    updateComponents(copy);
  };

  const toggleBlockHidden = (idx) => {
    const copy = components.map((c, i) => (i === idx ? { ...c, hidden: !c.hidden } : c));
    updateComponents(copy);
  };

  const deleteBlock = (idx) => {
    updateComponents(components.filter((_, i) => i !== idx));
  };

  const updateBlock = (idx, patch) => {
    updateComponents(components.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const panelStyle = {
    background: vars['--bp-surface'],
    borderColor: vars['--bp-border'],
    borderRadius: vars['--bp-radius'],
    color: vars['--bp-text']
  };

  const primaryBtnStyle = {
    background: vars['--bp-primary'],
    color: vars['--bp-on-primary'],
    borderRadius: vars['--bp-radius']
  };

  return (
    <div
      style={{
        background: vars['--bp-bg'],
        color: vars['--bp-text'],
        borderColor: vars['--bp-border'],
        borderRadius: vars['--bp-radius'],
        fontFamily: vars['--bp-font']
      }}
      className="border p-4 sm:p-5 space-y-4 transition-colors"
    >
      {/* Cabecera de Pantalla Simulada */}
      <div
        style={{ borderColor: vars['--bp-border'] }}
        className="pb-3 border-b flex flex-wrap items-center justify-between gap-2"
      >
          <div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  background: vars['--bp-primary'],
                  color: vars['--bp-on-primary'],
                  borderRadius: vars['--bp-radius']
                }}
                className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              >
                {screen.role}
              </span>
              <h4 style={{ color: vars['--bp-text'] }} className="text-sm sm:text-base font-bold">
                {screen.title}
              </h4>
            </div>
            {screen.subtitle && (
              <p style={{ color: vars['--bp-muted'] }} className="text-xs mt-1">
                {screen.subtitle}
              </p>
            )}
          </div>

        <span
          style={{
            background: vars['--bp-subtle'],
            borderColor: vars['--bp-border'],
            color: vars['--bp-muted'],
            borderRadius: vars['--bp-radius']
          }}
          className="px-2.5 py-1 border text-[10px] font-mono"
        >
          {vars.preset.label} · Vista Segura Declarativa
        </span>
      </div>

      {formPreviewNotice && (
        <div
          style={{
            background: vars['--bp-subtle'],
            borderColor: vars['--bp-primary'],
            borderRadius: vars['--bp-radius']
          }}
          className="px-3 py-2 border text-xs flex items-center gap-2"
        >
          <CheckCircle2 size={14} style={{ color: vars['--bp-primary'] }} />
          <span>{formPreviewNotice}</span>
        </div>
      )}

      {/* Renderizado de Bloques */}
      <div className="space-y-4">
        {components.map((block, idx) => {
          if (block.hidden && !editable) return null;

          return (
            <div key={block.id || idx} className={`relative ${block.hidden ? 'opacity-45' : ''}`}>
              {/* Controles de edición manual (0 turnos IA) */}
              {editable && (
                <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Bloque {idx + 1}: {block.type} {block.hidden ? '(oculto)' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[#FFC93C] disabled:opacity-30 cursor-pointer"
                      title="Subir bloque"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, 1)}
                      disabled={idx === components.length - 1}
                      className="p-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[#FFC93C] disabled:opacity-30 cursor-pointer"
                      title="Bajar bloque"
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBlockHidden(idx)}
                      className="p-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[#FFC93C] cursor-pointer"
                      title={block.hidden ? 'Mostrar bloque' : 'Ocultar bloque'}
                    >
                      {block.hidden ? <Eye size={11} /> : <EyeOff size={11} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBlock(idx)}
                      className="p-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-red-400 cursor-pointer"
                      title="Eliminar bloque"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              )}

              {/* 1. kpi_row */}
              {block.type === 'kpi_row' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(block.items || []).map((item, kIdx) => (
                    <div key={kIdx} style={panelStyle} className="p-3.5 border shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span style={{ color: vars['--bp-muted'] }} className="text-[11px] font-medium">
                          {item.label}
                        </span>
                        <TrendingUp size={13} style={{ color: vars['--bp-primary'] }} />
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between gap-2">
                        <span className="text-xl font-bold tracking-tight">{item.sample_value}</span>
                        {item.delta && (
                          <span
                            style={{
                              background: vars['--bp-subtle'],
                              color: vars['--bp-primary'],
                              borderRadius: vars['--bp-radius']
                            }}
                            className="px-1.5 py-0.5 text-[10px] font-mono font-semibold"
                          >
                            {item.delta}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. action_form */}
              {block.type === 'action_form' && (
                <div style={panelStyle} className="p-4 border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h5 style={{ color: vars['--bp-text'] }} className="text-xs sm:text-sm font-bold">{block.title}</h5>
                    {editable && (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newFieldDraft[idx] || ''}
                          onChange={(e) => setNewFieldDraft({ ...newFieldDraft, [idx]: e.target.value })}
                          placeholder="Nuevo campo..."
                          className="h-7 px-2 rounded border border-[var(--border-strong)] bg-[var(--bg-page)] text-[11px] text-[var(--text-primary)] w-32"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const f = (newFieldDraft[idx] || '').trim();
                            if (!f) return;
                            updateBlock(idx, { fields: [...(block.fields || []), f] });
                            setNewFieldDraft({ ...newFieldDraft, [idx]: '' });
                          }}
                          className="h-7 px-2 rounded bg-[#FFC93C] text-[#2B2D31] text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus size={11} />
                          <span>Campo</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(block.fields || []).map((fieldLabel, fIdx) => (
                      <div key={fIdx} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label style={{ color: vars['--bp-muted'] }} className="text-[11px] font-medium">
                            {fieldLabel}
                          </label>
                          {editable && (block.fields || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                updateBlock(idx, {
                                  fields: block.fields.filter((_, i) => i !== fIdx)
                                })
                              }
                              className="text-[10px] text-red-400 hover:underline cursor-pointer"
                            >
                              quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder={`Ingresa ${fieldLabel.toLowerCase()}...`}
                          style={{
                            background: vars['--bp-subtle'],
                            borderColor: vars['--bp-border'],
                            color: vars['--bp-text'],
                            borderRadius: vars['--bp-radius']
                          }}
                          className="h-8 px-2.5 border text-xs focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      style={primaryBtnStyle}
                      onClick={() => {
                        setFormPreviewNotice(`Simulación: "${block.primary_action}" ejecutado en vista de ${screen.role}.`);
                        setTimeout(() => setFormPreviewNotice(''), 2500);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      <Send size={12} />
                      <span>{block.primary_action || 'Guardar registro'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. data_table */}
              {block.type === 'data_table' && (
                <div style={panelStyle} className="border overflow-hidden shadow-xs">
                  <div
                    style={{ borderColor: vars['--bp-border'] }}
                    className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2"
                  >
                    <h5 style={{ color: vars['--bp-text'] }} className="text-xs sm:text-sm font-bold">{block.title}</h5>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(block.toolbar_actions || []).map((act, aIdx) => (
                        <span
                          key={aIdx}
                          style={{
                            background: vars['--bp-subtle'],
                            borderColor: vars['--bp-border'],
                            color: vars['--bp-text'],
                            borderRadius: vars['--bp-radius']
                          }}
                          className="px-2 py-1 border text-[10px] font-medium"
                        >
                          {act}
                        </span>
                      ))}
                      {editable && (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newColDraft[idx] || ''}
                            onChange={(e) => setNewColDraft({ ...newColDraft, [idx]: e.target.value })}
                            placeholder="+ Columna..."
                            className="h-7 px-2 rounded border border-[var(--border-strong)] bg-[var(--bg-page)] text-[11px] text-[var(--text-primary)] w-28"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const c = (newColDraft[idx] || '').trim();
                              if (!c) return;
                              updateBlock(idx, { columns: [...(block.columns || []), c] });
                              setNewColDraft({ ...newColDraft, [idx]: '' });
                            }}
                            className="h-7 px-2 rounded bg-[#FFC93C] text-[#2B2D31] text-[10px] font-bold cursor-pointer"
                          >
                            + Col
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead style={{ background: vars['--bp-subtle'], color: vars['--bp-muted'] }}>
                        <tr>
                          {(block.columns || []).map((col, cIdx) => (
                            <th key={cIdx} className="px-3.5 py-2.5 font-semibold whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <span>{col}</span>
                                {editable && (block.columns || []).length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateBlock(idx, {
                                        columns: block.columns.filter((_, i) => i !== cIdx)
                                      })
                                    }
                                    className="text-red-400 hover:underline text-[10px] cursor-pointer"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(block.sample_rows?.length
                          ? block.sample_rows
                          : [
                              (block.columns || []).map((_, cIdx) => (cIdx === 0 ? 'OP-204' : cIdx === (block.columns || []).length - 1 ? 'Ver' : 'Dato demo')),
                              (block.columns || []).map((_, cIdx) => (cIdx === 0 ? 'OP-203' : cIdx === (block.columns || []).length - 1 ? 'Ver' : 'Completado'))
                            ]
                        ).map((row, rIdx) => (
                          <tr key={rIdx} style={{ borderColor: vars['--bp-border'] }} className="border-t">
                            {(block.columns || []).map((_, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2.5 whitespace-nowrap">
                                {cIdx === (block.columns || []).length - 1 ? (
                                  <span
                                    style={{ color: vars['--bp-primary'] }}
                                    className="font-semibold text-[11px] cursor-pointer"
                                  >
                                    {row[cIdx] || 'Abrir →'}
                                  </span>
                                ) : (
                                  row[cIdx] || '—'
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. status_board */}
              {block.type === 'status_board' && (
                <div style={panelStyle} className="p-4 border space-y-3 shadow-xs">
                  <h5 style={{ color: vars['--bp-text'] }} className="text-xs sm:text-sm font-bold">{block.title}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(block.columns || []).map((col, colIdx) => (
                      <div
                        key={colIdx}
                        style={{
                          background: vars['--bp-subtle'],
                          borderColor: vars['--bp-border'],
                          borderRadius: vars['--bp-radius']
                        }}
                        className="p-2.5 border space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold">{col.name}</span>
                          <span style={{ color: vars['--bp-muted'] }} className="text-[10px] font-mono">
                            {(col.cards || []).length}
                          </span>
                        </div>
                        {(col.cards || []).map((card, cardIdx) => (
                          <div
                            key={cardIdx}
                            style={{
                              background: vars['--bp-surface'],
                              borderColor: vars['--bp-border'],
                              borderRadius: vars['--bp-radius']
                            }}
                            className="p-2 border text-[11px]"
                          >
                            {card}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
