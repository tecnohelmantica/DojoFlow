import React from 'react';
import './GlassCard.css';

export default function GlassCard({ children, className = '', variant = 'default', ...props }) {
  return (
    <div className={`glass-card glass-card-${variant} ${className}`} {...props}>
      {children}
    </div>
  );
}
