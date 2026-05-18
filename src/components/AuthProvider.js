"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

import { getPlanetById } from '../lib/planets';

const AuthContext = createContext({
  session: undefined,
  profile: null,
  role: null,
  loading: true,
  notifications: [],
  markNotificationsAsRead: () => {},
  signOut: async () => {},
  guestLogin: () => {},
  isGuest: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isGuest, setIsGuest] = useState(false);

  // Sistema de Notificaciones Reales
  const fetchNotifications = async (userId, userRole) => {
    if (!userId || isGuest || userId === 'guest_user') return;

    try {
      if (userRole === 'profesor') {
        // 1. Obtener IDs de las clases del profesor
        const { data: clases } = await supabase
          .from('clases')
          .select('id, nombre, nombre_clase')
          .eq('profesor_id', userId);
        
        if (!clases || clases.length === 0) {
          setNotifications([]);
          return;
        }
        const claseIds = clases.map(c => c.id);

        // 2. Obtener IDs de todos los alumnos en esas clases
        const { data: vincs } = await supabase
          .from('clase_alumnos')
          .select('alumno_id, clase_id')
          .in('clase_id', claseIds);
        
        if (!vincs || vincs.length === 0) {
          setNotifications([]);
          return;
        }
        const studentIds = [...new Set(vincs.map(v => v.alumno_id))];

        // 3. Obtener retos pendientes con detalles (Joins con profiles)
        const [resRegular, resNinja] = await Promise.all([
          supabase.from('explore_progress')
            .select('student_id, planet_id, status, profiles(alias, real_name)')
            .in('student_id', studentIds)
            .eq('status', 'En revisión')
            .order('id', { ascending: false })
            .limit(10),
          supabase.from('user_challenges')
            .select('student_id, challenge_id, planet_id, status, profiles(alias, real_name)')
            .in('student_id', studentIds)
            .eq('status', 'En revisión')
            .order('id', { ascending: false })
            .limit(10)
        ]);

        const newNotifs = [];

        // Procesar retos regulares
        (resRegular.data || []).forEach(r => {
          const studentName = r.profiles?.alias || r.profiles?.real_name || 'Ninja';
          const planet = getPlanetById(r.planet_id);
          const planetName = planet?.name || r.planet_id;
          
          const studentVinc = vincs.find(v => v.alumno_id === r.student_id);
          
          newNotifs.push({
            id: `reg-${r.student_id}-${r.planet_id}`,
            type: 'pending',
            text: `${studentName} solicita validación`,
            subtext: `Completó hito en ${planetName}`,
            href: studentVinc ? `/aulas?claseId=${studentVinc.clase_id}` : '/aulas',
            time: 'Reciente'
          });
        });

        // Procesar Retos Ninja
        (resNinja.data || []).forEach(rn => {
          const studentName = rn.profiles?.alias || rn.profiles?.real_name || 'Ninja';
          const planet = getPlanetById(rn.planet_id);
          const planetName = planet?.name || rn.planet_id;
          const challengeName = rn.challenge_id?.split('_').pop()?.toUpperCase() || 'NINJA';
          
          const studentVinc = vincs.find(v => v.alumno_id === rn.student_id);
          
          newNotifs.push({
            id: `ninja-${rn.student_id}-${rn.challenge_id}`,
            type: 'pending',
            text: `${studentName} envió Reto ${challengeName}`,
            subtext: `Evidencia lista en ${planetName}`,
            href: studentVinc ? `/aulas?claseId=${studentVinc.clase_id}` : '/aulas',
            time: 'Ahora'
          });
        });

        setNotifications(newNotifs);
      } else {
        // ROL ALUMNO: Ver feedback y validaciones de sus propios retos
        const [resRegular, resNinja] = await Promise.all([
          supabase.from('explore_progress')
            .select('planet_id, status, teacher_feedback, updated_at')
            .eq('student_id', userId)
            .neq('status', 'No iniciado')
            .neq('status', 'En revisión')
            .order('updated_at', { ascending: false })
            .limit(5),
          supabase.from('user_challenges')
            .select('challenge_id, planet_id, status, teacher_feedback, updated_at')
            .eq('student_id', userId)
            .neq('status', 'En revisión')
            .order('updated_at', { ascending: false })
            .limit(5)
        ]);

        const studentNotifs = [];

        // Notificaciones de hitos de planeta
        (resRegular.data || []).forEach(r => {
          const planet = getPlanetById(r.planet_id);
          if (r.status === 'Completado' || r.status === 'Validado') {
            studentNotifs.push({
              id: `st-reg-${r.planet_id}-${r.updated_at}`,
              type: 'success',
              text: `¡Hito validado en ${planet?.name || r.planet_id}!`,
              subtext: r.teacher_feedback || 'Sigue explorando nuevas galaxias.',
              href: `/profile?planet=${r.planet_id}`,
              time: 'Reciente'
            });
          }
        });

        // Notificaciones de Retos Ninja
        (resNinja.data || []).forEach(rn => {
          const planet = getPlanetById(rn.planet_id);
          const challengeName = rn.challenge_id.split('-').pop()?.replace('reto-', '').toUpperCase() || 'NINJA';
          const isSuccess = rn.status === 'Validado';

          studentNotifs.push({
            id: `st-ninja-${rn.challenge_id}-${rn.updated_at}`,
            type: isSuccess ? 'success' : (rn.status === 'Corregir' ? 'pending' : 'pending'),
            text: isSuccess ? `¡Reto ${challengeName} Validado!` : (rn.status === 'Corregir' ? `Necesita Mejora: Reto ${challengeName}` : `Revisión: Reto ${challengeName}`),
            subtext: rn.teacher_feedback || (isSuccess ? '¡Excelente trabajo, Ninja!' : 'El profesor ha dejado un comentario.'),
            href: `/profile?planet=${rn.planet_id}&challengeId=${rn.challenge_id}`,
            time: 'Ahora'
          });
        });

        setNotifications(studentNotifs);
      }
    } catch (err) {
      console.error('[AuthProvider] Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchNotifications(profile.id, profile.role);
      
      const interval = setInterval(() => fetchNotifications(profile.id, profile.role), 1000 * 60 * 3);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [profile]);


  const markNotificationsAsRead = () => {
    // Por ahora solo limpiamos visualmente
    setNotifications([]);
  };

  const fetchProfile = async (userId) => {
    try {
      console.log('[AuthProvider] Fetching profile for:', userId);
      
      let { data, error, status } = await supabase
        .from('profiles')
        .select('id, role, alias, real_name, email_real, avatar_url, has_seen_onboarding')
        .eq('id', userId)
        .single();

      console.log('[AuthProvider] Profile response:', { data, error, status });

      // Error 500 = RLS policy crash — intentar con maybeSingle
      if (error && (status === 500 || status === 406)) {
        console.warn('[AuthProvider] RLS error detected (status', status, '). Trying without .single()...');
        
        const { data: rows, error: err2 } = await supabase
          .from('profiles')
          .select('id, role, alias, real_name, email_real, avatar_url, has_seen_onboarding')
          .eq('id', userId);
        
        console.log('[AuthProvider] Fallback response:', { rows, err2 });
        
        if (rows && rows.length > 0) {
          data = rows[0];
          error = null;
        } else if (err2) {
          console.error('[AuthProvider] Fallback also failed:', err2);
        }
      }

      // Perfil no encontrado → no creamos nada automáticamente.
      // El perfil debe ser creado por el flujo de registro en AuthPage.
      if (error && error.code === 'PGRST116') {
        console.log('[AuthProvider] Profile not found. Waiting for registration flow...');
      }

      if (data) {
        console.log('[AuthProvider] ✅ Profile loaded. Role:', data.role);
        setProfile(data);
      } else {
        console.warn('[AuthProvider] ⚠️ Could not load profile, defaulting to null');
      }
    } catch (err) {
      console.error('[AuthProvider] Unexpected error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 1. Obtener sesión actual
    const checkSession = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const isNavigatingToSignup = typeof window !== 'undefined' && sessionStorage.getItem('dojoflow_navigating_to_signup') === 'true';
      const isSigningUp = searchParams.get('mode') === 'signup' || pathname === '/auth' || isNavigatingToSignup;
      
      // Si el usuario tiene intención de registrarse, limpiar cualquier rastro de invitado previo
      if (isSigningUp && (localStorage.getItem('dojoflow_guest') === 'true' || isGuest || isNavigatingToSignup)) {
        localStorage.removeItem('dojoflow_guest');
        if (typeof window !== 'undefined') sessionStorage.removeItem('dojoflow_navigating_to_signup');
        setIsGuest(false);
        setProfile(null);
        setSession(null);
      }

      const isGuestMode = localStorage.getItem('dojoflow_guest') === 'true' && !isSigningUp;

      if (isGuestMode) {
        setIsGuest(true);
        setProfile({
          id: 'guest_user',
          role: 'alumno',
          alias: 'Invitado',
          real_name: 'Explorador Anónimo',
          avatar_url: 'alumno.png',
          has_seen_onboarding: false,
          isGuest: true
        });
        setSession({ user: { id: 'guest_user' } });
        setLoading(false);
        return;
      }

      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        if (s) {
          fetchProfile(s.user.id);
        } else {
          setLoading(false);
        }
      });
    };
    checkSession();

    // 2. Escuchar cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      if (localStorage.getItem('dojoflow_guest') === 'true') return; // Ignorar si es invitado
      
      setSession(s);
      if (s && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        fetchProfile(s.user.id);
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async (redirectPath = '/') => {
    // Asegurar que el path sea un string (evitar [object Object] si se pasa el evento de click)
    const finalPath = typeof redirectPath === 'string' ? redirectPath : '/';
    
    try {
      if (isGuest) {
        localStorage.removeItem('dojoflow_guest');
        setIsGuest(false);
      } else {
        await supabase.auth.signOut();
      }
      
      if (finalPath.includes('?')) {
        window.location.href = finalPath;
        return;
      }

      setSession(null);
      setProfile(null);
      window.location.href = finalPath;
    } catch (err) {
      console.error('Error signing out:', err);
      window.location.href = finalPath;
    }
  };

  const handleGuestLogin = () => {
    // Limpiar rastro de evaluaciones previas para que el invitado siempre vea el desafío del Sensei
    if (typeof window !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('dojoflow_assessment_') || key.startsWith('dojoflow_level_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      // También limpiar onboarding visto para el invitado
      localStorage.removeItem('onboarding_seen_guest_user');
    }

    localStorage.setItem('dojoflow_guest', 'true');
    setIsGuest(true);
    setProfile({
      id: 'guest_user',
      role: 'alumno',
      alias: 'Invitado',
      real_name: 'Explorador Anónimo',
      avatar_url: 'alumno.png',
      has_seen_onboarding: false,
      isGuest: true
    });
    setSession({ user: { id: 'guest_user' } });
    setLoading(false);
  };

  const clearGuestSession = async () => {
    console.log('[AuthProvider] Clearing Guest Session...');
    localStorage.removeItem('dojoflow_guest');
    setIsGuest(false);
    setSession(null);
    setProfile(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error during silent signOut for guest:', e);
    }
  };

  const role = profile?.role || null;

  const updateProfile = (newData) => {
    setProfile(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      profile, 
      role, 
      loading, 
      notifications, 
      markNotificationsAsRead, 
      signOut: handleSignOut,
      updateProfile,
      guestLogin: handleGuestLogin,
      clearGuestSession,
      isGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
}
