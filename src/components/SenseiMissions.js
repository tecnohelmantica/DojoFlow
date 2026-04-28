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
  Gamepad2, Cpu, Box, Code2, Palette
} from 'lucide-react';

export default function SenseiMissions({ planetId, userId, studentLevel, accentColor = '#0097e6', onValidateMission, refreshTrigger }) {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hints, setHints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
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

  // Config State
  const [config, setConfig] = useState({
    level: studentLevel || 'Intermedio',
    type: 'Creativo',
    theme: ''
  });

  useEffect(() => {
    if (userId && planetId) {
      loadData();
    }
  }, [userId, planetId, refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load active mission
      const { data: missionData } = await supabase
        .from('sensei_missions')
        .select('*')
        .eq('student_id', userId)
        .eq('planet_id', planetId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (missionData) {
        setMission(missionData);
      }

      // 2. Load stats (completed missions)
      const { data: allMissions } = await supabase
        .from('sensei_missions')
        .select('status, reward_xp')
        .eq('student_id', userId)
        .eq('planet_id', planetId);

      if (allMissions) {
        const completed = allMissions.filter(m => m.status === 'completed');
        const totalXp = completed.reduce((acc, m) => acc + (m.reward_xp || 50), 0);
        
        setStats({
          completed: completed.length,
          xp: totalXp,
          streak: Math.min(completed.length, 7), // Mocking streak for now
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
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mode: 'mission_generator',
          planet: planetId,
          level: config.level,
          missionType: config.type,
          missionTheme: config.theme
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

        const { data: savedMission, error: saveError } = await supabase
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
              generated_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (saveError) throw saveError;
        setMission(savedMission);
        setHints([]);
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

  const requestHint = async () => {
    if (loadingHint) return;
    setLoadingHint(true);
    try {
      const message = hints.length === 0 
        ? `Sensei, he empezado la misión "${mission.title}". ¿Podrías darme una pista socrática para abordar el objetivo: ${mission.objective}? No me des la solución.`
        : `Sensei, sigo con la misión. ¿Podrías darme otra pista socrática? Recuérdame los conceptos clave pero no me des el código.`;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mode: 'tutor',
          planet: planetId,
          level: config.level,
          message,
          history: hints.map(h => ({ role: 'tutor', text: h }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setHints([...hints, data.text]);
      }
    } catch (err) {
      console.error("Error fetching hint:", err);
    } finally {
      setLoadingHint(false);
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
                <h3>Personaliza tu Desafío</h3>
                <button className="close-btn" onClick={() => setShowConfig(false)}>×</button>
              </div>
              
              <div className="config-body">
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

                <GlowButton 
                  onClick={generateNewMission}
                  disabled={requesting}
                  variant="primary"
                  className="w-full mt-4"
                >
                  {requesting ? (
                    <><Loader2 size={20} className="animate-spin mr-2" /> Canalizando Energía...</>
                  ) : (
                    <><Sparkles size={20} className="mr-2" /> GENERAR MISIÓN ✨</>
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
              <h1 className="hero-title">Misiones del Sensei</h1>
              <p className="hero-subtitle">Desafíos inteligentes para aprender creando</p>
              
              <GlowButton 
                onClick={() => setShowConfig(true)}
                variant="primary"
                style={{ padding: '16px 48px', fontSize: '1.2rem' }}
              >
                ✨ INICIAR NUEVA AVENTURA
              </GlowButton>
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
                <span className="badge">MISIÓN DE NIVEL {mission.metadata?.config?.level || 'NINJA'}</span>
                <h2>{mission.title}</h2>
              </div>
            </div>
            <div className="header-right">
              <div className="xp-badge">+{mission.reward_xp || 50} XP</div>
            </div>
          </div>

          <div className="mission-grid">
            <div className="mission-content">
              <div className="narrative-box">
                <p>{mission.description}</p>
              </div>

              <div className="section-block">
                <div className="section-title">
                  <Target size={18} />
                  <span>OBJETIVO MAESTRO</span>
                </div>
                <div className="objective-card">
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

              <div className="hints-container">
                {mission.sensei_tips && (
                  <div className="hint-bubble sensei">
                    <div className="hint-header">
                      <Sparkles size={14} /> 
                      <span>SABIDURÍA INICIAL</span>
                    </div>
                    <p>{mission.sensei_tips}</p>
                  </div>
                )}
                
                {hints.map((hint, i) => (
                  <div key={i} className="hint-bubble socratic animate-slide-up">
                    <div className="hint-header">
                      <HelpCircle size={14} /> 
                      <span>GUÍA DEL SENSEI #{i+1}</span>
                    </div>
                    <p>{hint}</p>
                  </div>
                ))}
              </div>

              <div className="action-footer">
                <GlowButton 
                  onClick={requestHint}
                  disabled={loadingHint}
                  variant="secondary"
                  className="flex-1"
                >
                  {loadingHint ? <Loader2 size={18} className="animate-spin" /> : <><HelpCircle size={18} className="mr-2" /> PEDIR PISTA</>}
                </GlowButton>
                <GlowButton 
                  onClick={() => onValidateMission?.(mission)}
                  variant="primary"
                  className="flex-1"
                >
                  <Send size={18} className="mr-2" /> ENVIAR SOLUCIÓN
                </GlowButton>
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

              <button className="regenerate-btn" onClick={() => {
                if(confirm("¿Seguro que quieres abandonar esta misión y generar otra?")) {
                  setMission(null);
                  setShowConfig(true);
                }
              }}>
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
        .welcome-section { text-align: center; padding: 40px 0; }
        .hero-card { 
          padding: 80px 40px; 
          max-width: 800px; 
          margin: 0 auto; 
          position: relative; 
          overflow: hidden;
          background: radial-gradient(circle at center, rgba(var(--accent-rgb), 0.15) 0%, rgba(13, 17, 30, 0.9) 100%);
        }
        .hero-title { 
          font-size: 3.5rem; 
          font-weight: 900; 
          color: white; 
          margin-bottom: 12px; 
          letter-spacing: -1px;
          text-shadow: 0 0 20px rgba(var(--accent-rgb), 0.5);
        }
        .hero-subtitle { 
          font-size: 1.3rem; 
          color: rgba(255,255,255,0.7); 
          margin-bottom: 45px;
          font-weight: 300;
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
          background: linear-gradient(135deg, rgba(13, 17, 30, 0.9) 0%, rgba(10, 10, 20, 1) 100%);
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
          .mission-grid { grid-template-columns: 1fr; }
          .mission-sidebar { order: -1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .resources-widget { grid-column: span 2; }
          .regenerate-btn { grid-column: span 2; }
        }
      `}</style>
    </div>
  );
}
