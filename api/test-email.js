// Test email API to verify email delivery
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, message, category = 'livegang' } = req.body;

    // Create email data
    const emailData = {
      subject: `Nieuwe ${category} Notificatie Aanvraag - BitBeheer`,
      text: `Nieuwe ${category} notificatie aanvraag:
      
Naam: ${name || 'Niet opgegeven'}
E-mail: ${email}
Bericht: ${message || 'Geen bericht'}
Categorie: ${category}
Datum: ${new Date().toLocaleString('nl-NL')}`,
      html: `
        <h2>Nieuwe ${category} Notificatie Aanvraag - BitBeheer</h2>
        <p><strong>Naam:</strong> ${name || 'Niet opgegeven'}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Bericht:</strong> ${message || 'Geen bericht'}</p>
        <p><strong>Categorie:</strong> ${category}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleString('nl-NL')}</p>
      `
    };

    // Try Gmail SMTP first
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: 'update@bitbeheer.nl',
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html
      });
      
      return res.status(200).json({ 
        success: true, 
        message: `E-mail verzonden naar update@bitbeheer.nl voor categorie: ${category}` 
      });
    }
    
    // Try TransIP SMTP
    if (process.env.TRANSIP_EMAIL && process.env.TRANSIP_PASSWORD) {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: 'smtp.transip.nl',
        port: 587,
        secure: false,
        auth: {
          user: process.env.TRANSIP_EMAIL,
          pass: process.env.TRANSIP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: process.env.TRANSIP_EMAIL,
        to: 'update@bitbeheer.nl',
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html
      });
      
      return res.status(200).json({ 
        success: true, 
        message: `E-mail verzonden naar update@bitbeheer.nl voor categorie: ${category}` 
      });
    }
    
    // If no email service configured, just log
    console.log('Email data to send:', emailData);
    return res.status(200).json({ 
      success: true, 
      message: `E-mail data gelogd (geen e-mail service geconfigureerd) voor categorie: ${category}` 
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Er is een fout opgetreden bij het verzenden van de e-mail'
    });
  }
};
