const nodemailer = require('nodemailer');

// TransIP SMTP configuration for update@bitbeheer.nl
const createUpdateTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.transip.nl',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.TRANSIP_EMAIL_UPDATE || 'update@bitbeheer.nl',
      pass: process.env.TRANSIP_PASSWORD_UPDATE || 'your_transip_password'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// TransIP SMTP configuration for info@bitbeheer.nl
const createInfoTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.transip.nl',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.TRANSIP_EMAIL_INFO || 'info@bitbeheer.nl',
      pass: process.env.TRANSIP_PASSWORD_INFO || 'your_transip_password'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Gmail SMTP configuration (fallback)
const createGmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'update@bitbeheer.nl',
      pass: process.env.GMAIL_APP_PASSWORD || 'your_gmail_app_password'
    }
  });
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { users, message, subject, fromEmail } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'No users provided' });
    }

    if (!message || !subject) {
      return res.status(400).json({ error: 'Message and subject are required' });
    }

    // Determine which email address to use
    const fromEmail = req.body.fromEmail || 'update@bitbeheer.nl';
    let transporter;
    
    // Try TransIP first, fallback to Gmail
    try {
      if (fromEmail === 'info@bitbeheer.nl') {
        transporter = createInfoTransporter();
      } else {
        transporter = createUpdateTransporter();
      }
      await transporter.verify();
      console.log(`TransIP SMTP connection verified for ${fromEmail}`);
    } catch (transipError) {
      console.log('TransIP SMTP failed, trying Gmail:', transipError.message);
      try {
        transporter = createGmailTransporter();
        await transporter.verify();
        console.log('Gmail SMTP connection verified');
      } catch (gmailError) {
        console.error('Both SMTP configurations failed:', gmailError.message);
        return res.status(500).json({ 
          error: 'Email service unavailable',
          details: 'Both TransIP and Gmail SMTP configurations failed'
        });
      }
    }

    const results = [];
    const errors = [];

    // Send emails to each user
    for (const user of users) {
      try {
        // Replace placeholders in message
        let personalizedMessage = message;
        personalizedMessage = personalizedMessage.replace(/\{\{name\}\}/g, user.name || 'Gebruiker');
        personalizedMessage = personalizedMessage.replace(/\{\{email\}\}/g, user.email);

        const mailOptions = {
          from: `"BitBeheer" <${fromEmail || 'update@bitbeheer.nl'}>`,
          to: user.email,
          subject: subject,
          text: personalizedMessage,
          html: personalizedMessage.replace(/\n/g, '<br>')
        };

        const info = await transporter.sendMail(mailOptions);
        results.push({
          email: user.email,
          success: true,
          messageId: info.messageId
        });

        console.log(`Email sent to ${user.email}:`, info.messageId);
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        errors.push({
          email: user.email,
          error: error.message
        });
      }
    }

    // Log results
    console.log(`Bulk email results: ${results.length} sent, ${errors.length} failed`);

    return res.status(200).json({
      success: true,
      message: `Bulk email sent to ${results.length} recipients`,
      results: {
        sent: results.length,
        failed: errors.length,
        details: results,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};
