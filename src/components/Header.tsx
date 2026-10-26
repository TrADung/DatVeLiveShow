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
  Home,
  Settings,
  ListOrdered,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import AuthModal from '@/components/AuthModal'
import ThemeToggle from '@/components/ThemeToggle'

interface HeaderProps {
  onOpenBooking?: () => void
}

const navLinks = [
  { label: 'Trang Chủ', href: '/#hero' },
  { label: 'Timeline Sự Kiện', href: '/#timeline' },
  { label: 'Hoạt Động CLB', href: '/#activities' },
  { label: 'Vé Của Tôi', href: '/my-tickets' },
]

const roleIcon = {
  dev: <Crown size={14} className="text-[#D4AF37]" />,
  admin: <Shield size={14} className="text-[#E53935]" />,
  user: <User size={14} className="text-neutral-400" />,
}

const roleBadge = {
  dev: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
  admin: 'bg-[#E53935]/15 text-[#E53935] border-[#E53935]/30',
  user: 'bg-white/10 text-neutral-300 border-white/10',
}

const roleLabel = {
  dev: 'Dev Master',
  admin: 'Admin',
  user: 'Khán giả',
}

export default function Header({ onOpenBooking }: HeaderProps) {
  const { user, userRole, loading, signOut } = useAuth()
  const { playClickSound } = useAudio()
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    setAvatarError(false)
  }, [user])

  const isAdminSection = pathname.startsWith('/admin') || pathname.startsWith('/dev')

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

  const handleBookingClick = () => {
    playClickSound()
    router.push('/book')
  }

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#121212]/80 border-b border-white/10 w-full transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo CLB */}
            <Link
              href="/"
              onClick={playClickSound}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 group-hover:border-[#D4AF37] transition-colors shadow-md shadow-[#D4AF37]/20 shrink-0">
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
                  <span className="text-xs sm:text-sm font-black text-white tracking-wider sm:tracking-widest uppercase">
                    DTU Acoustic
                  </span>
                  <span className="hidden sm:inline-block text-xs text-[#D4AF37] font-bold">🎵</span>
                </div>
                <div className="hidden sm:block text-[10px] text-neutral-400 font-medium tracking-wide">
                  Slogan: Nghe và Cảm
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
                      ? 'bg-[#E53935] text-white shadow-md shadow-[#E53935]/30'
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <BarChart3 size={15} />
                  <span>Tổng Quan</span>
                </Link>

                <Link
                  href="/admin#tickets"
                  onClick={playClickSound}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
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
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
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
                        ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/30 font-black'
                        : 'text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Settings size={15} />
                    <span>Dev Panel</span>
                  </Link>
                )}

                <Link
                  href="/"
                  onClick={playClickSound}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all border border-white/10"
                >
                  <Home size={14} />
                  <span>Trang Chủ</span>
                </Link>
              </div>
            ) : (
              /* Normal Desktop Navigation */
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (pathname === '/' && link.href === '/#hero')
                  return (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className={`text-xs sm:text-sm font-semibold transition-colors duration-200 relative group py-1 cursor-pointer ${
                        isActive ? 'text-[#D4AF37] active-nav-link' : 'text-neutral-300 hover:text-[#D4AF37]'
                      }`}
                    >
                      {link.label}
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-[#D4AF37] transition-all duration-200 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`} />
                    </button>
                  )
                })}
              </nav>
            )}

            {/* Right Action Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Light / Dark Mode Toggle */}
              <ThemeToggle />
              {/* "MUA VÉ NGAY" CTA button - non-admin pages */}
              {!isAdminSection && (
                <button
                  onClick={handleBookingClick}
                  className="hidden sm:inline-flex items-center gap-2 btn-gold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg cursor-pointer active:scale-95"
                >
                  <Ticket size={15} />
                  <span>MUA VÉ</span>
                </button>
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
                        {user.user_metadata?.avatar_url && !avatarError ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.user_metadata.avatar_url}
                            alt=""
                            width={26}
                            height={26}
                            referrerPolicy="no-referrer"
                            onError={() => setAvatarError(true)}
                            className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full object-cover shrink-0 border border-white/20 shadow-sm"
                          />
                        ) : (
                          <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E53935] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm border border-white/20 select-none">
                            {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="hidden sm:block text-xs font-bold text-white max-w-[110px] truncate">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge[userRole]}`}>
                          {roleLabel[userRole]}
                        </span>
                        <ChevronDown size={14} className={`text-neutral-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-60 bg-[#1C1C1E] rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 text-white"
                          >
                            <div className="p-3.5 bg-white/5 border-b border-white/10 flex items-center gap-3">
                              {user.user_metadata?.avatar_url && !avatarError ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={user.user_metadata.avatar_url}
                                  alt=""
                                  width={36}
                                  height={36}
                                  referrerPolicy="no-referrer"
                                  onError={() => setAvatarError(true)}
                                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/20 shadow-md"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E53935] text-white flex items-center justify-center text-sm font-black shrink-0 shadow-md border border-white/20 select-none">
                                  {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">
                                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                </div>
                                <div className="text-[11px] text-neutral-400 truncate">{user.email}</div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {roleIcon[userRole]}
                                  <span className="text-[10px] font-semibold text-neutral-300">
                                    Vai trò: <strong className="text-white">{roleLabel[userRole]}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="p-2 space-y-1">
                              <Link
                                href="/my-tickets"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:bg-white/10 transition-colors"
                                onClick={() => { playClickSound(); setProfileOpen(false) }}
                              >
                                <User size={15} className="text-neutral-400" />
                                <span>Vé Của Tôi & QR</span>
                              </Link>

                              <Link
                                href="/book"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                                onClick={() => { playClickSound(); setProfileOpen(false) }}
                              >
                                <Ticket size={15} className="text-[#D4AF37]" />
                                <span>Trang Đặt Vé Lớn</span>
                              </Link>

                              {(userRole === 'admin' || userRole === 'dev') && (
                                <Link
                                  href="/admin"
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#E53935] hover:bg-[#E53935]/10 transition-colors"
                                  onClick={() => { playClickSound(); setProfileOpen(false) }}
                                >
                                  <Shield size={15} className="text-[#E53935]" />
                                  <span>Admin Dashboard</span>
                                </Link>
                              )}

                              {userRole === 'dev' && (
                                <Link
                                  href="/dev"
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                                  onClick={() => { playClickSound(); setProfileOpen(false) }}
                                >
                                  <Crown size={15} className="text-[#D4AF37]" />
                                  <span>Dev Panel</span>
                                </Link>
                              )}

                              <div className="border-t border-white/10 my-1" />

                              <button
                                onClick={() => { playClickSound(); signOut(); setProfileOpen(false) }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#E53935] hover:bg-[#E53935]/10 transition-colors cursor-pointer"
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
                      className="flex items-center gap-1.5 bg-white text-black hover:bg-neutral-200 font-bold text-xs px-2.5 py-1.5 sm:px-4 sm:py-2 sm:text-sm rounded-full shadow-md transition-all cursor-pointer whitespace-nowrap"
                    >
                      <LogIn size={15} />
                      <span>Đăng nhập</span>
                    </motion.button>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
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
              className="lg:hidden bg-[#121212] border-t border-white/10 shadow-2xl px-4 py-4"
            >
              {isAdminSection ? (
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider px-3 mb-1">
                    Công cụ Quản Trị
                  </div>
                  <Link
                    href="/admin"
                    onClick={() => { playClickSound(); setMobileOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10"
                  >
                    <BarChart3 size={16} className="text-[#E53935]" />
                    <span>Tổng Quan Admin</span>
                  </Link>
                  <Link
                    href="/admin#tickets"
                    onClick={() => { playClickSound(); setMobileOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/10"
                  >
                    <ListOrdered size={16} className="text-[#E53935]" />
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
                      <Settings size={16} className="text-[#D4AF37]" />
                      <span>Dev Panel</span>
                    </Link>
                  )}
                  <div className="border-t border-white/10 my-2" />
                  <Link
                    href="/"
                    onClick={() => { playClickSound(); setMobileOpen(false) }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-400 hover:text-white"
                  >
                    <Home size={16} />
                    <span>Về Trang Chủ Khán Giả</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (pathname === '/' && link.href === '/#hero')
                    return (
                      <button
                        key={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className={`text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold active-nav-link'
                            : 'text-neutral-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {link.label}
                      </button>
                    )
                  })}
                  <div className="border-t border-white/10 my-2" />
                  <button
                    onClick={() => { setMobileOpen(false); handleBookingClick() }}
                    className="btn-gold flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm w-full"
                  >
                    <Ticket size={16} />
                    <span>ĐẶT VÉ THAM DỰ NGAY</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
