import { upsertSiteVisitor, getGeoFromRequest, getClientIp, getVisitorIdFromCookies, hasConsentFromCookies } from '@/lib/visitorService';

export async function recordVisitorFromRequest(req, payload = {}) {
  if (!hasConsentFromCookies(req)) return null;

  const visitorId = getVisitorIdFromCookies(req);
  if (!visitorId) return null;

  const geo = getGeoFromRequest(req);

  return upsertSiteVisitor({
    visitorId,
    consentStatus: 'accepted',
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
    city: geo.city,
    country: geo.country,
    region: geo.region,
    location: payload.location || geo.location,
    ...payload,
  });
}
