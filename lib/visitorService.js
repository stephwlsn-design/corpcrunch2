import SiteVisitor from '@/models/SiteVisitor';

const MAX_STORED_PAGE_VIEWS = 50;

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || null;
}

export function getGeoFromRequest(req) {
  const city = decodeHeader(req.headers['x-vercel-ip-city']);
  const country = decodeHeader(req.headers['x-vercel-ip-country']);
  const region = decodeHeader(req.headers['x-vercel-ip-country-region']);

  const locationParts = [city, region, country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : null;

  return { city, country, region, location };
}

function decodeHeader(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getVisitorIdFromCookies(req) {
  const cookie = req.headers?.cookie || '';
  const match = cookie.match(/(?:^|; )cc_visitor_id=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getOttoVisitorIdFromCookies(req) {
  const cookie = req.headers?.cookie || '';
  const match = cookie.match(/(?:^|; )cc_otto_visitor_id=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function shouldRecordPageView(consentStatus) {
  return consentStatus === 'accepted' || consentStatus === 'otto';
}

export function hasConsentFromCookies(req) {
  const cookie = req.headers?.cookie || '';
  return /(?:^|; )cc_cookie_consent=accepted(?:;|$)/.test(cookie);
}

function buildName(firstName, lastName, name) {
  if (name?.trim()) return name.trim();
  const combined = [firstName, lastName].filter(Boolean).join(' ').trim();
  return combined || null;
}

export async function upsertSiteVisitor({
  visitorId,
  name,
  firstName,
  lastName,
  email,
  phoneNumber,
  location,
  city,
  country,
  region,
  ipAddress,
  userAgent,
  consentStatus = 'accepted',
  source = 'pageview',
  url,
  title,
  referrer,
  userId,
}) {
  if (!visitorId) {
    throw new Error('visitorId is required');
  }

  const now = new Date();
  const resolvedName = buildName(firstName, lastName, name);
  const normalizedEmail = email?.trim().toLowerCase() || null;

  const existing = await SiteVisitor.findOne({ visitorId });

  if (!existing) {
    const pageViews =
      url && shouldRecordPageView(consentStatus)
        ? [{ url, title: title || '', referrer: referrer || '', viewedAt: now }]
        : [];

    return SiteVisitor.create({
      visitorId,
      name: resolvedName,
      email: normalizedEmail,
      phoneNumber: phoneNumber?.trim() || null,
      location: location || null,
      city: city || null,
      country: country || null,
      region: region || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      consentStatus,
      consentAt: consentStatus === 'accepted' ? now : null,
      source,
      pageViews,
      pageViewCount: pageViews.length,
      firstSeenAt: now,
      lastSeenAt: now,
      userId: userId || null,
    });
  }

  const updates = {
    lastSeenAt: now,
    consentStatus,
    consentAt:
      consentStatus === 'accepted'
        ? existing.consentAt || now
        : existing.consentAt || null,
  };

  if (resolvedName) updates.name = resolvedName;
  if (normalizedEmail) updates.email = normalizedEmail;
  if (phoneNumber?.trim()) updates.phoneNumber = phoneNumber.trim();
  if (location) updates.location = location;
  if (city) updates.city = city;
  if (country) updates.country = country;
  if (region) updates.region = region;
  if (ipAddress) updates.ipAddress = ipAddress;
  if (userAgent) updates.userAgent = userAgent;
  if (userId) updates.userId = userId;
  if (source && source !== 'pageview') updates.source = source;

  if (url && shouldRecordPageView(consentStatus)) {
    const pageView = {
      url,
      title: title || '',
      referrer: referrer || '',
      viewedAt: now,
    };
    updates.$push = {
      pageViews: {
        $each: [pageView],
        $slice: -MAX_STORED_PAGE_VIEWS,
      },
    };
    updates.$inc = { pageViewCount: 1 };
  }

  const pushUpdate = updates.$push;
  const incUpdate = updates.$inc;
  delete updates.$push;
  delete updates.$inc;

  const updateQuery = { $set: updates };
  if (pushUpdate) updateQuery.$push = pushUpdate;
  if (incUpdate) updateQuery.$inc = incUpdate;

  return SiteVisitor.findOneAndUpdate({ visitorId }, updateQuery, { new: true });
}
