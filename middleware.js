import { NextResponse } from 'next/server';
import { isIntelligentSubdomainHostname } from './lib/intelligentSubdomain';

/**
 * Subdomain-based routing middleware.
 *
 * Allows `intelligent.corpcrunch.io` and `intelligent.corpcrunch.ai`
 * to serve the /intelligent Next.js page without changing the URL bar.
 *
 * All other traffic passes through normally.
 */
export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Strip port in development (e.g. "intelligent.localhost:3000" → "intelligent.localhost")
  const hostWithoutPort = hostname.split(':')[0];

  const isIntelligentSubdomain = isIntelligentSubdomainHostname(hostWithoutPort);

  if (isIntelligentSubdomain) {
    // Normalize /intelligent → / in the address bar (sub-routes like /intelligent/CylinderSpacer stay as-is)
    if (url.pathname === '/intelligent' || url.pathname === '/intelligent/') {
      const next = new URL('/', request.url);
      next.search = url.search;
      return NextResponse.redirect(next, 308);
    }

    // Rewrite root "/" → "/intelligent" internally (URL bar stays clean)
    if (url.pathname === '/') {
      url.pathname = '/intelligent';
      return NextResponse.rewrite(url);
    }

    // Allow static assets, API routes, and _next internals to pass through untouched
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/assets') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // For any other path on the intelligent subdomain, also serve the intelligent page
    url.pathname = '/intelligent';
    return NextResponse.rewrite(url);
  }

  // All other traffic passes through normally
  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
