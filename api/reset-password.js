// API endpoint to complete a password reset
// POST /api/reset-password - Validate the reset token and set a new password

const { createClient } = require('@supabase/supabase-js');

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

  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Reset-token is verplicht' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'Kies een wachtwoord van minstens 8 tekens' });
    }

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ success: false, error: 'Serverconfiguratiefout' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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
};
