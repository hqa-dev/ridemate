'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { T } from '@/lib/theme'

export default function LandingPage() {
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) window.location.href = '/home'
    }
    check()
  }, [])

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div style={{
      direction: 'rtl', minHeight: '100vh', background: T.bg,
      maxWidth: 480, margin: '0 auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.25rem', fontFamily: "'Noto Sans Arabic', sans-serif",
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{
          background: '#F5C800',
          border: `3px solid ${T.border}`,
          borderRadius: '50%',
          width: 64, height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: T.cardShadow,
          marginBottom: 12,
          transform: 'rotate(-4deg)',
        }}>
          <span style={{ fontSize: 24 }}>🍋</span>
        </div>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 800, color: T.text, marginBottom: 8,
          textShadow: `3px 3px 0 ${T.accent}`,
          fontFamily: "'Noto Sans Arabic', sans-serif",
        }}>لیمۆ</h1>
        <p style={{ color: T.textDim, fontSize: 13, margin: 0, textAlign: 'center' }}>
          تەنها بۆ هەولێر و سلێمانی و دهۆک
        </p>
      </div>

      {/* Google button */}
      <div
        onClick={handleGoogleSignIn}
        style={{
          background: T.card,
          border: `2px solid ${T.border}`,
          borderRadius: 12, padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          cursor: 'pointer', width: '100%', maxWidth: 320,
          boxShadow: T.cardShadow,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span style={{ fontWeight: 600, color: T.text, fontSize: 14 }}>بە گووگڵ بچۆ ژوورەوە</span>
      </div>

      <div style={{ marginTop: 16, fontSize: 10, color: T.textDim, textAlign: 'center', lineHeight: 1.7 }}>
        بە چوونەژوورەوە، ڕێکار و مەرجەکانمان قبوڵ دەکەیت
      </div>

    </div>
  )
}
