"use client";
import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import GlowButton from '../components/GlowButton';
import MisAulas from '../components/MisAulas';
import { useAuth } from '../components/AuthProvider';
import { Bell, User, Code, Puzzle, Cpu as OriginalCpu, MonitorPlay, Zap, Gamepad2, Box, Smartphone, Brain, Globe, Eye, EyeOff, LogOut, UserPlus, ExternalLink, Castle, Star, Clock, XCircle } from 'lucide-react';
const Cpu = OriginalCpu;
const ArduinoIcon = OriginalCpu;

import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import AuthPage from './auth/page';
import TopHeader from '../components/TopHeader';
import JoinClassModal from '../components/JoinClassModal';
import './page.css';

import { PLANETS } from '../lib/planets';

export default function HomePage() {
  const router = useRouter();
  const { session, profile, role, loading, signOut, isGuest } = useAuth();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);
  
  // Estados para unirse a aula
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Detectar flujo de recuperación de contraseña
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 
       (window.location.hash.includes('type=recovery') || window.location.search.includes('update_pwd=true'))) {
       setIsUpdatingPassword(true);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsUpdatingPassword(true);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Icon Mapping Helper
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'MonitorPlay': return <MonitorPlay />;
      case 'Puzzle': return <Puzzle />;
      case 'Cpu': return <Cpu />;
      case 'Gamepad2': return <Gamepad2 />;
      case 'Box': return <Box />;
      case 'Smartphone': return <Smartphone />;
      case 'Brain': return <Brain />;
      case 'Code': return <Code />;
      case 'Globe': return <Globe />;
      default: return <Zap />;
    }
  };

  // Estado para guardar el progreso del alumno por planeta
  const [studentProgress, setStudentProgress] = useState({});

  // Estado para aulas del alumno y sus enlaces
  const [studentLaunchers, setStudentLaunchers] = useState({});
  const [studentAulas, setStudentAulas] = useState([]);

  const fetchStudentData = async () => {
    const activeUserId = isGuest ? 'guest_user' : session?.user?.id;
    if (!activeUserId) return;

    // 1. Obtener IDs y Nombres de las clases en las que está el alumno (solo si no es guest)
    if (!isGuest && role === 'alumno') {
      try {
        const { data: vincs } = await supabase
          .from('clase_alumnos')
          .select('clase_id, clases(id, nombre_clase, planetas_activos, actividades_activas)')
          .eq('alumno_id', activeUserId);
        
        const aulas = (vincs || []).map(v => v.clases).filter(Boolean);
        setStudentAulas(aulas);

        if (aulas.length > 0) {
          const claseIds = aulas.map(a => a.id);
          const { data: recs } = await supabase
            .from('clase_recursos')
            .select('*, recursos_docentes(*)')
            .in('clase_id', claseIds);
          
          const launchers = {};
          (recs || []).forEach(r => {
            const res = r.recursos_docentes;
            if (res && res.tipo_recurso === 'enlace') {
              if (!launchers[res.tecnologia]) {
                launchers[res.tecnologia] = res.contenido.markdown;
              }
            }
          });
          setStudentLaunchers(launchers);
        }
      } catch (e) {
        console.error("Error al obtener aulas:", e);
      }
    }

    // 2. Obtener progreso de retos (user_challenges) y explore_progress
    let userChalls = [];
    let exploreProg = [];

    if (isGuest) {
      if (typeof window !== 'undefined') {
        userChalls = JSON.parse(localStorage.getItem('guest_user_challenges') || '[]');
        exploreProg = JSON.parse(localStorage.getItem('guest_explore_progress') || '[]');
      }
    } else {
      try {
        const { data: dbChalls } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('student_id', activeUserId);
        userChalls = dbChalls || [];

        const { data: dbExplore } = await supabase
          .from('explore_progress')
          .select('*')
          .eq('student_id', activeUserId);
        exploreProg = dbExplore || [];
      } catch (e) {
        console.error("Error al obtener retos:", e);
      }
    }

    const progressMap = {};
    
    // Inicializar mapas para cada tecnología en PLANETS
    PLANETS.forEach(p => {
      progressMap[p.id] = {
        complete: 0,
        level: 1,
        validatedCount: 0,
        inReviewCount: 0,
        corregirCount: 0,
        planetStatus: 'No iniciado'
      };
    });

    // Mapear explore_progress (progreso general del planeta)
    (exploreProg || []).forEach(ep => {
      const planetId = ep.planet_id;
      if (progressMap[planetId]) {
        progressMap[planetId].planetStatus = ep.status || 'No iniciado';
        if (ep.status === 'Validado') {
          progressMap[planetId].complete = 100;
        }
      }
    });

    // Mapear user_challenges (retos individuales)
    (userChalls || []).forEach(uc => {
      const planetId = uc.planet_id;
      if (progressMap[planetId]) {
        if (uc.status === 'Validado') {
          progressMap[planetId].validatedCount += 1;
        } else if (uc.status === 'En revisión') {
          progressMap[planetId].inReviewCount += 1;
        } else if (uc.status === 'Corregir') {
          progressMap[planetId].corregirCount += 1;
        }
      }
    });

    // Mapear levels de localStorage por planeta
    if (typeof window !== 'undefined') {
      PLANETS.forEach(p => {
        const savedLevel = localStorage.getItem(`dojoflow_level_${p.id}`);
        if (savedLevel && progressMap[p.id]) {
          progressMap[p.id].level = parseInt(savedLevel) || 1;
        }
      });
    }

    // Calcular el porcentaje de completado para cada planeta
    const PLANET_TOTAL_CHALLENGES = {
      'code': 30,
      'scratch': 66,
      'makecode-microbit': 30,
      'makecode-arcade': 30,
      'tinkercad': 36,
      'arduino': 24,
      'appinventor': 26,
      'ia': 27,
      'python': 73,
      'html': 63
    };

    PLANETS.forEach(p => {
      const mapItem = progressMap[p.id];
      if (mapItem && mapItem.planetStatus !== 'Validado') {
        const total = PLANET_TOTAL_CHALLENGES[p.id] || 30;
        const valCount = mapItem.validatedCount;
        if (valCount > 0) {
          const calcPerc = Math.min(100, Math.round((valCount / total) * 100));
          mapItem.complete = Math.max(1, calcPerc);
        }
      }
    });

    setStudentProgress(progressMap);
  };

  // Cargar lanzadores y progresos del alumno
  React.useEffect(() => {
    fetchStudentData();
  }, [session?.user?.id, role, isGuest]);

  // Determinar planetas permitidos según las clases del alumno
  let allowedPlanets = new Set(PLANETS.map(p => p.id));
  if (role === 'alumno' && !isGuest && studentAulas.length > 0) {
    allowedPlanets = new Set();
    studentAulas.forEach(aula => {
      if (aula.planetas_activos && aula.planetas_activos.length > 0) {
        aula.planetas_activos.forEach(pid => allowedPlanets.add(pid));
      }
    });
  }

  // Construir planetas enriquecidos con progresos reales
  const dynamicPlanets = PLANETS.filter(p => allowedPlanets.has(p.id) || role === 'profesor').map(p => {
    const prog = studentProgress[p.id] || {
      complete: 0,
      level: 1,
      validatedCount: 0,
      inReviewCount: 0,
      corregirCount: 0,
      planetStatus: 'No iniciado'
    };
    return {
      ...p,
      icon: getIcon(p.icon),
      level: prog.level || 1,
      complete: prog.complete || 0,
      validatedCount: prog.validatedCount || 0,
      inReviewCount: prog.inReviewCount || 0,
      corregirCount: prog.corregirCount || 0,
      planetStatus: prog.planetStatus || 'No iniciado'
    };
  });

  // Estado de carga - Esperar a que el perfil se cargue si hay sesión
  if (loading || (session && !role)) {
    return (
      <div style={{ display:'flex', flexDirection: 'column', justifyContent:'center', alignItems:'center', height:'100vh', background: 'var(--color-bg)', color:'#8a8a9e', fontFamily:'Outfit' }}>
        <div className="spinner" style={{ marginBottom: '20px', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--accent-teal)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        Sincronizando Identidad...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Sin sesión y NO estamos en recuperación → mostrar Gateway
  if (!session && !isUpdatingPassword) {
    return <AuthPage />;
  }

  // Interfaz Especial Flotante para Forzar Cambio de Clave
  if (isUpdatingPassword) {
    const handleUpdate = async () => {
      if (newPassword.length < 8) {
         setUpdateMsg("La contraseña debe tener al menos 8 caracteres.");
         return;
      }
      setUpdateMsg("Guardando nueva llave...");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setUpdateMsg("Error: " + error.message);
      } else {
        setUpdateMsg("¡Contraseña blindada! Ingresando al núcleo...");
        setTimeout(() => {
           setIsUpdatingPassword(false);
           window.location.hash = '';
        }, 2000);
      }
    };

    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'var(--color-bg)' }}>
        <GlassCard style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <h2 className="glow-text-cyan" style={{ marginBottom: '16px' }}>Forjar Nueva Contraseña</h2>
          <p style={{ color: '#8a8a9e', marginBottom: '24px', fontSize: '0.9rem' }}>Tu señal fue autenticada. Define la nueva contraseña de tu pasaporte galáctico.</p>
          
          <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Nueva Contraseña Secreta" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: '#8a8a9e', cursor: 'pointer' }}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {updateMsg && <div style={{ color: updateMsg.includes('Error') || updateMsg.includes('al menos') ? '#ff6b6b' : 'var(--accent-teal)', marginBottom: '16px', fontSize: '0.85rem' }}>{updateMsg}</div>}

          <GlowButton color="teal" onClick={handleUpdate} className="w-100">
             GUARDAR Y ENTRAR
          </GlowButton>
        </GlassCard>
      </div>
    );
  }

  const handleJoinClass = async (code) => {
    if (isGuest || session?.user?.id === 'guest_user') {
      showToast('err', 'Debes registrarte o iniciar sesión para unirte a un aula.');
      setIsJoinModalOpen(false);
      return;
    }
    
    setJoinLoading(true);
    try {
      const response = await fetch('/api/aulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unirse_con_codigo',
          codigo: code,
          alumnoId: session.user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('ok', data.message || `¡Genial! Ya eres parte de ${data.clase.nombre_clase || data.clase.nombre}`);
        setIsJoinModalOpen(false);
        fetchStudentData(); // Recargar datos del alumno
      } else {
        showToast('err', data.error || 'No se pudo unir a la clase. Revisa el código.');
      }
    } catch (err) {
      showToast('err', 'Error de conexión con el centro de mando.');
    } finally {
      setJoinLoading(false);
    }
  };

  // Determinar vista por rol real (sin switcher)
  const isProfesor = role === 'profesor';

  return (
    <div className="home-container">
      {/* HEADER */}
      <TopHeader />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: '14px 24px',
          borderRadius: '12px',
          background: toast.type === 'ok' ? 'rgba(20, 184, 166, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          fontWeight: '700',
          fontFamily: 'Outfit',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'toastIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
        }}>
          {toast.type === 'ok' ? '✅' : '❌'} {toast.text}
          <style jsx>{`
            @keyframes toastIn {
              from { opacity: 0; transform: translate(-50%, -20px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
        </div>
      )}

      {/* HERO — contenido adaptado al rol */}
      <div className="home-hero">
        <h4 className={isProfesor ? "text-purple subtitle" : "text-teal subtitle"}>
          {isProfesor ? 'PANEL DE CONTROL ACADÉMICO' : 'THE ETHEREAL LABORATORY'}
        </h4>
        <h1 className="hero-title">{isProfesor ? 'Centro de Gestión' : 'Galaxia Educativa'}</h1>
        <p className="hero-desc">
          {isProfesor 
            ? 'Supervisa el progreso de tus aulas, gestiona tus materiales de biblioteca y valida los retos de tus alumnos.'
            : 'Bienvenido de nuevo, Explorador. Tus conexiones neuronales se expanden. Continúa tu viaje y desbloquea código.'}
        </p>

        {isProfesor && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <GlassCard style={{
              maxWidth: '600px',
              padding: '20px 24px',
              background: 'rgba(156, 39, 176, 0.05)',
              border: '1.5px dashed rgba(156, 39, 176, 0.3)',
              borderRadius: '16px',
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              <p style={{ margin: 0, color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: '700', lineHeight: '1.5' }}>
                👩‍🏫 DojoFlow te ofrece potentes herramientas de gestión. ¿Quieres un repaso rápido de tus poderes como docente?
              </p>
              <button
                onClick={() => window.dispatchEvent(new Event('dojoflow_show_onboarding'))}
                style={{
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, var(--accent-purple), #d946ef)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '0.75rem',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(156, 39, 176, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(156, 39, 176, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(156, 39, 176, 0.2)';
                }}
              >
                💡 ABRIR GUÍA RÁPIDA DE DOCENTE
              </button>
            </GlassCard>
          </div>
        )}
        
        {!isProfesor && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            {isGuest && (
              <GlassCard style={{
                maxWidth: '600px',
                padding: '20px 24px',
                background: 'rgba(13, 207, 207, 0.05)',
                border: '1.5px dashed rgba(13, 207, 207, 0.3)',
                borderRadius: '16px',
                textAlign: 'center',
                marginBottom: '15px'
              }}>
                <p style={{ margin: 0, color: 'var(--accent-teal)', fontSize: '0.85rem', fontWeight: '700', lineHeight: '1.5' }}>
                  🕵️‍♂️ Estás explorando DojoFlow en Modo Invitado. ¿Quieres aprender a navegar por la galaxia de planetas y retos?
                </p>
                <button
                  onClick={() => window.dispatchEvent(new Event('dojoflow_show_onboarding'))}
                  style={{
                    marginTop: '12px',
                    background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-cyan))',
                    border: 'none',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(13, 207, 207, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(13, 207, 207, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(13, 207, 207, 0.2)';
                  }}
                >
                  💡 ABRIR GUÍA RÁPIDA DE INVITADO
                </button>
              </GlassCard>
            )}
            {studentAulas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                  {studentAulas.map(aula => (
                    <div key={aula.id} style={{ 
                      background: 'rgba(20, 184, 166, 0.1)', 
                      border: '1px solid rgba(20, 184, 166, 0.2)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#128989',
                      fontSize: '0.8rem',
                      fontWeight: '800'
                    }}>
                      <Castle size={14} /> AULA ACTIVA: {(aula.nombre_clase || aula.nombre || '').toUpperCase()}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setIsJoinModalOpen(true)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#64748b', 
                    fontSize: '0.7rem', 
                    fontWeight: '800', 
                    textDecoration: 'underline', 
                    cursor: 'pointer',
                    marginTop: '5px'
                  }}
                >
                  INGRESAR A OTRA CLASE
                </button>
              </div>
            ) : (
              <GlowButton color="teal" onClick={() => setIsJoinModalOpen(true)} style={{ padding: '14px 28px', fontSize: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={20} fill="currentColor" /> INGRESAR A UN AULA
                </span>
              </GlowButton>
            )}
          </div>
        )}
      </div>

      <JoinClassModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        onJoin={handleJoinClass}
        loading={joinLoading}
      />

      {/* SECCIÓN PLANETAS TECNOLÓGICOS (Centro de Gestión) */}
      <h2 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', marginBottom: '16px' }}>
        {role === 'profesor' ? 'Cuadernos Activos de la Clase' : 'Tus Planetas Tecnológicos'}
      </h2>

      <div className="planets-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '40px' }}>
        {dynamicPlanets.map((planet) => {
          const isAulaConectada = !!studentLaunchers[planet.id];
          const launcherUrl = studentLaunchers[planet.id];
          const isProfesor = role === 'profesor';

          // Determinar bordes e iluminaciones premium basados en retos validados/espesa/ajustar
          let cardBorder = '1px solid rgba(255,255,255,0.1)';
          let cardShadow = 'none';
          
          if (!isProfesor) {
            if (planet.planetStatus === 'Validado' || (planet.validatedCount > 0 && planet.inReviewCount === 0 && planet.corregirCount === 0)) {
              cardBorder = '1.5px solid rgba(34, 197, 94, 0.4)';
              cardShadow = '0 0 15px rgba(34, 197, 94, 0.08)';
            } else if (planet.corregirCount > 0) {
              cardBorder = '1.5px solid rgba(239, 68, 68, 0.4)';
              cardShadow = '0 0 15px rgba(239, 68, 68, 0.08)';
            } else if (planet.inReviewCount > 0) {
              cardBorder = '1.5px solid rgba(245, 158, 11, 0.4)';
              cardShadow = '0 0 15px rgba(245, 158, 11, 0.08)';
            }
          }

          return (
            <div key={planet.id} className="planet-card-wrapper" style={{ animation: 'fadeInUp 0.6s ease-out backwards' }}>
              <GlassCard 
                className="planet-card" 
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: cardBorder,
                  boxShadow: cardShadow
                }}
                onClick={() => {
                  if (isProfesor) {
                    router.push(`/studio/${planet.id}`);
                  } else {
                    router.push(`/profile?planet=${planet.id}`);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  if (!isProfesor) {
                    if (planet.planetStatus === 'Validado') {
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 0 25px rgba(34, 197, 94, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.6)';
                    } else if (planet.corregirCount > 0) {
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 0 25px rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                    } else if (planet.inReviewCount > 0) {
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 0 25px rgba(245, 158, 11, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
                    } else {
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 0 20px rgba(13, 207, 207, 0.15)';
                      e.currentTarget.style.borderColor = planet.barColor + '44';
                    }
                  } else {
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 0 20px rgba(13, 207, 207, 0.15)';
                    e.currentTarget.style.borderColor = planet.barColor + '44';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = cardShadow;
                  e.currentTarget.style.borderColor = cardBorder;
                }}
              >
                <div className="planet-header" style={{ position: 'relative', height: '160px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                  {planet.image ? (
                    <img src={planet.image} alt={planet.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                  ) : (
                    planet.icon
                  )}
                  <div className="status-overlay" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: `linear-gradient(0deg, ${planet.barColor}CC 0%, transparent 100%)` }} />
                  
                  {isAulaConectada ? (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#e0f5f5', color: '#128989', padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <Zap size={10} fill="#128989" /> MISIÓN DE CLASE
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', color: planet.barColor, padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <Globe size={10} /> SECTOR ABIERTO
                    </div>
                  )}

                  {!isProfesor && planet.planetStatus === 'Validado' && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: '900',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      zIndex: 2,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <Star size={10} fill="white" color="white" /> COMPLETADO
                    </div>
                  )}

                  {!isProfesor && planet.planetStatus !== 'Validado' && planet.complete === 100 && (
                    <div className="tag-advanced" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', color: '#128989', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>MASTERY</div>
                  )}
                </div>

                <div className="planet-body" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="planet-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{planet.name}</h3>
                    {!isProfesor && <span className="lvl-badge" style={{ background: planet.color, color: planet.barColor }}>LVL {planet.level < 10 ? `0${planet.level}` : planet.level}</span>}
                  </div>
                  <p className="planet-subtitle" style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, flex: 1 }}>{planet.subtitle}</p>
                  
                  {!isProfesor && (
                    <div className="progress-section" style={{ marginTop: '16px' }}>
                      {/* Micro stats indicators */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {planet.validatedCount > 0 && (
                          <span style={{ 
                            fontSize: '0.58rem', 
                            fontWeight: '900', 
                            padding: '3px 8px', 
                            borderRadius: '20px', 
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                            color: '#16a34a', 
                            border: '1px solid #bbf7d0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.05)'
                          }}>
                            <Star size={9} fill="#16a34a" color="#16a34a" /> {planet.validatedCount} HECHO
                          </span>
                        )}
                        {planet.inReviewCount > 0 && (
                          <span style={{ 
                            fontSize: '0.58rem', 
                            fontWeight: '900', 
                            padding: '3px 8px', 
                            borderRadius: '20px', 
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', 
                            color: '#d97706', 
                            border: '1px solid #fde68a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.05)'
                          }}>
                            <Clock size={9} color="#d97706" /> {planet.inReviewCount} ESPERA
                          </span>
                        )}
                        {planet.corregirCount > 0 && (
                          <span style={{ 
                            fontSize: '0.58rem', 
                            fontWeight: '900', 
                            padding: '3px 8px', 
                            borderRadius: '20px', 
                            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
                            color: '#ef4444', 
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)'
                          }}>
                            <XCircle size={9} color="#ef4444" /> {planet.corregirCount} AJUSTAR
                          </span>
                        )}
                      </div>

                      <div className="progress-labels" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ color: planet.barColor, fontSize: '0.65rem', fontWeight: '800' }}>{planet.complete}% COMPLETO</span>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '6px', background: '#f0f5f7', borderRadius: '3px', overflow: 'hidden' }}>
                        <div className="progress-bar-fill" style={{ width: `${planet.complete}%`, height: '100%', backgroundColor: planet.barColor }}></div>
                      </div>
                    </div>
                  )}

                  {/* ACCIONES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    <GlowButton 
                      color={isProfesor ? "teal" : "premium-cyan"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isProfesor) {
                          router.push(`/studio/${planet.id}`);
                        } else {
                          router.push(`/profile?planet=${planet.id}`);
                        }
                      }}
                      style={!isProfesor && isAulaConectada ? { background: 'linear-gradient(135deg, #0dcfcf, #9c27b0)' } : {}}
                    >
                      {isProfesor ? 'VER CONTENIDO' : '🚀 IA TUTOR / RETOS'}
                    </GlowButton>
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
