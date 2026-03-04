'use client'
import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'
import { CITIES, ROUTE_DISTANCE, toKurdishNum, formatKurdishDate, formatTime, estimateArrival } from '@/lib/utils'
import { RideCard } from '@/components/ui/RideCard'

export default function HomePage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hasUnseen, setHasUnseen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadRides()
    checkBell()
  }, [from, to])

  async function checkBell() {
    const { data: { user } } = await supabase.auth.getUser()
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
      console.error('Error loading rides:', error.message)
      setRides([])
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
    <div style={{ direction: 'rtl', height: '100vh', background: '#0e1015', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Fixed header + search */}
      <div style={{ padding: '24px 20px 0', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#df6530', letterSpacing: -1 }}>ڕێ</h1>
          <Link href="/notifications" style={{ position: 'relative', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hasUnseen && (
              <div style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, borderRadius: '50%',
                background: '#df6530', border: '2px solid #0e1015',
              }} />
            )}
          </Link>
        </div>

      {/* Search bar — collapsed */}
      {!searchOpen && (
        <div
          onClick={() => setSearchOpen(true)}
          style={{
            background: '#1a1c22',
            borderRadius: 50,
            padding: '14px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            marginBottom: 20,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#df6530" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <span style={{ fontSize: 13.5, color: '#ccc' }}>
            {from && to ? (
              <>{CITIES[from]} ← {CITIES[to]}</>
            ) : (
              <>بگە<span style={{ color: '#df6530', fontWeight: 700 }}>ڕێ</span></>
            )}
          </span>
        </div>
      )}

      {/* Search bar — expanded */}
      {searchOpen && (
        <div style={{
          background: '#1a1c22',
          borderRadius: 20,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          padding: 20,
          marginBottom: 20,
          border: '1px solid rgba(160,170,200,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div
              onClick={() => setSearchOpen(false)}
              style={{ cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', background: '#1f2128', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#686e88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#eaedf5' }}>بگە<span style={{ color: '#df6530' }}>ڕێ</span></span>
          </div>

          {/* Vertical route */}
          <div style={{ display: 'flex', gap: 12, padding: '4px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#df6530' }} />
              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #eaedf5', background: 'transparent' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                onClick={() => { const keys = ['', 'erbil', 'suli', 'duhok']; const idx = keys.indexOf(from); setFrom(keys[(idx + 1) % keys.length]); }}
                style={{
                  background: '#1f2128', borderRadius: 12, padding: '12px 16px',
                  fontSize: 14, color: from ? '#eaedf5' : '#686e88', cursor: 'pointer',
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                }}
              >
                {from ? CITIES[from] : 'لە کوێ؟'}
              </div>
              <div
                onClick={() => { const keys = ['', 'erbil', 'suli', 'duhok']; const idx = keys.indexOf(to); setTo(keys[(idx + 1) % keys.length]); }}
                style={{
                  background: '#1f2128', borderRadius: 12, padding: '12px 16px',
                  fontSize: 14, color: to ? '#eaedf5' : '#686e88', cursor: 'pointer',
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                }}
              >
                {to ? CITIES[to] : 'بۆ کوێ؟'}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Scrollable rides */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 96px' }}>
      {/* Rides */}
      {loading ? (
        <div />
      ) : rides.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '3rem 0' }}>{ku.noRidesFound}</p>
      ) : rides.map(ride => (
        <RideCard key={ride.id} ride={ride} />
      ))}
      </div>

      <BottomNav />
    </div>
  )
}
