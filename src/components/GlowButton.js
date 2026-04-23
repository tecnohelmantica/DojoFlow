import React from 'react';

export default function GlowButton({ children, color = 'teal', className = '', onClick, type = 'button', disabled = false, style={} }) {
  // Ajuste sutil desde oscuro a colores limpios
  const getBackgroundColor = () => {
    switch(color) {
      case 'cyan': return 'var(--accent-teal)';
      case 'teal': return 'var(--accent-teal)';
      case 'purple': return 'var(--accent-purple)';
      case 'gray': return 'var(--accent-gray)';
      case 'custom': return 'var(--glow-color)';
      default: return 'var(--accent-teal)';
    }
  };

  const getTextColor = () => {
    return color === 'gray' ? 'var(--color-text)' : '#ffffff';
  };

  const btnStyle = {
    background: getBackgroundColor(),
    color: getTextColor(),
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    boxShadow: color === 'gray' ? 'none' : '0 4px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: '"Outfit", sans-serif',
    ...style
  };

  return (
    <button 
      type={type} 
      className={`flat-action-btn ${className}`} 
      onClick={onClick}
      disabled={disabled}
      style={btnStyle}
    >
      {children}
    </button>
  );
}
