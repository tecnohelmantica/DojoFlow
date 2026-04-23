"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import GlassCard from '../../../components/GlassCard';
import GlowButton from '../../../components/GlowButton';
import TopHeader from '../../../components/TopHeader';
import { DoorOpen, LogIn, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function JoinPage() {
  const { codigo } = useParams();
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('checking'); // 'checking' | 'logged_out' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [claseInfo, setClaseInfo] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      setStatus('logged_out');
      return;
    }

    // Intentar unirse automáticamente si está logueado
    const joinClass = async () => {
      try {
        const res = await fetch('/api/aulas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'unirse_con_codigo',
            codigo: codigo,
            alumnoId: session.user.id
          })
        });

        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setClaseInfo(data.clase);
          // Redirigir al home después de 3 segundos
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'No se pudo entrar en el aula.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Fallo en la conexión con el servidor.');
      }
    };

    joinClass();
  }, [session, authLoading, codigo, router]);

  if (authLoading) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '20px' }}>
      <TopHeader />
      
      <div style={{ 
        maxWidth: '500px', 
        margin: '10vh auto 0', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center' 
      }}>
        <GlassCard style={{ width: '100%', padding: '40px' }}>
          {status === 'checking' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(13,207,207,0.1)', borderTopColor: '#0dcfcf' }}></div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: '800', color: '#1a1a2e' }}>Sincronizando con el Dojo...</h2>
              <p style={{ color: '#8a8a9e' }}>Verificando código del aula: <span style={{ fontFamily: 'monospace', fontWeight: '800' }}>{codigo}</span></p>
            </div>
          )}

          {status === 'logged_out' && (
            <div>
              <div style={{ 
                width: '72px', height: '72px', borderRadius: '24px', 
                background: 'rgba(92,106,196,0.1)', color: '#5c6ac4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <DoorOpen size={36} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: '800', color: '#1a1a2e', marginBottom: '12px' }}>
                ¡Casi estás dentro!
              </h2>
              <p style={{ color: '#8a8a9e', marginBottom: '32px' }}>
                Para unirte a la clase <strong style={{color:'#1a1a2e'}}>{codigo}</strong> y ver tus retos, necesitas primero identificarte en el DojoFlow.
              </p>
              <GlowButton color="purple" onClick={() => router.push(`/auth?redirect=/unirse/${codigo}`)} className="w-100">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  INICIAR SESIÓN / REGISTRARSE <LogIn size={20} />
                </span>
              </GlowButton>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div style={{ 
                width: '72px', height: '72px', borderRadius: '50%', 
                background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', boxShadow: '0 0 20px rgba(20, 184, 166, 0.2)'
              }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' }}>
                ¡Acceso Concedido!
              </h2>
              <p style={{ color: '#8a8a9e', marginBottom: '8px' }}>{message}</p>
              <div style={{ 
                background: '#f8fafc', padding: '16px', borderRadius: '12px', 
                marginBottom: '24px', border: '1px solid #eff6ff'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', display:'block', marginBottom:'4px' }}>AULA ACTUAL</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>{claseInfo?.nombre_clase}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems:'center', gap:'6px', justifyContent:'center' }}>
                <Sparkles size={14} /> Redirigiendo a tu Galaxia Educativa...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div style={{ 
                width: '72px', height: '72px', borderRadius: '24px', 
                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <AlertCircle size={36} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: '800', color: '#1a1a2e', marginBottom: '12px' }}>
                Error de Acceso
              </h2>
              <p style={{ color: '#8a8a9e', marginBottom: '32px' }}>{message}</p>
              <GlowButton color="cyan" onClick={() => router.push('/')} className="w-100">
                VOLVER AL INICIO
              </GlowButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
