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
      // Get user goals
      const { data: goals, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_email', req.query.email || 'user@example.com')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        return res.status(500).json({ error: 'Failed to fetch goals' });
      }

      return res.status(200).json(goals || []);
    }

    if (req.method === 'POST') {
      // Create new goal
      const { title, description, targetAmount, targetDate, category } = req.body;

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          title,
          description,
          targetAmount,
          currentAmount: 0,
          targetDate,
          category,
          status: 'active',
          user_email: req.query.email || 'user@example.com',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        return res.status(500).json({ error: 'Failed to create goal' });
      }

      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in user-goals API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
