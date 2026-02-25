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

    // Check if already requested
    if (user) {
      const { data: existing } = await supabase
        .from('ride_requests')
        .select('id')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)
        .maybeSingle()
      if (existing) setRequested(true)
    }

    setLoading(false)
  }

  async function handleSendRequest() {
    if (!currentUserId || !pickup) return
    setSending(true)

    const { error } = await supabase.from('ride_requests').insert({
      ride_id: rideId,
      passenger_id: currentUserId,
      pickup,
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#44403c' }}>{ride.available_seats.toLocaleString('ar-u-nu-arab')}</span>
          <span style={sectionLabel}>{ku.seatsAvailable}</span>
        </div>
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
          ? <button style={btn} onClick={() => setShowModal(true)}>دەمەوێ!</button>
          : <div style={{ ...card, textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⏳</span>
              <p style={{ fontWeight: 600, color: '#44403c' }}>{ku.requestSent}</p>
              <p style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '0.25rem' }}>{ku.contactRevealNote}</p>
            </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '1.5rem 1.5rem 0 0', padding: '1.5rem 1.25rem 2rem', direction: 'rtl' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>دەمەوێ!</h2>
            <p style={{ color: '#78716c', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.8 }}>{ku.whereExactly}</p>
            <label style={{ fontSize: '0.85rem', color: '#57534e', display: 'block', marginBottom: '0.4rem' }}>سواربوون:</label>
            <input value={pickup} onChange={e => setPickup(e.target.value)} style={{ ...inp, marginBottom: '0.75rem' }} placeholder="لە کوێ سوار دەبی؟" />
            <label style={{ fontSize: '0.85rem', color: '#57534e', display: 'block', marginBottom: '0.4rem' }}>دابەزین:</label>
            <input value={dropoff} onChange={e => setDropoff(e.target.value)} style={{ ...inp, marginBottom: '1rem' }} placeholder="لە کوێ دادەبەزی؟" />
            <button style={{ ...btn, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', marginBottom: '0.5rem', opacity: sending ? 0.5 : 1 }} disabled={sending} onClick={handleSendRequest}>
              {sending ? '...چاوەڕوان بە' : ku.sendRequest}
            </button>
            <button style={{ ...btnSec, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }} onClick={() => setShowModal(false)}>{ku.cancel}</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
