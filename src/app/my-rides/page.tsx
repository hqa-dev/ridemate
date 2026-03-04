'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { CITIES, ROUTE_DISTANCE, formatTime, estimateArrival, toKurdishNum, formatKurdishDate } from '@/lib/utils'
import { T } from '@/lib/theme'

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const statusConfig: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: 'چاوەڕوانە', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  approved: { text: 'قبوڵ کرا', color: T.green, bg: 'rgba(74,222,128,0.1)' },
  declined: { text: 'ڕەت کرایەوە', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  cancelled: { text: 'هەڵوەشێنرایەوە', color: T.textMid, bg: 'rgba(255,255,255,0.05)' },
}

export default function MyRidesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('ride_requests')
      .select('id, status, ride:rides(id, from_city, to_city, departure_time, available_seats, price_type, price_iqd, status, driver:profiles!driver_id(full_name))')
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false })

    setRides(data || [])
    setLoading(false)
  }

  return (
    <div style={{
      direction: 'rtl', minHeight: '100vh', background: T.bg,
      fontFamily: "'Noto Sans Arabic', sans-serif", maxWidth: 480, margin: '0 auto',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 20px 20px', gap: 12 }}>
        <div onClick={() => router.back()} style={{ cursor: 'pointer', padding: 4 }}><BackArrow /></div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>گەشتەکانم</h1>
      </div>

      <div style={{ padding: '0 20px' }}>
        {loading ? <div /> : rides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 13, color: T.textDim }}>هێشتا داوای هیچ گەشتێکت نەکردووە</p>
          </div>
        ) : rides.map(req => {
          const ride = req.ride
          if (!ride) return null
          const driver = ride.driver || {}
          const depTime = toKurdishNum(formatTime(ride.departure_time))
          const arrTime = toKurdishNum(estimateArrival(ride.departure_time, ride.from_city, ride.to_city))
          const routeKey = `${ride.from_city}-${ride.to_city}`
          const distance = ROUTE_DISTANCE[routeKey] || ''
          const priceDisplay = ride.price_type === 'coffee'
            ? 'قاوەیەک'
            : `${toKurdishNum(Number(ride.price_iqd || 0).toLocaleString('en'))} دینار`
          const isRideCancelled = ride.status === 'cancelled'
          const st = isRideCancelled
            ? { text: 'هەڵوەشێنرایەوە', color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
            : (statusConfig[req.status] || statusConfig.pending)
          const isDimmed = req.status === 'declined' || req.status === 'cancelled' || isRideCancelled

          return (
            <Link key={req.id} href={`/rides/${ride.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: T.card, borderRadius: 16, marginBottom: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden',
                opacity: isDimmed ? 0.5 : 1,
              }}>
                {/* Date */}
                <div style={{ padding: '8px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
                  <span style={{
                    fontSize: 9, padding: '2px 8px', borderRadius: 20,
                    background: st.bg, color: st.color, fontWeight: 600,
                  }}>{st.text}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatKurdishDate(ride.departure_time)}</span>
                </div>

                {/* Timeline */}
                <div style={{ padding: '2px 18px 12px' }} dir="ltr">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', minWidth: 44 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e5e5' }}>{arrTime}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, margin: '0 8px' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#e5e5e5', flexShrink: 0 }} />
                      <div style={{ flex: 1, height: 2, position: 'relative', margin: '0 2px' }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.85), transparent 45%, transparent 55%, rgba(255,255,255,0.85))', opacity: 0.5 }} />
                      </div>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)', flexShrink: 0 }} />
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 44 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#e5e5e5' }}>{depTime}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: '#ccc', minWidth: 44, textAlign: 'center' }}>{CITIES[ride.to_city]}</span>
                    <span style={{ fontSize: 9, color: '#aaa' }}>{distance}</span>
                    <span style={{ fontSize: 11, color: '#ccc', minWidth: 44, textAlign: 'center' }}>{CITIES[ride.from_city]}</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 18px', display: 'flex', alignItems: 'center', direction: 'rtl' }}>
                  <span style={{ flex: 1, textAlign: 'right', fontSize: 12, color: '#aaa' }}>{driver.full_name || 'شۆفێر'}</span>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#777' }}>
                    {toKurdishNum(ride.available_seats)} جێ بەردەستە
                  </span>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 12, color: '#aaa' }}>{priceDisplay}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
