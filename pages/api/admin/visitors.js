import connectDB from '@/lib/mongoose';
import SiteVisitor from '@/models/SiteVisitor';
import { requireAdminAuth } from '@/lib/adminAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const authResult = await requireAdminAuth(req);
  if (!authResult.authorized) {
    return res.status(401).json({
      success: false,
      message: authResult.error || 'Unauthorized. Admin authentication required.',
    });
  }

  try {
    await connectDB();

    const { page = '1', limit = '50', search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const filter = { consentStatus: { $in: ['accepted', 'otto'] } };
    if (search?.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phoneNumber: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { country: { $regex: term, $options: 'i' } },
        { city: { $regex: term, $options: 'i' } },
      ];
    }

    const [visitors, total] = await Promise.all([
      SiteVisitor.find(filter)
        .sort({ lastSeenAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-pageViews')
        .lean(),
      SiteVisitor.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: visitors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[API /admin/visitors] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visitors' });
  }
}
