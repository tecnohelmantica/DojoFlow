"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { ShieldAlert } from 'lucide-react';

/**
 * RouteGuard — Protector de rutas por rol.
 * 
 * @param {string} requiredRole - Rol necesario ('profesor' | 'alumno')
 * @param {string} redirectTo - Ruta a la que redirigir si no tiene permiso
 * @param {React.ReactNode} children - Contenido protegido
 */
export default function RouteGuard({ requiredRole, redirectTo = '/', children }) {
  const { session, role, loading } = useAuth();
  const router = useRouter();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Sin sesión → volver al inicio (donde está AuthPage)
    if (!session) {
      router.replace('/');
      return;
    }

    // Rol no coincide → acceso denegado
    if (requiredRole && role !== requiredRole) {
      setDenied(true);
      const timer = setTimeout(() => {
        router.replace(redirectTo);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [loading, session, role, requiredRole, redirectTo, router]);

  // Estado de carga
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        color: '#8a8a9e',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1rem'
      }}>
        Verificando credenciales...
      </div>
    );
  }

  // Acceso denegado — pantalla flash antes del redirect
  if (denied) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        gap: '16px',
        fontFamily: 'Outfit, sans-serif',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff6b6b22, #ff6b6b11)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldAlert size={28} color="#ff6b6b" />
        </div>
        <h2 style={{ color: '#ff6b6b', fontSize: '1.3rem', fontWeight: '700' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: '#8a8a9e', fontSize: '0.9rem', textAlign: 'center', maxWidth: '320px' }}>
          No tienes permisos para acceder a esta zona. Redirigiendo a tu panel...
        </p>
      </div>
    );
  }

  // Sin sesión (esperando redirect)
  if (!session) return null;

  // Acceso concedido
  return <>{children}</>;
}
