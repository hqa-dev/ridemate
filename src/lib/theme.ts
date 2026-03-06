// لیمۆ Theme Tokens — Bobby
// Wired to design-system CSS custom properties (dist/web/variables.css)
export const T = {
  // Backgrounds
  bg:        'var(--color-bg-canvas)',
  card:      'var(--color-bg-surface)',
  cardInner: 'var(--color-bg-sunken)',
  modal:     'var(--color-bg-modal)',

  // Text
  text:       'var(--color-text-primary)',
  textBright: 'var(--color-text-primary)',
  textMid:    'var(--color-text-secondary)',
  textDim:    'var(--color-text-muted)',
  textFaint:  'var(--color-text-muted)',

  // Brand accent
  orange:     'var(--color-brand-primary)',
  accent:     'var(--color-brand-primary)',
  accentFill: 'var(--color-brand-fill)',
  accentGlow: 'var(--color-brand-glow)',

  // Borders & dividers
  border:     'var(--color-border-strong)',
  cardBorder: 'var(--color-border-strong)',
  borderDim:  'var(--color-border-subtle)',
  divider:    'var(--color-border-divider)',

  // Status colors
  green:      'var(--color-status-success)',
  greenBg:    'var(--color-status-successBg)',
  red:        'var(--color-status-error)',
  redBg:      'var(--color-status-errorBg)',
  yellow:     'var(--color-status-warning)',
  yellowBg:   'var(--color-status-warningBg)',
  amber:      'var(--color-status-warning)',
  amberBg:    'var(--color-status-warningBg)',
  destructive: 'var(--color-status-error)',
  verified:   'var(--color-status-success)',
  whatsapp:   'var(--color-external-whatsapp)',

  // Navigation
  navBg:            'var(--color-nav-bg)',
  navBorder:        'var(--color-nav-border)',
  activePill:       'var(--color-nav-activePill)',
  activePillBorder: 'var(--color-nav-border)',
  activePillShadow: 'var(--shadow-pill)',
  navGlow:          'var(--color-nav-glow)',

  // Icons
  iconDim: 'var(--color-icon-muted)',
  iconMid: 'var(--color-icon-default)',

  // On-accent
  onAccent:   'var(--color-text-onAccent)',

  // Overlays
  backdrop:    'var(--color-overlay-backdrop)',
  toastShadow: 'var(--shadow-float)',

  // Misc
  chipBg:     'var(--color-chip-bg)',
  cardShadow: 'var(--shadow-card)',
  shadow:     'var(--shadow-sm)',
  radius:     'var(--radius-2xl)',
} as const
export type Theme = typeof T
