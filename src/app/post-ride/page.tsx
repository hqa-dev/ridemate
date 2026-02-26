'use client'
import { useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { ku } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

const CITIES = [
  { value: 'erbil', label: ku.erbil },
  { value: 'suli', label: ku.suli },
  { value: 'duhok', label: ku.duhok },
]

export default function PostRidePage() {
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [seats, setSeats] = useState('1')
  const [priceType, setPriceType] = useState<'coffee' | 'iqd'>('coffee')
  const [priceIqd, setPriceIqd] = useState('')
  const [carMake, setCarMake] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carColor, setCarColor] = useState('')
  const [notes, setNotes] = useState('')
  const [smoking, setSmoking] = useState(false)
  const [posted, setPosted] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const supabase = createClient()

  useState(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setBlocked(true); setBlockReason('please sign in'); setCheckingAuth(false); return }
      const { data: profile } = await supabase.from('profiles').select('role, verification_status').eq('id', user.id).single()
      if (!profile) { setBlocked(true); setBlockReason('profile not found'); setCheckingAuth(false); return }
      if (profile.role === 'passenger') { setBlocked(true); setBlockReason('passenger'); setCheckingAuth(false); return }
      if (profile.verification_status !== 'verified') { setBlocked(true); setBlockReason('unverified'); setCheckingAuth(false); return }
      setCheckingAuth(false)
    }
    check()
  })

  const input = { width: '100%', background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none', direction: 'rtl' } as React.CSSProperties
  const select = { ...input, padding: '0.75rem 1rem 0.75rem 2.5rem' } as React.CSSProperties
  const label = { fontSize: '0.8rem', color: '#a8a29e', display: 'block', marginBottom: '0.25rem', paddingRight: '1rem' } as React.CSSProperties
  const section = { marginBottom: '1rem' } as React.CSSProperties

  const handleSubmit = async () => {
    setError('')
    if (!fromCity || !toCity || !date || !time) {
      setError('تکایە هەموو خانەکان پڕبکەوە')
      return
    }
    if (fromCity === toCity) {
      setError('شاری چوون و هاتن ناتوانن هاوشێوە بن')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('تکایە چوونەژوورەوە بکە')
      setSaving(false)
      return
    }

    const departure = `${date}T${time}:00`
    const { error: dbError } = await supabase.from('rides').insert({
      driver_id: user.id,
      from_city: fromCity,
      to_city: toCity,
      departure_time: departure,
      available_seats: parseInt(seats),
      price_type: priceType,
      price_iqd: priceType === 'iqd' ? parseInt(priceIqd) || 0 : null,
      car_make: carMake || null,
      car_model: carModel || null,
      car_color: carColor || null,
      notes: notes || null,
      smoking,
      status: 'active',
    })

    if (dbError) {
      setError('هەڵەیەک ڕوویدا: ' + dbError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setPosted(true)
  }

  const handleReset = () => {
    setFromCity(''); setToCity(''); setDate(''); setTime(''); setSeats('1')
    setPriceType('coffee'); setPriceIqd(''); setCarMake(''); setCarModel(''); setCarColor('')
    setNotes(''); setSmoking(false); setPosted(false); setError('')
  }

  if (checkingAuth) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
        <BottomNav />
      </div>
    )
  }

  if (blocked) {
    const msgs: Record<string, { title: string; sub: string }> = {
      'passenger': { title: 'تەنها شۆفێرەکان دەتوانن ڕێ پۆست بکەن', sub: '' },
      'unverified': { title: 'ناسینەوەت تەواو نییە', sub: 'لە چاوەڕوانی ناسیندایە' },
    }
    const msg = msgs[blockReason] || { title: blockReason, sub: '' }
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '2rem 1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <p style={{ color: '#44403c', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{msg.title}</p>
          {msg.sub && <p style={{ color: '#a8a29e', fontSize: '0.85rem' }}>{msg.sub}</p>}
        </div>
        <BottomNav />
      </div>
    )
  }

  if (posted) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ku.ridePosted}</h2>
          <button onClick={handleReset} style={{ marginTop: '1.5rem', background: '#df6530', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 2rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>{ku.postAnother}</button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}><><span style={{ color: '#df6530' }}>ڕێ</span>{' پۆستکە'}</></h1>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>
      )}

      <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={section}>
          <label style={label}>{ku.from}</label>
          <select className="ride-select" value={fromCity} onChange={e => setFromCity(e.target.value)} style={select}>
            <option value="">لە کوێ؟</option>
            {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={section}>
          <label style={label}>{ku.to}</label>
          <select className="ride-select" value={toCity} onChange={e => setToCity(e.target.value)} style={select}>
            <option value="">بۆ کوێ؟</option>
            {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ ...section, flex: 1 }}>
            <label style={label}>{ku.date || 'بەروار'}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...input, color: date ? '#44403c' : '#d6d3d1' }} />
          </div>
          <div style={{ ...section, flex: 1 }}>
            <label style={label}>{ku.time || 'کاتژمێر'}</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...input, color: time ? '#44403c' : '#d6d3d1' }} />
          </div>
        </div>
        <div style={section}>
          <label style={label}>{ku.seatsAvailable}</label>
          <select className="ride-select" value={seats} onChange={e => setSeats(e.target.value)} style={select}>
            {[1,2,3,4,5,6].map(n => <option key={n} value={String(n)}>{n}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }}>
        <label style={{ ...label, marginBottom: '0.75rem', fontSize: '0.85rem', color: '#44403c', fontWeight: 600 }}>{ku.price}</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button onClick={() => setPriceType('coffee')} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: priceType === 'coffee' ? '2px solid #df6530' : '1px solid #e7e5e4', background: priceType === 'coffee' ? '#fef7f4' : 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: priceType === 'coffee' ? '#df6530' : '#78716c' }}>
            {ku.coffeeAndConvo}
          </button>
          <button onClick={() => setPriceType('iqd')} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: priceType === 'iqd' ? '2px solid #df6530' : '1px solid #e7e5e4', background: priceType === 'iqd' ? '#fef7f4' : 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: priceType === 'iqd' ? '#df6530' : '#78716c' }}>
            پارە
          </button>
        </div>
        
        {priceType === 'iqd' && (
          <input type="number" max={5000} onInput={(e: any) => { if (Number(e.target.value) > 5000) e.target.value = '5000'; setPriceIqd(e.target.value > '5000' ? '5000' : e.target.value) }} placeholder="بۆ نموونە: 5000" value={priceIqd} onChange={() => {}} style={input} />
        )}
      </div>

      <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <label style={{ ...label, marginBottom: '0.75rem', fontSize: '0.85rem', color: '#44403c', fontWeight: 600 }}>{ku.carDetails}</label>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={label}>{ku.carMake}</label>
            <input type="text" placeholder="Toyota" value={carMake} onChange={e => setCarMake(e.target.value)} style={input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>{ku.carModel}</label>
            <input type="text" placeholder="Camry" value={carModel} onChange={e => setCarModel(e.target.value)} style={input} />
          </div>
        </div>
        <div>
          <label style={label}>{ku.carColor}</label>
          <input type="text" placeholder="White" value={carColor} onChange={e => setCarColor(e.target.value)} style={input} />
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#44403c', fontWeight: 600 }}>جگەرەکێش</label>
          <div onClick={() => setSmoking(!smoking)} style={{ width: '48px', height: '28px', borderRadius: '999px', background: smoking ? '#df6530' : '#e7e5e4', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'right 0.2s, left 0.2s', ...(smoking ? { left: '3px' } : { right: '3px' }) }} />
          </div>
        </div>
        <label style={{ fontSize: '0.85rem', color: '#44403c', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>تێبینی</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="هەر شتێک دەربارەی ڕێیەکەت یان خۆت..." rows={3} style={{ width: '100%', background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none', direction: 'rtl', resize: 'none', fontFamily: 'inherit' }} />
      </div>

      <button onClick={handleSubmit} disabled={saving} style={{ width: '100%', background: '#df6530', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
        {saving ? '...چاوەڕوان بە' : 'بڕۆ'}
      </button>

      <BottomNav />
    </div>
  )
}
