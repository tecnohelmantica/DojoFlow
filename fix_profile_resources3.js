const fs = require('fs');
let c = fs.readFileSync('src/app/profile/page.js', 'utf8');

// ─── FIX: El MASTER_PROFESOR_ID es el mismo profesor que sube recursos propios.
// La distinción correcta es por el FLAG is_master/isGlobal en contenido, no por profesor_id.
// Cargamos TODOS los recursos del profesor_id y los separamos por el flag.

// 1. Reemplazar la query de maestros (ahora carga TODOS los de ese profesor)
const OLD_LOAD = `        // 🤝 3. Cargar recursos separados: Maestro vs. Propios de clase
        // --- Maestros (globales para todos los alumnos) ---
        const { data: globalRes } = await supabase
          .from('recursos_docentes')
          .select('*')
          .eq('profesor_id', MASTER_PROFESOR_ID);

        const masterList = globalRes || [];
        setTeacherResources(masterList);

        // --- Propios de la clase (asignados por el profesor, NO maestros) ---
        const masterIds = new Set(masterList.map(r => r.id));
        const classOnlyArr = [];

        if (claseIds.length > 0) {
          const { data: classResources } = await supabase
            .from('clase_recursos')
            .select(\`recurso_id, recursos_docentes (*)\`)
            .in('clase_id', claseIds);

          (classResources || []).forEach(cr => {
            const r = cr.recursos_docentes;
            if (!r) return;
            // Solo es MAESTRO si lo subió el profesor maestro (MASTER_PROFESOR_ID)
            // Los recursos del profe con isGlobal=true siguen siendo "de clase", no maestros
            const isMaestro = r.profesor_id === MASTER_PROFESOR_ID;
            if (!isMaestro && !masterIds.has(r.id)) {
              classOnlyArr.push(r);
            }
          });
        }
        setClassOnlyResources(classOnlyArr);

        const resourcesList = [...masterList, ...classOnlyArr];`;

const NEW_LOAD = `        // 🤝 3. Cargar recursos: separar por flag isMaster/isGlobal
        // La distinción CORRECTA es por el flag en contenido, no por profesor_id
        // (el profesor maestro puede tener recursos propios con is_master=false)

        // --- Maestros: del MASTER_PROFESOR_ID con isGlobal/isMaster = true ---
        const { data: globalRes } = await supabase
          .from('recursos_docentes')
          .select('*')
          .eq('profesor_id', MASTER_PROFESOR_ID)
          .or('contenido->isGlobal.eq.true,contenido->isMaster.eq.true');

        const masterList = (globalRes || []).filter(r =>
          r.contenido?.isGlobal === true || r.contenido?.isMaster === true ||
          r.contenido?.isGlobal === 'true' || r.contenido?.isMaster === 'true'
        );
        setTeacherResources(masterList);

        // --- Propios de la clase: en clase_recursos y que NO son maestros ---
        const masterIds = new Set(masterList.map(r => r.id));
        const classOnlyArr = [];

        if (claseIds.length > 0) {
          const { data: classResources } = await supabase
            .from('clase_recursos')
            .select(\`recurso_id, recursos_docentes (*)\`)
            .in('clase_id', claseIds);

          (classResources || []).forEach(cr => {
            const r = cr.recursos_docentes;
            if (!r) return;
            // Es maestro si tiene los flags activos
            const isGlobal = r.contenido?.isGlobal === true || r.contenido?.isGlobal === 'true';
            const isMaster = r.contenido?.isMaster === true || r.contenido?.isMaster === 'true';
            if (!isGlobal && !isMaster && !masterIds.has(r.id)) {
              classOnlyArr.push(r);
            }
          });
        }
        setClassOnlyResources(classOnlyArr);

        const resourcesList = [...masterList, ...classOnlyArr];`;

const loadStart = c.indexOf('        // 🤝 3. Cargar recursos separados: Maestro vs. Propios de clase');
const loadEnd = c.indexOf('        const resourcesList = [...masterList, ...classOnlyArr];', loadStart) + '        const resourcesList = [...masterList, ...classOnlyArr];'.length;

if (loadStart > 0 && loadEnd > loadStart) {
  c = c.substring(0, loadStart) + NEW_LOAD + c.substring(loadEnd);
  console.log('✅ Load block replaced — now uses isGlobal/isMaster flag');
} else {
  console.log('⚠️ Load block not found. Trying alternate marker...');
  const alt = c.indexOf('// La distinción CORRECTA es por el flag');
  if(alt > -1) console.log('Already patched at line', c.substring(0,alt).split('\n').length);
}

// 2. Eliminar el .slice(0, 3) en la sección MAESTRO del render
// para que siempre se muestren TODOS los recursos maestros (presentacion + infografia + video)
const OLD_SLICE = `.slice(0, 3)
                  .map(r => {
                    const type = r.tipo_recurso?.toLowerCase() || '';
                    const Icon = type.includes('video') ? Play : (type.includes('info') ? Camera : (type.includes('presen') || type.includes('slide') ? Presentation : FileText));
                    return (
                      <GlassCard
                        key={r.id}
                        onClick={() => setSelectedScroll(r)}`;

const NEW_SLICE = `.map(r => {
                    const type = r.tipo_recurso?.toLowerCase() || '';
                    const Icon = type.includes('video') ? Play : (type.includes('info') ? Camera : (type.includes('presen') || type.includes('slide') ? Presentation : FileText));
                    return (
                      <GlassCard
                        key={r.id}
                        onClick={() => setSelectedScroll(r)}`;

if (c.includes(OLD_SLICE)) {
  c = c.replace(OLD_SLICE, NEW_SLICE);
  console.log('✅ .slice(0,3) removed — all master resources now visible');
} else {
  console.log('⚠️ OLD_SLICE not found');
  console.log('Has .slice(0, 3):', c.includes('.slice(0, 3)'));
}

fs.writeFileSync('src/app/profile/page.js', c, 'utf8');
console.log('\n✅ File saved');
