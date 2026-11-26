import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PRIVACY_POLICY_VERSION } from '../../config/siteConfig';

export default function ContactModal({ isOpen, onClose, onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    org: '',
    projectType: 'Inclusión Financiera y Crédito Comunitario',
    details: ''
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!privacyAccepted) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 800);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#2B2D31] text-[#D9DADC] border border-[#D9DADC]/20 rounded-xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal de consulta"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#B8BAC0] hover:text-[#D9DADC] hover:bg-[#363940] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#363940] border border-[#FFC93C]/40 text-[#FFC93C] font-space text-[11px] font-bold w-fit uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C]"></span>
                <span>Proyectos de Software &amp; Arquitectura</span>
              </div>
              <h3 className="font-space text-2xl text-[#D9DADC] font-bold tracking-tight">
                Iniciar Proyecto de Software Sistemático
              </h3>
              <p className="font-jakarta text-xs text-[#B8BAC0]">
                Diseñamos y escalamos soluciones técnicas para organizaciones e instituciones con requerimientos de alta disponibilidad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-[#D9DADC] font-medium">Nombre completo</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre y apellido"
                  className="w-full h-9 bg-[#232529] border border-[#D9DADC]/20 rounded px-3 text-xs font-jakarta text-[#D9DADC] placeholder:text-[#9699A1] focus:outline-none focus:border-[#FFC93C] focus:ring-1 focus:ring-[#FFC93C]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-[#D9DADC] font-medium">Correo electrónico</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@organizacion.org"
                  className="w-full h-9 bg-[#232529] border border-[#D9DADC]/20 rounded px-3 text-xs font-jakarta text-[#D9DADC] placeholder:text-[#9699A1] focus:outline-none focus:border-[#FFC93C] focus:ring-1 focus:ring-[#FFC93C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-[#D9DADC] font-medium">Organización o Entidad</label>
                <input
                  required
                  type="text"
                  value={formData.org}
                  onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  placeholder="Nombre de la institución o entidad"
                  className="w-full h-9 bg-[#232529] border border-[#D9DADC]/20 rounded px-3 text-xs font-jakarta text-[#D9DADC] placeholder:text-[#9699A1] focus:outline-none focus:border-[#FFC93C] focus:ring-1 focus:ring-[#FFC93C]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-[#D9DADC] font-medium">Área de Enfoque</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full h-9 bg-[#232529] border border-[#D9DADC]/20 rounded px-2.5 text-xs font-jakarta text-[#D9DADC] focus:outline-none focus:border-[#FFC93C] focus:ring-1 focus:ring-[#FFC93C]"
                >
                  <option>Inclusión Financiera y Crédito Comunitario</option>
                  <option>Salud &amp; Trazabilidad de Cadena de Frío</option>
                  <option>Recursos Críticos &amp; Telemetría IoT</option>
                  <option>Gobernanza de Datos &amp; Auditoría</option>
                  <option>Infraestructura Digital Offline-First</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-[#D9DADC] font-medium">Descripción inicial del requerimiento</label>
              <textarea
                rows="3"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Breve resumen del desafío técnico, limitaciones de conectividad o alcance esperado..."
                className="w-full bg-[#232529] border border-[#D9DADC]/20 rounded p-3 text-xs font-jakarta text-[#D9DADC] placeholder:text-[#9699A1] focus:outline-none focus:border-[#FFC93C] focus:ring-1 focus:ring-[#FFC93C] resize-none"
              ></textarea>
            </div>

            <label className="flex items-start gap-2 text-[11px] font-jakarta text-[#B8BAC0] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                required
                className="w-4 h-4 mt-0.5 accent-[#FFC93C] shrink-0 cursor-pointer"
              />
              <span>
                He leído y acepto la{' '}
                <a
                  href="/legal/privacidad"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onClose?.();
                      onNavigate('/legal/privacidad');
                    }
                  }}
                  className="text-[#FFC93C] font-semibold underline underline-offset-2"
                >
                  Política de Privacidad
                </a>{' '}
                para recibir respuesta a mi consulta técnica (v.{PRIVACY_POLICY_VERSION}).
              </span>
            </label>

            <div className="flex items-center justify-between pt-2">
              <span className="font-jakarta text-[11px] text-[#B8BAC0] flex items-center gap-1">
                <span className="material-symbols-outlined text-[#FFC93C] text-[14px]">lock</span>
                Respuesta confidencial en &lt; 24h
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded text-xs font-space text-[#B8BAC0] hover:text-[#D9DADC] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !privacyAccepted}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] font-space text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <span>Procesando...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Agendar Sesión</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#363940] border border-[#FFC93C]/50 flex items-center justify-center text-[#FFC93C]">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-space text-xl font-bold text-[#D9DADC]">
                ¡Solicitud Registrada con Éxito!
              </h4>
              <p className="font-jakarta text-xs text-[#B8BAC0] max-w-sm">
                Hemos recibido tu solicitud para <strong className="text-[#D9DADC]">{formData.org || 'tu entidad'}</strong>. Nuestro equipo de arquitectura técnica se comunicará a <strong className="text-[#FFC93C]">{formData.email}</strong>.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="mt-2 px-5 py-2 rounded bg-[#FFC93C] hover:bg-[#FFD561] text-[#2B2D31] font-space text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cerrar y Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
