'use client'
import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'
import { CITIES, ROUTE_DISTANCE, COLOR_KU, formatWhatsApp, formatTime, estimateArrival, toKurdishNum } from '@/lib/utils'
import { T } from '@/lib/theme'

export default function MyRidesPage() {
  const [joinedRides, setJoinedRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: reqData } = await supabase
      .from('ride_requests')
      .select('*, seen_by_passenger, ride:rides(*, driver:profiles!driver_id(full_name, phone, avatar_url))')
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false })
    setJoinedRides(reqData || [])
    setLoading(false)

    // Mark all unseen approved/declined/cancelled as seen
    const unseen = (reqData || []).filter(r => (r.status === 'approved' || r.status === 'declined' || r.status === 'cancelled') && !r.seen_by_passenger)
    if (unseen.length > 0) {
      await supabase
        .from('ride_requests')
        .update({ seen_by_passenger: true })
        .in('id', unseen.map(r => r.id))
    }
  }

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div style={{
      direction: 'rtl', minHeight: '100vh', background: T.bg,
      maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px',
      fontFamily: "'Noto Sans Arabic', sans-serif",
    }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 20 }}>{ku.myRides}</h1>

      {loading ? <div /> : joinedRides.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: T.textFaint, fontSize: 14 }}>هێشتا داوای هیچ گەشتێکت نەکردووە</p>
          <p style={{ color: T.textDim, fontSize: 11, marginTop: 4 }}>لە لاپەڕەی سەرەکی گەشتێک هەڵبژێرە و داواکاری بنێرە، گەر قبوڵ بکرێ، لێرە دەیبینی</p>
        </div>
      ) : joinedRides.map(req => {
        const ride = req.ride
        if (!ride) return null
        const driver = ride.driver || {}
        const isCompleted = ride.status === 'completed'
        const depTime = formatTime(ride.departure_time)
        const arrTime = estimateArrival(ride.departure_time, ride.from_city, ride.to_city)
        const routeKey = `${ride.from_city}-${ride.to_city}`
        const distance = ROUTE_DISTANCE[routeKey] || ''
        const isOpen = expanded[req.id]
        const carColor = ride.car_color || ''
        const priceDisplay = ride.price_type === 'coffee'
          ? 'قاوەیەک'
          : `${toKurdishNum(Number(ride.price_iqd).toLocaleString('en'))} دینار`
        const waLink = driver.phone ? formatWhatsApp(driver.phone) : ''

        const statusConfig: Record<string, { text: string; color: string; bg: string }> = {
          pending: { text: 'چاوەڕوانە', color: '#fbbf24', bg: '#2e2a1a' },
          approved: { text: isCompleted ? 'تەواو بوو ✓' : 'قبوڵ کرا', color: T.green, bg: T.greenBg },
          declined: { text: 'ڕەت کرایەوە', color: '#dc2626', bg: '#2e1a1a' },
          cancelled: { text: 'شۆفێر گەشتەکەی هەڵوەشاندەوە', color: T.textMid, bg: T.border },
        }
        const st = statusConfig[req.status] || statusConfig.pending

        return (
          <Link key={req.id} href={`/rides/${ride.id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              background: T.card, borderRadius: T.radius, marginBottom: 10,
              boxShadow: T.shadow, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
              opacity: (req.status === 'declined' || req.status === 'cancelled') ? 0.6 : 1,
            }}>

              {/* Timeline */}
              <div style={{ padding: '12px 16px 8px' }} dir="ltr">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: 38 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{toKurdishNum(arrTime)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, margin: '0 6px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.text, flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 1, background: `rgba(255,255,255,0.25)` }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)', flexShrink: 0 }} />
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 38 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{toKurdishNum(depTime)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: '#ccc', minWidth: 38, textAlign: 'center' }}>{CITIES[ride.to_city]}</span>
                  <span style={{ fontSize: 8, color: T.textDim }}>{distance}</span>
                  <span style={{ fontSize: 10, color: '#ccc', minWidth: 38, textAlign: 'center' }}>{CITIES[ride.from_city]}</span>
                </div>
              </div>

              {/* Driver + hamburger + status */}
              <div style={{ borderTop: `1px solid ${T.border}`, padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, border: '1px solid #333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                  }}>
                    {driver.avatar_url ? (
                      <img src={driver.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" fill="#555" />
                        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" fill="#555" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: T.textMid }}>{driver.full_name || 'شۆفێر'}</span>
                </div>
                <div
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(req.id) }}
                  style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: isOpen ? T.border : 'transparent',
                    border: `1px solid ${isOpen ? '#444' : '#333'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isOpen ? T.textMid : '#555'} strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
                  </svg>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{
                    fontSize: 9, padding: '3px 9px', borderRadius: 20,
                    background: st.bg, color: st.color, fontWeight: 600,
                  }}>{st.text}</span>
                  {!req.seen_by_passenger && (req.status === 'approved' || req.status === 'declined' || req.status === 'cancelled') && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
                  )}
                </div>
              </div>

              {/* Expandable details */}
              {isOpen && (
                <div style={{ padding: '10px 16px' }}>
                  <div style={{
                    padding: '8px 12px', background: T.cardInner, borderRadius: 10,
                    fontSize: 11, color: T.textMid, lineHeight: 2, marginBottom: ride.notes ? 8 : 0,
                  }}>
                    {ride.car_make && <div>جۆر: <span style={{ color: '#ccc' }}>{ride.car_make}</span></div>}
                    {ride.car_model && <div>مۆدێل: <span style={{ color: '#ccc' }}>{ride.car_model}</span></div>}
                    {carColor && <div>ڕەنگ: <span style={{ color: '#ccc' }}>{COLOR_KU[carColor.toLowerCase()] || carColor}</span></div>}
                    <div>نرخ: <span style={{ color: '#ccc' }}>{priceDisplay}</span></div>
                    <div>جێگای بەردەست: <span style={{ color: '#ccc' }}>{ride.available_seats > 0 ? `${ride.available_seats} جێ` : 'پڕە'}</span></div>
                  </div>
                  {ride.notes && (
                    <div style={{ padding: '8px 12px', background: T.cardInner, borderRadius: 10, borderRight: '3px solid rgba(255,255,255,0.15)' }}>
                      <div style={{ fontSize: 8, color: T.textFaint, marginBottom: 2, fontWeight: 600 }}>تێبینی</div>
                      <div style={{ fontSize: 10, color: '#999', lineHeight: 1.8 }}>{ride.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp — approved & active */}
              {req.status === 'approved' && !isCompleted && waLink && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 16px' }}>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: T.border, color: T.textMid, borderRadius: 10, padding: 9,
                    fontSize: 11, fontWeight: 500, textDecoration: 'none', direction: 'rtl',
                  }}>
                    پەیامێک بنێرە بۆ شۆفێر
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                </div>
              )}

              {/* Completed */}
              {isCompleted && req.status === 'approved' && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div style={{ width: 1, height: 20, background: '#333', flexShrink: 0 }} />
                    <p style={{ fontWeight: 500, color: T.textMid, fontSize: 11, margin: 0 }}>گەشتەکە تەواو بوو</p>
                  </div>
                </div>
              )}

              {/* Pending hint */}
              {req.status === 'pending' && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 16px' }}>
                  <p style={{ fontSize: 10, color: T.textFaint, margin: 0, lineHeight: 1.6 }}>
                    کە داواکرییەکەت قبوڵ کرا، ژمارە مۆبایلی شۆفێر لێرە دەردەکەوێ
                  </p>
                </div>
              )}

              {/* Declined */}
              {req.status === 'declined' && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 16px' }}>
                  <p style={{ fontSize: 10, color: T.textFaint, margin: 0 }}>شۆفێر داواکاریەکەتی قبوڵ نەکرد</p>
                </div>
              )}

              {/* Cancelled by driver */}
              {req.status === 'cancelled' && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 16px' }}>
                  <p style={{ fontSize: 10, color: T.textFaint, margin: 0 }}>شۆفێر ئەم گەشتە هەڵیوەشاندەوە</p>
                </div>
              )}
            </div>
          </Link>
        )
      })}

      <BottomNav />
    </div>
  )
}
