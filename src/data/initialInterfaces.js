export const PLATFORM_OPTIONS = [
  "Todas",
  "Mobile (Android)",
  "Mobile (iOS)",
  "Web",
  "Ambas Plataformas"
];

export const INTERFACE_TYPE_OPTIONS = [
  "Pantalla Principal",
  "Modal / Diálogo",
  "Bottom Sheet",
  "Drawer / Panel",
  "Onboarding",
  "Dashboard / Resumen",
  "Formulario",
  "Lista / Feed"
];

export const INTERFACE_STATUS_OPTIONS = [
  "Todos",
  "Borrador",
  "En Revisión",
  "Aprobado por Cliente",
  "Rechazado",
  "Deprecado"
];

export const INTERFACE_MODULE_OPTIONS = [
  "Todos",
  "Autenticación & Acceso",
  "Metas & Hábitos (Pathway)",
  "Pasos & Hitos",
  "Bitácora de Progreso",
  "Gestión de Crédito",
  "Pasarela de Pagos",
  "Reportes de Impacto"
];

export const INITIAL_INTERFACES = [
  {
    id: "INT-001",
    module: "Autenticación & Acceso",
    name: "Pantalla de Bienvenida & Acceso Rápido",
    platform: "Ambas Plataformas",
    interfaceType: "Pantalla Principal",
    status: "Aprobado por Cliente",
    priority: "Alta",
    description: "Pantalla de aterrizaje inicial con branding de la aplicación, selector de modo invitado o inicio de sesión con credenciales biométricas o correo electrónico.",
    userGoal: "Permitir al usuario identificarse en menos de 5 segundos con feedback háptico y opción de saltar a modo offline si no hay red.",
    entryPoints: ["Apertura de la aplicación", "Cierre de sesión", "Deeplink /auth/login"],
    wireframeRef: "wireframe_pathway_auth_splash_v2.png",
    annotations: [
      { id: "a1", element: "Botón 'Continuar como Invitado'", behavior: "Almacena sesión anónima en SQLite local sin bloquear el flujo" },
      { id: "a2", element: "Lector Biométrico Touch/FaceID", behavior: "Dispara prompt nativo del sistema operativo con fallback a PIN" },
      { id: "a3", element: "Badge de Estado de Conexión", behavior: "Muestra 'Modo Offline activo' si navigator.onLine es falso" }
    ],
    visualCriteria: [
      { id: "vc1", text: "Logo con contraste accesible WCAG AAA sobre fondo oscuro", checked: true },
      { id: "vc2", text: "Teclado virtual no oculta el botón de acción principal", checked: true },
      { id: "vc3", text: "Tiempo de transición hacia el dashboard menor a 300ms", checked: true },
      { id: "vc4", text: "Mensajes de error inline con borde ámbar y texto explicativo", checked: true }
    ],
    linkedStories: ["US-102"],
    author: "Jhan C. (UX Lead)",
    createdAt: "Hace 3 días",
    reviewedBy: "PO / Cliente Pathway",
    approvedAt: "2026-11-18",
    version: "v1.3"
  },
  {
    id: "INT-002",
    module: "Autenticación & Acceso",
    name: "Flujo de Onboarding Interactivo (3 Pasos)",
    platform: "Mobile (Android)",
    interfaceType: "Onboarding",
    status: "Aprobado por Cliente",
    priority: "Media",
    description: "Carrusel guiado de 3 pantallas que enseña la filosofía de dividir metas grandes en pasos medibles y el uso de la bitácora sin conexión.",
    userGoal: "Comprender la propuesta de valor de Pathway y conceder permisos de notificaciones locales de forma transparente.",
    entryPoints: ["Primer inicio tras instalación en Play Store"],
    wireframeRef: "pathway_onboarding_carousel_spec.png",
    annotations: [
      { id: "a1", element: "Indicador de Paginación (Dots)", behavior: "Animación de escala al deslizar entre láminas" },
      { id: "a2", element: "Botón 'Omitir'", behavior: "Salta directamente a la pantalla de crear primera meta" },
      { id: "a3", element: "Botón 'Comenzar Mi Ruta'", behavior: "Guarda flag 'hasSeenOnboarding: true' y abre modal INT-004" }
    ],
    visualCriteria: [
      { id: "vc1", text: "Ilustraciones vectoriales SVG ligeras (<40kb cada una)", checked: true },
      { id: "vc2", text: "Soporte de gestos swipe fluidos a 60fps", checked: true },
      { id: "vc3", text: "Permiso de notificaciones solicitado con pre-pantalla contextual", checked: true }
    ],
    linkedStories: ["US-102"],
    author: "Jhan C. (UX Lead)",
    createdAt: "Hace 3 días",
    reviewedBy: "PO / Cliente Pathway",
    approvedAt: "2026-11-19",
    version: "v1.1"
  },
  {
    id: "INT-003",
    module: "Metas & Hábitos (Pathway)",
    name: "Dashboard Principal de Metas Activas",
    platform: "Ambas Plataformas",
    interfaceType: "Dashboard / Resumen",
    status: "En Revisión",
    priority: "Bloqueante",
    description: "Vista central que despliega las metas del usuario en tarjetas visuales con porcentaje de avance, pasos pendientes, fecha objetivo y estado.",
    userGoal: "Tener un panorama inmediato y claro de las prioridades personales sin sobrecarga cognitiva.",
    entryPoints: ["Navegación principal (tab Metas)", "Notificación de recordatorio diario"],
    wireframeRef: "dashboard_goals_feed_spec.png",
    annotations: [
      { id: "a1", element: "Anillo de Progreso SVG", behavior: "Gradiente ámbar proporcional a pasos completados / totales" },
      { id: "a2", element: "Botón Flotante (+ Nueva Meta)", behavior: "Abre el modal INT-004 con foco automático en título" },
      { id: "a3", element: "Filtro rápido (Todas, En Curso, Cumplidas)", behavior: "Filtrado instantáneo en memoria sin recargar vista" }
    ],
    visualCriteria: [
      { id: "vc1", text: "Estado vacío motivacional cuando el usuario no tiene metas", checked: true },
      { id: "vc2", text: "Tarjetas soportan scroll horizontal suave en móviles", checked: true },
      { id: "vc3", text: "Efecto de confetti al pulsar sobre meta 100% completada", checked: false },
      { id: "vc4", text: "Modo de alto contraste para visibilidad bajo luz solar directa", checked: false }
    ],
    linkedStories: ["US-101", "US-104"],
    author: "Elena Morales (UI Designer)",
    createdAt: "Hace 1 día",
    reviewedBy: null,
    approvedAt: null,
    version: "v2.0"
  },
  {
    id: "INT-004",
    module: "Metas & Hábitos (Pathway)",
    name: "Modal: Creación y Formalización de Gran Meta",
    platform: "Ambas Plataformas",
    interfaceType: "Modal / Diálogo",
    status: "En Revisión",
    priority: "Alta",
    description: "Formulario emergente asistido que ayuda a formular metas bajo el framework SMART (específica, medible, alcanzable, relevante y temporal).",
    userGoal: "Definir una meta clara con fecha límite y seleccionar el color/icono representativo.",
    entryPoints: ["Botón '+ Nueva Meta' en Dashboard", "Botón CTA en estado vacío"],
    wireframeRef: "modal_create_goal_wizard.png",
    annotations: [
      { id: "a1", element: "Paleta de Colores de Acento", behavior: "8 colores curados con contraste garantizado" },
      { id: "a2", element: "Sugerencias de Categoría (Salud, Estudio, Negocio)", behavior: "Pills de selección rápida que precargan icono" },
      { id: "a3", element: "Botón 'Guardar y Añadir Pasos'", behavior: "Crea el registro y navega inmediatamente a INT-005" }
    ],
    visualCriteria: [
      { id: "vc1", text: "Validación en tiempo real: título mínimo 5 caracteres", checked: true },
      { id: "vc2", text: "Selector de fecha nativo en móvil / popover en web", checked: true },
      { id: "vc3", text: "Cierre seguro con advertencia si hay cambios sin guardar", checked: true }
    ],
    linkedStories: ["US-101"],
    author: "Elena Morales (UI Designer)",
    createdAt: "Ayer",
    reviewedBy: null,
    approvedAt: null,
    version: "v1.0"
  },
  {
    id: "INT-005",
    module: "Pasos & Hitos",
    name: "Mapa Secuencial de Pasos e Hitos",
    platform: "Ambas Plataformas",
    interfaceType: "Pantalla Principal",
    status: "Borrador",
    priority: "Alta",
    description: "Línea de tiempo vertical interactiva tipo 'ruta' donde cada paso es un nodo que se desbloquea secuencialmente o se marca como completado.",
    userGoal: "Visualizar el camino paso a paso hacia la meta sin sentirse abrumado por la magnitud del objetivo final.",
    entryPoints: ["Pulsar en una tarjeta de meta desde el Dashboard"],
    wireframeRef: "step_roadmap_vertical_tree.png",
    annotations: [
      { id: "a1", element: "Nodo de Paso", behavior: "Icono de check animado al completar, línea conectora se colorea" },
      { id: "a2", element: "Botón 'Insertar Paso Intermedio'", behavior: "Despliega bottom sheet INT-006 entre dos nodos existentes" },
      { id: "a3", element: "Reordenamiento Drag & Drop", behavior: "Permite arrastrar nodos para cambiar el orden de ejecución" }
    ],
    visualCriteria: [
      { id: "vc1", text: "Animación de pulso en el paso actualmente activo", checked: true },
      { id: "vc2", text: "Feedback háptico al completar cada paso en dispositivos móviles", checked: false },
      { id: "vc3", text: "Contador de días restantes para el hito seleccionado", checked: false }
    ],
    linkedStories: ["US-101", "US-103"],
    author: "Carlos D. (Tech Lead)",
    createdAt: "Hoy",
    reviewedBy: null,
    approvedAt: null,
    version: "v0.9"
  },
  {
    id: "INT-006",
    module: "Pasos & Hitos",
    name: "Bottom Sheet: Añadir / Editar Paso Secuencial",
    platform: "Mobile (Android)",
    interfaceType: "Bottom Sheet",
    status: "Borrador",
    priority: "Media",
    description: "Panel deslizable desde la parte inferior para definir el título del paso, estimación de esfuerzo y fecha opcional sin perder el contexto de la ruta.",
    userGoal: "Añadir un paso en menos de 10 segundos con el pulgar en pantallas de cualquier tamaño.",
    entryPoints: ["Botón '+ Paso' en mapa de ruta INT-005"],
    wireframeRef: "bottomsheet_quick_step.png",
    annotations: [
      { id: "a1", element: "Handle superior de arrastre", behavior: "Permite expandir a altura completa o descartar deslizando hacia abajo" },
      { id: "a2", element: "Selector de Esfuerzo (Rápido, Medio, Retador)", behavior: "Chips de un toque con código de color visual" }
    ],
    visualCriteria: [
      { id: "vc1", text: "Backdrop semi-transparente oscurece el fondo 60%", checked: true },
      { id: "vc2", text: "Respeta esquinas redondeadas y Safe Area en Android 14+", checked: true }
    ],
    linkedStories: ["US-101"],
    author: "Carlos D. (Tech Lead)",
    createdAt: "Hoy",
    reviewedBy: null,
    approvedAt: null,
    version: "v0.8"
  },
  {
    id: "INT-007",
    module: "Bitácora de Progreso",
    name: "Bitácora Diaria & Registro de Hábitos",
    platform: "Ambas Plataformas",
    interfaceType: "Lista / Feed",
    status: "Borrador",
    priority: "Media",
    description: "Línea de tiempo cronológica donde el usuario registra reflexiones, dificultades superadas y pequeñas victorias vinculadas a sus metas.",
    userGoal: "Mantener el compromiso a largo plazo y consultar el histórico de progreso personal.",
    entryPoints: ["Tab 'Bitácora' en navegación principal"],
    wireframeRef: "journal_activity_feed_spec.png",
    annotations: [
      { id: "a1", element: "Input Rápido '¿Qué avanzaste hoy?'", behavior: "Crea una entrada rápida con timestamp automático" },
      { id: "a2", element: "Selector de Estado de Ánimo (Emojis)", behavior: "Registra correlación entre motivación y cumplimiento de metas" }
    ],
    visualCriteria: [
      { id: "vc1", text: "Búsqueda por texto libre en el historial de reflexiones", checked: false },
      { id: "vc2", text: "Exportación de la bitácora a texto plano / PDF para el usuario", checked: false }
    ],
    linkedStories: ["US-104"],
    author: "Jhan C. (UX Lead)",
    createdAt: "Ayer",
    reviewedBy: null,
    approvedAt: null,
    version: "v0.7"
  },
  {
    id: "INT-008",
    module: "Gestión de Crédito",
    name: "Firma Digital de Actas & Validación Offline",
    platform: "Web",
    interfaceType: "Formulario",
    status: "Aprobado por Cliente",
    priority: "Bloqueante",
    description: "Pantalla de formalización contractual donde clientes y comités validan desembolsos y acuerdos con hash criptográfico y firma manuscrita digital.",
    userGoal: "Formalizar acuerdos legales con plena validez probatoria sin requerir papel impreso.",
    entryPoints: ["Flujo de desembolso final de crédito"],
    wireframeRef: "acta_digital_signature_pad.png",
    annotations: [
      { id: "a1", element: "Canvas de Firma Táctil", behavior: "Guarda trazos vectoriales y calcula hash SHA-256 del documento" },
      { id: "a2", element: "Botón 'Aprobar Formalmente'", behavior: "Genera comprobante sellado y sincroniza cuando hay conexión" }
    ],
    visualCriteria: [
      { id: "vc1", text: "Botón de limpiar trazo y reiniciar firma", checked: true },
      { id: "vc2", text: "Contenedor de firma con dimensiones mínimas de 300x150px en móvil", checked: true },
      { id: "vc3", text: "Comprobante emitido con marca de tiempo UTC certificada", checked: true }
    ],
    linkedStories: ["US-101", "US-103"],
    author: "Sofía V. (Fintech Lead)",
    createdAt: "Hace 4 días",
    reviewedBy: "Auditor Legal Comunitario",
    approvedAt: "2026-11-17",
    version: "v2.1"
  }
];
