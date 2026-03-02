'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAILS = ['hawiefr@gmail.com', 'hawkarakrd@gmail.com']

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<any[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [docUrls, setDocUrls] = useState<Record<string, { id?: string; selfie?: string; license?: string }>>({})
  const [loadingDocs, setLoadingDocs] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !ADMIN_EMAILS.includes(user.email || '')) { setLoading(false); return }
      setAuthorized(true)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['driver', 'both'])
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: true })

      if (data) setPending(data)
      setLoading(false)
    }
    init()
  }, [])

  const loadDocs = async (userId: string) => {
    if (docUrls[userId]) return
    setLoadingDocs(userId)
    const { data: files } = await supabase.storage.from('documents').list(userId)
    if (files) {
      const obj: { id?: string; selfie?: string; license?: string } = {}
      for (const f of files) {
        const { data: urlData } = await supabase.storage.from('documents').createSignedUrl(`${userId}/${f.name}`, 3600)
        if (f.name.startsWith('id')) obj.id = urlData?.signedUrl
        if (f.name.startsWith('selfie')) obj.selfie = urlData?.signedUrl
        if (f.name.startsWith('license')) obj.license = urlData?.signedUrl
      }
      setDocUrls(prev => ({ ...prev, [userId]: obj }))
    }
    setLoadingDocs(null)
  }

  const handleExpand = async (userId: string) => {
    if (expanded === userId) { setExpanded(null); return }
    setExpanded(userId)
    await loadDocs(userId)
  }

  const handleApprove = async (userId: string) => {
    await supabase.from('profiles').update({ verification_status: 'verified' }).eq('id', userId)
    setPending(prev => prev.filter(p => p.id !== userId))
    setExpanded(null)
  }

  const handleDecline = async (userId: string) => {
    await supabase.from('profiles').update({ verification_status: 'none' }).eq('id', userId)
    setPending(prev => prev.filter(p => p.id !== userId))
    setExpanded(null)
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  if (!authorized) return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>Access denied</div>

  const imgStyle = { width: '100%', maxWidth: '300px', borderRadius: '0.5rem', cursor: 'pointer' } as React.CSSProperties

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin</h1>
      <p style={{ color: '#78716c', marginBottom: '2rem' }}>{pending.length} pending</p>

      {pending.length === 0 && (
        <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', color: '#a8a29e' }}>No pending verifications</div>
      )}

      {pending.map(p => (
        <div key={p.id} style={{ background: 'white', border: expanded === p.id ? '2px solid #df6530' : '1px solid #e7e5e4', borderRadius: '1rem', marginBottom: '0.5rem', overflow: 'hidden' }}>
          <div
            onClick={() => handleExpand(p.id)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fae8d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#df6530' }}>
                {(p.full_name || '?').charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1c1917' }}>{p.full_name || 'No name'}</div>
                <div style={{ fontSize: '0.75rem', color: '#a8a29e' }}>{p.email} &middot; {p.role}</div>
              </div>
            </div>
            <span style={{ fontSize: '1.2rem', color: '#a8a29e', transition: 'transform 0.2s', transform: expanded === p.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#9660;</span>
          </div>

          {expanded === p.id && (
            <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #e7e5e4' }}>
              {loadingDocs === p.id ? (
                <p style={{ color: '#a8a29e', fontSize: '0.85rem', padding: '1rem 0' }}>Loading documents...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {docUrls[p.id]?.id && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '0.25rem', fontWeight: 600 }}>ID</div>
                      <a href={docUrls[p.id].id} target="_blank" rel="noopener noreferrer"><img src={docUrls[p.id].id} alt="ID" style={imgStyle} /></a>
                    </div>
                  )}
                  {docUrls[p.id]?.selfie && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '0.25rem', fontWeight: 600 }}>Selfie</div>
                      <a href={docUrls[p.id].selfie} target="_blank" rel="noopener noreferrer"><img src={docUrls[p.id].selfie} alt="Selfie" style={imgStyle} /></a>
                    </div>
                  )}
                  {docUrls[p.id]?.license && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '0.25rem', fontWeight: 600 }}>License</div>
                      <a href={docUrls[p.id].license} target="_blank" rel="noopener noreferrer"><img src={docUrls[p.id].license} alt="License" style={imgStyle} /></a>
                    </div>
                  )}
                  {!docUrls[p.id]?.id && !docUrls[p.id]?.selfie && !docUrls[p.id]?.license && (
                    <p style={{ color: '#a8a29e', fontSize: '0.85rem' }}>No documents uploaded</p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  onClick={() => handleApprove(p.id)}
                  style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.7rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecline(p.id)}
                  style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.7rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Decline
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
