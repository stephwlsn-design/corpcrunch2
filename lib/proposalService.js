import Proposal from '@/models/Proposal';
import ProposalEvent from '@/models/ProposalEvent';
import ProposalFeedback from '@/models/ProposalFeedback';
import { PROPOSAL_DECISION_OPTIONS, PROPOSAL_SERVICES } from '@/lib/proposalConstants';
import { notifyProposalTeam } from '@/lib/proposalMail';
import {
  clientIp,
  isProposalLive,
  isProposalRespondable,
  uniqueUnavailableMessage,
} from '@/lib/proposalAccess';

const serviceLabel = (id) => PROPOSAL_SERVICES.find((s) => s.id === id)?.label || id;

export function publicProposalMeta(proposal) {
  return {
    token: proposal.token,
    title: proposal.title,
    clientCompany: proposal.clientCompany,
    clientName: proposal.clientName,
    expiresAt: proposal.expiresAt,
    live: isProposalLive(proposal),
    revoked: proposal.revoked,
    status: proposal.status,
  };
}

export function publicProposalContent(proposal) {
  return {
    ...publicProposalMeta(proposal),
    clientEmail: proposal.clientEmail,
    hasFile: Boolean(proposal.fileId),
    fileName: proposal.fileName || '',
    fileMime: proposal.fileMime || '',
    oneTimeView: proposal.oneTimeView !== false,
    slides: (proposal.slides || []).map((s) => ({ title: s.title, body: s.body })),
    presentationUrl: proposal.presentationUrl || '',
    version: proposal.version,
  };
}

export function adminProposalPayload(proposal) {
  return {
    id: String(proposal._id),
    token: proposal.token,
    title: proposal.title,
    clientName: proposal.clientName,
    clientEmail: proposal.clientEmail,
    clientDesignation: proposal.clientDesignation,
    clientCompany: proposal.clientCompany,
    industry: proposal.industry,
    category: proposal.category,
    ownerName: proposal.ownerName,
    version: proposal.version,
    slides: proposal.slides || [],
    presentationUrl: proposal.presentationUrl || '',
    oneTimeView: proposal.oneTimeView !== false,
    fileName: proposal.fileName || '',
    fileMime: proposal.fileMime || '',
    fileSize: proposal.fileSize || 0,
    hasFile: Boolean(proposal.fileId),
    viewedAt: proposal.viewedAt || null,
    status: proposal.status,
    revoked: proposal.revoked,
    expiresAt: proposal.expiresAt,
    firstViewedAt: proposal.firstViewedAt,
    lastViewedAt: proposal.lastViewedAt,
    viewCount: proposal.viewCount,
    totalDurationMs: proposal.totalDurationMs || 0,
    reminderSentAt: proposal.reminderSentAt || null,
    createdAt: proposal.createdAt,
    updatedAt: proposal.updatedAt,
  };
}

export async function requireLiveProposal(token) {
  const proposal = await Proposal.findOne({ token });
  if (!proposal || !isProposalLive(proposal)) {
    return { error: uniqueUnavailableMessage(), status: 404, proposal: proposal || null };
  }
  return { proposal };
}

export async function requireRespondableProposal(token) {
  const proposal = await Proposal.findOne({ token });
  if (!proposal || !isProposalRespondable(proposal)) {
    return { error: uniqueUnavailableMessage(), status: 404, proposal: proposal || null };
  }
  return { proposal };
}

export async function consumeOneTimeView(token, req) {
  const live = await requireLiveProposal(token);
  if (live.error) return live;
  if (!live.proposal.fileId) {
    return { error: uniqueUnavailableMessage(), status: 404, proposal: live.proposal };
  }
  const view = await recordProposalView(live.proposal, req);
  return { proposal: live.proposal, ...view };
}

export async function recordProposalView(proposal, req) {
  const now = new Date();
  const firstView = !proposal.firstViewedAt && !proposal.viewedAt;
  if (!proposal.viewedAt) proposal.viewedAt = now;
  if (!proposal.firstViewedAt) proposal.firstViewedAt = now;
  proposal.lastViewedAt = now;
  proposal.viewCount = (proposal.viewCount || 0) + 1;
  await proposal.save();
  await logEvent(proposal, {
    type: 'view',
    email: proposal.clientEmail,
    ip: req ? clientIp(req) : '',
    userAgent: req?.headers?.['user-agent'] || '',
  });
  return { firstView, viewCount: proposal.viewCount };
}

export function formatFeedback(feedback) {
  const decisionLabel =
    PROPOSAL_DECISION_OPTIONS.find((item) => item.id === feedback.decision)?.label ||
    feedback.decision;
  return {
    id: String(feedback._id),
    email: feedback.email,
    name: feedback.name,
    decision: feedback.decision,
    decisionLabel,
    rejectionReason: feedback.rejectionReason,
    comments: feedback.comments,
    budget: feedback.budget || {},
    services: (feedback.services || []).map(serviceLabel),
    serviceIds: feedback.services || [],
    serviceNotes: (feedback.serviceNotes || []).map((row) => ({
      id: row.id,
      label: serviceLabel(row.id),
      note: row.note || '',
    })),
    noneExtra: feedback.noneExtra,
    followUpAt: feedback.followUpAt || null,
    createdAt: feedback.createdAt,
  };
}

export async function buildProposalStats() {
  const [shared, viewed, converted, feedback] = await Promise.all([
    Proposal.countDocuments({}),
    Proposal.countDocuments({ viewedAt: { $ne: null } }),
    Proposal.countDocuments({ status: 'converted' }),
    ProposalFeedback.find({}).select('proposal decision services').lean(),
  ]);
  const responded = new Set(feedback.map((item) => String(item.proposal)));
  const positive = feedback.filter((item) => item.decision === 'proceed').length;
  const rejections = feedback.filter((item) => item.decision === 'no').length;
  const crossSell = feedback.filter((item) => (item.services || []).length > 0).length;
  const pendingDecisions = Math.max(viewed - responded.size, 0);
  const engagementRate = shared ? Math.round((viewed / shared) * 100) : 0;
  const conversionRate = shared ? Math.round((converted / shared) * 100) : 0;
  return {
    shared,
    viewed,
    pending: Math.max(shared - viewed, 0),
    engagementRate,
    positive,
    pendingDecisions,
    rejections,
    crossSell,
    converted,
    conversionRate,
  };
}

const NO_RESPONSE_MS = 48 * 60 * 60 * 1000;

export async function queueNoResponseReminders() {
  const cutoff = new Date(Date.now() - NO_RESPONSE_MS);
  const candidates = await Proposal.find({
    firstViewedAt: { $lte: cutoff },
    revoked: { $ne: true },
    status: 'live',
    $or: [{ reminderSentAt: { $exists: false } }, { reminderSentAt: null }],
  })
    .limit(25)
    .select('_id title clientName clientEmail clientCompany ownerName firstViewedAt lastViewedAt viewCount');

  await Promise.all(
    candidates.map(async (proposal) => {
      const hasFeedback = await ProposalFeedback.exists({ proposal: proposal._id });
      if (hasFeedback) {
        proposal.reminderSentAt = new Date();
        await proposal.save();
        return;
      }
      proposal.reminderSentAt = new Date();
      await proposal.save();
      notifyProposalTeam({
        subject: `No response: ${proposal.title}`,
        rows: [
          ['Proposal', proposal.title],
          ['Client', proposal.clientName],
          ['Company', proposal.clientCompany || '—'],
          ['Email', proposal.clientEmail],
          ['Owner', proposal.ownerName || '—'],
          ['First viewed', proposal.firstViewedAt?.toISOString() || '—'],
          ['Last viewed', proposal.lastViewedAt?.toISOString() || '—'],
          ['Views', String(proposal.viewCount || 0)],
          ['Task', 'Configurable follow-up: client has not submitted a decision after 48 hours.'],
        ],
        replyTo: proposal.clientEmail,
      }).catch((err) => console.error('[proposal reminder]', err));
    })
  );
}

export async function logEvent(proposal, payload) {
  await ProposalEvent.create({
    proposal: proposal._id,
    ...payload,
  });
}
