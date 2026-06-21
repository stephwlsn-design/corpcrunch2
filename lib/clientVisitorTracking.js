import { hasAnalyticsConsent } from './cookieConsent';

export async function trackVisitorEvent(payload = {}) {
  if (typeof window === 'undefined') return null;
  if (!hasAnalyticsConsent()) return null;

  try {
    const response = await fetch('/api/visitors/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        url: payload.url || window.location.pathname + window.location.search,
        title: payload.title || document.title,
        referrer: payload.referrer || document.referrer || '',
        name: payload.name,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        location: payload.location,
        source: payload.source || 'pageview',
        userId: payload.userId,
      }),
    });

    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.warn('[visitor tracking]', error);
    return null;
  }
}

export function trackPageView() {
  return trackVisitorEvent({ source: 'pageview' });
}
