// Daily job (Vercel cron, see vercel.json) that enforces the 5-day account
// activation window promised in the verification email:
// GET  /api/send-deletion-warnings - warn accounts expiring within 2 days,
//                                     deactivate accounts already past their
//                                     verification_expires

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Processing account activation deadlines...');

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ success: false, error: 'Missing Supabase credentials' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // accounts is the canonical table (auth_user_id, deactivated_at, etc. all
    // live here) -- users only holds secondary signup-form data.
    const { data: unverifiedAccounts, error: fetchError } = await supabase
      .from('accounts')
      .select('id, email, name, auth_user_id, verification_expires')
      .eq('email_verified', false)
      .eq('is_admin', false)
      .eq('is_test', false)
      .is('deactivated_at', null)
      .not('verification_expires', 'is', null);

    if (fetchError) {
      console.error('Error fetching unverified accounts:', fetchError);
      return res.status(500).json({ success: false, error: 'Failed to fetch accounts' });
    }

    console.log(`Found ${unverifiedAccounts.length} unverified accounts with a pending deadline`);

    let warningsSent = 0;
    let deactivated = 0;
    let errors = 0;

    for (const account of unverifiedAccounts) {
      try {
        const now = new Date();
        const expires = new Date(account.verification_expires);
        const daysRemaining = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
          // Past the 5-day deadline: this is the automatic deletion the
          // verification email promises. Soft-delete like a manual admin
          // deactivation -- revoke any auth identity (an unverified account
          // normally never got one, but check for safety) and mark the row
          // deactivated so it keeps its signup history under "Gedeactiveerd".
          console.log(`Account ${account.email} passed its 5-day deadline, deactivating`);

          if (account.auth_user_id) {
            const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(account.auth_user_id);
            if (deleteAuthError) {
              console.error(`Error deleting auth user for ${account.email}:`, deleteAuthError);
            }
          }

          const { error: deactivateError } = await supabase
            .from('accounts')
            .update({
              deactivated_at: new Date().toISOString(),
              auth_user_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', account.id);

          if (deactivateError) {
            console.error(`Failed to deactivate account ${account.email}:`, deactivateError);
            errors++;
          } else {
            deactivated++;
            console.log(`Account ${account.email} deactivated`);
          }
        } else if (daysRemaining <= 2) {
          // Expires within 2 days: send a reminder.
          console.log(`Sending warning to ${account.email} - ${daysRemaining} days remaining`);

          const response = await fetch('https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-account-deletion-warning', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              email: account.email,
              name: account.name,
              daysRemaining: daysRemaining
            })
          });

          if (response.ok) {
            warningsSent++;
          } else {
            errors++;
            console.error(`Failed to send warning to ${account.email}`);
          }
        }
      } catch (accountError) {
        console.error(`Error processing account ${account.email}:`, accountError);
        errors++;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Account activation deadlines processed',
      warningsSent,
      deactivated,
      errors,
      totalAccounts: unverifiedAccounts.length
    });

  } catch (error) {
    console.error('Send deletion warnings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
