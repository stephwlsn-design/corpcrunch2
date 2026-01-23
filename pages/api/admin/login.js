import connectDB from '@/lib/mongoose';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '314cf40e2d518ba6a89c6070ab4e48943d741780c5b8626e1e2f91374aaa0feec6566da919f293d469b8f11ce130ef9bb6bbb97e134d74e4e9674ed513ecbe3b';

export default async function handler(req, res) {
  // Prevent multiple responses
  let responseSent = false;
  
  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      res.status(statusCode).json(data);
    }
  };

  // Disable Next.js caching for this API route
  if (!responseSent) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  if (req.method !== 'POST') {
    return sendResponse(405, { success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectDB();
    console.log('[API /admin/login] ✓ Database connected');

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return sendResponse(400, {
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find admin by email (case-insensitive)
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      console.log('[API /admin/login] ❌ Admin not found:', email);
      return sendResponse(401, {
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      console.log('[API /admin/login] ❌ Admin account deactivated:', email);
      return sendResponse(403, {
        success: false,
        message: 'Admin account is deactivated',
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      console.log('[API /admin/login] ❌ Invalid password for:', email);
      return sendResponse(401, {
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[API /admin/login] ✅ Login successful for:', email);

    // Return success with token
    return sendResponse(200, {
      success: true,
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[API /admin/login] ❌ Error:', error);
    return sendResponse(500, {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

