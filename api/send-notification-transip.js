// TransIP SMTP Implementation (GRATIS als je TransIP hosting hebt)
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { email, name, message } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // TransIP SMTP Configuration
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: 'smtp.transip.nl',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.TRANSIP_EMAIL, // jouw-email@jouw-domein.nl
        pass: process.env.TRANSIP_PASSWORD // jouw TransIP wachtwoord
      }
    });

    const emailData = {
      from: process.env.TRANSIP_EMAIL,
      to: 'update@bitbeheer.nl',
      subject: 'Notificatie Aanvraag - BitBeheer',
      text: `
        Nieuwe notificatie aanvraag:
        
        Naam: ${name || 'Niet opgegeven'}
        E-mail: ${email}
        Bericht: ${message || 'Ik wil graag op de hoogte blijven van wanneer BitBeheer live gaat.'}
        
        Datum: ${new Date().toLocaleString('nl-NL')}
      `,
      html: `
        <h2>Nieuwe Notificatie Aanvraag - BitBeheer</h2>
        <p><strong>Naam:</strong> ${name || 'Niet opgegeven'}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Bericht:</strong> ${message || 'Ik wil graag op de hoogte blijven van wanneer BitBeheer live gaat.'}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleString('nl-NL')}</p>
      `
    };

    // Send email via TransIP SMTP
    await transporter.sendMail(emailData);

    return res.status(200).json({ 
      success: true, 
      message: 'Notificatie aanvraag ontvangen' 
    });

  } catch (error) {
    console.error('Error processing notification request:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Er is een fout opgetreden bij het verwerken van je aanvraag'
    });
  }
}
