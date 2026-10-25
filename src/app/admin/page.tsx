'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, Ticket, TrendingUp, CheckCircle, Mail, DollarSign,
  RefreshCw, Send, Shield, Download, Search, Eye,
  X, Loader2, Sparkles, AlertTriangle, ArrowLeft, Camera, ExternalLink
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Ticket as TicketType } from '@/types'
import Header from '@/components/Header'
import Link from 'next/link'

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

interface StatsData {
  kpi: {
    total: number
    paid: number
    pending: number
    rejected: number
    checkedIn: number
    emailSent: number
    revenue: number
  }
  orgData: { org: string; count: number }[]
  ageData: { age_group: string; count: number }[]
  genderData: { gender: string; count: number }[]
  referralData: { source: string; count: number }[]
  velocityData: { date: string; count: number }[]
  checkinData: { hour: string; count: number }[]
}

export default function AdminDashboard() {
  const { user, userRole, loading: authLoading } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()
  const router = useRouter()

  const [stats, setStats] = useState<StatsData | null>(null)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sendingEmails, setSendingEmails] = useState(false)
  const [sendingSingleEmail, setSendingSingleEmail] = useState(false)
  const [emailResult, setEmailResult] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [verifying, setVerifying] = useState<string | null>(null)

  // Lucky Draw state
  const [luckyDrawOpen, setLuckyDrawOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winners, setWinners] = useState<{ number: number; name: string }[]>([])
  const [currentSpin, setCurrentSpin] = useState<number | null>(null)

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch {
      // Fallback sample stats
      setStats({
        kpi: { total: 120, paid: 95, pending: 20, rejected: 5, checkedIn: 48, emailSent: 90, revenue: 14250000 },
        orgData: [{ org: 'ĐH Ngoại Thương', count: 35 }, { org: 'ĐH Bách Khoa', count: 28 }, { org: 'ĐH Quốc Gia', count: 22 }],
        ageData: [{ age_group: '18-22', count: 70 }, { age_group: '23-25', count: 35 }, { age_group: '26-30', count: 15 }],
        genderData: [{ gender: 'Nam', count: 65 }, { gender: 'Nu', count: 55 }],
        referralData: [{ source: 'Facebook CLB', count: 60 }, { source: 'Bạn bè', count: 35 }, { source: 'TikTok', count: 25 }],
        velocityData: [{ date: '15/12', count: 12 }, { date: '16/12', count: 24 }, { date: '17/12', count: 38 }, { date: '18/12', count: 46 }],
        checkinData: [{ hour: '18h', count: 15 }, { hour: '19h', count: 33 }],
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchTickets = async () => {
    setTicketsLoading(true)
    try {
      const url = statusFilter !== 'all' ? `/api/admin/verify?status=${statusFilter}&limit=100` : '/api/admin/verify?limit=100'
      const res = await fetch(url)
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch {
      setTickets([])
    } finally {
      setTicketsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user && (userRole === 'admin' || userRole === 'dev')) {
      fetchStats()
      fetchTickets()
    }
  }, [authLoading, user, userRole, statusFilter])

  const handleVerify = async (ticketId: string, action: 'approve' | 'reject') => {
    playClickSound()
    setVerifying(ticketId)
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, action }),
      })
      if (res.ok) {
        playSuccessSound()
        fetchTickets()
        fetchStats()
        setSelectedTicket(null)
      } else {
        playErrorSound()
      }
    } finally {
      setVerifying(null)
    }
  }

  const handleSendEmails = async () => {
    playClickSound()
    setSendingEmails(true)
    setEmailResult(null)
    try {
      const res = await fetch('/api/admin/send-emails', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setEmailResult({
          type: 'error',
          message: data.error || 'Có lỗi xảy ra khi gọi dịch vụ gửi email.',
        })
        playErrorSound()
        return
      }

      if (data.sentCount > 0) {
        setEmailResult({
          type: 'success',
          message: `Đã gửi thành công ${data.sentCount}/${data.total} vé qua email!`,
        })
        playSuccessSound()
      } else if (data.errors && data.errors.length > 0) {
        setEmailResult({
          type: 'error',
          message: data.error || `Không thể gửi email: ${data.errors.join(', ')}`,
        })
        playErrorSound()
      } else {
        setEmailResult({
          type: 'warning',
          message: data.message || 'Không có vé nào cần gửi email (các vé đã được gửi hoặc chưa được duyệt).',
        })
        playSuccessSound()
      }
      fetchStats()
      fetchTickets()
    } catch {
      setEmailResult({
        type: 'error',
        message: 'Có lỗi xảy ra khi kết nối máy chủ gửi email.',
      })
      playErrorSound()
    } finally {
      setSendingEmails(false)
    }
  }

  const handleSendSingleEmail = async (ticketId: string) => {
    playClickSound()
    setSendingSingleEmail(true)
    setEmailResult(null)
    try {
      const res = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId }),
      })
      const data = await res.json()
      if (res.ok && data.sentCount > 0) {
        setEmailResult({
          type: 'success',
          message: 'Đã gửi vé qua email cho khán giả này thành công!',
        })
        playSuccessSound()
      } else {
        setEmailResult({
          type: 'error',
          message: data.error || 'Không thể gửi vé qua email.',
        })
        playErrorSound()
      }
      fetchStats()
      fetchTickets()
    } catch {
      setEmailResult({
        type: 'error',
        message: 'Lỗi kết nối khi gửi email.',
      })
      playErrorSound()
    } finally {
      setSendingSingleEmail(false)
    }
  }

  const handleLuckyDraw = async () => {
    playClickSound()
    setIsSpinning(true)
    setCurrentSpin(null)

    const pool = tickets.length > 0 ? tickets : [
      { lucky_number: 1042, full_name: 'Nguyễn Tuấn Anh' },
      { lucky_number: 2891, full_name: 'Trần Mai Linh' },
      { lucky_number: 3740, full_name: 'Lê Hoàng Nam' },
      { lucky_number: 5821, full_name: 'Phạm Thu Trang' },
      { lucky_number: 6912, full_name: 'Đỗ Đức Thắng' },
    ]

    const interval = setInterval(() => {
      const random = pool[Math.floor(Math.random() * pool.length)]
      setCurrentSpin(random.lucky_number!)
    }, 80)

    setTimeout(() => {
      clearInterval(interval)
      const winner = pool[Math.floor(Math.random() * pool.length)]
      setCurrentSpin(winner.lucky_number!)
      setWinners((prev) => [...prev, { number: winner.lucky_number!, name: winner.full_name }])
      setIsSpinning(false)
      playSuccessSound()
    }, 3000)
  }

  const exportCSV = () => {
    playClickSound()
    const headers = ['Order Code', 'Email', 'Full Name', 'DOB', 'Gender', 'Phone', 'Organization', 'Referral', 'Status', 'Lucky Number', 'Checked In', 'Created At']
    const rows = tickets.map((t) => [
      t.order_code,
      t.user_email,
      t.full_name,
      t.dob,
      t.gender,
      t.phone,
      t.organization,
      t.referral_source,
      t.payment_status,
      t.lucky_number || '',
      t.is_checked_in ? 'Yes' : 'No',
      t.created_at,
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sac-i-van-co-tickets-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredTickets = tickets.filter((t) =>
    !searchQuery ||
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#D4AF37] mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Đang xác thực quyền quản trị...
        </p>
      </div>
    )
  }

  const isAuthorized = user && (userRole === 'admin' || userRole === 'dev')

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#141416] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/20">
              <Shield size={32} />
            </div>
            <h2 className="text-xl font-black text-white mb-2">TRUY CẬP BỊ TỪ CHỐI</h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Trang quản trị này chỉ dành riêng cho Ban Tổ Chức (Admin). Bạn không có quyền truy cập vào khu vực này.
            </p>
            <Link
              href="/"
              className="btn-gold w-full py-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={15} />
              <span>Quay Lại Trang Chủ</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white pb-24">
      <Header />

      {/* Main content wrapped in full-width responsive container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          {/* Top Title & Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <Shield className="text-red-500" size={26} />
                  <span>Admin Dashboard</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 ml-7">
                Quản lý vé, đối chiếu biên lai, thống kê sự kiện & quay số minigame
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => { playClickSound(); fetchStats(); fetchTickets() }}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Làm mới</span>
              </button>

              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Xuất CSV</span>
              </button>

              <button
                onClick={handleSendEmails}
                disabled={sendingEmails}
                className="flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {sendingEmails ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Gửi Vé Email</span>
              </button>

              <button
                onClick={() => { playClickSound(); setLuckyDrawOpen(true) }}
                className="flex items-center gap-1.5 btn-crimson text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                <span>🎰 Lucky Draw LED</span>
              </button>

              <Link
                href="/admin/checkin"
                onClick={playClickSound}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
              >
                <Camera size={14} />
                <span>📱 Quét QR Check-in</span>
              </Link>
            </div>
          </div>

          {emailResult && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 ${
                emailResult.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : emailResult.type === 'error'
                  ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                  : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {emailResult.type === 'success' ? (
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle
                    size={18}
                    className={emailResult.type === 'error' ? 'text-rose-400 shrink-0' : 'text-amber-400 shrink-0'}
                  />
                )}
                <span>{emailResult.message}</span>
              </div>
              <button
                onClick={() => setEmailResult(null)}
                className="text-white/60 hover:text-white text-xs cursor-pointer ml-auto"
                title="Đóng thông báo"
              >
                ✕
              </button>
            </div>
          )}

          {/* KPI CARDS (Unobstructed, High Contrast) */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
              {[
                { label: 'Tổng Vé Đặt', value: stats.kpi.total, icon: <Ticket size={18} />, color: 'text-white' },
                { label: 'Đã Xác Nhận', value: stats.kpi.paid, icon: <CheckCircle size={18} />, color: 'text-emerald-400' },
                { label: 'Chờ Duyệt', value: stats.kpi.pending, icon: <RefreshCw size={18} />, color: 'text-amber-400' },
                { label: 'Check-in Thực Tế', value: `${stats.kpi.checkedIn}/${stats.kpi.paid}`, icon: <Users size={18} />, color: 'text-blue-400' },
                { label: 'Đã Gửi Email', value: stats.kpi.emailSent, icon: <Mail size={18} />, color: 'text-purple-400' },
                { label: 'Tổng Doanh Thu', value: formatCurrency(stats.kpi.revenue), icon: <DollarSign size={18} />, color: 'text-red-400' },
              ].map((kpi, idx) => (
                <div key={idx} className="card-luxury rounded-2xl p-4.5 border border-white/10">
                  <div className={`${kpi.color} mb-2`}>{kpi.icon}</div>
                  <div className={`text-xl font-black ${kpi.color} font-mono tracking-tight`}>{kpi.value}</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Check-in Progress Bar */}
          {stats && (
            <div className="card-luxury rounded-2xl p-5 border border-white/10 mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Tiến độ Check-in tại cổng đón khách
                </span>
                <span className="text-sm font-black text-red-500 font-mono">
                  {stats.kpi.paid > 0 ? Math.round((stats.kpi.checkedIn / stats.kpi.paid) * 100) : 0}%
                </span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats.kpi.paid > 0 ? (stats.kpi.checkedIn / stats.kpi.paid) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-medium">
                {stats.kpi.checkedIn} / {stats.kpi.paid} người mua đã dán vòng tay check-in vào sự kiện.
              </div>
            </div>
          )}

          {/* Analytics Charts */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Velocity */}
              <div className="card-luxury rounded-2xl p-5 border border-white/10">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-red-500" />
                  <span>Tốc Độ Đặt Vé Theo Ngày</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.velocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis dataKey="date" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#FFFFFF' }} />
                    <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: '#EF4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Demographics: Gender & Age */}
              <div className="card-luxury rounded-2xl p-5 border border-white/10">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
                  Cơ Cấu Giới Tính & Độ Tuổi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 mb-2">Giới tính</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={stats.genderData} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={50} label={(props: { name?: string; percent?: number }) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                          {stats.genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 mb-2">Độ tuổi</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={stats.ageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                        <XAxis dataKey="age_group" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#A1A1AA', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                        <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div className="card-luxury rounded-2xl p-5 border border-white/10">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
                  Top Trường / Đơn Vị Công Tác
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.orgData.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis type="number" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
                    <YAxis type="category" dataKey="org" tick={{ fill: '#A1A1AA', fontSize: 10 }} width={120} />
                    <Tooltip contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                    <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Referral */}
              <div className="card-luxury rounded-2xl p-5 border border-white/10">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
                  Hiệu Quả Kênh Truyền Thông
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.referralData} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={75} label={(props: { name?: string; percent?: number }) => `${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                      {stats.referralData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }} />
                    <Legend formatter={(val) => <span className="text-xs text-slate-400">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TICKET TABLE WITH ID="TICKETS" FOR DIRECT HEADER JUMP */}
          <div id="tickets" className="card-luxury rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">Quản Lý Vé Đã Đặt</h2>
                <p className="text-xs text-slate-400 mt-0.5">Đối chiếu biên lai ngân hàng và xác nhận duyệt vé</p>
              </div>

              <div className="flex gap-2.5 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên, mã đơn..."
                    className="bg-[#18181B] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-48"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#18181B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-medium cursor-pointer"
                >
                  <option value="all" className="bg-[#18181B]">Tất cả trạng thái</option>
                  <option value="pending" className="bg-[#18181B]">Chờ duyệt</option>
                  <option value="paid" className="bg-[#18181B]">Đã xác nhận</option>
                  <option value="rejected" className="bg-[#18181B]">Từ chối</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    {['Mã Đơn', 'Họ Tên', 'Email', 'Trường / Đơn Vị', 'Số May Mắn', 'Trạng Thái', 'Thao Tác'].map((h) => (
                      <th key={h} className="px-4 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ticketsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-2 text-red-500" size={24} />
                        Đang tải danh sách vé...
                      </td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500 font-medium">
                        Không có dữ liệu vé phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-black text-red-400">{t.order_code}</td>
                        <td className="px-4 py-3.5 font-bold text-white">{t.full_name}</td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{t.user_email}</td>
                        <td className="px-4 py-3.5 text-slate-300">{t.organization}</td>
                        <td className="px-4 py-3.5 font-bold text-amber-400 font-mono">{t.lucky_number ? `#${t.lucky_number}` : '-'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            t.payment_status === 'paid' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' :
                            t.payment_status === 'rejected' ? 'bg-red-950/40 text-red-400 border-red-500/30' :
                            'bg-amber-950/40 text-amber-400 border-amber-500/30'
                          }`}>
                            {t.payment_status === 'paid' ? 'Đã duyệt' :
                             t.payment_status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { playClickSound(); setSelectedTicket(t) }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                              title="Xem chi tiết & Biên lai"
                            >
                              <Eye size={14} />
                            </button>
                            {t.payment_status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerify(t.id, 'approve')}
                                  disabled={verifying === t.id}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                                >
                                  ✓ Duyệt
                                </button>
                                <button
                                  onClick={() => handleVerify(t.id, 'reject')}
                                  disabled={verifying === t.id}
                                  className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 font-bold text-[11px] transition-colors"
                                >
                                  ✗ Huỷ
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Ticket Detail & Proof Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#141417] rounded-3xl shadow-2xl border border-white/10 overflow-hidden my-8 text-white">
            <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/10">
              <h3 className="font-bold text-sm">Chi Tiết Vé #{selectedTicket.order_code}</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Khách hàng:</span>
                <span className="font-bold text-white">{selectedTicket.full_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200 font-mono">{selectedTicket.user_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">SĐT:</span>
                <span className="text-slate-200">{selectedTicket.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Trường/Đơn vị:</span>
                <span className="text-slate-200">{selectedTicket.organization}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Số may mắn:</span>
                <span className="font-bold text-red-400 font-mono text-sm">#{selectedTicket.lucky_number || '-'}</span>
              </div>

              {selectedTicket.payment_proof_url && (
                <div className="pt-2">
                  <div className="font-bold text-slate-300 mb-2">Ảnh biên lai thanh toán:</div>
                  <div className="p-2 bg-black/50 border border-white/10 rounded-2xl text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedTicket.payment_proof_url} alt="Proof" className="max-h-56 mx-auto rounded-lg object-contain" />
                  </div>
                </div>
              )}
            </div>

            {selectedTicket.payment_status === 'pending' && (
              <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => handleVerify(selectedTicket.id, 'approve')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ✓ Xác Nhận Đã Nhận Tiền
                </button>
                <button
                  onClick={() => handleVerify(selectedTicket.id, 'reject')}
                  className="flex-1 bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ✗ Báo Không Hợp Lệ
                </button>
              </div>
            )}

            {selectedTicket.payment_status === 'paid' && (
              <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                <button
                  disabled={sendingSingleEmail}
                  onClick={() => handleSendSingleEmail(selectedTicket.id)}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#F0CA50] text-[#0D0D0D] font-black py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  {sendingSingleEmail ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                  <span>{selectedTicket.is_email_sent ? '🔄 Gửi Lại Vé Qua Email' : '✉️ Gửi Vé Qua Email'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lucky Draw Stage Screen Modal */}
      {luckyDrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg card-luxury rounded-3xl p-8 border-2 border-red-500 text-center shadow-2xl relative text-white">
            <button
              onClick={() => { playClickSound(); setLuckyDrawOpen(false) }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="text-4xl mb-2">🎰</div>
            <h2 className="text-2xl font-black text-white tracking-tight">QUAY SỐ TRÚNG THƯỞNG</h2>
            <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider">SẮC I. VÁN CỜ Stage</p>

            {/* Lucky spin counter */}
            <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 mb-6 shadow-inner">
              <div className="text-6xl font-black text-red-500 font-mono tracking-widest">
                {currentSpin ? `#${currentSpin}` : '????'}
              </div>
            </div>

            <button
              onClick={handleLuckyDraw}
              disabled={isSpinning}
              className="w-full btn-crimson py-4 rounded-2xl text-lg font-black shadow-xl shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSpinning ? 'Đang quay ngẫu nhiên...' : '🎲 BẮT ĐẦU QUAY SỐ'}
            </button>

            {winners.length > 0 && (
              <div className="mt-6 text-left border-t border-white/10 pt-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Danh Sách Trúng Giải:</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {winners.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/30 border border-red-500/20 text-xs">
                      <span className="font-bold text-red-400 font-mono">#{w.number}</span>
                      <span className="font-bold text-white">{w.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
