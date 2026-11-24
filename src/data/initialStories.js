import { PATHRIMONIO_SITE_STORIES } from './pathrimonioSiteData.js';

export const INITIAL_STORIES = [
  // ── Proyecto: Pathway (App MVP) ──
  {
    id: "US-201",
    projectId: "pathway",
    module: "Metas & Hábitos (Pathway)",
    priority: "Alta",
    status: "Aprobado por PO",
    role: "Usuario enfocado en superación",
    action: "registrar una meta grande con fecha límite estimada y asignarle un color de acento representativo",
    benefit: "tenga un propósito claro y medible que pueda consultar todos los días en mi celular.",
    criteria: [
      { id: "c1", text: "Título obligatorio de mínimo 5 caracteres", checked: true },
      { id: "c2", text: "Selector de color de meta con contraste accesible", checked: true },
      { id: "c3", text: "Almacenamiento offline en SQLite local", checked: true }
    ],
    attachmentsCount: 1,
    attachmentName: "pathway_goal_mockup_v1.png",
    author: "Jhan C.",
    createdAt: "Hoy",
    image: null
  },
  {
    id: "US-202",
    projectId: "pathway",
    module: "Pasos & Hitos",
    priority: "Bloqueante",
    status: "Aprobado por PO",
    role: "Usuario con metas complejas",
    action: "desglosar mi gran meta en pasos ordenados secuencialmente y marcar cada hito completado",
    benefit: "pueda avanzar paso a paso sin sentirme abrumado por la magnitud del objetivo final.",
    criteria: [
      { id: "c1", text: "Línea de tiempo vertical con nodos interactivos", checked: true },
      { id: "c2", text: "Cálculo en tiempo real del % de avance general", checked: true },
      { id: "c3", text: "Feedback háptico al completar cada paso en móvil", checked: false }
    ],
    attachmentsCount: 2,
    attachmentName: "step_roadmap_spec.png",
    author: "Elena Morales",
    createdAt: "Ayer",
    image: null
  },
  {
    id: "US-203",
    projectId: "pathway",
    module: "Bitácora de Progreso",
    priority: "Media",
    status: "Draft",
    role: "Usuario constante",
    action: "registrar una reflexión diaria rápida con mi estado de ánimo asociado a mis metas",
    benefit: "mantenga la motivación a lo largo de las semanas y aprenda de mis propios patrones de avance.",
    criteria: [
      { id: "c1", text: "Registro con timestamp automático inmutable", checked: true },
      { id: "c2", text: "Selector de ánimo con iconos visuales", checked: true }
    ],
    attachmentsCount: 0,
    attachmentName: null,
    author: "Jhan C.",
    createdAt: "Hace 2 días",
    image: null
  },

  // ── Proyecto: Core Banking & Impact Hub ──
  {
    id: "US-101",
    projectId: "core-hub",
    module: "Gestión de Crédito",
    priority: "Bloqueante",
    status: "Aprobado por PO",
    role: "Oficial de Crédito Comunitario",
    action: "desembolsar fondos a grupos solidarios con verificación multifactorial offline",
    benefit: "los desembolsos no se detengan por caídas de red eléctrica o telecomunicaciones en áreas periféricas.",
    criteria: [
      { id: "c1", text: "Token OTP con sincronización temporal TOTP", checked: true },
      { id: "c2", text: "Cifrado AES-256 en base local SQLite", checked: true },
      { id: "c3", text: "Límite de desembolso offline por oficial: $5,000 USD", checked: true }
    ],
    attachmentsCount: 2,
    attachmentName: "wireframe_offline_flow_v2.png",
    author: "Sofía V. (Fintech Lead)",
    createdAt: "Hace 2 horas",
    image: null
  },
  {
    id: "US-102",
    projectId: "core-hub",
    module: "Autenticación & KYC",
    priority: "Alta",
    status: "Under Review",
    role: "Beneficiario de Cooperativa Rural",
    action: "validar mi identidad mediante huella dactilar o token SMS sin claves alfanuméricas complejas",
    benefit: "personas de la tercera edad o con baja alfabetización digital accedan al crédito sin fricción ni dependencia de terceros.",
    criteria: [
      { id: "c1", text: "Compatibilidad con lectores USB OTG estándar", checked: true },
      { id: "c2", text: "Fallback a llamada de voz automatizada en quechua/español", checked: true },
      { id: "c3", text: "Registro seguro de consentimiento informado con firma táctil", checked: false },
      { id: "c4", text: "Resincronización biométrica periódica contra RENIEC", checked: false }
    ],
    attachmentsCount: 1,
    attachmentName: "spec_biometria_peru.pdf",
    author: "Carlos D.",
    createdAt: "Hace 4 horas",
    image: null
  },
  {
    id: "US-103",
    projectId: "core-hub",
    module: "Pasarela de Pagos",
    priority: "Media",
    status: "Draft",
    role: "Auditor de Impacto Social",
    action: "exportar balances consolidados con trazabilidad criptográfica SHA-256 en formato CSV y PDF",
    benefit: "los comités comunales puedan verificar el destino exacto de los fondos en asambleas públicas mensuales.",
    criteria: [
      { id: "c1", text: "Firma hash SHA-256 por cada lote liquidado", checked: true },
      { id: "c2", text: "Exportación compatible con auditorías de Contraloría", checked: true }
    ],
    attachmentsCount: 0,
    attachmentName: null,
    author: "Elena Morales",
    createdAt: "Ayer",
    image: null
  },
  {
    id: "US-104",
    projectId: "core-hub",
    module: "Reportes de Impacto",
    priority: "Baja",
    status: "Approved",
    role: "Coordinadora de Programa",
    action: "visualizar en un mapa térmico las microempresas activas financiadas por zona geográfica",
    benefit: "podamos priorizar brigadas de capacitación técnica y asistencia agronómica en distritos vulnerables.",
    criteria: [
      { id: "c1", text: "Capa georreferenciada con coordenadas UTM", checked: true },
      { id: "c2", text: "Filtro dinámico por cultivo y etapa de cosecha", checked: true }
    ],
    attachmentsCount: 3,
    attachmentName: "cusco_microcredits_geojson.json",
    author: "Mariana R.",
    createdAt: "Hace 2 días",
    image: "/assets/images/map-preview.png",
    imageMeta: "142 Cooperativas Georreferenciadas (Cusco & Puno)"
  },

  // ── Proyecto: Sistema de Gestión & Ventas (portal-admin) ──
  {
    id: "US-301",
    projectId: "portal-admin",
    module: "Gestión & Monitoreo",
    priority: "Alta",
    status: "Aprobado por PO",
    role: "Administrador General",
    action: "monitorear ventas, ingresos, egresos y alertas de inventario en tiempo real desde un dashboard centralizado",
    benefit: "la gerencia pueda tomar decisiones comerciales de reabastecimiento antes de que se agote el stock crítico.",
    criteria: [
      { id: "c1", text: "Métricas en vivo de ventas del día e ingresos del mes", checked: true },
      { id: "c2", text: "Panel de alertas para productos con menos de 5 unidades", checked: true },
      { id: "c3", text: "Restricción de acceso exclusivo al rol Administrador", checked: true }
    ],
    attachmentsCount: 1,
    attachmentName: "dashboard_admin_spec.png",
    author: "Carlos D.",
    createdAt: "Hoy",
    image: null
  },
  ...PATHRIMONIO_SITE_STORIES
];

export const MODULE_OPTIONS = [
  "Todos",
  "Metas & Hábitos (Pathway)",
  "Pasos & Hitos",
  "Bitácora de Progreso",
  "Gestión de Crédito",
  "Autenticación & KYC",
  "Pasarela de Pagos",
  "Reportes de Impacto",
  "Gestión & Monitoreo"
];

export const ROLE_SUGGESTIONS = [
  "Usuario de Metas",
  "Administrador General",
  "Oficial de Crédito Comunitario",
  "Beneficiario Rural",
  "Auditor de Impacto",
  "Coordinadora de Programa"
];
