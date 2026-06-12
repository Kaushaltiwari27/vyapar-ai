import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const pathname = request.nextUrl.pathname
  const PUBLIC_ROUTES = ['/login', '/signup', '/', '/pricing', '/subscribe', '/payment-success', '/payment-failed']
  const AUTH_ROUTES = ['/login', '/signup']
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname === r)
  
  const protectedRoutes = ['/dashboard', '/customers', '/deals', '/invoices', '/inventory', '/vendors', '/purchase-orders', '/employees', '/attendance', '/leaves', '/payroll', '/compliance', '/whatsapp', '/chat']
  const isDashboardRoute = protectedRoutes.some(r => pathname.startsWith(r))

  if (!user) {
    if (isPublic) return supabaseResponse
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (isDashboardRoute) {
    // Check user's business subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .eq('id', user.sub)
      .single()

    if (!profile?.business_id) {
      const url = request.nextUrl.clone()
      url.pathname = '/select-plan'
      return NextResponse.redirect(url)
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('plan, subscription_status, trial_ends_at')
      .eq('id', profile.business_id)
      .single()

    if (!business || !business.plan || (business.plan === 'trial' && !business.trial_ends_at)) {
      const url = request.nextUrl.clone()
      url.pathname = '/select-plan'
      return NextResponse.redirect(url)
    }

    const isExpired = business.subscription_status !== 'active' && 
      (business.subscription_status === 'expired' || 
       new Date(business.trial_ends_at) < new Date())

    if (isExpired && pathname !== '/subscribe') {
      const url = request.nextUrl.clone()
      url.pathname = '/subscribe'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
