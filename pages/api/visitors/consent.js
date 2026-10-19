import connectDB from '@/lib/mongoose';
import SiteVisitor from '@/models/SiteVisitor';
import { generateVisitorId } from '@/lib/cookieConsent';
import {
  parseConsentFromRequest,
  getRawConsentCookie,
  setVisitorCookies,
  buildVisitorCookie,
  appendSetCookie,
  VISITOR_ID_KEY,
  COOKIE_CONSENT_KEY,
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

function visitorHasCompleteContact(visitor) {
  if (!visitor) return false;
  const name = typeof visitor.name === 'string' ? visitor.name.trim() : '';
  const email = typeof visitor.email === 'string' ? visitor.email.trim().toLowerCase() : '';
  const phoneNumber =
    typeof visitor.phoneNumber === 'string' ? visitor.phoneNumber.trim() : '';
  return name.length >= 2 && EMAIL_REGEX.test(email) && PHONE_REGEX.test(phoneNumber);
}

/** Clear accepted consent but keep visitor id so the same record can be updated. */
function revokeIncompleteConsent(res, req, visitorId) {
  appendSetCookie(res, buildVisitorCookie(COOKIE_CONSENT_KEY, '', { maxAge: 0, req }));
  if (visitorId) {
    appendSetCookie(res, buildVisitorCookie(VISITOR_ID_KEY, visitorId, { req }));
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const rawConsent = getRawConsentCookie(req);
    const cookieConsent = parseConsentFromRequest(req);
    const visitorId =
      getVisitorIdFromCookies(req) || getOttoVisitorIdFromCookies(req) || null;

    // Legacy `accepted` cookies (pre contact-gate) never unlock the site.
    if (rawConsent === 'accepted') {
      revokeIncompleteConsent(res, req, visitorId);
      return res.status(200).json({
        success: true,
        consent: null,
        requiresContact: true,
        hasVisitorId: Boolean(visitorId),
      });
    }

    // Current-version accepted cookies still require name/email/phone on file.
    if (cookieConsent === 'accepted') {
      try {
        await connectDB();
        let hasContact = false;
        if (visitorId) {
          const visitor = await SiteVisitor.findOne({ visitorId })
            .select('name email phoneNumber')
            .lean();
          hasContact = visitorHasCompleteContact(visitor);
        }

        if (!hasContact) {
          revokeIncompleteConsent(res, req, visitorId);
          return res.status(200).json({
            success: true,
            consent: null,
            requiresContact: true,
            hasVisitorId: Boolean(visitorId),
          });
        }
      } catch (error) {
        console.error('[API /visitors/consent] Contact check failed:', error);
        revokeIncompleteConsent(res, req, visitorId);
        return res.status(200).json({
          success: true,
          consent: null,
          requiresContact: true,
          hasVisitorId: Boolean(visitorId),
        });
      }
    }

    return res.status(200).json({
      success: true,
      consent: cookieConsent,
      requiresContact: cookieConsent !== 'accepted',
      hasVisitorId: Boolean(visitorId),
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

  if (contact.name.length < 2) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!EMAIL_REGEX.test(contact.email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }
  if (!PHONE_REGEX.test(contact.phoneNumber)) {
    return res.status(400).json({ success: false, message: 'Valid phone number is required' });
  }

  const visitorId =
    getVisitorIdFromCookies(req) ||
    getOttoVisitorIdFromCookies(req) ||
    (isValidVisitorId(req.body?.visitorId) ? req.body.visitorId.trim() : null) ||
    generateVisitorId();

  try {
    await connectDB();

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

    await upsertSiteVisitor({
      visitorId,
      name: contact.name,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
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
