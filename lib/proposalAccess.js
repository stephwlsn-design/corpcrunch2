import crypto from 'crypto';

export function hashSecret(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export function generateToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function uniqueUnavailableMessage() {
  return 'This document is not available.';
}

export function alreadyViewedMessage() {
  return 'This document has already been viewed and can no longer be opened.';
}

export function buildProposalShareUrl(req, token) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim();
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();
  const proto =
    forwardedProto || (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
  if (!host) return `/proposals/view/${token}`;
  return `${proto}://${host}/proposals/view/${encodeURIComponent(token)}`;
}

export function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function safeEqualHex(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '';
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    out[key] = val;
  });
  return out;
}

export function accessCookieName(token) {
  return `proposal_access_${token}`;
}

export function getAccessTokenFromRequest(req, proposalToken) {
  const auth = req.headers.authorization;
  if (auth && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, '').trim();
  }
  if (req.headers['x-proposal-access']) {
    return String(req.headers['x-proposal-access']);
  }
  const cookies = parseCookies(req);
  return cookies[accessCookieName(proposalToken)] || '';
}

export function buildAccessCookie(proposalToken, accessToken, maxAgeSec = 60 * 60 * 24) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${accessCookieName(proposalToken)}=${encodeURIComponent(accessToken)}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${secure}`;
}

export function findValidSession(proposal, accessToken) {
  if (!proposal || !accessToken) return null;
  const hashed = hashSecret(accessToken);
  const now = new Date();
  return (proposal.accessSessions || []).find(
    (session) =>
      session.tokenHash &&
      safeEqualHex(session.tokenHash, hashed) &&
      session.expiresAt &&
      new Date(session.expiresAt) > now
  );
}

export function isProposalLive(proposal) {
  if (!proposal || proposal.revoked) return false;
  if (proposal.status === 'draft' || proposal.status === 'expired') return false;
  if (proposal.expiresAt && new Date(proposal.expiresAt) < new Date()) return false;
  return true;
}

export function isProposalRespondable(proposal) {
  if (!proposal || proposal.revoked) return false;
  if (proposal.status === 'draft' || proposal.status === 'expired') return false;
  if (proposal.expiresAt && new Date(proposal.expiresAt) < new Date()) return false;
  if (isProposalLive(proposal)) return true;
  if (!proposal.viewedAt) return false;
  const ageMs = Date.now() - new Date(proposal.viewedAt).getTime();
  return ageMs >= 0 && ageMs < 4 * 60 * 60 * 1000;
}
