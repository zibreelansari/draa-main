import React from'react';

// Common Gradients used for 3D styling
const Defs = () => (
  <defs>
    <linearGradient id="primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#818cf8" />
      <stop offset="100%" stopColor="#9b6118" />
    </linearGradient>
    <linearGradient id="primary-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#a5b4fc" />
      <stop offset="100%" stopColor="#bd7b20" />
    </linearGradient>
    <linearGradient id="secondary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#60a5fa" />
      <stop offset="100%" stopColor="#2563eb" />
    </linearGradient>
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#34d399" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
    <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#fb923c" />
      <stop offset="100%" stopColor="#ea580c" />
    </linearGradient>
    <filter id="shadow-sm" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.1" />
    </filter>
    <filter id="shadow-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="20" floodColor="#818cf8" floodOpacity="0.5" />
    </filter>
  </defs>
);

export const IsoHeroGraphic = ({ className ="" }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={className} style={{ width:'100%', height:'auto', filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}>
    <Defs />
    <g transform="translate(200, 150)">
      {/* Background Glow */}
      <circle r="120" fill="url(#primary-grad)" filter="url(#shadow-glow)" opacity="0.4" />
      
      {/* Base Platform */}
      <path d="M0 60 L120 0 L0 -60 L-120 0 Z" fill="#ffffff" />
      <path d="M0 60 L120 0 L120 15 L0 75 Z" fill="#cbd5e1" />
      <path d="M0 60 L-120 0 L-120 15 L0 75 Z" fill="#94a3b8" />

      {/* Blue Platform Area */}
      <path d="M0 45 L90 0 L0 -45 L-90 0 Z" fill="url(#primary-light)" opacity="0.3" />
      
      {/* 3D Target/Goal Box */}
      <g transform="translate(-40, -20)">
        <path d="M0 0 L40 -20 L80 0 L40 20 Z" fill="url(#orange-grad)" />
        <path d="M0 0 L40 20 L40 60 L0 40 Z" fill="#ea580c" />
        <path d="M80 0 L40 20 L40 60 L80 40 Z" fill="#c2410c" />
        {/* Star icon */}
        <path d="M40 5 L43 12 L50 13 L45 18 L46 25 L40 21 L34 25 L35 18 L30 13 L37 12 Z" fill="#fef08a" />
      </g>

      {/* 3D Book / Study material */}
      <g transform="translate(20, -10)">
        <path d="M0 0 L50 -25 L80 -10 L30 15 Z" fill="#ffffff" />
        <path d="M0 0 L30 15 L30 25 L0 10 Z" fill="#e2e8f0" />
        <path d="M80 -10 L30 15 L30 25 L80 0 Z" fill="#cbd5e1" />
        {/* Cover */}
        <path d="M-5 2 L45 -23 L75 -8 L25 17 Z" fill="url(#primary-grad)" />
        <path d="M-5 2 L25 17 L25 22 L-5 7 Z" fill="#9b6118" />
        <path d="M75 -8 L25 17 L25 22 L75 -3 Z" fill="#3730a3" />
      </g>
      
      {/* Floating Elements */}
      <circle cx="-60" cy="-60" r="15" fill="url(#secondary-grad)" filter="url(#shadow-sm)" />
      <circle cx="80" cy="-50" r="10" fill="url(#accent-grad)" filter="url(#shadow-sm)" />
      <circle cx="60" cy="40" r="18" fill="url(#primary-grad)" filter="url(#shadow-sm)" opacity="0.9" />
    </g>
  </svg>
);

export const IsoFeatureGraphic = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <Defs />
    <g transform="translate(50, 50)">
      <path d="M0 20 L40 0 L0 -20 L-40 0 Z" fill="url(#secondary-grad)" filter="url(#shadow-sm)"/>
      <path d="M0 20 L40 0 L40 10 L0 30 Z" fill="#1d4ed8" />
      <path d="M0 20 L-40 0 L-40 10 L0 30 Z" fill="#1e3a8a" />
      <circle cx="0" cy="-10" r="12" fill="url(#accent-grad)" filter="url(#shadow-sm)" />
    </g>
  </svg>
);

export const IsoCalendarGraphic = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <Defs />
    <g transform="translate(50, 60)">
      <path d="M0 15 L30 0 L0 -15 L-30 0 Z" fill="url(#orange-grad)" filter="url(#shadow-sm)"/>
      <path d="M0 15 L30 0 L30 10 L0 25 Z" fill="#c2410c" />
      <path d="M0 15 L-30 0 L-30 10 L0 25 Z" fill="#9a3412" />
      <path d="M0 0 L25 -12 L0 -24 L-25 -12 Z" fill="#ffffff" />
      <path d="M0 0 L25 -12 L25 3 L0 15 Z" fill="#f8fafc" />
      <path d="M0 0 L-25 -12 L-25 3 L0 15 Z" fill="#e2e8f0" />
      <path d="M-5 -2 L5 -7" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M0 2 L10 -3" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="0" cy="-15" r="5" fill="#ef4444" />
    </g>
  </svg>
);

export const IsoAccessGraphic = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <Defs />
    <g transform="translate(50, 70)">
      <path d="M0 15 L40 0 L-10 -15 L-50 0 Z" fill="#94a3b8" filter="url(#shadow-sm)" />
      <path d="M-10 -15 L30 -30 L-10 -50 L-50 -35 Z" fill="#e2e8f0" />
      <path d="M-10 -18 L25 -31 L-10 -46 L-45 -33 Z" fill="url(#primary-light)" />
      <path d="M-10 -35 L0 -30 L-10 -25 Z" fill="#ffffff" filter="url(#shadow-sm)" />
    </g>
  </svg>
);

export const IsoFAQGraphic = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <Defs />
    <g transform="translate(50, 50)">
      <circle cx="0" cy="0" r="30" fill="url(#primary-grad)" opacity="0.2" />
      <path d="M0 20 L30 0 L0 -20 L-30 0 Z" fill="url(#accent-grad)" />
      <path d="M0 20 L30 0 L30 10 L0 30 Z" fill="#047857" />
      <path d="M0 20 L-30 0 L-30 10 L0 30 Z" fill="#064e3b" />
      <text x="-8" y="2" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="white" style={{ transform:"skewX(-20deg) rotate(15deg)" }}>?</text>
    </g>
  </svg>
);

export const IsoCertificateGraphic = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <Defs />
    <g transform="translate(50, 50)">
      <path d="M-20 -20 L20 -30 L30 10 L-10 20 Z" fill="#ffffff" filter="url(#shadow-sm)" />
      <path d="M-15 -15 L15 -22 L22 8 L-8 15 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="5" cy="5" r="8" fill="url(#orange-grad)" />
      <path d="M3 10 L8 25 L10 10 Z" fill="#ea580c" />
    </g>
  </svg>
);

export const IconTrophy = ({ size = 24, className ="" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

export const IconStar = ({ size = 24, className ="" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export const IsoGirlBoyGraphic = ({ className ="" }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={className} style={{ width:'100%', height:'auto', filter:'drop-shadow(0 10px 30px rgba(0,0,0,0.1))' }}>
    <Defs />
    <g transform="translate(200, 150)">
      {/* Background glow layer */}
      <circle r="100" fill="url(#primary-grad)" opacity="0.1" filter="url(#shadow-glow)" />
      
      {/* Platform/Base */}
      <path d="M0 50 L100 0 L0 -50 L-100 0 Z" fill="#ffffff" />
      <path d="M0 50 L100 0 L100 15 L0 65 Z" fill="#cbd5e1" />
      <path d="M0 50 L-100 0 L-100 15 L0 65 Z" fill="#94a3b8" />
      <path d="M0 40 L80 0 L0 -40 L-80 0 Z" fill="url(#primary-light)" opacity="0.2" />

      {/* Centerpiece: Laptop/Tablet */}
      <g transform="translate(0, -10)">
        <path d="M-30 0 L30 -30 L60 -15 L0 15 Z" fill="#e2e8f0" />
        <path d="M-30 0 L0 15 L0 20 L-30 5 Z" fill="#94a3b8" />
        <path d="M60 -15 L0 15 L0 20 L60 -10 Z" fill="#cbd5e1" />
        {/* Screen */}
        <path d="M-25 -2 L25 -27 L45 -17 L-5 8 Z" fill="url(#primary-grad)" />
        {/* Graph on screen */}
        <path d="M5 -17 L15 -22 L25 -15 L35 -20" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
      </g>
      
      {/* Books Stack */}
      <g transform="translate(-40, -10)">
        <path d="M0 0 L30 -15 L50 -5 L20 10 Z" fill="url(#orange-grad)" />
        <path d="M0 0 L20 10 L20 15 L0 5 Z" fill="#ea580c" />
        <path d="M50 -5 L20 10 L20 15 L50 0 Z" fill="#c2410c" />
        
        <path d="M0 -15 L30 -30 L50 -20 L20 -5 Z" fill="url(#accent-grad)" />
        <path d="M0 -15 L20 -5 L20 0 L0 -10 Z" fill="#10b981" />
        <path d="M50 -20 L20 -5 L20 0 L50 -15 Z" fill="#059669" />
      </g>

      {/* Floating Badges */}
      <circle cx="-60" cy="-55" r="12" fill="url(#primary-grad)" filter="url(#shadow-sm)" />
      <path d="M-65 -55 L-55 -55 L-60 -45 Z" fill="#ffffff" />
      
      <circle cx="80" cy="-40" r="16" fill="url(#orange-grad)" filter="url(#shadow-sm)" />
      <path d="M80 -45 L82 -41 L86 -40 L83 -37 L84 -33 L80 -35 L76 -33 L77 -37 L74 -40 L78 -41 Z" fill="#ffffff" />

      <circle cx="50" cy="50" r="10" fill="url(#accent-grad)" filter="url(#shadow-sm)" />
      <path d="M47 50 L49 52 L54 47" fill="none" stroke="#ffffff" strokeWidth="2" />
    </g>
  </svg>
);
