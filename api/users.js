// API route for user management
// GET /api/users - Get all users
// POST /api/users - Create new user
// PUT /api/users/:id - Update user
// DELETE /api/users/:id - Delete user

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.pathname.split('/').pop();

    // Try to get users from Supabase first
    let users = [];
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      console.log('Users API - Supabase config:');
      console.log('REACT_APP_SUPABASE_URL:', !!process.env.REACT_APP_SUPABASE_URL);
      console.log('VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
      console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
      console.log('Final supabaseUrl:', !!supabaseUrl);
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials! Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
        return res.status(500).json({
          success: false,
          error: 'Database not configured'
        });
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          users = data;
          console.log('Users fetched from Supabase:', users.length);
        } else {
          console.error('Error fetching from Supabase:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch users from database'
          });
        }
      }
    } catch (supabaseError) {
      console.error('Supabase connection error:', supabaseError);
      return res.status(500).json({
        success: false,
        error: 'Database connection failed'
      });
    }

    switch (method) {
      case 'GET':
        // Get all users
        return res.status(200).json({ 
          success: true, 
          users: users,
          count: users.length 
        });

      case 'POST':
        // Create new user
        const { email, name, message, category = 'livegang' } = req.body;
        
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user already exists for this category
        const existingUser = users.find(user => 
          user.email === email.toLowerCase() && user.category === category
        );
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists for this category' });
        }

        const newUser = {
          id: Date.now().toString(),
          email: email.toLowerCase().trim(),
          name: name?.trim() || 'Niet opgegeven',
          message: message?.trim() || 'Geen bericht',
          category: category,
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleString('nl-NL'),
          emailSent: false,
          emailSentDate: null,
          isAdmin: false,
          isTest: false,
          registrationDate: new Date().toISOString().split('T')[0]
        };

        // Try to save to Supabase first
        try {
          const { createClient } = require('@supabase/supabase-js');
          const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials for user creation!');
            return res.status(500).json({
              success: false,
              error: 'Database not configured'
            });
          } else {
            const supabase = createClient(supabaseUrl, supabaseKey);
            
            console.log('Saving user to Supabase:', newUser);
            
            const { data, error } = await supabase
              .from('users')
              .insert([newUser])
              .select();
            
            if (error) {
              console.error('Error saving to Supabase:', error);
              return res.status(500).json({
                success: false,
                error: 'Failed to save user to database'
              });
            } else {
              console.log('User saved to Supabase successfully:', data);
            }
          }
        } catch (supabaseError) {
          console.error('Supabase save error:', supabaseError);
          return res.status(500).json({
            success: false,
            error: 'Database save failed'
          });
        }

        return res.status(201).json({ 
          success: true, 
          user: newUser,
          message: 'User created successfully' 
        });

      case 'PUT':
        // Update user
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found' });
        }

        const { emailSent, emailSentDate } = req.body;
        users[userIndex] = {
          ...users[userIndex],
          emailSent: emailSent !== undefined ? emailSent : users[userIndex].emailSent,
          emailSentDate: emailSentDate || users[userIndex].emailSentDate
        };

        process.env.STORED_USERS = JSON.stringify(users);

        return res.status(200).json({ 
          success: true, 
          user: users[userIndex],
          message: 'User updated successfully' 
        });

      case 'DELETE':
        // Delete user
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const deleteIndex = users.findIndex(user => user.id === userId);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'User not found' });
        }

        users.splice(deleteIndex, 1);
        process.env.STORED_USERS = JSON.stringify(users);

        return res.status(200).json({ 
          success: true, 
          message: 'User deleted successfully' 
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Er is een fout opgetreden bij het verwerken van je aanvraag'
    });
  }
};
