'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Calendar,
  Phone,
  Building,
  Send,
  Check,
  Upload,
  Loader2,
  AlertCircle,
  Mail,
  MessageSquare,
  ArrowLeft,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Music,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MusicPlayer from '@/components/MusicPlayer'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { generateVietQRUrl, formatCurrency } from '@/lib/utils'
import type { BookingFormData, Gender } from '@/types'

type Step = 'form' | 'payment' | 'success'

const referralOptions = [
  'Facebook CLB',
  'TikTok',
  'Bạn bè giới thiệu',
  'Poster/Banner trường',
  'Khác',
]

export default function BookPage() {
  const { user } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [luckyNumber, setLuckyNumber] = useState<number | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofUploading, setProofUploading] = useState(false)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [copiedBank, setCopiedBank] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const [form, setForm] = useState<BookingFormData>({
    full_name: '',
    dob: '',
    gender: 'Nam' as Gender,
    phone: '',
    organization: '',
    referral_source: '',
    feedback: '',
  })

  const TICKET_PRICE = 150000
  const BANK_ID = process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'MB'
  const ACCOUNT_NO = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1234567890'
  const ACCOUNT_NAME = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'CLB AM NHAC'

  // Autofill user details when logged in
  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email)
    }
    if (user?.user_metadata?.full_name) {
      setForm((f) => ({ ...f, full_name: user.user_metadata.full_name || f.full_name }))
    }
  }, [user])

  const copyToClipboard = (text: string, type: 'bank' | 'code') => {
    playClickSound()
    navigator.clipboard.writeText(text)
    if (type === 'bank') {
      setCopiedBank(true)
      setTimeout(() => setCopiedBank(false), 2000)
    } else {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()

    const finalEmail = user?.email || emailInput.trim()
    if (!finalEmail) {
      setError('Vui lòng nhập địa chỉ email nhận vé.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_email: finalEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo đơn vé')
      }

      setOrderCode(data.order_code)
      setTicketId(data.id)
      setLuckyNumber(data.lucky_number || null)
      setStep('payment')
      playSuccessSound()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      playErrorSound()
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi yêu cầu')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (file: File | null) => {
    setProofFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setProofPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setProofPreview(null)
    }
  }

  const handleProofUpload = async () => {
    if (!ticketId) return
    playClickSound()
    setProofUploading(true)
    setError('')

    try {
      let finalProofUrl = proofPreview || 'https://via.placeholder.com/400x300.png?text=Payment+Proof'

      if (proofFile) {
        try {
          const fileExt = proofFile.name.split('.').pop()
          const fileName = `${ticketId}-${Date.now()}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('payment-proofs')
            .upload(fileName, proofFile)

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('payment-proofs')
              .getPublicUrl(fileName)
            finalProofUrl = urlData.publicUrl
          }
        } catch (uploadErr) {
          console.warn('Storage upload fallback:', uploadErr)
        }
      }

      await fetch('/api/tickets/proof', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          payment_proof_url: finalProofUrl,
        }),
      })

      setStep('success')
      playSuccessSound()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      playErrorSound()
      setStep('success')
    } finally {
      setProofUploading(false)
    }
  }

  const vietQRUrl = orderCode
    ? generateVietQRUrl(BANK_ID, ACCOUNT_NO, TICKET_PRICE, orderCode, ACCOUNT_NAME)
    : ''

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            onClick={playClickSound}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Quay lại Trang Chủ</span>
          </Link>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Event Details & Ticket Summary */}
          <div className="lg:col-span-5 space-y-6">
            {/* Event Header Banner Card */}
            <div className="card-luxury rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl text-red-500">♟</span>
                <span className="text-xs font-black tracking-widest text-red-500 uppercase">
                  CHESS NIGHT 2025
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                Live Show Sinh Nhật CLB Âm Nhạc
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Đêm nhạc tôn vinh nghệ thuật giao thoa giữa giai điệu Acoustic mộc mạc và phong cách Bàn Cờ Vua đương đại. Số lượng vé phát hành giới hạn!
              </p>

              {/* Event Meta List */}
              <div className="space-y-3.5 pt-4 border-t border-white/10 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-red-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Thời gian</div>
                    <div className="font-bold text-white">31 Tháng 12, 2025 • 19:00 - 22:30</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-red-400">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Địa điểm</div>
                    <div className="font-bold text-white">Hà Nội Concert Hall (Phố Nghệ Thuật)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-red-400">
                    <Music size={16} />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Trình diễn</div>
                    <div className="font-bold text-white">Acoustic Set + Full Band Live + Nghệ Sĩ Khách Mời</div>
                  </div>
                </div>
              </div>

              {/* Perks List */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-red-500" />
                  <span>Đặc Quyền Kèm Theo Mỗi Vé</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-red-500 shrink-0" />
                    <span>01 Đồ uống welcome drink & snack cao cấp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-red-500 shrink-0" />
                    <span>01 Vòng tay dạ quang lưu niệm Chess Night</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-red-500 shrink-0" />
                    <span>01 Mã số may mắn tham gia Lucky Draw sân khấu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-red-500 shrink-0" />
                    <span>Vé điện tử QR Check-in siêu tốc tại cửa</span>
                  </div>
                </div>
              </div>

              {/* Price Box */}
              <div className="mt-6 p-4 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Giá niêm yết</div>
                  <div className="text-xs text-slate-300 font-medium">Bao gồm toàn bộ quyền lợi</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-red-500 font-mono">150.000đ</div>
                  <div className="text-[10px] text-slate-400">1 vé / người</div>
                </div>
              </div>
            </div>

            {/* Assistance card */}
            <div className="card-luxury rounded-2xl p-4 sm:p-5 text-xs text-slate-400 flex items-center gap-3">
              <ShieldCheck size={24} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-white font-bold block">Bảo đảm & Hỗ trợ đặt vé</span>
                <span>Cần hỗ trợ thanh toán? Liên hệ hotline CLB: <strong className="text-white">0912 345 678</strong></span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3-Step Interactive Checkout Form */}
          <div className="lg:col-span-7">
            <div className="card-luxury rounded-3xl p-6 sm:p-8 relative">
              {/* Step indicator header */}
              <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  {[
                    { id: 'form', label: '1. Thông Tin' },
                    { id: 'payment', label: '2. Thanh Toán VietQR' },
                    { id: 'success', label: '3. Nhận Vé' },
                  ].map((s, idx) => {
                    const isActive = step === s.id
                    const isPast =
                      (step === 'payment' && idx === 0) ||
                      (step === 'success' && (idx === 0 || idx === 1))
                    return (
                      <div key={s.id} className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 ring-4 ring-red-600/20'
                              : isPast
                              ? 'bg-white text-slate-900 font-black'
                              : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {isPast ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-bold hidden sm:inline ${
                            isActive ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* STEP 1: Registration Form */}
              {step === 'form' && (
                <form onSubmit={handleSubmitForm} className="space-y-5">
                  <div className="border-b border-white/10 pb-4 mb-4">
                    <h2 className="text-lg font-bold text-white">Điền thông tin đặt vé</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vé điện tử và mã QR check-in sẽ được gửi trực tiếp đến địa chỉ email này.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                      <User size={14} className="text-red-500" />
                      <span>Họ và tên <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      required
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                      <Mail size={14} className="text-red-500" />
                      <span>Email nhận vé điện tử <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      required
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ban@gmail.com"
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                    />
                  </div>

                  {/* DOB & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                        <Calendar size={14} className="text-red-500" />
                        <span>Ngày tháng năm sinh <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        required
                        type="date"
                        value={form.dob}
                        onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                        max="2025-12-31"
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={form.gender}
                        onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nu">Nữ</option>
                        <option value="Khac">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone & Organization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                        <Phone size={14} className="text-red-500" />
                        <span>Số điện thoại <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="0912 345 678"
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                        <Building size={14} className="text-red-500" />
                        <span>Trường học / Đơn vị <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        required
                        type="text"
                        value={form.organization}
                        onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                        placeholder="ĐH Quốc Gia, ĐH Bách Khoa..."
                        className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Referral Source */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Bạn biết tới show từ kênh nào? <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.referral_source}
                      onChange={(e) => setForm((f) => ({ ...f, referral_source: e.target.value }))}
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
                    >
                      <option value="">-- Chọn kênh tiếp cận --</option>
                      {referralOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#18181B]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                      <MessageSquare size={14} className="text-red-500" />
                      <span>Lời nhắn gửi ban nhạc (không bắt buộc)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.feedback}
                      onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
                      placeholder="Bài hát bạn mong muốn được nghe trong đêm diễn..."
                      className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-red-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* CTA Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-crimson py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Send size={18} />
                          <span>TIẾP TỤC ĐẾN BƯỚC THANH TOÁN</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: VietQR Payment & Proof */}
              {step === 'payment' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-white">Quét mã VietQR chuyển khoản</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Mở app ngân hàng bất kỳ để quét mã QR có sẵn số tiền và nội dung đơn.
                    </p>
                  </div>

                  {/* Order code card */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Mã đơn hàng
                      </div>
                      <div className="text-2xl font-black text-red-500 font-mono tracking-wider">
                        {orderCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(orderCode, 'code')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition-colors"
                    >
                      {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedCode ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* QR Image with Frame */}
                  <div className="text-center">
                    <div className="inline-block p-5 bg-white rounded-3xl shadow-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vietQRUrl}
                        alt="VietQR Code"
                        className="w-56 h-56 object-contain mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`Thanh toan 150000 VND cho ${ACCOUNT_NAME} - ${orderCode}`)}`
                        }}
                      />
                      <div className="mt-2 text-[11px] font-bold text-slate-800 tracking-wider">
                        QUÉT BẰNG MỌI ỨNG DỤNG NGÂN HÀNG
                      </div>
                    </div>
                  </div>

                  {/* Bank Info Table */}
                  <div className="bg-[#18181B] rounded-2xl p-4 sm:p-5 border border-white/10 text-xs sm:text-sm space-y-3 font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Ngân hàng:</span>
                      <span className="font-bold text-white">{BANK_ID}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-base">{ACCOUNT_NO}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(ACCOUNT_NO, 'bank')}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedBank ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Chủ tài khoản:</span>
                      <span className="font-bold text-white uppercase">{ACCOUNT_NAME}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Số tiền:</span>
                      <span className="font-black text-red-500 font-mono text-base">150.000đ</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-slate-400">Nội dung chuyển khoản:</span>
                      <span className="font-mono font-black text-red-400 bg-red-950/50 px-2 py-1 rounded border border-red-500/30">
                        {orderCode}
                      </span>
                    </div>
                  </div>

                  {/* Proof Upload Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Tải lên ảnh chụp màn hình biên lai chuyển khoản:
                    </label>
                    <label className="block border-2 border-dashed border-white/20 hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer bg-white/5 hover:bg-red-500/5 transition-all">
                      <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                      <span className="text-xs sm:text-sm text-slate-300 font-bold block">
                        {proofFile ? proofFile.name : 'Bấm vào đây để chọn ảnh chụp màn hình'}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Hỗ trợ PNG, JPG, JPEG (Tối đa 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {proofPreview && (
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proofPreview}
                        alt="Biên lai"
                        className="max-h-48 mx-auto rounded-xl object-contain shadow-lg"
                      />
                    </div>
                  )}

                  {/* Confirm Button */}
                  <button
                    type="button"
                    onClick={handleProofUpload}
                    disabled={proofUploading}
                    className="w-full btn-crimson py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {proofUploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        <span>TÔI ĐÃ CHUYỂN KHOẢN XONG</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 3: Success Screen */}
              {step === 'success' && (
                <div className="text-center space-y-6 py-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-600/20 text-red-500 flex items-center justify-center border-2 border-red-500 shadow-xl shadow-red-500/20">
                    <Check size={40} />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                      ĐẶT VÉ THÀNH CÔNG!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                      Cảm ơn bạn đã đồng hành cùng <strong className="text-white">Chess Night</strong>. Ban tổ chức đang đối chiếu giao dịch và sẽ phát hành vé điện tử có mã QR về email của bạn.
                    </p>
                  </div>

                  {/* Ticket Details Box */}
                  <div className="bg-[#18181B] border border-white/10 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3 font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Mã đơn hàng:</span>
                      <span className="font-mono font-black text-red-500 text-base">{orderCode}</span>
                    </div>
                    {luckyNumber && (
                      <div className="flex justify-between items-center bg-red-600/10 p-3 rounded-xl border border-red-500/30">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Sparkles size={16} className="text-red-400" />
                          <span>Số May Mắn Dự Thưởng:</span>
                        </span>
                        <span className="font-mono font-black text-red-400 text-lg">
                          #{luckyNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Trạng thái:</span>
                      <span className="font-bold text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
                        Đang Chờ Xác Nhận
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Email nhận vé:</span>
                      <span className="text-white font-mono">{emailInput || user?.email}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <Link
                      href="/my-tickets"
                      onClick={playClickSound}
                      className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <User size={16} />
                      <span>Xem Vé Của Tôi & QR</span>
                    </Link>

                    <Link
                      href="/"
                      onClick={playClickSound}
                      className="w-full btn-crimson font-bold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Về Trang Chủ</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer onBuyTicket={() => {}} />
      <MusicPlayer />
    </div>
  )
}
