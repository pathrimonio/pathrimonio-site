import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY, PRIVACY_POLICY_VERSION } from '../../config/siteConfig';

export default function LegalPrivacidadPage({
  theme,
  onToggleTheme,
  onNavigate,
  onOpenPortal,
  onOpenRegister,
  onOpenContact
}) {
  const handleNavClick = (path) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <LegalLayout
      activeSlug="privacidad"
      title="Política de Privacidad y Protección de Datos"
      subtitle={`Versión vigente ${PRIVACY_POLICY_VERSION} — En cumplimiento de la Ley N.º 29733 (Ley de Protección de Datos Personales del Perú), su Reglamento y estándares internacionales GDPR.`}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onNavigate={onNavigate}
      onOpenPortal={onOpenPortal}
      onOpenRegister={onOpenRegister}
      onOpenContact={onOpenContact}
    >
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          1. Responsable del Tratamiento
        </h2>
        <p>
          El responsable de los datos personales recopilados a través de <span className="font-mono text-xs text-[var(--text-primary)]">{LEGAL_ENTITY.website}</span> es <strong className="text-[var(--text-primary)]">{LEGAL_ENTITY.brandName}</strong> ({LEGAL_ENTITY.legalName}), con correo oficial de atención en materia de privacidad:{' '}
          <a href={`mailto:${LEGAL_ENTITY.privacyEmail}`} className="text-[var(--accent-text)] font-medium underline underline-offset-2">
            {LEGAL_ENTITY.privacyEmail}
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          2. Datos Recopilados y Finalidad del Tratamiento
        </h2>
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">
              A. Formularios del Cotizador Interactivo y Consulta Técnica
            </h3>
            <p className="mb-2">
              En el Paso 4 del Cotizador o en el modal de consulta técnica solicitamos únicamente los datos indispensables para atender tu requerimiento: <strong>nombre de contacto, nombre de empresa o colectivo (opcional), número de WhatsApp y correo electrónico (opcional/requerido en consulta)</strong>, además de la configuración de roles y flujos elegida.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              <strong>Finalidad y prueba de consentimiento:</strong> Elaborar y enviarte tu cotización técnica personalizada, generar el documento de traspaso a ingeniería (cuando corresponda) y coordinar tu demostración. Al enviar una cotización se almacena un registro verificable de tu aceptación (<code className="font-mono">privacy_policy_accepted: true</code>, versión <code className="font-mono">{PRIVACY_POLICY_VERSION}</code> y fecha/hora exacta <code className="font-mono">accepted_at</code>).
            </p>
          </div>

          <div className="p-4 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">
              B. Sesiones Anónimas en FormalIA (Expiración Automática a los 7 Días)
            </h3>
            <p>
              El módulo conversacional <strong>FormalIA</strong> opera sin exigir registro ni cuentas personales. Al interactuar en el lienzo, se crea un identificador técnico aleatorio (<code className="font-mono text-xs">FIA-2026-XXXX</code>) y se guarda temporalmente la transcripción del flujo y grafo de roles para mantener la continuidad de tu mapa.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              <strong>Retención estricta:</strong> Toda sesión anónima de FormalIA que no sea vinculada voluntariamente a una cotización formal <strong>expira y se depura automáticamente a los 7 días calendario</strong> desde su creación (<code className="font-mono">expires_at</code>). Recomendamos no introducir datos personales sensibles o contraseñas dentro del chat de diagnóstico operativo.
            </p>
          </div>

          <div className="p-4 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">
              C. Validación de Códigos y Créditos por Referidos
            </h3>
            <p>
              Si participas en el Programa de Socios y utilizas o recomiendas códigos de referido comunitario, tratamos únicamente los identificadores de organización y fecha de alta necesarios para validar que el beneficio ($60 USD por cada 2 referidos activos) se acredite correctamente sin duplicidades ni fraude.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          3. Transferencia y Encargados de Tratamiento
        </h2>
        <p>
          <strong>No vendemos ni cedemos tus datos personales a terceros con fines publicitarios.</strong> Para la operación técnica segura del sitio utilizamos proveedores de infraestructura en la nube sometidos a estándares internacionales de seguridad (alojamiento web en Vercel y base de datos gestionada en Supabase/PostgreSQL, además de servicios de mensajería si tú mismo inicias el contacto por WhatsApp). Cualquier eventual script analítico o de marketing se encuentra técnicamente bloqueado hasta tu consentimiento expreso según nuestra{' '}
          <a
            href="/legal/cookies"
            onClick={handleNavClick('/legal/cookies')}
            className="text-[var(--accent-text)] font-medium underline underline-offset-2"
          >
            Política de Cookies
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          4. Ejercicio de Derechos ARCO y Revocación
        </h2>
        <p>
          En conformidad con la Ley N.º 29733 (Perú) y principios GDPR, eres titular de los derechos <strong>ARCO</strong> sobre tus datos personales:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li><strong>Acceso:</strong> Conocer qué datos tuyos obran en nuestros registros y las condiciones de su tratamiento.</li>
          <li><strong>Rectificación:</strong> Solicitar la actualización o corrección de datos inexactos o incompletos.</li>
          <li><strong>Cancelación / Supresión:</strong> Pedir la eliminación de tus datos cuando hayan dejado de ser necesarios o revoques tu consentimiento.</li>
          <li><strong>Oposición:</strong> Oponerte al tratamiento para finalidades específicas por motivos legítimos.</li>
        </ul>
        <div className="p-4 rounded-[8px] border border-[var(--accent-border)] bg-[var(--accent-soft)] text-xs text-[var(--text-primary)]">
          Para ejercer cualquiera de tus derechos ARCO o revocar tu consentimiento, envía una solicitud indicando tu nombre completo, medio de contacto registrado y detalle del pedido a:{' '}
          <a href={`mailto:${LEGAL_ENTITY.privacyEmail}?subject=Ejercicio%20de%20Derechos%20ARCO`} className="font-bold text-[var(--accent-text)] underline underline-offset-2">
            {LEGAL_ENTITY.privacyEmail}
          </a>
          . Atenderemos tu solicitud dentro de los plazos establecidos por el Reglamento de la Ley N.º 29733.
        </div>
      </section>
    </LegalLayout>
  );
}
