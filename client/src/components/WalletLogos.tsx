import React from 'react';

export const WalletConnectLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#3396FF" />
    <path
      d="M12.33 16.5C16.56 12.33 23.44 12.33 27.67 16.5L28.36 17.18C28.58 17.4 28.58 17.76 28.36 17.98L26.33 20C26.22 20.11 26.04 20.11 25.93 20L25.04 19.12C22.25 16.38 17.75 16.38 14.96 19.12L14.02 20.04C13.91 20.15 13.73 20.15 13.62 20.04L11.59 18.02C11.37 17.8 11.37 17.44 11.59 17.22L12.33 16.5ZM32.32 21.08L34.15 22.88C34.37 23.1 34.37 23.46 34.15 23.68L25.99 31.72C25.77 31.94 25.41 31.94 25.19 31.72L19.98 26.58C19.93 26.53 19.85 26.53 19.8 26.58L14.6 31.71C14.38 31.93 14.02 31.93 13.8 31.71L5.64 23.67C5.42 23.45 5.42 23.09 5.64 22.87L7.47 21.07C7.69 20.85 8.05 20.85 8.27 21.07L13.88 26.59C13.93 26.64 14.01 26.64 14.06 26.59L19.26 21.46C19.48 21.24 19.84 21.24 20.06 21.46L25.26 26.59C25.31 26.64 25.39 26.64 25.44 26.59L31.52 21.08C31.74 20.86 32.1 20.86 32.32 21.08Z"
      fill="white"
    />
  </svg>
);

export const FreighterLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#2E1C4D" />
    <path
      d="M20 7L23.8 14.7L32 16L26 22L27.5 30.3L20 26.4L12.5 30.3L14 22L8 16L16.2 14.7L20 7Z"
      fill="url(#freighter_gradient)"
    />
    <circle cx="20" cy="20" r="4.5" fill="#FFFFFF" />
    <defs>
      <linearGradient id="freighter_gradient" x1="8" y1="7" x2="32" y2="30.3" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF4081" />
        <stop offset="0.5" stopColor="#7C4DFF" />
        <stop offset="1" stopColor="#00E5FF" />
      </linearGradient>
    </defs>
  </svg>
);

export const LobstrLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#0066FF" />
    {/* Stylized LOBSTR lobster claws mark */}
    <path
      d="M13 13C13 10.5 15.5 8 19 8C20.5 8 22.5 9 23.5 10.5C24.5 9 26.5 8 28 8C31.5 8 34 10.5 34 13C34 16.5 30.5 19.5 27 20.5V23C27 26.9 23.9 30 20 30C16.1 30 13 26.9 13 23V20.5C9.5 19.5 6 16.5 6 13C6 10.5 8.5 8 12 8C13.5 8 15.5 9 16.5 10.5C17.5 9 19.5 8 21 8"
      stroke="white"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16.5" cy="19" r="2.2" fill="white" />
    <circle cx="23.5" cy="19" r="2.2" fill="white" />
    <path d="M20 21V28" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

export const XBullLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#1C182A" />
    <path
      d="M10 13C12.5 15 15 17 20 17C25 17 27.5 15 30 13C31 16 32 20 30 24C28 28 24 30 20 30C16 30 12 28 10 24C8 20 9 16 10 13Z"
      fill="url(#xbull_gradient)"
    />
    <path
      d="M10 13C8.5 10 8 7 11 8C13 8.7 15 11 16 14M30 13C31.5 10 32 7 29 8C27 8.7 25 11 24 14"
      stroke="#FF3366"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="xbull_gradient" x1="10" y1="13" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF3366" />
        <stop offset="1" stopColor="#8A2BE2" />
      </linearGradient>
    </defs>
  </svg>
);

export const AlbedoLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#20153B" />
    {/* 4-pointed radiant sparkle star */}
    <path
      d="M20 7C20 14.5 14.5 20 7 20C14.5 20 20 25.5 20 33C20 25.5 25.5 20 33 20C25.5 20 20 14.5 20 7Z"
      fill="url(#albedo_sparkle)"
    />
    <circle cx="20" cy="20" r="3.2" fill="#FFFFFF" />
    <defs>
      <linearGradient id="albedo_sparkle" x1="7" y1="7" x2="33" y2="33" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFE066" />
        <stop offset="0.5" stopColor="#FF5252" />
        <stop offset="1" stopColor="#7928CA" />
      </linearGradient>
    </defs>
  </svg>
);

export const MetaMaskLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#F89D35" fillOpacity="0.15" />
    {/* Simplified geometric MetaMask Fox */}
    <path
      d="M30.6 8.5L20 16.3L22 9.5L30.6 8.5ZM9.4 8.5L19.8 16.4L18 9.5L9.4 8.5ZM26.4 23.2L29.6 28.5L33.3 17.5L26.4 23.2ZM13.6 23.2L6.7 17.5L10.4 28.5L13.6 23.2ZM14.8 19.3L12.5 14.3L7.7 17.8L14.8 19.3ZM25.2 19.3L32.3 17.8L27.5 14.3L25.2 19.3ZM20 24.3L15.8 21.8L17.2 26.2L20 28.5L22.8 26.2L24.2 21.8L20 24.3Z"
      fill="#E2761B"
    />
    <path
      d="M20 28.5L17.2 26.2L13.8 27.5L15.3 29.5L20 31.5L24.7 29.5L26.2 27.5L22.8 26.2L20 28.5Z"
      fill="#D7C1B3"
    />
  </svg>
);

export const HanaLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#FF5E8E" fillOpacity="0.2" />
    <circle cx="20" cy="14" r="5" fill="#FF5E8E" />
    <circle cx="26" cy="20" r="5" fill="#FF8BA7" />
    <circle cx="24" cy="27" r="5" fill="#FFAAC0" />
    <circle cx="16" cy="27" r="5" fill="#FF8BA7" />
    <circle cx="14" cy="20" r="5" fill="#FF5E8E" />
    <circle cx="20" cy="21" r="3.5" fill="#FFFFFF" />
  </svg>
);

export const AllWalletsGridLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#1A2035" />
    <rect x="11" y="11" width="7" height="7" rx="2" fill="#3B82F6" />
    <rect x="22" y="11" width="7" height="7" rx="2" fill="#3B82F6" />
    <rect x="11" y="22" width="7" height="7" rx="2" fill="#3B82F6" />
    <rect x="22" y="22" width="7" height="7" rx="2" fill="#3B82F6" />
  </svg>
);
