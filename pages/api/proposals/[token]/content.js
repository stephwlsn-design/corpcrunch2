import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { notifyProposalTeam } from '@/lib/proposalMail';
import {
  publicProposalContent,
  recordProposalView,
  requireLiveProposal,
} from '@/lib/proposalService';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
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
    console.warn('[content] rate limit', err.message);
  }

  try {
    await connectDB();
    const result = await requireLiveProposal(req.query.token);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.error });
    }
    const firstView = await recordProposalView(result.proposal, req);
    notifyProposalTeam({
      subject: `${firstView ? 'Proposal viewed' : 'Proposal revisited'}: ${result.proposal.title}`,
      rows: [
        ['Event', firstView ? 'First view' : 'Repeat view'],
        ['Proposal', result.proposal.title],
        ['Client', result.proposal.clientName],
        ['Company', result.proposal.clientCompany || '—'],
        ['Email', result.proposal.clientEmail],
        ['Views', String(result.proposal.viewCount)],
      ],
      replyTo: result.proposal.clientEmail,
    }).catch((err) => console.error('[content] notify', err));

    return res.status(200).json({
      success: true,
      data: publicProposalContent(result.proposal),
    });
  } catch (error) {
    console.error('[content]', error);
    return res.status(500).json({ success: false, message: 'Unable to load proposal' });
  }
}
