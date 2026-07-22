import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { supabase } from '../lib/supabaseClient';
import { 
  Rocket, Sparkles, Target, Lightbulb, 
  ChevronRight, Loader2, CheckCircle2, 
  Send, HelpCircle, Trophy, Zap, 
  Brain, Timer, Star, Award, 
  Settings, RefreshCw, Layers, 
  Gamepad2, Cpu, Box, Code2, Palette,
  Upload, Paperclip, Link2, X as XIcon, BookOpen, ChevronDown, ChevronUp, Clock
} from 'lucide-react';
import SocraticTutor from './SocraticTutor';

export default function SenseiMissions({ planetId, userId, studentLevel, accentColor = '#0097e6', onValidateMission, refreshTrigger, isCustomOnly = false, onMissionStateChange }) {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(true);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    completed: 0,
    xp: 0,
    streak: 0,
    medals: []
  });

  // Helper to get RGB from Hex for CSS variables
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 151, 230';
  };

  const accentRgb = hexToRgb(accentColor);

  // Helper to update mission and notify parent in a single call (avoids re-render loop)
  const updateMission = (newMission) => {
    setMission(newMission);
    onMissionStateChange?.(!!newMission);
  };

  // Config State
  const [config, setConfig] = useState({
    level: studentLevel || 'Intermedio',
    type: 'Creativo',
    theme: '',
    customIdea: ''
  });

  const [journal, setJournal] = useState('');
  const [journalSavedAt, setJournalSavedAt] = useState(null);
  const [showJournal, setShowJournal] = useState(false);
  const [sessionLog, setSessionLog] = useState([]);
  const [pendingMissions, setPendingMissions] = useState([]);

  useEffect(() => {
    if (userId && planetId) {
      loadData();
    }
  }, [userId, planetId, refreshTrigger]);

  // Load journal notes and register session when mission becomes active
  useEffect(() => {
    if (!mission) { setJournal(''); setSessionLog([]); return; }
    const missionId = mission.id || `${planetId}_${isCustomOnly}`;
    const journalKey = `dojo_journal_${planetId}_${missionId}`;
    const savedNotes = mission.metadata?.journal || localStorage.getItem(journalKey) || '';
    setJournal(savedNotes);

    const sessionsKey = `dojo_sessions_${planetId}_${missionId}`;
    const savedSessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
    const now = new Date();
    const todayStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const lastSession = savedSessions[savedSessions.length - 1];
    if (!lastSession || lastSession.date !== todayStr) {
      const updated = [...savedSessions, { date: todayStr, time: timeStr, id: Date.now() }];
      localStorage.setItem(sessionsKey, JSON.stringify(updated));
      setSessionLog(updated);
    } else {
      setSessionLog(savedSessions);
    }
  }, [mission?.id]);

  // Auto-save journal with 1.5s debounce
  useEffect(() => {
    if (!mission || journal === undefined) return;
    const missionId = mission.id || `${planetId}_${isCustomOnly}`;
    const journalKey = `dojo_journal_${planetId}_${missionId}`;
    const timer = setTimeout(async () => {
      localStorage.setItem(journalKey, journal);
      if (userId !== 'guest_user' && mission.id) {
        try {
          await supabase.from('sensei_missions')
            .update({ metadata: { ...mission.metadata, journal } })
            .eq('id', mission.id);
        } catch (e) { console.warn('[Diario] Supabase save error:', e); }
      }
      setJournalSavedAt(new Date());
    }, 1500);
    return () => clearTimeout(timer);
  }, [journal]);


  const abandonMission = async (mToAbandon) => {
    if (!confirm("¿Seguro que quieres abandonar esta misión? Desaparecerá de tus misiones abiertas.")) return;
    try {
      if (userId === 'guest_user') {
        const guestMissions = JSON.parse(localStorage.getItem('guest_sensei_missions') || '[]');
        const updated = guestMissions.map(m => m.id === mToAbandon.id ? {...m, status: 'abandoned'} : m);
        localStorage.setItem('guest_sensei_missions', JSON.stringify(updated));
      } else {
        await supabase.from('sensei_missions').update({ status: 'abandoned' }).eq('id', mToAbandon.id);
      }
      setPendingMissions(prev => prev.filter(p => p.id !== mToAbandon.id));
      if (mission?.id === mToAbandon.id) {
        updateMission(null);
        setShowConfig(false);
      }
    } catch (e) {
      console.error("Error al abandonar misión:", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    // Reset state for the new planet
    updateMission(null);
    setStats({ completed: 0, xp: 0, streak: 0, medals: [] });

    try {
      if (userId === 'guest_user') {
        const guestMissions = JSON.parse(localStorage.getItem('guest_sensei_missions') || '[]');
        // Filter by status, planetId AND is_custom
        const activeMissions = guestMissions.filter(m => 
          (m.status === 'active' || m.status === 'En revisión') && 
          m.planet_id === planetId && 
          (isCustomOnly ? m.metadata?.is_custom === true : !m.metadata?.is_custom)
        );
        activeMissions.sort((a,b) => (b.id||0) - (a.id||0));
        setPendingMissions(activeMissions);
        if (activeMissions.length > 0) updateMission(activeMissions[0]);

        const completed = guestMissions.filter(m => 
          m.status === 'completed' && 
          m.planet_id === planetId && 
          (isCustomOnly ? m.metadata?.is_custom === true : !m.metadata?.is_custom)
        );
        const totalXp = completed.reduce((acc, m) => acc + (m.reward_xp || 50), 0);
        
        setStats({
          completed: completed.length,
          xp: totalXp,
          streak: Math.min(completed.length, 7),
          medals: completed.length >= 5 ? ['Veterano', 'Explorador'] : completed.length >= 1 ? ['Iniciado'] : []
        });
        setLoading(false);
        return;
      }

      // 1. Load active or in review mission for this custom type
      const { data: missionsList } = await supabase
        .from('sensei_missions')
        .select('*')
        .eq('student_id', userId)
        .eq('planet_id', planetId)
        .in('status', ['active', 'En revisión'])
        .order('created_at', { ascending: false });

      if (missionsList) {
        const foundList = missionsList.filter(m => 
          isCustomOnly ? m.metadata?.is_custom === true : !m.metadata?.is_custom
        );
        setPendingMissions(foundList);
        if (foundList.length > 0) {
          updateMission(foundList[0]);
        } else {
          updateMission(null);
        }
      } else {
        setPendingMissions([]);
        updateMission(null);
      }

      // 2. Load stats (completed missions of same type)
      const { data: allMissions } = await supabase
        .from('sensei_missions')
        .select('status, reward_xp, metadata')
        .eq('student_id', userId)
        .eq('planet_id', planetId);

      if (allMissions) {
        const completed = allMissions.filter(m => 
          m.status === 'completed' && 
          (isCustomOnly ? m.metadata?.is_custom === true : !m.metadata?.is_custom)
        );
        const totalXp = completed.reduce((acc, m) => acc + (m.reward_xp || 50), 0);
        
        setStats({
          completed: completed.length,
          xp: totalXp,
          streak: Math.min(completed.length, 7), 
          medals: completed.length >= 5 ? ['Veterano', 'Explorador'] : completed.length >= 1 ? ['Iniciado'] : []
        });
      }
    } catch (err) {
      console.error("Error loading sensei data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewMission = async () => {
    setRequesting(true);
    try {
      // Get previous mission titles to avoid repetition
      let excludeList = [];
      try {
        if (userId === 'guest_user') {
          const guestMissions = JSON.parse(localStorage.getItem('guest_sensei_missions') || '[]');
          excludeList = guestMissions.slice(-3).map(m => m.title);
        } else {
          const { data: prevMissions } = await supabase
            .from('sensei_missions')
            .select('title')
            .eq('student_id', userId)
            .eq('planet_id', planetId)
            .order('created_at', { ascending: false })
            .limit(3);
          if (prevMissions) excludeList = prevMissions.map(m => m.title);
        }
      } catch (e) { console.warn("Could not load exclude list", e); }

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mode: isCustomOnly ? 'custom_mission_generator' : 'mission_generator',
          planet: planetId,
          level: config.level,
          message: isCustomOnly ? config.customIdea : undefined,
          missionType: isCustomOnly ? undefined : config.type,
          missionTheme: isCustomOnly ? undefined : config.theme,
          randomSeed: Date.now(),
          excludeList: excludeList
        })
      });

      const data = await response.json();
      if (data.success) {
        let missionData;
        try {
          const jsonStr = data.text.replace(/```json\n?|\n?```/g, '').trim();
          missionData = JSON.parse(jsonStr);
        } catch (pErr) {
          console.error("Failed to parse mission JSON:", pErr);
          throw new Error("El Sensei está concentrado... Reintenta en un momento.");
        }

        let savedMission;
        if (userId === 'guest_user') {
          savedMission = {
            id: 'guest_mission_' + Date.now(),
            student_id: userId,
            planet_id: planetId,
            title: missionData.title,
            description: missionData.description,
            objective: missionData.objective,
            learning_objectives: missionData.learning_objectives,
            sensei_tips: missionData.sensei_tips,
            estimated_time: missionData.estimated_time,
            reward_xp: missionData.reward_xp || 50,
            recommended_resources: missionData.recommended_resources,
            status: 'active',
            metadata: { 
              config,
              is_custom: isCustomOnly ? true : false,
              generated_at: new Date().toISOString()
            }
          };
          const guestMissions = JSON.parse(localStorage.getItem('guest_sensei_missions') || '[]');
          guestMissions.push(savedMission);
          localStorage.setItem('guest_sensei_missions', JSON.stringify(guestMissions));
        } else {
          const { data: sM, error: saveError } = await supabase
            .from('sensei_missions')
            .insert({
              student_id: userId,
              planet_id: planetId,
              title: missionData.title,
              description: missionData.description,
              objective: missionData.objective,
              learning_objectives: missionData.learning_objectives,
              sensei_tips: missionData.sensei_tips,
              estimated_time: missionData.estimated_time,
              reward_xp: missionData.reward_xp || 50,
              recommended_resources: missionData.recommended_resources,
              status: 'active',
              metadata: { 
                config,
                is_custom: isCustomOnly ? true : false,
                generated_at: new Date().toISOString()
              }
            })
            .select()
            .single();

          if (saveError) throw saveError;
          savedMission = sM;
        }
        updateMission(savedMission);
        setShowConfig(false);
      } else {
        throw new Error(data.error || "Error al conectar con el Sensei");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setRequesting(false);
    }
  };


  const handleSubmitEvidence = async () => {
    if (!evidenceUrl && !evidenceFile) {
      alert('Por favor, pega el enlace de tu proyecto o adjunta un archivo antes de validar.');
      return;
    }
    setIsSubmitting(true);
    try {
      let uploadedFileUrl = null;

      if (userId === 'guest_user') {
        // Invitado: guardar en localStorage
        if (evidenceFile) uploadedFileUrl = URL.createObjectURL(evidenceFile);
        const guestMissions = JSON.parse(localStorage.getItem('guest_sensei_missions') || '[]');
        const idx = guestMissions.findIndex(m => m.id === mission.id);
        if (idx >= 0) {
          guestMissions[idx].evidence_url = evidenceUrl;
          guestMissions[idx].evidence_file_url = uploadedFileUrl;
          guestMissions[idx].status = 'En revisión';
        }
        localStorage.setItem('guest_sensei_missions', JSON.stringify(guestMissions));
      } else {
        // Usuario registrado: subir archivo si hay
        if (evidenceFile) {
          const fileExt = evidenceFile.name.split('.').pop();
          const filePath = `evidences/${userId}/sensei_${mission.id}_${Date.now()}.${fileExt}`;
          const { error: storageError } = await supabase.storage
            .from('dojoflow-assets')
            .upload(filePath, evidenceFile);
          if (storageError) throw storageError;
          const { data: { publicUrl } } = supabase.storage
            .from('dojoflow-assets')
            .getPublicUrl(filePath);
          uploadedFileUrl = publicUrl;
        }
        // Guardar evidencia en sensei_missions
        await supabase
          .from('sensei_missions')
          .update({
            evidence_url: evidenceUrl || null,
            evidence_file_url: uploadedFileUrl || null,
            status: 'En revisión',
            updated_at: new Date().toISOString()
          })
          .eq('id', mission.id);
      }

      // Limpiar form y lanzar validación socrática
      setShowEvidenceForm(false);
      setEvidenceUrl('');
      setEvidenceFile(null);
      if (onValidateMission) onValidateMission(mission);
    } catch (err) {
      console.error('Error enviando evidencia:', err);
      alert('Error al enviar la evidencia. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlanetIcon = () => {
    switch(planetId) {
      case 'scratch': return <Gamepad2 size={24} />;
      case 'arduino': return <Cpu size={24} />;
      case 'tinkercad': return <Box size={24} />;
      case 'python': return <Code2 size={24} />;
      default: return <Palette size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" size={40} color={accentColor} />
      </div>
    );
  }

  return (
    <div className="sensei-mission-container" style={{ '--accent': accentColor, '--accent-rgb': accentRgb }}>
      {/* --- DASHBOARD HEADER --- */}
      <div className="dashboard-stats glass">
        <div className="stat-item">
          <Trophy className="stat-icon" size={20} />
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completadas</span>
          </div>
        </div>
        <div className="stat-item">
          <Zap className="stat-icon" size={20} />
          <div className="stat-info">
            <span className="stat-value">{stats.xp}</span>
            <span className="stat-label">Total XP</span>
          </div>
        </div>
        <div className="stat-item">
          <Star className="stat-icon" size={20} />
          <div className="stat-info">
            <span className="stat-value">{stats.streak}d</span>
            <span className="stat-label">Racha</span>
          </div>
        </div>
        <div className="medals-display">
          {stats.medals.map(m => (
            <div key={m} className="medal-tag" title={m}>
              <Award size={14} />
            </div>
          ))}
        </div>
      </div>

      {!mission ? (
        <div className="welcome-section">
          {showConfig ? (
            <div className="config-card glass animate-fade-in">
              <div className="config-header">
                <Settings size={20} />
                <h3>{isCustomOnly ? 'Diseña tu Propia Misión' : 'Personaliza tu Desafío'}</h3>
                <button className="close-btn" onClick={() => setShowConfig(false)}>×</button>
              </div>
              
              <div className="config-body">
                {isCustomOnly ? (
                  <div className="input-group">
                    <label>¿Qué proyecto o juego te gustaría programar?</label>
                    <textarea 
                      rows={3}
                      placeholder="Ej: Un juego de plataformas de Mario Bros con saltos, monedas y enemigos..."
                      value={config.customIdea}
                      onChange={(e) => setConfig({...config, customIdea: e.target.value})}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(0, 0, 0, 0.3)', color: 'white', outline: 'none',
                        transition: 'border-color 0.3s', fontFamily: 'inherit', resize: 'vertical'
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="input-group">
                      <label>Nivel de Maestría</label>
                      <div className="toggle-group">
                        {['Principiante', 'Intermedio', 'Ninja'].map(l => (
                          <button 
                            key={l}
                            className={config.level === l ? 'active' : ''}
                            onClick={() => setConfig({...config, level: l})}
                          >{l}</button>
                        ))}
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Tipo de Reto</label>
                      <select 
                        value={config.type} 
                        onChange={(e) => setConfig({...config, type: e.target.value})}
                      >
                        <option>Creativo</option>
                        <option>Técnico</option>
                        <option>Rápido (10 min)</option>
                        <option>Proyecto Largo</option>
                        <option>Cooperativo</option>
                        <option>Aleatorio</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Tema Opcional (ej: Espacio, Robots...)</label>
                      <input 
                        type="text" 
                        placeholder="Escribe un tema..."
                        value={config.theme}
                        onChange={(e) => setConfig({...config, theme: e.target.value})}
                      />
                    </div>
                  </>
                )}

                <GlowButton 
                  onClick={generateNewMission}
                  disabled={requesting || (isCustomOnly && !config.customIdea?.trim())}
                  variant="primary"
                  className="w-full mt-4"
                >
                  {requesting ? (
                    <><Loader2 size={20} className="animate-spin mr-2" /> {isCustomOnly ? 'Estructurando Misión...' : 'Canalizando Energía...'}</>
                  ) : (
                    <><Sparkles size={20} className="mr-2" /> {isCustomOnly ? 'CREAR MI MISIÓN PERSONALIZADA ✨' : 'GENERAR MISIÓN ✨'}</>
                  )}
                </GlowButton>
              </div>
            </div>
          ) : (
            <div className="hero-card glass animate-float">
              <div className="hero-icon-container">
                <div className="pulse-ring"></div>
                <Brain size={48} className="hero-icon" />
              </div>
              <h1 className="hero-title">{isCustomOnly ? 'Diseña tu Propia Misión' : 'Misiones del Sensei'}</h1>
              <p className="hero-subtitle">
                {isCustomOnly 
                  ? 'Cuéntale al Sensei qué quieres programar y él te ayudará para conseguir tu objetivo' 
                  : 'Desafíos inteligentes para aprender creando'}
              </p>
              
              <GlowButton 
                onClick={() => setShowConfig(true)}
                variant="primary"
                style={{ padding: '16px 48px', fontSize: '1.2rem', marginBottom: pendingMissions.length > 0 ? '24px' : '0' }}
              >
                {isCustomOnly ? '🎨 DISEÑAR NUEVA MISIÓN' : '✨ INICIAR NUEVA AVENTURA'}
              </GlowButton>

              {pendingMissions.length > 0 && (
                <div style={{ marginTop: '20px', width: '100%', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#0dcfcf', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                    <Layers size={18} /> Misiones Abiertas ({pendingMissions.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                    {pendingMissions.map(pm => (
                      <div key={pm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 18px', borderRadius: '14px' }}>
                        <div>
                          <span style={{ fontSize: '1rem', fontWeight: '800', color: 'white', display: 'block', marginBottom: '4px' }}>{pm.title}</span>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                            {pm.metadata?.is_custom ? 'Proyecto Propio' : `Nivel ${pm.metadata?.config?.level || 'Ninja'}`}
                          </span>
                        </div>
                        <GlowButton variant="secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => updateMission(pm)}>
                          RETOMAR
                        </GlowButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* --- ACTIVE MISSION CARD --- */
        <div className="mission-active-card glass animate-fade-in">
          <div className="mission-header">
            <div className="header-left">
              <div className="planet-badge" style={{ background: accentColor }}>
                {getPlanetIcon()}
              </div>
              <div className="title-group">
                <span className="badge">
                  {mission.metadata?.is_custom ? 'PROYECTO PROPIO - ' : 'MISIÓN DE NIVEL '}
                  {(mission.metadata?.config?.level || 'NINJA').toUpperCase()}
                </span>
                <h2>{mission.title}</h2>
              </div>
            </div>
            <div className="header-right flex flex-col items-end gap-3">
              <div className="xp-badge">+{mission.reward_xp || 50} XP</div>
              <GlowButton 
                onClick={() => {
                  updateMission(null);
                  setShowConfig(false);
                }}
                variant="secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Layers size={16} className="mr-2" /> {pendingMissions.length > 1 ? 'CAMBIAR DE MISIÓN' : 'MISIONES ABIERTAS'}
              </GlowButton>
            </div>
          </div>

          <div className="mission-grid">
            <div className="mission-content">
              <div className="narrative-box" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                <p>{mission.description}</p>
              </div>

              <div className="section-block">
                <div className="section-title">
                  <Target size={18} />
                  <span>OBJETIVO MAESTRO</span>
                </div>
                <div className="objective-card" style={{ whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {mission.objective}
                </div>
              </div>

              {mission.learning_objectives && (
                <div className="section-block">
                  <div className="section-title">
                    <Layers size={18} />
                    <span>CONOCIMIENTOS A DESBLOQUEAR</span>
                  </div>
                  <ul className="learning-list">
                    {mission.learning_objectives.map((obj, i) => (
                      <li key={i}><CheckCircle2 size={14} /> {obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="hints-section mt-8">
                <div className="section-title mb-4">
                  <HelpCircle size={18} />
                  <span>AYUDA DEL SENSEI</span>
                </div>
                <SocraticTutor 
                  planetId={planetId}
                  userId={userId}
                  studentLevel={studentLevel}
                  accentColor={accentColor}
                />
              </div>

              {/* ── DIARIO DEL DOJO ── */}
              <div className="hints-section mt-8" style={{ marginBottom: 0 }}>
                <button
                  onClick={() => setShowJournal(!showJournal)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px',
                    padding: '14px 18px', cursor: 'pointer', color: 'white',
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: showJournal ? '12px' : 0,
                    transition: 'background 0.2s'
                  }}
                >
                  <BookOpen size={18} style={{ color: '#0dcfcf' }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>📓 Diario del Dojo</span>
                  {journalSavedAt && (
                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: '400', textTransform: 'none' }}>
                      💾 Guardado · {journalSavedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {showJournal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showJournal && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Notas del alumno */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0dcfcf', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'block' }}>
                        ✏️ Mis notas y avances
                      </label>
                      <textarea
                        value={journal}
                        onChange={e => setJournal(e.target.value)}
                        placeholder="Escribe aquí lo que llevas hecho, tus dudas, lo que funciona... El Sensei y tu profe podrán verlo para ayudarte mejor."
                        rows={5}
                        style={{
                          width: '100%', background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                          padding: '14px', color: '#e2e8f0', fontSize: '0.88rem',
                          fontFamily: 'Outfit, sans-serif', lineHeight: '1.6', resize: 'vertical',
                          outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Historial de sesiones */}
                    {sessionLog.length > 0 && (
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0dcfcf', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'block' }}>
                          <Clock size={13} style={{ display: 'inline', marginRight: '6px' }} />
                          Historial de sesiones ({sessionLog.length})
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {sessionLog.slice().reverse().map((s, i) => (
                            <div key={s.id || i} style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                              padding: '8px 14px', fontSize: '0.8rem', color: '#94a3b8'
                            }}>
                              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: i === 0 ? '#0dcfcf' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: i === 0 ? '#0d1117' : '#94a3b8', flexShrink: 0 }}>
                                {sessionLog.length - i}
                              </span>
                              <span>Sesión {sessionLog.length - i}</span>
                              <span style={{ marginLeft: 'auto', color: '#64748b' }}>{s.date} · {s.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="action-footer mt-8">
                  <div className="evidence-form">
                    <div className="evidence-form-header">
                      <div className="evidence-form-title">
                        <Upload size={18} />
                        <span>Adjunta tu evidencia</span>
                      </div>
                    </div>

                    <div className="evidence-field">
                      <label><Link2 size={14} /> URL del proyecto (Scratch, Tinkercad, etc.)</label>
                      <input
                        type="url"
                        placeholder="https://scratch.mit.edu/projects/..."
                        value={evidenceUrl}
                        onChange={e => setEvidenceUrl(e.target.value)}
                        className="evidence-input"
                      />
                    </div>

                    <div className="evidence-divider"><span>o</span></div>

                    <div className="evidence-field">
                      <label><Paperclip size={14} /> Archivo (proyecto .sb3, .aia, captura, vídeo, PDF, zip...)</label>
                      <label className="evidence-file-label">
                        {evidenceFile ? (
                          <span className="evidence-file-name">
                            <Paperclip size={14} /> {evidenceFile.name}
                            <button onClick={e => { e.preventDefault(); setEvidenceFile(null); }}><XIcon size={12} /></button>
                          </span>
                        ) : (
                          <span><Upload size={14} /> Seleccionar archivo</span>
                        )}
                        <input
                          type="file"
                          accept="image/*,video/*,.pdf,.zip,.sb3,.aia,.py,.ino,.hex,.json"
                          style={{ display: 'none' }}
                          onChange={e => setEvidenceFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>

                    <GlowButton
                      onClick={handleSubmitEvidence}
                      disabled={isSubmitting || (!evidenceUrl && !evidenceFile)}
                      variant="primary"
                      className="w-full mt-4"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={18} className="animate-spin mr-2" /> Enviando...</>
                      ) : (
                        <><Send size={18} className="mr-2" /> CONFIRMAR Y VALIDAR CON EL SENSEI</>
                      )}
                    </GlowButton>
                  </div>
              </div>
            </div>

            <div className="mission-sidebar">
              <div className="sidebar-widget">
                <div className="widget-icon"><Timer size={24} /></div>
                <span className="widget-label">TIEMPO ESTIMADO</span>
                <span className="widget-value">{mission.estimated_time || '20 min'}</span>
              </div>

              <div className="sidebar-widget">
                <div className="widget-icon"><Brain size={24} /></div>
                <span className="widget-label">ITINERARIO</span>
                <span className="widget-value">{planetId.toUpperCase()}</span>
              </div>

              {mission.recommended_resources && mission.recommended_resources.length > 0 && (
                <div className="resources-widget">
                  <h4><Layers size={16} /> RECURSOS</h4>
                  <div className="resource-links">
                    {mission.recommended_resources.map((res, i) => (
                      <div key={i} className="res-item">{res}</div>
                    ))}
                  </div>
                </div>
              )}

              <button className="regenerate-btn" onClick={() => abandonMission(mission)}>
                <RefreshCw size={14} /> ABANDONAR MISIÓN
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sensei-mission-container {
          max-width: 1200px;
          margin: 0 auto 60px;
          font-family: 'Outfit', sans-serif;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        /* --- GLASS DESIGN --- */
        .glass {
          background: rgba(13, 17, 30, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 
                      inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }

        /* --- STATS DASHBOARD --- */
        .dashboard-stats {
          display: flex;
          gap: 24px;
          padding: 20px 32px;
          margin-bottom: 30px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          background: rgba(13, 17, 30, 0.9);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-right: 24px;
          border-right: 1px solid rgba(255,255,255,0.1);
        }

        .stat-icon { color: var(--accent); filter: drop-shadow(0 0 8px var(--accent)); }
        .stat-value { display: block; font-size: 1.3rem; fontWeight: 900; color: white; line-height: 1; }
        .stat-label { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; }

        .medals-display { display: flex; gap: 8px; }
        .medal-tag { 
          width: 32px; height: 32px; border-radius: 50%; 
          background: rgba(var(--accent-rgb), 0.1); display: flex; 
          align-items: center; justify-content: center; color: #ffd700;
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
        }

        /* --- HERO SECTION --- */
        .welcome-section { text-align: center; padding: 10px 0; height: 100%; display: flex; flex-direction: column; }
        .hero-card { 
          padding: 50px 30px; 
          width: 100%;
          max-width: 800px; 
          margin: 0 auto; 
          position: relative; 
          overflow: hidden;
          background: radial-gradient(circle at center, rgba(var(--accent-rgb), 0.15) 0%, rgba(30, 41, 74, 0.95) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          min-height: 440px;
          box-sizing: border-box;
          border-radius: 32px;
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          flex: 1;
        }
        .hero-title { 
          font-size: 2.2rem; 
          font-weight: 900; 
          color: white; 
          margin-top: 10px;
          margin-bottom: 8px; 
          letter-spacing: -0.5px;
          text-shadow: 0 0 20px rgba(var(--accent-rgb), 0.5);
          text-align: center;
        }
        .hero-subtitle { 
          font-size: 0.95rem; 
          color: rgba(255,255,255,0.75); 
          margin-bottom: 24px;
          font-weight: 400;
          text-align: center;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1.5;
        }
        
        .hero-icon-container { position: relative; width: 140px; height: 140px; margin: 0 auto 35px; }
        .hero-icon { color: white; filter: drop-shadow(0 0 15px var(--accent)); position: relative; z-index: 2; }
        .pulse-ring {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: var(--accent); border-radius: 50%; opacity: 0.2;
          animation: pulse 4s infinite;
        }

        /* --- CONFIG CARD --- */
        .config-card { 
          max-width: 500px; 
          margin: 0 auto; 
          padding: 35px; 
          text-align: left;
          background: rgba(13, 17, 30, 0.95);
          border: 1px solid rgba(var(--accent-rgb), 0.3);
        }
        .config-header { display: flex; alignItems: center; gap: 12px; margin-bottom: 28px; color: white; }
        .config-header h3 { font-size: 1.4rem; font-weight: 900; margin: 0; background: linear-gradient(to right, #fff, var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .close-btn { margin-left: auto; background: none; border: none; color: white; font-size: 1.8rem; cursor: pointer; opacity: 0.6; transition: 0.2s; }
        .close-btn:hover { opacity: 1; transform: rotate(90deg); }
        
        .input-group { margin-bottom: 24px; }
        .input-group label { display: block; font-size: 0.75rem; color: var(--accent); text-transform: uppercase; margin-bottom: 10px; font-weight: 800; letter-spacing: 1px; }
        .toggle-group { display: flex; gap: 10px; }
        .toggle-group button { 
          flex: 1; padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6); cursor: pointer; font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toggle-group button:hover { background: rgba(255,255,255,0.08); }
        .toggle-group button.active { 
          background: var(--accent); 
          color: white; 
          border-color: var(--accent);
          box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.4);
          transform: translateY(-2px);
        }
        
        select, input {
          width: 100%; padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0, 0, 0, 0.3); color: white; outline: none;
          transition: border-color 0.3s;
        }
        select:focus, input:focus { border-color: var(--accent); }

        /* --- MISSION CARD --- */
        .mission-active-card { 
          padding: 45px; 
          text-align: left;
          background: linear-gradient(135deg, rgba(30, 41, 74, 0.95) 0%, rgba(20, 25, 46, 0.98) 100%);
        }
        .mission-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 45px; }
        .header-left { display: flex; gap: 28px; align-items: center; }
        .planet-badge { 
          width: 72px; height: 72px; border-radius: 24px; display: flex; 
          align-items: center; justify-content: center; color: white;
          box-shadow: 0 15px 30px -10px var(--accent);
          background: linear-gradient(135deg, var(--accent) 0%, rgba(var(--accent-rgb), 0.6) 100%);
        }
        .title-group h2 { font-size: 2.2rem; font-weight: 900; color: white; margin: 0; letter-spacing: -0.5px; line-height: 1.1; }
        .badge { font-size: 0.75rem; font-weight: 900; color: var(--accent); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; display: block; }
        .xp-badge { 
          background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3);
          padding: 10px 20px; borderRadius: 14px; color: #ffd700; font-weight: 900;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
        }

        .mission-grid { display: grid; grid-template-columns: 1fr 300px; gap: 45px; }
        .narrative-box { 
          background: rgba(var(--accent-rgb), 0.05); 
          padding: 28px; 
          border-radius: 24px; 
          margin-bottom: 35px; 
          border-left: 5px solid var(--accent);
          box-shadow: inset 0 0 30px rgba(var(--accent-rgb), 0.02);
        }
        .narrative-box p { color: rgba(255,255,255,0.85); margin: 0; line-height: 1.7; font-style: italic; font-size: 1.05rem; }

        .section-block { margin-bottom: 35px; }
        .section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; color: var(--accent); }
        .section-title span { font-size: 0.8rem; font-weight: 900; letter-spacing: 1.5px; text-shadow: 0 0 10px rgba(var(--accent-rgb), 0.3); }
        .objective-card { 
          background: rgba(255,255,255,0.03); padding: 28px; border-radius: 24px; 
          border: 1px solid rgba(255,255,255,0.06); color: white; font-size: 1.3rem; font-weight: 700;
          line-height: 1.4;
        }

        .learning-list { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .learning-list li { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.65); font-size: 0.9rem; }
        .learning-list li :global(svg) { color: var(--accent); filter: drop-shadow(0 0 3px var(--accent)); }

        .hints-container { margin-top: 20px; }
        .hint-bubble { padding: 24px; border-radius: 24px; margin-bottom: 18px; border: 1px solid transparent; transition: all 0.3s; }
        .hint-bubble.sensei { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
        .hint-bubble.socratic { 
          background: rgba(var(--accent-rgb), 0.08); 
          border-color: rgba(var(--accent-rgb), 0.2);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .hint-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 0.7rem; font-weight: 900; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; }
        .hint-bubble p { margin: 0; color: white; font-size: 0.95rem; line-height: 1.6; }

        .action-footer { display: flex; gap: 24px; margin-top: 45px; }

        /* --- SIDEBAR --- */
        .sidebar-widget { 
          background: rgba(255,255,255,0.04); padding: 24px; border-radius: 28px; 
          text-align: center; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.08);
          transition: transform 0.3s;
        }
        .sidebar-widget:hover { transform: translateY(-5px); background: rgba(255,255,255,0.06); }
        .widget-icon { color: var(--accent); margin-bottom: 12px; display: flex; justify-content: center; filter: drop-shadow(0 0 5px var(--accent)); }
        .widget-label { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-bottom: 6px; font-weight: 800; letter-spacing: 1px; }
        .widget-value { font-size: 1.2rem; color: white; font-weight: 900; }

        .resources-widget { background: rgba(0,0,0,0.4); padding: 24px; border-radius: 28px; margin-top: 25px; border: 1px solid rgba(255,255,255,0.05); }
        .resources-widget h4 { font-size: 0.75rem; color: var(--accent); margin: 0 0 18px 0; font-weight: 900; display: flex; align-items: center; gap: 10px; letter-spacing: 1px; }
        .resource-links { display: flex; flex-direction: column; gap: 10px; }
        .res-item { font-size: 0.8rem; color: rgba(255,255,255,0.7); padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }

        .regenerate-btn { 
          width: 100%; margin-top: 35px; background: none; border: none; 
          color: rgba(255,255,255,0.4); font-size: 0.75rem; cursor: pointer; 
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: 0.3s; font-weight: 600;
        }
        .regenerate-btn:hover { color: #ff4757; }

        .ask-another-btn {
          background: rgba(var(--accent-rgb), 0.1);
          border: 1px solid rgba(var(--accent-rgb), 0.3);
          color: var(--accent);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ask-another-btn:hover {
          background: var(--accent);
          color: white;
          box-shadow: 0 0 15px rgba(var(--accent-rgb), 0.4);
          transform: translateY(-2px);
        }

        /* --- ANIMATIONS --- */
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(var(--accent-rgb), 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-float { animation: float 6s infinite ease-in-out; }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-20px); } 
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        @media (max-width: 900px) {
          .mission-grid { grid-template-columns: 1fr; gap: 24px; }
          .mission-sidebar { order: -1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .resources-widget { grid-column: span 2; }
          .regenerate-btn { grid-column: span 2; }
          .mission-active-card { padding: 24px 18px; }
          .mission-header { flex-direction: column; gap: 16px; margin-bottom: 28px; }
          .header-right { flex-direction: row !important; align-items: center !important; width: 100%; justify-content: space-between; }
          .header-left { gap: 16px; }
          .planet-badge { width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0; }
          .title-group h2 { font-size: 1.4rem; }
          .narrative-box { padding: 18px; }
          .objective-card { font-size: 1rem; padding: 18px; }
          .learning-list { grid-template-columns: 1fr; }
          .action-footer { flex-direction: column; gap: 12px; margin-top: 28px; }
          .sidebar-widget { padding: 16px; }
          .dashboard-stats { flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
          .stat-item { padding-right: 12px; }
          .hero-card { padding: 40px 20px; }
          .hero-title { font-size: 2.2rem; }
          .toggle-group { flex-direction: column; }
        }

        /* --- EVIDENCE FORM --- */
        .evidence-form {
          background: rgba(var(--accent-rgb), 0.06);
          border: 1px solid rgba(var(--accent-rgb), 0.25);
          border-radius: 24px;
          padding: 24px;
          animation: fadeIn 0.3s ease-out;
          width: 100%;
        }
        .evidence-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .evidence-form-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--accent);
          font-size: 0.85rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .evidence-close-btn {
          background: rgba(255,255,255,0.06);
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .evidence-close-btn:hover { background: rgba(255,60,60,0.15); color: #ff4757; }
        .evidence-field { margin-bottom: 14px; }
        .evidence-field label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .evidence-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.3);
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }
        .evidence-input:focus { border-color: var(--accent); }
        .evidence-file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border-radius: 14px;
          border: 1px dashed rgba(var(--accent-rgb), 0.4);
          background: rgba(var(--accent-rgb), 0.04);
          color: rgba(255,255,255,0.6);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .evidence-file-label:hover { border-color: var(--accent); color: var(--accent); background: rgba(var(--accent-rgb), 0.08); }
        .evidence-file-name {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent);
          font-size: 0.8rem;
          font-weight: 700;
        }
        .evidence-file-name button {
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }
        .evidence-divider {
          text-align: center;
          margin: 12px 0;
          position: relative;
        }
        .evidence-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .evidence-divider span {
          position: relative;
          background: rgba(20, 25, 46, 0.95);
          padding: 0 12px;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }

        @media (max-width: 600px) {
          .sensei-mission-container { margin-bottom: 40px; padding: 0 10px; }
          .dashboard-stats { flex-wrap: wrap; justify-content: space-between; gap: 12px; padding: 14px; border-radius: 20px; }
          .stat-item { padding-right: 0; border-right: none; gap: 8px; width: 45%; }
          .stat-value { font-size: 1.1rem; }
          .stat-label { font-size: 0.65rem; }
          .medals-display { width: 100%; justify-content: center; margin-top: 8px; }
          .welcome-section { padding: 10px 0; }
          .hero-card { padding: 30px 16px; }
          .hero-title { font-size: 1.8rem; }
          .hero-subtitle { font-size: 0.95rem; margin-bottom: 24px; }
          .hero-icon-container { width: 90px; height: 90px; margin-bottom: 20px; }
          .config-card { padding: 20px 14px; margin: 0; border-radius: 20px; }
          .config-header h3 { font-size: 1.1rem; }
          .toggle-group { flex-wrap: wrap; }
          .toggle-group button { font-size: 0.8rem; padding: 10px 8px; }
          .mission-active-card { padding: 16px; border-radius: 20px; margin: 0; }
          .mission-sidebar { grid-template-columns: 1fr; gap: 12px; }
          .badge { font-size: 0.65rem; }
          .xp-badge { padding: 8px 12px; font-size: 0.8rem; }
          .evidence-form { padding: 16px; border-radius: 16px; }
          .evidence-form-title { font-size: 0.8rem; }
          .evidence-file-label { padding: 10px; font-size: 0.8rem; }
          .evidence-file-name { flex-wrap: wrap; word-break: break-word; font-size: 0.75rem; }
          .learning-list li { font-size: 0.85rem; align-items: flex-start; }
          .objective-card { font-size: 0.95rem; padding: 16px; }
          .title-group h2 { font-size: 1.25rem; }
          .planet-badge { width: 48px; height: 48px; border-radius: 14px; }
          .ask-another-btn { font-size: 0.65rem; padding: 6px 10px; }
          .section-title span { font-size: 0.7rem; }
          .hints-section { margin-top: 20px; }
        }
      `}</style>
    </div>
  );
}
