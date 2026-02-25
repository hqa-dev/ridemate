'use client'
import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

const CITIES: Record<string, string> = {
  erbil: ku.erbil,
  suli: ku.suli,
  duhok: ku.duhok,
}

export default function HomePage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadRides()
  }, [from, to])

  async function loadRides() {
    setLoading(true)
    let query = supabase
      .from('rides')
      .select('*, driver:profiles!driver_id(full_name, verified, avatar_url)')
      .eq('status', 'active')
      .gte('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true })

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

  const pill = { background: '#f5f5f4', color: '#44403c', fontSize: '0.8rem', padding: '0.2rem 0.65rem', borderRadius: '999px', display: 'inline-block' }
  const card = { background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '0.75rem', cursor: 'pointer' }
  const select = { width: '100%', background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: '0.75rem', padding: '0.75rem 1rem 0.75rem 2.5rem', fontSize: '0.95rem', outline: 'none', direction: 'rtl' } as React.CSSProperties

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
      <style>{`select.ride-select { -webkit-appearance: none !important; -moz-appearance: none !important; appearance: none !important; }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c1917' }}>بگە<span style={{ color: '#df6530' }}>ڕێ</span></h1>
      </div>

      <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '0.75rem 1.25rem', marginBottom: '1.25rem' }}>
        <div>
          <select className="ride-select" value={from} onChange={e => setFrom(e.target.value)} style={select}>
            <option value="">لە: {ku.allCities}</option>
            {Object.entries(CITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0', cursor: 'pointer' }} onClick={() => { const t = from; setFrom(to); setTo(t) }}>
          <div style={{ flex: 1, height: '1px', background: '#e7e5e4' }} />
          <span style={{ padding: '0 0.5rem', color: '#c4c0bc', fontSize: '0.75rem' }}>⇅</span>
          <div style={{ flex: 1, height: '1px', background: '#e7e5e4' }} />
        </div>
        <div>
          <select className="ride-select" value={to} onChange={e => setTo(e.target.value)} style={select}>
            <option value="">بۆ: {ku.allCities}</option>
            {Object.entries(CITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div />
      ) : rides.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#a8a29e', padding: '3rem 0' }}>{ku.noRidesFound}</p>
      ) : rides.map(ride => {
        const driver = ride.driver || {}
        const carParts = [ride.car_make, ride.car_model].filter(Boolean).join(' ')
        const carDisplay = carParts ? `${carParts}${ride.car_color ? ' - ' + ride.car_color : ''}` : ''

        return (
          <Link key={ride.id} href={`/rides/${ride.id}`} style={{ textDecoration: 'none' }}>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={pill}>{CITIES[ride.from_city]}</span>
                <span style={{ color: '#d6d3d1' }}>←</span>
                <span style={pill}>{CITIES[ride.to_city]}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#44403c' }}>{driver.full_name || 'شۆفێر'}</span>
                {driver.verified && <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>ناسراوە ✓</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.75rem', color: '#78716c', fontSize: '0.85rem' }}>
                  <span dir="ltr">{new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{ride.available_seats} {ku.seatsLeft}</span>
                </div>
                {ride.price_type === 'coffee'
                  ? <span style={{ background: '#f5f5f4', color: '#57534e', fontSize: '0.78rem', padding: '0.25rem 0.65rem', borderRadius: '999px' }}>{ku.coffeeAndConvo}</span>
                  : <span style={{ background: '#f5f5f4', color: '#57534e', fontSize: '0.78rem', padding: '0.25rem 0.65rem', borderRadius: '999px' }}>{ride.price_iqd?.toLocaleString()} دینار</span>
                }
              </div>
              {carDisplay && <p style={{ fontSize: '0.75rem', color: '#a8a29e', marginTop: '0.25rem', textAlign: 'right' }}>{carDisplay}</p>}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {ride.smoking !== null && (
                  <span style={{ background: ride.smoking ? '#fef2f2' : '#f0fdf4', color: ride.smoking ? '#dc2626' : '#16a34a', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                    {ride.smoking ? '🚬 جگەرەکێشە' : '🚭 جگەرەکێش نییە'}
                  </span>
                )}
              </div>
              {ride.notes && <p style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '0.4rem', lineHeight: 1.6 }}>{ride.notes}</p>}
            </div>
          </Link>
        )
      })}

      <BottomNav />
    </div>
  )
}
