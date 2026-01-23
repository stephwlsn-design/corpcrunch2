import connectDB from '@/lib/mongoose';
import Contact from '@/models/Contact';

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

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendResponse(400, {
          success: false,
          message: 'Invalid email format',
        });
      }

      // Create contact entry
      const contact = new Contact({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        formType: formType || 'message',
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















