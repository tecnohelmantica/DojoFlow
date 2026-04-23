const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function test() {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Buckets:', data.map(b => b.name));
    }
}

test();
