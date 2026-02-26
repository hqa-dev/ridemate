'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ku } from '@/lib/translations'
import { Logo } from '@/components/layout/Logo'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const [checking, setChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        window.location.href = '/home'
      } else {
        setChecking(false)
      }
    }
    check()
  }, [])

  if (checking) return <div style={{ minHeight: '100vh', background: '#fafaf9' }} />

  return (
    <main style={{ direction: 'rtl', minHeight: '100vh', background: '#fafaf9', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
        <Logo size={1} />
        <div />
      </div>

      <div style={{ padding: '2rem 1.25rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c1917', marginBottom: '1rem', lineHeight: 1.8 }}>
          ئەمە بازاڕ نییە، ئەمە هاوڕێیەتییە. قاوەیەک بۆ شۆفێر، و قسەیەکی خۆش بۆ ڕێگا.
        </h1>
        <p style={{ color: '#78716c', fontSize: '1rem', lineHeight: 1.8 }}>
          ئێستا ئەتوانی لە سەهۆڵەکە نانی ئێوارە بخۆی و بۆ شەویش بگەڕێیتەوە هەولێر
        </p>
      </div>

      <div style={{ padding: '0 1.25rem 2rem' }}>
        <Link href="/auth/register" style={{ background: '#df6530', color: 'white', padding: '0.85rem 1.5rem', borderRadius: '0.75rem', textAlign: 'center', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', display: 'block' }}>
          با بڕۆین
        </Link>
      </div>

      <div style={{ padding: '0 1.25rem 3rem' }}>
        <div style={{ background: '#fae8d8', border: '1px solid #f5cdb0', borderRadius: '1rem', padding: '1rem' }}>
          <p style={{ color: '#92400e', fontSize: '0.85rem', lineHeight: 1.8 }}>
            هاوڕێیەکی نزیکم کە ڕێی ئەکەوتە دەرەوەی هەولێر، پۆستێکی لە انستا ئەکرد وئەیوت  ئەچم بۆ هەولێر و ٣ شوێنی بەتاڵم هەیە، ئەوەی دێ بەخێر بێ و نرخەکەشی  قاوەیەک بۆ شۆفێر، و قسەیەکی خۆش بۆ ڕێگا.
          </p>
        </div>
      </div>
    </main>  )
}
