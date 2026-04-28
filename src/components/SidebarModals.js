"use client";
import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';
import { 
  X, Trophy, MessageSquare, BookOpen, Clock, 
  ExternalLink, Download, FileText, ChevronRight, 
  Sparkles, CheckCircle2, Zap, Brain
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getPlanetById } from '../lib/planets';

export default function SidebarModals({ activeModal, onClose, userId, role }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (activeModal && userId) {
      loadModalData();
    } else {
      setData([]);
      setSelectedItem(null);
    }
  }, [activeModal, userId]);

  const loadModalData = async () => {
    setLoading(true);
    try {
      if (activeModal === 'Retos') {
        // Cargar todos los retos validados del alumno
        const { data: challenges, error } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('student_id', userId)
          .eq('status', 'Validado')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        setData(challenges || []);
      } else if (activeModal === 'Tutor') {
        // Cargar historias de chat (reutilizamos recursos_docentes con tipo 'conversacion_tutor')
        const { data: chats, error } = await supabase
          .from('recursos_docentes')
          .select('*')
          .eq('profesor_id', userId)
          .eq('tipo_recurso', 'conversacion_tutor')
          .order('fecha_creacion', { ascending: false });
        
        if (error) throw error;
        setData(chats || []);
      } else if (activeModal === 'Pergamino') {
        // Cargar recursos maestros y de clase
        const MASTER_PROFESOR_ID = '5ec7cea5-1dfa-461f-8a07-ecf1da1854a6';
        
        // 1. Obtener IDs de las clases del alumno
        const { data: vincs } = await supabase
          .from('clase_alumnos')
          .select('clase_id')
          .eq('alumno_id', userId);
        
        const claseIds = (vincs || []).map(v => v.clase_id);

        // 2. Obtener recursos maestros
        const { data: masterRecs } = await supabase
          .from('recursos_docentes')
          .select('*')
          .eq('profesor_id', MASTER_PROFESOR_ID)
          .eq('contenido->meta->isGlobal', true);

        // 3. Obtener recursos de sus clases
        let classRecs = [];
        if (claseIds.length > 0) {
          const { data: cRecs } = await supabase
            .from('clase_recursos')
            .select('*, recursos_docentes(*)')
            .in('clase_id', claseIds);
          
          classRecs = (cRecs || []).map(cr => cr.recursos_docentes).filter(Boolean);
        }

        // Combinar y eliminar duplicados por ID
        const allRecs = [...(masterRecs || []), ...classRecs];
        const uniqueRecs = Array.from(new Map(allRecs.map(item => [item.id, item])).values());
        
        // Ordenar por tipo y fecha
        setData(uniqueRecs.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)));
      }
    } catch (err) {
      console.error(`Error loading ${activeModal} data:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeModal) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '20px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: '#0dcfcf', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#8a8a9e', fontWeight: '600' }}>Accediendo a los Archivos del Dojo...</span>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a8a9e' }}>
          <Zap size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
          <p>No se encontraron registros en esta sección todavía.</p>
          <p style={{ fontSize: '0.85rem' }}>¡Sigue explorando para desbloquear contenido!</p>
        </div>
      );
    }

    switch (activeModal) {
      case 'Retos':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.map((item) => {
              const planet = getPlanetById(item.planet_id);
              return (
                <div key={item.id} className="history-item" style={{ 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: planet?.barColor || '#0dcfcf', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Trophy size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.challenge_id.split('_').pop().toUpperCase()}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: planet?.barColor || '#0dcfcf' }}>{planet?.name || item.planet_id.toUpperCase()}</span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <CheckCircle2 size={20} color="#10b981" />
                </div>
              );
            })}
          </div>
        );

      case 'Tutor':
        if (selectedItem) {
          // Vista de detalle de conversación
          const messages = selectedItem.contenido.history || [];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <button onClick={() => setSelectedItem(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#0dcfcf', fontWeight: '700', marginBottom: '16px', cursor: 'pointer' }}>
                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> VOLVER AL HISTORIAL
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                {messages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  const text = msg.text || msg.content || '';
                  return (
                    <div key={i} style={{ 
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: isUser ? '16px 16px 0 16px' : '0 16px 16px 16px',
                      background: isUser ? '#0dcfcf' : '#f0f5f7',
                      color: isUser ? 'white' : '#1e293b',
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}>
                      {text}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.map((item) => (
              <div key={item.id} onClick={() => setSelectedItem(item)} style={{ 
                background: 'white', 
                padding: '16px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                border: '1px solid rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} className="chat-history-card">
                <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: 'linear-gradient(135deg, #0dcfcf, #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Brain size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Consulta sobre {item.tecnologia.toUpperCase()}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>{new Date(item.fecha_creacion).toLocaleDateString()} • {item.contenido.history?.length || 0} mensajes</p>
                </div>
                <ChevronRight size={18} color="#cbd5e1" />
              </div>
            ))}
          </div>
        );

      case 'Pergamino':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.map((item) => {
              const planet = getPlanetById(item.tecnologia);
              const isMaster = item.profesor_id === '5ec7cea5-1dfa-461f-8a07-ecf1da1854a6';
              const isLink = item.tipo_recurso === 'enlace';
              const content = item.contenido.markdown || '';
              
              return (
                <div key={item.id} style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ background: planet?.barColor || '#0dcfcf', padding: '8px', borderRadius: '8px', color: 'white' }}>
                      {isLink ? <ExternalLink size={16} /> : <FileText size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>{item.nombre_recurso}</h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: isMaster ? '#f59e0b' : '#3b82f6' }}>
                          {isMaster ? 'MAESTRO' : 'CLASE'}
                        </span>
                        <span style={{ color: '#cbd5e1' }}>•</span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{item.tipo_recurso.toUpperCase()}</span>
                      </div>
                    </div>
                    {isLink ? (
                      <a href={content} target="_blank" rel="noreferrer" style={{ background: '#f0f5f7', color: '#0dcfcf', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
                        ABRIR
                      </a>
                    ) : (
                      <button 
                        onClick={() => setSelectedItem(item)}
                        style={{ background: '#f0f5f7', color: '#0dcfcf', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        LEER
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Modal de Lectura para Pergamino */}
            {selectedItem && activeModal === 'Pergamino' && (
              <div style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                background: 'rgba(0,0,0,0.4)', zIndex: 1100, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
              }}>
                <GlassCard style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                  <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#f0f5f7', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                  <h2 style={{ marginBottom: '20px', paddingRight: '40px' }}>{selectedItem.nombre_recurso}</h2>
                  <div style={{ color: '#1e293b', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {selectedItem.contenido.markdown}
                  </div>
                  <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <GlowButton color="teal" onClick={() => setSelectedItem(null)}>CERRAR DOCUMENTO</GlowButton>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.3)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-start',
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out'
    }} onClick={onClose}>
      <GlassCard 
        style={{
          width: '100%',
          maxWidth: '500px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          animation: 'slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          marginLeft: 'var(--sidebar-width)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: '#0dcfcf', 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}>
              {activeModal === 'Retos' && <Trophy size={24} />}
              {activeModal === 'Tutor' && <MessageSquare size={24} />}
              {activeModal === 'Pergamino' && <BookOpen size={24} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {activeModal === 'Retos' ? 'Retos Logrados' : activeModal === 'Tutor' ? 'Memoria del Sensei' : 'Biblioteca Ancestral'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#8a8a9e', fontWeight: '600' }}>
                {activeModal === 'Retos' ? 'Tus victorias en la galaxia' : activeModal === 'Tutor' ? 'Conversaciones guardadas' : 'Documentos de maestro y clase'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: '#8a8a9e',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background 0.2s'
          }} onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <X size={24} />
          </button>
        </div>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px',
          background: 'rgba(242, 247, 249, 0.3)'
        }}>
          {renderContent()}
        </div>

        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid rgba(0,0,0,0.05)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#8a8a9e',
          fontWeight: '500'
        }}>
          DojoFlow Protocol v9.4 • Núcleo de Inteligencia Sincrónica
        </div>
      </GlassCard>

      <style jsx>{`
        @keyframes slideRight {
          from { transform: translateX(-100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .history-item:hover, .chat-history-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #0dcfcf22 !important;
        }
        .history-item, .chat-history-card {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}
