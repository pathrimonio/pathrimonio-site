// Catálogo Inicial de Archivos y Entregables del Proyecto
// Permite gestionar documentación técnica, especificaciones PRD, binarios/APKs,
// diseños Figma, wireframes, scripts SQL y actas de aprobación por software.

export const FILE_CATEGORY_OPTIONS = [
  "Todas",
  "Builds & Entregables (APKs / Releases)",
  "Documentación & PRD",
  "Diseños & Prototipos (UI/UX)",
  "Arquitectura & SQL",
  "Actas & Aprobaciones",
  "Recursos & Multimedia"
];

export const FILE_STATUS_OPTIONS = [
  "Todos",
  "Vigente / Oficial",
  "En Revisión",
  "Aprobado por Cliente",
  "Borrador",
  "Histórico / Obsoleto"
];

// Helper to determine file icon and color theme based on format or category
export function getFileVisualInfo(filename = '', category = '') {
  const lowerName = String(filename || '').toLowerCase();
  const baseName = lowerName.split('/').pop() || lowerName;
  const ext = baseName.startsWith('.env')
    ? 'env'
    : baseName === 'dockerfile' || baseName.startsWith('dockerfile.')
      ? 'dockerfile'
      : baseName === 'makefile' || baseName.startsWith('makefile.')
        ? 'makefile'
        : (baseName.split('.').pop() || '');

  switch (ext) {
    case 'apk':
    case 'aab':
      return {
        icon: 'android',
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        label: 'Android Binary (APK)'
      };
    case 'pdf':
      return {
        icon: 'picture_as_pdf',
        colorClass: 'text-red-400 bg-red-500/10 border-red-500/30',
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
        label: 'Documento PDF'
      };
    case 'sql':
    case 'ddl':
      return {
        icon: 'database',
        colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        label: 'Script SQL / DDL'
      };
    case 'fig':
    case 'figma':
      return {
        icon: 'palette',
        colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        label: 'Diseño Figma'
      };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'webp':
      return {
        icon: 'image',
        colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'Imagen / Mockup'
      };
    case 'xlsx':
    case 'xls':
    case 'csv':
      return {
        icon: 'table_view',
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        label: 'Hoja de Cálculo'
      };
    case 'zip':
    case 'tar':
    case 'gz':
      return {
        icon: 'folder_zip',
        colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        label: 'Paquete Comprimido'
      };
    case 'puml':
      return {
        icon: 'account_tree',
        colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        label: 'Diagrama PlantUML'
      };
    case 'json':
      return {
        icon: 'data_object',
        colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'Estructura JSON'
      };
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'mjs':
    case 'cjs':
      return {
        icon: 'code',
        colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        label: 'Código JS / TS'
      };
    case 'py':
      return {
        icon: 'terminal',
        colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        label: 'Python'
      };
    case 'java':
    case 'kt':
    case 'kts':
    case 'cs':
    case 'go':
    case 'rb':
    case 'php':
      return {
        icon: 'code',
        colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        label: 'Código Fuente'
      };
    case 'html':
    case 'htm':
      return {
        icon: 'html',
        colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        label: 'HTML'
      };
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return {
        icon: 'css',
        colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        label: 'Estilos CSS'
      };
    case 'md':
    case 'mdx':
      return {
        icon: 'article',
        colorClass: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
        badgeColor: 'bg-slate-500/20 text-slate-200 border-slate-500/40',
        label: 'Markdown'
      };
    case 'yml':
    case 'yaml':
      return {
        icon: 'settings',
        colorClass: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        label: 'Configuración YAML'
      };
    case 'env':
      return {
        icon: 'key',
        colorClass: 'text-lime-400 bg-lime-500/10 border-lime-500/30',
        badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
        label: 'Variables de Entorno'
      };
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'ps1':
    case 'bat':
    case 'cmd':
      return {
        icon: 'terminal',
        colorClass: 'text-green-400 bg-green-500/10 border-green-500/30',
        badgeColor: 'bg-green-500/20 text-green-300 border-green-500/40',
        label: 'Script de Terminal'
      };
    case 'xml':
      return {
        icon: 'code',
        colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'XML'
      };
    case 'txt':
      return {
        icon: 'description',
        colorClass: 'text-on-surface-variant bg-surface-container border-outline-variant',
        badgeColor: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
        label: 'Texto Plano'
      };
    case 'lock':
      return {
        icon: 'lock',
        colorClass: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
        badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        label: 'Lockfile'
      };
    case 'dockerfile':
      return {
        icon: 'deployed_code',
        colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        label: 'Dockerfile'
      };
    case 'makefile':
      return {
        icon: 'build',
        colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        label: 'Makefile'
      };
    default:
      return {
        icon: 'description',
        colorClass: 'text-primary bg-primary/10 border-primary/30',
        badgeColor: 'bg-primary/20 text-primary border-primary/40',
        label: ext.toUpperCase() || 'Archivo'
      };
  }
}

export const INITIAL_FILES = [
  // ══════════════════════════════════════════════════════════
  // PROYECTO: Pathway (App MVP) — id: "pathway"
  // ══════════════════════════════════════════════════════════
  {
    id: "FILE-01",
    projectId: "pathway",
    name: "Pathway_MVP_Release_v1.0.4.apk",
    category: "Builds & Entregables (APKs / Releases)",
    format: "apk",
    sizeBytes: 40265318,
    sizeFormatted: "38.4 MB",
    version: "v1.0.4-prod",
    status: "En Revisión",
    uploadedBy: "Jhan C. (Product Owner & Mobile Lead)",
    uploadedAt: "2026-11-20",
    description: "Binario de producción compilado y firmado para Android. Actualmente en proceso de revisión de Play Console para su publicación oficial en Google Play Store.",
    tags: ["Android", "Producción", "Play Store", "Release"],
    linkedEntity: "US-201 (Algoritmo de Metas)",
    downloadUrl: "#download-apk",
    contentPreview: "Binary APK file - SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
  },
  {
    id: "FILE-02",
    projectId: "pathway",
    name: "Especificacion_Tecnica_Pathway_v1.2.pdf",
    category: "Documentación & PRD",
    format: "pdf",
    sizeBytes: 4404019,
    sizeFormatted: "4.2 MB",
    version: "v1.2",
    status: "Vigente / Oficial",
    uploadedBy: "Equipo de Arquitectura",
    uploadedAt: "2026-11-19",
    description: "Documento maestro de requerimientos funcionales (PRD/SRS), arquitectura offline-first con SQLite cifrado y cálculo del avance por porcentaje de hitos completados.",
    tags: ["SRS", "Arquitectura", "Metas", "Offline-First"],
    linkedEntity: "INT-03 (Configuración de Metas)",
    downloadUrl: "#download-pdf",
    contentPreview: "SRS Document - Sistema de Registro y Descomposición de Metas Pathway. Contiene matriz de trazabilidad y casos de prueba."
  },
  {
    id: "FILE-03",
    projectId: "pathway",
    name: "Wireframes_Diseno_Metas_Habitos_v3.fig",
    category: "Diseños & Prototipos (UI/UX)",
    format: "figma",
    sizeBytes: 19503513,
    sizeFormatted: "18.6 MB",
    version: "v3.0",
    status: "Aprobado por Cliente",
    uploadedBy: "Elena Morales (Investigación UX)",
    uploadedAt: "2026-11-18",
    description: "Prototipo interactivo en Figma con el flujo de onboarding, tarjetas visuales de metas, selector de colores y micro-hábitos matutinos con tipografía Space Grotesk.",
    tags: ["Figma", "UI Kit", "Dark Mode", "Prototipo"],
    linkedEntity: "INT-01 (Móvil Principal)",
    downloadUrl: "#download-figma",
    contentPreview: "Figma File ID: 948124-pathway-ux-v3. Contiene pantallas Mobile 390x844px e interacciones animadas."
  },
  {
    id: "FILE-04",
    projectId: "pathway",
    name: "Esquema_Inicial_SQLCipher_SQLite.sql",
    category: "Arquitectura & SQL",
    format: "sql",
    sizeBytes: 126976,
    sizeFormatted: "124 KB",
    version: "v1.0",
    status: "Vigente / Oficial",
    uploadedBy: "Arquitectura de Datos",
    uploadedAt: "2026-11-18",
    description: "Script DDL SQL de inicialización para la base de datos local SQLite cifrada con AES-256 (SQLCipher): tb_metas, tb_pasos_hitos y tb_bitacora_diaria con índices foráneos.",
    tags: ["DDL", "SQLite", "SQLCipher", "Base de Datos"],
    linkedEntity: "tb_metas",
    downloadUrl: "#download-sql",
    contentPreview: `CREATE TABLE IF NOT EXISTS tb_metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    fecha_limite DATE,
    color_hex VARCHAR(7) NOT NULL DEFAULT '#10B981',
    progreso_porcentaje INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
  },

  // ══════════════════════════════════════════════════════════
  // PROYECTO: Sistema de Gestión & Ventas — id: "portal-admin"
  // ══════════════════════════════════════════════════════════
  {
    id: "FILE-05",
    projectId: "portal-admin",
    name: "TDR_Contrato_Sistema_Gestion_Comercial_v2.pdf",
    category: "Documentación & PRD",
    format: "pdf",
    sizeBytes: 2936012,
    sizeFormatted: "2.8 MB",
    version: "v2.0",
    status: "Vigente / Oficial",
    uploadedBy: "Gerencia Comercial (Cliente Encargado)",
    uploadedAt: "2026-11-20",
    description: "Términos de Referencia contractuales para el '4. Dashboard', módulo de ventas, boletas electrónicas y control preventivo de inventario con menos de 5 unidades.",
    tags: ["TDR", "Contrato", "Dashboard", "Comercial"],
    linkedEntity: "INT-04 (Dashboard)",
    downloadUrl: "#download-tdr",
    contentPreview: "TDR Contract - Alcance de entrega y validación de aceptación técnica para el módulo de ventas e inventario."
  },
  {
    id: "FILE-06",
    projectId: "portal-admin",
    name: "Dashboard_Comercial_Mockup_HighRes.png",
    category: "Diseños & Prototipos (UI/UX)",
    format: "png",
    sizeBytes: 3670016,
    sizeFormatted: "3.5 MB",
    version: "v2.1",
    status: "Aprobado por Cliente",
    uploadedBy: "Diseño UI Pathrimonio",
    uploadedAt: "2026-11-20",
    description: "Mockup visual en alta resolución aprobado por gerencia, detallando métricas de ventas totales ($48,250), ingresos, egresos y alertas críticas de stock.",
    tags: ["Mockup", "PNG", "Dashboard", "High-Res"],
    linkedEntity: "INT-04 (Dashboard)",
    downloadUrl: "#download-png",
    contentPreview: "Image preview available - Mockup del Dashboard comercial con paleta dark y acentos dorados."
  },
  {
    id: "FILE-07",
    projectId: "portal-admin",
    name: "Plantilla_Carga_Masiva_Inventario_SKU.xlsx",
    category: "Recursos & Multimedia",
    format: "xlsx",
    sizeBytes: 870400,
    sizeFormatted: "850 KB",
    version: "v1.1",
    status: "Vigente / Oficial",
    uploadedBy: "Coordinador de Bodega & Logística",
    uploadedAt: "2026-11-20",
    description: "Plantilla Excel estructurada para la importación por lotes de 500+ ítems de mercadería, incluyendo columnas para SKU, stock mínimo, precio costo y precio venta.",
    tags: ["Excel", "Inventario", "Carga Masiva", "SKU"],
    linkedEntity: "tb_inventario_alertas",
    downloadUrl: "#download-xlsx",
    contentPreview: "Excel Workbook - Contiene hojas: 'Productos', 'Categorías' y 'Reglas de Validación de Stock'."
  },
  {
    id: "FILE-08",
    projectId: "portal-admin",
    name: "DDL_PostgreSQL_Supabase_Ventas_Inventario.sql",
    category: "Arquitectura & SQL",
    format: "sql",
    sizeBytes: 98304,
    sizeFormatted: "96 KB",
    version: "v2.0",
    status: "Vigente / Oficial",
    uploadedBy: "Carlos D. (Data Lead)",
    uploadedAt: "2026-11-20",
    description: "Script DDL completo con definición de tb_ventas_transacciones y tb_inventario_alertas, vistas de agregación de ingresos diarios y función trigger para alertas automáticas.",
    tags: ["PostgreSQL", "Supabase", "Triggers", "Ventas"],
    linkedEntity: "tb_ventas_transacciones",
    downloadUrl: "#download-sql",
    contentPreview: `CREATE TABLE IF NOT EXISTS tb_ventas_transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_comprobante VARCHAR(50) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(255) NOT NULL,
    monto_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
  },

  // ══════════════════════════════════════════════════════════
  // PROYECTO: Core Banking & Impact Hub — id: "core-hub"
  // ══════════════════════════════════════════════════════════
  {
    id: "FILE-09",
    projectId: "core-hub",
    name: "Protocolo_Firma_Biometrica_Offline_SHA256.pdf",
    category: "Documentación & PRD",
    format: "pdf",
    sizeBytes: 3250585,
    sizeFormatted: "3.1 MB",
    version: "v1.0",
    status: "Aprobado por Cliente",
    uploadedBy: "Seguridad & Compliance",
    uploadedAt: "2026-11-16",
    description: "Estándar de sellado criptográfico y hash SHA-256 para validación de actas biométricas capturadas en zonas rurales sin conexión celular.",
    tags: ["Biometría", "SHA256", "Criptografía", "Seguridad"],
    linkedEntity: "US-101 (Microcréditos Offline)",
    downloadUrl: "#download-crypto",
    contentPreview: "Cryptographic Specification - Protocolo de firmas offline y sincronización asíncrona."
  },
  {
    id: "FILE-10",
    projectId: "core-hub",
    name: "Dictamen_Auditoria_Impacto_Social_Cusco_2026.pdf",
    category: "Actas & Aprobaciones",
    format: "pdf",
    sizeBytes: 1887436,
    sizeFormatted: "1.8 MB",
    version: "v1.0",
    status: "Vigente / Oficial",
    uploadedBy: "Comité de Auditoría de Impacto",
    uploadedAt: "2026-11-17",
    description: "Acta de fiscalización y trazabilidad social de los fondos comunitarios desembolsados a productores agrícolas y artesanos comuneros.",
    tags: ["Auditoría", "Impacto Social", "Cusco", "Acta"],
    linkedEntity: "US-103 (Reportes de Impacto)",
    downloadUrl: "#download-acta",
    contentPreview: "Audit Report - Certificación de cumplimiento del 100% de desembolsos en cooperativas agrarias."
  }
];
