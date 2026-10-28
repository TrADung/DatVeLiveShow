import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'
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
      'event_venue_name',
      'event_venue_address',
      'event_venue_maps_url',
      'event_venue',
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

  const venueName = (settingsMap.event_venue_name || '').trim()
  const venueAddress = (settingsMap.event_venue_address || '').trim()
  const venueMapsUrl = (settingsMap.event_venue_maps_url || '').trim()
  const generalVenue = (settingsMap.event_venue || '').trim()

  const combinedVenueText = generalVenue || [venueName, venueAddress].filter(Boolean).join(' - ')
  let eventVenueHTML = ''
  if (venueMapsUrl) {
    const text = combinedVenueText || 'Xem vị trí trên Google Maps'
    eventVenueHTML = `<a href="${venueMapsUrl}" target="_blank" style="color: #B45309; text-decoration: underline; font-weight: 700;">📍 ${text} (Mở chỉ đường Google Maps ↗)</a>`
  } else if (combinedVenueText) {
    eventVenueHTML = combinedVenueText
  } else {
    eventVenueHTML = '<span style="color: #64748B; font-style: italic;">Sẽ thông báo chính thức trước ngày diễn ra sự kiện</span>'
  }

  const bannerPngPath = path.join(process.cwd(), 'public', 'images', 'EmailForm', 'ticket.png')
  const bannerJpgPath = path.join(process.cwd(), 'public', 'images', 'EmailForm', 'ticket.jpg')
  const bannerPath = fs.existsSync(bannerPngPath) ? bannerPngPath : fs.existsSync(bannerJpgPath) ? bannerJpgPath : null
  const hasBanner = Boolean(bannerPath)
  const bannerFilename = bannerPath && bannerPath.endsWith('.png') ? 'ticket.png' : 'ticket.jpg'

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
      const feedbackText = ticket.feedback && ticket.feedback.trim() ? ticket.feedback.trim() : 'Không'

      const ticketPlaceholders: Record<string, string> = {
        full_name: ticket.full_name,
        order_code: ticket.order_code,
        lucky_number: formattedLucky,
        feedback: feedbackText,
        event_venue: eventVenueHTML,
        event_venue_name: venueName,
        event_venue_address: venueAddress,
        event_venue_maps_url: venueMapsUrl,
        qr_code: '<img src="cid:ticketqrcode" alt="Mã QR Check-in" class="qr-img" style="width: 190px; height: 190px; display: block; margin: 0 auto; border: 3px solid #D4AF37; border-radius: 14px; padding: 6px; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />',
        event_name: eventName,
        event_date: eventDate,
        event_time: eventTime,
        user_email: ticket.user_email,
        phone: ticket.phone,
        organization: ticket.organization,
        amount: formatCurrency(ticket.amount || 89000),
        hotline: `${EVENT_INFO.hotline} (${EVENT_INFO.hotlineName})`,
      }

      const emailSubject = compileEmailSubject(customSubject, ticketPlaceholders)
      let emailHtml = compileEmailTemplate(customTemplate, ticketPlaceholders)

      const attachments: any[] = [
        {
          filename: `ticket-${ticket.order_code}.png`,
          content: qrPngBuffer,
          cid: 'ticketqrcode',
        },
      ]

      if (hasBanner && bannerPath) {
        emailHtml = emailHtml.replace(/\/images\/EmailForm\/ticket\.(png|jpg)/g, 'cid:ticketbanner')
        attachments.push({
          filename: bannerFilename,
          path: bannerPath,
          cid: 'ticketbanner',
        })
      }

      // Send email with embedded CID attachments
      await transporter.sendMail({
        from: `CLB DTU Acoustic <${smtpUser}>`,
        to: ticket.user_email,
        subject: emailSubject,
        html: emailHtml,
        attachments,
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
