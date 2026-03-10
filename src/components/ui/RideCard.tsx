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
        border: `2px solid ${T.border}`,
        borderRadius: 12,
        boxShadow: `3px 3px 0 ${T.text}`,
        marginBottom: 10,
        overflow: 'hidden',
        opacity: dimmed ? 0.5 : (isFull && !status) ? 0.6 : 1,
      }}>

        {/* Status pill or edit button — only shown when present */}
        {(status || editButton) && (
          <div style={{ padding: '8px 12px 0', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }} dir="rtl">
            {status ? (
              <span style={{
                fontSize: 'var(--font-size-body)', padding: '3px 8px', borderRadius: 6,
                background: status.bg, color: status.color, fontWeight: 700,
                border: `2px solid ${T.text}`,
                boxShadow: `2px 2px 0 ${T.text}`,
              }}>{status.text}</span>
            ) : (
              <div onClick={e => e.preventDefault()}>{editButton}</div>
            )}
          </div>
        )}

        {/* Sketch car */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 12px 6px' }}>
          <SketchCar size={52} color={dimmed ? T.textDim : T.accent} />
        </div>

        {/* Dashed divider above route */}
        <div style={{ borderTop: `1.5px dashed ${T.textDim}`, margin: '0 12px 8px', opacity: 0.4 }} />

        {/* Route line */}
        <div style={{ padding: '0 12px' }}>
          <RouteLine
            from={CITIES[ride.from_city]}
            to={CITIES[ride.to_city]}
            dep={depTime}
            arr={arrTime}
          />
        </div>

        {/* Dashed divider above footer */}
        <div style={{ borderTop: `1.5px dashed ${T.textDim}`, margin: '8px 12px 6px', opacity: 0.3 }} />

        {/* Footer — driver · seats · price */}
        <div style={{ padding: '0 12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
          {/* Driver with sketch person icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)'}}>
            <div style={{
              width: 22, height: 22, borderRadius: 5,
              border: `1.5px solid ${T.border}`,
              background: T.cardInner,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SketchPerson size={14} />
            </div>
            <span style={{ fontSize: 'var(--font-size-heading)', fontWeight: 700, color: T.text }}>{driver.full_name || kurdishStrings.driverLabel}</span>
          </div>
          {/* Seats · price */}
          <span style={{ fontSize: 'var(--font-size-body)', color: T.textDim }}>
            {isFull ? kurdishStrings.statusFull : seatsDisplay} · {priceDisplay}
          </span>
        </div>

      </div>
    </Link>
  )
})

// Re-export constants from canonical location
export { REQUEST_STATUS, RIDE_CANCELLED_STATUS } from '@/lib/constants'
