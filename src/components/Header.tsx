'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  LogIn,
  LogOut,
  Crown,
  Shield,
  User,
  ChevronDown,
  Ticket,
  BarChart3,
  Camera,
  Sparkles,
  Home,
  Settings,
  ListOrdered,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import AuthModal from '@/components/AuthModal'

const navLinks = [
  { label: 'Trang Chủ', href: '/#hero' },
  { label: 'Timeline Sự Kiện', href: '/#timeline' },
  { label: 'Hoạt Động CLB', href: '/#activities' },
  { label: 'Minigame', href: '/#minigame' },
]

const roleIcon = {
  dev: <Crown size={14} className="text-amber-400" />,
  admin: <Shield size={14} className="text-red-500" />,
  user: <User size={14} className="text-slate-400" />,
}

const roleBadge = {
  dev: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  admin: 'bg-red-500/10 text-red-400 border-red-500/30',
  user: 'bg-white/10 text-slate-300 border-white/10',
}

const roleLabel = {
  dev: 'Dev Master',
  admin: 'Admin',
  user: 'Khán giả',
}

export default function Header() {
  const { user, userRole, loading, signOut } = useAuth()
  const { playClickSound } = useAudio()
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isAdminSection = pathname.startsWith('/admin') || pathname.startsWith('/dev')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    playClickSound()
    setMobileOpen(false)
    if (href.startsWith('/#')) {
      if (pathname !== '/') {
        router.push(href)
      } else {
        const id = href.replace('/', '')
        const el = document.querySelector(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(href)
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isAdminSection
            ? 'bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/60'
            : 'bg-transparent border-b border-white/5 backdrop-blur-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo CLB */}
            <Link
              href="/"
              onClick={playClickSound}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-red-500/40 group-hover:border-red-500 transition-colors shadow-md shadow-red-500/20">
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTNDDsODtmbzNQkjXH-fH55xoqkVtsz2f7F-9AQQufjw&s=10"
                  alt="CLB Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white tracking-widest uppercase">
                    CHESS NIGHT
                  </span>
                  <span className="text-xs text-red-500 font-bold">♟</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Live Show Sinh Nhật CLB
                </div>
              </div>
            </Link>

            {/* If in ADMIN SECTION: Display Direct Admin Actions on Header! */}
            {isAdminSection ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/admin"
                  onClick={playClickSound}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <BarChart3 size={15} />
                  <span>Tổng Quan</span>
                </Link>

                <Link
                  href="/admin#tickets"
                  onClick={playClickSound}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ListOrdered size={15} />
                  <span>Quản Lý Vé</span>
                </Link>

                <Link
                  href="/admin/checkin"
                  onClick={playClickSound}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/checkin'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Camera size={15} />
                  <span>Quét QR Check-in</span>
                </Link>

                {userRole === 'dev' && (
                  <Link
                    href="/dev"
                    onClick={playClickSound}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      pathname === '/dev'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Settings size={15} />
                    <span>Dev Panel</span>
                  </Link>
                )}

                <Link
                  href="/"
                  onClick={playClickSound}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/10"
                >
                  <Home size={14} />
                  <span>Trang Chủ</span>
                </Link>
              </div>
            ) : (
              /* Normal Desktop Navigation */
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200 relative group py-1 cursor-pointer"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-200" />
                  </button>
                ))}
              </nav>
            )}

            {/* Right Action Section */}
            <div className="flex items-center gap-3">
              {/* "MUA VÉ NGAY" CTA button - only on non-admin pages */}
              {!isAdminSection && pathname !== '/book' && (
                <Link
                  href="/book"
                  onClick={playClickSound}
                  className="hidden sm:inline-flex items-center gap-2 btn-crimson text-white text-xs sm:text-sm font-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg shadow-red-600/25 transition-all active:scale-95"
                >
                  <Ticket size={15} />
                  <span>MUA VÉ</span>
                </Link>
              )}

              {/* Auth Button or User Dropdown */}
              {!loading && (
                <>
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={() => { playClickSound(); setProfileOpen(!profileOpen) }}
                        className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 rounded-full pl-2 pr-3 py-1.5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      >
                        {user.user_metadata?.avatar_url ? (
                          <Image
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            width={26}
                            height={26}
                            className="rounded-full bg-white/10"
                            unoptimized
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                            {user.email?.[0].toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="hidden sm:block text-xs font-bold text-white max-w-[110px] truncate">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge[userRole]}`}>
                          {roleLabel[userRole]}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-60 bg-[#141417] rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 text-white"
                          >
                            <div className="p-3.5 bg-white/5 border-b border-white/10">
                              <div className="text-[11px] text-slate-400 font-medium">Tài khoản Google</div>
                              <div className="text-xs font-bold text-white truncate">{user.email}</div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                {roleIcon[userRole]}
                                <span className="text-xs font-semibold text-slate-300">
                                  Vai trò: <strong className="text-white">{roleLabel[userRole]}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="p-2 space-y-1">
                              <Link
                                href="/my-tickets"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
                                onClick={() => { playClickSound(); setProfileOpen(false) }}
                              >
                                <User size={15} className="text-slate-400" />
                                <span>Vé Của Tôi & QR</span>
                              </Link>

                              <Link
                                href="/book"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                                onClick={() => { playClickSound(); setProfileOpen(false) }}
                              >
                                <Ticket size={15} className="text-red-400" />
                                <span>Đặt Vé Mới</span>
                              </Link>

                              {(userRole === 'admin' || userRole === 'dev') && (
                                <Link
                                  href="/admin"
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                                  onClick={() => { playClickSound(); setProfileOpen(false) }}
                                >
                                  <Shield size={15} className="text-red-400" />
                                  <span>Admin Dashboard</span>
                                </Link>
                              )}

                              {userRole === 'dev' && (
                                <Link
                                  href="/dev"
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                                  onClick={() => { playClickSound(); setProfileOpen(false) }}
                                >
                                  <Crown size={15} className="text-amber-400" />
                                  <span>Dev Panel</span>
                                </Link>
                              )}

                              <div className="border-t border-white/10 my-1" />

                              <button
                                onClick={() => { playClickSound(); signOut(); setProfileOpen(false) }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              >
                                <LogOut size={15} />
                                <span>Đăng xuất</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { playClickSound(); setAuthModalOpen(true) }}
                      className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-200 font-bold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg transition-all cursor-pointer"
                    >
                      <LogIn size={15} />
                      <span>Đăng nhập</span>
                    </motion.button>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                onClick={() => { playClickSound(); setMobileOpen(!mobileOpen) }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#0A0A0C] border-t border-white/10 shadow-2xl px-4 py-4"
            >
              {isAdminSection ? (
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-3 mb-1">
                    Công cụ Admin
                  </div>
                  <Link
                    href="/admin"
                    onClick={() => { playClickSound(); setMobileOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10"
                  >
                    <BarChart3 size={16} className="text-red-500" />
                    <span>Tổng Quan Admin</span>
                  </Link>
                  <Link
                    href="/admin#tickets"
                    onClick={() => { playClickSound(); setMobileOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10"
                  >
                    <ListOrdered size={16} className="text-red-500" />
                    <span>Quản Lý Vé & Thanh Toán</span>
                  </Link>
                  <Link
                    href="/admin/checkin"
                    onClick={() => { playClickSound(); setMobileOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10"
                  >
                    <Camera size={16} className="text-blue-400" />
                    <span>Quét QR Check-in</span>
                  </Link>
                  {userRole === 'dev' && (
                    <Link
                      href="/dev"
                      onClick={() => { playClickSound(); setMobileOpen(false) }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10"
                    >
                      <Settings size={16} className="text-amber-400" />
                      <span>Dev Panel</span>
                    </Link>
                  )}
                  <div className="border-t border-white/10 my-2" />
                  <Link
                    href="/"
                    onClick={() => { playClickSound(); setMobileOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                  >
                    <Home size={16} />
                    <span>Về Trang Chủ Khách Hàng</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="text-left px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t border-white/10 my-2" />
                  <Link
                    href="/book"
                    onClick={() => { playClickSound(); setMobileOpen(false) }}
                    className="btn-crimson flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm"
                  >
                    <Ticket size={16} />
                    <span>ĐẶT VÉ THAM DỰ NGAY</span>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
