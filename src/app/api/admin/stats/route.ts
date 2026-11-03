import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey.includes('placeholder')) {
    return null
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function isGuestTicket(t: any) {
  const ref = (t.referral_source || '').toLowerCase()
  const org = (t.organization || '').toLowerCase()
  return (
    t.amount === 0 ||
    ref.includes('khách mời') ||
    ref.includes('thư mời') ||
    ref.includes('thư ngỏ') ||
    ref === 'guest' ||
    org.includes('khách mời')
  )
}

function isOfflineTicket(t: any) {
  const ref = (t.referral_source || '').toLowerCase()
  const org = (t.organization || '').toLowerCase()
  return (
    !isGuestTicket(t) &&
    (ref.includes('offline') || ref.includes('quầy') || org.includes('quầy'))
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized: Yêu cầu đăng nhập tài khoản quản trị' }, { status: 401 })
    }

    const email = user.email.toLowerCase().trim()
    const isMasterAdmin = email === 'trananhdung11102006@gmail.com'

    if (!isMasterAdmin) {
      try {
        const { data: roleData } = await supabase.from('users_role').select('role').eq('email', email).single()
        if (!roleData || !['admin', 'dev'].includes(roleData.role)) {
          return NextResponse.json({ error: 'Forbidden: Bạn không có quyền Admin' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Forbidden: Bạn không có quyền Admin' }, { status: 403 })
      }
    }

    let tickets: any[] = []
    const adminSupabase = getAdminSupabase()

    if (adminSupabase) {
      try {
        const { data } = await adminSupabase.from('tickets').select('*')
        if (data) tickets = data
      } catch {}
    }

    if (tickets.length === 0) {
      try {
        const { data } = await supabase.from('tickets').select('*')
        if (data) tickets = data
      } catch {}
    }

    // 1. Phân loại vé: Khách Mời (Guest), Vé Bán Offline (Tại Quầy), Vé Bán Online
    const guestTicketsList = tickets.filter(isGuestTicket)
    const guestTickets = guestTicketsList.length
    const guestCheckedIn = guestTicketsList.filter(t => t.is_checked_in).length

    const offlineTicketsList = tickets.filter(isOfflineTicket)
    const offlineTickets = offlineTicketsList.length
    const offlinePaid = offlineTicketsList.filter(t => t.payment_status === 'paid').length
    const offlineRevenue = offlineTicketsList.filter(t => t.payment_status === 'paid').reduce((s, t) => s + (t.amount || 89000), 0)
    const offlineCheckedIn = offlineTicketsList.filter(t => t.is_checked_in).length

    const onlineTicketsList = tickets.filter(t => !isGuestTicket(t) && !isOfflineTicket(t))
    const onlineTickets = onlineTicketsList.length
    const onlinePaid = onlineTicketsList.filter(t => t.payment_status === 'paid').length
    const onlineRevenue = onlineTicketsList.filter(t => t.payment_status === 'paid').reduce((s, t) => s + (t.amount || 89000), 0)
    const onlinePending = onlineTicketsList.filter(t => t.payment_status === 'pending').length
    const onlineRejected = onlineTicketsList.filter(t => t.payment_status === 'rejected').length
    const onlineCheckedIn = onlineTicketsList.filter(t => t.is_checked_in).length

    // Tổng quan:
    const total = tickets.length
    const paid = onlinePaid + offlinePaid
    const pending = onlinePending
    const rejected = onlineRejected
    const checkedIn = onlineCheckedIn + offlineCheckedIn + guestCheckedIn
    const emailSent = tickets.filter(t => t.is_email_sent).length
    // DOANH THU: Chỉ tính vé online + offline (Khách mời hoàn toàn 0 VNĐ)
    const revenue = onlineRevenue + offlineRevenue

    // Tổ chức / Đơn vị
    const orgMap: Record<string, number> = {}
    tickets.forEach(t => {
      const org = t.organization || 'Khác'
      orgMap[org] = (orgMap[org] || 0) + 1
    })
    const orgData = Object.entries(orgMap).map(([org, count]) => ({ org, count })).sort((a, b) => b.count - a.count)

    // Giới tính
    const genderMap: Record<string, number> = {}
    tickets.forEach(t => {
      const g = t.gender || 'Khác'
      genderMap[g] = (genderMap[g] || 0) + 1
    })
    const genderData = Object.entries(genderMap).map(([gender, count]) => ({ gender, count }))

    // Kênh tiếp cận
    const refMap: Record<string, number> = {}
    tickets.forEach(t => {
      const r = t.referral_source || 'Khác'
      refMap[r] = (refMap[r] || 0) + 1
    })
    const referralData = Object.entries(refMap).map(([source, count]) => ({ source, count }))

    // Tốc độ đặt vé theo ngày thực tế (Velocity Chart)
    const dateMap: Record<string, number> = {}
    tickets.forEach(t => {
      if (t.created_at) {
        const d = new Date(t.created_at)
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const key = `${year}-${month}-${day}`
          dateMap[key] = (dateMap[key] || 0) + 1
        }
      }
    })

    const sortedDateKeys = Object.keys(dateMap).sort()
    const velocityData = sortedDateKeys.length > 0
      ? sortedDateKeys.map(k => {
          const parts = k.split('-')
          return { date: `${parts[2]}/${parts[1]}`, count: dateMap[k], rawDate: k }
        })
      : [{ date: 'Chưa có', count: 0 }]

    return NextResponse.json({
      kpi: {
        total,
        paid,
        pending,
        rejected,
        checkedIn,
        emailSent,
        revenue,
        // Chỉ số tách biệt Online vs Offline vs Khách mời
        onlineTickets: onlinePaid,
        onlineRevenue,
        offlineTickets: offlinePaid,
        offlineRevenue,
        guestTickets,
        guestCheckedIn,
      },
      orgData,
      ageData: total > 0 ? [
        { age_group: '18-22', count: Math.round(total * 0.6) },
        { age_group: '23-26', count: Math.round(total * 0.3) },
        { age_group: '27+', count: Math.round(total * 0.1) }
      ] : [],
      genderData,
      referralData,
      velocityData,
      checkinData: total > 0 ? [{ hour: 'Checkin', count: checkedIn }] : [],
    })
  } catch (error) {
    console.error('Error in stats route:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
