'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Ticket, ArrowDown, Music, Calendar, MapPin, Clock, Sparkles } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'

interface HeroSectionProps {
  onBuyTicket: () => void
}

export default function HeroSection({ onBuyTicket }: HeroSectionProps) {
  const { playClickSound } = useAudio()
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Parallax morphing for background chess figures & ambient lights
  const yChessKing = useTransform(scrollYProgress, [0, 1], [0, 120])
  const yChessKnight = useTransform(scrollYProgress, [0, 1], [0, -100])
  const scaleGlow = useTransform(scrollYProgress, [0, 1], [1, 1.3])
  const opacityGlow = useTransform(scrollYProgress, [0, 0.8], [0.6, 0.1])

  const handleBuyClick = () => {
    playClickSound()
    onBuyTicket()
  }

  const handleScrollDown = () => {
    playClickSound()
    const el = document.querySelector('#timeline')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full block pt-24 sm:pt-28 md:pt-32 pb-24 md:pb-32 overflow-hidden bg-[#0D0D0D] editorial-grid"
    >
      {/* Background Ambient Glows with Morphing */}
      <motion.div
        style={{ scale: scaleGlow, opacity: opacityGlow }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        style={{ scale: scaleGlow, opacity: opacityGlow }}
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#E53935]/10 rounded-full blur-[130px] pointer-events-none"
      />

      {/* Decorative Parallax Chess Figures */}
      <motion.div
        style={{ y: yChessKing }}
        className="absolute top-16 left-6 sm:left-12 text-white/[0.035] select-none text-[160px] sm:text-[220px] font-serif pointer-events-none leading-none z-0"
      >
        ♔
      </motion.div>
      <motion.div
        style={{ y: yChessKnight }}
        className="absolute bottom-12 right-6 sm:right-12 text-white/[0.035] select-none text-[180px] sm:text-[240px] font-serif pointer-events-none leading-none z-0"
      >
        ♞
      </motion.div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Top Tag Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full px-4 py-1.5 mb-6 text-xs sm:text-sm font-bold shadow-lg shadow-[#D4AF37]/10 backdrop-blur-md"
        >
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Live Concert Sinh Nhật Câu Lạc Bộ Âm Nhạc</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-pulse" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none mb-6"
        >
          CHESS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F0CA50] to-[#E53935]">NIGHT</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Đêm nhạc hội ngộ đặc biệt chào mừng sinh nhật CLB. Không gian nghệ thuật đương đại giao thoa giữa giai điệu Acoustic mộc mạc và tinh thần Bàn Cờ Vua đỉnh cao.
        </motion.p>

        {/* Event Meta Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-10 text-xs sm:text-sm text-neutral-300 font-semibold"
        >
          <div className="flex items-center gap-2 bg-[#1C1C1E] border border-white/10 px-4 py-2.5 rounded-xl shadow-md">
            <Calendar size={15} className="text-[#D4AF37] shrink-0" />
            <span>31 Tháng 12, 2025</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1C1C1E] border border-white/10 px-4 py-2.5 rounded-xl shadow-md">
            <Clock size={15} className="text-[#D4AF37] shrink-0" />
            <span>19:00 - 22:30</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1C1C1E] border border-white/10 px-4 py-2.5 rounded-xl shadow-md">
            <MapPin size={15} className="text-[#E53935] shrink-0" />
            <span>Hà Nội Concert Hall</span>
          </div>
        </motion.div>

        {/* Primary CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={handleBuyClick}
            className="w-full sm:w-auto btn-gold px-9 py-4.5 rounded-2xl text-base sm:text-lg flex items-center justify-center gap-3 cursor-pointer shadow-xl active:scale-95"
          >
            <Ticket size={20} />
            <span>MUA VÉ NGAY</span>
            <span className="text-xl">→</span>
          </button>

          <button
            onClick={handleScrollDown}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Xem Lịch Trình</span>
            <ArrowDown size={16} className="text-[#D4AF37]" />
          </button>
        </motion.div>

        {/* Price & Perks hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs sm:text-sm text-neutral-400 font-medium"
        >
          Giá vé: <span className="text-[#D4AF37] font-black text-base font-mono">150.000đ</span> / vé • Bao gồm đồ uống & quà Minigame
        </motion.div>
      </div>
    </section>
  )
}
