import { T } from '@/lib/theme'

export default function SketchCar({ size = 48, color = T.text }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 92 44" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="scale(-1,1) translate(-80,0)">
        <path d="M6 28 Q8 18 16 14 Q28 10 42 10 Q54 10 62 14 Q70 18 72 28 L74 34 Q74 38 70 38 L10 38 Q6 38 6 34 Z"/>
        <path d="M22 28 L26 14 Q34 11 46 14 L52 28 Z"/>
        <path d="M27 27 L30 16 Q36 13 44 15 L48 27"/>
        <line x1="38" y1="13" x2="38" y2="27"/>
        <circle cx="20" cy="38" r="6" fill={T.bg}/><circle cx="20" cy="38" r="3" fill={color}/>
        <circle cx="58" cy="38" r="6" fill={T.bg}/><circle cx="58" cy="38" r="3" fill={color}/>
        <path d="M36 26 Q40 24 44 26"/>
        <ellipse cx="70" cy="26" rx="3" ry="2" fill={T.yellow} stroke={color} strokeWidth="1.5"/>
        <line x1="2" y1="24" x2="8" y2="24" strokeDasharray="2,2" opacity="0.4"/>
        <line x1="1" y1="28" x2="6" y2="28" strokeDasharray="2,2" opacity="0.3"/>
      </g>
      <g opacity="0.85">
        <line x1="75" y1="28" x2="75" y2="10" stroke={color} strokeWidth="1.5"/>
        <rect x="75" y="10" width="10" height="2.5" fill="#A85060" stroke="none"/>
        <rect x="75" y="12.5" width="10" height="2.5" fill="#F0E8D8" stroke="none"/>
        <rect x="75" y="15" width="10" height="2.5" fill="#4A7A5E" stroke="none"/>
        <rect x="75" y="10" width="10" height="7.5" fill="none" stroke={color} strokeWidth="1"/>
        <circle cx="80" cy="13.75" r="1.3" fill="#C8922A" stroke="none"/>
      </g>
    </svg>
  )
}
