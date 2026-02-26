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
  const [tab, setTab] = useState<'upcoming' | 'requests' | 'joined'>('upcoming')
  const [myRides, setMyRides] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [userRole, setUserRole] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (userRole === 'passenger') setTab('joined')
  }, [userRole])

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

    // Load rides I requested to join (as passenger)
    const { data: myReqs } = await supabase
      .from('ride_requests')
      .select('*, ride:rides!ride_id(*, driver:profiles!driver_id(full_name, phone, avatar_url))')
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false })

    setMyRequests(myReqs || [])

    // Get user role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) setUserRole(profile.role)

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
      {(() => {
        const tabs: ('upcoming' | 'requests' | 'joined')[] =
          userRole === 'passenger' ? ['joined'] :
          userRole === 'driver' ? ['upcoming', 'requests'] :
          ['upcoming', 'requests', 'joined']
        return tabs.length > 1 ? (
          <div style={{ display: 'flex', background: '#f5f5f4', borderRadius: '0.75rem', padding: '0.25rem', marginBottom: '1.25rem' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer', fontWeight: tab === t ? 600 : 400, background: tab === t ? 'white' : 'transparent', color: tab === t ? '#1c1917' : '#78716c', fontSize: '0.85rem' }}>
                {t === 'upcoming' ? ku.upcoming : t === 'requests' ? ku.requests : 'داواکاریەکانم'}
                {t === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (
                  <span style={{ background: '#df6530', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '999px', marginRight: '0.4rem' }}>
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : null
      })()}

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
      ) : tab === 'requests' ? (
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
      ) : null}
      {tab === 'joined' && (
        !loading && myRequests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#a8a29e', padding: '3rem 0' }}>هێشتا داواکارییەکت نەکردووە</p>
        ) : myRequests.map(req => {
          const ride = req.ride || {}
          const driver = ride.driver || {}
          const statusColors: Record<string, { bg: string; color: string; text: string }> = {
            pending: { bg: '#fffbeb', color: '#d97706', text: 'لە چاوەڕواندایە' },
            approved: { bg: '#f0fdf4', color: '#16a34a', text: 'قبوڵ کرا' },
            declined: { bg: '#fef2f2', color: '#dc2626', text: 'ڕەتکرایەوە' },
          }
          const s = statusColors[req.status] || statusColors.pending
          return (
            <div key={req.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{CITIES[ride.from_city]} ← {CITIES[ride.to_city]}</span>
                <span style={{ background: s.bg, color: s.color, fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>{s.text}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#78716c', marginBottom: '0.5rem' }} dir="ltr">
                {new Date(ride.departure_time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#57534e' }}>شۆفێر: {driver.full_name || 'نەزانراو'}</div>
              {req.status === 'approved' && driver.phone && (
                <a href={'https://wa.me/' + driver.phone.replace(/^0/, '964')} target="_blank" style={{ display: 'block', background: '#25D366', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.65rem', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center', marginTop: '0.75rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style={{display:"inline",verticalAlign:"middle",marginLeft:"0.4rem"}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> پەیامێک بنێرە
                </a>
              )}
            </div>
          )
        })
      )}
      <BottomNav />
    </div>
  )
}
