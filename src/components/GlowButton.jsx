import React from 'react';
import './GlowButton.css';

export default function GlowButton({ children, className = '', color = 'cyan', onClick, ...props }) {
  return (
    <button 
      className={`glow-button glow-color-${color} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
