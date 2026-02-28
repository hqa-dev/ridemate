
Landing page · TSX
Copy

import Link from 'next/link'
import { ku } from '@/lib/translations'
import { Logo } from '@/components/layout/Logo'

export default function LandingPage() {
  return (
    <main style={{ direction: 'rtl', minHeight: '100vh', background: '#121212', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
        <Logo size={1} />
        <div />
      </div>

      <div style={{ padding: '2rem 1.25rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          {ku.heroLine1}<br />
          <span style={{ color: '#df6530' }}>ڕێ</span> ئەکەین
        </h1>
        <p style={{ color: '#777', fontSize: '1rem', lineHeight: 1.75, marginBottom: '2rem' }}>
          {ku.heroSubtitle}
        </p>
        <Link href="/auth/register" style={{ background: '#df6530', color: 'white', padding: '0.85rem 1.5rem 0.85rem 3.5rem', borderRadius: '0.75rem', textAlign: 'center', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', display: 'block' }}>
          با بڕۆین
        </Link>
      </div>

      {/* Origin story */}
      <div style={{ padding: '0 1.25rem 1rem' }}>
        <div style={{ background: '#2e2118', border: '1px solid #3d2c1e', borderRadius: '1rem', padding: '1rem' }}>
          <p style={{ color: '#df6530', fontSize: '0.85rem', lineHeight: 1.8 }}>
            هاوڕێیەکی نزیکم هەر کە ئیشی ئەکەوتە دەرەوەی هەولێر، لە ئینستا پۆستی ئەکرد. ئەوە بوو هۆی ئەم ئاپە.
          </p>
        </div>
      </div>

      {/* Verification notice */}
      <div style={{ padding: '0 1.25rem 2rem' }}>
        <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '1rem', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🔒</span>
          <p style={{ color: '#777', fontSize: '0.8rem', lineHeight: 1.7 }}>
            بۆ پاراستنی ئەمنیەت، پێویستە ناسنامە و سێلفی بنێری پێش بەکارهێنان.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '0 1.25rem 3rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#aaa', marginBottom: '1rem' }}>{ku.howItWorks}</h2>
        {[
          { icon: '🪪', text: ku.step1 },
          { icon: '🗺️', text: ku.step2 },
          { icon: '🤝', text: ku.step3 },
        ].map((step, i) => (
          <div key={i} style={{ background: '#1e1e1e', borderRadius: '1rem', padding: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <span style={{ fontSize: '1.5rem' }}>{step.icon}</span>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{step.text}</p>
          </div>
        ))}
      </div>
    </main>
  )
}