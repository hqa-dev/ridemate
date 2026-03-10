import { memo } from 'react'
import Link from 'next/link'
import { CITIES, ROUTE_DISTANCE, formatTime, estimateArrival, toKurdishNum } from '@/lib/utils'
import { T } from '@/lib/theme'
import SketchCar from '@/components/ui/icons/SketchCar'
import SketchPerson from '@/components/ui/icons/SketchPerson'
import RouteLine from '@/components/ui/icons/RouteLine'
import { REQUEST_STATUS, RIDE_CANCELLED_STATUS } from '@/lib/constants'
import { kurdishStrings } from '@/lib/strings'

interface RideCardProps {
  ride: {
    id: string
    from_city: string
    to_city: string
    departure_time: string
    available_seats: number
    price_type: string
    price_iqd?: number | null
    driver?: { full_name?: string } | null
  }
  status?: { text: string; color: string; bg: string } | null
  dimmed?: boolean
  editButton?: React.ReactNode
}

export const RideCard = memo(function RideCard({ ride, status, dimmed, editButton }: RideCardProps) {
  const driver = ride.driver || {}
  const depTime = toKurdishNum(formatTime(ride.departure_time))
  const arrTime = toKurdishNum(estimateArrival(ride.departure_time, ride.from_city, ride.to_city))
  const routeKey = `${ride.from_city}-${ride.to_city}`
  const distance = ROUTE_DISTANCE[routeKey] || ''
  const priceDisplay = ride.price_type === 'coffee'
    ? '☕'
    : `${toKurdishNum(Number(ride.price_iqd || 0).toLocaleString('en'))} ${kurdishStrings.iqdAmount}`
  const isFull = ride.available_seats <= 0
  const seatsDisplay = `${toKurdishNum(ride.available_seats)} ${kurdishStrings.seat}`

  return (
    <Link href={`/rides/${ride.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        marginBottom: 14,
        overflow: 'hidden',
        padding: '14px 16px',
        opacity: dimmed ? 0.5 : (isFull && !status) ? 0.6 : 1,
      }}>

        {/* Status pill or edit button — only shown when present */}
        {(status || editButton) && (
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }} dir="rtl">
            {status ? (
              <span style={{
                fontSize: 'var(--font-size-body)', padding: '3px 8px', borderRadius: 6,
                background: status.bg, color: status.color, fontWeight: 700,
              }}>{status.text}</span>
            ) : (
              <div onClick={e => e.preventDefault()}>{editButton}</div>
            )}
          </div>
        )}

        {/* Route line */}
        <RouteLine
          from={CITIES[ride.from_city]}
          to={CITIES[ride.to_city]}
          dep={depTime}
          arr={arrTime}
        />

        {/* Footer — driver · seats · price */}
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 'var(--font-size-body)', color: T.textDim }}>
          {driver.full_name || kurdishStrings.driverLabel} · {isFull ? kurdishStrings.statusFull : seatsDisplay} · {priceDisplay}
        </div>

      </div>
    </Link>
  )
})

// Re-export constants from canonical location
export { REQUEST_STATUS, RIDE_CANCELLED_STATUS } from '@/lib/constants'
