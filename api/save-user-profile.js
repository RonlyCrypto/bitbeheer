// API endpoint for saving user profile data
// POST /api/save-user-profile - Save additional user profile data

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Save user profile - Supabase config:');
console.log('REACT_APP_SUPABASE_URL:', !!process.env.REACT_APP_SUPABASE_URL);
console.log('VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
console.log('Final supabaseUrl:', !!supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials for user profile');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
    const { email, userData } = req.body;

    if (!email || !userData) {
      return res.status(400).json({ error: 'Email and user data are required' });
    }

    console.log('Saving user profile for:', email);

    // Check if Supabase is available
    if (!supabase) {
      console.error('Supabase not available for user profile save');
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }

    // Test Supabase connection first
    try {
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('Supabase connection test failed:', testError);
        return res.status(500).json({
          success: false,
          error: 'Database connection failed'
        });
      }
    } catch (connectionError) {
      console.error('Supabase connection error:', connectionError);
      return res.status(500).json({
        success: false,
        error: 'Database connection error'
      });
    }

    // Update user with additional profile data
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Only update fields that exist in the database
    if (userData.phone) updateData.phone = userData.phone;
    if (userData.investment_plans) updateData.investment_plans = userData.investment_plans;
    if (userData.experience) updateData.experience = userData.experience;
    if (userData.motivation) updateData.motivation = userData.motivation;
    if (userData.expectations) updateData.expectations = userData.expectations;

    console.log('Updating user with data:', updateData);

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save user profile',
        details: updateError.message
      });
    }

    console.log('User profile saved successfully');
    return res.status(200).json({
      success: true,
      message: 'User profile saved successfully'
    });

  } catch (error) {
    console.error('Save user profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
