import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    org: '',
    projectType: 'Inclusión Financiera y Crédito Comunitario',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-surface-container border border-outline-variant rounded-xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Glow ambient accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-space text-[11px] font-bold w-fit uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span>Alianzas de Alto Impacto</span>
              </div>
              <h3 className="font-space text-2xl text-white font-bold tracking-tight">
                Iniciar Proyecto de Software Sistemático
              </h3>
              <p className="font-jakarta text-xs text-on-surface-variant">
                Diseñamos y escalamos soluciones técnicas para organizaciones con misión humanitaria.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-white font-medium">Nombre completo</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: David Salazar"
                  className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded px-3 text-xs font-jakarta text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-white font-medium">Correo institucional</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nombre@organizacion.org"
                  className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded px-3 text-xs font-jakarta text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-white font-medium">Organización / Entidad</label>
                <input 
                  required
                  type="text" 
                  value={formData.org}
                  onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  placeholder="Cooperativa, ONG o Fondo"
                  className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded px-3 text-xs font-jakarta text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-space text-xs text-white font-medium">Área de Enfoque</label>
                <select 
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded px-2.5 text-xs font-jakarta text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option>Inclusión Financiera y Crédito Comunitario</option>
                  <option>Salud & Trazabilidad de Vacunas</option>
                  <option>Recursos Críticos & AguaIoT</option>
                  <option>Gobernanza de Datos & Auditoría</option>
                  <option>Infraestructura Digital Crítica</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-space text-xs text-white font-medium">Descripción inicial del desafío</label>
              <textarea 
                rows="3"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Breve resumen de la población objetivo, limitaciones de conectividad o requerimiento..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 text-xs font-jakarta text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-jakarta text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[14px]">lock</span>
                Respuesta confidencial en &lt; 24h
              </span>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded text-xs font-space text-on-surface-variant hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-glow-amber hover:shadow-glow-amber-lg transition-all"
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
            <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-space text-xl font-bold text-white">
                ¡Solicitud Registrada con Éxito!
              </h4>
              <p className="font-jakarta text-xs text-on-surface-variant max-w-sm">
                Hemos asignado un líder de arquitectura para evaluar los requerimientos de <strong className="text-white">{formData.org || 'tu entidad'}</strong>. Nos comunicaremos a <strong className="text-primary">{formData.email}</strong> en breve.
              </p>
            </div>
            <button 
              onClick={handleReset}
              className="mt-2 px-5 py-2 rounded bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider"
            >
              Cerrar y Continuar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
