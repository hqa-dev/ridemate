'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ku } from '@/lib/translations'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#df6530' : '#a8a29e'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
)

const PostIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#df6530' : '#a8a29e'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
)

const RidesIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#df6530' : '#a8a29e'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#df6530' : '#a8a29e'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" />
  </svg>
)

const navItems = [
  { href: '/home', label: ku.home, Icon: HomeIcon },
  { href: '/post-ride', label: ku.postRide, Icon: PostIcon },
  { href: '/my-rides', label: ku.myRides, Icon: RidesIcon },
  { href: '/profile', label: ku.profile, Icon: ProfileIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '480px', background: 'white',
      borderTop: '1px solid #e7e5e4', display: 'flex',
      justifyContent: 'space-around', padding: '0.5rem 0.5rem 0.5rem',
      zIndex: 100
    }}>
      {navItems.map((item) => {
        const active = pathname === item.href
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.05rem', textDecoration: 'none',
            color: active ? '#df6530' : '#a8a29e'
          }}>
            <item.Icon active={active} />
            <span style={{ fontSize: '0.65rem', fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
