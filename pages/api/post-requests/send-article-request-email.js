import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const {
      submitterName,
      submitterEmail,
      submitterPhone,
      companyName,
      submitterAddress,
      categoryName,
      description,
    } = req.body;

    // Validate required fields
    if (!submitterName || !submitterEmail || !submitterPhone || !companyName || !submitterAddress || !categoryName || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Create transporter using SMTP settings from environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #2551e7 0%, #1a3eb8 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
          .field {
            margin-bottom: 20px;
          }
          .field-label {
            font-weight: bold;
            color: #2551e7;
            margin-bottom: 5px;
          }
          .field-value {
            background: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #e0e0e0;
          }
          .description {
            background: white;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e0e0e0;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, #2551e7 0%, #1a3eb8 100%);
            margin: 20px 0;
            border-radius: 2px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📝 New Article Request</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="field-label">👤 Name</div>
            <div class="field-value">${submitterName}</div>
          </div>

          <div class="field">
            <div class="field-label">📧 Email</div>
            <div class="field-value"><a href="mailto:${submitterEmail}">${submitterEmail}</a></div>
          </div>

          <div class="field">
            <div class="field-label">📱 Phone Number</div>
            <div class="field-value">${submitterPhone}</div>
          </div>

          <div class="field">
            <div class="field-label">🏢 Company</div>
            <div class="field-value">${companyName}</div>
          </div>

          <div class="field">
            <div class="field-label">📍 Location</div>
            <div class="field-value">${submitterAddress}</div>
          </div>

          <div class="field">
            <div class="field-label">📂 Category</div>
            <div class="field-value">${categoryName}</div>
          </div>

          <div class="divider"></div>

          <div class="field">
            <div class="field-label">📄 Content Description</div>
            <div class="description">${description}</div>
          </div>

          <div class="footer">
            <p>This email was sent from Corp Crunch Article Request Form</p>
            <p>Received on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const emailText = `
New Article Request

Name: ${submitterName}
Email: ${submitterEmail}
Phone: ${submitterPhone}
Company: ${companyName}
Location: ${submitterAddress}
Category: ${categoryName}

Content Description:
${description}

---
Received on ${new Date().toLocaleString()}
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Corp Crunch Article Requests" <${process.env.SMTP_USER}>`,
      to: 'scoop@corpcrunch.io',
      subject: `New Article Request from ${companyName} - ${submitterName}`,
      text: emailText,
      html: emailHtml,
      replyTo: submitterEmail,
    });

    console.log('Email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}