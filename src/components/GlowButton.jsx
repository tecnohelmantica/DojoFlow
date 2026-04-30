import React from 'react';
import './GlowButton.css';

export default function GlowButton({ children, className = '', color = 'cyan', onClick, fullWidth, ...props }) {
  const fullWidthClass = fullWidth ? 'full-width' : '';
  
  return (
    <button 
      className={`glow-button glow-color-${color} ${fullWidthClass} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
