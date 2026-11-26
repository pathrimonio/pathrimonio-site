import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  getSeoForPath,
  LEGAL_ENTITY,
  LEGAL_ROUTES,
  SITE_URL
} from '../src/config/siteConfig.js';
import { FAQS } from '../src/data/faqData.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const DIST_DIR = resolve(ROOT_DIR, 'dist');
const SSR_DIR = resolve(ROOT_DIR, 'dist-ssr');

function escapeHtmlAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildStructuredData(seo) {
  if (!seo.isLegal) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: LEGAL_ENTITY.brandName,
          url: SITE_URL,
          logo: `${SITE_URL}/assets/images/icono_202609011609.jpg`,
          email: LEGAL_ENTITY.email,
          contactPoint: [
            {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: LEGAL_ENTITY.email,
              telephone: '+51950293223',
              areaServed: 'PE',
              availableLanguage: ['es']
            }
          ]
        },
        {
          '@type': 'SoftwareApplication',
          '@id': `${SITE_URL}/#software`,
          name: 'Pathrimonio — Sistema Operativo a Medida',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web, Android, Windows, Linux',
          url: SITE_URL,
          publisher: { '@id': `${SITE_URL}/#organization` },
          description: seo.description,
          offers: {
            '@type': 'Offer',
            price: '30.00',
            priceCurrency: 'USD',
            description: '$1 USD/día ($30 USD/mes) por rol operativo activo con arquitectura offline-first SQLite y soberanía de datos.'
          }
        },
        {
          '@type': 'FAQPage',
          '@id': `${SITE_URL}/#faq`,
          mainEntity: FAQS.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a
            }
          }))
        }
      ]
    };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${seo.canonical}#webpage`,
        url: seo.canonical,
        name: seo.title,
        description: seo.description,
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE_URL}/#organization` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: `${SITE_URL}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: seo.legalRoute?.title || seo.title,
            item: seo.canonical
          }
        ]
      }
    ]
  };
}

function buildSeoHeadHtml(seo) {
  const isPreviewDeploy =
    (process.env.VERCEL_ENV || '').toLowerCase() === 'preview' ||
    (process.env.VITE_SITE_ENV || '').toLowerCase() === 'preview';

  const robotsContent = isPreviewDeploy
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1';

  const structuredDataJson = JSON.stringify(buildStructuredData(seo)).replace(/</g, '\\u003c');

  return [
    `<title>${escapeHtmlAttr(seo.title)}</title>`,
    `    <meta name="description" content="${escapeHtmlAttr(seo.description)}" />`,
    `    <meta name="robots" content="${robotsContent}" />`,
    `    <link rel="canonical" href="${escapeHtmlAttr(seo.canonical)}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:locale" content="es_PE" />`,
    `    <meta property="og:site_name" content="${escapeHtmlAttr(LEGAL_ENTITY.brandName)}" />`,
    `    <meta property="og:title" content="${escapeHtmlAttr(seo.title)}" />`,
    `    <meta property="og:description" content="${escapeHtmlAttr(seo.description)}" />`,
    `    <meta property="og:url" content="${escapeHtmlAttr(seo.canonical)}" />`,
    `    <meta property="og:image" content="${escapeHtmlAttr(seo.ogImage)}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeHtmlAttr(seo.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtmlAttr(seo.description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtmlAttr(seo.ogImage)}" />`,
    `    <script type="application/ld+json">${structuredDataJson}</script>`
  ].join('\n');
}

async function run() {
  const templatePath = resolve(DIST_DIR, 'index.html');
  if (!existsSync(templatePath)) {
    throw new Error(`No existe ${templatePath}. Ejecuta primero vite build.`);
  }

  const ssrCandidates = ['entry-server.js', 'entry-server.mjs'];
  const ssrEntry = ssrCandidates
    .map((f) => resolve(SSR_DIR, f))
    .find((p) => existsSync(p));

  if (!ssrEntry) {
    throw new Error(`No se encontró bundle SSR en ${SSR_DIR}.`);
  }

  const template = readFileSync(templatePath, 'utf8');
  const { render } = await import(pathToFileURL(ssrEntry).href);

  const routesToPrerender = ['/', '/formalia', ...LEGAL_ROUTES.map((r) => r.path)];

  for (const routePath of routesToPrerender) {
    const seo = getSeoForPath(routePath);
    const appHtml = render(routePath);
    const seoHeadHtml = buildSeoHeadHtml(seo);

    const htmlWithSeo = template.replace(
      /<!--SEO_HEAD_START-->[\s\S]*?<!--SEO_HEAD_END-->/,
      seoHeadHtml
    );
    const finalHtml = htmlWithSeo.replace('<!--APP_HTML-->', appHtml);

    const outPath =
      routePath === '/'
        ? resolve(DIST_DIR, 'index.html')
        : resolve(DIST_DIR, `${routePath.replace(/^\/+/, '')}.html`);

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, finalHtml, 'utf8');
    console.log(`[prerender] OK -> ${outPath.replace(ROOT_DIR, '')} (${Buffer.byteLength(finalHtml, 'utf8')} bytes)`);
  }

  try {
    if (existsSync(SSR_DIR)) {
      rmSync(SSR_DIR, { recursive: true, force: true });
    }
  } catch (_) {
    // On Windows Node holds an open module lock on the dynamically imported SSR bundle;
    // dist-ssr sits outside dist/ and is ignored by Vercel output.
  }
}

run().catch((err) => {
  console.error('[prerender] Error:', err);
  process.exit(1);
});
