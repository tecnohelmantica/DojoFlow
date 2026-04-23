import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, FileText, Play, Presentation, CheckCircle, AlertCircle, Loader2, Award, Rocket, Link, X, Pencil } from 'lucide-react';
import { PLANETS } from '../lib/planets';

const MASTER_PROFESOR_ID = '5ec7cea5-1dfa-461f-8a07-ecf1da1854a6';

const ResourceUploader = ({ classId, currentUser, onUploadSuccess, role = 'profesor', planet: initialPlanet, onClose, editData }) => {
  const [file, setFile] = useState(null);
  const [planet, setPlanet] = useState(initialPlanet || PLANETS[0]?.id || '');
  const [type, setType] = useState(role === 'alumno' ? 'evidencia' : 'infografia');
  const [isGlobal, setIsGlobal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  // Inicializar si estamos editando
  useEffect(() => {
    if (editData) {
      setPlanet(editData.tecnologia);
      setType(editData.tipo_recurso);
      setIsGlobal(editData.contenido?.meta?.isGlobal || editData.contenido?.isMaster || false);
      
      // Si el recurso es un enlace o lanzadera, ponemos la URL en el input
      if (editData.tipo_recurso === 'enlace' || editData.tipo_recurso === 'lanzadera') {
        setExternalUrl(editData.contenido?.url || '');
      }
    }
  }, [editData]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    // Validaciones base - si estamos editando y no hay archivo nuevo, validamos contra lo que ya había
    const existingUrl = editData?.contenido?.url;
    
    if (type !== 'lanzadera' && type !== 'enlace' && !file && !existingUrl) return;
    if ((type === 'lanzadera' || type === 'enlace') && !externalUrl && !existingUrl) return;

    setIsUploading(true);
    setStatus(null);
    setErrorMessage('');

    try {
      let finalUrl = externalUrl || existingUrl;
      let resourceName = editData?.nombre_recurso || '';

      if (type !== 'lanzadera' && type !== 'enlace') {
        // 1. Subir a Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${planet}/${type}_${Date.now()}.${fileExt}`;
        const filePath = `resources/${planet}/${fileName}`;

        const { error: storageError } = await supabase.storage
          .from('dojoflow-assets')
          .upload(filePath, file);

        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage
          .from('dojoflow-assets')
          .getPublicUrl(filePath);
        
        finalUrl = publicUrl;
        resourceName = file.name;
      } else {
        resourceName = type === 'enlace' ? `Enlace: ${externalUrl.split('//').pop().split('/')[0]}` : `Lanzadera ${PLANETS.find(p => p.id === planet)?.name || planet}`;
      }

      // 3. Registrar en la base de datos
      const resourceData = {
        profesor_id: currentUser?.id,
        nombre_recurso: resourceName,
        tipo_recurso: type,
        tecnologia: planet,
        contenido: {
          url: finalUrl,
          isGlobal: isGlobal,
          isMaster: isGlobal, // Duplicar para compatibilidad con filtros
          meta: {
            planet: planet,
            filename: resourceName,
            isGlobal: isGlobal,
            uploadedAt: new Date().toISOString()
          }
        }
      };

      let dbResult;

      if (editData?.id) {
        // MODO EDICIÓN: Siempre por ID
        dbResult = await supabase
          .from('recursos_docentes')
          .update(resourceData)
          .eq('id', editData.id)
          .select()
          .single();
      } else {
        // MODO NUEVO RECURSO
        if (isGlobal) {
          // Si es maestro, intentamos limpiar duplicados antes para que parezca un upsert manual
          // Buscamos tanto por el profesor actual como por el ID maestro
          await supabase
            .from('recursos_docentes')
            .delete()
            .or(`profesor_id.eq.${currentUser?.id},profesor_id.eq.${MASTER_PROFESOR_ID}`)
            .match({ 
              tecnologia: planet, 
              tipo_recurso: type, 
              nombre_recurso: resourceName 
            });
        }
        
        dbResult = await supabase
          .from('recursos_docentes')
          .insert([resourceData])
          .select()
          .single();
      }

      if (dbResult.error) throw dbResult.error;
      const insertedData = dbResult.data;

      if (classId && !isGlobal && insertedData && !editData) {
        await supabase.from('clase_recursos').insert({ clase_id: classId, recurso_id: insertedData.id });
      }

      setStatus('success');
      setFile(null);
      setExternalUrl('');
      if (onUploadSuccess) onUploadSuccess();

    } catch (error) {
      console.error('Error uploading resource:', error);
      setStatus('error');
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '15px', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#fff', fontFamily: 'Outfit', margin: 0, fontWeight: '800' }}>
          {editData ? '✏️ EDITAR RECURSO DOJO' : '⛩️ DOJO ARTIFACT UPLOADER'}
        </h3>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '500' }}>
            Cerrar <X size={20} />
          </button>
        )}
      </div>
      
      {role === 'profesor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '5px' }}>PLANETA DESTINO</label>
            <select 
              value={planet} 
              onChange={(e) => setPlanet(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {PLANETS.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#1a1a2e' }}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '5px' }}>TIPO DE PERGAMINO</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                onClick={() => setType('infografia')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: type === 'infografia' ? '2px solid #0dcfcf' : '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                title="Infografía"
              >
                <FileText size={16} />
              </button>
              <button 
                onClick={() => setType('video')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: type === 'video' ? '2px solid #9c27b0' : '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                title="Vídeo"
              >
                <Play size={16} />
              </button>
              <button 
                onClick={() => setType('presentacion')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: type === 'presentacion' ? '2px solid #ff9800' : '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                title="Presentación"
              >
                <Presentation size={16} />
              </button>
              <button 
                onClick={() => setType('enlace')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: type === 'enlace' ? '2px solid #00bcd4' : '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                title="Enlace URL"
              >
                <Link size={16} />
              </button>
              <button 
                onClick={() => setType('reto')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: type === 'reto' ? '2px solid #ff4b4b' : '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                title="Reto Ninja"
              >
                <Award size={16} />
              </button>
              <button 
                onClick={() => setType('lanzadera')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: type === 'lanzadera' ? '2px solid #9c27b0' : '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                title="Lanzadera (Link Directo)"
              >
                <Rocket size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      { (type === 'lanzadera' || type === 'enlace') ? (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: '#aaa', marginBottom: '5px' }}>
            {type === 'enlace' ? 'DIRECCIÓN DEL ENLACE (URL)' : 'URL DE LA LANZADERA (Scratch, Tinkercad, etc.)'}
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Link size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input 
                type="url"
                placeholder="https://scratch.mit.edu/projects/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="file" 
            id="artifact-file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="artifact-file"
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              gap: '10px', 
              padding: '20px', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '12px', 
              border: '2px dashed rgba(255,255,255,0.2)',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <Upload size={24} color={file ? '#0dcfcf' : '#ccc'} />
            <span style={{ fontSize: '0.8rem', color: file ? '#fff' : '#ccc' }}>
              {file ? file.name : 'Arrastra aquí tu creación de NotebookLM'}
            </span>
            <span style={{ fontSize: '0.6rem', color: '#888' }}>(.mp4, .pdf, .png, .zip)</span>
          </label>
        </div>
      )}

      {role === 'profesor' && (
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            id="is-global" 
            checked={isGlobal} 
            onChange={(e) => setIsGlobal(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="is-global" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            ✨ Contenido Maestro (Visible para todos los alumnos)
          </label>
        </div>
      )}

      {isGlobal && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '12px 16px', 
          background: 'rgba(255, 149, 0, 0.15)', 
          border: '1.5px solid #ff9500', 
          borderRadius: '12px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(255, 149, 0, 0.1)'
        }}>
          <AlertCircle size={22} color="#ff9500" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#ffffff', lineHeight: '1.4' }}>
            <strong style={{ color: '#ff9500', display: 'block', marginBottom: '2px', fontSize: '0.85rem' }}>⚠️ ¡ATENCIÓN PROFE!</strong> 
            Marcando esta casilla este material se volverá <strong>público para todos los usuarios</strong>. Asegúrate de que no contenga datos privados.
          </p>
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={
          (type !== 'lanzadera' && type !== 'enlace' && !file && !editData) || 
          ((type === 'lanzadera' || type === 'enlace') && !externalUrl && !editData) || 
          isUploading
        }
        style={{ 
          width: '100%', 
          padding: '12px', 
          borderRadius: '10px', 
          background: isUploading ? '#666' : 'linear-gradient(135deg, #0dcfcf, #9c27b0)', 
          color: '#fff', 
          fontWeight: 'bold',
          border: 'none',
          cursor: isUploading ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {isUploading ? <Loader2 className="animate-spin" size={18} /> : (editData ? <Pencil size={18} /> : <CheckCircle size={18} />)}
        {isUploading ? (editData ? 'GUARDANDO...' : 'CANALIZANDO AL DOJO...') : (editData ? 'GUARDAR CAMBIOS' : 'PUBLICAR EN EL PLANETA')}
      </button>

      {status === 'success' && (
        <div style={{ marginTop: '10px', color: '#0dcfcf', fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <CheckCircle size={14} /> ¡Pergamino publicado con éxito!
        </div>
      )}
      {status === 'error' && (
        <div style={{ marginTop: '10px', color: '#ff4b2b', fontSize: '0.8rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <AlertCircle size={14} /> Error al subir
          </div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{errorMessage}</div>
        </div>
      )}
    </div>
  );
};

export default ResourceUploader;
