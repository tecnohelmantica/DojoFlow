"use client";
import React, { useState, useCallback } from 'react';
import { useAuth } from '../../components/AuthProvider';
import MisAulas from '../../components/MisAulas';
import TopHeader from '../../components/TopHeader';
import { supabase } from '../../lib/supabaseClient';

export default function AulasPage() {
  const { session, role, loading } = useAuth();
  const [misRecursos, setMisRecursos] = useState([]);

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

  if (loading) return <div className="loading-container">Iniciando sistemas del aula...</div>;
  if (!session || role !== 'profesor') return <div className="error-container">Acceso restringido a docentes.</div>;

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
