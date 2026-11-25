import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY } from '../../config/siteConfig';

export default function LegalAvisoPage({
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
      activeSlug="aviso-legal"
      title="Aviso Legal y Términos de Uso"
      subtitle="Identificación institucional, propiedad intelectual, garantías de soberanía tecnológica y reglas operativas del Programa de Socios Pathrimonio."
      theme={theme}
      onToggleTheme={onToggleTheme}
      onNavigate={onNavigate}
      onOpenPortal={onOpenPortal}
      onOpenRegister={onOpenRegister}
      onOpenContact={onOpenContact}
    >
      <section className="p-5 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-3">
        <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
          1. Identidad del Titular y Datos de Contacto
        </h2>
        <p>
          El presente sitio web (<span className="font-mono text-xs text-[var(--text-primary)]">{LEGAL_ENTITY.website}</span>), su simulador conversacional FORMALIA, el Cotizador Interactivo y el Portal Operativo SDD son administrados por <strong className="text-[var(--text-primary)]">{LEGAL_ENTITY.brandName}</strong>.
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-[6px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Titular / Razón Social</dt>
            <dd className="font-medium text-[var(--text-primary)] mt-1">{LEGAL_ENTITY.legalName}</dd>
          </div>
          <div className="p-3 rounded-[6px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Identificación Tributaria (RUC)</dt>
            <dd className="font-medium text-[var(--text-primary)] mt-1">{LEGAL_ENTITY.ruc}</dd>
          </div>
          <div className="p-3 rounded-[6px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Domicilio Operativo</dt>
            <dd className="font-medium text-[var(--text-primary)] mt-1">{LEGAL_ENTITY.address}</dd>
          </div>
          <div className="p-3 rounded-[6px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Canales Oficiales</dt>
            <dd className="font-medium text-[var(--text-primary)] mt-1">
              <a href={`mailto:${LEGAL_ENTITY.email}`} className="text-[var(--accent-text)] underline underline-offset-2">
                {LEGAL_ENTITY.email}
              </a>
              {' · '}
              <span>WhatsApp {LEGAL_ENTITY.whatsappDisplay}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          2. Propiedad Intelectual y Soberanía Tecnológica
        </h2>
        <p>
          La arquitectura web, identidad gráfica, código fuente base del portal y los motores de análisis propios pertenecen a <strong className="text-[var(--text-primary)]">Pathrimonio Company</strong> o se distribuyen bajo licencias abiertas autorizadas. Queda prohibida la reproducción comercial no autorizada de la marca y materiales institucionales sin autorización previa.
        </p>
        <p>
          En contrapartida, toda información de negocio ingresada por nuestros clientes en sistemas productivos implementados bajo el Programa de Socios se rige por nuestro principio irrenunciable de <strong className="text-[var(--text-primary)]">Soberanía Tecnológica</strong>: las bases de datos (SQLite local / PostgreSQL) y sus respaldos en formatos abiertos (<code className="font-mono text-xs">SQL</code> / <code className="font-mono text-xs">CSV</code>) pertenecen íntegramente a la empresa, cooperativa o colectivo titular. Pathrimonio nunca cobra tasas de salida ni retiene datos operativos.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          3. Condiciones Base del Programa de Socios ($1 USD/día por rol)
        </h2>
        <div className="p-5 rounded-[10px] border border-[var(--accent-border)] bg-[var(--accent-soft)] flex flex-col gap-3">
          <ul className="list-disc pl-5 flex flex-col gap-2 text-[var(--text-primary)]">
            <li>
              <strong>Tarifa preferencial por rol activo:</strong> Cada rol operativo o administrativo habilitado (ej. Gerencia, Caja, Almacén, Ventas, Despacho) mantiene un valor transparente de <strong>$1 USD al día ($30 USD mensuales)</strong>, sin límites artificiosos por número de registros locales ni comisiones sobre tus ventas.
            </li>
            <li>
              <strong>Implementación con $0 USD de Setup:</strong> Cuando la organización opta por el compromiso de permanencia de 6 meses dentro del Programa de Socios, Pathrimonio asume el 100% del costo de análisis, modelado y puesta en marcha inicial ($0 USD de entrada). Para planes mensuales sin permanencia aplica la tarifa única de setup informada explícitamente en el Cotizador Interactivo.
            </li>
            <li>
              <strong>Vigencia de créditos por referidos:</strong> Bajo la política de reciprocidad comunitaria, cada <strong>2 organizaciones o negocios aliados</strong> incorporados efectivamente al Programa de Socios mediante tu código o recomendación otorgan <strong>$60 USD en créditos operativos</strong> (equivalentes a 2 meses de 1 rol o 1 mes de 2 roles). Los créditos no son canjeables por dinero en efectivo y se aplican automáticamente contra facturaciones mensuales activas mientras el vínculo comercial permanezca vigente (con una vigencia operativa de hasta 12 meses desde su acreditación).
            </li>
            <li>
              <strong>Pausa de roles al día 31 sin pérdida de datos:</strong> Si al finalizar un periodo mensual de 30 días no se verifica la renovación o saldo de créditos aplicable, los roles administrativos afectados pasan a estado <strong>pausado automáticamente a partir del día 31</strong>. Durante la pausa se suspende el acceso operativo de edición y sincronización activa, pero <strong>tus datos históricos no se eliminan ni se secuestran</strong>; el cliente puede exportar una copia íntegra de su base de datos en SQL/CSV o reactivar sus roles en cualquier momento al renovar el servicio.
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          4. Uso Aceptable de Herramientas Públicas (FORMALIA y Cotizador)
        </h2>
        <p>
          Las herramientas públicas de diagnóstico (<strong className="text-[var(--text-primary)]">FORMALIA</strong> y <strong className="text-[var(--text-primary)]">Cotizador Interactivo</strong>) tienen carácter informativo, de preventa y especificación preliminar. Los resultados estimados están sujetos a confirmación técnica formal en caso de integraciones de hardware propietario o módulos a medida fuera del alcance estándar.
        </p>
        <p>
          Queda estrictamente prohibido utilizar bots automatizados, inyección de tráfico malicioso o intentos de extracción masiva contra las rutas públicas y APIs (<code className="font-mono text-xs">/api/v1/*</code>). Nos reservamos el derecho de aplicar límites de frecuencia por IP y verificaciones anti-spam técnicas.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          5. Normativa Aplicable y Atención de Consultas
        </h2>
        <p>
          Estas condiciones se interpretan conforme a las leyes de la República del Perú. Para aclaraciones sobre términos contractuales, facturación o ejercicio de reclamos, puedes comunicarte a{' '}
          <a href={`mailto:${LEGAL_ENTITY.email}`} className="text-[var(--accent-text)] font-medium underline underline-offset-2">
            {LEGAL_ENTITY.email}
          </a>{' '}
          o registrar una comunicación formal en nuestro{' '}
          <a
            href="/legal/libro-reclamaciones"
            onClick={handleNavClick('/legal/libro-reclamaciones')}
            className="text-[var(--accent-text)] font-medium underline underline-offset-2"
          >
            Libro de Reclamaciones Virtual
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
