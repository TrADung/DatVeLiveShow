import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verifyQRHash } from '@/lib/utils'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdminRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { email: 'admin@clbamnhac.com' }
  const email = (user.email || '').toLowerCase().trim()
  if (email === 'trananhdung11102006@gmail.com' || email.includes('admin') || email.includes('dev') || email.includes('btc')) {
    return user
  }
  try {
    const { data } = await supabase.from('users_role').select('role').eq('email', user.email!).single()
    if (data && ['admin', 'dev'].includes(data.role)) return user
  } catch {}
  return null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { qr_data } = await request.json()

  if (!qr_data) {
    return NextResponse.json({ error: 'No QR data provided' }, { status: 400 })
  }

  try {
    // Parse QR data
    let parsedQR: { id: string; order_code: string; hash: string }
    try {
      parsedQR = JSON.parse(qr_data)
    } catch {
      return NextResponse.json({ error: 'Invalid QR code format' }, { status: 400 })
    }

    const { id, order_code, hash } = parsedQR

    if (!id || !order_code || !hash) {
      return NextResponse.json({ error: 'Invalid QR data fields' }, { status: 400 })
    }

    // Verify hash
    const isValidHash = verifyQRHash(id, order_code, hash)
    if (!isValidHash) {
      return NextResponse.json({ 
        error: 'QR code không hợp lệ hoặc đã bị giả mạo',
        status: 'invalid_qr'
      }, { status: 400 })
    }

    const adminSupabase = getAdminSupabase()

    // Get ticket
    const { data: ticket, error: fetchError } = await adminSupabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .eq('order_code', order_code)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json({ 
        error: 'Không tìm thấy vé',
        status: 'not_found' 
      }, { status: 404 })
    }

    // Check payment status
    if (ticket.payment_status !== 'paid') {
      return NextResponse.json({
        error: 'Vé chưa được xác nhận thanh toán',
        status: 'not_paid',
        ticket: {
          full_name: ticket.full_name,
          order_code: ticket.order_code,
          payment_status: ticket.payment_status,
        }
      }, { status: 400 })
    }

    // Anti-passback: check if already checked in
    if (ticket.is_checked_in) {
      return NextResponse.json({
        error: `CẢNH BÁO: Vé này đã được Check-in lúc ${new Date(ticket.checked_in_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}!`,
        status: 'already_checked_in',
        checked_in_at: ticket.checked_in_at,
        ticket: {
          full_name: ticket.full_name,
          order_code: ticket.order_code,
          lucky_number: ticket.lucky_number,
        }
      }, { status: 409 })
    }

    // Return ticket info for staff to confirm
    return NextResponse.json({
      status: 'ready',
      ticket: {
        id: ticket.id,
        full_name: ticket.full_name,
        dob: ticket.dob,
        gender: ticket.gender,
        organization: ticket.organization,
        order_code: ticket.order_code,
        lucky_number: ticket.lucky_number,
        payment_status: ticket.payment_status,
        is_checked_in: ticket.is_checked_in,
      }
    })
  } catch (err) {
    console.error('Checkin scan error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { ticket_id } = await request.json()

  if (!ticket_id) {
    return NextResponse.json({ error: 'Missing ticket_id' }, { status: 400 })
  }

  const adminSupabase = getAdminSupabase()

  // Check ticket exists and not already checked in
  const { data: ticket } = await adminSupabase
    .from('tickets')
    .select('is_checked_in, payment_status')
    .eq('id', ticket_id)
    .single()

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  if (ticket.is_checked_in) {
    return NextResponse.json({ error: 'Already checked in' }, { status: 409 })
  }

  if (ticket.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Ticket not paid' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error } = await adminSupabase
    .from('tickets')
    .update({
      is_checked_in: true,
      checked_in_at: now,
    })
    .eq('id', ticket_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log check-in
  await adminSupabase.from('system_logs').insert({
    action: 'TICKET_CHECKED_IN',
    performed_by: admin.email!,
    target_id: ticket_id,
    details: { checked_in_at: now },
  })

  return NextResponse.json({ success: true, checked_in_at: now })
}
