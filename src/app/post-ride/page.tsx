'use client'
import { useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { useRouter } from 'next/navigation'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

const CITY_KEYS = ['', 'erbil', 'suli', 'duhok'] as const
const CITIES: Record<string, string> = {
  erbil: ku.erbil,
  suli: ku.suli,
  duhok: ku.duhok,
}

const KURDISH_MONTHS = ['کانوونی دووەم', 'شوبات', 'ئادار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم']
const KURDISH_DAYS = ['ش', 'ی', 'دش', 'چ', 'پ', 'هـ', 'ج']

function toKurdishNum(n: number): string {
  return n.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
}

function CalendarPopup({ onSelect, onClose }: { onSelect: (date: string) => void; onClose: () => void }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayDate = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function pick(day: number) {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onSelect(`${year}-${m}-${d}`)
  }

  const isPast = (day: number) => {
    const d = new Date(year, month, day)
    const t = new Date(todayYear, todayMonth, todayDate)
    return d < t
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1e1e1e', borderRadius: 14, padding: 14, width: 280, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, direction: 'rtl' }}>
          <span onClick={nextMonth} style={{ fontSize: 14, color: '#777', cursor: 'pointer', padding: '0 8px' }}>‹</span>
          <span style={{ fontSize: 11, color: '#e5e5e5' }}>{KURDISH_MONTHS[month]} {toKurdishNum(year)}</span>
          <span onClick={prevMonth} style={{ fontSize: 14, color: '#777', cursor: 'pointer', padding: '0 8px' }}>›</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, textAlign: 'center', marginBottom: 6, direction: 'rtl' }}>
          {KURDISH_DAYS.map(d => <span key={d} style={{ fontSize: 8, color: '#555' }}>{d}</span>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, textAlign: 'center', direction: 'rtl' }}>
          {Array(offset).fill(null).map((_, i) => <span key={'e' + i} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1
            const isToday = day === todayDate && month === todayMonth && year === todayYear
            const past = isPast(day)
            return (
              <span
                key={day}
                onClick={() => !past && pick(day)}
                style={{
                  fontSize: 9,
                  color: past ? '#333' : isToday ? 'white' : '#aaa',
                  padding: '6px 0',
                  cursor: past ? 'default' : 'pointer',
                  background: isToday ? '#df6530' : 'transparent',
                  borderRadius: '50%',
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                {toKurdishNum(day)}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TimePopup({ onSelect, onClose }: { onSelect: (time: string) => void; onClose: () => void }) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6:00 to 22:00
  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1e1e1e', borderRadius: 14, padding: 14, width: 260, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: 11, color: '#777', textAlign: 'center', marginBottom: 10, direction: 'rtl' }}>کات هەڵبژێرە</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {hours.map(h => {
            const t = `${String(h).padStart(2, '0')}:00`
            return (
              <div
                key={h}
                onClick={() => onSelect(t)}
                style={{
                  background: '#2a2a2a',
                  borderRadius: 6,
                  padding: '8px 0',
                  textAlign: 'center',
                  fontSize: 10,
                  color: '#aaa',
                  cursor: 'pointer',
                }}
              >
                {t}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SeatsPopup({ onSelect, onClose, current }: { onSelect: (s: string) => void; onClose: () => void; current: string }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1e1e1e', borderRadius: 14, padding: 14, width: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: 11, color: '#777', textAlign: 'center', marginBottom: 10, direction: 'rtl' }}>جێ هەڵبژێرە</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              onClick={() => onSelect(String(n))}
              style={{
                background: current === String(n) ? '#df6530' : '#2a2a2a',
                color: current === String(n) ? 'white' : '#aaa',
                borderRadius: 6,
                padding: '8px 14px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PostRidePage() {
  const router = useRouter()
  const supabase = createClient()

  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [seats, setSeats] = useState('1')
  const [priceType, setPriceType] = useState<'coffee' | 'money'>('coffee')
  const [price, setPrice] = useState('')
  const [carMake, setCarMake] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carColor, setCarColor] = useState('')
  const [smoking, setSmoking] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [showCalendar, setShowCalendar] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const [showSeats, setShowSeats] = useState(false)

  function cycleCity(current: string, setter: (v: string) => void) {
    const idx = CITY_KEYS.indexOf(current as typeof CITY_KEYS[number])
    const next = CITY_KEYS[(idx + 1) % CITY_KEYS.length]
    setter(next)
  }

  function formatDate(d: string) {
    if (!d) return 'بەروار'
    const [y, m, day] = d.split('-')
    return `${toKurdishNum(parseInt(day))}/${toKurdishNum(parseInt(m))}`
  }

  async function handleSubmit() {
    if (!fromCity || !toCity || !date || !time || !seats) {
      setError('تکایە هەموو خانەکان پڕبکەرەوە')
      return
    }
    if (fromCity === toCity) {
      setError('شوێنی چوون و هاتن ناتوانن هاوشێوە بن')
      return
    }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const departureTime = new Date(`${date}T${time}:00`).toISOString()
    const { error: insertError } = await supabase.from('rides').insert({
      driver_id: user.id,
      from_city: fromCity,
      to_city: toCity,
      departure_time: departureTime,
      available_seats: parseInt(seats),
      price_type: priceType,
      price_iqd: priceType === 'money' ? parseInt(price) || 0 : null,
      car_make: carMake || null,
      car_model: carModel || null,
      car_color: carColor || null,
      smoking_allowed: smoking,
      notes: notes || null,
      status: 'active',
    })
    if (insertError) { setError(insertError.message); setLoading(false) }
    else { router.push('/home') }
  }

  const inputStyle: React.CSSProperties = {
    background: '#2a2a2a',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    color: '#e5e5e5',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontFamily: "'Noto Sans Arabic', sans-serif",
    direction: 'rtl',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#777',
    marginBottom: 4,
    display: 'block',
  }

  const cityBoxStyle = (hasValue: boolean): React.CSSProperties => ({
    background: '#2a2a2a',
    borderRadius: 6,
    padding: '6px 8px',
    flex: 1,
    fontSize: 10,
    color: hasValue ? '#e5e5e5' : '#777',
    cursor: 'pointer',
    fontFamily: "'Noto Sans Arabic', sans-serif",
    direction: 'rtl',
    userSelect: 'none',
    textAlign: 'right',
  })

  const metaStyle = (hasValue: boolean): React.CSSProperties => ({
    fontSize: 9,
    color: hasValue ? '#e5e5e5' : '#555',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  })

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#121212', maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px', fontFamily: "'Noto Sans Arabic', sans-serif", position: 'relative' }}>

      {/* Popups */}
      {showCalendar && <CalendarPopup onSelect={(d) => { setDate(d); setShowCalendar(false) }} onClose={() => setShowCalendar(false)} />}
      {showTime && <TimePopup onSelect={(t) => { setTime(t); setShowTime(false) }} onClose={() => setShowTime(false)} />}
      {showSeats && <SeatsPopup current={seats} onSelect={(s) => { setSeats(s); setShowSeats(false) }} onClose={() => setShowSeats(false)} />}

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5' }}><span style={{ color: '#df6530' }}>ڕێ</span> پۆستکە</h1>
      </div>

      {/* ===== Route + Price Card (merged) ===== */}
      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 19, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        {/* Route row */}
        <div style={{ padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', direction: 'rtl' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', border: '2px solid #df6530', flexShrink: 0 }} />
          <div onClick={() => cycleCity(fromCity, setFromCity)} style={cityBoxStyle(!!fromCity)}>
            {fromCity ? CITIES[fromCity] : 'لە کوێ؟'}
          </div>
          <span style={{ fontSize: 9, color: '#333' }}>←</span>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e5e5e5', flexShrink: 0 }} />
          <div onClick={() => cycleCity(toCity, setToCity)} style={cityBoxStyle(!!toCity)}>
            {toCity ? CITIES[toCity] : 'بۆ کوێ؟'}
          </div>
          <div style={{ width: 1, height: 16, background: '#2a2a2a' }} />
          <div onClick={() => setShowCalendar(true)} style={metaStyle(!!date)}>{formatDate(date)}</div>
          <div style={{ width: 1, height: 16, background: '#2a2a2a' }} />
          <div onClick={() => setShowTime(true)} style={metaStyle(!!time)}>{time || 'کات'}</div>
          <div style={{ width: 1, height: 16, background: '#2a2a2a' }} />
          <div onClick={() => setShowSeats(true)} style={metaStyle(true)}>{seats} جێ</div>
        </div>
        {/* Price row */}
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', direction: 'rtl' }}>
          <div
            onClick={() => setPriceType('coffee')}
            style={{ background: '#2a2a2a', borderRadius: 6, padding: '6px 8px', flex: 1, fontSize: 10, color: priceType === 'coffee' ? '#df6530' : '#777', cursor: 'pointer', textAlign: 'center' }}
          >
            قاوەیەک
          </div>
          <div
            onClick={() => setPriceType('money')}
            style={{ background: '#2a2a2a', borderRadius: 6, padding: '6px 8px', flex: 1, fontSize: 10, color: priceType === 'money' ? '#df6530' : '#777', cursor: 'pointer', textAlign: 'center' }}
          >
            پارە
          </div>
        </div>
        {priceType === 'money' && (
          <div style={{ padding: '0 12px 8px' }}>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="بڕی پارە بە دینار" style={{ ...inputStyle, fontSize: 10, padding: '6px 8px' }} />
          </div>
        )}
      </div>

      {/* ===== Car Info Card ===== */}
      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 19, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>جۆری ئۆتۆمبێل</span>
              <input value={carMake} onChange={(e) => setCarMake(e.target.value)} placeholder="Toyota" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>مۆدێلی ئۆتۆمبێل</span>
              <input value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="Camry" style={inputStyle} />
            </div>
          </div>
          <span style={labelStyle}>ڕەنگی ئۆتۆمبێل</span>
          <input value={carColor} onChange={(e) => setCarColor(e.target.value)} placeholder="White" style={inputStyle} />
        </div>
      </div>

      {/* ===== Smoking & Notes Card ===== */}
      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 19, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#aaa' }}>جگەرەکێش</span>
            <div
              onClick={() => setSmoking(!smoking)}
              style={{
                width: 38, height: 20, background: smoking ? '#df6530' : '#2a2a2a',
                borderRadius: 10, position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 16, height: 16, background: smoking ? 'white' : '#888',
                borderRadius: '50%', position: 'absolute', top: 2, transition: 'all 0.2s',
                ...(smoking ? { left: 20 } : { left: 2 }),
              }} />
            </div>
          </div>
          <span style={labelStyle}>تێبینی</span>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="هەر شتێک دەربارەی ڕێیەکەت یان خۆت..."
            rows={2}
            style={{ ...inputStyle, resize: 'none', minHeight: 44 }}
          />
        </div>
      </div>

      {/* Error */}
      {error && <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

      {/* Submit — fixed above nav */}
      <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 440, padding: '0 20px', zIndex: 10 }}>
        <div
          onClick={handleSubmit}
          style={{
            background: loading ? '#555' : '#df6530', borderRadius: 14,
            padding: 14, textAlign: 'center', cursor: loading ? 'default' : 'pointer',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{loading ? '...' : 'برۆ'}</span>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}