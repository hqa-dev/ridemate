import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ڕێ — گەشتی ئاسان لە کوردستان',
  description: 'ڕێ ئەپێکە بۆ هاوسەفەری لە نێوان شارەکانی کوردستان. شۆفێر ڕێیەک پۆست دەکا، سەرنشین داوای دەکای. ڕێیەکی گونجاو دەدۆزێتەوە و داوای دەکات، پێکەوە دەچن.',
}

/* ── Mobile app colors (Wise dark theme) ── */
const c = {
  bg: '#121511',
  surface: '#1E211D',
  sunken: '#161916',
  text: '#F2F0EB',
  textSecondary: '#9BA8A2',
  textMuted: '#6A6C6A',
  yellow: '#F4F91D',
  yellowFill: 'rgba(244,249,29,0.10)',
  border: 'rgba(255,255,255,0.20)',
  borderSubtle: 'rgba(255,255,255,0.08)',
  outer: '#0A0C09',
}

export default function LandingPage() {
  return (
    <div style={{
      direction: 'rtl',
      height: '100vh',
      overflow: 'hidden',
      background: c.outer,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'inherit',
    }}>
      {/* ── Phone Frame ── */}
      <div style={{
        width: '100%',
        maxWidth: 390,
        height: '85vh',
        background: c.bg,
        borderRadius: 44,
        border: `2px solid ${c.borderSubtle}`,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 0 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 126,
          height: 34,
          background: c.bg,
          borderRadius: '0 0 20px 20px',
          zIndex: 10,
        }} />

        {/* Home indicator */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 134,
          height: 5,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 100,
          zIndex: 10,
        }} />

        {/* ── Scrollable content inside phone ── */}
        <div style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          color: c.text,
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* ── Hero ── */}
          <section style={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1,
              color: c.yellow,
              margin: 0,
            }}>
              ڕێ
            </h1>
          </section>

          {/* ── How it works ── */}
          <section style={{
            padding: '60px 24px',
          }}>
            <h2 style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 36,
              textAlign: 'center',
              color: c.text,
            }}>
              کو ئیش دەکا؟
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}>
              <Step number="١" title="شۆفێر ڕێیەک پۆست دەکا" desc="شوێن، بەروار، کات، و ژمارەی جێ دیاری دەکات" />
              <Step number="٢" title="سەرنشین داوای دەکای" desc="ڕێیەکی گونجاو دەدۆزێتەوە و داوای دەکات" />
              <Step number="٣" title="شۆفێرەکە رازی دەبێت و ڕێیەکە دەست پێ دەکات" desc="شۆفێر قبوڵ دەکات، ژمارەی مۆبایل شێر دەکرێ، پێکەوە دەچن" />
            </div>
          </section>

          {/* ── Cities ── */}
          <section style={{
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 10,
              color: c.text,
            }}>
              لە کوردستان
            </h2>
            <p style={{
              color: c.textMuted,
              marginBottom: 28,
              fontSize: 13,
            }}>
              هەولێر · سلێمانی · دهۆک و شارۆچکەکانیان
            </p>

            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {['هەولێر', 'سلێمانی', 'دهۆک', 'شەقڵاوە', 'ئاکرێ', 'کۆیە', 'ڕانیە', 'دۆکان', 'ڕەواندز', 'سێمێل', 'ئامێدی', 'چیای سەفین'].map((city) => (
                <span key={city} style={{
                  padding: '6px 14px',
                  borderRadius: 50,
                  border: `1.5px solid ${c.border}`,
                  fontSize: 12,
                  fontWeight: 700,
                  background: c.surface,
                  color: c.text,
                }}>
                  {city}
                </span>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section style={{
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 24,
              color: c.text,
            }}>
              ڕێت چاوەڕوانە
            </p>
            <div style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <StoreButton label="App Store" sublabel="بەردەستە لە" icon="apple" />
              <StoreButton label="Google Play" sublabel="بەردەستە لە" icon="play" />
            </div>
          </section>

          {/* ── Footer ── */}
          <footer style={{
            padding: '32px 24px',
            textAlign: 'center',
            borderTop: `1px solid ${c.borderSubtle}`,
            color: c.textMuted,
            fontSize: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
              <a href="/privacy" style={{ color: c.textMuted, textDecoration: 'none' }}>
                پاراستنی زانیاری
              </a>
              <a href="mailto:hello@reapp.krd" style={{ color: c.textMuted, textDecoration: 'none' }}>
                پەیوەندی
              </a>
            </div>
            <p style={{ margin: 0 }}>© ٢٠٢٦ ڕێ</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

/* ── Components ── */

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 36,
        height: 36,
        minWidth: 36,
        borderRadius: 9,
        background: c.yellow,
        color: c.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 16,
      }}>
        {number}
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: c.text }}>
          {title}
        </p>
        <p style={{ color: c.textSecondary, fontSize: 12, lineHeight: 1.8 }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

function StoreButton({ label, sublabel, icon }: { label: string; sublabel: string; icon: 'apple' | 'play' }) {
  return (
    <a
      href="#"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 20px',
        borderRadius: 12,
        background: c.surface,
        border: `1.5px solid ${c.border}`,
        textDecoration: 'none',
        color: c.text,
        direction: 'ltr',
      }}
    >
      {icon === 'apple' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.56.69.56 1.19s-.22.92-.56 1.19l-2.29 1.32-2.5-2.5 2.5-2.5 2.29 1.3M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
        </svg>
      )}
      <div>
        <div style={{ fontSize: 9, opacity: 0.7, lineHeight: 1.2 }}>{sublabel}</div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{label}</div>
      </div>
    </a>
  )
}
