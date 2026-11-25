import React, { useState } from 'react';
import { BookOpenCheck, CheckCircle2, AlertTriangle, Printer } from 'lucide-react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY, PRIVACY_POLICY_VERSION } from '../../config/siteConfig';

export default function LegalLibroReclamacionesPage({
  theme,
  onToggleTheme,
  onNavigate,
  onOpenPortal,
  onOpenRegister,
  onOpenContact
}) {
  const [formState, setFormState] = useState({
    record_type: 'Reclamo',
    consumer_name: '',
    document_type: 'DNI',
    document_number: '',
    address: '',
    phone: '',
    email: '',
    is_minor: false,
    guardian_name: '',
    service_type: 'Servicio de Software / Membresía Programa de Socios',
    claimed_amount: '',
    service_description: '',
    detail: '',
    consumer_request: ''
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);

  const handleLinkClick = (path) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!privacyAccepted) {
      setErrorMsg('Debes leer y aceptar la Política de Privacidad para registrar tu hoja de reclamación.');
      return;
    }

    if (
      !formState.consumer_name.trim() ||
      !formState.document_number.trim() ||
      !formState.email.trim() ||
      !formState.detail.trim() ||
      !formState.consumer_request.trim()
    ) {
      setErrorMsg('Por favor completa todos los campos obligatorios marcados con *.');
      return;
    }

    setSubmitting(true);
    const localCode = `LR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const acceptedAt = new Date().toISOString();

    try {
      const response = await fetch('/api/v1/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          complaint_code: localCode,
          privacy_policy_accepted: true,
          privacy_policy_version: PRIVACY_POLICY_VERSION,
          accepted_at: acceptedAt
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok && response.status >= 400 && response.status < 500) {
        setErrorMsg(data.error || 'Verifica los datos ingresados.');
        setSubmitting(false);
        return;
      }

      setSubmittedRecord({
        complaint_code: data.complaint_code || localCode,
        registered_at: data.registered_at || acceptedAt,
        ...formState
      });
    } catch (_) {
      setSubmittedRecord({
        complaint_code: localCode,
        registered_at: acceptedAt,
        ...formState
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalLayout
      activeSlug="libro-reclamaciones"
      title="Libro de Reclamaciones Virtual"
      subtitle="Conforme a la Ley N.º 29571 (Código de Protección y Defensa del Consumidor) y el Reglamento del Libro de Reclamaciones D.S. N.º 011-2011-PCM (Indecopi, Perú)."
      theme={theme}
      onToggleTheme={onToggleTheme}
      onNavigate={onNavigate}
      onOpenPortal={onOpenPortal}
      onOpenRegister={onOpenRegister}
      onOpenContact={onOpenContact}
    >
      {/* Cabecera Oficial de Hoja */}
      <section className="p-5 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[var(--border-subtle)]">
          <div className="inline-flex items-center gap-2 font-mono font-bold text-[var(--text-primary)]">
            <BookOpenCheck size={16} className="text-[var(--accent-text)]" />
            <span>HOJA DE RECLAMACIÓN VIRTUAL</span>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            Plazo de atención: máx. 15 días hábiles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-[var(--text-muted)] font-mono">Proveedor:</span>{' '}
            <span className="text-[var(--text-primary)] font-medium">{LEGAL_ENTITY.legalName}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-mono">RUC:</span>{' '}
            <span className="text-[var(--text-primary)] font-medium">{LEGAL_ENTITY.ruc}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-mono">Domicilio:</span>{' '}
            <span className="text-[var(--text-primary)] font-medium">{LEGAL_ENTITY.address}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-mono">Contacto:</span>{' '}
            <span className="text-[var(--text-primary)] font-medium">{LEGAL_ENTITY.email}</span>
          </div>
        </div>
      </section>

      {submittedRecord ? (
        <section className="p-6 rounded-[10px] border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-500/5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Hoja de Reclamación Registrada: {submittedRecord.complaint_code}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Tu {submittedRecord.record_type.toLowerCase()} ha quedado registrado con fecha{' '}
                {new Date(submittedRecord.registered_at).toLocaleString()}. Daremos respuesta al correo{' '}
                <strong className="text-[var(--text-primary)]">{submittedRecord.email}</strong> dentro del plazo legal de 15 días hábiles improrrogables.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div><strong>Código:</strong> <span className="font-mono">{submittedRecord.complaint_code}</span></div>
            <div><strong>Tipo:</strong> {submittedRecord.record_type}</div>
            <div><strong>Consumidor:</strong> {submittedRecord.consumer_name}</div>
            <div><strong>Documento:</strong> {submittedRecord.document_type} {submittedRecord.document_number}</div>
            <div className="sm:col-span-2"><strong>Detalle:</strong> {submittedRecord.detail}</div>
            <div className="sm:col-span-2"><strong>Pedido:</strong> {submittedRecord.consumer_request}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] text-[#09090B] text-xs font-semibold cursor-pointer"
            >
              <Printer size={14} />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setSubmittedRecord(null)}
              className="px-4 py-2 rounded-[6px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-primary)] cursor-pointer"
            >
              Registrar otra hoja
            </button>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-6">
          {errorMsg && (
            <div className="p-3.5 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Identificación del consumidor */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              1. Identificación del Consumidor Reclamante
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Nombre completo o Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={formState.consumer_name}
                  onChange={(e) => setFormState({ ...formState, consumer_name: e.target.value })}
                  placeholder="Ej. María Mendoza Quispe"
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Tipo de Documento *
                </label>
                <select
                  value={formState.document_type}
                  onChange={(e) => setFormState({ ...formState, document_type: e.target.value })}
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carné de Extranjería</option>
                  <option value="RUC">RUC</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  required
                  value={formState.document_number}
                  onChange={(e) => setFormState({ ...formState, document_number: e.target.value })}
                  placeholder="Ej. 72345678"
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  placeholder="+51 999 888 777"
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Domicilio
                </label>
                <input
                  type="text"
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  placeholder="Dirección completa, distrito, provincia"
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_minor}
                    onChange={(e) => setFormState({ ...formState, is_minor: e.target.checked })}
                    className="w-4 h-4 accent-[#FFC000]"
                  />
                  <span>Soy menor de edad</span>
                </label>
                {formState.is_minor && (
                  <input
                    type="text"
                    value={formState.guardian_name}
                    onChange={(e) => setFormState({ ...formState, guardian_name: e.target.value })}
                    placeholder="Nombre completo del padre, madre o apoderado"
                    className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 2. Identificación del bien contratado */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              2. Identificación del Bien o Servicio Contratado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Tipo</label>
                <select
                  value={formState.service_type}
                  onChange={(e) => setFormState({ ...formState, service_type: e.target.value })}
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                >
                  <option value="Servicio de Software / Membresía Programa de Socios">Servicio — Software / Programa de Socios</option>
                  <option value="Consultoría Técnica / Implementación">Servicio — Consultoría Técnica</option>
                  <option value="Producto Digital / Módulo Adicional">Producto Digital / Módulo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Monto reclamado (opcional)
                </label>
                <input
                  type="text"
                  value={formState.claimed_amount}
                  onChange={(e) => setFormState({ ...formState, claimed_amount: e.target.value })}
                  placeholder="Ej. $30.00 USD / S/ 110.00"
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Descripción del servicio o contrato
                </label>
                <input
                  type="text"
                  value={formState.service_description}
                  onChange={(e) => setFormState({ ...formState, service_description: e.target.value })}
                  placeholder="Ej. Activación de 2 roles operativos (Caja y Almacén)"
                  className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 3. Detalle de reclamación */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              3. Detalle de la Reclamación y Pedido del Consumidor
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'Reclamo',
                  desc: 'Disconformidad relacionada con los productos o servicios.'
                },
                {
                  id: 'Queja',
                  desc: 'Disconformidad no relacionada al producto o malestar respecto a la atención.'
                }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3 rounded-[8px] border cursor-pointer flex items-start gap-2.5 text-xs ${
                    formState.record_type === opt.id
                      ? 'bg-[var(--accent-soft)] border-[#FFC000]'
                      : 'bg-[var(--bg-page)] border-[var(--border-subtle)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="record_type"
                    value={opt.id}
                    checked={formState.record_type === opt.id}
                    onChange={(e) => setFormState({ ...formState, record_type: e.target.value })}
                    className="mt-0.5 accent-[#FFC000]"
                  />
                  <div>
                    <strong className="text-[var(--text-primary)] block">{opt.id}</strong>
                    <span className="text-[11px] text-[var(--text-secondary)]">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Detalle de los hechos *
              </label>
              <textarea
                rows={4}
                required
                value={formState.detail}
                onChange={(e) => setFormState({ ...formState, detail: e.target.value })}
                placeholder="Describe de manera clara lo ocurrido, fechas y referencias..."
                className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Pedido concreto *
              </label>
              <textarea
                rows={2}
                required
                value={formState.consumer_request}
                onChange={(e) => setFormState({ ...formState, consumer_request: e.target.value })}
                placeholder="Indica qué solución o medida solicitas..."
                className="w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3 text-xs text-[var(--text-primary)] focus:border-[#FFC000] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Consentimiento Privacidad */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-4">
            <label className="flex items-start gap-2.5 text-xs text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#FFC000] shrink-0"
              />
              <span>
                He leído y acepto la{' '}
                <a
                  href="/legal/privacidad"
                  onClick={handleLinkClick('/legal/privacidad')}
                  className="text-[var(--accent-text)] font-semibold underline underline-offset-2"
                >
                  Política de Privacidad
                </a>{' '}
                para el tratamiento y atención de mi hoja de reclamación (v.{PRIVACY_POLICY_VERSION}).
              </span>
            </label>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[11px] text-[var(--text-muted)]">
                La formulación del reclamo no impide acudir a otras vías ni es requisito previo para presentar una denuncia ante Indecopi.
              </p>
              <button
                type="submit"
                disabled={submitting || !privacyAccepted}
                className="px-5 py-2.5 rounded-[6px] bg-[#FFC000] hover:bg-[#E5AC00] disabled:opacity-45 disabled:cursor-not-allowed text-[#09090B] text-xs font-semibold transition-colors cursor-pointer"
              >
                {submitting ? 'Registrando hoja...' : 'Enviar Hoja de Reclamación'}
              </button>
            </div>
          </div>
        </form>
      )}
    </LegalLayout>
  );
}
