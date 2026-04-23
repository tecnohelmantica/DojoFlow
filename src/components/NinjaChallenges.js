import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { supabase } from '../lib/supabaseClient';
import { 
  Medal, Clock, CheckCircle2, Zap, 
  ArrowRight, BookOpen, Loader2, Sparkles, AlertTriangle 
} from 'lucide-react';

import { SCRATCH_TUTORIALS, MICROBIT_TUTORIALS, ARCADE_TUTORIALS, TINKERCAD_TUTORIALS } from '../lib/tutorials';
import { ROBOTIX_CHALLENGES } from '../lib/robotix';
import { MICROBIT_CHALLENGES } from '../lib/microbit';
import { ARCADE_CHALLENGES } from '../lib/arcade';
import { TINKERCAD_CHALLENGES } from '../lib/tinkercad';
import { getPlanetById } from '../lib/planets';

export default function NinjaChallenges({ planetId, userId, accentColor = '#0dcfcf', targetLevel = 'Junior' }) {
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [microbitLevel, setMicrobitLevel] = useState('beginner');

  useEffect(() => {
    if (planetId && userId) {
      loadData();
    }
  }, [planetId, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: progressData } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('student_id', userId)
        .eq('planet_id', planetId);

      const progressMap = {};
      progressData?.forEach(p => {
        progressMap[p.challenge_id] = p;
      });
      setUserProgress(progressMap);

      if (planetId?.toLowerCase() === 'scratch') {
        setChallenges(ROBOTIX_CHALLENGES);
      } else if (planetId?.toLowerCase() === 'tinkercad') {
        setChallenges(TINKERCAD_CHALLENGES);
      } else if (planetId?.toLowerCase().includes('microbit')) {
        setChallenges(MICROBIT_CHALLENGES[microbitLevel] || []);
      } else if (planetId?.toLowerCase() === 'makecode-arcade') {
        setChallenges(ARCADE_CHALLENGES);
      } else {
        // Load API challenges for other planets
        try {
          const response = await fetch('/api/notebooklm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planetId, promptData: { action: 'retos' } })
          });
          const data = await response.json();
          if (data.success && data.result) {
            const jsonMatch = data.result.match(/```json\n([\s\S]*?)\n```/) || data.result.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
              setChallenges(Array.isArray(parsed) ? parsed : [parsed]);
            } else throw new Error();
          } else throw new Error();
        } catch {
          if (planetId?.toLowerCase().includes('microbit')) {
            // Microbit specific initial setup if API fails
            setChallenges(getFallbackChallenges(planetId));
          } else {
            setChallenges(getFallbackChallenges(planetId));
          }
        }
      }
    } catch (err) {
      setChallenges(getFallbackChallenges(planetId));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (challenge, type = 'challenge') => {
    const idSuffix = type === 'tutorial' ? `tutorial-${challenge.id}` : `reto-${challenge.numero}`;
    const challengeId = `${planetId}-${idSuffix}`;
    const currentStatus = userProgress[challengeId]?.status || 'No iniciado';

    if (currentStatus === 'Validado') return;
    if (!evidenceUrl && type !== 'open_only') {
      // If it's just opening the tutorial, we don't need evidence yet
      if (planetId === 'scratch' || planetId?.includes('microbit') || planetId === 'makecode-arcade' || planetId === 'tinkercad') {
        const url = type === 'tutorial' 
          ? (planetId?.toLowerCase().includes('microbit') 
              ? `https://makecode.microbit.org/#tutorial:${challenge.slug || challenge.id}`
              : (planetId === 'makecode-arcade'
                  ? `https://arcade.makecode.com/#tutorial:${challenge.slug}`
                  : (planetId === 'tinkercad'
                      ? `https://www.tinkercad.com/learn/${challenge.slug}`
                      : `https://scratch.mit.edu/projects/editor/?tutorial=${challenge.slug || 'all'}`)))
          : (planetId === 'scratch'
              ? `https://scratch.mit.edu/projects/${challenge.id}/editor`
              : (planetId?.toLowerCase().includes('microbit')
                  ? `https://microbit.org/es-es/projects/make-it-code-it/${challenge.id}/`
                  : (planetId === 'tinkercad'
                      ? 'https://www.tinkercad.com/dashboard'
                      : `https://arcade.makecode.com/`)));
        window.open(url, '_blank');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: upsertError } = await supabase
        .from('user_challenges')
        .upsert({
          student_id: userId,
          planet_id: planetId,
          challenge_id: challengeId,
          status: 'En revisión',
          evidence_url: evidenceUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'student_id, challenge_id' });

      if (upsertError) throw upsertError;

      setUserProgress(prev => ({
        ...prev,
        [challengeId]: { ...prev[challengeId], status: 'En revisión', evidence_url: evidenceUrl }
      }));
      
      setEvidenceUrl('');
      alert("¡Evidencia enviada con éxito! Tu profesor la revisará pronto.");
    } catch (err) {
      alert("No se pudo entregar la evidencia. Comprueba tu conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusIcon = (status, size = 18) => {
    switch (status) {
      case 'Validado': return <CheckCircle2 size={size} color={accentColor} />;
      case 'En revisión': return <Clock size={size} color="#ff9800" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Loader2 className="animate-spin" size={32} color={accentColor} style={{ margin: '0 auto 10px' }} />
        <p style={{ fontSize: '0.8rem', color: '#888' }}>Sincronizando con el Orquestador...</p>
      </div>
    );
  }
  
  const tutorialsList = planetId?.toLowerCase() === 'makecode-arcade' ? ARCADE_TUTORIALS : 
                        (planetId?.toLowerCase() === 'tinkercad' ? TINKERCAD_TUTORIALS : 
                        (planetId?.toLowerCase().includes('microbit') ? MICROBIT_TUTORIALS : SCRATCH_TUTORIALS));
  const tutorialsCompleted = tutorialsList.filter(t => userProgress[`${planetId}-tutorial-${t.id}`]?.status === 'Validado').length;
  
  // Calculate completion by difficulty for Microbit
  const microbitProgress = planetId?.toLowerCase().includes('microbit') ? {
    beginner: MICROBIT_CHALLENGES.beginner.filter(c => userProgress[`${planetId}-reto-${c.numero}`]?.status === 'Validado').length,
    intermediate: MICROBIT_CHALLENGES.intermediate.filter(c => userProgress[`${planetId}-reto-${c.numero}`]?.status === 'Validado').length,
    advanced: MICROBIT_CHALLENGES.advanced.filter(c => userProgress[`${planetId}-reto-${c.numero}`]?.status === 'Validado').length
  } : null;

  const challengesCompleted = challenges.filter(c => userProgress[`${planetId}-reto-${c.numero || c.id}`]?.status === 'Validado').length;
  const milestones = Math.floor(challengesCompleted / 10);
  const isAdvanced = targetLevel && targetLevel.toLowerCase() !== 'novato' && targetLevel.toLowerCase() !== 'junior';
  
  const hasLevelBadge = planetId === 'scratch' ? (tutorialsCompleted === 27) : 
                        (planetId === 'makecode-arcade' ? (challengesCompleted > 0) : 
                        (planetId === 'tinkercad' ? (challengesCompleted > 0) : (microbitProgress && microbitProgress.beginner > 0)));
  const arcadeRank = planetId === 'makecode-arcade' ? (
    challengesCompleted >= 16 ? { label: 'GAME MASTER', color: '#6c5ce7', icon: '👑' } :
    challengesCompleted >= 12 ? { label: 'LEAD DESIGNER', color: '#e84118', icon: '🏆' } :
    challengesCompleted >= 8 ? { label: 'GAME ARCHITECT', color: '#0097e6', icon: '⚔️' } :
    challengesCompleted >= 4 ? { label: 'CODER', color: '#4cd137', icon: '🌱' } :
    { label: 'AMATEUR', color: '#636e72', icon: '🎮' }
  ) : null;

  const microbitRank = microbitProgress ? (
    microbitProgress.advanced > 0 ? { label: 'AVANZADO', color: '#e84118', icon: '🏆' } :
    microbitProgress.intermediate > 0 ? { label: 'INTERMEDIO', color: '#0097e6', icon: '⚔️' } :
    microbitProgress.beginner > 0 ? { label: 'PRINCIPIANTE', color: '#4cd137', icon: '🌱' } :
    null
  ) : null;

  const currentRank = planetId === 'makecode-arcade' ? arcadeRank : microbitRank;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* BADGES SECTION */}
      {(planetId === 'scratch' || planetId?.includes('microbit') || planetId === 'makecode-arcade') && (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
          <div style={{ 
            minWidth: '150px', padding: '12px', borderRadius: '12px', textAlign: 'center',
            background: hasLevelBadge ? (currentRank ? currentRank.color : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)') : '#f0f0f0',
            border: hasLevelBadge ? 'none' : '1px dashed #ccc', opacity: hasLevelBadge ? 1 : 0.5,
            boxShadow: hasLevelBadge ? `0 4px 15px ${currentRank ? currentRank.color : '#FFD700'}30` : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{currentRank?.icon || <Medal size={24} color={hasLevelBadge ? 'white' : '#999'} />}</span>
            <p style={{ fontSize: '0.6rem', fontWeight: '900', margin: 0, color: hasLevelBadge ? 'white' : '#666' }}>
              NIVEL {planetId?.toUpperCase()} {currentRank ? `- ${currentRank.label}` : ''}
            </p>
          </div>

          {[...Array(8)].map((_, i) => {
            const milestoneReached = milestones > i || (isAdvanced && i === 0);
            return (
              <div key={i} style={{ 
                minWidth: '60px', padding: '12px', borderRadius: '12px', textAlign: 'center',
                background: milestoneReached ? 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' : '#f0f0f0',
                border: milestoneReached ? 'none' : '1px dashed #ccc', opacity: milestoneReached ? 1 : 0.3
              }}>
                <Zap size={20} color={milestoneReached ? 'white' : '#999'} style={{ margin: '0 auto 5px' }} />
                <p style={{ fontSize: '0.5rem', fontWeight: '900', margin: 0, color: milestoneReached ? 'white' : '#666' }}>{ (i+1)*10 }</p>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔮 MICROBIT LEVEL SELECTORS */}
      {planetId?.toLowerCase().includes('microbit') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '10px' }}>
          {[
            { id: 'beginner', label: 'PRINCIPIANTE', color: '#4cd137', icon: '🌱' },
            { id: 'intermediate', label: 'INTERMEDIO', color: '#0097e6', icon: '⚔️' },
            { id: 'advanced', label: 'AVANZADO', color: '#e84118', icon: '🏆' }
          ].map(lvl => {
            const isSelected = microbitLevel === lvl.id;
            return (
              <div 
                key={lvl.id}
                onClick={() => {
                  setMicrobitLevel(lvl.id);
                  setChallenges(MICROBIT_CHALLENGES[lvl.id] || []);
                }}
                style={{ 
                  padding: '15px 10px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer',
                  background: isSelected ? lvl.color : `linear-gradient(135deg, white 0%, ${lvl.color}08 100%)`,
                  border: `2px solid ${isSelected ? lvl.color : lvl.color + '33'}`, 
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  boxShadow: isSelected ? `0 8px 20px ${lvl.color}40` : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{lvl.icon}</span>
                <p style={{ fontSize: '0.6rem', fontWeight: '900', color: isSelected ? 'white' : lvl.color, margin: 0 }}>{lvl.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* TABS SELECTOR */}
      {(planetId === 'scratch' || planetId?.includes('microbit') || planetId === 'makecode-arcade' || planetId === 'tinkercad') && (
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.03)', padding: '5px', borderRadius: '12px' }}>
          <button 
            onClick={() => { setActiveTab('tutorials'); setSelectedTutorial(null); }}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: '700', fontFamily: 'Outfit',
              background: activeTab === 'tutorials' ? 'white' : 'transparent',
              color: activeTab === 'tutorials' ? accentColor : '#666',
              boxShadow: activeTab === 'tutorials' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            ACADEMIA ({tutorialsCompleted}/{tutorialsList.length})
          </button>
          <button 
            onClick={() => { setActiveTab('challenges'); setSelectedTutorial(null); }}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: '700', fontFamily: 'Outfit',
              background: activeTab === 'challenges' ? 'white' : 'transparent',
              color: activeTab === 'challenges' ? accentColor : '#666',
              boxShadow: activeTab === 'challenges' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            RETOS NINJA ({challengesCompleted}/{planetId === 'scratch' ? 78 : (planetId === 'makecode-arcade' ? 16 : (planetId === 'tinkercad' ? 20 : challenges.length))})
          </button>
        </div>
      )}

      {/* MODAL POPUP */}
      {selectedTutorial && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setSelectedTutorial(null)}>
          
          <GlassCard style={{ 
            width: '100%', maxWidth: '600px', padding: '30px', 
            background: 'white', border: `1px solid rgba(255,255,255,0.2)`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)', borderRadius: '24px', 
            position: 'relative', overflowY: 'auto', maxHeight: '90vh'
          }} onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={() => setSelectedTutorial(null)}
              style={{ 
                position: 'absolute', top: '15px', right: '15px', 
                background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#333', fontWeight: 'bold', zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >✕</button>

            {(() => {
              const currentItem = selectedTutorial;
              const isTutorial = activeTab === 'tutorials';
              const progressKey = isTutorial ? `${planetId}-tutorial-${currentItem.id}` : `${planetId}-reto-${currentItem.numero}`;
              const currentProgress = userProgress[progressKey];

              return (
                <div style={{ margin: '-30px -30px 0 -30px' }}>
                  {/* HERO BANNER IMAGE (Teatro Robotix) */}
                  <div style={{ 
                    width: '100%', height: '220px', position: 'relative',
                    overflow: 'hidden', borderRadius: '24px 24px 0 0',
                    background: 'linear-gradient(135deg, #0DCFCF 0%, #0088CC 100%)'
                  }}>
                    <img 
                      src={planetId === 'scratch' ? "/robotix_scratch_stage_1776705707295.png" : 
                           (planetId === 'makecode-arcade' ? "/planets/makecode%20arcade.jpeg" : 
                           (planetId === 'tinkercad' ? "/planets/3D.jpeg" : "/planets/microbit.jpeg"))} 
                      alt="Planet Hero"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.9' }}
                    />
                    <div style={{ 
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: '80px', background: 'linear-gradient(to top, white, transparent)'
                    }} />
                  </div>

                  <div style={{ padding: '0 30px 30px 30px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', marginTop: '-15px', position: 'relative', zIndex: 2 }}>
                      <span style={{ 
                        fontSize: '0.65rem', fontWeight: '900', color: 'white', 
                        letterSpacing: '1px', textTransform: 'uppercase',
                        background: accentColor, padding: '6px 12px', borderRadius: '20px',
                        boxShadow: `0 4px 12px ${accentColor}40`
                      }}>
                        {activeTab === 'challenges' ? `RETO ${currentItem.numero}` : 'ACADEMIA'}
                      </span>
                    </div>
                    
                    <h3 style={{ margin: '10px 0 20px 0', fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.8rem', color: '#1a1a2e', lineHeight: '1.1' }}>
                      {activeTab === 'challenges' ? currentItem.titulo : (currentItem.title || currentItem.titulo)}
                    </h3>

                    {activeTab === 'challenges' ? (
                      <div style={{ margin: '0 0 24px 0', background: 'rgba(13, 207, 207, 0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(13, 207, 207, 0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {planetId === 'makecode-arcade' ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  1- Entra en la <a href={currentItem.pdfUrl || 'https://view.genially.com/64ca324dc4c807001173a6ec'} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero}</a> para ver las instrucciones del reto en PDF.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  2- Resuélvelo en el <a href={currentItem.editorUrl || 'https://arcade.makecode.com/'} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>editor oficial</a>.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  3- Comparte el reto con nosotros.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  1- Entra en la <a href={planetId === 'scratch' ? `https://scratch.mit.edu/projects/${currentItem.id}/editor` : 
                                                         (planetId === 'makecode-arcade' ? 'https://arcade.makecode.com/' : (currentItem.externalUrl || 'https://makecode.microbit.org/'))} 
                                                   target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero}</a> para ver las instrucciones del reto. {planetId === 'scratch' ? 'Una vez dentro, clica el botón verde de "Reinventa" y resuélvelo.' : 'Resuélvelo en el editor oficial.'}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  2- Comparte el reto con nosotros. {planetId === 'scratch' && (<>(<a href="https://youtu.be/tBimjjOikSA" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>ver tutorial</a>)</>)}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ margin: '0 0 24px 0', background: 'rgba(0,0,0,0.02)', padding: '24px', borderRadius: '16px' }}>
                        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.6', margin: 0 }}>
                          {currentItem.explicacion || currentItem.description || 'Completa este tutorial interactivo oficial de Scratch para fortalecer tu base ninja.'}
                        </p>
                        <GlowButton 
                          onClick={() => handleAction(currentItem, 'open_only')}
                          style={{ marginTop: '20px' }}
                          variant="secondary"
                        >
                          Abrir Tutorial en {planetId === 'scratch' ? 'Scratch' : 'MakeCode'}
                        </GlowButton>
                      </div>
                    )}

                    <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #eee' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>
                        Adjuntar URL de tu proyecto (Evidencia):
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          placeholder={planetId === 'scratch' ? "Pega aquí el enlace de tu proyecto de Scratch..." : 
                                      (planetId === 'makecode-arcade' ? "Pega el enlace compartido de Arcade..." : 
                                      (planetId === 'tinkercad' ? "Pega la URL de tu diseño de Tinkercad..." : "Pega aquí el enlace de tu proyecto de Microbit..."))}
                          value={evidenceUrl}
                          onChange={(e) => setEvidenceUrl(e.target.value)}
                          style={{ 
                            flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #ddd',
                            fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                            fontFamily: 'inherit'
                          }}
                          onFocus={(e) => e.target.style.borderColor = accentColor}
                          onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                      </div>
                    </div>

                    <GlowButton 
                      onClick={() => handleAction(currentItem, isTutorial ? 'tutorial' : 'challenge')}
                      fullWidth
                      variant="primary"
                      style={{ marginTop: '20px', padding: '18px', fontSize: '1.1rem', borderRadius: '16px' }}
                      disabled={isSubmitting || !evidenceUrl}
                    >
                      {isSubmitting ? 'Enviando...' : 
                      currentProgress?.status === 'En revisión' ? 'Actualizar Evidencia' : 'Validar mi Reto'}
                    </GlowButton>
                  </div>
                </div>
              );
            })()}
          </GlassCard>
        </div>
      )}

      {/* GRID VIEW CONTAINER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* CONTEXTUAL HEADER (Guía persistente rápida) */}
        {activeTab === 'challenges' && planetId?.toLowerCase() === 'scratch' && (
           <GlassCard style={{ 
             padding: '15px', background: 'linear-gradient(135deg, #fff 0%, #f0f7ff 100%)', border: '1px solid #d0e7ff',
             display: 'flex', alignItems: 'center', justifyContent: 'space-between'
           }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Sparkles size={18} color={accentColor} />
               <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700' }}>¡Selecciona un reto para empezar!</p>
             </div>
             <a href={planetId === 'scratch' ? "https://youtu.be/tBimjjOikSA" : "https://makecode.microbit.org/docs"} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>Ver guía de ayuda</a>
           </GlassCard>
        )}

        {/* LEGAL DISCLAIMER */}
        <div style={{ 
          padding: '15px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.05)', marginBottom: '10px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: accentColor, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Atribución y Derechos de Autor
          </p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#666', lineHeight: '1.4', fontStyle: 'italic' }}>
            Los contenidos y recursos utilizados en este cuaderno tienen carácter educativo y están destinados al apoyo del proceso de enseñanza-aprendizaje. 
            Parte de los materiales han sido obtenidos de fuentes externas ({
              planetId === 'scratch' ? <a href="https://www.robotix.es/es/actividades-scratch" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: Robotix</a> : 
              planetId?.includes('microbit') ? <a href="https://microbit.org/es-es/projects/make-it-code-it/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: Micro:bit Foundation</a> : 
              planetId === 'makecode-arcade' ? <a href="https://www.weteachrobotics.com/videojuegos/programar-videojuegos-makecode-arcade/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: OBO We Teach Robotics (VGP_LS)</a> : 
              planetId === 'tinkercad' ? <a href="https://www.tinkercad.com/learn" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: Autodesk Tinkercad</a> : 'Fuentes educativas oficiales'
            }), respetando en todo momento sus condiciones de uso y derechos de autor. Siempre que ha sido posible, se ha indicado la autoría correspondiente. 
            Si algún contenido vulnera derechos de propiedad intelectual, puede solicitarse su retirada.
          </p>
        </div>

        {/* UNIFIED GRID */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px',
          background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '24px'
        }}>
          {(activeTab === 'tutorials' ? tutorialsList : challenges).map((item) => {
            const num = item.numero || item.id;
            const challengeId = activeTab === 'tutorials' ? `${planetId}-tutorial-${item.id}` : `${planetId}-reto-${item.numero}`;
            const status = userProgress[challengeId]?.status || 'No iniciado';
            const isSelected = selectedTutorial ? (activeTab === 'tutorials' ? selectedTutorial.id === item.id : selectedTutorial.numero === item.numero) : false;
            
            return (
              <div 
                key={`${activeTab}-${num}`}
                onClick={() => setSelectedTutorial(item)}
                style={{ 
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '16px', cursor: 'pointer', 
                  border: isSelected ? `3px solid ${accentColor}` : '1px solid rgba(0,0,0,0.08)',
                  background: status === 'Validado' ? `${accentColor}15` : status === 'En revisión' ? '#fff4e6' : 'white',
                  position: 'relative', transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSelected ? `0 10px 25px ${accentColor}30` : '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: status === 'Validado' ? accentColor : '#1a1a2e' }}>{num}</div>
                  <div style={{ 
                    fontSize: '0.55rem', fontWeight: 'bold', color: status === 'Validado' ? accentColor : '#666', 
                    textAlign: 'center', lineHeight: '1.2', textTransform: 'uppercase', maxWidth: '100%',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {item.titulo || item.title}
                  </div>
                </div>
                {status !== 'No iniciado' && (
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
                    {renderStatusIcon(status, 14)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const getFallbackChallenges = (pid) => {
  const fallbacks = {
    microbit: [
      {
        numero: 1,
        titulo: "Iniciación Micro:bit",
        dificultad: "Junior",
        explicacion: "Abre el editor oficial y explora los bloques básicos.",
        instrucciones: ["Entra en MakeCode", "Crea un nuevo proyecto", "Prueba el bloque 'al iniciar'"],
        ejemplo: "Muestra tu nombre en la matriz de LEDs.",
        externalUrl: "https://makecode.microbit.org/"
      },
      {
        numero: 2,
        titulo: "Explorador de Retos",
        dificultad: "Pro",
        explicacion: "Elige un proyecto de la lista oficial de microbit.org.",
        instrucciones: ["Usa los botones de nivel (Principiante/Intermedio/Avanzado)", "Selecciona un proyecto que te guste", "Copia el código en MakeCode"],
        ejemplo: "Pega el enlace de tu proyecto compartido para completar la misión."
      }
    ],
    scratch: [
      {
        numero: 1,
        titulo: "El Gato Bailarín",
        dificultad: "Junior",
        explicacion: "Explora los bloques de movimiento y sonido.",
        instrucciones: ["Al presionar bandera verde", "Mover 10 pasos", "Tocar sonido miau hasta que termine"],
        ejemplo: "El objeto debe moverse al ritmo de la música."
      }
    ]
  };
  return fallbacks[pid?.toLowerCase()] || [
    {
      numero: 1,
      titulo: "Exploración Ninja",
      dificultad: "Junior",
      explicacion: "Inicia tu camino en este nuevo sector tecnológico.",
      instrucciones: ["Abre el editor oficial", "Prueba los bloques básicos", "Crea tu primer programa"],
      ejemplo: "Un mensaje de bienvenida en pantalla."
    }
  ];
};

function LockIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
