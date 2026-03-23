import { hsTrackPageView } from '@/lib/hubspot';
import jwt from 'jsonwebtoken';

/**
 * POST /api/track/pageview
 * Body: { url, title, referrer }
 * Auth: Bearer token (user token)
 * Tracks page view in HubSpot timeline for logged-in users
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '') || req.body?.token;
    if (!token) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    let email;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      email = decoded?.email;
    } catch {
      return res.status(401).json({ ok: false, message: 'Invalid token' });
    }

    if (!email) {
      return res.status(400).json({ ok: false, message: 'Email not found in token' });
    }

    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ ok: false, message: 'url is required' });
    }

    await hsTrackPageView(email, String(url));

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[Track PageView] Error:', error);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
}
