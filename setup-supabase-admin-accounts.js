const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://otncto6lvt39cxz598rtoa.supabase.co';
const supabaseKey = 'sb_secret_uxyF_aTNtzEwEoRav6A2Ww_H4AP7I_Y';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabaseAdminAccounts() {
  try {
    console.log('Setting up Supabase admin accounts...');

    // Create admin account
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@bitbeheer.nl',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    });

    if (adminError) {
      console.error('Error creating admin account:', adminError);
    } else {
      console.log('Admin account created:', adminData);
    }

    // Create test account
    const { data: testData, error: testError } = await supabase.auth.admin.createUser({
      email: 'test@bitbeheer.nl',
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'test'
      }
    });

    if (testError) {
      console.error('Error creating test account:', testError);
    } else {
      console.log('Test account created:', testData);
    }

    console.log('\n✅ Supabase admin accounts setup complete!');
    console.log('📝 Login credentials:');
    console.log('   Admin: admin@bitbeheer.nl / admin123');
    console.log('   Test:  test@bitbeheer.nl / test123');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupSupabaseAdminAccounts();
