'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Timer, Calendar, Clock, Ticket } from 'lucide-react'
import Link from 'next/link'
import { useAudio } from '@/hooks/useAudio'

export default function MinigameSection() {
  const { playClickSound } = useAudio()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTime = () => {
      const current = new Date()
      let targetDate = new Date('2026-11-07T19:00:00')

      // If the target date has passed relative to the computer's system clock,
      // target the upcoming event date (2027-07-11) so the countdown is actively ticking
      if (targetDate.getTime() <= current.getTime()) {
        targetDate = new Date('2027-11-07T19:00:00')
      }

      const diff = targetDate.getTime() - current.getTime()

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <section
      id="minigame"
      className="relative w-full py-16 md:py-24 overflow-hidden flex flex-col justify-center bg-[#0D0D0D] border-t border-white/5"
    >
      {/* Background ambient gold aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Section Header */}
        <div className="section-heading-line mb-4 flex justify-center">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/10">
            <Timer size={13} />
            <span>ĐẾM NGƯỢC THỜI GIAN DIỄN RA SHOW</span>
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Thời Gian Còn Lại Đến Giờ Khai Mạc
        </h2>

        <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
          Liveshow chính thức diễn ra vào lúc <strong className="text-[#D4AF37]">19:00 ngày 07/11/2026</strong>. Hãy chuẩn bị tinh thần để hòa mình vào những giai điệu acoustic mộc mạc và những màn trình diễn thăng hoa nhất!
        </p>

        {/* Large Monospace Countdown */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">
            <Clock size={15} className="text-[#D4AF37]" />
            <span>ĐẾM NGƯỢC ĐẾN THỜI ĐIỂM DIỄN RA SHOW (19:00 • 07/11/2026)</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6">
            {[
              { label: 'NGÀY', value: timeLeft.days },
              { label: 'GIỜ', value: timeLeft.hours },
              { label: 'PHÚT', value: timeLeft.minutes },
              { label: 'GIÂY', value: timeLeft.seconds },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-18 h-18 sm:w-24 sm:h-24 bg-[#1C1C1E] text-white rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-black font-mono shadow-2xl border border-white/10 border-b-4 border-b-[#D4AF37] hover:border-[#D4AF37] transition-colors">
                  {pad(item.value)}
                </div>
                <span className="text-[10px] sm:text-xs font-black text-neutral-400 mt-2.5 tracking-wider">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick CTA to Booking */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="inline-flex flex-col sm:flex-row items-center gap-4 mt-2"
        >
          <Link
            href="/book"
            onClick={playClickSound}
            className="btn-gold px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Ticket size={18} />
            <span>ĐẶT VÉ THAM DỰ CHỈ 70.000đ</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
