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

  // Notificaciones (inicialmente vacías hasta implementar sistema real)
  useEffect(() => {
    setNotifications([]);
  }, [profile]);

  const markNotificationsAsRead = () => {
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
