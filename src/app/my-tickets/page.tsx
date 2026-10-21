'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Hash, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Search, ArrowLeft, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import type { Ticket as TicketType } from '@/types'
import QRCode from 'qrcode'
import Link from 'next/link'
import Header from '@/components/Header'
import MusicPlayer from '@/components/MusicPlayer'

const statusConfig: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
  pending: {
    label: 'Chờ Duyệt',
    icon: <AlertCircle size={15} />,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  paid: {
    label: 'Đã Thanh Toán',
    icon: <CheckCircle size={15} />,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Không Hợp Lệ',
    icon: <XCircle size={15} />,
    badge: 'bg-red-50 text-red-700 border-red-200',
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
          width: 220,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        })
        qrs[ticket.id] = qUrl
      }
      setQrUrls(qrs)
    } catch (error) {
      console.error(error)
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
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      <Header />

      <main className="pt-24 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="pt-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
                  <ArrowLeft size={18} />
                </Link>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Ticket className="text-red-600" size={24} />
                  <span>Vé Của Tôi & Minigame</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-6.5">
                Tra cứu vé điện tử, mã QR check-in và số may mắn tham dự Live Show
              </p>
            </div>

            <button
              onClick={() => { playClickSound(); fetchTickets() }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:border-slate-900 transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Guest Lookup Box if not logged in or searching other email */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8">
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Nhập email bạn đã dùng để đặt vé..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Search size={15} />
                <span>Tra Cứu Vé</span>
              </button>
            </form>
          </div>

          {/* Ticket Listing */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Đang tải danh sách vé...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
              <div className="text-5xl mb-3">🎟️</div>
              <h3 className="text-lg font-black text-slate-900 mb-1">Chưa Tìm Thấy Vé</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Chưa có đơn vé nào được ghi nhận cho email này. Bạn có thể đặt vé tham dự ngay bây giờ!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md shadow-red-600/25 transition-all"
              >
                <span>MUA VÉ THAM DỰ</span>
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
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* Ticket Header */}
                    <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
                          MÃ ĐƠN HÀNG
                        </span>
                        <span className="text-lg font-black text-red-500 font-mono tracking-wider">
                          {ticket.order_code}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.badge}`}>
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Ticket Details */}
                      <div className="space-y-2.5 text-xs text-slate-600">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Họ và tên:</span>
                          <span className="font-bold text-slate-900 text-sm">{ticket.full_name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Email:</span>
                          <span className="font-medium text-slate-800">{ticket.user_email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Trường / Đơn vị:</span>
                          <span className="font-medium text-slate-800">{ticket.organization}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Giá vé:</span>
                          <span className="font-black text-red-600 text-sm">{formatCurrency(ticket.amount)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Thời gian đặt:</span>
                          <span className="font-medium text-slate-700">{formatDateTime(ticket.created_at)}</span>
                        </div>

                        {/* Lucky Number Card */}
                        {ticket.lucky_number && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-slate-700 text-xs font-bold mb-1">
                              <Hash size={14} className="text-red-600" />
                              <span>SỐ MAY MẮN MINIGAME</span>
                            </div>
                            <div className="text-3xl font-black text-red-600 font-mono tracking-widest">
                              #{ticket.lucky_number}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Dùng để đối chiếu khi bốc thăm trúng thưởng tại show
                            </div>
                          </div>
                        )}
                      </div>

                      {/* QR Code Section */}
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                        {qrUrls[ticket.id] ? (
                          <>
                            <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 mb-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={qrUrls[ticket.id]} alt="Mã QR" className="w-40 h-40 object-contain mx-auto" />
                            </div>
                            <span className="text-xs font-black text-slate-900">MÃ QR CHECK-IN TẠI CỔNG</span>
                            <span className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
                              Xuất trình mã này cho Ban tổ chức khi đến sự kiện
                            </span>
                            {ticket.is_checked_in && (
                              <div className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                ✓ Đã Check-in ({formatDateTime(ticket.checked_in_at!)})
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="py-8 text-center">
                            <Clock size={36} className="text-amber-500 mx-auto mb-2" />
                            <div className="text-xs font-bold text-slate-800">Đang tạo mã QR...</div>
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

      <MusicPlayer />
    </div>
  )
}
