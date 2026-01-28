import connectDB from '@/lib/mongoose';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

// JWT_SECRET must be set via environment variable - no fallback for security
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('[API /admin/login] ❌ JWT_SECRET environment variable is not set');
}

export default async function handler(req, res) {
  // Prevent multiple responses
  let responseSent = false;
  
  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      res.status(statusCode).json(data);
    }
  };

  // Set CORS headers FIRST - before any other logic
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Disable Next.js caching for this API route
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return sendResponse(200, { success: true });
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    console.log('[API /admin/login] ❌ Method not allowed:', req.method);
    return sendResponse(405, { success: false, message: 'Method not allowed. Only POST is supported.' });
  }

  try {
    // Validate JWT_SECRET is configured
    if (!JWT_SECRET) {
      console.error('[API /admin/login] ❌ JWT_SECRET not configured');
      return sendResponse(500, {
        success: false,
        message: 'Server configuration error. Please contact administrator.',
      });
    }

    // Connect to database
    await connectDB();
    console.log('[API /admin/login] ✓ Database connected');

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('[API /admin/login] ❌ Missing email or password');
      return sendResponse(400, {
        success: false,
        message: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[API /admin/login] ❌ Invalid email format:', email);
      return sendResponse(400, {
        success: false,
        message: 'Invalid email format',
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
        message: 'Admin account is deactivated. Please contact support.',
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
        role: admin.role || 'admin',
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Changed from 24h to 7d for better UX
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
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role || 'admin',
      },
    });
  } catch (error) {
    console.error('[API /admin/login] ❌ Error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return sendResponse(503, {
        success: false,
        message: 'Database connection error. Please try again later.',
      });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(500, {
        success: false,
        message: 'Token generation error. Please try again.',
      });
    }

    // Generic error response
    return sendResponse(500, {
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}