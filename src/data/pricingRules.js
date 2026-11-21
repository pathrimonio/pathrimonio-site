// Reglas de Negocio y Motor de Precios para el Cotizador Interactivo de Pathrimonio
// Gancho comercial: $1 USD/día por rol ($30 USD/mes por usuario administrativo)

export const INDUSTRIES = [
  {
    id: 'logistica_transporte',
    name: 'Logística & Transporte',
    icon: 'local_shipping',
    tagline: 'Flotas, despachos, almacenes y guías de remisión',
    suggestedRoles: ['gerencia', 'almacen', 'despacho']
  },
  {
    id: 'comercio_retail',
    name: 'Comercio & Retail',
    icon: 'storefront',
    tagline: 'Puntos de venta, caja, stock y venta mayorista/minorista',
    suggestedRoles: ['caja', 'almacen', 'ventas']
  },
  {
    id: 'servicios_profesionales',
    name: 'Servicios Profesionales',
    icon: 'business_center',
    tagline: 'Agencias, consultoras, contratos y clientes recurrentes',
    suggestedRoles: ['gerencia', 'ventas', 'cobranzas']
  },
  {
    id: 'restaurantes_alimentos',
    name: 'Restaurantes & Gastronomía',
    icon: 'restaurant',
    tagline: 'Mesas, delivery, comandas y stock de ingredientes',
    suggestedRoles: ['caja', 'almacen', 'gerencia']
  },
  {
    id: 'salud_clinicas',
    name: 'Salud & Clínicas',
    icon: 'medical_services',
    tagline: 'Citas médicas, historias clínicas y consultorios',
    suggestedRoles: ['atencion', 'caja', 'gerencia']
  },
  {
    id: 'manufactura_taller',
    name: 'Manufactura & Producción',
    icon: 'precision_manufacturing',
    tagline: 'Materia prima, órdenes de trabajo, costos y taller',
    suggestedRoles: ['almacen', 'compras', 'gerencia']
  },
  {
    id: 'otro_sector',
    name: 'Otro Sector Empresarial',
    icon: 'domain',
    tagline: 'Operaciones a medida, distribución o proyectos especiales',
    suggestedRoles: ['gerencia', 'ventas']
  }
];

export const CURRENT_METHODS = [
  {
    id: 'cuaderno_papel',
    name: 'Cuadernos / Papel',
    icon: 'edit_note',
    desc: 'Registro físico manual susceptible a pérdidas o errores de transcripción'
  },
  {
    id: 'excel_y_whatsapp',
    name: 'Excel & WhatsApp',
    icon: 'table_chart',
    desc: 'Hojas de cálculo complejas y pedidos dispersos en conversaciones de chat'
  },
  {
    id: 'software_heredado',
    name: 'Software Antiguo / ERP Rígido',
    icon: 'history_toggle_off',
    desc: 'Sistemas lentos, difíciles de usar o que cobran costos excesivos de soporte'
  },
  {
    id: 'multiples_apps',
    name: 'Múltiples Apps Desconectadas',
    icon: 'device_hub',
    desc: 'Uso de varias herramientas que no se comunican entre sí generando duplicidad'
  }
];

export const PAIN_POINTS = [
  {
    id: 'desorden_en_despachos_y_caja',
    name: 'Desorden en despachos y caja',
    icon: 'warning',
    desc: 'Cuadres de dinero difíciles y entregas o guías extraviadas'
  },
  {
    id: 'fuga_de_inventario',
    name: 'Fuga o descontrol de stock',
    icon: 'inventory_2',
    desc: 'Diferencias entre el inventario físico y lo que se factura'
  },
  {
    id: 'clientes_esperando_respuestas',
    name: 'Clientes esperando cotizaciones',
    icon: 'hourglass_top',
    desc: 'Demoras operativas que hacen perder ventas frente a competidores'
  },
  {
    id: 'cobranzas_lentas_y_pendientes',
    name: 'Cobranzas lentas y cuentas por cobrar',
    icon: 'receipt_long',
    desc: 'Falta de recordatorios automáticos y facturación a destiempo'
  },
  {
    id: 'falta_de_metricas_en_vivo',
    name: 'Falta de visibilidad y métricas',
    icon: 'analytics',
    desc: 'Decisiones a ciegas sin conocer la rentabilidad real de cada operación'
  }
];

export const ADMIN_ROLES = [
  {
    id: 'gerencia',
    name: 'Gerencia & Dirección',
    icon: 'shield_person',
    badge: 'Control Total',
    desc: 'Métricas ejecutivas globales, reportes financieros y auditoría de todas las acciones del equipo.',
    monthlyPrice: 30
  },
  {
    id: 'caja',
    name: 'Caja & Facturación',
    icon: 'point_of_sale',
    badge: 'Cobros & Arqueo',
    desc: 'Cobros en ventanilla, emisión de boletas/facturas, cuadres de turno y arqueo diario.',
    monthlyPrice: 30
  },
  {
    id: 'almacen',
    name: 'Almacén & Inventario',
    icon: 'inventory',
    badge: 'Control Stock',
    desc: 'Registro de entradas/salidas, inventario por lote/serie, transferencias y alertas de quiebre.',
    monthlyPrice: 30
  },
  {
    id: 'ventas',
    name: 'Ventas & Comercial',
    icon: 'trending_up',
    badge: 'Cotizaciones & Clientes',
    desc: 'Generación ágil de cotizaciones, catálogo de precios, pedidos y seguimiento de cartera.',
    monthlyPrice: 30
  },
  {
    id: 'despacho',
    name: 'Despacho & Rutas',
    icon: 'local_shipping',
    badge: 'Logística',
    desc: 'Asignación de unidades, guías de remisión electrónicas y confirmación de entrega en destino.',
    monthlyPrice: 30
  },
  {
    id: 'compras',
    name: 'Compras & Proveedores',
    icon: 'shopping_cart',
    badge: 'Abastecimiento',
    desc: 'Órdenes de compra, recepción de mercadería y control de cuentas por pagar a proveedores.',
    monthlyPrice: 30
  },
  {
    id: 'cobranzas',
    name: 'Cobranzas & Finanzas',
    icon: 'account_balance_wallet',
    badge: 'Cuentas Corrientes',
    desc: 'Gestión de créditos a clientes, recordatorios automáticos y conciliación de abonos.',
    monthlyPrice: 30
  },
  {
    id: 'atencion',
    name: 'Atención al Cliente',
    icon: 'support_agent',
    badge: 'Soporte & Postventa',
    desc: 'Tickets de servicio, estado de pedidos de clientes y gestión de reclamos o garantías.',
    monthlyPrice: 30
  }
];

export const END_CUSTOMER_TIERS = [
  {
    id: 'hasta_100_base',
    name: 'Hasta 100 clientes activos/mes',
    customersMax: 100,
    monthlyPrice: 0,
    badge: 'Base Incluida',
    desc: 'Ideal para iniciar. Soft-cap amigable: si superas los 100, el sistema nunca se bloquea.'
  },
  {
    id: 'hasta_300',
    name: 'Hasta 300 clientes activos/mes',
    customersMax: 300,
    monthlyPrice: 15,
    badge: '+200 Clientes',
    desc: 'Para negocios en crecimiento con cartera activa recurrente.'
  },
  {
    id: 'hasta_500',
    name: 'Hasta 500 clientes activos/mes',
    customersMax: 500,
    monthlyPrice: 30,
    badge: '+400 Clientes',
    desc: 'Capacidad ampliada para empresas con distribución comercial extendida.'
  },
  {
    id: 'hasta_1000',
    name: 'Hasta 1,000 clientes activos/mes',
    customersMax: 1000,
    monthlyPrice: 60,
    badge: '+900 Clientes',
    desc: 'Alto flujo de pedidos, consultas y transacciones recurrentes.'
  },
  {
    id: 'hasta_2000',
    name: 'Hasta 2,000 clientes activos/mes',
    customersMax: 2000,
    monthlyPrice: 120,
    badge: 'Escala Masiva',
    desc: 'Infraestructura dedicada con optimización de caché y respuestas ultra rápidas.'
  },
  {
    id: 'mas_2000_enterprise',
    name: 'Más de 2,000 clientes activos/mes',
    customersMax: 5000,
    monthlyPrice: 180,
    badge: 'Enterprise',
    desc: 'Escala ilimitada elástica con soporte de alta concurrencia y base de datos dedicada.'
  }
];

export const INTERFACE_OPTIONS = [
  {
    id: 'web_operativa',
    name: 'Web Operativa Administrativa',
    icon: 'desktop_windows',
    tag: 'Núcleo Central',
    monthlyPrice: 0,
    includedAlways: true,
    desc: 'Panel web seguro para tu equipo interno. Control de accesos por roles, auditoría y gestión integral.'
  },
  {
    id: 'portal_clientes',
    name: 'Portal Web de Autogestión Clientes',
    icon: 'public',
    tag: 'Autogestión B2B/B2C',
    monthlyPrice: 35,
    includedAlways: false,
    desc: 'Tus clientes entran con usuario/clave para ver el estado de sus pedidos, descargar sus facturas y consultar su saldo.'
  },
  {
    id: 'app_movil',
    name: 'App Móvil Clientes / Repartidores',
    icon: 'smartphone',
    tag: 'Android & iOS',
    monthlyPrice: 45,
    includedAlways: false,
    desc: 'Aplicación nativa para repartidores en ruta (con GPS y firmas digitales) o clientes con notificaciones push.'
  },
  {
    id: 'bot_whatsapp',
    name: 'Bot Automatizado de WhatsApp',
    icon: 'smart_toy',
    tag: 'IA & Mensajería 24/7',
    monthlyPrice: 30,
    includedAlways: false,
    desc: 'Atiende consultas frecuentes, envía confirmaciones automáticas de pedidos y alertas de entrega directamente por WhatsApp.'
  },
  {
    id: 'dashboard_bi',
    name: 'Dashboard BI Ejecutivo & Métricas',
    icon: 'monitoring',
    tag: 'Analítica en Vivo',
    monthlyPrice: 25,
    includedAlways: false,
    desc: 'Métricas clave en gráficos interactivos, proyecciones de flujo de caja y exportación de reportes ejecutivos.'
  }
];

export const DATA_AND_APIS_OPTIONS = [
  {
    id: 'historial_ilimitado',
    name: 'Historial Ilimitado & Auditoría (+3 meses)',
    icon: 'history',
    monthlyPrice: 15,
    desc: 'Accede a cualquier venta, movimiento o guía histórica sin límite de tiempo y con registro de quién modificó qué.'
  },
  {
    id: 'validacion_ruc_dni',
    name: 'Consulta RUC / DNI SUNAT Automática',
    icon: 'verified',
    monthlyPrice: 20,
    desc: 'Autocompleta razón social, dirección fiscal y estado del contribuyente en segundos sin errores de tipeo.'
  },
  {
    id: 'pasarela_pagos',
    name: 'Pasarela de Cobros Online (Tarjetas / QR)',
    icon: 'credit_card',
    monthlyPrice: 25,
    desc: 'Genera links de cobro seguros por WhatsApp o correo con confirmación automática en el sistema.'
  },
  {
    id: 'almacenamiento_cloud',
    name: 'Almacenamiento Cloud de Evidencias (25 GB)',
    icon: 'cloud_upload',
    monthlyPrice: 15,
    desc: 'Guarda fotos de entregas firmadas, guías escaneadas y contratos con respaldo diario cifrado.'
  },
  {
    id: 'integracion_hardware_erp',
    name: 'Integración Hardware / ERP Propio',
    icon: 'developer_board',
    monthlyPrice: 0,
    isEnterpriseTrigger: true,
    desc: 'Conexión con balanzas industriales, lectores de código de barras, impresoras fiscales o software contable existente.'
  }
];

export const COMMITMENT_MODES = [
  {
    id: 'semestral_setup_gratis',
    name: 'Permanencia 6 meses',
    badge: 'Recomendado • Setup $0',
    setupPrice: 0,
    originalSetupPrice: 350,
    savingsText: 'Ahorras $350 USD en implementación inicial',
    desc: 'Configuración inicial, carga de datos y capacitación del equipo 100% bonificadas con compromiso semestral.'
  },
  {
    id: 'mensual_sin_permanencia',
    name: 'Sin permanencia (Mes a mes)',
    badge: 'Flexibilidad Total',
    setupPrice: 350,
    originalSetupPrice: 350,
    savingsText: null,
    desc: 'Pago único de implementación ($350 USD) con libertad total de pausar o renovar mes a mes.'
  }
];

// Helper para calcular precios según el estado de la cotización
export function calculateQuotePricing(config) {
  // 1. Roles administrativos ($30/mes = $1/día por usuario)
  const adminRoles = config.admin_roles || [];
  const totalAdminUsers = adminRoles.reduce((sum, r) => sum + (Number(r.count) || 0), 0);
  const monthlyRolesBase = totalAdminUsers * 30;

  // 2. Clientes finales
  const tierObj = END_CUSTOMER_TIERS.find(t => t.id === config.end_customers_tier) || END_CUSTOMER_TIERS[0];
  const monthlyCustomersExtra = tierObj.monthlyPrice;

  // 3. Interfaces adicionales
  const selectedInterfaces = config.interfaces || ['web_operativa'];
  const monthlyInterfaces = selectedInterfaces.reduce((sum, intId) => {
    const opt = INTERFACE_OPTIONS.find(i => i.id === intId);
    return sum + (opt ? opt.monthlyPrice : 0);
  }, 0);

  // 4. Paquetes de datos y APIs
  const selectedData = config.data_and_apis || [];
  const monthlyDataAndApis = selectedData.reduce((sum, dataId) => {
    const opt = DATA_AND_APIS_OPTIONS.find(d => d.id === dataId);
    return sum + (opt ? opt.monthlyPrice : 0);
  }, 0);

  // 5. Total mensual
  const monthlyTotal = monthlyRolesBase + monthlyCustomersExtra + monthlyInterfaces + monthlyDataAndApis;
  const dailyEquivalent = Number((monthlyTotal / 30).toFixed(2));

  // 6. Setup fee
  const commitment = COMMITMENT_MODES.find(c => c.id === config.commitment_plan) || COMMITMENT_MODES[0];
  const setupFee = commitment.setupPrice;
  const setupFeeSavings = commitment.originalSetupPrice - commitment.setupPrice;

  // 7. Regla Enterprise
  const hasHardwareCustom = selectedData.includes('integracion_hardware_erp');
  const isEnterprise = totalAdminUsers > 15 || config.end_customers_tier === 'mas_2000_enterprise' || hasHardwareCustom;

  return {
    totalAdminUsers,
    monthlyRolesBase,
    monthlyCustomersExtra,
    monthlyInterfaces,
    monthlyDataAndApis,
    monthlyTotal,
    dailyEquivalent,
    setupFee,
    setupFeeSavings,
    isEnterprise,
    commitmentPlan: commitment.id
  };
}

// Generador de ID amigable
export function generateQuoteId() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `QT-2026-${randomSuffix}`;
}

// Formateador de mensaje para WhatsApp
export function formatWhatsAppMessage(payload) {
  const { quote_id, business_discovery, configuration, pricing_summary, lead_contact } = payload;
  
  const industryObj = INDUSTRIES.find(i => i.id === business_discovery.industry);
  const commitmentObj = COMMITMENT_MODES.find(c => c.id === pricing_summary.commitment_plan);
  
  let msg = `*SOLICITUD DE COTIZACIÓN PATHRIMONIO*\n`;
  msg += `*ID:* ${quote_id}\n`;
  msg += `*Empresa:* ${business_discovery.company_name || 'No especificada'}\n`;
  msg += `*Contacto:* ${lead_contact.name} (${lead_contact.whatsapp})\n`;
  msg += `*Rubro:* ${industryObj ? industryObj.name : business_discovery.industry}\n\n`;
  
  msg += `*CONFIGURACIÓN DEL SISTEMA:*\n`;
  msg += `• *Roles Operativos (${configuration.total_admin_users} usuarios):*\n`;
  configuration.admin_roles.forEach(r => {
    const roleObj = ADMIN_ROLES.find(ar => ar.id === r.role);
    const roleName = roleObj ? roleObj.name : r.role;
    msg += `  - ${roleName}: ${r.count} usuario(s) ($${r.count * 30}/mes)\n`;
  });
  
  msg += `• *Capacidad:* ${configuration.end_customers_tier}\n`;
  msg += `• *Interfaces:* ${configuration.interfaces.join(', ')}\n`;
  if (configuration.data_and_apis.length > 0) {
    msg += `• *Integraciones:* ${configuration.data_and_apis.join(', ')}\n`;
  }
  
  if (configuration.custom_requirements_note) {
    msg += `\n*Detalles / Requerimiento:* "${configuration.custom_requirements_note}"\n`;
  }
  
  msg += `\n*RESUMEN FINANCIERO:*\n`;
  msg += `• Mensualidad: *$${pricing_summary.monthly_total.toFixed(2)} USD/mes* ($${pricing_summary.daily_equivalent.toFixed(2)} USD/día)\n`;
  msg += `• Modalidad: ${commitmentObj ? commitmentObj.name : pricing_summary.commitment_plan}\n`;
  msg += `• Costo Implementación: ${pricing_summary.setup_fee === 0 ? '¡$0 USD GRATIS (Ahorro $350 USD)!' : '$350 USD'}\n\n`;
  
  msg += `¡Hola equipo de Pathrimonio! Acabo de armar esta cotización interactiva en su web y me gustaría coordinar una sesión técnica para revisar los detalles.`;
  
  return encodeURIComponent(msg);
}
