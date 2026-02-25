'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/register')
        return
      }
      setUser(user)

      // Try to get profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // If role was saved during registration, update it
      const savedRole = localStorage.getItem('ridemate_role')
      if (savedRole && profileData && !profileData.role) {
        await supabase
          .from('profiles')
          .update({ role: savedRole })
          .eq('id', user.id)
        setProfile({ ...profileData, role: savedRole })
        localStorage.removeItem('ridemate_role')
      }

      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const card = { background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '0.75rem' } as React.CSSProperties
  const btn = { background: '#df6530', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: '0.5rem', textAlign: 'center' as const, display: 'flex', justifyContent: 'center', alignItems: 'center' } as React.CSSProperties

  if (loading) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>{ku.profileTitle}</h1>
        <BottomNav />
      </div>
    )
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || ''
  const displayEmail = user?.email || ''
  const displayPhone = profile?.phone || ''
  const isVerified = profile?.verified || false
  const role = profile?.role || ''
  const isDriver = role === 'driver' || role === 'both'
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ''

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>{ku.profileTitle}</h1>

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
          {displayPhone && <div style={{ fontSize: '0.85rem', color: '#78716c' }} dir="ltr">{displayPhone}</div>}
          {displayEmail && <div style={{ fontSize: '0.8rem', color: '#a8a29e' }} dir="ltr">{displayEmail}</div>}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
            {isVerified && <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>{ku.verified}</span>}
            {role && <span style={{ background: '#f5f5f4', color: '#57534e', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>{role === 'passenger' ? ku.passenger : role === 'driver' ? ku.driver : ku.both}</span>}
          </div>
        </div>
      </div>

      {!isDriver && (
        <div style={{ ...card, background: '#fae8d8', border: '1px solid #f5cdb0' }}>
          <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.4rem' }}>{ku.activateDriver}</div>
          <div style={{ fontSize: '0.85rem', color: '#a16207', marginBottom: '1rem' }}>{ku.activateDriverDesc}</div>
          <a href='/auth/become-driver' style={{ ...btn, textDecoration: 'none' }}>{ku.continue}</a>
        </div>
      )}

      <div style={card}>
        <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', padding: 0 }}>{ku.signOut}</button>
      </div>

      <BottomNav />
    </div>
  )
}
