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
    maxWidth: '480px',
    margin: '0 auto',
    paddingBottom: '6rem',
  }

  const inp: React.CSSProperties = {
    width: '100%',
    background: '#f5f5f4',
    border: '1px solid #e7e5e4',
    borderRadius: '0.75rem',
    padding: '0.6rem 0.75rem',
    fontSize: '0.85rem',
    outline: 'none',
    direction: 'rtl',
    resize: 'none',
  }

  if (loading) {
    return (
      <div style={pageWrap}>
        <BottomNav />
      </div>
    )
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
  const carDisplay = carParts ? `${carParts}${ride.car_color ? ' - ' + ride.car_color : ''}` : ''

  return (
    <div style={pageWrap}>

      {/* Back button - floating over hero */}
      <div style={{ padding: '1rem 1.25rem 0', position: 'relative', zIndex: 10 }}>
        <Link href="/home" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>← {ku.back}</Link>
      </div>

      {/* ===== HERO — Midnight Navy ===== */}
      <div style={{
        background: 'linear-gradient(160deg, #0f1923 0%, #1a2a3a 100%)',
        padding: '0.75rem 1.25rem 1.25rem',
        marginBottom: '-0.75rem',
        borderRadius: '0 0 1.5rem 1.5rem',
        position: 'relative',
      }}>
        {/* Route */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>{CITIES[ride.from_city]}</span>
          <div style={{ flex: 1, position: 'relative', height: '2px' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: '2px', background: 'rgba(255,255,255,0.12)', borderRadius: '1px' }} />
            <div style={{ position: 'absolute', top: '-3px', left: '50%', transform: 'translateX(-50%)', background: '#df6530', borderRadius: '50%', width: '8px', height: '8px' }} />
          </div>
          <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>{CITIES[ride.to_city]}</span>
        </div>

        {/* Meta line */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
          <span dir="ltr">
            📅 {new Date(ride.departure_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
          <span dir="ltr">
            🕐 {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ===== FLOATING DRIVER CARD ===== */}
      <div style={{
        margin: '0 1rem',
        background: '#fff',
        borderRadius: '1rem',
        padding: '1rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        gap: '0.85rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            background: driver.avatar_url ? `url(${driver.avatar_url}) center/cover` : 'linear-gradient(135deg, #f0e6dc 0%, #e8d5c4 100%)',
            border: '2.5px solid #df6530',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
          }}>
            {!driver.avatar_url && '👤'}
          </div>
        </div>

        {/* Driver info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c1917' }}>{driver.full_name || 'شۆفێر'}</span>
            {driver.verified && (
              <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>پشتڕاست</span>
            )}
          </div>
        </div>
      </div>

      {/* ===== BODY CONTENT ===== */}
      <div style={{ padding: '0.75rem 1.25rem 0' }}>

        {/* Car info */}
        {carDisplay && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '0.75rem',
            padding: '0.65rem 0.85rem',
            background: '#f9f8f6',
            borderRadius: '0.75rem',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🚗</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>{carDisplay}</span>
          </div>
        )}

        {/* Pills row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {ride.price_type === 'coffee' ? (
            <span style={{ background: '#fef3eb', color: '#df6530', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
              ☕ {ku.coffeeAndConvo}
            </span>
          ) : (
            <span style={{ background: '#fef3eb', color: '#df6530', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
              {ride.price_iqd?.toLocaleString()} دینار
            </span>
          )}

          {ride.available_seats > 0 ? (
            <span style={{ background: '#eef6ff', color: '#2563eb', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
              💺 {ride.available_seats} شوێن
            </span>
          ) : (
            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
              پڕە
            </span>
          )}

          {ride.smoking !== null && (
            <span style={{ background: '#f3f3f3', color: '#777', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.8rem' }}>
              {ride.smoking ? '🚬 جگەرەکێشە' : '🚭 بێ جگەرە'}
            </span>
          )}
        </div>

        {/* Notes */}
        {ride.notes && (
          <div style={{
            padding: '0.75rem 0.85rem',
            background: '#faf9f7',
            borderRadius: '0.75rem',
            borderRight: '3px solid #df6530',
            marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#bbb', marginBottom: '0.25rem', fontWeight: 600 }}>تێبینی</div>
            <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.8 }}>{ride.notes}</div>
          </div>
        )}

        {/* ===== CTA AREA ===== */}
        {!isOwnRide && (
          !requested ? (
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: '100%',
                background: '#df6530',
                color: '#fff',
                border: 'none',
                borderRadius: '0.85rem',
                padding: '0.9rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(223,101,48,0.25)',
                marginTop: '0.25rem',
              }}
            >
              بەڵێ! داواکاری بنێرە
            </button>
          ) : requestStatus === 'approved' ? (
            <div style={{
              textAlign: 'center',
              border: '1.5px solid #16a34a',
              background: '#f0fdf4',
              borderRadius: '1rem',
              padding: '1.25rem',
            }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✅</span>
              <p style={{ fontWeight: 600, color: '#16a34a', marginBottom: '0.75rem' }}>قبوڵ کرا!</p>
              {driver.phone ? (
                
                  href={'https://wa.me/' + driver.phone.replace(/^0/, '964')}
                  target="_blank"
                  style={{
                    display: 'block',
                    background: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  پەیامێک بنێرە
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              ) : (
                <p style={{ color: '#a8a29e', fontSize: '0.85rem' }}>شۆفێر ژمارەی مۆبایلی زیاد نەکردووە</p>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⏳</span>
              <p style={{ fontWeight: 600, color: '#44403c' }}>{ku.requestSent}</p>
              <p style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '0.25rem' }}>{ku.contactRevealNote}</p>
            </div>
          )
        )}
      </div>

      {/* ===== REQUEST MODAL ===== */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1.25rem' }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '1.5rem', padding: '1.5rem 1.25rem', direction: 'rtl' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>دەمەوێ!</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: '#78716c', display: 'block', marginBottom: '0.25rem', textAlign: 'right', paddingRight: '0.25rem' }}>سواربوون</label>
                <input value={pickup} onChange={e => setPickup(e.target.value)} style={inp} placeholder="لە کوێ سوار دەبی؟" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: '#78716c', display: 'block', marginBottom: '0.25rem', textAlign: 'right', paddingRight: '0.25rem' }}>دابەزین</label>
                <input value={dropoff} onChange={e => setDropoff(e.target.value)} style={inp} placeholder="لە کوێ دادەبەزی؟" />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#a8a29e', textAlign: 'center', marginBottom: '0.75rem', lineHeight: 1.6 }}>
              دوای ئەوەی داواکارییەکت پەسەند کرا، ژمارەی مۆبایلەکەت لەگەڵ شۆفێر شێر دەکرێ
            </p>
            <button
              style={{
                width: '100%',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '0.5rem',
                opacity: sending ? 0.5 : 1,
              }}
              disabled={sending}
              onClick={handleSendRequest}
            >
              {sending ? '...چاوەڕوان بە' : ku.sendRequest}
            </button>
            <button
              style={{ width: '100%', background: 'transparent', color: '#78716c', border: 'none', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '0.95rem', cursor: 'pointer' }}
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
