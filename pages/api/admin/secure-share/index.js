import connectDB from '@/lib/mongoose';
import SecureShare from '@/models/SecureShare';
import { requireAdminAuth } from '@/lib/adminAuth';
import {
  adminSharePayload,
  buildSecureShareStats,
  purgeExpiredShares,
} from '@/lib/secureShareService';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
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

  try {
    await purgeExpiredShares().catch((err) => console.error('[admin/secure-share] purge', err.message));
    const filter = {};
    if (req.query.filter === 'flagged') filter.reportCount = { $gt: 0 };
    const [docs, stats] = await Promise.all([
      SecureShare.find(filter)
        .sort({ reportCount: -1, createdAt: -1 })
        .limit(300)
        .select('-tokenHash -iv -authTag -passcodeHash')
        .lean(),
      buildSecureShareStats(),
    ]);
    return res.status(200).json({
      success: true,
      stats,
      data: docs.map(adminSharePayload),
    });
  } catch (error) {
    console.error('[admin/secure-share] GET', error);
    return res.status(500).json({ success: false, message: 'Failed to load shared files' });
  }
}
