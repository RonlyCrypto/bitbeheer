// API endpoint for the "wachtwoord vergeten" flow. Combined into one file
// (branching on req.body.action) to stay within Vercel's Hobby-plan limit
// of 12 serverless functions per deployment.
//
// POST /api/password-reset  { action: 'request', email }
//   -> generates a reset token and emails it; unknown or not-yet-activated
//      addresses get an explicit message
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

// Oudere accounts hebben geen auth_user_id in de accounts-tabel, maar kunnen wel
// inloggen. Zoek ze dan op in het echte inlogsysteem en onthoud het id.
async function resolveAuthUserId(supabase, account) {
  if (account.auth_user_id) return account.auth_user_id;
  const target = String(account.email).toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const hit = data.users.find((u) => (u.email || '').toLowerCase() === target);
    if (hit) {
      await supabase.from('accounts').update({ auth_user_id: hit.id }).eq('id', account.id);
      return hit.id;
    }
    if (data.users.length < 200) return null;
  }
  return null;
}

async function handleRequest(req, res, supabase) {
  const genericResponse = {
    success: true,
    message: 'Er is een e-mail onderweg met instructies om je wachtwoord te resetten. Check ook je spam.'
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

    // Bewust duidelijk voor de gebruiker (productkeuze): onbekend adres of een
    // account dat nog niet geactiveerd is krijgt een eigen melding.
    if (!account) {
      return res.status(200).json({
        success: false,
        notFound: true,
        error: 'Dit e-mailadres is niet bekend bij ons. Controleer het adres, of maak een account aan.'
      });
    }
    if (!(await resolveAuthUserId(supabase, account))) {
      return res.status(200).json({
        success: false,
        notActivated: true,
        error: 'Dit account is nog niet geactiveerd. Bevestig eerst je e-mailadres via de mail die je van ons kreeg.'
      });
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

    const authUserId = await resolveAuthUserId(supabase, account);
    if (!authUserId) {
      return res.status(400).json({ success: false, error: 'Dit account heeft nog geen actieve login. Rond eerst de accountactivatie af.' });
    }

    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(authUserId, { password });
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
