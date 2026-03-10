'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import { kurdishStrings } from '@/lib/strings'
import { createClient } from '@/lib/supabase/client'
import { CITIES, ROUTE_INFO, COLOR_KU, formatWhatsApp, formatTime, estimateArrival, toKurdishNum } from '@/lib/utils'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import SketchCar from '@/components/ui/icons/SketchCar'
import SketchPerson from '@/components/ui/icons/SketchPerson'
import RouteLine from '@/components/ui/icons/RouteLine'
import PageHeader from '@/components/ui/PageHeader'
import SectionLabel from '@/components/ui/SectionLabel'
import Card from '@/components/ui/Card'
import DashedDivider from '@/components/ui/DashedDivider'

const PersonIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" />
  </svg>
)

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-1-5)', justifyContent: 'center', direction: 'ltr' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{
            fontSize: 28, cursor: 'pointer',
            color: star <= value ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
            transition: 'transform var(--motion-duration-fast)',
            transform: star <= value ? 'scale(1.1)' : 'scale(1)',
          }}
        >★</span>
      ))}
    </div>
  )
}

function StarDisplay({ rating, size = 12 }: { rating: number; size?: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.3
  return (
    <span style={{ color: 'var(--color-brand-primary)', fontSize: size, letterSpacing: 'var(--font-letterSpacing-wide)', direction: 'ltr', display: 'inline-flex', alignItems: 'center', opacity: 'var(--opacity-starMuted)' as unknown as number }}>
      {[0, 1, 2, 3, 4].map(i => {
        if (i < full) return <span key={i}>★</span>
        if (i === full && hasHalf) return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', width: '1em' }}>
            <span style={{ color: 'var(--color-border-subtle)' }}>★</span>
            <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: '0.5em' }}>★</span>
          </span>
        )
        return <span key={i} style={{ color: 'var(--color-border-subtle)' }}>★</span>
      })}
    </span>
  )
}

export default function RideDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rideId = params.id as string
  const supabase = createClient()

  const [ride, setRide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requested, setRequested] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isOwnRide, setIsOwnRide] = useState(false)
  const [requestStatus, setRequestStatus] = useState<string | null>(null)

  const [selectedRating, setSelectedRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)

  const [driverAvgRating, setDriverAvgRating] = useState<number | null>(null)
  const [driverTripCount, setDriverTripCount] = useState(0)

  const [completing, setCompleting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [confirmModal, setConfirmModal] = useState<{ message: string; action: () => void } | null>(null)

  const [approvedPassengers, setApprovedPassengers] = useState<any[]>([])

  useEffect(() => { loadRide() }, [rideId])

  async function loadRide() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const { data, error } = await supabase
      .from('rides')
      .select('*, driver:profiles!driver_id(full_name, verified, avatar_url, phone)')
      .eq('id', rideId)
      .single()

    if (error || !data) { setLoading(false); return }

    setRide(data)
    if (user && data.driver_id === user.id) setIsOwnRide(true)

    if (user) {
      const { data: existing } = await supabase
        .from('ride_requests')
        .select('id, status')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)
        .in('status', ['pending', 'approved', 'declined'])
        .maybeSingle()
      if (existing) {
        setRequested(true)
        setRequestStatus(existing.status)
      } else {
        setRequested(false)
        setRequestStatus(null)
      }
    }

    if (user) {
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id, score')
        .eq('ride_id', rideId)
        .eq('rater_id', user.id)
        .maybeSingle()
      if (existingRating) {
        setHasRated(true)
        setSelectedRating(existingRating.score)
      }
    }

    if (data.driver_id) {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('score')
        .eq('rated_id', data.driver_id)
        .lte('visible_after', new Date().toISOString())
      if (ratings && ratings.length > 0) {
        const avg = ratings.reduce((sum: number, r: any) => sum + r.score, 0) / ratings.length
        setDriverAvgRating(Math.round(avg * 10) / 10)
        setDriverTripCount(ratings.length)
      }
    }

    // Load approved passengers
    const { data: passengerRequests } = await supabase
      .from('ride_requests')
      .select('pickup, dropoff, passenger:profiles!passenger_id(full_name, avatar_url)')
      .eq('ride_id', rideId)
      .eq('status', 'approved')
    if (passengerRequests) setApprovedPassengers(passengerRequests)

    setLoading(false)
  }

  async function handleSendRequest() {
    if (!currentUserId || !ride) return
    if (ride.available_seats <= 0) return
    setSending(true)
    setActionError('')
    const { data: revived } = await supabase.from('ride_requests')
      .update({ status: 'pending', pickup: pickup || null, dropoff: dropoff || null })
      .eq('ride_id', rideId)
      .eq('passenger_id', currentUserId)
      .in('status', ['cancelled', 'declined'])
      .select()
    let requestId = revived?.[0]?.id
    if (!revived || revived.length === 0) {
      const { data: inserted, error } = await supabase.from('ride_requests').insert({
        ride_id: rideId,
        passenger_id: currentUserId,
        pickup: pickup || null,
        dropoff: dropoff || null,
        status: 'pending',
      }).select()
      if (error) { console.error('Send request error:', error); setActionError(kurdishStrings.errorGeneric); setSending(false); return }
      requestId = inserted?.[0]?.id
    }
    // Notify driver
    await supabase.from('notifications').insert({
      user_id: ride.driver_id,
      type: 'request_received',
      ride_id: rideId,
      from_user_id: currentUserId,
      ride_request_id: requestId || null,
      metadata: { pickup: pickup || null, dropoff: dropoff || null },
    })
    setRequested(true)
    setRequestStatus('pending')
    setShowModal(false)
    setSending(false)
  }

  async function handleCompleteRide() {
    setCompleting(true)
    setActionError('')
    const { error } = await supabase
      .from('rides')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', rideId)
      .eq('driver_id', currentUserId!)
    if (error) { setActionError(kurdishStrings.errorGeneric); setCompleting(false); return }
    // Notify all approved passengers
    const { data: approved } = await supabase.from('ride_requests').select('passenger_id').eq('ride_id', rideId).eq('status', 'approved')
    if (approved && currentUserId) {
      const notifs = approved.map((r: any) => ({
        user_id: r.passenger_id,
        type: 'ride_completed',
        ride_id: rideId,
        from_user_id: currentUserId,
      }))
      if (notifs.length > 0) await supabase.from('notifications').insert(notifs)
    }
    setRide((prev: any) => ({ ...prev, status: 'completed', completed_at: new Date().toISOString() }))
    setCompleting(false)
  }

  function handleCancelRide(e?: React.MouseEvent) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    setConfirmModal({
      message: kurdishStrings.confirmCancelRide,
      action: async () => {
        setConfirmModal(null)
        setActionError('')
        const { error: rideErr } = await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId).eq('driver_id', currentUserId!)
        if (rideErr) { setActionError(kurdishStrings.errorGeneric); return }
        // Get affected passengers before updating requests
        const { data: affected } = await supabase.from('ride_requests').select('passenger_id').eq('ride_id', rideId).in('status', ['approved', 'pending'])
        await supabase.from('ride_requests')
          .update({ status: 'cancelled' })
          .eq('ride_id', rideId)
          .in('status', ['approved', 'pending'])
        // Notify each passenger
        if (affected && currentUserId) {
          const notifs = affected.map((r: any) => ({
            user_id: r.passenger_id,
            type: 'ride_cancelled',
            ride_id: rideId,
            from_user_id: currentUserId,
          }))
          if (notifs.length > 0) await supabase.from('notifications').insert(notifs)
        }
        window.location.reload()
      },
    })
  }

  function handleCancelRequest() {
    setConfirmModal({
      message: kurdishStrings.confirmWithdraw,
      action: async () => {
        setConfirmModal(null)
        setActionError('')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setActionError(kurdishStrings.errorReLogin); return }
        const { data: activeReq, error: findErr } = await supabase.from('ride_requests')
          .select('id, status')
          .eq('ride_id', rideId)
          .eq('passenger_id', user.id)
          .in('status', ['pending', 'approved'])
          .maybeSingle()
        if (findErr || !activeReq) { setActionError(kurdishStrings.errorGeneric); return }
        const { error } = await supabase.from('ride_requests')
          .update({ status: 'cancelled' })
          .eq('id', activeReq.id)
        if (error) { setActionError(kurdishStrings.errorGeneric); return }
        if (activeReq.status === 'approved') {
          const { error: rpcErr } = await supabase.rpc('increment_seats', { ride_id_input: rideId })
          if (rpcErr) { setActionError(kurdishStrings.errorSeatRestore); console.error('increment_seats failed:', rpcErr) }
        }
        // Notify driver
        if (ride) {
          await supabase.from('notifications').insert({
            user_id: ride.driver_id,
            type: 'passenger_cancelled',
            ride_id: rideId,
            from_user_id: user.id,
            ride_request_id: activeReq.id,
          })
        }
        loadRide()
      },
    })
  }

  function handleWithdrawRequest() {
    setConfirmModal({
      message: kurdishStrings.confirmWithdraw,
      action: async () => {
        setConfirmModal(null)
        setActionError('')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setActionError(kurdishStrings.errorReLogin); return }
        const { data: activeReq, error: findErr } = await supabase.from('ride_requests')
          .select('id')
          .eq('ride_id', rideId)
          .eq('passenger_id', user.id)
          .in('status', ['pending'])
          .maybeSingle()
        if (findErr || !activeReq) { setActionError(kurdishStrings.errorGeneric); return }
        const { error } = await supabase.from('ride_requests')
          .update({ status: 'cancelled' })
          .eq('id', activeReq.id)
        if (error) { setActionError(kurdishStrings.errorGeneric); return }
        loadRide()
      },
    })
  }

  async function handleSubmitRating() {
    if (!currentUserId || !ride || selectedRating === 0) return
    setSubmittingRating(true)
    setActionError('')
    const visibleAfter = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
    const { error } = await supabase.from('ratings').insert({
      ride_id: rideId,
      rater_id: currentUserId,
      rated_id: ride.driver_id,
      score: selectedRating,
      visible_after: visibleAfter,
    })
    if (error) { setActionError(kurdishStrings.errorGeneric); setSubmittingRating(false); return }
    setHasRated(true)
    setSubmittingRating(false)
  }

  const pageWrap: React.CSSProperties = {
    direction: 'rtl',
    minHeight: '100vh',
    background: 'var(--color-bg-canvas)',
    maxWidth: 'var(--size-app-maxWidth)',
    margin: '0 auto',
    paddingBottom: 'var(--space-navClearanceLg)' as unknown as number,
  }

  const inp: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-bg-sunken)',
    border: 'var(--input-ride-border)',
    borderRadius: 'var(--input-ride-radius)',
    padding: 'var(--input-ride-padding)',
    fontSize: 'var(--input-standard-fontSize)',
    outline: 'none',
    direction: 'rtl',
    resize: 'none',
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--input-ride-lineHeight)' as unknown as number,
  }

  if (loading) return <div style={pageWrap}><BottomNav active="home" /></div>

  if (!ride) {
    return (
      <div style={{ ...pageWrap, textAlign: 'center', paddingTop: '3rem' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>{kurdishStrings.rideNotFound}</p>
        <Link href="/home" style={{ color: 'var(--color-brand-primary)', marginTop: '1rem', display: 'inline-block' }}>{kurdishStrings.back}</Link>
        <BottomNav active="home" />
      </div>
    )
  }

  const driver = ride.driver || {}
  const carParts = [ride.car_make, ride.car_model].filter(Boolean).join(' ')
  const carColor = ride.car_color ? (COLOR_KU[ride.car_color.toLowerCase()] || ride.car_color) : ''
  const waLink = driver.phone ? formatWhatsApp(driver.phone) : ''
  const isPastDeparture = new Date(ride.departure_time) < new Date()
  const isCompleted = ride.status === 'completed'
  const isCancelled = ride.status === 'cancelled'
  const routeKey = `${ride.from_city}-${ride.to_city}`
  const routeInfo = ROUTE_INFO[routeKey]
  const depTime = formatTime(ride.departure_time)
  const arrTime = estimateArrival(ride.departure_time, ride.from_city, ride.to_city)
  const distance = routeInfo?.distance || ''

  const priceDisplay = ride.price_type === 'coffee'
    ? '☕'
    : `${toKurdishNum(Number(ride.price_iqd).toLocaleString('en'))}`

  const totalSeats = (ride.available_seats || 0) + approvedPassengers.length

  return (
    <div style={pageWrap}>

      <PageHeader title={`${CITIES[ride.from_city]} ← ${CITIES[ride.to_city]}`} back />

      {/* Cancelled banner */}
      {isCancelled && (
        <div style={{
          background: 'var(--color-status-errorBg)', border: 'var(--border-width-medium) solid var(--color-status-error)',
          borderRadius: 'var(--radius-2xl)', padding: 'var(--space-3) var(--space-4)', margin: '0 var(--space-4) var(--space-3)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-status-error)', fontWeight: 'var(--font-weight-medium)' as unknown as number }}>{kurdishStrings.statusCancelled}</span>
        </div>
      )}

      {/* SketchCar above card */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 var(--space-2)' }}>
        <SketchCar size={140} color="var(--color-text-primary)" />
      </div>

      {/* Timeline + Stats */}
      <Card style={{ margin: '0 var(--space-4)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        {/* RouteLine */}
        <div style={{ padding: 'var(--space-card-md) var(--space-card-lg) 0' }}>
          <RouteLine
            from={CITIES[ride.from_city]}
            to={CITIES[ride.to_city]}
            dep={toKurdishNum(depTime)}
            arr={toKurdishNum(arrTime)}
          />
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <div style={{ padding: 'var(--space-2) var(--space-5) 0', display: 'flex' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-5xl)', background: 'var(--color-status-successBg)', color: 'var(--color-status-success)', fontWeight: 'var(--font-weight-semibold)' as unknown as number }}>
              {kurdishStrings.statusCompletedBadge}
            </span>
          </div>
        )}

        {/* Dashed divider */}
        <DashedDivider style={{ margin: '10px 0 var(--space-2)' }} />

        {/* Stats bar */}
        <div style={{ display: 'flex', padding: '0 0 10px' }}>
          {[
            { l: kurdishStrings.price, v: priceDisplay },
            { l: kurdishStrings.seat, v: `${toKurdishNum(ride.available_seats)}/${toKurdishNum(totalSeats)}` },
            { l: kurdishStrings.smoking, v: ride.smoking ? '🚬' : '🚭' },
            { l: kurdishStrings.car, v: ride.car_model || ride.car_make || '-' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i > 0 ? 'var(--border-width-medium) dashed var(--color-text-muted)' : 'none' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{s.l}</div>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-text-secondary)' }}>{s.v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Driver */}
      <SectionLabel label={kurdishStrings.driverLabel} />
      <Card style={{ margin: '0 var(--space-4)', padding: 'var(--space-card-md) var(--space-card-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{ width: 'var(--size-avatar-md)', height: 'var(--size-avatar-md)', borderRadius: 'var(--radius-base)', border: 'var(--border-width-thick) solid var(--color-text-primary)', background: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SketchPerson size={22} hat={true} />
        </div>
        <div style={{ width: 1, height: 32, background: 'var(--color-border-divider)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 2 }}>
            {driver.full_name || kurdishStrings.driverLabel}
            {driver.verified && <span style={{ color: 'var(--color-status-success)', fontSize: 'var(--font-size-sm)', marginRight: 'var(--space-1)' }}> ✓</span>}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {driverAvgRating !== null && `${driverAvgRating} ★ · ${toKurdishNum(driverTripCount)} ${kurdishStrings.trip}`}
            {driverAvgRating !== null && carParts && ' · '}
            {carParts && `${carParts}`}
            {carColor && ` ${carColor}`}
          </div>
        </div>
      </Card>

      {/* Passengers */}
      {(approvedPassengers.length > 0 || isOwnRide) && (
        <>
          <SectionLabel label={kurdishStrings.passengers} />
          <Card style={{ margin: '0 var(--space-4)', padding: '0 var(--space-4)' }}>
            {approvedPassengers.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-3) 0', gap: 10, borderBottom: i < approvedPassengers.length - 1 ? 'var(--border-width-medium) dashed var(--color-border-divider)' : 'none' }}>
                <div style={{ width: 'var(--size-avatar-sm)', height: 'var(--size-avatar-sm)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-sunken)', border: 'var(--border-width-medium) solid var(--color-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {p.passenger?.avatar_url ? (
                    <img src={p.passenger.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  ) : (
                    <PersonIcon size={14} />
                  )}
                </div>
                <span style={{ flex: 1, fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)' }}>{p.passenger?.full_name || kurdishStrings.passengerFallback}</span>
                {(p.pickup || p.dropoff) && (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {p.pickup || '—'} ← {p.dropoff || '—'}
                  </span>
                )}
              </div>
            ))}
            {ride.available_seats > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-3) 0', gap: 10, borderTop: approvedPassengers.length > 0 ? 'var(--border-width-thin) solid var(--color-border-subtle)' : 'none', opacity: 'var(--opacity-ghost)' as unknown as number }}>
                <div style={{ width: 'var(--size-avatar-sm)', height: 'var(--size-avatar-sm)', borderRadius: 'var(--radius-base)', border: 'var(--border-width-thin) dashed var(--color-border-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>+</span>
                </div>
                <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)' }}>{toKurdishNum(ride.available_seats)} {kurdishStrings.seatsAvailableCount}</span>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Notes */}
      {ride.notes && (
        <Card style={{ margin: 'var(--space-4) var(--space-4) 0', padding: 'var(--space-3) var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)' as unknown as number }}>{kurdishStrings.notes}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--font-lineHeight-relaxed)' as unknown as number }}>{ride.notes}</div>
        </Card>
      )}

      {/* ── Action Area ── */}
      <div style={{ padding: 'var(--space-6) var(--space-4) 40px' }}>
        {actionError && <p style={{ color: 'var(--color-status-error)', fontSize: 'var(--font-size-base)', textAlign: 'center', marginBottom: 10 }}>{actionError}</p>}

        {/* Driver views */}
        {isOwnRide && (
          isPastDeparture && !isCompleted && !isCancelled ? (
            <button
              onClick={handleCompleteRide}
              style={{
                width: '100%', border: 'none',
                background: 'var(--color-border-strong)', color: 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-2xl)', padding: 'var(--space-3)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)' as unknown as number,
                textAlign: 'center', cursor: completing ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                direction: 'rtl', opacity: completing ? 'var(--opacity-disabled)' as unknown as number : 1,
                fontFamily: 'var(--font-family-body)',
              }}
            >
              {completing ? '...' : kurdishStrings.rideCompleted}
            </button>
          ) : isCompleted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-card-md)', padding: 'var(--space-card-md) 0' }}>
              <div style={{
                width: 'var(--size-icon-3xl)', height: 'var(--size-icon-3xl)', borderRadius: 'var(--radius-base)',
                background: 'var(--color-ride-completedIconBg)', border: 'var(--border-width-thin) solid var(--color-ride-completedIconBorder)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ width: 1, height: 32, background: 'var(--color-border-divider)', flexShrink: 0, margin: '0 5px' }} />
              <div>
                <p style={{ fontWeight: 'var(--font-weight-medium)' as unknown as number, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', margin: '0 0 3px' }}>{kurdishStrings.rideCompleted}</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>{kurdishStrings.completedDate} {new Date(ride.completed_at).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          ) : isCancelled ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', margin: 0 }}>{kurdishStrings.statusCancelled}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link href="/post-ride?tab=manage" style={{
                flex: 1, background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)',
                border: 'var(--button-primary-border)', borderRadius: 'var(--button-primary-radius)', padding: 'var(--button-primary-padding)',
                fontSize: 'var(--button-primary-fontSize)', fontWeight: 'var(--button-primary-fontWeight)' as unknown as number, textAlign: 'center', textDecoration: 'none',
                boxShadow: 'var(--button-primary-shadow)',
              }}>{kurdishStrings.manage}</Link>
              <button onClick={(e) => handleCancelRide(e)} style={{
                flex: 1, background: 'var(--button-secondary-bg)', color: 'var(--button-secondary-text)',
                border: 'var(--button-secondary-border)', borderRadius: 'var(--button-secondary-radius)', padding: 'var(--button-secondary-padding)',
                fontSize: 'var(--button-secondary-fontSize)', fontWeight: 'var(--button-secondary-fontWeight)' as unknown as number, textAlign: 'center', cursor: 'pointer',
                boxShadow: 'var(--button-secondary-shadow)',
                fontFamily: 'var(--font-family-body)',
              }}>{kurdishStrings.cancelRide}</button>
            </div>
          )
        )}

        {/* Passenger views */}
        {!isOwnRide && (
          isCancelled ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
              <p style={{ fontWeight: 'var(--font-weight-medium)' as unknown as number, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-md)', margin: 0 }}>{kurdishStrings.statusCancelled}</p>
            </div>
          ) :
          isCompleted && requestStatus === 'approved' ? (
            !hasRated ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 'var(--font-weight-bold)' as unknown as number, fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{kurdishStrings.rateRideQuestion}</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>{kurdishStrings.ratingDelayNote}</p>
                <StarSelector value={selectedRating} onChange={setSelectedRating} />
                {selectedRating > 0 && (
                  <button
                    onClick={handleSubmitRating}
                    disabled={submittingRating}
                    style={{
                      marginTop: 'var(--space-3)', width: '100%', background: 'var(--color-brand-primary)',
                      color: 'var(--color-text-onAccent)', border: 'none', borderRadius: 'var(--radius-2xl)',
                      padding: 13, fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' as unknown as number, cursor: 'pointer',
                      opacity: submittingRating ? 'var(--opacity-disabled)' as unknown as number : 1,
                    }}
                  >
                    {submittingRating ? '...' : kurdishStrings.submitRating}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-card-md)', padding: 'var(--space-card-md) 0' }}>
                <div style={{
                  width: 'var(--size-icon-3xl)', height: 'var(--size-icon-3xl)', borderRadius: 'var(--radius-base)',
                  background: 'var(--color-ride-ratedIconBg)', border: 'var(--border-width-thin) solid var(--color-ride-ratedIconBorder)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-brand-primary)" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div style={{ width: 1, height: 32, background: 'var(--color-border-divider)', flexShrink: 0, margin: '0 5px' }} />
                <div>
                  <p style={{ fontWeight: 'var(--font-weight-medium)' as unknown as number, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', margin: '0 0 3px' }}>{kurdishStrings.thanksForRating}</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>{kurdishStrings.ratingDelayNote}</p>
                </div>
              </div>
            )
          ) :
          !requested ? (
            ride.available_seats <= 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
                <p style={{ fontWeight: 'var(--font-weight-semibold)' as unknown as number, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-md)', margin: 0 }}>{kurdishStrings.noSeatsAvailable}</p>
              </div>
            ) : (
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: '100%', background: 'var(--color-brand-primary)', color: 'var(--color-text-onAccent)',
                border: 'var(--border-width-thick) solid var(--color-border-strong)', borderRadius: 'var(--radius-2xl)', padding: '15px 0',
                fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-extrabold)' as unknown as number, cursor: 'pointer',
                boxShadow: 'var(--shadow-card)',
                fontFamily: 'var(--font-family-body)',
              }}
            >
              {kurdishStrings.yesSendIt}
            </button>
            )
          ) : requestStatus === 'approved' ? (
            <div style={{ textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 6px' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="8 12 11 15 16 9" />
              </svg>
              <p style={{ fontWeight: 'var(--font-weight-semibold)' as unknown as number, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', margin: '0 0 var(--space-3)' }}>{kurdishStrings.requestAccepted}</p>
              {waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                  background: 'var(--button-whatsapp-bg)', color: 'var(--button-whatsapp-text)',
                  borderRadius: 'var(--button-whatsapp-radius)', padding: 'var(--button-whatsapp-padding)', fontSize: 'var(--button-whatsapp-fontSize)', fontWeight: 'var(--button-whatsapp-fontWeight)' as unknown as number,
                  textAlign: 'center', cursor: 'pointer', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                  direction: 'rtl',
                }}>
                  {kurdishStrings.messageDriver}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-external-whatsapp)" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)' }}>{kurdishStrings.driverNoPhone}</p>
              )}
              <button
                onClick={() => handleCancelRequest()}
                style={{
                  width: '100%', background: 'var(--button-withdraw-bg)', color: 'var(--button-withdraw-text)',
                  border: 'var(--button-withdraw-border)', borderRadius: 'var(--button-withdraw-radius)', padding: 'var(--button-withdraw-padding)',
                  fontSize: 'var(--button-withdraw-fontSize)', fontWeight: 'var(--button-withdraw-fontWeight)' as unknown as number,
                  textAlign: 'center', cursor: 'pointer', marginTop: 'var(--space-3)',
                  fontFamily: 'var(--font-family-body)',
                }}
              >
                {kurdishStrings.withdraw}
              </button>
            </div>
          ) : requestStatus === 'declined' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-card-md)', padding: 'var(--space-card-md) 0' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
              <div style={{ width: 1, height: 32, background: 'var(--color-border-divider)', flexShrink: 0, margin: '0 5px' }} />
              <div>
                <p style={{ fontWeight: 'var(--font-weight-medium)' as unknown as number, color: 'var(--color-status-error)', fontSize: 'var(--font-size-md)', margin: '0 0 3px' }}>{kurdishStrings.requestDeclined}</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, lineHeight: 'var(--font-lineHeight-tight)' as unknown as number }}>{kurdishStrings.driverDeclinedNote}</p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-card-md)', padding: 'var(--space-card-md) 0' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div style={{ width: 1, height: 32, background: 'var(--color-border-divider)', flexShrink: 0, margin: '0 5px' }} />
                <div>
                  <p style={{ fontWeight: 'var(--font-weight-medium)' as unknown as number, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', margin: '0 0 3px' }}>{kurdishStrings.requestSentDetail}</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0, lineHeight: 'var(--font-lineHeight-tight)' as unknown as number }}>{kurdishStrings.approvedContactNote}</p>
                </div>
              </div>
              <button
                onClick={() => handleWithdrawRequest()}
                style={{
                  width: '100%', background: 'var(--button-withdraw-bg)', color: 'var(--button-withdraw-text)',
                  border: 'var(--button-withdraw-border)', borderRadius: 'var(--button-withdraw-radius)', padding: 'var(--button-withdraw-padding)',
                  fontSize: 'var(--button-withdraw-fontSize)', fontWeight: 'var(--button-withdraw-fontWeight)' as unknown as number,
                  textAlign: 'center', cursor: 'pointer', marginTop: 'var(--space-1)',
                  fontFamily: 'var(--font-family-body)',
                }}
              >
                {kurdishStrings.withdraw}
              </button>
            </div>
          )
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'var(--color-overlay-backdrop)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 'var(--z-overlay)' as unknown as number, padding: 'var(--space-5)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: 'var(--card-requestModal-bg)', width: '100%', maxWidth: 'var(--card-requestModal-maxWidth)', borderRadius: 'var(--card-requestModal-radius)', padding: 'var(--space-modal-y) var(--space-modal-x)', direction: 'rtl', border: 'var(--card-requestModal-border)', boxShadow: 'var(--card-requestModal-shadow)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontWeight: 'var(--font-weight-bold)' as unknown as number, fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>{kurdishStrings.iWantIt}</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-1)', textAlign: 'right', paddingRight: 'var(--space-1)' }}>{kurdishStrings.pickup}</label>
                <input value={pickup} onChange={e => setPickup(e.target.value)} style={inp} placeholder={kurdishStrings.pickupPlaceholder} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-1)', textAlign: 'right', paddingRight: 'var(--space-1)' }}>{kurdishStrings.dropoff}</label>
                <input value={dropoff} onChange={e => setDropoff(e.target.value)} style={inp} placeholder={kurdishStrings.dropoffPlaceholder} />
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-3)', lineHeight: 'var(--font-lineHeight-tight)' as unknown as number }}>
              {kurdishStrings.phoneShareNote}
            </p>
            <button
              style={{ width: '100%', background: 'var(--color-brand-primary)', color: 'var(--color-text-onAccent)', border: 'var(--border-width-thick) solid var(--color-border-strong)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-card-md)', fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' as unknown as number, cursor: 'pointer', marginBottom: 'var(--space-2)', boxShadow: 'var(--shadow-sm)', opacity: sending ? 'var(--opacity-disabled)' as unknown as number : 1 }}
              disabled={sending}
              onClick={handleSendRequest}
            >
              {sending ? kurdishStrings.pleaseWait : kurdishStrings.sendRequest}
            </button>
            <button
              style={{ width: '100%', background: 'var(--button-ghost-bg)', color: 'var(--button-ghost-text)', border: 'var(--button-ghost-border)', borderRadius: 'var(--button-ghost-radius)', padding: 'var(--button-ghost-padding)', fontSize: 'var(--button-ghost-fontSize)', cursor: 'pointer' }}
              onClick={() => setShowModal(false)}
            >
              {kurdishStrings.cancel}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmModal}
        message={confirmModal?.message || ''}
        onConfirm={() => confirmModal?.action()}
        onCancel={() => setConfirmModal(null)}
      />

      <BottomNav active="home" />
    </div>
  )
}
