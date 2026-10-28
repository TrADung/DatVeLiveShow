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

// In-memory fallback cache in case Supabase schema hasn't been migrated yet
const localTicketStore: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, dob, gender, phone, organization, referral_source, feedback, user_email } = body

    // Validate required fields
    if (!full_name || !dob || !gender || !phone || !organization || !referral_source) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const email = (user_email || '').trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    const order_code = generateOrderCode()
    const ticket_id = crypto.randomUUID()
    const qr_secret_hash = generateQRHash(ticket_id, order_code)
    const amount = 89000

    // Cấp phát số may mắn 3 chữ số (000-999), đảm bảo ưu tiên có số 09 (9) và 24 (24)
    let existingLuckyNumbers: number[] = []
    const adminSupabase = getAdminSupabase()
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
      organization,
      referral_source,
      feedback: feedback || null,
      amount,
      payment_status: 'pending',
      is_email_sent: false,
      is_checked_in: false,
      lucky_number,
      qr_secret_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 1. Try saving with Admin Supabase Client (bypasses RLS safely on server)
    if (adminSupabase) {
      try {
        const { data, error } = await adminSupabase
          .from('tickets')
          .insert(newTicket)
          .select()
          .single()

        if (!error && data) {
          return NextResponse.json(data, { status: 201 })
        }
        if (error) console.error('Admin ticket insert error:', error)
      } catch (adminErr) {
        console.warn('Admin insert error:', adminErr)
      }
    }

    // 2. Fallback to standard Supabase client
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('tickets')
        .insert(newTicket)
        .select()
        .single()

      if (!error && data) {
        return NextResponse.json(data, { status: 201 })
      }
      if (error) {
        console.error('Supabase ticket insert error:', error)
      }
    } catch (clientErr) {
      console.error('Supabase ticket insert exception:', clientErr)
    }

    // Fallback store
    localTicketStore.unshift(newTicket)
    return NextResponse.json(newTicket, { status: 201 })
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
