// API endpoint for creating complete accounts from Aanmelden form
// POST /api/create-account - Create full account with all form data

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    const { 
      email, 
      voornaam,
      achternaam,
      telefoon, 
      locatie,
      spaargeld, 
      ervaring, 
      motivatie, 
      verwachtingen,
      bedrijf,
      investeringsdoel,
      voorkeurContact,
      nieuwsbrief,
      marketingToestemming
    } = req.body;

    console.log('Create account request body:', req.body);

    if (!email || !voornaam || !achternaam || !telefoon || !locatie) {
      console.log('Missing required fields:', { 
        email: !!email, 
        voornaam: !!voornaam, 
        achternaam: !!achternaam,
        telefoon: !!telefoon,
        locatie: !!locatie
      });
      return res.status(400).json({ error: 'Email, voornaam, achternaam, telefoon en locatie zijn verplicht' });
    }

    console.log('Creating account for:', email);

    // Supabase configuration
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials:', { 
        supabaseUrl: !!supabaseUrl, 
        supabaseKey: !!supabaseKey 
      });
      // Return success with fallback message
      return res.status(200).json({
        success: true,
        message: 'Account registratie ontvangen - we nemen contact op',
        fallback: true
      });
    }

    console.log('Supabase credentials found, proceeding with account creation');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setDate(verificationExpires.getDate() + 5); // 5 days

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create full name from first and last name
    const fullName = `${voornaam.trim()} ${achternaam.trim()}`.trim();

    // Check for existing account with same email to avoid unique constraint violation
    const { data: existingAccount, error: existingError } = await supabase
      .from('accounts')
      .select('id, email, category, verified, active')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing account:', existingError);
    }

    if (existingAccount) {
      console.warn('Account already exists for email:', email);
      return res.status(409).json({
        success: false,
        error: 'Account bestaat al met dit e-mailadres',
        details: 'duplicate_email'
      });
    }

    // Create account in accounts table (this is where user accounts are stored)
    const accountData = {
      email: email.toLowerCase().trim(),
      name: fullName,
      first_name: voornaam.trim(),
      last_name: achternaam.trim(),
      phone: telefoon || null,
      location: locatie || null,
      company: bedrijf || null,
      experience_level: ervaring || null,
      investment_goal: investeringsdoel || null,
      preferred_contact: voorkeurContact || null,
      newsletter_subscription: nieuwsbrief === 'true' || nieuwsbrief === true,
      marketing_consent: marketingToestemming === 'true' || marketingToestemming === true,
      password_hash: passwordHash,
      category: 'nieuwe_gebruiker',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null,
      login_count: 0,
      is_admin: false,
      is_test: false
    };

    console.log('Creating account in accounts table:', accountData);

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert([accountData])
      .select();

    if (accountError) {
      console.error('Error creating account:', accountError);
      console.error('Account data that failed:', accountData);
      return res.status(500).json({
        success: false,
        error: 'Failed to create account',
        details: accountError.message
      });
    }

    console.log('Account created successfully:', account[0]);

    // Create user in users table with all form data (renamed from accounts)
    const userData = {
      email: email.toLowerCase().trim(),
      name: naam.trim(),
      message: 'Aanmelding voor persoonlijke begeleiding',
      category: 'nieuwe_gebruiker',
      phone: telefoon?.trim() || null,
      investment_plans: spaargeld?.trim() || null,
      experience: ervaring?.trim() || null,
      motivation: motivatie?.trim() || null,
      expectations: verwachtingen?.trim() || null,
      email_verified: false,
      verification_token: verificationToken,
      verification_token_created: new Date().toISOString(),
      verification_expires: verificationExpires.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Add required fields for users table
      date: new Date().toLocaleString('nl-NL'),
      timestamp: new Date().toISOString(),
      last_login: null,
      login_count: 0,
      is_admin: false,
      is_test: false,
      registration_date: new Date().toISOString()
    };

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (userError) {
      console.error('Error creating user:', userError);
      console.error('User data that failed:', userData);
      // Don't fail if user creation fails, account is already created
      // But log the error for debugging
    } else {
      console.log('User created successfully:', user[0]);
    }

    // Send verification email
    try {
      const emailResponse = await fetch('https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: naam.trim(),
          verificationToken: verificationToken
        })
      });

      if (emailResponse.ok) {
        console.log('Verification email sent successfully');
      } else {
        console.error('Failed to send verification email');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    return res.status(201).json({
      success: true,
      message: 'Account succesvol aangemaakt! Controleer je e-mail om je account te activeren.',
      account: account[0],
      user: user?.[0],
      verificationToken: verificationToken // For admin reference
    });

  } catch (error) {
    console.error('Create account error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    });
  }
};
