import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/adminAuth';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (dbError) {
    console.error('[API /admin/users] Database connection error:', dbError);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please try again later.',
    });
  }

  let authResult;
  try {
    authResult = await requireAdminAuth(req);
  } catch (authError) {
    return res.status(401).json({
      success: false,
      message: 'Authentication error. Please login again.',
    });
  }

  if (!authResult.authorized) {
    return res.status(401).json({
      success: false,
      message: authResult.error || 'Unauthorized. Admin authentication required.',
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const {
      search,
      role,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { firstName: { $regex: search.trim(), $options: 'i' } },
        { lastName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { companyName: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (role && ['user', 'admin', 'editor'].includes(role)) {
      query.role = role;
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOpt = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Backfill lastLoginAt and loginCount for users created before these fields existed
    try {
      await User.collection.updateMany(
        { $or: [{ lastLoginAt: null }, { lastLoginAt: { $exists: false } }] },
        [{ $set: { lastLoginAt: '$createdAt', loginCount: { $ifNull: ['$loginCount', 1] } } }]
      );
    } catch (backfillErr) {
      // Non-fatal - continue with fetch
      console.warn('[API /admin/users] Backfill warning:', backfillErr?.message);
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortOpt)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    const data = users.map((u) => ({
      ...u,
      id: u._id.toString(),
      _id: undefined,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[API /admin/users] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
