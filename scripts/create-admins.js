const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (matched) {
      const key = matched[1];
      let value = matched[2] || '';
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local');
  process.exit(1);
}

// Create Supabase client with Service Role key to bypass RLS and create auth users
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const admins = [
  {
    email: 'jpmiles@htu.edu',
    fullName: 'Jennifer P. Miles',
    // Strong unique password
    password: 'Miles_Admin_HTU2026!#x'
  },
  {
    email: 'wglenn@htu.edu',
    fullName: 'W. Darryl Glenn',
    // Strong unique password
    password: 'Glenn_Admin_HTU2026!#y'
  },
  {
    email: 'yobalade@htu.edu',
    fullName: 'Yemisi Obalade',
    // Strong unique password
    password: 'Obalade_Admin_HTU2026!#z'
  }
];

async function createAdminUsers() {
  console.log('Starting admin accounts provisioning...\n');

  for (const admin of admins) {
    console.log(`Processing: ${admin.fullName} (${admin.email})`);

    // 1. Create or sync Supabase Auth User
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email: admin.email,
      email_confirm: true,
      password: admin.password,
    });

    let userId = null;

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        console.log(`- Auth account already exists. Retrieving user ID...`);
        // Find existing auth user ID
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error(`- Error listing users:`, listError.message);
          continue;
        }
        const existing = users.find(u => u.email.toLowerCase() === admin.email.toLowerCase());
        if (existing) {
          userId = existing.id;
          // Update password to the new strong one
          const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: admin.password
          });
          if (updateError) {
            console.error(`- Error updating existing password:`, updateError.message);
          } else {
            console.log(`- Updated password for existing auth account.`);
          }
        }
      } else {
        console.error(`- Auth creation error:`, authError.message);
        continue;
      }
    } else if (userData && userData.user) {
      userId = userData.user.id;
      console.log(`- Created Supabase Auth account successfully. (ID: ${userId})`);
    }

    // 2. Insert or update in public.students table
    if (userId) {
      const { error: dbError } = await supabase
        .from('students')
        .upsert({
          id: userId,
          email: admin.email,
          full_name: admin.fullName,
          role: 'admin',
          is_active: true
        }, {
          onConflict: 'email'
        });

      if (dbError) {
        console.error(`- Database upsert error:`, dbError.message);
      } else {
        console.log(`- Successfully set role to 'admin' in database.`);
      }
    }

    console.log(`- Strong password set: ${admin.password}`);
    console.log('--------------------------------------------------');
  }

  console.log('\nAdmin provisioning complete.');
}

createAdminUsers();
