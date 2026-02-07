import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongoose';
import Contact from '@/models/Contact';
import { publicRateLimiter } from '@/lib/rateLimiter';

export default async function handler(req, res) {
  // 1. Rate Limiting
  try {
    const rateLimitResult = await publicRateLimiter(req);
    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', rateLimitResult.retryAfter);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
      });
    }
  } catch (err) {
    console.warn('[API /contact] Rate limiting error:', err.message);
  }

  // 2. Security Headers (Disable Caching)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'POST') {
    try {
      await connectDB();
      const { name, email, subject, message, formType } = req.body;

      // Basic Validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      // Create Database Entry
      const contact = new Contact({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        formType: formType || 'message',
        status: 'new',
      });

      await contact.save();

      // --- EMAIL NOTIFICATION LOGIC ---
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: true, 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"CorpCrunch Contact" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: 'scoop@corpcrunch.io',
        subject: `New Message: ${subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
      };

      // Send the email (we don't 'await' here to keep response time fast, 
      // or you can await if you want to ensure the email is sent before responding)
      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: 'Message sent successfully!',
        data: { id: contact._id },
      });

    } catch (error) {
      console.error('[API /contact] Error:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  // Handle GET for Admin
  if (req.method === 'GET') {
    try {
      await connectDB();
      const contacts = await Contact.find({}).sort({ createdAt: -1 }).limit(100).lean();
      return res.status(200).json({ success: true, contacts });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}