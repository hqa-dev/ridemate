'use client'

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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 300, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1c22', width: '100%', maxWidth: 340,
          borderRadius: 14, padding: '24px 20px',
          direction: 'rtl', fontFamily: "'Noto Sans Arabic', sans-serif",
        }}
      >
        <p style={{ fontSize: 14, color: '#eaedf5', marginBottom: 20, marginTop: 0, lineHeight: 1.8, textAlign: 'center' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, background: 'rgba(220,50,50,0.15)', color: '#dc2626',
              border: 'none', borderRadius: 10, padding: '10px 0',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Noto Sans Arabic', sans-serif",
            }}
          >
            بەڵێ
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, background: '#1f2128', color: 'rgba(255,255,255,0.85)',
              border: 'none', borderRadius: 10, padding: '10px 0',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: "'Noto Sans Arabic', sans-serif",
            }}
          >
            نەخێر
          </button>
        </div>
      </div>
    </div>
  )
}
