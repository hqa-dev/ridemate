'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { CITIES, toKurdishNum, formatKurdishDate } from '@/lib/utils'
import { T } from '@/lib/theme'

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const PersonIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" />
  </svg>
)

function getTypeIcon(type: string) {
  const colors: Record<string, string> = {
    request_received: T.orange,
    request_approved: T.green,
    request_declined: '#f87171',
    passenger_cancelled: '#f87171',
    ride_completed: T.green,
    ride_cancelled: '#f87171',
  }
  const c = colors[type] || T.textMid
  switch (type) {
    case 'request_received':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      )
    case 'request_approved':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )
    case 'request_declined':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      )
    case 'passenger_cancelled':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      )
    case 'ride_completed':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill={c} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    case 'ride_cancelled':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      )
    default: return null
  }
}

interface Notification {
  id: string
  type: string
  requestId: string
  rideId: string
  personName: string
  personAvatar: string | null
  personId: string
  route: string
  date: string
  pickup: string | null
  dropoff: string | null
  unseen: boolean
  availableSeats?: number
}

export default function NotificationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { loadNotifications() }, [])

  async function loadNotifications() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const notifs: Notification[] = []

    // 1. As DRIVER: fetch requests on my rides
    const { data: myRides } = await supabase
      .from('rides')
      .select('id, from_city, to_city, departure_time, available_seats, status')
      .eq('driver_id', user.id)

    if (myRides && myRides.length > 0) {
      const rideIds = myRides.map(r => r.id)
      const { data: driverRequests } = await supabase
        .from('ride_requests')
        .select('id, status, pickup, dropoff, seen_by_driver, ride_id, passenger_id, passenger:profiles!passenger_id(full_name, avatar_url)')
        .in('ride_id', rideIds)
        .in('status', ['pending', 'cancelled'])
        .order('created_at', { ascending: false })

      if (driverRequests) {
        for (const req of driverRequests) {
          const ride = myRides.find(r => r.id === req.ride_id)
          if (!ride) continue
          const passenger = req.passenger as any || {}

          if (req.status === 'pending') {
            notifs.push({
              id: `dr-${req.id}`,
              type: 'request_received',
              requestId: req.id,
              rideId: ride.id,
              personName: passenger.full_name || 'سەرنشین',
              personAvatar: passenger.avatar_url || null,
              personId: req.passenger_id,
              route: `${CITIES[ride.from_city]} ← ${CITIES[ride.to_city]}`,
              date: formatKurdishDate(ride.departure_time),
              pickup: req.pickup || null,
              dropoff: req.dropoff || null,
              unseen: !req.seen_by_driver,
              availableSeats: ride.available_seats,
            })
          } else if (req.status === 'cancelled') {
            notifs.push({
              id: `dr-${req.id}`,
              type: 'passenger_cancelled',
              requestId: req.id,
              rideId: ride.id,
              personName: passenger.full_name || 'سەرنشین',
              personAvatar: passenger.avatar_url || null,
              personId: req.passenger_id,
              route: `${CITIES[ride.from_city]} ← ${CITIES[ride.to_city]}`,
              date: formatKurdishDate(ride.departure_time),
              pickup: req.pickup || null,
              dropoff: req.dropoff || null,
              unseen: !req.seen_by_driver,
            })
          }
        }
      }
    }

    // 2. As PASSENGER: fetch responses to my requests
    const { data: passengerRequests } = await supabase
      .from('ride_requests')
      .select('id, status, pickup, dropoff, seen_by_passenger, ride_id, ride:rides(id, from_city, to_city, departure_time, status, driver_id, driver:profiles!driver_id(full_name, avatar_url))')
      .eq('passenger_id', user.id)
      .in('status', ['approved', 'declined', 'cancelled'])
      .order('created_at', { ascending: false })

    if (passengerRequests) {
      for (const req of passengerRequests) {
        const ride = req.ride as any
        if (!ride) continue
        const driver = ride.driver || {}

        let type = ''
        if (req.status === 'approved' && ride.status === 'completed') {
          type = 'ride_completed'
        } else if (req.status === 'approved') {
          type = 'request_approved'
        } else if (req.status === 'declined') {
          type = 'request_declined'
        } else if (req.status === 'cancelled' && ride.status === 'cancelled') {
          type = 'ride_cancelled'
        }

        if (!type) continue

        notifs.push({
          id: `pr-${req.id}`,
          type,
          requestId: req.id,
          rideId: ride.id,
          personName: driver.full_name || 'شۆفێر',
          personAvatar: driver.avatar_url || null,
          personId: ride.driver_id,
          route: `${CITIES[ride.from_city]} ← ${CITIES[ride.to_city]}`,
          date: formatKurdishDate(ride.departure_time),
          pickup: req.pickup || null,
          dropoff: req.dropoff || null,
          unseen: !req.seen_by_passenger,
        })
      }
    }

    setNotifications(notifs)
    setLoading(false)

    // Mark driver notifications as seen
    if (myRides && myRides.length > 0) {
      const rideIds = myRides.map(r => r.id)
      await supabase
        .from('ride_requests')
        .update({ seen_by_driver: true })
        .in('ride_id', rideIds)
        .eq('seen_by_driver', false)
        .in('status', ['pending', 'cancelled'])
    }

    // Mark passenger notifications as seen
    await supabase
      .from('ride_requests')
      .update({ seen_by_passenger: true })
      .eq('passenger_id', user.id)
      .eq('seen_by_passenger', false)
      .in('status', ['approved', 'declined', 'cancelled'])
  }

  async function handleApprove(n: Notification) {
    if (n.availableSeats !== undefined && n.availableSeats <= 0) {
      setError('جێگا بەردەست نییە')
      return
    }
    setProcessing(n.id)
    setError('')
    const { error: reqErr } = await supabase
      .from('ride_requests')
      .update({ status: 'approved', seen_by_passenger: false })
      .eq('id', n.requestId)
    if (reqErr) { setError('هەڵەیەک ڕوویدا'); setProcessing(null); return }
    await supabase.rpc('decrement_seats', { ride_id_input: n.rideId })
    setNotifications(prev => prev.filter(x => x.id !== n.id))
    setProcessing(null)
  }

  async function handleDecline(n: Notification) {
    setProcessing(n.id)
    setError('')
    const { error: reqErr } = await supabase
      .from('ride_requests')
      .update({ status: 'declined', seen_by_passenger: false })
      .eq('id', n.requestId)
    if (reqErr) { setError('هەڵەیەک ڕوویدا'); setProcessing(null); return }
    setNotifications(prev => prev.filter(x => x.id !== n.id))
    setProcessing(null)
  }

  const unseen = notifications.filter(n => n.unseen)
  const seen = notifications.filter(n => !n.unseen)

  return (
    <div style={{
      direction: 'rtl', minHeight: '100vh', background: T.bg,
      fontFamily: "'Noto Sans Arabic', sans-serif", maxWidth: 480, margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 20px 20px', gap: 12 }}>
        <div onClick={() => router.back()} style={{ cursor: 'pointer', padding: 4 }}><BackArrow /></div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>ئاگاداری</h1>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', padding: '0 16px 8px' }}>{error}</p>}

      {loading ? <div /> : (
        <>
          {/* New / unseen */}
          {unseen.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '0 20px 8px' }}>نوێ</div>
              <div style={{
                background: T.card, margin: '0 16px 16px', borderRadius: 12, padding: '0 16px',
                border: '1px solid rgba(223,101,48,0.15)',
              }}>
                {unseen.map((n, i) => (
                  <NotifRow
                    key={n.id} n={n} isLast={i === unseen.length - 1}
                    onApprove={handleApprove} onDecline={handleDecline}
                    processing={processing} router={router}
                  />
                ))}
              </div>
            </>
          )}

          {/* Earlier / seen */}
          {seen.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '0 20px 8px' }}>پێشوو</div>
              <div style={{
                background: T.card, margin: '0 16px', borderRadius: 12, padding: '0 16px',
                border: `1px solid ${T.border}`,
              }}>
                {seen.map((n, i) => (
                  <NotifRow
                    key={n.id} n={n} isLast={i === seen.length - 1}
                    onApprove={handleApprove} onDecline={handleDecline}
                    processing={processing} router={router}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {unseen.length === 0 && seen.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p style={{ fontSize: 13, color: T.textDim }}>هیچ ئاگادارییەک نییە</p>
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  )
}

function NotifRow({
  n, isLast, onApprove, onDecline, processing, router,
}: {
  n: Notification
  isLast: boolean
  onApprove: (n: Notification) => void
  onDecline: (n: Notification) => void
  processing: string | null
  router: any
}) {
  const isActionable = n.type === 'request_received'
  const isProcessing = processing === n.id

  const statusText: Record<string, { text: string; color: string }> = {
    request_received: { text: 'دەیەوێ سواربێ', color: T.orange },
    request_approved: { text: 'قبوڵ کرا', color: T.green },
    request_declined: { text: 'ڕەت کرایەوە', color: '#f87171' },
    passenger_cancelled: { text: 'پاشگەزبووەوە', color: '#f87171' },
    ride_completed: { text: 'هەڵیسەنگێنە', color: T.green },
    ride_cancelled: { text: 'هەڵوەشێنرایەوە', color: '#f87171' },
  }
  const st = statusText[n.type] || { text: '', color: T.textDim }

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
        {/* TAP ZONE 1: Avatar + name → profile (future) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, cursor: 'pointer' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: T.cardInner,
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {n.personAvatar ? (
                <img src={n.personAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              ) : (
                <PersonIcon size={18} />
              )}
            </div>
            <div style={{
              position: 'absolute', bottom: -3, left: -3,
              width: 16, height: 16, borderRadius: '50%',
              background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${T.card}`,
            }}>
              {getTypeIcon(n.type)}
            </div>
          </div>

          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

          <div>
            <div style={{ fontSize: 13, fontWeight: n.unseen ? 700 : 500, color: n.unseen ? T.text : 'rgba(255,255,255,0.5)' }}>{n.personName}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{n.route} · {n.date}</div>
          </div>
        </div>

        {/* TAP ZONE 2: Status + pickup → ride detail */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: isActionable ? 'default' : 'pointer', textAlign: 'left' }}
          onClick={() => { if (!isActionable) router.push(`/rides/${n.rideId}`) }}
        >
          <div style={{ fontSize: 11, color: st.color, fontWeight: 500 }}>{st.text}</div>
          {(n.pickup || n.dropoff) && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              {n.pickup || '—'}{n.dropoff ? ` ← ${n.dropoff}` : ''}
            </div>
          )}
        </div>

        {/* Actions or arrow */}
        {isActionable ? (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: isProcessing ? 0.4 : 1 }}>
            <button
              onClick={() => onApprove(n)}
              disabled={isProcessing}
              style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: 'rgba(74,222,128,0.1)', cursor: isProcessing ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button
              onClick={() => onDecline(n)}
              disabled={isProcessing}
              style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: 'rgba(248,113,113,0.1)', cursor: isProcessing ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: 'scaleX(-1)', flexShrink: 0, cursor: 'pointer' }}
            onClick={() => router.push(`/rides/${n.rideId}`)}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </div>
  )
}
