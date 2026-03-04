'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { T } from '@/lib/theme'

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
        window.location.href = '/auth/register'
      }
    }
    check()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: T.textDim, fontSize: '1rem' }}>...چاوەڕوان بە</p>
    </div>
  )
}
