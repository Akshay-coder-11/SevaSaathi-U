import React from 'react';

export default function Logo({ className = "w-8 h-8", withGlow = true }) {
  return (
    <svg 
      className={`${className} ${withGlow ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]' : ''} transition-all duration-300`}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer rotating/dashed circular badge of service & safety shield */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="url(#logo-grad)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeDasharray="8 6" 
        className="opacity-40 origin-center animate-[spin_40s_linear_infinite]" 
      />
      
      {/* Left Supporting Hand Path (Seva) */}
      <path 
        d="M26 62C28 48 38 42 46 47C53 51 55 60 48 68C41 76 28 72 26 62Z" 
        fill="url(#logo-grad)" 
        className="opacity-20"
      />
      
      {/* Right Supporting Hand Path (Saathi) */}
      <path 
        d="M74 38C72 52 62 58 54 53C47 49 45 40 52 32C59 24 72 28 74 38Z" 
        fill="url(#logo-grad)" 
        className="opacity-25"
      />

      {/* The main Interlocked Hands forming a Shelter / Heart Shield */}
      <path 
        d="M50 78C32 65 25 46 36 32C45 22 50 28 50 28C50 28 55 22 64 32C75 46 68 65 50 78Z" 
        stroke="url(#logo-grad)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Center glowing star of companion guidance and high quality service */}
      <path 
        d="M50 38L52.8 44.2L59.5 45L54.5 49.5L56 56L50 52.5L44 56L45.5 49.5L40.5 45L47.2 44.2L50 38Z" 
        fill="url(#logo-grad)" 
        className="drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]"
      />
    </svg>
  );
}
