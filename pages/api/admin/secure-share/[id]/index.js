import mongoose from 'mongoose';
import connectDB from '@/lib/mongoose';
import SecureShare from '@/models/SecureShare';
import { requireAdminAuth } from '@/lib/adminAuth';
import { adminSharePayload } from '@/lib/secureShareService';
import { deleteStoredFile } from '@/lib/secureShareFiles';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
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
  if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

  if (req.method === 'PATCH') {
    const action = req.body?.action;
    if (action === 'revoke') {
      doc.revoked = true;
      doc.revokedReason = 'Revoked by admin';
    } else if (action === 'restore') {
      if (doc.purgedAt) {
        return res.status(400).json({ success: false, message: 'This file has been purged.' });
      }
      doc.revoked = false;
      doc.revokedReason = '';
      doc.reportCount = 0;
      doc.reportReason = '';
      doc.reportedAt = undefined;
    } else if (action === 'dismiss-report') {
      doc.reportCount = 0;
      doc.reportReason = '';
      doc.reportedAt = undefined;
    } else {
      return res.status(400).json({ success: false, message: 'Unknown action' });
    }
    await doc.save();
    return res.status(200).json({ success: true, data: adminSharePayload(doc) });
  }

  if (req.method === 'DELETE') {
    await deleteStoredFile(doc.fileId);
    await SecureShare.deleteOne({ _id: doc._id });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
