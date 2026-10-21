'use client'

import { motion } from 'framer-motion'
import { Ticket, Heart, Globe, Mail, Phone, MapPin } from 'lucide-react'
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
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-16 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl text-red-500">♟</span>
              <span className="text-xl font-black tracking-wider text-white">CHESS NIGHT</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Live Show Kỷ Niệm Sinh Nhật Câu Lạc Bộ Âm Nhạc. 
              Trải nghiệm nghệ thuật đỉnh cao kết hợp tinh thần Cờ Vua đương đại và âm nhạc acoustic đầy cảm xúc.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <MapPin size={14} className="text-red-500 shrink-0" />
              <span>Hà Nội Concert Hall • 31/12/2025</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">
              Khám Phá
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
              <button
                onClick={() => scrollTo('#hero')}
                className="text-left hover:text-red-400 transition-colors cursor-pointer"
              >
                Trang Chủ
              </button>
              <button
                onClick={() => scrollTo('#timeline')}
                className="text-left hover:text-red-400 transition-colors cursor-pointer"
              >
                Timeline Lịch Trình
              </button>
              <button
                onClick={() => scrollTo('#activities')}
                className="text-left hover:text-red-400 transition-colors cursor-pointer"
              >
                Hoạt Động CLB
              </button>
              <button
                onClick={() => scrollTo('#minigame')}
                className="text-left hover:text-red-400 transition-colors cursor-pointer"
              >
                Minigame Bốc Thăm
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">
              Liên Hệ Ban Tổ Chức
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-red-500" />
                <span>clbamnhac@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-red-500" />
                <span>Hotline: 0912 345 678</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-red-500" />
                <span>Fanpage: CLB Âm Nhạc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © 2025 CLB Âm Nhạc • Chess Night Live Show. Thiết kế với tone màu Cờ Vua Trắng - Đỏ - Đen.
          </p>
          <button
            onClick={() => { playClickSound(); onBuyTicket() }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-red-600/30 transition-all cursor-pointer"
          >
            <Ticket size={15} />
            <span>ĐẶT VÉ NGAY</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
