export const INITIAL_STORIES = [
  {
    id: "US-101",
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
  }
];

export const MODULE_OPTIONS = [
  "Todos",
  "Gestión de Crédito",
  "Autenticación & KYC",
  "Pasarela de Pagos",
  "Reportes de Impacto"
];

export const ROLE_SUGGESTIONS = [
  "Oficial de Crédito Comunitario",
  "Beneficiario Rural",
  "Auditor de Impacto",
  "Administrador",
  "Coordinadora de Programa",
  "Líder de Cooperativa"
];
