'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import PageHeader from '@/components/ui/PageHeader'
import SectionLabel from '@/components/ui/SectionLabel'
import Card from '@/components/ui/Card'

const Toggle = () => (
  <div style={{ width: 36, height: 20, borderRadius: 'var(--radius-xl)', border: 'var(--border-width-medium) solid var(--color-text-primary)', background: 'var(--color-brand-fill)', display: 'flex', alignItems: 'center', padding: '0 3px', justifyContent: 'flex-end' }}>
    <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--color-brand-primary)' }} />
  </div>
)

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [confirmModal, setConfirmModal] = useState<{ message: string; action: () => void } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    setConfirmModal({
      message: 'دڵنیایت لە سڕینەوەی هەژمارەکەت؟ ئەم کارە ناگەڕێتەوە.',
      action: async () => {
        setConfirmModal(null)
        setDeleting(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Cancel all active rides by this driver
        await supabase.from('rides').update({ status: 'cancelled' }).eq('driver_id', user.id).in('status', ['active', 'full'])

        // Cancel all pending/approved ride requests by this passenger
        await supabase.from('ride_requests').update({ status: 'cancelled' }).eq('passenger_id', user.id).in('status', ['pending', 'approved'])

        // Delete profile (cascades notifications etc)
        await supabase.from('profiles').delete().eq('id', user.id)

        // Sign out
        await supabase.auth.signOut()
        router.push('/')
      },
    })
  }

  return (
    <div style={{
      direction: 'rtl', minHeight: '100vh', background: 'var(--color-bg-canvas)',
      maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto',
      paddingBottom: 'var(--space-navClearanceLg)',
    }}>
      <PageHeader title="ڕێکخستنەکان" back />

      <div style={{ padding: '0 var(--space-4)' }}>

        {/* Language */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <SectionLabel label="زمان" />
          <Card>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-card-lg)', direction: 'rtl',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>زمانی کوردی</span>
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>زمانی کوردی</span>
            </div>
          </Card>
        </div>

        {/* Notifications */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <SectionLabel label="ئاگاداری" />
          <Card>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-card-lg)', direction: 'rtl',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>پەیامەکان</span>
              </div>
              <Toggle />
            </div>
          </Card>
        </div>

        {/* Danger zone */}
        <div>
          <SectionLabel label="مەترسیدار" />
          <Card danger>
            <div
              onClick={handleDeleteAccount}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-card-lg)', direction: 'rtl', cursor: 'pointer',
                opacity: deleting ? 0.4 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <div>
                <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-status-error)' }}>سڕینەوەی هەژمار</span>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-icon-muted)', margin: '3px 0 0' }}>هەموو داتاکانت دەسڕێتەوە و ناگەڕێتەوە</p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      <ConfirmModal
        isOpen={!!confirmModal}
        message={confirmModal?.message || ''}
        onConfirm={confirmModal?.action || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />

      <BottomNav active="account" />
    </div>
  )
}
