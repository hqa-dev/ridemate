'use client'
import { useState, useRef, useEffect } from 'react'
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

function toKurdishNum(n: number): string {
  return n.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
}

export default function PostRidePage() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [isVerifiedDriver, setIsVerifiedDriver] = useState(false)

  // Become-a-driver state
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const licenseRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  // Post ride form state
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [seats, setSeats] = useState('1')
  const [priceType, setPriceType] = useState<'coffee' | 'iqd'>('coffee')
  const [price, setPrice] = useState('')
  const [carMake, setCarMake] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carColor, setCarColor] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const dateRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkVerification()
  }, [])

  async function checkVerification() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setChecking(false); return }
    const { data: profile } = await supabase.from('profiles').select('role, verification_status').eq('id', user.id).single()
    if (profile && (profile.role === 'driver' || profile.role === 'both') && profile.verification_status === 'verified') {
      setIsVerifiedDriver(true)
    }
    setChecking(false)
  }

  // ─── Become a Driver: submit ───
  async function handleVerifySubmit() {
    setUploadError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadError('تکایە سەرەتا چوونەژوورەوە بکە'); return }
    if (!licenseFile || !selfieFile) { setUploadError('تکایە مۆڵەتنامە و سێلفی بنێرە'); return }

    setUploading(true)

    const licExt = licenseFile.name.split('.').pop()
    const { error: licErr } = await supabase.storage.from('documents').upload(`${user.id}/license.${licExt}`, licenseFile, { upsert: true })
    if (licErr) { setUploadError(licErr.message); setUploading(false); return }

    const selfieExt = selfieFile.name.split('.').pop()
    const { error: selfieErr } = await supabase.storage.from('documents').upload(`${user.id}/selfie.${selfieExt}`, selfieFile, { upsert: true })
    if (selfieErr) { setUploadError(selfieErr.message); setUploading(false); return }

    await supabase.from('profiles').update({ role: 'both', verification_status: 'pending' }).eq('id', user.id)
    setUploading(false)
    setSubmitted(true)
  }

  // ─── Post Ride: helpers ───
  function cycleCity(current: string, setter: (v: string) => void) {
    const idx = CITY_KEYS.indexOf(current as typeof CITY_KEYS[number])
    const next = CITY_KEYS[(idx + 1) % CITY_KEYS.length]
    setter(next)
  }

  function cycleSeats() {
    const n = parseInt(seats)
    setSeats(String(n >= 4 ? 1 : n + 1))
  }

  function formatDate(d: string) {
    if (!d) return 'بەروار'
    const [, m, day] = d.split('-')
    return `${toKurdishNum(parseInt(day))}/${toKurdishNum(parseInt(m))}`
  }

  function formatTime(t: string) {
    if (!t) return 'کات'
    return t
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
    if (!user) { router.push('/'); return }
    const departureTime = new Date(`${date}T${time}:00`).toISOString()
    const { error: insertError } = await supabase.from('rides').insert({
      driver_id: user.id,
      from_city: fromCity,
      to_city: toCity,
      departure_time: departureTime,
      available_seats: parseInt(seats),
      price_type: priceType === 'coffee' ? 'coffee' : 'iqd',
      price_iqd: priceType === 'iqd' ? parseInt(price) || 0 : null,
      car_make: carMake || null,
      car_model: carModel || null,
      car_color: carColor || null,
      notes: notes || null,
      status: 'active',
    })
    if (insertError) { setError(insertError.message); setLoading(false) }
    else { router.push('/home') }
  }

  // ─── Styles ───
  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: '#e5e5e5', marginBottom: 4, display: 'block',
  }
  const cityBoxStyle: React.CSSProperties = {
    background: '#2a2a2a', borderRadius: 6, padding: '6px 8px', flex: 1,
    fontSize: 12, color: '#e5e5e5', cursor: 'pointer',
    fontFamily: "'Noto Sans Arabic', sans-serif", direction: 'rtl',
    userSelect: 'none', textAlign: 'right',
  }
  const metaStyle = (hasValue: boolean): React.CSSProperties => ({
    fontSize: 12, color: '#e5e5e5', whiteSpace: 'nowrap',
    cursor: 'pointer', userSelect: 'none', position: 'relative',
  })

  // ─── Loading ───
  if (checking) return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#121212', maxWidth: 480, margin: '0 auto' }}>
      <BottomNav />
    </div>
  )

  // ═══════════════════════════════════════
  // BECOME A DRIVER (unverified)
  // ═══════════════════════════════════════
  if (!isVerifiedDriver) {

    if (submitted) return (
      <div style={{
        direction: 'rtl', minHeight: '100vh', background: '#121212',
        maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5', marginBottom: 8 }}>ناسنامەکانت نێردران</h2>
        <p style={{ fontSize: 13, color: '#777', textAlign: 'center', marginBottom: 32, lineHeight: 1.8 }}>
          کاتێک پشتڕاست کرایتەوە، دەتوانیت ڕێ پۆست بکەیت
        </p>
        <div
          onClick={() => router.push('/home')}
          style={{
            background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 12,
            padding: '12px 24px', fontSize: 13, color: '#aaa', cursor: 'pointer',
          }}
        >
          گەڕانەوە بۆ سەرەکی
        </div>
        <BottomNav />
      </div>
    )

    return (
      <div style={{
        direction: 'rtl', height: '100vh', background: '#121212',
        maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column',
        fontFamily: "'Noto Sans Arabic', sans-serif",
      }}>
        <div style={{ padding: '24px 20px 0', flexShrink: 0 }}>
          <span onClick={() => router.push('/home')} style={{ color: '#555', fontSize: 13, cursor: 'pointer' }}>← گەڕانەوە</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#e5e5e5', marginBottom: 10, lineHeight: 1.6 }}>
            بوون بە <span style={{ color: '#df6530' }}>شۆفێر</span>
          </h1>
          <p style={{ color: '#777', marginBottom: 28, fontSize: 12, lineHeight: 1.8 }}>
            مۆڵەتی شۆفێری و سێلفی بنێرە بۆ ئەوەی ببی بە شۆفێڕ
          </p>

          {uploadError && (
            <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{uploadError}</p>
          )}

          <input type="file" accept="image/*" ref={licenseRef} style={{ display: 'none' }} onChange={e => setLicenseFile(e.target.files?.[0] || null)} />
          <div
            onClick={() => licenseRef.current?.click()}
            style={{
              background: '#1e1e1e',
              border: `1px solid ${licenseFile ? 'rgba(74,222,128,0.15)' : '#2a2a2a'}`,
              borderRadius: 16, padding: 20, marginBottom: 10, cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 9, color: '#555', letterSpacing: 1 }}>مۆڵەتی شۆفێری</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: '#555', letterSpacing: 1.5 }}>کوردستان</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 56, height: 68, borderRadius: 8,
                background: licenseFile ? 'rgba(74,222,128,0.08)' : '#252525',
                border: `1px solid ${licenseFile ? 'rgba(74,222,128,0.2)' : '#333'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {licenseFile ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="8 12 11 15 16 9" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" /><path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 6, background: '#252525', borderRadius: 3, width: '80%', marginBottom: 8 }} />
                <div style={{ height: 6, background: '#252525', borderRadius: 3, width: '60%', marginBottom: 8 }} />
                <div style={{ height: 6, background: '#252525', borderRadius: 3, width: '45%' }} />
              </div>
            </div>
            <div style={{ borderTop: '1px solid #2a2a2a', marginTop: 16, paddingTop: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: licenseFile ? '#4ade80' : '#777', fontWeight: 500 }}>
                {licenseFile ? 'ناردنمان! چاوەڕێی وەڵامبە' : 'وێنەی مۆڵەتنامەکەت ئەپلۆد بکە'}
              </span>
            </div>
          </div>

          <input type="file" accept="image/*" capture="user" ref={selfieRef} style={{ display: 'none' }} onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
          <div
            onClick={() => selfieRef.current?.click()}
            style={{
              background: '#1e1e1e',
              border: `1px solid ${selfieFile ? 'rgba(74,222,128,0.15)' : '#2a2a2a'}`,
              borderRadius: 16, padding: 20, marginBottom: 10, cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: selfieFile ? 'rgba(74,222,128,0.08)' : '#252525',
                border: `2px dashed ${selfieFile ? 'rgba(74,222,128,0.3)' : '#333'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {selfieFile ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="8 12 11 15 16 9" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: selfieFile ? '#4ade80' : '#aaa', fontSize: 13, marginBottom: 4 }}>
                  {selfieFile ? 'سێلفییەکەت سەرکەوتوو بوو' : 'سێلفی بگرە'}
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>وێنەیەکی ڕوونی ڕووخسارت</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: '0 20px 96px' }}>
          <button
            onClick={handleVerifySubmit}
            disabled={uploading}
            style={{
              background: '#1e1e1e', color: '#df6530', border: '1px solid #2a2a2a',
              borderRadius: 16, padding: 16, fontSize: 14, fontWeight: 600,
              cursor: uploading ? 'default' : 'pointer', width: '100%',
              opacity: uploading ? 0.5 : 1,
              fontFamily: "'Noto Sans Arabic', sans-serif",
            }}
          >
            {uploading ? '...چاوەڕوان بە' : 'بنێرە'}
          </button>
        </div>

        <BottomNav />
      </div>
    )
  }

  // ═══════════════════════════════════════
  // POST RIDE FORM (verified driver)
  // ═══════════════════════════════════════
  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: '#121212', maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px', fontFamily: "'Noto Sans Arabic', sans-serif", position: 'relative' }}>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5' }}><span style={{ color: '#df6530' }}>ڕێ</span> پۆستکە</h1>
      </div>

      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 19, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', direction: 'rtl' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', border: '2px solid #df6530', flexShrink: 0 }} />
          <div onClick={() => cycleCity(fromCity, setFromCity)} style={cityBoxStyle}>
            {fromCity ? CITIES[fromCity] : 'لە کوێ؟'}
          </div>
          <span style={{ fontSize: 9, color: '#333' }}>←</span>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e5e5e5', flexShrink: 0 }} />
          <div onClick={() => cycleCity(toCity, setToCity)} style={cityBoxStyle}>
            {toCity ? CITIES[toCity] : 'بۆ کوێ؟'}
          </div>
          <div style={{ width: 1, height: 16, background: '#2a2a2a' }} />
          <div onClick={() => dateRef.current?.showPicker()} style={{ ...metaStyle(!!date), overflow: 'hidden', width: 40, flexShrink: 0 }}>
            {formatDate(date)}
            <input ref={dateRef} type="date" value={date} onChange={(e) => setDate(e.target.value)}
              style={{ position: 'absolute', top: 0, right: 0, width: 40, height: '100%', opacity: 0, fontSize: 16 }} />
          </div>
          <div style={{ width: 1, height: 16, background: '#2a2a2a' }} />
          <div onClick={() => timeRef.current?.showPicker()} style={{ ...metaStyle(!!time), overflow: 'hidden', width: 30, flexShrink: 0 }}>
            {formatTime(time)}
            <input ref={timeRef} type="time" value={time} onChange={(e) => setTime(e.target.value)}
              style={{ position: 'absolute', top: 0, right: 0, width: 30, height: '100%', opacity: 0, fontSize: 16 }} />
          </div>
          <div style={{ width: 1, height: 16, background: '#2a2a2a' }} />
          <div onClick={cycleSeats} style={metaStyle(true)}>{seats} جێ</div>
        </div>
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', direction: 'rtl' }}>
          <div onClick={() => setPriceType('coffee')} style={{ background: '#2a2a2a', borderRadius: 6, padding: '6px 8px', flex: 1, fontSize: 12, color: priceType === 'coffee' ? '#df6530' : '#e5e5e5', cursor: 'pointer', textAlign: 'center' }}>
            قاوەیەک
          </div>
          <div onClick={() => setPriceType('iqd')} style={{ background: '#2a2a2a', borderRadius: 6, padding: '6px 8px', flex: 1, fontSize: 12, color: priceType === 'iqd' ? '#df6530' : '#e5e5e5', cursor: 'pointer', textAlign: 'center' }}>
            پارە
          </div>
        </div>
        <div style={{ padding: '0 12px 8px', display: priceType === 'iqd' ? 'block' : 'none' }}>
          <input
            className="money-input"
            type="text"
            value={price}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              const v = Number(raw)
              if (!raw || (v >= 0 && v <= 5000)) setPrice(raw)
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            style={{
              background: '#2a2a2a', border: 'none', borderRadius: 8,
              padding: '6px 8px', width: '100%', fontSize: 12,
              color: '#e5e5e5', WebkitTextFillColor: '#e5e5e5',
              outline: 'none', direction: 'ltr', textAlign: 'left',
              fontFamily: "'Noto Sans Arabic', sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 19, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>جۆری ئۆتۆمبێل</span>
              <input value={carMake} onChange={(e) => setCarMake(e.target.value)} placeholder="Toyota" className="car-input" />
            </div>
            <div style={{ flex: 1 }}>
              <span style={labelStyle}>مۆدێلی ئۆتۆمبێل</span>
              <input value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="Camry" className="car-input" />
            </div>
          </div>
          <span style={labelStyle}>ڕەنگی ئۆتۆمبێل</span>
          <input value={carColor} onChange={(e) => setCarColor(e.target.value)} placeholder="White" className="car-input" />
        </div>
      </div>

      <div style={{ background: '#1e1e1e', borderRadius: 14, marginBottom: 19, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px' }}>
          <span style={labelStyle}>تێبینی</span>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="هەر شتێک دەربارەی ڕێیەکەت یان خۆت..."
            rows={2}
            className="note-input"
          />
        </div>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

      <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 440, padding: '0 20px', zIndex: 10 }}>
        <div
          onClick={handleSubmit}
          style={{
            background: loading ? '#555' : '#df6530', borderRadius: 14,
            padding: 14, textAlign: 'center', cursor: loading ? 'default' : 'pointer',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#e5e5e5', WebkitTextFillColor: '#e5e5e5' }}>{loading ? '...' : 'برۆ'}</span>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
