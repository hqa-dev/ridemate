'use client'
import { useState, useRef, useEffect } from 'react'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'
import { T } from '@/lib/theme'

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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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

  const btn: React.CSSProperties = {
    background: T.accent, color: 'white', border: 'none', borderRadius: 12,
    padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    width: '100%', marginBottom: 8, fontFamily: "'Noto Sans Arabic', sans-serif",
  }
  const btnSec: React.CSSProperties = {
    background: T.card, color: T.textMid, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: '12px', cursor: 'pointer', width: '100%',
    fontSize: 13, fontFamily: "'Noto Sans Arabic', sans-serif",
  }
  const uploadStyle = (hasFile: boolean): React.CSSProperties => ({
    border: `2px dashed ${hasFile ? T.green : T.border}`,
    background: hasFile ? 'rgba(74,222,128,0.03)' : 'transparent',
    borderRadius: 16, padding: '24px', textAlign: 'center',
    cursor: 'pointer', marginBottom: 12,
  })

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: T.bg, maxWidth: 480, margin: '0 auto', padding: '0 20px 48px', fontFamily: "'Noto Sans Arabic', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
        <span
          onClick={() => { if (step === 'role') setStep('signin'); if (step === 'verify') setStep('role'); }}
          style={{ color: T.textFaint, textDecoration: 'none', fontSize: 13, cursor: step !== 'signin' ? 'pointer' : 'default' }}
        >
          {step !== 'signin' ? '← گەڕانەوە' : ''}
        </span>
        <span style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>ڕێ</span>
        <div style={{ width: 60 }} />
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{
            height: 4, flex: 1, borderRadius: 99,
            background: (step === 'signin' && n === 1) || (step === 'role' && n <= 2) || step === 'verify' ? T.accent : T.border,
          }} />
        ))}
      </div>

      {step === 'signin' && (
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8 }}>{ku.createAccount}</h1>
          <p style={{ color: T.textDim, marginBottom: 24, fontSize: 13 }}>بە گووگڵ چوونەژوورەوە بکە بۆ دەستپێکردن</p>

          {error && (
            <div style={{ background: T.redBg, border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: T.red, fontSize: 13 }}>{error}</div>
          )}

          {isSignedIn ? (
            <div style={{ background: T.greenBg, border: '1px solid rgba(74,222,128,0.2)', borderRadius: 16, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>✓</span>
              <div>
                <span style={{ fontWeight: 600, color: T.green, display: 'block', fontSize: 13 }}>چوونەژوورەوە سەرکەوتوو بوو</span>
                {userName && <span style={{ fontSize: 11, color: T.textMid }}>بەخێربێیتەوە، {userName}</span>}
              </div>
            </div>
          ) : (
            <div onClick={handleGoogleSignIn} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: '14px 20px', cursor: 'pointer', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              <span style={{ fontWeight: 500, color: T.text, fontSize: 14 }}>{ku.continueWithGoogle}</span>
            </div>
          )}

          <button style={{ ...btn, opacity: isSignedIn ? 1 : 0.4, marginTop: 12 }} disabled={!isSignedIn} onClick={() => setStep('role')}>بەردەوام بە</button>
        </div>
      )}

      {step === 'role' && (
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8 }}>{ku.iAm}</h1>
          <p style={{ color: T.textDim, marginBottom: 24, fontSize: 13 }}>{ku.chooseRole}</p>
          {[
            { value: 'passenger', icon: '🧳', label: ku.passenger, desc: ku.passengerDesc },
            { value: 'driver', icon: '🚗', label: ku.driver, desc: ku.driverDesc },
            { value: 'both', icon: '🔄', label: ku.both, desc: ku.bothDesc },
          ].map(opt => (
            <div key={opt.value} onClick={() => setRole(opt.value)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: role === opt.value ? T.accentFill : T.card,
              border: `1.5px solid ${role === opt.value ? T.accent : T.border}`,
              borderRadius: 16, padding: '14px 16px', cursor: 'pointer', marginBottom: 10,
            }}>
              <span style={{ fontSize: 28 }}>{opt.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: T.text, fontSize: 14 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: T.textDim }}>{opt.desc}</div>
              </div>
            </div>
          ))}
          <button style={{ ...btn, opacity: role ? 1 : 0.4, marginTop: 12 }} disabled={!role} onClick={handleRoleSubmit}>بەردەوام بە</button>
          <button style={btnSec} onClick={() => setStep('signin')}>گەڕانەوە</button>
        </div>
      )}

      {step === 'verify' && (
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8 }}>{ku.verifyIdentity}</h1>
          <p style={{ color: T.textDim, marginBottom: 24, fontSize: 13, lineHeight: 1.8 }}>{ku.verifyDesc}</p>

          {error && (
            <div style={{ background: T.redBg, border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: T.red, fontSize: 13 }}>{error}</div>
          )}

          <input type="file" accept="image/*" ref={idRef} style={{ display: 'none' }} onChange={e => setIdFile(e.target.files?.[0] || null)} />
          <div style={uploadStyle(!!idFile)} onClick={() => idRef.current?.click()}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🪪</div>
            <div style={{ fontWeight: 600, color: idFile ? T.green : T.textMid, fontSize: 13 }}>{idFile ? idFile.name : ku.uploadId}</div>
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>{idFile ? '✓ ئەپلۆد کرا' : ku.uploadIdDesc}</div>
          </div>

          <input type="file" accept="image/*" capture="user" ref={selfieRef} style={{ display: 'none' }} onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
          <div style={uploadStyle(!!selfieFile)} onClick={() => selfieRef.current?.click()}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🤳</div>
            <div style={{ fontWeight: 600, color: selfieFile ? T.green : T.textMid, fontSize: 13 }}>{selfieFile ? selfieFile.name : ku.takeSelfie}</div>
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>{selfieFile ? '✓ ئەپلۆد کرا' : ku.takeSelfieDesc}</div>
          </div>

          {(role === 'driver' || role === 'both') && (
            <>
              <input type="file" accept="image/*,.pdf" ref={licenseRef} style={{ display: 'none' }} onChange={e => setLicenseFile(e.target.files?.[0] || null)} />
              <div style={uploadStyle(!!licenseFile)} onClick={() => licenseRef.current?.click()}>
                <div style={{ fontSize: 32 }}>📄</div>
                <div style={{ fontWeight: 600, color: licenseFile ? T.green : T.textMid, fontSize: 13 }}>{licenseFile ? licenseFile.name : ku.uploadLicense}</div>
                {licenseFile && <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>✓ ئەپلۆد کرا</div>}
              </div>
            </>
          )}

          <button style={{ ...btn, marginTop: 8, opacity: uploading ? 0.5 : 1 }} disabled={uploading} onClick={handleSubmitVerification}>
            {uploading ? '...چاوەڕوان بە' : ku.submitVerification}
          </button>
          <button style={btnSec} onClick={() => setStep('role')}>گەڕانەوە</button>
        </div>
      )}
    </div>
  )
}
