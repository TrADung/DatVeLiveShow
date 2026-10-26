'use client'

import Link from 'next/link'
import { Ticket, Mail, Phone, Calendar, Sparkles, ArrowUpRight } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { EVENT_INFO } from '@/lib/constants'
import VenueBadge from '@/components/VenueBadge'

interface FooterProps {
  onBuyTicket?: () => void
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
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl text-[#D4AF37]">♟</span>
              <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase">
                {EVENT_INFO.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed font-normal">
              Đêm nhạc kỷ niệm sinh nhật 11 tuổi CLB DTU Acoustic. Cùng trải nghiệm cảm giác bước chân vào bàn cờ tình yêu, cảm nhận cách yêu qua từng giai điệu âm nhạc.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-[#1C1C1E] border border-white/10 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md h-11 shrink-0">
                <Calendar size={15} className="text-[#D4AF37] shrink-0" />
                <span>{EVENT_INFO.eventDateShort} • {EVENT_INFO.eventTime}</span>
              </div>
              <VenueBadge showLabel={false} className="h-11 shrink-0" />
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
              
              <Link
                href="/my-tickets"
                onClick={playClickSound}
                className="text-left hover:text-[#D4AF37] transition-colors flex items-center gap-1 font-medium"
              >
                <span>Tra Cứu Vé Của Tôi</span>
              </Link>
              <Link
                href="/book"
                onClick={playClickSound}
                className="text-left text-[#D4AF37] hover:text-[#F0CA50] transition-colors flex items-center gap-1 font-bold"
              >
                <span>Cổng Đặt Vé Trực Tuyến</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          {/* Contact Details with Clickable Links */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-300 mb-4">
              Ban Tổ Chức CLB DTU Acoustic
            </h4>
            <div className="flex flex-col gap-3 text-xs sm:text-sm text-neutral-300 font-medium">
              {/* Clickable Email */}
              <a
                href={`mailto:${EVENT_INFO.email}`}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors group"
                title="Nhấn để gửi email cho CLB"
              >
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37] group-hover:scale-110 transition-transform">
                  <Mail size={15} />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Email liên hệ</span>
                  <span className="group-hover:text-[#D4AF37] transition-colors">{EVENT_INFO.email}</span>
                </div>
              </a>

              {/* Clickable Phone / Hotline */}
              <a
                href={`tel:${EVENT_INFO.hotline}`}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors group"
                title="Nhấn để gọi hotline"
              >
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37] group-hover:scale-110 transition-transform">
                  <Phone size={15} />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Hotline Trực Tiếp</span>
                  <span className="group-hover:text-[#D4AF37] transition-colors font-bold">
                    {EVENT_INFO.hotline} <span className="font-normal text-neutral-400">({EVENT_INFO.hotlineName})</span>
                  </span>
                </div>
              </a>

              {/* Social Channels Row */}
              <div className="pt-2 flex items-center gap-3">
                {/* Facebook Button */}
                <a
                  href={EVENT_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 hover:border-[#1877F2]/60 transition-all text-xs text-[#1877F2] font-bold group"
                  title="Mở Facebook CLB"
                >
                  <svg className="w-4 h-4 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                  <ArrowUpRight size={13} className="ml-auto opacity-70 group-hover:opacity-100" />
                </a>

                {/* TikTok Button */}
                <a
                  href={EVENT_INFO.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 transition-all text-xs text-white font-bold group"
                  title="Mở TikTok CLB"
                >
                  <svg className="w-4 h-4 fill-current text-[#D4AF37] shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                  <span>TikTok</span>
                  <ArrowUpRight size={13} className="ml-auto opacity-70 group-hover:opacity-100" />
                </a>
              </div>
            </div> 
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 text-center sm:text-left">
            © 2026 CLB DTU Acoustic • {EVENT_INFO.name} Concert. Ngôn ngữ thiết kế Cờ Vua Đen Nhám - Vàng Champagne - Đỏ Nhung.
          </p>

          <Link
            href="/book"
            onClick={playClickSound}
            className="btn-gold flex items-center gap-2 text-xs font-black px-6 py-3 rounded-xl shadow-lg cursor-pointer"
          >
            <Ticket size={16} />
            <span>ĐẶT VÉ THAM DỰ NGAY</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
