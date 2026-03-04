'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { T } from '@/lib/theme'
import { RideCard, REQUEST_STATUS, RIDE_CANCELLED_STATUS } from '@/components/ui/RideCard'

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

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
          const isRideCancelled = ride.status === 'cancelled'
          const st = isRideCancelled ? RIDE_CANCELLED_STATUS : (REQUEST_STATUS[req.status] || REQUEST_STATUS.pending)
          const isDimmed = req.status === 'declined' || req.status === 'cancelled' || isRideCancelled

          return <RideCard key={req.id} ride={ride} status={st} dimmed={isDimmed} />
        })}
      </div>

      <BottomNav />
    </div>
  )
}
