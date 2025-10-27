// API endpoint for sending account deletion warnings
// POST /api/send-deletion-warnings - Send warnings to unverified accounts

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
    console.log('Sending deletion warnings...');

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ success: false, error: 'Missing Supabase credentials' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all unverified accounts
    const { data: unverifiedAccounts, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email_verified', false)
      .not('verification_expires', 'is', null);

    if (fetchError) {
      console.error('Error fetching unverified accounts:', fetchError);
      return res.status(500).json({ success: false, error: 'Failed to fetch accounts' });
    }

    console.log(`Found ${unverifiedAccounts.length} unverified accounts`);

    let warningsSent = 0;
    let errors = 0;

    for (const account of unverifiedAccounts) {
      try {
        const now = new Date();
        const expires = new Date(account.verification_expires);
        const daysRemaining = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

        // Only send warning if account expires within 2 days
        if (daysRemaining <= 2 && daysRemaining > 0) {
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
            console.log(`Warning sent to ${account.email}`);
          } else {
            errors++;
            console.error(`Failed to send warning to ${account.email}`);
          }
        } else if (daysRemaining <= 0) {
          // Account has expired, mark for deletion
          console.log(`Account ${account.email} has expired, marking for deletion`);
          
          const { error: deleteError } = await supabase
            .from('users')
            .update({ 
              email_verified: false,
              verification_token: null,
              verification_expires: null,
              // Add a flag to mark as expired
              status: 'expired'
            })
            .eq('id', account.id);

          if (deleteError) {
            console.error(`Failed to mark account ${account.email} as expired:`, deleteError);
          } else {
            console.log(`Account ${account.email} marked as expired`);
          }
        }
      } catch (accountError) {
        console.error(`Error processing account ${account.email}:`, accountError);
        errors++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Deletion warnings processed`,
      warningsSent,
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
