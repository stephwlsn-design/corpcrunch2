import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { requireLiveProposal } from '@/lib/proposalService';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      res.setHeader('Retry-After', rate.retryAfter);
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
  } catch (err) {
    console.warn('[proposals/token] rate limit', err.message);
  }

  try {
    await connectDB();
    const { token } = req.query;
    const result = await requireLiveProposal(token);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    return res.status(200).json({
      success: true,
      data: { title: result.proposal.title, live: true },
    });
  } catch (error) {
    console.error('[proposals/token]', error);
    return res.status(500).json({ success: false, message: 'Unable to load proposal' });
  }
}
