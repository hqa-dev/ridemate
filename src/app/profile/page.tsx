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
  const verificationStatus = profile?.verification_status || 'none'

  const roleText = role === 'passenger' ? ku.passenger : role === 'driver' ? ku.driver : 'شۆفێر و سەرنشین'
  const verifiedMap: Record<string, { text: string; color: string }> = {
    verified: { text: '✓ پشتڕاستکراوە', color: '#4ade80' },
    pending: { text: 'لە چاوەڕوانیدا', color: '#fbbf24' },
    none: { text: 'ناسینەوە نەکراوە', color: '#f87171' },
  }
  const vBadge = verifiedMap[verificationStatus]

  const rowBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', cursor: 'pointer',
  }
  const rowBorder: React.CSSProperties = { ...rowBase, borderBottom: '1px solid #2a2a2a' }

  return (
    <div style={{
      direction: 'rtl', height: '100vh', background: '#121212',
      maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans Arabic', sans-serif",
    }}>

      {/* Fixed header: Avatar + Name + Badges */}
      <div style={{ flexShrink: 0, padding: '24px 20px 0' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', border: '2.5px solid #df6530',
            margin: '0 auto 12px', overflow: 'hidden', background: '#1e1e1e',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#2e2118', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#df6530' }}>
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e5e5e5', marginBottom: 3 }}>{displayName}</div>
          <div style={{ fontSize: 11, color: '#555', direction: 'ltr' as const, marginBottom: 10 }}>{displayEmail}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            {vBadge && (
              <span style={{
                fontSize: 10, padding: '4px 12px', borderRadius: 20, fontWeight: 600,
                background: `${vBadge.color}08`, color: vBadge.color,
                border: `1px solid ${vBadge.color}1f`,
              }}>{vBadge.text}</span>
            )}
            {role && (
              <span style={{
                fontSize: 10, padding: '4px 12px', borderRadius: 20, fontWeight: 500,
                background: '#1e1e1e', color: '#777',
                border: '1px solid #2a2a2a',
              }}>{roleText}</span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

        {/* Info Section */}
        <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontWeight: 500, letterSpacing: 0.5 }}>زانیاری</div>
        <div style={{ background: '#1e1e1e', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>

          {/* Phone */}
          <div
            style={rowBorder}
            onClick={() => { if (!editingPhone) { setNewPhone(profile?.phone || ''); setEditingPhone(true) } }}
          >
            {editingPhone ? (
              <div style={{ width: '100%' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <input
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="07501234567"
                    dir="ltr"
                    type="tel"
                    autoFocus
                    style={{ flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none', color: '#e5e5e5' }}
                  />
                  <button onClick={handleSavePhone} style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>بەڵێ</button>
                  <button onClick={() => setEditingPhone(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 11, cursor: 'pointer' }}>پاشگەز</button>
                </div>
                <p style={{ fontSize: 10, color: '#555', lineHeight: 1.6 }}>ئەم ژمارەیە دوای قبوڵکردنی داواکاری سەرنشین پیشان دەدرێت</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5' }}>{profile?.phone ? 'ژمارەی مۆبایل' : 'ژمارەی مۆبایل زیاد بکە'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {profile?.phone && <span style={{ fontSize: 12, color: '#777', direction: 'ltr' as const }}>{profile.phone}</span>}
                  <span style={{ color: '#333', fontSize: 13, transform: 'scaleX(-1)' }}>‹</span>
                </div>
              </>
            )}
          </div>

          {/* Name Change */}
          <div
            style={rowBorder}
            onClick={() => { if (canChangeName() && !editingName) { setNewName(displayName); setEditingName(true) } }}
          >
            {editingName ? (
              <div style={{ width: '100%' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={displayName}
                    autoFocus
                    style={{ flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none', direction: 'rtl', color: '#e5e5e5' }}
                  />
                  <button onClick={handleSaveName} style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>بەڵێ</button>
                  <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 11, cursor: 'pointer' }}>پاشگەز</button>
                </div>
                <p style={{ fontSize: 10, color: '#555', lineHeight: 1.6 }}>ناوەکەت تەنها مانگی یەکجار دەتوانی بیگۆڕیت</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 500, color: canChangeName() ? '#e5e5e5' : '#555' }}>ناوەکەت بگۆڕە</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!canChangeName() && <span style={{ fontSize: 11, color: '#555' }}>({daysUntilNameChange()} ڕۆژی دیکە)</span>}
                  <span style={{ color: '#333', fontSize: 13, transform: 'scaleX(-1)' }}>‹</span>
                </div>
              </>
            )}
          </div>

          {/* Verification */}
          {role !== 'passenger' && (
            <div style={rowBase}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 10h20" />
                  <path d="M6 16h4" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5' }}>ناسینەوە</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#333', fontSize: 13, transform: 'scaleX(-1)' }}>‹</span>
              </div>
            </div>
          )}
        </div>

        {/* Account Section */}
        <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontWeight: 500, letterSpacing: 0.5 }}>ئەکاونت</div>
        <div style={{ background: '#1e1e1e', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          <div
            style={rowBase}
            onClick={() => { if (!showDeleteConfirm) setShowDeleteConfirm(true) }}
          >
            {showDeleteConfirm ? (
              <div style={{ width: '100%' }} onClick={e => e.stopPropagation()}>
                <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12, lineHeight: 1.7, textAlign: 'right' }}>دڵنیایت دەتەوێ ئەکاونتەکەت بسڕیتەوە؟</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleDeleteAccount} style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>بەڵێ دڵنیام</button>
                  <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false) }} style={{ flex: 1, background: '#2a2a2a', color: '#aaa', border: 'none', borderRadius: 10, padding: 10, fontSize: 13, cursor: 'pointer' }}>پاشگەز</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5' }}>سڕینەوەی ئەکاونت</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#333', fontSize: 13, transform: 'scaleX(-1)' }}>‹</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Frozen logout button above nav */}
      <div style={{ flexShrink: 0, padding: '12px 20px 96px' }}>
        <div
          onClick={handleSignOut}
          style={{
            background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 14,
            padding: '14px 16px', textAlign: 'center', cursor: 'pointer',
          }}
        >
          <span style={{ color: '#f87171', fontSize: 13, fontWeight: 600 }}>{ku.signOut}</span>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
