import connectDB from '@/lib/mongoose';
import Contact from '@/models/Contact';
import { publicRateLimiter } from '@/lib/rateLimiter';

export default async function handler(req, res) {
  // Apply rate limiting to all requests
  try {
    const rateLimitResult = await publicRateLimiter(req);
    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', rateLimitResult.retryAfter);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
        retryAfter: rateLimitResult.retryAfter,
      });
    }
  } catch (rateLimitError) {
    console.warn('[API /contact] Rate limiting error:', rateLimitError.message);
    // Continue if rate limiting fails (fail open)
  }
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

  if (req.method === 'POST') {
    try {
      await connectDB();
      
      const { name, email, subject, message, formType } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return sendResponse(400, {
          success: false,
          message: 'All fields are required',
        });
      }

      // Sanitize inputs
      const sanitizedData = {
        name: name.trim().substring(0, 200),
        email: email.trim().toLowerCase().substring(0, 255),
        subject: subject.trim().substring(0, 200),
        message: message.trim().substring(0, 5000),
        formType: (formType || 'message').trim().substring(0, 50),
      };

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedData.email)) {
        return sendResponse(400, {
          success: false,
          message: 'Invalid email format',
        });
      }

      // Validate name length
      if (sanitizedData.name.length < 2) {
        return sendResponse(400, {
          success: false,
          message: 'Name must be at least 2 characters',
        });
      }

      // Validate message length
      if (sanitizedData.message.length < 10) {
        return sendResponse(400, {
          success: false,
          message: 'Message must be at least 10 characters',
        });
      }

      // Create contact entry
      const contact = new Contact({
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        formType: sanitizedData.formType,
        status: 'new',
      });

      await contact.save();

      console.log('[API /contact] Contact form submitted:', {
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
      });

      return sendResponse(200, {
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
        data: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
        },
      });
    } catch (error) {
      console.error('[API /contact] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to submit contact form. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  if (req.method === 'GET') {
    try {
      await connectDB();
      
      // Get all contacts (for admin use)
      const contacts = await Contact.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return sendResponse(200, {
        success: true,
        count: contacts.length,
        contacts: contacts.map(contact => ({
          id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          status: contact.status,
          formType: contact.formType,
          createdAt: contact.createdAt,
        })),
      });
    } catch (error) {
      console.error('[API /contact] Error fetching contacts:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to fetch contacts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  return sendResponse(405, {
    success: false,
    message: 'Method not allowed',
  });
}















