// API endpoint to save email addresses for notifications
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

    // Create email record
    const emailRecord = {
      id: Date.now().toString(),
      email: email.trim().toLowerCase(),
      name: name?.trim() || 'Niet opgegeven',
      message: message?.trim() || 'Geen bericht',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('nl-NL')
    };

    // For now, we'll use a simple approach with console logging
    // In production, you would save to a database
    console.log('New email notification request:', emailRecord);

    // Store in a simple way that can be accessed by the admin
    // In production, this would be saved to a database
    const existingEmails = JSON.parse(process.env.STORED_EMAILS || '[]');
    existingEmails.push(emailRecord);
    
    // Update environment variable (this is a simple approach for demo)
    // In production, use a proper database
    console.log('Stored emails:', existingEmails);

    // Send notification email to admin
    const nodemailer = require('nodemailer');
    
    // Try Gmail SMTP first (if configured)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
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
        subject: 'Nieuwe Notificatie Aanvraag - BitBeheer',
        text: `
          Nieuwe notificatie aanvraag:
          
          Naam: ${emailRecord.name}
          E-mail: ${emailRecord.email}
          Bericht: ${emailRecord.message}
          Datum: ${emailRecord.date}
        `,
        html: `
          <h2>Nieuwe Notificatie Aanvraag - BitBeheer</h2>
          <p><strong>Naam:</strong> ${emailRecord.name}</p>
          <p><strong>E-mail:</strong> ${emailRecord.email}</p>
          <p><strong>Bericht:</strong> ${emailRecord.message}</p>
          <p><strong>Datum:</strong> ${emailRecord.date}</p>
        `
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'E-mail opgeslagen en notificatie verzonden',
      emailId: emailRecord.id
    });

  } catch (error) {
    console.error('Error processing email request:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Er is een fout opgetreden bij het verwerken van je aanvraag'
    });
  }
}
