import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { generateOrderCode, generateQRHash, generateLuckyNumber } from '@/lib/utils'

function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey.includes('placeholder')) return null
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdminOrDevRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return null
  const email = user.email.toLowerCase().trim()

  if (email === 'trananhdung11102006@gmail.com') return user

  try {
    const { data: roleData } = await supabase
      .from('users_role')
      .select('role')
      .eq('email', email)
      .single()

    if (roleData && ['admin', 'dev'].includes(roleData.role)) {
      return user
    }
  } catch {}

  return null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const operator = await checkAdminOrDevRole(supabase)

    if (!operator) {
      return NextResponse.json(
        { error: 'Forbidden: Bạn không có quyền Admin/Dev để tạo vé bán offline.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const quantity = parseInt(String(body.quantity || 1), 10)
    const paymentMethod = body.paymentMethod || 'Tiền mặt'
    const note = (body.note || '').trim()

    if (isNaN(quantity) || quantity < 1 || quantity > 200) {
      return NextResponse.json(
        { error: 'Số lượng vé mua offline phải từ 1 đến 200 vé mỗi lần.' },
        { status: 400 }
      )
    }

    const adminSupabase = getAdminSupabase()
    const dbClient = adminSupabase || supabase

    // 1. Lấy giá vé hiện hành từ cấu hình site_settings
    let ticketPrice = 89000
    try {
      const { data: priceSetting } = await dbClient
        .from('site_settings')
        .select('value')
        .eq('key', 'ticket_price')
        .single()
      if (priceSetting?.value) {
        const parsed = parseInt(priceSetting.value, 10)
        if (!isNaN(parsed) && parsed > 0) ticketPrice = parsed
      }
    } catch {}

    // 2. Lấy danh sách số may mắn đã cấp để không bao giờ bị trùng
    let existingLuckyNumbers: number[] = []
    try {
      const { data: existingTickets } = await dbClient
        .from('tickets')
        .select('lucky_number')
      if (existingTickets) {
        existingLuckyNumbers = existingTickets
          .map((t) => t.lucky_number)
          .filter((n): n is number => typeof n === 'number' && !isNaN(n))
      }
    } catch (err) {
      console.warn('Lỗi query existing lucky numbers:', err)
    }

    // 3. Tạo danh sách N vé offline đã thanh toán & đã check-in đeo vòng
    const now = new Date().toISOString()
    const newTickets: any[] = []

    for (let i = 1; i <= quantity; i++) {
      const ticketId = crypto.randomUUID()
      // Mã đơn offline ngắn gọn dễ đối chiếu
      const orderCode = `OFF-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
      const luckyNumber = generateLuckyNumber(existingLuckyNumbers)
      existingLuckyNumbers.push(luckyNumber)
      const qrSecretHash = generateQRHash(ticketId, orderCode)

      newTickets.push({
        id: ticketId,
        order_code: orderCode,
        user_email: 'offline@dtuacoustic.club',
        full_name: quantity === 1 ? 'Khách mua tại quầy' : `Khách mua tại quầy (${i}/${quantity})`,
        dob: '2004-01-01',
        gender: 'Nam',
        phone: '0000000000',
        organization: 'Tại quầy check-in',
        referral_source: 'Bán vé offline tại quầy',
        feedback: `Bán offline • ${paymentMethod}${note ? ' • ' + note : ''} • Nhân viên: ${operator.email}`,
        amount: ticketPrice,
        payment_proof_url: null,
        payment_status: 'paid',
        is_email_sent: true,
        is_checked_in: true, // Đã đeo vòng tay vào cổng ngay lập tức!
        checked_in_at: now,
        lucky_number: luckyNumber,
        qr_secret_hash: qrSecretHash,
        created_at: now,
        updated_at: now,
        verified_by: operator.email,
        verified_at: now,
      })
    }

    // 4. Lưu vào Supabase Database
    const { data, error } = await dbClient
      .from('tickets')
      .insert(newTickets)
      .select()

    if (error) {
      console.error('Lỗi insert offline tickets:', error)
      return NextResponse.json(
        { error: error.message || 'Lỗi khi lưu vé offline vào cơ sở dữ liệu' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: quantity,
      totalAmount: quantity * ticketPrice,
      message: `Đã tạo thành công ${quantity} vé offline! Doanh thu ghi nhận: ${(quantity * ticketPrice).toLocaleString('vi-VN')}đ. Khách đã được xác nhận check-in vào cổng.`,
      tickets: data,
    }, { status: 201 })
  } catch (err: any) {
    console.error('Exception in offline-tickets route:', err)
    return NextResponse.json({ error: err?.message || 'Lỗi máy chủ' }, { status: 500 })
  }
}
