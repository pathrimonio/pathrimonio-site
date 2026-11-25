const DEFAULT_SITE_URL = (
  process.env.VITE_SITE_URL || 'https://www.pathrimonio.site'
).replace(/\/+$/, '');

export default function handler(req, res) {
  const vercelEnv = (process.env.VERCEL_ENV || '').toLowerCase();
  const siteEnv = (
    process.env.VITE_SITE_ENV ||
    process.env.NEXT_PUBLIC_SITE_ENV ||
    process.env.NODE_ENV ||
    ''
  ).toLowerCase();
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();

  const isPreviewSubdomain =
    host.endsWith('.vercel.app') && host !== 'pathrimonio-site.vercel.app';
  const isProdHost = host === 'www.pathrimonio.site' || host === 'pathrimonio.site';

  const isStagingOrPreview =
    siteEnv === 'preview' ||
    siteEnv === 'staging' ||
    siteEnv === 'development' ||
    vercelEnv === 'preview' ||
    vercelEnv === 'development' ||
    isPreviewSubdomain;

  const allowCrawl =
    (vercelEnv === 'production' || siteEnv === 'production' || isProdHost) &&
    !isStagingOrPreview;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');

  if (!allowCrawl) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(200).send(['User-agent: *', 'Disallow: /', ''].join('\n'));
  }

  return res.status(200).send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      'Disallow: /admin/',
      'Disallow: /formalia/sessions/',
      '',
      `Sitemap: ${DEFAULT_SITE_URL}/sitemap.xml`,
      ''
    ].join('\n')
  );
}
