import { PRIMARY_SITE_URL } from '@/lib/siteConfig';
import { resolveSiteBaseUrl } from '@/lib/siteUrl';
import { getSitemapData } from '@/lib/postService';

const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'about', priority: '0.8', changefreq: 'monthly' },
  { path: 'contact', priority: '0.7', changefreq: 'monthly' },
  { path: 'products', priority: '0.9', changefreq: 'weekly' },
  { path: 'intelligent', priority: '0.9', changefreq: 'weekly' },
  { path: 'events', priority: '0.9', changefreq: 'weekly' },
  { path: 'events/aix', priority: '0.7', changefreq: 'weekly' },
  { path: 'events/c3-corp-crunch-connect', priority: '0.7', changefreq: 'weekly' },
  { path: 'events/application-form', priority: '0.6', changefreq: 'monthly' },
  { path: 'blog', priority: '0.9', changefreq: 'daily' },
  { path: 'e-magazine', priority: '0.7', changefreq: 'weekly' },
  { path: 'make-article-request', priority: '0.5', changefreq: 'monthly' },
  { path: 'privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { path: 'terms-of-service', priority: '0.3', changefreq: 'yearly' },
  { path: 'cancellation-refund-policy', priority: '0.3', changefreq: 'yearly' },
];

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

function generateSiteMap({ posts, categories }, baseUrl = PRIMARY_SITE_URL) {
  const normalizedBase = baseUrl.replace(/\/$/, '');

  const staticEntries = STATIC_PAGES.map((page) =>
    urlEntry({
      loc: page.path ? `${normalizedBase}/${page.path}` : `${normalizedBase}/`,
      lastmod: new Date(),
      changefreq: page.changefreq,
      priority: page.priority,
    })
  );

  const categoryEntries = categories.map((category) =>
    urlEntry({
      loc: `${normalizedBase}/${category.slug}`,
      lastmod: category.lastmod,
      changefreq: 'daily',
      priority: '0.8',
    })
  );

  const postEntries = posts.map((post) =>
    urlEntry({
      loc: `${normalizedBase}${post.path}`,
      lastmod: post.lastmod,
      changefreq: 'weekly',
      priority: '0.7',
    })
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...staticEntries, ...categoryEntries, ...postEntries].join('')}
</urlset>`;
}

export async function getServerSideProps({ req, res }) {
  const baseUrl = resolveSiteBaseUrl(req?.headers?.host || '');

  try {
    const sitemapData = await getSitemapData();
    const sitemap = generateSiteMap(sitemapData, baseUrl);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const fallback = generateSiteMap({ posts: [], categories: [] }, baseUrl);
    res.setHeader('Content-Type', 'text/xml');
    res.write(fallback);
    res.end();
  }

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
