import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'
import {
  DEFAULT_EMAIL_SUBJECT,
  DEFAULT_EMAIL_TEMPLATE,
  EMAIL_PLACEHOLDERS,
  MOCK_TICKET_DATA,
  compileEmailSubject,
  compileEmailTemplate,
} from '@/lib/emailTemplate'

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

export async function GET() {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Yêu cầu quyền quản trị viên' }, { status: 403 })
  }

  const adminSupabase = getAdminSupabase()
  const dbClient = adminSupabase || supabase

  try {
    const { data: settings } = await dbClient
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'ticket_email_subject',
        'ticket_email_template',
        'event_venue_name',
        'event_venue_address',
        'event_venue_maps_url',
        'event_venue',
      ])

    const map = Object.fromEntries(settings?.map((s) => [s.key, s.value]) || [])

    const venueName = (map.event_venue_name || '').trim()
    const venueAddress = (map.event_venue_address || '').trim()
    const venueMapsUrl = (map.event_venue_maps_url || '').trim()
    const generalVenue = (map.event_venue || '').trim()
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

    const dynamicMock = {
      ...MOCK_TICKET_DATA,
      event_venue: eventVenueHTML,
      event_venue_name: venueName,
      event_venue_address: venueAddress,
      event_venue_maps_url: venueMapsUrl,
    }

    return NextResponse.json({
      subject: map.ticket_email_subject || DEFAULT_EMAIL_SUBJECT,
      template: map.ticket_email_template || DEFAULT_EMAIL_TEMPLATE,
      placeholders: EMAIL_PLACEHOLDERS,
      mockData: dynamicMock,
      adminEmail: admin.email,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi khi tải mẫu email' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = await checkAdminRole(supabase)
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: Yêu cầu quyền quản trị viên' }, { status: 403 })
  }

  const adminSupabase = getAdminSupabase()
  const dbClient = adminSupabase || supabase

  try {
    const body = await request.json()
    const { action = 'save', subject, template, testEmail } = body

    if (!subject || !template) {
      return NextResponse.json({ error: 'Tiêu đề và nội dung email không được để trống' }, { status: 400 })
    }

    if (action === 'save') {
      const now = new Date().toISOString()
      const updates = [
        {
          key: 'ticket_email_subject',
          value: subject,
          description: 'Tiêu đề email gửi vé cho khán giả',
          updated_by: admin.email,
          updated_at: now,
        },
        {
          key: 'ticket_email_template',
          value: template,
          description: 'Nội dung HTML mẫu email gửi vé cho khán giả',
          updated_by: admin.email,
          updated_at: now,
        },
      ]

      for (const row of updates) {
        await dbClient.from('site_settings').upsert(row, { onConflict: 'key' })
      }

      return NextResponse.json({
        success: true,
        message: 'Đã lưu mẫu email thành công! Mọi email gửi sau này sẽ áp dụng mẫu mới này.',
      })
    }

    if (action === 'test') {
      const recipient = (testEmail || admin.email || '').trim().toLowerCase()
      if (!recipient || !recipient.includes('@')) {
        return NextResponse.json({ error: 'Địa chỉ nhận email thử nghiệm không hợp lệ' }, { status: 400 })
      }

      // Query SMTP settings + venue
      const { data: settings } = await dbClient
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'smtp_host',
          'smtp_port',
          'smtp_user',
          'smtp_pass',
          'event_venue_name',
          'event_venue_address',
          'event_venue_maps_url',
          'event_venue',
        ])

      const smtpMap = Object.fromEntries(settings?.map((s) => [s.key, s.value]) || [])
      const smtpUser = (smtpMap.smtp_user || process.env.SMTP_USER || '').trim()
      const smtpPass = (smtpMap.smtp_pass || process.env.SMTP_PASS || '').trim()

      if (!smtpUser || !smtpPass || smtpUser === 'club@gmail.com' || smtpPass === 'app_password_here') {
        return NextResponse.json({
          error: 'Chưa cấu hình tài khoản gửi Gmail: Vui lòng vào trang Dev (/dev) cập nhật Gmail CLB và Mật khẩu ứng dụng 16 chữ cái.',
        }, { status: 400 })
      }

      const transporter = nodemailer.createTransport({
        host: smtpMap.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(smtpMap.smtp_port || process.env.SMTP_PORT || '587'),
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      })

      // Generate demo QR code buffer
      const qrPngBuffer = await QRCode.toBuffer(
        JSON.stringify({
          id: 'demo-ticket-id-preview',
          order_code: 'CLB-LG6FHWZ',
          hash: 'preview-hash-demo',
        }),
        {
          width: 300,
          margin: 2,
          color: { dark: '#121212', light: '#FFFFFF' },
        }
      )

      const venueName = (smtpMap.event_venue_name || '').trim()
      const venueAddress = (smtpMap.event_venue_address || '').trim()
      const venueMapsUrl = (smtpMap.event_venue_maps_url || '').trim()
      const generalVenue = (smtpMap.event_venue || '').trim()
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

      const dynamicMock = {
        ...MOCK_TICKET_DATA,
        event_venue: eventVenueHTML,
        event_venue_name: venueName,
        event_venue_address: venueAddress,
        event_venue_maps_url: venueMapsUrl,
        qr_code: '<img src="cid:ticketqrcode" alt="Mã QR Check-in" class="qr-img" style="width: 190px; height: 190px; display: block; margin: 0 auto; border: 3px solid #D4AF37; border-radius: 14px; padding: 6px; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />',
      }

      const compiledSubject = compileEmailSubject(subject, dynamicMock)
      let compiledHTML = compileEmailTemplate(template, dynamicMock)

      const bannerPngPath = path.join(process.cwd(), 'public', 'images', 'EmailForm', 'ticket.png')
      const bannerJpgPath = path.join(process.cwd(), 'public', 'images', 'EmailForm', 'ticket.jpg')
      const bannerPath = fs.existsSync(bannerPngPath) ? bannerPngPath : fs.existsSync(bannerJpgPath) ? bannerJpgPath : null
      const hasBanner = Boolean(bannerPath)
      const bannerFilename = bannerPath && bannerPath.endsWith('.png') ? 'ticket.png' : 'ticket.jpg'

      const attachments: any[] = [
        {
          filename: 'ticket-demo.png',
          content: qrPngBuffer,
          cid: 'ticketqrcode',
        },
      ]

      if (hasBanner && bannerPath) {
        compiledHTML = compiledHTML.replace(/\/images\/EmailForm\/ticket\.(png|jpg)/g, 'cid:ticketbanner')
        attachments.push({
          filename: bannerFilename,
          path: bannerPath,
          cid: 'ticketbanner',
        })
      }

      await transporter.sendMail({
        from: `CLB DTU Acoustic <${smtpUser}>`,
        to: recipient,
        subject: `[EMAIL THỬ NGHIỆM] ${compiledSubject}`,
        html: compiledHTML,
        attachments,
      })

      return NextResponse.json({
        success: true,
        message: `Đã gửi thành công email thử nghiệm đến ${recipient}! Hãy kiểm tra hộp thư của bạn.`,
      })
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 })
  } catch (err: any) {
    console.error('Mail template API error:', err)
    return NextResponse.json({ error: err.message || 'Lỗi xử lý yêu cầu' }, { status: 500 })
  }
}
