import { NextResponse } from 'next/server';
import { isIntelligentSubdomainHostname } from './lib/intelligentSubdomain';
import {
  hasValidConsentCookie,
  isConsentExemptPath,
  isLikelySearchBot,
  buildGateRedirectUrl,
} from './lib/consentGate';

/**
 * Subdomain routing + hard cookie-consent gate.
 * Public pages/APIs are not served without cc_cookie_consent=accepted_v2.
 */
export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const hostWithoutPort = hostname.split(':')[0];
  const pathname = url.pathname || '/';
  const userAgent = request.headers.get('user-agent') || '';

  // Canonicalize apex → www so admin localStorage stays on one origin
  if (
    hostWithoutPort === 'corpcrunch.io' ||
    hostWithoutPort === 'corpcrunch.ai'
  ) {
    const next = request.nextUrl.clone();
    next.hostname = `www.${hostWithoutPort}`;
    return NextResponse.redirect(next, 308);
  }

  const isIntelligentSubdomain = isIntelligentSubdomainHostname(hostWithoutPort);

  // Consent gate (skip for bots, exempt paths, and valid accepted_v2 cookie)
  const consentOk = hasValidConsentCookie(request);
  const exempt = isConsentExemptPath(pathname);
  const isBot = isLikelySearchBot(userAgent);

  if (!consentOk && !exempt && !isBot) {
    // Block non-exempt APIs with 403 (do not redirect JSON clients to HTML)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cookie consent and contact details are required.',
          requiresContact: true,
        },
        { status: 403 }
      );
    }

    // Client-side data fetches for pages
    if (pathname.startsWith('/_next/data/')) {
      const gate = buildGateRedirectUrl(request);
      return NextResponse.redirect(gate, 307);
    }

    return NextResponse.redirect(buildGateRedirectUrl(request), 307);
  }

  if (isIntelligentSubdomain) {
    if (url.pathname === '/intelligent' || url.pathname === '/intelligent/') {
      const next = new URL('/', request.url);
      next.search = url.search;
      return NextResponse.redirect(next, 308);
    }

    if (url.pathname === '/') {
      url.pathname = '/intelligent';
      return NextResponse.rewrite(url);
    }

    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/assets') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    url.pathname = '/intelligent';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
