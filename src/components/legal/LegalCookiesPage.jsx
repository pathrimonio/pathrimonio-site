import React from 'react';
import { SlidersHorizontal, ShieldCheck } from 'lucide-react';
import LegalLayout from './LegalLayout';
import { COOKIE_INVENTORY, CONSENT_COOKIE_NAME } from '../../config/siteConfig';
import { useConsent } from '../../context/ConsentContext';

export default function LegalCookiesPage({
  theme,
  onToggleTheme,
  onNavigate,
  onOpenPortal,
  onOpenRegister,
  onOpenContact
}) {
  const { openPreferencesModal, preferences, hasDecision, consentRecord } = useConsent();

  return (
    <LegalLayout
      activeSlug="cookies"
      title="Política de Cookies y Almacenamiento Local"
      subtitle="Inventario técnico completo de cookies y claves de localStorage utilizadas en Pathrimonio Site, bajo principio estricto de bloqueo previo (Opt-in)."
      theme={theme}
      onToggleTheme={onToggleTheme}
      onNavigate={onNavigate}
      onOpenPortal={onOpenPortal}
      onOpenRegister={onOpenRegister}
      onOpenContact={onOpenContact}
    >
      {/* Panel de estado y botón directo */}
      <section className="p-5 rounded-[10px] border border-[var(--accent-border)] bg-[var(--accent-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--accent-text)]">
            <ShieldCheck size={15} />
            <span>TU PREFERENCIA ACTUAL ({CONSENT_COOKIE_NAME})</span>
          </div>
          <p className="text-xs text-[var(--text-primary)]">
            {hasDecision ? (
              <>
                Necesarias: <strong>Activas</strong> · Analíticas:{' '}
                <strong>{preferences.analytics ? 'Permitidas' : 'Bloqueadas'}</strong> · Marketing:{' '}
                <strong>{preferences.marketing ? 'Permitidas' : 'Bloqueadas'}</strong>
                {consentRecord?.updated_at && (
                  <span className="text-[var(--text-secondary)]">
                    {' '}({new Date(consentRecord.updated_at).toLocaleString()})
                  </span>
                )}
              </>
            ) : (
              <>
                Aún no has guardado una elección. Por defecto las cookies de{' '}
                <strong>Analíticas</strong> y <strong>Marketing</strong> están técnicamente{' '}
                <strong>bloqueadas</strong>.
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={openPreferencesModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <SlidersHorizontal size={14} strokeWidth={1.75} />
          <span>Configurar cookies</span>
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          1. Principio Técnico de Bloqueo Previo (Zero Third-Party Requests)
        </h2>
        <p>
          En Pathrimonio aplicamos un criterio de <strong className="text-[var(--text-primary)]">Opt-in estricto</strong>: ningún script externo de analítica o publicidad se descarga ni escribe cookies en tu navegador mientras no aceptes expresamente su categoría en el banner o en el panel de configuración. Adicionalmente, si aceptas una categoría y luego decides desactivarla desde el enlace <em>Configurar cookies</em> del pie de página, revocamos la señal de consentimiento y purgamos las cookies asociadas del dominio.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          2. Inventario de Cookies y Almacenamiento Local
        </h2>
        <div className="overflow-x-auto rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-[var(--text-primary)] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Nombre / Clave</th>
                <th className="py-3 px-4 font-semibold">Proveedor y Tipo</th>
                <th className="py-3 px-4 font-semibold">Categoría</th>
                <th className="py-3 px-4 font-semibold">Finalidad</th>
                <th className="py-3 px-4 font-semibold">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {COOKIE_INVENTORY.map((item) => (
                <tr key={item.name} className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-[var(--text-primary)] align-top whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <span className="block font-medium text-[var(--text-primary)]">{item.provider}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">{item.storageType}</span>
                  </td>
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-semibold border ${
                        item.categoryId === 'necessary'
                          ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-text)]'
                          : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 align-top leading-relaxed min-w-[220px]">
                    {item.purpose}
                  </td>
                  <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono text-[11px] text-[var(--text-primary)]">
                    {item.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          3. Cómo Modificar o Revocar tus Preferencias
        </h2>
        <p>
          Puedes cambiar tu elección en cualquier momento haciendo clic en el botón{' '}
          <button
            type="button"
            onClick={openPreferencesModal}
            className="text-[var(--accent-text)] font-semibold underline underline-offset-2 cursor-pointer"
          >
            Configurar cookies
          </button>{' '}
          aquí mismo o en la parte inferior de cualquier página del sitio. También puedes gestionar y eliminar cookies desde la configuración de privacidad de tu navegador (Chrome, Firefox, Edge o Safari).
        </p>
      </section>
    </LegalLayout>
  );
}
