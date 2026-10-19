import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getAgeGroup } from '@/lib/utils'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data: roleData } = await supabase.from('users_role').select('role').eq('email', user.email!).single()
  if (!roleData || !['admin', 'dev'].includes(roleData.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminSupabase = getAdminSupabase()

  // Fetch all tickets for stats
  const { data: tickets } = await adminSupabase
    .from('tickets')
    .select('*')

  if (!tickets) return NextResponse.json({ error: 'No data' }, { status: 500 })

  // KPI Stats
  const total = tickets.length
  const paid = tickets.filter(t => t.payment_status === 'paid').length
  const pending = tickets.filter(t => t.payment_status === 'pending').length
  const rejected = tickets.filter(t => t.payment_status === 'rejected').length
  const checkedIn = tickets.filter(t => t.is_checked_in).length
  const emailSent = tickets.filter(t => t.is_email_sent).length
  const revenue = tickets.filter(t => t.payment_status === 'paid').reduce((s, t) => s + t.amount, 0)

  // Organization stats
  const orgMap: Record<string, number> = {}
  tickets.forEach(t => {
    orgMap[t.organization] = (orgMap[t.organization] || 0) + 1
  })
  const orgData = Object.entries(orgMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([org, count]) => ({ org, count }))

  // Age group stats
  const ageMap: Record<string, number> = {}
  tickets.forEach(t => {
    if (t.dob) {
      const group = getAgeGroup(t.dob)
      ageMap[group] = (ageMap[group] || 0) + 1
    }
  })
  const ageData = Object.entries(ageMap).map(([age_group, count]) => ({ age_group, count }))

  // Gender stats
  const genderMap: Record<string, number> = {}
  tickets.forEach(t => {
    genderMap[t.gender] = (genderMap[t.gender] || 0) + 1
  })
  const genderData = Object.entries(genderMap).map(([gender, count]) => ({ gender, count }))

  // Referral stats
  const refMap: Record<string, number> = {}
  tickets.forEach(t => {
    refMap[t.referral_source] = (refMap[t.referral_source] || 0) + 1
  })
  const referralData = Object.entries(refMap).map(([source, count]) => ({ source, count }))

  // Booking velocity (by date)
  const velocityMap: Record<string, number> = {}
  tickets.forEach(t => {
    const date = new Date(t.created_at).toLocaleDateString('vi-VN')
    velocityMap[date] = (velocityMap[date] || 0) + 1
  })
  const velocityData = Object.entries(velocityMap).map(([date, count]) => ({ date, count })).slice(-14)

  // Check-in velocity (by hour)
  const checkinMap: Record<string, number> = {}
  tickets.filter(t => t.checked_in_at).forEach(t => {
    const hour = new Date(t.checked_in_at!).getHours() + 'h'
    checkinMap[hour] = (checkinMap[hour] || 0) + 1
  })
  const checkinData = Object.entries(checkinMap).map(([hour, count]) => ({ hour, count }))

  return NextResponse.json({
    kpi: { total, paid, pending, rejected, checkedIn, emailSent, revenue },
    orgData,
    ageData,
    genderData,
    referralData,
    velocityData,
    checkinData,
  })
}
