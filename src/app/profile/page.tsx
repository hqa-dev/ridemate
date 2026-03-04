'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { T } from '@/lib/theme'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)', flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const DownArrow = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const Icons = {
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  camera: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  ),
  personFallback: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc3c3c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
}

function MenuItem({ icon, label, value, isLast, danger, onClick }: {
  icon: React.ReactNode; label: string; value?: string; isLast?: boolean; danger?: boolean; onClick?: () => void
}) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 24, display: 'flex', justifyContent: 'center', marginLeft: 12 }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 14, color: danger ? '#dc3c3c' : 'rgba(255,255,255,0.7)', fontWeight: danger ? 500 : 400 }}>{label}</span>
      {value && <span style={{ fontSize: 12, color: T.textDim, marginLeft: 6 }}>{value}</span>}
      {!danger && <Arrow />}
    </div>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setProfile(data)
    setLoading(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  function closeAll() {
    setEditingName(false)
    setEditingPhone(false)
    setEditingEmail(false)
  }

  function toggleName() {
    if (editingName) { setEditingName(false); return }
    closeAll()
    setEditName(displayName)
    setEditingName(true)
  }

  function togglePhone() {
    if (editingPhone) { setEditingPhone(false); return }
    closeAll()
    setEditPhone(profile?.phone || '')
    setEditingPhone(true)
  }

  function toggleEmail() {
    if (editingEmail) { setEditingEmail(false); return }
    closeAll()
    setEditEmail(displayEmail)
    setEditingEmail(true)
  }

  const canChangeName = () => {
    if (!profile?.last_name_change) return true
    const lastChange = new Date(profile.last_name_change)
    const diffDays = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= 30
  }

  async function handleSaveName() {
    if (!editName.trim() || !user) return
    if (!canChangeName()) { showToast('هێشتا ناتوانیت ناوەکەت بگۆڕیت'); return }
    setSaving(true)
    await supabase.from('profiles').update({ full_name: editName.trim(), last_name_change: new Date().toISOString() }).eq('id', user.id)
    setProfile((p: any) => ({ ...p, full_name: editName.trim(), last_name_change: new Date().toISOString() }))
    setSaving(false)
    setEditingName(false)
    showToast('ناو گۆڕدرا')
  }

  async function handleSavePhone() {
    if (!editPhone.trim() || !user) return
    setSaving(true)
    await supabase.from('profiles').update({ phone: editPhone.trim() }).eq('id', user.id)
    setProfile((p: any) => ({ ...p, phone: editPhone.trim() }))
    setSaving(false)
    setEditingPhone(false)
    showToast('ژمارە گۆڕدرا')
  }

  async function handleSaveEmail() {
    if (!editEmail.trim() || !user) return
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ email: editEmail.trim() })
    setSaving(false)
    if (error) { showToast('هەڵە: ' + error.message); return }
    setEditingEmail(false)
    showToast('لینکی پشتڕاستکردن نێردرا')
  }

  async function handleAvatarUpload(file: File) {
    if (!user) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadErr) { setUploadingAvatar(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`
    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id)
    setProfile((p: any) => ({ ...p, avatar_url: avatarUrl }))
    setUploadingAvatar(false)
  }

  async function handleDeleteAccount() {
    if (!user) return
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div style={{ direction: 'rtl', minHeight: '100vh', background: T.bg, maxWidth: 480, margin: '0 auto' }}><BottomNav /></div>
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || ''
  const displayEmail = user?.email || ''
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  const isDriver = profile?.role === 'driver' || profile?.role === 'both'
  const isVerified = profile?.verification_status === 'verified'
  const roleText = profile?.role === 'passenger' ? ku.passenger : profile?.role === 'driver' ? ku.driver : 'شۆفێر و سەرنشین'

  const inputStyle: React.CSSProperties = {
    width: '100%', background: T.cardInner, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '10px 12px', fontSize: 13, color: T.text,
    outline: 'none', fontFamily: "'Noto Sans Arabic', sans-serif", boxSizing: 'border-box',
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: T.bg, maxWidth: 480, margin: '0 auto', fontFamily: "'Noto Sans Arabic', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 20px 20px', gap: 12 }}>
        <div onClick={() => router.push('/account')} style={{ cursor: 'pointer', padding: 4 }}><BackArrow /></div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>پرۆفایل</h1>
      </div>

      {/* Profile card — avatar right, divider, details left */}
      <input type="file" accept="image/*" ref={avatarInputRef} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f) }} />
      <div style={{ margin: '0 12px 8px', padding: '20px 16px', background: T.card, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()}>
          <div style={{ width: 64, height: 72, borderRadius: 10, background: T.cardInner, border: `1px solid ${T.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', opacity: uploadingAvatar ? 0.5 : 1 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            ) : Icons.personFallback}
          </div>
          <div style={{ position: 'absolute', bottom: -4, left: -4, width: 20, height: 20, borderRadius: '50%', background: T.card, border: `2px solid ${T.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.camera}
          </div>
        </div>
        <div style={{ width: 1, height: 48, background: T.border, margin: '0 16px', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>{displayName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.textDim }}>{roleText}</span>
            {isVerified && <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>✓</span>}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', direction: 'ltr' as const, textAlign: 'right' as const }}>{displayEmail}</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: '0 0 120px' }}>

        {/* Info section */}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '16px 16px 8px' }}>زانیاری</div>
        <div style={{ background: T.card, margin: '0 12px', borderRadius: 12, padding: '0 14px', border: '1px solid rgba(255,255,255,0.04)' }}>

          {/* Name */}
          <div>
            <div onClick={toggleName} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
              <div style={{ width: 24, display: 'flex', justifyContent: 'center', marginLeft: 12 }}>{Icons.user}</div>
              <span style={{ flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>ناو</span>
              <span style={{ fontSize: 12, color: T.textDim, marginLeft: 6 }}>{displayName}</span>
              <DownArrow open={editingName} />
            </div>
            {editingName && (
              <div style={{ padding: '12px 0 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...inputStyle, direction: 'rtl' }} />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, paddingRight: 2 }}>تەنها یەک جار دەتوانی ناوەکەت بگۆڕی</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={handleSaveName} disabled={saving} style={{ flex: 1, background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans Arabic', sans-serif", opacity: saving ? 0.5 : 1 }}>{saving ? '...' : 'پاشەکەوتکردن'}</button>
                  <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', padding: '10px 16px', fontFamily: "'Noto Sans Arabic', sans-serif" }}>پاشگەز</button>
                </div>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <div onClick={togglePhone} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
              <div style={{ width: 24, display: 'flex', justifyContent: 'center', marginLeft: 12 }}>{Icons.phone}</div>
              <span style={{ flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>ژمارەی مۆبایل</span>
              <span style={{ fontSize: 12, color: T.textDim, marginLeft: 6 }}>{profile?.phone || 'زیاد نەکراوە'}</span>
              <DownArrow open={editingPhone} />
            </div>
            {editingPhone && (
              <div style={{ padding: '12px 0 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} dir="ltr" type="tel" placeholder="07501234567" style={inputStyle} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={handleSavePhone} disabled={saving} style={{ flex: 1, background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans Arabic', sans-serif", opacity: saving ? 0.5 : 1 }}>{saving ? '...' : 'پاشەکەوتکردن'}</button>
                  <button onClick={() => setEditingPhone(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', padding: '10px 16px', fontFamily: "'Noto Sans Arabic', sans-serif" }}>پاشگەز</button>
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <div onClick={toggleEmail} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', cursor: 'pointer' }}>
              <div style={{ width: 24, display: 'flex', justifyContent: 'center', marginLeft: 12 }}>{Icons.mail}</div>
              <span style={{ flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>ئیمەیل</span>
              <span style={{ fontSize: 12, color: T.textDim, marginLeft: 6 }}>{displayEmail}</span>
              <DownArrow open={editingEmail} />
            </div>
            {editingEmail && (
              <div style={{ padding: '12px 0 14px' }}>
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} dir="ltr" type="email" style={inputStyle} />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, paddingRight: 2 }}>لینکی پشتڕاستکردن دەنێردرێت بۆ ئیمەیلە نوێیەکە</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={handleSaveEmail} disabled={saving} style={{ flex: 1, background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans Arabic', sans-serif", opacity: saving ? 0.5 : 1 }}>{saving ? '...' : 'پاشەکەوتکردن'}</button>
                  <button onClick={() => setEditingEmail(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', padding: '10px 16px', fontFamily: "'Noto Sans Arabic', sans-serif" }}>پاشگەز</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role section */}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '16px 16px 8px' }}>ڕۆڵ</div>
        <div style={{ background: T.card, margin: '0 12px', borderRadius: 12, padding: '0 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <MenuItem icon={Icons.shield} label="جۆری هەژمار" value={roleText} />
          <div style={{ display: 'flex', alignItems: 'center', padding: '13px 0' }}>
            <div style={{ width: 24, display: 'flex', justifyContent: 'center', marginLeft: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isVerified ? '#22c55e' : T.textDim }} />
            </div>
            <span style={{ flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>بارودۆخ</span>
            <span style={{ fontSize: 12, color: isVerified ? '#22c55e' : T.textDim, fontWeight: 500, marginLeft: 6 }}>
              {isVerified ? 'پشتڕاستکراوە' : 'پشتڕاستنەکراوە'}
            </span>
            <Arrow />
          </div>
        </div>

        {/* Danger */}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '16px 16px 8px' }}>مەترسی</div>
        <div style={{ background: T.card, margin: '0 12px', borderRadius: 12, padding: '0 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
          {!showDeleteConfirm ? (
            <div onClick={() => setShowDeleteConfirm(true)} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', cursor: 'pointer' }}>
              <div style={{ width: 24, display: 'flex', justifyContent: 'center', marginLeft: 12 }}>{Icons.trash}</div>
              <span style={{ fontSize: 14, color: '#dc3c3c', fontWeight: 500 }}>هەژمارەکەت بسڕەوە</span>
            </div>
          ) : (
            <div style={{ padding: '14px 0' }}>
              <p style={{ fontSize: 13, color: '#f87171', margin: '0 0 12px', lineHeight: 1.7, textAlign: 'right' }}>دڵنیایت دەتەوێ هەژمارەکەت بسڕیتەوە؟</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleDeleteAccount} style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans Arabic', sans-serif" }}>بەڵێ دڵنیام</button>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', color: T.textDim, border: 'none', borderRadius: 10, padding: 10, fontSize: 13, cursor: 'pointer', fontFamily: "'Noto Sans Arabic', sans-serif" }}>پاشگەز</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 12,
          padding: '10px 20px', fontSize: 13, fontWeight: 600, color: T.text,
          zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
