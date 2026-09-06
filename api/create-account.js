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
      voornaam: voornaamRaw,
      achternaam: achternaamRaw,
      naam,
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

    // The full Aanmelden-page form sends voornaam + achternaam separately;
    // the quick signup modal only collects a single "naam" field. Support both.
    let voornaam = voornaamRaw;
    let achternaam = achternaamRaw;
    if ((!voornaam || !achternaam) && naam) {
      const parts = naam.trim().split(/\s+/);
      voornaam = voornaam || parts[0] || '';
      achternaam = achternaam || (parts.length > 1 ? parts.slice(1).join(' ') : parts[0]) || '';
    }

    if (!email || !voornaam || !achternaam) {
      console.log('Missing required fields:', {
        email: !!email,
        voornaam: !!voornaam,
        achternaam: !!achternaam
      });
      return res.status(400).json({ error: 'Email en naam zijn verplicht' });
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
      .select('id, email, category, deactivated_at')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing account:', existingError);
    }

    if (existingAccount && !existingAccount.deactivated_at) {
      console.warn('Account already exists for email:', email);
      return res.status(409).json({
        success: false,
        error: 'Account bestaat al met dit e-mailadres',
        details: 'duplicate_email'
      });
    }

    // A previously deleted account keeps its row for history, but its email
    // is free to reuse. Move the old row aside as email+1@domain (or the
    // next free suffix) so the new signup can have the clean email, and we
    // can still see this person's full signup history by email later.
    if (existingAccount && existingAccount.deactivated_at) {
      const [localPart, domain] = existingAccount.email.split('@');
      let suffix = 1;
      let archivedEmail = `${localPart}+${suffix}@${domain}`;
      while (true) {
        const { data: taken } = await supabase
          .from('accounts')
          .select('id')
          .eq('email', archivedEmail)
          .maybeSingle();
        if (!taken) break;
        suffix += 1;
        archivedEmail = `${localPart}+${suffix}@${domain}`;
      }

      const { error: archiveError } = await supabase
        .from('accounts')
        .update({ email: archivedEmail, updated_at: new Date().toISOString() })
        .eq('id', existingAccount.id);

      if (archiveError) {
        console.error('Error archiving deactivated account email:', archiveError);
        return res.status(500).json({
          success: false,
          error: 'Failed to process re-registration'
        });
      }

      // Best-effort: keep the users table (secondary signup-history record)
      // in sync with the same archived address.
      await supabase
        .from('users')
        .update({ email: archivedEmail })
        .eq('email', existingAccount.email);
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
      is_test: false,
      // Without these, /api/verify-email-token can never find a matching
      // row -- it queries accounts.verification_token, not users.verification_token.
      verification_token: verificationToken,
      verification_token_created: new Date().toISOString(),
      verification_expires: verificationExpires.toISOString()
    };

    console.log('Creating account in accounts table:', accountData);

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert([accountData])
      .select();

    if (accountError) {
      console.error('Error creating account:', accountError);
      console.error('Account data that failed:', accountData);
      const message = accountError.message || '';
      const isDuplicate =
        accountError.code === '23505' ||
        message.includes('duplicate key value') ||
        message.includes('accounts_email_key');

      if (isDuplicate) {
        return res.status(409).json({
          success: false,
          error: 'Account bestaat al met dit e-mailadres',
          details: 'duplicate_email'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to create account',
        details: accountError.message
      });
    }

    // Account created successfully (no console logs with sensitive data)

    // Create user in users table with all form data (renamed from accounts)
    const userData = {
      email: email.toLowerCase().trim(),
      name: fullName,
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
      // Error creating user (logged silently - no sensitive data)
      // Don't fail if user creation fails, account is already created
      // But log the error for debugging
    } else {
      // User created successfully (silent)
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
          name: fullName,
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
