'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Calendar, Phone, Building, Send, Check, Upload, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
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
  const { user, signInWithGoogle } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()
  const supabase = createClient()
  
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofUploading, setProofUploading] = useState(false)
  const [proofSubmitted, setProofSubmitted] = useState(false)
  
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

  const resetModal = useCallback(() => {
    setStep('form')
    setLoading(false)
    setError('')
    setOrderCode('')
    setTicketId('')
    setProofFile(null)
    setProofSubmitted(false)
    setForm({
      full_name: '',
      dob: '',
      gender: 'Nam',
      phone: '',
      organization: '',
      referral_source: '',
      feedback: '',
    })
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setTimeout(resetModal, 300)
    }
  }, [isOpen, resetModal])

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    
    if (!user) {
      signInWithGoogle()
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
          user_email: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi đặt vé')
      }

      setOrderCode(data.order_code)
      setTicketId(data.id)
      setStep('payment')
      playSuccessSound()
    } catch (err) {
      playErrorSound()
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleProofUpload = async () => {
    if (!proofFile || !ticketId) return
    
    playClickSound()
    setProofUploading(true)
    setError('')
    
    try {
      // Upload to Supabase Storage
      const fileExt = proofFile.name.split('.').pop()
      const fileName = `${ticketId}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile)
      
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)
      
      // Update ticket with proof URL
      await fetch('/api/tickets/proof', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          payment_proof_url: urlData.publicUrl,
        }),
      })
      
      setProofSubmitted(true)
      setStep('success')
      playSuccessSound()
    } catch (err) {
      playErrorSound()
      setError('Không thể upload ảnh. Vui lòng thử lại.')
    } finally {
      setProofUploading(false)
    }
  }

  const vietQRUrl = orderCode ? generateVietQRUrl(BANK_ID, ACCOUNT_NO, TICKET_PRICE, orderCode, ACCOUNT_NAME) : ''

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { playClickSound(); onClose() } }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass-dark rounded-2xl border border-[#D4AF37]/20 w-full max-w-lg 
                       max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="sticky top-0 glass-dark border-b border-[#D4AF37]/10 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-[#F5F2EB]">
                  {step === 'form' && 'Đặt Vé Tham Dự'}
                  {step === 'payment' && 'Thanh Toán'}
                  {step === 'success' && 'Hoàn Tất!'}
                </h2>
                <p className="text-xs text-[#A8A090]">Chess Night - Live Show Sinh Nhật CLB</p>
              </div>
              <button
                onClick={() => { playClickSound(); onClose() }}
                className="p-2 rounded-full hover:bg-white/10 text-[#A8A090] hover:text-[#F5F2EB] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2">
                {(['form', 'payment', 'success'] as Step[]).map((s, i) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${step === s || (i < ['form', 'payment', 'success'].indexOf(step))
                                      ? 'bg-[#D4AF37] text-[#121212]' 
                                      : 'bg-[#2A2A2A] text-[#A8A090]'}`}>
                      {i < ['form', 'payment', 'success'].indexOf(step) ? <Check size={14} /> : i + 1}
                    </div>
                    {i < 2 && <div className={`h-0.5 flex-1 transition-all ${i < ['form', 'payment', 'success'].indexOf(step) ? 'bg-[#D4AF37]' : 'bg-[#2A2A2A]'}`} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Login required */}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30"
                >
                  <p className="text-sm text-[#D4AF37]">
                    ⚠️ Vui lòng đăng nhập Google để đặt vé và nhận vé điện tử qua email.
                  </p>
                  <button
                    onClick={() => { playClickSound(); signInWithGoogle() }}
                    className="mt-2 text-xs text-[#121212] bg-[#D4AF37] px-3 py-1 rounded-full font-semibold hover:bg-[#e8c845] transition-colors"
                  >
                    Đăng nhập Google
                  </button>
                </motion.div>
              )}

              {/* STEP 1: Form */}
              {step === 'form' && (
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#A8A090] mb-1.5">
                      <User size={12} className="inline mr-1" />
                      Họ và tên *
                    </label>
                    <input
                      required
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 
                                 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  {/* DOB + Gender row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#A8A090] mb-1.5">
                        <Calendar size={12} className="inline mr-1" />
                        Ngày sinh *
                      </label>
                      <input
                        required
                        type="date"
                        value={form.dob}
                        onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-3 py-3 
                                   text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#A8A090] mb-1.5">
                        Giới tính *
                      </label>
                      <select
                        required
                        value={form.gender}
                        onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender }))}
                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-3 py-3 
                                   text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nu">Nữ</option>
                        <option value="Khac">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-[#A8A090] mb-1.5">
                      <Phone size={12} className="inline mr-1" />
                      Số điện thoại *
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 
                                 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="0912345678"
                    />
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-xs font-semibold text-[#A8A090] mb-1.5">
                      <Building size={12} className="inline mr-1" />
                      Trường/Đơn vị công tác *
                    </label>
                    <input
                      required
                      value={form.organization}
                      onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 
                                 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="Đại học Bách Khoa Hà Nội"
                    />
                  </div>

                  {/* Referral Source */}
                  <div>
                    <label className="block text-xs font-semibold text-[#A8A090] mb-1.5">
                      Bạn biết tới show từ kênh nào? *
                    </label>
                    <select
                      required
                      value={form.referral_source}
                      onChange={e => setForm(f => ({ ...f, referral_source: e.target.value }))}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 
                                 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] transition-colors"
                    >
                      <option value="">-- Chọn kênh --</option>
                      {referralOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-xs font-semibold text-[#A8A090] mb-1.5">
                      Lời nhắn / Góp ý (không bắt buộc)
                    </label>
                    <textarea
                      value={form.feedback}
                      onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))}
                      rows={3}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 
                                 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                      placeholder="Lời nhắn của bạn đến CLB..."
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  {/* Ticket price display */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                    <span className="text-sm text-[#A8A090]">Giá vé</span>
                    <span className="text-xl font-black text-[#D4AF37]">150.000đ</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !user}
                    className="w-full bg-[#D4AF37] hover:bg-[#e8c845] disabled:opacity-50 disabled:cursor-not-allowed
                               text-[#121212] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        Xác Nhận Đặt Vé
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* STEP 2: Payment */}
              {step === 'payment' && (
                <div className="space-y-6">
                  {/* Order info */}
                  <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-center">
                    <div className="text-xs text-[#A8A090] mb-1">Mã đơn hàng</div>
                    <div className="text-2xl font-black text-[#D4AF37]">{orderCode}</div>
                  </div>

                  {/* QR Code */}
                  <div className="text-center">
                    <p className="text-sm text-[#A8A090] mb-3">Quét mã QR để chuyển khoản</p>
                    <div className="inline-block p-3 bg-white rounded-2xl shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vietQRUrl}
                        alt="VietQR Payment"
                        className="w-56 h-56 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Chuyen khoan ${TICKET_PRICE} cho ${ACCOUNT_NAME} so TK ${ACCOUNT_NO} noi dung ${orderCode}`)}`
                        }}
                      />
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-[#A8A090]">
                      <div><span className="text-[#F5F2EB]">Ngân hàng:</span> {BANK_ID}</div>
                      <div><span className="text-[#F5F2EB]">Số TK:</span> {ACCOUNT_NO}</div>
                      <div><span className="text-[#F5F2EB]">Chủ TK:</span> {ACCOUNT_NAME}</div>
                      <div><span className="text-[#F5F2EB]">Số tiền:</span> <span className="text-[#D4AF37] font-bold">150.000đ</span></div>
                      <div><span className="text-[#F5F2EB]">Nội dung:</span> <span className="text-[#D4AF37]">Thanh toan ve {orderCode}</span></div>
                    </div>
                  </div>

                  {/* Proof upload */}
                  <div>
                    <p className="text-sm font-semibold text-[#F5F2EB] mb-3">
                      Tải lên ảnh chụp màn hình chuyển khoản
                    </p>
                    <label className="block border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-6 text-center 
                                     cursor-pointer hover:border-[#D4AF37]/60 transition-colors">
                      <Upload size={24} className="mx-auto mb-2 text-[#D4AF37]" />
                      <span className="text-sm text-[#A8A090]">
                        {proofFile ? proofFile.name : 'Chọn ảnh minh chứng thanh toán'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => setProofFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProofUpload}
                    disabled={!proofFile || proofUploading}
                    className="w-full bg-[#D4AF37] hover:bg-[#e8c845] disabled:opacity-50 disabled:cursor-not-allowed
                               text-[#121212] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {proofUploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        Tôi Đã Thanh Toán
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* STEP 3: Success */}
              {step === 'success' && (
                <div className="text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-20 h-20 mx-auto rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] 
                               flex items-center justify-center glow-gold"
                  >
                    <Check size={36} className="text-[#D4AF37]" />
                  </motion.div>

                  <div>
                    <h3 className="text-xl font-black text-[#F5F2EB] mb-2">Đặt vé thành công! 🎉</h3>
                    <p className="text-sm text-[#A8A090] mb-4">
                      Chúng tôi đã nhận được đơn đặt vé của bạn.
                    </p>
                    <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      <div className="text-xs text-[#A8A090]">Mã đơn hàng</div>
                      <div className="text-xl font-black text-[#D4AF37]">{orderCode}</div>
                    </div>
                  </div>

                  <div className="text-sm text-[#A8A090] space-y-2 text-left">
                    <p>✅ Đơn hàng đang chờ Admin xác nhận thanh toán.</p>
                    <p>📧 Vé điện tử sẽ được gửi đến email của bạn sau khi xác nhận.</p>
                    <p>🔢 Số may mắn Minigame sẽ hiển thị trong mục &quot;Vé của tôi&quot;.</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { playClickSound(); window.location.href = '/my-tickets' }}
                      className="flex-1 bg-[#D4AF37] text-[#121212] font-bold py-3 rounded-xl text-sm hover:bg-[#e8c845] transition-colors"
                    >
                      Xem Vé Của Tôi
                    </button>
                    <button
                      onClick={() => { playClickSound(); onClose() }}
                      className="flex-1 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold py-3 rounded-xl text-sm hover:bg-[#D4AF37]/10 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
