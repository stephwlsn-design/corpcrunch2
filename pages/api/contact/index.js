import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongoose';
import Contact from '@/models/Contact';
import { publicRateLimiter } from '@/lib/rateLimiter';
import { requireAdminAuth } from '@/lib/adminAuth';
import { recordVisitorFromRequest } from '@/lib/recordVisitorFromRequest';
import { formatPhoneNumber } from '@/lib/phoneCountryCodes';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
      const {
        name,
        email,
        subject,
        message,
        formType,
        inquiryTopic,
        companyName,
        phoneCountryCode,
        phoneNumber,
      } = req.body;

      // Basic Validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All required fields must be completed' });
      }

      const safeFormType =
        formType === 'project' || formType === 'message' || formType === 'product'
          ? formType
          : 'message';
      const safeInquiryTopic =
        typeof inquiryTopic === 'string' ? inquiryTopic.trim().slice(0, 120) : '';
      const safeCompanyName =
        typeof companyName === 'string' ? companyName.trim().slice(0, 200) : '';
      const safePhoneCountryCode =
        typeof phoneCountryCode === 'string' ? phoneCountryCode.trim().slice(0, 8) : '';
      const safePhoneNumber =
        typeof phoneNumber === 'string' ? phoneNumber.replace(/[^\d\s-]/g, '').trim().slice(0, 20) : '';

      if (safePhoneNumber && !safePhoneCountryCode) {
        return res.status(400).json({
          success: false,
          message: 'Please select a country code for your phone number',
        });
      }

      // Create Database Entry
      const contact = new Contact({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        formType: safeFormType,
        inquiryTopic: safeInquiryTopic,
        companyName: safeCompanyName,
        phoneCountryCode: safePhoneCountryCode,
        phoneNumber: safePhoneNumber,
        status: 'new',
      });

      await contact.save();

      recordVisitorFromRequest(req, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: formatPhoneNumber(safePhoneCountryCode, safePhoneNumber),
        source: 'contact',
      }).catch((err) => console.error('[API /contact] Visitor tracking failed:', err));

      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASSWORD;
      if (smtpHost && smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: true,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          const safeName = escapeHtml(name);
          const safeEmail = escapeHtml(email);
          const safeSubject = escapeHtml(subject);
          const safeMessage = escapeHtml(message);
          const safeInquiryTopicHtml = escapeHtml(safeInquiryTopic || 'Not specified');
          const safeCompanyNameHtml = escapeHtml(safeCompanyName || 'Not provided');
          const safePhoneHtml = escapeHtml(
            formatPhoneNumber(safePhoneCountryCode, safePhoneNumber) || 'Not provided'
          );

          await transporter.sendMail({
            from: `"CorpCrunch Contact" <${smtpUser}>`,
            replyTo: email.trim(),
            to: 'scoop@corpcrunch.io',
            subject: `New Message: ${subject}`,
            html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Company:</strong> ${safeCompanyNameHtml}</p>
            <p><strong>Phone:</strong> ${safePhoneHtml}</p>
            <p><strong>Form Type:</strong> ${escapeHtml(safeFormType)}</p>
            <p><strong>Reaching out about:</strong> ${safeInquiryTopicHtml}</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${safeMessage}</p>
          </div>
        `,
          });
        } catch (emailErr) {
          console.error('[API /contact] Email notification failed:', emailErr);
        }
      } else {
        console.warn('[API /contact] SMTP not fully configured; submission saved without email notify');
      }

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
    } catch (dbError) {
      console.error('[API /contact] Database connection error:', dbError);
      return res.status(500).json({ success: false, message: 'Database connection failed.' });
    }

    const authResult = await requireAdminAuth(req);
    if (!authResult.authorized) {
      return res.status(401).json({
        success: false,
        message: authResult.error || 'Unauthorized. Admin authentication required.',
      });
    }

    try {
      const contacts = await Contact.find({}).sort({ createdAt: -1 }).limit(100).lean();
      return res.status(200).json({ success: true, contacts });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}