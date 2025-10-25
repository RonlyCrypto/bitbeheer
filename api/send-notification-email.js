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
    const { userEmail, userName, userMessage, category } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Try TransIP first, fallback to Gmail
    let transporter;
    try {
      transporter = createUpdateTransporter();
      await transporter.verify();
      console.log('TransIP SMTP connection verified for update@bitbeheer.nl');
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

    // Create email content for admin notification
    const adminEmailContent = `
Nieuwe notificatie aanmelding via BitBeheer website:

Gebruiker Details:
- Naam: ${userName}
- E-mail: ${userEmail}
- Categorie: ${category}
- Bericht: ${userMessage}

Datum: ${new Date().toLocaleString('nl-NL')}

---
Verzonden via BitBeheer notificatie formulier
    `.trim();

    // Send notification to admin
    const adminMailOptions = {
      from: `"BitBeheer Notificaties" <update@bitbeheer.nl>`,
      to: 'update@bitbeheer.nl',
      subject: `Nieuwe notificatie aanmelding: ${userName}`,
      text: adminEmailContent,
      html: adminEmailContent.replace(/\n/g, '<br>')
    };

    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log('Admin notification email sent:', adminInfo.messageId);

    // Send confirmation email to user
    const userConfirmationContent = `
Beste ${userName},

Bedankt voor je interesse in BitBeheer!

Je bent succesvol aangemeld voor notificaties. We houden je op de hoogte zodra we live gaan met:

• Persoonlijke Bitcoin begeleiding
• Veilig Bitcoin kopen en bewaren
• Portfolio beheer tools
• 1-op-1 begeleiding op maat

We sturen je een bericht zodra alles klaar is!

Met vriendelijke groet,
Het BitBeheer team

---
Dit is een automatische bevestiging. Reageer niet op deze e-mail.
    `.trim();

    const userMailOptions = {
      from: `"BitBeheer" <update@bitbeheer.nl>`,
      to: userEmail,
      subject: 'Bevestiging: Je bent aangemeld voor BitBeheer notificaties',
      text: userConfirmationContent,
      html: userConfirmationContent.replace(/\n/g, '<br>')
    };

    const userInfo = await transporter.sendMail(userMailOptions);
    console.log('User confirmation email sent:', userInfo.messageId);

    return res.status(200).json({
      success: true,
      message: 'Notification emails sent successfully',
      adminMessageId: adminInfo.messageId,
      userMessageId: userInfo.messageId
    });

  } catch (error) {
    console.error('Notification email error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};
