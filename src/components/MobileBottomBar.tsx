'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Ticket, ArrowRight } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'

export default function MobileBottomBar() {
  const pathname = usePathname()
  const { playClickSound } = useAudio()

  // Do not show on admin/dev or checkout page where user is already completing order
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dev') ||
    pathname === '/book'
  ) {
    return null
  }

  return (
    <aside aria-label="Thanh đặt vé nhanh trên điện thoại" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 pb-[max(12px,calc(10px+env(safe-area-inset-bottom)))] shadow-[0_-8px_30px_rgba(0,0,0,0.4)] transition-colors duration-200 mobile-bottom-bar">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Left: Price & Water Perk Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-[#D4AF37] font-mono leading-none">
              89.000đ
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Có nước
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-0.5 font-medium">
            1 vé / người • Đã bao gồm nước
          </span>
        </div>

        {/* Right: Instant Buy Ticket CTA Button */}
        <Link
          href="/book"
          onClick={playClickSound}
          className="btn-gold flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-black text-xs shadow-xl active:scale-95 transition-transform shrink-0"
        >
          <Ticket size={15} />
          <span>MUA VÉ NGAY</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </aside>
  )
}
