import jwt from 'jsonwebtoken';
import Admin from '@/models/Admin';

// JWT_SECRET must be set via environment variable - no fallback for security
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('[adminAuth] ❌ JWT_SECRET environment variable is not set');
}

/**
 * Verify admin token from request
 * @param {string} token - JWT token
 * @returns {Promise<{valid: boolean, admin?: object, error?: string}>}
 */
export async function verifyAdminToken(token) {
  try {
    if (!JWT_SECRET) {
      return { valid: false, error: 'Server configuration error' };
    }

    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    // Verify token
    const decoded = jwt.verify(cleanToken, JWT_SECRET);

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return { valid: false, error: 'Admin not found or inactive' };
    }

    return { valid: true, admin };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' };
    }
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Get admin token from request headers
 * @param {object} req - Request object
 * @returns {string|null} - Token or null
 */
export function getAdminTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  // Remove 'Bearer ' prefix if present
  return authHeader.replace(/^Bearer\s+/i, '');
}

/**
 * Middleware to protect admin routes
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {Promise<{authorized: boolean, admin?: object, error?: string}>}
 */
export async function requireAdminAuth(req) {
  const token = getAdminTokenFromRequest(req);
  
  if (!token) {
    return { authorized: false, error: 'Authentication required' };
  }

  const verification = await verifyAdminToken(token);
  
  if (!verification.valid) {
    return { authorized: false, error: verification.error || 'Unauthorized' };
  }

  return { authorized: true, admin: verification.admin };
}

