import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { clientIp, generateOtp, hashSecret } from '@/lib/proposalAccess';
import { sendClientOtpEmail } from '@/lib/proposalMail';
import { logEvent, requireLiveProposal } from '@/lib/proposalService';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
  } catch (err) {
    console.warn('[request-access] rate limit', err.message);
  }

  try {
    await connectDB();
    const { token } = req.query;
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }

    const result = await requireLiveProposal(token);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    const proposal = result.proposal;

    if (email !== proposal.clientEmail) {
      await logEvent(proposal, {
        type: 'unauthorised',
        email,
        ip: clientIp(req),
        userAgent: req.headers['user-agent'] || '',
      });
      return res.status(403).json({
        success: false,
        message: 'This proposal is assigned to a different email address',
      });
    }

    const code = generateOtp();
    proposal.otp = {
      hash: hashSecret(code),
      email,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
    };
    await proposal.save();
    await logEvent(proposal, {
      type: 'access_requested',
      email,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });

    const mailed = await sendClientOtpEmail({
      to: email,
      code,
      proposalTitle: proposal.title,
      clientName: proposal.clientName,
    });

    return res.status(200).json({
      success: true,
      message: mailed.sent
        ? 'We sent a one-time access code to your email'
        : 'Access code generated. Check with Corp Crunch if the email does not arrive.',
      ...(process.env.NODE_ENV !== 'production' && !mailed.sent ? { debugOtp: code } : {}),
    });
  } catch (error) {
    console.error('[request-access]', error);
    return res.status(500).json({ success: false, message: 'Unable to send access code' });
  }
}
