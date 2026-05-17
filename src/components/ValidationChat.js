import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Loader2, CheckCircle2, ShieldCheck,
  MessageSquare, Sparkles, Trophy, AlertCircle
} from 'lucide-react';

/**
 * ValidationChat — Panel modal lateral dedicado exclusivamente a la validación
 * de retos y misiones del Sensei. Completamente separado del Tutor Socrático.
 *
 * Props:
 *   isOpen        {boolean}  — controla visibilidad del panel
 *   onClose       {fn}       — cierra el panel
 *   context       {object}   — { type: 'challenge'|'mission', title, objective, challengeId }
 *   userId        {string}
 *   planetId      {string}
 *   studentLevel  {string}
 *   accentColor   {string}
 *   onValidated   {fn}       — callback cuando el Sensei confirma [VALIDADO]
 */
export default function ValidationChat({
  isOpen,
  onClose,
  context,
  userId,
  planetId,
  studentLevel,
  accentColor = '#6366f1',
  onValidated
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '99, 102, 241';
  };
  const accentRgb = hexToRgb(accentColor);

  // Inicializar chat al abrir con mensaje de bienvenida contextualizado
  useEffect(() => {
    if (isOpen && context) {
      setIsValidated(false);
      setInputText('');

      const isChallenge = context.type === 'challenge';
      const name = context.title || (isChallenge ? 'este reto' : 'esta misión');
      const obj = context.objective || '';

      const welcomeMsg = isChallenge
        ? `🎯 **MODO VALIDACIÓN — ${name.toUpperCase()}**\n\n¡Hola! He recibido tu entrega. Para validar que has comprendido realmente el reto, necesito hacerte unas preguntas.\n\n¿Podrías explicarme cómo funciona la lógica principal de tu solución? ¿Qué fue lo más difícil y cómo lo resolviste?`
        : `⚔️ **VALIDACIÓN DE MISIÓN SENSEI — ${name.toUpperCase()}**\n\n¡Excelente entrega!${obj ? `\n\nObjetivo: _${obj}_` : ''}\n\nPara completar la validación, cuéntame: ¿Qué concepto nuevo has aplicado en esta misión y cómo lo explicarías a un compañero que no lo entiende?`;

      setMessages([{ role: 'sensei', text: welcomeMsg }]);

      // Focus en el input tras la animación
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen, context]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping || isValidated) return;

    const userText = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mode: 'validador',
          planet: planetId,
          level: studentLevel || 'Intermedio',
          message: userText,
          history: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.text
          })),
          context: {
            type: context?.type,
            title: context?.title,
            objective: context?.objective
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'sensei', text: data.text }]);

        if (data.text.includes('[VALIDADO]')) {
          setIsValidated(true);
          if (onValidated) onValidated(context);
          // Cerrar el panel automáticamente tras 3 segundos de celebración
          setTimeout(() => {
            onClose?.();
            setIsValidated(false);
            setMessages([]);
          }, 3500);
        }
      } else {
        throw new Error(data.error || 'Error del Sensei');
      }
    } catch (err) {
      console.error('ValidationChat error:', err);
      setMessages(prev => [...prev, {
        role: 'sensei',
        text: 'Lo siento, se ha interrumpido la conexión con el Dojo. Por favor, inténtalo de nuevo.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay semitransparente */}
      <div
        className="vc-overlay"
        onClick={onClose}
        style={{ '--accent': accentColor, '--accent-rgb': accentRgb }}
      />

      {/* Panel lateral */}
      <div
        className="vc-panel"
        style={{ '--accent': accentColor, '--accent-rgb': accentRgb }}
      >
        {/* Header */}
        <div className="vc-header">
          <div className="vc-header-left">
            <div className="vc-header-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="vc-header-label">CHAT DE VALIDACIÓN</span>
              <p className="vc-header-title">
                {context?.title || 'Reto'}
              </p>
            </div>
          </div>
          <button className="vc-close-btn" onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Info strip */}
        <div className="vc-info-strip">
          <AlertCircle size={13} />
          <span>Este chat es exclusivo para validar. Para dudas, usa el Tutor Socrático.</span>
        </div>

        {/* Messages */}
        <div className="vc-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`vc-msg vc-msg--${msg.role} animate-fade-in`}>
              {msg.role === 'sensei' && (
                <div className="vc-msg-avatar">
                  <Sparkles size={14} />
                </div>
              )}
              <div className="vc-msg-bubble">
                {msg.text.split('\n').map((line, j) => {
                  // Renderizar negritas básicas
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={j} style={{ margin: j > 0 ? '6px 0 0' : 0 }}>
                      {parts.map((part, k) =>
                        k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="vc-msg vc-msg--sensei">
              <div className="vc-msg-avatar">
                <Sparkles size={14} />
              </div>
              <div className="vc-msg-bubble vc-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {isValidated && (
            <div className="vc-validated-banner animate-fade-in">
              <Trophy size={28} />
              <div>
                <strong>¡VALIDADO!</strong>
                <p>Has demostrado tu comprensión. ¡Reto superado!</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="vc-input-area" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="vc-input"
            placeholder={isValidated ? '¡Reto validado! Cerrando...' : 'Explica tu solución al Sensei...'}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            disabled={isTyping || isValidated}
          />
          <button
            type="submit"
            className="vc-send-btn"
            disabled={isTyping || isValidated || !inputText.trim()}
          >
            {isTyping
              ? <Loader2 size={18} className="vc-spin" />
              : isValidated
              ? <CheckCircle2 size={18} />
              : <Send size={18} />
            }
          </button>
        </form>
      </div>

      <style jsx>{`
        /* ── OVERLAY ── */
        .vc-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 9000;
          backdrop-filter: blur(4px);
          animation: vcFadeIn 0.2s ease-out;
        }

        /* ── PANEL ── */
        .vc-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(480px, 100vw);
          background: linear-gradient(160deg, #0d111e 0%, #080c18 100%);
          border-left: 1px solid rgba(var(--accent-rgb), 0.2);
          z-index: 9001;
          display: flex;
          flex-direction: column;
          box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6);
          animation: vcSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Outfit', sans-serif;
        }

        /* ── HEADER ── */
        .vc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(var(--accent-rgb), 0.06);
          flex-shrink: 0;
        }
        .vc-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .vc-header-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--accent), rgba(var(--accent-rgb), 0.5));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 20px rgba(var(--accent-rgb), 0.35);
          flex-shrink: 0;
        }
        .vc-header-label {
          display: block;
          font-size: 0.6rem;
          font-weight: 900;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 3px;
        }
        .vc-header-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: white;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 260px;
        }
        .vc-close-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .vc-close-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        /* ── INFO STRIP ── */
        .vc-info-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: rgba(255, 193, 7, 0.06);
          border-bottom: 1px solid rgba(255, 193, 7, 0.12);
          font-size: 0.72rem;
          color: rgba(255, 193, 7, 0.8);
          font-weight: 600;
          flex-shrink: 0;
        }

        /* ── MESSAGES ── */
        .vc-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }
        .vc-messages::-webkit-scrollbar { width: 4px; }
        .vc-messages::-webkit-scrollbar-thumb {
          background: rgba(var(--accent-rgb), 0.3);
          border-radius: 2px;
        }

        .vc-msg {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          max-width: 90%;
        }
        .vc-msg--user {
          flex-direction: row-reverse;
          align-self: flex-end;
        }
        .vc-msg--sensei {
          align-self: flex-start;
        }

        .vc-msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(var(--accent-rgb), 0.15);
          border: 1px solid rgba(var(--accent-rgb), 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        .vc-msg-bubble {
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .vc-msg--sensei .vc-msg-bubble {
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid rgba(var(--accent-rgb), 0.18);
          color: rgba(255, 255, 255, 0.9);
          border-radius: 6px 18px 18px 18px;
        }
        .vc-msg--user .vc-msg-bubble {
          background: var(--accent);
          color: white;
          border-radius: 18px 6px 18px 18px;
          box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.3);
        }

        /* Typing indicator */
        .vc-typing {
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 16px 20px;
        }
        .vc-typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          animation: vcBounce 1.2s infinite;
        }
        .vc-typing span:nth-child(2) { animation-delay: 0.2s; }
        .vc-typing span:nth-child(3) { animation-delay: 0.4s; }

        /* Validated banner */
        .vc-validated-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 18px;
          color: #10b981;
        }
        .vc-validated-banner strong {
          display: block;
          font-size: 1.1rem;
          font-weight: 900;
          margin-bottom: 4px;
        }
        .vc-validated-banner p {
          margin: 0;
          font-size: 0.85rem;
          color: rgba(16, 185, 129, 0.8);
        }

        /* ── INPUT AREA ── */
        .vc-input-area {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          gap: 12px;
          align-items: flex-end;
          flex-shrink: 0;
          background: rgba(0, 0, 0, 0.2);
        }
        .vc-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 12px 16px;
          color: white;
          font-size: 0.9rem;
          font-family: 'Outfit', sans-serif;
          outline: none;
          resize: none;
          transition: border-color 0.3s;
          line-height: 1.5;
        }
        .vc-input:focus { border-color: var(--accent); }
        .vc-input::placeholder { color: rgba(255, 255, 255, 0.3); }
        .vc-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .vc-send-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.4);
          flex-shrink: 0;
        }
        .vc-send-btn:hover:not(:disabled) {
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.6);
        }
        .vc-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .vc-spin {
          animation: spin 1s linear infinite;
        }

        /* ── ANIMATIONS ── */
        @keyframes vcFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes vcSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes vcBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: vcFadeIn 0.3s ease-out;
        }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          .vc-panel {
            width: 100vw;
            border-left: none;
            border-top: 1px solid rgba(var(--accent-rgb), 0.2);
          }
          .vc-header { padding: 16px 18px; }
          .vc-messages { padding: 16px 14px; }
          .vc-input-area { padding: 12px 14px; }
          .vc-header-title { max-width: 180px; font-size: 0.85rem; }
        }
      `}</style>
    </>
  );
}
