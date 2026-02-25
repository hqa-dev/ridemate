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
        const { data: files } = await supabase.storage
          .from('documents')
          .list(user.id)
        
        const hasId = files?.some(f => f.name.startsWith('id'))
        const hasSelfie = files?.some(f => f.name.startsWith('selfie'))
        
        if (!hasId || !hasSelfie) {
          return NextResponse.redirect(`${origin}/auth/verify`)
        }
      }
      
      return NextResponse.redirect(`${origin}/home`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
