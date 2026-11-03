import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'
import { EVENT_INFO } from '@/lib/constants'
import { generateOrderCode, generateQRHash, generateLuckyNumber } from '@/lib/utils'
import { compileGuestEmailHtml, GuestTicketInfo } from '@/lib/guestEmailTemplate'

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
        { error: 'Forbidden: Bạn không có quyền Admin/Dev để gửi mail khách mời.' },
        { status: 403 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    let guestName = ''
    let targetType: 'Thư Mời' | 'Thư Ngỏ' | 'Cá Nhân' = 'Thư Mời'
    let emailsInput = ''
    let emailSubject = ''
    let customMessage = ''
    let ticketCount = 2
    let cardFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData()
      guestName = (fd.get('guest_name') as string || '').trim()
      targetType = (fd.get('target_type') as any || 'Thư Mời')
      emailsInput = (fd.get('emails') as string || '').trim()
      emailSubject = (fd.get('subject') as string || '').trim()
      customMessage = (fd.get('custom_message') as string || '').trim()
      ticketCount = parseInt(fd.get('ticket_count') as string || '0', 10)
      cardFile = fd.get('card_file') as File | null
    } else {
      const body = await request.json()
      guestName = (body.guest_name || '').trim()
      targetType = body.target_type || 'Thư Mời'
      emailsInput = (body.emails || '').trim()
      emailSubject = (body.subject || '').trim()
      customMessage = (body.custom_message || '').trim()
      ticketCount = typeof body.ticket_count === 'number' ? body.ticket_count : parseInt(body.ticket_count || '0', 10)
    }

    if (!guestName) {
      return NextResponse.json({ error: 'Vui lòng nhập tên đơn vị khách mời hoặc cá nhân.' }, { status: 400 })
    }

    // Nếu là Thư Ngỏ thì bắt buộc ticketCount = 0
    if (targetType === 'Thư Ngỏ') {
      ticketCount = 0
    }

    // Tách danh sách email (hỗ trợ dấu phẩy, chấm phẩy, xuống dòng)
    const emailList = emailsInput
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes('@'))

    if (emailList.length === 0) {
      return NextResponse.json({ error: 'Vui lòng nhập ít nhất một địa chỉ email hợp lệ.' }, { status: 400 })
    }

    // Với Thư mời hoặc Cá nhân có vé tặng, chỉ gửi tới 1 địa chỉ email đại diện
    if (ticketCount > 0 && emailList.length > 1) {
      return NextResponse.json({
        error: 'Đối với Thư Mời / Cá Nhân có vé tặng kèm mã QR, vui lòng chỉ nhập 1 địa chỉ email nhận vé cho mỗi lần gửi.'
      }, { status: 400 })
    }

    const adminSupabase = getAdminSupabase()
    const dbClient = adminSupabase || supabase

    // 1. Lấy thông tin SMTP từ site_settings
    const { data: settings } = await dbClient
      .from('site_settings')
      .select('key, value')
      .in('key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'event_name'])

    const settingsMap: Record<string, string> = {}
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value })

    const smtpUser = settingsMap.smtp_user || process.env.SMTP_USER
    const smtpPass = settingsMap.smtp_pass || process.env.SMTP_PASS

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({
        error: 'Chưa cấu hình tài khoản gửi Gmail SMTP. Vui lòng vào trang Quản trị Dev (/dev) để cập nhật Gmail và Mật khẩu ứng dụng.'
      }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: settingsMap.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(settingsMap.smtp_port || process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    })

    // 2. Chuẩn bị ảnh banner ticket.png
    const bannerPngPath = path.join(process.cwd(), 'public', 'images', 'EmailForm', 'ticket.png')
    const bannerExists = fs.existsSync(bannerPngPath)

    // 3. Chuẩn bị ảnh thiệp mời (nếu có upload file hoặc dùng file mẫu)
    let cardBuffer: Buffer | null = null
    let cardMime = 'image/jpeg'
    let cardCid = ''

    if (cardFile) {
      cardBuffer = Buffer.from(await cardFile.arrayBuffer())
      cardMime = cardFile.type || 'image/jpeg'
      cardCid = 'guest_invitation_card'
    } else {
      // Dùng ảnh thiệp mẫu có sẵn trong public nếu tồn tại
      const samplePath = path.join(process.cwd(), 'public', 'images', 'EmailForm', 'guest_invitation_sample.png')
      if (fs.existsSync(samplePath)) {
        cardBuffer = fs.readFileSync(samplePath)
        cardMime = 'image/png'
        cardCid = 'guest_invitation_card'
      }
    }

    // Tiêu đề email hoàn chỉnh
    const finalSubject = (emailSubject || `[THƯ MỜI] DTU Acoustic Club Trân Trọng Kính Mời ${guestName} Tham Dự Liveshow SẮC I. VÁN CỜ`)
      .replace(/{{guest_name}}/g, guestName)

    let createdTickets: any[] = []

    // 4. Nếu có vé tặng (Thư Mời / Cá Nhân): Tạo vé trong bảng tickets & sinh QR
    if (ticketCount > 0) {
      const recipientEmail = emailList[0]

      // Lấy danh sách số may mắn hiện có
      let existingLuckyNumbers: number[] = []
      try {
        const { data: existing } = await dbClient.from('tickets').select('lucky_number')
        if (existing) {
          existingLuckyNumbers = existing
            .map((t) => t.lucky_number)
            .filter((n): n is number => typeof n === 'number' && !isNaN(n))
        }
      } catch {}

      const now = new Date().toISOString()
      const newTickets: any[] = []
      const guestTicketsInfo: GuestTicketInfo[] = []
      const qrAttachments: any[] = []

      for (let i = 1; i <= ticketCount; i++) {
        const ticketId = crypto.randomUUID()
        const orderCode = `INV-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
        const luckyNumber = generateLuckyNumber(existingLuckyNumbers)
        existingLuckyNumbers.push(luckyNumber)
        const qrSecretHash = generateQRHash(ticketId, orderCode)

        newTickets.push({
          id: ticketId,
          order_code: orderCode,
          user_email: recipientEmail,
          full_name: ticketCount === 1 ? guestName : `${guestName} (Vé ${i}/${ticketCount})`,
          dob: '2004-01-01',
          gender: 'Khac',
          phone: '0000000000',
          organization: guestName,
          referral_source: `Khách mời (${targetType})`,
          feedback: `Thư mời trao tặng bởi BTC • Gửi bởi: ${operator.email}`,
          amount: 0, // VÉ TẶNG: TUYỆT ĐỐI KHÔNG TÍNH DOANH THU
          payment_proof_url: null,
          payment_status: 'paid', // ĐÃ DUYỆT SẴN ĐỂ ĐƯỢC CHECK-IN TẠI CỔNG
          is_email_sent: true,
          is_checked_in: false,
          lucky_number: luckyNumber,
          qr_secret_hash: qrSecretHash,
          created_at: now,
          updated_at: now,
          verified_by: operator.email,
          verified_at: now,
        })

        // Sinh mã QR Buffer cho check-in
        const qrData = JSON.stringify({
          id: ticketId,
          order_code: orderCode,
          hash: qrSecretHash,
        })
        const qrBuffer = await QRCode.toBuffer(qrData, {
          width: 300,
          margin: 2,
          color: { dark: '#121212', light: '#FFFFFF' },
        })

        const qrCid = `guest_qr_${i}`
        guestTicketsInfo.push({
          order_code: orderCode,
          lucky_number: luckyNumber,
          qr_cid: qrCid,
        })

        qrAttachments.push({
          filename: `qr-${orderCode}.png`,
          content: qrBuffer,
          cid: qrCid,
        })
      }

      // Lưu vé vào DB
      const { data: inserted, error: insertErr } = await dbClient
        .from('tickets')
        .insert(newTickets)
        .select()

      if (insertErr) {
        console.error('Lỗi insert guest tickets:', insertErr)
        return NextResponse.json({ error: 'Không thể lưu vé mời vào hệ thống: ' + insertErr.message }, { status: 500 })
      }
      createdTickets = inserted || []

      // Biên dịch HTML email hoàn chỉnh
      const emailHtml = compileGuestEmailHtml({
        guestName,
        targetType,
        customMessage,
        tickets: guestTicketsInfo,
        invitationImageCid: cardCid || undefined,
      })

      // Chuẩn bị danh sách attachment đính kèm
      const attachments: any[] = [...qrAttachments]
      if (bannerExists) {
        attachments.push({
          filename: 'ticket.png',
          path: bannerPngPath,
          cid: 'ticketbanner',
        })
      }
      if (cardBuffer && cardCid) {
        attachments.push({
          filename: 'invitation-card.png',
          content: cardBuffer,
          cid: cardCid,
        })
      }

      // Gửi email
      await transporter.sendMail({
        from: `CLB DTU Acoustic <${smtpUser}>`,
        to: recipientEmail,
        subject: finalSubject,
        html: emailHtml,
        attachments,
      })

      return NextResponse.json({
        success: true,
        sentCount: 1,
        ticketCount,
        tickets: createdTickets,
        message: `Đã gửi thư mời thành công đến ${recipientEmail}! Đã cấp ${ticketCount} vé check-in kèm mã QR và Số may mắn riêng biệt.`
      })
    } else {
      // 5. Thư Ngỏ (0 vé tặng): Gửi thư ngỏ trang trọng (có thể gửi nhiều email)
      const emailHtml = compileGuestEmailHtml({
        guestName,
        targetType: 'Thư Ngỏ',
        customMessage,
        tickets: [],
        invitationImageCid: cardCid || undefined,
      })

      const attachments: any[] = []
      if (bannerExists) {
        attachments.push({
          filename: 'ticket.png',
          path: bannerPngPath,
          cid: 'ticketbanner',
        })
      }
      if (cardBuffer && cardCid) {
        attachments.push({
          filename: 'invitation-card.png',
          content: cardBuffer,
          cid: cardCid,
        })
      }

      let sentCount = 0
      const sendErrors: string[] = []

      for (const targetEmail of emailList) {
        try {
          await transporter.sendMail({
            from: `CLB DTU Acoustic <${smtpUser}>`,
            to: targetEmail,
            subject: finalSubject,
            html: emailHtml,
            attachments,
          })
          sentCount++
        } catch (err: any) {
          sendErrors.push(`${targetEmail}: ${err?.message || 'Lỗi gửi'}`)
        }
      }

      if (sentCount === 0 && sendErrors.length > 0) {
        return NextResponse.json({
          error: `Không thể gửi email thư ngỏ: ${sendErrors.join('; ')}`
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        sentCount,
        total: emailList.length,
        message: `Đã gửi thành công ${sentCount}/${emailList.length} thư ngỏ tới danh sách khách mời!`
      })
    }
  } catch (err: any) {
    console.error('Exception in send-guest-email:', err)
    return NextResponse.json({ error: err?.message || 'Lỗi máy chủ khi gửi thư mời' }, { status: 500 })
  }
}
