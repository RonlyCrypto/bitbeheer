// API endpoint for sending welcome emails from noreply@bitbeheer.nl
// POST /api/send-welcome-email - Send welcome email to new users

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
    const { userEmail, userName } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
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

    // Welcome email template
    const welcomeEmail = {
      from: 'noreply@bitbeheer.nl',
      to: userEmail,
      subject: 'Welkom bij BitBeheer - Je account is aangemaakt! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welkom bij BitBeheer</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welkom bij BitBeheer!</h1>
            <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Persoonlijke Bitcoin Begeleiding</p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #f97316; margin-top: 0;">Hallo ${userName || 'Bitcoin Investeerder'}!</h2>
            
            <p>Geweldig nieuws! Je account bij BitBeheer is succesvol aangemaakt. 🚀</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">🎯 Wat je nu kunt doen:</h3>
              <ul style="color: #4b5563; margin: 0;">
                <li><strong>Persoonlijke 1-op-1 begeleiding</strong> boeken</li>
                <li><strong>Veilig Bitcoin kopen</strong> en bewaren leren</li>
                <li><strong>Eigen beheer</strong> van je Bitcoin opzetten</li>
                <li><strong>Alle tools en resources</strong> gebruiken</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.bitbeheer.nl" 
                 style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Ga naar BitBeheer
              </a>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>💡 Tip:</strong> Bewaar deze e-mail voor je referentie. Je kunt altijd contact met ons opnemen via update@bitbeheer.nl</p>
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
Welkom bij BitBeheer! 🎉

Hallo ${userName || 'Bitcoin Investeerder'}!

Geweldig nieuws! Je account bij BitBeheer is succesvol aangemaakt.

🎯 Wat je nu kunt doen:
• Persoonlijke 1-op-1 begeleiding boeken
• Veilig Bitcoin kopen en bewaren leren  
• Eigen beheer van je Bitcoin opzetten
• Alle tools en resources gebruiken

Ga naar: https://www.bitbeheer.nl

💡 Tip: Bewaar deze e-mail voor je referentie. Je kunt altijd contact met ons opnemen via update@bitbeheer.nl

Met vriendelijke groet,
Het BitBeheer Team

---
BitBeheer - Persoonlijke begeleiding bij het investeren in Bitcoin
update@bitbeheer.nl
      `
    };

    // Send email
    const info = await transporter.sendMail(welcomeEmail);
    
    console.log('Welcome email sent successfully:', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send welcome email',
      details: error.message
    });
  }
};
