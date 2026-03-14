import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ── Site-wide password gate (remove when ready to launch) ──
  const sitePassword = process.env.SITE_PASSWORD
  if (sitePassword) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="ڕێ — Private Preview"' },
      })
    }
    const base64 = authHeader.split(' ')[1]
    const decoded = atob(base64)
    const [, password] = decoded.split(':')
    if (password !== sitePassword) {
      return new NextResponse('Invalid password', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="ڕێ — Private Preview"' },
      })
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPrefixes = ['/home', '/account', '/my-rides', '/post-ride', '/notifications', '/settings', '/profile', '/rides']
  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  if (!user && protectedPrefixes.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Redirect authenticated users away from landing page
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
