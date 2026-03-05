'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { T } from '@/lib/theme'
import { createClient } from '@/lib/supabase/client'

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: T.iconDim, padding: '16px 16px 8px', letterSpacing: 0.5 }}>
      {title}
    </div>
  )
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.iconDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function SketchPerson({ size = 14, hat = false }: { size?: number; hat?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={T.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3.5"/>
      <path d="M6 21 Q7 14 12 13 Q17 14 18 21"/>
      <path d="M9 16 Q12 18 15 16"/>
      {hat && <path d="M7 5 Q12 1 17 5" strokeWidth="1.5"/>}
    </svg>
  )
}

function MenuItem({ icon, label, value, isLast, danger, onClick }: {
  icon: React.ReactNode
  label: string
  value?: string
  isLast?: boolean
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '13px 0',
        borderBottom: isLast ? 'none' : `1.5px dashed ${T.textDim}`,
        cursor: 'pointer',
      }}
    >
      <div style={{ width: 24, display: 'flex', justifyContent: 'center', marginLeft: 12 }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 14, color: danger ? T.destructive : T.textMid, fontWeight: danger ? 500 : 400 }}>
        {label}
      </span>
      {value && (
        <span style={{ fontSize: 12, color: T.textDim, marginLeft: 6 }}>{value}</span>
      )}
      {!danger && <Arrow />}
    </div>
  )
}

// Icons — white SVG strokes matching existing app style
const Icons = {
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  car: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17l-1 2h2m12-2 1 2h-2"/><circle cx="7.5" cy="14" r="1.5"/><circle cx="16.5" cy="14" r="1.5"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  myRides: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" />
    </svg>
  ),
  postRide: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.destructive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const [toast, setToast] = useState('')

  function comingSoon() {
    setToast('بەم زووانە')
    setTimeout(() => setToast(''), 2000)
  }

  const isDriver = profile?.role === 'driver' || profile?.role === 'both'
  const isVerified = profile?.verification_status === 'verified'

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: T.bg, maxWidth: 480, margin: '0 auto', fontFamily: "'Noto Sans Arabic', sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '24px 20px 0' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 20px' }}>هەژمار</h1>
      </div>

      {/* Profile row */}
      <div
        onClick={() => router.push('/profile')}
        style={{ display: 'flex', alignItems: 'center', margin: '0 12px 16px', padding: '14px', gap: 12, cursor: 'pointer', background: T.card, borderRadius: 10, border: `2px solid ${T.text}`, boxShadow: `3px 3px 0 ${T.text}` }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 9,
          background: T.cardInner,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${T.text}`,
        }}>
          <SketchPerson size={26} hat={true} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
            {profile?.full_name || user?.user_metadata?.full_name || 'بەکارهێنەر'}
          </div>
          <div style={{ fontSize: 11, color: T.textDim }}>
            {isDriver ? 'شۆفێر' : 'نەفەر'}
            {isVerified && ' · پشتڕاستکراوە ✓'}
          </div>
        </div>
      </div>

      {/* Account section */}
      <SectionHeader title="هەژمار" />
      <div style={{
        background: T.card,
        margin: '0 12px',
        borderRadius: 10,
        padding: '0 14px',
        border: `2px solid ${T.text}`,
        boxShadow: `3px 3px 0 ${T.text}`,
      }}>
        <div style={{ overflow: 'hidden' }}>
          <MenuItem icon={Icons.profile} label="پرۆفایل" onClick={() => router.push('/profile')} />
          <MenuItem icon={Icons.myRides} label="گەشتەکانم" onClick={() => router.push('/my-rides')} />
          <MenuItem icon={Icons.postRide} label="گەشتێک پۆستکە" onClick={() => router.push('/post-ride')} />
          <MenuItem icon={Icons.car} label="شۆفێر" value={isDriver ? 'چالاککراوە' : 'چالاکنەکراوە'} onClick={() => router.push('/post-ride')} />
          <MenuItem icon={Icons.settings} label="ڕێکخستنەکان" onClick={() => router.push('/settings')} />
          <MenuItem icon={Icons.bell} label="ئاگاداریەکان" value="کراوە" isLast onClick={comingSoon} />
        </div>
      </div>

      {/* Support section */}
      <SectionHeader title="یارمەتی" />
      <div style={{
        background: T.card,
        margin: '0 12px',
        borderRadius: 10,
        padding: '0 14px',
        border: `2px solid ${T.text}`,
        boxShadow: `3px 3px 0 ${T.text}`,
      }}>
        <div style={{ overflow: 'hidden' }}>
          <MenuItem icon={Icons.chat} label="پەیوەندی" onClick={comingSoon} />
          <MenuItem icon={Icons.info} label="دەربارەی ڕێ" value="v1.0.0" isLast onClick={comingSoon} />
        </div>
      </div>

      {/* Sign out */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          background: T.card,
          margin: '0 12px',
          borderRadius: 10,
          padding: '0 14px',
          border: `2px solid ${T.red}`,
          boxShadow: `3px 3px 0 ${T.red}`,
        }}>
          <MenuItem icon={Icons.logout} label="چوونەدەرەوە" danger isLast onClick={handleSignOut} />
        </div>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', padding: '24px 0 120px' }}>
        <span style={{ fontSize: 11, color: T.textDim }}>ڕێ v1.0.0</span>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: T.card,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 12,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 600,
          color: T.text,
          zIndex: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          whiteSpace: 'nowrap',
        }}>
          {toast} ✨
        </div>
      )}

      <BottomNav />
    </div>
  )
}
