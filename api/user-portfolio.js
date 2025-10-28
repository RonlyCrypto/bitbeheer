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
      // Get user portfolio
      const { data: portfolio, error } = await supabase
        .from('user_portfolio')
        .select('*')
        .eq('user_email', req.query.email || 'user@example.com')
        .single();

      if (error) {
        console.error('Error fetching portfolio:', error);
        return res.status(500).json({ error: 'Failed to fetch portfolio' });
      }

      return res.status(200).json(portfolio || {
        id: '1',
        name: 'Mijn Portfolio',
        value: 0,
        change: 0,
        changePercent: 0,
        assets: []
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in user-portfolio API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
