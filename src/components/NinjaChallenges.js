import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { supabase } from '../lib/supabaseClient';
import { 
  Medal, Clock, CheckCircle2, Zap, Star, Trophy,
  ArrowRight, BookOpen, Loader2, Sparkles, AlertTriangle 
} from 'lucide-react';

import { 
  SCRATCH_TUTORIALS, 
  MICROBIT_TUTORIALS, 
  ARCADE_TUTORIALS, 
  TINKERCAD_3D_TUTORIALS, 
  TINKERCAD_CODEBLOCKS_TUTORIALS, 
  BLOCKSCAD_TUTORIALS 
} from '../lib/tutorials';
import { ROBOTIX_CHALLENGES } from '../lib/robotix';
import { 
  RASPBERRY_SCRATCH_L1, 
  RASPBERRY_SCRATCH_L2, 
  RASPBERRY_SCRATCH_CHALLENGES 
} from '../lib/raspberry';
import { MICROBIT_CHALLENGES } from '../lib/microbit';
import { ARCADE_CHALLENGES } from '../lib/arcade';
import { 
  TINKERCAD_3D_ACADEMY,
  TINKERCAD_3D_CHALLENGES, 
  TINKERCAD_CODEBLOCKS_CHALLENGES, 
  BLOCKSCAD_CHALLENGES 
} from '../lib/tinkercad';
import { CODE_MODERN_COURSES, CODE_HOUR_OF_CODE, CODE_HOUR_OF_AI } from '../lib/code';
import { getPlanetById } from '../lib/planets';

export default function NinjaChallenges({ planetId, userId, accentColor = '#0dcfcf', targetLevel = 'Junior', onValidateChallenge, isAutodidact = true, itinerary }) {
  const [challenges, setChallenges] = useState([]);
  const [expertChallenges, setExpertChallenges] = useState([]);
  const [raspberryL1, setRaspberryL1] = useState([]);
  const [raspberryL2, setRaspberryL2] = useState([]);
  const [codeModern, setCodeModern] = useState([]);
  const [codeHourOfCode, setCodeHourOfCode] = useState([]);
  const [codeHourOfAI, setCodeHourOfAI] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');
  const [difficultyChallenges, setDifficultyChallenges] = useState(null);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');

  useEffect(() => {
    if (planetId && userId) {
      loadData();
    }
    // Si estamos en codeblocks, forzar pestaña de retos ya que no hay academia
    if (planetId === 'tinkercad' && itinerary === 'codeblocks' && activeTab === 'tutorials') {
      setActiveTab('challenges');
    }
  }, [planetId, userId, difficultyLevel, activeTab, itinerary]);

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
        setRaspberryL1(RASPBERRY_SCRATCH_L1);
        setRaspberryL2(RASPBERRY_SCRATCH_L2);
        setExpertChallenges(RASPBERRY_SCRATCH_CHALLENGES);
      } else if (planetId?.toLowerCase() === 'tinkercad') {
        if (itinerary === 'codeblocks') {
          setChallenges([
            ...TINKERCAD_CODEBLOCKS_CHALLENGES.beginner,
            ...TINKERCAD_CODEBLOCKS_CHALLENGES.intermediate,
            ...TINKERCAD_CODEBLOCKS_CHALLENGES.advanced
          ]);
          setDifficultyChallenges(null);
        } else if (itinerary === 'blockscad') {
          setChallenges(BLOCKSCAD_CHALLENGES[difficultyLevel] || []);
          setDifficultyChallenges(BLOCKSCAD_CHALLENGES);
        } else {
          setChallenges(TINKERCAD_3D_CHALLENGES[difficultyLevel] || []);
          setDifficultyChallenges(TINKERCAD_3D_CHALLENGES);
        }
      } else if (planetId?.toLowerCase().includes('microbit')) {
        setChallenges(MICROBIT_CHALLENGES[difficultyLevel] || []);
        setDifficultyChallenges(MICROBIT_CHALLENGES);
      } else if (planetId?.toLowerCase() === 'makecode-arcade') {
        setChallenges(ARCADE_CHALLENGES);
      } else if (planetId?.toLowerCase() === 'code') {
        setCodeModern(CODE_MODERN_COURSES);
        setCodeHourOfCode(CODE_HOUR_OF_CODE);
        setCodeHourOfAI(CODE_HOUR_OF_AI);
        if (activeTab === 'challenges' || activeTab === 'tutorials') setActiveTab('cursos_modernos');
      } else {
        // Load API challenges for other planets
        try {
          const response = await fetch('/api/tutor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              planet: planetId, 
              mode: 'generator', 
              message: 'Genera una lista de 4 retos ninja de programación para este planeta en formato JSON.' 
            })
          });
          const data = await response.json();
          if (data.success && data.text) {
            const jsonMatch = data.text.match(/```json\n([\s\S]*?)\n```/) || data.text.match(/\[[\s\S]*?\]/);
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
    const challengeId = `${planetId}${itinerary ? '-' + itinerary : ''}-${idSuffix}`;
    const currentStatus = userProgress[challengeId]?.status || 'No iniciado';

    if (currentStatus === 'Validado') return;
    // Determine the URL to open (if applicable)
    let urlToOpen = '';
    
    // Case 1: Open external tool only (Tutorial/Dashboard/Editor)
    if (type === 'open_only') {
      if (activeTab === 'tutorials' || activeTab === 'tutorials_3d' || activeTab === 'tutorials_codeblocks' || activeTab === 'tutorials_blockscad') {
        urlToOpen = planetId?.toLowerCase().includes('microbit') 
          ? `https://makecode.microbit.org/#tutorial:/projects/${challenge.slug || challenge.id}`
          : (planetId === 'makecode-arcade'
              ? `https://arcade.makecode.com/#tutorial:${challenge.slug}`
              : (planetId === 'tinkercad' && itinerary === 'codeblocks'
                  ? 'https://www.tinkercad.com/learn/codeblocks' 
                  : (planetId === 'tinkercad' && itinerary === 'blockscad'
                      ? 'https://www.blockscad3d.com/editor/?lang=es#' 
                      : (planetId === 'tinkercad' 
                          ? (challenge.url || 'https://www.tinkercad.com/learn/designs') 
                          : 'https://scratch.mit.edu/projects/editor/'))));
      } else if (activeTab.startsWith('expert_challenges') || activeTab.startsWith('raspberry_')) {
        urlToOpen = challenge.externalUrl;
      } else {
        urlToOpen = planetId === 'scratch'
          ? (activeTab === 'challenges' 
              ? `https://www.robotix.es/blog/reto-scratch-${challenge.numero}/`
              : challenge.externalUrl)
          : (planetId?.toLowerCase().includes('microbit') 
              ? `https://microbit.org/es-es/projects/make-it-code-it/${challenge.id || ''}/`
              : (planetId === 'makecode-arcade'
                  ? `https://arcade.makecode.com/`
                  : (itinerary === 'blockscad' 
                      ? (challenge.url || 'https://www.picuino.com/es/blockscad-index.html')
                      : (challenge.url || `https://www.tinkercad.com/dashboard`))));
      }

      if (urlToOpen) {
        window.open(urlToOpen, '_blank');
        return;
      }
    } 

    if (!userId) {
      alert("Debes iniciar sesión para guardar tu progreso.");
      return;
    }

    // Para alumnos con clase, la evidencia es obligatoria.
    // Para autodidactas, permitimos iniciar la validación socrática sin URL si es necesario.
    if (!isAutodidact && !evidenceUrl) {
      alert("Por favor, pega el enlace de tu proyecto para que tu profesor pueda revisarlo.");
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

      // Notificar al padre para iniciar validación socrática o aviso de profesor
      if (onValidateChallenge) {
        onValidateChallenge(challenge, evidenceUrl, challengeId);
      }

      await loadData();
      setSelectedTutorial(null); // Cerrar modal de reto o tutorial
      setEvidenceUrl('');
    } catch (err) {
      console.error("Error submitting challenge:", err);
      alert("Error al enviar el reto. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusIcon = (status, size = 18) => {
    switch (status) {
      case 'Validado': return <Star size={size} fill="#FFD700" color="#FFD700" />;
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
                        (planetId?.toLowerCase() === 'tinkercad' ? (itinerary === 'codeblocks' ? TINKERCAD_CODEBLOCKS_TUTORIALS : (itinerary === 'blockscad' ? [] : TINKERCAD_3D_TUTORIALS)) : 
                        (planetId?.toLowerCase().includes('microbit') ? MICROBIT_TUTORIALS : (planetId === 'code' ? [] : SCRATCH_TUTORIALS)));
  const tutorialsCompleted = tutorialsList.filter(t => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-tutorial-${t.id}`]?.status === 'Validado').length;
  
  // difficultyChallenges is now a state variable set in loadData()
  
  // Calculate total challenges for this planet/itinerary
  const totalChallengesCount = planetId === 'scratch' ? 78 : (difficultyChallenges ? (Object.values(difficultyChallenges).flat().length) : challenges.length);
  const difficultyProgress = difficultyChallenges ? {
    beginner: difficultyChallenges.beginner.filter(c => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-reto-${c.numero || c.id}`]?.status === 'Validado').length,
    intermediate: difficultyChallenges.intermediate.filter(c => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-reto-${c.numero || c.id}`]?.status === 'Validado').length,
    advanced: difficultyChallenges.advanced.filter(c => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-reto-${c.numero || c.id}`]?.status === 'Validado').length
  } : null;

  const challengesCompleted = challenges.filter(c => userProgress[`${planetId}${itinerary ? '-' + itinerary : ''}-reto-${c.numero || c.id}`]?.status === 'Validado').length;
  const expertChallengesCompleted = expertChallenges.filter(c => userProgress[`${planetId}-reto-${c.numero || c.id}`]?.status === 'Validado').length;
  const l1Completed = raspberryL1.filter(c => userProgress[`${planetId}-reto-${c.id}`]?.status === 'Validado').length;
  const l2Completed = raspberryL2.filter(c => userProgress[`${planetId}-reto-${c.id}`]?.status === 'Validado').length;
  
  const codeModernCompleted = codeModern.filter(c => userProgress[`${planetId}-reto-modern-${c.id}`]?.status === 'Validado').length;
  const codeHourOfCodeCompleted = codeHourOfCode.filter(c => userProgress[`${planetId}-reto-hoc-${c.id}`]?.status === 'Validado').length;
  const codeHourOfAICompleted = codeHourOfAI.filter(c => userProgress[`${planetId}-reto-ai-${c.id}`]?.status === 'Validado').length;

  const milestoneDivisor = (planetId === 'tinkercad' && itinerary === 'codeblocks') ? 5 : (planetId === 'makecode-arcade' ? 3 : 10);
  
  // Logic for custom badges/insignias
  let activeMilestones = [];
  if (planetId === 'scratch') {
    // Big Milestone Badges for Scratch
    activeMilestones = [
      { reached: tutorialsCompleted >= 27, label: 'ACADEMIA SCRATCH', total: 27, type: 'big' },
      { reached: challengesCompleted >= 78, label: 'RETOS ROBOTIX', total: 78, type: 'big' },
      { reached: l1Completed >= 53, label: 'RASPBERRY L1', total: 53, type: 'big' },
      { reached: l2Completed >= 21, label: 'RASPBERRY L2', total: 21, type: 'big' },
      { reached: expertChallengesCompleted >= 9, label: 'RASPBERRY L3', total: 9, type: 'big' }
    ];
  } else if (planetId === 'tinkercad') {
    if (itinerary === 'codeblocks') {
      activeMilestones = [
        { reached: challengesCompleted >= 21, label: 'COMPLETO', total: 21 }
      ];
    } else if (itinerary === 'blockscad') {
      activeMilestones = [
        { reached: difficultyProgress?.beginner === 3, label: 'PRINCIPIANTE', total: 3 },
        { reached: difficultyProgress?.advanced === 11, label: 'AVANZADO', total: 11 }
      ];
    } else { // 3D Design
      activeMilestones = [
        { reached: tutorialsCompleted === 12, label: 'ACADEMIA', total: 12 },
        { reached: difficultyProgress?.beginner === 13, label: 'PRINCIPIANTE', total: 13 },
        { reached: difficultyProgress?.intermediate === 10, label: 'INTERMEDIO', total: 10 },
        { reached: difficultyProgress?.advanced === 10, label: 'AVANZADO', total: 10 }
      ];
    }
  } else if (planetId?.toLowerCase().includes('microbit')) {
    activeMilestones = [
      { reached: tutorialsCompleted >= 12, label: 'ACADEMIA COMPLETA', total: 12, type: 'big' },
      { reached: difficultyProgress?.beginner === 51, label: 'PRINCIPIANTE PRO', total: 51, type: 'big' },
      { reached: difficultyProgress?.intermediate === 32, label: 'INTERMEDIO PRO', total: 32, type: 'big' },
      { reached: difficultyProgress?.advanced === 16, label: 'AVANZADO PRO', total: 16, type: 'big' }
    ];
  } else if (planetId === 'makecode-arcade') {
    activeMilestones = [
      { reached: tutorialsCompleted >= 15, label: 'ACADEMIA COMPLETA', total: 15, type: 'big' },
      { reached: challengesCompleted >= 18, label: 'WE TEACH ROBOTICS', total: 18, type: 'big' }
    ];
  } else if (planetId === 'code') {
    activeMilestones = [
      { reached: codeModernCompleted >= 5, label: 'MODERN COURSES', total: 5, type: 'big' },
      { reached: codeHourOfCodeCompleted >= 22, label: 'HOUR OF CODE', total: 22, type: 'big' },
      { reached: codeHourOfAICompleted >= 1, label: 'IA EXPLORER', total: 1, type: 'big' }
    ];
  } else {
    // Default 8-milestone logic for other planets
    for (let i = 0; i < 8; i++) {
       const reached = Math.floor((challengesCompleted + expertChallengesCompleted + l1Completed + l2Completed) / milestoneDivisor) > i;
       activeMilestones.push({ reached, label: (i+1)*milestoneDivisor });
    }
  }
  const isAdvanced = targetLevel && targetLevel.toLowerCase() !== 'novato' && targetLevel.toLowerCase() !== 'junior';

  const tutorialsByCategory = tutorialsList.reduce((acc, t) => {
    const cat = t.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});
  
  const hasLevelBadge = planetId === 'scratch' ? (tutorialsCompleted === 27) : 
                        (planetId === 'makecode-arcade' ? (challengesCompleted > 0) : 
                        (difficultyProgress && difficultyProgress.beginner > 0));

  const arcadeRank = planetId === 'makecode-arcade' ? (
    challengesCompleted >= 16 ? { label: 'GAME MASTER', color: '#6c5ce7', icon: '👑' } :
    challengesCompleted >= 12 ? { label: 'LEAD DESIGNER', color: '#e84118', icon: '🏆' } :
    challengesCompleted >= 8 ? { label: 'GAME ARCHITECT', color: '#0097e6', icon: '⚔️' } :
    challengesCompleted >= 4 ? { label: 'CODER', color: '#4cd137', icon: '🌱' } :
    { label: 'AMATEUR', color: '#636e72', icon: '🎮' }
  ) : null;

  const difficultyRank = difficultyProgress ? (
    difficultyProgress.advanced > 0 ? { label: 'AVANZADO', color: '#e84118', icon: '🏆' } :
    difficultyProgress.intermediate > 0 ? { label: 'INTERMEDIO', color: '#0097e6', icon: '⚔️' } :
    difficultyProgress.beginner > 0 ? { label: 'PRINCIPIANTE', color: '#4cd137', icon: '🌱' } :
    null
  ) : null;

  const currentRank = planetId === 'makecode-arcade' ? arcadeRank : difficultyRank;

  const renderChallengeCard = (item, isTutorialTab) => {
    const num = item.numero || item.id;
    let challengeId = isTutorialTab ? `${planetId}${itinerary ? '-' + itinerary : ''}-tutorial-${item.id}` : `${planetId}${itinerary ? '-' + itinerary : ''}-reto-${item.id || item.numero}`;
    
    // Especial para code.org
    if (planetId === 'code') {
      if (activeTab === 'cursos_modernos') challengeId = `${planetId}-reto-modern-${item.id}`;
      if (activeTab === 'hora_codigo') challengeId = `${planetId}-reto-hoc-${item.id}`;
      if (activeTab === 'hour_of_ai') challengeId = `${planetId}-reto-ai-${item.id}`;
    }

    const status = userProgress[challengeId]?.status || 'No iniciado';
    const isSelected = selectedTutorial ? (isTutorialTab ? selectedTutorial.id === item.id : selectedTutorial.numero === item.numero) : false;
    
    return (
      <div 
        key={`${isTutorialTab ? 'tut' : 'chal'}-${num}`}
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
          <span style={{ 
            fontSize: '1.2rem', fontWeight: '900', 
            color: isSelected ? 'white' : (status === 'Validado' ? '#22c55e' : accentColor), 
            marginBottom: '4px' 
          }}>{num}</span>
          <span style={{ 
            fontSize: '0.6rem', fontWeight: '800', 
            color: isSelected ? 'white' : (status === 'Validado' ? '#22c55e' : accentColor),
            textAlign: 'center', textTransform: 'uppercase', lineHeight: '1.2',
            maxWidth: '100%'
          }}>{(item.titulo || item.title)?.length > 25 ? (item.titulo || item.title).substring(0, 22) + '...' : (item.titulo || item.title)}</span>
        </div>
        {status !== 'No iniciado' && (
          <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
            {renderStatusIcon(status, 14)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* BADGES SECTION */}
      {(planetId === 'scratch' || planetId?.includes('microbit') || planetId === 'makecode-arcade' || planetId === 'tinkercad' || planetId === 'code') && (
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

          {activeMilestones.map((m, i) => {
            const milestoneReached = m.reached || (planetId !== 'tinkercad' && isAdvanced && i === 0);
            const isBig = m.type === 'big';
            
            return (
              <div key={i} style={{ 
                minWidth: isBig ? '120px' : '60px', 
                padding: '12px', 
                borderRadius: '12px', 
                textAlign: 'center',
                background: milestoneReached 
                  ? (isBig ? 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' : 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)') 
                  : '#f0f0f0',
                border: milestoneReached ? 'none' : '1px dashed #ccc', 
                opacity: milestoneReached ? 1 : 0.3,
                transition: 'all 0.3s ease',
                flexShrink: 0
              }}>
                {isBig ? (
                  <Medal size={24} color={milestoneReached ? 'white' : '#999'} style={{ margin: '0 auto 5px' }} />
                ) : (
                  <Zap size={18} color={milestoneReached ? 'white' : '#999'} style={{ margin: '0 auto 5px' }} />
                )}
                <p style={{ 
                  fontSize: isBig ? '0.6rem' : '0.5rem', 
                  fontWeight: '900', 
                  margin: 0, 
                  color: milestoneReached ? 'white' : '#666', 
                  whiteSpace: 'nowrap' 
                }}>
                  { m.label }
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔮 DIFFICULTY LEVEL SELECTORS */}
      {difficultyChallenges && itinerary !== 'codeblocks' && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${itinerary === 'blockscad' ? 2 : 3}, 1fr)`, gap: '15px', marginBottom: '10px' }}>
          {[
            { id: 'beginner', label: 'PRINCIPIANTE', color: '#4cd137', icon: '🌱' },
            { id: 'intermediate', label: 'INTERMEDIO', color: '#0097e6', icon: '⚔️' },
            { id: 'advanced', label: 'AVANZADO', color: '#e84118', icon: '🏆' }
          ].filter(lvl => !(itinerary === 'blockscad' && lvl.id === 'intermediate')).map(lvl => {
            const isSelected = difficultyLevel === lvl.id;
            return (
              <div 
                key={lvl.id}
                onClick={() => {
                  setDifficultyLevel(lvl.id);
                  setChallenges(difficultyChallenges[lvl.id] || []);
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
      {(planetId === 'scratch' || planetId?.includes('microbit') || planetId === 'makecode-arcade' || planetId === 'tinkercad' || planetId === 'code') && (
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.03)', padding: '5px', borderRadius: '12px', overflowX: 'auto', marginBottom: '20px' }}>
            {planetId === 'code' ? (
              <>
                <button 
                  onClick={() => { setActiveTab('cursos_modernos'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'cursos_modernos' ? 'white' : 'transparent',
                    color: activeTab === 'cursos_modernos' ? accentColor : '#666',
                    boxShadow: activeTab === 'cursos_modernos' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  CURSOS MODERNOS ({codeModernCompleted}/5)
                </button>
                <button 
                  onClick={() => { setActiveTab('hora_codigo'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'hora_codigo' ? 'white' : 'transparent',
                    color: activeTab === 'hora_codigo' ? accentColor : '#666',
                    boxShadow: activeTab === 'hora_codigo' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  HORA DEL CÓDIGO ({codeHourOfCodeCompleted}/22)
                </button>
                <button 
                  onClick={() => { setActiveTab('hour_of_ai'); setSelectedTutorial(null); }}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                    background: activeTab === 'hour_of_ai' ? 'white' : 'transparent',
                    color: activeTab === 'hour_of_ai' ? accentColor : '#666',
                    boxShadow: activeTab === 'hour_of_ai' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s', minWidth: 'fit-content'
                  }}
                >
                  IA EXPLORER
                </button>
              </>
            ) : (
              <>
                {tutorialsList.length > 0 && (
                  <button 
                    onClick={() => setActiveTab('tutorials')}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                      background: activeTab === 'tutorials' ? 'white' : 'transparent',
                      color: activeTab === 'tutorials' ? accentColor : '#666',
                      boxShadow: activeTab === 'tutorials' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s', minWidth: 'fit-content'
                    }}
                  >
                    ACADEMIA {itinerary === '3d' ? '3D' : (itinerary === 'codeblocks' ? 'CÓDIGO' : (itinerary === 'blockscad' ? 'BLOCKSCAD' : ''))} ({tutorialsCompleted}/{tutorialsList.length})
                  </button>
                )}
                {challenges.length > 0 && (
                  <button 
                    onClick={() => setActiveTab('challenges')}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                      background: activeTab === 'challenges' ? 'white' : 'transparent',
                      color: activeTab === 'challenges' ? accentColor : '#666',
                      boxShadow: activeTab === 'challenges' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s', minWidth: 'fit-content'
                    }}
                  >
                    {planetId === 'makecode-arcade' ? 'WE TEACH ROBOTICS' : (planetId === 'scratch' ? 'RETOS ROBOTIX' : (itinerary === 'blockscad' ? 'RETOS BLOCKSCAD' : 'RETOS NINJA'))} ({challengesCompleted}/{challenges.length})
                  </button>
                )}
                {planetId === 'scratch' && (
                  <>
                    <button 
                      onClick={() => setActiveTab('raspberry_l1')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                        background: activeTab === 'raspberry_l1' ? 'white' : 'transparent',
                        color: activeTab === 'raspberry_l1' ? accentColor : '#666',
                        boxShadow: activeTab === 'raspberry_l1' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s', minWidth: 'fit-content'
                      }}
                    >
                      RASPBERRY L1 ({l1Completed}/53)
                    </button>
                    <button 
                      onClick={() => setActiveTab('raspberry_l2')}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                        background: activeTab === 'raspberry_l2' ? 'white' : 'transparent',
                        color: activeTab === 'raspberry_l2' ? accentColor : '#666',
                        boxShadow: activeTab === 'raspberry_l2' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s', minWidth: 'fit-content'
                      }}
                    >
                      RASPBERRY L2 ({l2Completed}/44)
                    </button>
                  </>
                )}
                {expertChallenges.length > 0 && (
                  <button 
                    onClick={() => setActiveTab('expert')}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: '700', fontFamily: 'Outfit',
                      background: activeTab === 'expert' ? 'white' : 'transparent',
                      color: activeTab === 'expert' ? accentColor : '#666',
                      boxShadow: activeTab === 'expert' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s', minWidth: 'fit-content'
                    }}
                  >
                    {planetId === 'scratch' ? 'RASPBERRY L3' : 'PROYECTOS EXPERTOS'} ({expertChallengesCompleted}/{expertChallenges.length})
                  </button>
                )}
              </>
            )}
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
              const isTutorial = activeTab === 'tutorials' || activeTab === 'tutorials_3d' || activeTab === 'tutorials_codeblocks';
              let progressKey = isTutorial ? `${planetId}${itinerary ? '-' + itinerary : ''}-tutorial-${currentItem.id}` : `${planetId}${itinerary ? '-' + itinerary : ''}-reto-${currentItem.id || currentItem.numero}`;
              
              if (planetId === 'code') {
                if (activeTab === 'cursos_modernos') progressKey = `${planetId}-reto-modern-${currentItem.id}`;
                if (activeTab === 'hora_codigo') progressKey = `${planetId}-reto-hoc-${currentItem.id}`;
                if (activeTab === 'hour_of_ai') progressKey = `${planetId}-reto-ai-${currentItem.id}`;
              }

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
                      src={planetId === 'scratch' ? "/robotix_scratch_hero.png" : 
                           (planetId?.toLowerCase().includes('microbit') ? "/microbit_hero.png" :
                           (planetId === 'makecode-arcade' ? "/arcade_hero.png" : 
                           (itinerary === 'blockscad' ? "/planets/blockscad.png" :
                           (planetId?.startsWith('tinkercad') ? (itinerary === 'codeblocks' ? "/planets/tinkercad_codeblocks.png" : "/planets/tinkercad_3d.png") : 
                           (planetId === 'code' ? "/planets/code-pro.png" : "/planets/microbit.jpeg")))))} 
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
                        {!isTutorial ? (
                           planetId === 'code' ? 'ACTIVIDAD CODE.ORG' :
                           planetId === 'scratch' ? 'RETO ROBOTIX' : 
                           (planetId === 'makecode-arcade' ? 'RETO WE TEACH ROBOTICS' : 'RETO NINJA')
                         ) + ` ${currentItem.numero || ''}` : 
                         activeTab === 'raspberry_l1' ? `RETOS RASPBERRY NIVEL 1 - RETO ${currentItem.numero}` :
                         activeTab === 'raspberry_l2' ? `RETOS RASPBERRY NIVEL 2 - RETO ${currentItem.numero}` :
                         activeTab === 'expert_challenges' ? `RETOS RASPBERRY NIVEL 3 - RETO ${currentItem.numero}` : 
                         (planetId === 'scratch' ? 'ACADEMIA' : (planetId === 'makecode-arcade' ? 'ACADEMIA' : (planetId?.startsWith('tinkercad') ? `ACADEMIA ${currentItem.category?.toUpperCase() || ''}` : 'ACADEMIA')))}
                      </span>
                    </div>
                    
                    <h3 style={{ margin: '10px 0 20px 0', fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.8rem', color: '#1a1a2e', lineHeight: '1.1' }}>
                      {(!isTutorial) ? currentItem.titulo : (currentItem.title || currentItem.titulo)}
                    </h3>

                    {!isTutorial ? (
                      <div style={{ margin: '0 0 24px 0', background: 'rgba(13, 207, 207, 0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(13, 207, 207, 0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {activeTab.startsWith('expert_challenges') || activeTab.startsWith('raspberry_') ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Sigue la guía oficial de la <a href={currentItem.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>Raspberry Pi Foundation</a> para completar este proyecto.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Cuando lo termines, comparte el enlace de tu proyecto de Scratch con nosotros para validarlo.
                                </p>
                              </div>
                            </>
                          ) : planetId === 'makecode-arcade' ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en la <a href={currentItem.pdfUrl || 'https://view.genially.com/64ca324dc4c807001173a6ec'} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero}</a> para ver las instrucciones del reto en PDF.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Resuélvelo en el <a href={currentItem.editorUrl || 'https://arcade.makecode.com/'} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>editor oficial</a>.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Comparte el reto con nosotros.
                                </p>
                              </div>
                            </>
                          ) : planetId?.toLowerCase().includes('microbit') ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en la <a href={`https://microbit.org/es-es/projects/make-it-code-it/${currentItem.id}/`} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero}</a> (<a href={`https://microbit.org/projects/make-it-code-it/${currentItem.id}/`} target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: '0.8rem', textDecoration: 'underline' }}>inglés</a>) para ver las instrucciones del reto.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Resuélvelo en el <a href="https://makecode.microbit.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>editor oficial de MakeCode</a>.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Comparte el reto con nosotros.
                                </p>
                              </div>
                            </>
                          ) : itinerary === 'blockscad' ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Mira la guía en la <a href={currentItem.url || 'https://www.picuino.com/es/blockscad-index.html'} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero}</a> de Picuino.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Resuélvelo en el <a href="https://www.blockscad3d.com/editor/?lang=es#" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>editor oficial de BlocksCAD</a>.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>3</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Comparte el reto con nosotros.
                                </p>
                              </div>
                            </>
                          ) : planetId === 'code' ? (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en la <a href={currentItem.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página oficial del curso/actividad</a> para comenzar.
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Al finalizar, indícanos aquí que lo has completado para registrar tu progreso.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>1</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Entra en la <a href={planetId === 'scratch' ? (activeTab === 'challenges' ? `https://www.robotix.es/blog/reto-scratch-${currentItem.numero}/` : currentItem.externalUrl) : 
                                                         (planetId?.toLowerCase().includes('microbit') ? `https://microbit.org/es-es/projects/make-it-code-it/${currentItem.id}/` : 
                                                         (planetId === 'makecode-arcade' ? 'https://arcade.makecode.com/' : (currentItem.url || currentItem.externalUrl || 'https://www.tinkercad.com/')))} 
                                                   target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>página del reto {currentItem.numero}</a> para ver las instrucciones del reto. {planetId === 'scratch' ? 'Una vez dentro, clica el botón verde de "Reinventa" y resuélvelo.' : 'Resuélvelo en el editor oficial.'}
                                </p>
                              </div>
                              {planetId?.startsWith('tinkercad') && (
                                <p style={{ fontSize: '0.8rem', color: '#e44d26', fontWeight: '800', marginLeft: '47px', marginTop: '-10px', marginBottom: '10px' }}>
                                  ⚠️ Importante: Debes iniciar sesión en Tinkercad para acceder a este reto.
                                </p>
                              )}
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: accentColor, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', boxShadow: `0 4px 10px ${accentColor}40` }}>2</div>
                                <p style={{ fontSize: '1rem', color: '#1a1a2e', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                  Comparte el reto con nosotros. {planetId === 'scratch' && (<>(<a href="https://youtu.be/tBimjjOikSA" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>ver tutorial</a>)</>)}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ margin: '0 0 24px 0', background: 'rgba(0,0,0,0.02)', padding: '24px', borderRadius: '16px' }}>
                        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.6', margin: 0 }}>
                          {currentItem.explicacion || currentItem.description || 'Completa este tutorial interactivo oficial para fortalecer tu base ninja.'}
                        </p>
                        {planetId?.startsWith('tinkercad') && (
                          <p style={{ fontSize: '0.8rem', color: '#e44d26', fontWeight: '800', marginTop: '10px' }}>
                            ⚠️ Importante: Debes iniciar sesión en Tinkercad para acceder a este tutorial.
                          </p>
                        )}
                        <GlowButton 
                          onClick={() => handleAction(currentItem, 'open_only')}
                          style={{ marginTop: '20px' }}
                          variant="secondary"
                        >
                          Abrir Tutorial en {planetId === 'scratch' ? 'Scratch' : (planetId?.startsWith('tinkercad') ? 'Tinkercad' : 'MakeCode')}
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
                                      (planetId?.startsWith('tinkercad') ? "Pega la URL de tu diseño de Tinkercad..." : "Pega aquí el enlace de tu proyecto de Microbit..."))}
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
                      disabled={isSubmitting || (!isAutodidact && !evidenceUrl)}
                    >
                      {isSubmitting ? 'Enviando...' : 
                      currentProgress?.status === 'En revisión' ? 'Actualizar Evidencia' : 
                      (isAutodidact ? 'Validar con el Sensei' : 'Validar mi Reto')}
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
             <a href={planetId === 'scratch' ? "https://youtu.be/tBimjjOikSA" : "https://microbit.org/es-es/projects/make-it-code-it/"} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: accentColor, fontWeight: '800', textDecoration: 'underline' }}>Ver guía de ayuda</a>
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
              planetId === 'scratch' ? (
                <>
                  <a href="https://www.robotix.es/es/actividades-scratch" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Robotix</a> y <a href="https://projects.raspberrypi.org/es-ES/technology/scratch" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Raspberry Pi Foundation</a>
                </>
              ) : 
              planetId?.includes('microbit') ? <a href="https://microbit.org/es-es/projects/make-it-code-it/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: Micro:bit Educational Foundation</a> : 
              itinerary === 'blockscad' ? (
                <>
                  <a href="https://microbit.org/es-es/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Micro:bit Educational Foundation</a> y <a href="https://www.picuino.com/es/blockscad-index.html" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>picuino.com</a>
                </>
              ) :
              planetId === 'makecode-arcade' ? <a href="https://www.weteachrobotics.com/videojuegos/proyecto-con-makecode-arcade/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: OBO We Teach Robotics</a> : 
              planetId === 'code' ? (
                <>
                   <a href="https://code.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Code.org</a>, <a href="https://www.picuino.com/es/prog-codeorg.html" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>picuino.com</a> y <a href="https://csforall.org/" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>csforall.org</a>
                </>
              ) :
              planetId?.startsWith('tinkercad') ? <a href="https://www.tinkercad.com/learn" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'underline' }}>Fuente: Autodesk Tinkercad</a> : 'Fuentes educativas oficiales'
            }), respetando en todo momento sus condiciones de uso y derechos de autor. Siempre que ha sido posible, se ha indicado la autoría correspondiente. 
            Si algún contenido vulnera derechos de propiedad intelectual, puede solicitarse su retirada.
          </p>
        </div>

        {/* UNIFIED GRID O CATEGORIZADO */}
        {activeTab === 'tutorials' && (planetId?.startsWith('tinkercad') || planetId === 'scratch') ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
            {Object.entries(tutorialsByCategory).map(([category, items]) => (
              <div key={category}>
                <h4 style={{ 
                  margin: '0 0 15px 10px', fontSize: '0.9rem', fontWeight: '800', 
                  color: planetId?.startsWith('tinkercad') ? (category === 'Bloques de Código' ? '#6c5ce7' : '#0088CC') : '#666', 
                  textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  {category} <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.05)' }} />
                </h4>
                <div style={{ 
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px',
                  background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '24px'
                }}>
                  {items.map((item) => renderChallengeCard(item, true))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px',
            background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '24px'
          }}>
            {(activeTab === 'tutorials' ? tutorialsList : 
              (activeTab === 'expert_challenges' ? expertChallenges : 
               (activeTab === 'raspberry_l1' ? raspberryL1 :
                (activeTab === 'raspberry_l2' ? raspberryL2 : 
                 (activeTab === 'cursos_modernos' ? codeModern :
                  (activeTab === 'hora_codigo' ? codeHourOfCode :
                   (activeTab === 'hour_of_ai' ? codeHourOfAI : challenges))))))).map((item) => renderChallengeCard(item, activeTab === 'tutorials'))}
          </div>
        )}
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
    ],
    code: [
      {
        numero: 1,
        titulo: "Primeros Pasos en Code",
        dificultad: "Junior",
        explicacion: "Accede a la plataforma oficial de Code.org e inicia tu primer curso.",
        instrucciones: ["Haz clic en el curso que quieras empezar", "Inicia sesión en Code.org para guardar tu progreso", "Completa las lecciones indicadas"],
        ejemplo: "Pega aquí el enlace de tu perfil de Code.org o una captura de tu primer nivel superado.",
        externalUrl: "https://studio.code.org/courses/express-2025/units/1"
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
