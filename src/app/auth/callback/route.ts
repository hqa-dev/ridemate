import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has uploaded verification docs
        const { data: idFile } = await supabase.storage
          .from('documents')
          .list(user.id, { search: 'id' })
        
        const { data: selfieFile } = await supabase.storage
          .from('documents')
          .list(user.id, { search: 'selfie' })
        
        const hasId = idFile && idFile.length > 0
        const hasSelfie = selfieFile && selfieFile.length > 0
        
        if (!hasId || !hasSelfie) {
          // Not verified yet, send to verify step
          return NextResponse.redirect(`${origin}/auth/verify`)
        }
      }
      
      return NextResponse.redirect(`${origin}/home`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/register`)
}
