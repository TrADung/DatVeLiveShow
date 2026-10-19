import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import { verifyQRHash } from '@/lib/utils'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdminRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users_role').select('role').eq('email', user.email!).single()
  if (!data || !['admin', 'dev'].includes(data.role)) return null
  return user
}

function generateTicketEmailHTML(ticket: {
  full_name: string
  order_code: string
  lucky_number: number
  qr_data_url: string
  event_name: string
  event_date: string
  event_venue: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #121212; font-family: 'Arial', sans-serif; }
    .container { max-width: 560px; margin: 0 auto; background: #1A1A1A; }
    .header { background: linear-gradient(135deg, #121212 0%, #1A1A1A 100%); padding: 32px; text-align: center; border-bottom: 2px solid #D4AF37; }
    .chess-icon { font-size: 40px; display: block; margin-bottom: 8px; }
    .title { color: #D4AF37; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: 3px; }
    .subtitle { color: #A8A090; font-size: 13px; margin: 6px 0 0; }
    .body { padding: 32px; }
    .greeting { color: #F5F2EB; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .text { color: #A8A090; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .ticket-card { background: #121212; border: 1px solid #D4AF37; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .ticket-header { font-size: 12px; color: #A8A090; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .order-code { font-size: 28px; font-weight: 900; color: #D4AF37; margin: 0 0 20px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .info-label { color: #A8A090; font-size: 12px; }
    .info-value { color: #F5F2EB; font-size: 13px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #2A2A2A; margin: 16px 0; }
    .lucky-section { text-align: center; padding: 16px; background: rgba(212, 175, 55, 0.1); border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.3); margin: 16px 0; }
    .lucky-label { color: #A8A090; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .lucky-number { color: #D4AF37; font-size: 40px; font-weight: 900; letter-spacing: 8px; margin: 4px 0; }
    .qr-section { text-align: center; margin: 24px 0; }
    .qr-label { color: #A8A090; font-size: 12px; margin-bottom: 12px; }
    .qr-img { width: 180px; height: 180px; }
    .footer { background: #0D0D0D; padding: 24px; text-align: center; border-top: 1px solid #2A2A2A; }
    .footer-text { color: #4A4A4A; font-size: 11px; }
    .warning { background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 8px; padding: 12px; margin: 16px 0; }
    .warning-text { color: #A8A090; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="chess-icon">♟</span>
      <h1 class="title">CHESS NIGHT</h1>
      <p class="subtitle">Live Show Sinh Nhật Câu Lạc Bộ Âm Nhạc</p>
    </div>
    
    <div class="body">
      <div class="greeting">Xin chào, ${ticket.full_name}! 🎉</div>
      <p class="text">
        Chúc mừng! Đặt vé của bạn đã được xác nhận thành công. 
        Dưới đây là vé điện tử của bạn để tham dự <strong style="color:#D4AF37">${ticket.event_name}</strong>.
      </p>
      
      <div class="ticket-card">
        <div class="ticket-header">Mã Đơn Hàng</div>
        <div class="order-code">${ticket.order_code}</div>
        
        <div class="info-row">
          <span class="info-label">Sự kiện</span>
          <span class="info-value">${ticket.event_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngày tổ chức</span>
          <span class="info-value">${ticket.event_date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Địa điểm</span>
          <span class="info-value">${ticket.event_venue}</span>
        </div>
        
        <hr class="divider">
        
        <div class="lucky-section">
          <div class="lucky-label">🎰 Số May Mắn Minigame</div>
          <div class="lucky-number">${ticket.lucky_number}</div>
          <div style="color:#A8A090;font-size:11px">Giữ số này để tham gia quay thưởng tại show!</div>
        </div>
        
        <div class="qr-section">
          <div class="qr-label">Mã QR Check-in tại cổng</div>
          <img src="${ticket.qr_data_url}" alt="QR Code" class="qr-img" />
          <div style="color:#4A4A4A;font-size:10px;margin-top:8px">Xuất trình mã QR này cho Staff tại cửa vào</div>
        </div>
      </div>
      
      <div class="warning">
        <p class="warning-text">
          ⚠️ <strong>Lưu ý quan trọng:</strong> Vé này chỉ có giá trị sử dụng MỘT LẦN. 
          Vui lòng không chia sẻ mã QR với người khác. 
          Hệ thống sẽ cảnh báo nếu vé bị quét lần thứ hai.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Email này được gửi tự động từ hệ thống. Vui lòng không reply email này.<br>
        © 2025 CLB Âm Nhạc - Chess Night Live Show
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
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminSupabase = getAdminSupabase()

  // Get SMTP settings
  const { data: settings } = await adminSupabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'event_name', 'event_date', 'event_venue'])

  const settingsMap = Object.fromEntries(settings?.map(s => [s.key, s.value]) || [])

  // Get all paid tickets that haven't received email
  const { data: tickets, error } = await adminSupabase
    .from('tickets')
    .select('*')
    .eq('payment_status', 'paid')
    .eq('is_email_sent', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!tickets || tickets.length === 0) {
    return NextResponse.json({ message: 'Không có vé nào cần gửi email', count: 0 })
  }

  // Setup transporter
  const transporter = nodemailer.createTransport({
    host: settingsMap.smtp_host || 'smtp.gmail.com',
    port: parseInt(settingsMap.smtp_port || '587'),
    secure: false,
    auth: {
      user: settingsMap.smtp_user || process.env.SMTP_USER,
      pass: settingsMap.smtp_pass || process.env.SMTP_PASS,
    },
  })

  let sentCount = 0
  const errors: string[] = []

  for (const ticket of tickets) {
    try {
      // Generate QR Code data URL
      const qrData = JSON.stringify({
        id: ticket.id,
        order_code: ticket.order_code,
        hash: ticket.qr_secret_hash,
      })
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: { dark: '#121212', light: '#FFFFFF' },
      })

      // Send email
      await transporter.sendMail({
        from: `CLB Chess Night <${settingsMap.smtp_user || process.env.SMTP_USER}>`,
        to: ticket.user_email,
        subject: `🎟️ Vé Điện Tử - ${settingsMap.event_name || 'Chess Night Live Show'} | ${ticket.order_code}`,
        html: generateTicketEmailHTML({
          full_name: ticket.full_name,
          order_code: ticket.order_code,
          lucky_number: ticket.lucky_number,
          qr_data_url: qrDataUrl,
          event_name: settingsMap.event_name || 'Chess Night Live Show',
          event_date: settingsMap.event_date || '31/12/2025',
          event_venue: settingsMap.event_venue || 'Hà Nội',
        }),
      })

      // Mark as sent
      await adminSupabase
        .from('tickets')
        .update({ is_email_sent: true })
        .eq('id', ticket.id)

      sentCount++
    } catch (emailError) {
      errors.push(`${ticket.user_email}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`)
    }
  }

  // Log action
  await adminSupabase.from('system_logs').insert({
    action: 'BULK_EMAIL_SENT',
    performed_by: admin.email!,
    details: { total: tickets.length, sent: sentCount, errors: errors.length },
  })

  return NextResponse.json({
    message: `Đã gửi thành công ${sentCount}/${tickets.length} email`,
    sent: sentCount,
    total: tickets.length,
    errors,
  })
}
