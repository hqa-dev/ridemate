import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ProfileProvider } from '@/lib/ProfileContext'

const notoSansArabic = localFont({
  src: './fonts/NotoSansArabic-VariableFont_wdth,wght.ttf',
  display: 'swap',
})

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}
export const metadata: Metadata = {
  title: 'لیمۆ',
  description: 'گەشتی ئاسان لە نێوان هەولێر، سلێمانی و دهۆک',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ckb" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var m=localStorage.getItem('limo-theme');if(m==='dark')document.documentElement.setAttribute('data-theme','dark')})()` }} />
      </head>
      <body className={notoSansArabic.className} style={{ margin: 0, background: 'var(--color-bg-canvas)' }}>
        <div style={{ maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto', minHeight: '100vh', background: 'var(--color-bg-canvas)', border: 'var(--border-width-thin) solid var(--color-border-strong)', borderRadius: 'var(--radius-6xl)', boxShadow: 'var(--shadow-viewport)', overflow: 'hidden' }}>
          <ProfileProvider>{children}</ProfileProvider>
        </div>
      </body>
    </html>
  )
}
