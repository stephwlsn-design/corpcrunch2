import connectDB from '@/lib/mongoose';
import NewsletterSubscription from '@/models/NewsletterSubscription';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { hsCreateContact } from '@/lib/hubspot';
import { recordVisitorFromRequest } from '@/lib/recordVisitorFromRequest';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rateLimitResult = await publicRateLimiter(req);
    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', rateLimitResult.retryAfter);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
      });
    }
  } catch (err) {
    console.warn('[API /newsletter-subscriptions] Rate limiting error:', err.message);
  }

  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  try {
    await connectDB();
    try {
      await NewsletterSubscription.create({ email: normalized });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed',
          duplicate: true,
        });
      }
      throw err;
    }

    hsCreateContact({
      email: normalized,
      firstName: 'Newsletter',
      lastName: 'Subscriber',
    }).catch((e) => console.error('[API /newsletter-subscriptions] HubSpot:', e));

    recordVisitorFromRequest(req, {
      email: normalized,
      name: 'Newsletter Subscriber',
      source: 'newsletter',
    }).catch((e) => console.error('[API /newsletter-subscriptions] Visitor:', e));

    return res.status(200).json({ success: true, message: 'Successfully subscribed' });
  } catch (error) {
    console.error('[API /newsletter-subscriptions] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
