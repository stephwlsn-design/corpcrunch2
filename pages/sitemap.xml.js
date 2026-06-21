import { PRIMARY_SITE_URL } from '@/lib/siteConfig';
import { resolveSiteBaseUrl } from '@/lib/siteUrl';
import { getFullSitemapData } from '@/lib/sitemapService';

function formatLastmod(date) {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${formatLastmod(lastmod)}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;
}

function generateSiteMap(entries, baseUrl = PRIMARY_SITE_URL) {
  const normalizedBase = baseUrl.replace(/\/$/, '');

  const urlEntries = entries.map((entry) =>
    urlEntry({
      loc: entry.path ? `${normalizedBase}/${entry.path}` : `${normalizedBase}/`,
      lastmod: entry.lastmod,
      changefreq: entry.changefreq,
      priority: entry.priority,
    })
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries.join('')}
</urlset>`;
}

export async function getServerSideProps({ req, res }) {
  const baseUrl = resolveSiteBaseUrl(req?.headers?.host || '');

  try {
    const { entries } = await getFullSitemapData();
    const sitemap = generateSiteMap(entries, baseUrl);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const fallback = generateSiteMap([], baseUrl);
    res.setHeader('Content-Type', 'text/xml');
    res.write(fallback);
    res.end();
  }

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
