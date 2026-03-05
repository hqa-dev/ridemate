import { T } from '@/lib/theme'

export default function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: T.iconDim, padding: '0 16px 8px' }}>
      {label}
    </div>
  )
}
