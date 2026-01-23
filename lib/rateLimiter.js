/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

const rateLimitStore = new Map();

/**
 * Rate limiter middleware
 * @param {object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @returns {function} Middleware function
 */
export function rateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
  } = options;

  return async (req) => {
    // Get client identifier (IP address or user ID)
    const identifier = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.headers['x-real-ip'] || 
                      req.connection?.remoteAddress ||
                      'unknown';

    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    // Get or create rate limit record
    let record = rateLimitStore.get(key);
    
    if (!record || now - record.resetTime > windowMs) {
      // Create new record or reset expired record
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    record.count++;

    // Check if limit exceeded
    if (record.count > maxRequests) {
      // Clean up old records periodically
      if (Math.random() < 0.01) { // 1% chance to clean up
        cleanupExpiredRecords(now);
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    // Update store
    rateLimitStore.set(key, record);

    // Clean up old records periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupExpiredRecords(now);
    }

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  };
}

/**
 * Clean up expired rate limit records
 */
function cleanupExpiredRecords(now) {
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Admin-specific rate limiter (more lenient)
 */
export const adminRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200, // Higher limit for admins
});

/**
 * Public API rate limiter (stricter)
 */
export const publicRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

/**
 * Post creation rate limiter (very strict)
 */
export const postCreationRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // Max 10 posts per hour
});

