'use client'

import { motion } from 'framer-motion'
import { Sparkles, Shirt } from 'lucide-react'

const dressColors = [
  {
    name: 'ĐEN',
    desc: 'Huyền bí & Quyền lực',
    bg: 'bg-black',
    border: 'border-white/30',
    textColor: 'text-white',
    badge: 'Chủ đạo',
    badgeStyle: 'bg-white/10 text-neutral-300 border-white/20',
  },
  {
    name: 'TRẮNG',
    desc: 'Thanh lịch & Tinh khôi',
    bg: 'bg-white',
    border: 'border-black/20',
    textColor: 'text-black',
    badge: 'Chủ đạo',
    badgeStyle: 'bg-neutral-800 text-white border-neutral-700',
  },
  {
    name: 'ĐỎ',
    desc: 'Nồng nhiệt & Khí chất',
    bg: 'bg-[#DC2626]',
    border: 'border-red-400/40',
    textColor: 'text-white',
    badge: 'Chủ đạo',
    badgeStyle: 'bg-red-950/60 text-red-300 border-red-500/40',
  },
  {
    name: 'VÀNG',
    desc: 'Điểm nhấn Hoàng gia',
    bg: 'bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA771C]',
    border: 'border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,55,0.3)]',
    textColor: 'text-neutral-900',
    badge: 'Điểm nhấn',
    badgeStyle: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50',
  },
]

export default function DressCodeSection() {
  return (
    <section className="relative w-full block py-10 md:py-14 bg-[#111113] border-y border-white/10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Compact */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] sm:text-xs font-bold tracking-widest uppercase mb-2">
            <Shirt size={13} className="text-[#D4AF37]" />
            <span>Dresscode</span>
            <Sparkles size={11} className="text-[#D4AF37]" />
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wider uppercase">
            Bảng Màu Trang Phục Tham Dự
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl mx-auto">
            Khuyến khích diện trang phục mang tông màu <strong className="text-white">Đen – Trắng – Đỏ</strong>, có thể nhấn thêm phụ kiện ánh <strong className="text-[#D4AF37]">Vàng Gold</strong>.
          </p>
        </div>

        {/* 4 Color Swatches - Clean & Compact Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5 max-w-3xl mx-auto">
          {dressColors.map((color, index) => (
            <motion.div
              key={color.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.1 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="bg-[#18181B] border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 shadow-lg group cursor-default"
            >
              {/* Color Box */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl ${color.bg} border-2 ${color.border} shadow-md mb-3 flex items-center justify-center transition-transform group-hover:scale-105`}
              />

              {/* Color Name */}
              <div className="text-base sm:text-lg font-black text-white tracking-widest uppercase">
                {color.name}
              </div>

              {/* Sub description / badge */}
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border mt-1.5 ${color.badgeStyle}`}>
                {color.badge}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Sleek Marquee Ribbon Below for dynamic vibe */}
        <div className="mt-7 pt-5 border-t border-white/5 overflow-hidden">
          <div className="marquee-track flex items-center whitespace-nowrap opacity-75 hover:opacity-100 transition-opacity">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 mx-4 shrink-0 text-xs sm:text-sm font-bold tracking-widest text-neutral-400 uppercase">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black border border-white/40" />
                  <span>ĐEN</span>
                </span>
                <span className="text-[#D4AF37]">✦</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white border border-black/30" />
                  <span>TRẮNG</span>
                </span>
                <span className="text-[#D4AF37]">✦</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <span>ĐỎ</span>
                </span>
                <span className="text-[#D4AF37]">✦</span>
                <span className="flex items-center gap-2 text-[#D4AF37]">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <span>NHẤN VÀNG GOLD</span>
                </span>
                <span className="text-white/20">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
