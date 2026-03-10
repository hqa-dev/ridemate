'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { CITIES, toKurdishNum, formatKurdishDate } from '@/lib/utils'
import { kurdishStrings } from '@/lib/strings'
import PageHeader from '@/components/ui/PageHeader'
import SectionLabel from '@/components/ui/SectionLabel'
import Card from '@/components/ui/Card'

const AVATAR_COLORS = ['#E8470A','#2A7A1A','#4A6FA5','#8B4513','#6B3FA0']
function nameColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function getTypeIcon(type: string) {
  const colors: Record<string, string> = {
    request_received: 'var(--color-brand-primary)',
    request_approved: 'var(--color-status-success)',
    request_declined: 'var(--color-status-error)',
    passenger_cancelled: 'var(--color-status-error)',
    ride_completed: 'var(--color-status-success)',
    ride_cancelled: 'var(--color-status-error)',
    ride_updated: 'var(--color-status-warning)',
  }
  const c = colors[type] || 'var(--color-text-secondary)'
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
  request_received: { text: kurdishStrings.notifRequestReceived, color: 'var(--color-brand-primary)' },
  request_approved: { text: kurdishStrings.notifRequestApproved, color: 'var(--color-status-success)' },
  request_declined: { text: kurdishStrings.declined, color: 'var(--color-status-error)' },
  passenger_cancelled: { text: kurdishStrings.notifPassengerCancelled, color: 'var(--color-status-error)' },
  ride_completed: { text: kurdishStrings.notifRideCompleted, color: 'var(--color-status-success)' },
  ride_cancelled: { text: kurdishStrings.statusCancelled, color: 'var(--color-status-error)' },
  ride_updated: { text: kurdishStrings.notifRideUpdated, color: 'var(--color-status-warning)' },
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
    if (!user) { router.push('/'); return }

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
    if (!ride || ride.available_seats <= 0) { setError(kurdishStrings.errorNoSeats); setProcessing(null); return }

    // Approve the request
    const { error: reqErr } = await supabase
      .from('ride_requests')
      .update({ status: 'approved' })
      .eq('id', n.requestId)
    if (reqErr) { setError(kurdishStrings.errorOccurred); setProcessing(null); return }

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
    if (reqErr) { setError(kurdishStrings.errorOccurred); setProcessing(null); return }

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
      direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)',
      maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto',
      paddingBottom: 'var(--space-navClearanceLg)',
    }}>
      <PageHeader title={kurdishStrings.notificationsTitle} back />

      {error && <p style={{ color: 'var(--color-status-error)', fontSize: 'var(--font-size-body)', textAlign: 'center', padding: '0 var(--space-4) var(--space-2)' }}>{error}</p>}

      {loading ? <div /> : (
        <>
          {unseenNotifications.length > 0 && (
            <>
              <div style={{ padding: '0 var(--space-1)' }}><SectionLabel label={kurdishStrings.newLabel} /></div>
              <Card style={{ margin: '0 var(--space-4) var(--space-4)', borderRadius: 'var(--radius-2xl)', padding: '0 var(--space-4)' }}>
                {unseenNotifications.map((n, i) => (
                  <NotifRow key={n.id} n={n} isLast={i === unseenNotifications.length - 1} onApprove={handleApprove} onDecline={handleDecline} processing={processing} router={router} />
                ))}
              </Card>
            </>
          )}

          {seenNotifications.length > 0 && (
            <>
              <div style={{ padding: '0 var(--space-1)' }}><SectionLabel label={kurdishStrings.previousLabel} /></div>
              <Card style={{ margin: '0 var(--space-4)', borderRadius: 'var(--radius-2xl)', padding: '0 var(--space-4)' }}>
                {seenNotifications.map((n, i) => (
                  <NotifRow key={n.id} n={n} isLast={i === seenNotifications.length - 1} onApprove={handleApprove} onDecline={handleDecline} processing={processing} router={router} />
                ))}
              </Card>
            </>
          )}

          {unseenNotifications.length === 0 && seenNotifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px var(--space-page-x)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-3)', display: 'block' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)' }}>{kurdishStrings.noNotifications}</p>
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
  const st = statusText[n.type] || { text: '', color: 'var(--color-text-muted)' }

  return (
    <div style={{ borderBottom: isLast ? 'none' : 'var(--border-width-medium) dashed var(--color-text-muted)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-card-md) 0' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0, cursor: 'pointer' }}>
          <div style={{ width: 'var(--size-button-iconLg)', height: 'var(--size-button-iconLg)', borderRadius: 'var(--radius-base)', border: 'var(--border-width-thick) solid var(--color-text-primary)', background: nameColor(n.personName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-text-onAccent)', flexShrink: 0 }}>
            {n.personName.charAt(0)}
          </div>
          <div style={{ width: 1, height: 'var(--space-7)', background: 'var(--color-border-subtle)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 'var(--font-size-body)', fontWeight: !n.seen ? 'var(--font-weight-bold)' as unknown as number : 'var(--font-weight-regular)' as unknown as number, color: !n.seen ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{n.personName}</div>
            <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', marginTop: 2 }}>{[n.route, n.date].filter(Boolean).join(' · ')}</div>
          </div>
        </div>

        {/* Status + pickup */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: isActionable ? 'default' : 'pointer', textAlign: 'left' }}
          onClick={() => { if (!isActionable) router.push(`/rides/${n.rideId}`) }}
        >
          {(n.type === 'request_received' || n.type === 'passenger_cancelled') ? (
            <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-bold)' as unknown as number, border: 'var(--border-width-medium) solid var(--color-text-muted)', borderRadius: 'var(--radius-xs)', padding: '2px var(--space-2)', background: 'var(--color-bg-sunken)', display: 'inline-block' }}>{st.text}</span>
          ) : (
            <span style={{ fontSize: 'var(--font-size-body)', color: st.color, fontWeight: 'var(--font-weight-bold)' as unknown as number, border: 'var(--border-width-thick) solid currentColor', borderRadius: 'var(--radius-sm)', padding: '2px 7px', boxShadow: 'var(--shadow-sm)', display: 'inline-block' }}>{st.text}</span>
          )}
          {(n.pickup && n.pickup.length > 2 && n.dropoff && n.dropoff.length > 2) && (
            <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-icon-muted)', marginTop: 2 }}>
              {n.pickup} ← {n.dropoff}
            </div>
          )}
          {n.type === 'ride_updated' && n.metadata?.changes && (
            <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-icon-muted)', marginTop: 2 }}>
              {(n.metadata.changes as string[]).join(' · ')}
            </div>
          )}
        </div>

        {/* Actions or arrow */}
        {isActionable ? (
          <div style={{ display: 'flex', gap: 'var(--space-1-5)', flexShrink: 0 }}>
            <button onClick={() => onApprove(n)} disabled={isProcessing} style={{ width: 'var(--size-button-icon)', height: 'var(--size-button-icon)', borderRadius: 'var(--radius-md)', background: 'var(--color-status-success)', border: 'var(--border-width-thick) solid var(--color-text-primary)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-onAccent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button onClick={() => onDecline(n)} disabled={isProcessing} style={{ width: 'var(--size-button-icon)', height: 'var(--size-button-icon)', borderRadius: 'var(--radius-md)', background: 'var(--color-status-error)', border: 'var(--border-width-thick) solid var(--color-text-primary)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-onAccent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => router.push(`/rides/${n.rideId}`)}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </div>
  )
}
