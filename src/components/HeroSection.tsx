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

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden bg-white chess-grid-light"
    >
      {/* Subtle top & bottom ambient fades */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 via-transparent to-white" />

      {/* Decorative Chess Motif Watermarks - Subtle and elegant, NOT spinning rings */}
      <div className="absolute -top-12 -left-12 text-slate-100 select-none text-[180px] font-serif pointer-events-none opacity-40">
        ♔
      </div>
      <div className="absolute -bottom-16 -right-12 text-slate-100 select-none text-[220px] font-serif pointer-events-none opacity-40">
        ♞
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Event Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-full px-4 py-1.5 mb-6 text-xs sm:text-sm font-bold shadow-sm"
        >
          <Music size={14} className="text-red-600" />
          <span>Live Concert Sinh Nhật Câu Lạc Bộ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        </motion.div>

        {/* Main Title - Clean, bold, impactful */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight mb-4 leading-none"
        >
          CHESS <span className="text-red-600">NIGHT</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Đêm nhạc đặc biệt chào mừng sinh nhật CLB Âm Nhạc. 
          Không gian nghệ thuật giao thoa giữa giai điệu Acoustic và tinh thần Bàn Cờ Vua đỉnh cao.
        </motion.p>

        {/* Event Meta Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 text-xs sm:text-sm text-slate-700 font-semibold"
        >
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
            <Calendar size={15} className="text-red-600" />
            <span>31 Tháng 12, 2025</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
            <Clock size={15} className="text-red-600" />
            <span>19:00 - 22:30</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
            <MapPin size={15} className="text-red-600" />
            <span>Hà Nội Concert Hall</span>
          </div>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBuyClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black text-lg sm:text-xl px-10 py-4 sm:py-4.5 rounded-2xl shadow-xl shadow-red-600/25 transition-all duration-200 cursor-pointer"
          >
            <Ticket size={22} />
            <span>MUA VÉ NGAY</span>
            <span>→</span>
          </motion.button>
        </motion.div>

        {/* Ticket Price info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 font-medium"
        >
          <span>Giá vé:</span>
          <span className="text-red-600 font-black text-base">150.000đ</span>
          <span>/ người • Bao gồm đồ uống & quà Minigame</span>
        </motion.div>
      </div>

      {/* Clean scroll hint */}
      <div className="mt-14 sm:mt-16 flex flex-col items-center gap-1.5 text-slate-400">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Khám Phá Chương Trình</span>
        <ArrowDown size={15} className="text-red-600 animate-bounce" />
      </div>
    </section>
  )
}
