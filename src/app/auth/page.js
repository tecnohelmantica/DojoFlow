"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../lib/supabaseClient';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import { UserPlus, LogIn, AlertCircle, Rocket, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import './page.css';

// Importamos fuentes premium
const outfitFont = "'Outfit', sans-serif";
const interFont = "'Inter', sans-serif";

function AuthContent() {
  const router = useRouter();
  const { updateProfile, guestLogin } = useAuth();
  
  const searchParams = useSearchParams();
  
  // Inicialización sincrónica para evitar saltos de UI
  const [isLogin, setIsLogin] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isSignup = params.get('mode') === 'signup';
      if (isSignup) {
        localStorage.removeItem('dojoflow_guest');
      }
      return !isSignup;
    }
    return true;
  });

  const [isRecovering, setIsRecovering] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Detectar cambios en la URL (por si el usuario navega internamente)
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
      localStorage.removeItem('dojoflow_guest');
    }

    const handleRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && window.location.hash.includes('type=recovery')) {
        setIsUpdatingPassword(true);
      }
    };
    handleRecovery();
  }, [searchParams]);

  // ... (rest of state and handlers)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Formularios
  const [alias, setAlias] = useState('');
  const [emailReal, setEmailReal] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('alumno');

  // Reglas de contraseña
  const pwdRules = {
    length: password.length > 8,
    number: /\d/.test(password),
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  const isValidPwd = Object.values(pwdRules).every(Boolean);

  const aliasRules = {
    length: alias.length >= 6,
    format: /^[a-zA-Z0-9_.]+$/.test(alias),
    noEmail: !alias.includes('@')
  };
  const isValidAlias = Object.values(aliasRules).every(Boolean);

  const handleLoginSuccess = async (authData) => {
    if (authData?.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();
      
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect');

      if (redirectTo) {
        router.push(redirectTo);
      } else if (profileData?.role === 'profesor') {
        router.push('/');
      } else {
        router.push('/profile');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dojoflow_navigating_to_signup');
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isRecovering) {
      try {
        const cleanAlias = alias.trim();
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email_real, role')
          .eq('alias', cleanAlias)
          .maybeSingle();

        if (!profileData && !profileError) {
          const { data: emailData, error: emailError } = await supabase
            .from('profiles')
            .select('email_real, role')
            .eq('email_real', cleanAlias)
            .maybeSingle();
          profileData = emailData;
          profileError = emailError;
        }

        if (profileError || !profileData?.email_real) {
          setErrorMsg("⚠️ No se ha encontrado una identidad vinculada a ese alias o correo.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(profileData.email_real, {
          redirectTo: window.location.origin + '/auth/update-password',
        });

        if (error) setErrorMsg(error.message);
        else setErrorMsg("¡Enlace enviado! Revisa tu bandeja de entrada.");
      } catch (err) {
        setErrorMsg("Error al procesar la recuperación.");
      }
      setLoading(false);
      return;
    }

    if (!isLogin && !isValidAlias) {
      setErrorMsg("Protocolo de Identidad: El alias debe tener min. 6 caracteres.");
      setLoading(false);
      return;
    }

    if (!isLogin && !isValidPwd) {
       setErrorMsg("Protección Activa: La contraseña debe cumplir todas las reglas.");
       setLoading(false);
       return;
    }

    const cleanAlias = alias.trim();
    const internalAuthEmail = `${cleanAlias.toLowerCase()}@dojoflow.local`;

    try {
      if (isLogin) {
        let finalAuthEmail = cleanAlias.includes('@') ? cleanAlias : internalAuthEmail;
        let { data: authData, error } = await supabase.auth.signInWithPassword({
          email: finalAuthEmail,
          password
        });

        if (error && !cleanAlias.includes('@')) {
          const { data: pData } = await supabase.from('profiles').select('email_real').eq('alias', cleanAlias).maybeSingle();
          if (pData?.email_real) {
            const { data: rData, error: rErr } = await supabase.auth.signInWithPassword({ email: pData.email_real, password });
            if (!rErr) { handleLoginSuccess(rData); return; }
          }
        }
        if (error) throw new Error("Credenciales inválidas.");
        handleLoginSuccess(authData);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: internalAuthEmail,
          password,
          options: { data: { alias: alias, email_real: emailReal || null } }
        });
        
        if (error) {
          if (error.message.includes("already registered")) throw new Error("Ese Alias ya ha sido reclamado.");
          throw error;
        }

        if (data.user) {
          await supabase.from('profiles').insert([{ 
            id: data.user.id, 
            alias: alias, 
            email_real: emailReal || null,
            role: role, 
            xp: 100, 
            level: 1, 
            avatar_url: role === 'profesor' ? 'profesor.png' : 'alumno.png'
          }]);
          await supabase.auth.signInWithPassword({ email: internalAuthEmail, password });
          
          if (role === 'profesor') {
            router.push('/');
          } else {
            router.push('/profile');
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setErrorMsg("Error: " + error.message);
    else {
      setErrorMsg("¡Éxito! Redirigiendo...");
      setTimeout(() => router.push('/'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
      <div className="auth-container">
        <GlassCard className="auth-card">
          <div className="auth-header">
            <div className="icon-wrapper">
              <Sparkles className="colorful-icon" size={64} strokeWidth={2.5} />
            </div>
            <h1 className="brand-title">DojoFlow</h1>
            <p className="brand-subtitle">
              {isUpdatingPassword ? 'Actualización de Protocolos' : 
               isRecovering ? 'Recuperación de Señal' : 
               isLogin ? 'Accede a tus simuladores de código' : 
               '¡Crea tu personaje y empieza a explorar!'}
            </p>
          </div>

          {errorMsg && (
            <div className={`auth-alert ${errorMsg.includes('Exitoso') || errorMsg.includes('enviado') || errorMsg.includes('Éxito') ? 'success' : 'error'}`}>
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {isUpdatingPassword ? (
            <form onSubmit={handleUpdatePassword} className="auth-form">
              <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
                <input 
                  type={showPwd ? "text" : "password"} 
                  placeholder="Nueva Contraseña Secreta" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required
                  className="auth-input"
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="eye-btn">
                  {showPwd ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <button type="submit" className="auth-button primary" disabled={loading}>
                {loading ? <div className="spinner-small" /> : 'Confirmar Nueva Contraseña'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="auth-form">
              <input type="text" placeholder="Tu Alias Ninja" value={alias} onChange={(e) => setAlias(e.target.value)} required className="auth-input" />
              
              {!isRecovering && !isUpdatingPassword && (
                <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={isLogin ? "Tu Contraseña Secreta" : "Crea tu Contraseña Ninja"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="auth-input" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="eye-btn"
                    style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: '#8a8a9e', cursor: 'pointer' }}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              )}
              
              {!isLogin && !isRecovering && (
                <div className="pwd-rules" style={{ marginBottom: '20px' }}>
                  <div style={{ color: pwdRules.length ? '#00f2fe' : '#ffffff', fontWeight: '800', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{pwdRules.length ? '✓' : '○'} Más de 8 caracteres</div>
                  <div style={{ color: pwdRules.upperLower ? '#00f2fe' : '#ffffff', fontWeight: '800', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{pwdRules.upperLower ? '✓' : '○'} Mayúsculas y minúsculas</div>
                  <div style={{ color: pwdRules.number ? '#00f2fe' : '#ffffff', fontWeight: '800', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{pwdRules.number ? '✓' : '○'} Un número</div>
                  <div style={{ color: pwdRules.symbol ? '#00f2fe' : '#ffffff', fontWeight: '800', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{pwdRules.symbol ? '✓' : '○'} Un símbolo especial</div>
                </div>
              )}

              {!isLogin && !isRecovering && (
                <div className="role-selection-area" style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginBottom: '12px', textAlign: 'left', letterSpacing: '0.5px' }}>ELIGE TU CAMINO:</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div 
                      onClick={() => setRole('alumno')}
                      className={`role-option-box ${role === 'alumno' ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '16px 10px',
                        borderRadius: '20px',
                        border: `2px solid ${role === 'alumno' ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`,
                        background: role === 'alumno' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: role === 'alumno' ? '0 0 20px rgba(0, 242, 254, 0.2)' : 'none'
                      }}
                    >
                      <Rocket size={24} style={{ color: role === 'alumno' ? '#00f2fe' : 'rgba(255,255,255,0.4)' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: role === 'alumno' ? '#fff' : 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>SOY ALUMNO</span>
                    </div>
                    <div 
                      onClick={() => setRole('profesor')}
                      className={`role-option-box ${role === 'profesor' ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '16px 10px',
                        borderRadius: '20px',
                        border: `2px solid ${role === 'profesor' ? '#9c27b0' : 'rgba(255,255,255,0.1)'}`,
                        background: role === 'profesor' ? 'rgba(156, 39, 176, 0.15)' : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: role === 'profesor' ? '0 0 20px rgba(156, 39, 176, 0.2)' : 'none'
                      }}
                    >
                      <Shield size={24} style={{ color: role === 'profesor' ? '#9c27b0' : 'rgba(255,255,255,0.4)' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: role === 'profesor' ? '#fff' : 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>SOY DOCENTE</span>
                    </div>
                  </div>
                </div>
              )}

              {!isLogin && !isRecovering && (
                <div style={{ marginBottom: '15px' }}>
                  <input 
                    type="email" 
                    placeholder="Correo de recuperación (Opcional)" 
                    value={emailReal} 
                    onChange={(e) => setEmailReal(e.target.value)} 
                    className="auth-input" 
                  />
                  <p className="input-hint" style={{ marginTop: '5px', opacity: 0.6 }}>Solo lo usaremos si olvidas tu contraseña.</p>
                </div>
              )}

              {isLogin && !isRecovering && (
                <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '12px' }}>
                  <button type="button" onClick={() => { setIsRecovering(true); setErrorMsg(null); }} className="link-btn">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <GlowButton color={isRecovering ? 'teal' : 'premium-ninja'} className="auth-submit" disabled={loading}>
                {loading ? 'Transmitiendo...' : isRecovering ? 'Enviar Enlace' : isLogin ? <><LogIn /> Ingresar</> : <><UserPlus /> Crear Identidad</>}
              </GlowButton>
            </form>
          )}

          <div className="auth-switcher">
            {isRecovering ? (
              <button type="button" onClick={() => { setIsRecovering(false); setIsLogin(true); setErrorMsg(null); }} className="switch-btn">
                Cancelar y volver
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} className="switch-btn">
                  {isLogin ? '¿Aún no tienes pasaporte? Regístrate.' : '¿Ya eres miembro? Inicia Sesión.'}
                </button>
                <GlowButton 
                  onClick={() => { guestLogin(); router.push('/profile'); }} 
                  className="auth-submit guest-btn-standard"
                  color="dark"
                >
                  <Rocket size={20} /> Explorar como Invitado
                </GlowButton>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
      <style jsx>{`
        .eye-btn { position: absolute; right: 14px; top: 14px; background: none; border: none; color: #8a8a9e; cursor: pointer; }
        .link-btn { background: none; border: none; color: var(--accent-cyan); fontSize: 0.8rem; cursor: pointer; }
        .input-hint { font-size: 0.7rem; color: #8a8a9e; margin-top: -10px; margin-bottom: 20px; line-height: 1.4; }
        .guest-btn { display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--accent-cyan) !important; }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#fff' }}>Cargando DojoFlow...</div>}>
      <AuthContent />
    </Suspense>
  );
}
