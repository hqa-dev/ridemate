'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { kurdishStrings } from '@/lib/strings'
import { createClient } from '@/lib/supabase/client'
import SketchPerson from '@/components/ui/icons/SketchPerson'
import PageHeader from '@/components/ui/PageHeader'
import SectionLabel from '@/components/ui/SectionLabel'
import Card from '@/components/ui/Card'

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const DownArrow = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--motion-duration-normal) var(--motion-easing-standard)', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const Icons = {
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  camera: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  ),
  personFallback: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-error)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
}

function MenuItem({ icon, label, value, isLast, danger, onClick }: {
  icon: React.ReactNode; label: string; value?: string; isLast?: boolean; danger?: boolean; onClick?: () => void
}) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: isLast ? 'none' : 'var(--border-width-medium) dashed var(--color-text-muted)', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 'var(--space-6)', display: 'flex', justifyContent: 'center', marginLeft: 'var(--space-3)' }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 'var(--font-size-heading)', color: danger ? 'var(--color-status-error)' : 'var(--color-text-secondary)', fontWeight: danger ? 'var(--font-weight-regular)' as unknown as number : 'var(--font-weight-regular)' as unknown as number }}>{label}</span>
      {value && <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', marginLeft: 6 }}>{value}</span>}
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
    if (!canChangeName()) { showToast(kurdishStrings.errorNameChangeLimit); return }
    setSaving(true)
    await supabase.from('profiles').update({ full_name: editName.trim(), last_name_change: new Date().toISOString() }).eq('id', user.id)
    setProfile((p: any) => ({ ...p, full_name: editName.trim(), last_name_change: new Date().toISOString() }))
    setSaving(false)
    setEditingName(false)
    showToast(kurdishStrings.nameChanged)
  }

  async function handleSavePhone() {
    if (!editPhone.trim() || !user) return
    setSaving(true)
    await supabase.from('profiles').update({ phone: editPhone.trim() }).eq('id', user.id)
    setProfile((p: any) => ({ ...p, phone: editPhone.trim() }))
    setSaving(false)
    setEditingPhone(false)
    showToast(kurdishStrings.phoneChanged)
  }

  async function handleSaveEmail() {
    if (!editEmail.trim() || !user) return
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ email: editEmail.trim() })
    setSaving(false)
    if (error) { showToast(kurdishStrings.errorPrefix + error.message); return }
    setEditingEmail(false)
    showToast(kurdishStrings.verificationLinkSent)
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
    // Cancel all active rides posted by this user
    await supabase.from('rides').update({ status: 'cancelled' }).eq('driver_id', user.id).in('status', ['active', 'full'])
    // Cancel all pending/approved ride requests by this user
    await supabase.from('ride_requests').update({ status: 'cancelled' }).eq('passenger_id', user.id).in('status', ['pending', 'approved'])
    // Delete profile (cascades notifications etc)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div style={{ direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)', maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto' }}><BottomNav active="account" /></div>
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || ''
  const displayEmail = user?.email || ''
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ''
  const isDriver = profile?.role === 'driver' || profile?.role === 'both'
  const isVerified = profile?.verification_status === 'verified'
  const roleText = profile?.role === 'passenger' ? kurdishStrings.passenger : profile?.role === 'driver' ? kurdishStrings.driver : kurdishStrings.driverAndPassenger

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--color-bg-sunken)', border: 'var(--border-width-thin) solid var(--color-border-strong)',
    borderRadius: 'var(--radius-base)', padding: 'var(--input-standard-padding)', fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <div style={{ direction: 'rtl', height: '100vh', background: 'var(--color-bg-canvas)', maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ flexShrink: 0 }}>
        <PageHeader title={kurdishStrings.profilePageTitle} back onBack={() => router.push('/account')} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--space-navClearance)' }}>
      {/* Profile card — avatar right, divider, details left */}
      <input type="file" accept="image/*" ref={avatarInputRef} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f) }} />
      <Card style={{ margin: '0 var(--space-3) var(--space-2)', padding: 'var(--space-5) var(--space-card-lg)', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()}>
          <div style={{ width: 'var(--size-avatar-xl)', height: 'var(--size-avatar-xl)', borderRadius: 'var(--radius-xl)', background: 'var(--color-bg-sunken)', border: 'var(--border-width-thick) solid var(--color-text-primary)', boxShadow: 'var(--shadow-profileAvatar)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', opacity: uploadingAvatar ? 'var(--opacity-disabled)' as unknown as number : 1 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            ) : <SketchPerson size={32} hat />}
          </div>
          <div style={{ position: 'absolute', bottom: -4, left: -4, width: 20, height: 20, borderRadius: '50%', background: 'var(--color-bg-surface)', border: 'var(--border-width-thick) solid var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.camera}
          </div>
        </div>
        <div style={{ width: 1, height: 48, borderRight: 'var(--border-width-thin) solid var(--color-border-subtle)', margin: '0 var(--space-4)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>{displayName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)', marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)' }}>{roleText}</span>
            {isVerified && <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-status-success)', fontWeight: 'var(--font-weight-bold)' as unknown as number }}>✓</span>}
          </div>
          <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-icon-muted)', direction: 'ltr' as const, textAlign: 'right' as const }}>{displayEmail}</div>
        </div>
      </Card>

      {/* Scrollable content */}
      <div style={{ padding: '0 0 120px' }}>

        {/* Info section */}
        <div style={{ marginTop: 'var(--space-4)' }}><SectionLabel label={kurdishStrings.infoSection} /></div>
        <Card style={{ margin: '0 var(--space-3)', padding: '0 var(--space-card-md)' }}>

          {/* Name */}
          <div>
            <div onClick={toggleName} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: 'var(--border-width-medium) dashed var(--color-text-muted)', cursor: 'pointer' }}>
              <div style={{ width: 'var(--space-6)', display: 'flex', justifyContent: 'center', marginLeft: 'var(--space-3)' }}>{Icons.user}</div>
              <span style={{ flex: 1, fontSize: 'var(--font-size-heading)', color: 'var(--color-text-secondary)' }}>{kurdishStrings.name}</span>
              <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', marginLeft: 6 }}>{displayName}</span>
              <DownArrow open={editingName} />
            </div>
            {editingName && (
              <div style={{ padding: 'var(--space-3) 0 var(--space-card-md)', borderBottom: 'var(--border-width-medium) dashed var(--color-text-muted)' }}>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...inputStyle, direction: 'rtl' }} />
                <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-icon-muted)', marginTop: 'var(--space-1-5)', paddingRight: 2 }}>{kurdishStrings.nameChangeNote}</div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2-5)'}}>
                  <button onClick={handleSaveName} disabled={saving} style={{ flex: 1, background: 'var(--button-subtle-bg)', color: 'var(--color-status-success)', border: 'none', borderRadius: 'var(--button-subtle-radius)', padding: 'var(--button-subtle-padding)', fontSize: 'var(--button-subtle-fontSize)', fontWeight: 'var(--button-subtle-fontWeight)' as unknown as number, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 'var(--opacity-disabled)' as unknown as number : 1 }}>{saving ? '...' : kurdishStrings.save}</button>
                  <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: 'var(--color-icon-muted)', fontSize: 'var(--font-size-body)', cursor: 'pointer', padding: 'var(--button-subtle-padding)', fontFamily: 'inherit' }}>{kurdishStrings.cancel}</button>
                </div>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <div onClick={togglePhone} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: 'var(--border-width-medium) dashed var(--color-text-muted)', cursor: 'pointer' }}>
              <div style={{ width: 'var(--space-6)', display: 'flex', justifyContent: 'center', marginLeft: 'var(--space-3)' }}>{Icons.phone}</div>
              <span style={{ flex: 1, fontSize: 'var(--font-size-heading)', color: 'var(--color-text-secondary)' }}>{kurdishStrings.mobileNumber}</span>
              <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', marginLeft: 6 }}>{profile?.phone || kurdishStrings.notAdded}</span>
              <DownArrow open={editingPhone} />
            </div>
            {editingPhone && (
              <div style={{ padding: 'var(--space-3) 0 var(--space-card-md)', borderBottom: 'var(--border-width-medium) dashed var(--color-text-muted)' }}>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} dir="ltr" type="tel" placeholder="07501234567" style={inputStyle} />
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2-5)'}}>
                  <button onClick={handleSavePhone} disabled={saving} style={{ flex: 1, background: 'var(--button-subtle-bg)', color: 'var(--color-status-success)', border: 'none', borderRadius: 'var(--button-subtle-radius)', padding: 'var(--button-subtle-padding)', fontSize: 'var(--button-subtle-fontSize)', fontWeight: 'var(--button-subtle-fontWeight)' as unknown as number, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 'var(--opacity-disabled)' as unknown as number : 1 }}>{saving ? '...' : kurdishStrings.save}</button>
                  <button onClick={() => setEditingPhone(false)} style={{ background: 'none', border: 'none', color: 'var(--color-icon-muted)', fontSize: 'var(--font-size-body)', cursor: 'pointer', padding: 'var(--button-subtle-padding)', fontFamily: 'inherit' }}>{kurdishStrings.cancel}</button>
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <div onClick={toggleEmail} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', cursor: 'pointer' }}>
              <div style={{ width: 'var(--space-6)', display: 'flex', justifyContent: 'center', marginLeft: 'var(--space-3)' }}>{Icons.mail}</div>
              <span style={{ flex: 1, fontSize: 'var(--font-size-heading)', color: 'var(--color-text-secondary)' }}>{kurdishStrings.emailLabel}</span>
              <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', marginLeft: 6 }}>{displayEmail}</span>
              <DownArrow open={editingEmail} />
            </div>
            {editingEmail && (
              <div style={{ padding: 'var(--space-3) 0 var(--space-card-md)' }}>
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} dir="ltr" type="email" style={inputStyle} />
                <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-icon-muted)', marginTop: 'var(--space-1-5)', paddingRight: 2 }}>{kurdishStrings.emailVerificationNote}</div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2-5)'}}>
                  <button onClick={handleSaveEmail} disabled={saving} style={{ flex: 1, background: 'var(--button-subtle-bg)', color: 'var(--color-status-success)', border: 'none', borderRadius: 'var(--button-subtle-radius)', padding: 'var(--button-subtle-padding)', fontSize: 'var(--button-subtle-fontSize)', fontWeight: 'var(--button-subtle-fontWeight)' as unknown as number, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 'var(--opacity-disabled)' as unknown as number : 1 }}>{saving ? '...' : kurdishStrings.save}</button>
                  <button onClick={() => setEditingEmail(false)} style={{ background: 'none', border: 'none', color: 'var(--color-icon-muted)', fontSize: 'var(--font-size-body)', cursor: 'pointer', padding: 'var(--button-subtle-padding)', fontFamily: 'inherit' }}>{kurdishStrings.cancel}</button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Role section */}
        <div style={{ marginTop: 'var(--space-4)' }}><SectionLabel label={kurdishStrings.roleSection} /></div>
        <Card style={{ margin: '0 var(--space-3)', padding: '0 var(--space-card-md)' }}>
          <MenuItem icon={Icons.shield} label={kurdishStrings.accountType} value={roleText} />
          <div style={{ display: 'flex', alignItems: 'center', padding: '13px 0' }}>
            <div style={{ width: 'var(--space-6)', display: 'flex', justifyContent: 'center', marginLeft: 'var(--space-3)' }}>
              <div style={{ width: 'var(--size-statusDot)', height: 'var(--size-statusDot)', borderRadius: '50%', background: isVerified ? 'var(--color-status-success)' : 'var(--color-text-muted)' }} />
            </div>
            <span style={{ flex: 1, fontSize: 'var(--font-size-heading)', color: 'var(--color-text-secondary)' }}>{kurdishStrings.statusLabel}</span>
            <span style={{ fontSize: 'var(--font-size-body)', color: isVerified ? 'var(--color-status-success)' : 'var(--color-text-muted)', fontWeight: 'var(--font-weight-regular)' as unknown as number, marginLeft: 6 }}>
              {isVerified ? kurdishStrings.verifiedStatus : kurdishStrings.unverifiedStatus}
            </span>
            <Arrow />
          </div>
        </Card>

        {/* Danger */}
        <div style={{ marginTop: 'var(--space-4)' }}><SectionLabel label={kurdishStrings.dangerSection} /></div>
        <Card danger style={{ margin: '0 var(--space-3)', padding: '0 var(--space-card-md)' }}>
          {!showDeleteConfirm ? (
            <div onClick={() => setShowDeleteConfirm(true)} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', cursor: 'pointer' }}>
              <div style={{ width: 'var(--space-6)', display: 'flex', justifyContent: 'center', marginLeft: 'var(--space-3)' }}>{Icons.trash}</div>
              <span style={{ fontSize: 'var(--font-size-heading)', color: 'var(--color-status-error)', fontWeight: 'var(--font-weight-regular)' as unknown as number }}>{kurdishStrings.deleteAccount}</span>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-card-md) 0' }}>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-status-error)', margin: '0 0 var(--space-3)', lineHeight: 'var(--font-lineHeight-normal)', textAlign: 'right' }}>{kurdishStrings.confirmDeleteAccount}</p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button onClick={handleDeleteAccount} style={{ flex: 1, background: 'var(--color-status-error)', color: 'var(--color-text-onAccent)', border: 'none', borderRadius: 'var(--radius-xl)', padding: 10, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)' as unknown as number, cursor: 'pointer' }}>{kurdishStrings.yesImSure}</button>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, background: 'var(--color-chip-bg)', color: 'var(--color-text-muted)', border: 'none', borderRadius: 'var(--radius-xl)', padding: 10, fontSize: 'var(--font-size-body)', cursor: 'pointer' }}>{kurdishStrings.cancel}</button>
              </div>
            </div>
          )}
        </Card>
      </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 'var(--space-navClearance)', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--toast-bg)', border: 'var(--toast-border)', borderRadius: 'var(--toast-radius)',
          padding: '10px var(--space-5)', fontSize: 'var(--toast-fontSize)', fontWeight: 'var(--toast-fontWeight)' as unknown as number, color: 'var(--color-text-primary)',
          zIndex: 'var(--z-overlay)' as unknown as number, boxShadow: 'var(--toast-shadow)',
          backdropFilter: 'var(--toast-blur)', WebkitBackdropFilter: 'var(--toast-blur)', whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      <BottomNav active="account" />
    </div>
  )
}
