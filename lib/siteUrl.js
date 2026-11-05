import { PRIMARY_SITE_URL } from './siteConfig';

export const SITE_BASE_URLS = [
  'https://www.corpcrunch.io',
  'https://www.corpcrunch.ai',
];

/** Only this host should appear in search results. */
export const INDEXABLE_SITE_BASE_URL = 'https://www.corpcrunch.ai';

const DEINDEX_ROBOTS = 'noindex, nofollow';

/**
 * Resolve the canonical site base URL from the request hostname.
 * Both corpcrunch.io and corpcrunch.ai serve the same app on Vercel.
 */
export function resolveSiteBaseUrl(hostname = '') {
  const host = String(hostname).split(':')[0].toLowerCase();

  if (host === 'corpcrunch.ai' || host === 'www.corpcrunch.ai' || host.endsWith('.corpcrunch.ai')) {
    return 'https://www.corpcrunch.ai';
  }

  if (host === 'corpcrunch.io' || host === 'www.corpcrunch.io' || host.endsWith('.corpcrunch.io')) {
    return 'https://www.corpcrunch.io';
  }

  return PRIMARY_SITE_URL;
}

export function isIoSiteHostname(hostname = '') {
  const host = String(hostname).split(':')[0].toLowerCase();
  return (
    host === 'corpcrunch.io' ||
    host === 'www.corpcrunch.io' ||
    host.endsWith('.corpcrunch.io')
  );
}

export function isDeindexedSiteBaseUrl(baseUrl = '') {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return isIoSiteHostname(host);
  } catch {
    return String(baseUrl).includes('corpcrunch.io');
  }
}

export function getUrlPath(fullUrl) {
  if (!fullUrl) return '/';
  try {
    const parsed = new URL(fullUrl);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fullUrl.startsWith('/') ? fullUrl : `/${fullUrl}`;
  }
}

export function buildUrlForBase(path, baseUrl) {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath === '/' ? `${normalizedBase}/` : `${normalizedBase}${normalizedPath}`;
}

/** Hreflang / alternates only for the indexable (.ai) domain. */
export function buildCrossDomainAlternates(fullUrl) {
  const path = getUrlPath(fullUrl);
  return [buildUrlForBase(path, INDEXABLE_SITE_BASE_URL)];
}

export function localizeSeoForDomain(seo, siteBaseUrl) {
  if (!seo || !siteBaseUrl) return seo;

  const path = getUrlPath(seo.url);
  const deindexed = isDeindexedSiteBaseUrl(siteBaseUrl);
  const canonicalBase = deindexed ? INDEXABLE_SITE_BASE_URL : siteBaseUrl;
  const canonicalUrl = buildUrlForBase(path, canonicalBase);
  const primary = PRIMARY_SITE_URL.replace(/\/$/, '');
  const ioBase = 'https://www.corpcrunch.io';
  const target = canonicalBase.replace(/\/$/, '');

  const patchValue = (value) => {
    if (typeof value === 'string') {
      return value
        .split(primary)
        .join(target)
        .split(ioBase)
        .join(target)
        .split('https://corpcrunch.io')
        .join(target);
    }
    if (Array.isArray(value)) {
      return value.map(patchValue);
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, nested]) => [key, patchValue(nested)])
      );
    }
    return value;
  };

  return {
    ...seo,
    url: canonicalUrl,
    robots: deindexed ? DEINDEX_ROBOTS : seo.robots,
    jsonLd: seo.jsonLd ? patchValue(seo.jsonLd) : seo.jsonLd,
    alternateUrls: buildCrossDomainAlternates(canonicalUrl),
  };
}
