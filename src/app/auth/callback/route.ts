import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(
    request.nextUrl.searchParams.get('code') || ''
  )

  if (error) {
    return NextResponse.redirect(new URL('/?error=auth', request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
}
