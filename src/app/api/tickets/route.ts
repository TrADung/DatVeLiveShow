import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOrderCode, generateQRHash } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, dob, gender, phone, organization, referral_source, feedback, user_email } = body

    // Validate required fields
    if (!full_name || !dob || !gender || !phone || !organization || !referral_source) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    // Verify email matches auth user
    if (user_email !== user.email) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 403 })
    }

    // Check if user already has a pending/paid ticket
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id, payment_status')
      .eq('user_email', user.email)
      .in('payment_status', ['pending', 'paid'])
      .single()

    if (existingTicket) {
      return NextResponse.json({ 
        error: 'Bạn đã có vé đang chờ xử lý hoặc đã thanh toán' 
      }, { status: 400 })
    }

    // Get existing lucky numbers to avoid duplicates
    const { data: existingNumbers } = await supabase
      .from('tickets')
      .select('lucky_number')
      .not('lucky_number', 'is', null)

    const usedNumbers = existingNumbers?.map(t => t.lucky_number).filter(Boolean) as number[] || []

    // Generate unique values
    const order_code = generateOrderCode()
    const lucky_number = generateLuckyNumber(usedNumbers)
    const ticket_id = crypto.randomUUID()
    const qr_secret_hash = generateQRHash(ticket_id, order_code)

    // Get ticket price from settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'ticket_price')
      .single()

    const amount = parseInt(settings?.value || '150000')

    // Create ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        id: ticket_id,
        order_code,
        user_email: user.email,
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
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại' }, { status: 500 })
  }
}

function generateLuckyNumber(existingNumbers: number[]): number {
  let num: number
  do {
    num = Math.floor(1000 + Math.random() * 9000)
  } while (existingNumbers.includes(num))
  return num
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
