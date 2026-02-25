'use client'
import { useState, useRef, useEffect } from 'react'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

export default function VerifyPage() {
  const [idFile, setIdFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [role, setRole] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const idRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const savedRole = localStorage.getItem('ridemate_role')
    if (savedRole) setRole(savedRole)

    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Check if user already has documents uploaded (id file exists in storage)
      const { data: files } = await supabase.storage
        .from('documents')
        .list(user.id)

      const hasUploaded = files && files.length > 0

      // Check profile verification status
      const { data: profile } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('id', user.id)
        .single()

      if (profile?.verification_status === 'verified') {
        setVerificationStatus('verified')
      } else if (profile?.verification_status === 'pending' || hasUploaded) {
        setVerificationStatus('pending')
      }

      setLoading(false)
    }

    checkStatus()
  }, [])

  const handleSubmit = async () => {
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('تکایە چوونەژوورەوە بکە'); return }
    if (!idFile || !selfieFile) { setError('تکایە وێنەی ناسنامە و سێلفی بنێرە'); return }

    setUploading(true)

    const idExt = idFile.name.split('.').pop()
    const { error: idErr } = await supabase.storage
      .from('documents')
      .upload(`${user.id}/id.${idExt}`, idFile, { upsert: true })
    if (idErr) { setError('هەڵەی ئەپلۆد: ' + idErr.message); setUploading(false); return }

    const selfieExt = selfieFile.name.split('.').pop()
    const { error: selfieErr } = await supabase.storage
      .from('documents')
      .upload(`${user.id}/selfie.${selfieExt}`, selfieFile, { upsert: true })
    if (selfieErr) { setError('هەڵەی ئەپلۆد: ' + selfieErr.message); setUploading(false); return }

    // Update profile to pending
    await supabase.from('profiles').update({ 
      verification_status: 'pending',
      ...(role ? { role } : {})
    }).eq('id', user.id)
    
    if (role) localStorage.removeItem('ridemate_role')

    setUploading(false)
    setSuccess(true)
    setVerificationStatus('pending')
  }

  const uploadStyle = (hasFile: boolean) => ({
    border: `2px dashed ${hasFile ? '#16a34a' : '#e7e5e4'}`,
    background: hasFile ? '#f0fdf4' : 'transparent',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    marginBottom: '0.75rem',
  })

  const btn = { background: '#df6530', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: '0.5rem' } as React.CSSProperties

  // Show nothing while checking status
  if (loading) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '0 1.25rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#78716c' }}>...چاوەڕوان بە</p>
      </div>
    )
  }

  const showForm = !success && !verificationStatus

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '0 1.25rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem 0' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#df6530' }}>ڕێ</span>
      </div>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ku.verifyIdentity}</h1>
      <p style={{ color: '#78716c', marginBottom: '1.5rem', lineHeight: 1.8 }}>{ku.verifyDesc}</p>

      {verificationStatus === 'verified' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#16a34a', fontSize: '0.85rem', lineHeight: 1.8 }}>
          ✓ ئەکاونتەکەت پشتڕاست کراوەتەوە
        </div>
      )}

      {(verificationStatus === 'pending' || success) && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#16a34a', fontSize: '0.85rem', lineHeight: 1.8 }}>
          ✓ کاتێک دڵنیابوونەوە لە ناسنامەکەت تەواو بوو، بە زووترین کات ئاگادارت دەکەینەوە
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>
      )}

      {showForm && (
        <>
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

          <button style={{ ...btn, marginTop: '0.5rem', opacity: uploading ? 0.5 : 1 }} disabled={uploading} onClick={handleSubmit}>
            {uploading ? '...چاوەڕوان بە' : ku.submitVerification}
          </button>
        </>
      )}

      {(verificationStatus || success) && (
        <a href="/home" style={{ display: 'block', background: '#df6530', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>بڕۆ بۆ سەرەکی</a>
      )}
    </div>
  )
}