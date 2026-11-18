import connectDB from '@/lib/mongoose';
import Proposal from '@/models/Proposal';
import { requireAdminAuth } from '@/lib/adminAuth';
import { buildProposalShareUrl, generateToken } from '@/lib/proposalAccess';
import { decodeUploadedFile, uploadProposalFile } from '@/lib/proposalFiles';
import { notifyProposalTeam, sendClientProposalLink } from '@/lib/proposalMail';
import {
  adminProposalPayload,
  buildProposalStats,
  queueNoResponseReminders,
} from '@/lib/proposalService';
import ProposalFeedback from '@/models/ProposalFeedback';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database connection failed.' });
  }

  const authResult = await requireAdminAuth(req);
  if (!authResult.authorized) {
    return res.status(401).json({ success: false, message: authResult.error || 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const proposals = await Proposal.find({}).sort({ createdAt: -1 }).limit(200).lean();
      const stats = await buildProposalStats();
      queueNoResponseReminders().catch((err) => console.error('[admin/proposals] reminders', err));
      const latestFeedback = await ProposalFeedback.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$proposal',
            decision: { $first: '$decision' },
            services: { $first: '$services' },
            createdAt: { $first: '$createdAt' },
          },
        },
      ]);
      const feedbackByProposal = Object.fromEntries(
        latestFeedback.map((row) => [String(row._id), row])
      );
      return res.status(200).json({
        success: true,
        stats,
        data: proposals.map((p) => {
          const fb = feedbackByProposal[String(p._id)];
          return {
            ...adminProposalPayload(p),
            shareUrl: buildProposalShareUrl(req, p.token),
            latestDecision: fb?.decision || '',
            latestServices: fb?.services || [],
            feedbackAt: fb?.createdAt || null,
          };
        }),
      });
    } catch (error) {
      console.error('[admin/proposals] GET', error);
      return res.status(500).json({ success: false, message: 'Failed to load documents' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        title,
        clientName,
        clientEmail,
        clientCompany,
        clientDesignation,
        ownerName,
        expiresAt,
        emailClient,
        contentBase64,
        fileName,
        fileMime,
      } = req.body || {};

      if (!clientName || !clientEmail) {
        return res.status(400).json({
          success: false,
          message: 'Recipient name and email are required',
        });
      }

      const file = decodeUploadedFile({ contentBase64, fileName, fileMime });
      const fileId = await uploadProposalFile(file);

      let token = generateToken(24);
      while (await Proposal.exists({ token })) {
        token = generateToken(24);
      }

      const proposal = await Proposal.create({
        token,
        title: String(title || file.fileName).trim().slice(0, 200),
        clientName: String(clientName).trim().slice(0, 120),
        clientEmail: String(clientEmail).trim().toLowerCase().slice(0, 200),
        clientDesignation: String(clientDesignation || '').trim().slice(0, 160),
        clientCompany: String(clientCompany || '').trim().slice(0, 160),
        ownerName: String(ownerName || authResult.admin?.name || '').trim().slice(0, 120),
        status: 'live',
        oneTimeView: false,
        fileId,
        fileName: file.fileName,
        fileMime: file.fileMime,
        fileSize: file.buffer.length,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      const shareUrl = buildProposalShareUrl(req, proposal.token);
      const shouldEmailClient = emailClient !== false && emailClient !== 'false';

      if (shouldEmailClient) {
        sendClientProposalLink({
          to: proposal.clientEmail,
          clientName: proposal.clientName,
          proposalTitle: proposal.title,
          shareUrl,
        }).catch((err) => console.error('[admin/proposals] client mail', err));
      }
      notifyProposalTeam({
        subject: `Document sent: ${proposal.title}`,
        rows: [
          ['Document', proposal.title],
          ['File', proposal.fileName],
          ['Recipient', proposal.clientName],
          ['Email', proposal.clientEmail],
          ['Unique link', shareUrl],
          ['Access', 'Open until deadline'],
          ['Recipient emailed', shouldEmailClient ? 'Queued' : 'No'],
        ],
      }).catch((err) => console.error('[admin/proposals] notify', err));

      return res.status(201).json({
        success: true,
        data: { ...adminProposalPayload(proposal), shareUrl, clientMailed: shouldEmailClient },
      });
    } catch (error) {
      console.error('[admin/proposals] POST', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to send document',
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
