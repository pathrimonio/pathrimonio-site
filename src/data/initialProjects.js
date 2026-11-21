export const INITIAL_PROJECTS = [
  {
    id: "pathway",
    name: "Pathway (App MVP)",
    shortName: "Pathway",
    subtitle: "Registro de Metas & Pasos Secuenciales",
    description: "Producto insignia de Pathrimonio enfocado en ayudar a las personas a definir metas claras y dividirlas en pasos ordenados. En espera de aprobación en Google Play Store.",
    category: "Producto Propio (MVP)",
    icon: "route",
    color: "amber",
    status: "En Aprobación Play Store",
    client: "Pathrimonio Labs",
    version: "v1.0.0",
    modules: ["Metas & Hábitos (Pathway)", "Pasos & Hitos", "Bitácora de Progreso", "Autenticación & Acceso"]
  },
  {
    id: "core-hub",
    name: "Core Banking & Impact Hub",
    shortName: "Core Hub",
    subtitle: "Fintech Comunitaria & Desembolsos Offline",
    description: "Plataforma sistemática de microcréditos, firma digital y auditoría criptográfica para cooperativas y comunidades remotas.",
    category: "Fintech & Impacto",
    icon: "account_balance",
    color: "blue",
    status: "Sprint 14 Activo",
    client: "Cooperativas Andinas",
    version: "v2.4.0",
    modules: ["Gestión de Crédito", "Autenticación & KYC", "Pasarela de Pagos", "Reportes de Impacto"]
  },
  {
    id: "portal-admin",
    name: "Sistema de Gestión & Ventas",
    shortName: "Gestión ERP",
    subtitle: "Dashboard Administrativo & Alertas en Vivo",
    description: "Solución de software a medida para monitoreo en tiempo real de ventas, inventario crítico, ingresos, egresos y accesos de administración.",
    category: "Software a Medida",
    icon: "dashboard",
    color: "emerald",
    status: "Fase de Diseño UI",
    client: "Empresa Aliada",
    version: "v0.8.2",
    modules: ["Gestión & Monitoreo", "Inventario & Alertas", "Finanzas & Reportes", "Configuración"]
  }
];

export const PROJECT_CATEGORIES = [
  "Producto Propio (MVP)",
  "Software a Medida",
  "Fintech & Impacto",
  "Plataforma Web / SaaS",
  "App Móvil Nativa"
];

export const PROJECT_ICONS = [
  "route",
  "dashboard",
  "account_balance",
  "smartphone",
  "web",
  "inventory_2",
  "analytics",
  "rocket_launch",
  "cloud",
  "lock"
];
