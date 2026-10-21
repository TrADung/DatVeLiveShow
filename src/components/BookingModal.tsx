'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Calendar, Phone, Building, Send, Check, Upload, Loader2, AlertCircle, Mail, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { generateOrderCode, generateVietQRUrl } from '@/lib/utils'
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

  // Autofill if logged in
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
      setTimeout(resetModal, 300)
    }
  }, [isOpen, resetModal])

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
    setProofUploading(true)
    setError('')

    try {
      let finalProofUrl = proofPreview || 'https://via.placeholder.com/400x300.png?text=Payment+Proof'

      // Try uploading to Supabase Storage if file is present
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
        } catch {
          // Fallback to inline preview if storage bucket not yet created
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
    } catch {
      playErrorSound()
      // Even if upload has issue, advance to success with order code
      setStep('success')
    } finally {
      setProofUploading(false)
    }
  }

  const vietQRUrl = orderCode
    ? generateVietQRUrl(BANK_ID, ACCOUNT_NO, TICKET_PRICE, orderCode, ACCOUNT_NAME)
    : ''

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl text-red-500">♟</span>
                <div>
                  <h3 className="text-base font-black tracking-wide uppercase">
                    {step === 'form' && 'Đặt Vé Tham Dự Live Show'}
                    {step === 'payment' && 'Thanh Toán VietQR'}
                    {step === 'success' && 'Đặt Vé Thành Công!'}
                  </h3>
                  <p className="text-[11px] text-slate-300">Chess Night - 31/12/2025 • Hà Nội</p>
                </div>
              </div>
              <button
                onClick={() => { playClickSound(); onClose() }}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex items-center justify-between">
                {[
                  { id: 'form', label: '1. Thông tin' },
                  { id: 'payment', label: '2. Thanh toán' },
                  { id: 'success', label: '3. Hoàn tất' },
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
                            ? 'bg-red-600 text-white shadow-xs'
                            : isPast
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-bold ${isActive ? 'text-red-600' : isPast ? 'text-slate-900' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-6">
              {/* STEP 1: Registration Form */}
              {step === 'form' && (
                <form onSubmit={handleSubmitForm} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={form.full_name}
                        onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                        placeholder="Nguyễn Văn A"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email nhận vé điện tử <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="tenban@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* DOB & Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="date"
                          value={form.dob}
                          onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={form.gender}
                        onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nu">Nữ</option>
                        <option value="Khac">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone & Organization */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="0912345678"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Trường / Đơn vị <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="text"
                          value={form.organization}
                          onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                          placeholder="ĐH Ngoại Thương..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Referral Source */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bạn biết tới show từ đâu? <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.referral_source}
                      onChange={(e) => setForm((f) => ({ ...f, referral_source: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                    >
                      <option value="">-- Chọn kênh tiếp cận --</option>
                      {referralOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lời nhắn gửi ban nhạc (không bắt buộc)
                    </label>
                    <textarea
                      rows={2}
                      value={form.feedback}
                      onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
                      placeholder="Bài hát bạn mong muốn được nghe..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50 border border-red-200">
                    <span className="text-xs font-bold text-slate-700">Tổng thanh toán (1 vé):</span>
                    <span className="text-xl font-black text-red-600">150.000đ</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        <span>TIẾP TỤC THANH TOÁN</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: VietQR Payment */}
              {step === 'payment' && (
                <div className="space-y-5 text-center">
                  <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase">Mã Đơn Hàng Của Bạn</div>
                    <div className="text-2xl font-black text-red-600 font-mono tracking-wider">{orderCode}</div>
                  </div>

                  {/* VietQR Code */}
                  <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vietQRUrl}
                      alt="VietQR Code"
                      className="w-48 h-48 object-contain mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Thanh toan ${TICKET_PRICE} VND cho ${ACCOUNT_NAME} - ${orderCode}`)}`
                      }}
                    />
                    <div className="mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Quét bằng ứng dụng ngân hàng bất kỳ
                    </div>
                  </div>

                  {/* Bank Transfer Info */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ngân hàng:</span>
                      <span className="font-bold text-slate-900">{BANK_ID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">{ACCOUNT_NO}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-900">{ACCOUNT_NAME}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số tiền:</span>
                      <span className="font-black text-red-600 text-sm">150.000đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nội dung chuyển:</span>
                      <span className="font-black text-red-600 font-mono bg-red-50 px-2 py-0.5 rounded">
                        Thanh toan ve {orderCode}
                      </span>
                    </div>
                  </div>

                  {/* Proof upload */}
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Ảnh chụp màn hình chuyển khoản thành công:
                    </label>
                    <label className="block border-2 border-dashed border-slate-300 hover:border-red-600 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-red-50/20 transition-all">
                      <Upload size={22} className="mx-auto mb-1.5 text-slate-400" />
                      <span className="text-xs text-slate-600 font-semibold block">
                        {proofFile ? proofFile.name : 'Bấm để tải ảnh biên lai chuyển khoản'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">PNG, JPG hoặc ảnh chụp màn hình</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {proofPreview && (
                    <div className="p-2 bg-slate-100 rounded-xl text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={proofPreview} alt="Biên lai" className="max-h-36 mx-auto rounded-lg object-contain shadow-xs" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProofUpload}
                    disabled={proofUploading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                  >
                    {proofUploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        <span>TÔI ĐÃ CHUYỂN KHOẢN THÀNH CÔNG</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 3: Success Screen */}
              {step === 'success' && (
                <div className="text-center space-y-6 py-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center border-2 border-red-600 shadow-md">
                    <Check size={32} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">ĐẶT VÉ THÀNH CÔNG!</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Hệ thống đã ghi nhận đơn vé của bạn. Ban tổ chức sẽ đối chiếu và gửi vé điện tử qua email.
                    </p>
                  </div>

                  {/* Ticket Details card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã đơn hàng:</span>
                      <span className="font-black text-red-600 font-mono text-sm">{orderCode}</span>
                    </div>
                    {luckyNumber && (
                      <div className="flex justify-between items-center bg-red-50 p-2 rounded-xl border border-red-200">
                        <span className="font-bold text-slate-700">🎰 Số May Mắn Minigame:</span>
                        <span className="font-black text-red-600 text-base font-mono">#{luckyNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trạng thái:</span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Chờ Admin xác nhận
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { playClickSound(); window.location.href = '/my-tickets' }}
                      className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Xem Vé Của Tôi
                    </button>
                    <button
                      onClick={() => { playClickSound(); onClose() }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
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
    </AnimatePresence>
  )
}
