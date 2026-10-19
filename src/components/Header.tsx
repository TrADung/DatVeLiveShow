'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, LogOut, Crown, Shield, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'

const navLinks = [
  { label: 'Trang Chủ', href: '#hero' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Hoạt Động CLB', href: '#activities' },
  { label: 'Minigame', href: '#minigame' },
]

const roleIcon = {
  dev: <Crown size={14} className="text-[#D4AF37]" />,
  admin: <Shield size={14} className="text-blue-400" />,
  user: <User size={14} className="text-[#A8A090]" />,
}

const roleLabel = {
  dev: 'Dev',
  admin: 'Admin',
  user: 'Thành viên',
}

export default function Header() {
  const { user, userRole, loading, signInWithGoogle, signOut } = useAuth()
  const { playClickSound } = useAudio()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-lg shadow-black/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavClick('#hero')}
          >
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 glow-gold-sm">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTNDDsODtmbzNQkjXH-fH55xoqkVtsz2f7F-9AQQufjw&s=10"
                alt="CLB Logo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-[#D4AF37] tracking-wider">CHESS NIGHT</div>
              <div className="text-xs text-[#A8A090]">Live Show Sinh Nhật CLB</div>
            </div>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-[#A8A090] hover:text-[#D4AF37] transition-colors duration-200 
                           relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
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
                      className="flex items-center gap-2 glass-dark rounded-full px-3 py-1.5 
                                 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all"
                    >
                      {user.user_metadata?.avatar_url && (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          width={28}
                          height={28}
                          className="rounded-full"
                          unoptimized
                        />
                      )}
                      <span className="hidden sm:block text-xs text-[#F5F2EB] max-w-[100px] truncate">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                      <div className="flex items-center gap-1">
                        {roleIcon[userRole]}
                      </div>
                      <ChevronDown size={12} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-52 glass-dark rounded-xl 
                                     border border-[#D4AF37]/20 shadow-xl overflow-hidden"
                        >
                          <div className="p-3 border-b border-[#D4AF37]/10">
                            <div className="text-xs text-[#A8A090]">Đăng nhập với</div>
                            <div className="text-sm text-[#F5F2EB] font-medium truncate">{user.email}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {roleIcon[userRole]}
                              <span className="text-xs text-[#D4AF37]">{roleLabel[userRole]}</span>
                            </div>
                          </div>
                          
                          <div className="p-1">
                            <Link
                              href="/my-tickets"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm 
                                         text-[#F5F2EB] hover:bg-[#D4AF37]/10 transition-colors"
                              onClick={() => { playClickSound(); setProfileOpen(false) }}
                            >
                              <User size={14} />
                              Vé của tôi
                            </Link>
                            
                            {(userRole === 'admin' || userRole === 'dev') && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm 
                                           text-[#F5F2EB] hover:bg-[#D4AF37]/10 transition-colors"
                                onClick={() => { playClickSound(); setProfileOpen(false) }}
                              >
                                <Shield size={14} />
                                Admin Dashboard
                              </Link>
                            )}
                            
                            {userRole === 'dev' && (
                              <Link
                                href="/dev"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm 
                                           text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                                onClick={() => { playClickSound(); setProfileOpen(false) }}
                              >
                                <Crown size={14} />
                                Dev Panel
                              </Link>
                            )}
                            
                            <button
                              onClick={() => { playClickSound(); signOut(); setProfileOpen(false) }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm 
                                         text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut size={14} />
                              Đăng xuất
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playClickSound(); signInWithGoogle() }}
                    className="flex items-center gap-2 bg-[#D4AF37] text-[#121212] font-semibold 
                               text-sm px-4 py-2 rounded-full transition-all hover:bg-[#e8c845]
                               glow-gold-sm"
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:block">Đăng nhập</span>
                  </motion.button>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-[#A8A090] hover:text-[#D4AF37] transition-colors"
              onClick={() => { playClickSound(); setMobileOpen(!mobileOpen) }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="lg:hidden glass-dark border-t border-[#D4AF37]/10"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left px-3 py-2 rounded-lg text-[#F5F2EB] hover:text-[#D4AF37] 
                             hover:bg-[#D4AF37]/10 transition-all text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
