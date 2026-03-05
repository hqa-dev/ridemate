'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { CITIES, toKurdishNum, formatKurdishDate } from '@/lib/utils'
import { T } from '@/lib/theme'

const AVATAR_COLORS = ['#E8470A','#2A7A1A','#4A6FA5','#8B4513','#6B3FA0']
function nameColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function getTypeIcon(type: string) {
  const colors: Record<string, string> = {
    request_received: T.orange,
    request_approved: T.green,
    request_declined: T.red,
    passenger_cancelled: T.red,
    ride_completed: T.green,
    ride_cancelled: T.red,
    ride_updated: T.amber,
  }
  const c = colors[type] || T.textMid
  switch (type) {
    case 'request_received':
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
    case 'request_approved':
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    case 'request_declined':
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    case 'passenger_cancelled':
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
    case 'ride_completed':
      return <svg width="12" height="12" viewBox="0 0 24 24" fill={c} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    case 'ride_cancelled':
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
    case 'ride_updated':
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    default: return null
  }
}

const statusText: Record<string, { text: string; color: string }> = {
  request_received: { text: 'دەیەوێ بێ', color: T.orange },
  request_approved: { text: 'قبوڵ کرا', color: T.green },
  request_declined: { text: 'ڕەت کرایەوە', color: T.red },
  passenger_cancelled: { text: 'پاشگەزبووەوە', color: T.red },
  ride_completed: { text: 'هەڵیسەنگێنە', color: T.green },
  ride_cancelled: { text: 'هەڵوەشێنرایەوە', color: T.red },
  ride_updated: { text: 'گۆڕانکاری', color: T.amber },
}

interface NotifItem {
  id: string
  type: string
  rideId: string
  requestId: string | null
  personName: string
  personAvatar: string | null
  route: string
  date: string
  pickup: string | null
  dropoff: string | null
  seen: boolean
  metadata: any
  requestStatus: string | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [unseenNotifications, setUnseenNotifications] = useState<NotifItem[]>([])
  const [seenNotifications, setSeenNotifications] = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { loadNotifications() }, [])

  async function loadNotifications() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: notifs, error: notifErr } = await supabase
      .from('notifications')
      .select('id, type, ride_id, ride_request_id, from_user_id, metadata, seen, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (notifErr) { console.error('Notification fetch error:', notifErr); setLoading(false); return }

    if (notifs && notifs.length > 0) {
      // Fetch ride details
      const rideIds = [...new Set(notifs.map(n => n.ride_id).filter(Boolean))]
      const { data: rides } = await supabase.from('rides').select('id, from_city, to_city, departure_time').in('id', rideIds)
      const rideMap = Object.fromEntries((rides || []).map(r => [r.id, r]))

      // Fetch profile details for from_user
      const userIds = [...new Set(notifs.map(n => n.from_user_id).filter(Boolean))]
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

      // Fetch ride_request statuses for actionable notifications
      const requestIds = [...new Set(notifs.map(n => n.ride_request_id).filter(Boolean))]
      const { data: requests } = requestIds.length > 0
        ? await supabase.from('ride_requests').select('id, status').in('id', requestIds)
        : { data: [] }
      const requestMap = Object.fromEntries((requests || []).map(r => [r.id, r.status]))

      const items: NotifItem[] = notifs.map((n: any) => {
        const fromUser = profileMap[n.from_user_id] || {}
        const ride = rideMap[n.ride_id] || {}
        const pickup = n.metadata?.pickup || null
        const dropoff = n.metadata?.dropoff || null
        return {
          id: n.id,
          type: n.type,
          rideId: n.ride_id,
          requestId: n.ride_request_id,
          personName: fromUser.full_name || '—',
          personAvatar: fromUser.avatar_url || null,
          route: ride.from_city && ride.to_city && CITIES[ride.from_city] && CITIES[ride.to_city] ? `${CITIES[ride.from_city]} ← ${CITIES[ride.to_city]}` : '',
          date: ride.departure_time ? formatKurdishDate(ride.departure_time) : '',
          pickup,
          dropoff,
          seen: n.seen,
          metadata: n.metadata || {},
          requestStatus: n.ride_request_id ? (requestMap[n.ride_request_id] || null) : null,
        }
      })
      setUnseenNotifications(items.filter(i => !i.seen))
      setSeenNotifications(items.filter(i => i.seen))
    }
    setLoading(false)

    // Mark all as seen in DB (after state is set with original seen values)
    await supabase
      .from('notifications')
      .update({ seen: true })
      .eq('user_id', user.id)
      .eq('seen', false)
  }

  async function handleApprove(n: NotifItem) {
    if (!n.requestId) return
    setProcessing(n.id)
    setError('')

    // Check seats
    const { data: ride } = await supabase.from('rides').select('available_seats, driver_id').eq('id', n.rideId).single()
    if (!ride || ride.available_seats <= 0) { setError('جێگا بەردەست نییە'); setProcessing(null); return }

    // Approve the request
    const { error: reqErr } = await supabase
      .from('ride_requests')
      .update({ status: 'approved' })
      .eq('id', n.requestId)
    if (reqErr) { setError('هەڵەیەک ڕوویدا'); setProcessing(null); return }

    // Decrement seats
    await supabase.rpc('decrement_seats', { ride_id_input: n.rideId })

    // Get passenger_id from request
    const { data: req } = await supabase.from('ride_requests').select('passenger_id').eq('id', n.requestId).single()

    // Send notification to passenger
    if (req) {
      await supabase.from('notifications').insert({
        user_id: req.passenger_id,
        type: 'request_approved',
        ride_id: n.rideId,
        from_user_id: ride.driver_id,
        ride_request_id: n.requestId,
      })
    }

    // Remove from list
    setUnseenNotifications(prev => prev.filter(x => x.id !== n.id))
    setProcessing(null)
  }

  async function handleDecline(n: NotifItem) {
    if (!n.requestId) return
    setProcessing(n.id)
    setError('')

    const { error: reqErr } = await supabase
      .from('ride_requests')
      .update({ status: 'declined' })
      .eq('id', n.requestId)
    if (reqErr) { setError('هەڵەیەک ڕوویدا'); setProcessing(null); return }

    // Get passenger_id and driver_id
    const { data: req } = await supabase.from('ride_requests').select('passenger_id').eq('id', n.requestId).single()
    const { data: ride } = await supabase.from('rides').select('driver_id').eq('id', n.rideId).single()

    if (req && ride) {
      await supabase.from('notifications').insert({
        user_id: req.passenger_id,
        type: 'request_declined',
        ride_id: n.rideId,
        from_user_id: ride.driver_id,
        ride_request_id: n.requestId,
      })
    }

    setUnseenNotifications(prev => prev.filter(x => x.id !== n.id))
    setProcessing(null)
  }

  return (
    <div style={{
      direction: 'rtl', minHeight: '100vh', background: T.bg,
      fontFamily: "'Noto Sans Arabic', sans-serif", maxWidth: 480, margin: '0 auto',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 20px 20px', gap: 12 }}>
        <div style={{ width:32, height:32, border:`2px solid ${T.text}`, borderRadius:7, background:T.card, boxShadow:`2px 2px 0 ${T.text}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }} onClick={() => router.back()}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>ئاگاداری</h1>
      </div>

      {error && <p style={{ color: T.red, fontSize: 12, textAlign: 'center', padding: '0 16px 8px' }}>{error}</p>}

      {loading ? <div /> : (
        <>
          {unseenNotifications.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.iconDim, padding: '0 20px 8px' }}>نوێ</div>
              <div style={{ background: T.card, margin: '0 16px 16px', borderRadius: 12, padding: '0 16px', border: `2px solid ${T.text}`, boxShadow: `3px 3px 0 ${T.text}` }}>
                {unseenNotifications.map((n, i) => (
                  <NotifRow key={n.id} n={n} isLast={i === unseenNotifications.length - 1} onApprove={handleApprove} onDecline={handleDecline} processing={processing} router={router} />
                ))}
              </div>
            </>
          )}

          {seenNotifications.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.iconDim, padding: '0 20px 8px' }}>پێشوو</div>
              <div style={{ background: T.card, margin: '0 16px', borderRadius: 12, padding: '0 16px', border: `2px solid ${T.text}`, boxShadow: `3px 3px 0 ${T.text}` }}>
                {seenNotifications.map((n, i) => (
                  <NotifRow key={n.id} n={n} isLast={i === seenNotifications.length - 1} onApprove={handleApprove} onDecline={handleDecline} processing={processing} router={router} />
                ))}
              </div>
            </>
          )}

          {unseenNotifications.length === 0 && seenNotifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.iconDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p style={{ fontSize: 13, color: T.textDim }}>هیچ ئاگادارییەک نییە</p>
            </div>
          )}
        </>
      )}

      <BottomNav active="home" />
    </div>
  )
}

function NotifRow({ n, isLast, onApprove, onDecline, processing, router }: {
  n: NotifItem; isLast: boolean; onApprove: (n: NotifItem) => void; onDecline: (n: NotifItem) => void; processing: string | null; router: any
}) {
  const isActionable = n.type === 'request_received' && n.requestStatus === 'pending'
  const isProcessing = processing === n.id
  const st = statusText[n.type] || { text: '', color: T.textDim }

  return (
    <div style={{ borderBottom: isLast ? 'none' : `1.5px dashed ${T.textDim}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, cursor: 'pointer' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${T.text}`, background: nameColor(n.personName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>
              {n.personName.charAt(0)}
            </div>
            <div style={{ position: 'absolute', bottom: -3, left: -3, width: 16, height: 16, borderRadius: '50%', background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${T.card}` }}>
              {getTypeIcon(n.type)}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: T.borderDim, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: !n.seen ? 700 : 500, color: !n.seen ? T.text : T.textDim }}>{n.personName}</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{[n.route, n.date].filter(Boolean).join(' · ')}</div>
          </div>
        </div>

        {/* Status + pickup */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: isActionable ? 'default' : 'pointer', textAlign: 'left' }}
          onClick={() => { if (!isActionable) router.push(`/rides/${n.rideId}`) }}
        >
          {(n.type === 'request_received' || n.type === 'passenger_cancelled') ? (
            <span style={{ fontSize: 10, color: T.textMid, fontWeight: 600, border: `1.5px solid ${T.textDim}`, borderRadius: 5, padding: '2px 8px', background: T.cardInner, display: 'inline-block' }}>{st.text}</span>
          ) : (
            <span style={{ fontSize: 10, color: st.color, fontWeight: 700, border: `2px solid currentColor`, borderRadius: 6, padding: '2px 7px', boxShadow: `2px 2px 0 ${T.text}`, display: 'inline-block' }}>{st.text}</span>
          )}
          {(n.pickup && n.pickup.length > 2 && n.dropoff && n.dropoff.length > 2) && (
            <div style={{ fontSize: 10, color: T.iconDim, marginTop: 2 }}>
              {n.pickup} ← {n.dropoff}
            </div>
          )}
          {n.type === 'ride_updated' && n.metadata?.changes && (
            <div style={{ fontSize: 10, color: T.iconDim, marginTop: 2 }}>
              {(n.metadata.changes as string[]).join(' · ')}
            </div>
          )}
        </div>

        {/* Actions or arrow */}
        {isActionable ? (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: isProcessing ? 0.4 : 1 }}>
            <button onClick={() => onApprove(n)} disabled={isProcessing} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(74,222,128,0.1)', cursor: isProcessing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button onClick={() => onDecline(n)} disabled={isProcessing} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(248,113,113,0.1)', cursor: isProcessing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.iconDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => router.push(`/rides/${n.rideId}`)}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </div>
  )
}
