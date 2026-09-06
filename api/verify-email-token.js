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
    const { token, email, password } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        error: 'Token en email zijn verplicht'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Kies een wachtwoord van minstens 8 tekens'
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

    // Create the real login account. Until now nothing created a Supabase
    // Auth identity for self-registered users -- they had no way to ever
    // log in, since sign-in only checks Supabase Auth, not accounts.password_hash.
    let authUserId = account.auth_user_id || null;
    if (!authUserId) {
      const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: { name: account.name }
      });

      if (authCreateError) {
        // If a Supabase Auth user with this email already exists (e.g. a
        // retried activation), look it up instead of failing the whole flow.
        if (authCreateError.message?.toLowerCase().includes('already') ) {
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existing = existingUsers?.users?.find(u => u.email?.toLowerCase() === account.email.toLowerCase());
          authUserId = existing?.id || null;
        } else {
          console.error('Error creating auth user:', authCreateError);
          return res.status(500).json({
            success: false,
            error: 'Kon geen inlog-account aanmaken. Probeer het opnieuw of neem contact op.'
          });
        }
      } else {
        authUserId = authData.user.id;
      }
    }

    // Update account to verified and set status to actief
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        email_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        actief: true, // Set status to actief when email is verified
        auth_user_id: authUserId
      })
      .eq('id', account.id);

    if (updateError) {
      console.error('Error updating account:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Fout bij het activeren van je account'
      });
    }

    // Update user record as well and set status to actief
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        actief: true // Set status to actief when email is verified
      })
      .eq('email', email.toLowerCase().trim());

    if (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      // Don't fail, account is already verified
    }

    console.log('Account verified successfully:', email);

    // Send account activated confirmation email
    try {
      const emailResponse = await fetch('https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-account-activated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: account.email,
          name: account.name
        })
      });

      if (emailResponse.ok) {
        console.log('Account activated confirmation email sent successfully');
      } else {
        console.error('Failed to send account activated confirmation email');
      }
    } catch (emailError) {
      console.error('Error sending account activated confirmation email:', emailError);
      // Don't fail the verification if email fails
    }

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
