import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data: roleData } = await supabase.from('users_role').select('role').eq('email', user.email!).single()
  if (!roleData || roleData.role !== 'dev') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminSupabase = getAdminSupabase()
  const { data: settings } = await adminSupabase.from('site_settings').select('*').order('key')
  
  return NextResponse.json(settings)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data: roleData } = await supabase.from('users_role').select('role').eq('email', user.email!).single()
  if (!roleData || roleData.role !== 'dev') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { key, value } = await request.json()
  if (!key || value === undefined) return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })

  const adminSupabase = getAdminSupabase()
  const { error } = await adminSupabase
    .from('site_settings')
    .upsert({ key, value, updated_by: user.email, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await adminSupabase.from('system_logs').insert({
    action: 'SETTING_UPDATED',
    performed_by: user.email!,
    details: { key, value },
  })

  return NextResponse.json({ success: true })
}
