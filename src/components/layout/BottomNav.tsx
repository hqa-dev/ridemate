'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#df6530' : '#555'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
)

const PostIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#df6530' : '#555'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
)

const RidesIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#df6530' : '#555'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
    <path d="M15 5.764v15" />
    <path d="M9 3.236v15" />
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#df6530' : '#555'} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" />
  </svg>
)

const navItems = [
  { href: '/home', Icon: HomeIcon },
  { href: '/post-ride', Icon: PostIcon },
  { href: '/my-rides', Icon: RidesIcon },
  { href: '/profile', Icon: ProfileIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav style={{
      position: 'fixed', bottom: 14, left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 24px)', maxWidth: 456,
      display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', gap: 18,
      zIndex: 100,
    }}>
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href === '/home' && pathname === '/')
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 38, borderRadius: 14,
            background: active ? '#1e1e1e' : '#161616',
            border: `1px solid ${active ? 'rgba(223,101,48,0.25)' : '#222'}`,
            boxShadow: active ? '0 2px 12px rgba(223,101,48,0.08)' : '0 2px 8px rgba(0,0,0,0.3)',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
          }}>
            <item.Icon active={active} />
          </Link>
        )
      })}
    </nav>
  )
}
