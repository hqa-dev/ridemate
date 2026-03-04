import Link from 'next/link'
import { CITIES, ROUTE_DISTANCE, formatTime, estimateArrival, toKurdishNum, formatKurdishDate } from '@/lib/utils'
import { T } from '@/lib/theme'

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

export function RideCard({ ride, status, dimmed, editButton }: RideCardProps) {
  const driver = ride.driver || {}
  const depTime = toKurdishNum(formatTime(ride.departure_time))
  const arrTime = toKurdishNum(estimateArrival(ride.departure_time, ride.from_city, ride.to_city))
  const routeKey = `${ride.from_city}-${ride.to_city}`
  const distance = ROUTE_DISTANCE[routeKey] || ''
  const priceDisplay = ride.price_type === 'coffee'
    ? 'قاوەیەک'
    : `${toKurdishNum(Number(ride.price_iqd || 0).toLocaleString('en'))} دینار`
  const isFull = ride.available_seats <= 0
  const seatsDisplay = `${toKurdishNum(ride.available_seats)} جێ بەردەستە`

  return (
    <Link href={`/rides/${ride.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: T.card, borderRadius: 16, marginBottom: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden',
        opacity: dimmed ? 0.5 : (isFull && !status) ? 0.6 : 1,
      }}>
        {/* Header — date + optional status pill */}
        <div style={{ padding: '8px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="ltr">
          {status ? (
            <span style={{
              fontSize: 9, padding: '2px 8px', borderRadius: 20,
              background: status.bg, color: status.color, fontWeight: 600,
            }}>{status.text}</span>
          ) : editButton ? (
            <div onClick={e => e.preventDefault()}>{editButton}</div>
          ) : (
            <span />
          )}
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
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.25)', opacity: 0.3 }} />
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

        {/* Footer — driver · seats · price */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 18px', display: 'flex', alignItems: 'center', direction: 'rtl' }}>
          <span style={{ flex: 1, textAlign: 'right', fontSize: 12, color: '#aaa' }}>{driver.full_name || 'شۆفێر'}</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: isFull ? 'rgba(255,255,255,0.85)' : '#777', fontWeight: isFull ? 700 : undefined }}>
            {isFull ? '٠ جێ' : seatsDisplay}
          </span>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 400, color: '#aaa' }}>{priceDisplay}</span>
        </div>
      </div>
    </Link>
  )
}

// Shared status configs
export const REQUEST_STATUS: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: 'چاوەڕوانە', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  approved: { text: 'قبوڵ کرا', color: T.green, bg: 'rgba(74,222,128,0.1)' },
  declined: { text: 'ڕەت کرایەوە', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  cancelled: { text: 'هەڵوەشێنرایەوە', color: T.textMid, bg: 'rgba(255,255,255,0.05)' },
}

export const RIDE_CANCELLED_STATUS = { text: 'هەڵوەشێنرایەوە', color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
