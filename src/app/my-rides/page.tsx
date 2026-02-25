'use client'
import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

const CITIES: Record<string, string> = {
  erbil: ku.erbil,
  suli: ku.suli,
  duhok: ku.duhok,
}

export default function MyRidesPage() {
  const [tab, setTab] = useState<'upcoming' | 'requests'>('upcoming')
  const [myRides, setMyRides] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Load my posted rides
    const { data: rides } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', user.id)
      .order('departure_time', { ascending: true })

    setMyRides(rides || [])

    // Load requests for my rides
    if (rides && rides.length > 0) {
      const rideIds = rides.map(r => r.id)
      const { data: reqs } = await supabase
        .from('ride_requests')
        .select('*, passenger:profiles!passenger_id(full_name, phone, avatar_url), ride:rides!ride_id(from_city, to_city, departure_time)')
        .in('ride_id', rideIds)
        .order('created_at', { ascending: false })

      setRequests(reqs || [])
    }

    setLoading(false)
  }

  async function updateRequestStatus(requestId: string, status: string) {
    const { error } = await supabase
      .from('ride_requests')
      .update({ status })
      .eq('id', requestId)

    if (!error) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r))
    }
  }

  const card = { background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '0.75rem' } as React.CSSProperties

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>{ku.myRidesTitle}</h1>
      <div style={{ display: 'flex', background: '#f5f5f4', borderRadius: '0.75rem', padding: '0.25rem', marginBottom: '1.25rem' }}>
        {(['upcoming', 'requests'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer', fontWeight: tab === t ? 600 : 400, background: tab === t ? 'white' : 'transparent', color: tab === t ? '#1c1917' : '#78716c', fontSize: '0.9rem' }}>
            {t === 'upcoming' ? ku.upcoming : ku.requests}
            {t === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ background: '#df6530', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '999px', marginRight: '0.4rem' }}>
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <div /> : tab === 'upcoming' ? (
        myRides.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#a8a29e', padding: '3rem 0' }}>هێشتا ڕێیەکت پۆست نەکردووە</p>
        ) : myRides.map(ride => (
          <div key={ride.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>{CITIES[ride.from_city]} ← {CITIES[ride.to_city]}</span>
              <span style={{ color: '#78716c', fontSize: '0.85rem' }} dir="ltr">
                {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#a8a29e' }} dir="ltr">
              {new Date(ride.departure_time).toLocaleDateString([], { month: 'long', day: 'numeric' })}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#78716c' }}>{ride.available_seats} {ku.seatsLeft}</span>
              {ride.price_type === 'coffee'
                ? <span style={{ background: '#f5f5f4', color: '#57534e', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>{ku.coffeeAndConvo}</span>
                : <span style={{ background: '#f5f5f4', color: '#57534e', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>{ride.price_iqd?.toLocaleString()} دینار</span>
              }
            </div>
          </div>
        ))
      ) : (
        requests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#a8a29e', padding: '3rem 0' }}>هێشتا داواکارییەکت نییە</p>
        ) : requests.map(req => {
          const passenger = req.passenger || {}
          const ride = req.ride || {}
          return (
            <div key={req.id} style={card}>
              <div style={{ fontSize: '0.75rem', color: '#a8a29e', marginBottom: '0.5rem' }}>
                {CITIES[ride.from_city]} ← {CITIES[ride.to_city]}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{passenger.full_name || 'سەرنشین'}</div>
                  {req.pickup && <div style={{ fontSize: '0.8rem', color: '#78716c' }}><span style={{ color: '#a8a29e' }}>سواربوون: </span>{req.pickup}</div>}
                  {req.dropoff && <div style={{ fontSize: '0.8rem', color: '#78716c' }}><span style={{ color: '#a8a29e' }}>دابەزین: </span>{req.dropoff}</div>}
                </div>
              </div>
              {req.status === 'pending' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => updateRequestStatus(req.id, 'approved')} style={{ flex: 1, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>دەمەوێ</button>
                  <button onClick={() => updateRequestStatus(req.id, 'declined')} style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>نامەوێ</button>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: req.status === 'approved' ? '#16a34a' : '#dc2626' }}>
                    {req.status === 'approved' ? ku.approved : ku.declined}
                  </span>
                  {req.status === 'approved' && passenger.phone && (
                    <p style={{ fontSize: '0.8rem', color: '#57534e', marginTop: '0.5rem' }} dir="ltr">{passenger.phone}</p>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
      <BottomNav />
    </div>
  )
}
