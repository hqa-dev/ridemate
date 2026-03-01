import type { Metadata } from 'next'
import './globals.css'

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}
export const metadata: Metadata = {
  title: 'ڕێ',
  description: 'گەشتی ئاسان لە نێوان هەولێر، سلێمانی و دهۆک',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ckb" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Noto Sans Arabic', sans-serif", margin: 0, background: '#060606' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#060606', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, boxShadow: '0 0 60px rgba(223,101,48,0.07), 0 0 120px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
