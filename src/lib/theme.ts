// Slate Dark Theme — RideMate
export const theme = {
  bg: '#060606',
  card: '#262830',
  cardInner: '#303440',
  border: '#3c4050',
  cardBorder: 'rgba(160,170,200,0.06)',
  cardShadow: '0 3px 16px rgba(0,0,0,0.6)',
  radius: 14,
  text: '#eaedf5',
  textMid: '#a0a8c0',
  textDim: '#686e88',
  textFaint: '#484e62',
  orange: '#df6530',
  green: '#4ade80',
  greenBg: '#1a2e1a',
  yellow: '#fbbf24',
  yellowBg: '#2e2a1a',
  red: '#f87171',
  redBg: '#2e1a1a',
} as const
export type Theme = typeof theme
