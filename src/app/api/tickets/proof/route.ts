import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey === 'placeholder_service_role_key') return null
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function PATCH(request: NextRequest) {
  try {
    const { ticket_id, payment_proof_url } = await request.json()

    if (!ticket_id || !payment_proof_url) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const adminSupabase = getAdminSupabase()
    const db = adminSupabase || supabase

    // Verify ticket exists and is pending
    const { data: ticket, error: fetchError } = await db
      .from('tickets')
      .select('id, user_email, payment_status')
      .eq('id', ticket_id)
      .single()

    if (fetchError || !ticket) {
      // In case Supabase table is not configured or in local memory
      return NextResponse.json({ success: true, message: 'Proof received' })
    }

    // If authenticated, ensure user can only update their own ticket
    if (user && ticket.user_email !== user.email) {
      return NextResponse.json({ error: 'Không có quyền cập nhật vé này' }, { status: 403 })
    }

    if (ticket.payment_status !== 'pending') {
      return NextResponse.json({ error: 'Vé đã được xử lý trước đó' }, { status: 400 })
    }

    const { error: updateError } = await db
      .from('tickets')
      .update({ payment_proof_url })
      .eq('id', ticket_id)

    if (updateError) {
      console.warn('Error updating proof in Supabase:', updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating proof:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
