import connectDB from '@/lib/mongoose';
import SiteVisitor from '@/models/SiteVisitor';
import { generateVisitorId } from '@/lib/cookieConsent';
import {
  parseConsentFromRequest,
  setVisitorCookies,
  buildVisitorCookie,
  appendSetCookie,
  VISITOR_ID_KEY,
} from '@/lib/visitorCookies';
import {
  getVisitorIdFromCookies,
  getOttoVisitorIdFromCookies,
  getClientIp,
  getGeoFromRequest,
  getHostFromRequest,
  upsertSiteVisitor,
} from '@/lib/visitorService';

function isValidVisitorId(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  // Allow UUIDs and generated ids (letters, digits, _ - .)
  return trimmed.length > 0 && trimmed.length <= 128 && /^[a-zA-Z0-9_.-]+$/.test(trimmed);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/;

function sanitizeContact(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
  const phoneNumber =
    typeof body.phoneNumber === 'string' ? body.phoneNumber.trim().slice(0, 40) : '';

  return { name, email, phoneNumber };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const consent = parseConsentFromRequest(req);
    return res.status(200).json({
      success: true,
      consent,
      hasVisitorId: Boolean(getVisitorIdFromCookies(req)),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const action = req.body?.action;
  if (action !== 'accept' && action !== 'decline') {
    return res.status(400).json({ success: false, message: 'Invalid consent action' });
  }

  if (action === 'decline') {
    setVisitorCookies(res, { consent: 'declined', visitorId: null, req });
    appendSetCookie(res, buildVisitorCookie(VISITOR_ID_KEY, '', { maxAge: 0, req }));
    return res.status(200).json({ success: true, consent: 'declined' });
  }

  const contact = sanitizeContact(req.body);
  const wantsLegacyMigration = req.body?.legacyMigration === true;

  const visitorId =
    getVisitorIdFromCookies(req) ||
    getOttoVisitorIdFromCookies(req) ||
    (isValidVisitorId(req.body?.visitorId) ? req.body.visitorId.trim() : null) ||
    (!wantsLegacyMigration ? generateVisitorId() : null);

  if (!visitorId) {
    return res.status(400).json({ success: false, message: 'Visitor id is required' });
  }

  try {
    await connectDB();

    // Legacy migration may omit PII only for an already-known visitor record.
    let isLegacyMigration = false;
    if (wantsLegacyMigration) {
      const existing = await SiteVisitor.findOne({ visitorId }).select('_id').lean();
      isLegacyMigration = Boolean(existing);
    }

    if (!isLegacyMigration) {
      if (contact.name.length < 2) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }
      if (!EMAIL_REGEX.test(contact.email)) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
      }
      // Phone is optional; validate only when provided
      if (contact.phoneNumber && !PHONE_REGEX.test(contact.phoneNumber)) {
        return res.status(400).json({ success: false, message: 'Valid phone number is required' });
      }
    }

    const geo = getGeoFromRequest(req);
    const { hostname, siteFamily } = getHostFromRequest(req);
    const pageUrl =
      typeof req.body?.url === 'string' && req.body.url.trim()
        ? req.body.url.trim().slice(0, 2000)
        : '/';
    const pageTitle =
      typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 500) : 'Cookie consent';
    const pageReferrer =
      typeof req.body?.referrer === 'string' ? req.body.referrer.trim().slice(0, 2000) : '';

    // Persist identity BEFORE setting cookies so a DB failure does not grant access
    // without storing name/email/phone.
    await upsertSiteVisitor({
      visitorId,
      name: contact.name || undefined,
      email: contact.email || undefined,
      phoneNumber: contact.phoneNumber || undefined,
      location: geo.location,
      city: geo.city,
      country: geo.country,
      region: geo.region,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || null,
      hostname,
      siteFamily,
      consentStatus: 'accepted',
      source: 'pageview',
      url: pageUrl,
      title: pageTitle,
      referrer: pageReferrer,
    });

    setVisitorCookies(res, { consent: 'accepted', visitorId, req });

    return res.status(200).json({
      success: true,
      consent: 'accepted',
      visitorId,
    });
  } catch (error) {
    console.error('[API /visitors/consent] Failed to store visitor contact:', error);
    return res.status(500).json({ success: false, message: 'Failed to save consent' });
  }
}
