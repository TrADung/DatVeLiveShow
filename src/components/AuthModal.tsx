'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthTab = 'login' | 'register'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()

  const [tab, setTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [googleNotice, setGoogleNotice] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    playClickSound()
    setLoading(true)
    setError(null)
    setGoogleNotice(null)

    const res = await signInWithGoogle()
    if (res?.error) {
      playErrorSound()
      const msg = res.error.message || ''
      if (
        msg.includes('provider is not enabled') ||
        msg.includes('Unsupported provider') ||
        msg.includes('validation_failed')
      ) {
        setGoogleNotice(
          'Google OAuth chưa được kích hoạt trên Supabase. Vui lòng sử dụng Đăng nhập bằng Email và Mật khẩu bên dưới.'
        )
      } else {
        setError(msg || 'Không thể đăng nhập bằng Google lúc này.')
      }
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (tab === 'login') {
      const { error: err } = await signInWithEmail(email, password)
      if (err) {
        playErrorSound()
        setError(err.message || 'Email hoặc mật khẩu không chính xác.')
        setLoading(false)
      } else {
        playSuccessSound()
        onClose()
      }
    } else if (tab === 'register') {
      const { error: err } = await signUpWithEmail(email, password, fullName)
      if (err) {
        playErrorSound()
        setError(err.message || 'Không thể đăng ký tài khoản lúc này.')
        setLoading(false)
      } else {
        playSuccessSound()
        setSuccessMsg('Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác nhận (nếu Supabase bật email confirmation) hoặc đăng nhập ngay.')
        setTab('login')
        setLoading(false)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            {/* Header with Chess theme */}
            <div className="keep-dark relative bg-[#0D1117] px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span style={{ color: '#F0CA50' }} className="text-xl text-[#D4AF37] shrink-0">♟</span>
                <div>
                  <h3 style={{ color: '#FFFFFF' }} className="text-base font-black tracking-wider uppercase text-white">
                    Đăng Nhập SẮC I. VÁN CỜ
                  </h3>
                  <p style={{ color: '#94A3B8' }} className="text-xs text-slate-300 font-medium">
                    Live Show Sinh Nhật CLB DTU Acoustic
                  </p>
                </div>
              </div>
              <button
                type="button"
                style={{ color: '#FFFFFF' }}
                onClick={() => { playClickSound(); onClose() }}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Google OAuth Notice if provider is disabled */}
              {googleNotice && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="leading-relaxed">
                    <p className="font-bold mb-1">Chưa bật Google Provider</p>
                    <p>{googleNotice}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Main Google Login button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-900 text-slate-800 font-bold py-3 px-4 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Tiếp tục với Google</span>
              </button>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Hoặc bằng Email
                </span>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => { playClickSound(); setTab('login'); setError(null) }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => { playClickSound(); setTab('register'); setError(null) }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Tạo Tài Khoản
                </button>
              </div>

              {/* Tab: Login / Register with Email */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {tab === 'register' && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                      <User size={13} className="text-red-600" />
                      <span>Họ và tên</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                    <Mail size={13} className="text-red-600" />
                    <span>Địa chỉ Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                    <Lock size={13} className="text-red-600" />
                    <span>Mật khẩu</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (
                    <>
                      <span>{tab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
