import { T } from '@/lib/theme'

export default function DashedDivider({ style }: { style?: React.CSSProperties } = {}) {
  return (
    <div style={{ borderTop: `1.5px dashed ${T.textDim}`, opacity: 0.4, margin: '8px 0', ...style }} />
  )
}
