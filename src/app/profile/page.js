"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import {
  Settings, User, Medal, BookOpen, Send, TrendingUp,
  MessageSquare, Cpu, ExternalLink, Shield, Mail, IdCard, LogOut, Key, Upload, Sparkles, Brain, Award, Zap, Search, ChevronRight, CheckCircle2, Clock, Play, FileText, ArrowLeft, Stars, Rocket, Presentation, X, Layout, Headphones, Castle, Camera, ShieldCheck, Target, Trash2, Globe, Eye, Box, Minimize, Maximize, Code, Smartphone
} from 'lucide-react';
import TutorExperience from '@/components/TutorExperience';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import TopHeader from '../../components/TopHeader';
import NinjaChallenges from '../../components/NinjaChallenges';
import SenseiMissions from '../../components/SenseiMissions';
import SocraticTutor from '../../components/SocraticTutor';
import ValidationChat from '../../components/ValidationChat';
import { getPlanetById } from '../../lib/planets';
import ResourceUploader from '../../components/ResourceUploader';
import CodeBadges from '../../components/CodeBadges';

import './page.css';

const MASTER_PROFESOR_ID = '5ec7cea5-1dfa-461f-8a07-ecf1da1854a6';

const TIPO_ORDER = {
  'presentacion': 1,
  'presentación': 1,
  'infografia': 2,
  'infografía': 2,
  'video': 3,
  'resumen de vídeo': 3,
  'resumen de video': 3,
  'slide': 1,
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
  const typeA = a.tipo_recurso?.toLowerCase() || '';
  const typeB = b.tipo_recurso?.toLowerCase() || '';
  const orderA = TIPO_ORDER[typeA] || 99;
  const orderB = TIPO_ORDER[typeB] || 99;
  if (orderA !== orderB) return orderA - orderB;
  return new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0);
};

function ProfileContent() {
  const router = useRouter();
  const { session, role, profile: authProfile, loading: authLoading, signOut, clearGuestSession, updateProfile, isGuest } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const activePlanet = searchParams.get('planet');

  const [socraticMessages, setSocraticMessages] = useState([
    { role: 'tutor', text: `Saludos, Explorer. Iniciando sistemas de acompañamiento socrático...` }
  ]);
  const [socraticInputText, setSocraticInputText] = useState('');
  const [isValidationSuccess, setIsValidationSuccess] = useState(false);
  const [validationInputText, setValidationInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isNinjaValidator, setIsNinjaValidator] = useState(false);
  const [evidenceStatus, setEvidenceStatus] = useState('No Iniciado');

  // ── Validation Chat (panel separado del Tutor Socrático) ──
  const [isValidationChatOpen, setIsValidationChatOpen] = useState(false);
  const [validationContext, setValidationContext] = useState(null);
  const [studentClassrooms, setStudentClassrooms] = useState([]);

  // ── Recursos del Maestro ──
  const [teacherResources, setTeacherResources] = useState([]);
  const [classOnlyResources, setClassOnlyResources] = useState([]); // recursos del profe para esta clase (no maestros)
  const [loadingResources, setLoadingResources] = useState(false);

  // ── Estados de Docente ──
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updateMsg, setUpdateMsg] = useState(null);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [validatingBadge, setValidatingBadge] = useState(null);
  const [validatingChallenge, setValidatingChallenge] = useState(null);
  const [validatingSenseiMission, setValidatingSenseiMission] = useState(null);
  const [badgeRefreshTrigger, setBadgeRefreshTrigger] = useState(0);
  const [challengeRefreshTrigger, setChallengeRefreshTrigger] = useState(0);
  const [senseiRefreshTrigger, setSenseiRefreshTrigger] = useState(0);

  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [studentLevel, setStudentLevel] = useState('Junior');
  const [itinerary, setItinerary] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedScroll, setSelectedScroll] = useState(null); 
  const [isChatModalOpen, setIsChatModalOpen] = useState(false); 

  const [isAutodidact, setIsAutodidact] = useState(true);

  // Helper to determine if an itinerary option button should be highlighted as active.
  // It handles null, '', and 'academy' as equivalent for the leftmost 'ACADEMIA' tab.
  const isItineraryActive = (optId) => {
    return itinerary === optId || (optId === null && (!itinerary || itinerary === 'academy' || itinerary === ''));
  };
  
  // ── Estadísticas de Docente ──
  const [teacherStats, setTeacherStats] = useState({
    clases: 0,
    alumnos: 0,
    recursos: 0
  });

  const [studentStats, setStudentStats] = useState({
    retos: 0,
    medallas: 0,
    progreso: 0
  });

  const [activeResource, setActiveResource] = useState(null);
  const [isFullscreenResource, setIsFullscreenResource] = useState(false);

  useEffect(() => {
    // Cargar itinerario guardado para este planeta o resetear al default (null)
    const saved = localStorage.getItem(`dojoflow_itinerary_${activePlanet}`);
    setItinerary(saved || null);
  }, [activePlanet]);

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Subir a Supabase Storage (Bucket: avatars)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Actualizar perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      updateProfile({ avatar_url: publicUrl });
      setUpdateMsg({ type: 'success', text: 'Imagen subida con éxito' });
      setIsChangingAvatar(false);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setUpdateMsg({ type: 'error', text: 'Error al subir la imagen' });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!activePlanet) return;

    // Check assessment state
    const savedAssessment = localStorage.getItem(`dojoflow_assessment_${activePlanet}`);
    const savedLevel = localStorage.getItem(`dojoflow_level_${activePlanet}`);
    const savedItinerary = localStorage.getItem(`dojoflow_itinerary_${activePlanet}`);
    const planet = getPlanetById(activePlanet);
    const planetName = planet?.name || activePlanet.toUpperCase();

    if (savedAssessment === 'true') {
      setAssessmentCompleted(true);
      setStudentLevel(savedLevel || 'principiante');
      setSocraticMessages([
        { role: 'tutor', text: `Saludos, Explorer. He analizado tu lógica actual en el sector ${planetName}. ¿En qué puedo ayudarte hoy?` }
      ]);
    } else {
      setAssessmentCompleted(false);
      setStudentLevel('principiante');
      // If no assessment, we could also reset messages or keep a default welcome
      setSocraticMessages([
        { role: 'tutor', text: `Saludos, Explorer. Iniciando sistemas de acompañamiento socrático para ${planetName}...` }
      ]);
    }

    if (savedItinerary) {
      setItinerary(savedItinerary);
    } else {
      setItinerary(null);
    }
  }, [activePlanet]);

  useEffect(() => {
    if (authLoading) return;
    if (!session && !isGuest) { 
      // Si ya tenemos intención de ir a signup, asegurar que redirigimos allí con el parámetro
      if (typeof window !== 'undefined' && sessionStorage.getItem('dojoflow_navigating_to_signup') === 'true') {
        router.push('/?mode=signup');
        return;
      }
      
      // Evitar redirigir si el usuario ya tiene intención de registrarse en la URL
      if (typeof window !== 'undefined' && window.location.search.includes('mode=signup')) {
        return;
      }

      router.push('/auth'); 
      return; 
    }

    const loadData = async () => {
      // 1. Perfil completo
      if (isGuest) {
        setProfile({
          id: 'guest_user',
          role: 'alumno',
          alias: 'Invitado',
          real_name: 'Explorador Anónimo',
          avatar_url: 'alumno.png',
          has_seen_onboarding: false,
          isGuest: true
        });

        // Sincronizar nivel de invitado desde localStorage para el planeta activo
        const savedAssessment = localStorage.getItem(`dojoflow_assessment_${activePlanet}`);
        const savedLevel = localStorage.getItem(`dojoflow_level_${activePlanet}`);
        
        if (savedAssessment === 'true') {
          setStudentLevel(savedLevel || 'principiante');
          setAssessmentCompleted(true);
        } else {
          setStudentLevel('principiante');
          setAssessmentCompleted(false);
        }
        
        setStudentStats({
          retos: 0,
          medallas: 0,
          progreso: 0
        });
        setIsAutodidact(true);

        // Cargar solo recursos maestros para invitados
        setLoadingResources(true);
        try {
          // Simplificamos la query para invitados asegurando que solo pedimos lo público/maestro
          const { data: globalRes, error: resError } = await supabase
            .from('recursos_docentes')
            .select('*')
            .or(`profesor_id.eq.${MASTER_PROFESOR_ID},contenido->>isGlobal.eq.true,contenido->>isMaster.eq.true`);
          
          if (resError) throw resError;

          const resourcesList = (globalRes || []).sort(sortRecursos);
          setTeacherResources(resourcesList);

          // Auto-seleccionar primer recurso relacionado con el planeta
          if (resourcesList.length > 0) {
            const planetRelated = resourcesList.find(r => 
              r.tecnologia?.toLowerCase() === activePlanet?.toLowerCase()
            );
            const defaultInfo = resourcesList.find(r => 
              r.tipo_recurso?.toLowerCase().includes('info') && 
              r.tecnologia?.toLowerCase() === activePlanet?.toLowerCase()
            ) || planetRelated || resourcesList[0];
            
            setSelectedScroll(defaultInfo);
          }
        } catch (err) {
          console.error("Error cargando recursos maestros para invitado:", err);
        } finally {
          setLoadingResources(false);
          setLoading(false);
        }
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData || { alias: 'Explorer_Kai' });

      if (role === 'profesor') {
        // Cargar estadísticas reales del docente
        try {
          // 1. Contar Clases
          const { count: classesCount } = await supabase
            .from('clases')
            .select('*', { count: 'exact', head: true })
            .eq('profesor_id', session.user.id);

          // 2. Contar Recursos Propios
          const { count: resourcesCount } = await supabase
            .from('recursos_docentes')
            .select('*', { count: 'exact', head: true })
            .eq('profesor_id', session.user.id);

          // 3. Contar Alumnos Únicos
          // Primero obtenemos las clases del profesor
          const { data: teacherClasses } = await supabase
            .from('clases')
            .select('id')
            .eq('profesor_id', session.user.id);
          
          const classIds = (teacherClasses || []).map(c => c.id);
          let uniqueStudentsCount = 0;

          if (classIds.length > 0) {
            const { data: students } = await supabase
              .from('clase_alumnos')
              .select('alumno_id')
              .in('clase_id', classIds);
            
            // Usar Set para contar alumnos únicos
            const uniqueStudents = new Set((students || []).map(s => s.alumno_id));
            uniqueStudentsCount = uniqueStudents.size;
          }

          setTeacherStats({
            clases: classesCount || 0,
            recursos: resourcesCount || 0,
            alumnos: uniqueStudentsCount
          });
        } catch (err) {
          console.error("Error cargando estadísticas de docente:", err);
        }
        setLoading(false);
        return;
      }

      // 2. Cargar Recursos y Progreso (Solo Alumnos)
      setLoadingResources(true);
      try {
        // Cargar Progreso Real
        const { data: prog } = await supabase
          .from('explore_progress')
          .select('*')
          .eq('student_id', session.user.id);
        
        const { count: retosCount } = await supabase
          .from('user_challenges')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', session.user.id)
          .eq('status', 'Validado');

        const activeProg = prog?.find(p => p.planet_id === activePlanet);
        if (activeProg) setEvidenceStatus(activeProg.status);

        setStudentStats({
          retos: retosCount || 0,
          medallas: Math.floor((prog || []).reduce((acc, p) => acc + (p.points || 0), 0) / 100),
          progreso: (prog || []).filter(p => p.status === 'Validado').length
        });

        // Buscar aulas del alumno
        const { data: memberships } = await supabase
          .from('clase_alumnos')
          .select(`
            clase_id,
            clases:clase_id (
              id,
              nombre
            )
          `)
          .eq('alumno_id', session.user.id);

        const classroomNames = (memberships || [])
          .map(m => m.clases?.nombre)
          .filter(Boolean);
        
        setStudentClassrooms(classroomNames);
        const claseIds = (memberships || []).map(m => m.clase_id);
        setIsAutodidact(claseIds.length === 0);

               // 🤝 3. Cargar recursos separados: Maestro vs. Propios de clase
        // --- Maestros (globales para todos los alumnos) ---
        const { data: globalRes } = await supabase
          .from('recursos_docentes')
          .select('*')
          .or(`profesor_id.eq.${MASTER_PROFESOR_ID},contenido->isGlobal.eq.true,contenido->isMaster.eq.true`);

        const masterList = globalRes || [];
        setTeacherResources(masterList);

        // --- Propios de la clase (asignados por el profesor, NO maestros) ---
        const masterIds = new Set(masterList.map(r => r.id));
        const classOnlyArr = [];

        if (claseIds.length > 0) {
          const { data: classResources } = await supabase
            .from('clase_recursos')
            .select(`recurso_id, recursos_docentes (*)`)
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

        const resourcesList = [...masterList, ...classOnlyArr];

        // Auto-seleccionar infografía del planeta activo por defecto
        const defaultInfo = resourcesList.find(r => 
          r.tipo_recurso?.toLowerCase().includes('info') && 
          r.tecnologia?.toLowerCase() === activePlanet?.toLowerCase()
        ) || resourcesList.find(r => r.tipo_recurso?.toLowerCase().includes('info'));
        
        if (defaultInfo) setSelectedScroll(defaultInfo);
        else if (resourcesList.length > 0) setSelectedScroll(resourcesList[0]);

      } catch (err) {
        console.error("Error al cargar datos de aula:", err);
      } finally {
        setLoadingResources(false);
        setLoading(false);
      }
    };

    loadData();
  }, [session, role, authLoading, router, activePlanet]);

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setUpdateMsg({ type: 'error', text: 'Error al actualizar contraseña' });
    else {
      setUpdateMsg({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
      setNewPassword('');
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_real: tempEmail || null })
        .eq('id', session.user.id);

      if (error) throw error;
      
      setProfile(prev => ({ ...prev, email_real: tempEmail || null }));
      setUpdateMsg({ type: 'success', text: tempEmail ? 'Correo actualizado con éxito' : 'Correo eliminado con éxito' });
      setIsEditingEmail(false);
    } catch (err) {
      console.error("Error actualizando correo:", err);
      setUpdateMsg({ type: 'error', text: 'Error al actualizar el correo' });
    }
  };

  const handleAssessmentComplete = (level) => {
    localStorage.setItem(`dojoflow_assessment_${activePlanet}`, 'true');
    localStorage.setItem(`dojoflow_level_${activePlanet}`, level);
    setStudentLevel(level);
    setAssessmentCompleted(true);
    
    // Iniciar conversación socrática con feedback del nivel
    const welcomeMsg = { 
      role: 'tutor', 
      text: `¡Excelente trabajo completando la evaluación! He detectado que tienes un nivel **${level}** en este sector. He preparado un itinerario personalizado para ti. Explora los retos que aparecen más abajo para comenzar. Si tienes alguna duda o te quedas atascado, puedes consultar en el tutor socrático de NotebookLM en este chat. ¿Tienes alguna duda técnica?` 
    };
    setSocraticMessages([welcomeMsg]);
  };

  const handleSocraticSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!socraticInputText.trim()) return;

    const currentMode = isNinjaValidator ? 'validador' : 'consulta';
    const userMsgText = socraticInputText;
    
    setSocraticMessages(prev => [...prev, { role: 'user', text: userMsgText }]);
    setSocraticInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: isGuest ? 'guest_user' : session?.user?.id,
          mode: currentMode,
          message: userMsgText,
          history: socraticMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.text
          })),
          planet: activePlanet,
          level: studentLevel
        })
      });

      const data = await response.json();
      if (data.success) {
        setSocraticMessages(prev => [...prev, { 
          role: 'tutor', 
          text: data.text 
        }]);

        // Si el Sensei incluye el tag de validación, celebramos
        if (data.text.includes('[VALIDADO]')) {
          setIsValidationSuccess(true);
          setTimeout(() => {
            setIsValidationSuccess(false);
            setIsNinjaValidator(false); // Salir del modo validador tras el éxito
          }, 4000);
          
          // Refrescar datos para que el reto aparezca como validado
          loadData();
        }
      } else {
        throw new Error(data.error || 'Error del Sensei');
      }
    } catch (err) {
      console.error(err);
      setSocraticMessages(prev => [...prev, { 
        role: 'tutor', 
        text: 'Lo siento, mi conexión con el Dojo se ha interrumpido momentáneamente. ¿Podrías repetirme tu duda?' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleValidateChallenge = (challenge, evidenceUrl, challengeId) => {
    const challengeName = challenge.nombre || challenge.title || 'este reto';
    setValidationContext({
      type: 'challenge',
      title: challengeName,
      objective: challenge.descripcion || challenge.description || '',
      challengeId
    });
    setIsValidationChatOpen(true);
  };

  const handleValidateSenseiMission = (mission) => {
    setValidationContext({
      type: 'mission',
      title: mission?.title || 'esta misión',
      objective: mission?.objective || '',
      missionId: mission?.id
    });
    setIsValidationChatOpen(true);
  };

  if (authLoading || loading) return <div className="flex-center" style={{ minHeight: '60vh', color: '#8a8a9e' }}>Sincronizando parámetros...</div>;
  
  if (!session && !isGuest) return null;
  if (!profile) return null;

  if (role === 'profesor') {
    return (
      <div className="profile-wrapper" style={{ padding: '20px 5%' }}>
        <TopHeader />
        {isGuest && (
          <div style={{ backgroundColor: 'var(--accent-purple)', color: '#fff', textAlign: 'center', padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={16} />
            <strong>Modo Explorador:</strong> Estás viendo la plataforma sin registrarte. Tu progreso no se guardará.
            <button 
              onClick={() => { 
                sessionStorage.setItem('dojoflow_navigating_to_signup', 'true');
                clearGuestSession(); 
                window.location.href = '/?mode=signup'; 
              }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginLeft: '12px', fontSize: '0.8rem' }}
            >
              Registrarme
            </button>
          </div>
        )}

        <div className="profile-dashboard-teacher" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="profile-col-left" style={{ width: '100%' }}>
            <header style={{ padding: '40px 0', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '2px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: '#ff9d00',
                marginBottom: '8px'
              }}>Identidad Digital del Orquestador</p>

              <div className="avatar-circle" style={{ borderColor: '#ff9d00', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                <img src={profile?.avatar_url || "/profesor.png"} alt="Avatar" className="avatar-img" />
                <div className="lvl-badge-pop" style={{ background: '#ff9d00', padding: '4px 12px', fontSize: '0.7rem' }}>ORQUESTADOR</div>

                <button
                  onClick={() => setIsChangingAvatar(!isChangingAvatar)}
                  style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    background: 'white',
                    border: '2px solid #ff9d00',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10
                  }}
                  title="Personalizar Imagen"
                >
                  <Settings size={16} color="#ff9d00" />
                </button>
              </div>

              {isChangingAvatar && (
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 15px',
                      background: 'rgba(255, 157, 0, 0.05)',
                      borderRadius: '8px',
                      border: '2px dashed #ff9d00',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#ff9d00',
                      fontWeight: '700'
                    }}
                  >
                    <Upload size={16} />
                    {isUploading ? 'Subiendo...' : 'Seleccionar archivo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}

              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '2.5rem',
                fontWeight: '900',
                color: '#1a1a2e',
                marginBottom: '10px'
              }}>{profile?.real_name || profile?.alias || 'Profesor'}</h1>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '5px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ff9d00', letterSpacing: '1px' }}>DOCENTE ESTRATEGA</span>
                <span style={{ color: '#ccc' }}>•</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-purple)', letterSpacing: '1px' }}>{activePlanet?.toUpperCase() || 'GENERAL'} SECTOR</span>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '20px', marginBottom: '40px' }}>
              <GlassCard style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid #ff9d00' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#8a8a9e', letterSpacing: '1px', marginBottom: '10px' }}>AULAS BAJO MANDO</p>
                <h2 style={{ fontSize: '2rem', color: '#1a1a2e', fontFamily: 'Outfit' }}>{teacherStats.clases}</h2>
              </GlassCard>
              <GlassCard style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid var(--accent-purple)' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#8a8a9e', letterSpacing: '1px', marginBottom: '10px' }}>ALUMNOS GUIADOS</p>
                <h2 style={{ fontSize: '2rem', color: '#1a1a2e', fontFamily: 'Outfit' }}>{teacherStats.alumnos}</h2>
              </GlassCard>
              <GlassCard style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid var(--accent-teal)' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#8a8a9e', letterSpacing: '1px', marginBottom: '10px' }}>RECURSOS PROPIOS</p>
                <h2 style={{ fontSize: '2rem', color: '#1a1a2e', fontFamily: 'Outfit' }}>{teacherStats.recursos}</h2>
              </GlassCard>
            </div>

            <div className="teacher-account-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
              <GlassCard className="account-details-card">
                <h3 style={{ fontFamily: 'Outfit', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IdCard size={20} className="text-purple" /> Identidad Digital
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="info-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                      <Mail size={16} color="var(--accent-purple)" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.7rem', color: '#8a8a9e', margin: 0 }}>CANAL DE COMUNICACIÓN</p>
                        {isEditingEmail ? (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                            <input 
                              type="email"
                              value={tempEmail}
                              onChange={(e) => setTempEmail(e.target.value)}
                              placeholder="tu@email.com (opcional)"
                              style={{ 
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '0.85rem'
                              }}
                            />
                            <GlowButton 
                              color="teal" 
                              onClick={handleUpdateEmail}
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                                         <div className="flex gap-2 p-1 bg-white/10 rounded-xl">
                                  <button
                                    onClick={() => setItinerary('ACADEMIA')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                      itinerary === 'ACADEMIA'
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'text-blue-200 hover:bg-white/5'
                                    }`}
                                  >
                                    ACADEMIA
                                  </button>
                                  <button
                                    onClick={() => setItinerary('RETOS')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                      itinerary === 'RETOS'
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'text-blue-200 hover:bg-white/5'
                                    }`}
                                  >
                                    RETOS
                                  </button>
                                </div>
                              Guardar
                            </GlowButton>
                            <button 
                              onClick={() => setIsEditingEmail(false)}
                              style={{ border: 'none', background: 'none', color: '#8a8a9e', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontWeight: '600', color: '#1a1a2e', margin: 0 }}>{profile?.email_real || 'Sin correo asociado'}</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button 
                                onClick={() => {
                                  setTempEmail(profile?.email_real || '');
                                  setIsEditingEmail(true);
                                }}
                                style={{ border: 'none', background: 'none', color: 'var(--accent-purple)', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                              >
                                {profile?.email_real ? 'EDITAR' : 'AÑADIR'}
                              </button>
                              {profile?.email_real && (
                                <button 
                                  onClick={() => {
                                    if(window.confirm('¿Eliminar correo?')) {
                                      setTempEmail('');
                                      handleUpdateEmail();
                                    }
                                  }}
                                  style={{ border: 'none', background: 'none', color: '#ff4b4b', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                                >
                                  ELIMINAR
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: '#8a8a9e', fontStyle: 'italic', margin: '4px 0 0 28px' }}>
                      * El correo es voluntario, no obligatorio. Se usa exclusivamente para la recuperación de tu contraseña.
                    </p>
                  </div>
                  <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.02)' }}>
                    <Shield size={16} color="var(--accent-teal)" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.7rem', color: '#8a8a9e', margin: 0 }}>PERMISOS DE SISTEMA</p>
                      <p style={{ fontWeight: '600', color: '#1a1a2e' }}>Orquestador Maestro (Full Access)</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="security-card">
                <h3 style={{ fontFamily: 'Outfit', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Key size={20} className="text-teal" /> Centro de Control
                </h3>

                {updateMsg && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: updateMsg.type === 'error' ? '#fff0f0' : '#f0fff0',
                    color: updateMsg.type === 'error' ? '#d00' : '#080',
                    fontSize: '0.85rem',
                    marginBottom: '15px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {updateMsg.text}
                  </div>
                )}

                {!isUpdatingPassword ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <GlowButton color="purple" className="w-100" onClick={() => setIsUpdatingPassword(true)}>
                      <TrendingUp size={16} style={{ marginRight: '8px' }} /> Cambiar Contraseña
                    </GlowButton>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="password"
                      placeholder="Nueva clave secreta"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid #eee', background: '#fcfcfc' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <GlowButton color="teal" className="w-100" onClick={handleUpdatePassword}>Confirmar</GlowButton>
                      <button onClick={() => setIsUpdatingPassword(false)} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: '#eee', color: '#666', cursor: 'pointer', fontWeight: '600' }}>Volver</button>
                    </div>
                  </div>
                )}

                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f0f0f0' }} />

                <div onClick={signOut} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#ff4b4b',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  padding: '12px',
                  borderRadius: '10px',
                  transition: 'background 0.2s'
                }} onMouseOver={(e) => e.currentTarget.style.background = '#fff8f8'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={18} /> Cerrar Sesión
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VISTA DE APRENDIZAJE (PLANETA) ──
  if (role === 'alumno' && activePlanet) {
    const planet = getPlanetById(activePlanet);
    const planetLaunchers = teacherResources.filter(r => 
      (r.tipo_recurso?.toLowerCase() === 'lanzadera' || r.tipo_recurso?.toLowerCase() === 'enlace') && 
      (r.tecnologia?.toLowerCase() === activePlanet.toLowerCase() || r.tecnologia?.toLowerCase() === 'todas')
    );
    
    // Helper para renderizar markdown básico (negritas y saltos de línea)
    const formatMarkdown = (text) => {
      if (!text) return '';
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: inherit; font-weight: 800;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
        .replace(/\n/g, '<br />');
    };

    return (
      <div className="layout-container" style={{ minHeight: '100vh', background: '#f8fafb' }}>
        <TopHeader />
        {isGuest && (
          <div style={{ backgroundColor: 'var(--accent-purple)', color: '#fff', textAlign: 'center', padding: '12px', zIndex: 1000, position: 'relative', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={16} />
            <strong>Modo Explorador:</strong> Estás viendo la plataforma sin registrarte. Tu progreso no se guardará.
            <button 
              onClick={() => { 
                sessionStorage.setItem('dojoflow_navigating_to_signup', 'true');
                clearGuestSession();
                window.location.href = '/?mode=signup'; 
              }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginLeft: '12px', fontSize: '0.8rem' }}
            >
              Registrarme
            </button>
          </div>
        )}
        
        <main className="profile-planet-main">
          
          {/* BOTÓN VOLVER */}
          <div style={{ marginBottom: '30px' }}>
            <GlowButton color="white" onClick={() => router.push('/')} style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <ArrowLeft size={16} style={{ marginRight: '8px' }} /> VOLVER AL DOJO
            </GlowButton>
          </div>

          {/* FILA 1: IDENTIDAD + TUTOR SOCRÁTICO */}
          <div className="identity-tutor-grid">
            
            {/* TARJETA DE IDENTIDAD */}
            <GlassCard style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="avatar-circle" style={{ width: '120px', height: '120px', marginBottom: '20px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', inset: '-4px', borderRadius: '50%', 
                  border: `3px solid ${planet?.barColor || '#6366f1'}`,
                  opacity: 0.3
                }}></div>
                <img src={profile?.avatar_url || "/alumno.png"} alt="Avatar" className="avatar-img" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ 
                  position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
                  background: planet?.barColor || '#6366f1', color: 'white', padding: '3px 12px', 
                  borderRadius: '20px', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.5px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)', whiteSpace: 'nowrap'
                }}>
                  EXPLORADOR NINJA
                </div>
              </div>
              
              <h2 style={{ fontFamily: 'Outfit', fontWeight: '900', fontSize: '2.2rem', margin: '0 0 5px', color: '#1a1a2e' }}>
                {profile?.alias || 'Explorador'}
              </h2>

              {studentClassrooms.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  flexWrap: 'wrap', 
                  justifyContent: 'center',
                  marginTop: '5px',
                  marginBottom: '15px'
                }}>
                  {studentClassrooms.map((cls, idx) => (
                    <span key={idx} style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: '800', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: '#059669', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <Shield size={10} /> {cls}
                    </span>
                  ))}
                </div>
              )}
              
              <p style={{ fontSize: '0.65rem', color: '#8a8a9e', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '25px' }}>
                FASE: DESAFÍO {activePlanet?.toUpperCase() || 'EXPLORACIÓN'}
              </p>
              
              <div style={{ display: 'flex', gap: '15px', width: '100%', marginBottom: '20px' }}>
                <div style={{ flex: 1, padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.03)' }}>
                  <p style={{ fontSize: '0.55rem', color: '#8a8a9e', fontWeight: '800', margin: '0 0 4px', textTransform: 'uppercase' }}>XP POINTS</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, color: '#1a1a2e' }}>{studentStats.retos * 50}</p>
                </div>
                <div style={{ flex: 1, padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.03)' }}>
                  <p style={{ fontSize: '0.55rem', color: '#8a8a9e', fontWeight: '800', margin: '0 0 4px', textTransform: 'uppercase' }}>STAGE</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, color: planet?.barColor || '#6366f1' }}>{studentStats.retos} Retos</p>
                </div>
              </div>
            </GlassCard>

            {/* TUTOR SOCRÁTICO (NotebookLM) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div id="socratic-tutor-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', background: isNinjaValidator ? '#f59e0b' : (planet?.barColor || '#6366f1'), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.3s' }}>
                    {isNinjaValidator ? <Award size={16} /> : <Sparkles size={16} />}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#1a1a2e', margin: 0 }}>
                    {isNinjaValidator ? 'Sensei IA: Validador de Retos' : 'NotebookLM Socratic Tutor'}
                  </h3>
                </div>
                
                {isNinjaValidator && (
                  <button 
                    onClick={() => setIsNinjaValidator(false)}
                    style={{
                      background: 'rgba(0,0,0,0.05)',
                      border: 'none',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <X size={12} /> SALIR DE VALIDACIÓN
                  </button>
                )}
              </div>
              {!assessmentCompleted ? (
                <TutorExperience 
                  technology={activePlanet} 
                  studentLevel={studentLevel} 
                  isAutodidact={isAutodidact}
                  onComplete={handleAssessmentComplete}
                />
              ) : (
                <GlassCard style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '550px', background: '#ffffff', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', padding: '25px' }}>
                    {socraticMessages.map((msg, i) => (
                      <div key={i} style={{ 
                        display: 'flex',
                        gap: '12px',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        marginBottom: '8px',
                        animation: 'fadeIn 0.3s ease-out'
                      }}>
                        {/* Avatar en el mensaje */}
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: msg.role === 'user' ? '#e2e8f0' : 'linear-gradient(135deg, #0dcfcf, #9c27b0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          overflow: 'hidden'
                        }}>
                          {msg.role === 'user' ? 
                            <img src={profile?.avatar_url || "/alumno.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                            <Brain size={16} color="white" />
                          }
                        </div>

                        <div style={{ 
                          background: msg.role === 'user' ? (planet?.barColor || '#6366f1') : '#ffffff',
                          color: msg.role === 'user' ? 'white' : '#334155',
                          padding: '14px 18px',
                          borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                          maxWidth: '80%',
                          fontSize: '0.9rem',
                          lineHeight: '1.6',
                          boxShadow: msg.role === 'user' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 15px rgba(0,0,0,0.05)',
                          border: msg.role === 'user' ? 'none' : '1px solid #f1f5f9',
                          fontFamily: 'Inter, sans-serif'
                        }}>
                          {msg.role !== 'user' && (
                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: planet?.barColor || '#6366f1', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              Sensei IA
                            </div>
                          )}
                          <div 
                            dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} 
                            style={{ wordBreak: 'break-word' }}
                          />
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '8px' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #0dcfcf, #9c27b0)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <Brain size={16} color="white" className="animate-pulse" />
                        </div>
                        <div style={{ 
                          background: '#f8fafc', color: '#64748b', padding: '10px 18px', 
                          borderRadius: '20px 20px 20px 4px', fontSize: '0.85rem', fontStyle: 'italic',
                          border: '1px solid #f1f5f9'
                        }}>
              El Sensei está redactando su consejo...
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center', background: 'white', borderRadius: '0 0 25px 25px' }}>
                    <input
                      type="text"
                      value={socraticInputText}
                      onChange={(e) => setSocraticInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSocraticSubmit()}
                      placeholder="Haz una consulta socrática..."
                      style={{ 
                        flex: 1, 
                        padding: '14px 20px', 
                        borderRadius: '25px', 
                        border: '1px solid #e2e8f0',
                        fontSize: '0.85rem',
                        outline: 'none',
                        background: 'white'
                      }}
                    />
                    <button 
                      onClick={handleSocraticSubmit}
                      style={{ 
                        background: planet?.barColor || '#0dcfcf', 
                        color: 'white', 
                        border: 'none', 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Send size={18} />
                    </button>
                  </div>

                  {/* Overlay de Éxito en Validación */}
                  {isValidationSuccess && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10, borderRadius: '20px', animation: 'fadeIn 0.5s ease',
                      textAlign: 'center', padding: '20px'
                    }}>
                      <div style={{ 
                        width: '80px', height: '80px', background: '#22c55e', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)', marginBottom: '20px'
                      }}>
                        <CheckCircle2 size={40} />
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1a1a2e', margin: '0 0 10px 0' }}>¡RETO VALIDADO!</h2>
                      <p style={{ fontSize: '0.9rem', color: '#666', maxWidth: '80%', margin: '0 auto' }}>
                        El Sensei ha verificado tus conocimientos. ¡Sigue así, Ninja!
                      </p>
                    </div>
                  )}
                </GlassCard>
              )}
            </div>
          </div>

          {/* CONTENIDO GATED: LANZADERAS, RECURSOS E ITINERARIO */}
          {!assessmentCompleted ? (
            <div style={{ marginBottom: '40px' }}>
              <GlassCard style={{ padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)', textAlign: 'center', background: 'rgba(255,255,255,0.5)', border: '2px dashed rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${planet?.barColor || '#6366f1'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={40} color={planet?.barColor || '#6366f1'} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 10px 0', color: '#1a1a2e' }}>Acceso Restringido: Evaluación Requerida</h3>
                  <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Para desbloquear el Itinerario Ninja y las Misiones del Sensei en el planeta <strong>{planet?.name}</strong>, 
                    debes completar primero el desafío diagnóstico con nuestro Tutor Socrático.
                  </p>
                </div>
                <div style={{ padding: '15px 25px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles size={20} color="#ff9800" />
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#1a1a2e' }}>Completa el cuestionario en el panel superior derecho para continuar.</p>
                </div>
              </GlassCard>
            </div>
          ) : (
            <>
              {/* FILA 2: LANZADERAS Y PÁGINA OFICIAL */}
          <div className="launchers-grid">
            
            {/* LANZADERAS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#8a8a9e', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                <Rocket size={16} /> LANZADERAS
              </h3>
              <GlassCard style={{ padding: '30px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                {planetLaunchers.length > 0 ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {planetLaunchers.map(l => (
                      <GlowButton 
                        key={l.id} 
                        color="purple" 
                        onClick={() => setActiveResource(l)} 
                        className="w-100" 
                        style={{ padding: '15px' }}
                      >
                        {l.nombre_recurso} <ExternalLink size={14} style={{ marginLeft: '10px' }} />
                      </GlowButton>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>Sin lanzaderas activas en este sector.</p>
                )}
              </GlassCard>
            </div>

            {/* PÁGINA OFICIAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#8a8a9e', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                <Globe size={16} /> PÁGINA OFICIAL
              </h3>
              <GlassCard style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ 
                  height: '100px', 
                  background: `linear-gradient(to bottom, ${planet?.color || '#f1f5f9'}, #ffffff)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <img src={planet?.image} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{planet?.name}</h4>
                    <span style={{ fontSize: '0.6rem', color: planet?.barColor || '#6366f1', fontWeight: '900', border: `1px solid ${planet?.barColor || '#6366f1'}`, padding: '2px 8px', borderRadius: '10px' }}>ONLINE</span>
                  </div>
                  
                  <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.6', marginBottom: '10px' }}>
                    {planet?.description || 'Accede al entorno oficial de programación para este sector.'}
                  </p>

                  {planet?.recommendation && (
                    <p style={{ fontSize: '0.75rem', color: '#1a1a2e', fontWeight: '700', lineHeight: '1.4', marginBottom: '20px' }}>
                      <span style={{ color: planet?.barColor || '#6366f1' }}>Recomendación Ninja:</span> {planet.recommendation}
                    </p>
                  )}

                  {/* Barra de Progreso */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '900', color: planet?.barColor || '#6366f1' }}>{Math.min(100, Math.round((studentStats.retos / 12) * 100))}% COMPLETO</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${Math.min(100, (studentStats.retos / 12) * 100)}%`, 
                        height: '100%', 
                        background: planet?.barColor || '#6366f1',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                  </div>

                  {/* Tip Ninja Box Dinámico */}
                  <div style={{ 
                    background: 'rgba(13, 207, 207, 0.05)', 
                    padding: '20px', 
                    borderRadius: '15px', 
                    border: '1px solid rgba(13, 207, 207, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={16} color="#0dcfcf" fill="#0dcfcf" />
                      <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '900', color: '#0dcfcf', textTransform: 'uppercase' }}>Tips de Explorador</h5>
                    </div>
                    
                    <ul style={{ margin: 0, padding: '0 0 0 15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(planet?.tips || [
                        "Regístrate e inicia sesión siempre para que tus proyectos se guarden correctamente.",
                        "Explora la sección de recursos para encontrar guías paso a paso."
                      ]).map((tip, i) => (
                        <li key={i} style={{ fontSize: '0.75rem', color: '#1a1a2e', fontWeight: '600', lineHeight: '1.4' }}>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '5px',
                    width: '100%'
                  }}>
                    {planet?.buttons && planet.buttons.length > 0 ? (
                      planet.buttons.map((btn, idx) => {
                        const BtnIcon = btn.icon === 'Box' ? Box : ExternalLink;
                        return (
                          <GlowButton 
                            key={idx}
                            color={btn.color} 
                            onClick={() => window.open(btn.url, '_blank')} 
                            style={{ 
                              padding: '12px 10px', 
                              fontWeight: '900',
                              fontSize: '0.75rem',
                              flex: '1',
                              width: '100%',
                              minWidth: 0
                            }}
                          >
                            <BtnIcon size={20} style={{ marginRight: '8px' }} /> {btn.label.toUpperCase()}
                          </GlowButton>
                        );
                      })
                    ) : (
                      <GlowButton color="teal" onClick={() => window.open(planet?.url, '_blank')} style={{ width: '100%', maxWidth: '300px', padding: '15px', fontWeight: '900', margin: '0 auto' }}>
                        <ExternalLink size={20} style={{ marginRight: '10px' }} /> {planet?.name?.toUpperCase()} OFICIAL
                      </GlowButton>
                    )}
                  </div>
                  {planet?.attribution && (
                    <p style={{ 
                      fontSize: '0.65rem', 
                      color: '#8a8a9e', 
                      fontStyle: 'italic', 
                      marginTop: '15px', 
                      borderTop: '1px solid rgba(0,0,0,0.05)', 
                      paddingTop: '10px' 
                    }}>
                      {planet.attribution}
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* FILA 3A: RECURSOS MAESTROS */}
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
                          border: selectedScroll?.id === r.id ? `2px solid ${planet?.barColor || '#6366f1'}` : '1px solid rgba(0,0,0,0.05)',
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

                    {selectedScroll && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#8a8a9e', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', margin: 0 }}>
                  <Eye size={16} /> {selectedScroll.nombre_recurso}
                </h3>
                <button 
                  onClick={() => setSelectedScroll(null)}
                  style={{ border: 'none', background: 'none', color: '#8a8a9e', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800' }}
                >
                  CERRAR VISTA
                </button>
              </div>
              
              <GlassCard style={{ padding: 0, boxShadow: '0 20px 50px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ width: '100%', minHeight: '400px', background: '#fff', position: 'relative' }}>
                  {selectedScroll.tipo_recurso?.toLowerCase().includes('info') ? (
                    <div style={{ padding: '10px' }}>
                      <img 
                        src={selectedScroll.contenido?.url} 
                        alt={selectedScroll.nombre_recurso} 
                        style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} 
                      />
                    </div>
                  ) : (
                    <iframe 
                      src={selectedScroll.contenido?.url}
                      className="resource-iframe"
                      style={{ width: '100%', border: 'none' }}
                      title={selectedScroll.nombre_recurso}
                    />
                  )}
                </div>
                
                <div style={{ padding: '15px', display: 'flex', justifyContent: 'center', borderTop: '1px solid #eee', background: '#fcfcfc' }}>
                  <GlowButton color="white" onClick={() => window.open(selectedScroll.contenido?.url, '_blank')} style={{ fontSize: '0.7rem', padding: '8px 20px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <ExternalLink size={14} style={{ marginRight: '8px' }} /> ABRIR EN VENTANA COMPLETA
                  </GlowButton>
                </div>
              </GlassCard>
            </div>
          )}

          {/* CURSO LUIS LLAMAS (Solo para Arduino) */}
          {activePlanet === 'arduino' && (
            <div style={{ marginBottom: '50px', animation: 'fadeInUp 0.8s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#8a8a9e', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', margin: 0 }}>
                  <Globe size={16} /> ENCICLOPEDIA EXPERTA: LUIS LLAMAS
                </h3>
                <span style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: '900', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 12px', borderRadius: '15px' }}>RECOMENDADO</span>
              </div>

              <GlassCard style={{ padding: 0, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px' }}>
                <div style={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                  {/* Imagen de fondo generada */}
                  <img 
                    src="/planets/arduino_banner.png" 
                    alt="Arduino Course" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                  />
                  
                  {/* Overlay Gradiente */}
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, width: '100%', height: '100%', 
                    background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '60px'
                  }}>
                    <div style={{ maxWidth: '500px' }}>
                      <div style={{ background: '#6366f1', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Brain size={14} /> CURSO EXTERNO PREMIUM
                      </div>
                      <h2 style={{ color: 'white', fontSize: '2.4rem', fontWeight: '900', margin: '0 0 15px 0', lineHeight: '1.1' }}>
                        Arduino desde Cero
                      </h2>
                      <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '500', lineHeight: '1.6', marginBottom: '30px' }}>
                        Accede a la guía más completa y estructurada del mundo hispano. Luis Llamas te enseña electrónica y programación con un rigor técnico excepcional.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <GlowButton 
                          color="purple" 
                          onClick={() => window.open("https://www.luisllamas.es/arduino-desde-cero/", '_blank')} 
                          style={{ 
                            padding: '22px 60px', 
                            fontSize: '1.3rem', 
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                            border: '3px solid white',
                            boxShadow: '0 15px 50px rgba(255, 215, 0, 0.7), 0 0 30px rgba(255, 255, 255, 0.5)',
                            color: '#1a1a2e',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            animation: 'pulse 2s infinite',
                            scale: '1.1'
                          }}
                        >
                          <ExternalLink size={24} style={{ marginRight: '15px' }} /> EMPEZAR CURSO AHORA
                        </GlowButton>
                      </div>
                    </div>
                  </div>

                  {/* Logo de Luis Llamas o Badge */}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '30px', 
                    right: '30px', 
                    background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)', 
                    padding: '10px 20px', 
                    borderRadius: '15px', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Globe size={16} color="white" />
                    <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: '700' }}>WWW.LUISLLAMAS.ES</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* CURSO LUIS LLAMAS (Solo para Python) */}
          {activePlanet === 'python' && (
            <div style={{ marginBottom: '50px', animation: 'fadeInUp 0.8s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#8a8a9e', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', margin: 0 }}>
                  <Globe size={16} /> ENCICLOPEDIA EXPERTA: LUIS LLAMAS
                </h3>
                <span style={{ fontSize: '0.6rem', color: '#3776ab', fontWeight: '900', background: 'rgba(55, 118, 171, 0.1)', padding: '4px 12px', borderRadius: '15px' }}>RECOMENDADO</span>
              </div>

              <GlassCard style={{ padding: 0, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px' }}>
                <div style={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a192f' }}>
                  {/* Imagen de fondo generada */}
                  <img 
                    src="/planets/python_banner.png" 
                    alt="Python Course" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                  />
                  
                  {/* Overlay Gradiente */}
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, width: '100%', height: '100%', 
                    background: 'linear-gradient(90deg, rgba(10, 25, 47, 0.9) 0%, rgba(10, 25, 47, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '60px'
                  }}>
                    <div style={{ maxWidth: '500px' }}>
                      <div style={{ background: '#3776ab', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Code size={14} /> CURSO EXTERNO PREMIUM
                      </div>
                      <h2 style={{ color: 'white', fontSize: '2.4rem', fontWeight: '900', margin: '0 0 15px 0', lineHeight: '1.1' }}>
                        Aprende Python desde Cero
                      </h2>
                      <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '500', lineHeight: '1.6', marginBottom: '30px' }}>
                        Domina el lenguaje de programación más versátil y potente de la actualidad. Luis Llamas te guía desde la sintaxis básica hasta conceptos avanzados.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <GlowButton 
                          color="blue" 
                          onClick={() => window.open("https://www.luisllamas.es/aprende-python-desde-cero/", '_blank')} 
                          style={{ 
                            padding: '22px 60px', 
                            fontSize: '1.3rem', 
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                            border: '3px solid white',
                            boxShadow: '0 15px 50px rgba(255, 215, 0, 0.7), 0 0 30px rgba(255, 255, 255, 0.5)',
                            color: '#1a1a2e',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            animation: 'pulse 2s infinite',
                            scale: '1.1'
                          }}
                        >
                          <ExternalLink size={24} style={{ marginRight: '15px' }} /> EMPEZAR CURSO AHORA
                        </GlowButton>
                      </div>
                    </div>
                  </div>

                  {/* Logo de Luis Llamas o Badge */}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '30px', 
                    right: '30px', 
                    background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)', 
                    padding: '10px 20px', 
                    borderRadius: '15px', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Globe size={16} color="white" />
                    <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: '700' }}>WWW.LUISLLAMAS.ES</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* CURSOS LUIS LLAMAS (Solo para HTML/CSS/JS) */}
          {activePlanet === 'html' && (
            <div style={{ marginBottom: '50px', animation: 'fadeInUp 0.8s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#8a8a9e', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', margin: 0 }}>
                  <Globe size={16} /> ENCICLOPEDIA EXPERTA: LUIS LLAMAS
                </h3>
                <span style={{ fontSize: '0.6rem', color: '#e44d26', fontWeight: '900', background: 'rgba(228, 77, 38, 0.1)', padding: '4px 12px', borderRadius: '15px' }}>TRILOGÍA WEB</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '20px' }}>
                {/* HTML */}
                <GlassCard style={{ padding: 0, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px' }}>
                  <div style={{ position: 'relative', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px', background: 'linear-gradient(135deg, #e44d26 0%, #f16529 100%)' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.2 }}>
                      <Globe size={120} color="white" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                        <Code size={12} /> ESTRUCTURA
                      </div>
                      <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1.1' }}>
                        HTML desde Cero
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: '500', lineHeight: '1.5', marginBottom: '20px', maxWidth: '280px' }}>
                        La base fundamental de toda página web. Aprende a estructurar contenido de forma profesional.
                      </p>
                      <GlowButton 
                        color="orange" 
                        onClick={() => window.open("https://www.luisllamas.es/html-desde-cero/", '_blank')} 
                        style={{ 
                          padding: '12px 25px', 
                          fontSize: '0.9rem', 
                          fontWeight: '900',
                          background: 'white',
                          color: '#e44d26',
                          border: 'none',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                      >
                        <ExternalLink size={16} style={{ marginRight: '8px' }} /> VER CURSO
                      </GlowButton>
                    </div>
                  </div>
                </GlassCard>

                {/* CSS */}
                <GlassCard style={{ padding: 0, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px' }}>
                  <div style={{ position: 'relative', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px', background: 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.2 }}>
                      <Code size={120} color="white" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                        <Zap size={12} /> ESTILO
                      </div>
                      <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1.1' }}>
                        Aprende CSS desde Cero
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: '500', lineHeight: '1.5', marginBottom: '20px', maxWidth: '280px' }}>
                        Convierte esqueletos planos en experiencias visuales impresionantes con CSS moderno.
                      </p>
                      <GlowButton 
                        color="blue" 
                        onClick={() => window.open("https://www.luisllamas.es/aprende-css-desde-cero/", '_blank')} 
                        style={{ 
                          padding: '12px 25px', 
                          fontSize: '0.9rem', 
                          fontWeight: '900',
                          background: 'white',
                          color: '#2196f3',
                          border: 'none',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                      >
                        <ExternalLink size={16} style={{ marginRight: '8px' }} /> VER CURSO
                      </GlowButton>
                    </div>
                  </div>
                </GlassCard>

                {/* JS */}
                <GlassCard style={{ padding: 0, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px' }}>
                  <div style={{ position: 'relative', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px', background: 'linear-gradient(135deg, #f7df1e 0%, #ffc107 100%)' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.2 }}>
                      <Cpu size={120} color="#323330" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ background: 'rgba(50,51,48,0.1)', color: '#323330', padding: '5px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                        <Zap size={12} /> LÓGICA
                      </div>
                      <h2 style={{ color: '#323330', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: '1.1' }}>
                        JS desde Cero
                      </h2>
                      <p style={{ color: 'rgba(50,51,48,0.7)', fontSize: '0.85rem', fontWeight: '600', lineHeight: '1.5', marginBottom: '20px', maxWidth: '280px' }}>
                        El cerebro de la web. Da vida a tus proyectos con interactividad y lógica avanzada.
                      </p>
                      <GlowButton 
                        color="yellow" 
                        onClick={() => window.open("https://www.luisllamas.es/javascript-desde-cero/", '_blank')} 
                        style={{ 
                          padding: '12px 25px', 
                          fontSize: '0.9rem', 
                          fontWeight: '900',
                          background: '#323330',
                          color: '#f7df1e',
                          border: 'none',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                        }}
                      >
                        <ExternalLink size={16} style={{ marginRight: '8px' }} /> VER CURSO
                      </GlowButton>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}


              {/* FILA 5: ITINERARIO NINJA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Zap size={18} color="#ff9800" fill="#ff9800" /> ITINERARIO NINJA: {planet?.name?.toUpperCase() || 'PLANETA'}
                  </h3>

                  {/* Selector de Itinerario (Específico para Tinkercad y otros) */}
                  {activePlanet === 'tinkercad' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { id: null, label: 'DISEÑO 3D' },
                        { id: 'blockscad', label: 'BLOCKSCAD (CÓDIGO)' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setItinerary(opt.id);
                            localStorage.setItem(`dojoflow_itinerary_${activePlanet}`, opt.id || '');
                          }}
                          style={{
                            padding: '6px 15px',
                            borderRadius: '20px',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isItineraryActive(opt.id) ? (planet?.barColor || '#0dcfcf') : 'white',
                            color: isItineraryActive(opt.id) ? 'white' : '#64748b',
                            border: `1px solid ${isItineraryActive(opt.id) ? (planet?.barColor || '#0dcfcf') : '#e2e8f0'}`,
                            boxShadow: itinerary === opt.id ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {activePlanet === 'python' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { id: null, label: 'ACADEMIA' },
                        { id: 'kids', label: 'CODING KIDS' },
                        { id: 'raspberry', label: 'RASPBERRY PI' },
                        { id: 'codedex', label: 'CODÉDEX' },
                        { id: 'picuino', label: 'PICUINO' },
                        { id: 'freecodecamp', label: 'FREECODECAMP' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setItinerary(opt.id);
                            localStorage.setItem(`dojoflow_itinerary_${activePlanet}`, opt.id || '');
                          }}
                          style={{
                            padding: '6px 15px',
                            borderRadius: '20px',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isItineraryActive(opt.id) ? (planet?.barColor || '#306998') : 'white',
                            color: isItineraryActive(opt.id) ? 'white' : '#64748b',
                            border: `1px solid ${isItineraryActive(opt.id) ? (planet?.barColor || '#306998') : '#e2e8f0'}`,
                            boxShadow: itinerary === opt.id ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {activePlanet === 'appinventor' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { id: null, label: 'ACADEMIA' },
                        { id: 'social', label: 'SOCIAL ENTERPRISE' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setItinerary(opt.id);
                            localStorage.setItem(`dojoflow_itinerary_${activePlanet}`, opt.id || '');
                          }}
                          style={{
                            padding: '6px 15px',
                            borderRadius: '20px',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isItineraryActive(opt.id) ? (planet?.barColor || '#f57c00') : 'white',
                            color: isItineraryActive(opt.id) ? 'white' : '#64748b',
                            border: `1px solid ${isItineraryActive(opt.id) ? (planet?.barColor || '#f57c00') : '#e2e8f0'}`,
                            boxShadow: itinerary === opt.id ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Redundant Scratch buttons removed as they are handled in NinjaChallenges */}


                  {activePlanet === 'ia' && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {[
                        { id: null, label: 'LEARNINGML' },
                        { id: 'mlforkids', label: 'ML FOR KIDS' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setItinerary(opt.id);
                            localStorage.setItem(`dojoflow_itinerary_${activePlanet}`, opt.id || '');
                          }}
                          style={{
                            padding: '6px 15px',
                            borderRadius: '20px',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isItineraryActive(opt.id) ? (planet?.barColor || '#9c27b0') : 'white',
                            color: isItineraryActive(opt.id) ? 'white' : '#64748b',
                            border: `1px solid ${isItineraryActive(opt.id) ? (planet?.barColor || '#9c27b0') : '#e2e8f0'}`,
                            boxShadow: itinerary === opt.id ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {activePlanet === 'html' && (
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {[
                        { id: null, label: 'ACADEMIA (CODE.ORG)' },
                        { id: 'raspberry', label: 'PROYECTOS (PI)' },
                        { id: 'javascript', label: 'CURSO JS ⚡' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setItinerary(opt.id);
                            localStorage.setItem(`dojoflow_itinerary_${activePlanet}`, opt.id || '');
                          }}
                          style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            background: isItineraryActive(opt.id) ? (planet?.barColor || '#6366f1') : 'white',
                            color: isItineraryActive(opt.id) ? 'white' : '#64748b',
                            border: `1px solid ${isItineraryActive(opt.id) ? (planet?.barColor || '#6366f1') : '#e2e8f0'}`,
                            boxShadow: itinerary === opt.id ? '0 4px 15px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#8a8a9e', margin: '-10px 0 0 28px' }}>
                  Supera los desafíos guiados para mejorar tus competencias técnicas y superar las validaciones de los Sensei de tu centro.
                </p>
                <NinjaChallenges 
                  planetId={activePlanet} 
                  userId={isGuest ? 'guest_user' : session?.user?.id} 
                  accentColor={planet?.barColor || '#6366f1'}
                  itinerary={itinerary}
                  setItinerary={setItinerary}
                  assessmentCompleted={assessmentCompleted}
                  studentLevel={studentLevel}
                  onValidateChallenge={handleValidateChallenge}
                />
              </div>

              {/* MISIONES DEL SENSEI (Excepto en Code.org) */}
              {activePlanet !== 'code' && (
                <div style={{ marginTop: '40px' }}>
                  <SenseiMissions 
                    planetId={activePlanet} 
                    userId={isGuest ? 'guest_user' : session?.user?.id}
                    studentLevel={studentLevel}
                    accentColor={planet?.barColor}
                    onValidateMission={handleValidateSenseiMission}
                    refreshTrigger={senseiRefreshTrigger}
                  />
                </div>
              )}
            </>
          )}

        </main>

        {/* VALIDATION CHAT — Panel lateral de validación de retos y misiones */}
        <ValidationChat
          isOpen={isValidationChatOpen}
          onClose={() => setIsValidationChatOpen(false)}
          context={validationContext}
          userId={isGuest ? 'guest_user' : session?.user?.id}
          planetId={activePlanet}
          studentLevel={studentLevel}
          accentColor={planet?.barColor || '#6366f1'}
          onValidated={async (context) => {
            if (isGuest) {
              if (context.type === 'challenge') {
                const guestChallenges = JSON.parse(localStorage.getItem('guest_user_challenges') || '[]');
                const idx = guestChallenges.findIndex(c => c.challenge_id === context.challengeId);
                if (idx >= 0) guestChallenges[idx].status = 'Validado';
                else guestChallenges.push({ challenge_id: context.challengeId, planet_id: activePlanet, status: 'Validado' });
                localStorage.setItem('guest_user_challenges', JSON.stringify(guestChallenges));
              } else if (context.type === 'mission') {
                const guestMissions = JSON.parse(localStorage.getItem('guest_sensei_missions') || '[]');
                const idx = guestMissions.findIndex(m => m.id === context.missionId);
                if (idx >= 0) guestMissions[idx].status = 'Validado';
                localStorage.setItem('guest_sensei_missions', JSON.stringify(guestMissions));
              }
            } else if (session?.user?.id) {
              if (context.type === 'challenge') {
                const { data: existing } = await supabase.from('user_challenges')
                  .select('id').eq('student_id', session.user.id).eq('challenge_id', context.challengeId).maybeSingle();
                if (existing) {
                  await supabase.from('user_challenges').update({ status: 'Validado' }).eq('id', existing.id);
                } else {
                  await supabase.from('user_challenges').insert({
                    student_id: session.user.id,
                    planet_id: activePlanet,
                    challenge_id: context.challengeId,
                    status: 'Validado'
                  });
                }
              } else if (context.type === 'mission' && context.missionId) {
                await supabase.from('sensei_missions').update({ status: 'Validado' }).eq('id', context.missionId);
              }
            }
            setSenseiRefreshTrigger(t => t + 1);
          }}
        />

        {/* MODAL DE VISUALIZACIÓN DE RECURSOS */}
        {activeResource && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 10, 20, 0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.3s ease-out',
            padding: isFullscreenResource ? 0 : '40px'
          }}>
            {/* Cabecera del Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
              padding: '15px 30px',
              background: 'white',
              borderRadius: isFullscreenResource ? 0 : '15px 15px 0 0',
              borderBottom: '1px solid #eee'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Rocket size={20} color={planet?.barColor || '#6366f1'} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '900' }}>{activeResource.nombre_recurso}</h4>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setIsFullscreenResource(!isFullscreenResource)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#64748b' }}
                  title="Pantalla Completa"
                >
                  {isFullscreenResource ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
                <button 
                  onClick={() => { setActiveResource(null); setIsFullscreenResource(false); }}
                  style={{ background: '#fef2f2', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Contenido del Modal (Iframe) */}
            <div style={{ 
              flex: 1, 
              background: 'black', 
              borderRadius: isFullscreenResource ? 0 : '0 0 15px 15px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <iframe 
                src={activeResource.contenido?.url || activeResource.contenido?.markdown} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Link para salir si el iframe falla */}
            {!isFullscreenResource && (
              <div style={{ textAlign: 'center', padding: '15px', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                Si el contenido no se carga, puedes <a href={activeResource.contenido?.url} target="_blank" style={{ color: 'white', textDecoration: 'underline' }}>abrirlo en una nueva pestaña</a>.
              </div>
            )}
          </div>
        )}

      </div>
    );
  }


  // ── VISTA DE DASHBOARD / AJUSTES ──
  return (
    <div className="layout-container profile-dashboard-wrapper">
      <TopHeader />
      {isGuest && (
        <div style={{ backgroundColor: 'var(--accent-purple)', color: '#fff', textAlign: 'center', padding: '12px', zIndex: 1000, position: 'relative', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Sparkles size={16} />
          <strong>Modo Explorador:</strong> Estás viendo la plataforma sin registrarte. Tu progreso no se guardará.
          <button 
            onClick={() => { 
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('dojoflow_navigating_to_signup', 'true');
              }
              signOut('/?mode=signup'); 
            }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '12px', fontSize: '0.8rem' }}
          >
            Registrarme
          </button>
        </div>
      )}
      
      <div className="profile-dashboard-inner">
        {/* Header con estadísticas del alumno */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <GlassCard style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ color: '#6366f1', marginBottom: '8px' }}><Zap size={24} /></div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>{studentStats.retos}</div>
            <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Retos Superados</div>
          </GlassCard>
          <GlassCard style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ color: '#f59e0b', marginBottom: '8px' }}><Award size={24} /></div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>{studentStats.medallas}</div>
            <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Medallas Dojo</div>
          </GlassCard>
          <GlassCard style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ color: '#10b981', marginBottom: '8px' }}><Target size={24} /></div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>{studentStats.progreso}</div>
            <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Planetas Dominados</div>
          </GlassCard>
        </div>

        <div className="profile-account-grid">
          {/* Columna Izquierda: Identidad */}
          <GlassCard className="profile-account-card">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  color: 'white',
                  fontWeight: '800',
                  margin: '0 auto 20px',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                  overflow: 'hidden'
                }}>
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profile.alias?.charAt(0).toUpperCase() || 'E'
                  )}
                </div>
                <label style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '0',
                  background: 'white',
                  padding: '8px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  <Camera size={18} color="#6366f1" />
                  <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 5px' }}>{profile.alias || 'Explorador'}</h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{session.user.email}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <GlowButton color="purple" onClick={() => setIsUpdatingPassword(!isUpdatingPassword)}>
                <ShieldCheck size={18} style={{ marginRight: '10px' }} /> Seguridad
              </GlowButton>
              <GlowButton color="teal" onClick={() => router.push('/')}>
                <Castle size={18} style={{ marginRight: '10px' }} /> Mi Dojo
              </GlowButton>
              <div onClick={signOut} style={{
                marginTop: '20px',
                padding: '15px',
                textAlign: 'center',
                color: '#ef4444',
                fontWeight: '700',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.2s'
              }} onMouseOver={e => e.target.style.background = '#fee2e2' } onMouseOut={e => e.target.style.background = 'transparent'}>
                Cerrar Sesión
              </div>
            </div>
          </GlassCard>

          {/* Columna Derecha: Configuración */}
          <GlassCard className="profile-account-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={20} color="#6366f1" /> Ajustes de Cuenta
            </h3>

            {isUpdatingPassword ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '12px', color: '#92400e', fontSize: '0.9rem' }}>
                  Asegúrate de usar una contraseña que puedas recordar pero sea difícil de adivinar.
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: '600' }}>Nueva Contraseña</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <GlowButton color="purple" className="flex-1" onClick={handleUpdatePassword}>Actualizar</GlowButton>
                  <button onClick={() => setIsUpdatingPassword(false)} style={{
                    padding: '14px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: '600' }}>Alias en el Dojo</label>
                  <div style={{
                  display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <input
                      type="text"
                      value={profile.alias || ''}
                      onChange={(e) => setProfile({ ...profile, alias: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '1rem'
                      }}
                    />
                    <GlowButton color="teal" onClick={async () => {
                      const { error } = await supabase.from('profiles').update({ alias: profile.alias }).eq('id', session.user.id);
                      if (!error) alert("¡Alias actualizado!");
                    }}>Guardar</GlowButton>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '8px', fontWeight: '600' }}>Email de Recuperación</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="email"
                      value={profile.email_real || ''}
                      placeholder="tu@email.com (para recuperar contraseña)"
                      onChange={(e) => setProfile({ ...profile, email_real: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '1rem'
                      }}
                    />
                    <GlowButton color="cyan" onClick={handleUpdateEmail}>
                      Vincular
                    </GlowButton>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#8a8a9e', marginTop: '8px', fontStyle: 'italic' }}>
                    * El uso de correo es opcional. Solo se utilizará para enviarte un enlace si olvidas tu contraseña.
                  </p>
                </div>

                <div style={{ padding: '20px', borderRadius: '15px', background: '#f8fafb', border: '1px dashed #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: '700' }}>Estado de Explorador</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', fontSize: '0.9rem', color: '#64748b' }}>
                    <span>Identidad verificada</span>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>SÍ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', fontSize: '0.9rem', color: '#64748b', marginTop: '5px' }}>
                    <span>Tipo de cuenta</span>
                    <span style={{ fontWeight: '600' }}>{isAutodidact ? 'Autodidacta' : 'Alumno de Aula'}</span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={<div className="flex-center" style={{ minHeight: '60vh', color: '#8a8a9e' }}>Cargando Sector...</div>}>
      <ProfileContent />
    </React.Suspense>
  );
}
