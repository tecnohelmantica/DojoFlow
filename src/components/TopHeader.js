import React, { useState } from 'react';
import { LogOut, Bell, User, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from './AuthProvider';

const TopHeader = () => {
  const { signOut, profile, role, notifications, markNotificationsAsRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const isProfesor = role === 'profesor';

  const handleMarkAsRead = () => {
    markNotificationsAsRead();
    setTimeout(() => setShowNotifications(false), 500);
  };

  return (
    <div className="top-header" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingBottom: '24px',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      marginBottom: '20px',
      position: 'relative',
      zIndex: '1000'
    }}>
      <div className="profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="avatar-small" style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          background: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={18} color="#666" />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a1a2e', textTransform: 'capitalize' }}>
            {profile?.alias || profile?.real_name || (isProfesor ? 'Profesor' : 'Explorador')}
          </span>
          <span style={{ 
            fontSize: '0.65rem', 
            fontWeight: '700', 
            padding: '2px 8px', 
            borderRadius: '6px', 
            background: isProfesor ? '#f0e6fc' : '#e8fffc', 
            color: isProfesor ? 'var(--accent-purple)' : 'var(--accent-teal)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {isProfesor ? 'Docente' : 'Alumno'}
          </span>
        </div>
      </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ 
                cursor: 'pointer', 
                color: 'var(--accent-teal)', 
                position: 'relative',
                padding: '8px',
                borderRadius: '50%',
                background: showNotifications ? 'rgba(0,0,0,0.03)' : 'transparent',
                transition: 'all 0.2s'
              }}
              title="Notificaciones"
            >
              <Bell size={22} />
              {notifications.length > 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px', 
                  width: '8px', 
                  height: '8px', 
                  background: '#ff4b4b', 
                  borderRadius: '50%', 
                  border: '2px solid white' 
                }}></div>
              )}
            </div>

            {showNotifications && (
              <div style={{ 
                position: 'absolute',
                top: '45px',
                right: '0',
                width: '300px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.05)',
                overflow: 'hidden',
                animation: 'slideIn 0.2s ease-out'
              }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Notificaciones</span>
                  {notifications.length > 0 && (
                    <span 
                      onClick={handleMarkAsRead}
                      style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Marcar como leídas
                    </span>
                  )}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div key={notif.id} style={{ 
                        padding: '12px 15px', 
                        borderBottom: '1px solid #f8f8f8',
                        display: 'flex',
                        gap: '12px',
                        cursor: 'pointer'
                      }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9ff'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: notif.type === 'pending' ? '#fff4e6' : '#e6fff4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {notif.type === 'pending' ? <Clock size={16} color="#ff922b" /> : <CheckCircle size={16} color="#40c057" />}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.8rem', margin: 0, color: '#333', lineHeight: '1.4' }}>{notif.text}</p>
                          <span style={{ fontSize: '0.7rem', color: '#999' }}>{notif.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8a8a9e' }}>
                      <CheckCircle size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>No tienes notificaciones pendientes</p>
                    </div>
                  )}
                </div>
                <div style={{ padding: '12px', textAlign: 'center', background: '#fcfcfc' }}>
                  <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: '600' }}>Ver todo el historial</span>
                </div>
              </div>
            )}
          </div>

          <div 
            onClick={signOut}
            style={{ 
              cursor: 'pointer', 
              color: '#ff4b4b', 
              padding: '6px 12px',
              borderRadius: '20px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 75, 75, 0.05)',
              border: '1px solid rgba(255, 75, 75, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 75, 75, 0.1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 75, 75, 0.05)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
            <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Cerrar Sesión</span>
          </div>
        </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TopHeader;
