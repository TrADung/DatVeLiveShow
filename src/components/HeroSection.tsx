'use client'

import { motion } from 'framer-motion'
import { Ticket, ArrowDown, Music, Calendar, MapPin, Clock, Sparkles } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'

interface HeroSectionProps {
  onBuyTicket: () => void
}

export default function HeroSection({ onBuyTicket }: HeroSectionProps) {
  const { playClickSound } = useAudio()

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
      className="relative min-h-[92vh] sm:min-h-[95vh] flex flex-col items-center justify-center pt-28 sm:pt-32 pb-20 px-4 sm:px-6 bg-[#0A0A0C] overflow-hidden editorial-grid"
    >
      {/* Radial glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Chess Watermark Figures */}
      <div className="absolute top-20 left-8 text-white/[0.03] select-none text-[150px] sm:text-[220px] font-serif pointer-events-none leading-none">
        ♔
      </div>
      <div className="absolute bottom-12 right-8 text-white/[0.03] select-none text-[170px] sm:text-[240px] font-serif pointer-events-none leading-none">
        ♞
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Tag Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full px-4 py-1.5 mb-6 text-xs sm:text-sm font-bold shadow-lg shadow-red-500/10 backdrop-blur-md"
        >
          <Sparkles size={14} className="text-red-400" />
          <span>Live Concert Sinh Nhật Câu Lạc Bộ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none mb-6"
        >
          CHESS <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-rose-400">NIGHT</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Đêm nhạc hội ngộ đặc biệt chào mừng sinh nhật CLB Âm Nhạc. Không gian nghệ thuật đỉnh cao giao thoa giữa giai điệu Acoustic mộc mạc và tinh thần Bàn Cờ Vua đương đại.
        </motion.p>

        {/* Event Meta Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-10 text-xs sm:text-sm text-slate-300 font-semibold"
        >
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            <Calendar size={15} className="text-red-500 shrink-0" />
            <span>31 Tháng 12, 2025</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            <Clock size={15} className="text-red-500 shrink-0" />
            <span>19:00 - 22:30</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            <MapPin size={15} className="text-red-500 shrink-0" />
            <span>Hà Nội Concert Hall</span>
          </div>
        </motion.div>

        {/* Primary CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="w-full sm:w-auto"
        >
          <button
            onClick={handleBuyClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 btn-crimson font-black text-base sm:text-lg px-10 py-4.5 rounded-2xl shadow-2xl cursor-pointer active:scale-95"
          >
            <Ticket size={22} />
            <span>MUA VÉ NGAY</span>
            <span className="text-xl">→</span>
          </button>
        </motion.div>

        {/* Price Tag & Perks hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs sm:text-sm text-slate-400 font-medium"
        >
          Giá vé: <span className="text-red-400 font-black text-base font-mono">150.000đ</span> / người • Kèm đồ uống & vòng tay phát sáng
        </motion.div>

        {/* Discover Hint */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleScrollDown}
          className="mt-14 sm:mt-18 flex flex-col items-center gap-1.5 text-slate-500 hover:text-white transition-colors cursor-pointer group"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-red-400 transition-colors">
            Khám Phá Lịch Trình & Hoạt Động
          </span>
          <ArrowDown size={15} className="text-red-500 animate-bounce mt-1" />
        </motion.button>
      </div>
    </section>
  )
}
