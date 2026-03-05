import { T } from '@/lib/theme'

export default function SketchCar({ size = 48, color = T.text }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 80 44" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    </svg>
  )
}
