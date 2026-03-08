import type { Metadata } from 'next'
import { Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { ProfileProvider } from '@/lib/ProfileContext'

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
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
      <body className={notoSansArabic.className} style={{ fontFamily: 'var(--font-family-body)', margin: 0, background: 'var(--color-bg-canvas)' }}>
        <div style={{ maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto', minHeight: '100vh', background: 'var(--color-bg-canvas)', border: 'var(--border-width-thin) solid var(--color-border-strong)', borderRadius: 'var(--radius-6xl)', boxShadow: 'var(--shadow-viewport)', overflow: 'hidden' }}>
          <ProfileProvider>{children}</ProfileProvider>
        </div>
      </body>
    </html>
  )
}
