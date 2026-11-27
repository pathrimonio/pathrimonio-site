import React from 'react';
import {
  Building2,
  Receipt,
  Package,
  ShoppingCart,
  Truck,
  MessageSquare,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const ROLES = [
  {
    id: 'gerencia',
    title: 'Gerencia & Dirección',
    icon: Building2,
    description: 'Tablero consolidado de indicadores, control centralizado de usuarios y trazabilidad ejecutiva de operaciones.',
    badge: 'Auditoría Total',
    features: ['Control de permisos por rol', 'Exportación de balances', 'Bitácora de cambios']
  },
  {
    id: 'caja',
    title: 'Caja & Cobranzas',
    icon: Receipt,
    description: 'Apertura y cuadre diario de caja, liquidación de cobros en efectivo/transferencia y emisión rápida de comprobantes.',
    badge: 'Permisos de Cobro',
    features: ['Cierres ciegos de turno', 'Control de diferencias', 'Historial inalterable']
  },
  {
    id: 'almacen',
    title: 'Almacén & Inventario',
    icon: Package,
    description: 'Registro de entradas y salidas de stock, inventario físico vs. digital, alertas de quiebre y soporte para pesaje.',
    badge: 'Control de Stock',
    features: ['Kardex en tiempo real', 'Ajustes con motivo', 'Sincronización offline']
  },
  {
    id: 'ventas',
    title: 'Ventas & Mostrador',
    icon: ShoppingCart,
    description: 'Terminal ágil para atención en mostrador o campo, consulta de listas de precios y emisión de notas de pedido.',
    badge: 'Terminal POS',
    features: ['Operación sin internet', 'Catálogo con fotos', 'Historial por cliente']
  },
  {
    id: 'despacho',
    title: 'Despacho & Rutas',
    icon: Truck,
    description: 'Asignación de pedidos por vehículo o zona de reparto, confirmación de entregas en destino y guías de remisión.',
    badge: 'Seguimiento de Rutas',
    features: ['Validación de recepción', 'Control de transportista', 'Firma o evidencia digital']
  },
  {
    id: 'atencion',
    title: 'Atención & WhatsApp',
    icon: MessageSquare,
    description: 'Gestión conversacional directa con clientes, envío automatizado de pedidos y resolución de consultas frecuentes.',
    badge: 'Canal Conversacional',
    features: ['Respuestas rápidas', 'Pedidos desde chat', 'Seguimiento de estado']
  }
];

export default function RolesSection() {
  return (
    <section
      id="roles"
      className="w-full py-20 lg:py-28 bg-[var(--bg-silver)] text-[var(--text-on-silver)] border-b border-[var(--border-silver)] transition-colors"
    >
      <div className="site-container">
        {/* Encabezado de Sección (Sobre Silver #D9DADC -> Tinta #2B2D31) */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#2B2D31] text-[#D9DADC] text-xs font-mono mb-3">
            <span className="font-semibold">ROLES Y CONTROL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-on-silver)] tracking-[-0.02em] mb-4">
            Cada colaborador con la pantalla exacta que necesita.
          </h2>
          <p className="text-base text-[var(--text-secondary-on-silver)] leading-relaxed">
            Elimina el desorden operativo limitando lo que cada perfil puede ver, editar y autorizar.
            El costo es de{' '}
            <span className="font-semibold text-[var(--text-on-silver)]">$1 USD al día por rol activo</span>, con auditoría criptográfica de cambios.
          </p>
        </div>

        {/* Grid de 3 Columnas: Tarjetas Gray #2B2D31 sobre lienzo Silver #D9DADC */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="card-on-silver p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Icono + Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-[6px] bg-[#363940] border border-[#FFC93C]/40 flex items-center justify-center text-[#FFC93C]">
                      <Icon size={20} strokeWidth={1.6} />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-[#D9DADC] bg-[#363940] border border-[#D9DADC]/15 px-2.5 py-1 rounded-[4px]">
                      {role.badge}
                    </span>
                  </div>

                  {/* Nombre del Rol */}
                  <h3 className="text-lg font-semibold text-[#D9DADC] mb-2 tracking-tight">
                    {role.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-sm text-[#B8BAC0] leading-relaxed mb-5">
                    {role.description}
                  </p>
                </div>

                {/* Sub-lista de permisos */}
                <div className="pt-4 border-t border-[#D9DADC]/15 flex flex-col gap-1.5">
                  {role.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#B8BAC0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C]"></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout de Auditoría (Bloque Gray #2B2D31 con botón CTA Yellow #FFC93C) */}
        <div className="mt-8 p-4 sm:p-5 rounded-[8px] bg-[#2B2D31] text-[#D9DADC] border border-[#2B2D31]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#363940] border border-[#FFC93C]/40 flex items-center justify-center text-[#FFC93C] shrink-0">
              <ShieldAlert size={16} strokeWidth={1.6} />
            </div>
            <p className="text-xs sm:text-sm text-[#B8BAC0]">
              <strong className="text-[#D9DADC] font-medium">Control antifraude incluido:</strong> Ningún usuario puede borrar cobros o modificar inventario sin dejar registro visible para la Gerencia.
            </p>
          </div>
          <a
            href="#cotizador"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#FFC93C] hover:bg-[#FFD561] text-xs font-semibold text-[#2B2D31] shrink-0 transition-colors"
          >
            <span>Configurar mis roles</span>
            <ArrowRight size={13} strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </section>
  );
}
