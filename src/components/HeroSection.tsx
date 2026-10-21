'use client'

import { motion } from 'framer-motion'
import { Ticket, ArrowDown, Music, Calendar, MapPin, Clock } from 'lucide-react'
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
      className="relative min-h-[95vh] flex flex-col items-center justify-center pt-28 pb-20 px-4 sm:px-6 bg-[#FFFFFF] overflow-hidden"
    >
      {/* Subtle clean chess background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, #E2E8F0 1px, transparent 1px),
            linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      
      {/* Soft gradient vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/20 via-transparent to-white" />

      {/* Decorative Chess Pieces watermark - clean, subtle, no spinning */}
      <div className="absolute top-16 left-6 text-slate-200/50 select-none text-[140px] sm:text-[180px] font-serif pointer-events-none">
        ♔
      </div>
      <div className="absolute bottom-10 right-6 text-slate-200/50 select-none text-[160px] sm:text-[200px] font-serif pointer-events-none">
        ♞
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
        {/* Top Tag Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-full px-4 py-1.5 mb-6 text-xs sm:text-sm font-bold shadow-xs"
        >
          <Music size={14} className="text-red-600" />
          <span>Live Concert Sinh Nhật Câu Lạc Bộ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black text-slate-900 tracking-tight leading-none mb-6"
        >
          CHESS <span className="text-red-600">NIGHT</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed font-normal"
        >
          Đêm nhạc đặc biệt chào mừng sinh nhật CLB Âm Nhạc. Không gian nghệ thuật giao thoa giữa giai điệu Acoustic và tinh thần Bàn Cờ Vua đỉnh cao.
        </motion.p>

        {/* Event Meta Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-10 text-xs sm:text-sm text-slate-700 font-semibold"
        >
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
            <Calendar size={14} className="text-red-600 shrink-0" />
            <span>31 Tháng 12, 2025</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
            <Clock size={14} className="text-red-600 shrink-0" />
            <span>19:00 - 22:30</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
            <MapPin size={14} className="text-red-600 shrink-0" />
            <span>Hà Nội Concert Hall</span>
          </div>
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="w-full sm:w-auto"
        >
          <button
            onClick={handleBuyClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black text-base sm:text-lg px-9 py-4 rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-red-600/40 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Ticket size={20} />
            <span>MUA VÉ NGAY</span>
            <span>→</span>
          </button>
        </motion.div>

        {/* Price Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs sm:text-sm text-slate-500 font-medium"
        >
          Giá vé: <span className="text-red-600 font-black text-base">150.000đ</span> / người • Bao gồm đồ uống & quà Minigame
        </motion.div>

        {/* Discover Hint with Generous Margin */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleScrollDown}
          className="mt-14 sm:mt-16 flex flex-col items-center gap-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer group"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors">
            Khám Phá Chương Trình
          </span>
          <ArrowDown size={14} className="text-red-600 animate-bounce mt-1" />
        </motion.button>
      </div>
    </section>
  )
}
