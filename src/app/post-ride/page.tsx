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

  function cycleCity(current: string, setter: (v: string) => void) {
    const idx = CITY_KEYS.indexOf(current as typeof CITY_KEYS[number])
    const next = CITY_KEYS[(idx + 1) % CITY_KEYS.length]
    setter(next)
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

  const smallInputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: 10,
    color: '#e5e5e5',
    fontFamily: "'Noto Sans Arabic', sans-serif",
    width: '100%',
    textAlign: 'center',
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

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#121212', maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px', fontFamily: "'Noto Sans Arabic', sans-serif", position: 'relative' }}>

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
          <div style={{ flex: 0 }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              style={{ ...smallInputStyle, width: 50, color: date ? '#e5e5e5' : '#555' }} />
          </div>
          <div style={{ width: 1, height: 16, background: '#2a2a2a' }} />
          <div style={{ flex: 0 }}>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              style={{ ...smallInputStyle, width: 36, color: time ? '#e5e5e5' : '#555' }} />
          </div>
          <div style={{ width: 1, height: 16, background: '#2a2a2a' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input type="number" min="1" max="7" value={seats} onChange={(e) => setSeats(e.target.value)}
              style={{ ...smallInputStyle, width: 16 }} />
            <span style={{ fontSize: 9, color: '#555' }}>جێ</span>
          </div>
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