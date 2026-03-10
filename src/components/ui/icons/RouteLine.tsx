import { T } from '@/lib/theme'

export default function RouteLine({ from, to, dep, arr }: { from: string; to: string; dep: string; arr: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)'}} dir="rtl">
      {/* Departure — RIGHT — orange */}
      <div style={{ textAlign: 'center', minWidth: 38 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{from}</div>
        <div style={{ fontSize: 10, fontWeight: 500, color: T.accent }}>{dep}</div>
      </div>
      {/* SVG curved line */}
      <div style={{ flex: 1, position: 'relative', height: 20 }}>
        <svg width="100%" height="20" viewBox="0 0 300 20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGrad" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={T.accent}/>
              <stop offset="100%" stopColor={T.text}/>
            </linearGradient>
          </defs>
          <path d="M8 13 Q60 7 100 13 Q140 19 180 13 Q220 7 260 13 Q276 16 292 13" stroke="url(#routeGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M8 9 a4,4 0 0,0 0,8" fill={T.text}/>
          <path d="M292 9 a4,4 0 0,1 0,8" fill={T.accent} stroke={T.accent} strokeWidth="1"/>
        </svg>
      </div>
      {/* Arrival — LEFT — ink */}
      <div style={{ textAlign: 'center', minWidth: 38 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{to}</div>
        <div style={{ fontSize: 10, fontWeight: 500, color: T.textMid }}>{arr}</div>
      </div>
    </div>
  )
}
