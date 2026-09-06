// API endpoint for the "wachtwoord vergeten" flow. Combined into one file
// (branching on req.body.action) to stay within Vercel's Hobby-plan limit
// of 12 serverless functions per deployment.
//
// POST /api/password-reset  { action: 'request', email }
//   -> generates a reset token and emails it (generic response either way)
// POST /api/password-reset  { action: 'reset', token, password }
//   -> validates the token and sets the new password on the real
//      Supabase Auth user

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

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return res.status(500).json({ success: false, error: 'Serverconfiguratiefout' });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { action } = req.body || {};

  if (action === 'request') {
    return handleRequest(req, res, supabase);
  }
  if (action === 'reset') {
    return handleReset(req, res, supabase);
  }
  return res.status(400).json({ success: false, error: 'Onbekende actie' });
};

async function handleRequest(req, res, supabase) {
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
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
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
}

async function handleReset(req, res, supabase) {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Reset-token is verplicht' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'Kies een wachtwoord van minstens 8 tekens' });
    }

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, email, auth_user_id, reset_token_expires')
      .eq('reset_token', token)
      .maybeSingle();

    if (accountError || !account) {
      return res.status(400).json({ success: false, error: 'Ongeldige of al gebruikte reset-link' });
    }

    if (!account.reset_token_expires || new Date() > new Date(account.reset_token_expires)) {
      return res.status(400).json({ success: false, expired: true, error: 'De reset-link is verlopen' });
    }

    if (!account.auth_user_id) {
      return res.status(400).json({ success: false, error: 'Dit account heeft nog geen actieve login. Rond eerst de accountactivatie af.' });
    }

    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(account.auth_user_id, { password });
    if (updateAuthError) {
      console.error('Error updating password:', updateAuthError);
      return res.status(500).json({ success: false, error: 'Kon het wachtwoord niet bijwerken' });
    }

    // Single-use: clear the token once it's been used.
    await supabase
      .from('accounts')
      .update({ reset_token: null, reset_token_expires: null, updated_at: new Date().toISOString() })
      .eq('id', account.id);

    return res.status(200).json({ success: true, message: 'Je wachtwoord is bijgewerkt. Je kunt nu inloggen.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Interne server fout' });
  }
}
