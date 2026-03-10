'use client'

import { T } from '@/lib/theme'
import { kurdishStrings } from '@/lib/strings'

interface ConfirmModalProps {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ isOpen, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: T.backdrop,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 300, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.card, width: '100%', maxWidth: 340,
          borderRadius: 14, padding: '24px 20px',
          direction: 'rtl',
        }}
      >
        <p style={{ fontSize: 14, color: T.text, marginBottom: 20, marginTop: 0, lineHeight: 1.8, textAlign: 'center' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, background: T.redBg, color: T.red,
              border: 'none', borderRadius: 10, padding: '10px 0',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: "var(--font-family-body)",
            }}
          >
            {kurdishStrings.yes}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, background: T.cardInner, color: T.text,
              border: 'none', borderRadius: 10, padding: '10px 0',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: "var(--font-family-body)",
            }}
          >
            {kurdishStrings.no}
          </button>
        </div>
      </div>
    </div>
  )
}
