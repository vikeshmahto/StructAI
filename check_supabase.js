const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
  console.log(`🔍 Verifying Database for project: ${supabaseUrl}`);
  
  try {
    // 1. Check if 'users' table exists and can be queried
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log("✅ Project Connection: SUCCESS");
        console.log("❌ Table 'users': MISSING. You need to run the setup SQL.");
      } else {
        console.log(`❌ Connection Error: ${error.message} (Code: ${error.code})`);
      }
    } else {
      console.log("✅ Project Connection: SUCCESS");
      console.log("✅ Table 'users': EXISTS and is ready for use!");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
  }
}

checkSupabase();
