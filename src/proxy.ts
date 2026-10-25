import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. Essential Security Headers for all responses
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()')

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isDevRoute = pathname.startsWith('/dev')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isDevApi = pathname.startsWith('/api/dev')

  // If public route, return immediately
  if (!isAdminRoute && !isDevRoute && !isAdminApi && !isDevApi) {
    return supabaseResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAdminApi || isDevApi) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('auth', 'error')
    return NextResponse.redirect(url)
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })

  // 2. Fetch authenticated user from Supabase session cookie
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 3. Block unauthenticated access to admin / dev routes
  if (!user || !user.email) {
    if (isAdminApi || isDevApi) {
      return NextResponse.json(
        { error: 'Unauthorized: Vui lòng đăng nhập tài khoản quản trị.' },
        { status: 401 }
      )
    }
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('auth', 'unauthorized')
    return NextResponse.redirect(redirectUrl)
  }

  const email = user.email.toLowerCase().trim()
  const isMasterDev = email === 'trananhdung11102006@gmail.com'

  // 4. Role Authorization check from users_role table
  let userRole = 'user'
  if (isMasterDev) {
    userRole = 'dev'
  } else {
    try {
      const { data: roleData } = await supabase
        .from('users_role')
        .select('role')
        .eq('email', email)
        .single()
      if (roleData?.role) {
        userRole = roleData.role
      }
    } catch {}
  }

  // Check Admin permission
  if (isAdminRoute || isAdminApi) {
    if (userRole !== 'admin' && userRole !== 'dev') {
      if (isAdminApi) {
        return NextResponse.json(
          { error: 'Forbidden: Bạn không có quyền truy cập trang quản trị.' },
          { status: 403 }
        )
      }
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      redirectUrl.searchParams.set('auth', 'forbidden')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Check Dev permission
  if (isDevRoute || isDevApi) {
    if (userRole !== 'dev') {
      if (isDevApi) {
        return NextResponse.json(
          { error: 'Forbidden: Khu vực dành riêng cho Developer Lead.' },
          { status: 403 }
        )
      }
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      redirectUrl.searchParams.set('auth', 'forbidden')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|wav|mp3)$).*)',
  ],
}
