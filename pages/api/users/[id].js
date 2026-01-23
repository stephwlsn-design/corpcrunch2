import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  // GET - Get user by ID
  if (req.method === 'GET') {
    try {
      const user = await User.findById(id).select('-password').lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...user,
          id: user._id.toString(),
        },
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message,
      });
    }
  }

  // PATCH - Update user
  if (req.method === 'PATCH') {
    try {
      // Get token from Authorization header
      const token = req.headers.authorization;
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No authentication token provided',
        });
      }

      // Verify JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error('[API /users/[id] PATCH] ❌ JWT_SECRET not configured');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Check if user is updating their own profile
      const tokenUserId = (decoded.id || decoded.userId).toString();
      if (tokenUserId !== id && decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own profile',
        });
      }

      // Get update data from body
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        city,
        state,
        bio,
        profilePicture,
      } = req.body;

      // Build update object (only include provided fields)
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (bio !== undefined) updateData.bio = bio ? bio.slice(0, 150) : bio;
      if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password').lean();

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          ...updatedUser,
          id: updatedUser._id.toString(),
        },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error updating user profile',
        error: error.message,
      });
    }
  }

  // DELETE - Delete user (admin only)
  if (req.method === 'DELETE') {
    try {
      // Get token from Authorization header
      const token = req.headers.authorization;
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No authentication token provided',
        });
      }

      // Verify JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error('[API /users/[id] DELETE] ❌ JWT_SECRET not configured');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Check if user is admin
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can delete users',
        });
      }

      // Soft delete (set isActive to false) instead of hard delete
      const deletedUser = await User.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
      ).select('-password').lean();

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message,
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

