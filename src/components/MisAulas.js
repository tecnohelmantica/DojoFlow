"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GlassCard from './GlassCard';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthProvider';
import GlowButton from './GlowButton';
import {
  Plus, Copy, Check, Users, ChevronRight, ChevronLeft,
  Trash2, UserPlus, RefreshCw, AlertCircle, Clock,
  CheckCircle, XCircle, Search, FileText, Zap, BookOpen, Link, Tv, FileBarChart, Sparkles, Clipboard, User, HardDrive, Pencil, Download, DownloadCloud, ExternalLink, Paperclip
} from 'lucide-react';
import ResourceUploader from './ResourceUploader';


// ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Validado':    { color: '#128989', bg: '#e0f5f5', icon: <CheckCircle size={13}/>, label: 'Validado' },
  'En revisión': { color: '#d4881e', bg: '#fff8e1', icon: <Clock size={13}/>,       label: 'En revisión' },
  'Corregir':    { color: '#ff4b2b', bg: '#ffeaea', icon: <AlertCircle size={13}/>,  label: 'Corregir' },
  'No iniciado': { color: '#aaa',    bg: '#f5f5f5', icon: <XCircle size={13}/>,     label: 'No iniciado' },
};

const PLANET_LABELS = {
  scratch: 'Scratch', arduino: 'Arduino', 'tinkercad': 'Tinkercad',
  'makecode-microbit': 'micro:bit', 'makecode-arcade': 'Arcade',
  code: 'Code.org', learningml: 'LearningML', python: 'Python',
  html: 'HTML/JS', appinventor: 'App Inventor',
};

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  : '';

// ── Estilos reutilizables ──
const BTN_PRIMARY = {
  background: 'linear-gradient(135deg, var(--planet-theme, #9c27b0), var(--accent-purple, #5c6ac4))',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '11px 22px',
  fontFamily: 'Outfit',
  fontWeight: '700',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};
const BTN_CYAN = {
  ...BTN_PRIMARY,
  background: 'linear-gradient(135deg, #0dcfcf, #128989)',
};
const BTN_GHOST = {
  background: 'rgba(0,0,0,0.05)',
  color: '#444',
  border: '1.5px solid rgba(0,0,0,0.1)',
  borderRadius: '10px',
  padding: '11px 22px',
  fontFamily: 'Outfit',
  fontWeight: '600',
  fontSize: '0.9rem',
  cursor: 'pointer',
};

// ── Tarjeta de Clase ──
function ClaseCard({ clase, onSelect, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/unirse/${clase.codigo_invitacion}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onSelect(clase)}
      style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(92,106,196,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #9c27b0, #0dcfcf)' }} />

      {clase.revisiones_pendientes > 0 && (
        <div style={{ 
          position: 'absolute', top: '12px', right: '12px', 
          background: 'linear-gradient(135deg, #ff4b2b, #ff416c)', 
          color: 'white', fontSize: '0.65rem', fontWeight: '800', 
          padding: '4px 10px', borderRadius: '20px', 
          boxShadow: '0 4px 12px rgba(255,75,43,0.3)', 
          display: 'flex', alignItems: 'center', gap: '4px', zIndex: 5,
          fontFamily: 'Outfit', textTransform: 'uppercase'
        }}>
           <Zap size={11} fill="white" /> {clase.revisiones_pendientes} Pendiente{clase.revisiones_pendientes !== 1 ? 's' : ''}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>{clase.nombre_clase}</h3>
          <span style={{ fontSize: '0.75rem', color: '#8a8a9e' }}>Creada {fmtDate(clase.fecha_creacion)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--planet-bg, #ede7f6)', padding: '5px 11px', borderRadius: '20px' }}>
          <Users size={13} color="var(--planet-theme, #9c27b0)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--planet-theme, #9c27b0)' }}>{clase.num_alumnos || 0}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f4f4f8', borderRadius: '8px', padding: '9px 12px', marginBottom: '14px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#5c6ac4', fontWeight: '700', letterSpacing: '1px', flex: 1 }}>
          🔑 {clase.codigo_invitacion}
        </span>
        <button
          onClick={copyLink}
          style={{ background: copied ? '#e0f5f5' : 'white', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: copied ? '#128989' : '#333', fontWeight: '700', transition: 'all 0.2s' }}
        >
          {copied ? <><Check size={11}/> Copiado</> : <><Copy size={11}/> Copiar link</>}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(clase); }}
          style={{ background: 'none', border: 'none', color: 'var(--planet-theme, #9c27b0)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Outfit' }}
        >
          Ver Dashboard <ChevronRight size={15}/>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(clase); }}
          style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s', padding: '4px' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
        >
          <Trash2 size={14}/>
        </button>
      </div>
    </div>
  );
}

// ── Fila Alumno ──
function AlumnoRow({ alumno, onValidar, onValidarNinja, onEliminar }) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState({});

  const handleFeedbackChange = (key, val) => {
    setFeedbackMap(prev => ({ ...prev, [key]: val }));
  };

  const m = alumno.metricas;
  const pct = m.total_retos > 0 ? Math.round((m.validados / m.total_retos) * 100) : 0;

  return (
    <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.8)', marginBottom: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden', background: '#f5f5f5' }}>
            <img 
              src={alumno.avatar_url || "/alumno.png"} 
              alt={alumno.alias} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          {m.en_revision > 0 && (
            <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '10px', height: '10px', background: '#ff4b2b', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 0 10px rgba(255,75,43,0.5)', animation: 'pulse 1.5s infinite' }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '0.88rem', color: '#1a1a2e', margin: 0 }}>🥷 {alumno.alias || alumno.real_name || 'Alumno'}</p>
          <span style={{ fontSize: '0.7rem', color: '#8a8a9e' }}>Unido {fmtDate(alumno.fecha_union)}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[{ n: m.validados, color: '#128989', bg: '#e0f5f5', icon: '✅' }, { n: m.en_revision, color: '#d4881e', bg: '#fff8e1', icon: '⏳' }, { n: m.insignias, color: '#9c27b0', bg: '#f3e5f5', icon: '🏆' }].map((s, i) => (
            <span key={i} style={{ padding: '3px 8px', borderRadius: '20px', background: s.bg, color: s.color, fontSize: '0.78rem', fontWeight: '700' }}>{s.icon} {s.n}</span>
          ))}
        </div>
        <div style={{ width: '70px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.65rem', color: '#8a8a9e', textAlign: 'right', marginBottom: '3px' }}>{pct}%</div>
          <div style={{ height: '5px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #9c27b0, #0dcfcf)', transition: 'width 0.5s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onEliminar(alumno.id); }} 
            style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
            title="Eliminar de la clase"
          >
            <Trash2 size={16}/>
          </button>
          <ChevronRight size={15} color="#aaa" style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}/>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px', background: 'rgba(248,248,252,0.9)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '7px', marginBottom: '12px' }}>
            {alumno.retos_detalle.map(r => {
              const s = STATUS_CONFIG[r.status] || STATUS_CONFIG['No iniciado'];
              const fKey = `planet_${r.planet_id}`;
              return (
                <div key={r.planet_id} style={{ display: 'flex', flexDirection: 'column', gap: '7px', padding: '7px 9px', borderRadius: '12px', background: s.bg, border: '1px solid rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ color: s.color }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1a1a2e' }}>{PLANET_LABELS[r.planet_id] || r.planet_id}</span>
                      <br/><span style={{ fontSize: '0.62rem', color: s.color, fontWeight: '600' }}>{s.label}</span>
                    </div>
                    {r.status === 'En revisión' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => onValidar(alumno.id, r.planet_id, 'Validado', feedbackMap[fKey])} 
                          style={{ background: '#128989', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '0.62rem', cursor: 'pointer', fontWeight: '800' }}
                          title="Aprobar"
                        >✓</button>
                        <button 
                          onClick={() => onValidar(alumno.id, r.planet_id, 'Corregir', feedbackMap[fKey])} 
                          style={{ background: '#ff4b2b', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '0.62rem', cursor: 'pointer', fontWeight: '800' }}
                          title="Pedir corrección"
                        >✗</button>
                      </div>
                    )}
                  </div>
                  {r.status === 'En revisión' && (
                    <input 
                      type="text" 
                      placeholder="Feedback..." 
                      value={feedbackMap[fKey] || ''} 
                      onChange={(e) => handleFeedbackChange(fKey, e.target.value)}
                      style={{ width: '100%', fontSize: '0.65rem', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {alumno.insignias_detalle.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8a8a9e', marginBottom: '6px' }}>🏆 Insignias</p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {alumno.insignias_detalle.map((ins, i) => (
                  <span key={i} style={{ padding: '2px 9px', borderRadius: '20px', background: '#f3e5f5', color: '#9c27b0', fontSize: '0.7rem', fontWeight: '700' }}>🏆 {ins.badge_name}</span>
                ))}
              </div>
            </div>
          )}

          {alumno.retos_ninja && alumno.retos_ninja.filter(rn => rn.evidence_url || rn.evidence_file_url).length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8a8a9e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} /> Evidencias de Retos Ninja
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {alumno.retos_ninja.filter(rn => rn.evidence_url || rn.evidence_file_url).map((rn, idx) => (
                  <div key={idx} style={{ background: '#fff', padding: '12px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#1a1a2e' }}>
                          {PLANET_LABELS[rn.planet_id] || rn.planet_id}: <span style={{ color: '#666', fontWeight: '500' }}>{(rn.challenge_id || 'RETO').split('_').pop().toUpperCase()}</span>

                        </p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                          {rn.evidence_url && (
                            <a href={rn.evidence_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.65rem', color: '#0dcfcf', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                              <ExternalLink size={10} /> Ver Proyecto
                            </a>
                          )}
                          {rn.evidence_file_url && (
                            <a href={rn.evidence_file_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.65rem', color: '#9c27b0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                              <Paperclip size={10} /> Descargar Archivo
                            </a>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: STATUS_CONFIG[rn.status]?.bg || '#f5f5f5', color: STATUS_CONFIG[rn.status]?.color || '#aaa' }}>
                          {rn.status.toUpperCase()}
                        </span>
                        {rn.status === 'En revisión' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => onValidarNinja(alumno.id, rn.challenge_id, 'Validado', feedbackMap[rn.challenge_id])} 
                              style={{ background: 'linear-gradient(135deg, #128989, #0dcfcf)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '0.65rem', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 10px rgba(13,207,207,0.2)' }}
                            >
                              Aprobar
                            </button>
                            <button 
                              onClick={() => onValidarNinja(alumno.id, rn.challenge_id, 'Corregir', feedbackMap[rn.challenge_id])} 
                              style={{ background: 'linear-gradient(135deg, #ff4b2b, #ff416c)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '0.65rem', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 10px rgba(255,75,43,0.2)' }}
                            >
                              Corregir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {rn.status === 'En revisión' && (
                      <textarea 
                        placeholder="Escribe aquí tu feedback (positivo o áreas de mejora)..." 
                        value={feedbackMap[rn.challenge_id] || ''}
                        onChange={(e) => handleFeedbackChange(rn.challenge_id, e.target.value)}
                        style={{ width: '100%', minHeight: '60px', padding: '10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.75rem', fontFamily: 'Outfit', resize: 'vertical' }}
                      />
                    )}
                    {rn.teacher_feedback && rn.status !== 'En revisión' && (
                      <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', borderLeft: `3px solid ${STATUS_CONFIG[rn.status]?.color}` }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '700', color: '#666', marginBottom: '2px' }}>Feedback del Profesor:</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#333', fontStyle: 'italic' }}>"{rn.teacher_feedback}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Detalle de Clase ──
const ClaseDetail = ({ clase, onBack, onUpdateAlumnos, onCloseAnadir, onRefresh, currentUser, misRecursos = [], onVincular, onDesvincular, onValidarReto, onValidarRetoNinja, onEliminarAlumno, loadingDash, dashData, claseRecursos, onMsg, setShowUploadModal }) => {

  const [activeTab, setActiveTab] = useState('alumnos');
  const [showVincular, setShowVincular] = useState(false);
  const [launcherPlatform, setLauncherPlatform] = useState('');
  const [launcherUrl, setLauncherUrl] = useState('');
  const [activeLaunchers, setActiveLaunchers] = useState({});
  const [savingLauncher, setSavingLauncher] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  const downloadCredentials = (alumnos, claseNombre) => {
    const header = `CREDENCIALES DE ACCESO - DOJOFLOW\nCLASE: ${claseNombre}\nFECHA: ${new Date().toLocaleDateString()}\n${'='.repeat(40)}\n\n`;
    const content = alumnos.map((a, i) => `${i+1}. USUARIO: ${a.alias}\n   CONTRASEÑA: ${a.password}\n${'-'.repeat(30)}`).join('\n\n');
    const blob = new Blob([header + content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Alumnos_${claseNombre.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/aulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generar_alumnos_bulk',
          profesorId: currentUser.id,
          claseId: clase.id,
          cantidad: parseInt(bulkQuantity)
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedResult(data.created || []);
        if (onRefresh) onRefresh(); 
        if (onMsg) onMsg('ok', `¡${(data.created || []).length} alumnos creados!`);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      if (onMsg) onMsg('err', err.message || 'Error al generar alumnos');
    } finally {
      setIsGenerating(false);
    }
  };

  const platforms = [
    { id: 'code', name: 'Code.org' },
    { id: 'scratch', name: 'Scratch' },
    { id: 'makecode-microbit', name: 'micro:bit (MakeCode)' },
    { id: 'makecode-arcade', name: 'MakeCode Arcade' },
    { id: 'tinkercad', name: 'Tinkercad' },
    { id: 'learningml', name: 'LearningML' },
    { id: 'appinventor', name: 'App Inventor' },
    { id: 'ia', name: 'LearningML / IA' },
    { id: 'python', name: 'Python' },
    { id: 'html', name: 'Web (HTML/CSS)' }
  ];

  useEffect(() => {
    const launchers = {};
    claseRecursos.forEach(r => {
      if (r.recursos_docentes?.tipo_recurso === 'enlace') {
        launchers[r.recursos_docentes.tecnologia] = r.recursos_docentes;
      }
    });
    setActiveLaunchers(launchers);
  }, [claseRecursos]);

  const handleSaveLauncher = async () => {
    if (!launcherPlatform || !launcherUrl) return;
    setSavingLauncher(true);
    try {
      const { data: newRes, error: resErr } = await supabase
        .from('recursos_docentes')
        .insert({
          profesor_id: currentUser.id,
          nombre_recurso: `Acceso a Clase: ${platforms.find(p => p.id === launcherPlatform)?.name}`,
          tipo_recurso: 'enlace',
          tecnologia: launcherPlatform,
          contenido: { markdown: launcherUrl, meta: { isLauncher: true } }
        })
        .select().single();
      
      if (resErr) throw resErr;

      await supabase.from('clase_recursos').insert({ clase_id: clase.id, recurso_id: newRes.id });
      
      setActiveLaunchers(prev => ({ ...prev, [launcherPlatform]: newRes }));
      setLauncherPlatform(''); setLauncherUrl('');
      if (onMsg) onMsg('ok', `Lanzador de ${launcherPlatform} guardado.`);
      onUpdateAlumnos(); // Refresh class data
    } catch (err) {
      if (onMsg) onMsg('err', 'Error al guardar el lanzador');
    } finally {
      setSavingLauncher(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9c27b0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontFamily: 'Outfit', fontSize: '0.9rem' }}>
          <ChevronLeft size={17}/> Volver a Mis Aulas
        </button>
        <span style={{ color: '#ccc' }}>›</span>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: '800', color: '#1a1a2e', margin: 0 }}>🏫 {clase.nombre_clase}</h2>
        <span style={{ padding: '3px 11px', borderRadius: '20px', background: '#ede7f6', color: '#9c27b0', fontSize: '0.78rem', fontWeight: '800', fontFamily: 'monospace' }}>🔑 {clase.codigo_invitacion}</span>
        <button 
          onClick={onRefresh}
          title="Actualizar datos del aula"
          style={{ background: 'none', border: 'none', color: '#8a8a9e', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'rotate(30deg)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0)'}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
        <button onClick={() => setActiveTab('alumnos')} style={{ background: activeTab === 'alumnos' ? '#9c27b0' : 'white', color: activeTab === 'alumnos' ? 'white' : '#666', border: '1.5px solid ' + (activeTab === 'alumnos' ? '#9c27b0' : '#ddd'), borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'Outfit' }}>
          👥 Alumnos
        </button>
        <button onClick={() => setActiveTab('materiales')} style={{ background: activeTab === 'materiales' ? '#9c27b0' : 'white', color: activeTab === 'materiales' ? 'white' : '#666', border: '1.5px solid ' + (activeTab === 'materiales' ? '#9c27b0' : '#ddd'), borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'Outfit' }}>
          📂 Materiales ({claseRecursos.length})
        </button>
        <button onClick={() => setActiveTab('lanzadores')} style={{ background: activeTab === 'lanzadores' ? '#9c27b0' : 'white', color: activeTab === 'lanzadores' ? 'white' : '#666', border: '1.5px solid ' + (activeTab === 'lanzadores' ? '#9c27b0' : '#ddd'), borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'Outfit' }}>
          🚀 Lanzadores
        </button>
      </div>

      {loadingDash ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8a8a9e' }}>
          <div className="spinner" style={{ margin: '0 auto 14px' }}/>
          <p>Cargando datos del aula...</p>
        </div>
      ) : (
        <>
          {activeTab === 'alumnos' && (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => { onUpdateAlumnos(); setShowBulkModal(false); }}
                  style={{ ...BTN_CYAN, display: 'inline-flex', alignItems: 'center', gap: '7px' }}
                >
                  <UserPlus size={15}/> Añadir Ninja
                </button>
                <button 
                  onClick={() => {
                    setShowBulkModal(true);
                    if (onCloseAnadir) onCloseAnadir();
                  }} 
                  style={{ ...BTN_GHOST, background: 'white', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)', display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px' }}
                >
                  <Sparkles size={15}/> Generación en Masa
                </button>
              </div>
              {dashData?.alumnos?.length > 0 ? (
                dashData?.alumnos.map(a => <AlumnoRow key={a.id} alumno={a} onValidar={onValidarReto} onValidarNinja={onValidarRetoNinja} onEliminar={onEliminarAlumno}/>)
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', borderRadius: '14px', border: '1.5px dashed #ddd' }}>
                  <Users size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }}/>
                  <p style={{ color: '#8a8a9e' }}>No hay alumnos todavía.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'materiales' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <p style={{ fontSize: '0.75rem', color: '#8a8a9e', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>Materiales visibles para los alumnos</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowVincular(true)} style={{ ...BTN_CYAN, padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14}/> Biblioteca
                  </button>
                  <button onClick={() => setShowUploadModal(true)} style={{ ...BTN_PRIMARY, padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14}/> Subir Nuevo Material
                  </button>
                </div>
              </div>
              {claseRecursos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.7)', borderRadius: '14px', border: '1.5px dashed #ddd' }}>
                  <Zap size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.2 }}/>
                  <p style={{ color: '#8a8a9e' }}>Aún no has compartido ningún recurso con esta clase.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {claseRecursos.map(cr => (
                    <div key={cr.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #eee', position: 'relative' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>{cr.recursos_docentes.nombre_recurso || cr.recursos_docentes.contenido?.meta?.filename}</h4>
                      <span style={{ fontSize: '0.6rem', color: '#9c27b0' }}>{cr.recursos_docentes.tipo_recurso.toUpperCase()}</span>
                      <button onClick={() => onDesvincular(cr.id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'lanzadores' && (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontFamily: 'Outfit', color: '#1a1a2e', marginBottom: '10px' }}>🔗 Lanzadores de Clase</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Define enlaces directos a tus aulas externas (Tinkercad, Code.org, etc). 
                  Los alumnos los verán directamente en sus tarjetas de planetas.
                </p>
              </div>

              <GlassCard style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>PLANETA / PLATAFORMA</label>
                    <select value={launcherPlatform} onChange={(e) => setLauncherPlatform(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="">Selecciona una plataforma...</option>
                      {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 2, minWidth: '300px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>URL DE ACCESO DIRECTO</label>
                    <input type="text" value={launcherUrl} onChange={(e) => setLauncherUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <GlowButton onClick={handleSaveLauncher} color="cyan" disabled={!launcherPlatform || !launcherUrl || savingLauncher}>
                      {savingLauncher ? 'GUARDANDO...' : 'VINCULAR LANZADOR'}
                    </GlowButton>
                  </div>
                </div>
              </GlassCard>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {platforms.map(p => (
                  <GlassCard key={p.id} style={{ padding: '20px', opacity: activeLaunchers[p.id] ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontWeight: '800', color: '#1a1a2e' }}>{p.name}</h4>
                      {activeLaunchers[p.id] && <span style={{ fontSize: '0.6rem', background: '#e0f5f5', color: '#128989', padding: '2px 8px', borderRadius: '10px' }}>ACTIVO</span>}
                    </div>
                    {activeLaunchers[p.id] ? (
                      <p style={{ fontSize: '0.8rem', color: '#128989', wordBreak: 'break-all', marginTop: '10px' }}>{activeLaunchers[p.id].contenido.markdown}</p>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px' }}>Sin link configurado.</p>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Vincular */}
      {showVincular && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px' }}>
             <h3 style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'Outfit', marginBottom: '20px' }}>Vincular de Biblioteca</h3>
             <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
               {misRecursos.map(r => (
                 <button key={r.id} onClick={() => { onVincular(r.id); setShowVincular(false); }} style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'14px', borderRadius:'12px', border:'1px solid #eee', background:'white', marginBottom:'8px', cursor:'pointer', textAlign:'left' }}>
                    <FileText size={16}/>
                    <div>
                      <p style={{ margin:0, fontWeight:'700', fontSize:'0.9rem' }}>{r.nombre_recurso || r.contenido?.meta?.filename}</p>
                      <p style={{ margin:0, fontSize:'0.7rem', color:'#9c27b0' }}>{r.tipo_recurso.toUpperCase()}</p>
                    </div>
                 </button>
               ))}
             </div>
             <button onClick={() => setShowVincular(false)} style={{ ...BTN_GHOST, width:'100%', marginTop:'20px' }}>Cerrar</button>
           </div>
        </div>
      )}
      {/* Modal Generación en Masa */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <GlassCard style={{ width: '100%', maxWidth: '500px', padding: '32px', background: 'white' }}>
            {!generatedResult ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'Outfit', margin: 0 }}>Generador de Alumnos</h3>
                  <button onClick={() => setShowBulkModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><XCircle size={20} /></button>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
                  Indica cuántos alumnos quieres incorporar. El sistema generará usuarios únicos y contraseñas automáticamente para tu clase.
                </p>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px', textTransform: 'uppercase' }}>Cantidad de alumnos (Máx 50)</label>
                  <input 
                    type="number" 
                    min="1" max="50" 
                    value={bulkQuantity} 
                    onChange={(e) => setBulkQuantity(e.target.value)} 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', fontWeight: '600' }}
                  />
                </div>
                <GlowButton color="purple" onClick={handleBulkGenerate} disabled={isGenerating} style={{ width: '100%', padding: '16px' }}>
                  {isGenerating ? 'PROCESANDO...' : 'GENERAR Y VINCULAR ALUMNOS'}
                </GlowButton>
                <button onClick={() => setShowBulkModal(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#8a8a9e', marginTop: '15px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancelar</button>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '60px', height: '60px', background: '#e0f5f5', color: '#128989', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'Outfit', margin: 0 }}>¡Alumnos Generados!</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Se han creado {generatedResult.length} cuentas con éxito.</p>
                </div>
                
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto' }}>
                  {generatedResult.map((a, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i === generatedResult.length - 1 ? 'none' : '1px solid #eee' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1a1a2e' }}>{a.alias}</span>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#5c6ac4' }}>{a.password}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <GlowButton color="cyan" onClick={() => downloadCredentials(generatedResult, clase.nombre_clase)} style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Download size={18} /> DESCARGAR LISTADO (.TXT)
                  </GlowButton>
                  <button 
                    onClick={() => { 
                      setShowBulkModal(false); 
                      setGeneratedResult(null); 
                      if (onRefresh) onRefresh(); 
                    }} 
                    style={{ ...BTN_GHOST, width: '100%' }}
                  >
                    LISTO, VOLVER AL DASHBOARD
                  </button>
                </div>
              </>
            )}
          </GlassCard>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL (INTERNO)
// ══════════════════════════════════════════════════════════
function MisAulasContent({ currentUser, misRecursos = [], onRefreshRecursos }) {
  const searchParams = useSearchParams();
  const [view, setView]         = useState('lista'); 
  const [clases, setClases]     = useState([]);
  const [claseActiva, setClaseActiva] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [loadingDash, setLoadingDash] = useState(false);
  const [claseRecursos, setClaseRecursos] = useState([]);
  const [showCrear, setShowCrear] = useState(false);
  const [showAnadir, setShowAnadir] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [nombreClase, setNombreClase] = useState('');
  const [identificador, setIdentificador] = useState('');
  const [toastNotif, setToastNotif]       = useState(null);
  const [uploadData, setUploadData] = useState({ filename: '', type: 'documento', content: '', tecnologia: 'general' });
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [editingRecurso, setEditingRecurso] = useState(null);

  const msg = (type, text) => { setToastNotif({ type, text }); setTimeout(() => setToastNotif(null), 3500); };

  const loadClases = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data: clasesData, error } = await supabase
        .from('clases')
        .select('*')
        .eq('profesor_id', currentUser.id)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      const con = await Promise.all((clasesData || []).map(async c => {
        try {
          const { data: alumnosIds } = await supabase.from('clase_alumnos').select('alumno_id').eq('clase_id', c.id);
          const ids = alumnosIds?.map(a => a.alumno_id) || [];
          
          let pendingCount = 0;
          if (ids.length > 0) {
            const [resRegular, resNinja] = await Promise.all([
              supabase.from('explore_progress').select('id', { count: 'exact', head: true }).in('student_id', ids).eq('status', 'En revisión'),
              supabase.from('user_challenges').select('id', { count: 'exact', head: true }).in('student_id', ids).eq('status', 'En revisión')
            ]);
            pendingCount = (resRegular.count || 0) + (resNinja.count || 0);
          }

          return { ...c, num_alumnos: ids.length, revisiones_pendientes: pendingCount };
        } catch (innerErr) {
          console.error("Error cargando clase:", c.id, innerErr);
          return { ...c, num_alumnos: 0, revisiones_pendientes: 0 };
        }
      }));


      setClases(con);
    } catch (err) {
      msg('err', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { loadClases(); }, [loadClases]);

  useEffect(() => {
    const cid = searchParams.get('claseId');
    if (cid && clases.length > 0 && (!claseActiva || claseActiva.id !== cid)) {
      const c = clases.find(cl => cl.id === cid);
      if (c) abrirDashboard(c);
    }
  }, [searchParams, clases, claseActiva]);

  const abrirDashboard = async (clase) => {
    setClaseActiva(clase);
    setView('dashboard');
    setDashData(null); // Reset data to show loading state
    setLoadingDash(true);
    try {
      const { data: vincs } = await supabase.from('clase_alumnos').select('alumno_id, fecha_union').eq('clase_id', clase.id);
      const ids = (vincs || []).map(v => v.alumno_id);

      if (ids.length > 0) {
        const [resP, resPr, resI, resN] = await Promise.all([
          supabase.from('profiles').select('id, alias, real_name, avatar_url').in('id', ids),
          supabase.from('explore_progress').select('student_id, planet_id, status').in('student_id', ids),
          supabase.from('badges').select('student_id, planet_id, badge_name, awarded_at').in('student_id', ids),
          supabase.from('user_challenges').select('student_id, challenge_id, planet_id, status, evidence_url, evidence_file_url, teacher_feedback').in('student_id', ids)
        ]);

        const perfiles = resP.data || [];
        const progreso = resPr.data || [];
        const insignias = resI.data || [];
        const retosNinja = resN.data || [];

          const alumnos = (perfiles || []).map(p => {
            const retos = (progreso || []).filter(r => r.student_id === p.id);
            const badges = (insignias || []).filter(b => b.student_id === p.id);
            const nimbus = (retosNinja || []).filter(rn => rn.student_id === p.id);
            const v = (vincs || []).find(v => v.alumno_id === p.id);
            
            const enRevisionRegular = retos.filter(r => r.status === 'En revisión').length;
            const enRevisionNinja = nimbus.filter(rn => rn.status === 'En revisión').length;

            return {
              ...p, fecha_union: v?.fecha_union,
              metricas: { 
                validados: retos.filter(r => r.status === 'Validado').length, 
                en_revision: enRevisionRegular + enRevisionNinja, 
                total_retos: retos.length, 
                insignias: badges.length 
              },
              retos_detalle: retos, insignias_detalle: badges,
              retos_ninja: nimbus
            };
          });

        setDashData({ alumnos });
      } else {
        setDashData({ alumnos: [] });
      }

      const { data: recs } = await supabase.from('clase_recursos').select('*, recursos_docentes(*)').eq('clase_id', clase.id);
      setClaseRecursos(recs || []);
      setLoadingDash(false);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      msg('err', 'Error al cargar dashboard: ' + err.message);
      setLoadingDash(false);
    }
  };

  const vincularRecurso = async (id) => {
    const { error } = await supabase.from('clase_recursos').insert({ clase_id: claseActiva.id, recurso_id: id });
    if (error) return msg('err', error.message);
    msg('ok', 'Recurso vinculado');
    abrirDashboard(claseActiva);
  };

  const desvincularRecurso = async (id) => {
    await supabase.from('clase_recursos').delete().eq('id', id);
    msg('ok', 'Recurso quitado');
    abrirDashboard(claseActiva);
  };

  const crearClase = async () => {
    if (!nombreClase.trim()) return;
    const { data, error } = await supabase.from('clases').insert({ profesor_id: currentUser.id, nombre_clase: nombreClase.trim() }).select().single();
    if (error) return msg('err', error.message);
    setShowCrear(false); setNombreClase(''); loadClases();
  };

  const eliminarClase = async (c) => {
    if (!confirm("¿Eliminar clase?")) return;
    await supabase.from('clases').delete().eq('id', c.id);
    loadClases();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {toastNotif && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 3000, padding: '12px 20px', borderRadius: '10px', background: toastNotif.type === 'ok' ? '#e0f5f5' : '#ffeaea', color: toastNotif.type === 'ok' ? '#128989' : '#c0392b', fontWeight: '700' }}>
          {toastNotif.text}
        </div>
      )}

      {view !== 'dashboard' && (
        <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '2px solid #eee' }}>
          <button onClick={() => setView('lista')} style={{ background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer', fontWeight: '800', color: view === 'lista' ? '#1a1a2e' : '#aaa', borderBottom: view === 'lista' ? '4px solid #9c27b0' : '4px solid transparent' }}>🏫 Mis Aulas</button>
          <button onClick={() => setView('biblioteca')} style={{ background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer', fontWeight: '800', color: view === 'biblioteca' ? '#1a1a2e' : '#aaa', borderBottom: view === 'biblioteca' ? '4px solid #9c27b0' : '4px solid transparent' }}>📂 Mi Biblioteca</button>
        </div>
      )}

      {view === 'lista' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <p style={{ color: '#8a8a9e' }}>{clases.length} clases</p>
            <button onClick={() => setShowCrear(true)} style={BTN_PRIMARY}>+ Nueva Clase</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {clases.map(c => <ClaseCard key={c.id} clase={c} onSelect={abrirDashboard} onDelete={eliminarClase} />)}
          </div>
        </>
      )}

      {view === 'biblioteca' && (
        <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: '800', margin: 0, color: '#1a1a2e' }}>📂 Mi Biblioteca Digital</h2>
              <p style={{ color: '#8a8a9e', fontSize: '0.9rem', margin: '5px 0 0' }}>Gestiona todos tus pergaminos y materiales del Dojo.</p>
            </div>
            <button onClick={() => setShowUploadModal(true)} style={BTN_PRIMARY}>+ Subir Nuevo Material</button>
          </div>

          {misRecursos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.5)', borderRadius: '20px', border: '2px dashed #ddd' }}>
              <HardDrive size={48} style={{ margin: '0 auto 15px', color: '#ccc' }} />
              <p style={{ color: '#8a8a9e', fontSize: '1.1rem' }}>Tu biblioteca está vacía.</p>
              <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Los materiales que subas con NotebookLM aparecerán aquí.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {misRecursos.map(r => {
                const isConfirming = confirmingDelete === r.id;
                return (
                  <div key={r.id} style={{ background: 'white', borderRadius: '18px', padding: '20px', border: isConfirming ? '2px solid #ff6b6b' : '1.5px solid #eee', position: 'relative', transition: 'all 0.2s', boxShadow: isConfirming ? '0 10px 30px rgba(255,107,107,0.2)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ padding: '8px', borderRadius: '10px', background: '#f5f5f5' }}>
                        {r.tipo_recurso === 'video' ? <Tv size={18} color="#9c27b0" /> : <FileText size={18} color="#128989" />}
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>PLANETA {r.tecnologia.toUpperCase()}</span>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#1a1a2e' }}>{r.nombre_recurso || r.contenido?.meta?.filename || 'Sin título'}</h4>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f5' }}>
                      <span style={{ fontSize: '0.7rem', color: '#8a8a9e' }}>{fmtDate(r.fecha_creacion)}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!isConfirming ? (
                          <>
                            <a href={r.contenido?.url} target="_blank" rel="noreferrer" style={{ padding: '4px 10px', borderRadius: '6px', background: '#f0f0f5', color: '#333', fontSize: '0.7rem', fontWeight: '700', textDecoration: 'none' }}>Ver</a>
                            
                            {/* Solo permitir Editar/Borrar si no es Maestro, o si es el Profe Maestro */}
                             {/* Solo permitir Editar/Borrar si el usuario es el DUEÑO del recurso */}
                             {currentUser?.id === r.profesor_id ? (
                               <>
                                 <button 
                                   onClick={() => { setEditingRecurso(r); setShowUploadModal(true); }}
                                   style={{ padding: '4px 10px', borderRadius: '6px', background: '#f0f0f5', color: '#333', fontSize: '0.7rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                                 >Editar</button>
                                 <button 
                                   onClick={() => setConfirmingDelete(r.id)}
                                   style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.8, padding: '5px' }}
                                   title="Eliminar mi recurso"
                                 >
                                   <Trash2 size={16}/>
                                 </button>
                               </>
                             ) : (
                               /* Si NO es el dueño, no ve botones de edición aunque sea un recurso global */
                               null
                             )}


                          </>
                        ) : (

                          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: '#ff6b6b', fontWeight: '700' }}>¿Borrar?</span>
                            <button 
                              onClick={async () => {
                                try {
                                  const { error } = await supabase.from('recursos_docentes').delete().eq('id', r.id);
                                  if (error) {
                                    msg('err', 'Error al borrar');
                                    console.error(error);
                                  } else {
                                    msg('ok', 'Eliminado');
                                    onRefreshRecursos();
                                  }
                                } finally {
                                  setConfirmingDelete(null);
                                }
                              }}
                              style={{ background: '#ff6b6b', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer' }}
                            >Sí</button>
                            <button 
                              onClick={() => setConfirmingDelete(null)}
                              style={{ background: '#eee', border: 'none', color: '#666', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer' }}
                            >No</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {r.contenido?.meta?.isGlobal && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(255,165,0,0.3)' }}>GLOBAL</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 'dashboard' && (
        <ClaseDetail 
          clase={claseActiva} 
          onBack={() => setView('lista')} 
          currentUser={currentUser}
          misRecursos={misRecursos}
          claseRecursos={claseRecursos}
          loadingDash={loadingDash}
          dashData={dashData}
          onVincular={vincularRecurso}
          onDesvincular={desvincularRecurso}
          onUpdateAlumnos={() => setShowAnadir(true)}
          onCloseAnadir={() => setShowAnadir(false)}
          onRefresh={() => abrirDashboard(claseActiva)}
          onMsg={msg}
          onValidarReto={async (id, planet, status, feedback) => { 
            await supabase.from('explore_progress').update({ 
              status: status, 
              teacher_feedback: feedback || null,
              updated_at: new Date().toISOString() 
            }).eq('student_id', id).eq('planet_id', planet); 
            abrirDashboard(claseActiva); 
          }}
          onValidarRetoNinja={async (id, challengeId, status, feedback) => { 
            await supabase.from('user_challenges').update({ 
              status: status, 
              teacher_feedback: feedback || null,
              updated_at: new Date().toISOString()
            }).eq('student_id', id).eq('challenge_id', challengeId); 
            abrirDashboard(claseActiva); 
          }}
          onEliminarAlumno={async (id) => { if(confirm("¿Quitar alumno?")) { await supabase.from('clase_alumnos').delete().eq('clase_id', claseActiva.id).eq('alumno_id', id); abrirDashboard(claseActiva); } }}
          setShowUploadModal={setShowUploadModal}
        />
      )}

      {/* Modales simplificados */}
      {showCrear && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '400px' }}>
            <h3>Nueva Clase</h3>
            <input type="text" value={nombreClase} onChange={e=>setNombreClase(e.target.value)} style={{ width:'100%', padding:'10px', marginBottom:'20px' }} />
            <button onClick={crearClase} style={BTN_PRIMARY}>Crear</button>
            <button onClick={()=>setShowCrear(false)} style={BTN_GHOST}>Cancelar</button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button 
              onClick={() => { setShowUploadModal(false); setEditingRecurso(null); }}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              Cerrar <XCircle size={18} />
            </button>
            <ResourceUploader 
              classId={claseActiva?.id} 
              currentUser={currentUser}
              onUploadSuccess={() => {
                if (claseActiva) abrirDashboard(claseActiva);
                onRefreshRecursos();
                setShowUploadModal(false);
                setEditingRecurso(null);
              }} 
              onClose={() => { setShowUploadModal(false); setEditingRecurso(null); }}
              editData={editingRecurso}
            />
          </div>
        </div>
      )}

      {showAnadir && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '400px' }}>
             <h3>Añadir Alumno</h3>
             <input type="text" value={identificador} onChange={e=>setIdentificador(e.target.value)} placeholder="Ninja Name o Correo" style={{ width:'100%', padding:'10px', marginBottom:'20px' }} />
             <button onClick={async () => {
               const cleanAlias = identificador.trim();
               if (!cleanAlias) return;

               // 1. Intentar buscar si ya existe
               const { data: p } = await supabase.from('profiles').select('id').ilike('alias', cleanAlias).maybeSingle();
               
               if (p) {
                 const { error: linkErr } = await supabase.from('clase_alumnos').insert({ clase_id: claseActiva.id, alumno_id: p.id });
                 if (linkErr) {
                   msg('err', 'Ya está en la clase o error');
                 } else {
                   msg('ok', 'Vinculado correctamente');
                   setShowAnadir(false); setIdentificador(''); abrirDashboard(claseActiva);
                 }
               } else {
                 // 2. Si no existe, CREARLO mediante la API
                 msg('info', 'Creando nuevo alumno...');
                 try {
                   const res = await fetch('/api/aulas', {
                     method: 'POST',
                     body: JSON.stringify({ action: 'generar_alumnos_bulk', claseId: claseActiva.id, alias: cleanAlias })
                   });
                   const data = await res.json();
                   if (data.success && data.created?.length > 0) {
                     setGeneratedResult(data.created); // Esto abrirá el modal de credenciales
                     setShowAnadir(false); setIdentificador('');
                     abrirDashboard(claseActiva);
                   } else {
                     msg('err', 'No se pudo crear: ' + (data.error || 'Error desconocido'));
                   }
                 } catch (e) {
                   msg('err', 'Error de conexión al crear');
                 }
               }
             }} style={BTN_PRIMARY}>Añadir</button>
             <button onClick={()=>setShowAnadir(false)} style={BTN_GHOST}>Cerrar</button>
           </div>
        </div>
      )}
    </div>
  );
}

export default function MisAulas(props) {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Cargando sistema de aulas...</div>}>
      <MisAulasContent {...props} />
    </Suspense>
  );
}
