import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { requireAdminAuth } from '@/lib/adminAuth';

const ALLOWED_UPDATE_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'companyName',
  'location',
  'address',
  'city',
  'state',
  'bio',
  'profilePicture',
  'role',
  'isActive',
];

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (dbError) {
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

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const user = await User.findById(id).select('-password').lean();
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({
        success: true,
        data: { ...user, id: user._id.toString(), _id: undefined },
      });
    } catch (error) {
      console.error('[API /admin/users/[id]] GET Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const updateData = {};
      Object.keys(req.body).forEach((key) => {
        if (ALLOWED_UPDATE_FIELDS.includes(key)) {
          if (key === 'bio' && req.body[key]) {
            updateData[key] = String(req.body[key]).slice(0, 150);
          } else if (key === 'email') {
            updateData[key] = String(req.body[key]).toLowerCase().trim();
          } else {
            updateData[key] = req.body[key];
          }
        }
      });

      if (req.body.password && req.body.password.trim().length >= 8) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(req.body.password.trim(), salt);
      }

      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .select('-password')
        .lean();

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { ...user, id: user._id.toString(), _id: undefined },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
      console.error('[API /admin/users/[id]] PATCH Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const user = await User.findByIdAndDelete(id).lean();

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('[API /admin/users/[id]] DELETE Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
