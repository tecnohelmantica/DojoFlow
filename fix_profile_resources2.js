const fs = require('fs');
let c = fs.readFileSync('src/app/profile/page.js', 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1: Master query — SOLO recursos de MASTER_PROFESOR_ID, no cualquier isGlobal
// El problema: el profesor marcó sus infografías como "Global" y aparecen como MAESTRO
// La solución: solo contar como MAESTRO los de MASTER_PROFESOR_ID
// ─────────────────────────────────────────────────────────────────────────────
const OLD_MASTER_QUERY = `.or(\`profesor_id.eq.\${MASTER_PROFESOR_ID},contenido->isGlobal.eq.true,contenido->isMaster.eq.true\`);`;
const NEW_MASTER_QUERY = `.eq('profesor_id', MASTER_PROFESOR_ID);`;

if (c.includes(OLD_MASTER_QUERY)) {
  c = c.replace(OLD_MASTER_QUERY, NEW_MASTER_QUERY);
  console.log('✅ Master query fixed — only MASTER_PROFESOR_ID resources are maestro');
} else {
  console.log('⚠️  Master query OLD not found');
  // Check variations
  console.log('Has .or(:', c.includes('.or(`profesor_id'));
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2: classOnly filter — teacher resources that ARE global/maestro-flagged
// should show in classOnly section (they're from the teacher, not the master)
// Update the isMaestro check to only use profesor_id === MASTER_PROFESOR_ID
// ─────────────────────────────────────────────────────────────────────────────
const OLD_IS_MAESTRO = `            const isMaestro = r.profesor_id === MASTER_PROFESOR_ID
              || r.contenido?.isGlobal
              || r.contenido?.isMaster
              || r.contenido?.meta?.isGlobal;`;
const NEW_IS_MAESTRO = `            // Solo es MAESTRO si lo subió el profesor maestro (MASTER_PROFESOR_ID)
            // Los recursos del profe con isGlobal=true siguen siendo "de clase", no maestros
            const isMaestro = r.profesor_id === MASTER_PROFESOR_ID;`;

if (c.includes(OLD_IS_MAESTRO)) {
  c = c.replace(OLD_IS_MAESTRO, NEW_IS_MAESTRO);
  console.log('✅ isMaestro check simplified to profesor_id only');
} else {
  console.log('⚠️  OLD_IS_MAESTRO not found');
  console.log('Has "const isMaestro":', c.includes('const isMaestro'));
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 3: Deduplicate claseIds to avoid duplicate "AULA ACTIVA" buttons
// The student has two classes with slightly different names — de-dupe by clase_id
// ─────────────────────────────────────────────────────────────────────────────
const OLD_CLASE_IDS = `const claseIds = (memberships || []).map(m => m.clase_id);\r\n        setIsAutodidact(claseIds.length === 0);`;
const NEW_CLASE_IDS = `// Deduplicar por clase_id para evitar membresías duplicadas
        const claseIds = [...new Set((memberships || []).map(m => m.clase_id))];\r\n        setIsAutodidact(claseIds.length === 0);`;

if (c.includes(OLD_CLASE_IDS)) {
  c = c.replace(OLD_CLASE_IDS, NEW_CLASE_IDS);
  console.log('✅ claseIds deduplicated with Set');
} else {
  // Try LF version
  const OLD_LF = `const claseIds = (memberships || []).map(m => m.clase_id);\n        setIsAutodidact(claseIds.length === 0);`;
  if (c.includes(OLD_LF)) {
    c = c.replace(OLD_LF, `// Deduplicar por clase_id\n        const claseIds = [...new Set((memberships || []).map(m => m.clase_id))];\n        setIsAutodidact(claseIds.length === 0);`);
    console.log('✅ claseIds deduplicated (LF version)');
  } else {
    console.log('⚠️  claseIds OLD not found');
    console.log('Has "map(m => m.clase_id)":', c.includes('map(m => m.clase_id)'));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 4: Also deduplicate classroomNames display (unique class names for buttons)
// ─────────────────────────────────────────────────────────────────────────────
const OLD_CLASSROOM_NAMES = `const classroomNames = (memberships || [])
          .map(m => m.clases?.nombre)
          .filter(Boolean);`;
const NEW_CLASSROOM_NAMES = `// Deduplicar nombres de aulas (misma clase_id → una sola entrada)
        const seenIds = new Set();
        const classroomNames = (memberships || [])
          .filter(m => { if (seenIds.has(m.clase_id)) return false; seenIds.add(m.clase_id); return true; })
          .map(m => m.clases?.nombre)
          .filter(Boolean);`;

if (c.includes(OLD_CLASSROOM_NAMES)) {
  c = c.replace(OLD_CLASSROOM_NAMES, NEW_CLASSROOM_NAMES);
  console.log('✅ classroomNames deduplicated');
} else {
  console.log('⚠️  classroomNames OLD not found');
}

fs.writeFileSync('src/app/profile/page.js', c, 'utf8');
console.log('\n✅ File saved');
