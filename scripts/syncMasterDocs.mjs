import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno manualmente
const envPath = path.resolve(__dirname, '../.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^"|"$/g, '');
    }
  });
}

const MASTER_DOCS_SOURCE = 'C:/Users/monsa/Desktop/Antigravity/DojoFlow/documentos maestros';
const MASTER_DOCS_DEST = path.join(__dirname, '../public/master-docs');
const PROFESOR_ID = '5ec7cea5-1dfa-461f-8a07-ecf1da1854a6';

const techMap = {
  '3D': 'tinkercad',
  'App Inventor': 'appinventor',
  'Arduino': 'arduino',
  'Code': 'code',
  'HTML': 'html',
  'LearninML': 'learningml',
  'Makecode Arcade': 'makecode-arcade',
  'Makecode microbit': 'makecode-microbit',
  'Python': 'python',
  'Scratch': 'scratch'
};

async function sync() {
  console.log('🚀 Sincronizando documentos maestros desde local...');

  if (!fs.existsSync(MASTER_DOCS_DEST)) {
    fs.mkdirSync(MASTER_DOCS_DEST, { recursive: true });
  }

  const planets = fs.readdirSync(MASTER_DOCS_SOURCE);

  for (const planetDir of planets) {
    const sourcePlanetPath = path.join(MASTER_DOCS_SOURCE, planetDir);
    if (!fs.statSync(sourcePlanetPath).isDirectory()) continue;

    const targetPlanetPath = path.join(MASTER_DOCS_DEST, planetDir);
    if (!fs.existsSync(targetPlanetPath)) {
      fs.mkdirSync(targetPlanetPath, { recursive: true });
    }

    const tecnologia = techMap[planetDir] || planetDir.toLowerCase().replace(/\s+/g, '-');
    const files = fs.readdirSync(sourcePlanetPath);

    for (const fileName of files) {
      const sourceFilePath = path.join(sourcePlanetPath, fileName);
      const targetFilePath = path.join(targetPlanetPath, fileName);
      
      const lowerName = fileName.toLowerCase();
      let tipoRecurso = null;
      let nombreDisplay = null;

      if (lowerName.includes('infografia')) {
        tipoRecurso = 'infografia';
        nombreDisplay = 'Infografia';
      } else if (lowerName.includes('presentacion')) {
        tipoRecurso = 'presentacion';
        nombreDisplay = 'Presentacion';
      } else if (lowerName.includes('video')) {
        tipoRecurso = 'video';
        nombreDisplay = 'Video';
      }

      if (!tipoRecurso) continue;

      // Sincronización de archivo local a la carpeta public del app
      fs.copyFileSync(sourceFilePath, targetFilePath);
      
      const publicUrl = `/master-docs/${planetDir}/${fileName}`;
      
      const body = {
        profesor_id: PROFESOR_ID,
        tecnologia: tecnologia,
        tipo_recurso: tipoRecurso,
        nombre_recurso: nombreDisplay,
        contenido: { 
          url: publicUrl, 
          isMaster: true, 
          isStorage: false, // Indica que es local /public
          meta: { isGlobal: true }
        }
      };

      try {
        const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/recursos_docentes`, {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`  ❌ Error DB (${tecnologia} - ${fileName}): ${response.status} ${errText}`);
        } else {
          console.log(`  ✅ [${tecnologia.toUpperCase()}] Sincronizado: ${nombreDisplay}`);
        }
      } catch (e) {
        console.error(`  ❌ Error de red: ${e.message}`);
      }
    }
  }
  console.log('🏁 Sincronización finalizada con éxito.');
}

sync();

