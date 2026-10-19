import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdminRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: roleData } = await supabase
    .from('users_role')
    .select('role')
    .eq('email', user.email)
    .single()

  if (!roleData || !['admin', 'dev'].includes(roleData.role)) return null
  return user
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { ticket_id, action } = await request.json()

  if (!ticket_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const adminClient = getAdminClient()
  const newStatus = action === 'approve' ? 'paid' : 'rejected'

  const { error } = await adminClient
    .from('tickets')
    .update({
      payment_status: newStatus,
      verified_by: admin.email,
      verified_at: new Date().toISOString(),
    })
    .eq('id', ticket_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log the action
  await adminClient.from('system_logs').insert({
    action: action === 'approve' ? 'TICKET_APPROVED' : 'TICKET_REJECTED',
    performed_by: admin.email!,
    target_id: ticket_id,
    details: { new_status: newStatus },
  })

  return NextResponse.json({ success: true, status: newStatus })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const adminClient = getAdminClient()
  
  let query = adminClient
    .from('tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('payment_status', status)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tickets: data, total: count, page, limit })
}
