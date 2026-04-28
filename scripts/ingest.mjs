import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno desde .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        process.env[key] = value;
      }
    });
  }
}
loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

import { GoogleGenerativeAI } from '@google/generative-ai';

async function getEmbedding(text) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY no encontrada en .env.local');
  
  console.log(`\n      [INGEST DEBUG] Key length: ${key.length}, Starts with: ${key.substring(0, 5)}`);

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  
  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    throw new Error(`Error en SDK Gemini: ${error.message}`);
  }
}

async function ingest(planetId, filePath) {
  console.log(`\n🚀 SENSEI INGESTOR: Preparando conocimiento para [${planetId.toUpperCase()}]`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: El archivo "${filePath}" no se encuentra.`);
    return;
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');
  
  const chunks = rawContent
    .split(/\n\s*\n/)
    .map(c => c.trim())
    .filter(c => c.length > 20);

  console.log(`📦 Analizando contenido... ${chunks.length} fragmentos encontrados.`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      process.stdout.write(`   [${i + 1}/${chunks.length}] Generando neuronas digitales... `);
      
      const embedding = await getEmbedding(chunk);

      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          planet_id: planetId.toLowerCase(),
          content: chunk,
          title: `Fragmento ${i + 1} - ${planetId}`,
          embedding: embedding
        });

      if (error) throw error;
      console.log('✅ Guardado');

      // Pausa de 1s para evitar rate limit
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      if (err.message.includes('429')) {
        console.log('      ⏳ Rate limit, esperando 5 segundos...');
        await new Promise(r => setTimeout(r, 5000));
        i--; 
      }
    }
  }

  console.log(`\n✨ ¡ÉXITO! El planeta ${planetId} ahora es más inteligente.\n`);
}

const [,, planet, file] = process.argv;

if (!planet || !file) {
  console.log('Uso: node scripts/ingest.mjs <id_planeta> <archivo.txt>');
  process.exit(1);
}

ingest(planet, file);
