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

const ROUTE_INFO: Record<string, { duration: string; distance: string }> = {
  'erbil-suli': { duration: '٢ کاتژمێر', distance: '١٦٠ کم' },
  'suli-erbil': { duration: '٢ کاتژمێر', distance: '١٦٠ کم' },
  'erbil-duhok': { duration: '٣ کاتژمێر', distance: '١٨٠ کم' },
  'duhok-erbil': { duration: '٣ کاتژمێر', distance: '١٨٠ کم' },
  'suli-duhok': { duration: '٥ کاتژمێر', distance: '٣٤٠ کم' },
  'duhok-suli': { duration: '٥ کاتژمێر', distance: '٣٤٠ کم' },
}

function formatWhatsApp(phone: string) {
  return 'https://wa.me/' + phone.replace(/^0/, '964')
}

function formatDateTime(dt: string) {
  const d = new Date(dt)
  const date = d.toLocaleDateString('en-CA')
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return { date, time, full: `${date} · ${time}` }
}

const WheelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
)

const HandIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.7-2.4L3.6 16.2a2 2 0 0 1-.1-2.5 1.9 1.9 0 0 1 2.8-.2L8 15" />
  </svg>
)

export default function MyRidesPage() {
  const [tab, setTab] = useState<'driving' | 'passenger'>('driving')
  const [myRides, setMyRides] = useState<any[]>([])
  const [joinedRides, setJoinedRides] = useState<any[]>([])
  const [requests, setRequests] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')

  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'both'
    setUserRole(role)
    if (role === 'passenger') setTab('passenger')

    const { data: driven } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', user.id)
      .order('departure_time', { ascending: false })
    setMyRides(driven || [])

    if (driven && driven.length > 0) {
      const rideIds = driven.map((r: any) => r.id)
      const { data: reqs } = await supabase
        .from('ride_requests')
        .select('*, passenger:profiles!passenger_id(full_name, phone)')
        .in('ride_id', rideIds)
      const grouped: Record<string, any[]> = {}
      ;(reqs || []).forEach((r: any) => {
        if (!grouped[r.ride_id]) grouped[r.ride_id] = []
        grouped[r.ride_id].push(r)
      })
      setRequests(grouped)
    }

    const { data: reqData } = await supabase
      .from('ride_requests')
      .select('*, ride:rides(*, driver:profiles!driver_id(full_name, phone))')
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false })
    setJoinedRides(reqData || [])

    setLoading(false)
  }

  async function handleCancelRide(rideId: string) {
    await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
    await supabase.from('ride_requests').update({ status: 'cancelled' }).eq('ride_id', rideId).in('status', ['pending', 'approved'])
    setMyRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'cancelled' } : r))
    setRequests(prev => {
      const updated = { ...prev }
      if (updated[rideId]) {
        updated[rideId] = updated[rideId].map(r =>
          r.status === 'pending' || r.status === 'approved' ? { ...r, status: 'cancelled' } : r
        )
      }
      return updated
    })
  }

  async function updateRequestStatus(requestId: string, status: string, rideId?: string) {
    await supabase.from('ride_requests').update({ status }).eq('id', requestId)

    if (status === 'approved' && rideId) {
      const ride = myRides.find(r => r.id === rideId)
      if (ride && ride.available_seats > 0) {
        const newSeats = ride.available_seats - 1
        await supabase.from('rides').update({ available_seats: newSeats }).eq('id', rideId)
        setMyRides(prev => prev.map(r => r.id === rideId ? { ...r, available_seats: newSeats } : r))
      }
    }

    if (status === 'declined' && rideId) {
      const rideReqs = requests[rideId] || []
      const req = rideReqs.find(r => r.id === requestId)
      if (req?.status === 'approved') {
        const ride = myRides.find(r => r.id === rideId)
        if (ride) {
          const newSeats = ride.available_seats + 1
          await supabase.from('rides').update({ available_seats: newSeats }).eq('id', rideId)
          setMyRides(prev => prev.map(r => r.id === rideId ? { ...r, available_seats: newSeats } : r))
        }
      }
    }

    setRequests(prev => {
      const updated = { ...prev }
      for (const rid in updated) {
        updated[rid] = updated[rid].map(r => r.id === requestId ? { ...r, status } : r)
      }
      return updated
    })
  }

  const showDriving = userRole !== 'passenger'
  const showPassenger = userRole !== 'driver'

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 0',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? '#df6530' : '#666',
    borderBottom: active ? '2px solid #df6530' : '2px solid transparent',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: active ? '#df6530' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#121212', maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e5e5e5', marginBottom: 16 }}>{ku.myRides}</h1>

      {showDriving && showPassenger && (
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a', marginBottom: 20 }}>
          <button onClick={() => setTab('driving')} style={tabStyle(tab === 'driving')}>
            <WheelIcon /> سەیارەی خۆم
          </button>
          <button onClick={() => setTab('passenger')} style={tabStyle(tab === 'passenger')}>
            <HandIcon /> نەفەرات
          </button>
        </div>
      )}

      {loading ? <div /> : tab === 'driving' && showDriving ? (
        myRides.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#555', padding: '3rem 0' }}>هێشتا ڕێت پۆست نەکردووە</p>
        ) : myRides.map(ride => {
          const rideRequests = requests[ride.id] || []
          const { date, time } = formatDateTime(ride.departure_time)
          const isCancelled = ride.status === 'cancelled'
          const isCompleted = ride.status === 'completed'

          return (
            <div key={ride.id} style={{ background: '#1e1e1e', borderRadius: 16, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', opacity: isCancelled ? 0.5 : 1 }}>
              <Link href={`/rides/${ride.id}`} style={{ textDecoration: 'none', display: 'block', padding: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e5e5' }}>
                    {CITIES[ride.from_city]} ← {CITIES[ride.to_city]}
                  </div>
                  <div style={{ textAlign: 'left', fontSize: 12, color: '#666' }}>{date} · {time}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: isCompleted ? '#1a2e1a' : isCancelled ? '#2e1a1a' : '#2e2a1a', color: isCompleted ? '#4ade80' : isCancelled ? '#f87171' : '#fbbf24', fontWeight: 600 }}>
                      {isCompleted ? 'تەواو بوو ✓' : isCancelled ? 'هەڵوەشاوە' : 'چالاک'}
                    </span>
                    <span style={{ fontSize: 11, color: '#666' }}>{ride.available_seats} جێ</span>
                  </div>
                  <div style={{ textAlign: 'left', fontSize: 11, color: '#555' }}>
                    {ride.price_type === 'coffee' ? ku.coffeeAndConvo : `${ride.price_iqd?.toLocaleString()} دینار`}
                  </div>
                </div>
              </Link>

              {rideRequests.length > 0 && (
                <div style={{ borderTop: '1px solid #2a2a2a', padding: '10px 18px 14px' }}>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontWeight: 600 }}>داواکان</div>
                  {rideRequests.map(req => (
                    <div key={req.id} style={{ background: '#252525', borderRadius: 10, padding: '10px 12px', marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#e5e5e5', fontWeight: 500 }}>{req.passenger?.full_name || 'سەرنشین'}</span>
                        {req.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => updateRequestStatus(req.id, 'approved', ride.id)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>قبوڵ</button>
                            <button onClick={() => updateRequestStatus(req.id, 'declined', ride.id)} style={{ background: '#2a2a2a', color: '#f87171', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>ڕەت</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: req.status === 'approved' ? '#1a2e1a' : '#2e1a1a', color: req.status === 'approved' ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                              {req.status === 'approved' ? 'قبوڵ کرا' : 'ڕەتکرایەوە'}
                            </span>
                            {req.status === 'approved' && req.passenger?.phone && (
                              <a href={formatWhatsApp(req.passenger.phone)} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 10, fontWeight: 600, textDecoration: 'none' }}>WhatsApp</a>
                            )}
                          </div>
                        )}
                      </div>
                      {(req.pickup || req.dropoff) && (
                        <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
                          {req.pickup && <span>سواربوون: {req.pickup}</span>}
                          {req.pickup && req.dropoff && <span> · </span>}
                          {req.dropoff && <span>دابەزین: {req.dropoff}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isCancelled && !isCompleted && (
                <div style={{ borderTop: '1px solid #2a2a2a', padding: '8px 18px' }}>
                  <button onClick={() => handleCancelRide(ride.id)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 12, cursor: 'pointer', padding: '4px 0' }}>هەڵوەشاندنەوە</button>
                </div>
              )}
            </div>
          )
        })
      ) : tab === 'passenger' && showPassenger ? (
        joinedRides.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#555', padding: '3rem 0' }}>هێشتا داواکاریت نەناردووە</p>
        ) : joinedRides.map(req => {
          const ride = req.ride
          if (!ride) return null
          const driver = ride.driver || {}
          const { date, time } = formatDateTime(ride.departure_time)
          const routeKey = `${ride.from_city}-${ride.to_city}`
          const routeInfo = ROUTE_INFO[routeKey]
          const isCompleted = ride.status === 'completed'

          const statusMap: Record<string, { text: string; bg: string; color: string }> = {
            pending: { text: 'لە چاوەڕواندایە', bg: '#2e2a1a', color: '#fbbf24' },
            approved: { text: isCompleted ? 'تەواو بوو ✓' : 'قبوڵ کرا', bg: '#1a2e1a', color: '#4ade80' },
            declined: { text: 'ڕەتکرایەوە', bg: '#2e1a1a', color: '#f87171' },
          }
          const st = statusMap[req.status] || statusMap.pending

          return (
            <Link key={req.id} href={`/rides/${ride.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#1e1e1e', borderRadius: 16, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontWeight: 600 }}>{st.text}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#e5e5e5' }}>{CITIES[ride.from_city]} ← {CITIES[ride.to_city]}</span>
                </div>
                <div style={{ borderTop: '1px solid #2a2a2a', padding: '12px 18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 4, fontSize: 12.5, color: '#777', lineHeight: 1.7 }}>
                    <div>– شۆفێر: {driver.full_name || '—'}</div>
                    <div>– {routeInfo ? `دووری: ${routeInfo.duration} · ${routeInfo.distance}` : ''}</div>
                    <div>– بەروار: {date}</div>
                    <div>– کات: {time}</div>
                  </div>
                </div>
                {req.status === 'approved' && !isCompleted && driver.phone && (
                  <div style={{ borderTop: '1px solid #2a2a2a', padding: '10px 18px' }}>
                    <a href={formatWhatsApp(driver.phone)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'block', background: '#25D366', color: 'white', borderRadius: 10, padding: '8px 0', fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                      پەیامێک بنێرە بۆ شۆفێر
                    </a>
                  </div>
                )}
              </div>
            </Link>
          )
        })
      ) : null}

      <BottomNav />
    </div>
  )
}
