import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function upsertRetos(data) {
  if (data.length === 0) return;
  const { error } = await supabase.from('retos').upsert(data, { onConflict: 'planet_id,level,category,order_index' });
  if (error) console.error("❌ Error subiendo retos:", error.message);
  else console.log(`✅ ${data.length} retos subidos.`);
}

function mapChallenge(planetId, level, challenges, category = 'default') {
  return challenges.map(ch => ({
    planet_id: planetId,
    level: level,
    category: category,
    order_index: ch.numero,
    title: ch.titulo || ch.title || "Sin título", // Soporta ambos campos
    description: ch.descripcion || ch.description || '',
    url_guide: ch.url || null,
    url_sandbox: ch.id ? `https://scratch.mit.edu/projects/${ch.id}/editor` : (ch.tinkercad_url || ch.scratch_url || ch.externalUrl || null),
    metadata: { ...ch }
  }));
}

async function main() {
  console.log("🚀 Iniciando Ingesta Final (v5)...");

  // SCRATCH (Robotix)
  const { ROBOTIX_CHALLENGES } = await import('../src/lib/robotix.js');
  await upsertRetos(mapChallenge('scratch', 'beginner', ROBOTIX_CHALLENGES, 'robotix'));

  // SCRATCH (Raspberry)
  const { RASPBERRY_SCRATCH_L1, RASPBERRY_SCRATCH_L2, RASPBERRY_SCRATCH_CHALLENGES } = await import('../src/lib/raspberry.js');
  await upsertRetos(mapChallenge('scratch', 'beginner', RASPBERRY_SCRATCH_L1, 'raspberry-l1'));
  await upsertRetos(mapChallenge('scratch', 'intermediate', RASPBERRY_SCRATCH_L2, 'raspberry-l2'));
  await upsertRetos(mapChallenge('scratch', 'advanced', RASPBERRY_SCRATCH_CHALLENGES, 'raspberry-l3'));

  // ARCADE
  const { ARCADE_CHALLENGES } = await import('../src/lib/arcade.js');
  await upsertRetos(mapChallenge('makecode-arcade', 'beginner', ARCADE_CHALLENGES));

  // MACHINE LEARNING
  const { ML_LEARNINGML, ML_FOR_KIDS } = await import('../src/lib/machinelearning.js');
  await upsertRetos(mapChallenge('machinelearning', 'beginner', ML_LEARNINGML, 'learningml'));
  await upsertRetos(mapChallenge('machinelearning', 'beginner', ML_FOR_KIDS, 'mlforkids'));


  // APP INVENTOR
  const { APP_INVENTOR_BASIC, APP_INVENTOR_INTERMEDIATE, APP_INVENTOR_SOCIAL } = await import('../src/lib/appinventor.js');
  await upsertRetos(mapChallenge('appinventor', 'beginner', APP_INVENTOR_BASIC, 'basic'));
  await upsertRetos(mapChallenge('appinventor', 'intermediate', APP_INVENTOR_INTERMEDIATE, 'intermediate'));
  await upsertRetos(mapChallenge('appinventor', 'advanced', APP_INVENTOR_SOCIAL, 'social'));

  console.log("\n🏁 ¡Ingesta completa! Todos los planetas están en la nube.");
}

main().catch(console.error);
