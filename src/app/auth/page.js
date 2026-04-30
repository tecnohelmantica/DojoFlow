"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import { UserPlus, LogIn, AlertCircle, Rocket, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import './page.css';

export default function AuthPage() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Detectar si venimos de un enlace de recuperación
  useEffect(() => {
    const handleRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Si hay una sesión y la URL tiene el hash de recovery
      if (session && window.location.hash.includes('type=recovery')) {
        setIsUpdatingPassword(true);
      }
    };
    handleRecovery();
  }, [router]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Formularios
  const [alias, setAlias] = useState('');
  const [emailReal, setEmailReal] = useState('');
  const [password, setPassword] = useState('');
  
  // Extra campos para Signup
  const [role, setRole] = useState('alumno');

  // Reglas de contraseña
  const pwdRules = {
    length: password.length > 8,
    number: /\d/.test(password),
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  const isValidPwd = Object.values(pwdRules).every(Boolean);

  // Reglas de Alias
  const aliasRules = {
    length: alias.length >= 6,
    format: /^[a-zA-Z0-9_.]+$/.test(alias), // Permitir puntos (.)
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
      
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect');

      if (redirectTo) {
        router.push(redirectTo);
      } else if (profileData?.role === 'profesor') {
        router.push('/'); // Dojo Studio
      } else {
        router.push('/profile'); // Perfil Explorador
      }
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Flujo de Recuperación
    if (isRecovering) {
      try {
        const cleanAlias = alias.trim();
        
        // Intento 1: Buscar por alias
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email_real, role')
          .eq('alias', cleanAlias)
          .maybeSingle();

        // Intento 2: Si no se encuentra, buscar por email_real
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
          setErrorMsg("⚠️ No se ha encontrado una identidad vinculada a ese alias o correo. Si eres alumno, contacta con tu profesor.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(profileData.email_real, {
          redirectTo: window.location.origin + '/auth/update-password',
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setErrorMsg("¡Enlace enviado! Revisa tu bandeja de entrada personalizada para restablecer la contraseña.");
        }
      } catch (err) {
        setErrorMsg("Error al procesar la recuperación de señal.");
      }
      setLoading(false);
      return;
    }

    // Reglas de Alias
    if (!isLogin && !isValidAlias) {
      setErrorMsg("Protocolo de Identidad: El alias debe tener min. 6 caracteres y solo letras, números, puntos o guiones bajos.");
      setLoading(false);
      return;
    }

    // Reglas Strictas de Registro
    if (!isLogin && !isValidPwd) {
       setErrorMsg("Protección Activa: La contraseña debe cumplir todas las reglas.");
       setLoading(false);
       return;
    }

      const cleanAlias = alias.trim();
      const internalAuthEmail = `${cleanAlias.toLowerCase()}@dojoflow.local`;

      try {
        if (isLogin) {
          // Lógica de Login Inteligente
          let finalAuthEmail = cleanAlias.includes('@') ? cleanAlias : internalAuthEmail;

          let { data: authData, error } = await supabase.auth.signInWithPassword({
            email: finalAuthEmail,
            password
          });

          // Si falla, intentamos la resolución cruzada (Alias <-> Email Real)
          if (error) {
            if (!cleanAlias.includes('@')) {
              // CASO A: Ingresó ALIAS pero falló el virtual. Probamos con su Email Real.
              const { data: pData } = await supabase
                .from('profiles')
                .select('email_real')
                .eq('alias', cleanAlias)
                .maybeSingle();
              
              if (pData?.email_real) {
                const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                  email: pData.email_real,
                  password
                });
                if (!retryError) {
                  handleLoginSuccess(retryData);
                  return;
                }
              }
            } else {
              // CASO B: Ingresó EMAIL pero falló. Probamos con su Alias Virtual.
              const { data: pData } = await supabase
                .from('profiles')
                .select('alias')
                .eq('email_real', cleanAlias)
                .maybeSingle();
              
              if (pData?.alias) {
                const virtualEmail = `${pData.alias.toLowerCase()}@dojoflow.local`;
                const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                  email: virtualEmail,
                  password
                });
                if (!retryError) {
                  handleLoginSuccess(retryData);
                  return;
                }
              }
            }
          }

        if (error) throw new Error("Credenciales inválidas o identidad no encontrada.");
        handleLoginSuccess(authData);
      } else {
        // Lógica de Registro (Signup) con Email Real Opcional
        const { data, error } = await supabase.auth.signUp({
          email: internalAuthEmail,
          password,
          options: {
            data: {
              alias: alias,
              email_real: emailReal || null
            }
          }
        });
        
        if (error) throw error;

        // Inyectar datos en 'public.profiles'
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                alias: alias,
                email_real: emailReal || null,
                role: role,
                real_name: role === 'profesor' ? alias : null
              }
            ]);
            
          if (profileError) throw profileError;
          
          // Sincronizar estado local inmediatamente para evitar condiciones de carrera
          updateProfile({
            id: data.user.id,
            alias: alias,
            email_real: emailReal || null,
            role: role,
            real_name: role === 'profesor' ? alias : null
          });

          // Auto-login tras registro exitoso
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: internalAuthEmail,
            password
          });

          if (loginError) {
            setErrorMsg("Identidad Creada. Por favor, ingresa manualmente.");
            setIsLogin(true);
          } else {
            // Redirigir según rol
            if (role === 'profesor') {
              router.push('/');
            } else {
              router.push('/profile');
            }
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
    if (error) {
      setErrorMsg("Error al actualizar: " + error.message);
    } else {
      setErrorMsg("¡Éxito! Contraseña actualizada. Redirigiendo...");
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <GlassCard className="auth-card">
        <div className="auth-header">
          <Sparkles className="colorful-icon" size={60} strokeWidth={2.5} />
          <h1 className="glow-text-cyan">DojoFlow</h1>
          <p>{isUpdatingPassword ? 'Actualización de Protocolos' : isRecovering ? 'Recuperación de Señal de Acceso' : isLogin ? 'Accede a tus simuladores de código' : 'Forja tu identidad en la academia'}</p>
        </div>

        {errorMsg && (
          <div 
            className={`auth-alert ${errorMsg.includes('Exitoso') || errorMsg.includes('enviado') || errorMsg.includes('Éxito') ? 'success' : 'error'}`}
            style={errorMsg.includes('Exitoso') || errorMsg.includes('enviado') || errorMsg.includes('Éxito') ? { color: '#065f46', borderColor: '#10b981', backgroundColor: '#ecfdf5' } : {}}
          >
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
              <button 
                type="button" 
                onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: '#8a8a9e', cursor: 'pointer' }}
              >
                {showPwd ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <button type="submit" className="auth-button primary" disabled={loading}>
              {loading ? <div className="spinner-small" /> : 'Confirmar Nueva Contraseña'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="auth-form">
          <input 
            type="text" 
            placeholder="Tu Alias Ninja" 
            value={alias} 
            onChange={(e) => setAlias(e.target.value)} 
            required
            className="auth-input"
            autoComplete="username"
          />
          
          {!isRecovering && (
             <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Contraseña Secreta" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  className="auth-input"
                  minLength={6}
                  style={{ marginBottom: 0 }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: '#8a8a9e', cursor: 'pointer' }}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
             </div>
          )}

          {!isLogin && !isRecovering && (
            <div className="pwd-rules" style={{ fontSize: '0.75rem', color: '#8a8a9e', textAlign: 'left', marginBottom: '12px', paddingLeft: '8px' }}>
              <div style={{ color: pwdRules.length ? 'var(--accent-teal)' : 'inherit', marginBottom: '4px' }}>
                {pwdRules.length ? '✓' : '○'} Más de 8 caracteres
              </div>
              <div style={{ color: pwdRules.upperLower ? 'var(--accent-teal)' : 'inherit', marginBottom: '4px' }}>
                {pwdRules.upperLower ? '✓' : '○'} Uso de mayúsculas y minúsculas
              </div>
              <div style={{ color: pwdRules.number ? 'var(--accent-teal)' : 'inherit', marginBottom: '4px' }}>
                {pwdRules.number ? '✓' : '○'} Un número
              </div>
              <div style={{ color: pwdRules.symbol ? 'var(--accent-teal)' : 'inherit', marginBottom: '4px' }}>
                {pwdRules.symbol ? '✓' : '○'} Un símbolo especial (@, #, $, etc.)
              </div>
            </div>
          )}

          {!isLogin && !isRecovering && (
            <>
              <input 
                type="email" 
                placeholder="Email (opcional para recuperar contraseña)"
                value={emailReal} 
                onChange={(e) => setEmailReal(e.target.value)} 
                className="auth-input"
              />
              <p style={{ fontSize: '0.7rem', color: '#8a8a9e', marginTop: '-10px', marginBottom: '15px', lineHeight: '1.4' }}>
                “El uso de correo electrónico es opcional y su finalidad es exclusivamente la recuperación de contraseña.”
              </p>
              <div className="role-selector">
                <label>
                  <input type="radio" value="alumno" checked={role === 'alumno'} onChange={() => setRole('alumno')} />
                  <span>Alumno Explorador</span>
                </label>
                <label>
                  <input type="radio" value="profesor" checked={role === 'profesor'} onChange={() => setRole('profesor')} />
                  <span>Maestro Docente</span>
                </label>
              </div>
            </>
          )}

          {isLogin && !isRecovering && (
            <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '12px' }}>
              <button 
                type="button" 
                onClick={() => { setIsRecovering(true); setErrorMsg(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <GlowButton color={isRecovering ? 'teal' : isLogin ? 'cyan' : 'purple'} className="auth-submit" disabled={loading}>
            {loading ? 'Transmitiendo...' : isRecovering ? 'Enviar Enlace de Recuperación' : isLogin ? <><LogIn /> Ingresar</> : <><UserPlus /> Crear Identidad</>}
          </GlowButton>
          </form>
        )}

        <div className="auth-switcher">
          {isRecovering ? (
             <button type="button" onClick={() => { setIsRecovering(false); setIsLogin(true); setErrorMsg(null); }} className="switch-btn">
               Cancelar y volver al inicio de sesión
             </button>
          ) : (
             <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} className="switch-btn">
               {isLogin ? '¿Aún no tienes pasaporte galáctico? Regístrate.' : '¿Ya eres miembro del Dojo? Inicia Sesión.'}
             </button>
          )}
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/privacidad" style={{ fontSize: '0.7rem', color: '#8a8a9e', textDecoration: 'none', opacity: 0.7 }}>Política de Privacidad y Protección de Datos</a>
        </div>
      </GlassCard>
    </div>
  );
}
