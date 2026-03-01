'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function NavIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'
  const sw = active ? 1.8 : 1.5
  const sz = active ? 26 : 22
  if (type === 'home') return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>
  if (type === 'rides') return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" /></svg>
  if (type === 'post') return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M12 2a10 10 0 0 1 8.5 15" /><path d="M12 2a10 10 0 0 0-8.5 15" /><path d="M12 22a10 10 0 0 0 0-4" /><line x1="12" y1="14" x2="12" y2="21" /><line x1="4.5" y1="16" x2="10" y2="12" /><line x1="19.5" y1="16" x2="14" y2="12" /></svg>
  return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" /></svg>
}

const navItems = [
  { href: '/home', icon: 'home', label: 'سەرەکی' },
  { href: '/my-rides', icon: 'rides', label: 'گەشتەکانم' },
  { href: '/post-ride', icon: 'post', label: 'گەشتێک پۆستکە' },
  { href: '/profile', icon: 'profile', label: 'خۆت' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [badges, setBadges] = useState<Record<string, number>>({})

  useEffect(() => {
    loadBadges()
    const interval = setInterval(loadBadges, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadBadges() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Count unread ride request updates for passenger
    const { count: ridesCount } = await supabase
      .from('ride_requests')
      .select('*', { count: 'exact', head: true })
      .eq('passenger_id', user.id)
      .in('status', ['approved', 'declined'])
      .eq('seen_by_passenger', false)

    // Count pending requests only if user is a verified driver
    let postCount = 0
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, verification_status')
      .eq('id', user.id)
      .single()
    
    if (profile && (profile.role === 'driver' || profile.role === 'both') && profile.verification_status === 'verified') {
      const { data: myRides } = await supabase
        .from('rides')
        .select('id')
        .eq('driver_id', user.id)
      
      if (myRides && myRides.length > 0) {
        const rideIds = myRides.map(r => r.id)
        const { count } = await supabase
          .from('ride_requests')
          .select('*', { count: 'exact', head: true })
          .in('ride_id', rideIds)
          .eq('status', 'pending')
        postCount = count || 0
      }
    }

    setBadges({
      '/my-rides': ridesCount || 0,
      '/post-ride': postCount,
    })
  }

  return (
    <>
      <style>{`
        @keyframes navEdge {
          0% { border-color: rgba(255,255,255,0.06); box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04); }
          33% { border-color: rgba(0,180,255,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 14px rgba(0,180,255,0.06); }
          66% { border-color: rgba(0,140,255,0.15); box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 18px rgba(0,160,255,0.04); }
          100% { border-color: rgba(255,255,255,0.06); box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04); }
        }
        .nav-edge { animation: navEdge 8s ease-in-out infinite; }
      `}</style>
      <nav className="nav-edge" style={{
        position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 56px)', maxWidth: 420,
        display: 'flex', direction: 'rtl', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 100, borderRadius: 50, padding: '8px 6px',
        background: 'rgba(20,22,28,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href === '/home' && pathname === '/')
          const badge = badges[item.href] || 0
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: active ? 8 : 0, position: 'relative',
              width: active ? 'auto' : 48,
              padding: active ? '0 18px' : '0',
              height: active ? 52 : 48, borderRadius: 50,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
              boxShadow: active ? '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
              border: `1px solid ${active ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
              textDecoration: 'none',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}>
              <NavIcon type={item.icon} active={active} />
              {active && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                }}>{item.label}</span>
              )}
              {badge > 0 && (
                <div style={{
                  position: 'absolute',
                  top: active ? 4 : 6,
                  left: active ? 12 : 8,
                  minWidth: 14, height: 14, borderRadius: 7,
                  background: 'rgba(255,255,255,0.85)',
                  border: '1.5px solid rgba(20,22,28,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: '#0e1015',
                  padding: '0 3px',
                }}>{badge}</div>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
