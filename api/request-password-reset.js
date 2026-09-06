// API endpoint to request a password reset
// POST /api/request-password-reset - Generate a reset token and email it

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Always return the same generic response, whether or not the email is
  // known -- avoids leaking which addresses have an account.
  const genericResponse = {
    success: true,
    message: 'Als dit e-mailadres bekend is, ontvang je een e-mail met instructies om je wachtwoord te resetten.'
  };

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'E-mailadres is verplicht' });
    }

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(200).json(genericResponse);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: account } = await supabase
      .from('accounts')
      .select('id, email, name, auth_user_id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    // No account, or the account never finished activation (no real login
    // identity yet) -- nothing to reset. Respond the same either way.
    if (!account || !account.auth_user_id) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 24);

    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetExpires.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id);

    if (updateError) {
      console.error('Error storing reset token:', updateError);
      return res.status(200).json(genericResponse);
    }

    try {
      const emailResponse = await fetch('https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: account.email,
          name: account.name || 'gebruiker',
          resetToken
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send password reset email');
      }
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Request password reset error:', error);
    // Still return the generic response so we never confirm/deny account existence
    return res.status(200).json(genericResponse);
  }
};
