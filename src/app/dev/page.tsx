'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Save, CheckCircle, AlertTriangle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SiteSetting } from '@/types'
import Header from '@/components/Header'

const SETTING_DESCRIPTIONS: Record<string, string> = {
  ticket_price: 'Giá vé mặc định (VND)',
  bank_id: 'Mã ngân hàng VietQR (ví dụ: MB, VCB, TCB, ACB)',
  bank_account_no: 'Số tài khoản ngân hàng thụ hưởng',
  bank_account_name: 'Tên chủ tài khoản ngân hàng',
  event_name: 'Tên sự kiện / liveshow (Mặc định: SẮC I. VÁN CỜ)',
  event_date: 'Ngày tổ chức sự kiện (ví dụ: 07 Tháng 11, 2026)',
  event_time: 'Khung giờ diễn ra sự kiện (ví dụ: 19:00 - 21:30)',
  event_venue: 'Địa điểm tổ chức sự kiện (để trống nếu chưa công bố)',
  event_venue_maps_url: 'Link Google Maps địa điểm (người dùng bấm vào sẽ mở Google Maps)',
  ticket_sale_open: 'Mở bán vé trực tuyến (true / false)',
  smtp_host: 'Địa chỉ máy chủ SMTP (ví dụ: smtp.gmail.com)',
  smtp_port: 'Cổng kết nối SMTP (587 hoặc 465)',
  smtp_user: 'Tài khoản Gmail CLB gửi vé (ví dụ: dtuacousticclub@gmail.com)',
  smtp_pass: 'Mật khẩu ứng dụng 16 ký tự của Gmail (App Password)',
  lucky_draw_time: 'Thời gian quay số minigame (ISO string)',
  admin_emails: 'Danh sách email được cấp quyền Admin (cách nhau dấu phẩy)',
}

const SENSITIVE_KEYS = ['smtp_pass']

export default function DevPanel() {
  const { user, userRole, loading: authLoading } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()
  const router = useRouter()

  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [savedKeys, setSavedKeys] = useState<string[]>([])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dev/settings')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setSettings(data)
        const vals: Record<string, string> = {}
        data.forEach((s: SiteSetting) => { vals[s.key] = s.value })
        setEditedValues(vals)
      } else {
        // Fallback default settings
        const defaults = Object.keys(SETTING_DESCRIPTIONS).map((key) => ({
          key,
          value: key === 'ticket_price' ? '89000' : key === 'bank_id' ? 'TCB' : key === 'bank_account_no' ? '2611102006' : key === 'bank_account_name' ? 'TRAN ANH DUNG' : '',
          updated_at: new Date().toISOString(),
        }))
        setSettings(defaults)
        const vals: Record<string, string> = {}
        defaults.forEach((s) => { vals[s.key] = s.value })
        setEditedValues(vals)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchSettings()
    }
  }, [authLoading])

  const handleSave = async (key: string) => {
    playClickSound()
    setSaving(key)
    try {
      const res = await fetch('/api/dev/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: editedValues[key] }),
      })
      if (res.ok) {
        playSuccessSound()
        setSavedKeys((prev) => [...prev, key])
        setTimeout(() => setSavedKeys((prev) => prev.filter((k) => k !== key)), 2000)
      } else {
        playErrorSound()
      }
    } finally {
      setSaving(null)
    }
  }

  if (authLoading) {
    return (
      <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#D4AF37] mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Đang xác thực bảo mật Dev...
        </p>
      </div>
    )
  }

  const isDev = user && userRole === 'dev'

  if (!isDev) {
    return (
      <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#141416] border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-950/50 border border-amber-500/40 text-amber-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/20">
              <Crown size={32} />
            </div>
            <h2 className="text-xl font-black text-white mb-2">DEV PANEL HẠN CHẾ</h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Khu vực cấu hình hệ thống chuyên sâu này chỉ dành cho tài khoản Developer Master.
            </p>
            <Link
              href="/"
              className="btn-gold w-full py-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={15} />
              <span>Quay Lại Trang Chủ</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white pb-24">
      <Header />

      <main className="pt-28 sm:pt-36 px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Crown size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Dev System Config</h1>
                <p className="text-xs text-slate-400">Cấu hình tham số hệ thống nóng (Hot Reload)</p>
              </div>
            </div>

            <button
              onClick={() => { playClickSound(); fetchSettings() }}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 mb-8 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed font-medium">
              <strong>Lưu ý quan trọng:</strong> Các thay đổi về giá vé, số tài khoản VietQR và SMTP sẽ có hiệu lực ngay lập tức với toàn bộ người dùng đang đặt vé trên trang.
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="animate-spin text-red-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Đang tải cấu hình hệ thống...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.key}
                  className="card-luxury rounded-2xl border border-white/10 p-5 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded-md border border-red-500/30">
                        {setting.key}
                      </span>
                      <p className="text-xs font-bold text-slate-200 mt-1.5">
                        {SETTING_DESCRIPTIONS[setting.key] || setting.description || setting.key}
                      </p>
                    </div>
                    {savedKeys.includes(setting.key) && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <CheckCircle size={14} />
                        Đã lưu
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2.5 mt-3">
                    <input
                      type={SENSITIVE_KEYS.includes(setting.key) ? 'password' : 'text'}
                      value={editedValues[setting.key] || ''}
                      onChange={(e) => setEditedValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                      className="flex-1 bg-[#18181B] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-all"
                    />
                    <button
                      onClick={() => handleSave(setting.key)}
                      disabled={saving === setting.key}
                      className="btn-crimson font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      {saving === setting.key ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      <span>Lưu</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
