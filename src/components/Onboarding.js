"use client";
import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { X, Rocket, BookOpen, Users, Sparkles, BrainCircuit, Trophy, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function Onboarding() {
  const { profile, role, updateProfile } = useAuth();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (pathname === '/auth') return;
    if (profile?.id) {
      // Usar flag de base de datos si existe, si no fallback a localStorage
      const hasSeenDB = profile.has_seen_onboarding;
      const hasSeenLocal = localStorage.getItem(`onboarding_seen_${profile.id}`);
      
      if (!hasSeenDB && !hasSeenLocal) {
        setStep(0); 
        setShow(true);
      }
    }
  }, [profile, pathname]);

  // Asegurar que si por algún motivo show cambia a true, el step sea 0
  useEffect(() => {
    if (show) setStep(0);
  }, [show]);

  const closeOnboarding = async () => {
    if (profile?.id) {
      // 1. Guardar en localStorage para feedback inmediato
      localStorage.setItem(`onboarding_seen_${profile.id}`, 'true');
      
      // 2. Guardar en base de datos para persistencia real
      try {
        await supabase
          .from('profiles')
          .update({ has_seen_onboarding: true })
          .eq('id', profile.id);
        
        // 3. Actualizar estado local del profile
        updateProfile({ has_seen_onboarding: true });
      } catch (err) {
        console.error("Error saving onboarding status:", err);
      }
    }
    setShow(false);
  };

  if (!show) return null;

  const isTeacher = role === 'profesor';

  const teacherSteps = [
    {
      title: "¡Bienvenido, Maestro Docente!",
      content: "DojoFlow es tu centro de mando para la educación tecnológica. Aquí podrás gestionar recursos, forjar prompts pedagógicos y supervisar a tus alumnos.",
      icon: <Sparkles size={48} color="var(--accent-cyan)" />,
      color: "var(--accent-cyan)"
    },
    {
      title: "Ingeniero de Prompts",
      content: "Utiliza nuestro Laboratorio Ninja en cada planeta para crear instrucciones precisas para la IA. Define el rol, la tarea y el contexto para obtener resultados educativos óptimos.",
      icon: <BrainCircuit size={48} color="var(--accent-purple)" />,
      color: "var(--accent-purple)"
    },
    {
      title: "Tu Biblioteca Maestra",
      content: "Sube infografías, vídeos y presentaciones. Puedes marcarlos como 'Maestros' para que sean visibles globalmente o asignarlos específicamente a tus aulas.",
      icon: <BookOpen size={48} color="var(--accent-teal)" />,
      color: "var(--accent-teal)"
    },
    {
      title: "Gestión de Aulas",
      content: "Desde la pestaña 'Mis Aulas' de cada planeta, vincula tus recursos a tus clases. Tus alumnos los verán instantáneamente mientras trabajan en sus retos.",
      icon: <Users size={48} color="#00cc55" />,
      color: "#00cc55"
    }
  ];

  const studentSteps = [
    {
      title: "¡Bienvenido, Joven Explorador!",
      content: "Estás a punto de comenzar tu viaje en el Dojo. Aquí aprenderás programación superando Retos Ninja y explorando diferentes planetas tecnológicos.",
      icon: <Rocket size={48} color="var(--accent-teal)" />,
      color: "var(--accent-teal)"
    },
    {
      title: "Itinerarios de Aprendizaje",
      content: "Cada planeta (Scratch, Python, Arduino...) tiene sus propios retos. Supera los niveles para desbloquear nuevas misiones y subir de rango.",
      icon: <Trophy size={48} color="#ffd43b" />,
      color: "#ffd43b"
    },
    {
      title: "Tu Pergamino Ninja",
      content: "En tu perfil podrás ver tus logros, los retos completados y las medallas obtenidas. ¡Tu progreso es único!",
      icon: <BookOpen size={48} color="var(--accent-cyan)" />,
      color: "var(--accent-cyan)"
    },
    {
      title: "Ayuda del Tutor IA",
      content: "¿Te has quedado atascado? No te preocupes. Nuestra IA te dará pistas y te guiará paso a paso sin darte la solución directa. ¡Aprende haciendo!",
      icon: <Sparkles size={48} color="var(--accent-purple)" />,
      color: "var(--accent-purple)"
    }
  ];

  const steps = isTeacher ? teacherSteps : studentSteps;
  const currentStep = steps[step];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <GlassCard style={{ 
        maxWidth: '500px', 
        width: '100%', 
        padding: '40px', 
        position: 'relative',
        textAlign: 'center',
        border: `2px solid ${currentStep.color}33`,
        background: 'rgba(255,255,255,0.95)'
      }}>
        <button 
          onClick={closeOnboarding}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a9e' }}
        >
          <X size={24} />
        </button>

        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            background: `${currentStep.color}15`, 
            padding: '20px', 
            borderRadius: '24px',
            animation: 'float 3s ease-in-out infinite'
          }}>
            {currentStep.icon}
          </div>
        </div>

        <h2 style={{ 
          fontFamily: 'Outfit', 
          fontSize: '1.8rem', 
          fontWeight: '800', 
          marginBottom: '16px',
          color: currentStep.color
        }}>
          {currentStep.title}
        </h2>

        <p style={{ 
          color: '#475569', 
          lineHeight: '1.6', 
          marginBottom: '32px',
          fontSize: '1.05rem'
        }}>
          {currentStep.content}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {steps.map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: i === step ? '24px' : '8px', 
                  height: '8px', 
                  borderRadius: '4px', 
                  background: i === step ? currentStep.color : '#e2e8f0',
                  transition: 'all 0.3s ease'
                }} 
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={20} /> Atrás
              </button>
            )}
            
            {step < steps.length - 1 ? (
              <GlowButton color="custom" onClick={() => setStep(step + 1)} style={{ '--glow-color': currentStep.color }}>
                Siguiente <ChevronRight size={18} />
              </GlowButton>
            ) : (
              <GlowButton color="custom" onClick={closeOnboarding} style={{ '--glow-color': currentStep.color }}>
                ¡Comenzar!
              </GlowButton>
            )}
          </div>
        </div>
      </GlassCard>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
