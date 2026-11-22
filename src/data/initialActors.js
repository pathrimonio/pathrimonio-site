// Catálogo Inicial de Actores y Roles del Negocio
// Permite formalizar qué actores intervienen en cada software, sus responsabilidades,
// las áreas del sistema a las que tienen permisos y enlaces para que los trabajadores
// completen las Historias de Usuario correspondientes.

export const PERMISSION_LEVEL_OPTIONS = [
  "Todos",
  "Acceso Total (Admin)",
  "Operativo / Escritura",
  "Consulta / Lectura",
  "Aprobador / PO",
  "Usuario Móvil / B2C"
];

export const ACTOR_CATEGORY_OPTIONS = [
  "Todas",
  "Usuario Final / B2C",
  "Administración & Gerencia",
  "Operaciones & Ventas",
  "Personal de Campo / Brigadas",
  "Auditoría & Control"
];

export const SYSTEM_AREA_OPTIONS = [
  "Metas & Hábitos (Pathway)",
  "Pasos & Hitos",
  "Bitácora de Progreso",
  "Gestión & Monitoreo",
  "Ventas & Facturación",
  "Inventario & Alertas",
  "Gestión de Crédito",
  "Autenticación & KYC",
  "Pasarela de Pagos",
  "Reportes de Impacto",
  "Configuración & Permisos",
  "Operación & Tránsito en Ruta",
  "Documentación & Validación OCR",
  "Recursos, Coordinación & Capacidad",
  "Control Operativo, Tiempos & Agentes"
];

export const INITIAL_ACTORS = [
  // ══════════════════════════════════════════════════════════
  // PROYECTO: Pathway (App MVP) — id: "pathway"
  // ══════════════════════════════════════════════════════════
  {
    id: "ACT-01",
    projectId: "pathway",
    name: "Usuario enfocado en superación",
    category: "Usuario Final / B2C",
    avatarIcon: "psychology",
    color: "emerald",
    description: "Persona motivada que busca alcanzar metas grandes (estudio, negocio, bienestar) y necesita un método estructurado paso a paso para evitar la procrastinación en su día a día.",
    permissionLevel: "Usuario Móvil / B2C",
    systemAreas: [
      "Metas & Hábitos (Pathway)",
      "Pasos & Hitos"
    ],
    assignedWorker: "jhan.lead@pathrimonio.org",
    assignedWorkerName: "Jhan C. (Product Owner Pathway)",
    status: "Activo",
    createdAt: "2026-11-18",
    isPrimaryRole: true
  },
  {
    id: "ACT-02",
    projectId: "pathway",
    name: "Usuario con metas complejas",
    category: "Usuario Final / B2C",
    avatarIcon: "route",
    color: "sky",
    description: "Usuario con objetivos a mediano y largo plazo que involucran múltiples fases interdependientes. Requiere mapas secuenciales visuales de hitos con cálculo del % de avance.",
    permissionLevel: "Usuario Móvil / B2C",
    systemAreas: [
      "Pasos & Hitos",
      "Bitácora de Progreso"
    ],
    assignedWorker: "elena.ux@pathrimonio.org",
    assignedWorkerName: "Elena Morales (Investigación UX)",
    status: "Activo",
    createdAt: "2026-11-19",
    isPrimaryRole: false
  },
  {
    id: "ACT-03",
    projectId: "pathway",
    name: "Usuario constante",
    category: "Usuario Final / B2C",
    avatarIcon: "edit_calendar",
    color: "amber",
    description: "Usuario habitual que registra reflexiones diarias, analiza sus estados de ánimo predominantes y mantiene una racha de micro-hábitos matutinos o nocturnos.",
    permissionLevel: "Usuario Móvil / B2C",
    systemAreas: [
      "Bitácora de Progreso",
      "Metas & Hábitos (Pathway)"
    ],
    assignedWorker: "sofia.qa@pathrimonio.org",
    assignedWorkerName: "Sofía V. (Fintech & Hábitos)",
    status: "Activo",
    createdAt: "2026-11-20",
    isPrimaryRole: false
  },

  // ══════════════════════════════════════════════════════════
  // PROYECTO: Sistema de Gestión & Ventas — id: "portal-admin"
  // ══════════════════════════════════════════════════════════
  {
    id: "ACT-04",
    projectId: "portal-admin",
    name: "Administrador General",
    category: "Administración & Gerencia",
    avatarIcon: "admin_panel_settings",
    color: "purple",
    description: "Líder del negocio responsable de supervisar ingresos, egresos, autorizar márgenes de descuento, monitorear alertas de stock crítico y tomar decisiones comerciales desde el Dashboard.",
    permissionLevel: "Acceso Total (Admin)",
    systemAreas: [
      "Gestión & Monitoreo",
      "Ventas & Facturación",
      "Inventario & Alertas",
      "Configuración & Permisos"
    ],
    assignedWorker: "gerencia@comercial.pe",
    assignedWorkerName: "Gerencia Comercial (Cliente Encargado)",
    status: "Activo",
    createdAt: "2026-11-20",
    isPrimaryRole: true
  },
  {
    id: "ACT-05",
    projectId: "portal-admin",
    name: "Cajero / Operador de Ventas",
    category: "Operaciones & Ventas",
    avatarIcon: "point_of_sale",
    color: "cyan",
    description: "Trabajador de atención al cliente en punto de venta que registra comprobantes rápidos (boletas, tickets, transferencias), cobra y realiza el cierre de caja del turno.",
    permissionLevel: "Operativo / Escritura",
    systemAreas: [
      "Ventas & Facturación",
      "Gestión & Monitoreo"
    ],
    assignedWorker: "caja.principal@comercial.pe",
    assignedWorkerName: "Operador de Caja Principal",
    status: "Activo",
    createdAt: "2026-11-20",
    isPrimaryRole: false
  },
  {
    id: "ACT-06",
    projectId: "portal-admin",
    name: "Supervisor de Almacén",
    category: "Operaciones & Ventas",
    avatarIcon: "inventory_2",
    color: "amber",
    description: "Encargado de la recepción de mercadería, ajuste de existencias físicas y atención inmediata de las alertas preventivas de productos con menos de 5 unidades.",
    permissionLevel: "Operativo / Escritura",
    systemAreas: [
      "Inventario & Alertas",
      "Gestión & Monitoreo"
    ],
    assignedWorker: "logistica@comercial.pe",
    assignedWorkerName: "Coordinador de Bodega & Logística",
    status: "Activo",
    createdAt: "2026-11-20",
    isPrimaryRole: false
  },

  // ══════════════════════════════════════════════════════════
  // PROYECTO: Core Banking & Impact Hub — id: "core-hub"
  // ══════════════════════════════════════════════════════════
  {
    id: "ACT-07",
    projectId: "core-hub",
    name: "Oficial de Crédito Comunitario",
    category: "Personal de Campo / Brigadas",
    avatarIcon: "shield_person",
    color: "primary",
    description: "Agente financiero que viaja a comunidades rurales desconectadas, asesora a los productores, evalúa la capacidad de pago y formaliza desembolsos con firma biométrica offline.",
    permissionLevel: "Operativo / Escritura",
    systemAreas: [
      "Gestión de Crédito",
      "Autenticación & KYC"
    ],
    assignedWorker: "brigada.cusco@pathrimonio.org",
    assignedWorkerName: "Oficial de Brigada Rural Cusco",
    status: "Activo",
    createdAt: "2026-11-15",
    isPrimaryRole: true
  },
  {
    id: "ACT-08",
    projectId: "core-hub",
    name: "Beneficiario Rural",
    category: "Usuario Final / B2C",
    avatarIcon: "person",
    color: "emerald",
    description: "Agricultor o artesano comunero que solicita financiamiento para su actividad productiva, valida su identidad mediante huella dactilar y recibe el desembolso.",
    permissionLevel: "Consulta / Lectura",
    systemAreas: [
      "Gestión de Crédito"
    ],
    assignedWorker: "cooperativa.asociados@cusco.org",
    assignedWorkerName: "Representante de Cooperativa",
    status: "Activo",
    createdAt: "2026-11-15",
    isPrimaryRole: false
  },
  {
    id: "ACT-09",
    projectId: "core-hub",
    name: "Auditor de Impacto",
    category: "Auditoría & Control",
    avatarIcon: "verified_user",
    color: "blue",
    description: "Especialista externo o interno que fiscaliza la inmutabilidad de las firmas biométricas con hash SHA-256 y verifica la trazabilidad social de los fondos desembolsados.",
    permissionLevel: "Consulta / Lectura",
    systemAreas: [
      "Reportes de Impacto",
      "Autenticación & KYC"
    ],
    assignedWorker: "auditoria.externa@latam-impact.org",
    assignedWorkerName: "Comité de Auditoría de Impacto",
    status: "Activo",
    createdAt: "2026-11-16",
    isPrimaryRole: false
  },

  // ══════════════════════════════════════════════════════════
  // PROYECTO: SMATAD — id: "smatad"
  // ══════════════════════════════════════════════════════════
  {
    id: "ACT-SMATAD-01",
    projectId: "smatad",
    name: "Conductor / Transportista",
    category: "Personal de Campo / Brigadas",
    avatarIcon: "local_shipping",
    color: "sky",
    description: "Piloto profesional certificado encargado de la conducción del tracto-camión, cotejo de guías, lectura OCR de GRE y confirmación de rampa en ruta.",
    permissionLevel: "Operativo / Escritura",
    systemAreas: [
      "Operación & Tránsito en Ruta",
      "Documentación & Validación OCR",
      "Recursos, Coordinación & Capacidad"
    ],
    assignedWorker: "carlos.mendoza@transporte.pe",
    assignedWorkerName: "Carlos Mendoza (Conductor A-IIIc)",
    status: "Activo",
    createdAt: "2026-09-05",
    isPrimaryRole: true
  },
  {
    id: "ACT-SMATAD-02",
    projectId: "smatad",
    name: "Operador de Tráfico",
    category: "Operaciones & Ventas",
    avatarIcon: "alt_route",
    color: "amber",
    description: "Responsable del centro de control logístico, monitoreo satelital en vivo, creación de servicios y resolución de contingencias de ruta (GEC).",
    permissionLevel: "Operativo / Escritura",
    systemAreas: [
      "Operación & Tránsito en Ruta",
      "Control Operativo, Tiempos & Agentes",
      "Recursos, Coordinación & Capacidad"
    ],
    assignedWorker: "trafico@smatad.pe",
    assignedWorkerName: "Mesa de Tráfico & Monitoreo",
    status: "Activo",
    createdAt: "2026-09-05",
    isPrimaryRole: false
  },
  {
    id: "ACT-SMATAD-03",
    projectId: "smatad",
    name: "Supervisor de Rampa",
    category: "Operaciones & Ventas",
    avatarIcon: "warehouse",
    color: "emerald",
    description: "Encargado de la supervisión de garita, balanza, acople en rampa, inspección de precintos de seguridad y control estricto de SLA (< 60 min).",
    permissionLevel: "Operativo / Escritura",
    systemAreas: [
      "Recursos, Coordinación & Capacidad",
      "Control Operativo, Tiempos & Agentes",
      "Documentación & Validación OCR"
    ],
    assignedWorker: "rampa.callao@smatad.pe",
    assignedWorkerName: "Jefe de Rampa Terminal Callao",
    status: "Activo",
    createdAt: "2026-09-05",
    isPrimaryRole: false
  },
  {
    id: "ACT-SMATAD-04",
    projectId: "smatad",
    name: "Gestor de Flota",
    category: "Administración & Gerencia",
    avatarIcon: "directions_car",
    color: "purple",
    description: "Administra la disponibilidad de unidades motrices, remolques, calendarios de mantenimiento, revisiones técnicas y programación TPA.",
    permissionLevel: "Aprobador / PO",
    systemAreas: [
      "Control Operativo, Tiempos & Agentes",
      "Recursos, Coordinación & Capacidad",
      "Operación & Tránsito en Ruta"
    ],
    assignedWorker: "flota@smatad.pe",
    assignedWorkerName: "Gerencia de Flota Pesada",
    status: "Activo",
    createdAt: "2026-09-05",
    isPrimaryRole: false
  },
  {
    id: "ACT-SMATAD-05",
    projectId: "smatad",
    name: "Administrador del Sistema",
    category: "Administración & Gerencia",
    avatarIcon: "admin_panel_settings",
    color: "primary",
    description: "Control global de la plataforma, parametrización de reglas de agentes autónomos, auditoría inmutable de bitácoras y gestión de accesos.",
    permissionLevel: "Acceso Total (Admin)",
    systemAreas: [
      "Control Operativo, Tiempos & Agentes",
      "Configuración & Permisos",
      "Operación & Tránsito en Ruta"
    ],
    assignedWorker: "admin@smatad.pe",
    assignedWorkerName: "Administrador General SMATAD",
    status: "Activo",
    createdAt: "2026-09-05",
    isPrimaryRole: false
  },
  {
    id: "ACT-SMATAD-06",
    projectId: "smatad",
    name: "Estibador Certificado",
    category: "Personal de Campo / Brigadas",
    avatarIcon: "groups",
    color: "cyan",
    description: "Personal auxiliar capacitado con certificación en EPP y manejo de carga pesada asignado a cuadrillas en rampa para carga y descarga ágil.",
    permissionLevel: "Usuario Móvil / B2C",
    systemAreas: [
      "Recursos, Coordinación & Capacidad"
    ],
    assignedWorker: "estiba.cuadrilla@smatad.pe",
    assignedWorkerName: "Coordinador de Cuadrillas de Estiba",
    status: "Activo",
    createdAt: "2026-09-05",
    isPrimaryRole: false
  }
];
