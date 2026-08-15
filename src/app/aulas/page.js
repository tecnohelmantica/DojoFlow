"use client";
import React, { useState, useCallback } from 'react';
import { useAuth } from '../../components/AuthProvider';
import MisAulas from '../../components/MisAulas';
import TopHeader from '../../components/TopHeader';
import { supabase } from '../../lib/supabaseClient';

import { useRouter } from 'next/navigation';

export default function AulasPage() {
  const { session, role, loading } = useAuth();
  const router = useRouter();
  const [misRecursos, setMisRecursos] = useState([]);

  React.useEffect(() => {
    if (!loading && (!session || role !== 'profesor')) {
      if (router) router.push('/');
    }
  }, [loading, session, role, router]);

  const loadMisRecursos = useCallback(async () => {
    if (!session?.user?.id || role !== 'profesor') return;
    const { data } = await supabase
      .from('recursos_docentes')
      .select('*')
      .eq('profesor_id', session.user.id)
      .order('fecha_creacion', { ascending: false });
    setMisRecursos(data || []);
  }, [session?.user?.id, role]);

  React.useEffect(() => {
    loadMisRecursos();
  }, [loadMisRecursos]);

  if (loading || (!session || role !== 'profesor')) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-bg)',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ marginBottom: '20px' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Validando credenciales de acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 5%', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <TopHeader />
      <header style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ 
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.75rem',
          letterSpacing: '2px',
          fontWeight: '700',
          textTransform: 'uppercase',
          color: 'var(--accent-purple)',
          marginBottom: '8px'
        }}>Panel de Control Docente</p>
        <h1 style={{ 
          fontFamily: 'Outfit, sans-serif',
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#1a1a2e',
          marginBottom: '10px'
        }}>🏫 Centro de Aulas</h1>
        <p style={{ 
          fontSize: '0.95rem',
          color: 'var(--color-text-muted)',
          lineHeight: '1.5',
          maxWidth: '600px',
          margin: '0 auto'
        }}>Gestiona tus clases, alumnos y materiales educativos con el orquestador.</p>
      </header>

      <MisAulas 
        currentUser={session.user} 
        misRecursos={misRecursos} 
        onRefreshRecursos={loadMisRecursos} 
      />
    </div>
  );
}
