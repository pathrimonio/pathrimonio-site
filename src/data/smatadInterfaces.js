
export const SMATAD_INTERFACES = [
  {
    id: "INT-SMATAD-01",
    projectId: "smatad",
    number: "1",
    title: "Login",
    fullName: "1. Login",
    module: "Autenticación & Acceso",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "login",
    fields: {
      objetivo: "Permitir el acceso seguro y autenticación de conductores, operadores logísticos y administradores al sistema SMATAD.",
      contenido: "Campos: Correo electrónico institucional, contraseña cifrada, botón para alternar visibilidad de contraseña (ojo), accesos directos demo para Conductor y Operaciones, enlace a catálogo de navegación.",
      reglas: "Formato de correo electrónico válido obligatorio; contraseña obligatoria; autenticación de sesión con token; credenciales verificadas contra el servidor de identidad.",
      detalles: "Basado en Mobile_SMATAD_Login.md: cabecera centrada con isotipo de camión en caja #0058BE (64x64px), título tipográfico Inter 700 32px con espaciado -0.64px, inputs de 42px con borde #C2C6D6, botón primario de 40px y enlaces inferiores a soporte técnico y recuperación de cuenta."
    },
    roles: [
      "Conductor / Transportista",
      "Operador de Tráfico",
      "Supervisor de Rampa",
      "Gestor de Flota",
      "Administrador del Sistema"
    ],
    dataUsage: [
      { key: "tb_usuario:correo", tableName: "tb_usuario", tableLabel: "Usuarios y Credenciales", schema: "nucleo", attribute: "correo", type: "VARCHAR(255)", isPrimary: false },
      { key: "tb_usuario:password_hash", tableName: "tb_usuario", tableLabel: "Usuarios y Credenciales", schema: "nucleo", attribute: "password_hash", type: "VARCHAR(255)", isPrimary: false },
      { key: "tb_sesiones_usuario:token_sesion", tableName: "tb_sesiones_usuario", tableLabel: "Sesiones de Usuario", schema: "nucleo", attribute: "token_sesion", type: "VARCHAR(500)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-02",
    projectId: "smatad",
    number: "2",
    title: "Dashboard",
    fullName: "2. Dashboard",
    module: "Operación & Tránsito en Ruta",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "dashboard",
    fields: {
      objetivo: "Monitorear en tiempo real el estado general de la operación de transporte, métricas clave (KPIs), el viaje en curso y el feed de eventos (Event Bus).",
      contenido: "Resumen numérico de viajes (Activos: 03, En Ruta: 02, Pendientes: 01); botón de acción rápida '+ Crear Nuevo Servicio'; feed 'Event Bus' con hitos cronológicos en vivo; tarjeta destacada del viaje activo (Servicio S-001) con barra de progreso, origen/destino, carga, hora estimada de llegada (ETA) y botón de seguimiento; accesos directos a módulos operativos; cabecera con botón de alertas (🔔 2) y avatar de usuario.",
      reglas: "Los datos del Event Bus y de los KPIs se actualizan en vivo según los sucesos de la flota; el botón de alertas conduce al módulo GEC.",
      detalles: "Cumple con la especificación Mobile_SMATAD_Dashboard.md: fondo #FEF7FF, tarjetas con radio 12px y borde #C2C6D6, badges en acento #2170E4 y #E8F0FE."
    },
    roles: [
      "Operador de Tráfico",
      "Gestor de Flota",
      "Administrador del Sistema",
      "Conductor / Transportista"
    ],
    dataUsage: [
      { key: "tb_servicio:estado_servicio", tableName: "tb_servicio", tableLabel: "Servicios de Transporte", schema: "nucleo", attribute: "estado_servicio", type: "VARCHAR(50)", isPrimary: false },
      { key: "tb_evento_agente:tipo_evento", tableName: "tb_evento_agente", tableLabel: "Event Bus & Eventos MAS", schema: "nucleo", attribute: "tipo_evento", type: "VARCHAR(100)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-03",
    projectId: "smatad",
    number: "3",
    title: "Crear Servicio",
    fullName: "3. Crear Servicio",
    module: "Operación & Tránsito en Ruta",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "form",
    fields: {
      objetivo: "Registrar y dar de alta una nueva solicitud o despacho de transporte de carga pesada asignando cliente, rutas y necesidades operativas.",
      contenido: "Campos: Cliente / Razón Social, Dirección de Origen, Dirección de Destino, Selector de Tipo de Carga (Carga General, Carga Pesada/Palletizada, Refrigerada, Mercancía Peligrosa), Switch de requerimiento de estibador de apoyo, Notas / Observaciones especiales (EPP, fajas de trincaje).",
      reglas: "Cliente, origen, destino y tipo de carga son campos de ingreso obligatorio; si el switch de estibador está activo, el sistema programa automáticamente la búsqueda en el módulo de coordinación.",
      detalles: "Genera un nuevo código único correlativo (e.g. S-104), inicializa el servicio en estado 'Registrado' y navega a la pantalla de Detalle de Servicio para su seguimiento."
    },
    roles: [
      "Operador de Tráfico",
      "Gestor de Flota",
      "Administrador del Sistema"
    ],
    dataUsage: [
      { key: "tb_servicio:codigo_servicio", tableName: "tb_servicio", tableLabel: "Servicios de Transporte", schema: "nucleo", attribute: "codigo_servicio", type: "VARCHAR(50)", isPrimary: false },
      { key: "tb_item_carga:tipo_carga", tableName: "tb_item_carga", tableLabel: "Items y Cargas", schema: "nucleo", attribute: "tipo_carga", type: "VARCHAR(100)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-04",
    projectId: "smatad",
    number: "4",
    title: "Detalle de Servicio",
    fullName: "4. Detalle de Servicio",
    module: "Operación & Tránsito en Ruta",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "detail",
    fields: {
      objetivo: "Proporcionar la ficha técnica, operativa y documental completa de un servicio determinado, facilitando el control de hitos y la navegación contextual.",
      contenido: "Cabecera con código de servicio, cliente y descripción de la carga (pallets y tonelaje); stepper interactivo de 5 etapas secuenciales (1. Asignación de Estibador, 2. Coordinación de Recojo, 3. Lectura de Guía OCR, 4. En Tránsito a Destino, 5. Verificación de Descarga); ficha técnica de la unidad asignada (tracto, placa, modelo, conductor y licencia); accesos directos a las pantallas de cada etapa; botón flotante de acceso directo al mapa de ruta.",
      reglas: "Cada hito refleja su estado dinámico (Completado, En Curso, Pendiente) con hora de ejecución registrada; al tocar cualquier hito se navega a la pantalla correspondiente.",
      detalles: "Basado en Mobile_SMATAD_Servicio_Detalle.md: incluye línea de conexión visual entre nodos del stepper y validación de hitos completados con badges verde #146C2E."
    },
    roles: [
      "Operador de Tráfico",
      "Conductor / Transportista",
      "Supervisor de Rampa"
    ],
    dataUsage: [
      { key: "tb_hito_servicio:estado_hito", tableName: "tb_hito_servicio", tableLabel: "Hitos y Stepper Operativo", schema: "nucleo", attribute: "estado_hito", type: "VARCHAR(50)", isPrimary: false },
      { key: "tb_asignacion_transporte:id_vehiculo", tableName: "tb_asignacion_transporte", tableLabel: "Asignación de Vehículos", schema: "nucleo", attribute: "id_vehiculo", type: "UUID", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-05",
    projectId: "smatad",
    number: "5",
    title: "Guías de Remisión",
    fullName: "5. Guías de Remisión",
    module: "Documentación & Validación OCR",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "list",
    fields: {
      objetivo: "Consultar, buscar, filtrar y auditar el estado administrativo y de validación de las Guías de Remisión Electrónicas (GRE) vinculadas a los despachos.",
      contenido: "Barra de búsqueda predictiva por número de guía o nombre de cliente; selector de filtros por estado (Todas, Validadas, Pendientes, Observadas). Tarjetas de guía con número correlativo (e.g. G-004-2026), código de servicio asociado, razón social del cliente, número de bultos/pallets, peso total de la carga (Kg), fecha de emisión y badge de estado con semaforización. Botón flotante inferior para escanear nueva guía.",
      reglas: "Las guías en estado 'Observada' alertan discrepancias de bultos o pesaje; las guías 'Pendientes' bloquean la liquidación del viaje hasta su validación OCR o manual.",
      detalles: "Sigue la estructura de Mobile_SMATAD_Guias_Remision.md con contenedor de búsqueda de 44px de alto y listado dinámico reactivo."
    },
    roles: [
      "Conductor / Transportista",
      "Operador de Tráfico",
      "Supervisor de Rampa"
    ],
    dataUsage: [
      { key: "tb_guia:numero_guia", tableName: "tb_guia", tableLabel: "Guías de Remisión GRE", schema: "nucleo", attribute: "numero_guia", type: "VARCHAR(50)", isPrimary: false },
      { key: "tb_guia_version:estado_validacion", tableName: "tb_guia_version", tableLabel: "Versiones de Guía", schema: "nucleo", attribute: "estado_validacion", type: "VARCHAR(50)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-06",
    projectId: "smatad",
    number: "6",
    title: "Leer Guía (OCR)",
    fullName: "6. Leer Guía (OCR)",
    module: "Documentación & Validación OCR",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "scan",
    fields: {
      objetivo: "Digitalizar guías de remisión impresas o electrónicas mediante visión artificial y OCR, cotejando la información instantáneamente contra SUNAT y la orden de carga.",
      contenido: "Visor simulador de cámara con marco de encuadre, documento guía mockup y línea láser animada de escaneo; panel de metadatos extraídos por OCR (Número de Guía, RUC Remitente, RUC Destinatario, Número de Bultos, Peso Total, Precinto de Seguridad registrado); barra de confianza algorítmica (99.4% de coincidencia); botones de acción 'Reintentar Captura' y 'Confirmar y Validar Guía'.",
      reglas: "Para la validación automática se exige un nivel de coincidencia de caracteres superior al 95%; si existen inconsistencias, se resalta el campo para verificación manual.",
      detalles: "Cambia el estado de la guía a 'Validada', vincula el precinto de seguridad al servicio activo y notifica al centro de control el despacho conforme."
    },
    roles: [
      "Conductor / Transportista",
      "Supervisor de Rampa"
    ],
    dataUsage: [
      { key: "tb_intento_ocr:nivel_confianza_pct", tableName: "tb_intento_ocr", tableLabel: "Intentos de OCR e IA", schema: "nucleo", attribute: "nivel_confianza_pct", type: "DECIMAL(5,2)", isPrimary: false },
      { key: "tb_guia_version:precinto_seguridad", tableName: "tb_guia_version", tableLabel: "Versiones de Guía", schema: "nucleo", attribute: "precinto_seguridad", type: "VARCHAR(100)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-07",
    projectId: "smatad",
    number: "7",
    title: "Tracking Dinámico",
    fullName: "7. Tracking Dinámico",
    module: "Operación & Tránsito en Ruta",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "map",
    fields: {
      objetivo: "Brindar seguimiento georreferenciado en tiempo real de la unidad de transporte pesada, mostrando la ruta de navegación, telemetría y datos del conductor.",
      contenido: "Lienzo cartográfico simulado con trazado de ruta de origen a destino; pin de origen (verde), pin de destino (rojo) y posición geolocalizada en movimiento de la unidad de transporte; tarjeta flotante de telemetría superior (Velocidad en km/h, Tiempo estimado de llegada - ETA en minutos, Distancia restante); ficha inferior del chofer asignado (nombre, ID, calificación por estrellas, botón de llamada directa); alerta de tráfico vial en ruta.",
      reglas: "La telemetría se actualiza según la señal GPS del dispositivo móvil del transportista; desviaciones imprevistas de ruta generan alertas automáticas.",
      detalles: "Basado en Mobile_SMATAD_Mapa.md: incluye cabecera con botón de estado ● EN VIVO y tarjetas flotantes semitransparentes con sombra suave."
    },
    roles: [
      "Operador de Tráfico",
      "Gestor de Flota",
      "Conductor / Transportista"
    ],
    dataUsage: [
      { key: "tb_punto_servicio:velocidad_kmh", tableName: "tb_punto_servicio", tableLabel: "Puntos GPS y Telemetría", schema: "nucleo", attribute: "velocidad_kmh", type: "DECIMAL(6,2)", isPrimary: false },
      { key: "tb_conductor:calificacion_promedio", tableName: "tb_conductor", tableLabel: "Conductores", schema: "nucleo", attribute: "calificacion_promedio", type: "DECIMAL(3,2)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-08",
    projectId: "smatad",
    number: "8",
    title: "Coordinación de Estibador",
    fullName: "8. Coordinación de Estibador",
    module: "Recursos, Coordinación & Capacidad",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "team",
    fields: {
      objetivo: "Evaluar, seleccionar y asignar personal de estiba y cuadrillas auxiliares para las maniobras de carga y descarga en almacenes o puntos de entrega.",
      contenido: "Resumen del requerimiento del servicio (código, almacén, tipo de carga y peso); listado de estibadores cercanos disponibles con tarjeta de detalle (nombre completo, calificación por estrellas ⭐, número de servicios completados, tiempo estimado de llegada ETA, distancia en km, tags de habilidades certificadas: Carga Pesada, Montacargas, EPP Completo, Inventario, teléfono); selector de selección de estibador; botón de acción 'Asignar Estibador al Servicio'.",
      reglas: "Solo se permite asignar estibadores con estado 'Disponible' y verificación de EPP vigente; el sistema prioriza por proximidad geográfica y calificación histórica (> 4.5).",
      detalles: "Genera una notificación push al estibador seleccionado con las coordenadas del almacén y actualiza el hito correspondiente en el detalle del servicio."
    },
    roles: [
      "Operador de Tráfico",
      "Supervisor de Rampa"
    ],
    dataUsage: [
      { key: "tb_requerimiento_estibador:cantidad_estibadores", tableName: "tb_requerimiento_estibador", tableLabel: "Requerimientos de Estiba", schema: "nucleo", attribute: "cantidad_estibadores", type: "INTEGER", isPrimary: false },
      { key: "tb_estibador:calificacion", tableName: "tb_estibador", tableLabel: "Personal de Estiba", schema: "nucleo", attribute: "calificacion", type: "DECIMAL(3,2)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-09",
    projectId: "smatad",
    number: "9",
    title: "Coordinación de Recojo en Rampa",
    fullName: "9. Coordinación de Recojo en Rampa",
    module: "Recursos, Coordinación & Capacidad",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "checklist",
    fields: {
      objetivo: "Controlar la llegada del camión a rampa, la inspección de precintos y el cumplimiento del protocolo de seguridad antes de autorizar el inicio del traslado.",
      contenido: "Tarjeta de estado del almacén (nombre de sede, dirección exacta, badge 'Rampa Libre'); datos de contacto del Jefe de Rampa / Supervisor con botón de llamada directa inmediata; checklist operativo interactivo de 4 puntos clave (1. Cotejo de guía física/digital, 2. Inspección de precinto de seguridad intacto, 3. Comprobante de pesaje en balanza de origen, 4. Firma de conformidad de despacho por el almacén); botón 'Confirmar Recojo y Salida'.",
      reglas: "El botón de confirmación de salida requiere la marcación obligatoria de todos los ítems críticos del checklist.",
      detalles: "Sella la hora exacta de salida de origen, inicia el contador de tiempo de viaje y habilita el tracking en vivo para el cliente receptor."
    },
    roles: [
      "Conductor / Transportista",
      "Supervisor de Rampa"
    ],
    dataUsage: [
      { key: "tb_acuerdo_recojo:rampa_asignada", tableName: "tb_acuerdo_recojo", tableLabel: "Acuerdos de Rampa y Recojo", schema: "nucleo", attribute: "rampa_asignada", type: "VARCHAR(50)", isPrimary: false },
      { key: "tb_medicion_proceso:inspeccion_precinto_ok", tableName: "tb_medicion_proceso", tableLabel: "Medición de Procesos y SLA", schema: "nucleo", attribute: "inspeccion_precinto_ok", type: "BOOLEAN", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-10",
    projectId: "smatad",
    number: "10",
    title: "Configuración de Agentes Autónomos",
    fullName: "10. Configuración de Agentes Autónomos",
    module: "Control Operativo, Tiempos & Agentes",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "settings",
    fields: {
      objetivo: "Parametrizar las reglas operativas, algoritmos de matching y límites de tolerancia que rigen el comportamiento de los agentes inteligentes de SMATAD.",
      contenido: "Switch de activación de Asignación Automática por Proximidad y Rating; selector de Radio Máximo de Búsqueda de recursos (3 km, 5 km, 10 km, 15 km); switch de Requerimiento de Validación Biométrica para conductores y estibadores; switch de Notificaciones Push de Alertas Críticas; selector de Tolerancia de Desvío de Tiempo SLA (10 min, 15 min, 30 min); botón 'Guardar Parámetros de Agentes'.",
      reglas: "Modificable exclusivamente por usuarios con rol de Administrador o Supervisor de Operaciones; los parámetros aplican en tiempo real al motor de eventos.",
      detalles: "Basado en Mobile_SMATAD_Conf_Agentes.md: cabecera secundaria #F9F9FF, tarjetas con switches Material 3, selectores de píldora interactivos y banner informativo."
    },
    roles: [
      "Administrador del Sistema",
      "Gestor de Flota"
    ],
    dataUsage: [
      { key: "tb_configuracion_agente:radio_maximo_km", tableName: "tb_configuracion_agente", tableLabel: "Configuración de Agentes MAS", schema: "nucleo", attribute: "radio_maximo_km", type: "DECIMAL(5,2)", isPrimary: false },
      { key: "tb_configuracion_agente:tolerancia_sla_min", tableName: "tb_configuracion_agente", tableLabel: "Configuración de Agentes MAS", schema: "nucleo", attribute: "tolerancia_sla_min", type: "INTEGER", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-11",
    projectId: "smatad",
    number: "11",
    title: "Historial de Agentes",
    fullName: "11. Historial de Agentes",
    module: "Control Operativo, Tiempos & Agentes",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "history",
    fields: {
      objetivo: "Auditar y consultar la bitácora cronológica inmutable de todas las acciones, alertas y decisiones ejecutadas por los agentes autónomos de la plataforma.",
      contenido: "Selector de filtros de auditoría por categoría de agente (Todos, Asignación, Tráfico, Documentación, Supervisor). Feed de tarjetas de logs con identificador único (L-101, L-102), nombre del agente responsable (e.g. Agente Asignador, Agente de Tráfico, Agente Documentador), acción ejecutada, descripción detallada del resultado algorítmico, hora exacta del registro y badge de categoría con código de color.",
      reglas: "Registro inmutable de solo lectura (read-only); no se permite modificación ni eliminación de registros; garantiza trazabilidad operativa ante reclamos de demoras.",
      detalles: "Cumple con la especificación Mobile_SMATAD_Hist_Agentes.md respetando tipografías Roboto/Inter y badges semánticos."
    },
    roles: [
      "Administrador del Sistema",
      "Operador de Tráfico",
      "Gestor de Flota"
    ],
    dataUsage: [
      { key: "tb_ejecucion_agente:resultado_algoritmico", tableName: "tb_ejecucion_agente", tableLabel: "Ejecuciones y Logs MAS", schema: "nucleo", attribute: "resultado_algoritmico", type: "TEXT", isPrimary: false },
      { key: "tb_auditoria:registro_inmutable", tableName: "tb_auditoria", tableLabel: "Auditoría del Sistema", schema: "nucleo", attribute: "registro_inmutable", type: "BOOLEAN", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-12",
    projectId: "smatad",
    number: "12",
    title: "Ver Disponibilidad y Capacidad",
    fullName: "12. Ver Disponibilidad y Capacidad",
    module: "Recursos, Coordinación & Capacidad",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "calendar",
    fields: {
      objetivo: "Visualizar, evaluar y proyectar la disponibilidad de recursos vehiculares, personal de estiba y ocupación de rampas en las sedes logísticas.",
      contenido: "Selector horizontal de fechas (Hoy, Mañana, Días posteriores); selector de turnos operativos (Mañana: 07:00-15:00, Tarde: 15:00-23:00, Noche: 23:00-07:00). Tarjeta de capacidad operativa consolidada (Camiones libres: 08, Estibadores activos: 14, Rampas operativas: 06); desglose por bases logísticas (Terminal Callao, Base Lurín, Almacén Huachipa) con barras visuales de ocupación porcentual; botón de acción para programar o reservar turno.",
      reglas: "Los datos reflejan la capacidad disponible neta deduciendo las unidades comprometidas en servicios en tránsito y las que están en mantenimiento.",
      detalles: "Corresponde a Mobile_SMATAD_Ver_Disponibilidad.md con selector de pestañas de fecha y tarjetas estadísticas con colores de acento #0058BE."
    },
    roles: [
      "Gestor de Flota",
      "Operador de Tráfico",
      "Administrador del Sistema"
    ],
    dataUsage: [
      { key: "tb_solicitudes_servicio:capacidad_camiones_disponibles", tableName: "tb_solicitudes_servicio", tableLabel: "Solicitudes y Capacidad", schema: "nucleo", attribute: "capacidad_camiones_disponibles", type: "INTEGER", isPrimary: false },
      { key: "tb_vehiculo:estado_disponibilidad", tableName: "tb_vehiculo", tableLabel: "Flota Vehicular", schema: "nucleo", attribute: "estado_disponibilidad", type: "VARCHAR(50)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-13",
    projectId: "smatad",
    number: "13",
    title: "GEC - Gestión de Eventos y Coordinación",
    fullName: "13. GEC - Gestión de Eventos y Coordinación",
    module: "Control Operativo, Tiempos & Agentes",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "alert",
    fields: {
      objetivo: "Centralizar, priorizar y gestionar la atención de incidencias operativas, contingencias en ruta, retrasos de tráfico y novedades documentales.",
      contenido: "Selector de filtros por tipología de evento (Todos, Alerta, Documental, Operativo); botón en cabecera para generación y exportación de reportes ejecutivos (📄). Tarjetas de contingencia con código único (EVT-501), título descriptivo, servicio afectado (S-002), badge de severidad (Alta #BA1A1A, Media #B36B00, Baja #146C2E), descripción de la contingencia, hora de detección y operador o conductor responsable asociado.",
      reglas: "Eventos de severidad 'Alta' activan alertas inmediatas en el Dashboard y requieren obligatoriamente una acción de mitigación documentada por el operador.",
      detalles: "Diseñado a partir de Mobile_SMATAD_GEC.md: permite una respuesta ágil ante cuellos de botella en la operación logística diaria."
    },
    roles: [
      "Operador de Tráfico",
      "Supervisor de Rampa",
      "Conductor / Transportista",
      "Administrador del Sistema"
    ],
    dataUsage: [
      { key: "tb_incidencia_servicio:severidad", tableName: "tb_incidencia_servicio", tableLabel: "Incidencias y Contingencias", schema: "nucleo", attribute: "severidad", type: "VARCHAR(30)", isPrimary: false },
      { key: "tb_observacion_servicio:accion_mitigacion", tableName: "tb_observacion_servicio", tableLabel: "Observaciones Operativas", schema: "nucleo", attribute: "accion_mitigacion", type: "TEXT", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-14",
    projectId: "smatad",
    number: "14",
    title: "TPA - Tiempos y Programación de Asignaciones",
    fullName: "14. TPA - Tiempos y Programación de Asignaciones",
    module: "Control Operativo, Tiempos & Agentes",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "truck",
    fields: {
      objetivo: "Controlar, programar y auditar la vinculación entre los servicios logísticos, las unidades motrices (tracto-camiones), remolques y conductores habilitados.",
      contenido: "Selector de filtros por estado de asignación (Todos, Activos, Completados); botón de acción para registrar una nueva asignación de unidad. Tarjetas de asignación con código (ASG-001), servicio vinculado, nombre del chofer, ID de transportista (TRANS-001), tracto y placa (e.g. Volvo FH 500 V4B-890), tipo de remolque (Remolque R-442, Furgón Frigorífico, Plataforma), ruta asignada, estado operativo y hora de despacho.",
      reglas: "Validación de no duplicidad: ningún conductor o tracto puede poseer dos asignaciones solapadas en la misma ventana horaria; se exige SOAT y revisión técnica vigentes.",
      detalles: "Basado en Mobile_SMATAD_TPA.md: interfaz estructurada para despacho de flota pesada intermodal."
    },
    roles: [
      "Gestor de Flota",
      "Operador de Tráfico"
    ],
    dataUsage: [
      { key: "tb_asignacion_transporte:codigo_asignacion", tableName: "tb_asignacion_transporte", tableLabel: "Asignación de Transporte", schema: "nucleo", attribute: "codigo_asignacion", type: "VARCHAR(50)", isPrimary: false },
      { key: "tb_vehiculo:placa", tableName: "tb_vehiculo", tableLabel: "Flota Vehicular", schema: "nucleo", attribute: "placa", type: "VARCHAR(20)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-15",
    projectId: "smatad",
    number: "15",
    title: "TPC - Tiempos y Programación de Coordinación",
    fullName: "15. TPC - Tiempos y Programación de Coordinación",
    module: "Control Operativo, Tiempos & Agentes",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "chat",
    fields: {
      objetivo: "Registrar y consolidar la bitácora de coordinaciones en ruta, acuerdos con terminales portuarios, ventanas de ingreso y solicitudes especiales de clientes.",
      contenido: "Botón en cabecera para agregar nueva coordinación (+ Nueva); listado cronológico de registros de coordinación (CRD-301). Tarjetas de coordinación detallando cliente, asunto operativo (e.g. Ventana de Ingreso en Terminal Portuario Balanza 2, Requerimiento de Cuadrilla de Apoyo, Cotejo de Precintos), notas de la coordinación, canal utilizado (WhatsApp Operaciones, Llamada Telefónica, App SMATAD), estado (Confirmada, En Gestión, Completada) y hora.",
      reglas: "Todo acuerdo que modifique el horario de entrega o los recursos asignados debe registrar el canal probatorio y la persona de contacto.",
      detalles: "Cumple con la especificación Mobile_SMATAD_TPC.md: garantiza respaldo documental frente a controversias por demoras en muelles y terminales."
    },
    roles: [
      "Operador de Tráfico",
      "Conductor / Transportista",
      "Supervisor de Rampa"
    ],
    dataUsage: [
      { key: "tb_acuerdo_recojo:canal_comunicacion", tableName: "tb_acuerdo_recojo", tableLabel: "Acuerdos y Coordinaciones", schema: "nucleo", attribute: "canal_comunicacion", type: "VARCHAR(50)", isPrimary: false },
      { key: "tb_medicion_proceso:tiempo_espera_rampa_min", tableName: "tb_medicion_proceso", tableLabel: "Medición de Procesos", schema: "nucleo", attribute: "tiempo_espera_rampa_min", type: "INTEGER", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-16",
    projectId: "smatad",
    number: "16",
    title: "TPV - Tiempos de Permanencia y Verificación en Rampa",
    fullName: "16. TPV - Tiempos de Permanencia y Verificación en Rampa",
    module: "Control Operativo, Tiempos & Agentes",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "timer",
    fields: {
      objetivo: "Medir con precisión los tiempos de permanencia de las unidades pesadas en rampa y balanza para auditar el cumplimiento del SLA pactado (< 60 minutos) y evitar costos de sobreestadía.",
      contenido: "Contador destacado de tiempo total transcurrido en rampa (e.g. 42 min) con badge de certificación de cumplimiento (✓ SLA < 60 min: CONFORME); identificación del servicio y almacén evaluado; desglose cronológico de las 4 etapas operativas de rampa: 1. Registro en Garita y Balanza, 2. Acople y Cuadre en Rampa, 3. Maniobra de Descarga (pallets), 4. Cotejo de Precinto y Guía Digital, cada una con su duración calculada y badge de estado (Conforme, En Proceso, Pendiente); botón de acción para finalizar servicio.",
      reglas: "Tiempos que superen los 60 minutos totales en rampa se marcan automáticamente en estado de penalidad o advertencia crítica.",
      detalles: "Basado en Mobile_SMATAD_TPV.md: proporciona la base objetiva para la liquidación de servicios y el pago justo a los transportistas."
    },
    roles: [
      "Supervisor de Rampa",
      "Conductor / Transportista",
      "Operador de Tráfico"
    ],
    dataUsage: [
      { key: "tb_medicion_proceso:tiempo_total_rampa_min", tableName: "tb_medicion_proceso", tableLabel: "Medición de Procesos", schema: "nucleo", attribute: "tiempo_total_rampa_min", type: "INTEGER", isPrimary: false },
      { key: "tb_medicion_proceso:cumplimiento_sla_bool", tableName: "tb_medicion_proceso", tableLabel: "Medición de Procesos", schema: "nucleo", attribute: "cumplimiento_sla_bool", type: "BOOLEAN", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-17",
    projectId: "smatad",
    number: "17",
    title: "Perfil de Usuario Autenticado",
    fullName: "17. Perfil de Usuario Autenticado",
    module: "Autenticación & Acceso",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "profile",
    fields: {
      objetivo: "Consultar la información y credenciales operativas del usuario con sesión activa, configurar la modalidad de presentación en cabecera y permitir el cierre de sesión seguro.",
      contenido: "Círculo de usuario en el extremo derecho de la cabecera superior con fotografía o iniciales (CM), punto verde de estado en turno activo (🟢); modal emergente interactivo con: nombre completo (Carlos Mendoza), rol (Conductor Certificado), correo (carlos.mendoza@transporte.pe), empresa (SMATAD Logística S.A.C.), selector de modo de cabecera (Foto vs Iniciales), detalles de licencia MTC (A-IIIc), unidad asignada (VOLVO FH-460) y botón de cierre de sesión.",
      reglas: "Accesible permanentemente desde todas las pantallas con cabecera; el alternador de modo conmuta de forma inmediata la apariencia del círculo en la barra superior.",
      detalles: "La opción de cierre de sesión invalida el token de sesión y redirige inmediatamente al usuario a la pantalla de Login."
    },
    roles: [
      "Conductor / Transportista",
      "Operador de Tráfico",
      "Supervisor de Rampa",
      "Gestor de Flota",
      "Administrador del Sistema"
    ],
    dataUsage: [
      { key: "tb_usuario:nombre_completo", tableName: "tb_usuario", tableLabel: "Usuarios y Credenciales", schema: "nucleo", attribute: "nombre_completo", type: "VARCHAR(255)", isPrimary: false },
      { key: "tb_conductor:licencia_mtc", tableName: "tb_conductor", tableLabel: "Conductores", schema: "nucleo", attribute: "licencia_mtc", type: "VARCHAR(50)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  },
  {
    id: "INT-SMATAD-18",
    projectId: "smatad",
    number: "18",
    title: "Catálogo del Prototipo",
    fullName: "18. Catálogo del Prototipo",
    module: "Operación & Tránsito en Ruta",
    status: "Aprobado por Cliente",
    platform: "Mobile (Android / iOS)",
    image: null,
    imagePlaceholder: "catalog",
    fields: {
      objetivo: "Servir como índice general de navegación y tablero de control interactivo para acceder con un solo toque a cualquiera de las 16 pantallas que componen el diseño de Figma para fines de evaluación, auditoría y control de calidad (QA).",
      contenido: "Tarjeta de cabecera con el total de pantallas homologadas; agrupación temática en 4 cuadrantes: 1. Operación y Tránsito en Ruta, 2. Documentación y Validación OCR, 3. Recursos, Coordinación y Capacidad, 4. Control Operativo, Tiempos y Agentes; listado de accesos rápidos con número, nombre, archivo Figma asociado y flecha de navegación directa.",
      reglas: "Accesible desde la pantalla de Login y desde la barra de navegación inferior (BottomNav); no impone restricciones de flujo secuencial obligatorio.",
      detalles: "Implementado en CatalogScreen.tsx: facilita las sesiones de revisión de diseño y validación con los stakeholders del proyecto."
    },
    roles: [
      "Administrador del Sistema",
      "Operador de Tráfico",
      "Supervisor de Rampa",
      "Conductor / Transportista"
    ],
    dataUsage: [
      { key: "tb_agente:tipo_agente", tableName: "tb_agente", tableLabel: "Agentes Autónomos MAS", schema: "nucleo", attribute: "tipo_agente", type: "VARCHAR(50)", isPrimary: false }
    ],
    hotspots: [],
    author: "SMATAD Architecture Team",
    reviewedBy: "PO / Operaciones",
    approvedAt: "2026-09-05",
    version: "v1.0"
  }
];
