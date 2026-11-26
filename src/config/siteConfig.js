export const SITE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SITE_URL) ||
  'https://www.pathrimonio.site'
).replace(/\/+$/, '');

export const PRIVACY_POLICY_VERSION = '2026-11';
export const CONSENT_COOKIE_NAME = 'pathrimonio-consent';
export const CONSENT_VERSION = '1.0';
export const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60; // 180 días

export const LEGAL_ENTITY = {
  brandName: 'Pathrimonio Company',
  legalName:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LEGAL_ENTITY_NAME) ||
    'Pathrimonio Company (Titular Operativo — Razón Social y RUC disponibles en contrato de servicio)',
  ruc:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LEGAL_RUC) ||
    'En trámite / Consignado en comprobante electrónico al formalizar membresía',
  address:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LEGAL_ADDRESS) ||
    'Operación remota y territorio nacional, Perú',
  country: 'Perú',
  email: 'soporte@pathrimonio.site',
  privacyEmail: 'soporte@pathrimonio.site',
  whatsappDisplay: '+51 950 293 223',
  whatsappDigits: '51950293223',
  website: SITE_URL,
  lastUpdated: '25 de noviembre de 2026'
};

export const LEGAL_ROUTES = [
  {
    path: '/legal/aviso-legal',
    slug: 'aviso-legal',
    title: 'Aviso Legal y Términos de Uso',
    shortTitle: 'Aviso Legal',
    metaTitle: 'Aviso Legal y Términos de Uso | Pathrimonio Company',
    metaDescription:
      'Condiciones generales de uso, propiedad intelectual, soberanía de datos y reglas del Programa de Socios de Pathrimonio Company ($1 USD/día por rol).'
  },
  {
    path: '/legal/privacidad',
    slug: 'privacidad',
    title: 'Política de Privacidad',
    shortTitle: 'Privacidad',
    metaTitle: 'Política de Privacidad y Datos | Pathrimonio Company',
    metaDescription:
      'Tratamiento de datos personales en el Cotizador y sesiones anónimas en FORMALIA, expiración a 7 días y ejercicio de derechos ARCO bajo la Ley N.º 29733.'
  },
  {
    path: '/legal/cookies',
    slug: 'cookies',
    title: 'Política de Cookies',
    shortTitle: 'Cookies',
    metaTitle: 'Política de Cookies y Almacenamiento | Pathrimonio',
    metaDescription:
      'Inventario transparente de cookies técnicas, almacenamiento local y scripts de analítica o marketing bloqueados por defecto en Pathrimonio Site.'
  },
  {
    path: '/legal/libro-reclamaciones',
    slug: 'libro-reclamaciones',
    title: 'Libro de Reclamaciones Virtual',
    shortTitle: 'Libro de Reclamaciones',
    metaTitle: 'Libro de Reclamaciones Virtual | Pathrimonio Company',
    metaDescription:
      'Libro de Reclamaciones Virtual de Pathrimonio Company conforme al Código de Protección y Defensa del Consumidor (Indecopi, Perú) para quejas o reclamos.'
  }
];

export const HOME_SEO = {
  path: '/',
  metaTitle: 'Pathrimonio — Software a Medida para la Economía Real',
  metaDescription:
    'Software operativo a medida desde $1 USD/día por rol. Arquitectura offline-first SQLite, mapeo con FORMALIA y soberanía total de datos para PYMEs.',
  ogImage: `${SITE_URL}/assets/images/icono_202609011609.jpg`
};

export const FORMALIA_SEO = {
  path: '/formalia',
  metaTitle: 'FORMALIA — Mapea tu negocio en carriles vivos gratis | Pathrimonio',
  metaDescription:
    'Motor conversacional gratuito FORMALIA de Pathrimonio: describe tu operación, obtén tu diagrama de carriles por rol en PNG/PDF, código PlantUML y precarga tu sistema a $1 USD/día por rol.',
  ogImage: `${SITE_URL}/assets/images/icono_202609011609.jpg`
};

export const COOKIE_INVENTORY = [
  {
    name: 'pathrimonio-consent',
    provider: 'Pathrimonio Site (Primera parte)',
    storageType: 'Cookie & localStorage',
    category: 'Necesarias / Técnicas',
    categoryId: 'necessary',
    purpose: 'Almacena la elección del usuario sobre el consentimiento de cookies y su fecha de actualización (solo se crea tras responder al banner).',
    duration: '180 días'
  },
  {
    name: 'pathrimonio_theme',
    provider: 'Pathrimonio Site (Primera parte)',
    storageType: 'localStorage',
    category: 'Necesarias / Técnicas',
    categoryId: 'necessary',
    purpose: 'Recuerda la preferencia visual de Modo Claro o Modo Oscuro para evitar parpadeos al cargar.',
    duration: 'Persistente (hasta limpieza manual)'
  },
  {
    name: 'pathrimonio_quote_wizard_v2',
    provider: 'Pathrimonio Site (Primera parte)',
    storageType: 'localStorage',
    category: 'Necesarias / Técnicas',
    categoryId: 'necessary',
    purpose: 'Conserva temporalmente el borrador de configuración de roles y canales en el Cotizador Interactivo.',
    duration: 'Persistente (reiniciable con un clic)'
  },
  {
    name: 'pathrimonio_formalia_session_v1',
    provider: 'Pathrimonio Site (Primera parte)',
    storageType: 'localStorage',
    category: 'Necesarias / Técnicas',
    categoryId: 'necessary',
    purpose: 'Guarda la sesión conversacional anónima actual en FORMALIA y el grafo de procesos mapeado.',
    duration: 'Hasta finalizar sesión o limpieza (7 días en servidor)'
  },
  {
    name: '__cf_bm / Turnstile token',
    provider: 'Cloudflare (cuando está habilitado)',
    storageType: 'Cookie técnica anti-bot',
    category: 'Necesarias / Técnicas',
    categoryId: 'necessary',
    purpose: 'Protege formularios públicos (Cotizador / FORMALIA) contra abuso automatizado y bots maliciosos.',
    duration: 'Sesión / máx. 30 minutos'
  },
  {
    name: '_ga, _ga_* / ph_* / _clck, _clsk',
    provider: 'Google Analytics 4 / PostHog / Microsoft Clarity',
    storageType: 'Cookie HTTP (Opt-in)',
    category: 'Analíticas',
    categoryId: 'analytics',
    purpose: 'Medición estadística agregada de uso de secciones públicas y rendimiento, únicamente si otorgas consentimiento expreso.',
    duration: 'Hasta 12–24 meses (bloqueadas por defecto)'
  },
  {
    name: '_fbp, _fbc, _gcl_au, li_fat_id',
    provider: 'Meta Pixel / Google Ads / LinkedIn Insight Tag',
    storageType: 'Cookie HTTP (Opt-in)',
    category: 'Marketing',
    categoryId: 'marketing',
    purpose: 'Atribución de campañas informativas y remarketing ético, únicamente si aceptas cookies de marketing.',
    duration: 'Hasta 90 días (bloqueadas por defecto)'
  }
];

export function getSeoForPath(pathname = '/') {
  const cleanPath = normalizePathname(pathname);
  if (cleanPath === '/formalia') {
    return {
      path: FORMALIA_SEO.path,
      title: FORMALIA_SEO.metaTitle,
      description: FORMALIA_SEO.metaDescription,
      canonical: `${SITE_URL}${FORMALIA_SEO.path}`,
      ogImage: FORMALIA_SEO.ogImage,
      isLegal: false,
      legalRoute: null
    };
  }
  const legal = LEGAL_ROUTES.find((r) => r.path === cleanPath);
  if (legal) {
    return {
      path: legal.path,
      title: legal.metaTitle,
      description: legal.metaDescription,
      canonical: `${SITE_URL}${legal.path}`,
      ogImage: HOME_SEO.ogImage,
      isLegal: true,
      legalRoute: legal
    };
  }
  return {
    path: '/',
    title: HOME_SEO.metaTitle,
    description: HOME_SEO.metaDescription,
    canonical: `${SITE_URL}/`,
    ogImage: HOME_SEO.ogImage,
    isLegal: false,
    legalRoute: null
  };
}

export function normalizePathname(pathname = '/') {
  if (!pathname) return '/';
  let clean = pathname.split('?')[0].split('#')[0].trim();
  if (!clean.startsWith('/')) clean = `/${clean}`;
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean || '/';
}
