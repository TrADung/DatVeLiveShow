'use client'

import { motion } from 'framer-motion'
import { Gift, Timer, Hash, Sparkles, Trophy, Award } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MinigameSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 10, hours: 8, minutes: 45, seconds: 30 })

  useEffect(() => {
    const targetDate = new Date('2025-12-31T21:45:00')
    const now = new Date()
    const effectiveTarget = targetDate > now ? targetDate : new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)

    const interval = setInterval(() => {
      const current = new Date()
      const diff = effectiveTarget.getTime() - current.getTime()

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <section id="minigame" className="py-24 sm:py-32 pb-40 sm:pb-48 px-4 sm:px-6 bg-[#0E0E11] relative border-b border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <div className="section-heading-line mb-4">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-red-500 bg-red-950/40 border border-red-500/30 px-4 py-1.5 rounded-full flex items-center gap-1.5">
            <Gift size={13} />
            <span>MINIGAME ĐỘC QUYỀN SÂN KHẤU</span>
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Quay Số May Mắn Trúng Thưởng
        </h2>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-14 leading-relaxed font-normal">
          Mỗi chiếc vé tham dự đều được cấp một <strong className="text-red-400">Số May Mắn (Lucky Number)</strong> 4 chữ số duy nhất. Toàn bộ khán giả check-in tại cửa đều có cơ hội nhận quà giá trị từ CLB!
        </p>

        {/* Large Monospace Countdown (Inspired by BluDays tour dates) */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Timer size={15} className="text-red-500" />
            <span>ĐẾM NGƯỢC ĐẾN THỜI ĐIỂM QUAY SỐ TRỰC TIẾP</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {[
              { label: 'NGÀY', value: timeLeft.days },
              { label: 'GIỜ', value: timeLeft.hours },
              { label: 'PHÚT', value: timeLeft.minutes },
              { label: 'GIÂY', value: timeLeft.seconds },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-18 h-18 sm:w-24 sm:h-24 bg-[#141417] text-white rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-black font-mono shadow-2xl border border-white/10 border-b-4 border-b-red-500">
                  {pad(item.value)}
                </div>
                <span className="text-[10px] sm:text-xs font-black text-slate-500 mt-2.5 tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lucky Number Preview Card */}
        <div className="card-luxury rounded-3xl p-8 sm:p-10 max-w-md mx-auto mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Hash size={18} className="text-red-500" />
            <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
              Số May Mắn Của Bạn
            </span>
          </div>

          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-red-600 tracking-widest my-4 select-none font-mono">
            #????
          </div>

          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Số may mắn sẽ tự động hiển thị trong vé điện tử và email của bạn ngay sau khi hoàn tất thanh toán.
          </p>
        </div>

        {/* Prize Structure Cards (3 tiers) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            {
              rank: 'Giải Nhất',
              tag: '01 Giải Đặc Biệt',
              reward: 'Cây đàn Guitar Acoustic Epiphone cao cấp + Kỷ niệm chương mạ vàng CLB',
              icon: <Trophy size={28} className="text-amber-400" />,
              border: 'border-red-500/40 bg-gradient-to-b from-red-950/20 to-[#141417]',
              badge: 'bg-red-600 text-white',
            },
            {
              rank: 'Giải Nhì',
              tag: '02 Giải Nhì',
              reward: 'Bộ tai nghe kiểm âm Studio chuyên nghiệp + Combo Áo thun & Túi Tote kỷ niệm',
              icon: <Award size={28} className="text-slate-300" />,
              border: 'border-white/10 bg-[#141417]',
              badge: 'bg-white/10 text-white',
            },
            {
              rank: 'Giải Ba',
              tag: '03 Giải Ba',
              reward: 'Voucher đồ uống đặc biệt & Set quà lưu niệm độc quyền đêm liveshow',
              icon: <Sparkles size={28} className="text-amber-500" />,
              border: 'border-white/10 bg-[#141417]',
              badge: 'bg-white/10 text-slate-300',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className={`p-6 sm:p-7 rounded-3xl border ${item.border} shadow-xl flex flex-col justify-between transition-all duration-300 min-h-[200px]`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>{item.icon}</div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${item.badge}`}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base sm:text-lg mb-2">{item.rank}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">{item.reward}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
