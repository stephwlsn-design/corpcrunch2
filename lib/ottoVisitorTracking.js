export async function trackOttoPageView(payload = {}) {
  if (typeof window === 'undefined') return null;

  try {
    const response = await fetch('/api/visitors/otto/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        url: payload.url || window.location.pathname + window.location.search,
        title: payload.title || document.title,
        referrer: payload.referrer || document.referrer || '',
        source: 'otto',
      }),
    });

    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.warn('[otto visitor tracking]', error);
    return null;
  }
}
