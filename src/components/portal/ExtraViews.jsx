import React from 'react';

export function BacklogView({ stories }) {
  return (
    <div className="flex flex-col gap-6 w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-space text-xl text-white font-bold">Product Backlog Consolidado</h2>
        <p className="font-jakarta text-xs text-on-surface-variant">
          Visión unificada de requerimientos pendientes por ciclo de iteración y arquitectura.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <span className="font-space text-xs font-bold text-white uppercase">Sprint 14 (En Curso)</span>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px]">
              {stories.length} Items
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {stories.map(s => (
              <div key={s.id} className="p-2.5 rounded bg-surface-container border border-outline-variant/60 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-primary font-mono font-bold">{s.id}</span>
                  <span className="text-[10px] text-on-surface-variant">{s.module}</span>
                </div>
                <p className="text-white truncate font-medium">As a {s.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg flex flex-col gap-3 opacity-80">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <span className="font-space text-xs font-bold text-white uppercase">Sprint 15 (Planificado)</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[10px]">
              3 Items
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded bg-surface-container border border-outline-variant/60 flex flex-col gap-1 text-xs">
              <span className="text-primary font-mono font-bold">US-201</span>
              <p className="text-white truncate font-medium">Firma Criptográfica Multisig para desembolsos comunales</p>
            </div>
            <div className="p-2.5 rounded bg-surface-container border border-outline-variant/60 flex flex-col gap-1 text-xs">
              <span className="text-primary font-mono font-bold">US-202</span>
              <p className="text-white truncate font-medium">Sincronización P2P por Bluetooth Mesh en zonas sin señal</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg flex flex-col gap-3 opacity-60">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <span className="font-space text-xs font-bold text-white uppercase">Icebox & Ideas</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[10px]">
              2 Items
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded bg-surface-container border border-outline-variant/60 flex flex-col gap-1 text-xs">
              <span className="text-secondary font-mono font-bold">IDEA-01</span>
              <p className="text-white truncate font-medium">Integración con satélites LEO de baja órbita</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SprintsView() {
  return (
    <div className="flex flex-col gap-6 w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-space text-xl text-white font-bold">Ciclos y Velocidad de Sprints</h2>
        <p className="font-jakarta text-xs text-on-surface-variant">
          Histórico de cadencia de entrega de valor para comunidades y métricas de despliegue.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-surface-container border border-outline-variant flex flex-col gap-1">
          <span className="font-space text-xs text-on-surface-variant uppercase">Sprint Actual</span>
          <span className="font-space text-2xl font-bold text-primary">Sprint 14</span>
          <span className="text-xs text-on-surface-variant">Finaliza en 5 días</span>
        </div>
        <div className="p-4 rounded-lg bg-surface-container border border-outline-variant flex flex-col gap-1">
          <span className="font-space text-xs text-on-surface-variant uppercase">Velocidad Promedio</span>
          <span className="font-space text-2xl font-bold text-white">42 Story Points</span>
          <span className="text-xs text-primary">+8% vs ciclo previo</span>
        </div>
        <div className="p-4 rounded-lg bg-surface-container border border-outline-variant flex flex-col gap-1">
          <span className="font-space text-xs text-on-surface-variant uppercase">Calidad &amp; DoD</span>
          <span className="font-space text-2xl font-bold text-white">99.4%</span>
          <span className="text-xs text-on-surface-variant">Cero regresiones críticas</span>
        </div>
      </div>
    </div>
  );
}

export function DocsView() {
  return (
    <div className="flex flex-col gap-6 w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-space text-xl text-white font-bold">Documentación &amp; Guías Técnicas</h2>
        <p className="font-jakarta text-xs text-on-surface-variant">
          Estándares de arquitectura, principios Systematic Vanguard y manuales de usuario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg bg-surface-container border border-outline-variant flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[20px]">architecture</span>
            <h3 className="font-space text-sm font-bold text-white">Estándar de Historias de Usuario</h3>
          </div>
          <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
            Cada historia debe cumplir con el patrón "Como / Quiero / Para" y contar con al menos 2 Criterios de Aceptación (DoD) auditables antes de ingresar al Sprint Backlog.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-surface-container border border-outline-variant flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[20px]">palette</span>
            <h3 className="font-space text-sm font-bold text-white">Design Tokens Systematic Vanguard</h3>
          </div>
          <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
            Consistencia cromática `#131314` (superficie), acento cinético `#F5A623` y tipografías Space Grotesk / Plus Jakarta Sans para entornos analíticos de alta exigencia.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="flex flex-col gap-6 w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-space text-xl text-white font-bold">Configuración del Workspace</h2>
        <p className="font-jakarta text-xs text-on-surface-variant">
          Preferencias de sincronización, almacenamiento local y perfiles de analista.
        </p>
      </div>

      <div className="p-5 rounded-lg bg-surface-container border border-outline-variant flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div>
            <p className="font-space text-xs font-bold text-white">Persistencia en LocalStorage</p>
            <p className="font-jakarta text-[11px] text-on-surface-variant">Guarda automáticamente todos los cambios en tu navegador</p>
          </div>
          <span className="text-primary font-space text-xs font-bold">ACTIVADO</span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div>
            <p className="font-space text-xs font-bold text-white">Modo Oscuro Sistemático</p>
            <p className="font-jakarta text-[11px] text-on-surface-variant">Optimizado para bajo cansancio visual y alto contraste</p>
          </div>
          <span className="text-primary font-space text-xs font-bold">FIJO (DARK)</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="font-space text-xs font-bold text-white">Restablecer Datos de Demostración</p>
            <p className="font-jakarta text-[11px] text-on-surface-variant">Restaura las 4 historias originales del prototipo</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('pathrimonio_stories_v1');
              window.location.reload();
            }}
            className="px-3 py-1.5 rounded bg-surface-container-high border border-outline-variant text-error hover:bg-error-container/40 text-xs font-space font-medium"
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
}
