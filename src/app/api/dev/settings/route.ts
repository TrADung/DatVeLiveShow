import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey.includes('placeholder')) {
    return null
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const email = (user.email || '').toLowerCase().trim()
  if (email !== 'trananhdung11102006@gmail.com') {
    const { data: roleData } = await supabase.from('users_role').select('role').eq('email', email).single()
    if (!roleData || roleData.role !== 'dev') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminSupabase = getAdminSupabase()
  if (adminSupabase) {
    try {
      const { data: settings } = await adminSupabase.from('site_settings').select('*').order('key')
      if (settings && settings.length > 0) return NextResponse.json(settings)
    } catch {}
  }

  // Fallback to authenticated client
  try {
    const { data: settings } = await supabase.from('site_settings').select('*').order('key')
    return NextResponse.json(settings || [])
  } catch (err) {
    console.error('Error fetching settings:', err)
    return NextResponse.json([])
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const email = (user.email || '').toLowerCase().trim()
  if (email !== 'trananhdung11102006@gmail.com') {
    const { data: roleData } = await supabase.from('users_role').select('role').eq('email', email).single()
    if (!roleData || roleData.role !== 'dev') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { key, value } = await request.json()
  if (!key || value === undefined) return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })

  const adminSupabase = getAdminSupabase()
  const dbClient = adminSupabase || supabase

  const { error } = await dbClient
    .from('site_settings')
    .upsert({ key, value: String(value), updated_by: user.email, updated_at: new Date().toISOString() })

  if (error) {
    console.error('Error saving site setting:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If saving admin_emails, automatically sync emails to users_role table
  if (key === 'admin_emails' && typeof value === 'string') {
    const emailList = value
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@'))

    for (const adminEmail of emailList) {
      try {
        await dbClient
          .from('users_role')
          .upsert({ email: adminEmail, role: 'admin' }, { onConflict: 'email' })
      } catch (roleErr) {
        console.warn('Could not sync role for:', adminEmail, roleErr)
      }
    }
  }

  try {
    await dbClient.from('system_logs').insert({
      action: 'SETTING_UPDATED',
      performed_by: user.email!,
      details: { key, value },
    })
  } catch {}

  return NextResponse.json({ success: true })
}
