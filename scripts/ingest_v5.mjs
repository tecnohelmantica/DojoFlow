import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno
const supabase = createClient(
  'https://chnrloeyckzfgjvazhpj.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobnJsb2V5Y2t6ZmdqdmF6aHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3NDk3NiwiZXhwIjoyMDkxOTUwOTc2fQ.yXqbZmf3BHlylMvPRDLbgsc1vg7Q9K1erXmkmD_nWjk'
);

const KEY = 'AIzaSyDdphVwa8ZXyGx8hft0qI-Au9yihw12Wbs';

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
