// API endpoint for sending verification emails
// POST /api/send-verification-email - Send verification email to user

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userEmail, userName, verificationUrl } = req.body;

    if (!userEmail || !verificationUrl) {
      return res.status(400).json({ error: 'Email and verification URL are required' });
    }

    // Create TransIP transporter for noreply@bitbeheer.nl
    const transporter = nodemailer.createTransporter({
      host: 'smtp.transip.nl',
      port: 465,
      secure: true,
      auth: {
        user: process.env.TRANSIP_EMAIL_NOREPLY || 'noreply@bitbeheer.nl',
        pass: process.env.TRANSIP_PASSWORD_NOREPLY || process.env.TRANSIP_PASSWORD
      }
    });

    // Verification email template
    const verificationEmail = {
      from: 'noreply@bitbeheer.nl',
      to: userEmail,
      subject: 'Bevestig je account bij BitBeheer - Verificatie vereist 🔐',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Verificatie - BitBeheer</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Account Verificatie</h1>
            <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">BitBeheer - Persoonlijke Bitcoin Begeleiding</p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #f97316; margin-top: 0;">Hallo ${userName || 'Bitcoin Investeerder'}!</h2>
            
            <p>Bedankt voor je aanmelding bij BitBeheer! Om je account te activeren, moet je eerst je e-mailadres verifiëren.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">⚠️ Belangrijk:</h3>
              <ul style="color: #4b5563; margin: 0;">
                <li>Je account wordt <strong>automatisch verwijderd</strong> na 5 dagen als je niet verifieert</li>
                <li>Klik op de knop hieronder om je account te activeren</li>
                <li>Na verificatie ontvang je een welkomstbericht</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🔐 Account Verifiëren
              </a>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>⏰ Tijdlimiet:</strong> Je hebt 5 dagen om je account te verifiëren. Na deze periode wordt je account automatisch verwijderd.</p>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;"><strong>💡 Tip:</strong> Als de knop niet werkt, kopieer en plak deze link in je browser:</p>
              <p style="margin: 5px 0 0 0; word-break: break-all; color: #1e40af; font-size: 12px;">${verificationUrl}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong>BitBeheer</strong><br>
              Persoonlijke begeleiding bij het investeren in Bitcoin<br>
              <a href="mailto:update@bitbeheer.nl" style="color: #f97316;">update@bitbeheer.nl</a>
            </p>
            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
              Deze e-mail is verzonden naar ${userEmail}
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Account Verificatie - BitBeheer 🔐

Hallo ${userName || 'Bitcoin Investeerder'}!

Bedankt voor je aanmelding bij BitBeheer! Om je account te activeren, moet je eerst je e-mailadres verifiëren.

⚠️ Belangrijk:
• Je account wordt automatisch verwijderd na 5 dagen als je niet verifieert
• Klik op de link hieronder om je account te activeren
• Na verificatie ontvang je een welkomstbericht

Verifieer je account: ${verificationUrl}

⏰ Tijdlimiet: Je hebt 5 dagen om je account te verifiëren. Na deze periode wordt je account automatisch verwijderd.

Met vriendelijke groet,
Het BitBeheer Team

---
BitBeheer - Persoonlijke begeleiding bij het investeren in Bitcoin
update@bitbeheer.nl
      `
    };

    // Send email
    const info = await transporter.sendMail(verificationEmail);
    
    console.log('Verification email sent successfully:', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send verification email',
      details: error.message
    });
  }
};
