// API endpoint for email verification
// GET /api/verify-email?token=xxx - Verify email address
// POST /api/verify-email - Send verification email

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials for email verification');
  console.error('REACT_APP_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check Supabase credentials first
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Supabase credentials not configured',
        details: 'Missing REACT_APP_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    const { method } = req;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (method === 'GET' && token) {
      // Verify email with token
      return await verifyEmailToken(req, res, token);
    } else if (method === 'POST') {
      // Send verification email
      return await sendVerificationEmail(req, res);
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

async function verifyEmailToken(req, res, token) {
  try {
    // Find user by verification token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .eq('email_verified', false)
      .single();

    if (error || !user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    // Check if token is expired (5 days)
    const tokenCreated = new Date(user.verification_token_created);
    const now = new Date();
    const daysDiff = (now - tokenCreated) / (1000 * 60 * 60 * 24);

    if (daysDiff > 5) {
      // Delete unverified user after 5 days
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      return res.status(400).json({
        success: false,
        error: 'Verification token expired. Please register again.',
        expired: true
      });
    }

    // Verify the user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_created: null,
        verified_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to verify email'
      });
    }

    // Send welcome email after verification
    try {
      const welcomeResponse = await fetch(`${req.headers.origin}/api/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.name
        }),
      });

      if (welcomeResponse.ok) {
        console.log('Welcome email sent after verification');
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to BitBeheer.',
      user: {
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
}

async function sendVerificationEmail(req, res) {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Sending verification email to:', email);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenCreated = new Date().toISOString();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      if (existingUser.email_verified) {
        return res.status(400).json({
          success: false,
          error: 'Email already verified'
        });
      }

      // Update existing user with new token
      const { error: updateError } = await supabase
        .from('users')
        .update({
          verification_token: verificationToken,
          verification_token_created: tokenCreated,
          name: name || existingUser.name,
          category: 'nieuwe_gebruiker'
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Error updating verification token:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update verification token'
        });
      }
    } else {
      // Create new user
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          category: 'nieuwe_gebruiker',
          verification_token: verificationToken,
          verification_token_created: tokenCreated,
          email_verified: false,
          message: 'Account aangemeld via aanmeldformulier'
        }]);

      if (insertError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create user'
        });
      }
    }

    // Send verification email
    const verificationUrl = `${req.headers.origin}/verify-email?token=${verificationToken}`;
    
    try {
      const emailResponse = await fetch(`${req.headers.origin}/api/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: email,
          userName: name || email.split('@')[0],
          verificationUrl: verificationUrl
        }),
      });

      if (emailResponse.ok) {
        console.log('Verification email sent successfully to:', email);
      } else {
        console.error('Failed to send verification email');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      verificationUrl: verificationUrl // For testing
    });

  } catch (error) {
    console.error('Send verification email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send verification email'
    });
  }
}
