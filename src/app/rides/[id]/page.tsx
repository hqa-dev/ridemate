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

  const card = { background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '0.75rem' } as React.CSSProperties
  const btn = { background: '#df6530', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%' } as React.CSSProperties
  const btnSec = { background: '#f5f5f4', color: '#44403c', border: 'none', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', width: '100%' } as React.CSSProperties
  const inp = { width: '100%', background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none', direction: 'rtl', resize: 'none' } as React.CSSProperties
  const sectionLabel = { fontSize: '0.7rem', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' } as React.CSSProperties

  if (loading) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
        <BottomNav />
      </div>
    )
  }

  if (!ride) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '3rem 1.25rem', textAlign: 'center' }}>
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
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link href="/home" style={{ color: '#78716c', textDecoration: 'none', fontSize: '0.9rem' }}>← {ku.back}</Link>
        <span style={{ color: '#a8a29e', fontSize: '0.85rem' }}>{ku.rideDetails}</span>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c1917' }}>{CITIES[ride.from_city]}</span>
          <span style={{ color: '#d6d3d1', fontSize: '1.2rem' }}>←</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c1917' }}>{CITIES[ride.to_city]}</span>
        </div>
        <span style={{ color: '#78716c', fontSize: '0.85rem' }} dir="ltr">
          {new Date(ride.departure_time).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div style={card}>
        <span style={sectionLabel}>{ku.driverInfo}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#1c1917', marginBottom: '0.25rem' }}>{driver.full_name || 'شۆفێر'}</div>
            {driver.verified && <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600 }}>{ku.verified}</span>}
          </div>
        </div>
        {carDisplay && (
          <div style={{ background: '#f5f5f4', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '0.85rem', color: '#57534e' }}>
            {carDisplay}
          </div>
        )}
      </div>

      <div style={card}>
        <span style={sectionLabel}>{ku.price}</span>
        {ride.price_type === 'coffee'
          ? <>
              <span style={{ background: '#f5f5f4', color: '#57534e', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.9rem' }}>{ku.coffeeAndConvo}</span>
            </>
          : <span style={{ background: '#f5f5f4', color: '#57534e', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.9rem' }}>{ride.price_iqd?.toLocaleString()} دینار</span>
        }
      </div>

      <div style={card}>
        <span style={sectionLabel}>{ku.seatsAvailable}</span>
        <span style={{ background: '#f5f5f4', color: '#57534e', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.9rem' }}>{ride.available_seats} شوێن</span>
      </div>

      {ride.smoking !== null && (
        <div style={card}>
          <span style={{ background: ride.smoking ? '#fef2f2' : '#f0fdf4', color: ride.smoking ? '#dc2626' : '#16a34a', fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '999px', fontWeight: 600 }}>
            {ride.smoking ? '🚬 جگەرەکێشە' : '🚭 جگەرەکێش نییە'}
          </span>
        </div>
      )}

      {ride.notes && (
        <div style={card}>
          <span style={sectionLabel}>{ku.notes}</span>
          <p style={{ color: '#57534e', fontSize: '0.9rem', lineHeight: 1.8 }}>{ride.notes}</p>
        </div>
      )}

      {!isOwnRide && (
        !requested
          ? <button style={btn} onClick={() => setShowModal(true)}>بەڵێ!</button>
          : requestStatus === 'approved' ? (
            <div style={{ ...card, textAlign: 'center', border: '1.5px solid #16a34a', background: '#f0fdf4' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✅</span>
              <p style={{ fontWeight: 600, color: '#16a34a', marginBottom: '0.75rem' }}>قبوڵ کرا!</p>
              {driver.phone ? (
                <a href={'https://wa.me/' + driver.phone.replace(/^0/, '964')} target="_blank" style={{ display: 'block', background: '#25D366', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                  پەیامێک بنێرە <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style={{display:"inline",verticalAlign:"middle",marginRight:"0.4rem"}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              ) : (
                <p style={{ color: '#a8a29e', fontSize: '0.85rem' }}>شۆفێر ژمارەی مۆبایلی زیاد نەکردووە</p>
              )}
            </div>
          ) : (
            <div style={{ ...card, textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⏳</span>
              <p style={{ fontWeight: 600, color: '#44403c' }}>{ku.requestSent}</p>
              <p style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '0.25rem' }}>{ku.contactRevealNote}</p>
            </div>
          )
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1.25rem' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '1.5rem', padding: '1.5rem 1.25rem', direction: 'rtl' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>دەمەوێ!</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: '#78716c', display: 'block', marginBottom: '0.25rem', textAlign: 'right', paddingRight: '0.25rem' }}>سواربوون</label>
                <input value={pickup} onChange={e => setPickup(e.target.value)} style={{ ...inp, fontSize: '0.85rem', padding: '0.6rem 0.75rem' }} placeholder="لە کوێ سوار دەبی؟" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: '#78716c', display: 'block', marginBottom: '0.25rem', textAlign: 'right', paddingRight: '0.25rem' }}>دابەزین</label>
                <input value={dropoff} onChange={e => setDropoff(e.target.value)} style={{ ...inp, fontSize: '0.85rem', padding: '0.6rem 0.75rem' }} placeholder="لە کوێ دادەبەزی؟" />
              </div>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#a8a29e", textAlign: "center", marginBottom: "0.75rem", lineHeight: 1.6 }}>دوای ئەوەی داواکارییەکت پەسەند کرا، ژمارەی مۆبایلەکەت لەگەڵ شۆفێر شێر دەکرێ</p>
            <button style={{ ...btn, background: '#16a34a', color: 'white', marginBottom: '0.5rem', opacity: sending ? 0.5 : 1 }} disabled={sending} onClick={handleSendRequest}>
              {sending ? '...چاوەڕوان بە' : ku.sendRequest}
            </button>
            <button style={{ ...btnSec, color: '#78716c', background: 'transparent', border: 'none' }} onClick={() => setShowModal(false)}>{ku.cancel}</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
