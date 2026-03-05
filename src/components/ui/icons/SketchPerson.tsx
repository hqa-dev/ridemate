import { T } from '@/lib/theme'

export default function SketchPerson({ size = 14, hat = false }: { size?: number; hat?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={T.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3.5"/>
      <path d="M6 21 Q7 14 12 13 Q17 14 18 21"/>
      <path d="M9 16 Q12 18 15 16"/>
      {hat && <path d="M7 5 Q12 1 17 5" strokeWidth="1.5"/>}
    </svg>
  )
}
