'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import GlassCard from '../../../components/GlassCard';
import GlowButton from '../../../components/GlowButton';
import { Sparkles, Key, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay una sesión activa (el link de recovery crea una)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus({ 
          type: 'error', 
          msg: 'Sesión no válida o enlace caducado. Por favor, solicita uno nuevo.' 
        });
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({ type: 'error', msg: 'Error: ' + error.message });
    } else {
      setStatus({ type: 'success', msg: '¡Contraseña actualizada con éxito! Redirigiendo...' });
      setTimeout(() => router.push('/auth'), 2000);
    }
    setLoading(false);
  };

  return (
    <main className="update-password-main">
      <div className="stars-overlay" />
      
      <GlassCard className="update-password-card">
        <div className="update-password-header">
          <div className="icon-wrapper">
            <Key className="key-icon" size={48} />
            <Sparkles className="sparkle-icon" size={24} />
          </div>
          <h1>Actualizar Contraseña</h1>
          <p>Establece tu nueva llave de acceso al Dojo</p>
        </div>

        {status.msg && (
          <div className={`status-alert ${status.type}`}>
            <AlertCircle size={20} />
            <span>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="update-password-form">
          <div className="input-group">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="password-input"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="toggle-pwd"
            >
              {showPwd ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          <GlowButton 
            color="cyan" 
            fullWidth 
            disabled={loading || status.type === 'success'}
            className="submit-btn"
          >
            {loading ? 'Transmitiendo...' : 'Confirmar Nueva Contraseña'}
          </GlowButton>
        </form>

        <div className="footer-actions">
          <button 
            onClick={() => router.push('/auth')}
            className="cancel-btn"
          >
            Cancelar y volver al inicio
          </button>
        </div>
      </GlassCard>

      <style jsx>{`
        .update-password-main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #050510;
          background-image: radial-gradient(circle at 50% 50%, #1a1a3a 0%, #050510 100%);
          padding: 20px;
          font-family: 'Outfit', sans-serif;
          position: relative;
        }

        .stars-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(1.5px 1.5px at 10% 20%, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 30% 50%, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 70% 30%, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 90% 80%, #fff, rgba(0,0,0,0));
          background-size: 300px 300px;
          opacity: 0.15;
          pointer-events: none;
        }

        :global(.update-password-card) {
          max-width: 450px;
          width: 100%;
          padding: 40px !important;
          z-index: 10;
        }

        .update-password-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .icon-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 20px;
        }

        .key-icon {
          color: var(--accent-cyan);
          filter: drop-shadow(0 0 10px rgba(0, 243, 255, 0.5));
        }

        .sparkle-icon {
          position: absolute;
          top: -10px;
          right: -10px;
          color: #fff;
          animation: sparkle 2s infinite ease-in-out;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        h1 {
          font-size: 2rem;
          color: #fff;
          margin: 0 0 10px 0;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        p {
          color: #8a8a9e;
          font-size: 0.95rem;
          margin: 0;
        }

        .status-alert {
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          text-align: left;
          border: 1px solid transparent;
        }

        .status-alert.error {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .status-alert.success {
          background: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .update-password-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          position: relative;
          width: 100%;
        }

        .password-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px 50px 14px 16px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .password-input:focus {
          border-color: var(--accent-cyan);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.1);
        }

        .toggle-pwd {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #8a8a9e;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .toggle-pwd:hover {
          color: #fff;
        }

        .footer-actions {
          margin-top: 30px;
        }

        .cancel-btn {
          background: none;
          border: none;
          color: #8a8a9e;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.2s;
          text-decoration: underline;
        }

        .cancel-btn:hover {
          color: var(--accent-cyan);
        }
      `}</style>
    </main>
  );
}
