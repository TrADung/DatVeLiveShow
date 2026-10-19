'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Save, RefreshCw, Settings, Loader2, CheckCircle, AlertTriangle, Trash2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SiteSetting } from '@/types'
import Header from '@/components/Header'

const SETTING_DESCRIPTIONS: Record<string, string> = {
  ticket_price: 'Giá vé (VND)',
  bank_id: 'Mã ngân hàng VietQR (ví dụ: MB, VCB, TCB)',
  bank_account_no: 'Số tài khoản ngân hàng',
  bank_account_name: 'Tên chủ tài khoản',
  event_name: 'Tên sự kiện',
  event_date: 'Ngày tổ chức (YYYY-MM-DD)',
  event_venue: 'Địa điểm tổ chức',
  ticket_sale_open: 'Mở bán vé (true/false)',
  smtp_host: 'SMTP Host',
  smtp_port: 'SMTP Port',
  smtp_user: 'Email SMTP',
  smtp_pass: 'Mật khẩu SMTP (App Password)',
  lucky_draw_time: 'Thời gian quay số (ISO)',
  admin_emails: 'Email admin cách nhau dấu phẩy',
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
  const [systemLogs, setSystemLogs] = useState<unknown[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'dev') {
        router.push('/')
        return
      }
      fetchSettings()
      fetchLogs()
    }
  }, [authLoading, user, userRole, router])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dev/settings')
      const data = await res.json()
      setSettings(data || [])
      const vals: Record<string, string> = {}
      data?.forEach((s: SiteSetting) => { vals[s.key] = s.value })
      setEditedValues(vals)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      // We'll read logs from admin stats area
      setLogsLoading(false)
    } finally {
      setLogsLoading(false)
    }
  }

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
        setSavedKeys(prev => [...prev, key])
        setTimeout(() => setSavedKeys(prev => prev.filter(k => k !== key)), 2000)
      } else {
        playErrorSound()
      }
    } finally {
      setSaving(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 size={32} className="text-[#D4AF37] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <Header />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin" className="text-[#A8A090] hover:text-[#D4AF37] transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <Crown size={24} className="text-[#D4AF37]" />
              <h1 className="text-2xl font-black text-[#F5F2EB]">Dev Panel</h1>
            </div>
            <p className="text-sm text-[#A8A090] ml-11">Cấu hình hệ thống nóng - Chỉ dành cho Developer</p>
          </motion.div>

          {/* Warning */}
          <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-500/30 mb-6 flex items-start gap-3">
            <AlertTriangle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-300">
              ⚠️ Thay đổi cấu hình ở đây sẽ có hiệu lực ngay lập tức. Hãy cẩn thận khi thay đổi các thông tin nhạy cảm như SMTP và thông tin ngân hàng.
            </p>
          </div>

          {/* Settings Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="text-[#D4AF37] animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <motion.div
                  key={setting.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-dark rounded-xl border border-[#D4AF37]/10 p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-mono text-xs text-[#D4AF37] mb-1">{setting.key}</div>
                      <div className="text-sm font-medium text-[#F5F2EB]">
                        {SETTING_DESCRIPTIONS[setting.key] || setting.description || setting.key}
                      </div>
                    </div>
                    {savedKeys.includes(setting.key) && (
                      <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type={SENSITIVE_KEYS.includes(setting.key) ? 'password' : 'text'}
                      value={editedValues[setting.key] || ''}
                      onChange={e => setEditedValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      className="flex-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-2.5 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] font-mono"
                    />
                    <button
                      onClick={() => handleSave(setting.key)}
                      disabled={saving === setting.key}
                      className="flex items-center gap-2 bg-[#D4AF37] text-[#121212] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#e8c845] transition-all disabled:opacity-50"
                    >
                      {saving === setting.key ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Lưu
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Danger Zone */}
          <div className="mt-8 p-6 rounded-2xl border-2 border-red-500/30 bg-red-900/10">
            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <Trash2 size={18} /> Danger Zone
            </h3>
            <p className="text-sm text-[#A8A090] mb-4">
              Các thao tác sau đây có thể gây mất dữ liệu. Hãy cận thận!
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  playClickSound()
                  if (confirm('Reset tất cả check-in? (Dùng để test hệ thống)')) {
                    alert('Chức năng này cần thực hiện trực tiếp trên Supabase để an toàn')
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors"
              >
                Reset Check-in (Test)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
