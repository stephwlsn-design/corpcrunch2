import { PRIMARY_SITE_URL } from './siteConfig';

export const SITE_BASE_URLS = [
  'https://www.corpcrunch.io',
  'https://www.corpcrunch.ai',
];

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

export function buildCrossDomainAlternates(fullUrl) {
  const path = getUrlPath(fullUrl);
  return SITE_BASE_URLS.map((base) => buildUrlForBase(path, base));
}

export function localizeSeoForDomain(seo, siteBaseUrl) {
  if (!seo || !siteBaseUrl) return seo;

  const path = getUrlPath(seo.url);
  const localizedUrl = buildUrlForBase(path, siteBaseUrl);
  const primary = PRIMARY_SITE_URL.replace(/\/$/, '');
  const current = siteBaseUrl.replace(/\/$/, '');

  const patchValue = (value) => {
    if (typeof value === 'string') {
      return value.split(primary).join(current);
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
    url: localizedUrl,
    jsonLd: seo.jsonLd ? patchValue(seo.jsonLd) : seo.jsonLd,
    alternateUrls: buildCrossDomainAlternates(localizedUrl),
  };
}
