const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', req.query.email || 'user@example.com')
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      return res.status(200).json(profile || {
        id: '1',
        email: 'user@example.com',
        name: 'Gebruiker',
        phone: '',
        location: '',
        bio: '',
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        totalSessions: 0,
        riskProfile: 'moderate',
        experience: 'beginner'
      });
    }

    if (req.method === 'PUT') {
      // Update user profile
      const { name, phone, location, bio, riskProfile, experience } = req.body;

      const { data, error } = await supabase
        .from('users')
        .update({
          name,
          phone,
          location,
          bio,
          riskProfile,
          experience,
          updated_at: new Date().toISOString()
        })
        .eq('email', req.query.email || 'user@example.com')
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in user-profile API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
