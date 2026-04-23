"use client";
import React, { useState } from 'react';
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

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Flujo de Recuperación
    if (isRecovering) {
      try {
        // Buscar el perfil por alias para ver si tiene email_real
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email_real')
          .eq('alias', alias)
          .single();

        if (profileError || !profileData?.email_real) {
          setErrorMsg("⚠️ No tienes un correo vinculado. Contacta con tu profesor en el Dojo Studio para restablecer tu contraseña.");
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

    // Conversión interna: Alias -> Virtual Email
    const internalAuthEmail = `${alias.toLowerCase()}@dojoflow.local`;

    try {
      if (isLogin) {
        // Lógica de Login
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: internalAuthEmail,
          password
        });
        if (error) throw new Error("Credenciales inválidas o identidad no encontrada.");

        // Redirección inteligente
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

  return (
    <div className="auth-container">
      <GlassCard className="auth-card">
        <div className="auth-header">
          <Sparkles className="colorful-icon" size={60} strokeWidth={2.5} />
          <h1 className="glow-text-cyan">DojoFlow</h1>
          <p>{isRecovering ? 'Recuperación de Señal de Acceso' : isLogin ? 'Accede a tus simuladores de código' : 'Forja tu identidad en la academia'}</p>
        </div>

        {errorMsg && (
          <div className={`auth-alert ${errorMsg.includes('Exitoso') || errorMsg.includes('enviado') ? 'success' : 'error'}`}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

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
