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

// Upload buffer/file to Supabase Storage using Admin Client (bypassing RLS)
async function uploadToStorage(adminSupabase: any, buffer: Buffer, mimeType: string, prefix: string): Promise<string | null> {
  if (!adminSupabase) return null
  try {
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const fileName = `${prefix}-${Date.now()}.${ext}`

    const { error: upErr } = await adminSupabase.storage
      .from('payment-proofs')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (upErr) {
      console.error('Storage upload error:', upErr)
      return null
    }

    const { data } = adminSupabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName)

    return data?.publicUrl || null
  } catch (err) {
    console.error('Exception uploading to storage:', err)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const ticketId = formData.get('ticket_id') as string | null
    const file = formData.get('file') as File | null

    if (!ticketId || !file) {
      return NextResponse.json({ error: 'Thiếu thông tin file hoặc ticket_id' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminSupabase = getAdminSupabase()
    const db = adminSupabase || supabase

    // Verify ticket
    const { data: ticket, error: fetchError } = await db
      .from('tickets')
      .select('id, order_code, user_email, payment_status')
      .eq('id', ticketId)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Không tìm thấy vé' }, { status: 404 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type || 'image/jpeg'
    const publicUrl = await uploadToStorage(adminSupabase, buffer, mimeType, ticket.order_code || ticketId)
    // Fallback: nếu upload bucket lỗi, lưu thẳng data base64 để không làm mất bill của khách
    const finalProofUrl = publicUrl || `data:${mimeType};base64,${buffer.toString('base64')}`

    const { error: updateError } = await db
      .from('tickets')
      .update({ payment_proof_url: finalProofUrl })
      .eq('id', ticketId)

    if (updateError) {
      console.error('DB update error:', updateError)
      return NextResponse.json({ error: 'Lỗi cập nhật vé trong cơ sở dữ liệu' }, { status: 500 })
    }

    return NextResponse.json({ success: true, payment_proof_url: publicUrl })
  } catch (error) {
    console.error('POST /api/tickets/proof error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
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
      .select('id, order_code, user_email, payment_status')
      .eq('id', ticket_id)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json({ success: true, message: 'Proof received' })
    }

    // If authenticated, ensure user can only update their own ticket
    if (user && ticket.user_email !== user.email) {
      return NextResponse.json({ error: 'Không có quyền cập nhật vé này' }, { status: 403 })
    }

    let finalUrl = payment_proof_url

    // If the client passed a base64 string, upload it directly to Supabase Storage!
    if (payment_proof_url.startsWith('data:')) {
      const matches = payment_proof_url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        const mimeType = matches[1]
        const buffer = Buffer.from(matches[2], 'base64')
        const uploadedUrl = await uploadToStorage(adminSupabase, buffer, mimeType, ticket.order_code || ticket_id)
        if (uploadedUrl) {
          finalUrl = uploadedUrl
        }
      }
    }

    const { error: updateError } = await db
      .from('tickets')
      .update({ payment_proof_url: finalUrl })
      .eq('id', ticket_id)

    if (updateError) {
      console.warn('Error updating proof in Supabase:', updateError)
    }

    return NextResponse.json({ success: true, payment_proof_url: finalUrl })
  } catch (error) {
    console.error('Error updating proof:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
