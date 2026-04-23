"use client";
import React, { useState } from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { X, Sparkles, DoorOpen, Send, AlertCircle } from 'lucide-react';

export default function JoinClassModal({ isOpen, onClose, onJoin, loading }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length < 5) {
      setError('El código debe tener al menos 6 caracteres (ej. DF-1234)');
      return;
    }
    setError(null);
    onJoin(code);
  };

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <GlassCard style={{
        maxWidth: '420px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        animation: 'modalIn 0.3s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#8a8a9e',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #0dcfcf, #128989)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            boxShadow: '0 8px 24px rgba(13,207,207,0.3)'
          }}>
            <DoorOpen size={30} />
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: '800', color: '#1a1a2e', margin: '0 0 8px' }}>
            Ingresar a un Aula
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.9rem', fontWeight: '500' }}>
            Introduce el código secreto que te ha proporcionado tu profesor.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              color: '#1a1a2e', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Código de Invitación
            </label>
            <input 
              type="text"
              placeholder="Ej: DF-8923"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #eee',
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                textAlign: 'center',
                letterSpacing: '2px',
                outline: 'none',
                transition: 'border-color 0.2s',
                textTransform: 'uppercase'
              }}
              autoFocus
            />
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b6b', fontSize: '0.75rem', marginTop: '8px', fontWeight: '600' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <GlowButton 
              type="button" 
              color="gray" 
              onClick={onClose}
              style={{ flex: 1 }}
            >
              CANCELAR
            </GlowButton>
            <GlowButton 
              type="submit" 
              color="teal" 
              style={{ flex: 2 }}
              disabled={loading || !code}
            >
              {loading ? 'SINCRONIZANDO...' : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  INGRESAR <Send size={18} />
                </span>
              )}
            </GlowButton>
          </div>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#555', margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Sparkles size={12} className="text-teal" /> Acceso instantáneo a materiales y retos de tu clase.
          </p>
        </div>
      </GlassCard>

      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
