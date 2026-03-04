// لیمۆ Theme Tokens
export const T = {
  // Backgrounds
  bg: '#0e1015',
  card: '#1a1c22',
  cardInner: '#1f2128',
  modal: '#1a1c22',

  // Text
  text: '#e5e5e5',
  textBright: '#eaedf5',
  textMid: '#aaa',
  textDim: '#777',
  textFaint: '#555',

  // Brand accent
  orange: '#df6530',
  accent: '#df6530',
  accentFill: 'rgba(223,101,48,0.08)',
  accentGlow: 'rgba(223,101,48,0.07)',

  // Borders & dividers
  border: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.08)',
  borderDim: 'rgba(255,255,255,0.04)',
  divider: '#333',

  // Status colors
  green: '#4ade80',
  greenBg: '#1a2e1a',
  red: '#f87171',
  redBg: '#2e1a1a',
  yellow: '#fbbf24',
  yellowBg: '#2e2a1a',
  amber: '#fbbf24',
  amberBg: 'rgba(251,191,36,0.1)',
  destructive: '#dc2626',
  verified: '#22c55e',
  whatsapp: '#25D366',

  // Navigation
  navBg: 'rgba(20,22,28,0.75)',
  navBorder: 'rgba(255,255,255,0.06)',
  activePill: 'rgba(255,255,255,0.1)',
  activePillBorder: 'rgba(255,255,255,0.08)',
  activePillShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
  navGlow: 'rgba(0,180,255,0.15)',

  // Icons
  iconDim: '#686e88',
  iconMid: '#aaa',

  // Misc (existing)
  chipBg: 'rgba(255,255,255,0.06)',
  cardShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  shadow: '0 2px 8px rgba(0,0,0,0.3)',
  radius: 14,
} as const
export type Theme = typeof T
