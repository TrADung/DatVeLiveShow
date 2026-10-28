'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
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
  Sparkles,
  Copy,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { generateVietQRUrl } from '@/lib/utils'
import type { BookingFormData, Gender } from '@/types'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'form' | 'payment' | 'success'

const referralOptions = [
  'Facebook CLB',
  'TikTok',
  'Bạn bè giới thiệu',
  'Poster/Banner trường',
  'Khác',
]

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
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

  const TICKET_PRICE = 89000
  const BANK_ID = process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'TCB'
  const ACCOUNT_NO = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '2611102006'
  const ACCOUNT_NAME = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'TRAN ANH DUNG'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Autofill user details
  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email)
    }
    if (user?.user_metadata?.full_name) {
      setForm((f) => ({ ...f, full_name: user.user_metadata.full_name || f.full_name }))
    }
  }, [user])

  const resetModal = useCallback(() => {
    setStep('form')
    setLoading(false)
    setError('')
    setOrderCode('')
    setTicketId('')
    setLuckyNumber(null)
    setProofFile(null)
    setProofPreview(null)
    setForm({
      full_name: user?.user_metadata?.full_name || '',
      dob: '',
      gender: 'Nam',
      phone: '',
      organization: '',
      referral_source: '',
      feedback: '',
    })
  }, [user])

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(resetModal, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, resetModal])

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
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo vé')
      }

      setOrderCode(data.order_code)
      setTicketId(data.id)
      setLuckyNumber(data.lucky_number || null)
      setStep('payment')
      playSuccessSound()
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
        } catch {}
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

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[94vw] sm:w-full max-w-lg md:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D4AF37]/30 bg-[#1A1A1A] text-white shadow-2xl my-auto flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141414] shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-xl text-[#D4AF37]">♟</span>
                <div>
                  <h3 className="text-sm font-black tracking-wider uppercase text-white">
                    {step === 'form' && 'ĐẶT VÉ LIVE CONCERT'}
                    {step === 'payment' && 'THANH TOÁN VIETQR'}
                    {step === 'success' && 'ĐẶT VÉ THÀNH CÔNG'}
                  </h3>
                  <p className="text-[11px] text-[#D4AF37] font-medium">SẮC I. VÁN CỜ • 07/11/2026</p>
                </div>
              </div>
              <button
                onClick={() => { playClickSound(); onClose() }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step indicators */}
            <div className="px-6 py-3 bg-[#111111] border-b border-white/5 shrink-0">
              <div className="flex items-center justify-between">
                {[
                  { id: 'form', label: '1. Thông tin' },
                  { id: 'payment', label: '2. Thanh toán' },
                  { id: 'success', label: '3. Nhận vé' },
                ].map((s, idx) => {
                  const isActive = step === s.id
                  const isPast =
                    (step === 'payment' && idx === 0) ||
                    (step === 'success' && (idx === 0 || idx === 1))
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/30'
                            : isPast
                            ? 'bg-[#E53935] text-white'
                            : 'bg-white/10 text-neutral-500'
                        }`}
                      >
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-bold ${isActive ? 'text-[#D4AF37]' : isPast ? 'text-white' : 'text-neutral-500'}`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {step === 'form' && (
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                      <User size={13} className="text-[#D4AF37]" />
                      <span>Họ và tên <span className="text-[#E53935]">*</span></span>
                    </label>
                    <input
                      required
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all font-medium"
                    />
                  </div>

                  {/* Email (Khóa theo tài khoản Google đã đăng nhập) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
                        <Mail size={13} className="text-[#D4AF37]" />
                        <span>Email nhận vé điện tử <span className="text-[#E53935]">*</span></span>
                      </label>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ Google đã xác thực
                      </span>
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full bg-[#18181B] opacity-90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all font-mono cursor-not-allowed select-all"
                    />
                  </div>

                  {/* DOB & Gender */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                        <Calendar size={13} className="text-[#D4AF37]" />
                        <span>Ngày sinh <span className="text-[#E53935]">*</span></span>
                      </label>
                      <input
                        required
                        type="date"
                        value={form.dob}
                        onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                        max="2026-12-31"
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
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
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nu">Nữ</option>
                        <option value="Khac">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone & Organization */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                        <Phone size={13} className="text-[#D4AF37]" />
                        <span>Số điện thoại <span className="text-[#E53935]">*</span></span>
                      </label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="0912 345 678"
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                        <Building size={13} className="text-[#D4AF37]" />
                        <span>Trường / Đơn vị <span className="text-[#E53935]">*</span></span>
                      </label>
                      <input
                        required
                        type="text"
                        value={form.organization}
                        onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                        placeholder="ĐH Ngoại Thương..."
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                  </div>

                  {/* Referral Source */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Bạn biết tới show từ đâu? <span className="text-[#E53935]">*</span>
                    </label>
                    <select
                      required
                      value={form.referral_source}
                      onChange={(e) => setForm((f) => ({ ...f, referral_source: e.target.value }))}
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all cursor-pointer"
                    >
                      <option value="">-- Chọn kênh tiếp cận --</option>
                      {referralOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 mb-1.5">
                      <MessageSquare size={13} className="text-[#D4AF37]" />
                      <span>Lời nhắn gửi ban nhạc (không bắt buộc)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.feedback}
                      onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
                      placeholder="Bài hát bạn mong muốn được nghe..."
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all resize-none font-normal"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-red-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Price Box */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                    <span className="text-xs font-bold text-neutral-300">Tổng thanh toán (1 vé):</span>
                    <span className="text-xl font-black text-[#D4AF37] font-mono">89.000 VND</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-velvet py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        <span>TIẾP TỤC ĐẾN BƯỚC THANH TOÁN</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === 'payment' && (
                <div className="space-y-4 text-center">
                  <div className="p-3 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Mã đơn hàng</div>
                      <div className="text-xl font-black text-[#D4AF37] font-mono">{orderCode}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(orderCode, 'code')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-300"
                    >
                      {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedCode ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* VietQR Frame */}
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vietQRUrl}
                      alt="VietQR Code"
                      className="w-48 h-48 object-contain mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Thanh toan 89000 VND cho ${ACCOUNT_NAME} - ${orderCode}`)}`
                      }}
                    />
                    <div className="mt-1.5 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      Quét bằng app ngân hàng bất kỳ
                    </div>
                  </div>

                  {/* Banking Info */}
                  <div className="bg-[#141414] rounded-xl p-3.5 border border-white/10 text-xs text-left space-y-2 font-medium">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Ngân hàng:</span>
                      <span className="font-bold text-white">{BANK_ID}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white">{ACCOUNT_NO}</span>
                        <button onClick={() => copyToClipboard(ACCOUNT_NO, 'bank')} className="text-neutral-400 hover:text-white">
                          {copiedBank ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Chủ tài khoản:</span>
                      <span className="font-bold text-white uppercase">{ACCOUNT_NAME}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Số tiền:</span>
                      <span className="font-black text-[#D4AF37] font-mono">89.000 VND</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/10">
                      <span className="text-neutral-400">Nội dung chuyển khoản:</span>
                      <span className="font-mono font-black text-[#E53935] bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                        {orderCode}
                      </span>
                    </div>
                  </div>

                  {/* Proof upload (BẮT BUỘC) */}
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-neutral-300">
                        Ảnh chụp màn hình chuyển khoản:
                      </label>
                      <span className="text-[10px] font-black uppercase text-red-500 bg-red-950/30 px-2 py-0.5 rounded border border-red-500/30">
                        * Bắt buộc
                      </span>
                    </div>
                    <label className={`block border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                      proofFile || proofPreview
                        ? 'border-emerald-500 bg-emerald-950/15'
                        : 'border-white/20 hover:border-[#D4AF37] bg-white/5 hover:bg-[#D4AF37]/5'
                    }`}>
                      <Upload size={20} className={`mx-auto mb-1 ${proofFile || proofPreview ? 'text-emerald-400' : 'text-neutral-400'}`} />
                      <span className="text-xs text-neutral-300 font-semibold block">
                        {proofFile ? proofFile.name : 'Tải ảnh biên lai chuyển khoản'}
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
                    <div className="p-2 bg-white/5 rounded-xl text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={proofPreview} alt="Biên lai" className="max-h-32 mx-auto rounded-lg object-contain" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProofUpload}
                    disabled={proofUploading || (!proofFile && !proofPreview)}
                    className="w-full btn-velvet py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {proofUploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        <span>TÔI ĐÃ CHUYỂN KHOẢN XONG</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-5 py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center border-2 border-emerald-500 shadow-xl">
                    <Check size={32} />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white mb-1">ĐẶT VÉ THÀNH CÔNG!</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      Hệ thống đã tiếp nhận thông tin đơn vé. Ban tổ chức sẽ đối chiếu và gửi vé điện tử về email của bạn.
                    </p>
                  </div>

                  <div className="bg-[#141414] border border-white/10 rounded-xl p-4 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Mã đơn hàng:</span>
                      <span className="font-mono font-black text-[#D4AF37]">{orderCode}</span>
                    </div>
                    {luckyNumber !== null && luckyNumber !== undefined && (
                      <div className="flex justify-between items-center bg-[#D4AF37]/10 p-2.5 rounded-lg border border-[#D4AF37]/30">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Sparkles size={14} className="text-[#D4AF37]" />
                          <span>Số May Mắn Minigame:</span>
                        </span>
                        <span className="font-mono font-black text-[#D4AF37] text-base">#{String(luckyNumber).padStart(3, '0')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Trạng thái:</span>
                      <span className="font-bold text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        Chờ xác nhận
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200/90 text-xs text-left flex items-start gap-2.5">
                    <span className="text-sm shrink-0">📬</span>
                    <div className="leading-snug text-[11px]">
                      <strong className="text-amber-300 font-bold block mb-0.5">Lưu ý kiểm tra hộp thư:</strong>
                      Nếu không thấy email vé gửi về Hộp thư đến, bạn vui lòng kiểm tra tại mục <strong>Thư rác (Spam)</strong> nhé!
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/my-tickets"
                      onClick={() => { playClickSound(); onClose() }}
                      className="flex-1 bg-white text-black font-bold py-3 rounded-xl text-xs hover:bg-neutral-200 transition-colors text-center"
                    >
                      Xem Vé Của Tôi
                    </Link>
                    <button
                      onClick={() => { playClickSound(); onClose() }}
                      className="flex-1 btn-gold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
