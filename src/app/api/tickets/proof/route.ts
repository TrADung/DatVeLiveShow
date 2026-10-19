import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticket_id, payment_proof_url } = await request.json()

    if (!ticket_id || !payment_proof_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify ticket belongs to user
    const { data: ticket } = await supabase
      .from('tickets')
      .select('user_email, payment_status')
      .eq('id', ticket_id)
      .single()

    if (!ticket || ticket.user_email !== user.email) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.payment_status !== 'pending') {
      return NextResponse.json({ error: 'Ticket already processed' }, { status: 400 })
    }

    const { error } = await supabase
      .from('tickets')
      .update({ payment_proof_url })
      .eq('id', ticket_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating proof:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
