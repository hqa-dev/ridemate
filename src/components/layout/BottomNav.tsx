'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ku } from '@/lib/translations'

const navItems = [
  { href: '/home', label: ku.home, icon: '🏠' },
  { href: '/post-ride', label: ku.postRide, icon: '➕' },
  { href: '/my-rides', label: ku.myRides, icon: '🗺️' },
  { href: '/profile', label: ku.profile, icon: '👤' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '480px', background: 'white',
      borderTop: '1px solid #e7e5e4', display: 'flex',
      justifyContent: 'space-around', padding: '0.75rem 0.5rem 1rem',
      zIndex: 100
    }}>
      {navItems.map((item) => {
        const active = pathname === item.href
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.2rem', textDecoration: 'none',
            color: active ? '#df6530' : '#a8a29e'
          }}>
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}