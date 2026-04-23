
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://chnrloeyckzfgjvazhpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnJsb2V5Y2t6ZmdqdmF6aHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzQ5NzYsImV4cCI6MjA5MTk1MDk3Nn0.yXqbZmf3BHlylMvPRDLbgsc1vg7Q9K1erXmkmD_nWjk'
);

async function checkLinks() {
    const { data, error } = await supabase.from('clase_recursos').select('*').eq('recurso_id', 'fe58e519-35a0-4e2c-a0c1-bd5675eb159c');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

checkLinks();
