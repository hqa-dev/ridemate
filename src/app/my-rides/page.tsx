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
  'erbil-suli': { duration: '2 کاتژمێر', distance: '160 کم' },
  'suli-erbil': { duration: '2 کاتژمێر', distance: '160 کم' },
  'erbil-duhok': { duration: '3 کاتژمێر', distance: '180 کم' },
  'duhok-erbil': { duration: '3 کاتژمێر', distance: '180 کم' },
  'suli-duhok': { duration: '5 کاتژمێر', distance: '340 کم' },
  'duhok-suli': { duration: '5 کاتژمێر', distance: '340 کم' },
}

const WA_SVG = <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style={{display:"inline",verticalAlign:"middle",marginRight:"0.4rem"}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>

const WheelIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginRight:8}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 14v8"/><path d="M6 6l3.5 5"/><path d="M18 6l-3.5 5"/></svg>

const HandIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginRight:8}}><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>

function formatDateTime(dt: string) {
  const d = new Date(dt)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 || 12
  return { date: `${year}/${month}/${day}`, time: `${h12}:${minutes} ${ampm}`, full: `${year}/${month}/${day} · ${h12}:${minutes} ${ampm}` }
}

export default function MyRidesPage() {
  const [tab, setTab] = useState<'driving' | 'joined'>('driving')
  const [myRides, setMyRides] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [userRole, setUserRole] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (userRole === 'passenger') setTab('joined') }, [userRole])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: rides } = await supabase.from('rides').select('*').eq('driver_id', user.id).order('departure_time', { ascending: false })
    setMyRides(rides || [])

    if (rides && rides.length > 0) {
      const rideIds = rides.map(r => r.id)
      const { data: reqs } = await supabase
        .from('ride_requests')
        .select('*, passenger:profiles!passenger_id(full_name, phone, avatar_url), ride:rides!ride_id(from_city, to_city, departure_time, status)')
        .in('ride_id', rideIds)
        .order('created_at', { ascending: false })
      setRequests(reqs || [])
    }

    const { data: myReqs } = await supabase
      .from('ride_requests')
      .select('*, ride:rides!ride_id(*, driver:profiles!driver_id(full_name, phone, avatar_url))')
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false })
    setMyRequests(myReqs || [])

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) setUserRole(profile.role)
    setLoading(false)
  }

  async function handleCancelRide(rideId: string) {
    if (!confirm('دڵنیایت دەتەوێ ئەم ڕێیە بسڕیتەوە؟')) return
    await supabase.from('rides').delete().eq('id', rideId)
    setMyRides(prev => prev.filter(r => r.id !== rideId))
  }

  async function updateRequestStatus(requestId: string, status: string) {
    const { error } = await supabase.from('ride_requests').update({ status }).eq('id', requestId)
    if (!error) {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r))
      if (status === 'approved') {
        const req = requests.find(r => r.id === requestId)
        if (req) {
          const { data: freshRide } = await supabase.from('rides').select('available_seats').eq('id', req.ride_id).single()
          if (freshRide && freshRide.available_seats > 0) {
            const newSeats = freshRide.available_seats - 1
            await supabase.from('rides').update({ available_seats: newSeats }).eq('id', req.ride_id)
            setMyRides(prev => prev.map(r => r.id === req.ride_id ? { ...r, available_seats: newSeats } : r))
          }
        }
      }
    }
  }

  const cardBase: React.CSSProperties = { background: '#fff', borderRadius: 16, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.03), 0 0 0 0.5px rgba(0,0,0,0.03)', textDecoration: 'none', display: 'block', color: 'inherit', cursor: 'pointer' }
  const pillStyle: React.CSSProperties = { fontSize: 10.5, padding: '4px 11px', borderRadius: 20, background: '#f5f5f4', color: '#57534e' }
  const statusPill = (bg: string, color: string): React.CSSProperties => ({ fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600, background: bg, color })
  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'auto 1fr', gridTemplateRows: 'auto auto', rowGap: 14, direction: 'rtl' }
  const routeStyle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginRight: 19 }
  const dtStyle: React.CSSProperties = { fontSize: 12.5, color: '#a8a29e', fontWeight: 500, whiteSpace: 'nowrap', marginTop: 5 }
  const deleteStyle: React.CSSProperties = { fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }

  const showBothTabs = userRole === 'both' || userRole === ''
  const showDriving = userRole !== 'passenger'
  const showJoined = userRole !== 'driver' || showBothTabs

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: 480, margin: '0 auto', padding: '16px 20px 96px', overflowX: 'hidden' }}>
      <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', padding: '18px 0 16px', color: '#1a1a1a' }}>{ku.myRidesTitle}</div>

      {(showDriving && showJoined) && (
        <div style={{ display: 'flex', background: '#f5f5f4', borderRadius: 12, padding: 3, marginBottom: 20 }}>
          <button onClick={() => setTab('driving')} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: tab === 'driving' ? 600 : 400, background: tab === 'driving' ? 'white' : 'transparent', color: tab === 'driving' ? '#1a1a1a' : '#93908b', boxShadow: tab === 'driving' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s' }}>
            سەیارەی خۆم<WheelIcon />
          </button>
          <button onClick={() => setTab('joined')} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: tab === 'joined' ? 600 : 400, background: tab === 'joined' ? 'white' : 'transparent', color: tab === 'joined' ? '#1a1a1a' : '#93908b', boxShadow: tab === 'joined' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s' }}>
            نەفەرات<HandIcon />
          </button>
        </div>
      )}

      {loading ? <div /> : tab === 'driving' ? (
        myRides.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#a8a29e', padding: '48px 0', fontSize: 13 }}>هێشتا ڕێیەکت پۆست نەکردووە</p>
        ) : myRides.map(ride => {
          const dt = formatDateTime(ride.departure_time)
          const rideRequests = requests.filter(r => r.ride_id === ride.id)
          return (
            <div key={ride.id} style={{ ...cardBase, padding: '18px 18px 16px', cursor: 'default' }}>
              <Link href={`/rides/${ride.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={gridStyle}>
                  <div style={{ gridColumn: 1, gridRow: 1, textAlign: 'right' }}>
                    {ride.status === 'completed' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={routeStyle}>{CITIES[ride.from_city]} ← {CITIES[ride.to_city]}</span>
                        <span style={statusPill('#f0fdf4', '#16a34a')}>تەواو بوو ✓</span>
                      </div>
                    ) : (
                      <span style={routeStyle}>{CITIES[ride.from_city]} ← {CITIES[ride.to_city]}</span>
                    )}
                  </div>
                  <div style={{ gridColumn: 2, gridRow: 1, textAlign: 'left', display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                    <span style={dtStyle}>{dt.full}</span>
                  </div>
                  <div style={{ gridColumn: 1, gridRow: 2, display: 'flex', gap: 6 }}>
                    <span style={pillStyle}>{ride.available_seats} {ku.seatsLeft}</span>
                    {ride.price_type === 'coffee'
                      ? <span style={pillStyle}>{ku.coffeeAndConvo}</span>
                      : <span style={pillStyle}>{ride.price_iqd?.toLocaleString()} دینار</span>
                    }
                  </div>
                  <div style={{ gridColumn: 2, gridRow: 2, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {ride.status !== 'completed' && (
                      <button onClick={(e) => { e.preventDefault(); handleCancelRide(ride.id) }} style={deleteStyle}>سڕینەوە</button>
                    )}
                  </div>
                </div>
              </Link>

              {rideRequests.length > 0 && (
                <div style={{ borderTop: '1px solid #f5f5f4', marginTop: 14, paddingTop: 12 }}>
                  <div style={{ fontSize: 10, color: '#b8b0a8', marginBottom: 10, fontWeight: 500 }}>داواکان</div>
                  {rideRequests.map(req => {
                    const passenger = req.passenger || {}
                    return (
                      <div key={req.id} style={{ background: '#fafaf9', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                        {req.status === 'pending' ? (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>{passenger.full_name || 'سەرنشین'}</div>
                            {req.pickup && <div style={{ fontSize: 11.5, color: '#78716c', marginBottom: 2 }}><span style={{ color: '#b8b0a8' }}>سواربوون: </span>{req.pickup}</div>}
                            {req.dropoff && <div style={{ fontSize: 11.5, color: '#78716c', marginBottom: 8 }}><span style={{ color: '#b8b0a8' }}>دابەزین: </span>{req.dropoff}</div>}
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => updateRequestStatus(req.id, 'approved')} style={{ flex: 1, background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7', borderRadius: 12, padding: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>دەمەوێ</button>
                              <button onClick={() => updateRequestStatus(req.id, 'declined')} style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: 12, padding: 8, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>نامەوێ</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={statusPill(req.status === 'approved' ? '#f0fdf4' : '#fef2f2', req.status === 'approved' ? '#16a34a' : '#dc2626')}>
                                {req.status === 'approved' ? ku.approved : ku.declined}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{passenger.full_name || 'سەرنشین'}</span>
                            </div>
                            {req.status === 'approved' && passenger.phone && (
                              <>
                                <a href={'https://wa.me/' + passenger.phone.replace(/^0/, '964')} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#25D366', color: 'white', borderRadius: 12, padding: 11, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', marginTop: 10 }}>
                                  پەیامێک بنێرە {WA_SVG}
                                </a>
                                <a href={'tel:' + passenger.phone} dir="ltr" style={{ display: 'block', textAlign: 'center', color: '#57534e', fontSize: 12, marginTop: 8, textDecoration: 'none' }}>{passenger.phone}</a>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })
      ) : null}

      {tab === 'joined' && (
        !loading && myRequests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#a8a29e', padding: '48px 0', fontSize: 13 }}>هیچ داواکارییەکت نەکردووە</p>
        ) : myRequests.map(req => {
          const ride = req.ride || {}
          const driver = ride.driver || {}
          const isCompleted = ride.status === 'completed'
          const dt = formatDateTime(ride.departure_time || '')
          const routeKey = `${ride.from_city}-${ride.to_city}`
          const info = ROUTE_INFO[routeKey]
          const statusColors: Record<string, { bg: string; color: string; text: string }> = {
            pending: { bg: '#fffbeb', color: '#d97706', text: 'لە چاوەڕواندایە' },
            approved: { bg: '#f0fdf4', color: '#16a34a', text: isCompleted ? 'تەواو بوو ✓' : 'قبوڵ کرا' },
            declined: { bg: '#fef2f2', color: '#dc2626', text: 'ڕەتکرایەوە' },
          }
          const s = statusColors[req.status] || statusColors.pending
          return (
            <Link key={req.id} href={`/rides/${req.ride_id}`} style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '18px 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={routeStyle}>{CITIES[ride.from_city]} ← {CITIES[ride.to_city]}</span>
                <span style={statusPill(s.bg, s.color)}>{s.text}</span>
              </div>
              {/* Details */}
              <div style={{ borderTop: '1px solid #f5f5f4', padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8, columnGap: 16, direction: 'rtl', fontSize: 12.5, color: '#78716c', lineHeight: 1.7 }}>
                <div>– شۆفێر: {driver.full_name || 'نەزانراو'}</div>
                <div>– دووری: {info ? `${info.duration} · ${info.distance}` : '—'}</div>
                <div>– بەروار: {dt.date}</div>
                <div>– تێبینی: {ride.notes || '—'}</div>
                <div>– کات: {dt.time}</div>
                <div></div>
              </div>
              {/* WhatsApp */}
              {req.status === 'approved' && !isCompleted && driver.phone && (
                <div style={{ padding: '4px 18px 16px' }}>
                  <a href={'https://wa.me/' + driver.phone.replace(/^0/, '964')} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'block', background: '#25D366', color: 'white', borderRadius: 12, padding: 11, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                    پەیامێک بنێرە {WA_SVG}
                  </a>
                  <a href={'tel:' + driver.phone} dir="ltr" onClick={e => e.stopPropagation()} style={{ display: 'block', textAlign: 'center', color: '#57534e', fontSize: 12, marginTop: 8, textDecoration: 'none' }}>{driver.phone}</a>
                </div>
              )}
              {/* Rate prompt */}
              {isCompleted && req.status === 'approved' && (
                <div style={{ padding: '0 18px 16px' }}>
                  <div style={{ textAlign: 'center', background: '#fffbf5', border: '1px solid #fde8d0', borderRadius: 12, padding: 10, fontSize: 12, color: '#df6530', fontWeight: 600 }}>⭐ هەڵسەنگاندن بکە</div>
                </div>
              )}
            </Link>
          )
        })
      )}
      <BottomNav />
    </div>
  )
}
