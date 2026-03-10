'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { T } from '@/lib/theme'

interface PageHeaderProps {
  title: string
  back?: boolean
  onBack?: () => void
  bell?: boolean
  bellCount?: number
}

export default function PageHeader({ title, back = false, onBack, bell = false, bellCount = 0 }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '24px 20px 20px', gap: 12 }}>
      {back && (
        <div
          style={{
            width: 32, height: 32,
            border: `2px solid ${T.text}`, borderRadius: 7,
            background: T.card, boxShadow: `2px 2px 0 ${T.text}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'pointer',
          }}
          onClick={onBack || (() => router.back())}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
      <h1 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 700, color: T.text, margin: 0, flex: 1 }}>{title}</h1>
      {bell && (
        <Link href="/notifications" style={{ textDecoration: 'none' }}>
          <div style={{
            position: 'relative', width: 36, height: 36,
            border: `2px solid ${T.border}`, borderRadius: 9,
            background: T.card, boxShadow: T.shadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {bellCount > 0 && (
              <div style={{
                position: 'absolute', top: -3, right: -3,
                width: 9, height: 9, borderRadius: '50%',
                background: T.accent, border: `2px solid ${T.bg}`,
              }} />
            )}
          </div>
        </Link>
      )}
    </div>
  )
}
