import {
  COOKIE_CONSENT_KEY,
  VISITOR_ID_KEY,
  COOKIE_CONSENT_MAX_AGE,
  ACCEPTED_CONSENT_VALUE,
} from './cookieConsent';

export const OTTO_VISITOR_ID_KEY = 'cc_otto_visitor_id';

export { COOKIE_CONSENT_KEY, VISITOR_ID_KEY, COOKIE_CONSENT_MAX_AGE, ACCEPTED_CONSENT_VALUE };

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
  const cookieValue =
    consent === 'accepted' ? ACCEPTED_CONSENT_VALUE : consent;
  appendSetCookie(res, buildVisitorCookie(COOKIE_CONSENT_KEY, cookieValue, { req }));
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
  // Only the current consent version grants access. Legacy `accepted` is ignored.
  if (value === ACCEPTED_CONSENT_VALUE) return 'accepted';
  if (value === 'declined') return 'declined';
  return null;
}

/** Raw cookie value (for detecting legacy accepted cookies that must be cleared). */
export function getRawConsentCookie(req) {
  const cookie = req?.headers?.cookie || '';
  const match = cookie.match(/(?:^|; )cc_cookie_consent=([^;]*)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
