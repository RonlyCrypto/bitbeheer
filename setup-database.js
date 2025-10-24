const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://clqbnkvnydlxtimiazqf.supabase.co';
const supabaseKey = 'sb_secret_uxyF_aTNtzEwEoRav6A2Ww_H4AP7I_Y';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('💡 Make sure to run the SQL schema first in Supabase dashboard');
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Check if tables exist
    console.log('🔍 Checking existing tables...');
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table not found. Please run the SQL schema first.');
      return;
    }
    
    // Check accounts table
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .limit(1);
    
    if (accountsError) {
      console.log('❌ Accounts table not found. Please run the SQL schema first.');
      return;
    }
    
    console.log('✅ All tables found!');
    
    // Check if admin and test accounts exist
    const { data: adminAccount } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_admin', true)
      .single();
    
    const { data: testAccount } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_test', true)
      .single();
    
    if (!adminAccount || !testAccount) {
      console.log('⚠️  Admin or test accounts not found. Creating them...');
      
      // Create admin account
      const { error: adminError } = await supabase
        .from('accounts')
        .insert({
          email: 'admin@bitbeheer.nl',
          name: 'Admin Account',
          password_hash: '$2a$10$example_hash_admin',
          category: 'admin',
          is_admin: true,
          is_test: false
        });
      
      if (adminError) {
        console.log('❌ Error creating admin account:', adminError.message);
      } else {
        console.log('✅ Admin account created');
      }
      
      // Create test account
      const { error: testError } = await supabase
        .from('accounts')
        .insert({
          email: 'test@bitbeheer.nl',
          name: 'Test Account',
          password_hash: '$2a$10$example_hash_test',
          category: 'test',
          is_admin: false,
          is_test: true
        });
      
      if (testError) {
        console.log('❌ Error creating test account:', testError.message);
      } else {
        console.log('✅ Test account created');
      }
    } else {
      console.log('✅ Admin and test accounts already exist');
    }
    
    // Check page visibility settings
    const { data: pageVisibility } = await supabase
      .from('page_visibility')
      .select('*');
    
    if (!pageVisibility || pageVisibility.length === 0) {
      console.log('⚠️  Page visibility settings not found. Creating them...');
      
      const { error: pageError } = await supabase
        .from('page_visibility')
        .insert([
          { page_name: 'home', visible_to_public: false, visible_to_admin: true, visible_to_test: true },
          { page_name: 'bitcoin-history', visible_to_public: false, visible_to_admin: true, visible_to_test: true },
          { page_name: 'market-cap-comparer', visible_to_public: false, visible_to_admin: true, visible_to_test: true },
          { page_name: 'portfolio', visible_to_public: false, visible_to_admin: true, visible_to_test: true },
          { page_name: 'aanmelden', visible_to_public: true, visible_to_admin: true, visible_to_test: true }
        ]);
      
      if (pageError) {
        console.log('❌ Error creating page visibility settings:', pageError.message);
      } else {
        console.log('✅ Page visibility settings created');
      }
    } else {
      console.log('✅ Page visibility settings already exist');
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Start your development server: npm start');
    console.log('   2. Go to: http://localhost:3000/database-test');
    console.log('   3. Test the database connection');
    
  } catch (error) {
    console.log('❌ Database setup failed:', error.message);
    console.log('💡 Make sure to run the SQL schema first in Supabase dashboard');
  }
}

// Run the setup
setupDatabase();
