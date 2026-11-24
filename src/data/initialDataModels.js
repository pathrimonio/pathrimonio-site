import { PATHRIMONIO_SITE_DATA_MODELS } from './pathrimonioSiteData.js';

// Catálogo Inicial de Modelado de Datos y Especificación de Almacenamiento
// Define motores de datos, tablas, atributos, tipos, restricciones y estrategias de sincronización

export const STORAGE_TARGET_OPTIONS = [
  "Todos",
  "PostgreSQL (Supabase Cloud)",
  "SQLite Cifrado (Offline-First Móvil)",
  "PostgreSQL Relacional (AWS RDS)",
  "Redis (Caché & In-Memory)",
  "Cloud Object Storage (S3 / Storage)"
];

export const DATA_TYPE_OPTIONS = [
  "UUID",
  "VARCHAR(50)",
  "VARCHAR(100)",
  "VARCHAR(255)",
  "TEXT",
  "INTEGER",
  "BIGINT",
  "DECIMAL(12,2)",
  "BOOLEAN",
  "TIMESTAMP WITH TIME ZONE",
  "DATE",
  "JSONB",
  "BYTEA / BLOB"
];

export const TABLE_STATUS_OPTIONS = [
  "Todos",
  "Aprobado por Arquitectura",
  "En Revisión",
  "Borrador",
  "Deprecado"
];

export const DATA_MODULE_OPTIONS = [
  "Todos",
  "Metas & Hábitos (Pathway)",
  "Pasos & Hitos",
  "Bitácora de Progreso",
  "Gestión & Monitoreo",
  "Gestión de Crédito",
  "Autenticación & KYC",
  "Pasarela de Pagos",
  "Reportes de Impacto"
];

export const INITIAL_DATA_MODELS = [
  // ══════════════════════════════════════════════════════════
  // PROYECTO: Pathway (App MVP) — id: "pathway"
  // Almacenamiento: SQLite Cifrado Móvil + Supabase PostgreSQL
  // ══════════════════════════════════════════════════════════
  {
    id: "TBL-01",
    projectId: "pathway",
    tableName: "tb_metas",
    name: "Metas y Grandes Propósitos (Pathway)",
    module: "Metas & Hábitos (Pathway)",
    storageTarget: "SQLite Cifrado (Offline-First Móvil)",
    storageLocation: "Sandbox Local App Móvil (SQLCipher AES-256) + Réplica en Supabase Cloud",
    syncStrategy: "Offline-First bidireccional. Resolución de conflictos por timestamp (LWW - Last Write Wins).",
    status: "Aprobado por Arquitectura",
    description: "Entidad principal que almacena las metas creadas por el usuario en Pathway. Cada meta contiene fecha estimada, categoría visual, color y cálculo de progreso.",
    linkedStory: "US-201",
    linkedInterface: "INT-03",
    author: "Jhan C.",
    approvedAt: "2026-11-20",
    version: "v1.2",
    attributes: [
      {
        id: "c1",
        name: "id",
        type: "UUID",
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: "gen_random_uuid()",
        description: "Identificador universal único e inmutable de la meta."
      },
      {
        id: "c2",
        name: "user_id",
        type: "UUID",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: "auth.users(id)",
        defaultValue: null,
        description: "ID del usuario autenticado propietario de la meta."
      },
      {
        id: "c3",
        name: "titulo",
        type: "VARCHAR(255)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: null,
        description: "Título de la meta definido por el usuario (mínimo 5 caracteres)."
      },
      {
        id: "c4",
        name: "categoria",
        type: "VARCHAR(50)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'Estudio'",
        description: "Categoría temática: Estudio, Negocio, Salud, Finanzas o Personal."
      },
      {
        id: "c5",
        name: "color_hex",
        type: "VARCHAR(20)",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'#34d399'",
        description: "Código de color hexadecimal representativo para la interfaz móvil."
      },
      {
        id: "c6",
        name: "fecha_objetivo",
        type: "DATE",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: null,
        description: "Fecha límite propuesta para alcanzar el 100% de la meta."
      },
      {
        id: "c7",
        name: "progreso_pct",
        type: "INTEGER",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0",
        description: "Porcentaje de avance calculado automáticamente (0 a 100)."
      },
      {
        id: "c8",
        name: "estado",
        type: "VARCHAR(30)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'en_curso'",
        description: "Estado de la meta: 'en_curso', 'completada', 'pausada', 'archivada'."
      },
      {
        id: "c9",
        name: "created_at",
        type: "TIMESTAMP WITH TIME ZONE",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "CURRENT_TIMESTAMP",
        description: "Fecha y hora exacta de registro de la meta."
      },
      {
        id: "c10",
        name: "updated_at",
        type: "TIMESTAMP WITH TIME ZONE",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "CURRENT_TIMESTAMP",
        description: "Timestamp de última modificación para sincronización diferencial."
      }
    ]
  },
  {
    id: "TBL-02",
    projectId: "pathway",
    tableName: "tb_pasos_hitos",
    name: "Pasos e Hitos Secuenciales",
    module: "Pasos & Hitos",
    storageTarget: "SQLite Cifrado (Offline-First Móvil)",
    storageLocation: "Base SQLite cifrada en cliente + Cola de sincronización local",
    syncStrategy: "Sincronización incremental con cola de eventos 'pending_sync_queue'.",
    status: "Aprobado por Arquitectura",
    description: "Desglose atómico de una meta en pasos ordenados secuencialmente. Registra el orden de ejecución, pre-requisito obligatorio y confirmación de cumplimiento.",
    linkedStory: "US-202",
    linkedInterface: "INT-05",
    author: "Elena Morales",
    approvedAt: "2026-11-20",
    version: "v1.1",
    attributes: [
      {
        id: "c1",
        name: "id",
        type: "UUID",
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: "gen_random_uuid()",
        description: "Identificador único del paso."
      },
      {
        id: "c2",
        name: "meta_id",
        type: "UUID",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: "tb_metas(id) ON DELETE CASCADE",
        defaultValue: null,
        description: "Clave foránea hacia la gran meta contenedora."
      },
      {
        id: "c3",
        name: "orden_secuencia",
        type: "INTEGER",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "1",
        description: "Posición ordinal del paso en el mapa de ruta vertical (1, 2, 3...)."
      },
      {
        id: "c4",
        name: "titulo_paso",
        type: "VARCHAR(255)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: null,
        description: "Acción concreta y medible a realizar."
      },
      {
        id: "c5",
        name: "es_completado",
        type: "BOOLEAN",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "false",
        description: "Bandera booleana de cumplimiento del paso."
      },
      {
        id: "c6",
        name: "fecha_completado",
        type: "TIMESTAMP WITH TIME ZONE",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        foreignKey: null,
        defaultValue: null,
        description: "Timestamp del momento exacto en que el usuario marcó el hito."
      },
      {
        id: "c7",
        name: "paso_previo_id",
        type: "UUID",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        foreignKey: "tb_pasos_hitos(id)",
        defaultValue: null,
        description: "Paso anterior obligatorio que debe cumplirse previamente (opcional)."
      }
    ]
  },
  {
    id: "TBL-03",
    projectId: "pathway",
    tableName: "tb_bitacora_diaria",
    name: "Bitácora Diaria & Reflexiones",
    module: "Bitácora de Progreso",
    storageTarget: "SQLite Cifrado (Offline-First Móvil)",
    storageLocation: "Almacenamiento local SQLite con cifrado biométrico",
    syncStrategy: "Sincronización en background al conectarse a red WiFi / Datos.",
    status: "En Revisión",
    description: "Registra entradas diarias personales del usuario: notas reflexivas, selección de estado de ánimo y hábitos cumplidos en la jornada.",
    linkedStory: "US-203",
    linkedInterface: "INT-06",
    author: "Carlos D.",
    approvedAt: null,
    version: "v1.0",
    attributes: [
      {
        id: "c1",
        name: "id",
        type: "UUID",
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: "gen_random_uuid()",
        description: "Clave primaria del registro de bitácora."
      },
      {
        id: "c2",
        name: "user_id",
        type: "UUID",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: "auth.users(id)",
        defaultValue: null,
        description: "Usuario autor de la reflexión."
      },
      {
        id: "c3",
        name: "fecha_registro",
        type: "DATE",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "CURRENT_DATE",
        description: "Fecha del día que se registra."
      },
      {
        id: "c4",
        name: "reflexion_texto",
        type: "TEXT",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: null,
        description: "Contenido de texto libre con las reflexiones del usuario."
      },
      {
        id: "c5",
        name: "animo_emoji",
        type: "VARCHAR(20)",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'🔥 Enfoque'",
        description: "Descriptor o emoji del estado de ánimo predominante."
      },
      {
        id: "c6",
        name: "habitos_cumplidos_count",
        type: "INTEGER",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0",
        description: "Cantidad de micro-hábitos completados durante el día."
      },
      {
        id: "c7_meta",
        name: "meta_id",
        type: "UUID",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        foreignKey: "tb_metas(id)",
        defaultValue: null,
        description: "Llave foránea opcional que asocia la reflexión con su meta principal en Pathway."
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // PROYECTO: Sistema de Gestión & Ventas — id: "portal-admin"
  // Almacenamiento: PostgreSQL Relacional (Supabase Cloud)
  // ══════════════════════════════════════════════════════════
  {
    id: "TBL-04",
    projectId: "portal-admin",
    tableName: "tb_ventas_transacciones",
    name: "Ventas y Transacciones Comerciales",
    module: "Gestión & Monitoreo",
    storageTarget: "PostgreSQL (Supabase Cloud)",
    storageLocation: "Cluster PostgreSQL Administrado (AWS us-east-1 / Supabase)",
    syncStrategy: "Lectura/Escritura en tiempo real con WebSockets (Supabase Realtime) hacia el Dashboard.",
    status: "Aprobado por Arquitectura",
    description: "Centraliza todas las ventas del negocio para alimentar el '4. Dashboard' en tiempo real con ingresos, egresos, número de boleta y estado de pago.",
    linkedStory: "US-301",
    linkedInterface: "INT-04",
    author: "Carlos D.",
    approvedAt: "2026-11-20",
    version: "v2.0",
    attributes: [
      {
        id: "c1",
        name: "id",
        type: "UUID",
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: "gen_random_uuid()",
        description: "ID de la transacción comercial."
      },
      {
        id: "c2",
        name: "codigo_comprobante",
        type: "VARCHAR(50)",
        isPrimary: false,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: null,
        description: "Número de boleta, factura o ticket de venta correlativo."
      },
      {
        id: "c3",
        name: "cliente_nombre",
        type: "VARCHAR(255)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'Consumidor Final'",
        description: "Nombre o razón social del comprador."
      },
      {
        id: "c4",
        name: "monto_subtotal",
        type: "DECIMAL(12,2)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0.00",
        description: "Monto base gravable sin impuestos."
      },
      {
        id: "c5",
        name: "monto_impuesto",
        type: "DECIMAL(12,2)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0.00",
        description: "Impuesto al valor agregado (IGV / IVA)."
      },
      {
        id: "c6",
        name: "monto_total",
        type: "DECIMAL(12,2)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0.00",
        description: "Monto neto total pagado por el cliente."
      },
      {
        id: "c7",
        name: "metodo_pago",
        type: "VARCHAR(50)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'Efectivo'",
        description: "Efectivo, Tarjeta, Transferencia, Billetera Digital (Yape/Plin)."
      },
      {
        id: "c8",
        name: "estado_pago",
        type: "VARCHAR(30)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'pagado'",
        description: "Estado de cobro: 'pagado', 'pendiente', 'anulado'."
      },
      {
        id: "c9",
        name: "cajero_admin_id",
        type: "UUID",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: "auth.users(id)",
        defaultValue: null,
        description: "Administrador o cajero que procesó la venta."
      },
      {
        id: "c10",
        name: "created_at",
        type: "TIMESTAMP WITH TIME ZONE",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "CURRENT_TIMESTAMP",
        description: "Timestamp exacto para graficar ventas del día en el Dashboard."
      }
    ]
  },
  {
    id: "TBL-05",
    projectId: "portal-admin",
    tableName: "tb_inventario_alertas",
    name: "Inventario de Productos & Alertas de Stock",
    module: "Gestión & Monitoreo",
    storageTarget: "PostgreSQL (Supabase Cloud)",
    storageLocation: "PostgreSQL con disparadores (Triggers) de alerta en Supabase",
    syncStrategy: "Eventos CDC (Change Data Capture) emiten notificaciones push al dashboard ante stock crítico.",
    status: "Aprobado por Arquitectura",
    description: "Catálogo de mercadería con control de existencias. Genera alertas de inventario críticas cuando el stock disponible es menor o igual al stock mínimo configurado.",
    linkedStory: "US-301",
    linkedInterface: "INT-04",
    author: "Carlos D.",
    approvedAt: "2026-11-20",
    version: "v2.0",
    attributes: [
      {
        id: "c1",
        name: "id",
        type: "UUID",
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: "gen_random_uuid()",
        description: "Identificador único de producto."
      },
      {
        id: "c2",
        name: "sku",
        type: "VARCHAR(50)",
        isPrimary: false,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: null,
        description: "Código de barra o SKU único del artículo."
      },
      {
        id: "c3",
        name: "nombre_producto",
        type: "VARCHAR(255)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: null,
        description: "Denominación comercial del producto."
      },
      {
        id: "c4",
        name: "stock_actual",
        type: "INTEGER",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0",
        description: "Unidades físicas disponibles en almacén."
      },
      {
        id: "c5",
        name: "stock_minimo",
        type: "INTEGER",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "5",
        description: "Umbral para disparar alerta visual de agotamiento en el Dashboard."
      },
      {
        id: "c6",
        name: "precio_costo",
        type: "DECIMAL(12,2)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0.00",
        description: "Costo unitario de adquisición para cálculo de egresos."
      },
      {
        id: "c7",
        name: "precio_venta",
        type: "DECIMAL(12,2)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0.00",
        description: "Precio de venta al público en general."
      },
      {
        id: "c8",
        name: "alerta_activa",
        type: "BOOLEAN",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "false",
        description: "Calculado: true si stock_actual <= stock_minimo."
      },
      {
        id: "c9_trans",
        name: "ultima_transaccion_id",
        type: "UUID",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        foreignKey: "tb_ventas_transacciones(id)",
        defaultValue: null,
        description: "Llave foránea a la última transacción de venta que modificó el inventario disponible."
      }
    ]
  },

  // ══════════════════════════════════════════════════════════
  // PROYECTO: Core Banking & Impact Hub — id: "core-hub"
  // Almacenamiento: PostgreSQL Relacional + SQLite Móvil Rural
  // ══════════════════════════════════════════════════════════
  {
    id: "TBL-06",
    projectId: "core-hub",
    tableName: "tb_creditos_desembolsos",
    name: "Desembolsos de Crédito Comunitario",
    module: "Gestión de Crédito",
    storageTarget: "PostgreSQL Relacional (AWS RDS)",
    storageLocation: "Base de Datos Relacional Ledger con replicación multi-zona y cifrado AES-256",
    syncStrategy: "Almacenamiento transaccional ACID con verificación de firma hash SHA-256.",
    status: "Aprobado por Arquitectura",
    description: "Registra los contratos y desembolsos de microcrédito otorgados a comunidades rurales, vinculados a la validación biométrica del oficial de crédito.",
    linkedStory: "US-101",
    linkedInterface: "INT-07",
    author: "Sofía V.",
    approvedAt: "2026-11-15",
    version: "v2.4",
    attributes: [
      {
        id: "c1",
        name: "id",
        type: "UUID",
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: "gen_random_uuid()",
        description: "Identificador global del crédito."
      },
      {
        id: "c2",
        name: "beneficiario_id",
        type: "UUID",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: "tb_beneficiarios(id)",
        defaultValue: null,
        description: "Identificador del productor o comunero receptor del crédito."
      },
      {
        id: "c3",
        name: "monto_capital",
        type: "DECIMAL(12,2)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "0.00",
        description: "Monto principal desembolsado en moneda local."
      },
      {
        id: "c4",
        name: "tasa_interes_anual",
        type: "DECIMAL(5,2)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "12.50",
        description: "Tasa de interés comunitaria preferencial."
      },
      {
        id: "c5",
        name: "plazo_meses",
        type: "INTEGER",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "12",
        description: "Número total de cuotas mensuales pactadas."
      },
      {
        id: "c6",
        name: "hash_firma_sha256",
        type: "VARCHAR(64)",
        isPrimary: false,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: null,
        description: "Sello criptográfico SHA-256 inmutable de la firma del desembolso."
      },
      {
        id: "c7",
        name: "estado_credito",
        type: "VARCHAR(30)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'vigente'",
        description: "'vigente', 'cancelado', 'en_mora', 'desembolsado_offline'."
      }
    ]
  },
  {
    id: "TBL-07",
    projectId: "core-hub",
    tableName: "tb_validaciones_biometricas",
    name: "Validaciones Biométricas & Auditoría",
    module: "Autenticación & KYC",
    storageTarget: "PostgreSQL Relacional (AWS RDS)",
    storageLocation: "Tabla particionada por mes con almacenamiento de hash en frío",
    syncStrategy: "Sello temporal inmutable con validación de coordenadas satelitales GPS.",
    status: "Aprobado por Arquitectura",
    description: "Auditoría forense de biometría dactilar y facial para garantizar que los fondos comunitarios lleguen directamente al beneficiario legítimo en zonas rurales.",
    linkedStory: "US-102",
    linkedInterface: "INT-07",
    author: "Sofía V.",
    approvedAt: "2026-11-15",
    version: "v2.4",
    attributes: [
      {
        id: "c1",
        name: "id",
        type: "UUID",
        isPrimary: true,
        isNullable: false,
        isUnique: true,
        foreignKey: null,
        defaultValue: "gen_random_uuid()",
        description: "Identificador del registro biométrico."
      },
      {
        id: "c2",
        name: "credito_id",
        type: "UUID",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: "tb_creditos_desembolsos(id)",
        defaultValue: null,
        description: "Contrato de crédito asociado."
      },
      {
        id: "c3",
        name: "tipo_biometria",
        type: "VARCHAR(30)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "'huella_dactilar'",
        description: "'huella_dactilar', 'reconocimiento_facial', 'firma_grafica'."
      },
      {
        id: "c4",
        name: "score_coincidencia",
        type: "DECIMAL(5,2)",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "98.50",
        description: "Puntuación de match biométrico certificado (> 90.00% requerido)."
      },
      {
        id: "c5",
        name: "coordenadas_gps",
        type: "VARCHAR(100)",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        foreignKey: null,
        defaultValue: null,
        description: "Latitud y longitud capturadas al momento de la firma rural."
      },
      {
        id: "c6",
        name: "token_totp_verificado",
        type: "BOOLEAN",
        isPrimary: false,
        isNullable: false,
        isUnique: false,
        foreignKey: null,
        defaultValue: "true",
        description: "Validación de token de 6 dígitos fuera de línea."
      }
    ]
  },
  ...PATHRIMONIO_SITE_DATA_MODELS
];

// Helper to generate DDL SQL statement for a table
export function generateTableDDL(table) {
  if (!table) return "";
  
  const cols = (table.attributes || []).map(attr => {
    let line = `  ${attr.name.padEnd(24, ' ')} ${attr.type}`;
    if (attr.isPrimary) line += " PRIMARY KEY";
    if (!attr.isNullable && !attr.isPrimary) line += " NOT NULL";
    if (attr.isUnique && !attr.isPrimary) line += " UNIQUE";
    if (attr.defaultValue) line += ` DEFAULT ${attr.defaultValue}`;
    if (attr.foreignKey) line += ` REFERENCES ${attr.foreignKey}`;
    return line;
  });

  const commentSql = (table.attributes || [])
    .filter(attr => attr.description)
    .map(attr => `COMMENT ON COLUMN ${table.tableName}.${attr.name} IS '${attr.description.replace(/'/g, "''")}';`)
    .join('\n');

  return `-- ══════════════════════════════════════════════════════════
-- Entidad: ${table.name} (${table.tableName})
-- Motor: ${table.storageTarget}
-- Ubicación: ${table.storageLocation || 'Cloud Server'}
-- Estrategia: ${table.syncStrategy || 'Estándar'}
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ${table.tableName} (
${cols.join(',\n')}
);

${commentSql}
`;
}

// Helper to generate full project SQL script
export function generateFullProjectSQL(tables = [], projectName = "Pathrimonio") {
  const header = `-- ══════════════════════════════════════════════════════════
-- PATHRIMONIO — SCRIPT DDL DE BASE DE DATOS
-- PROYECTO: ${projectName}
-- FECHA: ${new Date().toISOString()}
-- TABLAS INCLUIDAS: ${tables.length}
-- ══════════════════════════════════════════════════════════\n\n`;

  const body = tables.map(t => generateTableDDL(t)).join('\n-- --------------------------------------------------------\n\n');
  return header + body;
}

// Helper to generate PlantUML (.puml) Entity-Relationship diagram
export function generatePlantUML(tables = [], projectName = "Pathrimonio") {
  const cleanProjectName = (projectName || "Pathrimonio").replace(/[^a-zA-Z0-9_]/g, "_");
  
  const entities = tables.map(table => {
    const lines = [];
    lines.push(`entity "${table.tableName}" as ${table.tableName} {`);
    
    // Primary keys first
    const pks = (table.attributes || []).filter(a => a.isPrimary);
    const nonPks = (table.attributes || []).filter(a => !a.isPrimary);
    
    pks.forEach(pk => {
      lines.push(`  * **${pk.name}** : ${pk.type} <<PK>>`);
    });
    
    if (nonPks.length > 0 && pks.length > 0) {
      lines.push(`  --`);
    }
    
    nonPks.forEach(attr => {
      const requiredMark = attr.isNullable ? "  " : "  *";
      let fkTag = "";
      if (attr.foreignKey) fkTag = " <<FK>>";
      lines.push(`${requiredMark} ${attr.name} : ${attr.type}${fkTag}`);
    });
    
    lines.push(`}`);
    return lines.join('\n');
  }).join('\n\n');

  // Discover relationships from foreignKeys
  const relations = [];
  const externalEntities = new Set();
  const tableNames = new Set(tables.map(t => t.tableName));

  tables.forEach(table => {
    (table.attributes || []).forEach(attr => {
      if (attr.foreignKey) {
        // e.g. "tb_metas(id)" or "auth.users(id)"
        const match = attr.foreignKey.match(/^([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)/);
        if (match) {
          const target = match[1];
          const cleanTarget = target.replace(/\./g, "_");
          if (!tableNames.has(target)) {
            externalEntities.add(cleanTarget);
          }
          relations.push(`${cleanTarget} ||--o{ ${table.tableName} : "${attr.name}"`);
        }
      }
    });
  });

  const externalEntitiesBlock = Array.from(externalEntities).map(ext => 
    `entity "${ext}" as ${ext} <<(E,#334155) External>> {\n  * **id** : UUID\n}`
  ).join('\n\n');

  return `@startuml DER_${cleanProjectName}
!theme plain
skinparam linetype ortho
skinparam roundcorner 6
skinparam shadowing false
skinparam classFontSize 11
skinparam classFontName "Space Grotesk", monospace

' Configuración Visual de Entidades y Llaves
skinparam entity {
  BackgroundColor #0f172a
  BorderColor #38bdf8
  FontColor #f8fafc
  HeaderBackgroundColor #1e293b
}
skinparam arrowColor #10b981
skinparam arrowFontColor #94a3b8
skinparam arrowFontSize 10

title Diagrama Entidad-Relación (DER) — ${projectName}

${externalEntitiesBlock ? "' Entidades Externas Referenciadas\n" + externalEntitiesBlock + "\n\n" : ""}' Entidades del Software
${entities}

${relations.length > 0 ? "' Relaciones y Cardinalidad\n" + relations.join('\n') : "' Sin relaciones foráneas registradas"}

@enduml`;
}

// ══════════════════════════════════════════════════════════
// Parser de Scripts DDL SQL para importar tablas y atributos
// ══════════════════════════════════════════════════════════
export function parseSQLScript(
  sqlString,
  defaultProjectId = 'pathway',
  defaultModule = 'Gestión & Monitoreo',
  defaultStorage = 'PostgreSQL (Supabase Cloud)'
) {
  if (!sqlString || typeof sqlString !== 'string') return [];

  // 1. Extraer comentarios COMMENT ON COLUMN
  const columnComments = {};
  const commentRegex = /COMMENT\s+ON\s+COLUMN\s+(?:[a-zA-Z0-9_"`\[\]]+\.)?([a-zA-Z0-9_"`\[\]]+)\.([a-zA-Z0-9_"`\[\]]+)\s+IS\s+'((?:[^']|'')*)'/gi;
  let commentMatch;
  while ((commentMatch = commentRegex.exec(sqlString)) !== null) {
    const table = commentMatch[1].replace(/["`\[\]]/g, '').toLowerCase();
    const col = commentMatch[2].replace(/["`\[\]]/g, '').toLowerCase();
    const text = commentMatch[3].replace(/''/g, "'");
    if (!columnComments[table]) columnComments[table] = {};
    columnComments[table][col] = text;
  }

  // 2. Extraer comentarios COMMENT ON TABLE
  const tableComments = {};
  const tableCommentRegex = /COMMENT\s+ON\s+TABLE\s+(?:[a-zA-Z0-9_"`\[\]]+\.)?([a-zA-Z0-9_"`\[\]]+)\s+IS\s+'((?:[^']|'')*)'/gi;
  let tCommentMatch;
  while ((tCommentMatch = tableCommentRegex.exec(sqlString)) !== null) {
    const table = tCommentMatch[1].replace(/["`\[\]]/g, '').toLowerCase();
    const text = tCommentMatch[2].replace(/''/g, "'");
    tableComments[table] = text;
  }

  // 3. Limpiar comentarios de bloque /* ... */ y de línea -- ...
  const cleanSql = sqlString
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '');

  // 4. Buscar sentencias CREATE TABLE (soporta esquemas [dbo]., "public"., nucleo., etc. y opciones finales)
  const createTableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:[a-zA-Z0-9_"`\[\]]+\.)?([a-zA-Z0-9_"`\[\]]+)\s*\(([\s\S]*?)\)(?:[^;]*?)(?:;|\n\s*(?:CREATE|ALTER|DROP|COMMENT|INSERT)|$)/gi;
  const parsedTables = [];
  let tableMatch;

  while ((tableMatch = createTableRegex.exec(cleanSql)) !== null) {
    const rawTableName = tableMatch[1].replace(/["`\[\]]/g, '').trim().toLowerCase();
    const body = tableMatch[2].trim();

    // Generar título descriptivo a partir del nombre físico
    let cleanTitle = rawTableName.replace(/^tb_/i, '').replace(/_/g, ' ');
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    // Dividir líneas respetando paréntesis anidados (ej. DECIMAL(12,2))
    const lines = [];
    let currentLine = '';
    let parenDepth = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if ((char === "'" || char === '"') && body[i - 1] !== '\\') {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
        }
      }

      if (!inQuotes) {
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
        else if (char === ',' && parenDepth === 0) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = '';
          continue;
        }
      }
      currentLine += char;
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    // Separar columnas de restricciones a nivel de tabla (PRIMARY KEY, FOREIGN KEY, etc.)
    const tableLevelPKs = new Set();
    const tableLevelFKs = {};
    const columnLines = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      const upper = trimmed.toUpperCase();

      // PRIMARY KEY a nivel de tabla
      const pkMatch = trimmed.match(/^(?:CONSTRAINT\s+[a-zA-Z0-9_]+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        pkMatch[1].split(',').forEach(col => {
          tableLevelPKs.add(col.replace(/["`\[\]]/g, '').trim().toLowerCase());
        });
        return;
      }

      // FOREIGN KEY a nivel de tabla
      const fkMatch = trimmed.match(/^(?:CONSTRAINT\s+[a-zA-Z0-9_]+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+([^(]+)\(([^)]+)\)/i);
      if (fkMatch) {
        const col = fkMatch[1].replace(/["`\[\]]/g, '').trim().toLowerCase();
        const targetTable = fkMatch[2].replace(/["`\[\]]/g, '').trim();
        const targetCol = fkMatch[3].replace(/["`\[\]]/g, '').trim();
        tableLevelFKs[col] = `${targetTable}(${targetCol})`;
        return;
      }

      if (upper.startsWith('CONSTRAINT') || upper.startsWith('CHECK') || upper.startsWith('UNIQUE (')) {
        return;
      }

      columnLines.push(trimmed);
    });

    // Parsear cada columna
    const attributes = [];
    columnLines.forEach((colLine, idx) => {
      const tokens = colLine.split(/\s+/);
      if (tokens.length < 2) return;

      const colName = tokens[0].replace(/["`\[\]]/g, '').trim().toLowerCase();
      let remaining = colLine.slice(tokens[0].length).trim();

      // Detectar tipo de dato
      let dataType = 'VARCHAR(255)';
      if (/^TIMESTAMP\s+WITH\s+TIME\s+ZONE/i.test(remaining)) {
        dataType = 'TIMESTAMP WITH TIME ZONE';
        remaining = remaining.replace(/^TIMESTAMP\s+WITH\s+TIME\s+ZONE/i, '').trim();
      } else if (/^DOUBLE\s+PRECISION/i.test(remaining)) {
        dataType = 'DOUBLE PRECISION';
        remaining = remaining.replace(/^DOUBLE\s+PRECISION/i, '').trim();
      } else {
        const typeWithParenMatch = remaining.match(/^([a-zA-Z0-9_]+(?:\s*\([^)]+\))?)/i);
        if (typeWithParenMatch) {
          dataType = typeWithParenMatch[1].toUpperCase();
          remaining = remaining.slice(typeWithParenMatch[0].length).trim();
        } else {
          dataType = tokens[1].toUpperCase();
          remaining = remaining.slice(tokens[1].length).trim();
        }
      }

      const upperRest = remaining.toUpperCase();
      const isPrimary = upperRest.includes('PRIMARY KEY') || tableLevelPKs.has(colName);
      const isNullable = !isPrimary && !upperRest.includes('NOT NULL');
      const isUnique = upperRest.includes('UNIQUE') && !isPrimary;

      // Extraer DEFAULT
      let defaultValue = '';
      const defaultMatch = remaining.match(/DEFAULT\s+([^,;()]+(?:\([^)]*\))?|'[^']*')/i);
      if (defaultMatch) {
        defaultValue = defaultMatch[1].trim();
      } else if (/SERIAL/i.test(dataType)) {
        defaultValue = 'nextval(...)';
      }

      // Extraer REFERENCES inline
      let foreignKey = tableLevelFKs[colName] || '';
      if (!foreignKey) {
        const refMatch = remaining.match(/REFERENCES\s+([^(,;\s]+)\s*\(([^)]+)\)/i);
        if (refMatch) {
          foreignKey = `${refMatch[1].replace(/["`\[\]]/g, '').trim()}(${refMatch[2].replace(/["`\[\]]/g, '').trim()})`;
        }
      }

      const description = (columnComments[rawTableName] && columnComments[rawTableName][colName]) 
        || (isPrimary ? 'Identificador único inmutable' : foreignKey ? `Referencia foránea a ${foreignKey}` : '');

      attributes.push({
        id: `c_${idx + 1}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: colName,
        type: dataType,
        isPrimary,
        isNullable,
        isUnique,
        foreignKey: foreignKey || null,
        defaultValue: defaultValue || null,
        description
      });
    });

    if (attributes.length > 0) {
      parsedTables.push({
        id: `TBL-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}-${parsedTables.length + 1}`,
        projectId: defaultProjectId === 'all' ? 'pathway' : defaultProjectId,
        tableName: rawTableName,
        name: cleanTitle,
        module: defaultModule,
        storageTarget: defaultStorage,
        storageLocation: defaultStorage.includes('SQLite') 
          ? 'Sandbox Local Móvil (SQLCipher AES-256) + Sincronización Cloud' 
          : 'PostgreSQL Gestionado en Servidor Cloud',
        syncStrategy: defaultStorage.includes('SQLite')
          ? 'Offline-First con resolución de conflictos por timestamp'
          : 'Transacciones relacionales ACID',
        status: 'Aprobado por Arquitectura',
        description: tableComments[rawTableName] || `Entidad de datos para gestión de ${cleanTitle}`,
        linkedStory: null,
        linkedInterface: null,
        author: 'Importador SQL',
        isNewlyImported: true,
        approvedAt: new Date().toISOString().split('T')[0],
        version: 'v1.0',
        attributes
      });
    }
  }

  return parsedTables;
}
