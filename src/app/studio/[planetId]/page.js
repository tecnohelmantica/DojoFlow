"use client";
import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '../../../components/GlassCard';
import GlowButton from '../../../components/GlowButton';
import MisAulas from '../../../components/MisAulas';
import ResourceUploader from '../../../components/ResourceUploader';
import RouteGuard from '../../../components/RouteGuard';
import { useAuth } from '../../../components/AuthProvider';
import { supabase } from '../../../lib/supabaseClient';
import {
  ChevronLeft, Headphones, MonitorPlay, Tv, GitBranch,
  FileBarChart, GalleryHorizontal, HelpCircle, PieChart,
  Table, Save, Download, BookOpen, Clock, Cpu, RefreshCw,
  AlertCircle, CheckCircle, Upload, Link, MessageSquare,
  Copy, Zap, Sparkles, Filter, Users, Pencil, Trash2, ExternalLink
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { PLANETS, getPlanetById } from '../../../lib/planets';
import './page.css';

const MASTER_PROFESOR_ID = '5ec7cea5-1dfa-461f-8a07-ecf1da1854a6';

const matchTech = (resourceTech, planetId) => {
  if (!resourceTech || !planetId) return false;
  const r = resourceTech.toLowerCase().trim();
  const p = planetId.toLowerCase().trim();
  
  // 1. Exact match
  if (r === p) return true;
  
  // 2. Strict Legacy Map check
  const legacyMap = {
    'code': ['code.org', 'planeta code', 'code'],
    'makecode-microbit': ['microbit', 'makecode-microbit', 'makecode microbit', 'micro:bit'],
    'makecode-arcade': ['arcade', 'makecode-arcade', 'makecode arcade', 'arkae'],
    'tinkercad': ['3d', 'tinkercad', 'diseño 3d'],
    'ia': ['learningml', 'ia', 'inteligencia artificial'],
    'html': ['html', 'css', 'js', 'web', 'html/css/js']
  };

  const matchesLegacy = legacyMap[p]?.some(alt => {
    const normalizedAlt = alt.toLowerCase().replace(/\s/g, '').replace(/[:.]/g, '');
    const normalizedR = r.replace(/\s/g, '').replace(/[:.]/g, '');
    return normalizedR === normalizedAlt;
  });

  if (matchesLegacy) return true;

  // 3. Prevent partial matches between 'code' and 'makecode' (Both directions)
  if ((p === 'code' && r.includes('makecode')) || (r === 'code' && p.includes('makecode'))) return false;

  return r.includes(p) || p.includes(r);
};

// ──────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────
const TIPO_BADGE = {
  'Mapa mental':        { color: '#9c27b0', bg: '#f3e5f5', emoji: '🧠' },
  'mapa mental':        { color: '#9c27b0', bg: '#f3e5f5', emoji: '🧠' },
  'Cuestionario':       { color: '#0097e6', bg: '#e3f2fd', emoji: '❓' },
  'cuestionario':       { color: '#0097e6', bg: '#e3f2fd', emoji: '❓' },
  'Tarjetas didácticas':{ color: '#ff6b6b', bg: '#ffeaea', emoji: '🃏' },
  'tarjetas':           { color: '#ff6b6b', bg: '#ffeaea', emoji: '🃏' },
  'Presentación':       { color: '#0097e6', bg: '#e3f2fd', emoji: '📊' },
  'presentacion':       { color: '#0097e6', bg: '#e3f2fd', emoji: '📊' },
  'Infografía':         { color: '#9c27b0', bg: '#f3e5f5', emoji: '🗺️' },
  'infografia':         { color: '#9c27b0', bg: '#f3e5f5', emoji: '🗺️' },
  'Resumen de audio':   { color: '#5c6ac4', bg: '#ede7f6', emoji: '🎧' },
  'audio':              { color: '#5c6ac4', bg: '#ede7f6', emoji: '🎧' },
  'Resumen de vídeo':   { color: '#128989', bg: '#e0f5f5', emoji: '🎬' },
  'video':              { color: '#128989', bg: '#e0f5f5', emoji: '🎬' },
  'Informes':           { color: '#fdcb6e', bg: '#fff8e1', emoji: '📄' },
  'informe':            { color: '#fdcb6e', bg: '#fff8e1', emoji: '📄' },
  'Tabla de datos':     { color: '#5c6ac4', bg: '#ede7f6', emoji: '📋' },
  'tabla':              { color: '#5c6ac4', bg: '#ede7f6', emoji: '📋' },
  'reto':               { color: '#ff4b4b', bg: '#ffeaea', emoji: '🎯' },
  'enlace':             { color: '#00bcd4', bg: '#e0f7fa', emoji: '🔗' },
  'enlace':             { color: '#00bcd4', bg: '#e0f7fa', emoji: '🔗' },
  'lanzadera':          { color: '#9c27b0', bg: '#f3e5f5', emoji: '🚀' },
};

const TIPO_ORDER = {
  'infografia': 1,
  'infografía': 1,
  'video': 2,
  'resumen de vídeo': 2,
  'presentacion': 3,
  'presentación': 3,
  'mapa mental': 4,
  'tarjetas': 5,
  'cuestionario': 6,
  'informe': 7,
  'tabla': 8,
  'reto': 9,
  'enlace': 10,
  'lanzadera': 11
};

const sortRecursos = (a, b) => {
  const orderA = TIPO_ORDER[a.tipo_recurso.toLowerCase()] || 99;
  const orderB = TIPO_ORDER[b.tipo_recurso.toLowerCase()] || 99;
  if (orderA !== orderB) return orderA - orderB;
  return new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0);
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const renderMarkdown = (text) => {
  if (!text) return { __html: '' };
  
  // Si es un objeto JSON (como un quiz estructurado), lo formateamos
  if (typeof text === 'object') {
    return { __html: `<pre style="background:#f8f9fa; padding:20px; border-radius:12px; border:1px solid #e9ecef; font-family:monospace; font-size:0.85rem;">${JSON.stringify(text, null, 2)}</pre>` };
  }

  let parsed = text
    // Mermaid Blocks
    .replace(/```mermaid([\s\S]*?)```/g, '<div class="mermaid-block"><code class="language-mermaid">$1</code></div>')
    // Code Blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="premium-code-block"><code>$1</code></pre>')
    // Titles
    .replace(/^# (.*?)(\n|$)/gm, '<h1 class="nblm-h1">$1</h1>')
    .replace(/^## (.*?)(\n|$)/gm, '<h2 class="nblm-h2">$1</h2>')
    .replace(/^### (.*?)(\n|$)/gm, '<h3 class="nblm-h3">$1</h3>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Quotes (Expert Notes)
    .replace(/^> (.*?)(\n|$)/gm, '<div class="expert-note"><span class="note-icon">💡</span><p>$1</p></div>')
    // Lists
    .replace(/^- (.*?)(\n|$)/gm, '<li class="nblm-li">$1</li>')
    // Horizontal rule
    .replace(/---(\n|$)/g, '<hr class="nblm-hr"/>')
    // Cleanup newlines
    .replace(/\n{2,}/g, '<div style="margin-bottom:1.2rem;"></div>')
    .replace(/\n/g, '<br/>');

  return { __html: parsed };
};

// ──────────────────────────────────────────────────────────
// Componente Principal
// ──────────────────────────────────────────────────────────
export default function PlanetStudioPage() {
  const router = useRouter();
  const params = useParams();
  const planetId = params.planetId || 'general';
  const { session } = useAuth();
  const currentUser = session?.user || null;

  // ── Tabs ──
  const [activeTab, setActiveTab] = useState('forjar'); // 'forjar' | 'recursos'

  // ── ASPECCT Form ──
  const [promptData, setPromptData] = useState({
    action: '',
    steps: '',
    persona: '',
    examples: '',
    context: '',
    constraints: '',
    templateLanguage: 'español',
    templateOrientation: 'Horizontal',
    templateStyle: 'auto',
    templateDetail: 'Estándar'
  });

  // ── Output State ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputContent, setOutputContent] = useState('');
  const [generationStatus, setGenerationStatus] = useState(null); 
  
  // ── Prompt Lab States ──
  const [promptFields, setPromptFields] = useState({
    rol: 'Actúa como un profesor experto en tecnología educativa y pedagogía activa.',
    tarea: '',
    contexto: '',
    audiencia: 'Alumnado de secundaria (12-16 años) con nivel principiante.'
  });
  const [promptResult, setPromptResult] = useState('');
  
  // ── Library States ──
  const [isUploading, setIsUploading] = useState(false);

  // ── Encontrar la configuración del planeta actual ──
  const currentPlanet = getPlanetById(planetId) || PLANETS[0];
  const currentNotebookId = currentPlanet.notebook;
  const notebookUrl = `https://notebooklm.google.com/notebook/${currentNotebookId}`;

  // ── Mis Recursos ──
  const [misRecursos, setMisRecursos] = useState([]);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [selectedRecurso, setSelectedRecurso] = useState(null);
  const [editingRecurso, setEditingRecurso] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  
  // ── Gestión de Aulas y Asignaciones ──
  const [userClases, setUserClases] = useState([]);
  const [assignedMap, setAssignedMap] = useState({}); // { recurso_id: [clase_id, ...] }
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningRecurso, setAssigningRecurso] = useState(null);
  const [isSyncingAssignment, setIsSyncingAssignment] = useState(false);



  const handleInputChange = (field, value) => {
    setPromptData(prev => ({ ...prev, [field]: value }));
  };

  // ── Carga "Mis Recursos" ──
  const loadMisRecursos = useCallback(async () => {
    if (!currentUser) return;
    setLoadingRecursos(true);
    try {
      console.log('Cargando recursos para:', currentUser.id, 'Planeta:', planetId);
      
      // Consultamos directamente a Supabase para que el cliente use el token del usuario actual
      // Filtramos recursos propios o públicos marcados como 'master'
      const { data, error } = await supabase
        .from('recursos_docentes')
        .select('*')
        .or(`profesor_id.eq.${currentUser.id},profesor_id.eq.${MASTER_PROFESOR_ID}`);

      if (error) throw error;

      if (data) {
        setMisRecursos(data || []);
        
        // Cargar asignaciones actuales
        const { data: assignments } = await supabase
          .from('clase_recursos')
          .select('recurso_id, clase_id');
        
        const map = {};
        assignments?.forEach(asgn => {
          if (!map[asgn.recurso_id]) map[asgn.recurso_id] = [];
          map[asgn.recurso_id].push(asgn.clase_id);
        });
        setAssignedMap(map);
      }
    } catch (e) {
      console.error('Error cargando recursos:', e);
    } finally {
      setLoadingRecursos(false);
    }
  }, [currentUser, planetId]);

  // ── Carga de Aulas del profesor ──
  const loadUserClases = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('clases')
      .select('id, nombre_clase')
      .eq('profesor_id', currentUser.id);
    setUserClases(data || []);
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'recursos') {
        loadMisRecursos();
        loadUserClases();
    }
  }, [activeTab, loadMisRecursos, loadUserClases]);

  // ── Función de Asignación ──
  const toggleAsignacion = async (claseId) => {
    if (!assigningRecurso || isSyncingAssignment) return;
    setIsSyncingAssignment(true);
    
    const isAssigned = (assignedMap[assigningRecurso.id] || []).includes(claseId);
    
    try {
        if (isAssigned) {
            await supabase.from('clase_recursos').delete().eq('recurso_id', assigningRecurso.id).eq('clase_id', claseId);
            setAssignedMap(prev => ({
                ...prev,
                [assigningRecurso.id]: prev[assigningRecurso.id].filter(id => id !== claseId)
            }));
        } else {
            await supabase.from('clase_recursos').insert({ recurso_id: assigningRecurso.id, clase_id: claseId });
            setAssignedMap(prev => ({
                ...prev,
                [assigningRecurso.id]: [...(prev[assigningRecurso.id] || []), claseId]
            }));
        }
    } catch (e) {
        alert("Error al actualizar la asignación");
    } finally {
        setIsSyncingAssignment(false);
    }
  };

  // ── Forjar Prompt (Assistant) ──
  const forjarPrompt = async () => {
    const { rol, tarea, contexto, audiencia } = promptFields;
    if (!tarea) return alert('La Tarea es obligatoria para forjar el prompt.');
    
    setIsGenerating(true);
    setPromptResult('');
    
    setTimeout(() => {
      const planetName = currentPlanet.name || planetId;
      const megaPrompt = `
Actúa como el Tutor Pedagógico Socrático de DojoFlow, experto en tecnología educativa y pensamiento computacional. 
${rol || 'Tu enfoque es facilitar el aprendizaje activo y autónomo.'}

Tu misión es: ${tarea}

Contexto del reto: ${contexto || `Estamos trabajando en el Planeta ${planetName}.`}
Audiencia objetivo: ${audiencia || 'Exploradores de DojoFlow.'}

--- DIRECTRICES DE CALIDAD NINJA ---

1. Estilo Visual: El contenido debe estar diseñado para ser renderizado en una Glow Card con estilo Glassmorphism (limpio, moderno y visualmente impactante).

2. Nivel Pro (C++ mindset): Aunque el reto sea sobre bloques, introduce sutilmente conceptos que les preparen para el código textual (ej. mencionar que un bloque de "repetir" es un bucle o que una condición es un "if statement").

3. Ejemplos Prácticos: Incluye situaciones reales de ${planetName} (ej. retos específicos de esta plataforma) para que los alumnos conecten con la práctica inmediata.

4. Feedback Socrático: Para cada concepto complejo o posible error, genera una "Pista Graduada" que invite a la reflexión en lugar de dar la solución directa.

5. Estructura Motivadora: Comienza con un mensaje épico: "¡Explorador, prepárate para tu prueba de maestría en el Planeta ${planetName}!" y termina con un desafío o "Misión Extra" para el siguiente nivel.
`.trim();
      
      setPromptResult(megaPrompt);
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('📋 ¡Copiado al portapapeles! Úsalo en Claude, ChatGPT o NotebookLM.');
  };


  return (
    <RouteGuard requiredRole="profesor" redirectTo="/profile">
    <div className="studio-builder-container" style={{ '--planet-theme': currentPlanet.barColor, '--planet-bg': currentPlanet.color }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={() => router.push('/')} style={{ background:'none', border:'none', color:'var(--planet-theme)', display:'flex', alignItems:'center', cursor:'pointer', fontWeight:'600', marginBottom:'24px' }}>
            <ChevronLeft size={20} /> Volver a Panel Principal
          </button>

          <div style={{ marginBottom: '24px' }}>
            <h1 className="glow-text-planet" style={{ 
              fontFamily: 'Outfit', 
              fontSize: '2.2rem', 
              marginBottom: '4px', 
              color: currentPlanet.titleGradient ? 'transparent' : 'var(--planet-theme)',
              background: currentPlanet.titleGradient || 'none',
              WebkitBackgroundClip: currentPlanet.titleGradient ? 'text' : 'unset',
              WebkitTextFillColor: currentPlanet.titleGradient ? 'transparent' : (currentPlanet.textStroke ? 'var(--planet-theme)' : 'unset'),
              WebkitTextStroke: currentPlanet.textStroke || 'unset',
              display: 'inline-block'
            }}>
              Dojo Studio — {currentPlanet.name}
            </h1>
            <p style={{ color: '#8a8a9e' }}>Formula el prompt pedagógico y gestiona tus recursos educativos.</p>
          </div>
        </div>

        {currentPlanet.image && (
          <div className="planet-image-badge">
            <img src={currentPlanet.image} alt={currentPlanet.name} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '2px solid var(--color-border)', paddingBottom: '0' }}>
        {[
          { id: 'forjar',   label: '🧠 Ingeniero de Prompts', icon: <Sparkles size={16} /> },
          { id: 'recursos', label: '📂 Mi Biblioteca', icon: <BookOpen size={16} /> },
          { id: 'aulas',    label: 'Mis Aulas', icon: <Users size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? 'var(--planet-theme)' : '#8a8a9e',
              borderBottom: activeTab === tab.id ? '3px solid var(--planet-theme)' : '3px solid transparent',
              fontFamily: 'Outfit',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB: INGENIERO DE PROMPTS                      */}
      {/* ═══════════════════════════════════════════════ */}
      {activeTab === 'forjar' && (
        <div className="studio-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Lab Assistant */}
          <div>
            <GlassCard style={{ height: '100%', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--planet-theme)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Laboratorio Ninja</h2>
                    <p style={{ fontSize: '0.85rem', color: '#8a8a9e' }}>Crea el prompt perfecto para tus recursos.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '24px' }}>
                {/* ROL */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px', color: 'var(--planet-theme)' }}>
                    1. Identidad (Rol del Modelo)
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#8a8a9e', marginBottom: '8px', lineHeight: '1.3' }}>
                    Define la personalidad de la IA. Ej: Tutor Pedagógico Socrático, Mentor Pro en C++, etc.
                  </p>
                  <input 
                    type="text"
                    className="aspecct-input"
                    style={{ padding: '12px' }}
                    placeholder="Ej: Tutor Pedagógico Socrático experto en tecnología educativa..."
                    value={promptFields.rol}
                    onChange={e => setPromptFields({...promptFields, rol: e.target.value})}
                  />
                </div>

                {/* TAREA */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px', color: 'var(--planet-theme)' }}>
                    2. Misión (¿Qué debe generar?)
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#8a8a9e', marginBottom: '8px', lineHeight: '1.3' }}>
                    La petición específica. Ej: Genera un Quiz Ninja, explica un concepto, crea un reto, etc.
                  </p>
                  <textarea 
                    className="aspecct-input"
                    style={{ height: '80px', padding: '12px' }}
                    placeholder="Ej: Genera un Quiz Ninja de 5 preguntas sobre el uso de bloques..."
                    value={promptFields.tarea}
                    onChange={e => setPromptFields({...promptFields, tarea: e.target.value})}
                  />
                </div>

                {/* CONTEXTO */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px', color: 'var(--planet-theme)' }}>
                    3. Materia (Contexto del Contenido)
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#8a8a9e', marginBottom: '8px', lineHeight: '1.3' }}>
                    Detalles del tema a tratar. Ej: El uso de bucles en Scratch, condicionales en Python, etc.
                  </p>
                  <textarea 
                    className="aspecct-input"
                    style={{ height: '60px', padding: '12px' }}
                    placeholder="Ej: Los conceptos básicos de variables y operadores matemáticos..."
                    value={promptFields.contexto}
                    onChange={e => setPromptFields({...promptFields, contexto: e.target.value})}
                  />
                </div>

                {/* AUDIENCIA */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', marginBottom: '6px', color: 'var(--planet-theme)' }}>
                    4. Perfil (Audiencia)
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#8a8a9e', marginBottom: '8px', lineHeight: '1.3' }}>
                    Define el nivel y lenguaje. Ej: Alumnos de secundaria (12-16 años), nivel principiante.
                  </p>
                  <input 
                    type="text"
                    className="aspecct-input"
                    style={{ padding: '12px' }}
                    placeholder="Ej: Alumnos de secundaria (12-16 años), nivel principiante..."
                    value={promptFields.audiencia}
                    onChange={e => setPromptFields({...promptFields, audiencia: e.target.value})}
                  />
                </div>
              </div>

              <GlowButton color="custom" onClick={forjarPrompt} style={{ width: '100%', padding: '16px', fontWeight: 'bold', '--glow-color': currentPlanet.barColor }}>
                {isGenerating ? 'ANALIZANDO PEDAGOGÍA...' : '✨ FORJAR MEGA-PROMPT'}
              </GlowButton>
            </GlassCard>
          </div>

          {/* Master Prompt Output */}
          <div style={{ position: 'relative' }}>
            <GlassCard style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.8)' }}>
                {!promptResult && !isGenerating ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8a8a9e', opacity: 0.6 }}>
                        <Cpu size={48} style={{ marginBottom: '16px' }} />
                        <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>Esperando instrucciones...</p>
                    </div>
                ) : isGenerating ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner" style={{ marginBottom: '16px' }} />
                        <p style={{ color: 'var(--accent-purple)', fontWeight: '600', fontSize: '0.9rem' }}>Ingeniero de Prompts trabajando...</p>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--planet-theme)' }}>Mega-Prompt de Experto</h3>
                            <button 
                                onClick={() => copyToClipboard(promptResult)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--planet-theme)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                            >
                                <Copy size={14} /> COPIAR PROMPT
                            </button>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--planet-theme)', fontSize: '0.95rem', lineHeight: '1.6', color: '#444' }}>
                            {promptResult}
                        </div>
                        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0, 151, 230, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 151, 230, 0.2)' }}>
                            <p style={{ fontSize: '0.8rem', color: '#138496', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={14} /> ¡Prompt listo!
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#555' }}>
                                Pégalo ahora en <strong>Claude.ai</strong>, <strong>ChatGPT</strong> o <strong>NotebookLM</strong> para obtener tu recurso en segundos.
                            </p>
                        </div>
                    </div>
                )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB: MI BIBLIOTECA                             */}
      {/* ═══════════════════════════════════════════════ */}
      {activeTab === 'recursos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
          {/* Sidebar Filters & Upload */}
          <aside>
              <GlassCard style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Gestión de Activos</h3>
                <button 
                  onClick={() => setIsUploading(true)}
                  style={{ width: '100%', background: 'var(--accent-teal)', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <Upload size={16} /> SUBIR RECURSO
                </button>
              </GlassCard>
              
              <div style={{ padding: '16px', background: 'rgba(92, 106, 196, 0.05)', borderRadius: '12px', border: '1px dashed var(--accent-purple)' }}>
                <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: '1.4' }}>
                    Recuerda que tus materiales deben seguir las directrices de <strong>Protección de Datos</strong> de DojoFlow.
                </p>
              </div>
          </aside>

          {/* Library Content */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {/* 1. BIBLIOTECA PRIVADA */}
            <section>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                  <div>
                    <h2 style={{ fontFamily:'Outfit', fontSize:'1.4rem', fontWeight:'700', color:'var(--color-text)' }}>
                      🔒 Mi Biblioteca Privada
                    </h2>
                    <p style={{ color:'#8a8a9e', fontSize:'0.85rem' }}>Recursos de {planetId.toUpperCase()} añadidos por ti.</p>
                  </div>
              </div>

              {loadingRecursos ? (
                <div style={{ textAlign:'center', padding:'40px', color:'#8a8a9e' }}>
                  <div className="spinner" style={{ margin:'0 auto 16px' }} />
                  <p>Escaneando biblioteca...</p>
                </div>
              ) : [...new Map(misRecursos.filter(r => matchTech(r.tecnologia, planetId) && r.profesor_id === currentUser?.id && !r.contenido?.meta?.isGlobal && !r.contenido?.isMaster).map(x => [x.id, x])).values()].length === 0 ? (
                <GlassCard style={{ textAlign:'center', padding:'40px', color:'#8a8a9e', background: 'rgba(255,255,255,0.4)', border: '2px dashed var(--color-border)' }}>
                  <p style={{ fontSize:'0.85rem' }}>No tienes recursos privados en este planeta.</p>
                </GlassCard>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {[...new Map(misRecursos
                    .filter(r => matchTech(r.tecnologia, planetId) && r.profesor_id === currentUser?.id && !r.contenido?.meta?.isGlobal && !r.contenido?.isMaster)
                    .map(item => [item.id, item])).values()]
                    .sort(sortRecursos)
                    .map(r => {
                          const isConfirming = confirmingDelete === r.id;
                          return (
                          <GlassCard key={r.id} style={{ padding: '20px', border: isConfirming ? '2px solid #ff6b6b' : '1px solid var(--color-border)', transition: 'transform 0.2s', position: 'relative' }} className={isConfirming ? '' : "lib-card-hover"}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                  <div style={{ background: TIPO_BADGE[r.tipo_recurso]?.bg || '#f0f0f0', color: TIPO_BADGE[r.tipo_recurso]?.color || '#666', padding: '10px', borderRadius: '12px' }}>
                                      {TIPO_BADGE[r.tipo_recurso]?.emoji || '📄'}
                                  </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.5 }}>{formatDate(r.fecha_creacion)}</span>
                                    {r.contenido?.meta?.isGlobal && (
                                        <span style={{ fontSize: '0.55rem', color: 'var(--planet-theme)', fontWeight: '800', marginTop: '4px', background: `${currentPlanet.color}55`, padding: '2px 6px', borderRadius: '4px' }}>
                                            ✦ MAESTRO GLOBAL
                                        </span>
                                    )}
                                    {(assignedMap[r.id] || []).length > 0 && (
                                        <span style={{ fontSize: '0.6rem', color: 'var(--accent-teal)', fontWeight: '700', marginTop: '4px' }}>
                                            📍 En {(assignedMap[r.id] || []).length} aula(s)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>{r.tipo_recurso}</h4>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '16px' }}>{r.contenido?.meta?.filename || 'Recurso manual'}</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => setSelectedRecurso(r)}
                                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'white', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                  Ver
                                </button>
                                {/* 1. Botón Editar: Solo si soy el DUEÑO */}
                                {currentUser?.id === r.profesor_id && (
                                  <button 
                                    onClick={() => { setEditingRecurso(r); setIsUploading(true); }}
                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'white', color: '#666', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                  >
                                    <Pencil size={12} /> Editar
                                  </button>
                                )}

                                {/* 2. Botón Asignar: Solo si NO es Global y soy el DUEÑO */}
                                {!(r.contenido?.isMaster || r.contenido?.meta?.isGlobal) && currentUser?.id === r.profesor_id && (
                                  <button 
                                      onClick={() => { setAssigningRecurso(r); setShowAssignModal(true); }}
                                      style={{ 
                                          padding: '8px 12px', 
                                          borderRadius: '8px', 
                                          border: `1px solid ${currentPlanet.barColor}`, 
                                          background: (assignedMap[r.id] || []).length > 0 ? currentPlanet.barColor : 'white', 
                                          color: (assignedMap[r.id] || []).length > 0 ? 'white' : currentPlanet.barColor, 
                                          fontSize: '0.7rem', 
                                          fontWeight: '700', 
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                      gap: '6px'
                                      }}
                                  >
                                      <Users size={12} /> {(assignedMap[r.id] || []).length > 0 ? 'VINCULADO' : 'ASIGNAR'}
                                  </button>
                                )}

                                {currentUser?.id === r.profesor_id && (
                                    confirmingDelete !== r.id ? (
                                        <button 
                                            onClick={() => setConfirmingDelete(r.id)}
                                            style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.7, padding: '5px' }}
                                            title="Eliminar recurso"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        // 1. Eliminar vínculos en aulas
                                                        const { error: linkError } = await supabase.from('clase_recursos').delete().eq('recurso_id', r.id);
                                                        if (linkError) console.warn('Error limpiando vínculos:', linkError);

                                                        // 2. Eliminar el recurso
                                                        const { error, count } = await supabase
                                                            .from('recursos_docentes')
                                                            .delete({ count: 'exact' })
                                                            .eq('id', r.id);
                                                        
                                                        if (error) {
                                                            alert("Error al eliminar: " + error.message);
                                                        } else if (count === 0) {
                                                            alert("No se encontró el recurso o no tienes permisos para borrarlo.");
                                                        } else {
                                                            console.log('Recurso eliminado con éxito');
                                                            loadMisRecursos();
                                                        }
                                                    } catch (err) {
                                                        console.error('Error en proceso de borrado:', err);
                                                        alert("Error crítico en el protocolo de borrado.");
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
                                    )
                                )}


                            </div>
                        </GlassCard>
                      );
                    })}
                </div>
              )}
            </section>

            {/* 2. RECURSOS MAESTROS */}
            <section>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                  <div>
                    <h2 style={{ 
                      fontFamily:'Outfit', 
                      fontSize:'1.4rem', 
                      fontWeight:'700', 
                      color: currentPlanet.titleGradient ? 'transparent' : currentPlanet.barColor,
                      background: currentPlanet.titleGradient || 'none',
                      WebkitBackgroundClip: currentPlanet.titleGradient ? 'text' : 'unset',
                      WebkitTextFillColor: currentPlanet.titleGradient ? 'transparent' : (currentPlanet.textStroke ? currentPlanet.barColor : 'unset'),
                      WebkitTextStroke: currentPlanet.textStroke || 'unset',
                      display: 'inline-block'
                    }}>
                      ✨ Biblioteca de Recursos Maestros
                    </h2>
                    <p style={{ color:'#8a8a9e', fontSize:'0.85rem' }}>Materiales oficiales y compartidos para todos los usuarios.</p>
                  </div>
              </div>

              {loadingRecursos ? null : [...new Map(misRecursos.filter(r => matchTech(r.tecnologia, planetId) && (r.contenido?.meta?.isGlobal || r.contenido?.isMaster)).map(x => [x.id, x])).values()].length === 0 ? (
                <GlassCard style={{ textAlign:'center', padding:'40px', color:'#8a8a9e', background: 'rgba(255,255,255,0.4)', border: '2px dashed var(--color-border)' }}>
                  <p style={{ fontSize:'0.85rem' }}>No hay recursos maestros disponibles en este momento.</p>
                </GlassCard>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {[...new Map(misRecursos
                      .filter(r => matchTech(r.tecnologia, planetId) && (r.contenido?.meta?.isGlobal || r.contenido?.isMaster))
                      .map(item => [item.id, item])).values()]
                      .sort(sortRecursos)
                      .map(r => (
                        <GlassCard key={r.id} style={{ padding: '20px', border: `1px solid ${currentPlanet.barColor}`, background: `${currentPlanet.barColor}05` }} className="lib-card-hover">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                <div style={{ background: TIPO_BADGE[r.tipo_recurso]?.bg || '#f0f0f0', color: TIPO_BADGE[r.tipo_recurso]?.color || '#666', padding: '10px', borderRadius: '12px' }}>
                                    {TIPO_BADGE[r.tipo_recurso]?.emoji || '📄'}
                                </div>
                                <div style={{ background: currentPlanet.barColor, color: 'white', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px' }}>
                                    MAESTRO
                                </div>
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{r.tipo_recurso}</h4>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '16px' }}>{r.contenido?.meta?.filename || 'Oficial'}</p>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => setSelectedRecurso(r)}
                                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'white', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                  Ver
                                </button>
                                {currentUser?.id === r.profesor_id && (
                                  <button 
                                    onClick={() => { setEditingRecurso(r); setIsUploading(true); }}
                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'white', color: '#666', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                  >
                                    <Pencil size={12} /> Editar
                                  </button>
                                )}

                                {currentUser?.id === r.profesor_id && (
                                    confirmingDelete !== r.id ? (
                                        <button 
                                            onClick={() => setConfirmingDelete(r.id)}
                                            style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.7, padding: '5px' }}
                                            title="Eliminar recurso maestro"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        // 1. Eliminar primero vínculos en aulas
                                                        await supabase.from('clase_recursos').delete().eq('recurso_id', r.id);

                                                        // 2. Eliminar recurso maestro
                                                        const { error } = await supabase.from('recursos_docentes').delete().eq('id', r.id);
                                                        if (error) alert("Error: " + error.message);
                                                        else loadMisRecursos();
                                                    } catch (err) {
                                                        alert("Error en el borrado del recurso maestro.");
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
                                    )
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
              )}
            </section>
          </main>
        </div>
      )}


      {/* Modal de Asignación a Aula */}
      {showAssignModal && assigningRecurso && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <GlassCard style={{ width: '100%', maxWidth: '450px', padding: '32px', background: 'white', boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'Outfit' }}>Asignar a Aula</h3>
                        <p style={{ fontSize: '0.85rem', color: '#8a8a9e', marginTop: '4px' }}>Selecciona en qué aulas estará disponible este recurso.</p>
                    </div>
                    <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><AlertCircle size={20} /></button>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ background: TIPO_BADGE[assigningRecurso.tipo_recurso]?.bg, color: TIPO_BADGE[assigningRecurso.tipo_recurso]?.color, padding: '8px', borderRadius: '8px' }}>
                        {TIPO_BADGE[assigningRecurso.tipo_recurso]?.emoji}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{assigningRecurso.tipo_recurso}</p>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>{assigningRecurso.contenido?.meta?.filename || 'Manual'}</p>
                    </div>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {userClases.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#8a8a9e', fontSize: '0.85rem' }}>No tienes aulas creadas todavía.</p>
                    ) : (
                        userClases.map(clase => {
                            const isAssigned = (assignedMap[assigningRecurso.id] || []).includes(clase.id);
                            return (
                                <button 
                                    key={clase.id}
                                    onClick={() => toggleAsignacion(clase.id)}
                                    disabled={isSyncingAssignment}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 18px',
                                        borderRadius: '12px',
                                        border: isAssigned ? '2px solid var(--accent-teal)' : '1px solid var(--color-border)',
                                        background: isAssigned ? 'rgba(18, 137, 137, 0.05)' : 'white',
                                        cursor: isSyncingAssignment ? 'wait' : 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Users size={16} color={isAssigned ? 'var(--accent-teal)' : '#8a8a9e'} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: isAssigned ? 'var(--accent-teal)' : '#1a1a2e' }}>{clase.nombre_clase}</span>
                                    </div>
                                    {isAssigned ? <CheckCircle size={18} color="var(--accent-teal)" /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #ddd' }} />}
                                </button>
                            );
                        })
                    )}
                </div>

                <GlowButton color="purple" onClick={() => setShowAssignModal(false)} style={{ width: '100%', padding: '14px', fontWeight: 'bold' }}>
                    LISTO
                </GlowButton>
            </GlassCard>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB: MIS AULAS                                 */}
      {/* ═══════════════════════════════════════════════ */}
      {activeTab === 'aulas' && (
        <MisAulas currentUser={currentUser} misRecursos={misRecursos} onRefreshRecursos={loadMisRecursos} />
      )}

      {/* Unified Dojo Artifact Uploader Modal */}
      {isUploading && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(15px)', 
          zIndex: 1100, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '20px' 
        }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                <ResourceUploader 
                    currentUser={currentUser} 
                    planet={planetId} 
                    editData={editingRecurso}
                    onClose={() => {
                        setIsUploading(false);
                        setEditingRecurso(null);
                    }}
                    onUploadSuccess={() => { 
                        setIsUploading(false); 
                        setEditingRecurso(null);
                        loadMisRecursos(); 
                    }} 
                />
            </div>
        </div>
      )}

      {/* 📜 VISOR DE RECURSO (MODAL) */}
      {selectedRecurso && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(26, 26, 46, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '40px'
        }} onClick={() => setSelectedRecurso(null)}>
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '800px', 
              maxHeight: '85vh',
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: TIPO_BADGE[selectedRecurso.tipo_recurso]?.bg, color: TIPO_BADGE[selectedRecurso.tipo_recurso]?.color, padding: '10px', borderRadius: '12px' }}>
                   {TIPO_BADGE[selectedRecurso.tipo_recurso]?.emoji}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: '800', margin: 0 }}>{selectedRecurso.nombre_recurso || selectedRecurso.tipo_recurso}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#8a8a9e', margin: 0 }}>{selectedRecurso.tecnologia.toUpperCase()} • {selectedRecurso.contenido?.meta?.isGlobal ? 'Material Maestro' : 'Privado'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRecurso(null)}
                style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
            
            <div style={{ padding: selectedRecurso.contenido?.url && !selectedRecurso.contenido?.markdown ? '0' : '32px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
              {selectedRecurso.contenido?.markdown ? (
                <div style={{ padding: '32px' }}>
                  <div 
                    className="nblm-markdown-viewer" 
                    dangerouslySetInnerHTML={renderMarkdown(selectedRecurso.contenido.markdown)} 
                  />
                </div>
              ) : (selectedRecurso.contenido?.url && (selectedRecurso.contenido.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null)) ? (
                <div style={{ textAlign: 'center', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}>
                   <img src={selectedRecurso.contenido.url} alt="Recurso" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #eee' }} />
                </div>
              ) : selectedRecurso.contenido?.url ? (
                <div style={{ height: '70vh', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <iframe 
                    src={selectedRecurso.contenido.url.includes('drive.google.com') ? selectedRecurso.contenido.url.replace('/view', '/preview').replace('/edit', '/preview') : selectedRecurso.contenido.url} 
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Visor de Documento"
                  />
                  <div style={{ padding: '12px', textAlign: 'center', background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
                    <button 
                      onClick={() => window.open(selectedRecurso.contenido.url, '_blank')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                    >
                      <ExternalLink size={14} /> ABRIR EN PANTALLA COMPLETA / DESCARGAR
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                  <AlertCircle size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Este recurso no contiene datos visualizables.</p>
                </div>
              )}
            </div>

            <div style={{ padding: '20px', background: '#f9f9f9', borderTop: '1px solid #eee', textAlign: 'center' }}>
               <GlowButton color="custom" onClick={() => setSelectedRecurso(null)} style={{ padding: '10px 40px', '--glow-color': currentPlanet.barColor }}>
                  CERRAR VISTA
               </GlowButton>
            </div>
          </div>
        </div>
      )}

    </div>
    </RouteGuard>
  );
}
