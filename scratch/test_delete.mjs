
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnv() {
    const env = fs.readFileSync('.env.local', 'utf8');
    env.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) {
            process.env[key.trim()] = value.join('=').trim();
        }
    });
}

async function testDelete() {
    loadEnv();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabase = createClient(supabaseUrl, anonKey);

    console.log("Fetching resources...");
    const { data, error: fetchError } = await supabase.from('recursos_docentes').select('*').limit(5);
    
    if (fetchError) {
        console.error("Fetch error:", fetchError.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No resources found (RLS likely blocking).");
        return;
    }

    const res = data[0];
    console.log(`Found resource: ID=${res.id}, Tech=${res.tecnologia}`);

    console.log(`Attempting to delete resource ${res.id}...`);
    const { error } = await supabase.from('recursos_docentes').delete().eq('id', res.id);

    if (error) {
        console.error("Delete error:", error.message);
        console.error("Details:", error);
    } else {
        console.log("Success! Resource deleted.");
    }
}

testDelete();
