'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/register'); return }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData)
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSaveName = async () => {
    if (!newName.trim() || !user) return
    await supabase.from('profiles').update({ full_name: newName.trim() }).eq('id', user.id)
    setProfile({ ...profile, full_name: newName.trim() })
    setEditingName(false)
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  const card = { background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '0.75rem' } as React.CSSProperties

  if (loading) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
        <BottomNav />
      </div>
    )
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || ''
  const displayEmail = user?.email || ''
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  const role = profile?.role || ''
  const verificationStatus = profile?.verification_status || 'none'

  const statusMap: Record<string, { text: string; bg: string; color: string }> = {
    verified: { text: 'ناسراوە ✓', bg: '#f0fdf4', color: '#16a34a' },
    pending: { text: 'چاوەڕوانی ناسینەوە', bg: '#fffbeb', color: '#d97706' },
    none: { text: 'نەناسراوە', bg: '#fef2f2', color: '#dc2626' },
  }
  const status = statusMap[verificationStatus] || statusMap.none

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>{ku.profileTitle}</h1>

      {/* User info */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fae8d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#df6530' }}>
            {displayName.charAt(0)}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1c1917' }}>{displayName}</div>
          {displayEmail && <div style={{ fontSize: '0.8rem', color: '#a8a29e' }} dir="ltr">{displayEmail}</div>}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
            {role && <span style={{ background: '#f5f5f4', color: '#57534e', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>{role === 'passenger' ? ku.passenger : role === 'driver' ? ku.driver : ku.both}</span>}
          </div>
        </div>
      </div>

      {/* Verification status */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9rem', color: '#44403c' }}>ناسینەوە</span>
        <span style={{ background: status.bg, color: status.color, fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600 }}>{status.text}</span>
      </div>

      {/* Edit name */}
      <div style={card}>
        {editingName ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={displayName}
              style={{ flex: 1, background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.9rem', outline: 'none', direction: 'rtl' }}
            />
            <button onClick={handleSaveName} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>بەڵێ</button>
            <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: '#a8a29e', fontSize: '0.85rem', cursor: 'pointer' }}>پاشگەز</button>
          </div>
        ) : (
          <button onClick={() => { setNewName(displayName); setEditingName(true) }} style={{ background: 'none', border: 'none', color: '#44403c', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>
            ناوەکەت بگۆڕە
          </button>
        )}
      </div>

      {/* Delete account */}
      <div style={card}>
        {showDeleteConfirm ? (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '0.75rem', lineHeight: 1.7 }}>دڵنیایت دەتەوێ ئەکاونتەکەت بسڕیتەوە؟ ئەم کارە پێجەوانە ناکرێتەوە.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleDeleteAccount} style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>بەڵێ دڵنیام</button>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, background: '#f5f5f4', color: '#44403c', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>پاشگەز</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} style={{ background: 'none', border: 'none', color: '#a8a29e', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>سڕینەوەی ئەکاونت</button>
        )}
      </div>

      {/* Sign out — last */}
      <div style={card}>
        <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>{ku.signOut}</button>
      </div>

      <BottomNav />
    </div>
  )
}
