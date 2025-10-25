const nodemailer = require('nodemailer');

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
      user: process.env.GMAIL_USER || 'info@bitbeheer.nl',
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
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject and message are required' });
    }

    // Try TransIP first, fallback to Gmail
    let transporter;
    try {
      transporter = createInfoTransporter();
      await transporter.verify();
      console.log('TransIP SMTP connection verified for info@bitbeheer.nl');
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

    // Create email content
    const emailContent = `
Nieuwe contact aanvraag via BitBeheer website:

Naam: ${name}
E-mail: ${email}
${phone ? `Telefoon: ${phone}` : ''}
Onderwerp: ${subject}

Bericht:
${message}

---
Verzonden via BitBeheer contact formulier
Datum: ${new Date().toLocaleString('nl-NL')}
    `.trim();

    const mailOptions = {
      from: `"BitBeheer Contact" <info@bitbeheer.nl>`,
      to: 'info@bitbeheer.nl',
      replyTo: email,
      subject: `Contact: ${subject}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent:', info.messageId);

    // Send confirmation email to user
    const confirmationContent = `
Beste ${name},

Bedankt voor je bericht via BitBeheer!

We hebben je bericht ontvangen en zullen zo snel mogelijk reageren.

Je bericht:
Onderwerp: ${subject}
Bericht: ${message}

Met vriendelijke groet,
Het BitBeheer team

---
Dit is een automatische bevestiging. Reageer niet op deze e-mail.
    `.trim();

    const confirmationMailOptions = {
      from: `"BitBeheer" <info@bitbeheer.nl>`,
      to: email,
      subject: 'Bevestiging: Je bericht is ontvangen',
      text: confirmationContent,
      html: confirmationContent.replace(/\n/g, '<br>')
    };

    await transporter.sendMail(confirmationMailOptions);
    console.log('Confirmation email sent to:', email);

    return res.status(200).json({
      success: true,
      message: 'Contact email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Contact email error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};
