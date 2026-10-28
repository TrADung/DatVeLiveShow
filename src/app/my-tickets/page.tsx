'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Hash, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Search, ArrowLeft, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import type { Ticket as TicketType } from '@/types'
import QRCode from 'qrcode'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const statusConfig: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
  pending: {
    label: 'Chờ Duyệt',
    icon: <AlertCircle size={15} />,
    badge: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
  },
  paid: {
    label: 'Đã Thanh Toán',
    icon: <CheckCircle size={15} />,
    badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
  },
  rejected: {
    label: 'Không Hợp Lệ',
    icon: <XCircle size={15} />,
    badge: 'bg-red-950/40 text-red-400 border-red-500/30',
  },
}

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth()
  const { playClickSound } = useAudio()
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})
  const [searchEmail, setSearchEmail] = useState('')

  const fetchTickets = async (emailToFetch?: string) => {
    setLoading(true)
    try {
      const email = emailToFetch || user?.email || ''
      const url = email ? `/api/tickets?email=${encodeURIComponent(email)}` : '/api/tickets'
      const res = await fetch(url)
      const data = await res.json()
      const ticketList: TicketType[] = Array.isArray(data) ? data : []
      setTickets(ticketList)

      // Generate QR codes
      const qrs: Record<string, string> = {}
      for (const ticket of ticketList) {
        const qrData = JSON.stringify({
          id: ticket.id,
          order_code: ticket.order_code,
          hash: ticket.qr_secret_hash,
        })
        const qUrl = await QRCode.toDataURL(qrData, {
          width: 240,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        })
        qrs[ticket.id] = qUrl
      }
      setQrUrls(qrs)
    } catch (error) {
      console.warn('Lookup notice:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchTickets()
    }
  }, [user, authLoading])

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    if (searchEmail.trim()) {
      fetchTickets(searchEmail.trim())
    }
  }

  return (
    <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft size={18} />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <Ticket className="text-red-500" size={26} />
                  <span>Vé Của Tôi & Minigame</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 ml-7">
                Tra cứu vé điện tử, mã QR check-in và số may mắn tham dự Live Show
              </p>
            </div>

            <button
              onClick={() => { playClickSound(); fetchTickets() }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Guest Lookup Box */}
          <div className="card-luxury rounded-2xl p-4 sm:p-5 border border-white/10 mb-8">
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Nhập email bạn đã dùng để đặt vé..."
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                className="btn-crimson font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Search size={15} />
                <span>Tra Cứu Vé</span>
              </button>
            </form>
          </div>

          {/* Email Spam Notice */}
          <div className="mb-8 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-3 shadow-lg">
            <span className="text-base shrink-0">📬</span>
            <div className="leading-relaxed">
              <strong className="text-amber-300 font-bold block mb-0.5">Lưu ý về email vé điện tử:</strong>
              Nếu bạn không thấy email vé gửi về Hộp thư đến (Inbox), vui lòng kiểm tra tại mục <strong>Thư rác (Spam)</strong> hoặc tab <strong>Quảng cáo / Cập nhật</strong> trong hòm thư của bạn nhé! Bạn cũng có thể xem và lưu mã QR check-in trực tiếp ngay tại trang này.
            </div>
          </div>

          {/* Ticket Listing */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium">Đang tải danh sách vé...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="card-luxury rounded-3xl p-10 sm:p-12 text-center border border-white/10">
              <div className="text-5xl mb-4">🎟️</div>
              <h3 className="text-xl font-black text-white mb-2">Chưa Tìm Thấy Vé</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-6">
                Chưa có đơn vé nào được ghi nhận cho email này. Hãy nhanh tay sở hữu tấm vé tham dự SẮC I. VÁN CỜ ngay hôm nay!
              </p>
              <Link
                href="/book"
                className="btn-crimson inline-flex items-center gap-2 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition-all"
              >
                <span>ĐẶT VÉ THAM DỰ NGAY</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket, i) => {
                const status = statusConfig[ticket.payment_status] || statusConfig.pending
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-luxury rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                  >
                    {/* Ticket Header */}
                    <div className="bg-white/5 border-b border-white/10 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
                          MÃ ĐƠN HÀNG
                        </span>
                        <span className="text-xl font-black text-red-500 font-mono tracking-wider">
                          {ticket.order_code}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${status.badge}`}>
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      {/* Ticket Details */}
                      <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Khách hàng:</span>
                          <span className="font-bold text-white text-base">{ticket.full_name}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Email nhận vé:</span>
                          <span className="font-mono text-slate-200">{ticket.user_email}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Trường / Đơn vị:</span>
                          <span className="text-slate-200">{ticket.organization}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Số tiền vé:</span>
                          <span className="font-black text-red-400 font-mono">{formatCurrency(ticket.amount)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-slate-400">Thời gian đặt:</span>
                          <span className="text-slate-300">{formatDateTime(ticket.created_at)}</span>
                        </div>

                        {/* Lucky Number Card */}
                        {ticket.lucky_number !== undefined && ticket.lucky_number !== null && (
                          <div className="mt-4 p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-slate-300 text-xs font-bold mb-1">
                              <Sparkles size={14} className="text-red-400" />
                              <span>SỐ MAY MẮN DỰ THƯỞNG MINIGAME</span>
                            </div>
                            <div className="text-3xl font-black text-red-400 font-mono tracking-widest my-1">
                              #{String(ticket.lucky_number).padStart(3, '0')}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Dùng để đối chiếu khi bốc thăm trúng đàn Guitar tại sân khấu
                            </div>
                          </div>
                        )}
                      </div>

                      {/* QR Code Card */}
                      <div className="flex flex-col items-center justify-center p-6 bg-[#18181B] rounded-2xl border border-white/10 text-center">
                        {qrUrls[ticket.id] ? (
                          <>
                            <div className="bg-white p-3 rounded-2xl shadow-xl mb-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={qrUrls[ticket.id]} alt="Mã QR" className="w-44 h-44 object-contain mx-auto" />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                              MÃ QR CHECK-IN TẠI CỔNG
                            </span>
                            <span className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                              Xuất trình mã này cho Ban tổ chức khi đến sự kiện
                            </span>
                            {ticket.is_checked_in && (
                              <div className="mt-3 text-xs font-bold text-blue-400 bg-blue-950/40 px-3.5 py-1 rounded-full border border-blue-500/30">
                                ✓ Đã Check-in ({formatDateTime(ticket.checked_in_at!)})
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="py-10 text-center">
                            <Clock size={36} className="text-amber-400 mx-auto mb-2" />
                            <div className="text-xs font-bold text-slate-300">Đang tạo mã QR bảo mật...</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </main>

      <Footer onBuyTicket={() => {}} />
    </div>
  )
}
