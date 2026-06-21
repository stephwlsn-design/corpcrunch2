import { generateVisitorId } from '@/lib/cookieConsent';
import {
  parseConsentFromRequest,
  setVisitorCookies,
  buildVisitorCookie,
  appendSetCookie,
  VISITOR_ID_KEY,
} from '@/lib/visitorCookies';
import { getVisitorIdFromCookies, getOttoVisitorIdFromCookies } from '@/lib/visitorService';

function isValidVisitorId(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

export default function handler(req, res) {
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

  const visitorId =
    getVisitorIdFromCookies(req) ||
    getOttoVisitorIdFromCookies(req) ||
    (isValidVisitorId(req.body?.visitorId) ? req.body.visitorId.trim() : null) ||
    generateVisitorId();
  setVisitorCookies(res, { consent: 'accepted', visitorId, req });

  return res.status(200).json({
    success: true,
    consent: 'accepted',
  });
}
