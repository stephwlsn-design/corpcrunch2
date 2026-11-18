import nodemailer from 'nodemailer';
import { PROPOSAL_NOTIFY_TO } from '@/lib/proposalConstants';

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  const port = Number(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: smtpHost,
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass: smtpPass.replace(/\s+/g, '') },
  });
}

export async function sendProposalMail({ to, subject, html, replyTo }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[proposalMail] SMTP not configured; skipped:', subject);
    return { sent: false, reason: 'smtp_not_configured' };
  }
  const smtpUser = process.env.SMTP_USER;
  const recipients = Array.isArray(to) ? to.join(', ') : to;
  await transporter.sendMail({
    from: `"Corp Crunch Proposals" <${smtpUser}>`,
    to: recipients,
    replyTo,
    subject,
    html,
  });
  return { sent: true };
}

export async function notifyProposalTeam({ subject, rows, body, replyTo }) {
  const rowHtml = (rows || [])
    .map(
      ([k, v]) =>
        `<p style="margin:0 0 8px;"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</p>`
    )
    .join('');
  const html = `
    <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;">
      <h2 style="margin-top:0;">Corp Crunch Proposals</h2>
      ${rowHtml}
      ${body ? `<hr /><div style="white-space:pre-wrap;">${escapeHtml(body)}</div>` : ''}
    </div>
  `;
  try {
    return await sendProposalMail({
      to: PROPOSAL_NOTIFY_TO,
      subject,
      html,
      replyTo,
    });
  } catch (err) {
    console.error('[proposalMail] Team notify failed:', err);
    return { sent: false, reason: err.message };
  }
}

export async function sendClientProposalLink({ to, clientName, proposalTitle, shareUrl }) {
  const html = `
    <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;">
      <h2>Your Corp Crunch proposal</h2>
      <p>Hello ${escapeHtml(clientName || '')},</p>
      <p>Open your unique document link below. You can return to it until the deadline on the proposal. Do not forward it.</p>
      <p><a href="${escapeHtml(shareUrl)}">${escapeHtml(shareUrl)}</a></p>
      <p>Proposal: <strong>${escapeHtml(proposalTitle)}</strong></p>
    </div>
  `;
  try {
    return await sendProposalMail({
      to,
      subject: `Proposal: ${proposalTitle}`,
      html,
    });
  } catch (err) {
    console.error('[proposalMail] Client link email failed:', err);
    return { sent: false, reason: err.message };
  }
}

export async function sendClientOtpEmail({ to, code, proposalTitle, clientName }) {
  const html = `
    <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;">
      <h2>Your Corp Crunch proposal access code</h2>
      <p>Hello ${escapeHtml(clientName || '')},</p>
      <p>Use this one-time code to view <strong>${escapeHtml(proposalTitle)}</strong>:</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700;">${escapeHtml(code)}</p>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;
  try {
    return await sendProposalMail({
      to,
      subject: `Access code for ${proposalTitle}`,
      html,
    });
  } catch (err) {
    console.error('[proposalMail] OTP email failed:', err);
    return { sent: false, reason: err.message };
  }
}

export { escapeHtml };
