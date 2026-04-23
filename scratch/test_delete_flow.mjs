
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://chnrloeyckzfgjvazhpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnJsb2V5Y2t6ZmdqdmF6aHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzQ5NzYsImV4cCI6MjA5MTk1MDk3Nn0.yXqbZmf3BHlylMvPRDLbgsc1vg7Q9K1erXmkmD_nWjk'
);

async function testDeleteFlow() {
    console.log("Creating dummy resource...");
    const { data: res, error: createError } = await supabase.from('recursos_docentes').insert({
        profesor_id: '7cfc5bef-f2e5-40af-b802-edc52189ef1f', // MASTER_PROFESOR_ID
        nombre_recurso: 'Dummy Resource for Test',
        tipo_recurso: 'Documento',
        tecnologia: 'test',
        contenido: { test: true }
    }).select().single();

    if (createError) {
        console.error("Create error:", createError.message);
        return;
    }

    console.log(`Resource created with ID: ${res.id}. Now attempting to delete...`);
    
    const { error: deleteError } = await supabase.from('recursos_docentes').delete().eq('id', res.id);
    
    if (deleteError) {
        console.error("Delete error:", deleteError.message);
    } else {
        console.log("Success! Resource deleted.");
    }
    
    // Check if it still exists
    const { data: check } = await supabase.from('recursos_docentes').select('id').eq('id', res.id).maybeSingle();
    if (check) {
        console.log("WAIT! Resource still exists in DB!");
    } else {
        console.log("Resource confirmed GONE from DB.");
    }
}

testDeleteFlow();
