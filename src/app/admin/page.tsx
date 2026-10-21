'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, Ticket, TrendingUp, CheckCircle, Mail, DollarSign,
  RefreshCw, Send, Shield, Download, Search, Filter, Eye,
  X, ChevronDown, Loader2, AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Ticket as TicketType } from '@/types'
import Header from '@/components/Header'
import Link from 'next/link'

const COLORS = ['#D4AF37', '#6E472B', '#A8A090', '#4A7C59', '#7B3F3F', '#3F5F8A']

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
  const [emailResult, setEmailResult] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [verifying, setVerifying] = useState<string | null>(null)
  
  // Lucky Draw state
  const [luckyDrawOpen, setLuckyDrawOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winners, setWinners] = useState<{ number: number; name: string }[]>([])
  const [currentSpin, setCurrentSpin] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user || !['admin', 'dev'].includes(userRole)) {
        router.push('/')
        return
      }
      fetchStats()
      fetchTickets()
    }
  }, [authLoading, user, userRole, router])

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
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
    } finally {
      setTicketsLoading(false)
    }
  }

  useEffect(() => {
    if (user && ['admin', 'dev'].includes(userRole)) {
      fetchTickets()
    }
  }, [statusFilter, user, userRole])

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
    
    const checkedInTickets = tickets.filter(t => t.is_checked_in && t.lucky_number)
    if (checkedInTickets.length === 0) return
    
    // Spinning animation
    const interval = setInterval(() => {
      const random = checkedInTickets[Math.floor(Math.random() * checkedInTickets.length)]
      setCurrentSpin(random.lucky_number!)
    }, 80)
    
    setTimeout(() => {
      clearInterval(interval)
      const winner = checkedInTickets[Math.floor(Math.random() * checkedInTickets.length)]
      setCurrentSpin(winner.lucky_number!)
      setWinners(prev => [...prev, { number: winner.lucky_number!, name: winner.full_name }])
      setIsSpinning(false)
      playSuccessSound()
    }, 3000)
  }

  const exportCSV = () => {
    playClickSound()
    const headers = ['Order Code', 'Email', 'Full Name', 'DOB', 'Gender', 'Phone', 'Organization', 'Referral', 'Status', 'Lucky Number', 'Checked In', 'Created At']
    const rows = tickets.map(t => [
      t.order_code, t.user_email, t.full_name, t.dob, t.gender, t.phone,
      t.organization, t.referral_source, t.payment_status,
      t.lucky_number || '', t.is_checked_in ? 'Yes' : 'No', t.created_at
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chess-night-tickets-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredTickets = tickets.filter(t =>
    !searchQuery ||
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.order_code.includes(searchQuery) ||
    t.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Header />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#F5F2EB] flex items-center gap-2">
                  <Shield className="text-[#D4AF37]" size={24} />
                  Admin Dashboard
                </h1>
                <p className="text-sm text-[#A8A090] mt-1">Chess Night - Quản lý sự kiện</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => { playClickSound(); fetchStats(); fetchTickets() }}
                  className="flex items-center gap-2 glass-dark border border-[#D4AF37]/20 rounded-full px-4 py-2 text-sm text-[#A8A090] hover:text-[#D4AF37] transition-all">
                  <RefreshCw size={14} /> Làm mới
                </button>
                <button onClick={exportCSV}
                  className="flex items-center gap-2 glass-dark border border-[#D4AF37]/20 rounded-full px-4 py-2 text-sm text-[#A8A090] hover:text-[#D4AF37] transition-all">
                  <Download size={14} /> Xuất CSV
                </button>
                <button onClick={handleSendEmails} disabled={sendingEmails}
                  className="flex items-center gap-2 bg-[#D4AF37] text-[#121212] font-bold rounded-full px-4 py-2 text-sm hover:bg-[#e8c845] transition-all disabled:opacity-50">
                  {sendingEmails ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Gửi Vé Email
                </button>
                <button onClick={() => { playClickSound(); setLuckyDrawOpen(true) }}
                  className="flex items-center gap-2 bg-[#6E472B] text-[#F5F2EB] font-bold rounded-full px-4 py-2 text-sm hover:bg-[#8A5A35] transition-all">
                  🎰 Lucky Draw
                </button>
                <Link href="/admin/checkin"
                  className="flex items-center gap-2 bg-blue-600 text-white font-bold rounded-full px-4 py-2 text-sm hover:bg-blue-500 transition-all">
                  📱 QR Scanner
                </Link>
              </div>
            </div>
            {emailResult && (
              <div className="mt-3 p-3 rounded-xl bg-green-900/20 border border-green-500/30 text-green-400 text-sm">
                ✅ {emailResult}
              </div>
            )}
          </motion.div>

          {/* KPI Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              {[
                { label: 'Tổng Vé', value: stats.kpi.total, icon: <Ticket size={18} />, color: 'text-[#D4AF37]' },
                { label: 'Đã Xác Nhận', value: stats.kpi.paid, icon: <CheckCircle size={18} />, color: 'text-green-400' },
                { label: 'Chờ Duyệt', value: stats.kpi.pending, icon: <RefreshCw size={18} />, color: 'text-yellow-400' },
                { label: 'Từ Chối', value: stats.kpi.rejected, icon: <X size={18} />, color: 'text-red-400' },
                { label: 'Đã Check-in', value: `${stats.kpi.checkedIn}/${stats.kpi.paid}`, icon: <Users size={18} />, color: 'text-blue-400' },
                { label: 'Đã Gửi Mail', value: stats.kpi.emailSent, icon: <Mail size={18} />, color: 'text-purple-400' },
                { label: 'Doanh Thu', value: formatCurrency(stats.kpi.revenue), icon: <DollarSign size={18} />, color: 'text-[#D4AF37]' },
              ].map((kpi, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-dark rounded-2xl p-4 border border-[#D4AF37]/10">
                  <div className={`${kpi.color} mb-2`}>{kpi.icon}</div>
                  <div className={`text-xl font-black ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-xs text-[#A8A090] mt-1">{kpi.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Check-in progress bar */}
          {stats && (
            <div className="glass-dark rounded-2xl p-4 border border-[#D4AF37]/10 mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#F5F2EB]">Tiến độ Check-in</span>
                <span className="text-sm text-[#D4AF37] font-bold">
                  {stats.kpi.paid > 0 ? Math.round((stats.kpi.checkedIn / stats.kpi.paid) * 100) : 0}%
                </span>
              </div>
              <div className="h-3 bg-[#2A2A2A] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.kpi.paid > 0 ? (stats.kpi.checkedIn / stats.kpi.paid) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#e8c845] rounded-full"
                />
              </div>
              <div className="text-xs text-[#A8A090] mt-1">{stats.kpi.checkedIn} / {stats.kpi.paid} đã check-in</div>
            </div>
          )}

          {/* Charts Grid */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Booking Velocity */}
              <div className="glass-dark rounded-2xl p-6 border border-[#D4AF37]/10">
                <h3 className="text-sm font-bold text-[#F5F2EB] mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#D4AF37]" /> Tốc Độ Đặt Vé
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.velocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                    <XAxis dataKey="date" tick={{ fill: '#A8A090', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#A8A090', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #D4AF37', borderRadius: 8, color: '#F5F2EB' }} />
                    <Line type="monotone" dataKey="count" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gender + Age */}
              <div className="glass-dark rounded-2xl p-6 border border-[#D4AF37]/10">
                <h3 className="text-sm font-bold text-[#F5F2EB] mb-4">Giới Tính & Độ Tuổi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#A8A090] mb-2">Giới tính</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={stats.genderData} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={55} label={(props: { name?: string; percent?: number }) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                          {stats.genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #D4AF37', color: '#F5F2EB' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-xs text-[#A8A090] mb-2">Độ tuổi</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={stats.ageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="age_group" tick={{ fill: '#A8A090', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#A8A090', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #D4AF37', color: '#F5F2EB' }} />
                        <Bar dataKey="count" fill="#6E472B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div className="glass-dark rounded-2xl p-6 border border-[#D4AF37]/10">
                <h3 className="text-sm font-bold text-[#F5F2EB] mb-4">Top Trường/Đơn Vị</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.orgData.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                    <XAxis type="number" tick={{ fill: '#A8A090', fontSize: 11 }} />
                    <YAxis type="category" dataKey="org" tick={{ fill: '#A8A090', fontSize: 10 }} width={120} />
                    <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #D4AF37', color: '#F5F2EB' }} />
                    <Bar dataKey="count" fill="#D4AF37" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Referral Sources */}
              <div className="glass-dark rounded-2xl p-6 border border-[#D4AF37]/10">
                <h3 className="text-sm font-bold text-[#F5F2EB] mb-4">Kênh Truyền Thông</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.referralData} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={80} label={(props: { name?: string; percent?: number }) => `${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                      {stats.referralData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #D4AF37', color: '#F5F2EB' }} formatter={(val, name) => [val, name]} />
                    <Legend formatter={(val) => <span style={{ color: '#A8A090', fontSize: 11 }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tickets Table */}
          <div className="glass-dark rounded-2xl border border-[#D4AF37]/10 overflow-hidden">
            <div className="p-6 border-b border-[#D4AF37]/10 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-[#F5F2EB]">Danh Sách Vé</h2>
              <div className="flex gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A090]" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-full pl-9 pr-4 py-2 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] w-48"
                  />
                </div>
                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-full px-4 py-2 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="paid">Đã xác nhận</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    {['Mã Đơn', 'Họ Tên', 'Email', 'Trường/Đơn Vị', 'Số May Mắn', 'Ngày Đặt', 'Trạng Thái', 'Hành Động'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#A8A090] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ticketsLoading ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-[#A8A090]"><Loader2 className="animate-spin mx-auto" size={24} /></td></tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-[#A8A090]">Không có dữ liệu</td></tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-[#1A1A1A] hover:bg-[#D4AF37]/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-[#D4AF37] font-bold">{ticket.order_code}</td>
                        <td className="px-4 py-3 text-[#F5F2EB] font-medium">{ticket.full_name}</td>
                        <td className="px-4 py-3 text-[#A8A090] text-xs">{ticket.user_email}</td>
                        <td className="px-4 py-3 text-[#A8A090] text-xs max-w-[150px] truncate">{ticket.organization}</td>
                        <td className="px-4 py-3 text-[#D4AF37] font-bold">{ticket.lucky_number || '-'}</td>
                        <td className="px-4 py-3 text-[#A8A090] text-xs">{formatDate(ticket.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            ticket.payment_status === 'paid' ? 'status-paid' :
                            ticket.payment_status === 'rejected' ? 'status-rejected' : 'status-pending'
                          }`}>
                            {ticket.payment_status === 'paid' ? 'Đã xác nhận' :
                             ticket.payment_status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { playClickSound(); setSelectedTicket(ticket) }}
                              className="p-1.5 rounded-lg bg-[#2A2A2A] text-[#A8A090] hover:text-[#D4AF37] transition-colors">
                              <Eye size={14} />
                            </button>
                            {ticket.payment_status === 'pending' && (
                              <>
                                <button onClick={() => handleVerify(ticket.id, 'approve')} disabled={verifying === ticket.id}
                                  className="px-2 py-1 rounded-lg bg-green-900/30 text-green-400 text-xs hover:bg-green-900/50 transition-colors disabled:opacity-50">
                                  {verifying === ticket.id ? '...' : '✓ Duyệt'}
                                </button>
                                <button onClick={() => handleVerify(ticket.id, 'reject')} disabled={verifying === ticket.id}
                                  className="px-2 py-1 rounded-lg bg-red-900/30 text-red-400 text-xs hover:bg-red-900/50 transition-colors disabled:opacity-50">
                                  ✗ Từ chối
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
        </div>
      </main>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl border border-[#D4AF37]/20 w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-[#D4AF37]/10 flex justify-between items-center">
              <h3 className="font-bold text-[#F5F2EB]">Chi tiết vé</h3>
              <button onClick={() => { playClickSound(); setSelectedTicket(null) }} className="text-[#A8A090] hover:text-[#F5F2EB]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ['Mã đơn', selectedTicket.order_code],
                ['Email', selectedTicket.user_email],
                ['Họ tên', selectedTicket.full_name],
                ['Ngày sinh', formatDate(selectedTicket.dob)],
                ['Giới tính', selectedTicket.gender],
                ['Điện thoại', selectedTicket.phone],
                ['Trường/Đơn vị', selectedTicket.organization],
                ['Nguồn kênh', selectedTicket.referral_source],
                ['Số may mắn', selectedTicket.lucky_number?.toString() || 'Chưa có'],
                ['Check-in', selectedTicket.is_checked_in ? `✅ ${formatDateTime(selectedTicket.checked_in_at!)}` : '❌ Chưa'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#A8A090]">{label}</span>
                  <span className="text-[#F5F2EB] font-medium text-right max-w-[220px]">{value}</span>
                </div>
              ))}
              {selectedTicket.feedback && (
                <div>
                  <div className="text-[#A8A090] mb-1">Lời nhắn</div>
                  <div className="text-[#F5F2EB] bg-[#2A2A2A] rounded-lg p-3 text-xs">{selectedTicket.feedback}</div>
                </div>
              )}
              {selectedTicket.payment_proof_url && (
                <div>
                  <div className="text-[#A8A090] mb-2">Minh chứng thanh toán</div>
                  <img src={selectedTicket.payment_proof_url} alt="Proof" className="w-full rounded-xl max-h-60 object-contain" />
                </div>
              )}
            </div>
            {selectedTicket.payment_status === 'pending' && (
              <div className="p-6 border-t border-[#D4AF37]/10 flex gap-3">
                <button onClick={() => handleVerify(selectedTicket.id, 'approve')}
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 transition-colors">
                  ✓ Xác Nhận Thanh Toán
                </button>
                <button onClick={() => handleVerify(selectedTicket.id, 'reject')}
                  className="flex-1 bg-red-900/30 text-red-400 border border-red-500/30 font-bold py-3 rounded-xl hover:bg-red-900/50 transition-colors">
                  ✗ Từ Chối
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Lucky Draw Modal */}
      {luckyDrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl border-2 border-[#D4AF37] w-full max-w-lg p-8 text-center">
            <button onClick={() => { playClickSound(); setLuckyDrawOpen(false) }} className="absolute top-4 right-4 text-[#A8A090]"><X size={20} /></button>
            
            <div className="text-4xl mb-4">🎰</div>
            <h2 className="text-2xl font-black text-[#D4AF37] mb-2">QUAY SỐ TRÚNG THƯỞNG</h2>
            <p className="text-[#A8A090] text-sm mb-6">
              {tickets.filter(t => t.is_checked_in).length} người đã check-in tham gia
            </p>
            
            <div className={`text-6xl font-black text-[#D4AF37] tracking-widest mb-6 h-20 flex items-center justify-center ${
              isSpinning ? 'lucky-spinning' : ''
            }`}>
              {currentSpin !== null ? currentSpin : '????'}
            </div>
            
            <button onClick={handleLuckyDraw} disabled={isSpinning}
              className="w-full bg-[#D4AF37] text-[#121212] font-black py-4 rounded-2xl text-lg hover:bg-[#e8c845] transition-all disabled:opacity-50 glow-gold mb-6">
              {isSpinning ? 'Đang quay...' : '🎲 QUAY SỐ'}
            </button>
            
            {winners.length > 0 && (
              <div>
                <h3 className="font-bold text-[#F5F2EB] mb-3">Danh sách trúng thưởng</h3>
                <div className="space-y-2">
                  {winners.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      <span className="text-[#A8A090] text-sm">Giải #{i + 1}</span>
                      <span className="text-[#D4AF37] font-black text-xl">{w.number}</span>
                      <span className="text-[#F5F2EB] text-sm">{w.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
