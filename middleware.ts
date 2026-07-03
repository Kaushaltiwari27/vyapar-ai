import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const PUBLIC = ['/', '/login', '/signup', '/select-plan', '/subscribe', '/pricing', '/payment-success', '/forgot-password']
  const isPublic = PUBLIC.some(p => pathname === p || pathname.startsWith('/api'))

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Subscription check for dashboard routes
  const isDashboard = pathname.startsWith('/dashboard') || 
    ['/customers', '/deals', '/invoices', '/quotations', '/inventory', '/vendors', 
     '/purchase-orders', '/employees', '/attendance', '/leaves', 
     '/payroll', '/compliance', '/whatsapp', '/chat'].some(r => pathname.startsWith(r))

  if (user && isDashboard) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single()

    if (!profile?.plan) {
      return NextResponse.redirect(new URL('/select-plan', request.url))
    }

    const isExpired = profile.subscription_status !== 'active' &&
      profile.subscription_status === 'trial' &&
      profile.trial_ends_at &&
      new Date(profile.trial_ends_at) < new Date()

    const isHardExpired = profile.subscription_status === 'expired'

    if (isExpired || isHardExpired) {
      return NextResponse.redirect(new URL('/subscribe', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.png$|.*\\.jpg$).*)'],
}
