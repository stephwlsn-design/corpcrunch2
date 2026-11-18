import connectDB from '@/lib/mongoose';
import ProposalFeedback from '@/models/ProposalFeedback';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { clientIp } from '@/lib/proposalAccess';
import { notifyProposalTeam } from '@/lib/proposalMail';
import {
  PROPOSAL_DECISIONS,
  PROPOSAL_REJECTION_REASONS,
  PROPOSAL_SERVICES,
} from '@/lib/proposalConstants';
import { formatFeedback, logEvent, requireRespondableProposal } from '@/lib/proposalService';

const serviceIds = new Set(PROPOSAL_SERVICES.map((s) => s.id));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const rate = await publicRateLimiter(req);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
  } catch (err) {
    console.warn('[feedback] rate limit', err.message);
  }

  try {
    await connectDB();
    const result = await requireRespondableProposal(req.query.token);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    const body = req.body || {};
    const decision = String(body.decision || '');
    if (!PROPOSAL_DECISIONS.includes(decision)) {
      return res.status(400).json({ success: false, message: 'Select a decision' });
    }

    const rejectionReason = String(body.rejectionReason || '').slice(0, 1000);
    if (decision === 'discuss' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Tell us what you would like to discuss.',
      });
    }
    let followUpAt = null;
    if (decision === 'no') {
      const raw = String(body.followUpAt || '').trim();
      const parsed = raw ? new Date(raw) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Select a date for us to follow up.',
        });
      }
      const soonest = new Date();
      soonest.setHours(0, 0, 0, 0);
      if (parsed < soonest) {
        return res.status(400).json({
          success: false,
          message: 'Choose a follow-up date from today onward.',
        });
      }
      followUpAt = parsed;
    }
    if (
      rejectionReason &&
      !PROPOSAL_REJECTION_REASONS.includes(rejectionReason) &&
      rejectionReason.length < 4
    ) {
      return res.status(400).json({ success: false, message: 'Choose a reason' });
    }

    const services = Array.isArray(body.services)
      ? body.services.filter((id) => serviceIds.has(id)).slice(0, 10)
      : [];
    const noneExtra = Boolean(body.noneExtra) || services.length === 0;
    const notesById = body.serviceNotes && typeof body.serviceNotes === 'object' ? body.serviceNotes : {};
    const serviceNotes = services.map((id) => ({
      id,
      note: String(notesById[id] || '').slice(0, 1000),
    }));

    const from = String(body.budget?.from || '').replace(/[^\d.]/g, '').slice(0, 20);
    const to = String(body.budget?.to || '').replace(/[^\d.]/g, '').slice(0, 20);
    const range =
      from && to
        ? `${from} – ${to}`
        : String(body.budget?.range || '').slice(0, 80);

    const feedback = await ProposalFeedback.create({
      proposal: result.proposal._id,
      email: result.proposal.clientEmail,
      name: result.proposal.clientName,
      decision,
      rejectionReason,
      comments: String(body.comments || '').slice(0, 4000),
      noneExtra: noneExtra && services.length === 0,
      services: noneExtra ? [] : services,
      serviceNotes: noneExtra ? [] : serviceNotes,
      followUpAt,
      budget: {
        currency: String(body.budget?.currency || 'USD').slice(0, 8),
        range,
        customAmount: to || from,
        type: String(body.budget?.type || '').slice(0, 80),
        status: String(body.budget?.status || '').slice(0, 80),
        flexibility: String(body.budget?.flexibility || '').slice(0, 80),
      },
    });

    await logEvent(result.proposal, {
      type: 'feedback',
      email: result.proposal.clientEmail,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] || '',
      meta: { decision, services: feedback.services },
    });

    const formatted = formatFeedback(feedback);
    const eventLabel =
      decision === 'proceed'
        ? 'Positive response'
        : decision === 'discuss'
          ? 'Request for discussion'
          : 'Negative response';
    const task =
      decision === 'proceed'
        ? 'Immediate follow-up: client wants to proceed.'
        : decision === 'discuss'
          ? 'Generate a follow-up task: client requested a discussion.'
          : `Follow up on ${formatted.followUpAt ? new Date(formatted.followUpAt).toLocaleDateString() : 'the selected date'}.`;
    const extra =
      formatted.services.length > 0
        ? 'Generate a cross-selling opportunity and consider a separate proposal for additional services.'
        : '—';

    notifyProposalTeam({
      subject: `${eventLabel}: ${result.proposal.title}`,
      rows: [
        ['Proposal', result.proposal.title],
        ['Client', result.proposal.clientName],
        ['Company', result.proposal.clientCompany || '—'],
        ['Email', result.proposal.clientEmail],
        ['Owner', result.proposal.ownerName || '—'],
        ['Decision', formatted.decisionLabel],
        ['Budget', `${formatted.budget?.currency || ''} ${formatted.budget?.range || '—'}`.trim()],
        ['Budget type', formatted.budget?.type || '—'],
        ['Budget status', formatted.budget?.status || '—'],
        ['Flexibility', formatted.budget?.flexibility || '—'],
        ['Follow up on', formatted.followUpAt ? new Date(formatted.followUpAt).toLocaleDateString() : '—'],
        ['Rejection / hesitation', formatted.rejectionReason || '—'],
        ['Additional services', formatted.services.join(', ') || (formatted.noneExtra ? 'Not interested in additional services' : '—')],
        ['Service requirements', formatted.serviceNotes.map((row) => `${row.label}: ${row.note || '—'}`).join(' | ') || '—'],
        ['Comments', formatted.comments || '—'],
        ['Task', task],
        ['Cross-sell', extra],
      ],
      replyTo: result.proposal.clientEmail,
    }).catch((err) => console.error('[feedback] notify', err));

    if (formatted.services.length > 0) {
      notifyProposalTeam({
        subject: `Cross-sell opportunity: ${result.proposal.title}`,
        rows: [
          ['Proposal', result.proposal.title],
          ['Client', result.proposal.clientName],
          ['Email', result.proposal.clientEmail],
          ['Owner', result.proposal.ownerName || '—'],
          ['Services requested', formatted.services.join(', ')],
          ['Requirements', formatted.serviceNotes.map((row) => `${row.label}: ${row.note || '—'}`).join(' | ') || '—'],
          ['Task', 'Initiate a separate proposal for additional services if appropriate.'],
        ],
        replyTo: result.proposal.clientEmail,
      }).catch((err) => console.error('[feedback] cross-sell', err));
    }

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('[feedback]', error);
    return res.status(500).json({ success: false, message: 'Unable to save feedback' });
  }
}
