'use client'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function StyleGuide() {
  const sectionTitle: React.CSSProperties = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)' as unknown as number,
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-3)',
    marginTop: 'var(--space-6)',
  }

  const colorSwatch = (label: string, cssVar: string, hex: string) => (
    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-base)', background: `var(${cssVar})`, border: '1px solid var(--color-border-divider)' }} />
      <div>
        <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' as unknown as number }}>{label}</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{cssVar} — {hex}</div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: 'var(--space-5)', paddingBottom: 120, background: 'var(--color-bg-canvas)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-extrabold)' as unknown as number, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        Style Guide
      </h1>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        All design tokens, components, and colors used in the app.
      </p>

      {/* ── BACKGROUND COLORS ── */}
      <div style={sectionTitle}>Background Colors</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        {colorSwatch('Canvas (page bg)', '--color-bg-canvas', '#fafaf7 / #1C1813')}
        {colorSwatch('Surface (card bg)', '--color-bg-surface', '#ffffff / #2A2318')}
        {colorSwatch('Sunken (inner bg)', '--color-bg-sunken', '#f5f3ec / #332B20')}
        {colorSwatch('Modal bg', '--color-bg-modal', '#fafaf7 / #252018')}
      </Card>

      {/* ── TEXT COLORS ── */}
      <div style={sectionTitle}>Text Colors</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Primary text — var(--color-text-primary)
        </div>
        <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
          Secondary text — var(--color-text-secondary)
        </div>
        <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
          Muted text — var(--color-text-muted)
        </div>
        <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-onAccent)', background: 'var(--color-brand-primary)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
          On-accent text — var(--color-text-onAccent)
        </div>
      </Card>

      {/* ── BRAND / ACCENT ── */}
      <div style={sectionTitle}>Brand / Accent</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        {colorSwatch('Brand Primary (orange)', '--color-brand-primary', '#E8470A')}
        {colorSwatch('Brand Fill', '--color-brand-fill', 'rgba(232,71,10,0.08)')}
        {colorSwatch('Brand Glow', '--color-brand-glow', 'rgba(232,71,10,0.12)')}
      </Card>

      {/* ── BORDER COLORS ── */}
      <div style={sectionTitle}>Border Colors</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        {colorSwatch('Strong', '--color-border-strong', '#1a1208 / #F5EDD8')}
        {colorSwatch('Subtle', '--color-border-subtle', 'rgba low opacity')}
        {colorSwatch('Divider', '--color-border-divider', 'rgba mid opacity')}
      </Card>

      {/* ── STATUS COLORS ── */}
      <div style={sectionTitle}>Status Colors</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        {colorSwatch('Success', '--color-status-success', '#2a7a1a')}
        {colorSwatch('Success Bg', '--color-status-successBg', 'rgba(42,122,26,0.08)')}
        {colorSwatch('Error', '--color-status-error', '#c8001a')}
        {colorSwatch('Error Bg', '--color-status-errorBg', 'rgba(200,0,26,0.07)')}
        {colorSwatch('Warning', '--color-status-warning', '#f5c800')}
        {colorSwatch('Warning Bg', '--color-status-warningBg', 'rgba(245,200,0,0.12)')}
      </Card>

      {/* ── ICON COLORS ── */}
      <div style={sectionTitle}>Icon Colors</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        {colorSwatch('Icon Muted', '--color-icon-muted', '#9a8f78 / #7A6E5E')}
        {colorSwatch('Icon Default', '--color-icon-default', '#4a3f2a / #C4B49A')}
      </Card>

      {/* ── TYPOGRAPHY ── */}
      <div style={sectionTitle}>Typography Sizes</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        {(['3xs','2xs','xs','sm','base','md','lg','xl','2xl','3xl','4xl','5xl'] as const).map(size => (
          <div key={size} style={{ fontSize: `var(--font-size-${size})`, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            {size} — font-size-{size} — نموونەی تێکست
          </div>
        ))}
      </Card>

      {/* ── FONT WEIGHTS ── */}
      <div style={sectionTitle}>Font Weights</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        {([['Regular', '400'], ['Medium', '500'], ['Semibold', '600'], ['Bold', '700'], ['Extrabold', '800']] as const).map(([name, w]) => (
          <div key={name} style={{ fontSize: 'var(--font-size-md)', fontWeight: Number(w), color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            {name} ({w}) — نموونەی تێکست
          </div>
        ))}
      </Card>

      {/* ── BUTTONS ── */}
      <div style={sectionTitle}>Buttons</div>
      <Card style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Button label="Primary — بەڵێ، بینێرە!" variant="primary" />
        <Button label="Secondary — پاشگەز" variant="secondary" />
        <Button label="Danger — لابردن" variant="danger" />
        <Button label="Disabled" variant="primary" disabled />
      </Card>

      {/* ── CARDS ── */}
      <div style={sectionTitle}>Cards</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Card style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}>Standard Card with shadow</div>
        </Card>
        <Card shadow={false} style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}>Card without shadow</div>
        </Card>
        <Card danger style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}>Danger Card</div>
        </Card>
      </div>

      {/* ── INPUT FIELDS ── */}
      <div style={sectionTitle}>Input Fields</div>
      <Card style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>car-input</div>
          <input className="car-input" placeholder="نموونە..." defaultValue="تێکستی تاقیکردنەوە" />
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>note-input</div>
          <textarea className="note-input" placeholder="تێبینی..." defaultValue="تێکستی تاقیکردنەوە لە نۆت" />
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>money-input</div>
          <input className="money-input" placeholder="0 IQD" defaultValue="5,000" style={{ direction: 'ltr' }} />
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Input with design token inline styles</div>
          <input
            style={{
              width: '100%',
              background: 'var(--color-bg-sunken)',
              border: 'var(--input-ride-border)',
              borderRadius: 'var(--input-ride-radius)',
              padding: 'var(--input-ride-padding)',
              fontSize: 'var(--input-standard-fontSize)',
              outline: 'none',
              direction: 'rtl',
              color: 'var(--color-text-secondary)',
            }}
            placeholder="نموونە..."
            defaultValue="تێکستی تاقیکردنەوە"
          />
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Date input</div>
          <input type="date" style={{ width: '100%', background: 'var(--input-standard-bg)', border: 'var(--input-standard-border)', borderRadius: 'var(--input-standard-radius)', padding: 'var(--input-standard-padding)' }} />
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Time input</div>
          <input type="time" style={{ width: '100%', background: 'var(--input-standard-bg)', border: 'var(--input-standard-border)', borderRadius: 'var(--input-standard-radius)', padding: 'var(--input-standard-padding)' }} />
        </div>
      </Card>

      {/* ── TEXT ON DIFFERENT BACKGROUNDS ── */}
      <div style={sectionTitle}>Text on Different Backgrounds</div>

      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>On Canvas (page bg)</div>
        <div style={{ background: 'var(--color-bg-canvas)', padding: 'var(--space-4)', border: '1px solid var(--color-border-divider)', borderRadius: 'var(--radius-base)' }}>
          <div style={{ color: 'var(--color-text-primary)' }}>Primary text on canvas</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Secondary text on canvas</div>
          <div style={{ color: 'var(--color-text-muted)' }}>Muted text on canvas</div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>On Surface (card bg)</div>
        <div style={{ background: 'var(--color-bg-surface)', padding: 'var(--space-4)', border: '1px solid var(--color-border-divider)', borderRadius: 'var(--radius-base)' }}>
          <div style={{ color: 'var(--color-text-primary)' }}>Primary text on surface</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Secondary text on surface</div>
          <div style={{ color: 'var(--color-text-muted)' }}>Muted text on surface</div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>On Sunken (inner bg)</div>
        <div style={{ background: 'var(--color-bg-sunken)', padding: 'var(--space-4)', border: '1px solid var(--color-border-divider)', borderRadius: 'var(--radius-base)' }}>
          <div style={{ color: 'var(--color-text-primary)' }}>Primary text on sunken</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Secondary text on sunken</div>
          <div style={{ color: 'var(--color-text-muted)' }}>Muted text on sunken</div>
        </div>
      </div>

      {/* ── BORDER RADIUS ── */}
      <div style={sectionTitle}>Border Radius</div>
      <Card style={{ padding: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        {(['xs','sm','md','base','lg','xl','2xl','3xl','4xl','5xl','6xl','full'] as const).map(size => (
          <div key={size} style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, background: 'var(--color-brand-primary)', borderRadius: `var(--radius-${size})`, margin: '0 auto var(--space-1)' }} />
            <div style={{ fontSize: 'var(--font-size-3xs)', color: 'var(--color-text-muted)' }}>{size}</div>
          </div>
        ))}
      </Card>

      {/* ── SHADOWS ── */}
      <div style={sectionTitle}>Shadows</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        {[['sm', '--shadow-sm'], ['card', '--shadow-card'], ['pill', '--shadow-pill'], ['muted', '--shadow-muted']] .map(([name, v]) => (
          <div key={name} style={{ width: 80, height: 60, background: 'var(--color-bg-surface)', border: '2px solid var(--color-border-strong)', borderRadius: 'var(--radius-base)', boxShadow: `var(${v})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)' }}>{name}</span>
          </div>
        ))}
      </div>

      {/* ── SPACING ── */}
      <div style={sectionTitle}>Spacing Scale</div>
      <Card style={{ padding: 'var(--space-4)' }}>
        {(['0','0-5','1','1-5','2','2-5','3','3-5','4','5','6','7','8'] as const).map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <div style={{ width: `var(--space-${s})`, height: 12, background: 'var(--color-brand-primary)', borderRadius: 2, minWidth: 2 }} />
            <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)' }}>space-{s}</span>
          </div>
        ))}
      </Card>

      {/* ── NOTES DISPLAY (as seen on ride detail) ── */}
      <div style={sectionTitle}>Notes Display (ride detail style)</div>
      <Card style={{ padding: 'var(--space-3) var(--space-4)' }}>
        <div style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)' as unknown as number }}>تێبینی</div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--font-lineHeight-relaxed)' as unknown as number }}>ئەمە نموونەیەکی تێبینی گەشتە — هەمان ستایلی لاپەڕەی وردەکاری</div>
      </Card>
    </div>
  )
}
