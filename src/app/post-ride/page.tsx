'use client'
import { useState, useRef, useEffect } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CITIES, toKurdishNum } from '@/lib/utils'
import { ku } from '@/lib/translations'
import { RideCard } from '@/components/ui/RideCard'
import SketchCar from '@/components/ui/icons/SketchCar'
import Card from '@/components/ui/Card'
import DashedDivider from '@/components/ui/DashedDivider'

const CITY_KEYS = ['', 'erbil', 'suli', 'duhok'] as const

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
  const [editingRideId, setEditingRideId] = useState<string | null>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)

  // Manage tab state
  const [myPostedRides, setMyPostedRides] = useState<any[]>([])
  const [loadingManage, setLoadingManage] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'manage') setActiveTab('manage')
  }, [])

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
      .select('id, from_city, to_city, departure_time, available_seats, price_type, price_iqd, status, car_make, car_model, car_color, notes')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })
    if (rides) {
      setMyPostedRides(rides)
    } else {
      setMyPostedRides([])
    }
    setLoadingManage(false)
  }

  useEffect(() => {
    if (activeTab === 'manage' && isVerifiedDriver) loadPostedRides()
  }, [activeTab, isVerifiedDriver])

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

  function startEdit(ride: any) {
    const dep = new Date(ride.departure_time)
    setEditingRideId(ride.id)
    setFromCity(ride.from_city)
    setToCity(ride.to_city)
    setDate(dep.toISOString().split('T')[0])
    setTime(dep.toTimeString().slice(0, 5))
    setSeats(String(ride.available_seats))
    setSeatsTapped(true)
    setPriceType(ride.price_type === 'coffee' ? 'coffee' : 'iqd')
    setPrice(ride.price_iqd ? String(ride.price_iqd) : '')
    setCarMake(ride.car_make || '')
    setCarModel(ride.car_model || '')
    setCarColor(ride.car_color || '')
    setNotes(ride.notes || '')
    setActiveTab('post')
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

  async function handleSubmit() {
    if (!fromCity) { setError('تکایە شاری دەستپێکردن دیاری بکە'); return }
    if (!toCity) { setError('تکایە شاری مەبەست دیاری بکە'); return }
    if (!date) { setError('تکایە بەرواری گەشت دیاری بکە'); return }
    if (!time) { setError('تکایە کاتی گەشت دیاری بکە'); return }
    if (!carMake) { setError('تکایە جۆری ئۆتۆمبێل دیاری بکە'); return }
    if (!carModel) { setError('تکایە مۆدێلی ئۆتۆمبێل دیاری بکە'); return }
    if (!carColor) { setError('تکایە ڕەنگی ئۆتۆمبێل دیاری بکە'); return }
    if (fromCity === toCity) {
      setError('شوێنی چوون و هاتن ناتوانن هاوشێوە بن'); return
    }
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const departureTime = new Date(`${date}T${time}:00`).toISOString()
    const rideData = {
      from_city: fromCity, to_city: toCity,
      departure_time: departureTime, available_seats: parseInt(seats),
      price_type: priceType === 'coffee' ? 'coffee' : 'iqd',
      price_iqd: priceType === 'iqd' ? parseInt(price) || 0 : null,
      car_make: carMake || null, car_model: carModel || null,
      car_color: carColor || null, notes: notes || null,
    }
    const { error: saveError } = editingRideId
      ? await supabase.from('rides').update(rideData).eq('id', editingRideId)
      : await supabase.from('rides').insert({ ...rideData, driver_id: user.id, status: 'active' })
    if (saveError) { setError(saveError.message); setLoading(false) }
    else {
      // If editing, notify approved passengers about changes
      if (editingRideId) {
        const { data: approved } = await supabase.from('ride_requests').select('passenger_id').eq('ride_id', editingRideId).eq('status', 'approved')
        if (approved && approved.length > 0) {
          const notifs = approved.map((r: any) => ({
            user_id: r.passenger_id,
            type: 'ride_updated',
            ride_id: editingRideId,
            from_user_id: user.id,
            metadata: { changes: ['وردەکاری گەشتەکە گۆڕدرا'] },
          }))
          await supabase.from('notifications').insert(notifs)
        }
      }
      setEditingRideId(null); setActiveTab('manage'); loadPostedRides(); setFromCity(''); setToCity(''); setDate(''); setTime(''); setSeats('1'); setPrice(''); setCarMake(''); setCarModel(''); setCarColor(''); setNotes(''); setLoading(false)
    }
  }

  const carInputStyle: React.CSSProperties = {
    background: 'var(--input-ride-bg)', border: 'var(--input-standard-border)',
    borderRadius: 'var(--radius-base)', padding: 'var(--input-standard-padding)',
    width: '100%', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)',
    WebkitTextFillColor: 'var(--color-text-primary)', outline: 'none',
    fontFamily: 'var(--font-family-body)',
  }

  // ─── Loading ───
  if (checking) return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)', maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto' }}>
      <BottomNav />
    </div>
  )

  // ═══════════════════════════════════════
  // BECOME A DRIVER (unverified)
  // ═══════════════════════════════════════
  if (!isVerifiedDriver) {
    if (submitted) return (
      <div style={{
        direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)',
        maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 'var(--space-page-top) var(--space-page-x)',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--space-5)' }}>
          <circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" />
        </svg>
        <h2 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>ناسنامەکانت نێردران</h2>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-8)', lineHeight: 'var(--font-lineHeight-relaxed)' }}>
          کاتێک پشتڕاست کرایتەوە، دەتوانیت گەشت پۆست بکەیت
        </p>
        <div onClick={() => router.push('/home')} style={{
          background: 'var(--color-bg-surface)', border: 'var(--border-width-thin) solid var(--color-border-strong)', borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', cursor: 'pointer',
        }}>گەڕانەوە بۆ سەرەکی</div>
        <BottomNav />
      </div>
    )

    return (
      <div style={{
        direction: 'rtl', height: '100vh', background: 'var(--color-bg-canvas)',
        maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: 'var(--space-page-top) var(--space-page-x) 0', flexShrink: 0 }}>
          <span onClick={() => router.push('/home')} style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-md)', cursor: 'pointer' }}>← گەڕانەوە</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 var(--space-page-x)' }}>
          <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-extrabold)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 10, lineHeight: 'var(--font-lineHeight-tight)' }}>
            بۆ بوون بە <span style={{ color: 'var(--color-brand-primary)' }}>شۆفێر</span>، پێویستە خۆت ڤێریفای بکەی
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-7)', fontSize: 'var(--font-size-base)', lineHeight: 'var(--font-lineHeight-relaxed)' }}>
            مۆڵەتی شۆفێری و سێلفی بنێرە بۆ ئەوەی ببی بە شۆفێڕ
          </p>
          {uploadError && <p style={{ color: 'var(--color-status-error)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-3)' }}>{uploadError}</p>}

          <input type="file" accept="image/*" ref={licenseRef} style={{ display: 'none' }} onChange={e => setLicenseFile(e.target.files?.[0] || null)} />
          <div onClick={() => licenseRef.current?.click()} style={{
            background: 'var(--color-bg-surface)', border: `var(--border-width-thin) solid ${licenseFile ? 'var(--color-upload-border)' : 'var(--color-border-strong)'}`,
            borderRadius: 'var(--radius-4xl)', padding: 'var(--space-5)', marginBottom: 10, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--font-letterSpacing-wide)' }}>مۆڵەتی شۆفێری</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)' }}>
                <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--font-letterSpacing-wider)' }}>کوردستان</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" /></svg>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-card-md)', alignItems: 'center' }}>
              <div style={{ width: 'var(--size-upload-licenseThumbnail)', height: 'var(--size-upload-licenseThumbnailH)', borderRadius: 'var(--radius-base)', background: licenseFile ? 'var(--color-upload-filled)' : 'var(--color-bg-sunken)', border: `var(--border-width-thin) solid ${licenseFile ? 'var(--color-upload-dashedBorder)' : 'var(--color-border-divider)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {licenseFile ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 12 11 15 16 9" /></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M20 21c0-3.31-3.58-6-8-6s-8 2.69-8 6" /></svg>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 'var(--size-skeleton)', background: 'var(--color-bg-sunken)', borderRadius: 3, width: '80%', marginBottom: 'var(--space-2)' }} />
                <div style={{ height: 'var(--size-skeleton)', background: 'var(--color-bg-sunken)', borderRadius: 3, width: '60%', marginBottom: 'var(--space-2)' }} />
                <div style={{ height: 'var(--size-skeleton)', background: 'var(--color-bg-sunken)', borderRadius: 3, width: '45%' }} />
              </div>
            </div>
            <div style={{ borderTop: 'var(--border-width-thin) solid var(--color-border-strong)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--font-size-base)', color: licenseFile ? 'var(--color-status-success)' : 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' as unknown as number }}>
                {licenseFile ? 'ناردنمان! چاوەڕێی وەڵامبە' : 'وێنەی مۆڵەتنامەکەت ئەپلۆد بکە'}
              </span>
            </div>
          </div>

          <input type="file" accept="image/*" capture="user" ref={selfieRef} style={{ display: 'none' }} onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
          <div onClick={() => selfieRef.current?.click()} style={{
            background: 'var(--color-bg-surface)', border: `var(--border-width-thin) solid ${selfieFile ? 'var(--color-upload-border)' : 'var(--color-border-strong)'}`,
            borderRadius: 'var(--radius-4xl)', padding: 'var(--space-5)', marginBottom: 10, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-card-md)' }}>
              <div style={{ width: 'var(--size-upload-selfieCircle)', height: 'var(--size-upload-selfieCircle)', borderRadius: '50%', background: selfieFile ? 'var(--color-upload-filled)' : 'var(--color-bg-sunken)', border: `2px dashed ${selfieFile ? 'var(--color-upload-selfieBorder)' : 'var(--color-border-divider)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selfieFile ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 12 11 15 16 9" /></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>}
              </div>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)' as unknown as number, color: selfieFile ? 'var(--color-status-success)' : 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-1)' }}>{selfieFile ? 'سێلفییەکەت سەرکەوتوو بوو' : 'سێلفی بگرە'}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>وێنەیەکی ڕوونی ڕووخسارت</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '0 var(--space-page-x) var(--space-navClearance)' }}>
          <button onClick={handleVerifySubmit} disabled={uploading} style={{
            background: 'var(--color-bg-surface)', color: 'var(--color-brand-primary)', border: 'var(--border-width-thin) solid var(--color-border-strong)',
            borderRadius: 'var(--radius-4xl)', padding: 'var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' as unknown as number,
            cursor: uploading ? 'default' : 'pointer', width: '100%',
            opacity: uploading ? 'var(--opacity-disabled)' as unknown as number : 1, fontFamily: 'var(--font-family-body)',
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
    <div style={{ direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)', maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto', padding: 'var(--space-page-top) var(--space-page-x) var(--space-navClearance)', position: 'relative' }}>

      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-text-primary)' }}><span style={{ color: 'var(--color-brand-primary)' }}>ڕێ</span> گەشت پۆستکە</h1>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <div onClick={() => setActiveTab('post')} style={{
          flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' as unknown as number, cursor: 'pointer',
          background: activeTab === 'post' ? 'var(--color-brand-primary)' : 'var(--color-bg-surface)',
          color: activeTab === 'post' ? 'var(--color-text-onAccent)' : 'var(--color-text-primary)',
          border: 'var(--border-width-thick) solid var(--color-text-primary)',
          boxShadow: activeTab === 'post' ? 'var(--shadow-card)' : 'var(--shadow-muted)',
        }}>گەشتێکی نوێ</div>
        <div onClick={() => setActiveTab('manage')} style={{
          flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' as unknown as number, cursor: 'pointer',
          background: activeTab === 'manage' ? 'var(--color-brand-primary)' : 'var(--color-bg-surface)',
          color: activeTab === 'manage' ? 'var(--color-text-onAccent)' : 'var(--color-text-primary)',
          border: 'var(--border-width-thick) solid var(--color-text-primary)',
          boxShadow: activeTab === 'manage' ? 'var(--shadow-card)' : 'var(--shadow-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1-5)',
        }}>
          {ku.myRidesAsDriver}
        </div>
      </div>

      {/* ═══ POST TAB ═══ */}
      {activeTab === 'post' && (
        <div style={{ paddingBottom: 'var(--space-navClearanceLg)' }}>
          {/* SketchCar */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 var(--space-card-md)' }}>
            <SketchCar size={110} color={'var(--color-brand-primary)'} />
          </div>

          {/* Route card */}
          <Card style={{ marginBottom: 'var(--space-card-md)', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-card-md) var(--space-card-lg)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
                <div style={{ width: 'var(--size-routeDotSm)', height: 'var(--size-routeDotSm)', borderRadius: '50%', border: 'var(--border-width-thick) solid var(--color-text-primary)' }} />
                <div style={{ width: 1, height: 'var(--space-6)', background: 'var(--color-border-divider)' }} />
                <div style={{ width: 'var(--size-routeDotSm)', height: 'var(--size-routeDotSm)', borderRadius: '50%', background: 'var(--color-text-primary)' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div onClick={() => cycleCity(fromCity, setFromCity)} style={{ background: 'var(--color-bg-sunken)', borderRadius: 'var(--radius-xl)', padding: 'var(--input-ride-padding)', fontSize: 'var(--font-size-md)', color: fromCity ? 'var(--color-text-primary)' : 'var(--color-text-muted)', cursor: 'pointer' }}>
                  {fromCity ? CITIES[fromCity] : 'لە کوێ؟'}
                </div>
                <DashedDivider style={{ margin: '0 var(--space-1)' }} />
                <div onClick={() => cycleCity(toCity, setToCity)} style={{ background: 'var(--color-bg-sunken)', borderRadius: 'var(--radius-xl)', padding: 'var(--input-ride-padding)', fontSize: 'var(--font-size-md)', color: toCity ? 'var(--color-text-primary)' : 'var(--color-text-muted)', cursor: 'pointer' }}>
                  {toCity ? CITIES[toCity] : 'بۆ کوێ؟'}
                </div>
              </div>
            </div>
          </Card>

          {/* Date/Time/Seats card */}
          <Card style={{ marginBottom: 'var(--space-card-md)', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-3) var(--space-card-lg)', display: 'flex', alignItems: 'center' }}>
              <div onClick={() => dateRef.current?.showPicker()} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>بەروار</div>
                <div style={{ fontSize: 'var(--font-size-md)', color: date ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: 'var(--font-weight-semibold)' as unknown as number, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {date ? formatDate(date) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  )}
                </div>
                <input ref={dateRef} type="date" value={date} onChange={e => setDate(e.target.value)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }} />
              </div>
              <div style={{ width: 0, height: 'var(--space-7)', borderRight: 'var(--border-width-medium) dashed var(--color-text-muted)' }} />
              <div onClick={() => timeRef.current?.showPicker()} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>کات</div>
                <div style={{ fontSize: 'var(--font-size-md)', color: time ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: 'var(--font-weight-semibold)' as unknown as number, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {time ? time : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  )}
                </div>
                <input ref={timeRef} type="time" value={time} onChange={e => setTime(e.target.value)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }} />
              </div>
              <div style={{ width: 0, height: 'var(--space-7)', borderRight: 'var(--border-width-medium) dashed var(--color-text-muted)' }} />
              <div onClick={cycleSeats} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>جێگا</div>
                <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-semibold)' as unknown as number, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={seatsTapped ? 'var(--color-text-primary)' : 'var(--color-icon-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 19v2" /><path d="M18 19v2" />
                    <path d="M7 19h10a2 2 0 0 0 2-2v-3a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v3a2 2 0 0 0 2 2z" />
                    <path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
                    <path d="M9 14h6" />
                  </svg>
                  {seatsTapped && <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-text-primary)', marginRight: 'var(--space-1)' }}>{seats}</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Price card */}
          <Card style={{ marginBottom: 'var(--space-card-md)', overflow: 'hidden', padding: 'var(--space-3) var(--space-card-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 0, fontWeight: 'var(--font-weight-semibold)' as unknown as number }}>نرخ</div>
            <DashedDivider style={{ margin: '6px 0' }} />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <div onClick={() => setPriceType('coffee')} style={{
                flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                background: priceType === 'coffee' ? 'var(--color-brand-primary)' : 'var(--color-bg-surface)',
                border: 'var(--border-width-thick) solid var(--color-text-primary)',
                boxShadow: priceType === 'coffee' ? 'var(--shadow-card)' : 'var(--shadow-muted)',
                color: priceType === 'coffee' ? 'var(--color-text-onAccent)' : 'var(--color-text-primary)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' as unknown as number,
              }}>قاوەیەک</div>
              <div onClick={() => setPriceType('iqd')} style={{
                flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                background: priceType === 'iqd' ? 'var(--color-brand-primary)' : 'var(--color-bg-surface)',
                border: 'var(--border-width-thick) solid var(--color-text-primary)',
                boxShadow: priceType === 'iqd' ? 'var(--shadow-card)' : 'var(--shadow-muted)',
                color: priceType === 'iqd' ? 'var(--color-text-onAccent)' : 'var(--color-text-primary)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' as unknown as number,
              }}>پارە</div>
            </div>
            {priceType === 'iqd' && (
              <div style={{ marginTop: 'var(--space-2-5)'}}>
                <input className="money-input" type="text" value={price} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); const v = Number(raw); if (!raw || (v >= 0 && v <= 5000)) setPrice(raw) }} inputMode="numeric" pattern="[0-9]*" placeholder="0"
                  style={{ ...carInputStyle, direction: 'ltr', textAlign: 'left' }} />
              </div>
            )}
          </Card>

          {/* Car + Notes card */}
          <Card style={{ marginBottom: 'var(--space-card-md)', overflow: 'hidden', padding: 'var(--space-3) var(--space-card-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 0, fontWeight: 'var(--font-weight-semibold)' as unknown as number }}>زانیاری ئۆتۆمبێل</div>
            <DashedDivider style={{ margin: '6px 0' }} />
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>جۆر</div>
                <input value={carMake} onChange={e => setCarMake(e.target.value)} placeholder="Toyota" className="car-input" style={carInputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>مۆدێل</div>
                <input value={carModel} onChange={e => setCarModel(e.target.value)} placeholder="Camry" className="car-input" style={carInputStyle} />
              </div>
            </div>
            <DashedDivider style={{ margin: '10px var(--space-1)' }} />
            <div style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>ڕەنگ</div>
              <input value={carColor} onChange={e => setCarColor(e.target.value)} placeholder="White" className="car-input" style={carInputStyle} />
            </div>
            <DashedDivider style={{ margin: '10px var(--space-1)' }} />
            <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 0, fontWeight: 'var(--font-weight-semibold)' as unknown as number }}>تێبینی</div>
            <DashedDivider style={{ margin: '6px 0' }} />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="هەر شتێک دەربارەی گەشتەکەت..." rows={2} className="note-input" style={{ ...carInputStyle, resize: 'var(--input-note-resize)' as React.CSSProperties['resize'], lineHeight: 'var(--input-note-lineHeight)' }} />
          </Card>

          {error && <p style={{ color: 'var(--color-status-error)', fontSize: 'var(--font-size-base)', textAlign: 'center', marginBottom: 'var(--space-3)' }}>{error}</p>}

          <div onClick={handleSubmit} style={{
            background: 'var(--color-brand-primary)', color: 'var(--color-text-onAccent)', border: 'var(--border-width-thick) solid var(--color-text-primary)', borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-card-md) 0', textAlign: 'center', cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 'var(--opacity-disabled)' as unknown as number : 1, width: '100%',
            boxShadow: 'var(--shadow-card)',
          }}>
            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-extrabold)' as unknown as number }}>{loading ? '...' : editingRideId ? 'نوێکردنەوە' : 'بینێرە!'}</span>
          </div>
        </div>
      )}

      {/* ═══ MANAGE TAB ═══ */}
      {activeTab === 'manage' && (
        <div>
          {loadingManage ? <div /> : myPostedRides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)' }}>هێشتا گەشتت پۆست نەکردووە</p>
            </div>
          ) : myPostedRides.map(ride => {
            const isCompleted = ride.status === 'completed'
            const isCancelled = ride.status === 'cancelled'
            const isDimmed = isCompleted || isCancelled

            const rideStatusConfig: Record<string, { text: string; color: string; bg: string }> = {
              active: { text: 'چالاک', color: 'var(--color-status-warning)', bg: 'var(--color-ride-activeStatusBg)' },
              full: { text: '٠ جێ', color: 'var(--color-text-primary)', bg: 'var(--color-chip-bg)' },
              completed: { text: 'تەواو بوو', color: 'var(--color-status-success)', bg: 'var(--color-ride-completedStatusBg)' },
              cancelled: { text: 'هەڵوەشێنرایەوە', color: 'var(--color-status-error)', bg: 'var(--color-ride-cancelledStatusBg)' },
            }
            const st = rideStatusConfig[ride.status] || rideStatusConfig.active

            return (
              <RideCard
                key={ride.id}
                ride={ride}
                status={st}
                dimmed={isDimmed}
                editButton={!isCompleted && !isCancelled ? (
                  <span
                    onClick={() => startEdit(ride)}
                    style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                  >دەسکاری</span>
                ) : undefined}
              />
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
