'use client';

export default function FrogIcon({ direction = 'up', size = 28 }) {
  return (
    <svg
      data-frog-icon=""
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: direction === 'down' ? 'scaleY(-1)' : 'scaleY(1)',
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
      }}
    >
      {/* Body */}
      <ellipse cx="50" cy="60" rx="30" ry="24" fill="#4ade80" />
      {/* Head */}
      <ellipse cx="50" cy="38" rx="26" ry="22" fill="#4ade80" />
      {/* Eye sockets */}
      <ellipse cx="35" cy="26" rx="12" ry="11" fill="#86efac" />
      <ellipse cx="65" cy="26" rx="12" ry="11" fill="#86efac" />
      {/* Pupils */}
      <circle cx="35" cy="26" r="7" fill="#1a1410" />
      <circle cx="65" cy="26" r="7" fill="#1a1410" />
      {/* Eye shine */}
      <circle cx="32" cy="23" r="2.5" fill="white" />
      <circle cx="62" cy="23" r="2.5" fill="white" />
      {/* Nose */}
      <circle cx="44" cy="36" r="2" fill="#22c55e" />
      <circle cx="56" cy="36" r="2" fill="#22c55e" />
      {/* Mouth smile */}
      <path d="M40 44 Q50 52 60 44" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Front legs */}
      <path d="M22 62 Q10 68 8 78" stroke="#4ade80" strokeWidth="7" strokeLinecap="round" />
      <path d="M78 62 Q90 68 92 78" stroke="#4ade80" strokeWidth="7" strokeLinecap="round" />
      {/* Toes left */}
      <circle cx="5" cy="80" r="4" fill="#4ade80" />
      <circle cx="10" cy="83" r="4" fill="#4ade80" />
      <circle cx="15" cy="82" r="4" fill="#4ade80" />
      {/* Toes right */}
      <circle cx="95" cy="80" r="4" fill="#4ade80" />
      <circle cx="90" cy="83" r="4" fill="#4ade80" />
      <circle cx="85" cy="82" r="4" fill="#4ade80" />
      {/* Belly highlight */}
      <ellipse cx="50" cy="58" rx="16" ry="12" fill="#bbf7d0" opacity="0.6" />
    </svg>
  );
}
