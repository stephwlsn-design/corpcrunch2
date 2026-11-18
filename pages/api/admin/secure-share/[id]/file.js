import mongoose from 'mongoose';
import connectDB from '@/lib/mongoose';
import SecureShare from '@/models/SecureShare';
import { requireAdminAuth } from '@/lib/adminAuth';
import { decryptBuffer } from '@/lib/secureShareCrypto';
import { readEncryptedFile } from '@/lib/secureShareFiles';

export const config = {
  api: {
    responseLimit: '8mb',
  },
};

/** Admin-only: stream the decrypted file for review. Does not affect the one-time view state. */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database connection failed.' });
  }

  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return res.status(401).json({ success: false, message: auth.error || 'Unauthorized' });
  }

  const { id } = req.query;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  const doc = await SecureShare.findById(id);
  if (!doc || doc.purgedAt || !doc.fileId) {
    return res.status(404).json({ success: false, message: 'File is no longer stored.' });
  }

  try {
    const encrypted = await readEncryptedFile(doc.fileId);
    const plain = decryptBuffer(encrypted, doc.iv, doc.authTag);
    res.setHeader('Content-Type', doc.fileMime || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', String(plain.length));
    return res.status(200).send(plain);
  } catch (error) {
    console.error('[admin/secure-share file]', error);
    return res.status(500).json({ success: false, message: 'Could not read the file.' });
  }
}
