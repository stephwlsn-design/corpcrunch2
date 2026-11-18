import SecureShare from '@/models/SecureShare';
import {
  decryptBuffer,
  encryptBuffer,
  generateShareToken,
  hashIp,
  hashPasscode,
  hashToken,
  sniffFileType,
  verifyPasscode,
} from '@/lib/secureShareCrypto';
import { deleteStoredFile, readEncryptedFile, storeEncryptedFile } from '@/lib/secureShareFiles';
import { clientIp } from '@/lib/proposalAccess';

export const SECURE_SHARE_MAX_BYTES = 3 * 1024 * 1024;
export const SECURE_SHARE_RETENTION_DAYS = 30;
export const SECURE_SHARE_UPLOADS_PER_HOUR = 5;
export const SECURE_SHARE_UPLOADS_PER_DAY = 15;
export const SECURE_SHARE_MAX_PASSCODE_ATTEMPTS = 5;

export const SECURE_SHARE_EXPIRY_OPTIONS = [
  { id: '1d', label: '24 hours', ms: 24 * 60 * 60 * 1000 },
  { id: '3d', label: '3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  { id: '7d', label: '7 days', ms: 7 * 24 * 60 * 60 * 1000 },
];

const NOT_AVAILABLE = 'This link is not available.';

export function buildSecureShareUrl(req, token) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim();
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();
  const proto =
    forwardedProto || (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
  const path = `/secure-share/view/${encodeURIComponent(token)}`;
  return host ? `${proto}://${host}${path}` : path;
}

export function decodePublicUpload({ contentBase64, fileName }) {
  if (!contentBase64 || !fileName) throw new Error('Choose a file to send.');
  const raw = String(contentBase64).replace(/^data:[^;]*;base64,/, '');
  const buffer = Buffer.from(raw, 'base64');
  if (!buffer.length) throw new Error('The file could not be read.');
  if (buffer.length > SECURE_SHARE_MAX_BYTES) {
    throw new Error('Files must be 3 MB or smaller.');
  }
  const type = sniffFileType(buffer);
  if (!type) throw new Error('Only PDF files and images (PNG, JPG, WebP, GIF) are supported.');
  const safeName =
    String(fileName)
      .replace(/[^\w.\- ()]/g, '_')
      .slice(0, 120) || `document.${type.ext}`;
  return { buffer, fileName: safeName, fileMime: type.mime };
}

export function shareStatus(doc) {
  if (!doc) return 'missing';
  if (doc.purgedAt) return 'purged';
  if (doc.revoked) return doc.reportCount > 0 ? 'held' : 'revoked';
  if (doc.viewedAt) return 'viewed';
  if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) return 'expired';
  return 'unopened';
}

export async function checkUploadAllowance(req) {
  const ipHash = hashIp(clientIp(req));
  if (!ipHash) return { allowed: true, ipHash };
  const now = Date.now();
  const [hour, day] = await Promise.all([
    SecureShare.countDocuments({
      uploaderIpHash: ipHash,
      createdAt: { $gt: new Date(now - 60 * 60 * 1000) },
    }),
    SecureShare.countDocuments({
      uploaderIpHash: ipHash,
      createdAt: { $gt: new Date(now - 24 * 60 * 60 * 1000) },
    }),
  ]);
  if (hour >= SECURE_SHARE_UPLOADS_PER_HOUR || day >= SECURE_SHARE_UPLOADS_PER_DAY) {
    return { allowed: false, ipHash };
  }
  return { allowed: true, ipHash };
}

export async function createSecureShare({
  req,
  ipHash,
  buffer,
  fileName,
  fileMime,
  expiry,
  passcode,
  note,
}) {
  const option =
    SECURE_SHARE_EXPIRY_OPTIONS.find((item) => item.id === expiry) ||
    SECURE_SHARE_EXPIRY_OPTIONS[SECURE_SHARE_EXPIRY_OPTIONS.length - 1];

  const { encrypted, iv, authTag } = encryptBuffer(buffer);
  const fileId = await storeEncryptedFile(encrypted);

  const token = generateShareToken();
  const now = Date.now();
  try {
    await SecureShare.create({
      tokenHash: hashToken(token),
      fileId,
      fileName,
      fileMime,
      fileSize: buffer.length,
      iv,
      authTag,
      note: String(note || '').trim().slice(0, 300),
      passcodeHash: passcode ? hashPasscode(passcode) : '',
      expiresAt: new Date(now + option.ms),
      purgeAt: new Date(now + SECURE_SHARE_RETENTION_DAYS * 24 * 60 * 60 * 1000),
      uploaderIpHash: ipHash || '',
      uploaderUserAgent: String(req.headers['user-agent'] || '').slice(0, 200),
    });
  } catch (err) {
    await deleteStoredFile(fileId);
    throw err;
  }

  return {
    token,
    url: buildSecureShareUrl(req, token),
    expiresAt: new Date(now + option.ms),
    requiresPasscode: Boolean(passcode),
  };
}

export async function findByToken(token) {
  const raw = String(token || '');
  if (!raw || raw.length > 128) return null;
  return SecureShare.findOne({ tokenHash: hashToken(raw) });
}

/** Public, non-consuming description of a link. Never reveals more than needed. */
export async function describeShare(token) {
  const doc = await findByToken(token);
  const status = shareStatus(doc);
  if (!doc || status === 'purged') return { available: false, status: 'missing', message: NOT_AVAILABLE };
  if (status === 'viewed') {
    return {
      available: false,
      status,
      message: 'This document has already been opened and can no longer be viewed.',
    };
  }
  if (status === 'expired') {
    return { available: false, status, message: 'This link has expired.' };
  }
  if (status === 'revoked' || status === 'held') {
    return { available: false, status, message: NOT_AVAILABLE };
  }
  return {
    available: true,
    status,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    fileMime: doc.fileMime,
    note: doc.note || '',
    requiresPasscode: Boolean(doc.passcodeHash),
    expiresAt: doc.expiresAt,
  };
}

/**
 * Open a document exactly once. The file is read and decrypted first (so a storage
 * failure never burns the link), then the one-time flag is claimed atomically.
 */
export async function openShareOnce(token, { passcode, req }) {
  const doc = await findByToken(token);
  const status = shareStatus(doc);
  if (!doc || status === 'purged') return { error: NOT_AVAILABLE, status: 404 };
  if (status === 'viewed') {
    return { error: 'This document has already been opened and can no longer be viewed.', status: 410 };
  }
  if (status === 'expired') return { error: 'This link has expired.', status: 410 };
  if (status === 'revoked' || status === 'held') return { error: NOT_AVAILABLE, status: 410 };

  if (doc.passcodeHash) {
    if (!passcode) return { error: 'Enter the passcode to open this document.', status: 401, needsPasscode: true };
    if (!verifyPasscode(passcode, doc.passcodeHash)) {
      const updated = await SecureShare.findOneAndUpdate(
        { _id: doc._id },
        { $inc: { failedAttempts: 1 } },
        { new: true }
      );
      const left = SECURE_SHARE_MAX_PASSCODE_ATTEMPTS - (updated?.failedAttempts || 0);
      if (left <= 0) {
        await SecureShare.updateOne(
          { _id: doc._id },
          { $set: { revoked: true, revokedReason: 'Too many wrong passcode attempts' } }
        );
        return { error: 'Too many wrong attempts. This link has been locked.', status: 423 };
      }
      return {
        error: `Wrong passcode. ${left} attempt${left === 1 ? '' : 's'} left.`,
        status: 401,
        needsPasscode: true,
      };
    }
  }

  let plain;
  try {
    const encrypted = await readEncryptedFile(doc.fileId);
    plain = decryptBuffer(encrypted, doc.iv, doc.authTag);
  } catch (err) {
    console.error('[secureShare] read/decrypt failed', err.message);
    return { error: 'This document could not be opened. Please try again.', status: 500 };
  }

  const claimed = await SecureShare.findOneAndUpdate(
    {
      _id: doc._id,
      viewedAt: { $exists: false },
      revoked: false,
      purgedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        viewedAt: new Date(),
        viewerIpHash: hashIp(clientIp(req)),
        viewerUserAgent: String(req.headers['user-agent'] || '').slice(0, 200),
      },
      $inc: { viewCount: 1 },
    },
    { new: true }
  );
  if (!claimed) {
    return { error: 'This document has already been opened and can no longer be viewed.', status: 410 };
  }

  return { buffer: plain, fileMime: doc.fileMime, fileName: doc.fileName };
}

export async function reportShare(token, reason) {
  const doc = await findByToken(token);
  if (!doc || doc.purgedAt) return { error: NOT_AVAILABLE, status: 404 };
  doc.reportCount = (doc.reportCount || 0) + 1;
  doc.reportedAt = new Date();
  doc.reportReason = String(reason || '').trim().slice(0, 300);
  // Hold the link until an admin reviews it.
  if (!doc.viewedAt) {
    doc.revoked = true;
    doc.revokedReason = 'Reported by recipient';
  }
  await doc.save();
  return { ok: true };
}

/** Delete stored bytes for anything past its retention date. Cheap, runs opportunistically. */
export async function purgeExpiredShares(limit = 25) {
  const due = await SecureShare.find({
    purgeAt: { $lt: new Date() },
    purgedAt: { $exists: false },
  })
    .limit(limit)
    .select('_id fileId');
  for (const doc of due) {
    await deleteStoredFile(doc.fileId);
    await SecureShare.updateOne(
      { _id: doc._id },
      { $set: { purgedAt: new Date(), revoked: true }, $unset: { fileId: 1 } }
    );
  }
  return due.length;
}

export function adminSharePayload(doc) {
  return {
    id: String(doc._id),
    fileName: doc.fileName,
    fileMime: doc.fileMime,
    fileSize: doc.fileSize,
    note: doc.note || '',
    hasPasscode: Boolean(doc.passcodeHash),
    failedAttempts: doc.failedAttempts || 0,
    status: shareStatus(doc),
    createdAt: doc.createdAt,
    expiresAt: doc.expiresAt,
    purgeAt: doc.purgeAt,
    viewedAt: doc.viewedAt || null,
    viewCount: doc.viewCount || 0,
    reportCount: doc.reportCount || 0,
    reportedAt: doc.reportedAt || null,
    reportReason: doc.reportReason || '',
    revokedReason: doc.revokedReason || '',
    uploaderRef: doc.uploaderIpHash ? doc.uploaderIpHash.slice(0, 8) : '',
    purged: Boolean(doc.purgedAt),
  };
}

export async function buildSecureShareStats() {
  const now = new Date();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total, viewed, flagged, last24h, sizeAgg, live] = await Promise.all([
    SecureShare.countDocuments({}),
    SecureShare.countDocuments({ viewedAt: { $exists: true } }),
    SecureShare.countDocuments({ reportCount: { $gt: 0 }, purgedAt: { $exists: false } }),
    SecureShare.countDocuments({ createdAt: { $gt: dayAgo } }),
    SecureShare.aggregate([
      { $match: { purgedAt: { $exists: false } } },
      { $group: { _id: null, bytes: { $sum: '$fileSize' } } },
    ]),
    SecureShare.countDocuments({
      viewedAt: { $exists: false },
      revoked: false,
      purgedAt: { $exists: false },
      expiresAt: { $gt: now },
    }),
  ]);
  return {
    total,
    viewed,
    waiting: live,
    flagged,
    last24h,
    openRate: total ? Math.round((viewed / total) * 100) : 0,
    storedMb: Math.round(((sizeAgg[0]?.bytes || 0) / (1024 * 1024)) * 10) / 10,
  };
}
