'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const supabase = createClient()

  useEffect(() => {
    let attempts = 0
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        window.location.href = '/home'
        return
      }
      attempts++
      if (attempts < 10) {
        setTimeout(check, 500)
      } else {
        window.location.href = '/'
      }
    }
    check()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>...چاوەڕوان بە</p>
    </div>
  )
}
