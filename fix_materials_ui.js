const fs = require('fs');
let c = fs.readFileSync('src/components/MisAulas.js', 'utf8');

// ─── 1. Replace the old card map with richer version ───
// Use exact CRLF sequences as found in the file
const OLD_MAP = 'claseRecursos.map(cr => (\r\n                    <div key={cr.id} style={{ background: \'white\', padding: \'20px\', borderRadius: \'16px\', border: \'1px solid #eee\', position: \'relative\' }}>\r\n                      <h4 style={{ fontSize: \'0.95rem\', fontWeight: \'800\', color: \'#1a1a2e\', marginBottom: \'4px\' }}>{cr.recursos_docentes.nombre_recurso || cr.recursos_docentes.contenido?.meta?.filename}</h4>\r\n                      <span style={{ fontSize: \'0.6rem\', color: \'#9c27b0\' }}>{cr.recursos_docentes.tipo_recurso.toUpperCase()}</span>\r\n                      <button onClick={() => onDesvincular(cr.id)} style={{ position: \'absolute\', top: \'15px\', right: \'15px\', background: \'none\', border: \'none\', color: \'#ff6b6b\', cursor: \'pointer\' }}>\r\n                        <Trash2 size={14}/>\r\n                      </button>\r\n                    </div>\r\n                  ))}';

const NEW_MAP = `claseRecursos.map(cr => {
                    const r = cr.recursos_docentes;
                    if (!r) return null;
                    const isGlobalR = r.contenido?.isGlobal || r.contenido?.isMaster || r.contenido?.meta?.isGlobal;
                    const planetLabel = PLANET_LABELS[r.tecnologia] || r.tecnologia || 'General';
                    const typeIcon = r.tipo_recurso === 'video'
                      ? <Tv size={15} color="#9c27b0" />
                      : (r.tipo_recurso === 'enlace' || r.tipo_recurso === 'lanzadera')
                        ? <Link size={15} color="#128989" />
                        : <FileText size={15} color="#5c6ac4" />;
                    return (
                      <div key={cr.id} style={{ background: 'white', padding: '18px', borderRadius: '16px', border: '1.5px solid #eee', position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {isGlobalR && (
                          <div style={{ position: 'absolute', top: '14px', right: '42px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.55rem', fontWeight: '900' }}>MAESTRO</div>
                        )}
                        <button onClick={() => onDesvincular(cr.id)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '2px' }} title="Quitar de esta clase">
                          <Trash2 size={14}/>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ padding: '8px', borderRadius: '10px', background: '#f8f8fc', flexShrink: 0 }}>{typeIcon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.nombre_recurso || r.contenido?.meta?.filename || 'Sin titulo'}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#9c27b0', background: '#f3e5f5', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{r.tipo_recurso}</span>
                              <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#128989', background: '#e0f5f5', padding: '1px 6px', borderRadius: '4px' }}>Planeta: {planetLabel}</span>
                            </div>
                          </div>
                        </div>
                        {r.contenido?.url && (
                          <a href={r.contenido.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#5c6ac4', fontWeight: '700', textDecoration: 'none', marginTop: 'auto' }}>
                            <ExternalLink size={12}/> Ver recurso
                          </a>
                        )}
                      </div>
                    );
                  })}`;

if (c.includes(OLD_MAP)) {
  c = c.replace(OLD_MAP, NEW_MAP);
  console.log('✅ Material cards replaced');
} else {
  console.log('⚠️  OLD_MAP not found, checking character by character...');
  const parts = OLD_MAP.split('\r\n');
  parts.forEach((p, i) => {
    if (!c.includes(p) && p.trim()) console.log('   Missing line', i, ':', JSON.stringify(p.substring(0, 60)));
  });
}

// ─── 2. Replace Vincular modal content ───
// Find it precisely with CRLF
const VINCULAR_START = '<h3 style={{ fontSize: \'1.3rem\', fontWeight: \'800\', fontFamily: \'Outfit\', marginBottom: \'20px\' }}>Vincular de Biblioteca</h3>';
const VINCULAR_END = '<button onClick={() => setShowVincular(false)} style={{ ...BTN_GHOST, width:\'100%\', marginTop:\'20px\' }}>Cerrar</button>';

const idx1 = c.indexOf(VINCULAR_START);
const idx2 = c.indexOf(VINCULAR_END, idx1) + VINCULAR_END.length;

if (idx1 > -1 && idx2 > VINCULAR_END.length) {
  const newVincularContent = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'Outfit', margin: 0 }}>Vincular desde Biblioteca</h3>
               <button onClick={() => setShowVincular(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><XCircle size={20}/></button>
             </div>
             <p style={{ fontSize: '0.8rem', color: '#8a8a9e', margin: '0 0 16px' }}>Selecciona un material de tu biblioteca para compartirlo con esta clase.</p>
             <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
               {misRecursos.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                   <HardDrive size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }}/>
                   <p>Tu biblioteca esta vacia.</p>
                 </div>
               ) : (
                 misRecursos.map(r => {
                   const alreadyLinked = claseRecursos.some(cr => cr.recurso_id === r.id || cr.recursos_docentes?.id === r.id);
                   const isGlobalR = r.contenido?.isGlobal || r.contenido?.isMaster || r.contenido?.meta?.isGlobal;
                   const planetLabel = PLANET_LABELS[r.tecnologia] || r.tecnologia || 'General';
                   return (
                     <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: alreadyLinked ? '1px solid #e0f5f5' : '1px solid #eee', background: alreadyLinked ? '#f7fffe' : 'white', marginBottom: '8px' }}>
                       <div style={{ padding: '8px', borderRadius: '8px', background: '#f5f5f5', flexShrink: 0 }}>
                         {r.tipo_recurso === 'video' ? <Tv size={16} color="#9c27b0" /> : <FileText size={16} color="#5c6ac4" />}
                       </div>
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre_recurso || r.contenido?.meta?.filename}</p>
                         <div style={{ display: 'flex', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
                           <span style={{ fontSize: '0.6rem', color: '#9c27b0', fontWeight: '700', background: '#f3e5f5', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{r.tipo_recurso}</span>
                           <span style={{ fontSize: '0.6rem', color: '#128989', fontWeight: '700', background: '#e0f5f5', padding: '1px 6px', borderRadius: '4px' }}>Planeta: {planetLabel}</span>
                           {isGlobalR && <span style={{ fontSize: '0.55rem', color: '#f90', fontWeight: '900', background: '#fff8e1', padding: '1px 6px', borderRadius: '4px' }}>MAESTRO</span>}
                         </div>
                       </div>
                       {alreadyLinked ? (
                         <span style={{ fontSize: '0.65rem', color: '#128989', fontWeight: '800', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}><CheckCircle size={12}/> Vinculado</span>
                       ) : (
                         <button
                           onClick={() => { onVincular(r.id); setShowVincular(false); }}
                           style={{ background: 'linear-gradient(135deg, #9c27b0, #5c6ac4)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px 12px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                         >Vincular</button>
                       )}
                     </div>
                   );
                 })
               )}
             </div>
             <button onClick={() => setShowVincular(false)} style={{ ...BTN_GHOST, width:'100%', marginTop:'16px' }}>Cerrar</button>`;

  c = c.substring(0, idx1) + newVincularContent + c.substring(idx2);
  console.log('✅ Vincular modal replaced');
} else {
  console.log('⚠️  Vincular modal boundaries not found. idx1:', idx1, 'idx2:', idx2);
}

// ─── 3. Fix Biblioteca global badge to show MAESTRO label and better color ───
const OLD_BADGE = `r.contenido?.meta?.isGlobal && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(255,165,0,0.3)' }}>GLOBAL</div>
                    )}`;
const NEW_BADGE = `(r.contenido?.meta?.isGlobal || r.contenido?.isGlobal || r.contenido?.isMaster) && (
                      <div style={{ position: 'absolute', top: '15px', right: '38px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(255,165,0,0.3)', letterSpacing: '0.5px' }}>MAESTRO</div>
                    )}`;

if (c.includes(OLD_BADGE)) {
  c = c.replace(OLD_BADGE, NEW_BADGE);
  console.log('✅ Library global badge improved');
} else {
  console.log('⚠️  Library global badge not found with exact text');
}

// ─── 4. Improve library card to show planet label clearly ───
const OLD_PLANET = `<span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>PLANETA {r.tecnologia.toUpperCase()}</span>`;
const NEW_PLANET = `<span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#128989', background: '#e0f5f5', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {PLANET_LABELS[r.tecnologia] || r.tecnologia || 'General'}
                        </span>`;

if (c.includes(OLD_PLANET)) {
  c = c.replace(OLD_PLANET, NEW_PLANET);
  console.log('✅ Library planet label improved');
} else {
  console.log('⚠️  Library planet label not found');
}

fs.writeFileSync('src/components/MisAulas.js', c, 'utf8');
console.log('\n✅ File saved');
