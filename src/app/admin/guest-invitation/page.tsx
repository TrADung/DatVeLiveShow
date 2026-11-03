'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Send, Sparkles, Loader2, CheckCircle2,
  AlertTriangle, Mail, Smartphone, Monitor, Image as ImageIcon,
  Upload, X, CheckSquare, Square, Ticket, Building, User
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import Header from '@/components/Header'
import { EVENT_INFO } from '@/lib/constants'

type TargetType = 'Thư Mời' | 'Thư Ngỏ' | 'Cá Nhân'

export default function GuestInvitationPage() {
  const { user, userRole, loading: authLoading } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()

  const [guestName, setGuestName] = useState('CLB BK STAR')
  const [emails, setEmails] = useState('')
  const [subject, setSubject] = useState('[THƯ MỜI THAM DỰ] Liveshow DTU Acoustic - SẮC I. VÁN CỜ')
  const [customMessage, setCustomMessage] = useState(
    'CLB DTU Acoustic xin gửi lời chào trân trọng nhất. Nhân dịp kỷ niệm 12 năm thành lập CLB, chúng tôi rất vinh hạnh được đón tiếp quý đơn vị / anh/chị đến tham dự và chung vui trong đêm Liveshow Album Sắc - SẮC I. VÁN CỜ.'
  )
  const [targetType, setTargetType] = useState<TargetType>('Thư Mời')
  const [ticketCount, setTicketCount] = useState(2)
  const [cardImageFile, setCardImageFile] = useState<File | null>(null)
  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [isSending, setIsSending] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tự động điều chỉnh số lượng vé khi đổi đối tượng gửi
  const handleSelectTargetType = (type: TargetType) => {
    playClickSound()
    setTargetType(type)
    if (type === 'Thư Ngỏ') {
      setTicketCount(0)
      setSubject(`[THƯ NGỎ] Kính Mời Tham Dự Liveshow SẮC I. VÁN CỜ - DTU Acoustic Club`)
    } else {
      if (ticketCount === 0) setTicketCount(type === 'Thư Mời' ? 2 : 1)
      setSubject(`[THƯ MỜI] DTU Acoustic Club Trân Trọng Kính Mời ${guestName || 'Quý Khách'} Tham Dự Liveshow SẮC I. VÁN CỜ`)
    }
  }

  // Tải ảnh thiệp mời
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG).')
        return
      }
      setCardImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setCardImagePreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    playClickSound()
    setCardImageFile(null)
    setCardImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Gửi Thư Mời / Thư Ngỏ
  const handleSend = async () => {
    playClickSound()

    if (!guestName.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập Tên đơn vị khách mời hoặc cá nhân.' })
      playErrorSound()
      return
    }

    if (!emails.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập địa chỉ email nhận thư.' })
      playErrorSound()
      return
    }

    setIsSending(true)
    setNotification(null)

    try {
      const fd = new FormData()
      fd.append('guest_name', guestName.trim())
      fd.append('target_type', targetType)
      fd.append('emails', emails.trim())
      fd.append('subject', subject.trim())
      fd.append('custom_message', customMessage.trim())
      fd.append('ticket_count', String(targetType === 'Thư Ngỏ' ? 0 : ticketCount))
      if (cardImageFile) {
        fd.append('card_file', cardImageFile)
      }

      const res = await fetch('/api/admin/send-guest-email', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi email khách mời.')
      }

      playSuccessSound()
      setNotification({
        type: 'success',
        message: data.message || 'Đã gửi thư mời thành công!',
      })
    } catch (err: any) {
      playErrorSound()
      setNotification({
        type: 'error',
        message: err?.message || 'Có lỗi xảy ra khi kết nối máy chủ gửi email.',
      })
    } finally {
      setIsSending(false)
    }
  }

  if (authLoading) {
    return (
      <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#D4AF37] mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Đang xác thực bảo mật...
        </p>
      </div>
    )
  }

  const isAuthorized = user && (userRole === 'admin' || userRole === 'dev')

  if (!isAuthorized) {
    return (
      <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#141416] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
            <h2 className="text-xl font-black text-white mb-2">TRUY CẬP BỊ TỪ CHỐI</h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Trang này chỉ dành cho Ban Tổ Chức (Admin / Developer) có thẩm quyền gửi thư mời.
            </p>
            <Link href="/admin" className="btn-gold w-full py-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2">
              <ArrowLeft size={15} />
              <span>Quay Lại Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Tiêu đề email thực tế hiển thị trên preview
  const previewSubject = subject.replace(/{{guest_name}}/g, guestName || 'Quý Khách')

  return (
    <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white pb-24">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        {/* Navigation & Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                onClick={playClickSound}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Quay lại Dashboard"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <Mail className="text-[#D4AF37]" size={26} />
                    <span>Gửi Mail Khách Mời</span>
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-black uppercase tracking-wider">
                    Guest Portal
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-slate-400 mt-1">
                  Soạn thư mời / thư ngỏ trang trọng, tự động sinh mã QR Check-in & số may mắn cho khách mời danh dự.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                onClick={playClickSound}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Về Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="btn-gold px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-slate-900" />
                    <span>ĐANG GỬI THƯ MỜI...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} className="text-slate-900" />
                    <span>GỬI THƯ MỜI / THƯ NGỎ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Thông báo kết quả gửi */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-rose-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-white/60 hover:text-white text-xs cursor-pointer ml-auto"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab switcher on mobile */}
        <div className="flex lg:hidden items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-stone-200 dark:bg-[#141414] p-1 rounded-xl border border-stone-300 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'form' ? 'bg-[#D4AF37] text-stone-950 shadow-md' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              <span>Form Nhập Thông Tin</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview' ? 'bg-[#D4AF37] text-stone-950 shadow-md' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              <span>Xem Trước (Preview)</span>
            </button>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: LEFT = FORM NHẬP | RIGHT = XEM TRƯỚC LIVE PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================
              CỘT TRÁI (COL 5): FORM NHẬP TRỰC QUAN CHO ADMIN
              ======================================================== */}
          <div className={`lg:col-span-5 card-luxury rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col space-y-4.5 ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Form Thông Tin Khách Mời</span>
              </span>
              <span className="text-[11px] text-neutral-400">Giao diện nhập liệu</span>
            </div>

            {/* 1. Chọn đối tượng gửi: 3 ô hình vuông chọn 1 */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-neutral-300 mb-2">
                Đối tượng gửi (Chọn 1 trong 3):
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Thư Mời', 'Thư Ngỏ', 'Cá Nhân'] as TargetType[]).map((type) => {
                  const isSelected = targetType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectTargetType(type)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-500 dark:border-amber-400 text-amber-950 dark:text-white shadow-md shadow-amber-500/10'
                          : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        {isSelected ? (
                          <CheckSquare size={16} className="text-amber-600 dark:text-[#D4AF37]" />
                        ) : (
                          <Square size={16} className="text-slate-400 dark:text-neutral-500" />
                        )}
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-neutral-400">
                          {type === 'Thư Ngỏ' ? '0 vé' : 'Có QR'}
                        </span>
                      </div>
                      <span className="text-xs font-black tracking-tight">{type}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Nhập tên đơn vị / cá nhân */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-neutral-300 mb-1.5">
                Tên đơn vị khách mời / cá nhân <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ví dụ: CLB BK STAR, Đoàn Trường..."
                  className="w-full bg-white dark:bg-[#1c1c1f] border border-stone-300 dark:border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* 3. Nhập email đơn vị / cá nhân */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-neutral-300">
                  Email nhận thư <span className="text-rose-500">*</span>
                </label>
                {targetType === 'Thư Ngỏ' && (
                  <span className="text-[10px] text-amber-400 font-semibold">
                    (Có thể nhập nhiều email, cách nhau dấu phẩy hoặc dòng)
                  </span>
                )}
              </div>
              {targetType === 'Thư Ngỏ' ? (
                <textarea
                  rows={2}
                  required
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="clb1@gmail.com, clb2@gmail.com&#10;clb3@gmail.com..."
                  className="w-full bg-white dark:bg-[#1c1c1f] border border-stone-300 dark:border-white/10 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              ) : (
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    placeholder="khachmoi@gmail.com"
                    className="w-full bg-white dark:bg-[#1c1c1f] border border-stone-300 dark:border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  />
                </div>
              )}
            </div>

            {/* 4. Số lượng vé tặng (mũi tên chọn từng nấc) */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-neutral-300">
                    Số lượng vé tặng (Vé Free kèm Mã QR Check-in):
                  </label>
                  <span className="text-[11px] text-neutral-400 mt-0.5 block">
                    {targetType === 'Thư Ngỏ'
                      ? 'Thư ngỏ chỉ mời tham dự, luôn mặc định là 0 vé'
                      : 'Mỗi vé tặng sẽ được cấp 1 Mã QR check-in & 1 Số may mắn riêng'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={targetType === 'Thư Ngỏ' ? 0 : 1}
                    max={targetType === 'Thư Ngỏ' ? 0 : 20}
                    disabled={targetType === 'Thư Ngỏ'}
                    value={targetType === 'Thư Ngỏ' ? 0 : ticketCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val)) setTicketCount(Math.max(1, Math.min(20, val)))
                    }}
                    className="w-16 text-center text-base font-black font-mono text-amber-800 dark:text-amber-400 bg-white dark:bg-[#1c1c1f] border border-stone-300 dark:border-white/15 rounded-xl py-1.5 focus:outline-none focus:border-amber-400 disabled:opacity-40"
                  />
                  <span className="text-xs font-bold text-neutral-400">vé</span>
                </div>
              </div>
            </div>

            {/* 5. Tiêu đề email */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-neutral-300 mb-1.5">
                Tiêu đề email <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white dark:bg-[#1c1c1f] border border-stone-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 6. Nội dung mail / Lời ngỏ */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-neutral-300 mb-1.5">
                Nội dung lời mời / lời ngỏ:
              </label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Nhập nội dung lời chúc, lời mời từ Ban tổ chức..."
                className="w-full bg-white dark:bg-[#1c1c1f] border border-stone-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
              />
            </div>

            {/* 7. Nhập ảnh thư mời / thư ngỏ */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-neutral-300 mb-1.5">
                Ảnh thiệp thư mời / thư ngỏ (Poster):
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {cardImagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/20 p-2 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cardImagePreview}
                      alt="Thiệp xem trước"
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block truncate max-w-[200px]">
                        {cardImageFile?.name || 'Ảnh thiệp mời'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ✓ Đã đính kèm vào email
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-900/50 text-neutral-400 hover:text-rose-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white/[0.02] flex flex-col items-center justify-center gap-1.5"
                >
                  <Upload size={20} className="text-amber-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-neutral-300">
                    Bấm để tải ảnh thiệp mời riêng (PNG, JPG)
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Nếu để trống, hệ thống sẽ sử dụng ảnh thiệp mời mặc định
                  </span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="btn-gold w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/20 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-slate-900" />
                    <span>ĐANG XỬ LÝ & GỬI THƯ MỜI...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} className="text-slate-900" />
                    <span>XÁC NHẬN GỬI {targetType.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================
              CỘT PHẢI (COL 7): LIVE PREVIEW EMAIL THỰC TẾ
              ======================================================== */}
          <div className={`lg:col-span-7 card-luxury rounded-3xl overflow-hidden flex flex-col ${activeTab === 'form' ? 'hidden lg:flex' : 'flex'}`}>
            {/* Preview Toolbar */}
            <div className="p-4 border-b border-stone-200 dark:border-white/10 bg-stone-100/70 dark:bg-[#141414] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Xem Trước (Khách Mời Nhận Được)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  {targetType} • {targetType === 'Thư Ngỏ' ? '0 vé' : `${ticketCount} vé kèm QR`}
                </span>
              </div>

              {/* Device Switcher */}
              <div className="flex items-center gap-1 bg-stone-200 dark:bg-black/40 p-1 rounded-lg border border-stone-300 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Giao diện Máy tính"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Giao diện Điện thoại"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>

            {/* Email Header Mockup */}
            <div className="p-3.5 bg-[#18181B] border-b border-white/5 text-xs space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-semibold w-20 shrink-0">Người gửi:</span>
                <span className="text-white font-mono">CLB DTU Acoustic &lt;dtuacousticclub@gmail.com&gt;</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-semibold w-20 shrink-0">Người nhận:</span>
                <span className="text-emerald-400 font-mono truncate">{emails || 'khachmoi@gmail.com'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-semibold w-20 shrink-0">Tiêu đề:</span>
                <span className="text-white font-bold truncate">{previewSubject}</span>
              </div>
            </div>

            {/* Email Body Preview Container */}
            <div className="p-4 sm:p-6 bg-[#EEE5D8] flex items-center justify-center overflow-x-auto min-h-[600px]">
              <div
                className={`bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-[rgba(180,150,100,0.35)] transition-all text-[#111827] ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[590px]'
                }`}
              >
                {/* 1. Banner đầu email */}
                <div className="w-full bg-[#0A0A0A] text-center leading-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/EmailForm/ticket.png"
                    alt="Banner SẮC I. VÁN CỜ"
                    className="w-full max-w-[590px] h-auto block mx-auto"
                  />
                </div>

                {/* 2. Nội dung thư mời */}
                <div className="p-5 sm:p-7">
                  {/* Lời chào & Tên khách mời */}
                  <div className="text-center mb-5">
                    <div className="text-[11px] font-black tracking-widest text-[#B45309] uppercase mb-1">
                      {targetType.toUpperCase()} THAM DỰ LIVESHOW
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#111827] mb-2 leading-tight">
                      Kính gửi: {guestName || 'Quý Đơn Vị / Anh Chị'}
                    </div>
                    <div className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                      {customMessage}
                    </div>
                  </div>

                  {/* Ảnh Thiệp Thư Mời / Thư Ngỏ */}
                  <div className="text-center my-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cardImagePreview || '/images/EmailForm/guest_invitation_sample.png'}
                      alt="Thiệp Mời"
                      className="w-full max-w-[480px] h-auto rounded-2xl mx-auto shadow-md border border-[rgba(180,150,100,0.25)]"
                    />
                  </div>

                  {/* DRESSCODE (4 ô màu giữ nguyên) */}
                  <div className="text-center text-sm font-black tracking-widest text-[#111827] uppercase mt-6 mb-3">
                    DRESSCODE
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-w-[460px] mx-auto mb-4">
                    {/* ĐEN */}
                    <div className="text-center p-2.5 rounded-xl bg-[#F5EFE6] border border-[rgba(180,150,100,0.28)]">
                      <div className="w-10 h-10 rounded-lg mx-auto mb-1.5 bg-[#0A0A0A] border-2 border-[#27272A] shadow-sm" />
                      <div className="text-xs font-black text-[#111827]">ĐEN</div>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E5DCCE] text-stone-600 mt-1">
                        Chủ đạo
                      </span>
                    </div>
                    {/* TRẮNG */}
                    <div className="text-center p-2.5 rounded-xl bg-[#F5EFE6] border border-[rgba(180,150,100,0.28)]">
                      <div className="w-10 h-10 rounded-lg mx-auto mb-1.5 bg-white border-2 border-[#CBD5E1] shadow-sm" />
                      <div className="text-xs font-black text-[#111827]">TRẮNG</div>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E5DCCE] text-stone-600 mt-1">
                        Chủ đạo
                      </span>
                    </div>
                    {/* ĐỎ */}
                    <div className="text-center p-2.5 rounded-xl bg-[#F5EFE6] border border-[rgba(180,150,100,0.28)]">
                      <div className="w-10 h-10 rounded-lg mx-auto mb-1.5 bg-[#DC2626] border-2 border-[#EF4444] shadow-sm" />
                      <div className="text-xs font-black text-[#111827]">ĐỎ</div>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E5DCCE] text-stone-600 mt-1">
                        Chủ đạo
                      </span>
                    </div>
                    {/* VÀNG GOLD */}
                    <div className="text-center p-2.5 rounded-xl bg-[#F5EFE6] border border-[rgba(180,150,100,0.28)]">
                      <div className="w-10 h-10 rounded-lg mx-auto mb-1.5 bg-gradient-to-br from-[#F3D063] to-[#E2B83E] border-2 border-[#F0DA85] shadow-sm" />
                      <div className="text-[11px] font-black text-[#111827] leading-tight">VÀNG<br/>GOLD</div>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] mt-1">
                        Điểm nhấn
                      </span>
                    </div>
                  </div>

                  {/* PHẦN VÉ TẶNG & MÃ CHECK IN QR (NẾU CÓ VÉ TẶNG) */}
                  {targetType !== 'Thư Ngỏ' && ticketCount > 0 ? (
                    <div className="space-y-4 my-6">
                      {Array.from({ length: ticketCount }).map((_, idx) => (
                        <div key={idx} className="text-center">
                          {/* Số may mắn */}
                          <div className="text-base font-extrabold text-[#111827] mb-2">
                            Số may mắn:{' '}
                            <span className="font-mono text-xl font-black text-[#B45309] tracking-widest">
                              #{idx === 0 ? '009' : idx === 1 ? '024' : String(idx + 100).padStart(3, '0')}
                            </span>
                            {ticketCount > 1 && (
                              <span className="text-[11px] font-bold text-stone-500 ml-1.5">
                                (Vé mời 0{idx + 1}/{ticketCount})
                              </span>
                            )}
                          </div>

                          {/* Khung Mã Check-in */}
                          <div className="max-w-[420px] mx-auto bg-white border-2 border-[#E5C158] rounded-2xl p-5 shadow-sm">
                            <div className="text-xs font-black tracking-widest text-[#111827] uppercase mb-3">
                              MÃ CHECK IN
                            </div>

                            <div className="inline-block p-2 border-2 border-[#D4AF37] rounded-xl bg-white shadow-inner">
                              {/* QR Code Mockup */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`INVITATION-${guestName}-TICKET-${idx + 1}`)}`}
                                alt="Mã QR Check-in"
                                className="w-40 h-40 object-contain mx-auto"
                              />
                            </div>

                            <div className="text-[10px] font-mono font-bold text-stone-400 mt-2">
                              MÃ ĐƠN: CLB-INV-2026-0{idx + 1}
                            </div>

                            <div className="text-xs text-stone-600 italic mt-3">
                              Chúc bạn có một hành trình âm nhạc tuyệt vời tại Sắc I. Ván cờ - Album Sắc
                            </div>

                            <div className="mt-4">
                              <span className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs font-bold py-2 px-6 rounded-full shadow-md">
                                Liên hệ Fanpage
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Nếu là Thư Ngỏ (0 vé) */
                    <div className="text-center my-6 py-4">
                      <div className="text-xs text-stone-600 italic mb-3">
                        Rất hân hạnh được đón tiếp quý đơn vị / anh/chị tại sự kiện âm nhạc SẮC I. VÁN CỜ!
                      </div>
                      <span className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs font-bold py-2.5 px-7 rounded-full shadow-md">
                        Liên hệ Fanpage DTU Acoustic
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Footer Email */}
                <div className="text-center py-4 px-6 bg-[#E8DFC8] border-t border-[rgba(180,150,100,0.28)] text-xs text-stone-600 leading-relaxed">
                  <div className="font-bold text-[#111827] mb-1">CLB DTU ACOUSTIC - ĐẠI HỌC DUY TÂN</div>
                  <div>Hotline: <strong className="text-[#111827]">{EVENT_INFO.hotline} ({EVENT_INFO.hotlineName})</strong></div>
                  <div>Địa điểm: <strong className="text-[#111827]">{EVENT_INFO.eventVenue}</strong></div>
                  <div className="mt-1.5 text-[11px] text-stone-500">
                    Email này được gửi tự động từ Ban Tổ Chức Liveshow SẮC I. VÁN CỜ
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
