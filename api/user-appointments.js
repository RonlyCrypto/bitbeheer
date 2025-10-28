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
      // Get user appointments
      const { data: appointments, error } = await supabase
        .from('user_appointments')
        .select('*')
        .eq('user_email', req.query.email || 'user@example.com')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({ error: 'Failed to fetch appointments' });
      }

      return res.status(200).json(appointments || []);
    }

    if (req.method === 'POST') {
      // Create new appointment
      const { title, date, time, duration, type, notes } = req.body;

      const { data, error } = await supabase
        .from('user_appointments')
        .insert({
          title,
          date,
          time,
          duration,
          type,
          notes,
          status: 'scheduled',
          user_email: req.query.email || 'user@example.com',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        return res.status(500).json({ error: 'Failed to create appointment' });
      }

      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in user-appointments API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
