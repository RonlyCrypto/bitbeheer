// API route for syncing Supabase Auth users with local storage
// GET /api/sync-users - Sync all Supabase Auth users to local storage

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://otncto6lvt39cxz598rtoa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_uxyF_aTNtzEwEoRav6A2Ww_H4AP7I_Y';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching Supabase users:', authError);
      return res.status(500).json({ error: 'Failed to fetch users from Supabase' });
    }

    // Get existing users from local storage
    let localUsers = JSON.parse(process.env.STORED_USERS || '[]');
    
    // Sync Supabase Auth users to local storage
    const syncedUsers = [];
    
    for (const authUser of authUsers.users) {
      // Check if user already exists in local storage
      const existingUser = localUsers.find(user => user.email === authUser.email);
      
      if (!existingUser) {
        // Create new user entry
        const newUser = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          message: 'Account aangemeld via Supabase Auth',
          category: 'account_aanmelden',
          date: new Date(authUser.created_at).toLocaleString('nl-NL'),
          timestamp: authUser.created_at,
          emailSent: false,
          lastLogin: authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('nl-NL') : null,
          loginCount: 0,
          isAdmin: false,
          isTest: false,
          registrationDate: new Date(authUser.created_at).toISOString().split('T')[0]
        };
        
        syncedUsers.push(newUser);
        localUsers.push(newUser);
      } else {
        // Update existing user with latest info
        existingUser.lastLogin = authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('nl-NL') : existingUser.lastLogin;
        existingUser.loginCount = (existingUser.loginCount || 0) + 1;
        syncedUsers.push(existingUser);
      }
    }

    // Update environment variable (in production, this would be stored in database)
    process.env.STORED_USERS = JSON.stringify(localUsers);

    return res.status(200).json({
      success: true,
      message: `Synced ${syncedUsers.length} users from Supabase Auth`,
      users: syncedUsers,
      count: syncedUsers.length
    });

  } catch (error) {
    console.error('Sync users error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};
