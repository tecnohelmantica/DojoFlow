
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Lock, 
  Unlock, 
  Sparkles, 
  Zap, 
  Layers, 
  Repeat, 
  GitBranch, 
  Box, 
  Variable, 
  Infinity, 
  Trophy,
  MessageSquare,
  Clock,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

const CODE_SECTIONS = [
  { id: 'code_sequences', name: 'Secuencias', icon: Zap, color: '#FFD700', description: 'El orden de las instrucciones importa.' },
  { id: 'code_sprites', name: 'Sprites', icon: Box, color: '#FF4B4B', description: 'Personajes y objetos interactivos.' },
  { id: 'code_events', name: 'Eventos', icon: Sparkles, color: '#4CD137', description: 'Acciones que disparan reacciones.' },
  { id: 'code_loops', name: 'Bucles', icon: Repeat, color: '#00A8FF', description: 'Repeticiones para ahorrar código.' },
  { id: 'code_conditionals', name: 'Condicionales', icon: GitBranch, color: '#9C27B0', description: 'Toma de decisiones lógicas.' },
  { id: 'code_functions', name: 'Funciones', icon: Layers, color: '#E44D26', description: 'Empaquetado de tareas repetitivas.' },
  { id: 'code_variables', name: 'Variables', icon: Variable, color: '#FBC531', description: 'Cajas para guardar información.' },
  { id: 'code_for_loops', name: 'Bucles Para', icon: Infinity, color: '#487EB0', description: 'Contadores y repeticiones precisas.' },
  { id: 'code_final_project', name: 'Proyecto Final', icon: Trophy, color: '#7F8FA6', description: '¡Tu gran creación en la academia!' }
];

const STATUS_CONFIG = {
  'Validado': { color: '#22c55e', icon: Unlock, label: 'SUPERADO' },
  'En revisión': { color: '#d4881e', icon: Clock, label: 'EN REVISIÓN' },
  'Corregir': { color: '#ff4b2b', icon: AlertCircle, label: 'CORREGIR' },
  'No iniciado': { color: '#999', icon: Lock, label: 'BLOQUEADO' }
};

const CodeBadges = ({ userId, onValidateBadge, refreshTrigger = 0 }) => {
  const [badgeData, setBadgeData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchBadges();
  }, [userId, refreshTrigger]);

  const fetchBadges = async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('badge_name, status, teacher_feedback')
      .eq('student_id', userId)
      .eq('planet_id', 'code');
    
    if (data) {
      const mapped = {};
      data.forEach(b => {
        mapped[b.badge_name] = {
          status: b.status || 'Validado',
          feedback: b.teacher_feedback
        };
      });
      setBadgeData(mapped);
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <div className="code-badges-container" style={{ marginTop: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '15px' }}>
        {CODE_SECTIONS.map((section) => {
          const info = badgeData[section.id];
          const status = info?.status || 'No iniciado';
          const isEarned = status === 'Validado';
          const Icon = section.icon;
          const config = STATUS_CONFIG[status];
          const StatusIcon = config.icon;
          
          return (
            <div key={section.id} style={{ position: 'relative' }}>
              <GlassCard 
                style={{ 
                  padding: '15px 10px', 
                  textAlign: 'center', 
                  background: isEarned ? `${section.color}11` : (status === 'Corregir' ? 'rgba(255, 75, 43, 0.05)' : 'rgba(255,255,255,0.4)'),
                  border: isEarned ? `2px solid ${section.color}` : (status === 'Corregir' ? '2px solid #ff4b2b' : (status === 'En revisión' ? '2px solid #d4881e' : '1px solid rgba(0,0,0,0.05)')),
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isEarned ? 'scale(1)' : 'scale(0.95)',
                  opacity: status === 'No iniciado' ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: status !== 'No iniciado' ? section.color : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: status !== 'No iniciado' ? 'white' : '#999',
                  boxShadow: isEarned ? `0 0 15px ${section.color}66` : 'none',
                  transition: 'all 0.3s'
                }}>
                  <Icon size={20} />
                </div>
                
                <h4 style={{ fontSize: '0.65rem', fontWeight: '800', margin: 0, color: '#0094e8' }}>
                  {section.name.toUpperCase()}
                </h4>

                {status === 'No iniciado' ? (
                  <button 
                    onClick={() => onValidateBadge(section)}
                    style={{
                      marginTop: '5px',
                      background: 'white',
                      border: '1.5px solid #0094e8',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.55rem',
                      fontWeight: '900',
                      color: '#0094e8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(0, 148, 232, 0.15)'
                    }}
                  >
                    <MessageSquare size={10} color="#0094e8" /> VALIDAR
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <StatusIcon size={10} color={config.color} />
                      <span style={{ fontSize: '0.55rem', fontWeight: '900', color: config.color }}>{config.label}</span>
                    </div>
                    {status === 'Corregir' && (
                      <button 
                        onClick={() => onValidateBadge(section)}
                        style={{
                          marginTop: '2px',
                          background: '#ff4b2b',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.5rem',
                          fontWeight: '800',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <RefreshCcw size={8} /> REINTENTAR
                      </button>
                    )}
                  </div>
                )}
                
                {info?.feedback && status === 'Corregir' && (
                  <div style={{ 
                    marginTop: '5px', 
                    padding: '5px', 
                    background: 'white', 
                    borderRadius: '6px', 
                    fontSize: '0.5rem', 
                    color: '#666', 
                    fontStyle: 'italic',
                    border: '1px solid rgba(255, 75, 43, 0.2)',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    "{info.feedback}"
                  </div>
                )}
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CodeBadges;
