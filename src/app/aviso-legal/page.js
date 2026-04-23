import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AvisoLegalPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc', 
      padding: '40px 20px',
      color: '#1e293b',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#64748b', 
          textDecoration: 'none',
          marginBottom: '32px',
          fontWeight: '500'
        }}>
          <ChevronLeft size={20} /> Volver al Inicio
        </Link>

        <div style={{ 
          background: 'white', 
          padding: '48px', 
          borderRadius: '24px', 
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}>
          <h1 style={{ 
            fontFamily: 'Outfit, sans-serif', 
            fontSize: '2rem', 
            fontWeight: '800', 
            marginBottom: '32px',
            color: '#0f172a'
          }}>
            📄 Aviso Legal
          </h1>

          <p style={{ fontWeight: '600', marginBottom: '24px' }}>DojoFlow – Plataforma educativa digital</p>

          <div style={{ lineHeight: '1.7', color: '#475569' }}>
            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Identificación del titular</h3>
            <p>En cumplimiento de lo dispuesto en la Ley de Servicios de la Sociedad de la Información (LSSI-CE), se informa que:</p>
            <p style={{ marginLeft: '12px' }}><strong>Titular:</strong> DojoFlow</p>
            <p style={{ marginLeft: '12px' }}><strong>Contacto:</strong> monsapri@gmail.com</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Finalidad del sitio web</h3>
            <p>DojoFlow es una plataforma educativa cuyo objetivo es facilitar el aprendizaje de programación y tecnología mediante la organización, creación y acceso a recursos educativos digitales.</p>
            <p>La plataforma actúa como un entorno integrador que permite al profesorado y alumnado trabajar con distintas herramientas y contenidos en un único espacio.</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Condiciones de uso</h3>
            <p>El acceso y uso de la plataforma atribuye la condición de usuario e implica la aceptación de las presentes condiciones.</p>
            <p>El usuario se compromete a hacer un uso adecuado de la plataforma, respetando la normativa vigente y evitando cualquier uso indebido de los contenidos o servicios ofrecidos.</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Registro de usuarios</h3>
            <p>La plataforma permite el registro mediante un sistema basado en alias y contraseña, con el objetivo de minimizar la recogida de datos personales.</p>
            <p>El uso de correo electrónico es opcional y se limita exclusivamente a la recuperación de contraseña.</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Propiedad intelectual</h3>
            <p>Los contenidos disponibles en la plataforma pueden incluir materiales propios y recursos de terceros utilizados con fines educativos.</p>
            <p>DojoFlow actúa como un entorno de acceso, organización y facilitación de recursos, sin reclamar la titularidad de aquellos contenidos que pertenecen a terceros.</p>
            <p>Siempre que es posible, se indica la fuente original de los contenidos utilizados.</p>
            <p>En caso de que algún titular considere que algún contenido vulnera sus derechos, puede solicitar su retirada a través del correo de contacto.</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Uso de marcas y contenidos de terceros</h3>
            <p>Los logotipos, marcas y recursos de plataformas externas son propiedad de sus respectivos titulares y se utilizan únicamente con fines identificativos y educativos.</p>
            <p>Su uso no implica relación de afiliación, patrocinio o asociación con dichas entidades.</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Responsabilidad</h3>
            <p>DojoFlow no se hace responsable del uso indebido de la plataforma por parte de los usuarios ni de los contenidos que estos puedan generar o compartir.</p>
            <p>Asimismo, la plataforma puede incluir enlaces a servicios externos sobre los cuales DojoFlow no tiene control ni responsabilidad.</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Protección de datos</h3>
            <p>El tratamiento de datos personales se rige por lo establecido en la Política de Privacidad, disponible en esta misma plataforma.</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Modificaciones</h3>
            <p>DojoFlow se reserva el derecho a modificar en cualquier momento el presente aviso legal para adaptarlo a cambios normativos o mejoras en la plataforma.</p>

            <h3 style={{ color: '#0f172a', marginTop: '32px', marginBottom: '12px' }}>🔹 Legislación aplicable</h3>
            <p>La relación entre el usuario y DojoFlow se regirá por la normativa española vigente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
