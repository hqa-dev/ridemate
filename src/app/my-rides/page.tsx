'use client'
import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { RideCard } from '@/components/ui/RideCard'
import { REQUEST_STATUS, RIDE_CANCELLED_STATUS } from '@/lib/constants'
import { kurdishStrings } from '@/lib/strings'
import PageHeader from '@/components/ui/PageHeader'


export default function MyRidesPage() {
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
      direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)',
      maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto',
      paddingBottom: 'var(--space-navClearanceLg)',
    }}>
      <PageHeader title={kurdishStrings.myRidesTitle} back />

      <div style={{ padding: '0 var(--space-page-x)' }}>
        {loading ? <div /> : rides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px var(--space-page-x)' }}>
            <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-muted)' }}>{kurdishStrings.noRequestedRides}</p>
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
