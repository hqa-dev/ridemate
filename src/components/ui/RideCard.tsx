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
        background: T.card,
        borderRadius: 12,
        marginBottom: 12,
        border: `2px solid ${T.border}`,
        boxShadow: T.cardShadow,
        overflow: 'hidden',
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
          <span style={{ fontSize: 12, color: T.textDim }}>{formatKurdishDate(ride.departure_time)}</span>
        </div>

        {/* Sketch car */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 8px' }}>
          <svg width="90" height="50" viewBox="0 0 80 44" fill="none"
            stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 28 Q8 18 16 14 Q28 10 42 10 Q54 10 62 14 Q70 18 72 28 L74 34 Q74 38 70 38 L10 38 Q6 38 6 34 Z"/>
            <path d="M22 28 L26 14 Q34 11 46 14 L52 28 Z"/>
            <path d="M27 27 L30 16 Q36 13 44 15 L48 27"/>
            <line x1="38" y1="13" x2="38" y2="27"/>
            <circle cx="20" cy="38" r="6" fill={T.bg}/>
            <circle cx="20" cy="38" r="3" fill={T.text}/>
            <circle cx="58" cy="38" r="6" fill={T.bg}/>
            <circle cx="58" cy="38" r="3" fill={T.text}/>
            <path d="M36 26 Q40 24 44 26"/>
            <ellipse cx="70" cy="26" rx="3" ry="2" fill={T.yellow} stroke={T.text} strokeWidth="1.5"/>
            <line x1="2" y1="24" x2="8" y2="24" strokeDasharray="2,2" opacity="0.4"/>
            <line x1="1" y1="28" x2="6" y2="28" strokeDasharray="2,2" opacity="0.3"/>
          </svg>
        </div>

        {/* Dashed divider */}
        <div style={{ borderTop: `1.5px dashed ${T.divider}`, margin: '0 18px 10px', opacity: 0.4 }} />

        {/* Timeline */}
        <div style={{ padding: '2px 18px 12px' }} dir="ltr">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', minWidth: 44 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{arrTime}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, margin: '0 8px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.text, flexShrink: 0 }} />
              <div style={{ flex: 1, height: 2, position: 'relative', margin: '0 2px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 1, background: `linear-gradient(to right, ${T.text}, #ccc, ${T.accent})`, opacity: 0.5 }} />
              </div>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
            </div>
            <div style={{ textAlign: 'center', minWidth: 44 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{depTime}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontSize: 11, color: T.textMid, minWidth: 44, textAlign: 'center' }}>{CITIES[ride.to_city]}</span>
            <span style={{ fontSize: 9, color: T.textMid }}>{distance}</span>
            <span style={{ fontSize: 11, color: T.textMid, minWidth: 44, textAlign: 'center' }}>{CITIES[ride.from_city]}</span>
          </div>
        </div>

        {/* Footer — driver · seats · price */}
        <div style={{ borderTop: `1.5px dashed ${T.divider}`, padding: '10px 18px', display: 'flex', alignItems: 'center', direction: 'rtl' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 12, color: T.textMid }}>{driver.full_name || 'شۆفێر'}</span>
            <div style={{ width: 22, height: 22, borderRadius: 5, border: `1.5px solid ${T.border}`,
              background: T.cardInner, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={T.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="3.5"/>
                <path d="M6 21 Q7 14 12 13 Q17 14 18 21"/>
              </svg>
            </div>
          </div>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: isFull ? T.text : T.textDim, fontWeight: isFull ? 700 : undefined }}>
            {isFull ? '٠ جێ' : seatsDisplay}
          </span>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 400, color: T.textMid }}>{priceDisplay}</span>
        </div>
      </div>
    </Link>
  )
}

// Shared status configs
export const REQUEST_STATUS: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: 'چاوەڕوانە', color: T.amber, bg: T.amberBg },
  approved: { text: 'قبوڵ کرا', color: T.green, bg: T.greenBg },
  declined: { text: 'ڕەت کرایەوە', color: T.red, bg: T.redBg },
  cancelled: { text: 'هەڵوەشێنرایەوە', color: T.textMid, bg: T.chipBg },
}

export const RIDE_CANCELLED_STATUS = { text: 'هەڵوەشێنرایەوە', color: T.red, bg: T.redBg }
