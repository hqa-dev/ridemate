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

  if (loading) return <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>Loading...</div>
  if (!authorized) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-status-error)' }}>Access denied</div>

  const imgStyle = { width: '100%', maxWidth: '300px', borderRadius: 'var(--radius-base)', cursor: 'pointer' } as React.CSSProperties

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8) var(--space-5)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)' as unknown as number, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>Admin</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>{pending.length} pending</p>

      {pending.length === 0 && (
        <div style={{ background: 'var(--color-bg-surface)', border: 'var(--border-width-thin) solid var(--color-border-subtle)', borderRadius: 'var(--radius-4xl)', padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-icon-muted)' }}>No pending verifications</div>
      )}

      {pending.map(p => (
        <div key={p.id} style={{ background: 'var(--color-bg-surface)', border: expanded === p.id ? 'var(--border-width-thick) solid var(--color-brand-primary)' : 'var(--border-width-thin) solid var(--color-border-subtle)', borderRadius: 'var(--radius-4xl)', marginBottom: 'var(--space-2)', overflow: 'hidden' }}>
          <div
            onClick={() => handleExpand(p.id)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 'var(--size-avatar-lg)', height: 'var(--size-avatar-lg)', borderRadius: 'var(--radius-xl)', background: 'var(--color-brand-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'var(--font-weight-bold)' as unknown as number, color: 'var(--color-brand-primary)' }}>
                {(p.full_name || '?').charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-bold)' as unknown as number, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{p.full_name || 'No name'}</div>
                <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-icon-muted)' }}>{p.email} &middot; {p.role}</div>
              </div>
            </div>
            <span style={{ fontSize: '1.2rem', color: 'var(--color-icon-muted)', transition: 'transform var(--motion-duration-normal)', transform: expanded === p.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#9660;</span>
          </div>

          {expanded === p.id && (
            <div style={{ padding: '0 var(--space-5) var(--space-5)', borderTop: 'var(--border-width-thin) solid var(--color-border-subtle)' }}>
              {loadingDocs === p.id ? (
                <p style={{ color: 'var(--color-icon-muted)', fontSize: '0.85rem', padding: 'var(--space-4) 0' }}>Loading documents...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  {docUrls[p.id]?.id && (
                    <div>
                      <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-bold)' as unknown as number }}>ID</div>
                      <a href={docUrls[p.id].id} target="_blank" rel="noopener noreferrer"><img src={docUrls[p.id].id} alt="ID" style={imgStyle} /></a>
                    </div>
                  )}
                  {docUrls[p.id]?.selfie && (
                    <div>
                      <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-bold)' as unknown as number }}>Selfie</div>
                      <a href={docUrls[p.id].selfie} target="_blank" rel="noopener noreferrer"><img src={docUrls[p.id].selfie} alt="Selfie" style={imgStyle} /></a>
                    </div>
                  )}
                  {docUrls[p.id]?.license && (
                    <div>
                      <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-bold)' as unknown as number }}>License</div>
                      <a href={docUrls[p.id].license} target="_blank" rel="noopener noreferrer"><img src={docUrls[p.id].license} alt="License" style={imgStyle} /></a>
                    </div>
                  )}
                  {!docUrls[p.id]?.id && !docUrls[p.id]?.selfie && !docUrls[p.id]?.license && (
                    <p style={{ color: 'var(--color-icon-muted)', fontSize: '0.85rem' }}>No documents uploaded</p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                <button
                  onClick={() => handleApprove(p.id)}
                  style={{ flex: 1, background: 'var(--color-status-success)', color: 'var(--color-text-onAccent)', border: 'none', borderRadius: 'var(--radius-2xl)', padding: '0.7rem', fontSize: '0.9rem', fontWeight: 'var(--font-weight-bold)' as unknown as number, cursor: 'pointer' }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecline(p.id)}
                  style={{ flex: 1, background: 'var(--color-status-error)', color: 'var(--color-text-onAccent)', border: 'none', borderRadius: 'var(--radius-2xl)', padding: '0.7rem', fontSize: '0.9rem', fontWeight: 'var(--font-weight-bold)' as unknown as number, cursor: 'pointer' }}
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
