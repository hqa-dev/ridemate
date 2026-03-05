import { T } from '@/lib/theme'

export default function RouteLine({ from, to, dep, arr }: { from: string; to: string; dep: string; arr: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} dir="rtl">
      {/* Departure — RIGHT — orange */}
      <div style={{ textAlign: 'center', minWidth: 38 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>{dep}</div>
        <div style={{ fontSize: 9, color: T.textDim }}>{from}</div>
      </div>
      {/* SVG curved line */}
      <div style={{ flex: 1, position: 'relative', height: 20 }}>
        <svg width="100%" height="20" viewBox="0 0 300 20" preserveAspectRatio="none">
          <path d="M8 13 Q60 7 100 13 Q140 19 180 13 Q220 7 260 13 Q276 16 292 13" stroke={T.text} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M8 9 a4,4 0 0,0 0,8" fill={T.text}/>
          <path d="M292 9 a4,4 0 0,1 0,8" fill={T.accent} stroke={T.text} strokeWidth="1"/>
        </svg>
      </div>
      {/* Arrival — LEFT — ink */}
      <div style={{ textAlign: 'center', minWidth: 38 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{arr}</div>
        <div style={{ fontSize: 9, color: T.textDim }}>{to}</div>
      </div>
    </div>
  )
}
