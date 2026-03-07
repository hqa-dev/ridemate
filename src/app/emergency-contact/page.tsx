'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { kurdishStrings } from '@/lib/strings'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/ui/PageHeader'
import SectionLabel from '@/components/ui/SectionLabel'
import Card from '@/components/ui/Card'

export default function EmergencyContactPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUserId(user.id)
    const { data } = await supabase.from('profiles').select('emergency_contact_name, emergency_contact_phone').eq('id', user.id).single()
    if (data) {
      setName(data.emergency_contact_name || '')
      setPhone(data.emergency_contact_phone || '')
    }
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    await supabase.from('profiles').update({
      emergency_contact_name: name.trim(),
      emergency_contact_phone: phone.trim(),
    }).eq('id', userId)
    setSaving(false)
    setToast(kurdishStrings.emergencyContactSaved)
    setTimeout(() => setToast(''), 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--color-bg-sunken)', border: 'var(--border-width-thin) solid var(--color-border-strong)',
    borderRadius: 'var(--radius-base)', padding: 'var(--input-standard-padding)', fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)',
    outline: 'none', fontFamily: 'var(--font-family-body)', boxSizing: 'border-box',
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)', maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto' }}>

      <PageHeader title={kurdishStrings.emergencyContact} back onBack={() => router.push('/account')} />

      <div style={{ padding: '0 0 120px' }}>
        <div style={{ marginTop: 'var(--space-4)' }}><SectionLabel label={kurdishStrings.emergencyContact} /></div>
        <Card style={{ margin: '0 var(--space-3)', padding: 'var(--space-card-lg)' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1-5)' }}>{kurdishStrings.emergencyContactName}</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, direction: 'rtl' }} />
          </div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1-5)' }}>{kurdishStrings.emergencyContactPhone}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" type="tel" placeholder="07501234567" style={inputStyle} />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', background: 'var(--button-subtle-bg)', color: 'var(--color-status-success)',
              border: 'none', borderRadius: 'var(--button-subtle-radius)', padding: 'var(--button-subtle-padding)',
              fontSize: 'var(--button-subtle-fontSize)', fontWeight: 'var(--button-subtle-fontWeight)' as unknown as number,
              cursor: 'pointer', fontFamily: 'var(--font-family-body)',
              opacity: saving ? 'var(--opacity-disabled)' as unknown as number : 1,
            }}
          >
            {saving ? '...' : kurdishStrings.save}
          </button>
        </Card>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 'var(--space-navClearance)', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--toast-bg)', border: 'var(--toast-border)', borderRadius: 'var(--toast-radius)',
          padding: '10px var(--space-5)', fontSize: 'var(--toast-fontSize)', fontWeight: 'var(--toast-fontWeight)' as unknown as number, color: 'var(--color-text-primary)',
          zIndex: 'var(--z-overlay)' as unknown as number, boxShadow: 'var(--toast-shadow)',
          backdropFilter: 'var(--toast-blur)', WebkitBackdropFilter: 'var(--toast-blur)', whiteSpace: 'nowrap',
        }}>
          {toast} ✨
        </div>
      )}

      <BottomNav active="account" />
    </div>
  )
}
