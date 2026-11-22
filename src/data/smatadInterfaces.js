export const SMATAD_INTERFACES = [
  {
    "id": "INT-SMATAD-01",
    "projectId": "smatad",
    "number": "1",
    "title": "Login",
    "fullName": "1. Login",
    "module": "Autenticación & Acceso",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "login",
    "fields": {
      "objetivo": "Permitir la autenticación segura de usuarios (Administrador, Logista, Conductor y Estibador) con control de acceso por roles (RBAC).",
      "contenido": "Campos / Controles: Correo institucional, contraseña cifrada, botón de alternar visibilidad de contraseña (ojo), botones de acceso rápido demo por rol (Logista, Conductor, Estibador, Administrador) y enlace a recuperación.",
      "reglas": "Validación de formato de correo y clave obligatoria; asignación inmediata de token JWT y rol normalizado; navegación automática a la pantalla inicial correspondiente al perfil autenticado.",
      "detalles": "Implementado en `LoginScreen.tsx`: cabecera corporativa con isotipo de transporte #0058BE, inputs de 42px con borde #C2C6D6, botón primario y panel de pruebas rápidas integrado."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor",
      "Estibador"
    ],
    "dataUsage": [
      {
        "key": "tb_usuario:correo",
        "tableName": "tb_usuario",
        "tableLabel": "Usuarios y Credenciales",
        "schema": "nucleo",
        "attribute": "correo",
        "type": "VARCHAR(255)",
        "isPrimary": false
      },
      {
        "key": "tb_usuario:password_hash",
        "tableName": "tb_usuario",
        "tableLabel": "Usuarios y Credenciales",
        "schema": "nucleo",
        "attribute": "password_hash",
        "type": "VARCHAR(255)",
        "isPrimary": false
      },
      {
        "key": "tb_sesiones_usuario:token_sesion",
        "tableName": "tb_sesiones_usuario",
        "tableLabel": "Sesiones de Usuario",
        "schema": "nucleo",
        "attribute": "token_sesion",
        "type": "VARCHAR(500)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-101",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-02",
    "projectId": "smatad",
    "number": "2",
    "title": "Dashboard",
    "fullName": "2. Dashboard",
    "module": "Gestión & Monitoreo",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "dashboard",
    "fields": {
      "objetivo": "Proporcionar una visión ejecutiva del estado de la operación de transporte, métricas de rendimiento, servicios en curso y estado en vivo del Sistema Multi-Agente (MAS).",
      "contenido": "Tarjetas de resumen numérico (Servicios Activos, En Tránsito, Pendientes, Disponibilidad de Cuadrillas); panel de agentes en vivo con semaforización (Supervisor, Verificador, Asignador, Coordinador, Documentador); tarjeta destacada del servicio en curso con barra de progreso, origen/destino y ETA; botón de acción rápida \"+ Crear Nuevo Servicio\" y feed de alertas operativas recientes.",
      "reglas": "Actualización reactiva basada en suscripciones de datos; el toque en una alerta redirige a GEC o al detalle del servicio involucrado.",
      "detalles": "Ubicado en `DashboardScreen.tsx`: tarjetas modulares Material Design 3, radio 12px, acentos #2170E4 y badges dinámicos de estado."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_servicio:id",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_servicio:estado",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "estado",
        "type": "VARCHAR(50)",
        "isPrimary": false
      },
      {
        "key": "tb_evento_mas:severidad",
        "tableName": "tb_evento_mas",
        "tableLabel": "Eventos de Agentes MAS",
        "schema": "nucleo",
        "attribute": "severidad",
        "type": "VARCHAR(20)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-102",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-03",
    "projectId": "smatad",
    "number": "3",
    "title": "Servicios (Gestión y Solicitudes)",
    "fullName": "3. Servicios (Gestión y Solicitudes)",
    "module": "Gestión & Monitoreo",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "servicios",
    "fields": {
      "objetivo": "Centralizar la consulta, filtrado y administración de solicitudes de transporte y despachos activos en un solo tablero operativo.",
      "contenido": "Campos / Controles: Selector de pestañas duales (\"Solicitudes\" y \"Servicios Activos\"); chips de filtrado por estado (Todos, Pendientes, Con Cuadrilla, En Ruta, Completados); barra de búsqueda por cliente o código; botón para registrar nueva solicitud. | Listado de tarjetas de servicio mostrando código correlativo (e.g. S-044), cliente, origen/destino, fecha de despacho, estado operativo y cuadrilla asignada.",
      "reglas": "Al seleccionar una tarjeta se navega a la ficha técnica (`ServicioDetalleScreen`). Las solicitudes sin cuadrilla se resaltan con badge de alerta.",
      "detalles": "Implementado en `ServiciosScreen.tsx`: scroll fluido, filtrado instantáneo en memoria y badges semánticos normalizados."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_servicio:id",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_servicio:codigo_tracking",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "codigo_tracking",
        "type": "VARCHAR(50)",
        "isPrimary": false
      },
      {
        "key": "tb_solicitud_transporte:cliente_nombre",
        "tableName": "tb_solicitud_transporte",
        "tableLabel": "Solicitudes de Transporte",
        "schema": "nucleo",
        "attribute": "cliente_nombre",
        "type": "VARCHAR(255)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-103",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-04",
    "projectId": "smatad",
    "number": "4",
    "title": "Crear Servicio",
    "fullName": "4. Crear Servicio",
    "module": "Gestión & Monitoreo",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "crear-servicio",
    "fields": {
      "objetivo": "Registrar y programar un nuevo requerimiento de transporte de carga pesada, definiendo cliente, ruta, especificaciones de carga y necesidades de estiba.",
      "contenido": "Campos / Controles: Selector de Cliente / Razón Social, Dirección de Origen (con almacén o muelle), Dirección de Destino, Selector de Tipo de Carga (General, Palletizada, Refrigerada, Peligrosa), Peso en Kg / Toneladas, Cantidad de bultos, Switch de requerimiento de estibadores, Selector de cantidad de estibadores sugerida, Notas de seguridad (EPP, fajas de trincaje).",
      "reglas": "Cliente, origen, destino, tipo de carga y peso son de ingreso obligatorio; activar el requerimiento de estiba programa automáticamente al Agente Verificador y Asignador para conformar cuadrilla.",
      "detalles": "Efecto: Genera un nuevo código único (e.g. SRV000106), inserta los puntos de servicio y redirige a la pestaña de Solicitudes o al Detalle del Servicio. | Ubicado en `ServicioCrearScreen.tsx`: formulario reactivo con validaciones en tiempo real y sugerencia automática de recursos."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_solicitud_transporte:id",
        "tableName": "tb_solicitud_transporte",
        "tableLabel": "Solicitudes de Transporte",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_solicitud_transporte:peso_kg",
        "tableName": "tb_solicitud_transporte",
        "tableLabel": "Solicitudes de Transporte",
        "schema": "nucleo",
        "attribute": "peso_kg",
        "type": "DECIMAL(10,2)",
        "isPrimary": false
      },
      {
        "key": "tb_solicitud_transporte:cuadrilla_requerida",
        "tableName": "tb_solicitud_transporte",
        "tableLabel": "Solicitudes de Transporte",
        "schema": "nucleo",
        "attribute": "cuadrilla_requerida",
        "type": "INTEGER",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-104",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-05",
    "projectId": "smatad",
    "number": "5",
    "title": "Detalle de Servicio",
    "fullName": "5. Detalle de Servicio",
    "module": "Gestión & Monitoreo",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "detalle-servicio",
    "fields": {
      "objetivo": "Ofrecer la ficha técnica, operativa y documental exhaustiva de un servicio, controlando hitos de viaje, recursos asignados y alertas técnicas de flota.",
      "contenido": "Cabecera con código, cliente y tonelaje; stepper interactivo de 5 hitos (1. Asignación de Recursos, 2. Coordinación de Recojo en Rampa, 3. Validación de Guía OCR, 4. Tránsito a Destino, 5. Verificación de Entrega); tarjeta de unidad vehicular con tracto, carreta, conductor y botón de alerta técnica; cuadrilla de estibadores asignada; accesos directos a rampa, tracking y guía digital. | Alerta CITV: Icono de advertencia en la tarjeta de unidad: al pulsarlo abre un diálogo popup informando el estado y fecha de vencimiento de la Revisión Técnica (CITV) del camión asignado, alertando si está próxima a expirar o conforme.",
      "reglas": "Cada hito refleja su estado dinámico con hora de sellado; tocar un hito conduce a su pantalla operativa correspondiente.",
      "detalles": "Implementado en `ServicioDetalleScreen.tsx`: línea de tiempo vertical de 62px por tarjeta de nodo, conectores visuales y popup informativo de flota."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor"
    ],
    "dataUsage": [
      {
        "key": "tb_servicio:id",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_vehiculo:placa_tracto",
        "tableName": "tb_vehiculo",
        "tableLabel": "Flota Vehicular Pesada",
        "schema": "nucleo",
        "attribute": "placa_tracto",
        "type": "VARCHAR(15)",
        "isPrimary": false
      },
      {
        "key": "tb_persona:nombre",
        "tableName": "tb_persona",
        "tableLabel": "Padrón de Personas",
        "schema": "nucleo",
        "attribute": "nombre",
        "type": "VARCHAR(255)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-105",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-06",
    "projectId": "smatad",
    "number": "6",
    "title": "Personal Operativo",
    "fullName": "6. Personal Operativo",
    "module": "Recursos, Coordinación & Capacidad",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "personal",
    "fields": {
      "objetivo": "Consultar, buscar y supervisar la nómina de conductores y estibadores habilitados para la operación de transporte y estiba.",
      "contenido": "Campos / Controles: Selector de categoría (\"Conductores\" vs \"Estibadores\"), buscador por nombre, DNI o código externo, filtro por estado (Disponibles, Asignados, En Descanso). | Tarjetas de personal con fotografía/avatar, nombre completo, rol, categoría de licencia MTC o habilidades certificadas, calificación por estrellas ⭐, servicios completados y botón de contacto telefónico directo.",
      "reglas": "Visualización en tiempo real de la disponibilidad según turnos activos; permite abrir la ficha individual del operador.",
      "detalles": "Ubicado en `PersonalScreen.tsx`: interfaz responsiva optimizada para gestión rápida de cuadrillas y tripulaciones."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_conductor:id",
        "tableName": "tb_conductor",
        "tableLabel": "Conductores Certificados",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_estibador:id",
        "tableName": "tb_estibador",
        "tableLabel": "Personal de Estiba",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_persona:telefono",
        "tableName": "tb_persona",
        "tableLabel": "Padrón de Personas",
        "schema": "nucleo",
        "attribute": "telefono",
        "type": "VARCHAR(20)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-106",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-07",
    "projectId": "smatad",
    "number": "7",
    "title": "Guías de Remisión",
    "fullName": "7. Guías de Remisión",
    "module": "Documentación & Validación OCR",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "guias-remision",
    "fields": {
      "objetivo": "Administrar, buscar y auditar el estado administrativo y de validación de las Guías de Remisión Electrónicas (GRE - Remitente y Transportista).",
      "contenido": "Campos / Controles: Barra de búsqueda predictiva por número de guía o cliente; selector de filtros por estado (Todas, Validadas, Pendientes, Observadas); botón flotante para capturar nueva guía (OCR). | Listado de tarjetas de guía con número correlativo (e.g. GRT-001-000259), servicio asociado, cliente remitente/destinatario, bultos, peso neto, fecha de emisión y badge de estado.",
      "reglas": "Las guías \"Observadas\" destacan discrepancias de pesaje o bultos; guías \"Pendientes\" requieren validación OCR para permitir el cierre del despacho.",
      "detalles": "Implementado en `GuiasRemisionScreen.tsx`: contenedor de búsqueda de 44px, navegación directa a `GuiaDetalle` o `RevisarOCR`."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor"
    ],
    "dataUsage": [
      {
        "key": "tb_guia_remision:id",
        "tableName": "tb_guia_remision",
        "tableLabel": "Guías de Remisión Electrónicas",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_guia_remision:numero_guia",
        "tableName": "tb_guia_remision",
        "tableLabel": "Guías de Remisión Electrónicas",
        "schema": "nucleo",
        "attribute": "numero_guia",
        "type": "VARCHAR(50)",
        "isPrimary": false
      },
      {
        "key": "tb_guia_remision:estado_validacion",
        "tableName": "tb_guia_remision",
        "tableLabel": "Guías de Remisión Electrónicas",
        "schema": "nucleo",
        "attribute": "estado_validacion",
        "type": "VARCHAR(30)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-107",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-08",
    "projectId": "smatad",
    "number": "8",
    "title": "Leer Guía (Captura OCR)",
    "fullName": "8. Leer Guía (Captura OCR)",
    "module": "Documentación & Validación OCR",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "leer-guia",
    "fields": {
      "objetivo": "Capturar o cargar imágenes de guías de remisión impresas o documentos PDF mediante la cámara del dispositivo para su extracción de datos por visión artificial.",
      "contenido": "Campos / Controles: Visor de cámara en vivo con marco delimitador de encuadre, láser animado de escaneo, selector de encendido de flash/linterna, botón para subir foto desde galería y botón de disparo de captura.",
      "reglas": "Al capturar, la imagen se envía al servicio de visión artificial del Agente Documentador; redirige a la pantalla de revisión de OCR con los datos extraídos.",
      "detalles": "Efecto: Genera un intento de OCR en el sistema y almacena la evidencia visual para respaldo documental ante SUNAT. | Ubicado en `LeerGuiaScreen.tsx`: retroalimentación táctil de escaneo y previsualización de imagen capturada."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor"
    ],
    "dataUsage": [
      {
        "key": "tb_intento_ocr:id",
        "tableName": "tb_intento_ocr",
        "tableLabel": "Intentos de Procesamiento OCR",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_archivo_documento:ruta_storage",
        "tableName": "tb_archivo_documento",
        "tableLabel": "Archivos y Documentos",
        "schema": "nucleo",
        "attribute": "ruta_storage",
        "type": "TEXT",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-108",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-09",
    "projectId": "smatad",
    "number": "9",
    "title": "Revisar OCR",
    "fullName": "9. Revisar OCR",
    "module": "Documentación & Validación OCR",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "revisar-ocr",
    "fields": {
      "objetivo": "Cotejar y validar los metadatos extraídos automáticamente por el motor OCR frente a la imagen del documento físico y la orden de carga.",
      "contenido": "Campos / Controles: Visualizador interactivo de la imagen escaneada; formulario de campos extraídos (Número de Guía, RUC Emisor, RUC Destinatario, Descripción de Carga, Peso Total Kg, Número de Bultos, Precinto de Seguridad); barra de confianza algorítmica (ej. 98.7%); botones \"Reintentar Escaneo\" y \"Aprobar y Confirmar Guía\".",
      "reglas": "Campos con nivel de confianza menor al 90% se marcan en amarillo para confirmación manual obligatoria; permite edición manual si existió error tipográfico en la guía física.",
      "detalles": "Efecto: Actualiza la guía a estado \"Validada\", vincula el precinto y notifica al centro de control el despacho conforme. | Implementado en `RevisarOCRScreen.tsx`: vista de verificación asistida alineada al indicador CGRTEC de la investigación."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor"
    ],
    "dataUsage": [
      {
        "key": "tb_intento_ocr:nivel_confianza",
        "tableName": "tb_intento_ocr",
        "tableLabel": "Intentos de Procesamiento OCR",
        "schema": "nucleo",
        "attribute": "nivel_confianza",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      },
      {
        "key": "tb_guia_remision:peso_bruto_kg",
        "tableName": "tb_guia_remision",
        "tableLabel": "Guías de Remisión Electrónicas",
        "schema": "nucleo",
        "attribute": "peso_bruto_kg",
        "type": "DECIMAL(10,2)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-109",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-10",
    "projectId": "smatad",
    "number": "10",
    "title": "Detalle de Guía",
    "fullName": "10. Detalle de Guía",
    "module": "Documentación & Validación OCR",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "detalle-guia",
    "fields": {
      "objetivo": "Presentar la versión oficial, inmutable y legalmente formalizada de una Guía de Remisión Electrónica vinculada a un servicio.",
      "contenido": "Cabecera con número de serie oficial (e.g. T001-000142), emisor, destinatario, dirección de punto de partida y llegada; tabla de ítems de carga transportada con cantidades y pesos; datos del transportista y unidad tracto/carreta; hash criptográfico SHA-256 de verificación; botón de descarga/compartir documento.",
      "reglas": "Vista de solo lectura para guías validadas; garantiza inmutabilidad documental para auditorías tributarias y de transporte.",
      "detalles": "Ubicado en `GuiaDetalleScreen.tsx`: formato de comprobante electrónico estructurado con soporte de impresión y exportación."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor"
    ],
    "dataUsage": [
      {
        "key": "tb_guia_remision:hash_sha256",
        "tableName": "tb_guia_remision",
        "tableLabel": "Guías de Remisión Electrónicas",
        "schema": "nucleo",
        "attribute": "hash_sha256",
        "type": "VARCHAR(64)",
        "isPrimary": false
      },
      {
        "key": "tb_guia_remision:precinto_seguridad",
        "tableName": "tb_guia_remision",
        "tableLabel": "Guías de Remisión Electrónicas",
        "schema": "nucleo",
        "attribute": "precinto_seguridad",
        "type": "VARCHAR(50)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-110",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-11",
    "projectId": "smatad",
    "number": "11",
    "title": "Auditoría CGRTEC",
    "fullName": "11. Auditoría CGRTEC",
    "module": "Documentación & Validación OCR",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "auditoria-cgrtec",
    "fields": {
      "objetivo": "Auditar y evaluar el indicador de investigación CGRTEC (Calidad de Guías de Remisión Electrónicas Completas y Correctas), detectando desvíos documentales.",
      "contenido": "Tarjeta de porcentaje de calidad global (e.g. 96.4% de conformidad documental); desglose de motivos de observación (errores de pesaje en balanza, omisión de precinto, inconsistencia de bultos); listado de guías auditadas con semáforo de conformidad.",
      "reglas": "Procesa automáticamente los intentos de OCR y cotejos manuales para clasificar cada documento como Conforme o Con Discrepancia.",
      "detalles": "Ubicado en `DetalleGuiasCGRTECScreen.tsx`: métricas estadísticas clave para la validación de la hipótesis de investigación."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_indicador_desempeno:nombre_kpi",
        "tableName": "tb_indicador_desempeno",
        "tableLabel": "Indicadores de Desempeño",
        "schema": "nucleo",
        "attribute": "nombre_kpi",
        "type": "VARCHAR(50)",
        "isPrimary": false
      },
      {
        "key": "tb_indicador_desempeno:valor_porcentaje",
        "tableName": "tb_indicador_desempeno",
        "tableLabel": "Indicadores de Desempeño",
        "schema": "nucleo",
        "attribute": "valor_porcentaje",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-111",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-12",
    "projectId": "smatad",
    "number": "12",
    "title": "Mapa de Flota",
    "fullName": "12. Mapa de Flota",
    "module": "Operación & Tránsito en Ruta",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "mapa-flota",
    "fields": {
      "objetivo": "Proporcionar supervisión cartográfica global e instantánea de la ubicación y estado operativo de todas las unidades pesadas de la empresa.",
      "contenido": "Campos / Controles: Lienzo cartográfico interactivo (vectorial/satelital) con pines de unidades diferenciados por estado (Verde: En Ruta, Azul: En Rampa/Cargando, Gris: Disponible en Base, Naranja: En Mantenimiento); barra de búsqueda de unidad por placa; filtros por zona de cobertura. | Al tocar un pin de camión se despliega una tarjeta emergente con placa, conductor al volante, servicio asignado, velocidad actual y botón de seguimiento en vivo.",
      "reglas": "Consumo eficiente de geolocalización; refresco automático de coordenadas satelitales.",
      "detalles": "Implementado en `MapaFlotaScreen.tsx`: controles de zoom, botón de recentrado y panel inferior deslizable con listado de unidades."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_vehiculo:placa_tracto",
        "tableName": "tb_vehiculo",
        "tableLabel": "Flota Vehicular Pesada",
        "schema": "nucleo",
        "attribute": "placa_tracto",
        "type": "VARCHAR(15)",
        "isPrimary": false
      },
      {
        "key": "tb_vehiculo:estado_operativo",
        "tableName": "tb_vehiculo",
        "tableLabel": "Flota Vehicular Pesada",
        "schema": "nucleo",
        "attribute": "estado_operativo",
        "type": "VARCHAR(50)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-112",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-13",
    "projectId": "smatad",
    "number": "13",
    "title": "Tracking Dinámico en Ruta",
    "fullName": "13. Tracking Dinámico en Ruta",
    "module": "Operación & Tránsito en Ruta",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "tracking",
    "fields": {
      "objetivo": "Brindar seguimiento georreferenciado punto a punto del camión en tránsito activo entre el origen y el destino del servicio.",
      "contenido": "Trazado de ruta proyectada en mapa; pin de origen (verde), pin de destino (rojo) e icono del camión animado según posición actual; panel superior de telemetría en tiempo real (Velocidad en km/h, Distancia Restante, ETA dinámico en minutos); tarjeta flotante inferior del conductor con nombre, contacto telefónico directo y reporte de tráfico vial.",
      "reglas": "Alertas automáticas ante detenciones imprevistas no programadas o desvíos de ruta mayores a 500 metros.",
      "detalles": "Ubicado en `MapaTrackingScreen.tsx`: cabecera con badge pulsante \"● EN VIVO\" y enlace rápido a la ficha del servicio."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor"
    ],
    "dataUsage": [
      {
        "key": "tb_servicio:id",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_servicio:velocidad_kmh",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "velocidad_kmh",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      },
      {
        "key": "tb_servicio:eta_minutos",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "eta_minutos",
        "type": "INTEGER",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-113",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-14",
    "projectId": "smatad",
    "number": "14",
    "title": "Coordinación de Estibador",
    "fullName": "14. Coordinación de Estibador",
    "module": "Recursos, Coordinación & Capacidad",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "coord-estibador",
    "fields": {
      "objetivo": "Permitir al usuario con rol Logista evaluar, seleccionar y confirmar la asignación de personal de estiba para las maniobras de carga o descarga.",
      "contenido": "Resumen del requerimiento (código de servicio, almacén, tipo de mercancía y tonelaje); listado jerarquizado de candidatos recomendados por el Agente Asignador con scoring algorítmico; tarjeta de estibador con calificación ⭐, distancia al almacén (km), ETA, habilidades certificadas (Carga Pesada, Montacargas, Trincaje); selector de candidatos; botón \"Confirmar Asignación de Cuadrilla\".",
      "reglas": "Solo se permite seleccionar estibadores en estado \"Disponible\"; el sistema prioriza por compatibilidad de habilidad requerida y cercanía geográfica.",
      "detalles": "Efecto: Genera la asignación en el sistema, dispara notificación push al estibador y actualiza el hito en el servicio. | Implementado en `CoordEstibadorScreen.tsx`: tarjetas con bordes destacados para el candidato con mejor scoring algorítmico."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_estibador:id",
        "tableName": "tb_estibador",
        "tableLabel": "Personal de Estiba",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_asignacion_cuadrilla:servicio_id",
        "tableName": "tb_asignacion_cuadrilla",
        "tableLabel": "Asignaciones de Cuadrilla",
        "schema": "nucleo",
        "attribute": "servicio_id",
        "type": "UUID",
        "isPrimary": false
      },
      {
        "key": "tb_asignacion_cuadrilla:score_matching",
        "tableName": "tb_asignacion_cuadrilla",
        "tableLabel": "Asignaciones de Cuadrilla",
        "schema": "nucleo",
        "attribute": "score_matching",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-114",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-15",
    "projectId": "smatad",
    "number": "15",
    "title": "Asistente de Cuadrillas (Estiba Wizard)",
    "fullName": "15. Asistente de Cuadrillas (Estiba Wizard)",
    "module": "Recursos, Coordinación & Capacidad",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "estiba-wizard",
    "fields": {
      "objetivo": "Guiar al usuario con rol Logista paso a paso en la conformación de cuadrillas complejas para maniobras de alto tonelaje o condiciones especiales.",
      "contenido": "Campos / Controles: Stepper guiado en 3 pasos: 1. Definición de volumen y tipo de embalaje (sacos, pallets, bobinas, granel), 2. Selección de equipamiento requerido (fajas, carretillas, montacargas, EPP específico), 3. Elección y confirmación de miembros de la cuadrilla.",
      "reglas": "Calcula automáticamente la cantidad mínima de estibadores requerida por normativa de ergonomía y seguridad en el trabajo.",
      "detalles": "Efecto: Crea un grupo de asignación vinculado al servicio con un líder de cuadrilla designado. | Ubicado en `EstibaWizardScreen.tsx`: flujo por etapas con validación progresiva y resumen previo a confirmación."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_requerimiento_habilidad:tipo_carga",
        "tableName": "tb_requerimiento_habilidad",
        "tableLabel": "Requerimientos y Habilidades",
        "schema": "nucleo",
        "attribute": "tipo_carga",
        "type": "VARCHAR(50)",
        "isPrimary": false
      },
      {
        "key": "tb_asignacion_cuadrilla:cantidad_estibadores",
        "tableName": "tb_asignacion_cuadrilla",
        "tableLabel": "Asignaciones de Cuadrilla",
        "schema": "nucleo",
        "attribute": "cantidad_estibadores",
        "type": "INTEGER",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-115",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-16",
    "projectId": "smatad",
    "number": "16",
    "title": "Gestión de Estibadores",
    "fullName": "16. Gestión de Estibadores",
    "module": "Recursos, Coordinación & Capacidad",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "gestion-estibadores",
    "fields": {
      "objetivo": "Supervisar la operatividad del personal de estiba, controlar asistencias, gestionar relevos de emergencia y registrar motivos de reemplazo.",
      "contenido": "Campos / Controles: Filtros de visualización por turno y sede logística; buscador por nombre; modal de asignación de reemplazo con selector de motivo. | Tarjetas de estibadores en servicio activo; botón de acción para solicitar reemplazo en caso de inasistencia, lesión o retraso; registro de motivo con lenguaje operativo natural (e.g. \"Problemas de salud repentinos\", \"Retraso en transporte público\", \"Cruce de turno extraordinario\").",
      "reglas": "Cada reemplazo registra fecha/hora exacta, usuario responsable y motivo natural para auditoría sin dejar vacíos operacionales.",
      "detalles": "Implementado en `GestionEstibadoresScreen.tsx`: panel reactivo para soporte continuo al personal con rol Logista."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_estibador:estado_disponibilidad",
        "tableName": "tb_estibador",
        "tableLabel": "Personal de Estiba",
        "schema": "nucleo",
        "attribute": "estado_disponibilidad",
        "type": "VARCHAR(30)",
        "isPrimary": false
      },
      {
        "key": "tb_estibador:sctr_vigente",
        "tableName": "tb_estibador",
        "tableLabel": "Personal de Estiba",
        "schema": "nucleo",
        "attribute": "sctr_vigente",
        "type": "BOOLEAN",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-116",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-17",
    "projectId": "smatad",
    "number": "17",
    "title": "Coordinación de Estiba (Vista Estibador)",
    "fullName": "17. Coordinación de Estiba (Vista Estibador)",
    "module": "Recursos, Coordinación & Capacidad",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "coordinacion-estiba",
    "fields": {
      "objetivo": "Servir como interfaz móvil principal para el personal de estiba, permitiendo aceptar servicios asignados y reportar su desplazamiento a planta.",
      "contenido": "Tarjeta del servicio asignado con hora de citación, nombre de almacén y dirección exacta; tipo de carga a manipular y cantidad de bultos; lista de compañeros de cuadrilla asignados; botón de acción \"Confirmar Asistencia\" y botón \"Llegué al Almacén\".",
      "reglas": "Al presionar \"Llegué al Almacén\", se registra la marca temporal de presencia y se notifica al conductor y al logista encargado de rampa.",
      "detalles": "Ubicado en `CoordinacionEstibaScreen.tsx`: tipografía grande de alta legibilidad, botones táctiles de 48px y soporte para uso en exteriores."
    },
    "roles": [
      "Estibador"
    ],
    "dataUsage": [
      {
        "key": "tb_asignacion_cuadrilla:estibador_id",
        "tableName": "tb_asignacion_cuadrilla",
        "tableLabel": "Asignaciones de Cuadrilla",
        "schema": "nucleo",
        "attribute": "estibador_id",
        "type": "UUID",
        "isPrimary": false
      },
      {
        "key": "tb_asignacion_cuadrilla:asistencia_confirmada",
        "tableName": "tb_asignacion_cuadrilla",
        "tableLabel": "Asignaciones de Cuadrilla",
        "schema": "nucleo",
        "attribute": "asistencia_confirmada",
        "type": "BOOLEAN",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-117",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-18",
    "projectId": "smatad",
    "number": "18",
    "title": "Perfil de Estibador",
    "fullName": "18. Perfil de Estibador",
    "module": "Recursos, Coordinación & Capacidad",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "perfil-estibador",
    "fields": {
      "objetivo": "Proveer al estibador una credencial digital donde consultar su historial de servicios, habilidades homologadas y gestionar su disponibilidad.",
      "contenido": "Fotografía/avatar, nombre completo, DNI y código externo de operario; switch toggle para marcarse como \"Disponible para Servicios\" o \"En Descanso\"; panel de habilidades homologadas con badges (Carga Pesada, Montacargas, Trincaje Seguro); contador de servicios realizados este mes y calificación media.",
      "reglas": "Apagar el switch de disponibilidad excluye al estibador del algoritmo de matching automático del Agente Asignador.",
      "detalles": "Implementado en `PerfilEstibadorScreen.tsx`: diseño limpio y adaptado al uso directo por el personal operativo en campo."
    },
    "roles": [
      "Estibador",
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_estibador:id",
        "tableName": "tb_estibador",
        "tableLabel": "Personal de Estiba",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_estibador:calificacion",
        "tableName": "tb_estibador",
        "tableLabel": "Personal de Estiba",
        "schema": "nucleo",
        "attribute": "calificacion",
        "type": "DECIMAL(3,2)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-118",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-19",
    "projectId": "smatad",
    "number": "19",
    "title": "Coordinación de Recojo en Rampa",
    "fullName": "19. Coordinación de Recojo en Rampa",
    "module": "Operación & Tránsito en Ruta",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "coord-recojo",
    "fields": {
      "objetivo": "Coordinar y autorizar la operación de ingreso a rampa de almacén, acople de unidad y despacho seguro desde la perspectiva del rol Logista (gestión de rampa y operaciones).",
      "contenido": "Ficha del almacén y número de muelle/rampa asignado; datos de contacto del Jefe de Patio / Rampa con botón de llamada inmediata; checklist de supervisión de 4 puntos (1. Verificación de llegada de unidad y chofer, 2. Cuadrilla completa en sitio, 3. Inspección de precintos y fajas, 4. Acta de pesaje en balanza conforme); botón \"Autorizar Despacho y Salida\".",
      "reglas": "La confirmación requiere la marcación conforme de todos los puntos críticos del checklist.",
      "detalles": "Efecto: Sella el hito de fin de recojo, registra el inicio del tránsito del camión y activa el seguimiento GPS. | Ubicado en `CoordRecojoScreen.tsx`: diseño enfocado en la reducción del tiempo de permanencia en rampa (TPV)."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_hito_rampa:id",
        "tableName": "tb_hito_rampa",
        "tableLabel": "Hitos Operativos de Rampa",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_hito_rampa:muelle_numero",
        "tableName": "tb_hito_rampa",
        "tableLabel": "Hitos Operativos de Rampa",
        "schema": "nucleo",
        "attribute": "muelle_numero",
        "type": "VARCHAR(20)",
        "isPrimary": false
      },
      {
        "key": "tb_acuerdo_recojo:autorizado",
        "tableName": "tb_acuerdo_recojo",
        "tableLabel": "Acuerdos de Recojo",
        "schema": "nucleo",
        "attribute": "autorizado",
        "type": "BOOLEAN",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-119",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-20",
    "projectId": "smatad",
    "number": "20",
    "title": "Operación en Rampa / Recojo",
    "fullName": "20. Operación en Rampa / Recojo",
    "module": "Operación & Tránsito en Ruta",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "recojo-planta",
    "fields": {
      "objetivo": "Proporcionar al conductor y a la cuadrilla de estiba una lista de verificación táctil en rampa para confirmar el carguío conforme y reportar salida.",
      "contenido": "Identificación de la rampa de carga; botón para registrar hora exacta de acople en muelle; checklist simplificado de estiba (Carga debidamente asegurada, Precinto de seguridad colocado y verificado, Guía de remisión física recibida); botón de confirmación de fin de maniobra.",
      "reglas": "Adapta su vista según el rol autenticado (Conductor o Estibador); sincroniza la finalización de maniobra con el servidor central.",
      "detalles": "Implementado en `RecojoScreen.tsx`: interfaz de un solo toque con retroalimentación visual clara para trabajo en planta."
    },
    "roles": [
      "Conductor",
      "Estibador"
    ],
    "dataUsage": [
      {
        "key": "tb_hito_rampa:servicio_id",
        "tableName": "tb_hito_rampa",
        "tableLabel": "Hitos Operativos de Rampa",
        "schema": "nucleo",
        "attribute": "servicio_id",
        "type": "UUID",
        "isPrimary": false
      },
      {
        "key": "tb_hito_rampa:hora_acople",
        "tableName": "tb_hito_rampa",
        "tableLabel": "Hitos Operativos de Rampa",
        "schema": "nucleo",
        "attribute": "hora_acople",
        "type": "TIMESTAMP",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-120",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-21",
    "projectId": "smatad",
    "number": "21",
    "title": "Historial del Transportista",
    "fullName": "21. Historial del Transportista",
    "module": "Operación & Tránsito en Ruta",
    "status": "Aprobado por Cliente",
    "platform": "Mobile (Android / iOS)",
    "image": null,
    "imagePlaceholder": "historial-transportista",
    "fields": {
      "objetivo": "Servir como tablero móvil central para el usuario con rol Conductor, reuniendo su programación diaria de viajes, accesos rápidos y estados de ruta.",
      "contenido": "Tarjeta del viaje asignado hoy (origen, destino, muelle, tipo de carga); accesos rápidos directos a: \"Ver Rampa de Recojo\", \"Guía de Remisión Digital\", \"Mapa de Navegación\"; historial cronológico de viajes completados con fecha, kilometraje y conformidad.",
      "reglas": "Al pulsar en el viaje activo se navega de inmediato a la etapa operativa en curso (Rampa, Guía o Tracking).",
      "detalles": "Ubicado en `HistorialTransportistaScreen.tsx`: optimizado para uso rápido por el chofer con navegación sin fricción."
    },
    "roles": [
      "Conductor"
    ],
    "dataUsage": [
      {
        "key": "tb_servicio:id",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_conductor:id",
        "tableName": "tb_conductor",
        "tableLabel": "Conductores Certificados",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      }
    ],
    "linkedStory": "US-121",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-22",
    "projectId": "smatad",
    "number": "22",
    "title": "Configuración de Agentes Autónomos",
    "fullName": "22. Configuración de Agentes Autónomos",
    "module": "Control Operativo, Tiempos & Agentes",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "conf-agentes",
    "fields": {
      "objetivo": "Parametrizar y gobernar las políticas operativas, radios geográficos de búsqueda y reglas de intervención del Sistema Multi-Agente (MAS).",
      "contenido": "Campos / Controles: Switch de activación de Asignación Automática; selector de Radio Máximo de Cobertura (3 km, 5 km, 10 km, 15 km); switch de Modo Human-in-the-Loop (HITL) para supervisión de asignaciones de cuadrilla; selector de Tolerancia de SLA de Rampa (10 min, 15 min, 30 min); umbral de confianza de visión artificial OCR; botón \"Guardar Parámetros de Agentes\".",
      "reglas": "Exclusivo para usuarios con rol de Administrador o Logista; los cambios impactan inmediatamente en las decisiones de los agentes.",
      "detalles": "Implementado en `ConfAgentesScreen.tsx`: componentes switch Material 3 y tarjetas de configuración semántica."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_configuracion_mas:modo_hitl",
        "tableName": "tb_configuracion_mas",
        "tableLabel": "Configuración del MAS",
        "schema": "nucleo",
        "attribute": "modo_hitl",
        "type": "BOOLEAN",
        "isPrimary": false
      },
      {
        "key": "tb_configuracion_mas:radio_max_km",
        "tableName": "tb_configuracion_mas",
        "tableLabel": "Configuración del MAS",
        "schema": "nucleo",
        "attribute": "radio_max_km",
        "type": "INTEGER",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-122",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-23",
    "projectId": "smatad",
    "number": "23",
    "title": "Historial de Agentes",
    "fullName": "23. Historial de Agentes",
    "module": "Control Operativo, Tiempos & Agentes",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "hist-agentes",
    "fields": {
      "objetivo": "Auditar la bitácora inmutable de eventos, recomendaciones, validaciones y alertas emitidas de manera autónoma por los agentes IA de SMATAD.",
      "contenido": "Campos / Controles: Selector de filtros por categoría de agente (Todos, Supervisor, Verificador, Asignador, Coordinador, Documentador); buscador por código de evento o servicio. | Feed cronológico de tarjetas de ejecución (código de log, nombre del agente, acción realizada, justificación algorítmica, timestamp exacto y badge de severidad).",
      "reglas": "Registro inmutable de solo lectura (read-only); garantiza explicabilidad y transparencia algorítmica en cada decisión del sistema.",
      "detalles": "Ubicado en `HistAgentesScreen.tsx`: diseño estructurado para auditorías operativas y trazabilidad de gobernanza IA."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_evento_mas:id",
        "tableName": "tb_evento_mas",
        "tableLabel": "Eventos de Agentes MAS",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_evento_mas:agente_nombre",
        "tableName": "tb_evento_mas",
        "tableLabel": "Eventos de Agentes MAS",
        "schema": "nucleo",
        "attribute": "agente_nombre",
        "type": "VARCHAR(50)",
        "isPrimary": false
      },
      {
        "key": "tb_evento_mas:accion",
        "tableName": "tb_evento_mas",
        "tableLabel": "Eventos de Agentes MAS",
        "schema": "nucleo",
        "attribute": "accion",
        "type": "TEXT",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-123",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-24",
    "projectId": "smatad",
    "number": "24",
    "title": "Registro de Procesos y Acciones",
    "fullName": "24. Registro de Procesos y Acciones",
    "module": "Control Operativo, Tiempos & Agentes",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "registro-procesos",
    "fields": {
      "objetivo": "Brindar analítica detallada sobre el rendimiento computacional de los agentes, tiempos de inferencia y tasa de éxito en resoluciones operativas.",
      "contenido": "Pestañas de análisis por proceso (Disponibilidad, Asignación, Coordinación, Documentación); métricas de tiempo medio de respuesta en milisegundos; tasa de acuerdos sin intervención humana (%); detalle de excepciones controladas.",
      "reglas": "Procesa los registros de eventos de los agentes para generar las estadísticas de evaluación experimental del sistema.",
      "detalles": "Implementado en `RegistroAccionesAgentesScreen.tsx`: soporte clave para la demostración de eficiencia del MAS en la investigación."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_evento_mas:tiempo_inferencia_ms",
        "tableName": "tb_evento_mas",
        "tableLabel": "Eventos de Agentes MAS",
        "schema": "nucleo",
        "attribute": "tiempo_inferencia_ms",
        "type": "INTEGER",
        "isPrimary": false
      },
      {
        "key": "tb_indicador_desempeno:tasa_resolucion_autonoma",
        "tableName": "tb_indicador_desempeno",
        "tableLabel": "Indicadores de Desempeño",
        "schema": "nucleo",
        "attribute": "tasa_resolucion_autonoma",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-124",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-25",
    "projectId": "smatad",
    "number": "25",
    "title": "Bitácora Detallada de Servicio",
    "fullName": "25. Bitácora Detallada de Servicio",
    "module": "Control Operativo, Tiempos & Agentes",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "bitacora-servicio",
    "fields": {
      "objetivo": "Proporcionar la auditoría forense granular de todas las interacciones, mensajes, cambios de estado y registros de un servicio específico.",
      "contenido": "Cabecera del servicio consultado; línea de tiempo vertical de eventos con hora, actor (humano o agente específico), acción ejecutada y payload de datos intercambiados (e.g. coordenadas GPS, respuesta OCR, confirmación de estibador).",
      "reglas": "Accesible desde el Detalle de Servicio para resolver cualquier discrepancia de tiempos o responsabilidades operativas.",
      "detalles": "Ubicado en `BitacoraServicioDetalleScreen.tsx`: visualización cronológica con filtros por tipología de evento."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_servicio:id",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_evento_mas:payload",
        "tableName": "tb_evento_mas",
        "tableLabel": "Eventos de Agentes MAS",
        "schema": "nucleo",
        "attribute": "payload",
        "type": "JSONB",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-125",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-26",
    "projectId": "smatad",
    "number": "26",
    "title": "Ver Disponibilidad",
    "fullName": "26. Ver Disponibilidad",
    "module": "Gestión & Monitoreo",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "ver-disponibilidad",
    "fields": {
      "objetivo": "Ofrecer al usuario con rol Logista una matriz de disponibilidad temporal de flota pesada, estibadores y rampas de almacén.",
      "contenido": "Campos / Controles: Selector horizontal de fechas (Hoy, Mañana, Días posteriores); selector de turnos de trabajo (Mañana: 07:00-15:00, Tarde: 15:00-23:00, Noche: 23:00-07:00); filtros por base operativa. | Tarjeta de capacidad consolidada (Camiones libres, Choferes en turno, Estibadores activos, Rampas operativas); desglose por base (Callao, Lurín, Huachipa) con barras porcentuales de ocupación.",
      "reglas": "Deduce automáticamente las unidades y personal comprometidos en servicios programados o en tránsito.",
      "detalles": "Implementado en `VerDisponibilidadScreen.tsx`: pestañas interactivas de fecha y tarjetas estadísticas con acento #0058BE."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_vehiculo:estado_disponibilidad",
        "tableName": "tb_vehiculo",
        "tableLabel": "Flota Vehicular Pesada",
        "schema": "nucleo",
        "attribute": "estado_disponibilidad",
        "type": "VARCHAR(50)",
        "isPrimary": false
      },
      {
        "key": "tb_estibador:estado_disponibilidad",
        "tableName": "tb_estibador",
        "tableLabel": "Personal de Estiba",
        "schema": "nucleo",
        "attribute": "estado_disponibilidad",
        "type": "VARCHAR(30)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-126",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-27",
    "projectId": "smatad",
    "number": "27",
    "title": "Capacidad Operativa",
    "fullName": "27. Capacidad Operativa",
    "module": "Gestión & Monitoreo",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "capacidad-operativa",
    "fields": {
      "objetivo": "Evaluar el balance entre la oferta vehicular de la empresa y la demanda proyectada de servicios para optimizar la asignación de flota pesada.",
      "contenido": "Gráfico de distribución de tonelaje disponible vs comprometido; medidor de utilización de flota (%); alertas de cuello de botella en almacenes saturados; balance de tractos y carretas operativas vs en mantenimiento.",
      "reglas": "Alerta proactivamente cuando la demanda programada supera el 85% de la capacidad operativa instalada.",
      "detalles": "Ubicado en `CapacidadOperativaScreen.tsx`: indicadores gráficos de soporte a la toma de decisiones estratégicas."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_vehiculo:capacidad_toneladas",
        "tableName": "tb_vehiculo",
        "tableLabel": "Flota Vehicular Pesada",
        "schema": "nucleo",
        "attribute": "capacidad_toneladas",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      },
      {
        "key": "tb_servicio:peso_total_kg",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "peso_total_kg",
        "type": "DECIMAL(10,2)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-127",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-28",
    "projectId": "smatad",
    "number": "28",
    "title": "CAEE (Control y Estimación de Embarques)",
    "fullName": "28. CAEE (Control y Estimación de Embarques)",
    "module": "Gestión & Monitoreo",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "caee",
    "fields": {
      "objetivo": "Controlar la puntualidad de las salidas de flota programadas y proyectar desvíos en los tiempos de partida desde las bases o almacenes de carga.",
      "contenido": "Reloj de despacho en tiempo real; listado cronológico de embarques programados para el turno; badge semáforo de puntualidad (Verde: En Horario, Amarillo: Riesgo de Retraso, Rojo: Demorado); desglose del motivo de retraso en caso aplique.",
      "reglas": "Se sincroniza con las marcas de llegada de chofer y cuadrilla para calcular el desvío estimado en minutos.",
      "detalles": "Implementado en `CAEEScreen.tsx`: pantalla clave para el cumplimiento estricto de las ventanas horarias de los clientes."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_servicio:hora_salida_programada",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "hora_salida_programada",
        "type": "TIMESTAMP",
        "isPrimary": false
      },
      {
        "key": "tb_servicio:desvio_minutos",
        "tableName": "tb_servicio",
        "tableLabel": "Servicios de Transporte",
        "schema": "nucleo",
        "attribute": "desvio_minutos",
        "type": "INTEGER",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-128",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-29",
    "projectId": "smatad",
    "number": "29",
    "title": "GEC (Gestión de Eventos y Coordinación)",
    "fullName": "29. GEC (Gestión de Eventos y Coordinación)",
    "module": "Operación & Tránsito en Ruta",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "gec",
    "fields": {
      "objetivo": "Centralizar, priorizar y gestionar la atención de contingencias operativas en ruta, alertas de tráfico, fallas mecánicas y novedades documentales.",
      "contenido": "Campos / Controles: Selector de filtros por tipo de evento (Todos, Alerta Crítica, Documental, Operativo); botón para exportar reporte de incidencias (📄); acción rápida para contactar unidad. | Tarjetas de contingencia con código único (e.g. EVT-501), título descriptivo, servicio afectado, badge de severidad (Alta #BA1A1A, Media #B36B00, Baja #146C2E), descripción del suceso y responsable asignado.",
      "reglas": "Incidentes de severidad \"Alta\" activan alertas inmediatas en el Dashboard y exigen el registro de una acción de mitigación documentada.",
      "detalles": "Ubicado en `GECScreen.tsx`: herramienta de respuesta rápida para la torre de control de transporte."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_incidencia_servicio:id",
        "tableName": "tb_incidencia_servicio",
        "tableLabel": "Incidencias de Servicio",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_incidencia_servicio:severidad",
        "tableName": "tb_incidencia_servicio",
        "tableLabel": "Incidencias de Servicio",
        "schema": "nucleo",
        "attribute": "severidad",
        "type": "VARCHAR(20)",
        "isPrimary": false
      },
      {
        "key": "tb_incidencia_servicio:accion_mitigacion",
        "tableName": "tb_incidencia_servicio",
        "tableLabel": "Incidencias de Servicio",
        "schema": "nucleo",
        "attribute": "accion_mitigacion",
        "type": "TEXT",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-129",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-30",
    "projectId": "smatad",
    "number": "30",
    "title": "TPC (Tiempos de Coordinación)",
    "fullName": "30. TPC (Tiempos de Coordinación)",
    "module": "Control Operativo, Tiempos & Agentes",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "tpc",
    "fields": {
      "objetivo": "Registrar, respaldar y auditar los acuerdos operativos en ruta, autorizaciones de muelles portuarios y ventanas horarias pactadas con clientes.",
      "contenido": "Campos / Controles: Botón \"+ Nueva Coordinación\"; filtros por estado (Confirmada, En Gestión, Cerrada); selector de canal probatorio utilizado. | Tarjetas de coordinación detallando cliente, asunto operativo (e.g. Ventana de ingreso en Balanza 2, Confirmación de cuadrilla de apoyo), canal utilizado (WhatsApp Operaciones, Llamada Telefónica, App SMATAD), contacto y hora.",
      "reglas": "Garantiza respaldo probatorio documental frente a reclamos de demoras en terminales o almacenes externos.",
      "detalles": "Implementado en `TPCScreen.tsx`: medición directa del tiempo de coordinación (TPC) de la investigación."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_acuerdo_recojo:canal_comunicacion",
        "tableName": "tb_acuerdo_recojo",
        "tableLabel": "Acuerdos de Recojo",
        "schema": "nucleo",
        "attribute": "canal_comunicacion",
        "type": "VARCHAR(50)",
        "isPrimary": false
      },
      {
        "key": "tb_acuerdo_recojo:tiempo_coordinacion_min",
        "tableName": "tb_acuerdo_recojo",
        "tableLabel": "Acuerdos de Recojo",
        "schema": "nucleo",
        "attribute": "tiempo_coordinacion_min",
        "type": "INTEGER",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-130",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-31",
    "projectId": "smatad",
    "number": "31",
    "title": "Reporte de Indicadores y Tiempos de Ciclo",
    "fullName": "31. Reporte de Indicadores y Tiempos de Ciclo",
    "module": "Control Operativo, Tiempos & Agentes",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "reporte-indicadores",
    "fields": {
      "objetivo": "Supervisar y medir de forma integrada los cuatro indicadores experimentales del sistema: TPA (Asignación), TPC (Coordinación), TPV (Permanencia en rampa con SLA < 60 min) y CGRTEC (Calidad documental de guías).",
      "contenido": "Campos / Controles: Comboboxes superiores interactivos de selección y filtrado (combobox de selección de servicio específico para análisis individual y combobox de filtro por estado/meta operativa); selector de período temporal. | Tarjetas de métricas consolidadas: Promedio TPA (minutos), Promedio TPC (minutos), Promedio TPV (con indicador de cumplimiento SLA < 60 min) y Tasa CGRTEC (%); visualización analítica de progreso y cumplimiento; desglose individual por servicio seleccionado.",
      "reglas": "TPV superior a 60 minutos se resalta automáticamente en rojo alertando sobreestadía en rampa; los comboboxes permiten auditar cada servicio individualmente o el agregado general.",
      "detalles": "Ubicado en `ReporteIndicadoresScreen.tsx`: interfaz con comboboxes reactivos alineada directamente a los objetivos de evaluación del software."
    },
    "roles": [
      "Administrador",
      "Logista"
    ],
    "dataUsage": [
      {
        "key": "tb_indicador_desempeno:tpa_promedio_min",
        "tableName": "tb_indicador_desempeno",
        "tableLabel": "Indicadores de Desempeño",
        "schema": "nucleo",
        "attribute": "tpa_promedio_min",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      },
      {
        "key": "tb_indicador_desempeno:tpc_promedio_min",
        "tableName": "tb_indicador_desempeno",
        "tableLabel": "Indicadores de Desempeño",
        "schema": "nucleo",
        "attribute": "tpc_promedio_min",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      },
      {
        "key": "tb_indicador_desempeno:tpv_promedio_min",
        "tableName": "tb_indicador_desempeno",
        "tableLabel": "Indicadores de Desempeño",
        "schema": "nucleo",
        "attribute": "tpv_promedio_min",
        "type": "DECIMAL(5,2)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-131",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-32",
    "projectId": "smatad",
    "number": "32",
    "title": "Ajustes del Sistema",
    "fullName": "32. Ajustes del Sistema",
    "module": "Autenticación & Acceso",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "ajustes",
    "fields": {
      "objetivo": "Configurar las preferencias operativas de la aplicación, opciones de accesibilidad visual, información de la cuenta y cierre de sesión seguro.",
      "contenido": "Ficha de usuario con nombre y rol activo; preferencias de notificaciones push de despacho; selector de tema y densidad visual; información de versión del software y entorno conectado (Supabase Nucleo); botón de cierre de sesión seguro.",
      "reglas": "El cierre de sesión invalida de inmediato el token de autenticación y redirige a la pantalla de Login.",
      "detalles": "Implementado en `AjustesScreen.tsx`: panel centralizado de administración de usuario y entorno."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor",
      "Estibador"
    ],
    "dataUsage": [
      {
        "key": "tb_usuario:id",
        "tableName": "tb_usuario",
        "tableLabel": "Usuarios y Credenciales",
        "schema": "nucleo",
        "attribute": "id",
        "type": "UUID",
        "isPrimary": true
      },
      {
        "key": "tb_usuario:rol",
        "tableName": "tb_usuario",
        "tableLabel": "Usuarios y Credenciales",
        "schema": "nucleo",
        "attribute": "rol",
        "type": "VARCHAR(50)",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-132",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  },
  {
    "id": "INT-SMATAD-33",
    "projectId": "smatad",
    "number": "33",
    "title": "Perfil y Alerta CITV (Componentes Transversales)",
    "fullName": "33. Perfil y Alerta CITV (Componentes Transversales)",
    "module": "Autenticación & Acceso",
    "status": "Aprobado por Cliente",
    "platform": "Web & Mobile",
    "image": null,
    "imagePlaceholder": "componentes-transversales",
    "fields": {
      "objetivo": "Ofrecer acceso permanente a la identidad del usuario autenticado y alertar proactivamente sobre el estado técnico vehicular en cualquier contexto de la aplicación.",
      "contenido": "Modal Perfil: Disponible en el extremo derecho de la cabecera superior en todas las vistas: avatar/iniciales con punto verde de turno activo; despliega un modal con nombre completo, rol operativo, correo corporativo, selector de modo de cabecera (Foto vs Iniciales) y botón de cierre de sesión. | Popup CITV: Componente emergente accesible desde cualquier ficha o tarjeta que involucre un camión de la flota (e.g. en Detalle de Servicio o Gestión de Flota): muestra un icono popup que despliega placa, fecha exacta de vencimiento del Certificado de Inspección Técnica Vehicular, días restantes y semáforo de estado (Vigente, Próximo a Vencer < 15 días, Vencido).",
      "reglas": "El popup garantiza que el logista tenga siempre presente el estado de revisión técnica del camión que está visualizando o asignando, evitando infracciones de transporte.",
      "detalles": "Componentes reutilizables integrados en cabecera y en los módulos de asignación y detalle de flota de la aplicación."
    },
    "roles": [
      "Administrador",
      "Logista",
      "Conductor",
      "Estibador"
    ],
    "dataUsage": [
      {
        "key": "tb_usuario:nombre_completo",
        "tableName": "tb_usuario",
        "tableLabel": "Usuarios y Credenciales",
        "schema": "nucleo",
        "attribute": "nombre_completo",
        "type": "VARCHAR(255)",
        "isPrimary": false
      },
      {
        "key": "tb_vehiculo:revision_tecnica_vencimiento",
        "tableName": "tb_vehiculo",
        "tableLabel": "Flota Vehicular Pesada",
        "schema": "nucleo",
        "attribute": "revision_tecnica_vencimiento",
        "type": "DATE",
        "isPrimary": false
      }
    ],
    "linkedStory": "US-133",
    "author": "SMATAD Architecture Team",
    "reviewedBy": "PO / Operaciones",
    "approvedAt": "2026-11-22",
    "version": "v2.0"
  }
];
