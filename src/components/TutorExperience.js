'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Award, ArrowRight, CheckCircle2, XCircle, Send, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { diagnosticQuizzes } from '../data/diagnosticQuizzes';
import { getPlanetById } from '../lib/planets';

const TutorExperience = ({ technology, onComplete }) => {
  const { signOut } = useAuth();
  const [step, setStep] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  
  const planet = getPlanetById(technology);
  const planetName = planet?.name || technology?.toUpperCase() || 'SECTOR';
  
  let techKey = technology?.toLowerCase() || 'code';
  if (typeof diagnosticQuizzes[techKey] === 'string') {
    techKey = diagnosticQuizzes[techKey];
  }
  const questions = diagnosticQuizzes[techKey] || diagnosticQuizzes.code;

  const handleStart = () => {
    setStep('quiz');
  };

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    
    setSelectedOption(index);
    const isCorrect = index === questions[currentQuestion].correcta;
    
    setFeedbackType(isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true);
    
    if (isCorrect) setScore(prev => prev + 1);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setStep('result');
    }
  };

  const calculateLevel = () => {
    if (score === 3) return { label: 'NINJA', style: 'ninja', icon: '🔥' };
    if (score === 2) return { label: 'GUERRERO', style: 'warrior', icon: '⚔️' };
    return { label: 'NOVATO', style: 'novice', icon: '🌱' };
  };

  const levelInfo = calculateLevel();

  return (
    <div className="tutor-container">
      <style jsx>{`
        .tutor-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          border: 1px solid rgba(13, 207, 207, 0.2);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tutor-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .avatar-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #0dcfcf, #9c27b0);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(13, 207, 207, 0.3);
        }

        .tutor-bubble {
          background: #f0f7f7;
          padding: 20px;
          border-radius: 0 20px 20px 20px;
          position: relative;
          margin-bottom: 30px;
        }

        .quiz-option {
          width: 100%;
          padding: 15px 20px;
          margin-bottom: 12px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: white;
          text-align: left;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .quiz-option:hover {
          border-color: #0dcfcf;
          background: #f0fdfd;
          transform: translateX(5px);
        }

        .quiz-option.selected-correct {
          border-color: #10b981;
          background: #ecfdf5;
          color: #065f46;
        }

        .quiz-option.selected-wrong {
          border-color: #ef4444;
          background: #fef2f2;
          color: #991b1b;
        }

        .feedback-box {
          margin-top: 20px;
          padding: 15px;
          border-radius: 12px;
          animation: fadeIn 0.3s ease-out;
        }

        .feedback-correct { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .feedback-wrong { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .btn-action {
          background: linear-gradient(135deg, #0dcfcf, #9c27b0);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          transition: transform 0.2s;
        }

        .btn-action:hover {
          transform: scale(1.05);
        }

        .result-card {
          text-align: center;
          padding: 20px;
        }

        .level-badge {
          font-size: 3rem;
          margin: 20px 0;
        }

        .level-text {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 15px;
        }

        .ninja { color: #9c27b0; }
        .warrior { color: #0dcfcf; }
        .novice { color: #10b981; }
      `}</style>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <button 
          onClick={signOut}
          style={{ 
            background: 'white', 
            border: '1px solid #eee', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            color: '#ff4b4b'
          }}
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>
      </div>

      {step === 'welcome' && (
        <div className="welcome-step">
          <div className="tutor-header">
            <div className="avatar-circle"><Brain size={32} /></div>
            <div>
              <h3 style={{ margin: 0, color: '#1a1a2e' }}>Sensei Dojo</h3>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>Tutor de Inteligencia Artificial</span>
            </div>
          </div>
          <div className="tutor-bubble">
            <p style={{ margin: 0, lineHeight: '1.6' }}>
              ¡Hola joven Ninja! Soy tu tutor IA. Antes de empezar tu viaje en <strong>{planetName}</strong>, 
              necesito saber qué secretos de este planeta ya dominas. <br/><br/>
              ¿Hacemos un pequeño desafío de nivelación?
            </p>
          </div>
          <button className="btn-action" onClick={handleStart}>
            ACEPTO EL DESAFÍO <Brain size={18} />
          </button>
        </div>
      )}

      {step === 'quiz' && (
        <div className="quiz-step">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#666' }}>
              PREGUNTA {currentQuestion + 1} DE {questions.length}
            </span>
            <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '6px' }}>
              <div style={{ 
                width: `${((currentQuestion + 1) / questions.length) * 100}%`, 
                height: '100%', 
                background: '#0dcfcf', 
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>{questions[currentQuestion].pregunta}</h3>

          <div className="options-list">
            {questions[currentQuestion].opciones.map((op, idx) => (
              <button 
                key={idx}
                className={`quiz-option ${
                  showFeedback && idx === questions[currentQuestion].correcta ? 'selected-correct' : 
                  showFeedback && idx === selectedOption && idx !== questions[currentQuestion].correcta ? 'selected-wrong' : ''
                }`}
                onClick={() => handleOptionSelect(idx)}
                disabled={showFeedback}
              >
                {op}
                {showFeedback && idx === questions[currentQuestion].correcta && <CheckCircle2 size={18} />}
                {showFeedback && idx === selectedOption && idx !== questions[currentQuestion].correcta && <XCircle size={18} />}
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`feedback-box ${feedbackType === 'correct' ? 'feedback-correct' : 'feedback-wrong'}`}>
              <div style={{ display: 'flex', gap: '10px' }}>
                {feedbackType === 'correct' ? <Sparkles size={20} /> : <Brain size={20} />}
                <div>
                  <p style={{ fontWeight: '800', margin: '0 0 5px' }}>
                    {feedbackType === 'correct' ? '¡MARAVILLOSO!' : '¡Mmm, CASI!'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{questions[currentQuestion].explicacion}</p>
                </div>
              </div>
              <button 
                className="btn-action" 
                style={{ marginTop: '15px', width: '100%', justifyContent: 'center' }}
                onClick={handleNext}
              >
                {currentQuestion < questions.length - 1 ? 'SIGUIENTE PREGUNTA' : 'VER MI RESULTADO'} <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'result' && (
        <div className="result-card">
          <Award size={64} color="#0dcfcf" />
          <h2>¡Evaluación Completada!</h2>
          <div className="level-badge">{levelInfo.icon}</div>
          <p style={{ margin: 0, color: '#666' }}>Tu nivel actual en {planetName} es:</p>
          <div className={`level-text ${levelInfo.style}`}>{levelInfo.label}</div>
          
          <div className="tutor-bubble" style={{ textAlign: 'left', borderRadius: '20px' }}>
            <p style={{ margin: 0 }}>
              {score === 3 ? 
                '¡Vaya! Tus conocimientos son impresionantes. Podrás saltarte los retos básicos e ir directo a las misiones críticas.' :
                score >= 1 ?
                'Tienes una base sólida. Vamos a reforzar algunos conceptos y pronto serás un experto.' :
                '¡Un diamante en bruto! No te preocupes, empezaremos desde lo más divertido para que domines este campo pronto.'
              }
            </p>
          </div>

          <button className="btn-action" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onComplete(levelInfo.label)}>
            EMPEZAR MI ITINERARIO <CheckCircle2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorExperience;
