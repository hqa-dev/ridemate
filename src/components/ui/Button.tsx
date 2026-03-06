'use client'

import { cssVar } from '@/lib/css-vars'

interface ButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  style?: React.CSSProperties
  disabled?: boolean
}

const variants: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--button-primary-bg)',
    color: 'var(--button-primary-text)',
    border: 'var(--button-primary-border)',
    boxShadow: 'var(--button-primary-shadow)',
    borderRadius: 'var(--button-primary-radius)',
    padding: 'var(--button-primary-padding)',
    fontSize: 'var(--button-primary-fontSize)',
    fontWeight: cssVar('--button-primary-fontWeight'),
  },
  secondary: {
    background: 'var(--button-secondary-bg)',
    color: 'var(--button-secondary-text)',
    border: 'var(--button-secondary-border)',
    boxShadow: 'var(--button-secondary-shadow)',
    borderRadius: 'var(--button-secondary-radius)',
    padding: 'var(--button-secondary-padding)',
    fontSize: 'var(--button-secondary-fontSize)',
    fontWeight: cssVar('--button-secondary-fontWeight'),
  },
  danger: {
    background: 'var(--button-danger-bg)',
    color: 'var(--button-danger-text)',
    border: 'var(--button-danger-border)',
    boxShadow: 'var(--button-danger-shadow)',
    borderRadius: 'var(--button-danger-radius)',
    padding: 'var(--button-danger-padding)',
    fontSize: 'var(--button-danger-fontSize)',
    fontWeight: cssVar('--button-danger-fontWeight'),
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
        textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? cssVar('--opacity-disabled') : 1,
        ...v,
        ...style,
      }}
    >
      {label}
    </button>
  )
}
