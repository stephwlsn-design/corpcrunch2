import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import {
  checkUploadAllowance,
  createSecureShare,
  decodePublicUpload,
  purgeExpiredShares,
} from '@/lib/secureShareService';

export const config = {
  api: {
    bodyParser: {
      // 3 MB file => ~4 MB base64. Vercel caps request bodies at 4.5 MB.
      sizeLimit: '4.4mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests. Try again shortly.' });
    }
  } catch (err) {
    console.warn('[secure-share] rate limit', err.message);
  }

  const body = req.body || {};

  // Honeypot: real people never fill this hidden field.
  if (body.website) {
    return res.status(200).json({ success: true, data: { url: '' } });
  }

  try {
    await connectDB();

    const allowance = await checkUploadAllowance(req);
    if (!allowance.allowed) {
      return res.status(429).json({
        success: false,
        message: 'You have reached the free sharing limit for now. Please try again later.',
      });
    }

    const file = decodePublicUpload({
      contentBase64: body.contentBase64,
      fileName: body.fileName,
    });

    const passcode = String(body.passcode || '').trim();
    if (passcode && (passcode.length < 4 || passcode.length > 64)) {
      return res.status(400).json({
        success: false,
        message: 'A passcode must be 4 to 64 characters.',
      });
    }

    const result = await createSecureShare({
      req,
      ipHash: allowance.ipHash,
      buffer: file.buffer,
      fileName: file.fileName,
      fileMime: file.fileMime,
      expiry: body.expiry,
      passcode,
      note: body.note,
    });

    purgeExpiredShares().catch((err) => console.error('[secure-share] purge', err.message));

    return res.status(201).json({
      success: true,
      data: {
        url: result.url,
        expiresAt: result.expiresAt,
        requiresPasscode: result.requiresPasscode,
        fileName: file.fileName,
      },
    });
  } catch (error) {
    const known = /file|pdf|image|3 MB|choose|read/i.test(error.message || '');
    if (!known) console.error('[secure-share] create', error);
    return res.status(known ? 400 : 500).json({
      success: false,
      message: known ? error.message : 'We could not create your link. Please try again.',
    });
  }
}
