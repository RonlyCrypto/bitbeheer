// API route for syncing Supabase Auth users with local storage
// GET /api/sync-users - Sync all Supabase Auth users to local storage

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - NO HARDCODED CREDENTIALS!
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Sync users API - Supabase config:');
console.log('REACT_APP_SUPABASE_URL:', !!process.env.REACT_APP_SUPABASE_URL);
console.log('VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
console.log('Final supabaseUrl:', !!supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials! Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
    // Check if Supabase is available
    if (!supabase) {
      console.error('Supabase not available for sync');
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }

    // Get all users from Supabase users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('Error fetching users from Supabase:', usersError);
      return res.status(500).json({ error: 'Failed to fetch users from Supabase' });
    }

    console.log('Users fetched from Supabase for sync:', users?.length || 0);

    // Get existing users from local storage
    let localUsers = JSON.parse(process.env.STORED_USERS || '[]');
    
    // Sync Supabase users to local storage
    const syncedUsers = [];
    
    for (const user of users || []) {
      // Check if user already exists in local storage
      const existingUser = localUsers.find(localUser => localUser.email === user.email);
      
      if (!existingUser) {
        // Create new user entry
        const newUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          message: user.message || 'Account aangemeld via Supabase',
          category: user.category || 'account_aanmelden',
          date: user.date || new Date(user.created_at).toLocaleString('nl-NL'),
          timestamp: user.timestamp || user.created_at,
          emailSent: user.emailSent || false,
          lastLogin: user.lastLogin || null,
          loginCount: user.loginCount || 0,
          isAdmin: user.isAdmin || false,
          isTest: user.isTest || false,
          registrationDate: user.registrationDate || new Date(user.created_at).toISOString().split('T')[0]
        };
        
        syncedUsers.push(newUser);
        localUsers.push(newUser);
      } else {
        // Update existing user with latest info
        existingUser.lastLogin = user.lastLogin || existingUser.lastLogin;
        existingUser.loginCount = user.loginCount || existingUser.loginCount || 0;
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
