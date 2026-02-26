'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAILS = ['hawiefr@gmail.com', 'hawkarakrd@gmail.com']

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<any[]>([])
  const [docUrls, setDocUrls] = useState<Record<string, { id?: string; selfie?: string; license?: string }>>({})
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) { console.log("DENIED:", user?.email); setLoading(false); return }
      console.log("APPROVED:", user.email)
      setAuthorized(true)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['driver', 'both'])
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: true })

      if (data) {
        setPending(data)
        const urls: Record<string, { id?: string; selfie?: string; license?: string }> = {}
        for (const p of data) {
          const { data: files } = await supabase.storage.from('documents').list(p.id)
          if (files) {
            const obj: { id?: string; selfie?: string; license?: string } = {}
            for (const f of files) {
              const { data: urlData } = await supabase.storage.from('documents').createSignedUrl(`${p.id}/${f.name}`, 3600)
              if (f.name.startsWith('id')) obj.id = urlData?.signedUrl
              if (f.name.startsWith('selfie')) obj.selfie = urlData?.signedUrl
              if (f.name.startsWith('license')) obj.license = urlData?.signedUrl
            }
            urls[p.id] = obj
          }
        }
        setDocUrls(urls)
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleApprove = async (userId: string) => {
    await supabase.from('profiles').update({ verification_status: 'verified' }).eq('id', userId)
    setPending(prev => prev.filter(p => p.id !== userId))
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  if (!authorized) return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>Access denied</div>

  const card = { background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }
  const imgStyle = { width: '100%', maxWidth: '280px', borderRadius: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' } as React.CSSProperties

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin</h1>
      <p style={{ color: '#78716c', marginBottom: '2rem' }}>{pending.length} pending verification{pending.length !== 1 ? 's' : ''}</p>

      {pending.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#a8a29e' }}>No pending verifications</div>
      )}

      {pending.map(p => (
        <div key={p.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.full_name || 'No name'}</div>
              <div style={{ fontSize: '0.8rem', color: '#a8a29e' }}>{p.email}</div>
              <div style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.25rem' }}>Role: {p.role}</div>
            </div>
            <button
              onClick={() => handleApprove(p.id)}
              style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Approve
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {docUrls[p.id]?.id && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '0.25rem' }}>ID</div>
                <a href={docUrls[p.id].id} target="_blank"><img src={docUrls[p.id].id} alt="ID" style={imgStyle} /></a>
              </div>
            )}
            {docUrls[p.id]?.selfie && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '0.25rem' }}>Selfie</div>
                <a href={docUrls[p.id].selfie} target="_blank"><img src={docUrls[p.id].selfie} alt="Selfie" style={imgStyle} /></a>
              </div>
            )}
            {docUrls[p.id]?.license && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '0.25rem' }}>License</div>
                <a href={docUrls[p.id].license} target="_blank"><img src={docUrls[p.id].license} alt="License" style={imgStyle} /></a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
