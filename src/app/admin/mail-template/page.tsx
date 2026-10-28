'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Save, Send, RotateCcw, Copy, Check, Eye,
  Code2, Sparkles, Loader2, AlertTriangle, CheckCircle2,
  Mail, Smartphone, Monitor
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import Header from '@/components/Header'
import {
  DEFAULT_EMAIL_SUBJECT,
  DEFAULT_EMAIL_TEMPLATE,
  EMAIL_PLACEHOLDERS,
  MOCK_TICKET_DATA,
  compileEmailSubject,
  compileEmailTemplate,
} from '@/lib/emailTemplate'

export default function MailTemplatePage() {
  const { user, userRole, loading: authLoading } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()

  const [subject, setSubject] = useState(DEFAULT_EMAIL_SUBJECT)
  const [template, setTemplate] = useState(DEFAULT_EMAIL_TEMPLATE)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch current saved template
  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch('/api/admin/mail-template')
        if (res.ok) {
          const data = await res.json()
          if (data.subject) setSubject(data.subject)
          if (data.template) setTemplate(data.template)
          if (data.adminEmail) setTestEmail(data.adminEmail)
        }
      } catch (err) {
        console.error('Failed to load email template:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user && (userRole === 'admin' || userRole === 'dev')) {
      fetchTemplate()
    }
  }, [authLoading, user, userRole])

  // Insert placeholder at current cursor position in textarea
  const insertPlaceholder = (key: string) => {
    playClickSound()
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)

    if (!textareaRef.current) {
      navigator.clipboard?.writeText(key)
      return
    }
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = template.substring(0, start) + key + template.substring(end)
    setTemplate(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + key.length, start + key.length)
    }, 50)
  }

  // Handle Save
  const handleSave = async () => {
    playClickSound()
    setIsSaving(true)
    setNotification(null)

    try {
      const res = await fetch('/api/admin/mail-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', subject, template }),
      })
      const data = await res.json()
      if (res.ok) {
        playSuccessSound()
        setNotification({ type: 'success', message: data.message || 'Đã lưu mẫu email thành công!' })
      } else {
        playErrorSound()
        setNotification({ type: 'error', message: data.error || 'Lưu mẫu email thất bại' })
      }
    } catch {
      playErrorSound()
      setNotification({ type: 'error', message: 'Lỗi kết nối máy chủ' })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Send Test
  const handleSendTest = async () => {
    playClickSound()
    if (!testEmail || !testEmail.includes('@')) {
      playErrorSound()
      setNotification({ type: 'error', message: 'Vui lòng nhập địa chỉ email hợp lệ để nhận thử' })
      return
    }

    setIsSendingTest(true)
    setNotification(null)

    try {
      const res = await fetch('/api/admin/mail-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', subject, template, testEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        playSuccessSound()
        setNotification({ type: 'success', message: data.message || `Đã gửi email thử nghiệm đến ${testEmail}!` })
      } else {
        playErrorSound()
        setNotification({ type: 'error', message: data.error || 'Gửi email thử nghiệm thất bại' })
      }
    } catch {
      playErrorSound()
      setNotification({ type: 'error', message: 'Lỗi kết nối khi gửi thử' })
    } finally {
      setIsSendingTest(false)
    }
  }

  // Reset to default
  const handleResetDefault = () => {
    playClickSound()
    if (confirm('Bạn có chắc muốn đặt lại mẫu email về mặc định ban đầu không? Các chỉnh sửa chưa lưu sẽ bị mất.')) {
      setSubject(DEFAULT_EMAIL_SUBJECT)
      setTemplate(DEFAULT_EMAIL_TEMPLATE)
      playSuccessSound()
    }
  }

  // Compile live preview
  const previewSubject = compileEmailSubject(subject, MOCK_TICKET_DATA)
  const previewHTML = compileEmailTemplate(template, MOCK_TICKET_DATA)

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen theme-page-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
          <p className="text-xs text-stone-600 dark:text-slate-400 font-medium">Đang tải cấu hình mẫu email...</p>
        </div>
      </div>
    )
  }

  if (!user || (userRole !== 'admin' && userRole !== 'dev')) {
    return (
      <div className="min-h-screen theme-page-bg flex items-center justify-center p-4">
        <div className="card-luxury p-8 rounded-3xl max-w-md text-center border border-red-500/30">
          <AlertTriangle className="mx-auto text-red-500 mb-3" size={40} />
          <h2 className="text-lg font-bold mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-xs text-stone-600 dark:text-slate-400 mb-6">Trang này chỉ dành cho Ban Tổ Chức (Admin / Developer) có thẩm quyền cấu hình email gửi vé.</p>
          <Link href="/" className="btn-crimson inline-block px-5 py-2.5 rounded-xl text-xs font-bold">
            Về Trang Chủ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-page-bg transition-colors duration-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              onClick={playClickSound}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 dark:bg-white/5 dark:hover:bg-white/10 border border-stone-300 dark:border-white/10 text-stone-800 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Quay lại Admin</span>
            </Link>

            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Form Soạn Email Vé Khán Giả</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/30">
                  Template Manager
                </span>
              </h1>
              <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5 font-medium">
                Nội dung này sẽ được tự động điền thông tin và gửi cho từng khán giả khi bấm &quot;Gửi Vé Email&quot;
              </p>
            </div>
          </div>

          {/* Top action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 dark:bg-white/5 dark:hover:bg-white/10 border border-stone-300 dark:border-white/10 text-stone-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Khôi phục lại mẫu chuẩn ban đầu"
            >
              <RotateCcw size={13} />
              <span>Mẫu gốc</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-700/25 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Mẫu Email'}</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn shadow-md ${
              notification.type === 'success'
                ? 'bg-emerald-100 border border-emerald-400 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-300'
                : 'bg-rose-100 border border-rose-400 text-rose-900 dark:bg-rose-950/40 dark:border-rose-500/40 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-stone-500 hover:text-stone-900 dark:text-white/60 dark:hover:text-white text-xs cursor-pointer ml-auto"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Placeholder Chips */}
        <div className="card-luxury p-4 sm:p-5 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Sparkles size={15} className="text-[#8A6508] dark:text-[#D4AF37]" />
              <span>Thẻ Dữ Liệu Tự Động (Bấm thẻ để chèn nhanh):</span>
            </div>
            <span className="text-[11px] text-stone-500 dark:text-slate-400 hidden sm:inline">
              Hệ thống tự động thay thế bằng dữ liệu thật của từng khách
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {EMAIL_PLACEHOLDERS.map((p) => {
              const isCopied = copiedKey === p.key
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => insertPlaceholder(p.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    isCopied
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-500/60 dark:text-emerald-300 font-bold'
                      : 'bg-amber-50 hover:bg-amber-100/80 border-amber-300/80 text-amber-900 dark:bg-black/40 dark:hover:bg-white/10 dark:border-white/10 dark:text-amber-300 shadow-sm'
                  }`}
                  title={`${p.label}: ${p.desc} (VD: ${p.example})`}
                >
                  {isCopied ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={11} className="opacity-60" />}
                  <span>{p.key}</span>
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-sans">({p.label})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Email Subject Input & Test Send Bar */}
        <div className="card-luxury p-4 sm:p-5 rounded-2xl mb-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-stone-700 dark:text-slate-300">
              Tiêu đề Email (Hỗ trợ chèn thẻ động như {`{{event_name}}`}, {`{{order_code}}`}):
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: [Vé Điện Tử] {{event_name}} | Mã vé: {{order_code}}"
              className="w-full bg-white dark:bg-[#141414] border border-stone-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#8A6508] dark:focus:border-[#D4AF37] font-medium shadow-sm"
            />
          </div>

          {/* Test Send Input Box */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-200 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-slate-300">
              <Mail size={15} className="text-[#8A6508] dark:text-[#D4AF37]" />
              <span>Gửi thử nghiệm mẫu này vào Gmail:</span>
            </div>
            <div className="flex-1 min-w-[240px] flex items-center gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Nhập email của bạn để nhận thử..."
                className="flex-1 bg-white dark:bg-[#141414] border border-stone-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-sm"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
              >
                {isSendingTest ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>{isSendingTest ? 'Đang gửi...' : 'Gửi Thử Ngay'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab switchers for responsive preview */}
        <div className="flex lg:hidden items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-stone-200 dark:bg-[#141414] p-1 rounded-xl border border-stone-300 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'editor' ? 'bg-[#D4AF37] text-stone-950 shadow-md' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              <Code2 size={13} />
              <span>Soạn Thảo (HTML)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview' ? 'bg-[#D4AF37] text-stone-950 shadow-md' : 'text-stone-600 dark:text-slate-400'
              }`}
            >
              <Eye size={13} />
              <span>Xem Trước Thực Tế</span>
            </button>
          </div>
        </div>

        {/* Main Editor & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT: HTML Editor */}
          <div className={`card-luxury rounded-3xl overflow-hidden flex flex-col ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-stone-200 dark:border-white/10 bg-stone-100/70 dark:bg-[#141414] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-[#8A6508] dark:text-[#D4AF37]" />
                <span className="text-xs font-black uppercase tracking-wider">Trình Soạn Thảo HTML</span>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-slate-400 font-mono">
                {template.length} ký tự
              </span>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-[#0D0D0D]">
              <textarea
                ref={textareaRef}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={28}
                spellCheck={false}
                className="w-full bg-white dark:bg-[#0A0A0C] border border-stone-300 dark:border-white/10 rounded-2xl p-4 text-xs font-mono text-stone-900 dark:text-emerald-300 leading-relaxed focus:outline-none focus:border-[#8A6508] dark:focus:border-[#D4AF37] resize-y shadow-inner"
                placeholder="Nhập mã HTML của mẫu email..."
              />
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className={`card-luxury rounded-3xl overflow-hidden flex flex-col ${activeTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
            {/* Preview Top Header */}
            <div className="p-4 border-b border-stone-200 dark:border-white/10 bg-stone-100/70 dark:bg-[#141414] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#8A6508] dark:text-[#D4AF37]" />
                <span className="text-xs font-black uppercase tracking-wider">Xem Trước (Khán giả thấy)</span>
              </div>

              {/* Device view switcher */}
              <div className="flex items-center gap-1 bg-stone-200/80 dark:bg-black/40 p-1 rounded-lg border border-stone-300 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded transition-all ${previewDevice === 'desktop' ? 'bg-[#D4AF37] text-stone-950 shadow-sm' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'}`}
                  title="Giao diện Máy tính"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded transition-all ${previewDevice === 'mobile' ? 'bg-[#D4AF37] text-stone-950 shadow-sm' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'}`}
                  title="Giao diện Điện thoại"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>

            {/* Email Header Mockup */}
            <div className="p-4 bg-stone-100/40 dark:bg-[#18181B] border-b border-stone-200 dark:border-white/5 text-xs space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-stone-500 dark:text-slate-500 font-semibold w-18 shrink-0">Người gửi:</span>
                <span className="text-stone-900 dark:text-slate-200 font-medium">CLB DTU Acoustic &lt;dtuacousticclub@gmail.com&gt;</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-stone-500 dark:text-slate-500 font-semibold w-18 shrink-0">Người nhận:</span>
                <span className="text-stone-700 dark:text-slate-300 font-medium">{MOCK_TICKET_DATA.full_name} &lt;{MOCK_TICKET_DATA.user_email}&gt;</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-stone-500 dark:text-slate-500 font-semibold w-18 shrink-0">Tiêu đề:</span>
                <span className="text-[#8A6508] dark:text-[#D4AF37] font-bold">{previewSubject}</span>
              </div>
            </div>

            {/* Rendered HTML Container: Harmonious Warm Canvas in Light Mode, Deep Space in Dark Mode */}
            <div className="p-4 sm:p-6 bg-[#E8DFC8]/60 dark:bg-[#070709] flex justify-center overflow-auto max-h-[780px] transition-colors rounded-b-3xl">
              {previewDevice === 'mobile' ? (
                /* Mobile Phone Mockup Frame */
                <div className="w-full max-w-[400px] bg-[#1E1E22] border-4 border-[#2E3036] rounded-[44px] p-3 shadow-2xl transition-all">
                  {/* Dynamic Island / Speaker */}
                  <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-between px-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                    <div className="w-2 h-2 rounded-full bg-blue-950" />
                  </div>
                  {/* Screen with iframe isolation */}
                  <div className="rounded-[30px] overflow-hidden bg-[#0D0D0D] shadow-inner">
                    <iframe
                      srcDoc={previewHTML}
                      title="Mobile Email Preview"
                      className="w-full border-none block"
                      style={{ height: '640px', width: '100%', background: '#0D0D0D' }}
                    />
                  </div>
                  {/* Home Bar */}
                  <div className="w-32 h-1 bg-white/30 rounded-full mx-auto mt-2.5" />
                </div>
              ) : (
                /* Desktop Browser Mockup Frame */
                <div className="w-full max-w-[640px] bg-white dark:bg-[#141416] border border-stone-300 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all">
                  {/* Browser Bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-[#1A1A1E] border-b border-stone-200 dark:border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-stone-500 dark:text-slate-400 mx-auto">
                      mail.google.com/mail/u/0/#inbox
                    </span>
                  </div>
                  {/* Screen with iframe isolation */}
                  <div className="bg-[#0D0D0D] overflow-hidden">
                    <iframe
                      srcDoc={previewHTML}
                      title="Desktop Email Preview"
                      className="w-full border-none block"
                      style={{ height: '650px', width: '100%', background: '#0D0D0D' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Floating Save Bar */}
        <div className="sticky bottom-6 mt-8 flex justify-end">
          <div className="bg-[#FAF7F2]/95 dark:bg-[#18181B]/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-300 dark:border-white/10 shadow-2xl flex items-center gap-3 transition-colors">
            <span className="text-xs text-stone-600 dark:text-slate-400 hidden sm:inline font-medium">
              Đừng quên bấm Lưu để áp dụng mẫu email mới!
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-700/25 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Mẫu Email'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
