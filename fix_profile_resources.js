const fs = require('fs');
let c = fs.readFileSync('src/app/profile/page.js', 'utf8');

// ─── Replace the load block ───
const LOAD_START_MARKER = ' // 🤝 3. Merge and De-duplicate';
const LOAD_END_MARKER = '        setTeacherResources(resourcesList);';

const loadStart = c.indexOf(LOAD_START_MARKER);
const loadEnd = c.indexOf(LOAD_END_MARKER, loadStart) + LOAD_END_MARKER.length;

console.log('loadStart:', loadStart, 'loadEnd:', loadEnd);

if (loadStart > 0 && loadEnd > loadStart) {
  const newLoad = `        // 🤝 3. Cargar recursos separados: Maestro vs. Propios de clase
        // --- Maestros (globales para todos los alumnos) ---
        const { data: globalRes } = await supabase
          .from('recursos_docentes')
          .select('*')
          .or(\`profesor_id.eq.\${MASTER_PROFESOR_ID},contenido->isGlobal.eq.true,contenido->isMaster.eq.true\`);

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
            const isMaestro = r.profesor_id === MASTER_PROFESOR_ID
              || r.contenido?.isGlobal
              || r.contenido?.isMaster
              || r.contenido?.meta?.isGlobal;
            if (!isMaestro && !masterIds.has(r.id)) {
              classOnlyArr.push(r);
            }
          });
        }
        setClassOnlyResources(classOnlyArr);

        const resourcesList = [...masterList, ...classOnlyArr];`;

  c = c.substring(0, loadStart) + newLoad + c.substring(loadEnd);
  console.log('✅ Load block replaced');
} else {
  console.log('⚠️  Could not find load block boundaries');
}

// ─── Replace the render block ───
const RENDER_START = '          {/* FILA 3: RECURSOS DE APOYO */}';
const RENDER_END_MARKER = '                .map(r => {';

const rStart = c.indexOf(RENDER_START);
// Find the closing </div> after FILA 3 - it ends with closing the outer div
// Let's find the end by looking for the next section after the map closes
const FILA4_MARKER = '          {selectedScroll &&';
const rEnd = c.indexOf(FILA4_MARKER, rStart);

console.log('rStart:', rStart, 'rEnd:', rEnd);

if (rStart > 0 && rEnd > rStart) {
  const newRender = `          {/* FILA 3A: RECURSOS MAESTROS */}
          {teacherResources.filter(r => r.tecnologia?.toLowerCase() === activePlanet.toLowerCase() || r.tecnologia?.toLowerCase() === 'todas').length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#8a8a9e', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', marginBottom: '15px' }}>
                <BookOpen size={16} /> RECURSOS DE APOYO
                <span style={{ fontSize: '0.55rem', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontWeight: '900', letterSpacing: '0.5px' }}>MAESTRO</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
                {teacherResources
                  .filter(r => r.tecnologia?.toLowerCase() === activePlanet.toLowerCase() || r.tecnologia?.toLowerCase() === 'todas')
                  .sort(sortRecursos)
                  .slice(0, 3)
                  .map(r => {
                    const type = r.tipo_recurso?.toLowerCase() || '';
                    const Icon = type.includes('video') ? Play : (type.includes('info') ? Camera : (type.includes('presen') || type.includes('slide') ? Presentation : FileText));
                    return (
                      <GlassCard
                        key={r.id}
                        onClick={() => setSelectedScroll(r)}
                        style={{
                          padding: '25px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.3s',
                          border: selectedScroll?.id === r.id ? \`2px solid \${planet?.barColor || '#6366f1'}\` : '1px solid rgba(0,0,0,0.05)',
                          background: selectedScroll?.id === r.id ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.7)'
                        }}
                      >
                        <div style={{ color: planet?.barColor || '#6366f1', marginBottom: '10px' }}><Icon size={24} /></div>
                        <p style={{ fontSize: '0.8rem', fontWeight: '900', margin: '0 0 5px' }}>{r.nombre_recurso}</p>
                        <p style={{ fontSize: '0.6rem', color: planet?.barColor || '#6366f1', fontWeight: '700' }}>{type.toUpperCase()}</p>
                      </GlassCard>
                    );
                  })}
              </div>
            </div>
          )}

          {/* FILA 3B: RECURSOS DEL PROFESOR (materiales propios de la clase) */}
          {classOnlyResources.filter(r => r.tecnologia?.toLowerCase() === activePlanet.toLowerCase() || r.tecnologia?.toLowerCase() === 'todas').length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#8a8a9e', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', marginBottom: '8px' }}>
                <FileText size={16} /> MATERIALES DE TU CLASE
                <span style={{ fontSize: '0.55rem', background: 'rgba(92,106,196,0.15)', color: '#5c6ac4', padding: '2px 8px', borderRadius: '8px', fontWeight: '900', letterSpacing: '0.5px' }}>TU PROFESOR</span>
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#aaa', margin: '0 0 14px' }}>Recursos adicionales compartidos por tu profesor para esta clase.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                {classOnlyResources
                  .filter(r => r.tecnologia?.toLowerCase() === activePlanet.toLowerCase() || r.tecnologia?.toLowerCase() === 'todas')
                  .map(r => {
                    const type = r.tipo_recurso?.toLowerCase() || '';
                    const Icon = type.includes('video') ? Play : (type.includes('enlace') || type.includes('lanzadera') ? ExternalLink : FileText);
                    return (
                      <GlassCard
                        key={r.id}
                        onClick={() => setSelectedScroll(r)}
                        style={{
                          padding: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          transition: 'all 0.3s',
                          border: selectedScroll?.id === r.id ? '2px solid #5c6ac4' : '1px solid rgba(92,106,196,0.12)',
                          background: selectedScroll?.id === r.id ? 'rgba(92,106,196,0.08)' : 'rgba(255,255,255,0.85)'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(92,106,196,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={18} color="#5c6ac4" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre_recurso || r.contenido?.meta?.filename || 'Recurso'}</p>
                          <p style={{ fontSize: '0.6rem', color: '#5c6ac4', fontWeight: '700', margin: 0 }}>{type.toUpperCase()}</p>
                        </div>
                      </GlassCard>
                    );
                  })}
              </div>
            </div>
          )}

          `;

  c = c.substring(0, rStart) + newRender + c.substring(rEnd);
  console.log('✅ Render block replaced with two separate sections');
} else {
  console.log('⚠️  Render block not found. rStart:', rStart, 'rEnd:', rEnd);
}

fs.writeFileSync('src/app/profile/page.js', c, 'utf8');
console.log('\n✅ File saved');
