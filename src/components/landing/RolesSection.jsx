import React from 'react';
import {
  Building2,
  Receipt,
  Package,
  Truck,
  ArrowRight,
  Lock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const CORE_ROLES = [
  {
    id: 'gerencia',
    title: 'Gerencia',
    icon: Building2,
    badge: 'Vista Ejecutiva',
    description: 'Supervisa ingresos, alertas de inventario y actividad diaria del equipo desde un resumen claro.',
    screenPreview: {
      header: 'Resumen del día',
      metric: '$4,820',
      metricLabel: 'Ventas conciliadas',
      rows: [
        { label: 'Caja turno mañana', status: 'Cerrada OK' },
        { label: 'Despachos entregados', status: '14 / 16' }
      ]
    },
    permissions: ['Indicadores consolidados', 'Permisos por colaborador', 'Auditoría de cambios']
  },
  {
    id: 'caja',
    title: 'Caja',
    icon: Receipt,
    badge: 'Cobros & Turno',
    description: 'Registra pagos en efectivo o transferencia, emite comprobantes y realiza cierres exactos al finalizar el turno.',
    screenPreview: {
      header: 'Turno activo · Ventanilla 1',
      metric: '$1,390',
      metricLabel: 'En caja conciliada',
      rows: [
        { label: 'Efectivo declarado', status: 'Cuadrado' },
        { label: 'Yape / Transferencias', status: 'Verificado' }
      ]
    },
    permissions: ['Apertura y arqueo diario', 'Boletas y recibos rápidos', 'Registro de anulaciones']
  },
  {
    id: 'almacen',
    title: 'Almacén',
    icon: Package,
    badge: 'Stock Real',
    description: 'Controla entradas de proveedores, salidas por pedido y alertas tempranas antes de quedarte sin mercadería.',
    screenPreview: {
      header: 'Control de inventario',
      metric: '3 alertas',
      metricLabel: 'Productos por reponer',
      rows: [
        { label: 'Ingreso proveedor #042', status: '+240 unid.' },
        { label: 'Stock físico vs digital', status: 'Sin merma' }
      ]
    },
    permissions: ['Entradas y salidas claras', 'Alertas de reposición', 'Trazabilidad por lote']
  },
  {
    id: 'despacho',
    title: 'Despacho',
    icon: Truck,
    badge: 'Rutas & Entregas',
    description: 'Organiza salidas por reparto o zona y confirma cada entrega con foto o firma desde el celular del repartidor.',
    screenPreview: {
      header: 'Ruta activa · Zona Sur',
      metric: '92%',
      metricLabel: 'Entregas completadas',
      rows: [
        { label: 'Pedido #189 · Bodega Sol', status: 'Entregado' },
        { label: 'Pedido #190 · Comercial Luz', status: 'En camino' }
      ]
    },
    permissions: ['Hojas de ruta por unidad', 'Confirmación de recepción', 'Cobro contraentrega']
  }
];

export default function RolesSection({ onNavigate }) {
  return (
    <section
      id="roles"
      className="w-full py-20 lg:py-28 bg-[var(--bg-silver)] text-[var(--text-on-silver)] border-b border-[var(--border-silver)] transition-colors"
    >
      <div className="site-container">
        {/* Encabezado limpio + explicación lógica de $1/día por rol */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[var(--hsl-dark-card)] text-[var(--hsl-dark-text)] border border-[var(--hsl-dark-border)] text-xs font-mono mb-3">
              <span className="font-semibold">CONTROL POR ROLES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--text-on-silver)] tracking-[-0.025em] leading-[1.1] mb-4">
              Cada rol con su propia vista, permisos claros y auditoría real.
            </h2>
            <p className="text-base text-[var(--text-secondary-on-silver)] leading-relaxed max-w-[60ch]">
              A diferencia de un software genérico donde todos entran con la misma cuenta, aquí nadie comparte contraseñas ni ve información ajena a su área. Pagas{' '}
              <strong className="font-semibold text-[var(--text-on-silver)]">$1 USD al día por rol activo</strong>{' '}
              con trazabilidad completa de cada movimiento.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-[var(--bg-silver-subtle)] border border-[var(--border-silver)] text-xs font-medium text-[var(--text-on-silver)] shrink-0 self-start lg:self-end">
            <Lock size={14} strokeWidth={2} className="shrink-0" />
            <span>Cero contraseñas compartidas entre colaboradores</span>
          </div>
        </div>

        {/* 4 Tarjetas limpias (Gerencia, Caja, Almacén, Despacho) con vista real de pantalla */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {CORE_ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="card-on-silver p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  {/* Cabecera */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-[6px] bg-[var(--hsl-dark-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-primary)]">
                      <Icon size={20} strokeWidth={1.7} />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-[var(--hsl-dark-text)] bg-[var(--hsl-dark-subtle)] border border-[var(--hsl-dark-border)] px-2.5 py-1 rounded-[4px]">
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--hsl-dark-text)] mb-2 tracking-tight">
                    {role.title}
                  </h3>

                  <p className="text-sm text-[var(--hsl-dark-text-secondary)] leading-relaxed mb-5">
                    {role.description}
                  </p>

                  {/* Miniatura viva de lo que ve ese rol (HSL Dark 8% dentro de Card 12%) */}
                  <div className="rounded-[8px] bg-[var(--hsl-dark-page)] border border-[var(--hsl-dark-border)] p-3.5 mb-5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--hsl-dark-text-muted)] mb-2">
                      <span>{role.screenPreview.header}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-3 pb-2.5 border-b border-[var(--hsl-dark-border)]">
                      <span className="text-lg font-bold font-mono tabular-nums text-[var(--accent-primary)]">
                        {role.screenPreview.metric}
                      </span>
                      <span className="text-[11px] text-[var(--hsl-dark-text-secondary)]">
                        {role.screenPreview.metricLabel}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {role.screenPreview.rows.map((r, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between text-[11px] gap-2">
                          <span className="text-[var(--hsl-dark-text-secondary)] truncate">{r.label}</span>
                          <span className="font-mono text-[var(--hsl-dark-text)] font-medium shrink-0">{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Permisos clave */}
                <div className="pt-3.5 border-t border-[var(--hsl-dark-border)] flex flex-col gap-2">
                  {role.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[var(--hsl-dark-text)]/90">
                      <CheckCircle2 size={13} strokeWidth={2} className="text-[var(--accent-primary)] shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Barra de acción enfocada exclusivamente en los dos destinos */}
        <div className="mt-10 pt-8 border-t border-[var(--border-silver)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-[var(--text-secondary-on-silver)]">
            ¿Solo necesitas 2 roles o toda la operación conectada? Arma tu combinación exacta sin licencias sobrantes.
          </p>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/formalia"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/formalia');
                }
              }}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--hsl-dark-card)] hover:bg-[var(--hsl-dark-subtle)] border border-[var(--hsl-dark-border)] text-[var(--hsl-dark-text)] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles size={13} className="text-[var(--accent-primary)]" />
              <span>Ordenar roles en Formalia</span>
            </a>
            <a
              href="#cotizador"
              className="btn-accent group inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
            >
              <span>Cotizar mis roles</span>
              <ArrowRight size={13} strokeWidth={2} className="transition-transform duration-150 group-hover:translate-x-[3px]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
