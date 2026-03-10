'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/lib/ProfileContext'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { kurdishStrings } from '@/lib/strings'
import PageHeader from '@/components/ui/PageHeader'
import SectionLabel from '@/components/ui/SectionLabel'
import Card from '@/components/ui/Card'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: profileLoading } = useProfile()

  useEffect(() => {
    if (!profileLoading && !user) router.push('/')
  }, [profileLoading, user])
  const [confirmModal, setConfirmModal] = useState<{ message: string; action: () => void } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    setConfirmModal({
      message: kurdishStrings.confirmDeleteAccountPermanent,
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
      direction: 'rtl', height: '100vh', background: 'var(--color-bg-canvas)',
      maxWidth: 'var(--size-app-maxWidth)', margin: '0 auto',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0 }}>
        <PageHeader title={kurdishStrings.settings} back />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-4) var(--space-navClearance)' }}>

        {/* Language */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <SectionLabel label={kurdishStrings.language} />
          <Card>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-card-lg)', direction: 'rtl',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span style={{ fontSize: 'var(--font-size-heading)', color: 'var(--color-text-primary)' }}>{kurdishStrings.kurdishLanguage}</span>
              </div>
              <span style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)' }}>{kurdishStrings.kurdishLanguage}</span>
            </div>
          </Card>
        </div>

        {/* Danger zone */}
        <div>
          <SectionLabel label={kurdishStrings.dangerZone} />
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
                <span style={{ fontSize: 'var(--font-size-heading)', color: 'var(--color-status-error)' }}>{kurdishStrings.deleteAccountLabel}</span>
                <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-icon-muted)', margin: '3px 0 0' }}>{kurdishStrings.deleteAccountWarning}</p>
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
