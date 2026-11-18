import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { openShareOnce } from '@/lib/secureShareService';

export const config = {
  api: {
    responseLimit: '8mb',
  },
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // POST only: link-preview bots and prefetchers send GET, so they can never burn a link.
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
  } catch (err) {
    console.warn('[secure-share open] rate limit', err.message);
  }

  try {
    await connectDB();
    const result = await openShareOnce(req.query.token, {
      passcode: String(req.body?.passcode || '').trim(),
      req,
    });
    if (result.error) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.error,
        needsPasscode: Boolean(result.needsPasscode),
      });
    }

    res.setHeader('Content-Type', result.fileMime || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Accept-Ranges', 'none');
    res.setHeader('Content-Length', String(result.buffer.length));
    return res.status(200).send(result.buffer);
  } catch (error) {
    console.error('[secure-share open]', error);
    return res.status(500).json({ success: false, message: 'Unable to open this document' });
  }
}
