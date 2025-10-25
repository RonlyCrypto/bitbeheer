module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return default templates
    const templates = [
      {
        id: 'site_live',
        name: 'Site Live Aankondiging',
        subject: 'BitBeheer is nu live! 🚀',
        content: `Beste {{name}},

Geweldig nieuws! BitBeheer is nu officieel live en klaar om je te helpen bij je Bitcoin investeringen.

Wat kun je nu doen:
• Persoonlijke 1-op-1 begeleiding boeken
• Bitcoin geschiedenis en data bekijken
• Portfolio beheer tools gebruiken
• Veilig Bitcoin kopen en bewaren

Log in op https://www.bitbeheer.nl om te beginnen!

Met vriendelijke groet,
Het BitBeheer team`,
        category: 'opening_website'
      },
      {
        id: 'welcome',
        name: 'Welkom Bericht',
        subject: 'Welkom bij BitBeheer! 👋',
        content: `Beste {{name}},

Welkom bij BitBeheer! Bedankt voor je interesse in onze Bitcoin begeleiding.

We helpen je graag met:
• Veilig Bitcoin kopen
• Eigen beheer van je Bitcoin
• Persoonlijke begeleiding op maat

Heb je vragen? Neem gerust contact met ons op!

Met vriendelijke groet,
Het BitBeheer team`,
        category: 'account_aanmelden'
      },
      {
        id: 'reminder',
        name: 'Herinnering',
        subject: 'Vergeet niet om in te loggen op BitBeheer',
        content: `Beste {{name}},

Je hebt je aangemeld voor BitBeheer, maar bent nog niet ingelogd.

Log in op https://www.bitbeheer.nl om:
• Je persoonlijke dashboard te bekijken
• Bitcoin begeleiding te boeken
• Portfolio tools te gebruiken

Met vriendelijke groet,
Het BitBeheer team`,
        category: 'account_aanmelden'
      }
    ];

    return res.status(200).json({
      success: true,
      templates: templates
    });
  }

  if (req.method === 'POST') {
    // Create new template
    const { name, subject, content, category } = req.body;

    if (!name || !subject || !content || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newTemplate = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      category,
      createdAt: new Date().toISOString()
    };

    // In a real application, you would save this to a database
    // For now, we'll just return the created template
    return res.status(201).json({
      success: true,
      template: newTemplate
    });
  }

  if (req.method === 'PUT') {
    // Update template
    const { id, name, subject, content, category } = req.body;

    if (!id || !name || !subject || !content || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // In a real application, you would update this in a database
    const updatedTemplate = {
      id,
      name,
      subject,
      content,
      category,
      updatedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      template: updatedTemplate
    });
  }

  if (req.method === 'DELETE') {
    // Delete template
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // In a real application, you would delete this from a database
    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
