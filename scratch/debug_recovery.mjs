import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRecovery() {
  const alias = 'monsapri@gmail.com';
  console.log('Testing with alias:', alias);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('email_real, role')
    .or(`alias.eq."${alias}",email_real.eq."${alias}"`)
    .maybeSingle();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
  }
}

testRecovery();
