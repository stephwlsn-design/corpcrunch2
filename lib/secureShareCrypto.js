import crypto from 'crypto';

/**
 * Crypto + file helpers for the public one-time file exchange ("Secure Share").
 *
 * - Files are encrypted at rest with AES-256-GCM (random IV per file).
 * - Links are random 256-bit tokens; only a SHA-256 hash of the token is stored,
 *   so a database leak does not reveal working links.
 * - Optional passcodes are stored with scrypt (salted).
 */

function masterKey() {
  const secret = process.env.SECURE_SHARE_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Secure Share encryption key is not configured');
  }
  return crypto.createHash('sha256').update(`secure-share:v1:${secret}`).digest();
}

export function generateShareToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(`token:${String(token || '')}`).digest('hex');
}

export function hashIp(ip) {
  if (!ip) return '';
  return crypto
    .createHmac('sha256', masterKey())
    .update(String(ip))
    .digest('hex')
    .slice(0, 40);
}

export function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  };
}

export function decryptBuffer(encrypted, ivB64, tagB64) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    masterKey(),
    Buffer.from(ivB64, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function hashPasscode(passcode) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(passcode), salt, 32);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPasscode(passcode, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(String(passcode || ''), Buffer.from(saltHex, 'hex'), 32);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

/**
 * Identify a file from its leading bytes. Never trust the browser-supplied type.
 * Returns { mime, ext } or null if the file is not an allowed type.
 */
export function sniffFileType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  const head = buffer.subarray(0, 1024).toString('latin1');
  if (head.includes('%PDF-')) return { mime: 'application/pdf', ext: 'pdf' };
  if (buffer[0] === 0x89 && buffer.subarray(1, 4).toString('latin1') === 'PNG') {
    return { mime: 'image/png', ext: 'png' };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  if (
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  if (buffer.subarray(0, 4).toString('latin1') === 'GIF8') {
    return { mime: 'image/gif', ext: 'gif' };
  }
  return null;
}
