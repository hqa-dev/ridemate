import { notFound } from 'next/navigation'

export default function ShowcasePage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <div dir="rtl" style={{ padding: 'var(--space-page-x)', background: 'var(--color-bg-canvas)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 'var(--font-size-heading)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
        ڤیترینی دیزاین
      </h1>

      {/* ── BUTTONS ── */}
      <Section title="دوگمەکان">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {([
            ['primary',   'ناردن',      {} as React.CSSProperties],
            ['secondary', 'پاشگەز',     {}],
            ['danger',    'سڕینەوە',    {}],
            ['success',   'پشتڕاستکردن', {}],
            ['ghost',     'لابردن',     {}],
            ['subtle',    'تەواوکردن',  {}],
            ['whatsapp',  'واتسئاپ',    {}],
            ['withdraw',  'هەڵوەشاندن', {}],
          ] as [string, string, React.CSSProperties][]).map(([variant, label]) => (
            <button
              key={variant}
              style={{
                width: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                background: `var(--button-${variant}-bg)`,
                color: `var(--button-${variant}-text)`,
                border: `var(--button-${variant}-border)`,
                boxShadow: `var(--button-${variant}-shadow, none)`,
                borderRadius: `var(--button-${variant}-radius)`,
                padding: `var(--button-${variant}-padding)`,
                fontSize: `var(--button-${variant}-fontSize)`,
                fontWeight: `var(--button-${variant}-fontWeight, 600)`,
                fontFamily: 'var(--font-family-body)',
              }}
            >
              {label}
              <span style={{ fontSize: 'var(--font-size-body)', opacity: 0.6, marginRight: 'var(--space-1)' }}>
                ({variant})
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── INPUTS ── */}
      <Section title="خانەکان">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Standard */}
          <div>
            <Label text="ناوی تەواو (standard)" />
            <input
              placeholder="ناوت لێرە بنووسە"
              style={{
                width: '100%',
                background: 'var(--input-standard-bg)',
                border: 'var(--input-standard-border)',
                borderRadius: 'var(--input-standard-radius)',
                padding: 'var(--input-standard-padding)',
                fontSize: 'var(--input-standard-fontSize)',
                color: 'var(--input-standard-color)',
                fontFamily: 'var(--font-family-body)',
                direction: 'rtl',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Search */}
          <div>
            <Label text="گەڕان (search)" />
            <input
              placeholder="گەڕان بکە..."
              style={{
                width: '100%',
                background: 'var(--input-standard-bg)',
                border: 'var(--input-standard-border)',
                borderRadius: 'var(--input-search-radius)',
                padding: 'var(--input-search-padding)',
                fontSize: 'var(--input-standard-fontSize)',
                color: 'var(--input-standard-color)',
                fontFamily: 'var(--font-family-body)',
                direction: 'rtl',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Ride */}
          <div>
            <Label text="شوێن (ride)" />
            <input
              placeholder="هەولێر"
              style={{
                width: '100%',
                background: 'var(--input-ride-bg)',
                border: 'var(--input-ride-border)',
                borderRadius: 'var(--input-ride-radius)',
                padding: 'var(--input-ride-padding)',
                fontSize: 'var(--input-standard-fontSize)',
                color: 'var(--input-standard-color)',
                lineHeight: 'var(--input-ride-lineHeight)',
                fontFamily: 'var(--font-family-body)',
                direction: 'rtl',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Note (textarea) */}
          <div>
            <Label text="تێبینی (note)" />
            <textarea
              placeholder="تێبینیەکت لێرە بنووسە..."
              rows={3}
              style={{
                width: '100%',
                background: 'var(--input-standard-bg)',
                border: 'var(--input-standard-border)',
                borderRadius: 'var(--input-standard-radius)',
                padding: 'var(--input-standard-padding)',
                fontSize: 'var(--input-standard-fontSize)',
                color: 'var(--input-standard-color)',
                lineHeight: 'var(--input-note-lineHeight)',
                resize: 'none',
                fontFamily: 'var(--font-family-body)',
                direction: 'rtl',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </Section>

      {/* ── CARDS ── */}
      <Section title="کارتەکان">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Standard */}
          <div style={{
            background: 'var(--card-standard-bg)',
            border: 'var(--card-standard-border)',
            borderRadius: 'var(--card-standard-radius)',
            boxShadow: 'var(--card-standard-shadow)',
            padding: 'var(--space-card-lg)',
          }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
              کارتی ئاسایی (standard)
            </p>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
              ئەمە نموونەیەکی کارتی ئاساییە
            </p>
          </div>
          {/* Danger */}
          <div style={{
            background: 'var(--card-standard-bg)',
            border: 'var(--card-danger-border)',
            borderRadius: 'var(--card-standard-radius)',
            boxShadow: 'var(--card-danger-shadow)',
            padding: 'var(--space-card-lg)',
          }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-status-error)', margin: 0 }}>
              کارتی مەترسی (danger)
            </p>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
              ئەمە بۆ ئاگادارکردنەوەی گرنگ بەکاردێت
            </p>
          </div>
          {/* Modal */}
          <div style={{
            background: 'var(--card-modal-bg)',
            border: 'none',
            borderRadius: 'var(--card-modal-radius)',
            maxWidth: 'var(--card-modal-maxWidth)',
            padding: 'var(--space-modal-y) var(--space-modal-x)',
            boxShadow: 'var(--shadow-float)',
          }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
              کارتی مۆداڵ (modal)
            </p>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
              بۆ دیالۆگ و پەنجەرەی سەرەوە
            </p>
          </div>
          {/* Request Modal */}
          <div style={{
            background: 'var(--card-requestModal-bg)',
            border: 'var(--card-requestModal-border)',
            borderRadius: 'var(--card-requestModal-radius)',
            boxShadow: 'var(--card-requestModal-shadow)',
            maxWidth: 'var(--card-requestModal-maxWidth)',
            padding: 'var(--space-modal-y) var(--space-modal-x)',
          }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
              کارتی داواکاری (requestModal)
            </p>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
              بۆ داواکاری سواربوون
            </p>
          </div>
        </div>
      </Section>

      {/* ── STATUS CHIPS ── */}
      <Section title="دۆخەکان">
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Chip label="سەرکەوتوو (success)" bg="var(--color-status-successBg)" color="var(--color-status-success)" />
          <Chip label="هەڵە (error)" bg="var(--color-status-errorBg)" color="var(--color-status-error)" />
          <Chip label="ئاگاداری (warning)" bg="var(--color-status-warningBg)" color="var(--color-status-warning)" />
        </div>
      </Section>

      {/* ── TYPOGRAPHY ── */}
      <Section title="قەبارەی فۆنت">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {([
            ['3xs', 'بچووکترین'],
            ['2xs', 'بچووکتر'],
            ['xs',  'بچووک'],
            ['sm',  'بچووکانە'],
            ['base','ئاسایی'],
            ['md',  'مامناوەند'],
            ['lg',  'گەورە'],
            ['xl',  'گەورەتر'],
            ['2xl', 'سەرنووس'],
            ['3xl', 'بابەت'],
            ['4xl', 'ناونیشان'],
            ['5xl', 'لیمۆ'],
          ] as [string, string][]).map(([size, word]) => (
            <div key={size} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
              <span style={{
                fontSize: `var(--font-size-${size})`,
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--font-lineHeight-normal)',
              }}>
                {word}
              </span>
              <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                --font-size-{size}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── COLOR PALETTE ── */}
      <Section title="ڕەنگەکان">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <ColorGroup title="پاشبنەما (backgrounds)" swatches={[
            ['--color-bg-canvas',  'canvas'],
            ['--color-bg-surface', 'surface'],
            ['--color-bg-sunken',  'sunken'],
            ['--color-bg-modal',   'modal'],
          ]} />
          <ColorGroup title="دەق (text)" swatches={[
            ['--color-text-primary',   'primary'],
            ['--color-text-secondary', 'secondary'],
            ['--color-text-muted',     'muted'],
            ['--color-text-onAccent',  'onAccent'],
          ]} />
          <ColorGroup title="براند (brand)" swatches={[
            ['--color-brand-primary', 'primary'],
            ['--color-brand-fill',    'fill'],
            ['--color-brand-glow',    'glow'],
          ]} />
          <ColorGroup title="دۆخ (status)" swatches={[
            ['--color-status-success',   'success'],
            ['--color-status-successBg', 'successBg'],
            ['--color-status-error',     'error'],
            ['--color-status-errorBg',   'errorBg'],
            ['--color-status-warning',   'warning'],
            ['--color-status-warningBg', 'warningBg'],
          ]} />
          <ColorGroup title="سنوور (border)" swatches={[
            ['--color-border-strong',  'strong'],
            ['--color-border-subtle',  'subtle'],
            ['--color-border-divider', 'divider'],
          ]} />
          <ColorGroup title="ئایکۆن (icon)" swatches={[
            ['--color-icon-default', 'default'],
            ['--color-icon-muted',   'muted'],
          ]} />
          <ColorGroup title="ناڤبار (nav)" swatches={[
            ['--color-nav-bg',         'bg'],
            ['--color-nav-border',     'border'],
            ['--color-nav-activePill', 'activePill'],
            ['--color-nav-glow',       'glow'],
          ]} />
          <ColorGroup title="دەرەکی (external)" swatches={[
            ['--color-external-whatsapp', 'whatsapp'],
            ['--color-external-google',   'google'],
          ]} />
          <ColorGroup title="سەوز (green scale)" swatches={[
            ['--color-green-50',    '50'],
            ['--color-green-100',   '100'],
            ['--color-green-200',   '200'],
            ['--color-green-300',   '300'],
            ['--color-green-400',   '400'],
            ['--color-green-solid', 'solid'],
          ]} />
          <ColorGroup title="ئەوەرلەی (overlay)" swatches={[
            ['--color-overlay-backdrop',      'backdrop'],
            ['--color-overlay-viewportOuter', 'viewportOuter'],
          ]} />
          <ColorGroup title="تر (misc)" swatches={[
            ['--color-chip-bg',                'chip-bg'],
            ['--color-ride-completedIconBg',    'completedIconBg'],
            ['--color-ride-completedIconBorder','completedIconBorder'],
            ['--color-ride-ratedIconBg',        'ratedIconBg'],
            ['--color-ride-ratedIconBorder',    'ratedIconBorder'],
            ['--color-ride-activeStatusBg',     'activeStatusBg'],
            ['--color-ride-completedStatusBg',  'completedStatusBg'],
            ['--color-ride-cancelledStatusBg',  'cancelledStatusBg'],
            ['--color-upload-bg',               'upload-bg'],
            ['--color-upload-filled',           'upload-filled'],
            ['--color-upload-border',           'upload-border'],
            ['--color-upload-dashedBorder',     'upload-dashedBorder'],
            ['--color-upload-selfieBorder',     'upload-selfieBorder'],
          ]} />
        </div>
      </Section>

      <div style={{ height: 'var(--space-8)' }} />
    </div>
  )
}

/* ── Helper components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <h2 style={{
        fontSize: 'var(--font-size-heading)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-3)',
        paddingBottom: 'var(--space-2)',
        borderBottom: 'var(--border-width-medium) dashed var(--color-border-divider)',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Label({ text }: { text: string }) {
  return (
    <span style={{
      display: 'block',
      fontSize: 'var(--font-size-body)',
      fontWeight: 'var(--font-weight-bold)',
      color: 'var(--color-text-muted)',
      marginBottom: 'var(--space-1)',
    }}>
      {text}
    </span>
  )
}

function Chip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg,
      color: color,
      fontSize: 'var(--font-size-body)',
      fontWeight: 'var(--font-weight-bold)',
      padding: 'var(--space-1) var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: 'var(--border-width-thick) solid var(--color-border-strong)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {label}
    </span>
  )
}

function ColorGroup({ title, swatches }: { title: string; swatches: [string, string][] }) {
  return (
    <div>
      <p style={{
        fontSize: 'var(--font-size-body)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-2)',
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {swatches.map(([token, name]) => (
          <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-0-5)' }}>
            <div style={{
              width: 'var(--size-avatar-lg)',
              height: 'var(--size-avatar-lg)',
              borderRadius: 'var(--radius-base)',
              background: `var(${token})`,
              border: 'var(--border-width-thin) solid var(--color-border-divider)',
            }} />
            <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', fontFamily: 'monospace', textAlign: 'center', maxWidth: 'var(--size-avatar-xl)' }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
