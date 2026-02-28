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
      <body style={{ fontFamily: "'Noto Sans Arabic', sans-serif", margin: 0, background: '#121212' }}>
        {children}
      </body>
    </html>
  )
}
