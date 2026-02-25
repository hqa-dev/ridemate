'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

export default function BecomeDriverPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ role: 'both' }).eq('id', user.id)
    }
    router.push('/profile')
  }

  const input = { width: '100%', background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none', marginBottom: '0.75rem' } as React.CSSProperties
  const label = { fontSize: '0.85rem', color: '#57534e', display: 'block', marginBottom: '0.4rem' } as React.CSSProperties
  const upload = { border: '2px dashed #e7e5e4', borderRadius: '1rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '0.75rem' } as React.CSSProperties
  const btn = { background: '#df6530', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: '0.5rem' } as React.CSSProperties
  const btnSec = { background: '#f5f5f4', color: '#44403c', border: 'none', borderRadius: '0.75rem', padding: '0.75rem', cursor: 'pointer', width: '100%' } as React.CSSProperties

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '0 1.25rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0' }}>
        <Link href="/profile" style={{ color: '#78716c', textDecoration: 'none', fontSize: '0.9rem' }}>{ku.back}</Link>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#df6530' }}>ڕێ</span>
        <div style={{ width: '60px' }} />
      </div>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ku.activateDriver}</h1>
      <p style={{ color: '#78716c', marginBottom: '1.5rem', lineHeight: 1.8 }}>{ku.activateDriverDesc}</p>

      <div style={{ fontSize: '0.7rem', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>{ku.carDetails}</div>
      <label style={label}>{ku.carMake}</label>
      <input style={input} placeholder="Toyota, Kia..." />
      <label style={label}>{ku.carModel}</label>
      <input style={input} placeholder="Camry, Cerato..." />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}><label style={label}>{ku.carColor}</label><input style={input} /></div>
        <div style={{ flex: 1 }}><label style={label}>{ku.plateNumber}</label><input style={input} /></div>
      </div>
      <div style={upload}>
        <div style={{ fontSize: '2rem' }}>📄</div>
        <div style={{ fontWeight: 600, color: '#44403c', fontSize: '0.9rem' }}>{ku.uploadLicense}</div>
      </div>

      <button style={{ ...btn, marginTop: '0.5rem', opacity: saving ? 0.5 : 1 }} onClick={handleSubmit} disabled={saving}>
        {ku.submitVerification}
      </button>
      <Link href="/profile">
        <button style={btnSec}>{ku.back}</button>
      </Link>
    </div>
  )
}
