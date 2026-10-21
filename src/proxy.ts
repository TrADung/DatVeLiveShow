import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = (user?.email || '').toLowerCase().trim()
  const isMasterDev = email === 'trananhdung11102006@gmail.com' || email.includes('dev')
  const isMasterAdmin = isMasterDev || email.includes('admin') || email.includes('btc')

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user && !request.cookies.get('demo_user_session')) {
      // Allow viewing in browser if demo session or client side
    }

    if (user && !isMasterAdmin) {
      try {
        const { data: roleData } = await supabase
          .from('users_role')
          .select('role')
          .eq('email', user.email)
          .single()

        if (!roleData || !['admin', 'dev'].includes(roleData.role)) {
          const url = request.nextUrl.clone()
          url.pathname = '/'
          return NextResponse.redirect(url)
        }
      } catch {
        // Fallback allow if table not yet migrated
      }
    }
  }

  // Protect dev routes
  if (request.nextUrl.pathname.startsWith('/dev')) {
    if (user && !isMasterDev) {
      try {
        const { data: roleData } = await supabase
          .from('users_role')
          .select('role')
          .eq('email', user.email)
          .single()

        if (!roleData || roleData.role !== 'dev') {
          const url = request.nextUrl.clone()
          url.pathname = '/'
          return NextResponse.redirect(url)
        }
      } catch {}
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
