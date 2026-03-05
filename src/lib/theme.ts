// لیمۆ Theme Tokens — Bobby
// Inspired by Bobby gum packaging: ink on white, orange-red + yellow accents
export const T = {
  // Backgrounds
  bg:        '#FAFAF7',          // aged paper white
  card:      '#FFFFFF',          // pure white card
  cardInner: '#F5F3EC',          // warm inner surfaces
  modal:     '#FAFAF7',          // modal background

  // Text
  text:       '#1A1208',         // near-black ink
  textBright: '#1A1208',         // same — no need to brighten on light bg
  textMid:    '#4A3F2A',         // mid ink
  textDim:    '#9A8F78',         // faded ink
  textFaint:  '#9A8F78',         // same as dim on light bg

  // Brand accent
  orange:     '#E8470A',         // Bobby box orange
  accent:     '#E8470A',         // alias
  accentFill: 'rgba(232,71,10,0.08)',
  accentGlow: 'rgba(232,71,10,0.12)',

  // Borders & dividers
  border:     '#1A1208',         // thick ink border
  cardBorder: '#1A1208',         // card outlines
  borderDim:  'rgba(26,18,8,0.15)', // subtle inner borders
  divider:    'rgba(26,18,8,0.25)', // dashed row dividers

  // Status colors
  green:      '#2A7A1A',         // approve / verified
  greenBg:    'rgba(42,122,26,0.08)',
  red:        '#C8001A',         // decline / full / destructive
  redBg:      'rgba(200,0,26,0.07)',
  yellow:     '#F5C800',         // warm gum yellow
  yellowBg:   'rgba(245,200,0,0.12)',
  amber:      '#F5C800',         // pending — same as yellow
  amberBg:    'rgba(245,200,0,0.12)',
  destructive: '#C8001A',        // logout / delete — same as red
  verified:   '#2A7A1A',         // ✓ badge — same as green
  whatsapp:   '#25D366',         // never changes

  // Navigation
  navBg:            '#FFFFFF',
  navBorder:        '#1A1208',
  activePill:       '#E8470A',
  activePillBorder: '#1A1208',
  activePillShadow: '3px 3px 0 #1A1208',
  navGlow:          'transparent',  // no glow in Bobby

  // Icons
  iconDim: '#9A8F78',            // inactive nav icons
  iconMid: '#4A3F2A',            // mid-prominence icons

  // On-accent
  onAccent:   '#FFFFFF',             // white text/icon on accent bg

  // Overlays
  backdrop:    'rgba(0,0,0,0.7)',    // modal backdrop
  toastShadow: '0 8px 32px rgba(0,0,0,0.6)', // toast / floating card shadow

  // Misc
  chipBg:     'rgba(26,18,8,0.06)',
  cardShadow: '3px 3px 0 #1A1208',  // hard comic drop shadow
  shadow:     '2px 2px 0 #1A1208',  // smaller elements
  radius:     12,
} as const
export type Theme = typeof T
