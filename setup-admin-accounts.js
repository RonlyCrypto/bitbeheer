const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminAccounts() {
  try {
    console.log('Setting up admin accounts...');

    // Hash passwords
    const adminPassword = 'admin123';
    const testPassword = 'test123';
    
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const testHash = await bcrypt.hash(testPassword, 10);

    console.log('Hashed passwords created');

    // Insert admin account
    const { data: adminAccount, error: adminError } = await supabase
      .from('admin_accounts')
      .upsert([
        {
          username: 'admin',
          password_hash: adminHash,
          account_type: 'admin',
          is_active: true
        }
      ], { onConflict: 'username' })
      .select();

    if (adminError) {
      console.error('Error creating admin account:', adminError);
    } else {
      console.log('Admin account created/updated:', adminAccount);
    }

    // Insert test account
    const { data: testAccount, error: testError } = await supabase
      .from('admin_accounts')
      .upsert([
        {
          username: 'test',
          password_hash: testHash,
          account_type: 'test',
          is_active: true
        }
      ], { onConflict: 'username' })
      .select();

    if (testError) {
      console.error('Error creating test account:', testError);
    } else {
      console.log('Test account created/updated:', testAccount);
    }

    console.log('\n✅ Admin accounts setup complete!');
    console.log('📝 Login credentials:');
    console.log('   Admin: username="admin", password="admin123"');
    console.log('   Test:  username="test", password="test123"');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupAdminAccounts();
