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

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KEY = process.env.GEMINI_API_KEY;

async function getEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] }
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.embedding.values;
}

async function ingest(planetId, filePath) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const chunks = rawContent.split(/\n\s*\n/).map(c => c.trim()).filter(c => c.length > 20);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      console.log(`[${i+1}/${chunks.length}] Generando...`);
      const embedding = await getEmbedding(chunk);
      const { error } = await supabase.from('knowledge_base').insert({
        planet_id: planetId.toLowerCase(),
        content: chunk,
        title: `Chunk ${i+1}`,
        embedding: embedding
      });
      if (error) throw error;
      console.log('✅');
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error('❌', err.message);
    }
  }
}

ingest('code', 'conocimiento_demo.txt');
