import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import {
  buildAccessCookie,
  clientIp,
  generateAccessToken,
  hashSecret,
  safeEqualHex,
} from '@/lib/proposalAccess';
import { notifyProposalTeam } from '@/lib/proposalMail';
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
    console.warn('[verify] rate limit', err.message);
  }

  try {
    await connectDB();
    const { token } = req.query;
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and access code are required' });
    }

    const result = await requireLiveProposal(token);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    const proposal = result.proposal;
    const record = proposal.otp || {};

    if (!record.hash || !record.expiresAt || new Date(record.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Access code expired. Request a new one.' });
    }
    if (record.attempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Request a new code.' });
    }
    if (email !== proposal.clientEmail || email !== record.email) {
      return res.status(403).json({ success: false, message: 'Email does not match this proposal' });
    }
    if (!safeEqualHex(record.hash, hashSecret(otp))) {
      record.attempts = (record.attempts || 0) + 1;
      proposal.otp = record;
      await proposal.save();
      return res.status(401).json({ success: false, message: 'Incorrect access code' });
    }

    const accessToken = generateAccessToken();
    const session = {
      tokenHash: hashSecret(accessToken),
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    proposal.accessSessions = [...(proposal.accessSessions || []).slice(-20), session];
    proposal.otp = { hash: '', email: '', attempts: 0 };
    const firstView = !proposal.firstViewedAt;
    if (!proposal.firstViewedAt) proposal.firstViewedAt = new Date();
    proposal.lastViewedAt = new Date();
    proposal.viewCount = (proposal.viewCount || 0) + 1;
    await proposal.save();

    await logEvent(proposal, {
      type: 'access_granted',
      email,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });
    await logEvent(proposal, {
      type: 'view',
      email,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });

    notifyProposalTeam({
      subject: `${firstView ? 'Proposal viewed' : 'Proposal revisited'}: ${proposal.title}`,
      rows: [
        ['Event', firstView ? 'First view' : 'Repeat view'],
        ['Proposal', proposal.title],
        ['Client', proposal.clientName],
        ['Company', proposal.clientCompany || '—'],
        ['Email', email],
        ['Views', String(proposal.viewCount)],
        ['Link', `/proposals/view/${proposal.token}`],
      ],
      replyTo: email,
    }).catch((err) => console.error('[verify] notify', err));

    res.setHeader('Set-Cookie', buildAccessCookie(proposal.token, accessToken));
    return res.status(200).json({
      success: true,
      accessToken,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('[verify]', error);
    return res.status(500).json({ success: false, message: 'Unable to verify access' });
  }
}
