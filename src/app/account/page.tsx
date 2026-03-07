'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { kurdishStrings } from '@/lib/strings'
import { createClient } from '@/lib/supabase/client'
import SketchPerson from '@/components/ui/icons/SketchPerson'
import SectionLabel from '@/components/ui/SectionLabel'
import Card from '@/components/ui/Card'

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="15 18 9 12 15 6" />
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
        padding: 'var(--space-card-md) 0',
        borderBottom: isLast ? 'none' : 'var(--border-width-medium) dashed var(--color-text-muted)',
        cursor: 'pointer',
      }}
    >
      <div style={{ width: 'var(--space-6)', display: 'flex', justifyContent: 'center', marginLeft: 'var(--space-3)' }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 'var(--font-size-lg)', color: danger ? 'var(--color-status-error)' : 'var(--color-text-secondary)', fontWeight: danger ? 'var(--font-weight-medium)' as unknown as number : 'var(--font-weight-regular)' as unknown as number }}>
        {label}
      </span>
      {value && (
        <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', marginLeft: 6 }}>{value}</span>
      )}
      {!danger && <Arrow />}
    </div>
  )
}

// Icons — white SVG strokes matching existing app style
const Icons = {
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  car: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17l-1 2h2m12-2 1 2h-2"/><circle cx="7.5" cy="14" r="1.5"/><circle cx="16.5" cy="14" r="1.5"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  myRides: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" />
    </svg>
  ),
  postRide: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  coins: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-error)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    setToast(kurdishStrings.comingSoon)
    setTimeout(() => setToast(''), 2000)
  }

  const isDriver = profile?.role === 'driver' || profile?.role === 'both'
  const isVerified = profile?.verification_status === 'verified'

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)', maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ padding: 'var(--space-page-top) var(--space-page-x) 0' }}>
        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-extrabold)' as unknown as number, color: 'var(--color-text-primary)', margin: '0 0 var(--space-5)' }}>{kurdishStrings.navAccount}</h1>
      </div>

      {/* Profile row */}
      <Card style={{ margin: '0 var(--space-3) var(--space-4)' }}>
      <div
        onClick={() => router.push('/profile')}
        style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-card-md)', gap: 'var(--space-3)', cursor: 'pointer' }}
      >
        <div style={{
          width: 'var(--size-avatar-lg)', height: 'var(--size-avatar-lg)', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-sunken)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'var(--border-width-thick) solid var(--color-text-primary)',
        }}>
          <SketchPerson size={26} hat={true} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-text-primary)' }}>
            {profile?.full_name || user?.user_metadata?.full_name || kurdishStrings.userFallback}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            {isDriver ? kurdishStrings.driverLabel : kurdishStrings.person}
            {isVerified && kurdishStrings.verifiedBadgeInline}
          </div>
        </div>
      </div>
      </Card>

      {/* Account section */}
      <SectionLabel label={kurdishStrings.navAccount} />
      <Card style={{ margin: '0 var(--space-3)', padding: '0 var(--space-card-md)' }}>
        <div style={{ overflow: 'hidden' }}>
          <MenuItem icon={Icons.profile} label={kurdishStrings.profilePageTitle} onClick={() => router.push('/profile')} />
          <MenuItem icon={Icons.myRides} label={kurdishStrings.myRidesTitle} onClick={() => router.push('/my-rides')} />
          {isDriver && isVerified ? (
            <MenuItem icon={Icons.postRide} label={kurdishStrings.postARide} onClick={() => router.push('/post-ride')} />
          ) : (
            <MenuItem icon={Icons.car} label={kurdishStrings.activateDriver} onClick={() => router.push('/post-ride')} />
          )}
          <MenuItem icon={Icons.settings} label={kurdishStrings.settings} onClick={() => router.push('/settings')} />
          <MenuItem icon={Icons.bell} label={kurdishStrings.messages} value={kurdishStrings.notifOn} isLast={!(isDriver && isVerified)} onClick={comingSoon} />
          {isDriver && isVerified && (
            <MenuItem icon={Icons.coins} label={kurdishStrings.driverEarnings} isLast onClick={comingSoon} />
          )}
        </div>
      </Card>

      {/* Support section */}
      <SectionLabel label={kurdishStrings.supportSection} />
      <Card style={{ margin: '0 var(--space-3)', padding: '0 var(--space-card-md)' }}>
        <div style={{ overflow: 'hidden' }}>
          <MenuItem icon={Icons.chat} label={kurdishStrings.contactUs} onClick={comingSoon} />
          <MenuItem icon={Icons.info} label={kurdishStrings.aboutApp} value="v1.0.0" isLast onClick={comingSoon} />
        </div>
      </Card>

      {/* Sign out */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <Card danger style={{ margin: '0 var(--space-3)', padding: '0 var(--space-card-md)' }}>
          <MenuItem icon={Icons.logout} label={kurdishStrings.logOut} danger isLast onClick={handleSignOut} />
        </Card>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', padding: 'var(--space-6) 0 var(--space-navClearanceLg)' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{kurdishStrings.appShortName} v1.0.0</span>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 'var(--space-navClearance)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--toast-bg)',
          border: 'var(--toast-border)',
          borderRadius: 'var(--toast-radius)',
          padding: '10px var(--space-5)',
          fontSize: 'var(--toast-fontSize)',
          fontWeight: 'var(--toast-fontWeight)' as unknown as number,
          color: 'var(--color-text-primary)',
          zIndex: 'var(--z-overlay)' as unknown as number,
          boxShadow: 'var(--toast-shadow)',
          backdropFilter: 'var(--toast-blur)',
          WebkitBackdropFilter: 'var(--toast-blur)',
          whiteSpace: 'nowrap',
        }}>
          {toast} ✨
        </div>
      )}

      <BottomNav />
    </div>
  )
}
