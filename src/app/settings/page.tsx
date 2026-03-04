'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { T } from '@/lib/theme'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
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
      direction: 'rtl', minHeight: '100vh', background: T.bg,
      fontFamily: "'Noto Sans Arabic', sans-serif", maxWidth: 480, margin: '0 auto',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 20px 20px', gap: 12 }}>
        <div onClick={() => router.back()} style={{ cursor: 'pointer', padding: 4 }}><BackArrow /></div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>ڕێکخستنەکان</h1>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Language */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '0 4px 8px' }}>زمان</div>
          <div style={{
            background: T.card, borderRadius: 12, overflow: 'hidden',
            border: `1px solid ${T.border}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 16px', direction: 'rtl',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span style={{ fontSize: 14, color: T.text }}>کوردی سۆرانی</span>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>بەم زووانە</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '0 4px 8px' }}>ئاگاداری</div>
          <div style={{
            background: T.card, borderRadius: 12, overflow: 'hidden',
            border: `1px solid ${T.border}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 16px', direction: 'rtl',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span style={{ fontSize: 14, color: T.text }}>ئاگادارییەکانی پوش</span>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>بەم زووانە</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '0 4px 8px' }}>مەترسیدار</div>
          <div style={{
            background: T.card, borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(248,113,113,0.1)',
          }}>
            <div
              onClick={handleDeleteAccount}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 16px', direction: 'rtl', cursor: 'pointer',
                opacity: deleting ? 0.4 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <div>
                <span style={{ fontSize: 14, color: T.red }}>سڕینەوەی هەژمار</span>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0' }}>هەموو داتاکانت دەسڕێتەوە و ناگەڕێتەوە</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={!!confirmModal}
        message={confirmModal?.message || ''}
        onConfirm={confirmModal?.action || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />

      <BottomNav />
    </div>
  )
}
