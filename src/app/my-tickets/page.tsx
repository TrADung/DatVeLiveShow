'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Hash, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import type { Ticket as TicketType } from '@/types'
import QRCode from 'qrcode'
import Link from 'next/link'
import Header from '@/components/Header'
import MusicPlayer from '@/components/MusicPlayer'
import { useState as useCountdown, useEffect as useCountEffect } from 'react'

const statusConfig = {
  pending: { label: 'Chờ Duyệt', icon: <AlertCircle size={16} />, class: 'status-pending' },
  paid: { label: 'Đã Thanh Toán', icon: <CheckCircle size={16} />, class: 'status-paid' },
  rejected: { label: 'Không Hợp Lệ', icon: <XCircle size={16} />, class: 'status-rejected' },
}

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth()
  const { playClickSound } = useAudio()
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!authLoading && user) {
      fetchTickets()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      setTickets(data || [])

      // Generate QR codes for paid tickets
      const qrs: Record<string, string> = {}
      for (const ticket of data || []) {
        if (ticket.payment_status === 'paid') {
          const qrData = JSON.stringify({
            id: ticket.id,
            order_code: ticket.order_code,
            hash: ticket.qr_secret_hash,
          })
          const url = await QRCode.toDataURL(qrData, { width: 200, margin: 2 })
          qrs[ticket.id] = url
        }
      }
      setQrUrls(qrs)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A8A090]">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <Header />
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#F5F2EB] mb-2">Cần đăng nhập</h2>
          <p className="text-[#A8A090] mb-6">Vui lòng đăng nhập để xem vé của bạn</p>
          <Link href="/" className="bg-[#D4AF37] text-[#121212] font-bold px-6 py-3 rounded-full hover:bg-[#e8c845] transition-colors">
            Về Trang Chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Header />
      
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-[#F5F2EB] flex items-center gap-2">
                <Ticket className="text-[#D4AF37]" size={24} />
                Vé Của Tôi
              </h1>
              <p className="text-sm text-[#A8A090] mt-1">Chess Night - Live Show Sinh Nhật CLB</p>
            </div>
            <button
              onClick={() => { playClickSound(); fetchTickets() }}
              className="flex items-center gap-2 text-sm text-[#A8A090] hover:text-[#D4AF37] transition-colors"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎟️</div>
              <h3 className="text-lg font-bold text-[#F5F2EB] mb-2">Chưa có vé</h3>
              <p className="text-[#A8A090] mb-6">Bạn chưa đặt vé nào. Hãy mua vé ngay!</p>
              <Link href="/" className="bg-[#D4AF37] text-[#121212] font-bold px-6 py-3 rounded-full hover:bg-[#e8c845] transition-colors">
                Mua Vé Ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-dark rounded-2xl border border-[#D4AF37]/20 overflow-hidden"
                >
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-[#1A1A1A] to-[#121212] px-6 py-4 border-b border-[#D4AF37]/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#A8A090]">Mã đơn hàng</div>
                      <div className="text-xl font-black text-[#D4AF37]">{ticket.order_code}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig[ticket.payment_status]?.class}`}>
                      {statusConfig[ticket.payment_status]?.icon}
                      {statusConfig[ticket.payment_status]?.label}
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Ticket Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#A8A090]">Họ tên</span>
                        <span className="text-[#F5F2EB] font-semibold">{ticket.full_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#A8A090]">Ngày sinh</span>
                        <span className="text-[#F5F2EB]">{formatDate(ticket.dob)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#A8A090]">Trường/Đơn vị</span>
                        <span className="text-[#F5F2EB] text-right max-w-[150px]">{ticket.organization}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#A8A090]">Giá vé</span>
                        <span className="text-[#D4AF37] font-bold">{formatCurrency(ticket.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#A8A090]">Ngày đặt</span>
                        <span className="text-[#F5F2EB]">{formatDateTime(ticket.created_at)}</span>
                      </div>
                      {ticket.is_checked_in && ticket.checked_in_at && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#A8A090]">Check-in lúc</span>
                          <span className="text-blue-400">{formatDateTime(ticket.checked_in_at)}</span>
                        </div>
                      )}

                      {/* Lucky Number */}
                      {ticket.lucky_number && (
                        <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-center mt-2">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Hash size={14} className="text-[#D4AF37]" />
                            <span className="text-xs text-[#A8A090]">Số May Mắn Minigame</span>
                          </div>
                          <div className="text-3xl font-black text-[#D4AF37] tracking-widest">
                            {ticket.lucky_number}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center justify-center">
                      {ticket.payment_status === 'paid' && qrUrls[ticket.id] ? (
                        <div className="text-center">
                          <div className="bg-white p-3 rounded-xl inline-block shadow-lg mb-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrUrls[ticket.id]} alt="QR Code" className="w-40 h-40" />
                          </div>
                          <p className="text-xs text-[#A8A090]">Xuất trình mã QR khi check-in</p>
                          {ticket.is_checked_in && (
                            <div className="mt-2 flex items-center gap-1 justify-center text-blue-400 text-xs">
                              <CheckCircle size={12} />
                              Đã Check-in
                            </div>
                          )}
                        </div>
                      ) : ticket.payment_status === 'pending' ? (
                        <div className="text-center p-6">
                          <Clock size={40} className="mx-auto mb-3 text-yellow-400" />
                          <p className="text-sm font-semibold text-yellow-400 mb-1">Chờ xác nhận</p>
                          <p className="text-xs text-[#A8A090]">
                            Admin đang xem xét minh chứng thanh toán. Mã QR sẽ xuất hiện sau khi được duyệt.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <XCircle size={40} className="mx-auto mb-3 text-red-400" />
                          <p className="text-sm font-semibold text-red-400">Đơn bị từ chối</p>
                          <p className="text-xs text-[#A8A090] mt-1">Vui lòng liên hệ BTC</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email status */}
                  <div className="px-6 pb-4">
                    <div className="text-xs text-[#A8A090] flex items-center gap-1.5">
                      {ticket.is_email_sent ? (
                        <><CheckCircle size={12} className="text-green-400" /> Vé đã được gửi qua email</>
                      ) : (
                        <><Clock size={12} className="text-yellow-400/60" /> Vé điện tử chưa được gửi</>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <MusicPlayer />
    </div>
  )
}
