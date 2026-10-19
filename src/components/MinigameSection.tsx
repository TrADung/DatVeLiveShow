'use client'

import { motion } from 'framer-motion'
import { Gift, Timer, Hash } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MinigameSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const targetDate = new Date('2025-12-31T21:45:00+07:00')
    
    const interval = setInterval(() => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()
      
      if (diff <= 0) {
        clearInterval(interval)
        return
      }
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <section id="minigame" className="py-20 px-4 relative bg-[#0D0D0D]">
      <div className="absolute inset-0 chess-pattern opacity-20" />
      
      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium mb-4">
            <Gift size={16} />
            <span>Minigame</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-[#F5F2EB] mb-4">
            Quay Số Trúng Thưởng
          </h2>
          
          <p className="text-[#A8A090] mb-10 max-w-xl mx-auto">
            Mỗi vé được gán một <span className="text-[#D4AF37] font-semibold">Số May Mắn</span> ngẫu nhiên. 
            Tất cả khán giả có mặt đêm show đều có cơ hội trúng thưởng.
          </p>

          {/* Countdown */}
          <div className="inline-block mb-10">
            <div className="flex items-center gap-2 text-xs text-[#A8A090] mb-3">
              <Timer size={14} />
              <span>Thời gian quay số</span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: 'Ngày', value: timeLeft.days },
                { label: 'Giờ', value: timeLeft.hours },
                { label: 'Phút', value: timeLeft.minutes },
                { label: 'Giây', value: timeLeft.seconds },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <motion.div
                    key={item.value}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-dark rounded-xl w-16 h-16 flex items-center justify-center
                               border border-[#D4AF37]/20 text-2xl font-black text-[#D4AF37]"
                  >
                    {pad(item.value)}
                  </motion.div>
                  <span className="text-xs text-[#A8A090] mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lucky Number showcase */}
          <div className="glass-dark rounded-2xl p-8 border border-[#D4AF37]/20 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Hash size={20} className="text-[#D4AF37]" />
              <span className="text-base font-semibold text-[#F5F2EB]">Số May Mắn Của Bạn</span>
            </div>
            <div className="text-5xl sm:text-6xl font-black text-[#D4AF37] tracking-widest glow-gold float-anim">
              ????
            </div>
            <p className="text-xs text-[#A8A090] mt-4">
              Đăng nhập và mua vé để nhận số may mắn của bạn
            </p>
          </div>

          {/* Prizes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { prize: 'Giải Nhất', reward: 'Phần quà đặc biệt từ CLB', icon: '🥇', class: 'border-[#D4AF37]/40' },
              { prize: 'Giải Nhì', reward: 'Voucher & Quà lưu niệm', icon: '🥈', class: 'border-[#A8A090]/30' },
              { prize: 'Giải Ba', reward: 'Quà lưu niệm CLB', icon: '🥉', class: 'border-[#6E472B]/30' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-dark rounded-xl p-4 border ${item.class}`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-bold text-[#F5F2EB] text-sm">{item.prize}</div>
                <div className="text-xs text-[#A8A090] mt-1">{item.reward}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
