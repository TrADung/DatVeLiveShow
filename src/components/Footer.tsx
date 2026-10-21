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
    <footer className="bg-[#070709] text-white border-t border-white/10 pt-16 sm:pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 mb-16">
          {/* Brand & Manifesto */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl text-red-500">♟</span>
              <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase">
                CHESS NIGHT 2025
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed font-normal">
              Đêm nhạc kỷ niệm sinh nhật CLB Âm Nhạc. Trải nghiệm nghệ thuật đỉnh cao kết hợp tinh thần Cờ Vua đương đại và giai điệu Acoustic mộc mạc đầy xúc cảm.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <MapPin size={15} className="text-red-500 shrink-0" />
              <span>Hà Nội Concert Hall (Phố Nghệ Thuật) • 31.12.2025</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4 flex items-center gap-1.5">
              <span>Khám Phá</span>
              <Sparkles size={12} className="text-red-500" />
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <button
                onClick={() => scrollTo('#hero')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Trang Chủ
              </button>
              <button
                onClick={() => scrollTo('#timeline')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Timeline Sự Kiện
              </button>
              <button
                onClick={() => scrollTo('#activities')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Các Show Đã Tổ Chức
              </button>
              <button
                onClick={() => scrollTo('#minigame')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Minigame Bốc Thăm
              </button>
              <Link
                href="/book"
                onClick={playClickSound}
                className="text-left text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-bold"
              >
                <span>Cổng Đặt Vé Trực Tuyến</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">
              Ban Tổ Chức
            </h4>
            <div className="flex flex-col gap-3 text-xs sm:text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-red-500 shrink-0" />
                <span className="truncate">clbamnhac@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-red-500 shrink-0" />
                <span>Hotline: 0912 345 678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✦</span>
                <span>Fanpage: CLB Âm Nhạc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © 2025 CLB Âm Nhạc • Chess Night Concert. Ngôn ngữ thiết kế Cờ Vua đương đại Đen - Đỏ - Trắng.
          </p>

          <Link
            href="/book"
            onClick={playClickSound}
            className="btn-crimson flex items-center gap-2 text-xs font-black px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Ticket size={16} />
            <span>MUA VÉ THAM DỰ NGAY</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
