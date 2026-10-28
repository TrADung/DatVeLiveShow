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
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { generateVietQRUrl, formatCurrency } from '@/lib/utils'
import { EVENT_INFO } from '@/lib/constants'
import VenueBadge from '@/components/VenueBadge'
import AuthModal from '@/components/AuthModal'
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
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
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

  const TICKET_PRICE = EVENT_INFO.ticketPrice || 89000
  const BANK_ID = process.env.NEXT_PUBLIC_VIETQR_BANK_ID || EVENT_INFO.bankId || 'TPB'
  const ACCOUNT_NO = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || EVENT_INFO.bankAccountNo || '00000498382'
  const ACCOUNT_NAME = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || EVENT_INFO.bankAccountName || 'PHAN THI BICH NGOC'

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
    if (!proofFile && !proofPreview) {
      setError('Vui lòng tải lên ảnh chụp biên lai/bill chuyển khoản để hoàn tất đặt vé!')
      playErrorSound()
      return
    }
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
    <div className="theme-page-bg relative w-full min-h-screen text-slate-900 dark:text-white flex flex-col">
      <Header />

      <main className="relative w-full flex-1 block pt-8 sm:pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            onClick={playClickSound}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-400 hover:text-[#D4AF37] transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Quay lại Trang Chủ</span>
          </Link>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Event Details & Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-chess rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl text-[#D4AF37]">♟</span>
                <span className="text-xs font-black tracking-widest text-[#D4AF37] uppercase">
                  SẮC I. VÁN CỜ
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-pulse ml-auto" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                Live Show Sinh Nhật CLB Âm Nhạc
              </h1>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                Đêm nhạc tôn vinh nghệ thuật giao thoa giữa giai điệu Acoustic mộc mạc và phong cách Bàn Cờ Vua đương đại. Số lượng vé phát hành có giới hạn!
              </p>

              {/* Event Meta List */}
              <div className="space-y-3.5 pt-4 border-t border-white/10 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-neutral-400 text-[11px] uppercase font-bold tracking-wider">Thời gian</div>
                    <div className="font-bold text-white">{EVENT_INFO.eventDate} • {EVENT_INFO.eventTime}</div>
                  </div>
                </div>

                <div className="pt-1">
                  <VenueBadge className="w-full" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Music size={16} />
                  </div>
                  <div>
                    <div className="text-neutral-400 text-[11px] uppercase font-bold tracking-wider">Trình diễn</div>
                    <div className="font-bold text-white">Acoustic Set + Full Band Live + Khách Mời</div>
                  </div>
                </div>
              </div>

              {/* Price Box Only (Perks List removed per request) */}
              <div className="mt-6 p-4.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Giá Vé</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Đã bao gồm nước</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-[#8A6508] dark:text-[#D4AF37] font-mono">89.000 VND</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">1 vé / người • Đã bao gồm nước</div>
                </div>
              </div>
            </div>

            {/* Assistance card */}
            <div className="card-chess rounded-2xl p-4 sm:p-5 text-xs text-neutral-400 flex items-center gap-3">
              <ShieldCheck size={24} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-white font-bold block">Bảo đảm & Hỗ trợ đặt vé</span>
                <span>Cần hỗ trợ thanh toán? Liên hệ hotline CLB: <a href="tel:0362161480" className="text-white font-bold hover:text-[#D4AF37] underline transition-colors">0362161480 (Bích Ngọc - Chủ Nhiệm)</a></span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3-Step Interactive Checkout Form */}
          <div className="lg:col-span-7">
            <div className="card-chess rounded-3xl p-6 sm:p-8 relative">
              {authLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 size={36} className="animate-spin text-[#D4AF37] mb-3" />
                  <span className="text-sm font-semibold text-neutral-400">Đang kiểm tra tài khoản...</span>
                </div>
              ) : !user ? (
                /* YÊU CẦU ĐĂNG NHẬP ĐỂ ĐẶT VÉ */
                <div className="text-center py-4 sm:py-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-5 text-[#D4AF37] shadow-xl">
                    <Mail size={32} />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider mb-3">
                    <ShieldCheck size={14} />
                    <span>Yêu Cầu Xác Thực Email</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
                    Đăng Nhập Để Đặt Vé
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed mb-6">
                    Hệ thống cần tài khoản Google của bạn để tự động gửi <strong className="text-white">Vé điện tử</strong>, <strong className="text-white">Mã QR Check-in</strong> và <strong className="text-white">Mã bốc thăm trúng thưởng</strong> về hộp thư chính chủ.
                  </p>

                  {/* Lợi ích khi đăng nhập */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-left mb-6 max-w-md mx-auto space-y-3">
                    <div className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>Vé được lưu vĩnh viễn trong mục <strong>&ldquo;Vé Của Tôi&rdquo;</strong>, không lo mất mã QR.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>Đảm bảo email nhận vé chính xác 100%, tránh nhầm lẫn hoặc gõ sai địa chỉ nhận vé.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>Check-in và nhận vòng tay nhanh chóng tại quầy đón tiếp sự kiện.</span>
                    </div>
                  </div>

                  {/* Nút Đăng nhập Google */}
                  <div className="space-y-3 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={async () => {
                        playClickSound()
                        await signInWithGoogle()
                      }}
                      className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all cursor-pointer group active:scale-98"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>ĐĂNG NHẬP GOOGLE ĐỂ ĐẶT VÉ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playClickSound()
                        setAuthModalOpen(true)
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Hoặc đăng nhập bằng Email / Mật khẩu
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                              ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/40 ring-4 ring-[#D4AF37]/20 font-black'
                              : isPast
                              ? 'bg-[#E53935] text-white font-black'
                              : 'bg-white/10 text-neutral-500'
                          }`}
                        >
                          {isPast ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-bold hidden sm:inline ${
                            isActive ? 'text-[#D4AF37]' : isPast ? 'text-neutral-300' : 'text-neutral-500'
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
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Vé điện tử và mã QR check-in sẽ được gửi trực tiếp đến địa chỉ email này.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                      <User size={14} className="text-[#D4AF37]" />
                      <span>Họ và tên <span className="text-[#E53935]">*</span></span>
                    </label>
                    <input
                      required
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>

                  {/* Email (Khóa theo tài khoản Google đã xác thực) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
                        <Mail size={14} className="text-[#D4AF37]" />
                        <span>Email nhận vé điện tử <span className="text-[#E53935]">*</span></span>
                      </label>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        <span>Tài khoản Google đã xác thực</span>
                      </span>
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full bg-[#18181B] dark:bg-[#18181B] opacity-90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono cursor-not-allowed select-all"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Vé điện tử và mã QR check-in sẽ được gửi trực tiếp đến địa chỉ email này sau khi ban tổ chức duyệt bill.
                    </p>
                  </div>

                  {/* DOB & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                        <Calendar size={14} className="text-[#D4AF37]" />
                        <span>Ngày tháng năm sinh <span className="text-[#E53935]">*</span></span>
                      </label>
                      <input
                        required
                        type="date"
                        value={form.dob}
                        onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                        max="2026-12-31"
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                        Giới tính <span className="text-[#E53935]">*</span>
                      </label>
                      <select
                        required
                        value={form.gender}
                        onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all cursor-pointer"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nu">Nữ</option>
                        <option value="Khac">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                      <Phone size={14} className="text-[#D4AF37]" />
                      <span>Số điện thoại <span className="text-[#E53935]">*</span></span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="0912 345 678"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>

                  {/* Referral Source */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Bạn biết tới show từ kênh nào? <span className="text-[#E53935]">*</span>
                    </label>
                    <select
                      required
                      value={form.referral_source}
                      onChange={(e) => setForm((f) => ({ ...f, referral_source: e.target.value }))}
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all cursor-pointer"
                    >
                      <option value="">-- Chọn kênh tiếp cận --</option>
                      {referralOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#1C1C1E]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                      <MessageSquare size={14} className="text-[#D4AF37]" />
                      <span>Lời nhắn gửi ban nhạc (không bắt buộc)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.feedback}
                      onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
                      placeholder="Bài hát bạn mong muốn được nghe trong đêm diễn..."
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-red-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* CTA Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-velvet py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Mở app ngân hàng bất kỳ để quét mã QR có sẵn số tiền và nội dung đơn.
                    </p>
                  </div>

                  {/* Order code card */}
                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Mã đơn hàng
                      </div>
                      <div className="text-2xl font-black text-[#D4AF37] font-mono tracking-wider">
                        {orderCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(orderCode, 'code')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-neutral-300 transition-colors"
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
                          (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`Thanh toan 89000 VND cho ${ACCOUNT_NAME} - ${orderCode}`)}`
                        }}
                      />
                      <div className="mt-2 text-[11px] font-bold text-slate-800 tracking-wider">
                        QUÉT BẰNG MỌI ỨNG DỤNG NGÂN HÀNG
                      </div>
                    </div>
                  </div>

                  {/* Bank Info Table */}
                  <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-white/10 text-xs sm:text-sm space-y-3 font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Ngân hàng:</span>
                      <span className="font-bold text-white">{BANK_ID}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-base">{ACCOUNT_NO}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(ACCOUNT_NO, 'bank')}
                          className="text-neutral-400 hover:text-white"
                        >
                          {copiedBank ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Chủ tài khoản:</span>
                      <span className="font-bold text-white uppercase">{ACCOUNT_NAME}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Số tiền:</span>
                      <span className="font-black text-[#D4AF37] font-mono text-base">89.000 VND</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-neutral-400">Nội dung chuyển khoản:</span>
                      <span className="font-mono font-black text-[#E53935] bg-red-950/40 px-2 py-1 rounded border border-red-500/30">
                        {orderCode}
                      </span>
                    </div>
                  </div>

                  {/* Proof Upload Area (BẮT BUỘC) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-neutral-300">
                        Ảnh chụp màn hình biên lai chuyển khoản:
                      </label>
                      <span className="text-[10px] font-black uppercase text-red-500 bg-red-950/30 px-2 py-0.5 rounded border border-red-500/30">
                        * Bắt buộc
                      </span>
                    </div>
                    <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      proofFile || proofPreview
                        ? 'border-emerald-500 bg-emerald-950/15'
                        : 'border-white/20 hover:border-[#D4AF37] bg-white/5 hover:bg-[#D4AF37]/5'
                    }`}>
                      <Upload size={24} className={`mx-auto mb-2 ${proofFile || proofPreview ? 'text-emerald-400' : 'text-neutral-400'}`} />
                      <span className="text-xs sm:text-sm text-neutral-300 font-bold block">
                        {proofFile ? proofFile.name : 'Bấm vào đây để chọn ảnh chụp màn hình biên lai'}
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-1">
                        Hỗ trợ PNG, JPG, JPEG (Tối đa 10MB) • Bắt buộc tải ảnh để hoàn tất đặt vé
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
                    disabled={proofUploading || (!proofFile && !proofPreview)}
                    className="w-full btn-velvet py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
                  >
                    {proofUploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        <span>XÁC NHẬN ĐÃ CHUYỂN KHOẢN</span>
                      </>
                    )}
                  </button>
                  {!proofFile && !proofPreview && (
                    <p className="text-center text-[11px] text-amber-500 font-medium -mt-2">
                      ⚠️ Bạn cần tải lên ảnh biên lai chuyển khoản trước khi bấm xác nhận.
                    </p>
                  )}
                </div>
              )}

              {/* STEP 3: Success Screen */}
              {step === 'success' && (
                <div className="text-center space-y-6 py-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center border-2 border-emerald-500 shadow-xl shadow-emerald-500/20">
                    <Check size={40} />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                      ĐẶT VÉ THÀNH CÔNG!
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                      Cảm ơn bạn đã đồng hành cùng <strong className="text-white">SẮC I. VÁN CỜ</strong>. Ban tổ chức đang đối chiếu giao dịch và sẽ phát hành vé điện tử có mã QR về email của bạn.
                    </p>
                  </div>

                  {/* Ticket Details Box */}
                  <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3 font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Mã đơn hàng:</span>
                      <span className="font-mono font-black text-[#D4AF37] text-base">{orderCode}</span>
                    </div>
                    {luckyNumber !== null && luckyNumber !== undefined && (
                      <div className="flex justify-between items-center bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/30">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Sparkles size={16} className="text-[#D4AF37]" />
                          <span>Số May Mắn Dự Thưởng:</span>
                        </span>
                        <span className="font-mono font-black text-[#D4AF37] text-lg">
                          #{String(luckyNumber).padStart(3, '0')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Trạng thái:</span>
                      <span className="font-bold text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
                        Đang Chờ Xác Nhận
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Email nhận vé:</span>
                      <span className="text-white font-mono">{emailInput || user?.email}</span>
                    </div>
                  </div>

                  {/* Spam folder notice */}
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200/90 text-xs text-left flex items-start gap-3 shadow-md">
                    <span className="text-base shrink-0">📬</span>
                    <div className="leading-relaxed">
                      <strong className="text-amber-300 font-bold block mb-0.5">Lưu ý kiểm tra hộp thư:</strong>
                      Nếu không thấy email vé gửi về Hộp thư đến (Inbox), bạn vui lòng kiểm tra tại mục <strong>Thư rác (Spam)</strong> hoặc tab <strong>Quảng cáo</strong> nhé!
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <Link
                      href="/my-tickets"
                      onClick={playClickSound}
                      className="w-full bg-white text-black hover:bg-neutral-200 font-bold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <User size={16} />
                      <span>Xem Vé Của Tôi & QR</span>
                    </Link>

                    <Link
                      href="/"
                      onClick={playClickSound}
                      className="w-full btn-gold font-bold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Về Trang Chủ</span>
                    </Link>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal fallback */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <Footer onBuyTicket={() => {}} />
    </div>
  )
}
