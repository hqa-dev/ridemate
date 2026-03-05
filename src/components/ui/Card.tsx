'use client'

import { T } from '@/lib/theme'

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  shadow?: boolean
  danger?: boolean
}

export default function Card({ children, style, shadow = true, danger = false }: CardProps) {
  const borderColor = danger ? T.red : T.text
  return (
    <div style={{
      background: T.card,
      borderRadius: 10,
      border: `2px solid ${borderColor}`,
      boxShadow: shadow ? `3px 3px 0 ${borderColor}` : undefined,
      ...style,
    }}>
      {children}
    </div>
  )
}
