export function Logo({ size = 1 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1, direction: 'ltr' }}>
      <span style={{ fontSize: `${size * 1.8}rem`, fontWeight: 700, color: '#1c1917' }}>Rè</span>
      <span style={{ fontSize: `${size * 1.8}rem`, fontWeight: 700, color: '#df6530', marginBottom: '0.15rem' }}>ڕێ</span>
    </span>
  )
}