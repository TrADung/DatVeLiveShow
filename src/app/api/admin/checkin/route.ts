import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verifyQRHash } from '@/lib/utils'

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

async function checkAdminRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return null
  const email = user.email.toLowerCase().trim()
  if (email === 'trananhdung11102006@gmail.com') {
    return user
  }
  try {
    const { data } = await supabase.from('users_role').select('role').eq('email', email).single()
    if (data && ['admin', 'dev'].includes(data.role)) return user
  } catch {}
  return null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Yêu cầu quyền quản trị viên' }, { status: 403 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dữ liệu yêu cầu không hợp lệ' }, { status: 400 })
  }

  // Support multiple payload keys: qr_data, code, order_code, ticket_id
  const rawInput = body.qr_data || body.code || body.order_code || body.ticket_id || ''

  if (!rawInput && !body.ticket_id) {
    return NextResponse.json({ error: 'Không nhận được dữ liệu mã vé hoặc QR' }, { status: 400 })
  }

  const adminSupabase = getAdminSupabase()
  const dbClient = adminSupabase || supabase

  let ticketId = body.ticket_id || ''
  let orderCode = body.order_code || ''
  let qrHash = body.hash || ''

  // Attempt to parse rawInput as JSON if it's formatted as JSON
  if (typeof rawInput === 'string' && rawInput.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawInput.trim())
      if (parsed.id) ticketId = parsed.id
      if (parsed.order_code) orderCode = parsed.order_code
      if (parsed.hash) qrHash = parsed.hash
    } catch {
      // Not JSON, continue with rawInput
    }
  } else if (typeof rawInput === 'string' && rawInput.trim()) {
    const trimmed = rawInput.trim().toUpperCase()
    if (trimmed.startsWith('CLB-') || trimmed.length <= 15) {
      orderCode = trimmed
    } else if (trimmed.includes('-') && trimmed.length >= 30) {
      // Looks like a UUID
      ticketId = rawInput.trim()
    } else {
      orderCode = trimmed
    }
  }

  // Look up ticket
  let ticket: any = null
  let fetchError: any = null

  if (ticketId && orderCode) {
    const res = await dbClient
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('order_code', orderCode)
      .single()
    ticket = res.data
    fetchError = res.error
  } else if (orderCode) {
    const res = await dbClient
      .from('tickets')
      .select('*')
      .ilike('order_code', orderCode)
      .single()
    ticket = res.data
    fetchError = res.error
  } else if (ticketId) {
    const res = await dbClient
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()
    ticket = res.data
    fetchError = res.error
  }

  if (fetchError || !ticket) {
    return NextResponse.json({ 
      error: `Không tìm thấy thông tin vé (${orderCode || ticketId || 'Mã không xác định'}) trong hệ thống!`,
      status: 'not_found' 
    }, { status: 404 })
  }

  // If a hash is provided, verify against the secret
  if (qrHash) {
    const isValidHash = (ticket.qr_secret_hash && ticket.qr_secret_hash === qrHash) || 
                        verifyQRHash(ticket.id, ticket.order_code, qrHash)
    if (!isValidHash) {
      return NextResponse.json({ 
        error: 'Mã QR không hợp lệ hoặc đã bị can thiệp/giả mạo!',
        status: 'invalid_qr'
      }, { status: 400 })
    }
  }

  // Check payment status
  if (ticket.payment_status !== 'paid') {
    return NextResponse.json({
      error: 'Vé này CHƯA THANH TOÁN hoặc chưa được xác nhận!',
      status: 'not_paid',
      ticket: {
        id: ticket.id,
        full_name: ticket.full_name,
        order_code: ticket.order_code,
        payment_status: ticket.payment_status,
      }
    }, { status: 400 })
  }

  // Anti-passback: Check if already checked in
  if (ticket.is_checked_in) {
    const checkinTime = ticket.checked_in_at 
      ? new Date(ticket.checked_in_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : 'trước đó'
    return NextResponse.json({
      error: `CẢNH BÁO: Vé này ĐÃ ĐƯỢC CHECK-IN lúc ${checkinTime}!`,
      status: 'already_checked_in',
      checked_in_at: ticket.checked_in_at,
      ticket: {
        id: ticket.id,
        full_name: ticket.full_name,
        dob: ticket.dob,
        gender: ticket.gender,
        organization: ticket.organization,
        order_code: ticket.order_code,
        lucky_number: ticket.lucky_number,
        payment_status: ticket.payment_status,
        is_checked_in: true,
      }
    }, { status: 409 })
  }

  // AUTOMATIC CHECK-IN: Directly update database on scan!
  const now = new Date().toISOString()
  const { error: updateErr } = await dbClient
    .from('tickets')
    .update({
      is_checked_in: true,
      checked_in_at: now,
    })
    .eq('id', ticket.id)

  if (updateErr) {
    console.error('Checkin DB update error:', updateErr)
    return NextResponse.json({
      error: 'Lỗi khi cập nhật check-in vào cơ sở dữ liệu: ' + updateErr.message,
      status: 'error',
    }, { status: 500 })
  }

  try {
    await dbClient.from('system_logs').insert({
      action: 'TICKET_CHECKED_IN',
      performed_by: admin.email!,
      target_id: ticket.id,
      details: { order_code: ticket.order_code, checked_in_at: now },
    })
  } catch (logErr) {
    console.warn('Could not write system_log:', logErr)
  }

  // Return success result
  return NextResponse.json({
    status: 'success',
    message: 'Check-in thành công!',
    checked_in_at: now,
    ticket: {
      id: ticket.id,
      full_name: ticket.full_name,
      dob: ticket.dob,
      gender: ticket.gender,
      organization: ticket.organization,
      order_code: ticket.order_code,
      lucky_number: ticket.lucky_number,
      payment_status: ticket.payment_status,
      is_checked_in: true,
    }
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Yêu cầu quyền quản trị viên' }, { status: 403 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  const ticketId = body.ticket_id
  const orderCode = body.order_code
  // Allow toggling or undoing check-in if action is 'uncheck'
  const action = body.action || 'checkin'

  if (!ticketId && !orderCode) {
    return NextResponse.json({ error: 'Missing ticket_id or order_code' }, { status: 400 })
  }

  const adminSupabase = getAdminSupabase()
  const dbClient = adminSupabase || supabase

  let query = dbClient.from('tickets').select('id, full_name, order_code, is_checked_in, payment_status')
  if (ticketId) {
    query = query.eq('id', ticketId)
  } else {
    query = query.eq('order_code', orderCode)
  }
  const { data: ticket, error: fetchErr } = await query.single()

  if (fetchErr || !ticket) {
    return NextResponse.json({ error: 'Không tìm thấy vé trong hệ thống' }, { status: 404 })
  }

  if (action === 'uncheck') {
    const { error: uncheckErr } = await dbClient
      .from('tickets')
      .update({
        is_checked_in: false,
        checked_in_at: null,
      })
      .eq('id', ticket.id)

    if (uncheckErr) {
      return NextResponse.json({ error: uncheckErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, is_checked_in: false, order_code: ticket.order_code })
  }

  if (ticket.is_checked_in) {
    return NextResponse.json({ error: 'Vé đã được check-in trước đó' }, { status: 409 })
  }

  if (ticket.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Vé chưa thanh toán' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error: updateErr } = await dbClient
    .from('tickets')
    .update({
      is_checked_in: true,
      checked_in_at: now,
    })
    .eq('id', ticket.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  try {
    await dbClient.from('system_logs').insert({
      action: 'TICKET_CHECKED_IN',
      performed_by: admin.email!,
      target_id: ticket.id,
      details: { order_code: ticket.order_code, checked_in_at: now },
    })
  } catch (logErr) {
    console.warn('Could not write system_log:', logErr)
  }

  return NextResponse.json({ success: true, is_checked_in: true, checked_in_at: now, order_code: ticket.order_code })
}
