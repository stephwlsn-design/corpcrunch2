import { COOKIE_CONSENT_KEY, VISITOR_ID_KEY, COOKIE_CONSENT_MAX_AGE } from './cookieConsent';

export const OTTO_VISITOR_ID_KEY = 'cc_otto_visitor_id';

export { COOKIE_CONSENT_KEY, VISITOR_ID_KEY, COOKIE_CONSENT_MAX_AGE };

export function shouldUseSecureCookies(req) {
  if (process.env.NODE_ENV === 'production') return true;
  const proto = req?.headers?.['x-forwarded-proto'];
  return typeof proto === 'string' && proto.split(',')[0].trim() === 'https';
}

export function buildVisitorCookie(name, value, { maxAge = COOKIE_CONSENT_MAX_AGE, req } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
    'HttpOnly',
  ];
  if (shouldUseSecureCookies(req)) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function appendSetCookie(res, cookieString) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookieString);
    return;
  }
  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieString]);
    return;
  }
  res.setHeader('Set-Cookie', [existing, cookieString]);
}

export function setVisitorCookies(res, { consent, visitorId, req }) {
  appendSetCookie(res, buildVisitorCookie(COOKIE_CONSENT_KEY, consent, { req }));
  if (visitorId) {
    appendSetCookie(res, buildVisitorCookie(VISITOR_ID_KEY, visitorId, { req }));
  }
}

export function clearVisitorCookies(res, req) {
  appendSetCookie(res, buildVisitorCookie(COOKIE_CONSENT_KEY, '', { maxAge: 0, req }));
  appendSetCookie(res, buildVisitorCookie(VISITOR_ID_KEY, '', { maxAge: 0, req }));
}

export function parseConsentFromRequest(req) {
  const cookie = req?.headers?.cookie || '';
  const match = cookie.match(/(?:^|; )cc_cookie_consent=([^;]*)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  return value === 'accepted' || value === 'declined' ? value : null;
}
