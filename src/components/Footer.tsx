'use client'

import Link from 'next/link'
import { Ticket, Mail, Phone, MapPin, Sparkles, ArrowUpRight } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'

interface FooterProps {
  onBuyTicket: () => void
}

export default function Footer({ onBuyTicket }: FooterProps) {
  const { playClickSound } = useAudio()

  const scrollTo = (id: string) => {
    playClickSound()
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="relative w-full block bg-[#0D0D0D] text-white border-t border-white/10 pt-16 md:pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 mb-16">
          {/* Brand & Concept */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl text-[#D4AF37]">♟</span>
              <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase">
                CHESS NIGHT 2025
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed font-normal">
              Đêm nhạc kỷ niệm sinh nhật CLB Âm Nhạc. Trải nghiệm nghệ thuật đương đại kết hợp tinh thần Cờ Vua đỉnh cao và giai điệu Acoustic mộc mạc tràn đầy cảm xúc.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-neutral-400">
              <MapPin size={15} className="text-[#E53935] shrink-0" />
              <span>Hà Nội Concert Hall (Phố Nghệ Thuật) • 31.12.2025</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-300 mb-4 flex items-center gap-1.5">
              <span>Khám Phá</span>
              <Sparkles size={12} className="text-[#D4AF37]" />
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-400 font-medium">
              <button
                onClick={() => scrollTo('#hero')}
                className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Trang Chủ
              </button>
              <button
                onClick={() => scrollTo('#timeline')}
                className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Timeline Sự Kiện
              </button>
              <button
                onClick={() => scrollTo('#activities')}
                className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Các Show Đã Tổ Chức
              </button>
              <button
                onClick={() => scrollTo('#minigame')}
                className="text-left hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Minigame Bốc Thăm
              </button>
              <Link
                href="/book"
                onClick={playClickSound}
                className="text-left text-[#D4AF37] hover:text-[#F0CA50] transition-colors flex items-center gap-1 font-bold"
              >
                <span>Cổng Đặt Vé Toàn Màn Hình</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-300 mb-4">
              Ban Tổ Chức CLB
            </h4>
            <div className="flex flex-col gap-3 text-xs sm:text-sm text-neutral-400 font-medium">
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#D4AF37] shrink-0" />
                <span className="truncate">clbamnhac@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#D4AF37] shrink-0" />
                <span>Hotline: 0912 345 678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#D4AF37] font-bold shrink-0">✦</span>
                <span>Fanpage: CLB Âm Nhạc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 text-center sm:text-left">
            © 2025 CLB Âm Nhạc • Chess Night Concert. Ngôn ngữ thiết kế Cờ Vua Đen Nhám - Vàng Champagne - Đỏ Nhung.
          </p>

          <button
            onClick={() => { playClickSound(); onBuyTicket() }}
            className="btn-gold flex items-center gap-2 text-xs font-black px-6 py-3 rounded-xl shadow-lg cursor-pointer"
          >
            <Ticket size={16} />
            <span>ĐẶT VÉ THAM DỰ NGAY</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
