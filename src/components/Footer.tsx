'use client'

import { motion } from 'framer-motion'
import { Ticket, Heart, Instagram, Facebook, Youtube } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'

interface FooterProps {
  onBuyTicket: () => void
}

export default function Footer({ onBuyTicket }: FooterProps) {
  const { playClickSound } = useAudio()

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#D4AF37]/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-xl font-black text-[#D4AF37] mb-2">♟ CHESS NIGHT</div>
            <p className="text-sm text-[#A8A090] leading-relaxed">
              Đêm nhạc sinh nhật câu lạc bộ âm nhạc. 
              Trải nghiệm âm nhạc đỉnh cao theo phong cách Chess Tournament.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#F5F2EB] mb-3">Liên Kết Nhanh</h4>
            <div className="flex flex-col gap-2">
              {['Trang Chủ', 'Timeline', 'Hoạt Động CLB', 'Minigame', 'Vé của tôi'].map(link => (
                <button
                  key={link}
                  onClick={() => playClickSound()}
                  className="text-sm text-[#A8A090] hover:text-[#D4AF37] transition-colors text-left"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-[#F5F2EB] mb-3">Liên Hệ</h4>
            <div className="flex flex-col gap-2 text-sm text-[#A8A090]">
              <div>📧 club@example.com</div>
              <div>📱 0912 345 678</div>
              <div className="flex gap-3 mt-3">
                {[Facebook, Instagram, Youtube].map((Icon, i) => (
                  <button
                    key={i}
                    onClick={() => playClickSound()}
                    className="w-8 h-8 rounded-full glass-dark border border-[#D4AF37]/20 
                               flex items-center justify-center text-[#A8A090] hover:text-[#D4AF37] 
                               hover:border-[#D4AF37]/50 transition-all"
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-[#D4AF37]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A8A090]">
            © 2025 CLB Âm Nhạc. Made with <Heart size={12} className="inline text-red-500" /> for music lovers.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); onBuyTicket() }}
            className="flex items-center gap-2 bg-[#D4AF37] text-[#121212] font-bold 
                       px-6 py-2.5 rounded-full text-sm hover:bg-[#e8c845] transition-all glow-gold-sm"
          >
            <Ticket size={16} />
            Mua Vé Ngay
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
