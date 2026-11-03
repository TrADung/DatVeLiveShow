'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Ticket,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
  DollarSign,
  CreditCard,
  Banknote,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { formatCurrency } from '@/lib/utils'

interface OfflineTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: { count: number; totalAmount: number; message: string }) => void
}

export default function OfflineTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: OfflineTicketModalProps) {
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()

  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'Tiền mặt' | 'Chuyển khoản'>('Tiền mặt')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const TICKET_PRICE = 89000
  const totalAmount = quantity * TICKET_PRICE

  const handleAdjust = (delta: number) => {
    playClickSound()
    setQuantity((prev) => Math.max(1, Math.min(100, prev + delta)))
  }

  const handleSetExact = (val: number) => {
    playClickSound()
    setQuantity(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()

    if (quantity < 1) {
      setError('Số lượng vé phải từ 1 trở lên.')
      playErrorSound()
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/offline-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          paymentMethod,
          note: note.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo vé offline.')
      }

      playSuccessSound()
      onSuccess(data)
      onClose()
      // Reset state
      setQuantity(1)
      setNote('')
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/85 backdrop-blur-sm sm:backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#FAF7F2] dark:bg-[#121214] border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-white my-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-white/10 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Ticket size={12} />
                  <span>CHECK-IN COUNTER PERK</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Bán vé trực tiếp</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <span>Bán Vé Offline Tại Quầy</span>
                <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                Staff thu tiền, đeo vòng cho khách & xác nhận. Hệ thống tự động ghi nhận doanh thu và tính đã vào cổng.
              </p>
            </div>
            <button
              onClick={() => { playClickSound(); onClose() }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-xl bg-stone-200/60 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Input số lượng khách mua offline */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 text-center shadow-sm dark:shadow-none">
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Nhập Số Lượng Khách Mua Offline
              </label>

              <div className="flex items-center justify-center gap-4 my-2">
                <button
                  type="button"
                  onClick={() => handleAdjust(-1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-xl font-bold transition-all cursor-pointer text-slate-800 dark:text-white border border-stone-200 dark:border-transparent"
                >
                  <Minus size={20} />
                </button>

                <div className="w-28 text-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val)) setQuantity(Math.max(1, Math.min(100, val)))
                    }}
                    style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                    className="w-full text-center text-4xl sm:text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400 bg-transparent focus:outline-none"
                  />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest block -mt-1">
                    Vé Khách
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjust(1)}
                  className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 flex items-center justify-center text-xl font-bold transition-all cursor-pointer text-slate-800 dark:text-white border border-stone-200 dark:border-transparent"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-white/5">
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 mr-1 font-semibold">Chọn nhanh:</span>
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSetExact(num)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      quantity === num
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-black shadow-md shadow-emerald-500/20'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 border border-stone-200 dark:border-transparent'
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-neutral-400 uppercase tracking-wider block">
                  Tổng Tiền Thu Khách
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  {quantity} vé x {formatCurrency(TICKET_PRICE)}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                {formatCurrency(totalAmount)}
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-neutral-300 mb-2">
                Hình thức khách thanh toán tại quầy:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { playClickSound(); setPaymentMethod('Tiền mặt') }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
                    paymentMethod === 'Tiền mặt'
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-600 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Banknote size={16} />
                  <span>Tiền Mặt (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { playClickSound(); setPaymentMethod('Chuyển khoản') }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
                    paymentMethod === 'Chuyển khoản'
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-600 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard size={16} />
                  <span>Chuyển Khoản (QR)</span>
                </button>
              </div>
            </div>

            {/* Ghi chú nhanh (tùy chọn) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-neutral-300 mb-1.5">
                Ghi chú thêm (Tùy chọn):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Nhóm bạn trường Duy Tân, khách anh Hùng giới thiệu..."
                className="w-full bg-white dark:bg-[#1c1c1f] border border-stone-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => { playClickSound(); onClose() }}
              disabled={submitting}
              className="px-4 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black py-3 px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                  <span>ĐANG GHI NHẬN {quantity} VÉ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} className="text-slate-950" />
                  <span>XÁC NHẬN BÁN & ĐEO VÒNG ({quantity} VÉ)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
