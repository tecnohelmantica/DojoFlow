"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import {
  Settings, User, Medal, BookOpen, Send, TrendingUp,
  MessageSquare, Cpu, ExternalLink, Shield, Mail, IdCard, LogOut, Key, Upload, Sparkles, Brain, Award, Zap, Search, ChevronRight, CheckCircle2, Clock, Play, FileText, ArrowLeft, Stars, Rocket, Presentation
} from 'lucide-react';
import TutorExperience from '@/components/TutorExperience';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import TopHeader from '../../components/TopHeader';
import NinjaChallenges from '../../components/NinjaChallenges';
import { getPlanetById } from '../../lib/planets';
import ResourceUploader from '../../components/ResourceUploader';
import './page.css';

const MASTER_PROFESOR_ID = '5ec7cea5-1dfa-461f-8a07-ecf1da1854a6';

function ProfileContent() {
  const router = useRouter();
  const { session, role, profile: authProfile, loading: authLoading, signOut, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const activePlanet = searchParams.get('planet') || 'scratch';

  const [messages, setMessages] = useState([
    { role: 'tutor', text: `Saludos, Explorer. He analizado tu lógica actual en el sector ${activePlanet.toUpperCase()}. ¿En qué puedo ayudarte hoy?` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isNinjaValidator, setIsNinjaValidator] = useState(false);
  const [evidenceStatus, setEvidenceStatus] = useState('No Iniciado');

  // ── Recursos del Maestro ──
  const [teacherResources, setTeacherResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // ── Estados de Docente ──
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updateMsg, setUpdateMsg] = useState(null);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [studentLevel, setStudentLevel] = useState('Junior');
  const [showUploader, setShowUploader] = useState(false);
  const [selectedScroll, setSelectedScroll] = useState(null); // Nuevo: Visor de Pergaminos

  // ── Estadísticas de Docente ──
  const [teacherStats, setTeacherStats] = useState({
    clases: 0,
    alumnos: 0,
    recursos: 0
  });

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
    const savedLevel = localStorage.getItem(`dojoflow_level_${activePlanet}`);
    if (savedLevel) {
      setAssessmentCompleted(true);
      setStudentLevel(savedLevel);
    } else {
      setAssessmentCompleted(false);
    }
  }, [activePlanet]);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { router.push('/auth'); return; }

    const loadData = async () => {
      // 1. Perfil completo
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
          .select('status')
          .eq('student_id', session.user.id)
          .eq('planet_id', activePlanet)
          .maybeSingle();
        if (prog) setEvidenceStatus(prog.status);

        // Buscar aulas del alumno
        const { data: memberships } = await supabase
          .from('clase_alumnos')
          .select('clase_id')
          .eq('alumno_id', session.user.id);

        const claseIds = (memberships || []).map(m => m.clase_id);

        // 🗺️ 1. Fetch Global/Master Resources
        const { data: globalRes } = await supabase
          .from('recursos_docentes')
          .select('*')
          .or(`profesor_id.eq.${MASTER_PROFESOR_ID},contenido->meta->isGlobal.eq.true,contenido->isMaster.eq.true`)
          .ilike('tecnologia', activePlanet);

        let classResourcesCombined = [];

        // 🏫 2. Fetch Class Specific Resources if any
        if (claseIds.length > 0) {
          const { data: classResources } = await supabase
            .from('clase_recursos')
            .select(`recurso_id, recursos_docentes (*)`)
            .in('clase_id', claseIds);

          classResourcesCombined = (classResources || [])
            .map(r => r.recursos_docentes)
            .filter(r => r && r.tecnologia?.toLowerCase() === activePlanet.toLowerCase());
        }

        // 🤝 3. Merge and De-duplicate
        const allResourcesMap = new Map();

        // Add global first
        (globalRes || []).forEach(r => allResourcesMap.set(r.id, r));

        // Add class specific
        classResourcesCombined.forEach(r => allResourcesMap.set(r.id, r));

        setTeacherResources(Array.from(allResourcesMap.values()));
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
    localStorage.setItem(`dojoflow_level_${activePlanet}`, level);
    setStudentLevel(level);
    setAssessmentCompleted(true);
  };

  if (authLoading || loading) return <div className="flex-center" style={{ minHeight: '60vh', color: '#8a8a9e' }}>Sincronizando parámetros...</div>;

  if (role === 'profesor') {
    return (
      <div className="profile-wrapper" style={{ padding: '20px 5%' }}>
        <TopHeader />

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
                <img src={profile?.avatar_url || "https://i.pravatar.cc/150?u=docente"} alt="Avatar" className="avatar-img" />
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
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-purple)', letterSpacing: '1px' }}>{activePlanet.toUpperCase()} SECTOR</span>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
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

            <div className="teacher-account-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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
                    <GlowButton color="teal" className="w-100" onClick={() => router.push('/aulas')}>
                      <BookOpen size={16} style={{ marginRight: '8px' }} /> Ir a Mis Aulas
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

  if (!assessmentCompleted) {
    return (
      <div className="layout-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f0f5f7',
        padding: '20px'
      }}>
        <TutorExperience
          technology={activePlanet}
          onComplete={handleAssessmentComplete}
        />
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    setIsTyping(true);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: isNinjaValidator ? 'validador' : 'tutor', message: userMessage, planet: activePlanet })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'tutor', text: data.text }]);
      if (data.text.includes('[VALIDADO]')) {
        setIsNinjaValidator(false);
        setEvidenceStatus('Validado');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'tutor', text: 'Fallo neural. Mis sensores están bloqueados.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="layout-container" style={{ padding: '20px 5%' }}>
      <TopHeader />

      <div className="profile-dashboard-grid">
        <div className="profile-col-left">
          <div className="avatar-hero">
            <div className="avatar-circle" style={{ position: 'relative' }}>
              <img src={profile?.avatar_url || "https://i.pravatar.cc/150?img=11"} alt="Avatar" className="avatar-img" />
              <div className="lvl-badge-pop">LVL 42</div>

              <button
                onClick={() => setIsChangingAvatar(!isChangingAvatar)}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: 'white',
                  border: '2px solid var(--accent-purple)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Settings size={14} className="text-muted" />
              </button>
            </div>

            {isChangingAvatar && (
              <div style={{ marginTop: '15px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 15px',
                    background: 'rgba(156, 39, 176, 0.05)',
                    borderRadius: '8px',
                    border: '2px dashed var(--accent-purple)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--accent-purple)',
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
              marginBottom: '4px',
              textAlign: 'center'
            }}>{profile?.alias || 'Explorer_Kai'}</h1>
            <p className="hero-rank" style={{ textAlign: 'center' }}>RANK: GRAND ARCHITECT OF THE VOID</p>
          </div>

          <div className="stats-row">
            <GlassCard className="stat-card">
              <p>XP POINTS</p>
              <h2 className="text-teal">12,850</h2>
            </GlassCard>
            <GlassCard className="stat-card">
              <p>STREAK</p>
              <h2 className="text-purple">14 Days</h2>
            </GlassCard>
          </div>
        </div>

        <div className="profile-col-right">
          <div className="section-title" style={{ marginTop: '16px' }}>
            <div className="medal-icon bg-teal text-white chat-logo"><MessageSquare size={16} /></div>
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.2rem' }}>NotebookLM Socratic Tutor</h2>
          </div>
          <GlassCard className="tutor-card">
            <div className="chat-thread" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {messages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.role === 'tutor' ? 'tutor-bubble' : 'user-bubble'}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input type="text" placeholder="Haz una consulta socrática..." className="tutor-input" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button className="tutor-send-btn" onClick={handleSendMessage}><Send size={18} /></button>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="full-width-profile-content" style={{ animation: 'fadeIn 0.8s ease-out' }}>
        <div className="action-grid-2col">
          {/* LANZADERAS ESTELARES */}
          <div className="launchpads-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e', marginBottom: '12px', fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: '800' }}>
              <Rocket size={14} color="var(--accent-purple)" /> LANZADERAS
            </h3>
            <GlassCard style={{ padding: '12px', height: '100%', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {teacherResources.filter(r => r.tipo_recurso === 'lanzadera').length > 0 ? (
                  teacherResources.filter(r => r.tipo_recurso === 'lanzadera').map((launch, idx) => (
                    <div
                      key={idx}
                      onClick={() => window.open(launch.contenido.url, '_blank')}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(156, 39, 176, 0.05)',
                        border: '1px solid rgba(156, 39, 176, 0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(156, 39, 176, 0.12)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(156, 39, 176, 0.05)'}
                    >
                      <span className="truncate-text" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1a1a2e' }}>{launch.nombre_recurso}</span>
                      <ExternalLink size={14} color="#888" />
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', fontStyle: 'italic', margin: 'auto' }}>
                    Sin lanzaderas activas en este sector.
                  </p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* PÁGINA OFICIAL (Notebook Style) */}
          <div className="official-page-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e', marginBottom: '12px', fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: '800' }}>
              <Cpu size={14} color="var(--accent-teal)" /> PÁGINA OFICIAL
            </h3>
            <GlassCard 
              className="notebook-card official-page-card"
              style={{ padding: '0', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Notebook Header */}
              <div 
                className="notebook-header" 
                style={{ 
                  position: 'relative', 
                  height: '140px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '10px',
                  background: 'rgba(255,255,255,0.5)'
                }}
              >
                <div className="notebook-planet-logo-wrapper">
                  <img 
                    src={getPlanetById(activePlanet)?.image} 
                    alt={getPlanetById(activePlanet)?.name} 
                    className="notebook-planet-img"
                  />
                </div>
                <div 
                  className="notebook-status-overlay" 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '60%', 
                    background: `linear-gradient(0deg, ${getPlanetById(activePlanet)?.barColor || '#0dcfcf'}CC 0%, transparent 100%)` 
                  }} 
                />
                <div className="lvl-badge-notebook" style={{ background: getPlanetById(activePlanet)?.color || '#e0f5f5', color: getPlanetById(activePlanet)?.barColor || '#0dcfcf' }}>
                  LVL 04
                </div>
              </div>

              {/* Notebook Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0' }}>
                  {getPlanetById(activePlanet)?.name === 'Code.org' 
                    ? 'Code.org: Academia Digital' 
                    : getPlanetById(activePlanet)?.name}
                </h3>
                
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, flex: 1 }}>
                  {getPlanetById(activePlanet)?.description || getPlanetById(activePlanet)?.subtitle || 'Explora y construye en este sector.'}
                  <br /><br />
                  {getPlanetById(activePlanet)?.recommendation && (
                    <>
                      <strong>Recomendación Ninja:</strong> {getPlanetById(activePlanet)?.recommendation}
                    </>
                  )}
                </p>

                {/* Progress Mini Bar */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: getPlanetById(activePlanet)?.barColor || '#0dcfcf' }}>32% COMPLETO</span>
                  </div>
                  <div style={{ height: '4px', background: '#f0f5f7', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '32%', height: '100%', background: getPlanetById(activePlanet)?.barColor || '#0dcfcf' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  {getPlanetById(activePlanet)?.buttons ? (
                    getPlanetById(activePlanet).buttons.map((btn, bidx) => (
                      <GlowButton
                        key={bidx}
                        color={btn.color || 'teal'}
                        className="w-100"
                        style={{ padding: '10px', fontSize: '0.75rem' }}
                        onClick={() => window.open(btn.url, '_blank')}
                      >
                        {btn.icon === 'Sparkles' && <Sparkles size={14} style={{ marginRight: '6px' }} />}
                        {btn.icon === 'Play' && <Play size={14} style={{ marginRight: '6px' }} />}
                        {!['Sparkles', 'Play'].includes(btn.icon) && <ExternalLink size={14} style={{ marginRight: '6px' }} />}
                        {btn.label}
                      </GlowButton>
                    ))
                  ) : (
                    <GlowButton
                      color="teal"
                      className="w-100"
                      style={{ padding: '10px', fontSize: '0.75rem' }}
                      onClick={() => window.open(getPlanetById(activePlanet)?.url, '_blank')}
                    >
                      <ExternalLink size={14} style={{ marginRight: '6px' }} /> ENTRAR AL PLANETA
                    </GlowButton>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>


        <div className="scrolls-section" style={{ marginTop: '30px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e', marginBottom: '15px', fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: '800' }}>
            <TrendingUp size={14} className="text-purple" /> ⛩️ RECURSOS DE APOYO
          </h3>
          
          <div className="scrolls-grid-3col" style={{ marginTop: '10px' }}>
            {teacherResources
                .filter(r => ['infografia', 'video', 'presentacion', 'Infografia', 'Quiz', 'Podcast', 'Mapa Mental', 'Slide', 'Explicación', 'Documento'].includes(r.tipo_recurso))
                .length > 0 ? (
                teacherResources
                  .filter(r => ['infografia', 'video', 'presentacion', 'Infografia', 'Quiz', 'Podcast', 'Mapa Mental', 'Slide', 'Explicación', 'Documento'].includes(r.tipo_recurso))
                  .slice(0, 8).map((scroll, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedScroll(scroll)}
                  style={{ textDecoration: 'none' }}
                >
                  <GlassCard 
                    style={{ padding: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', border: selectedScroll?.id === scroll.id ? `2px solid ${getPlanetById(activePlanet)?.barColor}` : '1px solid rgba(13,207,207,0.1)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: selectedScroll?.id === scroll.id ? 'rgba(13,207,207,0.05)' : 'rgba(255,255,255,0.7)' }}
                  >
                    <div style={{ background: 'rgba(13, 207, 207, 0.05)', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      {scroll.tipo_recurso?.toLowerCase().includes('info') && <FileText size={16} color="#0dcfcf" />}
                      {scroll.tipo_recurso?.toLowerCase().includes('video') && <Play size={16} color="#9c27b0" />}
                      {scroll.tipo_recurso?.toLowerCase().includes('presen') && <Presentation size={16} color="#ff9800" />}
                      {scroll.tipo_recurso?.toLowerCase().includes('slide') && <Layout size={16} color="#ff9800" />}
                      {scroll.tipo_recurso?.toLowerCase().includes('quiz') && <Award size={16} color="#0097e6" />}
                      {scroll.tipo_recurso?.toLowerCase().includes('cuest') && <Award size={16} color="#0097e6" />}
                      {scroll.tipo_recurso?.toLowerCase().includes('mapa') && <Brain size={16} color="#9c27b0" />}
                      {scroll.tipo_recurso?.toLowerCase().includes('pod') && <Headphones size={16} color="#5c6ac4" />}
                      {scroll.tipo_recurso?.toLowerCase().includes('explic') && <MessageSquare size={16} color="#4cd137" />}
                    </div>
                    <span className="truncate-text" style={{ fontSize: '0.65rem', color: '#1a1a2e', fontWeight: '700' }}>
                      {scroll.nombre_recurso || scroll.tipo_recurso}
                    </span>
                    {scroll.contenido?.meta?.isGlobal || scroll.contenido?.isMaster || scroll.profesor_id === MASTER_PROFESOR_ID ? (
                      <span style={{ fontSize: '0.5rem', color: '#0dcfcf', fontWeight: '800', marginTop: '2px' }}>✦ MAESTRO</span>
                    ) : (
                      <span style={{ fontSize: '0.5rem', color: '#9c27b0', fontWeight: '800', marginTop: '2px' }}>✦ RECURSO</span>
                    )}
                  </GlassCard>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed #ccc' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#888' }}>Aún no hay recursos de apoyo disponibles.</p>
              </div>
            )}
          </div>

          {/* 📜 VISOR INTEGRADO (VISTA DIRECTA) */}
          {selectedScroll ? (
            <div className="integrated-scroll-viewer" style={{ marginTop: '20px', animation: 'slideDownIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <GlassCard style={{ padding: '0', overflow: 'hidden', border: `2px solid ${getPlanetById(activePlanet)?.barColor}33`, position: 'relative' }}>
                <div style={{ padding: '15px 25px', background: `${getPlanetById(activePlanet)?.barColor}11`, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BookOpen size={16} color={getPlanetById(activePlanet)?.barColor} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', fontFamily: 'Outfit' }}>{selectedScroll.nombre_recurso || selectedScroll.tipo_recurso}</span>
                   </div>
                   <button 
                     onClick={() => setSelectedScroll(null)}
                     style={{ background: 'white', border: '1px solid #eee', borderRadius: '8px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                   >
                     CERRAR VISTA
                   </button>
                </div>
                
                <div style={{ background: 'white', minHeight: '400px' }}>
                  {selectedScroll.contenido?.markdown ? (
                    <div style={{ padding: '40px', color: '#1a1a2e', fontSize: '1.05rem', lineHeight: '1.7', background: 'white' }} 
                      dangerouslySetInnerHTML={{ 
                        __html: selectedScroll.contenido.markdown
                          .replace(/^# (.*)/gm, '<h1 style="font-family:Outfit; font-weight:900; color:#1a1a2e; margin-bottom:20px; font-size:2.2rem; border-left:8px solid var(--accent-purple); padding-left:15px; background:rgba(156,39,176,0.03); padding-top:10px; padding-bottom:10px;">$1</h1>')
                          .replace(/^## (.*)/gm, '<h2 style="font-family:Outfit; font-weight:800; color:#1a1a2e; margin-top:35px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; display:flex; align-items:center; gap:10px;"><span style="color:var(--accent-purple)">✦</span> $1</h2>')
                          .replace(/^### (.*)/gm, '<h3 style="font-family:Outfit; font-weight:700; color:var(--accent-teal); margin-top:20px; margin-bottom:10px;">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-purple); font-weight:800;">$1</strong>')
                          .replace(/^- (.*)/gm, '<li style="margin-left:20px; margin-bottom:10px; list-style-type:square; color:#444;">$1</li>')
                          .replace(/\n\n/g, '<p style="margin-bottom:15px;"></p>')
                          .replace(/\n/g, '<br/>')
                      }} />
                  ) : (selectedScroll.contenido?.url && (selectedScroll.contenido.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null)) ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                       <img src={selectedScroll.contenido.url} alt="Recurso Maestro" style={{ maxWidth: '100%', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }} />
                    </div>
                  ) : selectedScroll.contenido?.url ? (
                    <div style={{ height: '75vh', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#f0f2f5' }}>
                      <div className="iframe-loader" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
                         <div className="spinner" style={{ borderTopColor: 'var(--accent-purple)' }} />
                         <p style={{ fontSize: '0.7rem', marginTop: '10px', color: '#888' }}>Inyectando conocimiento...</p>
                      </div>
                      <iframe 
                        src={selectedScroll.contenido.url.includes('drive.google.com') ? selectedScroll.contenido.url.replace('/view', '/preview').replace('/edit', '/preview') : selectedScroll.contenido.url} 
                        style={{ width: '100%', flex: 1, border: 'none', position: 'relative', zIndex: 2, background: 'transparent' }}
                        title="Visor de Recurso"
                        onLoad={(e) => {
                          const loader = e.currentTarget.previousSibling;
                          if (loader) loader.style.display = 'none';
                        }}
                      />
                      <div style={{ padding: '15px', textAlign: 'center', borderTop: '1px solid #eee', background: '#f8f9fa', zIndex: 3 }}>
                        <GlowButton color="teal" onClick={() => window.open(selectedScroll.contenido.url, '_blank')} style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                          <ExternalLink size={14} style={{ marginRight: '8px' }} /> ABRIR EN VENTANA COMPLETA
                        </GlowButton>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#8a8a9e' }}>
                      <Zap size={32} style={{ marginBottom: '15px', opacity: 0.3 }} />
                      <p>Este pergamino no contiene datos legibles en este momento.</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', border: '1px dashed rgba(13,207,207,0.2)', marginTop: '10px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#8a8a9e', fontWeight: '500' }}>
                Haz clic en una ficha para desplegar su conocimiento directamente aquí.
              </p>
            </div>
          )}
        </div>

        {/* 🥷 RETOS NINJA DEL DOJO */}
        {!getPlanetById(activePlanet)?.noChallenges && (
          <div className="challenges-section" style={{ marginTop: '30px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a2e', marginBottom: '15px', fontFamily: 'Outfit', fontSize: '1rem', fontWeight: '800' }}>
              <Zap size={18} color={getPlanetById(activePlanet)?.barColor || '#0dcfcf'} /> ITINERARIO NINJA {getPlanetById(activePlanet)?.name?.toUpperCase()}
            </h3>
            <NinjaChallenges
              planetId={activePlanet}
              userId={session?.user?.id}
              accentColor={getPlanetById(activePlanet)?.barColor || '#0dcfcf'}
              targetLevel={studentLevel}
            />
          </div>
        )}
      </div>

      {showUploader && (
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
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowUploader(false)}>
          <div style={{ width: '100%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <ResourceUploader
              currentUser={session?.user}
              role={role}
              planet={activePlanet}
              onUploadSuccess={() => {
                setShowUploader(false);
                setEvidenceStatus('En Revisión');
              }}
            />
            <button
              onClick={() => setShowUploader(false)}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
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
