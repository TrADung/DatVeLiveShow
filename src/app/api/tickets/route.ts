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

// In-memory fallback cache
const localTicketStore: any[] = []

// Upload proof image directly to Supabase Storage bucket 'payment-proofs' via Admin Client
async function uploadProofToStorage(
  adminSupabase: any,
  buffer: Buffer,
  mimeType: string,
  orderCode: string
): Promise<string | null> {
  if (!adminSupabase) return null
  try {
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const fileName = `${orderCode}-${Date.now()}.${ext}`

    const { error: upErr } = await adminSupabase.storage
      .from('payment-proofs')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (upErr) {
      console.error('Storage upload error in tickets/route:', upErr)
      return null
    }

    const { data } = adminSupabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName)

    return data?.publicUrl || null
  } catch (err) {
    console.error('Storage upload exception in tickets/route:', err)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let full_name = ''
    let dob = ''
    let gender = ''
    let phone = ''
    let organization = 'Tự do'
    let referral_source = ''
    let feedback: string | null = null
    let user_email = ''
    let custom_order_code = ''
    let payment_proof_url: string | null = null
    let proofFile: File | null = null
    let proofPreview = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      full_name = (formData.get('full_name') as string || '').trim()
      dob = (formData.get('dob') as string || '').trim()
      gender = (formData.get('gender') as string || '').trim()
      phone = (formData.get('phone') as string || '').trim()
      organization = (formData.get('organization') as string || 'Tự do').trim()
      referral_source = (formData.get('referral_source') as string || '').trim()
      feedback = (formData.get('feedback') as string || '').trim() || null
      user_email = (formData.get('user_email') as string || '').trim().toLowerCase()
      custom_order_code = (formData.get('order_code') as string || '').trim()
      proofFile = formData.get('file') as File | null
      proofPreview = (formData.get('proof_preview') as string || '').trim()
    } else {
      const body = await request.json()
      full_name = (body.full_name || '').trim()
      dob = (body.dob || '').trim()
      gender = (body.gender || '').trim()
      phone = (body.phone || '').trim()
      organization = (body.organization || 'Tự do').trim()
      referral_source = (body.referral_source || '').trim()
      feedback = body.feedback ? String(body.feedback).trim() : null
      user_email = (body.user_email || '').trim().toLowerCase()
      custom_order_code = (body.order_code || '').trim()
      payment_proof_url = body.payment_proof_url || null
    }

    // Validate required fields
    if (!full_name || !dob || !gender || !phone || !referral_source) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    // Validate ngày tháng năm sinh hợp lệ (khán giả >= 6 tuổi và không vượt quá năm hiện tại - 6)
    const birthDate = new Date(dob)
    const today = new Date()
    const birthYear = birthDate.getFullYear()
    const currentYear = today.getFullYear()
    if (isNaN(birthDate.getTime()) || birthDate > today || birthYear < 1930 || birthYear > currentYear - 6) {
      return NextResponse.json({
        error: `Ngày sinh không hợp lệ: Khán giả tham gia sự kiện phải từ 6 tuổi trở lên (sinh năm ${currentYear - 6} trở về trước).`
      }, { status: 400 })
    }

    const email = user_email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    const order_code = custom_order_code || generateOrderCode()
    const ticket_id = crypto.randomUUID()
    const qr_secret_hash = generateQRHash(ticket_id, order_code)
    const amount = 89000
    const adminSupabase = getAdminSupabase()

    // 1. Xử lý ảnh biên lai chuyển khoản và upload lên Supabase Storage
    if (proofFile) {
      const buffer = Buffer.from(await proofFile.arrayBuffer())
      const mimeType = proofFile.type || 'image/jpeg'
      const uploaded = await uploadProofToStorage(adminSupabase, buffer, mimeType, order_code)
      if (uploaded) {
        payment_proof_url = uploaded
      } else {
        // Fallback an toàn: nếu storage bucket gặp trục trặc, lưu dạng base64
        payment_proof_url = `data:${mimeType};base64,${buffer.toString('base64')}`
      }
    } else if (proofPreview && proofPreview.startsWith('data:')) {
      const matches = proofPreview.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        const mimeType = matches[1]
        const buffer = Buffer.from(matches[2], 'base64')
        const uploaded = await uploadProofToStorage(adminSupabase, buffer, mimeType, order_code)
        if (uploaded) {
          payment_proof_url = uploaded
        } else {
          payment_proof_url = proofPreview
        }
      } else {
        payment_proof_url = proofPreview
      }
    } else if (payment_proof_url && payment_proof_url.startsWith('data:')) {
      const matches = payment_proof_url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        const mimeType = matches[1]
        const buffer = Buffer.from(matches[2], 'base64')
        const uploaded = await uploadProofToStorage(adminSupabase, buffer, mimeType, order_code)
        if (uploaded) {
          payment_proof_url = uploaded
        }
      }
    }

    // CHÍNH SÁCH ĐẶT VÉ: CHỈ LƯU VÀO DATABASE KHI ĐÃ CHUYỂN KHOẢN VÀ CÓ BIÊN LAI
    if (!payment_proof_url) {
      return NextResponse.json({
        error: 'Vui lòng hoàn tất chuyển khoản và đính kèm ảnh biên lai giao dịch để lưu vé vào hệ thống!'
      }, { status: 400 })
    }

    // Cấp phát số may mắn 3 chữ số (000-999), ưu tiên 09 và 24
    let existingLuckyNumbers: number[] = []
    if (adminSupabase) {
      try {
        const { data: existingTickets } = await adminSupabase
          .from('tickets')
          .select('lucky_number')
        if (existingTickets) {
          existingLuckyNumbers = existingTickets
            .map((t) => t.lucky_number)
            .filter((n): n is number => typeof n === 'number' && !isNaN(n))
        }
      } catch (err) {
        console.warn('Error querying lucky numbers:', err)
      }
    }
    const lucky_number = generateLuckyNumber(existingLuckyNumbers)

    const newTicket = {
      id: ticket_id,
      order_code,
      user_email: email,
      full_name,
      dob,
      gender,
      phone,
      organization: (organization || 'Tự do').trim(),
      referral_source,
      feedback: feedback || null,
      amount,
      payment_proof_url,
      payment_status: 'pending',
      is_email_sent: false,
      is_checked_in: false,
      lucky_number,
      qr_secret_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 1. Lưu vào Database với Admin Supabase Client (bypasses RLS)
    if (adminSupabase) {
      try {
        const { data, error } = await adminSupabase
          .from('tickets')
          .insert(newTicket)
          .select()
          .single()

        if (!error && data) {
          return NextResponse.json({ ...data, ticket_id: data.id }, { status: 201 })
        }
        if (error) console.error('Admin ticket insert error:', error)
      } catch (adminErr) {
        console.warn('Admin insert error:', adminErr)
      }
    }

    // 2. Fallback standard client
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tickets')
        .insert(newTicket)
        .select()
        .single()

      if (!error && data) {
        return NextResponse.json({ ...data, ticket_id: data.id }, { status: 201 })
      }
    } catch (clientErr) {
      console.error('Supabase ticket insert exception:', clientErr)
    }

    // Fallback store
    localTicketStore.unshift(newTicket)
    return NextResponse.json({ ...newTicket, ticket_id: newTicket.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const emailParam = searchParams.get('email')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const targetEmail = (user?.email || emailParam || '').toLowerCase()

    try {
      let query = supabase.from('tickets').select('*').order('created_at', { ascending: false })
      if (targetEmail) {
        query = query.eq('user_email', targetEmail)
      }
      const { data, error } = await query
      if (!error && data && data.length > 0) {
        return NextResponse.json(data)
      }
    } catch {}

    // Fallback tickets
    if (targetEmail) {
      const filtered = localTicketStore.filter(t => t.user_email === targetEmail)
      return NextResponse.json(filtered.length > 0 ? filtered : localTicketStore)
    }

    return NextResponse.json(localTicketStore)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json([])
  }
}
