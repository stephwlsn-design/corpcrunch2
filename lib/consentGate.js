import { ACCEPTED_CONSENT_VALUE, COOKIE_CONSENT_KEY } from './cookieConsent';

/**
 * Edge-safe consent gate helpers (used by middleware).
 */

export function hasValidConsentCookie(request) {
  const value = request.cookies?.get?.(COOKIE_CONSENT_KEY)?.value;
  return value === ACCEPTED_CONSENT_VALUE;
}

export function isConsentExemptPath(pathname) {
  if (!pathname) return false;

  // Admin stays available without public consent
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true;

  // Dedicated gate page
  if (pathname === '/gate') return true;

  // Consent + lightweight tracking needed before accept
  if (pathname.startsWith('/api/visitors/consent')) return true;
  if (pathname.startsWith('/api/visitors/otto')) return true;
  if (pathname.startsWith('/api/health')) return true;

  // SEO / legal surfaces
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return true;
  if (pathname === '/privacy-policy' || pathname === '/terms-of-service') return true;
  if (pathname === '/cancellation-refund-policy') return true;

  // Framework static assets only — /_next/data must stay gated
  if (pathname.startsWith('/_next/') && !pathname.startsWith('/_next/data/')) {
    return true;
  }
  if (pathname.startsWith('/assets/')) return true;
  if (pathname === '/favicon.ico') return true;

  // Other static files (images, etc.)
  if (/\.[a-zA-Z0-9]+$/.test(pathname) && !pathname.endsWith('.html')) return true;

  return false;
}

export function isLikelySearchBot(userAgent) {
  if (!userAgent) return false;
  return /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|applebot|semrushbot|ahrefsbot|dotbot/i.test(
    userAgent
  );
}

export function buildGateRedirectUrl(request) {
  const gate = request.nextUrl.clone();
  const originalPath = `${request.nextUrl.pathname}${request.nextUrl.search || ''}`;
  gate.pathname = '/gate';
  gate.search = '';
  if (originalPath && originalPath !== '/gate') {
    gate.searchParams.set('next', originalPath);
  }
  return gate;
}
