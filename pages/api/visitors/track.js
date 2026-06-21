import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import {
  getClientIp,
  getGeoFromRequest,
  upsertSiteVisitor,
  getVisitorIdFromCookies,
  hasConsentFromCookies,
} from '@/lib/visitorService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!hasConsentFromCookies(req)) {
    return res.status(200).json({ success: true, skipped: true, message: 'Tracking skipped without consent' });
  }

  const visitorId = getVisitorIdFromCookies(req);
  if (!visitorId || typeof visitorId !== 'string') {
    return res.status(400).json({ success: false, message: 'Visitor cookie is required' });
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
    console.warn('[API /visitors/track] Rate limiting error:', err.message);
  }

  const {
    name,
    firstName,
    lastName,
    email,
    phoneNumber,
    location,
    source,
    url,
    title,
    referrer,
    userId,
  } = req.body || {};

  try {
    await connectDB();

    const geo = getGeoFromRequest(req);
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || null;

    const visitor = await upsertSiteVisitor({
      visitorId: visitorId.trim(),
      name,
      firstName,
      lastName,
      email,
      phoneNumber,
      location: location || geo.location,
      city: geo.city,
      country: geo.country,
      region: geo.region,
      ipAddress,
      userAgent,
      consentStatus: 'accepted',
      source: source || 'pageview',
      url,
      title,
      referrer,
      userId,
    });

    return res.status(200).json({
      success: true,
      visitorId: visitor.visitorId,
    });
  } catch (error) {
    console.error('[API /visitors/track] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record visitor data' });
  }
}
