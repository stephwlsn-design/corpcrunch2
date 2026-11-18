import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { describeShare } from '@/lib/secureShareService';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
  } catch (err) {
    console.warn('[secure-share status] rate limit', err.message);
  }
  try {
    await connectDB();
    const info = await describeShare(req.query.token);
    return res.status(200).json({ success: true, data: info });
  } catch (error) {
    console.error('[secure-share status]', error);
    return res.status(500).json({ success: false, message: 'Unable to check this link' });
  }
}
