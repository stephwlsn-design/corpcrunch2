import connectDB from '@/lib/mongoose';
import mongoose from 'mongoose';
import Proposal from '@/models/Proposal';
import ProposalEvent from '@/models/ProposalEvent';
import ProposalFeedback from '@/models/ProposalFeedback';
import { requireAdminAuth } from '@/lib/adminAuth';
import { buildProposalShareUrl, generateToken } from '@/lib/proposalAccess';
import { deleteProposalFile } from '@/lib/proposalFiles';
import { sendClientProposalLink } from '@/lib/proposalMail';
import { adminProposalPayload, formatFeedback } from '@/lib/proposalService';

function sanitizeSlides(slides) {
  if (!Array.isArray(slides)) return null;
  return slides
    .slice(0, 40)
    .map((s) => ({
      title: String(s?.title || '').trim().slice(0, 200),
      body: String(s?.body || '').trim().slice(0, 20000),
    }))
    .filter((s) => s.title || s.body);
}

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

  const { id } = req.query;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid proposal id' });
  }

  const proposal = await Proposal.findById(id);
  if (!proposal) {
    return res.status(404).json({ success: false, message: 'Proposal not found' });
  }

  if (req.method === 'GET') {
    const [events, feedback] = await Promise.all([
      ProposalEvent.find({ proposal: proposal._id }).sort({ createdAt: -1 }).limit(300).lean(),
      ProposalFeedback.find({ proposal: proposal._id }).sort({ createdAt: -1 }).lean(),
    ]);
    const pagesViewed = [...new Set(events.filter((e) => e.type === 'section' && e.section).map((e) => e.section))];
    return res.status(200).json({
      success: true,
      data: {
        ...adminProposalPayload(proposal),
        shareUrl: buildProposalShareUrl(req, proposal.token),
        events,
        feedback: feedback.map(formatFeedback),
        pagesViewed,
      },
    });
  }

  if (req.method === 'PATCH') {
    const body = req.body || {};
    const fields = [
      'title',
      'clientName',
      'clientEmail',
      'clientDesignation',
      'clientCompany',
      'industry',
      'category',
      'ownerName',
      'presentationUrl',
    ];
    fields.forEach((field) => {
      if (typeof body[field] === 'string') {
        proposal[field] = body[field].trim();
      }
    });
    if (typeof proposal.clientEmail === 'string') {
      proposal.clientEmail = proposal.clientEmail.toLowerCase();
    }
    if (body.slides) {
      const slides = sanitizeSlides(body.slides);
      if (slides) {
        proposal.slides = slides;
        proposal.version += 1;
      }
    }
    if (['draft', 'live', 'expired', 'converted'].includes(body.status)) {
      proposal.status = body.status;
    }
    if (typeof body.revoked === 'boolean') proposal.revoked = body.revoked;
    if (body.expiresAt === null || body.expiresAt === '') proposal.expiresAt = undefined;
    else if (body.expiresAt) proposal.expiresAt = new Date(body.expiresAt);
    await proposal.save();
    return res.status(200).json({
      success: true,
      data: { ...adminProposalPayload(proposal), shareUrl: buildProposalShareUrl(req, proposal.token) },
    });
  }

  if (req.method === 'POST') {
    const action = req.body?.action;
    if (action === 'regenerate-link') {
      let token = generateToken(24);
      while (await Proposal.exists({ token })) {
        token = generateToken(24);
      }
      proposal.token = token;
      proposal.accessSessions = [];
      proposal.viewedAt = undefined;
      proposal.firstViewedAt = undefined;
      proposal.lastViewedAt = undefined;
      proposal.viewCount = 0;
      proposal.revoked = false;
      proposal.status = 'live';
      proposal.version += 1;
      await proposal.save();
      const shareUrl = buildProposalShareUrl(req, proposal.token);
      return res.status(200).json({
        success: true,
        data: { ...adminProposalPayload(proposal), shareUrl },
      });
    }
    if (action === 'send-link') {
      const shareUrl = buildProposalShareUrl(req, proposal.token);
      const mailed = await sendClientProposalLink({
        to: proposal.clientEmail,
        clientName: proposal.clientName,
        proposalTitle: proposal.title,
        shareUrl,
      });
      return res.status(200).json({
        success: true,
        clientMailed: Boolean(mailed.sent),
        shareUrl,
      });
    }
    return res.status(400).json({ success: false, message: 'Unknown action' });
  }

  if (req.method === 'DELETE') {
    await Promise.all([
      deleteProposalFile(proposal.fileId),
      ProposalEvent.deleteMany({ proposal: proposal._id }),
      ProposalFeedback.deleteMany({ proposal: proposal._id }),
      proposal.deleteOne(),
    ]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
