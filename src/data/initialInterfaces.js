export const PLATFORM_OPTIONS = [
  "Todas",
  "Web & Mobile",
  "Mobile (Android / iOS)",
  "Web / Desktop"
];

export const INTERFACE_STATUS_OPTIONS = [
  "Todos",
  "Aprobado por Cliente",
  "En Revisión",
  "Borrador",
  "Rechazado"
];

export const INTERFACE_MODULE_OPTIONS = [
  "Todos",
  "Gestión & Monitoreo",
  "Metas & Hábitos (Pathway)",
  "Autenticación & Acceso",
  "Pasos & Hitos",
  "Bitácora de Progreso",
  "Gestión de Crédito",
  "Reportes de Impacto"
];

export const INITIAL_INTERFACES = [
  // ── Proyecto: Pathway (App MVP) ──
  {
    id: "INT-01",
    projectId: "pathway",
    number: "1",
    title: "Login & Autenticación",
    fullName: "1. Login & Autenticación",
    module: "Autenticación & Acceso",
    status: "Aprobado por Cliente",
    platform: "Web & Mobile",
    image: null,
    imagePlaceholder: "login",
    fields: {
      objetivo: "Autenticar usuarios de forma segura mediante correo/contraseña o biometría, garantizando acceso rápido y recuperación de cuenta.",
      contenido: "Campos de correo y contraseña, botón de visibilidad, botón de acceso biométrico (FaceID/Huella), enlace '¿Olvidaste tu contraseña?', y acceso de invitado.",
      reglas: "Bloqueo temporal de 15 minutos tras 5 intentos fallidos consecutivos. Contraseña con longitud mínima de 8 caracteres. Cifrado de credenciales en reposo.",
      detalles: "Generación de tokens JWT con expiración de 8 horas. Soporta autenticación offline con SQLite cifrado si no hay cobertura."
    },
    roles: [
      "Usuario enfocado en superación",
      "Usuario con metas complejas",
      "Usuario constante"
    ],
    linkedStory: "US-201",
    author: "Jhan C.",
    reviewedBy: "Cliente / PO",
    approvedAt: "2026-11-18",
    version: "v1.2"
  },
  {
    id: "INT-02",
    projectId: "pathway",
    number: "2",
    title: "Onboarding & Bienvenida",
    fullName: "2. Onboarding & Bienvenida",
    module: "Autenticación & Acceso",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "onboarding",
    fields: {
      objetivo: "Presentar la propuesta de valor de la aplicación y orientar al usuario en la metodología de metas y pasos antes de su primer uso.",
      contenido: "Carrusel interactivo de 3 pantallas con ilustraciones vectoriales, indicadores de progreso (dots), botón 'Omitir' y botón 'Comenzar Mi Ruta'.",
      reglas: "Se muestra exclusivamente en la primera ejecución tras la instalación de la app o al pulsar 'Repetir tutorial' desde Configuración.",
      detalles: "Animación de transición horizontal a 60fps. Solicita permisos de notificaciones locales con explicación contextual previa."
    },
    roles: [
      "Usuario enfocado en superación",
      "Usuario con metas complejas"
    ],
    linkedStory: "US-201",
    author: "Elena Morales",
    reviewedBy: "Cliente / PO",
    approvedAt: "2026-11-19",
    version: "v1.1"
  },
  {
    id: "INT-03",
    projectId: "pathway",
    number: "3",
    title: "Registro de Gran Meta (Pathway)",
    fullName: "3. Registro de Gran Meta (Pathway)",
    module: "Metas & Hábitos (Pathway)",
    status: "Aprobado por Cliente",
    platform: "Web & Mobile",
    image: null,
    imagePlaceholder: "goal_create",
    fields: {
      objetivo: "Permitir al usuario formalizar una meta personal o profesional con fecha objetivo, categoría y color distintivo.",
      contenido: "Campo de título de meta, selector de categoría con iconos (Estudio, Negocio, Salud, Finanzas), selector de fecha límite, paleta de colores y botón 'Guardar y Desglosar en Pasos'.",
      reglas: "El título debe contener al menos 5 caracteres. La fecha estimada debe ser igual o posterior a la fecha actual.",
      detalles: "Validación instantánea en cliente. Al guardar, redirige de forma automática al mapa secuencial de pasos (INT-05)."
    },
    roles: [
      "Usuario enfocado en superación",
      "Usuario con metas complejas"
    ],
    linkedStory: "US-201",
    author: "Jhan C.",
    reviewedBy: "Cliente / PO",
    approvedAt: "2026-11-20",
    version: "v1.0"
  },
  {
    id: "INT-05",
    projectId: "pathway",
    number: "5",
    title: "Mapa Secuencial de Pasos e Hitos",
    fullName: "5. Mapa Secuencial de Pasos e Hitos",
    module: "Pasos & Hitos",
    status: "En Revisión",
    platform: "Web & Mobile",
    image: null,
    imagePlaceholder: "steps_roadmap",
    fields: {
      objetivo: "Visualizar el camino ordenado de hitos y pasos secuenciales necesarios para cumplir la meta seleccionada.",
      contenido: "Línea de tiempo vertical con nodos interactivos, estado de cada paso (Completado, En Curso, Pendiente), porcentaje total de progreso y botón '+ Añadir Paso'.",
      reglas: "Cada paso completado suma proporcionalmente al indicador de progreso global. Un paso no puede completarse si su predecesor obligatorio no fue validado.",
      detalles: "Feedback háptico en móviles al marcar un hito como logrado. Soporta reordenamiento por arrastre (drag-and-drop)."
    },
    roles: [
      "Usuario con metas complejas",
      "Usuario enfocado en superación"
    ],
    linkedStory: "US-202",
    author: "Sofía V.",
    reviewedBy: null,
    approvedAt: null,
    version: "v1.1"
  },
  {
    id: "INT-06",
    projectId: "pathway",
    number: "6",
    title: "Bitácora Diaria & Registro de Hábitos",
    fullName: "6. Bitácora Diaria & Registro de Hábitos",
    module: "Bitácora de Progreso",
    status: "En Revisión",
    platform: "Web & Mobile",
    image: null,
    imagePlaceholder: "journal",
    fields: {
      objetivo: "Registrar avances diarios, reflexiones, hábitos cumplidos y estados de ánimo vinculados a las metas activas.",
      contenido: "Línea de tiempo cronológica, campo de reflexión rápida con timestamp automático, selector de estado de ánimo (emojis) y checklist de hábitos diarios.",
      reglas: "Las entradas son privadas del usuario. Cada reflexión queda sellada con fecha y hora local inmutable una vez guardada.",
      detalles: "Sincronización en segundo plano con almacenamiento local prioritario (offline-first)."
    },
    roles: [
      "Usuario constante"
    ],
    linkedStory: "US-203",
    author: "Elena Morales",
    reviewedBy: null,
    approvedAt: null,
    version: "v0.9"
  },

  // ── Proyecto: Sistema de Gestión & Ventas (portal-admin) ──
  {
    id: "INT-04",
    projectId: "portal-admin",
    number: "4",
    title: "Dashboard",
    fullName: "4. Dashboard",
    module: "Gestión & Monitoreo",
    status: "Aprobado por Cliente",
    platform: "Web & Mobile",
    image: null,
    imagePlaceholder: "dashboard",
    fields: {
      objetivo: "Monitorear ventas, ingresos, egresos y alertas en tiempo real.",
      contenido: "Ventas, ingresos, egresos, alertas de inventario y accesos rápidos.",
      reglas: "Solo administrador.",
      detalles: "Datos en tiempo real."
    },
    roles: [
      "Administrador General",
      "Cajero / Operador de Ventas",
      "Supervisor de Almacén"
    ],
    linkedStory: "US-301",
    author: "Carlos D.",
    reviewedBy: "Cliente / PO",
    approvedAt: "2026-11-20",
    version: "v2.0"
  },

  // ── Proyecto: Core Banking & Impact Hub (core-hub) ──
  {
    id: "INT-07",
    projectId: "core-hub",
    number: "7",
    title: "Desembolso & Validación Biométrica",
    fullName: "7. Desembolso & Validación Biométrica",
    module: "Gestión de Crédito",
    status: "Aprobado por Cliente",
    platform: "Web / Desktop",
    image: null,
    imagePlaceholder: "dashboard",
    fields: {
      objetivo: "Verificar identidad del beneficiario mediante huella dactilar y autorizar desembolso en zonas desconectadas.",
      contenido: "Datos del crédito, resumen de cuotas, canvas de firma digital y confirmación con token TOTP.",
      reglas: "Monto máximo por oficial: $5,000 USD sin conexión a internet.",
      detalles: "Firma digital sellada con hash SHA-256 almacenada en base de datos local SQLite cifrada."
    },
    roles: [
      "Oficial de Crédito Comunitario",
      "Beneficiario Rural",
      "Auditor de Impacto"
    ],
    linkedStory: "US-101",
    author: "Sofía V.",
    reviewedBy: "Auditor Legal",
    approvedAt: "2026-11-15",
    version: "v2.4"
  }
];
