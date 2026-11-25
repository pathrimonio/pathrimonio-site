const SITE_URL = (
  process.env.VITE_SITE_URL || 'https://www.pathrimonio.site'
).replace(/\/+$/, '');

const BUILD_LASTMOD = '2026-11-25';

const INDEXABLE_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/legal/aviso-legal', changefreq: 'monthly', priority: '0.5' },
  { path: '/legal/privacidad', changefreq: 'monthly', priority: '0.5' },
  { path: '/legal/cookies', changefreq: 'monthly', priority: '0.5' },
  { path: '/legal/libro-reclamaciones', changefreq: 'monthly', priority: '0.4' }
];

export default function handler(_req, res) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...INDEXABLE_ROUTES.map(
      (route) =>
        `  <url>\n    <loc>${SITE_URL}${route.path}</loc>\n    <lastmod>${BUILD_LASTMOD}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    ),
    '</urlset>',
    ''
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return res.status(200).send(xml);
}
