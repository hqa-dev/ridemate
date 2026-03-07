'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { kurdishStrings } from '@/lib/strings'
import { getThemeMode, setThemeMode } from '@/lib/theme-mode'

export default function LandingPage() {
  const supabase = createClient()
  const [themeMode, setThemeMode2] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    setThemeMode2(getThemeMode())
  }, [])

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
      direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)',
      maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-8) var(--space-page-x)',
    }}>

      {/* Theme toggle */}
      {themeMode !== null && <div
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          const next = themeMode === 'dark' ? 'light' : 'dark'
          setThemeMode(next)
          setThemeMode2(next)
        }}
        style={{
          position: 'absolute', top: 'var(--space-page-top)', left: 'var(--space-page-x)',
          cursor: 'pointer',
          width: 'var(--size-button-iconLg)',
          height: 'var(--size-button-iconLg)',
          border: 'var(--border-width-thick) solid var(--color-border-strong)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-surface)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}
      >
        {themeMode === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>}

      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{
          background: 'var(--color-status-warning)',
          border: '3px solid var(--color-border-strong)',
          borderRadius: '50%',
          width: 64, height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 'var(--space-3)',
          transform: 'rotate(-4deg)',
        }}>
          <span style={{ fontSize: 24 }}>🍋</span>
        </div>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 'var(--font-weight-extrabold)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)',
          textShadow: 'var(--font-textShadow-brandLg)',
        }}>{kurdishStrings.appName}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-md)', margin: 0, textAlign: 'center' }}>
          {kurdishStrings.landingSubtitle}
        </p>
      </div>

      {/* Google button */}
      <div
        onClick={handleGoogleSignIn}
        style={{
          background: 'var(--color-bg-surface)',
          border: 'var(--border-width-thick) solid var(--color-border-strong)',
          borderRadius: 'var(--radius-2xl)', padding: 'var(--space-card-md) var(--space-6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
          cursor: 'pointer', width: '100%', maxWidth: 320,
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span style={{ fontWeight: 'var(--font-weight-semibold)' as unknown as number, color: 'var(--color-text-primary)', fontSize: 'var(--font-size-lg)' }}>{kurdishStrings.signInWithGoogle}</span>
      </div>

      <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 'var(--font-lineHeight-normal)' }}>
        {kurdishStrings.termsAcceptance}
      </div>

    </div>
  )
}
