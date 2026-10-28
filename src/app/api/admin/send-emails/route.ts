import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import { EVENT_INFO } from '@/lib/constants'
import { DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_TEMPLATE, compileEmailSubject, compileEmailTemplate } from '@/lib/emailTemplate'
import { formatLuckyNumber, formatCurrency } from '@/lib/utils'

function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey.includes('placeholder')) return null
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
  if (email === 'trananhdung11102006@gmail.com') return user

  try {
    const { data } = await supabase.from('users_role').select('role').eq('email', email).single()
    if (data && ['admin', 'dev'].includes(data.role)) return user
  } catch {}
  return null
}

function generateTicketEmailHTML(ticket: {
  full_name: string
  order_code: string
  lucky_number: number
  qr_cid: string
  event_name: string
  event_date: string
  event_time?: string
  event_venue: string
  event_venue_maps_url?: string
}) {
  const hasVenue = Boolean(ticket.event_venue && ticket.event_venue.trim().length > 0)
  const hasMapsUrl = Boolean(ticket.event_venue_maps_url && ticket.event_venue_maps_url.trim().length > 0)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #0D0D0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; }
    .container { max-width: 580px; margin: 20px auto; background: #141414; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1C1C1E 0%, #0D0D0D 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #D4AF37; }
    .chess-icon { font-size: 42px; display: block; margin-bottom: 8px; color: #D4AF37; }
    .title { color: #D4AF37; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    .subtitle { color: #A8A090; font-size: 13px; margin: 8px 0 0; font-weight: 500; }
    .body { padding: 32px 24px; }
    .greeting { color: #FFFFFF; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .text { color: #A8A090; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .ticket-card { background: #0D0D0D; border: 1px solid #D4AF37; border-radius: 16px; padding: 24px; margin: 20px 0; }
    .ticket-header { font-size: 11px; color: #A8A090; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; font-weight: 700; }
    .order-code { font-size: 28px; font-weight: 900; color: #D4AF37; margin: 0 0 18px; font-family: monospace; letter-spacing: 2px; }
    .info-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; font-size: 13px; }
    .info-label { color: #8E8E93; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .info-value { color: #FFFFFF; font-weight: 700; text-align: right; max-width: 65%; }
    .maps-btn { display: inline-block; margin-top: 8px; padding: 7px 14px; background: #D4AF37; color: #0D0D0D; text-decoration: none; border-radius: 8px; font-size: 11px; font-weight: 900; letter-spacing: 0.5px; }
    .divider { border: none; border-top: 1px dashed rgba(255, 255, 255, 0.15); margin: 18px 0; }
    .lucky-section { text-align: center; padding: 16px; background: rgba(212, 175, 55, 0.08); border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.25); margin: 18px 0; }
    .lucky-label { color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; }
    .lucky-number { color: #FFFFFF; font-size: 38px; font-weight: 900; letter-spacing: 6px; margin: 6px 0; font-family: monospace; }
    .qr-section { text-align: center; margin: 24px 0 12px; }
    .qr-label { color: #A8A090; font-size: 12px; margin-bottom: 14px; font-weight: 600; }
    .qr-img { width: 190px; height: 190px; border-radius: 12px; border: 4px solid #FFFFFF; background: #FFFFFF; }
    .warning { background: rgba(229, 57, 53, 0.08); border: 1px solid rgba(229, 57, 53, 0.3); border-radius: 10px; padding: 14px; margin: 20px 0; }
    .warning-text { color: #FF8A80; font-size: 12px; margin: 0; line-height: 1.5; }
    .footer { background: #080808; padding: 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); }
    .footer-text { color: #636366; font-size: 11px; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="chess-icon">♟</span>
      <h1 class="title">${ticket.event_name}</h1>
      <p class="subtitle">Live Show Kỷ Niệm 11 Năm Thành Lập CLB DTU Acoustic</p>
    </div>
    
    <div class="body">
      <div class="greeting">Xin chào, ${ticket.full_name}! 🎶</div>
      <p class="text">
        Cảm ơn bạn đã đồng hành cùng <strong style="color:#D4AF37">${ticket.event_name}</strong>. 
        Đơn đặt vé của bạn đã được xác nhận thanh toán thành công. Dưới đây là thông tin vé điện tử chính thức:
      </p>
      
      <div class="ticket-card">
        <div class="ticket-header">MÃ VÉ THAM DỰ</div>
        <div class="order-code">${ticket.order_code}</div>
        
        <div class="info-row">
          <span class="info-label">Sự kiện:</span>
          <span class="info-value">${ticket.event_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Thời gian:</span>
          <span class="info-value">${ticket.event_date} • ${ticket.event_time || '19:00 - 21:30'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Địa điểm:</span>
          <span class="info-value">
            ${hasVenue ? ticket.event_venue : 'Sẽ thông báo chính thức trước ngày diễn ra sự kiện'}
            ${hasMapsUrl ? `
              <br><a href="${ticket.event_venue_maps_url}" target="_blank" class="maps-btn">📍 Chỉ Đường Trên Google Maps →</a>
            ` : ''}
          </span>
        </div>
        
        <hr class="divider">
        
        <div class="lucky-section">
          <div class="lucky-label">✦ SỐ MAY MẮN LUCKY DRAW ✦</div>
          <div class="lucky-number">#${ticket.lucky_number}</div>
          <div style="color:#A8A090;font-size:11px">Lưu lại mã số này để tham gia quay thưởng trực tiếp tại liveshow!</div>
        </div>
        
        <div class="qr-section">
          <div class="qr-label">MÃ QR CHECK-IN TẠI CỬA</div>
          <img src="${ticket.qr_cid}" alt="Mã QR Vé" class="qr-img" />
          <div style="color:#8E8E93;font-size:11px;margin-top:10px">Vui lòng xuất trình mã QR này cho ban tổ chức tại cổng check-in</div>
        </div>
      </div>
      
      <div class="warning">
        <p class="warning-text">
          ⚠️ <strong>Lưu ý:</strong> Mỗi mã QR chỉ có giá trị check-in một lần duy nhất. Vui lòng bảo mật thông tin vé và không chia sẻ ảnh mã QR cho người khác.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Hotline hỗ trợ: ${EVENT_INFO.hotline} (${EVENT_INFO.hotlineName}) • Email: ${EVENT_INFO.email}<br>
        Facebook: <a href="${EVENT_INFO.facebookUrl}" style="color:#D4AF37;text-decoration:none">${EVENT_INFO.facebookUrl}</a><br>
        © 2026 CLB DTU Acoustic • ${ticket.event_name}
      </p>
    </div>
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Yêu cầu quyền quản trị viên' }, { status: 403 })
  }

  const adminSupabase = getAdminSupabase()
  const dbClient = adminSupabase || supabase

  // Support both batch send (all unsent paid tickets) or single ticket resend
  let ticketId: string | null = null
  try {
    const body = await request.json()
    ticketId = body?.ticket_id || null
  } catch {}

  // Get site settings (event info + SMTP credentials)
  const { data: settings } = await dbClient
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'smtp_host',
      'smtp_port',
      'smtp_user',
      'smtp_pass',
      'event_name',
      'event_date',
      'event_time',
      'event_venue',
      'event_venue_maps_url',
      'ticket_email_subject',
      'ticket_email_template',
    ])

  const settingsMap = Object.fromEntries(settings?.map(s => [s.key, s.value]) || [])

  const smtpUser = (settingsMap.smtp_user || process.env.SMTP_USER || '').trim()
  const smtpPass = (settingsMap.smtp_pass || process.env.SMTP_PASS || '').trim()

  if (!smtpUser || !smtpPass || smtpUser === 'club@gmail.com' || smtpPass === 'app_password_here') {
    return NextResponse.json({
      error: 'Chưa cấu hình tài khoản gửi Gmail thực tế: Tài khoản hiện tại đang là mẫu ("club@gmail.com"). Vui lòng vào trang Quản trị Dev (/dev) để cập nhật Gmail CLB và Mật khẩu ứng dụng (App Password 16 chữ cái)!',
    }, { status: 400 })
  }

  // Query tickets: Single ticket (if ticket_id provided) OR batch (paid & unsent only)
  let query = dbClient.from('tickets').select('*')
  if (ticketId) {
    query = query.eq('id', ticketId)
  } else {
    // CHỈ GỬI NHỮNG VÉ ĐÃ THANH TOÁN VÀ CHƯA TỪNG ĐƯỢC GỬI EMAIL
    query = query.eq('payment_status', 'paid').eq('is_email_sent', false)
  }

  const { data: tickets, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!tickets || tickets.length === 0) {
    return NextResponse.json({
      message: 'Không có vé nào cần gửi email (tất cả vé đã thanh toán đều đã được gửi email ở các đợt trước).',
      count: 0,
    })
  }

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: settingsMap.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(settingsMap.smtp_port || process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  let sentCount = 0
  const errors: string[] = []

  const eventName = settingsMap.event_name || EVENT_INFO.name
  const eventDate = settingsMap.event_date || EVENT_INFO.eventDate
  const eventTime = settingsMap.event_time || EVENT_INFO.eventTime
  const eventVenue = settingsMap.event_venue || EVENT_INFO.eventVenue
  const eventVenueMapsUrl = settingsMap.event_venue_maps_url || EVENT_INFO.eventVenueMapsUrl

  for (const ticket of tickets) {
    try {
      // Generate QR Code as Buffer for CID attachment (Prevents spam detection)
      const qrData = JSON.stringify({
        id: ticket.id,
        order_code: ticket.order_code,
        hash: ticket.qr_secret_hash,
      })

      const qrPngBuffer = await QRCode.toBuffer(qrData, {
        width: 300,
        margin: 2,
        color: { dark: '#121212', light: '#FFFFFF' },
      })

      // Compile dynamic placeholders
      const customSubject = settingsMap.ticket_email_subject || DEFAULT_EMAIL_SUBJECT
      const customTemplate = settingsMap.ticket_email_template || DEFAULT_EMAIL_TEMPLATE
      const formattedLucky = formatLuckyNumber(ticket.lucky_number)

      const ticketPlaceholders: Record<string, string> = {
        full_name: ticket.full_name,
        order_code: ticket.order_code,
        lucky_number: formattedLucky,
        qr_code: '<img src="cid:ticketqrcode" alt="Mã QR Vé" class="qr-img" />',
        event_name: eventName,
        event_date: eventDate,
        event_time: eventTime,
        event_venue: eventVenue,
        event_venue_maps_url: eventVenueMapsUrl,
        user_email: ticket.user_email,
        phone: ticket.phone,
        organization: ticket.organization,
        amount: formatCurrency(ticket.amount || 89000),
        hotline: `${EVENT_INFO.hotline} (${EVENT_INFO.hotlineName})`,
      }

      const emailSubject = compileEmailSubject(customSubject, ticketPlaceholders)
      const emailHtml = compileEmailTemplate(customTemplate, ticketPlaceholders)

      // Send email with embedded CID attachment
      await transporter.sendMail({
        from: `CLB DTU Acoustic <${smtpUser}>`,
        to: ticket.user_email,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: `ticket-${ticket.order_code}.png`,
            content: qrPngBuffer,
            cid: 'ticketqrcode',
          },
        ],
      })

      // Mark email as sent
      await dbClient
        .from('tickets')
        .update({ is_email_sent: true, updated_at: new Date().toISOString() })
        .eq('id', ticket.id)

      sentCount++
    } catch (err: any) {
      console.error(`Error sending email to ${ticket.user_email}:`, err)
      errors.push(`${ticket.order_code}: ${err.message || 'Lỗi gửi mail'}`)
    }
  }

  if (sentCount === 0 && errors.length > 0) {
    const isBadCredentials = errors.some(
      e => e.includes('535') || e.includes('Username and Password not accepted') || e.includes('BadCredentials')
    )
    return NextResponse.json({
      error: isBadCredentials
        ? 'Lỗi xác thực Gmail: Mật khẩu ứng dụng (App Password) hoặc email CLB chưa đúng. Vui lòng kiểm tra lại trong Dev Panel (/dev).'
        : `Lỗi khi gửi email: ${errors.join(', ')}`,
      sentCount: 0,
      total: tickets.length,
      errors,
    }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    sentCount,
    total: tickets.length,
    message: `Đã gửi thành công ${sentCount}/${tickets.length} vé qua email!`,
    errors: errors.length > 0 ? errors : undefined,
  })
}
