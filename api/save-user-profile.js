// API endpoint for saving user profile data
// POST /api/save-user-profile - Save additional user profile data

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials for user profile');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Update user with additional profile data
    const { error: updateError } = await supabase
      .from('users')
      .update({
        phone: userData.phone || '',
        investment_plans: userData.investment_plans || '',
        experience: userData.experience || '',
        motivation: userData.motivation || '',
        expectations: userData.expectations || '',
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save user profile'
      });
    }

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
