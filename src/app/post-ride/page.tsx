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

const ROUTE_HOURS: Record<string, number> = {
  'erbil-suli': 2, 'suli-erbil': 2,
  'erbil-duhok': 3, 'duhok-erbil': 3,
  'suli-duhok': 5, 'duhok-suli': 5,
}
const ROUTE_DISTANCE: Record<string, string> = {
  'erbil-suli': '١٦٠ کم', 'suli-erbil': '١٦٠ کم',
  'erbil-duhok': '١٨٠ کم', 'duhok-erbil': '١٨٠ کم',
  'suli-duhok': '٣٤٠ کم', 'duhok-suli': '٣٤٠ کم',
}
const COLOR_KU: Record<string, string> = {
  black: 'ڕەش', white: 'سپی', red: 'سوور', blue: 'شین', green: 'سەوز',
  yellow: 'زەرد', silver: 'زیوی', grey: 'خۆڵەمێشی', gray: 'خۆڵەمێشی',
  brown: 'قاوەیی', orange: 'پرتەقاڵی', gold: 'ئاڵتوونی',
}

function toKurdishNum(n: number | string): string {
  return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
}
function formatTimeFromISO(dt: string): string {
  const d = new Date(dt)
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}
function estimateArrival(dt: string, fromCity: string, toCity: string): string {
  const d = new Date(dt)
  const add = ROUTE_HOURS[`${fromCity}-${toCity}`] || 2
  d.setHours(d.getHours() + add)
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}
function formatWhatsApp(phone: string) {
  return 'https://wa.me/' + phone.replace(/^0/, '964')
}

const T = {
  bg: '#0e1015', card: '#1a1c22', cardInner: '#1f2128',
  border: 'rgba(255,255,255,0.06)', orange: '#df6530',
  text: '#e5e5e5', textMid: '#aaa', textDim: '#777', textFaint: '#555',
  green: '#4ade80', greenBg: '#1a2e1a', radius: 14,
  shadow: '0 2px 8px rgba(0,0,0,0.3)',
}

export default function PostRidePage() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [isVerifiedDriver, setIsVerifiedDriver] = useState(false)
  const [activeTab, setActiveTab] = useState<'post' | 'manage'>('post')

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
  const [seatsTapped, setSeatsTapped] = useState(false)
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

  // Manage tab state
  const [myPostedRides, setMyPostedRides] = useState<any[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loadingManage, setLoadingManage] = useState(false)

  useEffect(() => { checkVerification() }, [])

  async function checkVerification() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setChecking(false); return }
    const { data: profile } = await supabase.from('profiles').select('role, verification_status').eq('id', user.id).single()
    if (profile && (profile.role === 'driver' || profile.role === 'both') && profile.verification_status === 'verified') {
      setIsVerifiedDriver(true)
    }
    setChecking(false)
  }

  async function loadPostedRides() {
    setLoadingManage(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoadingManage(false); return }
    const { data: rides } = await supabase
      .from('rides')
      .select('*, ride_requests(*, passenger:profiles!passenger_id(full_name, phone, avatar_url))')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })
    setMyPostedRides(rides || [])
    setLoadingManage(false)
  }

  useEffect(() => {
    if (activeTab === 'manage' && isVerifiedDriver) loadPostedRides()
  }, [activeTab, isVerifiedDriver])

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const totalPending = myPostedRides.reduce((sum, r) =>
    sum + (r.ride_requests?.filter((req: any) => req.status === 'pending').length || 0), 0)

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
    if (!seatsTapped) { setSeatsTapped(true); setSeats('1'); return }
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
      setError('تکایە هەموو خانەکان پڕبکەرەوە'); return
    }
    if (fromCity === toCity) {
      setError('شوێنی چوون و هاتن ناتوانن هاوشێوە بن'); return
    }
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const departureTime = new Date(`${date}T${time}:00`).toISOString()
    const { error: insertError } = await supabase.from('rides').insert({
      driver_id: user.id, from_city: fromCity, to_city: toCity,
      departure_time: departureTime, available_seats: parseInt(seats),
      price_type: priceType === 'coffee' ? 'coffee' : 'iqd',
      price_iqd: priceType === 'iqd' ? parseInt(price) || 0 : null,
      car_make: carMake || null, car_model: carModel || null,
      car_color: carColor || null, notes: notes || null, status: 'active',
    })
    if (insertError) { setError(insertError.message); setLoading(false) }
    else { setActiveTab('manage'); loadPostedRides(); setFromCity(''); setToCity(''); setDate(''); setTime(''); setSeats('1'); setPrice(''); setCarMake(''); setCarModel(''); setCarColor(''); setNotes(''); setLoading(false) }
  }

  async function handleRequest(requestId: string, action: 'approved' | 'declined') {
    await supabase.from('ride_requests').update({ status: action }).eq('id', requestId)
    loadPostedRides()
  }

  async function handleCancelRide(rideId: string) {
    await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
    loadPostedRides()
  }

  // ─── Loading ───
  if (checking) return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: T.bg, maxWidth: 480, margin: '0 auto' }}>
      <BottomNav />
    </div>
  )

  // ═══════════════════════════════════════
  // BECOME A DRIVER (unverified)
  // ═══════════════════════════════════════
  if (!isVerifiedDriver) {
    if (submitted) return (
      <div style={{
        direction: 'rtl', minHeight: '100vh', background: T.bg,
        maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
          <circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" />
        </svg>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>ناسنامەکانت نێردران</h2>
        <p style={{ fontSize: 13, color: T.textDim, textAlign: 'center', marginBottom: 32, lineHeight: 1.8 }}>
          کاتێک پشتڕاست کرایتەوە، دەتوانیت ڕێ پۆست بکەیت
        </p>
        <div onClick={() => router.push('/home')} style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: '12px 24px', fontSize: 13, color: T.textMid, cursor: 'pointer',
        }}>گەڕانەوە بۆ سەرەکی</div>
        <BottomNav />
      </div>
    )

    return (
      <div style={{
        direction: 'rtl', height: '100vh', background: T.bg,
        maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column',
        fontFamily: "'Noto Sans Arabic', sans-serif",
      }}>
        <div style={{ padding: '24px 20px 0', flexShrink: 0 }}>
          <span onClick={() => router.push('/home')} style={{ color: T.textFaint, fontSize: 13, cursor: 'pointer' }}>← گەڕانەوە</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 10, lineHeight: 1.6 }}>
            بوون بە <span style={{ color: T.orange }}>شۆفێر</span>
          </h1>
          <p style={{ color: T.textDim, marginBottom: 28, fontSize: 12, lineHeight: 1.8 }}>
            مۆڵەتی شۆفێری و سێلفی بنێرە بۆ ئەوەی ببی بە شۆفێڕ
          </p>
          {uploadError && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{uploadError}</p>}

          <input type="file" accept="image/*" ref={licenseRef} style={{ display: 'none' }} onChange={e => setLicenseFile(e.target.files?.[0] || null)} />
          <div onClick={() => licenseRef.current?.click()} style={{
            background: T.card, border: `1px solid ${licenseFile ? 'rgba(74,222,128,0.15)' : T.border}`,
            borderRadius: 16, padding: 20, marginBottom: 10, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 9, color: T.textFaint, letterSpacing: 1 }}>مۆڵەتی شۆفێری</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: T.textFaint, letterSpacing: 1.5 }}>کوردستان</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" /></svg>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 56, height: 68, borderRadius: 8, background: licenseFile ? 'rgba(74,222,128,0.08)' : T.cardInner, border: `1px solid ${licenseFile ? 'rgba(74,222,128,0.2)' : '#333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {licenseFile ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 12 11 15 16 9" /></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" /></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 6, background: T.cardInner, borderRadius: 3, width: '80%', marginBottom: 8 }} />
                <div style={{ height: 6, background: T.cardInner, borderRadius: 3, width: '60%', marginBottom: 8 }} />
                <div style={{ height: 6, background: T.cardInner, borderRadius: 3, width: '45%' }} />
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 16, paddingTop: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: licenseFile ? T.green : T.textDim, fontWeight: 500 }}>
                {licenseFile ? 'ناردنمان! چاوەڕێی وەڵامبە' : 'وێنەی مۆڵەتنامەکەت ئەپلۆد بکە'}
              </span>
            </div>
          </div>

          <input type="file" accept="image/*" capture="user" ref={selfieRef} style={{ display: 'none' }} onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
          <div onClick={() => selfieRef.current?.click()} style={{
            background: T.card, border: `1px solid ${selfieFile ? 'rgba(74,222,128,0.15)' : T.border}`,
            borderRadius: 16, padding: 20, marginBottom: 10, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: selfieFile ? 'rgba(74,222,128,0.08)' : T.cardInner, border: `2px dashed ${selfieFile ? 'rgba(74,222,128,0.3)' : '#333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selfieFile ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 12 11 15 16 9" /></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: selfieFile ? T.green : T.textMid, fontSize: 13, marginBottom: 4 }}>{selfieFile ? 'سێلفییەکەت سەرکەوتوو بوو' : 'سێلفی بگرە'}</div>
                <div style={{ fontSize: 11, color: T.textFaint }}>وێنەیەکی ڕوونی ڕووخسارت</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '0 20px 96px' }}>
          <button onClick={handleVerifySubmit} disabled={uploading} style={{
            background: T.card, color: T.orange, border: `1px solid ${T.border}`,
            borderRadius: 16, padding: 16, fontSize: 14, fontWeight: 600,
            cursor: uploading ? 'default' : 'pointer', width: '100%',
            opacity: uploading ? 0.5 : 1, fontFamily: "'Noto Sans Arabic', sans-serif",
          }}>{uploading ? '...چاوەڕوان بە' : 'بنێرە'}</button>
        </div>
        <BottomNav />
      </div>
    )
  }

  // ═══════════════════════════════════════
  // VERIFIED DRIVER — POST + MANAGE
  // ═══════════════════════════════════════
  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: T.bg, maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px', fontFamily: "'Noto Sans Arabic', sans-serif", position: 'relative' }}>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text }}><span style={{ color: T.orange }}>ڕێ</span> پۆستکە</h1>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <div onClick={() => setActiveTab('post')} style={{
          flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 10,
          fontSize: 12, fontWeight: activeTab === 'post' ? 600 : 400, cursor: 'pointer',
          background: activeTab === 'post' ? 'rgba(223,101,48,0.1)' : 'transparent',
          color: activeTab === 'post' ? 'rgba(255,255,255,0.85)' : T.textDim,
          border: `1px solid ${activeTab === 'post' ? 'rgba(223,101,48,0.25)' : T.border}`,
        }}>گەشتێکی نوێ</div>
        <div onClick={() => setActiveTab('manage')} style={{
          flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 10,
          fontSize: 12, fontWeight: activeTab === 'manage' ? 600 : 400, cursor: 'pointer',
          background: activeTab === 'manage' ? 'rgba(223,101,48,0.1)' : 'transparent',
          color: activeTab === 'manage' ? 'rgba(255,255,255,0.85)' : T.textDim,
          border: `1px solid ${activeTab === 'manage' ? 'rgba(223,101,48,0.25)' : T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          ڕێکانم
          {totalPending > 0 && <span style={{ background: T.orange, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 10, padding: '1px 6px' }}>{toKurdishNum(totalPending)}</span>}
        </div>
      </div>

      {/* ═══ POST TAB ═══ */}
      {activeTab === 'post' && (
        <div>
          {/* Route card */}
          <div style={{ background: T.card, borderRadius: T.radius, marginBottom: 14, boxShadow: T.shadow, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid rgba(255,255,255,0.85)` }} />
                <div style={{ width: 1, height: 24, background: '#333' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.text }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div onClick={() => cycleCity(fromCity, setFromCity)} style={{ background: T.cardInner, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: fromCity ? T.text : T.textDim, cursor: 'pointer', fontFamily: "'Noto Sans Arabic', sans-serif" }}>
                  {fromCity ? CITIES[fromCity] : 'لە کوێ؟'}
                </div>
                <div onClick={() => cycleCity(toCity, setToCity)} style={{ background: T.cardInner, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: toCity ? T.text : T.textDim, cursor: 'pointer', fontFamily: "'Noto Sans Arabic', sans-serif" }}>
                  {toCity ? CITIES[toCity] : 'بۆ کوێ؟'}
                </div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
              <div onClick={() => dateRef.current?.showPicker()} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                <div style={{ fontSize: 9, color: T.textMid, marginBottom: 3 }}>بەروار</div>
                <div style={{ fontSize: 13, color: date ? T.text : T.textDim, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {date ? formatDate(date) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#686e88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  )}
                </div>
                <input ref={dateRef} type="date" value={date} onChange={e => setDate(e.target.value)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }} />
              </div>
              <div style={{ width: 1, height: 28, background: T.border }} />
              <div onClick={() => timeRef.current?.showPicker()} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                <div style={{ fontSize: 9, color: T.textMid, marginBottom: 3 }}>کات</div>
                <div style={{ fontSize: 13, color: time ? T.text : T.textDim, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {time ? time : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#686e88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  )}
                </div>
                <input ref={timeRef} type="time" value={time} onChange={e => setTime(e.target.value)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }} />
              </div>
              <div style={{ width: 1, height: 28, background: T.border }} />
              <div onClick={cycleSeats} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 9, color: T.textMid, marginBottom: 3 }}>جێگا</div>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={seatsTapped ? '#e5e5e5' : '#686e88'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 19v2" /><path d="M18 19v2" />
                    <path d="M7 19h10a2 2 0 0 0 2-2v-3a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v3a2 2 0 0 0 2 2z" />
                    <path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
                    <path d="M9 14h6" />
                  </svg>
                  {seatsTapped && <span style={{ fontSize: 10, fontWeight: 700, color: '#e5e5e5', marginRight: 4 }}>{seats}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Price card */}
          <div style={{ background: T.card, borderRadius: T.radius, marginBottom: 14, boxShadow: T.shadow, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px' }}>
            <div style={{ fontSize: 9, color: T.textFaint, marginBottom: 8, fontWeight: 600 }}>نرخ</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div onClick={() => setPriceType('coffee')} style={{
                flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 10, cursor: 'pointer',
                background: priceType === 'coffee' ? 'rgba(223,101,48,0.1)' : T.cardInner,
                border: `1px solid ${priceType === 'coffee' ? 'rgba(223,101,48,0.25)' : 'transparent'}`,
                color: priceType === 'coffee' ? 'rgba(255,255,255,0.85)' : T.textMid, fontSize: 12, fontWeight: 500,
              }}>قاوەیەک</div>
              <div onClick={() => setPriceType('iqd')} style={{
                flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 10, cursor: 'pointer',
                background: priceType === 'iqd' ? 'rgba(223,101,48,0.1)' : T.cardInner,
                border: `1px solid ${priceType === 'iqd' ? 'rgba(223,101,48,0.25)' : 'transparent'}`,
                color: priceType === 'iqd' ? 'rgba(255,255,255,0.85)' : T.textMid, fontSize: 12, fontWeight: 500,
              }}>پارە</div>
            </div>
            {priceType === 'iqd' && (
              <div style={{ marginTop: 10 }}>
                <input className="money-input" type="text" value={price} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); const v = Number(raw); if (!raw || (v >= 0 && v <= 5000)) setPrice(raw) }} inputMode="numeric" pattern="[0-9]*" placeholder="0"
                  style={{ background: T.cardInner, border: 'none', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: 12, color: T.text, WebkitTextFillColor: T.text, outline: 'none', direction: 'ltr', textAlign: 'left', fontFamily: "'Noto Sans Arabic', sans-serif" }} />
              </div>
            )}
          </div>

          {/* Car + Notes card */}
          <div style={{ background: T.card, borderRadius: T.radius, marginBottom: 14, boxShadow: T.shadow, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px' }}>
            <div style={{ fontSize: 9, color: T.textFaint, marginBottom: 10, fontWeight: 600 }}>زانیاری ئۆتۆمبێل</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: T.textDim, marginBottom: 4 }}>جۆر</div>
                <input value={carMake} onChange={e => setCarMake(e.target.value)} placeholder="Toyota" className="car-input" style={{ background: T.cardInner, border: 'none', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: 12, color: '#ccc', WebkitTextFillColor: '#ccc', outline: 'none', fontFamily: "'Noto Sans Arabic', sans-serif" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: T.textDim, marginBottom: 4 }}>مۆدێل</div>
                <input value={carModel} onChange={e => setCarModel(e.target.value)} placeholder="Camry" className="car-input" style={{ background: T.cardInner, border: 'none', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: 12, color: '#ccc', WebkitTextFillColor: '#ccc', outline: 'none', fontFamily: "'Noto Sans Arabic', sans-serif" }} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: T.textDim, marginBottom: 4 }}>ڕەنگ</div>
              <input value={carColor} onChange={e => setCarColor(e.target.value)} placeholder="White" className="car-input" style={{ background: T.cardInner, border: 'none', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: 12, color: '#ccc', WebkitTextFillColor: '#ccc', outline: 'none', fontFamily: "'Noto Sans Arabic', sans-serif" }} />
            </div>
            <div style={{ height: 1, background: T.border, margin: '4px 0 12px' }} />
            <div style={{ fontSize: 9, color: T.textFaint, marginBottom: 6, fontWeight: 600 }}>تێبینی</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="هەر شتێک دەربارەی ڕێیەکەت..." rows={2} className="note-input" style={{ background: T.cardInner, border: 'none', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: 12, color: '#ccc', WebkitTextFillColor: '#ccc', outline: 'none', resize: 'none', fontFamily: "'Noto Sans Arabic', sans-serif", lineHeight: 1.8 }} />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

          <div onClick={handleSubmit} style={{
            background: T.card, color: 'rgba(255,255,255,0.85)', border: `1px solid ${T.border}`, borderRadius: 14,
            padding: 14, textAlign: 'center', cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{loading ? '...' : 'بینێرە!'}</span>
          </div>
        </div>
      )}

      {/* ═══ MANAGE TAB ═══ */}
      {activeTab === 'manage' && (
        <div>
          {loadingManage ? <div /> : myPostedRides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ color: T.textFaint, fontSize: 14 }}>هێشتا ڕێت پۆست نەکردووە</p>
            </div>
          ) : myPostedRides.map(ride => {
            const depTime = formatTimeFromISO(ride.departure_time)
            const arrTime = estimateArrival(ride.departure_time, ride.from_city, ride.to_city)
            const routeKey = `${ride.from_city}-${ride.to_city}`
            const distance = ROUTE_DISTANCE[routeKey] || ''
            const isCompleted = ride.status === 'completed'
            const isCancelled = ride.status === 'cancelled'
            const isOpen = expanded[ride.id]
            const carColor = ride.car_color || ''
            const priceDisp = ride.price_type === 'coffee' ? 'قاوەیەک' : `${toKurdishNum(Number(ride.price_iqd || 0).toLocaleString('en'))} دینار`
            const requests = ride.ride_requests || []
            const pendingCount = requests.filter((r: any) => r.status === 'pending').length

            return (
              <div key={ride.id} style={{
                background: T.card, borderRadius: T.radius, marginBottom: 10,
                boxShadow: T.shadow, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
                opacity: isCancelled ? 0.5 : 1,
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
                      <div style={{ width: 6, height: 6, borderRadius: '50%', border: `2px solid rgba(255,255,255,0.85)`, flexShrink: 0 }} />
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

                {/* Status + hamburger + pending */}
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                      background: isCompleted ? T.greenBg : isCancelled ? '#2e1a1a' : '#2e2a1a',
                      color: isCompleted ? T.green : isCancelled ? '#f87171' : '#fbbf24',
                    }}>{isCompleted ? 'تەواو بوو ✓' : isCancelled ? 'هەڵوەشاوە' : 'چالاک'}</span>
                    <span style={{ fontSize: 10, color: T.textDim }}>{ride.available_seats} جێ</span>
                  </div>
                  <div onClick={() => toggle(ride.id)} style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: isOpen ? T.border : 'transparent',
                    border: `1px solid ${isOpen ? '#444' : '#333'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isOpen ? T.textMid : '#555'} strokeWidth="2" strokeLinecap="round">
                      <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {pendingCount > 0 && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: 'rgba(223,101,48,0.12)', color: T.orange, fontWeight: 600 }}>{pendingCount} داواکاری نوێ</span>}
                  </div>
                </div>

                {/* Expandable details */}
                {isOpen && (
                  <div style={{ padding: '10px 16px' }}>
                    <div style={{ padding: '8px 12px', background: T.cardInner, borderRadius: 10, fontSize: 11, color: T.textMid, lineHeight: 2, marginBottom: ride.notes ? 8 : 0 }}>
                      {ride.car_make && <div>جۆر: <span style={{ color: '#ccc' }}>{ride.car_make}</span></div>}
                      {ride.car_model && <div>مۆدێل: <span style={{ color: '#ccc' }}>{ride.car_model}</span></div>}
                      {carColor && <div>ڕەنگ: <span style={{ color: '#ccc' }}>{COLOR_KU[carColor.toLowerCase()] || carColor}</span></div>}
                      <div>نرخ: <span style={{ color: '#ccc' }}>{priceDisp}</span></div>
                      <div>جێگای بەردەست: <span style={{ color: '#ccc' }}>{ride.available_seats > 0 ? `${ride.available_seats} جێ` : 'پڕە'}</span></div>
                    </div>
                    {ride.notes && (
                      <div style={{ padding: '8px 12px', background: T.cardInner, borderRadius: 10, borderRight: `3px solid rgba(255,255,255,0.15)` }}>
                        <div style={{ fontSize: 8, color: T.textFaint, marginBottom: 2, fontWeight: 600 }}>تێبینی</div>
                        <div style={{ fontSize: 10, color: '#999', lineHeight: 1.8 }}>{ride.notes}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Requests */}
                {requests.length > 0 && (
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: '8px 16px 10px' }}>
                    <div style={{ fontSize: 9, color: T.textFaint, marginBottom: 6, fontWeight: 600 }}>داواکان</div>
                    {requests.map((req: any) => (
                      <div key={req.id} style={{
                        background: T.cardInner, borderRadius: 8, padding: '7px 10px', marginBottom: 4,
                        border: req.status === 'pending' ? '1px solid rgba(223,101,48,0.15)' : '1px solid transparent',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: T.text, fontWeight: 500 }}>{req.passenger?.full_name || 'سەرنشین'}</span>
                          {req.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button onClick={() => handleRequest(req.id, 'approved')} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>قبوڵ</button>
                              <button onClick={() => handleRequest(req.id, 'declined')} style={{ background: T.border, color: '#f87171', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 10, cursor: 'pointer' }}>ڕەت</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, fontWeight: 600, background: req.status === 'approved' ? T.greenBg : '#2e1a1a', color: req.status === 'approved' ? T.green : '#f87171' }}>{req.status === 'approved' ? 'قبوڵ کرا' : 'ڕەتکرایەوە'}</span>
                              {req.status === 'approved' && req.passenger?.phone && (
                                <a href={formatWhatsApp(req.passenger.phone)} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: 'white', borderRadius: 7, padding: '3px 8px', fontSize: 9, fontWeight: 600, textDecoration: 'none' }}>WhatsApp</a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {requests.length === 0 && !isCompleted && !isCancelled && (
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: '8px 16px' }}>
                    <p style={{ fontSize: 10, color: T.textFaint, margin: 0 }}>هێشتا کەس داوای ئەم ڕێیە نەکردووە</p>
                  </div>
                )}

                {!isCompleted && !isCancelled && (
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: '6px 16px' }}>
                    <button onClick={() => handleCancelRide(ride.id)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 11, cursor: 'pointer', padding: '3px 0' }}>هەڵوەشاندنەوە</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
