import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { reportShare } from '@/lib/secureShareService';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
  } catch (err) {
    console.warn('[secure-share report] rate limit', err.message);
  }
  try {
    await connectDB();
    const result = await reportShare(req.query.token, req.body?.reason);
    if (result.error) {
      return res.status(result.status || 404).json({ success: false, message: result.error });
    }
    return res.status(200).json({
      success: true,
      message: 'Thank you. This link has been held for review.',
    });
  } catch (error) {
    console.error('[secure-share report]', error);
    return res.status(500).json({ success: false, message: 'Unable to send your report' });
  }
}
