import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, HelpCircle, Loader2, Brain, AlertCircle, Send, MessageSquare, RefreshCw } from 'lucide-react';
import GlowButton from './GlowButton';

export default function SocraticTutor({ planetId, userId, studentLevel, accentColor = '#00d2ff' }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Helper to get RGB from Hex
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 210, 255';
  };

  const accentRgb = hexToRgb(accentColor);

  // Load chat history from localStorage
  useEffect(() => {
    if (planetId) {
      const saved = localStorage.getItem(`dojoflow_custom_mission_chat_${planetId}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load custom mission chat history", e);
        }
      } else {
        // Welcome message if no chat exists
        const welcome = {
          role: 'sensei',
          text: `¡Hola! Veo que estás creando un proyecto libre inventado por ti en ${planetId === 'scratch' ? 'Scratch' : planetId}. ¡Eso es maravilloso! 🚀\n\nComo aquí no tienes instrucciones fijas, puedes escribirme cualquier duda que tengas (ej: _"¿cómo programo la gravedad?"_ o _"¿por qué mi personaje traspasa el suelo?"_) y te guiaré paso a paso para que encuentres la solución pensando la lógica. ¿Por dónde empezamos? 🥋`
        };
        setMessages([welcome]);
      }
    }
  }, [planetId]);

  // Save chat history to localStorage
  const saveChat = (newMessages) => {
    setMessages(newMessages);
    localStorage.setItem(`dojoflow_custom_mission_chat_${planetId}`, JSON.stringify(newMessages));
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e, textToSend = null) => {
    e?.preventDefault();
    const query = textToSend ? textToSend.trim() : inputText.trim();
    if (!query || loading) return;

    if (!textToSend) setInputText('');
    setError(null);
    setLoading(true);

    const userMsg = { role: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    saveChat(updatedMessages);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mode: 'tutor',
          planet: planetId,
          level: studentLevel || 'Intermedio',
          message: query,
          history: updatedMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.text
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        const senseiMsg = { role: 'sensei', text: data.text };
        saveChat([...updatedMessages, senseiMsg]);
      } else {
        setError(data.error || 'El Sensei no ha podido responder en este momento.');
      }
    } catch (err) {
      console.warn("Error fetching chat response:", err.message);
      setError('Se ha interrumpido la conexión con el Dojo. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const askGeneralHint = () => {
    const prompt = messages.length <= 1 
      ? `Sensei, ¿podrías darme un consejo socrático inicial sobre cómo organizar la lógica de mi proyecto?`
      : `Sensei, ¿podrías darme otra pista socrática general para seguir avanzando en la lógica?`;
    handleSend(null, prompt);
  };

  const handleClearChat = () => {
    if (confirm("¿Quieres reiniciar tu conversación con el Sensei de este planeta?")) {
      const welcome = {
        role: 'sensei',
        text: `¡Dojo reiniciado! Cuéntame qué parte de tu proyecto te gustaría resolver ahora.`
      };
      saveChat([welcome]);
    }
  };

  return (
    <div className="socratic-chat-container" style={{ '--accent': accentColor, '--accent-rgb': accentRgb }}>
      
      {/* HEADER DEL SENSEI */}
      <div className="chat-header">
        <div className="header-left">
          <div className="status-dot-outer">
            <div className="status-dot"></div>
          </div>
          <div>
            <span className="tutor-label">TUTOR SOCRÁTICO</span>
            <p className="tutor-status">El Sensei está escuchando</p>
          </div>
        </div>
        <button className="clear-btn" onClick={handleClearChat} title="Reiniciar conversación">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* HISTORIAL DE MENSAJES */}
      <div className="chat-messages-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble-wrapper ${msg.role === 'user' ? 'user' : 'sensei'} animate-fade-in`}>
            {msg.role === 'sensei' && (
              <div className="sensei-avatar-mini">
                <Brain size={14} />
              </div>
            )}
            <div className="chat-bubble">
              {msg.text.split('\n').map((line, lIdx) => {
                // Render bold strings
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={lIdx} style={{ margin: lIdx > 0 ? '6px 0 0' : 0 }}>
                    {parts.map((part, pIdx) =>
                      pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-wrapper sensei">
            <div className="sensei-avatar-mini pulsing">
              <Brain size={14} />
            </div>
            <div className="chat-bubble typing-bubble">
              <span /><span /><span />
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error animate-slide-up">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ÁREA DE ESCRIBIR */}
      <div className="chat-input-wrapper">
        {messages.length <= 1 && (
          <div className="shortcuts-row">
            <button className="shortcut-btn" onClick={askGeneralHint}>
              💡 Dame un consejo inicial
            </button>
            <button className="shortcut-btn" onClick={() => handleSend(null, "¿Cómo puedo programar saltos con gravedad?")}>
              🦘 ¿Cómo programar la gravedad?
            </button>
          </div>
        )}

        <form className="chat-input-form" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Pregúntale al Sensei cómo programar tu lógica..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="chat-text-input"
          />
          <button 
            type="submit" 
            disabled={loading || !inputText.trim()} 
            className="chat-send-btn"
            style={{ background: accentColor }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        
        {messages.length > 1 && (
          <div className="shortcuts-footer-row">
            <button className="text-shortcut" onClick={askGeneralHint}>
              💡 Pista general del Sensei
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .socratic-chat-container {
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          background: linear-gradient(160deg, rgba(30, 41, 74, 0.75) 0%, rgba(20, 25, 46, 0.9) 100%);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          overflow: hidden;
          width: 100%;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          font-family: 'Outfit', sans-serif;
        }

        /* ── HEADER ── */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(var(--accent-rgb), 0.05);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .status-dot-outer {
          position: relative;
          width: 10px;
          height: 10px;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
          animation: pulseGlow 2s infinite;
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .tutor-label {
          display: block;
          font-size: 0.6rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .tutor-status {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.65);
          margin: 0;
          font-weight: 500;
        }
        .clear-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: rotate(180deg);
        }

        /* ── MESSAGES ── */
        .chat-messages-area {
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 380px;
          overflow-y: auto;
          padding: 20px;
          background: rgba(0, 0, 0, 0.15);
        }
        .chat-messages-area::-webkit-scrollbar {
          width: 4px;
        }
        .chat-messages-area::-webkit-scrollbar-thumb {
          background: rgba(var(--accent-rgb), 0.25);
          border-radius: 2px;
        }

        .chat-bubble-wrapper {
          display: flex;
          gap: 10px;
          max-width: 85%;
          align-items: flex-start;
        }
        .chat-bubble-wrapper.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .chat-bubble-wrapper.sensei {
          align-self: flex-start;
        }

        .sensei-avatar-mini {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(var(--accent-rgb), 0.15);
          border: 1px solid rgba(var(--accent-rgb), 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.25);
        }
        .sensei-avatar-mini.pulsing {
          animation: breathing 1.5s infinite ease-in-out;
        }
        @keyframes breathing {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.25); }
          50% { transform: scale(1.08); box-shadow: 0 0 18px rgba(var(--accent-rgb), 0.55); }
        }

        .chat-bubble {
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 0.88rem;
          line-height: 1.55;
        }
        .user .chat-bubble {
          background: var(--accent);
          color: white;
          border-radius: 18px 4px 18px 18px;
          box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.25);
        }
        .sensei .chat-bubble {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
          border-radius: 4px 18px 18px 18px;
        }

        /* Typing indicator */
        .typing-bubble {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 14px 20px;
        }
        .typing-bubble span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: bounce 1.2s infinite;
        }
        .typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
        .typing-bubble span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }

        .chat-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 0.8rem;
        }

        /* ── INPUT AREA ── */
        .chat-input-wrapper {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shortcuts-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .shortcut-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 14px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .shortcut-btn:hover {
          background: rgba(var(--accent-rgb), 0.1);
          border-color: rgba(var(--accent-rgb), 0.3);
          color: white;
          transform: translateY(-1px);
        }

        .chat-input-form {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .chat-text-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 12px 16px;
          color: white;
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.3s;
        }
        .chat-text-input:focus {
          border-color: var(--accent);
        }
        .chat-text-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .chat-text-input:disabled {
          opacity: 0.5;
        }

        .chat-send-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
        }
        .chat-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.5);
        }
        .chat-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .shortcuts-footer-row {
          display: flex;
          justify-content: flex-start;
        }
        .text-shortcut {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          opacity: 0.8;
          transition: opacity 0.2s;
          font-family: inherit;
        }
        .text-shortcut:hover {
          opacity: 1;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
