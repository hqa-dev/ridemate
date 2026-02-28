'use client'
import { useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { useRouter } from 'next/navigation'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

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
    if (!user) {
      router.push('/auth/login')
      return
    }

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

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/home')
    }
  }

  const inputStyle: React.CSSProperties = {
    background: '#2a2a2a',
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: 11,
    color: '#e5e5e5',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontFamily: "'Noto Sans Arabic', sans-serif",
    direction: 'rtl',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#555',
    marginBottom: 4,
    display: 'block',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
    direction: 'rtl' as const,
    paddingRight: 14,
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#121212', maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px', fontFamily: "'Noto Sans Arabic', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5' }}><span style={{ color: '#df6530' }}>ڕێ</span> پۆستکە</h1>
      </div>

      {/* Route Card (B3) */}
      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', direction: 'rtl' }}>
          {/* From */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', border: '2px solid #df6530', flexShrink: 0 }} />
            <select
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              style={{ ...inputStyle, color: fromCity ? '#e5e5e5' : '#555' }}
            >
              <option value="" style={{ color: '#555' }}>لە کوێ؟</option>
              {Object.entries(CITIES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ width: 1, height: 8, background: '#333', margin: '2px 2px 2px auto' }} />
          {/* To */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e5e5e5', flexShrink: 0 }} />
            <select
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              style={{ ...inputStyle, color: toCity ? '#e5e5e5' : '#555' }}
            >
              <option value="" style={{ color: '#555' }}>بۆ کوێ؟</option>
              {Object.entries(CITIES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Date · Time · Seats footer */}
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '8px 14px', display: 'flex', alignItems: 'center', direction: 'rtl' }}>
          <div style={{ flex: 1, textAlign: 'right' as const }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, padding: '4px 8px', fontSize: 10, textAlign: 'center' as const, color: date ? '#e5e5e5' : '#555' }}
              placeholder="بەروار"
            />
          </div>
          <span style={{ width: 1, height: 12, background: '#2a2a2a', margin: '0 8px', flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: 'center' as const }}>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ ...inputStyle, padding: '4px 8px', fontSize: 10, textAlign: 'center' as const, color: time ? '#e5e5e5' : '#555' }}
              placeholder="کات"
            />
          </div>
          <span style={{ width: 1, height: 12, background: '#2a2a2a', margin: '0 8px', flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: 'left' as const }}>
            <input
              type="number"
              min="1"
              max="7"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              style={{ ...inputStyle, padding: '4px 8px', fontSize: 10, textAlign: 'center' as const }}
              placeholder="جێ"
            />
          </div>
        </div>
      </div>

      {/* Price Card */}
      <div style={sectionTitleStyle}>نرخ</div>
      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', display: 'flex', gap: 8, direction: 'rtl', alignItems: 'center' }}>
          <div
            onClick={() => setPriceType('coffee')}
            style={{
              flex: 1,
              background: '#2a2a2a',
              border: `2px solid ${priceType === 'coffee' ? '#df6530' : 'transparent'}`,
              borderRadius: 10,
              padding: 10,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 11, color: priceType === 'coffee' ? '#df6530' : '#777' }}>قاوەیەک</span>
          </div>
          <div
            onClick={() => setPriceType('money')}
            style={{
              flex: 1,
              background: '#2a2a2a',
              border: `2px solid ${priceType === 'money' ? '#df6530' : 'transparent'}`,
              borderRadius: 10,
              padding: 10,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 12, color: priceType === 'money' ? '#df6530' : '#777' }}>پارە</span>
          </div>
        </div>
        {priceType === 'money' && (
          <div style={{ padding: '0 14px 12px' }}>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="بڕی پارە بە دینار"
              style={inputStyle}
            />
          </div>
        )}
      </div>

      {/* Car Info Card */}
      <div style={sectionTitleStyle}>زانیاری ئۆتۆمبێل</div>
      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', direction: 'rtl' }}>
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

      {/* Smoking & Notes Card */}
      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', direction: 'rtl' }}>
          {/* Smoking toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#aaa' }}>جگەرەکێش</span>
            <div
              onClick={() => setSmoking(!smoking)}
              style={{
                width: 40,
                height: 22,
                background: smoking ? '#df6530' : '#2a2a2a',
                borderRadius: 11,
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                background: smoking ? 'white' : '#888',
                borderRadius: '50%',
                position: 'absolute',
                top: 2,
                transition: 'all 0.2s',
                ...(smoking ? { left: 20 } : { left: 2 }),
              }} />
            </div>
          </div>
          {/* Notes */}
          <span style={labelStyle}>تێبینی</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="هەر شتێک دەربارەی ڕێیەکەت یان خۆت..."
            rows={3}
            style={{ ...inputStyle, resize: 'none', minHeight: 60 }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>{error}</p>
      )}

      {/* Submit */}
      <div
        onClick={handleSubmit}
        style={{
          background: loading ? '#555' : '#df6530',
          borderRadius: 14,
          padding: 16,
          textAlign: 'center',
          cursor: loading ? 'default' : 'pointer',
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>
          {loading ? '...' : 'برۆ'}
        </span>
      </div>

      <BottomNav />
    </div>
  )
}