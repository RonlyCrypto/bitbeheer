// Test API endpoint to check Supabase connection
// GET /api/test-supabase - Test Supabase connection and credentials

const { createClient } = require('@supabase/supabase-js');

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
    // Supabase configuration - NO HARDCODED CREDENTIALS!
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase credentials! Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
        details: 'Environment variables not configured'
      });
    }
    
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Role Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Checking Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('Health check failed:', healthError);
      return res.status(500).json({
        success: false,
        error: 'Supabase connection failed',
        details: healthError.message,
        url: supabaseUrl,
        keyPrefix: supabaseKey.substring(0, 10) + '...'
      });
    }

    // Test 2: Try to get users from users table
    console.log('Test 2: Fetching users from users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('Users fetch failed:', usersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        details: usersError.message
      });
    }

    // Test 3: Try to insert a test user
    console.log('Test 3: Testing user insertion...');
    const testUser = {
      id: 'test-' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      message: 'Test message',
      category: 'test',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('nl-NL'),
      emailSent: false,
      isAdmin: false,
      isTest: true,
      registrationDate: new Date().toISOString().split('T')[0]
    };

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select();

    if (insertError) {
      console.error('User insertion failed:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to insert test user',
        details: insertError.message
      });
    }

    // Clean up test user
    await supabase
      .from('users')
      .delete()
      .eq('id', testUser.id);

    return res.status(200).json({
      success: true,
      message: 'Supabase connection test successful',
      details: {
        url: supabaseUrl,
        keyPrefix: supabaseKey.substring(0, 10) + '...',
        usersCount: users?.length || 0,
        testInsertion: 'Success',
        cleanup: 'Success'
      }
    });

  } catch (error) {
    console.error('Supabase test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
