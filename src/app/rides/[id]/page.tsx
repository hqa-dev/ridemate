'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
const COLOR_KU: Record<string, string> = {
  black: 'ڕەش', white: 'سپی', red: 'سوور', blue: 'شین', green: 'سەوز',
  yellow: 'زەرد', silver: 'زیوی', grey: 'خۆڵەمێشی', gray: 'خۆڵەمێشی',
  brown: 'قاوەیی', orange: 'پرتەقاڵی', gold: 'ئاڵتوونی',
}

function formatWhatsApp(phone: string) {
  return 'https://wa.me/' + phone.replace(/^0/, '964')
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', direction: 'ltr' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{
            fontSize: 32,
            cursor: 'pointer',
            color: star <= value ? '#f5a623' : '#e0dcd6',
            transition: 'transform 0.15s',
            transform: star <= value ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function StarDisplay({ rating, size = 12 }: { rating: number; size?: number }) {
  const stars = []
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.3
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('★')
    else if (i === full && hasHalf) stars.push('★')
    else stars.push('☆')
  }
  return (
    <span style={{ color: '#f5a623', fontSize: size, letterSpacing: 1, direction: 'ltr', display: 'inline-block' }}>
      {stars.join('')}
    </span>
  )
}

export default function RideDetailPage() {
  const params = useParams()
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

  useEffect(() => {
    loadRide()
  }, [rideId])

  async function loadRide() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const { data, error } = await supabase
      .from('rides')
      .select('*, driver:profiles!driver_id(full_name, verified, avatar_url, phone)')
      .eq('id', rideId)
      .single()

    if (error || !data) {
      console.error('Error loading ride:', error?.message)
      setLoading(false)
      return
    }

    setRide(data)
    if (user && data.driver_id === user.id) setIsOwnRide(true)

    if (user) {
      const { data: existing } = await supabase
        .from('ride_requests')
        .select('id, status')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)
        .maybeSingle()
      if (existing) {
        setRequested(true)
        setRequestStatus(existing.status)
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

      if (ratings && ratings.length > 0) {
        const avg = ratings.reduce((sum: number, r: any) => sum + r.score, 0) / ratings.length
        setDriverAvgRating(Math.round(avg * 10) / 10)
        setDriverTripCount(ratings.length)
      }
    }

    setLoading(false)
  }

  async function handleSendRequest() {
    if (!currentUserId) return
    setSending(true)

    const { error } = await supabase.from('ride_requests').insert({
      ride_id: rideId,
      passenger_id: currentUserId,
      pickup: pickup || null,
      dropoff: dropoff || null,
      status: 'pending',
    })

    if (error) {
      console.error('Request error:', error.message)
      setSending(false)
      return
    }

    setRequested(true)
    setShowModal(false)
    setSending(false)
  }

  async function handleCompleteRide() {
    setCompleting(true)
    const { error } = await supabase
      .from('rides')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', rideId)

    if (error) {
      console.error('Complete error:', error.message)
      setCompleting(false)
      return
    }

    setRide((prev: any) => ({ ...prev, status: 'completed', completed_at: new Date().toISOString() }))
    setCompleting(false)
  }

  async function handleSubmitRating() {
    if (!currentUserId || !ride || selectedRating === 0) return
    setSubmittingRating(true)

    const visibleAfter = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

    const { error } = await supabase.from('ratings').insert({
      ride_id: rideId,
      rater_id: currentUserId,
      rated_id: ride.driver_id,
      score: selectedRating,
      visible_after: visibleAfter,
    })

    if (error) {
      console.error('Rating error:', error.message)
      setSubmittingRating(false)
      return
    }

    setHasRated(true)
    setSubmittingRating(false)
  }

  const pageWrap: React.CSSProperties = {
    direction: 'rtl',
    minHeight: '100vh',
    background: '#fafaf9',
    maxWidth: 480,
    margin: '0 auto',
    paddingBottom: '6rem',
    fontFamily: "'Noto Sans Arabic', sans-serif",
  }

  const inp: React.CSSProperties = {
    width: '100%',
    background: '#f5f5f4',
    border: '1px solid #e7e5e4',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: 13,
    outline: 'none',
    direction: 'rtl',
    resize: 'none',
  }

  if (loading) {
    return <div style={pageWrap}><BottomNav /></div>
  }

  if (!ride) {
    return (
      <div style={{ ...pageWrap, padding: '3rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: '#a8a29e' }}>ئەم ڕێیەکە نەدۆزرایەوە</p>
        <Link href="/home" style={{ color: '#df6530', marginTop: '1rem', display: 'inline-block' }}>{ku.back}</Link>
        <BottomNav />
      </div>
    )
  }

  const driver = ride.driver || {}
  const carParts = [ride.car_make, ride.car_model].filter(Boolean).join(' ')
  const carColor = ride.car_color || ''
  const waLink = driver.phone ? formatWhatsApp(driver.phone) : ''
  const isPastDeparture = new Date(ride.departure_time) < new Date()
  const isCompleted = ride.status === 'completed'
  const routeKey = `${ride.from_city}-${ride.to_city}`
  const routeInfo = ROUTE_INFO[routeKey]

  return (
    <div style={pageWrap}>

      <div style={{
        background: '#fff',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 36px rgba(0,0,0,0.06)',
        margin: '40px 12px',
      }}>

        <div style={{
          background: 'linear-gradient(160deg, #0f1923 0%, #1a2a3a 100%)',
          padding: '14px 20px 22px',
          position: 'relative',
        }}>
          <div style={{ marginBottom: 14 }}>
            <Link href="/home" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>← {ku.back}</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{CITIES[ride.from_city]}</span>
            <div style={{ flex: 1, position: 'relative', height: 2 }}>
              <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 2, background: 'rgba(255,255,255,0.12)', borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)', background: '#df6530', borderRadius: '50%', width: 8, height: 8 }} />
            </div>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{CITIES[ride.to_city]}</span>
          </div>

     <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.55)', flexWrap: 'wrap' }}>
            <span dir="ltr">📅 {new Date(ride.departure_time).toLocaleDateString('ar-u-nu-arab', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            <span dir="ltr">🕐 {new Date(ride.departure_time).toLocaleTimeString('ar-u-nu-arab', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            {routeInfo && <span>⏱ {routeInfo.duration}</span>}
            {routeInfo && <span>📍 {routeInfo.distance}</span>}
          </div>

          {isCompleted && (
            <div style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(22,163,74,0.15)',
              color: '#4ade80',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 8,
            }}>
              تەواو بوو ✓
            </div>
          )}
        </div>

        <div style={{
          margin: '-12px 16px 0',
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f0e6dc 0%, #e8d5c4 100%)',
            border: '2.5px solid #df6530',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 22,
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{driver.full_name || 'شۆفێر'}</span>
              {driver.verified && <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 10, padding: '1px 6px', borderRadius: 6, fontWeight: 600 }}>✓ پشتڕاستکراوە</span>}
            </div>
            {driverAvgRating !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StarDisplay rating={driverAvgRating} size={12} />
                <span style={{ fontSize: 12, color: '#888' }}>{driverAvgRating}</span>
                <span style={{ fontSize: 10, color: '#bbb' }}>• {driverTripCount} گەشت</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 20px' }}>

          {carParts && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
              padding: '10px 14px',
              background: '#f9f8f6',
              borderRadius: 12,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }} dir='ltr'>{carParts} 🚗</div>
                {carColor && <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{COLOR_KU[carColor.toLowerCase()] || carColor}</div>}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {ride.price_type === 'coffee' ? (
              <span style={{ background: '#f5f5f4', color: '#44403c', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>☕ قاوەیەک</span>
            ) : (
              <span style={{ background: '#f5f5f4', color: '#44403c', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{ride.price_iqd?.toLocaleString('ar-u-nu-arab')} دینار</span>
            )}

            {ride.available_seats > 0 ? (
              <span style={{ background: '#f5f5f4', color: '#44403c', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{ride.available_seats} شوێن</span>
            ) : (
              <span style={{ background: '#f5f5f4', color: '#78716c', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>پڕە</span>
            )}

            {ride.smoking !== null && (
              <span style={{ background: '#f3f3f3', color: '#777', padding: '6px 16px', borderRadius: 20, fontSize: 13 }}>
                {ride.smoking ? '🚬' : '🚭'}
              </span>
            )}
          </div>

          {ride.notes && (
            <div style={{
              padding: '12px 14px',
              background: '#faf9f7',
              borderRadius: 12,
              borderRight: '3px solid #df6530',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, color: '#bbb', marginBottom: 4, fontWeight: 600 }}>تێبینی</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>{ride.notes}</div>
            </div>
          )}
        </div>

        <div style={{ padding: '0 20px 22px' }}>

          {isOwnRide && (
            isPastDeparture && !isCompleted ? (
              <button
                onClick={handleCompleteRide}
                disabled={completing}
                style={{
                  width: '100%',
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: 15,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: completing ? 0.5 : 1,
                }}
              >
                {completing ? '...' : 'گەشتەکە تەواو بوو ✓'}
              </button>
            ) : isCompleted ? (
              <div style={{ textAlign: 'center', background: '#f0fdf4', borderRadius: 14, padding: '18px 16px', border: '1.5px solid #bbf7d0' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}></span>
                <p style={{ fontWeight: 600, color: '#16a34a', fontSize: 14 }}>گەشتەکە تەواو بوو</p>
                <p style={{ fontSize: 11, color: '#86efac', marginTop: 4 }}>ڕێکەوت: {new Date(ride.completed_at).toLocaleDateString('en-GB')}</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', background: '#fafaf9', borderRadius: 14, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: '#a8a29e' }}>ئەمە گەشتەکەی خۆتە</p>
              </div>
            )
          )}

          {!isOwnRide && (
            isCompleted && requestStatus === 'approved' ? (
              !hasRated ? (
                <div style={{
                  textAlign: 'center',
                  background: '#fffbf5',
                  borderRadius: 14,
                  padding: '20px 16px',
                  border: '1.5px solid #fde8d0',
                }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>چۆن بوو گەشتەکە؟</p>
                  <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 14 }}>هەڵسەنگاندنەکەت دوای ٧٢ کاتژمێر دەردەکەوێ</p>
                  <StarSelector value={selectedRating} onChange={setSelectedRating} />
                  {selectedRating > 0 && (
                    <button
                      onClick={handleSubmitRating}
                      disabled={submittingRating}
                      style={{
                        marginTop: 14,
                        width: '100%',
                        background: '#df6530',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        padding: 13,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        opacity: submittingRating ? 0.5 : 1,
                      }}
                    >
                      {submittingRating ? '...' : 'ناردن'}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', background: '#f0fdf4', borderRadius: 14, padding: '18px 16px', border: '1.5px solid #bbf7d0' }}>
                  <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>⭐</span>
                  <p style={{ fontWeight: 600, color: '#16a34a', fontSize: 14 }}>سوپاس بۆ هەڵسەنگاندنەکەت!</p>
                  <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 4 }}>هەڵسەنگاندنەکەت دوای ٧٢ کاتژمێر دەردەکەوێ</p>
                </div>
              )
            ) :
            !requested ? (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '100%',
                  background: '#df6530',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: 15,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(223,101,48,0.25)',
                }}
              >
                بەڵێ! داواکاری بنێرە
              </button>
            ) : requestStatus === 'approved' ? (
              <div style={{
                textAlign: 'center',
                border: '1.5px solid #16a34a',
                background: '#f0fdf4',
                borderRadius: 14,
                padding: '18px 16px',
              }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}></span>
                <p style={{ fontWeight: 600, color: '#16a34a', marginBottom: 12, fontSize: 14 }}>قبوڵ کرا!</p>
                {waLink ? (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#25D366', color: 'white', border: 'none', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                    پەیامێک بنێرە <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style={{display:"inline",verticalAlign:"middle",marginRight:"0.3rem"}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                ) : (
                  <p style={{ color: '#a8a29e', fontSize: 13 }}>شۆفێر ژمارەی مۆبایلی زیاد نەکردووە</p>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', background: '#fafaf9', borderRadius: 14, padding: '18px 16px' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>⏳</span>
                <p style={{ fontWeight: 600, color: '#44403c', fontSize: 14 }}>{ku.requestSent}</p>
                <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 4 }}>{ku.contactRevealNote}</p>
              </div>
            )
          )}
        </div>

      </div>

      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: 'white', width: '100%', maxWidth: 420, borderRadius: 24, padding: '24px 20px', direction: 'rtl' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>دەمەوێ!</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#78716c', display: 'block', marginBottom: 4, textAlign: 'right', paddingRight: 4 }}>سواربوون</label>
                <input value={pickup} onChange={e => setPickup(e.target.value)} style={inp} placeholder="لە کوێ سوار دەبی؟" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#78716c', display: 'block', marginBottom: 4, textAlign: 'right', paddingRight: 4 }}>دابەزین</label>
                <input value={dropoff} onChange={e => setDropoff(e.target.value)} style={inp} placeholder="لە کوێ دادەبەزی؟" />
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#a8a29e', textAlign: 'center', marginBottom: 12, lineHeight: 1.6 }}>
              دوای ئەوەی داواکارییەکت پەسەند کرا، ژمارەی مۆبایلەکەت لەگەڵ شۆفێر شێر دەکرێ
            </p>
            <button
              style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 8, opacity: sending ? 0.5 : 1 }}
              disabled={sending}
              onClick={handleSendRequest}
            >
              {sending ? '...چاوەڕوان بە' : ku.sendRequest}
            </button>
            <button
              style={{ width: '100%', background: 'transparent', color: '#78716c', border: 'none', borderRadius: 12, padding: 12, fontSize: 14, cursor: 'pointer' }}
              onClick={() => setShowModal(false)}
            >
              {ku.cancel}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}