'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import { kurdishStrings } from '@/lib/strings'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/lib/ProfileContext'
import { CITIES } from '@/lib/utils'
import { getThemeMode, setThemeMode } from '@/lib/theme-mode'
import { RideCard } from '@/components/ui/RideCard'

export default function HomePage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hasUnseen, setHasUnseen] = useState(false)
  const [themeMode, setThemeMode2] = useState<'light' | 'dark' | null>(null)
  const [toast, setToast] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user, loading: profileLoading } = useProfile()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setThemeMode2(getThemeMode())
  }, [])

  useEffect(() => {
    if (!profileLoading && !user) router.push('/')
  }, [profileLoading, user])

  useEffect(() => {
    loadRides()
    checkBell()
  }, [from, to])

  async function checkBell() {
    if (!user) return
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('seen', false)
    setHasUnseen((count || 0) > 0)
  }

  async function loadRides() {
    setLoading(true)
    let query = supabase
      .from('rides')
      .select('*, driver:profiles!driver_id(full_name, verified, avatar_url)')
      .eq('status', 'active')
      .gte('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true })

    if (from && to && from === to) { setRides([]); setLoading(false); return }
    if (from) query = query.eq('from_city', from)
    if (to) query = query.eq('to_city', to)

    const { data, error } = await query
    if (error) {
      setRides([])
      setToast(kurdishStrings.errorOccurred)
      setTimeout(() => setToast(''), 2000)
    } else {
      setRides(data || [])
    }
    setLoading(false)
  }

  function selectCity(field: 'from' | 'to', city: string) {
    if (field === 'from') {
      setFrom(prev => prev === city ? '' : city)
    } else {
      setTo(prev => prev === city ? '' : city)
    }
  }

  return (
    <div style={{ direction: 'rtl', height: '100vh', background: 'var(--color-bg-canvas)', maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Fixed header + search */}
      <div style={{ padding: 'var(--space-page-top) var(--space-page-x) 0', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>

          {/* App name */}
          <h1 style={{
            fontSize: 'var(--font-size-5xl)', fontWeight: 'var(--font-weight-extrabold)' as unknown as number, color: 'var(--color-text-primary)', letterSpacing: 'var(--font-letterSpacing-tight)',
            textShadow: 'var(--font-textShadow-brandSm)',
            margin: 0,
          }}>{kurdishStrings.appName}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {/* Refresh button */}
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            <div
              onClick={async () => { setIsRefreshing(true); await Promise.all([loadRides(), checkBell()]); setIsRefreshing(false) }}
              style={{
                cursor: 'pointer',
                width: 'var(--size-button-iconLg)',
                height: 'var(--size-button-iconLg)',
                border: 'var(--border-width-thick) solid var(--color-border-strong)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-bg-surface)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={isRefreshing ? { animation: 'spin 1.5s linear infinite' } : undefined}>
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </div>
            {/* Theme toggle */}
            {themeMode !== null && <div
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                const next = themeMode === 'dark' ? 'light' : 'dark'
                setThemeMode(next)
                setThemeMode2(next)
              }}
              style={{
                cursor: 'pointer',
                width: 'var(--size-button-iconLg)',
                height: 'var(--size-button-iconLg)',
                border: 'var(--border-width-thick) solid var(--color-border-strong)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-bg-surface)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              {themeMode === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </div>}

            {/* Bell icon — ink bordered box */}
            <Link href="/notifications" style={{ textDecoration: 'none' }}>
              <div style={{
                position: 'relative', width: 'var(--size-button-iconLg)', height: 'var(--size-button-iconLg)',
                border: 'var(--border-width-thick) solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {hasUnseen && (
                  <div style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 'var(--size-badge-dot)', height: 'var(--size-badge-dot)', borderRadius: '50%',
                    background: 'var(--color-brand-primary)', border: 'var(--border-width-thick) solid var(--color-bg-canvas)',
                  }} />
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Search bar — collapsed */}
        {!searchOpen && (
          <div
            onClick={() => setSearchOpen(true)}
            style={{
              background: 'var(--color-bg-surface)',
              border: 'var(--border-width-thick) solid var(--color-border-strong)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--input-search-padding)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2-5)',
              cursor: 'pointer',
              marginBottom: 'var(--space-5)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <span style={{ fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
              {from && to ? (
                <>{CITIES[from]} ← {CITIES[to]}</>
              ) : (
                <>{kurdishStrings.findRidePlaceholder}</>
              )}
            </span>
          </div>
        )}

        {/* Search bar — expanded */}
        {searchOpen && (
          <div style={{
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-4xl)',
            boxShadow: 'var(--shadow-card)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-5)',
            border: 'var(--border-width-thick) solid var(--color-border-strong)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div
                onClick={() => setSearchOpen(false)}
                style={{
                  cursor: 'pointer', width: 'var(--size-button-close)', height: 'var(--size-button-close)', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-sunken)', border: 'var(--border-width-medium) solid var(--color-border-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
                </svg>
              </div>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-text-primary)' }}>{kurdishStrings.findRide}</span>
            </div>

            {/* Vertical route */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)', paddingTop: 'var(--space-3)' }}>
                <div style={{ width: 'var(--size-routeDot)', height: 'var(--size-routeDot)', borderRadius: '50%', background: 'var(--color-brand-primary)' }} />
                <div style={{ width: 1, height: 'var(--space-8)', background: 'var(--color-border-divider)' }} />
                <div style={{ width: 'var(--size-routeDot)', height: 'var(--size-routeDot)', borderRadius: '50%', border: 'var(--border-width-thick) solid var(--color-text-primary)', background: 'transparent' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div
                  onClick={() => { const keys = ['', 'erbil', 'suli', 'duhok']; const idx = keys.indexOf(from); setFrom(keys[(idx + 1) % keys.length]); }}
                  style={{
                    background: 'var(--color-bg-sunken)', border: 'var(--border-width-medium) solid var(--color-border-strong)',
                    borderRadius: 'var(--radius-2xl)', padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--font-size-lg)', color: from ? 'var(--color-text-primary)' : 'var(--color-text-muted)', cursor: 'pointer',
                  }}
                >
                  {from ? CITIES[from] : kurdishStrings.fromWhere}
                </div>
                <div
                  onClick={() => { const keys = ['', 'erbil', 'suli', 'duhok']; const idx = keys.indexOf(to); setTo(keys[(idx + 1) % keys.length]); }}
                  style={{
                    background: 'var(--color-bg-sunken)', border: 'var(--border-width-medium) solid var(--color-border-strong)',
                    borderRadius: 'var(--radius-2xl)', padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--font-size-lg)', color: to ? 'var(--color-text-primary)' : 'var(--color-text-muted)', cursor: 'pointer',
                  }}
                >
                  {to ? CITIES[to] : kurdishStrings.toWhere}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable rides */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-page-x) var(--space-navClearance)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                background: 'var(--color-bg-surface)',
                border: 'var(--border-width-thick) solid var(--color-border-strong)',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-4)',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div style={{ width: 'var(--space-8)', height: 'var(--space-5)', background: 'var(--color-bg-sunken)', borderRadius: 'var(--radius-base)' }} />
                  <div style={{ flex: 1, height: 'var(--space-3)', background: 'var(--color-bg-sunken)', borderRadius: 'var(--radius-base)' }} />
                </div>
                <div style={{ height: 'var(--space-3)', background: 'var(--color-bg-sunken)', borderRadius: 'var(--radius-base)', width: '60%', marginBottom: 'var(--space-2)' }} />
                <div style={{ height: 'var(--space-3)', background: 'var(--color-bg-sunken)', borderRadius: 'var(--radius-base)', width: '40%' }} />
              </div>
            ))}
          </div>
        ) : rides.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '3rem 0' }}>{kurdishStrings.noRidesFound}</p>
        ) : rides.map(ride => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 'var(--space-navClearance)', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--toast-bg)', border: 'var(--toast-border)', borderRadius: 'var(--toast-radius)',
          padding: 'var(--space-2-5) var(--space-5)', fontSize: 'var(--toast-fontSize)',
          fontWeight: 'var(--toast-fontWeight)' as unknown as number, color: 'var(--color-text-primary)',
          zIndex: 'var(--z-overlay)' as unknown as number, boxShadow: 'var(--toast-shadow)',
          backdropFilter: 'var(--toast-blur)', WebkitBackdropFilter: 'var(--toast-blur)', whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
