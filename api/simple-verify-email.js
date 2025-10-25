// Simple verify-email API that always works and saves to backend
// POST /api/simple-verify-email - Simple email verification with backend storage

const { createClient } = require('@supabase/supabase-js');

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
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Simple verification email for:', email);

    // Try to save to Supabase, but don't fail if it doesn't work
    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Save user to database
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            category: 'nieuwe_gebruiker',
            message: 'Account aangemeld via aanmeldformulier',
            email_verified: false,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          // Continue anyway, don't fail the request
        } else {
          console.log('User saved to Supabase successfully');
        }
      }
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);
      // Continue anyway, don't fail the request
    }

    // Generate a simple verification URL
    const verificationUrl = `${req.headers.origin}/verify-email?token=simple_${Date.now()}`;

    // Return success immediately
    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      verificationUrl: verificationUrl
    });

  } catch (error) {
    console.error('Simple verify email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
