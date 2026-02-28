'use client'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'

export default function PostRidePage() {
  return (
    <div style={{
      direction: 'rtl', minHeight: '100vh', background: '#121212',
      maxWidth: 480, margin: '0 auto', padding: '24px 20px 96px',
      fontFamily: "'Noto Sans Arabic', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e5e5e5', marginBottom: 8, textAlign: 'center' }}>
        پۆستکردنی <span style={{ color: '#df6530' }}>ڕێ</span>
      </h2>
      <p style={{ fontSize: 13, color: '#777', marginBottom: 48, textAlign: 'center' }}>
        دەتەوێ رێ پۆستکەی؟ خۆت ڤێریفایکە
      </p>

      <Link href="/auth/verify" style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center', cursor: 'pointer',
          border: '1px solid #2a2a2a', borderRadius: 14,
          background: '#161616', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          direction: 'rtl', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.4 4.4L17.6 3.6L18 6.8L21 8.4L19.8 11.4L21 14.4L18 16L17.6 19.2L14.4 18.4L12 20.8L9.6 18.4L6.4 19.2L6 16L3 14.4L4.2 11.4L3 8.4L6 6.8L6.4 3.6L9.6 4.4L12 2Z" fill="rgba(223,101,48,0.15)" stroke="rgba(223,101,48,0.4)" strokeWidth="0.5" />
              <path d="M9 12l2 2 4-4" stroke="#df6530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </div>
          <div style={{ width: 1, minHeight: 36, background: '#2a2a2a', alignSelf: 'stretch' }} />
          <div style={{ padding: '14px 24px' }}>
            <span style={{ color: '#ccc', fontSize: 13.5, fontWeight: 500 }}>خۆت سایەقی بکە</span>
          </div>
        </div>
      </Link>

      <BottomNav />
    </div>
  )
}
