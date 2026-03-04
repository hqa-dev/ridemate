'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
            </Link>
          )
        })}
      </nav>
    </>
  )
}
