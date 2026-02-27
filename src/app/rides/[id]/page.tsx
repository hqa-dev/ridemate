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

function formatWhatsApp(phone: string) {
  return 'https://wa.me/' + phone.replace(/^0/, '964')
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

  return (
    <div style={pageWrap}>

      {/* ===== THE CARD — exact mockup values ===== */}
      <div style={{
        background: '#fff',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 36px rgba(0,0,0,0.06)',
        margin: '8px 12px',
      }}>

        {/* ===== HERO ===== */}
        <div style={{
          background: 'linear-gradient(160deg, #0f1923 0%, #1a2a3a 100%)',
          padding: '16px 20px 28px',
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

          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            <span dir="ltr">📅 {new Date(ride.departure_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            <span dir="ltr">🕐 {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* ===== DRIVER CARD — floating ===== */}
        <div style={{
          margin: '-10px 16px 0',
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
              {driver.verified && <span style={{ color: '#2e7d32', fontSize: 13 }}>✓</span>}
            </div>
          </div>
        </div>

        {/* ===== DETAILS ===== */}
        <div style={{ padding: '16px 20px' }}>

          {/* Car info */}
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
              <span style={{ fontSize: 20 }}>🚗</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{carParts}</div>
                {carColor && <div style={{ fontSize: 11, color: '#999' }}>{carColor}</div>}
              </div>
            </div>
          )}

          {/* Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {ride.price_type === 'coffee' ? (
              <span style={{ background: '#fef3eb', color: '#df6530', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>☕ قاوەیەک</span>
            ) : (
              <span style={{ background: '#fef3eb', color: '#df6530', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{ride.price_iqd?.toLocaleString()} دینار</span>
            )}

            {ride.available_seats > 0 ? (
              <span style={{ background: '#eef6ff', color: '#2563eb', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{ride.available_seats} شوێن</span>
            ) : (
              <span style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>پڕە</span>
            )}

            {ride.smoking !== null && (
              <span style={{ background: '#f3f3f3', color: '#777', padding: '6px 16px', borderRadius: 20, fontSize: 13 }}>
                {ride.smoking ? '🚬' : '🚭'}
              </span>
            )}
          </div>

          {/* Notes */}
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

        {/* CTA */}
        <div style={{ padding: '0 20px 22px' }}>
          {!isOwnRide && (
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
                <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>✅</span>
                <p style={{ fontWeight: 600, color: '#16a34a', marginBottom: 12, fontSize: 14 }}>قبوڵ کرا!</p>
                {waLink ? (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#25D366', color: 'white', border: 'none', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                    پەیامێک بنێرە 📱
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

      {/* ===== REQUEST MODAL ===== */}
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