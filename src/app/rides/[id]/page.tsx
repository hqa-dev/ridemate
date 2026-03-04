'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'
import { CITIES, ROUTE_INFO, COLOR_KU, formatWhatsApp, formatTime, estimateArrival, toKurdishNum } from '@/lib/utils'
import { T } from '@/lib/theme'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

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

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', direction: 'ltr' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{
            fontSize: 28, cursor: 'pointer',
            color: star <= value ? T.accent : 'rgba(255,255,255,0.06)',
            transition: 'transform 0.15s',
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
    <span style={{ color: T.accent, fontSize: size, letterSpacing: 1, direction: 'ltr', display: 'inline-flex', alignItems: 'center', opacity: 0.7 }}>
      {[0, 1, 2, 3, 4].map(i => {
        if (i < full) return <span key={i}>★</span>
        if (i === full && hasHalf) return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', width: '1em' }}>
            <span style={{ color: 'rgba(255,255,255,0.06)' }}>★</span>
            <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: '0.5em' }}>★</span>
          </span>
        )
        return <span key={i} style={{ color: 'rgba(255,255,255,0.06)' }}>★</span>
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
      if (error) { console.error('Send request error:', error); setActionError('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە'); setSending(false); return }
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
    if (error) { setActionError('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە'); setCompleting(false); return }
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
      message: 'دڵنیایت لە هەڵوەشاندنەوەی ئەم گەشتە؟',
      action: async () => {
        setConfirmModal(null)
        setActionError('')
        const { error: rideErr } = await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
        if (rideErr) { setActionError('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە'); return }
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
      message: 'دڵنیایت لە پاشگەزبوونەوە؟',
      action: async () => {
        setConfirmModal(null)
        setActionError('')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setActionError('تکایە دووبارە بچۆرەوە ژوورەوە'); return }
        const { data: activeReq, error: findErr } = await supabase.from('ride_requests')
          .select('id, status')
          .eq('ride_id', rideId)
          .eq('passenger_id', user.id)
          .in('status', ['pending', 'approved'])
          .maybeSingle()
        if (findErr || !activeReq) { setActionError('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە'); return }
        const { error } = await supabase.from('ride_requests')
          .update({ status: 'cancelled' })
          .eq('id', activeReq.id)
        if (error) { setActionError('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە'); return }
        if (activeReq.status === 'approved') {
          const { error: rpcErr } = await supabase.rpc('increment_seats', { ride_id_input: rideId })
          if (rpcErr) { setActionError('هەڵەیەک ڕوویدا لە گەڕاندنەوەی جێگا'); console.error('increment_seats failed:', rpcErr) }
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
      message: 'دڵنیایت لە پاشگەزبوونەوە؟',
      action: async () => {
        setConfirmModal(null)
        setActionError('')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setActionError('تکایە دووبارە بچۆرەوە ژوورەوە'); return }
        const { data: activeReq, error: findErr } = await supabase.from('ride_requests')
          .select('id')
          .eq('ride_id', rideId)
          .eq('passenger_id', user.id)
          .in('status', ['pending'])
          .maybeSingle()
        if (findErr || !activeReq) { setActionError('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە'); return }
        const { error } = await supabase.from('ride_requests')
          .update({ status: 'cancelled' })
          .eq('id', activeReq.id)
        if (error) { setActionError('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە'); return }
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
    if (error) { setActionError('هەڵەیەک ڕوویدا، دووبارە هەوڵبدەرەوە'); setSubmittingRating(false); return }
    setHasRated(true)
    setSubmittingRating(false)
  }

  const pageWrap: React.CSSProperties = {
    direction: 'rtl',
    minHeight: '100vh',
    background: T.bg,
    maxWidth: 480,
    margin: '0 auto',
    paddingBottom: 100,
    fontFamily: "'Noto Sans Arabic', sans-serif",
  }

  const inp: React.CSSProperties = {
    width: '100%',
    background: T.cardInner,
    border: `1px solid ${T.divider}`,
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 12,
    outline: 'none',
    direction: 'rtl',
    resize: 'none',
    color: T.textMid,
    lineHeight: 2,
  }

  if (loading) return <div style={pageWrap}><BottomNav /></div>

  if (!ride) {
    return (
      <div style={{ ...pageWrap, textAlign: 'center', paddingTop: '3rem' }}>
        <p style={{ color: T.textMid }}>ئەم گەشتە نەدۆزرایەوە</p>
        <Link href="/home" style={{ color: T.orange, marginTop: '1rem', display: 'inline-block' }}>{ku.back}</Link>
        <BottomNav />
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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 20px 20px', gap: 12 }}>
        <div onClick={() => router.back()} style={{ cursor: 'pointer', padding: 4 }}><BackArrow /></div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>
          {CITIES[ride.from_city]} ← {CITIES[ride.to_city]}
        </h1>
      </div>

      {/* Cancelled banner */}
      {isCancelled && (
        <div style={{
          background: T.redBg, border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: 12, padding: '12px 16px', margin: '0 16px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          <span style={{ fontSize: 12, color: T.red, fontWeight: 500 }}>هەڵوەشێنرایەوە</span>
        </div>
      )}

      {/* Timeline + Stats */}
      <div style={{ background: T.card, margin: '0 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 14px' }} dir="ltr">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', minWidth: 44 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{toKurdishNum(arrTime)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, margin: '0 10px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.text, flexShrink: 0 }} />
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${T.text}, ${T.divider}, ${T.orange})` }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', border: `2px solid ${T.orange}`, flexShrink: 0 }} />
            </div>
            <div style={{ textAlign: 'center', minWidth: 44 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{toKurdishNum(depTime)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <span style={{ fontSize: 11, color: T.textMid, minWidth: 44, textAlign: 'center' }}>{CITIES[ride.to_city]}</span>
            <span style={{ fontSize: 9, color: T.textMid }}>{distance}</span>
            <span style={{ fontSize: 11, color: T.textMid, minWidth: 44, textAlign: 'center' }}>{CITIES[ride.from_city]}</span>
          </div>
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <div style={{ padding: '0 20px 8px', display: 'flex' }}>
            <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: T.greenBg, color: T.green, fontWeight: 600 }}>
              تەواو بوو ✓
            </span>
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'flex', borderTop: `1px solid ${T.border}` }}>
          {[
            { label: 'نرخ', value: priceDisplay },
            { label: 'جێگا', value: `${toKurdishNum(ride.available_seats)}/${toKurdishNum(totalSeats)}` },
            { label: 'جگەرە', value: ride.smoking ? '🚬' : '🚭' },
            { label: 'ئۆتۆ', value: ride.car_model || ride.car_make || '-' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '11px 0', textAlign: 'center', borderLeft: i < 3 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ fontSize: 9, color: T.textDim, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: T.textMid, fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver */}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '20px 20px 8px' }}>شۆفێر</div>
      <div style={{ background: T.card, margin: '0 16px', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: T.cardInner, border: `1px solid ${T.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {driver.avatar_url ? (
            <img src={driver.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          ) : (
            <PersonIcon size={20} />
          )}
        </div>
        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>
            {driver.full_name || 'شۆفێر'}
            {driver.verified && <span style={{ color: T.green, fontSize: 11, marginRight: 4 }}> ✓</span>}
          </div>
          <div style={{ fontSize: 10, color: T.textDim }}>
            {driverAvgRating !== null && `${driverAvgRating} ★ · ${toKurdishNum(driverTripCount)} گەشت`}
            {driverAvgRating !== null && carParts && ' · '}
            {carParts && `${carParts}`}
            {carColor && ` ${carColor}`}
          </div>
        </div>
      </div>

      {/* Passengers */}
      {(approvedPassengers.length > 0 || isOwnRide) && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '20px 20px 8px' }}>سەرنشینەکان</div>
          <div style={{ background: T.card, margin: '0 16px', borderRadius: 12, padding: '0 16px', border: '1px solid rgba(255,255,255,0.04)' }}>
            {approvedPassengers.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', gap: 10, borderBottom: i < approvedPassengers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.cardInner, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {p.passenger?.avatar_url ? (
                    <img src={p.passenger.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  ) : (
                    <PersonIcon size={14} />
                  )}
                </div>
                <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{p.passenger?.full_name || 'سەرنشین'}</span>
                {(p.pickup || p.dropoff) && (
                  <span style={{ fontSize: 10, color: T.textDim }}>
                    {p.pickup || '—'} ← {p.dropoff || '—'}
                  </span>
                )}
              </div>
            ))}
            {ride.available_seats > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', gap: 10, borderTop: approvedPassengers.length > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: 0.25 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>+</span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{toKurdishNum(ride.available_seats)} جێگای بەردەست</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Notes */}
      {ride.notes && (
        <div style={{ margin: '16px 16px 0', padding: '12px 16px', background: T.card, borderRadius: 12, borderRight: `3px solid ${T.orange}`, border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: 9, color: T.textFaint, marginBottom: 4, fontWeight: 600 }}>تێبینی</div>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>{ride.notes}</div>
        </div>
      )}

      {/* ── Action Area ── */}
      <div style={{ padding: '24px 16px 40px' }}>
        {actionError && <p style={{ color: T.red, fontSize: 12, textAlign: 'center', marginBottom: 10 }}>{actionError}</p>}

        {/* Driver views */}
        {isOwnRide && (
          isPastDeparture && !isCompleted && !isCancelled ? (
            <button
              onClick={handleCompleteRide}
              style={{
                width: '100%', border: 'none',
                background: T.border, color: T.textMid,
                borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 500,
                textAlign: 'center', cursor: completing ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                direction: 'rtl', opacity: completing ? 0.5 : 1,
                fontFamily: "'Noto Sans Arabic', sans-serif",
              }}
            >
              {completing ? '...' : 'گەشتەکە تەواو بوو'}
            </button>
          ) : isCompleted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ width: 1, height: 32, background: T.divider, flexShrink: 0, margin: '0 5px' }} />
              <div>
                <p style={{ fontWeight: 500, color: T.textMid, fontSize: 13, margin: '0 0 3px' }}>گەشتەکە تەواو بوو</p>
                <p style={{ fontSize: 11, color: T.textFaint, margin: 0 }}>ڕێکەوت: {new Date(ride.completed_at).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          ) : isCancelled ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p style={{ fontSize: 12, color: T.textDim, margin: 0 }}>هەڵوەشێنرایەوە</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/post-ride?tab=manage" style={{
                flex: 1, background: T.cardInner, color: 'rgba(255,255,255,0.85)',
                borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 500,
                textAlign: 'center', textDecoration: 'none',
              }}>بەڕێوەبردن</Link>
              <button onClick={(e) => handleCancelRide(e)} style={{
                flex: 1, background: 'rgba(220,50,50,0.15)', color: T.destructive,
                border: 'none', borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 500,
                textAlign: 'center', cursor: 'pointer',
                fontFamily: "'Noto Sans Arabic', sans-serif",
              }}>هەڵوەشاندنەوە</button>
            </div>
          )
        )}

        {/* Passenger views */}
        {!isOwnRide && (
          isCancelled ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p style={{ fontWeight: 500, color: T.textDim, fontSize: 13, margin: 0 }}>هەڵوەشێنرایەوە</p>
            </div>
          ) :
          isCompleted && requestStatus === 'approved' ? (
            !hasRated ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>گەشتەکە چۆن بوو بە لاتەوە؟</p>
                <p style={{ fontSize: 11, color: T.textDim, marginBottom: 12 }}>هەڵسەنگاندنەکەت دوای ٧٢ کاتژمێر دەردەکەوێ</p>
                <StarSelector value={selectedRating} onChange={setSelectedRating} />
                {selectedRating > 0 && (
                  <button
                    onClick={handleSubmitRating}
                    disabled={submittingRating}
                    style={{
                      marginTop: 12, width: '100%', background: T.orange,
                      color: '#fff', border: 'none', borderRadius: 12,
                      padding: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      opacity: submittingRating ? 0.5 : 1,
                    }}
                  >
                    {submittingRating ? '...' : 'ناردن'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(223,101,48,0.08)', border: '1px solid rgba(223,101,48,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={T.orange} stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div style={{ width: 1, height: 32, background: T.divider, flexShrink: 0, margin: '0 5px' }} />
                <div>
                  <p style={{ fontWeight: 500, color: T.textMid, fontSize: 13, margin: '0 0 3px' }}>سوپاس بۆ هەڵسەنگاندنەکەت!</p>
                  <p style={{ fontSize: 11, color: T.textFaint, margin: 0 }}>هەڵسەنگاندنەکەت دوای ٧٢ کاتژمێر دەردەکەوێ</p>
                </div>
              </div>
            )
          ) :
          !requested ? (
            ride.available_seats <= 0 ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <p style={{ fontWeight: 600, color: T.textDim, fontSize: 13, margin: 0 }}>جێ بەردەست نییە</p>
              </div>
            ) : (
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: '100%', background: T.card, color: T.orange,
                border: `1px solid ${T.border}`, borderRadius: 14, padding: '15px 0',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Noto Sans Arabic', sans-serif",
              }}
            >
              بەڵێ، بینێرە!
            </button>
            )
          ) : requestStatus === 'approved' ? (
            <div style={{ textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 6px' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="8 12 11 15 16 9" />
              </svg>
              <p style={{ fontWeight: 600, color: T.textMid, fontSize: 13, margin: '0 0 12px' }}>قبوڵ کرا!</p>
              {waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                  background: T.border, color: T.textMid,
                  borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 500,
                  textAlign: 'center', cursor: 'pointer', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  direction: 'rtl',
                }}>
                  پەیامێک بنێرە بۆ شۆفێر
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={T.whatsapp} style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              ) : (
                <p style={{ color: T.textMid, fontSize: 12 }}>شۆفێر ژمارەی مۆبایلی زیاد نەکردووە</p>
              )}
              <button
                onClick={() => handleCancelRequest()}
                style={{
                  width: '100%', border: 'none',
                  background: 'rgba(220,50,50,0.15)', color: T.destructive,
                  borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 500,
                  textAlign: 'center', cursor: 'pointer', marginTop: 12,
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                }}
              >
                پاشگەزبوونەوە
              </button>
            </div>
          ) : requestStatus === 'declined' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.destructive} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
              <div style={{ width: 1, height: 32, background: T.divider, flexShrink: 0, margin: '0 5px' }} />
              <div>
                <p style={{ fontWeight: 500, color: T.destructive, fontSize: 13, margin: '0 0 3px' }}>داواکاریەکت ڕەت کرایەوە</p>
                <p style={{ fontSize: 11, color: T.textFaint, margin: 0, lineHeight: 1.6 }}>شۆفێر داواکاریەکەتی قبوڵ نەکرد</p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div style={{ width: 1, height: 32, background: T.divider, flexShrink: 0, margin: '0 5px' }} />
                <div>
                  <p style={{ fontWeight: 500, color: T.textMid, fontSize: 13, margin: '0 0 3px' }}>داواکاریەکت نێردرا</p>
                  <p style={{ fontSize: 11, color: T.textFaint, margin: 0, lineHeight: 1.6 }}>کە داواکرییەکەت قبوڵ کرا، ژمارە مۆبایلی شۆفێر لێرە دەردەکەوێ</p>
                </div>
              </div>
              <button
                onClick={() => handleWithdrawRequest()}
                style={{
                  width: '100%', border: 'none',
                  background: 'rgba(220,50,50,0.15)', color: T.destructive,
                  borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 500,
                  textAlign: 'center', cursor: 'pointer', marginTop: 4,
                  fontFamily: "'Noto Sans Arabic', sans-serif",
                }}
              >
                پاشگەزبوونەوە
              </button>
            </div>
          )
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: T.card, width: '100%', maxWidth: 420, borderRadius: 24, padding: '24px 20px', direction: 'rtl' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12, color: T.text }}>دەمەوێ!</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: T.textMid, display: 'block', marginBottom: 4, textAlign: 'right', paddingRight: 4 }}>سواربوون</label>
                <input value={pickup} onChange={e => setPickup(e.target.value)} style={inp} placeholder="لە کوێ سوار دەبی؟" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: T.textMid, display: 'block', marginBottom: 4, textAlign: 'right', paddingRight: 4 }}>دابەزین</label>
                <input value={dropoff} onChange={e => setDropoff(e.target.value)} style={inp} placeholder="لە کوێ دادەبەزی؟" />
              </div>
            </div>
            <p style={{ fontSize: 12, color: T.textDim, textAlign: 'center', marginBottom: 12, lineHeight: 1.6 }}>
              دوای ئەوەی داواکارییەکت پەسەند کرا، ژمارەی مۆبایلەکەت لەگەڵ شۆفێر شێر دەکرێ
            </p>
            <button
              style={{ width: '100%', background: T.green, color: 'white', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 8, opacity: sending ? 0.5 : 1 }}
              disabled={sending}
              onClick={handleSendRequest}
            >
              {sending ? '...چاوەڕوان بە' : ku.sendRequest}
            </button>
            <button
              style={{ width: '100%', background: 'transparent', color: T.textDim, border: 'none', borderRadius: 12, padding: 12, fontSize: 14, cursor: 'pointer' }}
              onClick={() => setShowModal(false)}
            >
              {ku.cancel}
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

      <BottomNav />
    </div>
  )
}
