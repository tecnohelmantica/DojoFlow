import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DATA_DIR = './src/data';

async function ingest() {
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(f => f.endsWith('_knowledge.json'));

    console.log(`🚀 Iniciando ingesta de ${jsonFiles.length} archivos de conocimiento...`);

    for (const file of jsonFiles) {
      const filePath = path.join(DATA_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      const planetId = data.planet;
      
      console.log(`📦 Procesando: ${planetId}...`);

      const { error } = await supabase
        .from('planet_knowledge')
        .upsert({
          planet_id: planetId,
          knowledge_data: data.knowledge_base,
          updated_at: new Date().toISOString()
        }, { onConflict: 'planet_id' });

      if (error) {
        console.error(`❌ Error en ${planetId}:`, error.message);
      } else {
        console.log(`✅ ${planetId} subido correctamente.`);
      }
    }

    console.log('🏁 Proceso finalizado con éxito.');
  } catch (err) {
    console.error('💥 Error fatal durante la ingesta:', err);
  }
}

ingest();
