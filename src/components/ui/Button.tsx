'use client'

import { T } from '@/lib/theme'

interface ButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  style?: React.CSSProperties
  disabled?: boolean
}

const variants = {
  primary: {
    background: T.accent,
    color: '#fff',
    border: `2px solid ${T.text}`,
    boxShadow: `3px 3px 0 ${T.text}`,
  },
  secondary: {
    background: T.card,
    color: T.text,
    border: `2px solid ${T.text}`,
    boxShadow: `3px 3px 0 ${T.text}`,
  },
  danger: {
    background: T.red,
    color: '#fff',
    border: `2px solid ${T.text}`,
    boxShadow: `3px 3px 0 ${T.text}`,
  },
}

export default function Button({ label, onClick, variant = 'primary', style, disabled }: ButtonProps) {
  const v = variants[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        borderRadius: 9,
        padding: '12px 0',
        fontSize: 13,
        fontWeight: 800,
        textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...v,
        ...style,
      }}
    >
      {label}
    </button>
  )
}
