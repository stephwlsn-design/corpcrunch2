/**
 * Central config for pages that should appear in sitemap.xml and be crawlable.
 */

export const NON_INDEXABLE_EXACT_PATHS = new Set([
  '/signin',
  '/register',
  '/profile',
  '/payment',
  '/subscribe',
  '/gate',
  '/500',
  '/404',
  '/robots.txt',
  '/intelligent/CylinderSpacer',
  '/intelligent/RingsSpacer',
]);

/** Paths excluded from the XML sitemap (not necessarily robots Disallow). */
export const NON_INDEXABLE_PREFIXES = [
  '/admin',
  '/api',
  '/_next',
];

/**
 * robots.txt Disallow list.
 * Allow /_next/static and /_next/image so crawlers can render CSS/JS.
 */
export const ROBOTS_DISALLOW_PREFIXES = [
  '/admin/',
  '/api/',
  '/_next/data/',
];

export const ROBOTS_ALLOW_PATHS = ['/_next/static/', '/_next/image'];

/** Per-route SEO hints. Keys are paths without leading slash ('' = homepage). */
export const STATIC_PAGE_OVERRIDES = {
  '': { priority: '1.0', changefreq: 'daily' },
  about: { priority: '0.8', changefreq: 'monthly' },
  contact: { priority: '0.7', changefreq: 'monthly' },
  products: { priority: '0.9', changefreq: 'weekly' },
  intelligent: { priority: '0.9', changefreq: 'weekly' },
  events: { priority: '0.9', changefreq: 'weekly' },
  'events/aix': { priority: '0.8', changefreq: 'weekly' },
  'events/c3-corp-crunch-connect': { priority: '0.8', changefreq: 'weekly' },
  'events/application-form': { priority: '0.6', changefreq: 'monthly' },
  blog: { priority: '0.9', changefreq: 'daily' },
  'e-magazine': { priority: '0.7', changefreq: 'weekly' },
  magazine: { priority: '0.7', changefreq: 'weekly' },
  'make-article-request': { priority: '0.5', changefreq: 'monthly' },
  'privacy-policy': { priority: '0.3', changefreq: 'yearly' },
  'terms-of-service': { priority: '0.3', changefreq: 'yearly' },
  'cancellation-refund-policy': { priority: '0.3', changefreq: 'yearly' },
  politics: { priority: '0.8', changefreq: 'daily' },
  technology: { priority: '0.8', changefreq: 'daily' },
  retail: { priority: '0.8', changefreq: 'daily' },
  'sport-tech': { priority: '0.8', changefreq: 'daily' },
  sportstech: { priority: '0.8', changefreq: 'daily' },
  sustainability: { priority: '0.8', changefreq: 'daily' },
  telecom: { priority: '0.8', changefreq: 'daily' },
  automobile: { priority: '0.8', changefreq: 'daily' },
  fmcg: { priority: '0.8', changefreq: 'daily' },
  finance: { priority: '0.8', changefreq: 'daily' },
  science: { priority: '0.8', changefreq: 'daily' },
  'digital-retail': { priority: '0.8', changefreq: 'daily' },
  'data-insights': { priority: '0.8', changefreq: 'daily' },
  'fintech-growth': { priority: '0.8', changefreq: 'daily' },
  'market-analysis': { priority: '0.8', changefreq: 'daily' },
  'cyber-security': { priority: '0.8', changefreq: 'daily' },
  'ai-innovation': { priority: '0.8', changefreq: 'daily' },
  'strategic-planning': { priority: '0.8', changefreq: 'daily' },
  'cloud-solutions': { priority: '0.8', changefreq: 'daily' },
};

export const DEFAULT_STATIC_PAGE = {
  priority: '0.7',
  changefreq: 'weekly',
};

export function normalizeSitemapPath(path = '/') {
  if (!path || path === '/') return '';
  return String(path).replace(/^\/+/, '').replace(/\/+$/, '');
}

export function toSitemapUrlPath(path = '/') {
  const normalized = normalizeSitemapPath(path);
  return normalized ? `/${normalized}` : '/';
}

export function isIndexablePath(path = '/') {
  const urlPath = toSitemapUrlPath(path);

  if (NON_INDEXABLE_EXACT_PATHS.has(urlPath)) {
    return false;
  }

  return !NON_INDEXABLE_PREFIXES.some((prefix) => urlPath.startsWith(prefix));
}

export function getStaticPageMeta(path = '/') {
  const key = normalizeSitemapPath(path);
  return STATIC_PAGE_OVERRIDES[key] || DEFAULT_STATIC_PAGE;
}

export function getRobotsDisallowedPaths() {
  return [
    ...ROBOTS_DISALLOW_PREFIXES,
    ...Array.from(NON_INDEXABLE_EXACT_PATHS).filter((path) => path !== '/robots.txt'),
  ];
}

export function getRobotsAllowedPaths() {
  return [...ROBOTS_ALLOW_PATHS];
}
