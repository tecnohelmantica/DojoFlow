
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

async function test() {
    loadEnv();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    console.log("URL:", supabaseUrl);
    console.log("Using ANON key");

    const supabase = createClient(supabaseUrl, anonKey);

    const { data, error } = await supabase
        .from('recursos_docentes')
        .select('*')
        .limit(10);

    if (error) {
        console.error("Error message:", error.message);
    } else {
        console.log("Success! Data fetched:", data.length);
        data.forEach(r => {
            console.log(`- ${r.titulo} (Tech: ${r.tecnologia}, Professor: ${r.profesor_id})`);
        });
    }
}

test();
