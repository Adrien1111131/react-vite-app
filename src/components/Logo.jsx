import React from 'react';

const Logo = ({ className }) => {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100"
      style={{ filter: 'drop-shadow(0 0 3px rgba(255, 107, 0, 0.3))' }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Point noir */}
      <circle cx="15" cy="40" r="3" fill="#000000"/>
      {/* Lèvres */}
      <path d="M20 50 Q50 70 80 50 Q50 40 20 50" fill="#8B0000"/>
      {/* Flamme */}
      <path d="M40 10 Q50 0 60 10 Q70 25 50 40 Q30 25 40 10" fill="#FF6B00" filter="url(#glow)"/>
    </svg>
  );
};

export default Logo;
