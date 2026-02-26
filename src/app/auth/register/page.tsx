'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

type Step = 'signin' | 'role' | 'verify'

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('signin')
  const [role, setRole] = useState('')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const idRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)
  const licenseRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsSignedIn(true)
        setUserName(user.user_metadata?.full_name || user.email || '')

        const { data: profile } = await supabase.from('profiles').select('role, verification_status').eq('id', user.id).single()
        if (profile?.role && profile?.verification_status !== 'none') {
          window.location.href = '/home'
          return
        }
        setStep('role')
      }
    }
    checkAuth()
  }, [])

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error('Google sign-in error:', error.message)
  }

  const handleRoleSubmit = async () => {
    if (!role) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (role === 'passenger') {
      await supabase.from('profiles').update({ role: 'passenger', verification_status: 'verified' }).eq('id', user.id)
      window.location.href = '/home'
      return
    }

    await supabase.from('profiles').update({ role }).eq('id', user.id)
    setStep('verify')
  }

  const handleSubmitVerification = async () => {
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('تکایە سەرەتا چوونەژوورەوە بکە'); return }
    if (!idFile || !selfieFile) { setError('تکایە وێنەی ناسنامە و سێلفی بنێرە'); return }

    setUploading(true)

    const idExt = idFile.name.split('.').pop()
    const { error: idErr } = await supabase.storage.from('documents').upload(`${user.id}/id.${idExt}`, idFile, { upsert: true })
    if (idErr) { setError(idErr.message); setUploading(false); return }

    const selfieExt = selfieFile.name.split('.').pop()
    const { error: selfieErr } = await supabase.storage.from('documents').upload(`${user.id}/selfie.${selfieExt}`, selfieFile, { upsert: true })
    if (selfieErr) { setError(selfieErr.message); setUploading(false); return }

    if ((role === 'driver' || role === 'both') && licenseFile) {
      const licExt = licenseFile.name.split('.').pop()
      await supabase.storage.from('documents').upload(`${user.id}/license.${licExt}`, licenseFile, { upsert: true })
    }

    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)
    setUploading(false)
    window.location.href = '/home'
  }

  const card = { background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '0.75rem' }
  const btn = { background: '#df6530', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: '0.5rem' } as React.CSSProperties
  const btnSec = { background: '#f5f5f4', color: '#44403c', border: 'none', borderRadius: '0.75rem', padding: '0.75rem', cursor: 'pointer', width: '100%' } as React.CSSProperties
  const uploadStyle = (hasFile: boolean) => ({
    border: `2px dashed ${hasFile ? '#16a34a' : '#e7e5e4'}`,
    background: hasFile ? '#f0fdf4' : 'transparent',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    marginBottom: '0.75rem',
  })

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '0 1.25rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0' }}>
        <Link href="/" style={{ color: '#78716c', textDecoration: 'none', fontSize: '0.9rem' }}>{ku.back}</Link>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#df6530' }}>ڕێ</span>
        <div style={{ width: '60px' }} />
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
        {[1,2,3].map(n => (
          <div key={n} style={{ height: '4px', flex: 1, borderRadius: '999px', background: (step === 'signin' && n === 1) || (step === 'role' && n <= 2) || step === 'verify' ? '#df6530' : '#e7e5e4' }} />
        ))}
      </div>

      {step === 'signin' && (
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ku.createAccount}</h1>
          <p style={{ color: '#78716c', marginBottom: '1.5rem' }}>بە گووگڵ چوونەژوورەوە بکە بۆ دەستپێکردن</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>
          )}

          {isSignedIn ? (
            <div style={{ ...card, border: '1.5px solid #16a34a', background: '#f0fdf4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <div>
                  <span style={{ fontWeight: 600, color: '#16a34a', display: 'block' }}>چوونەژوورەوە سەرکەوتوو بوو</span>
                  {userName && <span style={{ fontSize: '0.8rem', color: '#57534e' }}>بەخێربێیتەوە، {userName}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ ...card, cursor: 'pointer' }} onClick={handleGoogleSignIn}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                <span style={{ fontWeight: 600, color: '#44403c' }}>{ku.continueWithGoogle}</span>
              </div>
            </div>
          )}

          <button style={{ ...btn, opacity: isSignedIn ? 1 : 0.5, marginTop: '1rem' }} disabled={!isSignedIn} onClick={() => setStep('role')}>{ku.continue}</button>
        </div>
      )}

      {step === 'role' && (
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ku.iAm}</h1>
          <p style={{ color: '#78716c', marginBottom: '1.5rem' }}>{ku.chooseRole}</p>
          {[
            { value: 'passenger', icon: '🧳', label: ku.passenger, desc: ku.passengerDesc },
            { value: 'driver', icon: '🚗', label: ku.driver, desc: ku.driverDesc },
            { value: 'both', icon: '🔄', label: ku.both, desc: ku.bothDesc },
          ].map(opt => (
            <div key={opt.value} onClick={() => setRole(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: role === opt.value ? '#fae8d8' : 'white', border: `1.5px solid ${role === opt.value ? '#df6530' : '#e7e5e4'}`, borderRadius: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{opt.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: '#1c1917' }}>{opt.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#78716c' }}>{opt.desc}</div>
              </div>
            </div>
          ))}
          <button style={{ ...btn, opacity: role ? 1 : 0.5, marginTop: '1rem' }} disabled={!role} onClick={handleRoleSubmit}>{ku.continue}</button>
          <button style={btnSec} onClick={() => setStep('signin')}>{ku.back}</button>
        </div>
      )}

      {step === 'verify' && (
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ku.verifyIdentity}</h1>
          <p style={{ color: '#78716c', marginBottom: '1.5rem', lineHeight: 1.8 }}>{ku.verifyDesc}</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>
          )}

          <input type="file" accept="image/*" ref={idRef} style={{ display: 'none' }} onChange={e => setIdFile(e.target.files?.[0] || null)} />
          <div style={uploadStyle(!!idFile)} onClick={() => idRef.current?.click()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🪪</div>
            <div style={{ fontWeight: 600, color: idFile ? '#16a34a' : '#44403c' }}>{idFile ? idFile.name : ku.uploadId}</div>
            <div style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '0.25rem' }}>{idFile ? '✓ ئەپلۆد کرا' : ku.uploadIdDesc}</div>
          </div>

          <input type="file" accept="image/*" capture="user" ref={selfieRef} style={{ display: 'none' }} onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
          <div style={uploadStyle(!!selfieFile)} onClick={() => selfieRef.current?.click()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤳</div>
            <div style={{ fontWeight: 600, color: selfieFile ? '#16a34a' : '#44403c' }}>{selfieFile ? selfieFile.name : ku.takeSelfie}</div>
            <div style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '0.25rem' }}>{selfieFile ? '✓ ئەپلۆد کرا' : ku.takeSelfieDesc}</div>
          </div>

          {(role === 'driver' || role === 'both') && (
            <>
              <input type="file" accept="image/*,.pdf" ref={licenseRef} style={{ display: 'none' }} onChange={e => setLicenseFile(e.target.files?.[0] || null)} />
              <div style={uploadStyle(!!licenseFile)} onClick={() => licenseRef.current?.click()}>
                <div style={{ fontSize: '2rem' }}>📄</div>
                <div style={{ fontWeight: 600, color: licenseFile ? '#16a34a' : '#44403c', fontSize: '0.9rem' }}>{licenseFile ? licenseFile.name : ku.uploadLicense}</div>
                {licenseFile && <div style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '0.25rem' }}>✓ ئەپلۆد کرا</div>}
              </div>
            </>
          )}

          <button style={{ ...btn, marginTop: '0.5rem', opacity: uploading ? 0.5 : 1 }} disabled={uploading} onClick={handleSubmitVerification}>
            {uploading ? '...چاوەڕوان بە' : ku.submitVerification}
          </button>
          <button style={btnSec} onClick={() => setStep('role')}>{ku.back}</button>
        </div>
      )}
    </div>
  )
}
