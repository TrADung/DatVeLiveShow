'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Upload,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { compressImage } from '@/lib/imageCompression'
import { generateOrderCode } from '@/lib/utils'

interface DevCreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (ticket: any) => void
}

export default function DevCreateTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: DevCreateTicketModalProps) {
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('2004-01-01')
  const [gender, setGender] = useState<'Nam' | 'Nu' | 'Khac'>('Nam')
  const [organization, setOrganization] = useState('Tự do')
  const [orderCode, setOrderCode] = useState(() => generateOrderCode())
  const [amount, setAmount] = useState('89000')
  const [luckyNumber, setLuckyNumber] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid')
  const [notes, setNotes] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleRandomCode = () => {
    playClickSound()
    setOrderCode(generateOrderCode())
  }

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setProofFile(null)
      setProofPreview(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, JPEG).')
      playErrorSound()
      return
    }

    setError('')
    setCompressing(true)

    try {
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
        mimeType: 'image/jpeg',
      })
      setProofFile(compressed)

      const reader = new FileReader()
      reader.onload = (e) => setProofPreview(e.target?.result as string)
      reader.readAsDataURL(compressed)
    } catch {
      setProofFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setProofPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } finally {
      setCompressing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()

    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và tên khách hàng.')
      playErrorSound()
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ để nhận vé điện tử.')
      playErrorSound()
      return
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại khách hàng.')
      playErrorSound()
      return
    }
    if (!dob) {
      setError('Vui lòng chọn ngày tháng năm sinh.')
      playErrorSound()
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('full_name', fullName.trim())
      fd.append('user_email', email.trim().toLowerCase())
      fd.append('phone', phone.trim())
      fd.append('dob', dob)
      fd.append('gender', gender)
      fd.append('organization', organization.trim() || 'Tự do')
      fd.append('order_code', orderCode.trim().toUpperCase())
      fd.append('amount', amount.trim() || '89000')
      fd.append('payment_status', paymentStatus)
      if (luckyNumber.trim()) {
        fd.append('lucky_number', luckyNumber.trim())
      }
      if (notes.trim()) {
        fd.append('feedback', notes.trim())
      }
      if (proofFile) {
        fd.append('file', proofFile)
      }

      const res = await fetch('/api/admin/manual-ticket', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo vé')
      }

      playSuccessSound()
      onSuccess(data.ticket)
      onClose()
    } catch (err: any) {
      playErrorSound()
      setError(err?.message || 'Có lỗi xảy ra khi kết nối máy chủ.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#121214] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl text-white my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>DEV SPECIAL PERK</span>
                </span>
                <span className="text-xs text-neutral-400 font-medium">Đối chiếu & Cấp vé thủ công</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>Tạo Vé Thủ Công</span>
                <Sparkles size={18} className="text-[#D4AF37]" />
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tự động cấp Số may mắn, sinh mã QR check-in hợp lệ và đưa vào danh sách gửi email vé chung.
              </p>
            </div>
            <button
              onClick={() => { playClickSound(); onClose() }}
              className="p-2 text-neutral-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: Tên & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Họ và tên khách hàng <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Email nhận vé điện tử <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="khachhang@gmail.com"
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: SĐT, Ngày sinh & Giới tính */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Ngày sinh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Giới tính
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nu">Nữ</option>
                  <option value="Khac">Khác</option>
                </select>
              </div>
            </div>

            {/* Row 3: Mã đơn & Số may mắn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-300">
                    Mã đơn hàng
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomCode}
                    className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw size={11} />
                    <span>Sinh mã mới</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                  placeholder="CLB-XXXXXXX"
                  className="w-full bg-[#141416] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#D4AF37] focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Số may mắn (000 - 999)
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={luckyNumber}
                  onChange={(e) => setLuckyNumber(e.target.value)}
                  placeholder="Để trống để tự động cấp số"
                  className="w-full bg-[#141416] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400 placeholder:font-normal placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Row 4: Đơn vị / Trường & Trạng thái thanh toán */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Đơn vị / Trường
                </label>
                <div className="relative">
                  <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="ĐH Duy Tân, Tự do..."
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Trạng thái thanh toán
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold focus:outline-none transition-colors ${
                    paymentStatus === 'paid'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  }`}
                >
                  <option value="paid">✓ Đã xác nhận tiền (Sẵn sàng gửi vé email)</option>
                  <option value="pending">⏳ Chờ đối chiếu thêm</option>
                </select>
              </div>
            </div>

            {/* Row 5: Upload bill đối chiếu (Tùy chọn) */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Ảnh bill biên lai đối chiếu (nếu có):
              </label>
              <label className="block border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-3 text-center cursor-pointer transition-colors bg-white/[0.02]">
                {compressing ? (
                  <div className="flex items-center justify-center gap-2 py-1 text-xs text-amber-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang nén tối ưu ảnh...</span>
                  </div>
                ) : proofFile ? (
                  <div className="flex items-center justify-center gap-2 py-1 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 size={16} />
                    <span>{proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-1 text-xs text-neutral-400">
                    <Upload size={16} />
                    <span>Bấm để đính kèm ảnh sao kê / biên lai giao dịch</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={compressing}
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </label>

              {proofPreview && (
                <div className="mt-2 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proofPreview} alt="Bill đối chiếu" className="max-h-28 mx-auto rounded-xl object-contain border border-white/10" />
                </div>
              )}
            </div>

            {/* Row 6: Ghi chú đối chiếu */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Ghi chú nội bộ Dev đối chiếu:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Đã đối chiếu qua app Techcombank 14:05, mã GD 883921..."
                className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => { playClickSound(); onClose() }}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || compressing}
              className="btn-gold px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-900" />
                  <span>ĐANG TẠO VÉ & SINH MÃ QR...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-slate-900" />
                  <span>XÁC NHẬN TẠO VÉ THỦ CÔNG</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
