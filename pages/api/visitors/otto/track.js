import connectDB from '@/lib/mongoose';
import { generateVisitorId } from '@/lib/cookieConsent';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { buildVisitorCookie, appendSetCookie, OTTO_VISITOR_ID_KEY } from '@/lib/visitorCookies';
import {
  getClientIp,
  getGeoFromRequest,
  upsertSiteVisitor,
  getOttoVisitorIdFromCookies,
} from '@/lib/visitorService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rateLimitResult = await publicRateLimiter(req);
    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', rateLimitResult.retryAfter);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
      });
    }
  } catch (err) {
    console.warn('[API /visitors/otto/track] Rate limiting error:', err.message);
  }

  let visitorId = getOttoVisitorIdFromCookies(req);
  if (!visitorId) {
    visitorId = generateVisitorId();
    appendSetCookie(res, buildVisitorCookie(OTTO_VISITOR_ID_KEY, visitorId, { req }));
  }

  const { url, title, referrer } = req.body || {};

  try {
    await connectDB();

    const geo = getGeoFromRequest(req);
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || null;

    const visitor = await upsertSiteVisitor({
      visitorId: visitorId.trim(),
      location: geo.location,
      city: geo.city,
      country: geo.country,
      region: geo.region,
      ipAddress,
      userAgent,
      consentStatus: 'otto',
      source: 'otto',
      url,
      title,
      referrer,
    });

    return res.status(200).json({
      success: true,
      visitorId: visitor.visitorId,
    });
  } catch (error) {
    console.error('[API /visitors/otto/track] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record Otto visitor data' });
  }
}
