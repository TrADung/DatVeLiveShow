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
  X, Loader2, Sparkles, AlertTriangle, ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Ticket as TicketType } from '@/types'
import Header from '@/components/Header'
import Link from 'next/link'

const COLORS = ['#DC2626', '#0F172A', '#2563EB', '#10B981', '#F59E0B', '#8B5CF6']

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
  const { user, userRole, loading: authLoading, quickDemoLogin } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()
  const router = useRouter()

  const [stats, setStats] = useState<StatsData | null>(null)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sendingEmails, setSendingEmails] = useState(false)
  const [emailResult, setEmailResult] = useState<string | null>(null)
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
      // Fallback sample stats for initial setup
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
    if (!authLoading) {
      fetchStats()
      fetchTickets()
    }
  }, [authLoading, statusFilter])

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
      setEmailResult(data.message)
      playSuccessSound()
      fetchStats()
    } catch {
      setEmailResult('Có lỗi xảy ra khi gửi email')
      playErrorSound()
    } finally {
      setSendingEmails(false)
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
    const headers = ['Mã Đơn', 'Email', 'Họ Tên', 'Ngày Sinh', 'Giới Tính', 'SĐT', 'Đơn Vị', 'Kênh', 'Trạng Thái', 'Số May Mắn', 'Đã Check-in']
    const rows = tickets.map((t) => [
      t.order_code, t.user_email, t.full_name, t.dob, t.gender, t.phone,
      t.organization, t.referral_source, t.payment_status,
      t.lucky_number || '', t.is_checked_in ? 'Yes' : 'No'
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chess-night-danh-sach-ve-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredTickets = tickets.filter((t) =>
    !searchQuery ||
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      <Header />

      <main className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pt-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
                  <ArrowLeft size={18} />
                </Link>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Shield className="text-red-600" size={24} />
                  <span>Admin Dashboard</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-6.5">
                Bảng điều khiển quản lý vé, thống kê sự kiện & quay số minigame
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => { playClickSound(); fetchStats(); fetchTickets() }}
                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-800 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Làm mới</span>
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-800 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Xuất CSV</span>
              </button>
              <button
                onClick={handleSendEmails}
                disabled={sendingEmails}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {sendingEmails ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Gửi Vé Hàng Loạt</span>
              </button>
              <button
                onClick={() => { playClickSound(); setLuckyDrawOpen(true) }}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <Sparkles size={13} />
                <span>🎰 Lucky Draw LED</span>
              </button>
              <Link
                href="/admin/checkin"
                className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                <span>📱 Camera Check-in</span>
              </Link>
            </div>
          </div>

          {emailResult && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>{emailResult}</span>
            </div>
          )}

          {/* KPI Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
              {[
                { label: 'Tổng Vé Đặt', value: stats.kpi.total, icon: <Ticket size={18} />, color: 'text-slate-900' },
                { label: 'Đã Xác Nhận', value: stats.kpi.paid, icon: <CheckCircle size={18} />, color: 'text-emerald-600' },
                { label: 'Chờ Duyệt', value: stats.kpi.pending, icon: <RefreshCw size={18} />, color: 'text-amber-600' },
                { label: 'Check-in Thực Tế', value: `${stats.kpi.checkedIn}/${stats.kpi.paid}`, icon: <Users size={18} />, color: 'text-blue-600' },
                { label: 'Đã Gửi Email', value: stats.kpi.emailSent, icon: <Mail size={18} />, color: 'text-purple-600' },
                { label: 'Tổng Doanh Thu', value: formatCurrency(stats.kpi.revenue), icon: <DollarSign size={18} />, color: 'text-red-600' },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <div className={`${kpi.color} mb-1.5`}>{kpi.icon}</div>
                  <div className={`text-xl font-black ${kpi.color} tracking-tight`}>{kpi.value}</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">{kpi.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Check-in Progress Bar */}
          {stats && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tiến độ Check-in tại cổng
                </span>
                <span className="text-sm font-black text-red-600">
                  {stats.kpi.paid > 0 ? Math.round((stats.kpi.checkedIn / stats.kpi.paid) * 100) : 0}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.kpi.paid > 0 ? (stats.kpi.checkedIn / stats.kpi.paid) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-medium">
                {stats.kpi.checkedIn} / {stats.kpi.paid} người mua đã dán vòng tay check-in vào sự kiện.
              </div>
            </div>
          )}

          {/* Analytics Charts */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Velocity */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-red-600" />
                  <span>Tốc Độ Đặt Vé Theo Ngày</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.velocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, color: '#0F172A' }} />
                    <Line type="monotone" dataKey="count" stroke="#DC2626" strokeWidth={2.5} dot={{ fill: '#DC2626' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Demographics: Gender & Age */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Cơ Cấu Giới Tính & Độ Tuổi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-2">Giới tính</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={stats.genderData} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={50} label={(props: { name?: string; percent?: number }) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                          {stats.genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-2">Độ tuổi</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={stats.ageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="age_group" tick={{ fill: '#64748B', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Top Trường / Đơn Vị Công Tác
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.orgData.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis type="category" dataKey="org" tick={{ fill: '#64748B', fontSize: 10 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#DC2626" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Referral */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Hiệu Quả Kênh Truyền Thông
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.referralData} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={75} label={(props: { name?: string; percent?: number }) => `${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                      {stats.referralData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend formatter={(val) => <span className="text-xs text-slate-600">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Ticket Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900">Quản Lý Vé Đã Đặt</h2>
                <p className="text-xs text-slate-500">Đối chiếu biên lai và xác nhận thanh toán</p>
              </div>

              <div className="flex gap-2.5 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên, mã đơn..."
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white w-44"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="paid">Đã xác nhận</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    {['Mã Đơn', 'Họ Tên', 'Email', 'Trường / Đơn Vị', 'Số May Mắn', 'Trạng Thái', 'Thao Tác'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ticketsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Không có dữ liệu phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-black text-red-600">{t.order_code}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{t.full_name}</td>
                        <td className="px-4 py-3 text-slate-600">{t.user_email}</td>
                        <td className="px-4 py-3 text-slate-600">{t.organization}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{t.lucky_number ? `#${t.lucky_number}` : '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            t.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            t.payment_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {t.payment_status === 'paid' ? 'Đã thanh toán' :
                             t.payment_status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { playClickSound(); setSelectedTicket(t) }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Xem chi tiết & Biên lai"
                            >
                              <Eye size={13} />
                            </button>
                            {t.payment_status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerify(t.id, 'approve')}
                                  disabled={verifying === t.id}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
                                >
                                  ✓ Duyệt
                                </button>
                                <button
                                  onClick={() => handleVerify(t.id, 'reject')}
                                  disabled={verifying === t.id}
                                  className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Chi Tiết Vé #{selectedTicket.order_code}</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Khách hàng:</span>
                <span className="font-bold text-slate-900">{selectedTicket.full_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-800">{selectedTicket.user_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">SĐT:</span>
                <span className="text-slate-800">{selectedTicket.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Số may mắn:</span>
                <span className="font-bold text-red-600">#{selectedTicket.lucky_number || '-'}</span>
              </div>

              {selectedTicket.payment_proof_url && (
                <div className="pt-2">
                  <div className="font-bold text-slate-700 mb-2">Ảnh biên lai thanh toán:</div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedTicket.payment_proof_url} alt="Proof" className="max-h-56 mx-auto rounded-lg object-contain" />
                  </div>
                </div>
              )}
            </div>

            {selectedTicket.payment_status === 'pending' && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => handleVerify(selectedTicket.id, 'approve')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ✓ Xác Nhận Đã Nhận Tiền
                </button>
                <button
                  onClick={() => handleVerify(selectedTicket.id, 'reject')}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  ✗ Báo Không Hợp Lệ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lucky Draw Stage Screen Modal */}
      {luckyDrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 border-4 border-red-600 text-center shadow-2xl relative">
            <button
              onClick={() => { playClickSound(); setLuckyDrawOpen(false) }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
            >
              <X size={20} />
            </button>

            <div className="text-4xl mb-2">🎰</div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">QUAY SỐ TRÚNG THƯỞNG</h2>
            <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider">Chess Night Lucky Draw Stage</p>

            {/* Lucky spin counter */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 shadow-inner">
              <div className="text-6xl font-black text-red-500 font-mono tracking-widest">
                {currentSpin ? `#${currentSpin}` : '????'}
              </div>
            </div>

            <button
              onClick={handleLuckyDraw}
              disabled={isSpinning}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSpinning ? 'Đang quay ngẫu nhiên...' : '🎲 BẮT ĐẦU QUAY SỐ'}
            </button>

            {winners.length > 0 && (
              <div className="mt-6 text-left border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Danh Sách Trúng Giải:</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {winners.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-red-50 border border-red-200 text-xs">
                      <span className="font-bold text-red-600 font-mono">#{w.number}</span>
                      <span className="font-bold text-slate-800">{w.name}</span>
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
