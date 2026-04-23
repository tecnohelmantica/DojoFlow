"use client";
import React from 'react';
import GlassCard from '../../components/GlassCard';
import { Shield, ArrowLeft, Mail, Database, Scale, UserCheck, Clock, Lock, FileText, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  const sectionStyle = {
    marginBottom: '30px',
    textAlign: 'left'
  };

  const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: '10px',
    fontFamily: 'Outfit'
  };

  const textStyle = {
    fontSize: '0.95rem',
    color: '#444',
    lineHeight: '1.6',
    marginLeft: '34px'
  };

  const highlightStyle = {
    color: 'var(--accent-teal)',
    fontWeight: '700'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f6f8fd 0%, #e9effd 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px'
    }}>
      <GlassCard style={{ maxWidth: '850px', width: '100%', padding: '40px' }}>
        <button 
          onClick={() => router.back()}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'none', 
            border: 'none', 
            color: 'var(--accent-purple)', 
            fontWeight: '700', 
            cursor: 'pointer',
            marginBottom: '30px'
          }}
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Shield size={48} color="var(--accent-purple)" style={{ marginBottom: '15px' }} />
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: '900', color: '#1a1a2e', margin: 0 }}>
            📄 Política de Privacidad
          </h1>
          <p style={{ color: '#8a8a9e', marginTop: '10px', fontWeight: '500' }}>DojoFlow: Tu espacio seguro de aprendizaje</p>
        </div>

        {/* 🔹 Responsable */}
        <div style={sectionStyle}>
          <div style={titleStyle}>
            <FileText size={22} color="var(--accent-blue)" />
            <span>Responsable del tratamiento</span>
          </div>
          <div style={textStyle}>
            <p><strong>Responsable:</strong> DojoFlow</p>
            <p><strong>Contacto:</strong> <span style={highlightStyle}>monsapri@gmail.com</span></p>
          </div>
        </div>

        {/* 🔹 Qué datos recogemos */}
        <div style={sectionStyle}>
          <div style={titleStyle}>
            <Mail size={22} color="var(--accent-teal)" />
            <span>Qué datos recogemos</span>
          </div>
          <p style={textStyle}>
            DojoFlow está diseñado para proteger tu identidad. El único dato personal que puede recopilarse es el <strong style={highlightStyle}>correo electrónico</strong>, y su facilitación es totalmente opcional.
            <br /><br />
            <em>"Se recomienda que, en el caso de menores, el correo electrónico facilitado sea el de sus tutores legales."</em>
          </p>
        </div>

        {/* 🔹 Finalidad */}
        <div style={sectionStyle}>
          <div style={titleStyle}>
            <UserCheck size={22} color="var(--accent-cyan)" />
            <span>Finalidad del tratamiento</span>
          </div>
          <p style={textStyle}>
            El uso del correo electrónico es opcional y su única finalidad es la <strong style={highlightStyle}>recuperación de contraseña</strong> en caso de pérdida.
            No se utilizará para marketing ni se compartirá con terceros.
          </p>
        </div>

        {/* 🔹 Base legal */}
        <div style={sectionStyle}>
          <div style={titleStyle}>
            <Scale size={22} color="var(--accent-purple)" />
            <span>Base legal</span>
          </div>
          <p style={textStyle}>
            Tratamos los datos basándonos en el <strong>consentimiento del usuario</strong> al facilitar el correo electrónico.
            Este consentimiento puede retirarse en cualquier momento eliminando el correo desde el perfil.
          </p>
        </div>

        {/* 🔹 Almacenamiento */}
        <div style={sectionStyle}>
          <div style={titleStyle}>
            <Database size={22} color="#555" />
            <span>Almacenamiento y seguridad</span>
          </div>
          <p style={textStyle}>
            Los datos se almacenan de forma segura utilizando servicios tecnológicos como <strong style={highlightStyle}>Supabase</strong> y <strong style={highlightStyle}>Netlify</strong>, que aplican medidas de seguridad adecuadas.
            <br /><br />
            Estos proveedores pueden operar fuera del Espacio Económico Europeo, garantizando un nivel adecuado de protección conforme al RGPD.
          </p>
        </div>

        {/* 🔹 Conservación */}
        <div style={sectionStyle}>
          <div style={titleStyle}>
            <Clock size={22} color="var(--accent-blue)" />
            <span>Conservación de los datos</span>
          </div>
          <p style={textStyle}>
            Los datos se conservarán mientras la cuenta del usuario esté activa o hasta que el usuario solicite su eliminación.
          </p>
        </div>

        {/* 🔹 Derechos */}
        <div style={sectionStyle}>
          <div style={titleStyle}>
            <Lock size={22} color="#ff4b2b" />
            <span>Tus derechos</span>
          </div>
          <div style={textStyle}>
            <p style={{ marginBottom: '10px' }}>Tienes derecho a:</p>
            <ul style={{ paddingLeft: '15px' }}>
              <li style={{ marginBottom: '5px' }}><strong>Acceso:</strong> saber qué datos tenemos sobre ti</li>
              <li style={{ marginBottom: '5px' }}><strong>Rectificación:</strong> corregir datos inexactos</li>
              <li style={{ marginBottom: '5px' }}><strong>Supresión:</strong> solicitar la eliminación de tus datos</li>
              <li style={{ marginBottom: '5px' }}><strong>Limitación:</strong> restringir el tratamiento de tus datos</li>
              <li style={{ marginBottom: '5px' }}><strong>Portabilidad:</strong> recibir tus datos en formato estructurado</li>
              <li style={{ marginBottom: '5px' }}><strong>Reclamación:</strong> presentar una reclamación ante la autoridad de control (AEPD)</li>
            </ul>
          </div>
        </div>

        <div style={{ 
          marginTop: '50px', 
          paddingTop: '25px', 
          borderTop: '1px solid rgba(0,0,0,0.05)', 
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#8a8a9e',
          fontStyle: 'italic'
        }}>
          DojoFlow V9 - Compromiso de Privacidad Educativa
        </div>
      </GlassCard>
    </div>
  );
}
