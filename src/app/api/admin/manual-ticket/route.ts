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

async function uploadProofToStorage(
  adminSupabase: any,
  buffer: Buffer,
  mimeType: string,
  orderCode: string
): Promise<string | null> {
  if (!adminSupabase) return null
  try {
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const fileName = `manual-${orderCode}-${Date.now()}.${ext}`

    const { error: upErr } = await adminSupabase.storage
      .from('payment-proofs')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (upErr) {
      console.error('Storage upload error (manual ticket):', upErr)
      return null
    }

    const { data } = adminSupabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName)

    return data?.publicUrl || null
  } catch (err) {
    console.error('Storage upload exception (manual ticket):', err)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const operator = await checkAdminOrDevRole(supabase)

    if (!operator) {
      return NextResponse.json(
        { error: 'Forbidden: Bạn không có quyền Dev hoặc Admin để tạo vé thủ công.' },
        { status: 403 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    let full_name = ''
    let user_email = ''
    let phone = ''
    let dob = ''
    let gender = 'Nam'
    let organization = 'Tự do'
    let referral_source = 'Tạo thủ công bởi Dev'
    let feedback = ''
    let order_code = ''
    let amount = 89000
    let payment_status = 'paid'
    let lucky_number_input: string | number | null = null
    let proofFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData()
      full_name = (fd.get('full_name') as string || '').trim()
      user_email = (fd.get('user_email') as string || '').trim().toLowerCase()
      phone = (fd.get('phone') as string || '').trim()
      dob = (fd.get('dob') as string || '').trim()
      gender = (fd.get('gender') as string || 'Nam').trim()
      organization = (fd.get('organization') as string || 'Tự do').trim()
      referral_source = (fd.get('referral_source') as string || 'Tạo thủ công bởi Dev').trim()
      feedback = (fd.get('feedback') as string || '').trim()
      order_code = (fd.get('order_code') as string || '').trim().toUpperCase()
      amount = parseInt(fd.get('amount') as string, 10) || 89000
      payment_status = (fd.get('payment_status') as string || 'paid').trim()
      lucky_number_input = fd.get('lucky_number') as string | null
      proofFile = fd.get('file') as File | null
    } else {
      const body = await request.json()
      full_name = (body.full_name || '').trim()
      user_email = (body.user_email || '').trim().toLowerCase()
      phone = (body.phone || '').trim()
      dob = (body.dob || '').trim()
      gender = (body.gender || 'Nam').trim()
      organization = (body.organization || 'Tự do').trim()
      referral_source = (body.referral_source || 'Tạo thủ công bởi Dev').trim()
      feedback = (body.feedback || '').trim()
      order_code = (body.order_code || '').trim().toUpperCase()
      amount = typeof body.amount === 'number' ? body.amount : parseInt(body.amount, 10) || 89000
      payment_status = (body.payment_status || 'paid').trim()
      lucky_number_input = body.lucky_number
    }

    // Validation cơ bản
    if (!full_name) {
      return NextResponse.json({ error: 'Vui lòng nhập họ và tên khách hàng' }, { status: 400 })
    }
    if (!user_email || !user_email.includes('@')) {
      return NextResponse.json({ error: 'Địa chỉ email nhận vé không hợp lệ' }, { status: 400 })
    }
    if (!phone) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại khách hàng' }, { status: 400 })
    }
    if (!dob) {
      return NextResponse.json({ error: 'Vui lòng chọn ngày tháng năm sinh' }, { status: 400 })
    }

    // Kiểm tra định dạng giới tính hợp lệ theo database check constraint ('Nam', 'Nu', 'Khac')
    if (!['Nam', 'Nu', 'Khac'].includes(gender)) {
      if (gender === 'Nữ' || gender === 'nu') gender = 'Nu'
      else if (gender === 'Khác') gender = 'Khac'
      else gender = 'Nam'
    }

    const adminSupabase = getAdminSupabase()
    const dbClient = adminSupabase || supabase

    // 1. Xử lý mã đơn hàng (order_code)
    if (!order_code) {
      order_code = generateOrderCode()
    } else {
      // Đảm bảo không trùng order_code đã có
      const { data: existingOrder } = await dbClient
        .from('tickets')
        .select('id')
        .eq('order_code', order_code)
        .maybeSingle()

      if (existingOrder) {
        order_code = `${order_code}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`
      }
    }

    // 2. Xử lý số may mắn (lucky_number)
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

    let finalLuckyNumber: number
    if (lucky_number_input !== null && lucky_number_input !== undefined && String(lucky_number_input).trim() !== '') {
      const parsedNum = parseInt(String(lucky_number_input), 10)
      if (isNaN(parsedNum) || parsedNum < 0 || parsedNum > 999) {
        return NextResponse.json(
          { error: 'Số may mắn chỉ định phải là số từ 000 đến 999' },
          { status: 400 }
        )
      }
      if (existingLuckyNumbers.includes(parsedNum)) {
        return NextResponse.json(
          { error: `Số may mắn #${String(parsedNum).padStart(3, '0')} đã được cấp cho một vé khác. Vui lòng chọn số khác hoặc để trống để hệ thống tự cấp!` },
          { status: 400 }
        )
      }
      finalLuckyNumber = parsedNum
    } else {
      finalLuckyNumber = generateLuckyNumber(existingLuckyNumbers)
    }

    // 3. Xử lý biên lai đối chiếu
    let payment_proof_url: string | null = null
    if (proofFile) {
      const buffer = Buffer.from(await proofFile.arrayBuffer())
      const mimeType = proofFile.type || 'image/jpeg'
      const uploaded = await uploadProofToStorage(adminSupabase, buffer, mimeType, order_code)
      if (uploaded) {
        payment_proof_url = uploaded
      } else {
        payment_proof_url = `data:${mimeType};base64,${buffer.toString('base64')}`
      }
    }

    // 4. Sinh UUID và QR Check-in Secret Hash
    const ticket_id = crypto.randomUUID()
    const qr_secret_hash = generateQRHash(ticket_id, order_code)

    const finalFeedback = [
      feedback ? `Ghi chú Dev: ${feedback}` : 'Tạo vé thủ công bởi Dev',
      `Người tạo: ${operator.email} (${new Date().toLocaleString('vi-VN')})`
    ].filter(Boolean).join(' • ')

    const newTicket = {
      id: ticket_id,
      order_code,
      user_email,
      full_name,
      dob,
      gender,
      phone,
      organization,
      referral_source,
      feedback: finalFeedback,
      amount,
      payment_proof_url,
      payment_status: payment_status === 'paid' ? 'paid' : 'pending',
      is_email_sent: false,
      is_checked_in: false,
      lucky_number: finalLuckyNumber,
      qr_secret_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      verified_by: payment_status === 'paid' ? operator.email : null,
      verified_at: payment_status === 'paid' ? new Date().toISOString() : null,
    }

    const { data, error } = await dbClient
      .from('tickets')
      .insert(newTicket)
      .select()
      .single()

    if (error) {
      console.error('Lỗi insert manual ticket:', error)
      return NextResponse.json({ error: error.message || 'Lỗi khi lưu vé vào cơ sở dữ liệu' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      ticket: data,
      message: `Tạo vé thủ công thành công cho khách hàng ${full_name}! Số may mắn: #${String(finalLuckyNumber).padStart(3, '0')}, Mã đơn: ${order_code}`
    }, { status: 201 })
  } catch (err: any) {
    console.error('Exception in manual-ticket API:', err)
    return NextResponse.json({ error: err?.message || 'Lỗi máy chủ khi tạo vé' }, { status: 500 })
  }
}
