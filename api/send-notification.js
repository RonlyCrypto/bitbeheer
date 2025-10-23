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
    const { email, name, message, timestamp, userAgent } = req.body;

    // Security checks
    if (!req.headers['x-requested-with'] || req.headers['x-requested-with'] !== 'XMLHttpRequest') {
      return res.status(403).json({ error: 'CSRF protection: Invalid request' });
    }

    // Rate limiting check
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const rateLimitKey = `rate_limit_${clientIP}`;
    const lastRequest = global.rateLimitStore?.[rateLimitKey];
    const now = Date.now();
    
    if (lastRequest && (now - lastRequest) < 60000) { // 1 minute cooldown per IP
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait before submitting again.' });
    }

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate input lengths (prevent spam)
    if (email.length > 254) {
      return res.status(400).json({ error: 'Email too long' });
    }
    if (name && name.length > 100) {
      return res.status(400).json({ error: 'Name too long' });
    }
    if (message && message.length > 1000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name ? name.trim().replace(/[<>]/g, '') : undefined;
    const sanitizedMessage = message ? message.trim().replace(/[<>]/g, '') : undefined;

    // Update rate limit store
    if (!global.rateLimitStore) {
      global.rateLimitStore = {};
    }
    global.rateLimitStore[rateLimitKey] = now;

    // Create secure email data with sanitized inputs
    const emailData = {
      to: 'update@bitbeheer.nl',
      from: process.env.TRANSIP_EMAIL,
      subject: 'Notificatie Aanvraag - BitBeheer',
      text: `
        Nieuwe notificatie aanvraag:
        
        Naam: ${sanitizedName || 'Niet opgegeven'}
        E-mail: ${sanitizedEmail}
        Bericht: ${sanitizedMessage || 'Ik wil graag op de hoogte blijven van wanneer BitBeheer live gaat.'}
        
        Datum: ${new Date().toLocaleString('nl-NL')}
        IP: ${clientIP}
        User Agent: ${userAgent || 'Unknown'}
      `,
      html: `
        <h2>Nieuwe Notificatie Aanvraag - BitBeheer</h2>
        <p><strong>Naam:</strong> ${sanitizedName || 'Niet opgegeven'}</p>
        <p><strong>E-mail:</strong> ${sanitizedEmail}</p>
        <p><strong>Bericht:</strong> ${sanitizedMessage || 'Ik wil graag op de hoogte blijven van wanneer BitBeheer live gaat.'}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleString('nl-NL')}</p>
        <hr>
        <p><small><strong>IP:</strong> ${clientIP}</small></p>
        <p><small><strong>User Agent:</strong> ${userAgent || 'Unknown'}</small></p>
      `
    };

    // Send email using TransIP SMTP (FREE with TransIP hosting!)
    const nodemailer = await import('nodemailer');
    
    // Create transporter using TransIP SMTP
    const transporter = nodemailer.default.createTransporter({
      host: 'smtp.transip.nl',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.TRANSIP_EMAIL, // jouw-email@bitbeheer.nl
        pass: process.env.TRANSIP_PASSWORD // jouw TransIP wachtwoord
      },
      tls: {
        rejectUnauthorized: false // For TransIP compatibility
      }
    });

    // Send email
    await transporter.sendMail({
      from: process.env.TRANSIP_EMAIL,
      to: 'update@bitbeheer.nl',
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    });

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
