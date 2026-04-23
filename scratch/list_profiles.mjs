
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://chnrloeyckzfgjvazhpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnJsb2V5Y2t6ZmdqdmF6aHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzQ5NzYsImV4cCI6MjA5MTk1MDk3Nn0.yXqbZmf3BHlylMvPRDLbgsc1vg7Q9K1erXmkmD_nWjk'
);

async function listProfiles() {
    const { data, error } = await supabase.from('profiles').select('id, alias, real_name');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

listProfiles();
