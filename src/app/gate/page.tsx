import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function unlock(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  if (password === process.env.SITE_PASSWORD) {
    const c = await cookies()
    c.set('site_access', 'granted', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    redirect('/')
  } else {
    redirect('/gate?error=1')
  }
}

export default async function GatePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#121511',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <form action={unlock} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: 40,
      }}>
        <h1 style={{ fontSize: 48, color: '#F4F91D', margin: 0 }}>ڕێ</h1>
        <p style={{ color: '#9BA8A2', fontSize: 14, margin: 0 }}>Private Preview</p>
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoFocus
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: '1.5px solid rgba(255,255,255,0.20)',
            background: '#1E211D',
            color: '#F2F0EB',
            fontSize: 16,
            width: 220,
            textAlign: 'center',
            outline: 'none',
          }}
        />
        {params.error && (
          <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>Wrong password</p>
        )}
        <button type="submit" style={{
          padding: '10px 32px',
          borderRadius: 10,
          border: 'none',
          background: '#F4F91D',
          color: '#121511',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}>
          Enter
        </button>
      </form>
    </div>
  )
}
