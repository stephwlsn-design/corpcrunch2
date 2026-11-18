import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { clientIp } from '@/lib/proposalAccess';
import { logEvent, requireLiveProposal } from '@/lib/proposalService';

const ALLOWED = new Set(['heartbeat', 'section']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
  } catch (err) {
    console.warn('[events] rate limit', err.message);
  }

  try {
    await connectDB();
    const result = await requireLiveProposal(req.query.token);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    const type = String(req.body?.type || '');
    if (!ALLOWED.has(type)) {
      return res.status(400).json({ success: false, message: 'Invalid event type' });
    }

    const durationMs = Math.max(0, Math.min(Number(req.body?.durationMs) || 0, 120000));
    const section = String(req.body?.section || '').slice(0, 120);
    await logEvent(result.proposal, {
      type,
      email: result.proposal.clientEmail,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] || '',
      durationMs,
      section,
    });

    result.proposal.lastViewedAt = new Date();
    if (durationMs) {
      result.proposal.totalDurationMs = (result.proposal.totalDurationMs || 0) + durationMs;
    }
    await result.proposal.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[events]', error);
    return res.status(500).json({ success: false, message: 'Unable to record activity' });
  }
}
