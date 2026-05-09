import React from 'react';

export default function GlowButton({ children, color = 'teal', className = '', onClick, type = 'button', disabled = false, style={} }) {
  // Ajuste sutil desde oscuro a colores limpios
  const getBackgroundColor = () => {
    switch(color) {
      case 'premium-cyan': return 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
      case 'cyan': return 'var(--accent-teal)';
      case 'teal': return 'var(--accent-teal)';
      case 'blue': return '#306998';
      case 'purple': return 'var(--accent-purple)';
      case 'pink': return '#d81b60';
      case 'gray': return 'var(--accent-gray)';
      case 'dark': return '#1a1a24';
      case 'black-outline': return 'transparent';
      case 'premium-ninja': return 'linear-gradient(135deg, #00f2fe 0%, #9c27b0 100%)';
      case 'custom': return 'var(--glow-color)';
      default: return 'var(--accent-teal)';
    }
  };

  const getTextColor = () => {
    if (color === 'gray') return 'var(--color-text)';
    if (color === 'black-outline') return '#1a1a24';
    if (color === 'premium-cyan' || color === 'premium-ninja') return '#ffffff';
    return '#ffffff';
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const btnStyle = {
    background: getBackgroundColor(),
    color: getTextColor(),
    textShadow: color === 'premium-ninja' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
    border: color === 'black-outline' ? '1.5px solid #1a1a24' : 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    boxShadow: (color === 'gray' || color === 'black-outline') 
      ? 'none' 
      : isHovered 
        ? (color === 'premium-cyan' ? '0 8px 25px rgba(0, 242, 254, 0.4)' : `0 8px 25px ${getBackgroundColor()}88`)
        : '0 4px 10px rgba(0,0,0,0.1)',
    transform: isHovered ? 'translateY(-2px)' : 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}
