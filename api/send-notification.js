// Vercel Serverless Function for handling notification requests
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

    // Here you would integrate with your email service
    // For now, we'll use a simple approach with Nodemailer or similar
    const emailData = {
      to: 'update@bitbeheer.nl',
      from: email,
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

    // TODO: Implement actual email sending here
    // You can use services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP
    
    console.log('Email data to send:', emailData);

    // For now, just log the data (replace with actual email sending)
    // await sendEmail(emailData);

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
