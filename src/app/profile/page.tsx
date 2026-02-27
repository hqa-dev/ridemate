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
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px' }}>
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
  const verifiedMap: Record<string, { text: string; bg: string; color: string }> = {
    verified: { text: '✓ پشتڕاستکراوە', bg: '#e8f5e9', color: '#2e7d32' },
    pending: { text: 'لە چاوەڕوانیدا', bg: '#fffbeb', color: '#d97706' },
    none: { text: 'ناسینەوە نەکراوە', bg: '#fef2f2', color: '#dc2626' },
  }
  const vBadge = verifiedMap[verificationStatus]

  const sectionLabel: React.CSSProperties = { fontSize: 11, color: '#a8a29e', marginBottom: 8, marginTop: 20, paddingRight: 4, fontWeight: 500 }
  const card: React.CSSProperties = { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f5f5f4' }
  const rowLast: React.CSSProperties = { ...row, borderBottom: 'none' }
  const rowRight: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }
  const rowText: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#1a1a1a' }
  const rowVal: React.CSSProperties = { fontSize: 12, color: '#a8a29e', direction: 'ltr' as const }
  const rowArrow: React.CSSProperties = { color: '#ddd', fontSize: 13, transform: 'scaleX(-1)' }
  const rowIcon: React.CSSProperties = { fontSize: 16 }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: 480, margin: '0 auto', padding: '16px 20px 96px', overflowX: 'hidden' }}>

      {/* Title */}
      <div style={{ textAlign: 'center', padding: '0 0 4px' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>{ku.profileTitle}</span>
      </div>

      {/* Avatar + Name + Badges */}
      <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #df6530', margin: '0 auto 10px', overflow: 'hidden', background: '#fff' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#fae8d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#df6530' }}>
              {displayName.charAt(0)}
            </div>
          )}
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{displayName}</div>
        <div style={{ fontSize: 12, color: '#a8a29e', direction: 'ltr' as const, marginBottom: 8 }}>{displayEmail}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {vBadge && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: vBadge.bg, color: vBadge.color, fontWeight: 600 }}>{vBadge.text}</span>}
          {role && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: '#f5f5f4', color: '#44403c', fontWeight: 500 }}>{roleText}</span>}
        </div>
      </div>

      {/* Info Section */}
      <div style={sectionLabel}>زانیاری</div>
      <div style={card}>

        {/* Phone */}
        <div
          style={{ ...row, cursor: 'pointer' }}
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
                  style={{ flex: 1, background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                />
                <button onClick={handleSavePhone} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>بەڵێ</button>
                <button onClick={() => setEditingPhone(false)} style={{ background: 'none', border: 'none', color: '#a8a29e', fontSize: 12, cursor: 'pointer' }}>پاشگەز</button>
              </div>
              <p style={{ fontSize: 10, color: '#a8a29e', lineHeight: 1.6 }}>ئەم ژمارەیە دوای قبوڵکردنی داواکاری سەرنشین پیشان دەدرێت</p>
            </div>
          ) : (
            <>
              <div style={rowRight}>
                <span style={rowIcon}>📱</span>
                <span style={rowText}>{profile?.phone ? 'ژمارەی مۆبایل' : 'ژمارەی مۆبایل زیاد بکە'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {profile?.phone && <span style={rowVal}>{profile.phone}</span>}
                <span style={rowArrow}>‹</span>
              </div>
            </>
          )}
        </div>

        {/* Name Change */}
        <div
          style={{ ...row, cursor: 'pointer' }}
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
                  style={{ flex: 1, background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', direction: 'rtl' }}
                />
                <button onClick={handleSaveName} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>بەڵێ</button>
                <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: '#a8a29e', fontSize: 12, cursor: 'pointer' }}>پاشگەز</button>
              </div>
              <p style={{ fontSize: 10, color: '#a8a29e', lineHeight: 1.6 }}>ناوەکەت تەنها مانگی یەکجار دەتوانی بیگۆڕیت</p>
            </div>
          ) : (
            <>
              <div style={rowRight}>
                <span style={rowIcon}>✏️</span>
                <span style={{ ...rowText, color: canChangeName() ? '#1a1a1a' : '#a8a29e' }}>ناوەکەت بگۆڕە</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {!canChangeName() && <span style={{ fontSize: 11, color: '#a8a29e' }}>({daysUntilNameChange()} ڕۆژی دیکە)</span>}
                <span style={rowArrow}>‹</span>
              </div>
            </>
          )}
        </div>

        {/* Verification */}
        {role !== 'passenger' && (
          <div style={{ ...rowLast, cursor: 'pointer' }}>
            <div style={rowRight}>
              <span style={rowIcon}>🪪</span>
              <span style={rowText}>ناسینەوە</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={rowArrow}>‹</span>
            </div>
          </div>
        )}
      </div>

      {/* Account Section */}
      <div style={sectionLabel}>ئەکاونت</div>
      <div style={card}>
        <div
          style={{ ...rowLast, cursor: 'pointer' }}
          onClick={() => { if (!showDeleteConfirm) setShowDeleteConfirm(true) }}
        >
          {showDeleteConfirm ? (
            <div style={{ width: '100%' }} onClick={e => e.stopPropagation()}>
              <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12, lineHeight: 1.7, textAlign: 'right' }}>دڵنیایت دەتەوێ ئەکاونتەکەت بسڕیتەوە؟</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleDeleteAccount} style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>بەڵێ دڵنیام</button>
                <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false) }} style={{ flex: 1, background: '#f5f5f4', color: '#44403c', border: 'none', borderRadius: 8, padding: 10, fontSize: 13, cursor: 'pointer' }}>پاشگەز</button>
              </div>
            </div>
          ) : (
            <>
              <div style={rowRight}>
                <span style={rowIcon}>🗑️</span>
                <span style={rowText}>سڕینەوەی ئەکاونت</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={rowArrow}>‹</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout */}
      <div style={{ ...card, marginTop: 12, cursor: 'pointer' }} onClick={handleSignOut}>
        <div style={{ padding: '14px 16px', textAlign: 'center' }}>
          <span style={{ color: '#dc2626', fontSize: 14, fontWeight: 600 }}>{ku.signOut}</span>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
