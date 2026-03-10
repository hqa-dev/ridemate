import { T } from '@/lib/theme'

export default function RouteLine({ from, to, dep, arr }: { from: string; to: string; dep: string; arr: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)' }} dir="rtl">
      {/* Origin — RIGHT — ink */}
      <div style={{ textAlign: 'center', minWidth: 38 }}>
        <div style={{ fontSize: 'var(--font-size-heading)', fontWeight: 700, color: T.text }}>{from}</div>
        <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 400, color: T.textMid }}>{dep}</div>
      </div>
      {/* SVG curved line — ink right to orange left */}
      <div style={{ flex: 1, position: 'relative', height: 20 }}>
        <svg width="100%" height="20" viewBox="0 0 300 20" preserveAspectRatio="none">
          <path d="M38 13 Q80 7 120 13 Q160 19 200 13 Q240 7 262 13" stroke={T.accent} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M38 9 a4,4 0 0,0 0,8" fill={T.accent}/>
          <path d="M262 9 a4,4 0 0,1 0,8" fill={T.accent} stroke={T.accent} strokeWidth="1"/>
        </svg>
      </div>
      {/* Destination — LEFT */}
      <div style={{ textAlign: 'center', minWidth: 38 }}>
        <div style={{ fontSize: 'var(--font-size-heading)', fontWeight: 700, color: T.text }}>{to}</div>
        <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 400, color: T.textMid }}>{arr}</div>
      </div>
    </div>
  )
}
