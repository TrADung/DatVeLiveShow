'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, LogOut, Crown, Shield, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import AuthModal from '@/components/AuthModal'

const navLinks = [
  { label: 'Trang Chủ', href: '#hero' },
  { label: 'Timeline Sự Kiện', href: '#timeline' },
  { label: 'Hoạt Động CLB', href: '#activities' },
  { label: 'Minigame', href: '#minigame' },
]

const roleIcon = {
  dev: <Crown size={14} className="text-amber-500" />,
  admin: <Shield size={14} className="text-red-600" />,
  user: <User size={14} className="text-slate-600" />,
}

const roleBadge = {
  dev: 'bg-amber-50 text-amber-700 border-amber-200',
  admin: 'bg-red-50 text-red-700 border-red-200',
  user: 'bg-slate-100 text-slate-700 border-slate-200',
}

const roleLabel = {
  dev: 'Dev',
  admin: 'Admin',
  user: 'Khán giả',
}

export default function Header() {
  const { user, userRole, loading, signOut } = useAuth()
  const { playClickSound } = useAudio()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    playClickSound()
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'glass-header shadow-sm' : 'bg-white/80 backdrop-blur-sm border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo CLB */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => handleNavClick('#hero')}
            >
              <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-full overflow-hidden border-2 border-slate-900 shadow-sm">
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
                  <span className="text-sm font-black text-slate-900 tracking-wider">CHESS NIGHT</span>
                  <span className="text-xs text-red-600 font-bold">♟</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Live Show Sinh Nhật CLB</div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-semibold text-slate-700 hover:text-red-600 transition-colors duration-200 relative group py-1"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-200" />
                </button>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {!loading && (
                <>
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={() => { playClickSound(); setProfileOpen(!profileOpen) }}
                        className="flex items-center gap-2.5 bg-white rounded-full pl-2 pr-3 py-1.5 border border-slate-200 hover:border-slate-900 shadow-sm transition-all"
                      >
                        {user.user_metadata?.avatar_url ? (
                          <Image
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            width={28}
                            height={28}
                            className="rounded-full bg-slate-100"
                            unoptimized
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                            {user.email?.[0].toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[120px] truncate">
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
                            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50"
                          >
                            <div className="p-3.5 bg-slate-50 border-b border-slate-100">
                              <div className="text-[11px] text-slate-400 font-medium">Tài khoản</div>
                              <div className="text-xs font-bold text-slate-900 truncate">{user.email}</div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                {roleIcon[userRole]}
                                <span className="text-xs font-semibold text-slate-700">Quyền: {roleLabel[userRole]}</span>
                              </div>
                            </div>

                            <div className="p-1.5 space-y-0.5">
                              <Link
                                href="/my-tickets"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                                onClick={() => { playClickSound(); setProfileOpen(false) }}
                              >
                                <User size={15} className="text-slate-500" />
                                Vé Của Tôi & QR
                              </Link>

                              {(userRole === 'admin' || userRole === 'dev') && (
                                <Link
                                  href="/admin"
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                  onClick={() => { playClickSound(); setProfileOpen(false) }}
                                >
                                  <Shield size={15} className="text-red-600" />
                                  Admin Dashboard
                                </Link>
                              )}

                              {userRole === 'dev' && (
                                <Link
                                  href="/dev"
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                                  onClick={() => { playClickSound(); setProfileOpen(false) }}
                                >
                                  <Crown size={15} className="text-amber-600" />
                                  Dev Panel
                                </Link>
                              )}

                              <div className="border-t border-slate-100 my-1" />

                              <button
                                onClick={() => { playClickSound(); signOut(); setProfileOpen(false) }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <LogOut size={15} />
                                Đăng xuất
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
                      className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-sm hover:shadow transition-all"
                    >
                      <LogIn size={15} />
                      <span>Đăng nhập</span>
                    </motion.button>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-slate-700 hover:text-red-600 transition-colors"
                onClick={() => { playClickSound(); setMobileOpen(!mobileOpen) }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-200 shadow-lg"
            >
              <div className="px-4 py-4 flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left px-3 py-2.5 rounded-xl text-slate-800 hover:text-red-600 hover:bg-slate-50 transition-all text-sm font-semibold"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
