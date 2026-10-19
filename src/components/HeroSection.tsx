'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Ticket, ArrowDown, Music, Star } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { useAuth } from '@/hooks/useAuth'
import { useRef } from 'react'

interface HeroSectionProps {
  onBuyTicket: () => void
}

export default function HeroSection({ onBuyTicket }: HeroSectionProps) {
  const { playClickSound } = useAudio()
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const handleBuyClick = () => {
    playClickSound()
    onBuyTicket()
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Chess pattern background */}
      <motion.div className="absolute inset-0 chess-pattern opacity-30" style={{ y }} />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/80 via-transparent to-[#121212]" />
      
      {/* Decorative chess pieces (abstract) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 left-10 w-32 h-32 border border-[#D4AF37]/10 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 right-10 w-48 h-48 border border-[#D4AF37]/10 rounded-full"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/3 right-20 w-24 h-24 border border-[#6E472B]/20 rounded-full"
      />

      {/* Stars decoration */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + (i * 7) % 85}%`,
            top: `${15 + (i * 11) % 65}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          <Star size={4 + (i % 3) * 2} className="text-[#D4AF37]/40" fill="currentColor" />
        </motion.div>
      ))}

      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        {/* Event badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-2 mb-6
                     border border-[#D4AF37]/30 text-sm text-[#D4AF37]"
        >
          <Music size={14} />
          <span>Đêm Nhạc Sinh Nhật</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight"
        >
          <span className="shimmer-gold">CHESS</span>
          <br />
          <span className="text-[#F5F2EB]">NIGHT</span>
          <span className="text-[#D4AF37] text-2xl sm:text-3xl md:text-4xl ml-3">♟</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-[#A8A090] mb-4 font-light tracking-wide"
        >
          Live Show Sinh Nhật Câu Lạc Bộ Âm Nhạc
        </motion.p>

        {/* Date & Venue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-6 mb-10 text-sm text-[#A8A090]"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37]">♟</span>
            <span>31/12/2025</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#D4AF37]/40" />
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37]">♟</span>
            <span>Hà Nội</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#D4AF37]/40" />
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37]">♟</span>
            <span>19:00</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0, type: 'spring', stiffness: 200 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBuyClick}
            className="btn-chess relative group inline-flex items-center gap-3 
                       bg-[#D4AF37] hover:bg-[#e8c845] text-[#121212] font-black
                       text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-2xl
                       pulse-gold transition-all duration-300"
          >
            <Ticket size={24} />
            <span>MUA VÉ NGAY</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
            
            {/* Shimmer overlay */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            </div>
          </motion.button>

          {!user && (
            <p className="text-xs text-[#A8A090] max-w-[200px] text-center">
              * Cần đăng nhập Google để mua vé
            </p>
          )}
        </motion.div>

        {/* Ticket price */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-sm text-[#A8A090]"
        >
          Giá vé: <span className="text-[#D4AF37] font-bold">150.000đ</span> / người
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-[#A8A090] tracking-widest uppercase">Cuộn xuống</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={16} className="text-[#D4AF37]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
