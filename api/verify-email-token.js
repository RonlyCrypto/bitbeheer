// API endpoint for verifying email tokens
// POST /api/verify-email-token - Verify email token and activate account

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
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token en email zijn verplicht' 
      });
    }

    console.log('Verifying email token for:', email);

    // Supabase configuration
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if token is valid and not expired
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('verification_token', token)
      .single();

    if (accountError || !account) {
      console.error('Account not found or invalid token:', accountError);
      return res.status(400).json({
        success: false,
        error: 'Ongeldige verificatie link'
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(account.verification_expires);
    
    if (now > expiresAt) {
      console.log('Token expired for:', email);
      return res.status(400).json({
        success: false,
        expired: true,
        error: 'Verificatie link is verlopen'
      });
    }

    // Check if already verified
    if (account.email_verified) {
      return res.status(200).json({
        success: true,
        message: 'Account is al geverifieerd',
        alreadyVerified: true
      });
    }

    // Update account to verified
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        email_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id);

    if (updateError) {
      console.error('Error updating account:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Fout bij het activeren van je account'
      });
    }

    // Update user record as well
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim());

    if (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      // Don't fail, account is already verified
    }

    console.log('Account verified successfully:', email);

    return res.status(200).json({
      success: true,
      message: 'Account succesvol geactiveerd!',
      account: {
        id: account.id,
        email: account.email,
        name: account.name
      }
    });

  } catch (error) {
    console.error('Verify email token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Interne server fout'
    });
  }
};
