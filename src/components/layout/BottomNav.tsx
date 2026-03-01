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
  { href: '/home', Icon: HomeIcon, label: 'سەرەکی' },
  { href: '/my-rides', Icon: RidesIcon, label: 'گەشتەکانم' },
  { href: '/post-ride', Icon: PostIcon, label: 'گەشتێک پۆستکە' },
  { href: '/profile', Icon: ProfileIcon, label: 'خۆت' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <>
      <style>{`
        @keyframes navWave {
          0% { border-color: rgba(255,255,255,0.08); box-shadow: 0 0 18px rgba(255,120,20,0.06), inset 0 0 10px rgba(255,120,20,0.03); }
          25% { border-color: rgba(255,120,20,0.35); box-shadow: 0 0 28px rgba(255,120,20,0.18), inset 0 0 14px rgba(255,120,20,0.06); }
          50% { border-color: rgba(255,255,255,0.15); box-shadow: 0 0 22px rgba(255,255,255,0.08), inset 0 0 10px rgba(255,255,255,0.03); }
          75% { border-color: rgba(255,120,20,0.3); box-shadow: 0 0 26px rgba(255,120,20,0.15), inset 0 0 12px rgba(255,120,20,0.05); }
          100% { border-color: rgba(255,255,255,0.08); box-shadow: 0 0 18px rgba(255,120,20,0.06), inset 0 0 10px rgba(255,120,20,0.03); }
        }
        .nav-wave {
          animation: navWave 6s ease-in-out infinite;
        }
      `}</style>
      <nav className="nav-wave" style={{
        position: 'fixed', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        width: 'auto',
        display: 'flex', direction: 'rtl', justifyContent: 'center', gap: 6,
        zIndex: 100,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '7px 17px',
        background: 'rgba(22,22,22,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href === '/home' && pathname === '/')
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: active ? 8 : 0, height: 38, borderRadius: 14,
              padding: active ? '0 16px' : '0', width: active ? 'auto' : 52,
              background: active ? '#262830' : 'transparent',
              border: `1px solid ${active ? 'rgba(223,101,48,0.25)' : 'transparent'}`,
              boxShadow: active ? '0 2px 12px rgba(223,101,48,0.08)' : 'none',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}>
              <item.Icon active={active} />
              {active && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#df6530',
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                }}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
