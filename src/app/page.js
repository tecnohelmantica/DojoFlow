"use client";
import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import GlowButton from '../components/GlowButton';
import MisAulas from '../components/MisAulas';
import { useAuth } from '../components/AuthProvider';
import { Bell, User, Code, Puzzle, Cpu as OriginalCpu, MonitorPlay, Zap, Gamepad2, Box, Smartphone, Brain, Globe, Eye, EyeOff, LogOut, UserPlus, ExternalLink } from 'lucide-react';
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
  const { session, profile, role, loading, signOut } = useAuth();
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

  // Enriquecer planetas con iconos y estados
  const planets = PLANETS.map(p => ({
    ...p,
    icon: getIcon(p.icon),
    level: 1,
    complete: 0
  }));

  // Estado para aulas del alumno y sus enlaces
  const [studentLaunchers, setStudentLaunchers] = useState({});
  const [studentAulas, setStudentAulas] = useState([]);

  // Cargar lanzadores del alumno
  React.useEffect(() => {
    if (!session?.user?.id || role !== 'alumno') return;

    const fetchLaunchers = async () => {
      // 1. Obtener IDs de las clases en las que está el alumno
      const { data: vincs } = await supabase
        .from('clase_alumnos')
        .select('clase_id')
        .eq('alumno_id', session.user.id);
      
      const claseIds = (vincs || []).map(v => v.clase_id);
      setStudentAulas(claseIds);

      if (claseIds.length === 0) return;

      // 2. Obtener recursos vinculados a esas clases que sean enlaces
      const { data: recs } = await supabase
        .from('clase_recursos')
        .select('*, recursos_docentes(*)')
        .in('clase_id', claseIds);
      
      const launchers = {};
      (recs || []).forEach(r => {
        const res = r.recursos_docentes;
        // Si el recurso es un enlace de la tecnología correspondiente
        if (res && res.tipo_recurso === 'enlace') {
          // Guardamos el primer link encontrado por tecnología
          if (!launchers[res.tecnologia]) {
            launchers[res.tecnologia] = res.contenido.markdown; // Asumimos que la URL está en contenido.markdown para enlaces
          }
        }
      });
      setStudentLaunchers(launchers);
    };

    fetchLaunchers();
  }, [session?.user?.id, role]);

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
        showToast('ok', data.message || `¡Genial! Ya eres parte de ${data.clase.nombre_clase}`);
        setIsJoinModalOpen(false);
        // Podríamos recargar el perfil o las clases aquí si fuera necesario
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
        
        {!isProfesor && (
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <GlowButton color="teal" onClick={() => setIsJoinModalOpen(true)} style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={20} fill="currentColor" /> INGRESAR A UN AULA
              </span>
            </GlowButton>
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

      <div className="planets-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {planets.map((planet) => {
          const isAulaConectada = !!studentLaunchers[planet.id];
          const launcherUrl = studentLaunchers[planet.id];
          const isProfesor = role === 'profesor';

          return (
            <div key={planet.id} className="planet-card-wrapper" style={{ animation: 'fadeInUp 0.6s ease-out backwards' }}>
              <GlassCard className="planet-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="planet-header" style={{ position: 'relative', height: '160px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                  {planet.image ? (
                    <img src={planet.image} alt={planet.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                  ) : (
                    planet.icon
                  )}
                  <div className="status-overlay" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: `linear-gradient(0deg, ${planet.barColor}CC 0%, transparent 100%)` }} />
                  
                  {isAulaConectada && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#e0f5f5', color: '#128989', padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <Zap size={10} fill="#128989" /> AULA CONECTADA
                    </div>
                  )}

                  {planet.complete === 100 && (
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
                    {!isProfesor && isAulaConectada && (
                      <GlowButton 
                        color="cyan" 
                        onClick={() => window.open(launcherUrl, '_blank')}
                        style={{ background: 'linear-gradient(135deg, #0dcfcf, #9c27b0)' }}
                      >
                        <ExternalLink size={16} /> ACCEDER A MI CLASE
                      </GlowButton>
                    )}
                    
                    <GlowButton 
                      color={isProfesor ? "teal" : "purple"}
                      onClick={() => {
                        if (isProfesor) {
                          router.push(`/studio/${planet.id}`);
                        } else {
                          router.push(`/profile?planet=${planet.id}`);
                        }
                      }}
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
