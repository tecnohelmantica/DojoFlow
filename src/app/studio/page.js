"use client";
import React from 'react';
import RouteGuard from '../../components/RouteGuard';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import { Users, CheckCircle, Activity, Headphones, FileText, LayoutTemplate } from 'lucide-react';
import './page.css';

export default function StudioPage() {
  return (
    <RouteGuard requiredRole="profesor" redirectTo="/profile">
      <div className="studio-container">
        <div className="studio-header">
          <h1 className="glow-text-purple">Dojo Studio</h1>
          <p>Panel de Control Docente e Inteligencia Artificial Generativa</p>
        </div>


        <section className="planet-selector-section">
          <h2 className="section-title">Centro de Gestión por Tecnología</h2>
          <p style={{ color: '#8a8a9e', marginBottom: '32px' }}>Selecciona una tecnología para gestionar tu biblioteca de recursos y las aulas correspondientes.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { id: 'scratch', name: 'Scratch', color: '#ff7700', icon: '🧩' },
              { id: 'arduino', name: 'Arduino / C++', color: '#00979d', icon: '🤖' },
              { id: 'tinkercad', name: 'Tinkercad 3D', color: '#e74c3c', icon: '🏗️' },
              { id: 'python', name: 'Python', color: '#3776ab', icon: '🐍' },
              { id: 'html', name: 'Desarrollo Web (HTML/JS)', color: '#e34f26', icon: '🌐' },
              { id: 'makecode-microbit', name: 'BBC micro:bit', color: '#00ceca', icon: '📟' }
            ].map(planet => (
              <GlassCard 
                key={planet.id} 
                className="generator-card glass-card-hover" 
                style={{ cursor: 'pointer', textAlign: 'center' }}
                onClick={() => window.location.href = `/studio/${planet.id}`}
              >
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{planet.icon}</div>
                <h3 style={{ fontFamily: 'Outfit', color: '#1a1a2e' }}>{planet.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#8a8a9e', marginTop: '8px' }}>Gestionar biblioteca y aulas de {planet.name}</p>
                <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', background: planet.color + '15', color: planet.color, fontWeight: '700', fontSize: '0.85rem' }}>
                   Entrar al Studio →
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </RouteGuard>
  );
}
