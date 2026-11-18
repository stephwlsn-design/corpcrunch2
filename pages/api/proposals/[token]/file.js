import connectDB from '@/lib/mongoose';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { notifyProposalTeam } from '@/lib/proposalMail';
import { openProposalFileStream } from '@/lib/proposalFiles';
import { consumeOneTimeView } from '@/lib/proposalService';

export const config = {
  api: {
    responseLimit: '8mb',
  },
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
  } catch (err) {
    console.warn('[proposal file] rate limit', err.message);
  }

  try {
    await connectDB();
    const result = await consumeOneTimeView(req.query.token, req);
    if (result.error) {
      return res.status(result.status || 404).json({ success: false, message: result.error });
    }

    const proposal = result.proposal;
    if (result.firstView) {
      notifyProposalTeam({
        subject: `Proposal viewed: ${proposal.title}`,
        rows: [
          ['Document', proposal.title],
          ['File', proposal.fileName || '—'],
          ['Recipient', proposal.clientName],
          ['Email', proposal.clientEmail],
          ['Owner', proposal.ownerName || '—'],
          ['Viewed at', new Date().toISOString()],
          ['Deadline', proposal.expiresAt ? new Date(proposal.expiresAt).toISOString() : 'None'],
          ['Task', 'Assigned sales representative: client opened the proposal.'],
        ],
        replyTo: proposal.clientEmail,
      }).catch((err) => console.error('[proposal file] notify', err));
    } else if ((result.viewCount || 0) > 1) {
      notifyProposalTeam({
        subject: `Proposal revisited: ${proposal.title}`,
        rows: [
          ['Document', proposal.title],
          ['Recipient', proposal.clientName],
          ['Email', proposal.clientEmail],
          ['Owner', proposal.ownerName || '—'],
          ['Visit number', String(result.viewCount)],
          ['Last access', new Date().toISOString()],
          ['Task', 'Flag renewed client engagement.'],
        ],
        replyTo: proposal.clientEmail,
      }).catch((err) => console.error('[proposal file] revisit', err));
    }

    res.setHeader('Content-Type', proposal.fileMime || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Accept-Ranges', 'none');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Download-Options', 'noopen');

    const stream = openProposalFileStream(proposal.fileId);
    stream.on('error', (err) => {
      console.error('[proposal file] stream', err);
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: 'This document is not available.' });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } catch (error) {
    console.error('[proposal file]', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Unable to open document' });
    }
  }
}
