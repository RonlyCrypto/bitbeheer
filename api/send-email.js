const nodemailer = require('nodemailer');

// TransIP SMTP configuration
const createTransIPTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.transip.nl',
    port: 587,
    secure: false,
    auth: {
      user: process.env.TRANSIP_EMAIL_UPDATE,
      pass: process.env.TRANSIP_PASSWORD_UPDATE
    }
  });
};

// Gmail SMTP configuration (fallback)
const createGmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
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
    const { to, subject, htmlContent, textContent, type } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Try TransIP first, fallback to Gmail
    let transporter;
    try {
      transporter = createTransIPTransporter();
      await transporter.verify();
      console.log('TransIP SMTP connection verified');
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

    // Determine from email based on type
    const fromEmail = type === 'contact' ? 'info@bitbeheer.nl' : 'update@bitbeheer.nl';

    const mailOptions = {
      from: `"BitBeheer" <${fromEmail}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message
    });
  }
};
