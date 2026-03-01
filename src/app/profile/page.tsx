'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const CameraIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)
const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)
const PersonIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [newPhone, setNewPhone] = useState('')
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

  const handleSavePhone = async () => {
    if (!newPhone.trim() || !user) return
    await supabase.from('profiles').update({ phone: newPhone.trim() }).eq('id', user.id)
    setProfile({ ...profile, phone: newPhone.trim() })
    setEditingPhone(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const canChangeName = () => {
    if (!profile?.last_name_change) return true
    const lastChange = new Date(profile.last_name_change)
    const now = new Date()
    const diffDays = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= 30
  }

  const daysUntilNameChange = () => {
    if (!profile?.last_name_change) return 0
    const lastChange = new Date(profile.last_name_change)
    const now = new Date()
    const diffDays = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.ceil(30 - diffDays))
  }

  const handleSaveName = async () => {
    if (!newName.trim() || !user) return
    await supabase.from('profiles').update({ full_name: newName.trim(), last_name_change: new Date().toISOString() }).eq('id', user.id)
    setProfile({ ...profile, full_name: newName.trim(), last_name_change: new Date().toISOString() })
    setEditingName(false)
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#121212', maxWidth: 480, margin: '0 auto' }}>
        <BottomNav />
      </div>
    )
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || ''
  const displayEmail = user?.email || ''
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  const role = profile?.role || ''
  const roleText = role === 'passenger' ? ku.passenger : role === 'driver' ? ku.driver : 'شۆفێر و سەرنشین'

  return (
    <div style={{
      direction: 'rtl', height: '100vh', background: '#121212',
      maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans Arabic', sans-serif", overflow: 'hidden',
    }}>

      {/* Fixed header */}
      <div style={{ flexShrink: 0, padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#df6530', letterSpacing: -1, margin: 0 }}>خۆت</h1>
        </div>

        {/* Profile card */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: 16,
          border: '1px solid #2a2a2a',
          padding: '28px 20px',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Avatar — right in RTL */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 64, height: 72, borderRadius: 10,
                border: '1.5px solid #2a2a2a', background: '#1e1e1e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                ) : (
                  <PersonIcon />
                )}
              </div>
              <div style={{
                position: 'absolute', bottom: -5, left: -5,
                width: 20, height: 20, borderRadius: '50%',
                background: '#2a2a2a', border: '2px solid #1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <CameraIcon />
              </div>
            </div>

            {/* Name / Role / Email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 10, color: '#555', fontWeight: 500, marginTop: 3 }}>
                {roleText}
              </div>
              <div style={{ fontSize: 10, color: '#444', direction: 'ltr' as const, textAlign: 'right' as const, marginTop: 2 }}>
                {displayEmail}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

        <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontWeight: 500, letterSpacing: 0.5 }}>زانیاری</div>
        <div style={{ background: '#1e1e1e', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>

          {/* Name row */}
          <div
            onClick={() => { if (canChangeName() && !editingName) { setNewName(displayName); setEditingName(true) } }}
            style={{ padding: '14px 18px', borderBottom: '1px solid #2a2a2a', cursor: 'pointer' }}
          >
            {editingName ? (
              <div onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={displayName}
                    autoFocus
                    style={{ flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', direction: 'rtl', color: '#aaa' }}
                  />
                  <button onClick={handleSaveName} style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>بەڵێ</button>
                  <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 11, cursor: 'pointer' }}>پاشگەز</button>
                </div>
                <p style={{ fontSize: 10, color: '#555', lineHeight: 1.6, margin: 0 }}>ناوەکەت تەنها مانگی یەکجار دەتوانی بیگۆڕیت</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <EditIcon />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: canChangeName() ? '#999' : '#555' }}>ناوەکەت بگۆڕە</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                      {canChangeName()
                        ? '(تەنها یەک جار دەتوانی ناوەکەت بگۆڕی)'
                        : `(${daysUntilNameChange()} ڕۆژی دیکە)`
                      }
                    </div>
                  </div>
                </div>
                <span style={{ color: '#333', fontSize: 14, transform: 'scaleX(-1)' }}>‹</span>
              </div>
            )}
          </div>

          {/* Phone row */}
          <div
            onClick={() => { if (!editingPhone) { setNewPhone(profile?.phone || ''); setEditingPhone(true) } }}
            style={{ padding: '14px 18px', cursor: 'pointer' }}
          >
            {editingPhone ? (
              <div onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="07501234567"
                    dir="ltr"
                    type="tel"
                    autoFocus
                    style={{ flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', color: '#aaa' }}
                  />
                  <button onClick={handleSavePhone} style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>بەڵێ</button>
                  <button onClick={() => setEditingPhone(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 11, cursor: 'pointer' }}>پاشگەز</button>
                </div>
                <p style={{ fontSize: 10, color: '#555', lineHeight: 1.6, margin: 0 }}>کاتێک بەشداری گەشتێک دەکەیت، ژمارەکەت لەگەڵ شۆفێری گەشتەکە شێر دەکرێ</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <PhoneIcon />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#999' }}>{profile?.phone ? 'ژمارەی مۆبایل' : 'ژمارەی مۆبایل زیاد بکە'}</div>
                    {profile?.phone && <div style={{ fontSize: 11, color: '#555', direction: 'ltr' as const, textAlign: 'right' as const, marginTop: 2 }}>{profile.phone}</div>}
                  </div>
                </div>
                <span style={{ color: '#333', fontSize: 14, transform: 'scaleX(-1)' }}>‹</span>
              </div>
            )}
          </div>
        </div>

        {/* Account section */}
        <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontWeight: 500, letterSpacing: 0.5 }}>ئەکاونت</div>
        <div style={{ background: '#1e1e1e', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <div
            onClick={() => { if (!showDeleteConfirm) setShowDeleteConfirm(true) }}
            style={{ padding: '14px 18px', cursor: 'pointer' }}
          >
            {showDeleteConfirm ? (
              <div onClick={e => e.stopPropagation()}>
                <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12, marginTop: 0, lineHeight: 1.7, textAlign: 'right' }}>دڵنیایت دەتەوێ ئەکاونتەکەت بسڕیتەوە؟</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleDeleteAccount} style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>بەڵێ دڵنیام</button>
                  <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false) }} style={{ flex: 1, background: '#2a2a2a', color: '#777', border: 'none', borderRadius: 10, padding: 10, fontSize: 13, cursor: 'pointer' }}>پاشگەز</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <TrashIcon />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#dc2626' }}>هەژمارەکەت بسڕەوە</span>
                </div>
                <span style={{ color: '#333', fontSize: 14, transform: 'scaleX(-1)' }}>‹</span>
              </div>
            )}
          </div>
        </div>

        {/* Sign out — standalone, orange */}
        <div
          onClick={handleSignOut}
          style={{
            background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 14,
            padding: '14px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: 24,
          }}
        >
          <span style={{ color: '#df6530', fontSize: 13, fontWeight: 600 }}>{ku.signOut}</span>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
