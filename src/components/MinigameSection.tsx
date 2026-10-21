'use client'

import { motion } from 'framer-motion'
import { Gift, Timer, Hash } from 'lucide-react'
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
    <section id="minigame" className="pt-24 pb-36 sm:pb-44 px-4 sm:px-6 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-2xs">
          <Gift size={13} />
          <span>MINIGAME ĐỘC QUYỀN</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
          Quay Số May Mắn Trúng Thưởng
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-12 leading-relaxed">
          Mỗi chiếc vé tham dự đều được cấp một <span className="font-bold text-red-600">Số May Mắn (Lucky Number)</span> 4 chữ số duy nhất. Toàn bộ khán giả check-in tại cửa đều có cơ hội nhận quà giá trị từ CLB!
        </p>

        {/* Dynamic Countdown */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            <Timer size={14} className="text-red-600" />
            <span>Thời Gian Đếm Ngược Đến Giờ Quay Số</span>
          </div>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {[
              { label: 'Ngày', value: timeLeft.days },
              { label: 'Giờ', value: timeLeft.hours },
              { label: 'Phút', value: timeLeft.minutes },
              { label: 'Giây', value: timeLeft.seconds },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md border-b-4 border-red-600">
                  {pad(item.value)}
                </div>
                <span className="text-[11px] font-bold text-slate-500 mt-2 uppercase">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lucky Number Preview Card */}
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200 max-w-lg mx-auto mb-16 shadow-xs">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Hash size={18} className="text-red-600" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              Số May Mắn Của Bạn
            </span>
          </div>
          <div className="text-5xl sm:text-6xl font-black text-red-600 tracking-widest my-3 select-none font-mono">
            #????
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Số may mắn sẽ tự động hiển thị trong vé điện tử và email của bạn sau khi đặt vé thành công.
          </p>
        </div>

        {/* Prize Structure Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            {
              rank: 'Giải Nhất',
              tag: 'Đặc Biệt',
              reward: 'Cây đàn Guitar Acoustic Epiphone cao cấp + Kỷ niệm chương mạ vàng CLB',
              icon: '🥇',
              border: 'border-red-300 bg-red-50/30',
              badge: 'bg-red-600 text-white',
            },
            {
              rank: 'Giải Nhì',
              tag: '02 Giải',
              reward: 'Bộ tai nghe kiểm âm Studio chuyên nghiệp + Combo Áo & Túi Tote sinh nhật',
              icon: '🥈',
              border: 'border-slate-200 bg-white',
              badge: 'bg-slate-900 text-white',
            },
            {
              rank: 'Giải Ba',
              tag: '03 Giải',
              reward: 'Voucher đồ uống đặc biệt & Set quà lưu niệm độc quyền đêm liveshow',
              icon: '🥉',
              border: 'border-slate-200 bg-white',
              badge: 'bg-slate-200 text-slate-800',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className={`p-6 sm:p-7 rounded-3xl border ${item.border} shadow-xs flex flex-col justify-between transition-all duration-200 min-h-[190px]`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.badge}`}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{item.rank}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{item.reward}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
