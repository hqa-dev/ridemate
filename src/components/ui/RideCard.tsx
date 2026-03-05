import Link from 'next/link'
import { CITIES, ROUTE_DISTANCE, formatTime, estimateArrival, toKurdishNum } from '@/lib/utils'
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

function SketchCar({ size = 48, color = '#1A1208' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 80 44" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 28 Q8 18 16 14 Q28 10 42 10 Q54 10 62 14 Q70 18 72 28 L74 34 Q74 38 70 38 L10 38 Q6 38 6 34 Z"/>
      <path d="M22 28 L26 14 Q34 11 46 14 L52 28 Z"/>
      <path d="M27 27 L30 16 Q36 13 44 15 L48 27"/>
      <line x1="38" y1="13" x2="38" y2="27"/>
      <circle cx="20" cy="38" r="6" fill={T.bg}/><circle cx="20" cy="38" r="3" fill={color}/>
      <circle cx="58" cy="38" r="6" fill={T.bg}/><circle cx="58" cy="38" r="3" fill={color}/>
      <path d="M36 26 Q40 24 44 26"/>
      <ellipse cx="70" cy="26" rx="3" ry="2" fill="#F5C800" stroke={color} strokeWidth="1.5"/>
      <line x1="2" y1="24" x2="8" y2="24" strokeDasharray="2,2" opacity="0.4"/>
      <line x1="1" y1="28" x2="6" y2="28" strokeDasharray="2,2" opacity="0.3"/>
    </svg>
  )
}

function SketchPerson({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={T.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3.5"/>
      <path d="M6 21 Q7 14 12 13 Q17 14 18 21"/>
      <path d="M9 16 Q12 18 15 16"/>
    </svg>
  )
}

function RouteLine({ from, to, dep, arr }: { from: string; to: string; dep: string; arr: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} dir="rtl">
      {/* Departure — RIGHT — orange */}
      <div style={{ textAlign: 'center', minWidth: 38 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'Noto Sans Arabic', sans-serif" }}>{dep}</div>
        <div style={{ fontSize: 9, color: T.textDim, fontFamily: "'Noto Sans Arabic', sans-serif" }}>{from}</div>
      </div>
      {/* SVG curved line */}
      <div style={{ flex: 1, position: 'relative', height: 16 }}>
        <svg width="100%" height="16" viewBox="0 0 100 16" preserveAspectRatio="none">
          <path d="M2 11 Q50 3 98 11" stroke={T.text} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
        <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:6, height:6, borderRadius:'50%', background:T.text, marginLeft:1 }}/>
        <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:8, height:8, borderRadius:'50%', background:T.accent, border:`1.5px solid ${T.text}`, marginRight:1 }}/>
      </div>
      {/* Arrival — LEFT — ink */}
      <div style={{ textAlign: 'center', minWidth: 38 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'Noto Sans Arabic', sans-serif" }}>{arr}</div>
        <div style={{ fontSize: 9, color: T.textDim, fontFamily: "'Noto Sans Arabic', sans-serif" }}>{to}</div>
      </div>
    </div>
  )
}

export function RideCard({ ride, status, dimmed, editButton }: RideCardProps) {
  const driver = ride.driver || {}
  const depTime = toKurdishNum(formatTime(ride.departure_time))
  const arrTime = toKurdishNum(estimateArrival(ride.departure_time, ride.from_city, ride.to_city))
  const routeKey = `${ride.from_city}-${ride.to_city}`
  const distance = ROUTE_DISTANCE[routeKey] || ''
  const priceDisplay = ride.price_type === 'coffee'
    ? '☕'
    : `${toKurdishNum(Number(ride.price_iqd || 0).toLocaleString('en'))} دینار`
  const isFull = ride.available_seats <= 0
  const seatsDisplay = `${toKurdishNum(ride.available_seats)} جێگا`

  return (
    <Link href={`/rides/${ride.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: T.card,
        border: `2px solid ${T.border}`,
        borderRadius: 12,
        boxShadow: T.cardShadow,
        marginBottom: 10,
        overflow: 'hidden',
        opacity: dimmed ? 0.5 : (isFull && !status) ? 0.6 : 1,
        fontFamily: "'Noto Sans Arabic', sans-serif",
      }}>

        {/* Status pill or edit button — only shown when present */}
        {(status || editButton) && (
          <div style={{ padding: '8px 12px 0', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }} dir="rtl">
            {status ? (
              <span style={{
                fontSize: 9, padding: '2px 7px', borderRadius: 3,
                background: status.bg, color: status.color, fontWeight: 700,
                border: `1.5px solid ${status.color}`,
              }}>{status.text}</span>
            ) : (
              <div onClick={e => e.preventDefault()}>{editButton}</div>
            )}
          </div>
        )}

        {/* Sketch car */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 12px 6px' }}>
          <SketchCar size={52} color={dimmed ? T.textDim : T.text} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 5,
              border: `1.5px solid ${T.border}`,
              background: T.cardInner,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SketchPerson size={14} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{driver.full_name || 'شۆفێر'}</span>
          </div>
          {/* Seats · price */}
          <span style={{ fontSize: 10, color: T.textDim }}>
            {isFull ? '٠ جێگا' : seatsDisplay} · {priceDisplay}
          </span>
        </div>

      </div>
    </Link>
  )
}

// Shared status configs
export const REQUEST_STATUS: Record<string, { text: string; color: string; bg: string }> = {
  pending:   { text: 'چاوەڕوانە',       color: T.amber,   bg: T.amberBg },
  approved:  { text: 'قبوڵ کرا',        color: T.green,   bg: T.greenBg },
  declined:  { text: 'ڕەت کرایەوە',    color: T.red,     bg: T.redBg },
  cancelled: { text: 'هەڵوەشێنرایەوە', color: T.textMid, bg: T.chipBg },
}

export const RIDE_CANCELLED_STATUS = { text: 'هەڵوەشێنرایەوە', color: T.red, bg: T.redBg }
