// Test endpoint for verify-email functionality
// GET /api/test-verify-email - Test Supabase connection and verify-email logic

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check environment variables
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Environment check:');
    console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase credentials',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey
        }
      });
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      return res.status(500).json({
        success: false,
        error: 'Supabase connection failed',
        details: testError.message
      });
    }

    // Test table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      return res.status(500).json({
        success: false,
        error: 'Table access failed',
        details: tableError.message
      });
    }

    // Check if required columns exist
    const sampleUser = tableInfo[0];
    const requiredColumns = ['email', 'name', 'category', 'verification_token', 'email_verified'];
    const missingColumns = requiredColumns.filter(col => !(col in sampleUser));

    return res.status(200).json({
      success: true,
      message: 'Supabase connection successful',
      details: {
        connection: 'OK',
        tableAccess: 'OK',
        sampleUser: sampleUser ? 'Found' : 'No users in table',
        missingColumns: missingColumns,
        allColumns: Object.keys(sampleUser || {})
      }
    });

  } catch (error) {
    console.error('Test verify-email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
