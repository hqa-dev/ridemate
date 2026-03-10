'use client'
import { notFound } from 'next/navigation'
import SketchCar from '@/components/ui/icons/SketchCar'

const stroke = 'var(--color-text-primary)'
const bg = 'var(--color-bg-canvas)'
const yellow = 'var(--color-status-warning)'

function Flag() {
  return (
    <g opacity="0.85">
      <line x1="75" y1="28" x2="75" y2="10" stroke={stroke} strokeWidth="1.5"/>
      <rect x="75" y="10" width="10" height="2.5" fill="#A85060" stroke="none"/>
      <rect x="75" y="12.5" width="10" height="2.5" fill="#F0E8D8" stroke="none"/>
      <rect x="75" y="15" width="10" height="2.5" fill="#4A7A5E" stroke="none"/>
      <rect x="75" y="10" width="10" height="7.5" fill="none" stroke={stroke} strokeWidth="1"/>
      <circle cx="80" cy="13.75" r="1.3" fill="#C8922A" stroke="none"/>
    </g>
  )
}

function CarCard({ label, labelEn, children }: { label: string; labelEn: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: 'var(--border-width-thick) solid var(--color-border-strong)',
      borderRadius: 'var(--radius-2xl)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      boxShadow: 'var(--shadow-card)',
    }}>
      {children}
      <svg width="40%" height="6" style={{ marginTop: -8 }}>
        <line className="road-line" x1="0" y1="3" x2="100%" y2="3" stroke="var(--color-text-muted)" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--font-size-heading)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</div>
        <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)' }}>{labelEn}</div>
      </div>
    </div>
  )
}

export default function CarTypesPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }
  return (
    <div style={{
      direction: 'rtl',
      minHeight: '100vh',
      background: 'var(--color-bg-canvas)',
      maxWidth: 'var(--size-app-maxWidth)',
      margin: '0 auto',
      padding: '24px 16px',
    }}>
      <div style={{
        background: 'var(--color-status-warningBg)',
        border: '1px solid var(--color-status-warning)',
        borderRadius: 'var(--radius-lg)',
        padding: '8px 12px',
        marginBottom: '20px',
        fontSize: 'var(--font-size-body)',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
      }}>
        Dev only — car type exploration
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

        {/* Minivan — current SketchCar */}
        <CarCard label="ڤان" labelEn="Minivan">
          <SketchCar size={120} color="var(--color-brand-primary)" />
        </CarCard>

        {/* Sedan */}
        <CarCard label="سیدان" labelEn="Sedan">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              <path d="M4 30 Q6 24 10 22 L20 22 Q28 22 32 16 Q36 12 44 12 Q52 12 58 16 Q62 20 68 22 L74 22 Q76 24 76 28 L76 34 Q76 38 72 38 L8 38 Q4 38 4 34 Z"/>
              <path d="M28 22 L32 14 Q38 12 50 12 Q56 13 60 16 L64 22 Z"/>
              <path d="M32 21 L35 15 Q40 13 48 13 Q54 14 57 17 L60 21"/>
              <line x1="46" y1="13" x2="46" y2="21"/>
              <circle cx="18" cy="38" r="6" fill={bg}/><circle cx="18" cy="38" r="3" fill={stroke}/>
              <circle cx="62" cy="38" r="6" fill={bg}/><circle cx="62" cy="38" r="3" fill={stroke}/>
              <ellipse cx="74" cy="25" rx="2.5" ry="1.5" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

        {/* SUV */}
        <CarCard label="جیپ / ئەس ئیو ڤی" labelEn="SUV">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              <path d="M6 28 Q6 20 10 16 L18 10 Q24 8 40 8 Q56 8 62 10 L70 16 Q74 20 74 28 L74 34 Q74 38 70 38 L10 38 Q6 38 6 34 Z"/>
              <path d="M18 28 L20 12 Q28 9 40 9 Q52 9 60 12 L62 28 Z"/>
              <path d="M22 27 L24 13 Q30 10 40 10 Q50 10 56 13 L58 27"/>
              <line x1="40" y1="10" x2="40" y2="27"/>
              <circle cx="18" cy="38" r="7" fill={bg}/><circle cx="18" cy="38" r="3.5" fill={stroke}/>
              <circle cx="62" cy="38" r="7" fill={bg}/><circle cx="62" cy="38" r="3.5" fill={stroke}/>
              <ellipse cx="72" cy="22" rx="2.5" ry="2" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

        {/* Pickup */}
        <CarCard label="پیکەپ" labelEn="Pickup">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              {/* Cab */}
              <path d="M40 28 Q42 18 48 14 Q54 10 62 10 Q68 12 70 18 Q72 22 72 28 L74 34 Q74 38 70 38 L38 38 Q36 38 36 34 Z"/>
              {/* Cab window */}
              <path d="M48 26 L50 14 Q56 11 62 12 Q66 14 68 20 L68 26 Z"/>
              <path d="M51 25 L53 16 Q57 13 62 14 Q65 16 66 21 L66 25"/>
              {/* Bed */}
              <path d="M6 28 L6 24 L36 24 L36 34 Q36 38 32 38 L10 38 Q6 38 6 34 Z"/>
              <line x1="6" y1="24" x2="36" y2="24"/>
              <circle cx="18" cy="38" r="6" fill={bg}/><circle cx="18" cy="38" r="3" fill={stroke}/>
              <circle cx="58" cy="38" r="6" fill={bg}/><circle cx="58" cy="38" r="3" fill={stroke}/>
              <ellipse cx="72" cy="24" rx="2.5" ry="1.5" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

        {/* Hatchback */}
        <CarCard label="هاچبەک" labelEn="Hatchback">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              <path d="M8 30 Q8 26 12 22 L14 20 Q18 18 22 18 Q26 14 34 12 Q42 10 50 12 Q58 14 64 20 Q68 24 70 28 L72 34 Q72 38 68 38 L12 38 Q8 38 8 34 Z"/>
              <path d="M22 28 L26 16 Q32 12 42 12 Q50 13 56 18 L58 28 Z"/>
              <path d="M26 27 L29 17 Q34 13 42 13 Q48 14 53 19 L55 27"/>
              <line x1="40" y1="13" x2="40" y2="27"/>
              <circle cx="20" cy="38" r="6" fill={bg}/><circle cx="20" cy="38" r="3" fill={stroke}/>
              <circle cx="58" cy="38" r="6" fill={bg}/><circle cx="58" cy="38" r="3" fill={stroke}/>
              <ellipse cx="68" cy="24" rx="2.5" ry="1.5" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

        {/* Land Cruiser */}
        <CarCard label="لێندرۆڤەر" labelEn="Land Cruiser">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              <path d="M6 28 L6 12 Q6 8 10 8 L66 8 Q70 8 72 12 L74 28 L74 34 Q74 38 70 38 L10 38 Q6 38 6 34 Z"/>
              <path d="M14 28 L14 10 L62 10 L64 28 Z"/>
              <path d="M18 27 L18 12 L58 12 L60 27"/>
              <line x1="38" y1="12" x2="38" y2="27"/>
              <circle cx="18" cy="38" r="7" fill={bg}/><circle cx="18" cy="38" r="3.5" fill={stroke}/>
              <circle cx="62" cy="38" r="7" fill={bg}/><circle cx="62" cy="38" r="3.5" fill={stroke}/>
              <ellipse cx="73" cy="20" rx="2" ry="2.5" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

        {/* Coupe */}
        <CarCard label="کوپێ" labelEn="Coupe">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              <path d="M4 30 Q4 26 8 24 L16 24 Q22 24 28 20 Q34 16 44 14 Q54 14 62 18 Q68 22 72 24 L76 26 Q78 28 78 32 L78 34 Q78 38 74 38 L8 38 Q4 38 4 34 Z"/>
              <path d="M30 24 L34 17 Q40 15 50 15 Q56 16 60 19 L64 24 Z"/>
              <path d="M34 23 L37 18 Q42 16 50 16 Q55 17 58 20 L60 23"/>
              <circle cx="16" cy="38" r="6" fill={bg}/><circle cx="16" cy="38" r="3" fill={stroke}/>
              <circle cx="64" cy="38" r="6" fill={bg}/><circle cx="64" cy="38" r="3" fill={stroke}/>
              <ellipse cx="76" cy="27" rx="2.5" ry="1.5" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

        {/* Minibus */}
        <CarCard label="مینیبەس" labelEn="Minibus">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              <path d="M4 28 L4 10 Q4 6 8 6 L66 6 Q72 6 74 10 L76 28 L76 34 Q76 38 72 38 L8 38 Q4 38 4 34 Z"/>
              <path d="M10 28 L10 8 L68 8 L70 28 Z"/>
              <path d="M14 27 L14 10 L30 10 L30 27"/>
              <path d="M34 27 L34 10 L50 10 L50 27"/>
              <path d="M54 27 L54 10 L66 10 L67 27"/>
              <circle cx="16" cy="38" r="6" fill={bg}/><circle cx="16" cy="38" r="3" fill={stroke}/>
              <circle cx="64" cy="38" r="6" fill={bg}/><circle cx="64" cy="38" r="3" fill={stroke}/>
              <ellipse cx="75" cy="18" rx="2" ry="2.5" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

        {/* Taxi Sedan */}
        <CarCard label="تەکسی" labelEn="Taxi Sedan">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              <path d="M2 30 Q4 24 8 22 L18 22 Q26 22 30 16 Q34 12 42 12 Q50 12 56 12 Q62 14 66 18 Q70 22 74 22 L78 24 Q80 26 80 30 L80 34 Q80 38 76 38 L6 38 Q2 38 2 34 Z"/>
              <path d="M26 22 L30 14 Q36 12 48 12 Q56 13 62 16 L66 22 Z"/>
              <path d="M30 21 L33 15 Q38 13 48 13 Q54 14 59 17 L62 21"/>
              <line x1="46" y1="13" x2="46" y2="21"/>
              {/* Taxi sign on roof */}
              <rect x="38" y="9" width="12" height="5" rx="1" fill={yellow} stroke={stroke} strokeWidth="1"/>
              <circle cx="14" cy="38" r="6" fill={bg}/><circle cx="14" cy="38" r="3" fill={stroke}/>
              <circle cx="66" cy="38" r="6" fill={bg}/><circle cx="66" cy="38" r="3" fill={stroke}/>
              <ellipse cx="78" cy="25" rx="2.5" ry="1.5" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

        {/* Sport SUV */}
        <CarCard label="ئەس ئیو ڤی سپۆرت" labelEn="Sport SUV">
          <svg width={120} height={66} viewBox="0 0 92 44" fill="none"
            stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="scale(-1,1) translate(-80,0)">
              <path d="M6 28 Q6 22 10 18 L16 14 Q22 10 40 10 Q58 10 64 14 L70 18 Q74 22 74 28 L74 34 Q74 38 70 38 L10 38 Q6 38 6 34 Z"/>
              <path d="M16 28 L20 14 Q28 11 40 11 Q52 11 60 14 L64 28 Z"/>
              <path d="M20 27 L23 15 Q30 12 40 12 Q50 12 57 15 L60 27"/>
              <line x1="40" y1="12" x2="40" y2="27"/>
              <circle cx="18" cy="38" r="7" fill={bg}/><circle cx="18" cy="38" r="3.5" fill={stroke}/>
              <circle cx="62" cy="38" r="7" fill={bg}/><circle cx="62" cy="38" r="3.5" fill={stroke}/>
              <ellipse cx="73" cy="23" rx="2.5" ry="2" fill={yellow} stroke={stroke} strokeWidth="1.5"/>
            </g>
            <Flag />
          </svg>
        </CarCard>

      </div>
    </div>
  )
}
