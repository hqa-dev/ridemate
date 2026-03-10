export default function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' as unknown as number, color: 'var(--color-text-secondary)', padding: '0 var(--space-4) var(--space-2)', marginTop: 'var(--space-4)' }}>
      {label}
    </div>
  )
}
