export const COOKIE_CONSENT_KEY = 'cc_cookie_consent';
export const VISITOR_ID_KEY = 'cc_visitor_id';
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

let cachedConsentStatus = null;

export function setCachedConsentStatus(status) {
  cachedConsentStatus = status;
}

export function getCookieValue(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearClientCookie(name) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

/** Non-sensitive preference cookies (language, location) — client-readable. */
export function setClientPreferenceCookie(name, value, maxAge = COOKIE_CONSENT_MAX_AGE) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function generateVisitorId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getConsentStatus() {
  return cachedConsentStatus;
}

export function hasAnalyticsConsent() {
  return cachedConsentStatus === 'accepted';
}

export async function fetchConsentFromServer() {
  if (typeof window === 'undefined') return null;
  try {
    const response = await fetch('/api/visitors/consent', { credentials: 'include' });
    if (!response.ok) return null;
    const data = await response.json();
    return data.consent || null;
  } catch {
    return null;
  }
}

export async function persistConsentToServer(action, options = {}) {
  if (typeof window === 'undefined') return null;
  try {
    const body = { action };
    if (options.visitorId) {
      body.visitorId = options.visitorId;
    }

    const response = await fetch('/api/visitors/consent', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.consent || null;
  } catch {
    return null;
  }
}

export function enableGoogleAnalytics() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
  });
  window.gtag('config', 'G-8MJ7BXCFYK', { anonymize_ip: true });
}

export function denyGoogleAnalytics() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
  });
}
