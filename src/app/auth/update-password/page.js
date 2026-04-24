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
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a16]">
      <div className="stars-overlay" />
      
      <GlassCard className="max-w-md w-full p-8 text-center relative z-10">
        <div className="mb-6 flex flex-col items-center">
          <Key className="text-cyan-400 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-white mb-2">Actualizar Contraseña</h1>
          <p className="text-gray-400 text-sm">Establece tu nueva llave de acceso al Dojo</p>
        </div>

        {status.msg && (
          <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 text-sm ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-left">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPwd ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <GlowButton color="cyan" className="w-full py-3" disabled={loading || status.type === 'success'}>
            {loading ? 'Actualizando...' : 'Confirmar Nueva Contraseña'}
          </GlowButton>
        </form>

        <div className="mt-8">
          <button 
            onClick={() => router.push('/auth')}
            className="text-gray-500 text-xs hover:text-cyan-400 transition-colors"
          >
            Cancelar y volver al inicio
          </button>
        </div>
      </GlassCard>

      <style jsx>{`
        .stars-overlay {
          position: fixed;
          inset: 0;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 160px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0));
          background-size: 200px 200px;
          opacity: 0.1;
        }
      `}</style>
    </main>
  );
}
