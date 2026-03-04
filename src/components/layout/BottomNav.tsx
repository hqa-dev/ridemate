'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { T } from '@/lib/theme'

function NavIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'
  const sw = active ? 1.8 : 1.5
  const sz = active ? 26 : 22
  if (type === 'home') return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>
  return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" /></svg>
}

const navItems = [
  { href: '/home', icon: 'home', label: 'گەشتەکان' },
  { href: '/account', icon: 'profile', label: 'هەژمار' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        .nav-tab { transition: flex 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s, border 0.3s, transform 0.3s; }
        .nav-tab:active { transform: scale(0.95); }
        .nav-label { transition: opacity 0.2s ease 0.15s, max-width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
      <nav style={{
        position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 56px)', maxWidth: 420,
        display: 'flex', direction: 'rtl', alignItems: 'center',
        zIndex: 100, borderRadius: 50, padding: '4px 5px', gap: 4,
        background: T.navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${T.navBorder}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {navItems.map((item) => {
          const active = item.href === '/home'
            ? (pathname === '/home' || pathname === '/')
            : (pathname === '/account' || pathname === '/profile' || pathname === '/my-rides' || pathname === '/post-ride')
          return (
            <Link key={item.href} href={item.href} className="nav-tab" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10,
              flex: active ? 2.2 : 1,
              height: 50, borderRadius: 50,
              background: active ? T.activePill : 'transparent',
              border: `1px solid ${active ? T.navBorder : 'transparent'}`,
              textDecoration: 'none',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}>
              <NavIcon type={item.icon} active={active} />
              <span className="nav-label" style={{
                fontSize: 12, fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: "'Noto Sans Arabic', sans-serif",
                opacity: active ? 1 : 0,
                maxWidth: active ? 100 : 0,
                overflow: 'hidden',
              }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
