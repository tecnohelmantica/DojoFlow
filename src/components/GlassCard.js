import React from 'react';

export default function GlassCard({ children, className = '', style = {}, ...props }) {
  const cardStyle = {
    background: 'var(--color-card)',
    borderRadius: 'var(--border-radius)',
    boxShadow: 'var(--shadow-soft)',
    padding: '20px',
    border: '1px solid rgba(0,0,0,0.03)',
    ...style
  };

  return (
    <div className={`card-component ${className}`} style={cardStyle} {...props}>
      {children}
    </div>
  );
}
