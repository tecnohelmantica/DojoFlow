import React, { useState } from 'react';
import { Sparkles, HelpCircle, Loader2, Brain, AlertCircle } from 'lucide-react';
import GlowButton from './GlowButton';

export default function SocraticTutor({ planetId, userId, studentLevel, accentColor = '#00d2ff' }) {
  const [hints, setHints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [error, setError] = useState(null);

  // Helper to get RGB from Hex
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 210, 255';
  };

  const accentRgb = hexToRgb(accentColor);

  const requestHint = async () => {
    if (loadingHint) return;
    setLoadingHint(true);
    setError(null);
    try {
      const message = hints.length === 0 
        ? `Sensei, estoy trabajando en el planeta ${planetId}. ¿Podrías darme una pista socrática para avanzar en mi aprendizaje? No me des la solución ni código directo.`
        : `Sensei, sigo explorando. ¿Podrías darme otra pista socrática? Recuérdame los conceptos clave pero no me des el código.`;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mode: 'tutor',
          planet: planetId,
          level: studentLevel || 'Intermedio',
          message,
          history: hints.map(h => ({ role: 'tutor', text: h }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setHints([...hints, data.text]);
      } else {
        setError(data.error || 'El Sensei no ha podido responder en este momento.');
      }
    } catch (err) {
      console.warn("Error fetching hint:", err.message);
      setError('Se ha interrumpido la conexión con el Dojo. Por favor, inténtalo de nuevo.');
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div className="socratic-tutor-standalone" style={{ '--accent': accentColor, '--accent-rgb': accentRgb }}>
      <div className="hints-container">
        {hints.length === 0 && (
          <div className="empty-state glass">
            <Brain className="mb-4 text-cyan-400 opacity-50" size={48} />
            <p className="text-white/60 text-sm">¿Necesitas una pista socrática para tu reto?</p>
          </div>
        )}

        {hints.map((hint, i) => (
          <div key={i} className="hint-bubble socratic animate-slide-up">
            <div className="hint-header">
              <HelpCircle size={14} /> 
              <span>SABIDURÍA DEL SENSEI #{i+1}</span>
            </div>
            <p>{hint}</p>
          </div>
        ))}

        {error && (
          <div className="error-message glass animate-slide-up" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '15px', borderRadius: '16px', display: 'flex', gap: '8px', alignItems: 'center', color: '#fca5a5', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="action-area">
        <GlowButton 
          onClick={requestHint}
          disabled={loadingHint}
          variant="primary"
          className="w-full"
        >
          {loadingHint ? (
            <><Loader2 size={18} className="animate-spin mr-2" /> Consultando al Sensei...</>
          ) : (
            <><Sparkles size={18} className="mr-2" /> PEDIR PISTA AL SENSEI</>
          )}
        </GlowButton>
      </div>

      <style jsx>{`
        .socratic-tutor-standalone {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        .glass {
          background: rgba(13, 17, 30, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hints-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 5px;
        }

        .hints-container::-webkit-scrollbar {
          width: 4px;
        }

        .hints-container::-webkit-scrollbar-thumb {
          background: rgba(var(--accent-rgb), 0.3);
          border-radius: 2px;
        }

        .hint-bubble {
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          background: rgba(var(--accent-rgb), 0.05);
          backdrop-filter: blur(5px);
        }

        .hint-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 0.7rem;
          font-weight: 900;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hint-bubble p {
          margin: 0;
          color: white;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
