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
  }
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
