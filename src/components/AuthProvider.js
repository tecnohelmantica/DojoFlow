"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({
  session: undefined,
  profile: null,
  role: null,
  loading: true,
  notifications: [],
  markNotificationsAsRead: () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Sistema de Notificaciones Reales
  const fetchNotifications = async (userId, userRole) => {
    if (!userId || userRole !== 'profesor') return;

    try {
      // 1. Obtener IDs de las clases del profesor
      const { data: clases } = await supabase
        .from('clases')
        .select('id, nombre_clase')
        .eq('profesor_id', userId);
      
      if (!clases || clases.length === 0) return;
      const claseIds = clases.map(c => c.id);

      // 2. Obtener IDs de todos los alumnos en esas clases
      const { data: vincs } = await supabase
        .from('clase_alumnos')
        .select('alumno_id, clase_id')
        .in('clase_id', claseIds);
      
      if (!vincs || vincs.length === 0) return;
      const studentIds = [...new Set(vincs.map(v => v.alumno_id))];

      // 3. Contar retos pendientes de revisión (Regular + Ninja)
      const [resRegular, resNinja] = await Promise.all([
        supabase.from('explore_progress').select('student_id, planet_id').in('student_id', studentIds).eq('status', 'En revisión'),
        supabase.from('user_challenges').select('student_id, challenge_id').in('student_id', studentIds).eq('status', 'En revisión')
      ]);

      const totalPending = (resRegular.data?.length || 0) + (resNinja.data?.length || 0);
      
      const newNotifs = [];
      if (totalPending > 0) {
        newNotifs.push({
          id: 'pending-reviews',
          type: 'pending',
          text: `Tienes ${totalPending} reto${totalPending > 1 ? 's' : ''} esperando tu validación.`,
          time: 'Ahora',
          count: totalPending
        });
      }

      setNotifications(newNotifs);
    } catch (err) {
      console.error('[AuthProvider] Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchNotifications(profile.id, profile.role);
      
      // Polling suave cada 5 minutos
      const interval = setInterval(() => fetchNotifications(profile.id, profile.role), 1000 * 60 * 5);
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
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        fetchProfile(s.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
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
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
