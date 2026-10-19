'use client'

import { motion } from 'framer-motion'
import { Clock, Music, Mic, Gift, Users, Star } from 'lucide-react'

interface TimelineEvent {
  time: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: boolean
}

const timelineEvents: TimelineEvent[] = [
  {
    time: '18:30',
    title: 'Mở Cổng & Đón Khách',
    description: 'Check-in và nhận vòng tay tại cổng vào, selfie check-in tại photo zone.',
    icon: <Users size={20} />,
  },
  {
    time: '19:00',
    title: 'Khai Mạc Đêm Nhạc',
    description: 'Nghi lễ khai mạc chính thức, giới thiệu ban nhạc và dàn khách mời đặc biệt.',
    icon: <Star size={20} />,
    highlight: true,
  },
  {
    time: '19:15',
    title: 'Phần I: Acoustic Journey',
    description: 'Những bản nhạc acoustic nhẹ nhàng, sâu lắng mở đầu cho đêm nhạc.',
    icon: <Music size={20} />,
  },
  {
    time: '20:00',
    title: 'Phần II: Live Band Performance',
    description: 'Ban nhạc CLB trình diễn các ca khúc đặc sắc với âm thanh sống động.',
    icon: <Mic size={20} />,
    highlight: true,
  },
  {
    time: '20:45',
    title: 'Phần III: Guest Artists',
    description: 'Các nghệ sĩ khách mời đặc biệt mang đến những tiết mục ấn tượng.',
    icon: <Star size={20} />,
  },
  {
    time: '21:30',
    title: 'Tiệc Sinh Nhật & Giao Lưu',
    description: 'Cắt bánh sinh nhật CLB, giao lưu và thưởng thức tiệc nhẹ cùng ban nhạc.',
    icon: <Gift size={20} />,
  },
  {
    time: '21:45',
    title: '🎰 Quay Số Trúng Thưởng',
    description: 'Bốc thăm may mắn với những phần quà hấp dẫn dành cho khán giả có mặt.',
    icon: <Gift size={20} />,
    highlight: true,
  },
  {
    time: '22:15',
    title: 'Finale & Bế Mạc',
    description: 'Màn trình diễn kết màn hoành tráng và lời cảm ơn từ CLB.',
    icon: <Music size={20} />,
  },
]

export default function TimelineSection() {
  return (
    <section id="timeline" className="py-20 px-4 relative">
      <div className="absolute inset-0 chess-bg opacity-20" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium mb-4">
            <Clock size={16} />
            <span>Lịch Trình</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F5F2EB] mb-4">
            Timeline Sự Kiện
          </h2>
          <p className="text-[#A8A090]">
            Hành trình âm nhạc xuyên đêm đặc biệt
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-0.5 timeline-line md:-translate-x-0.5" />
          
          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-start gap-6 mb-8 md:mb-12 ${
                index % 2 === 0 
                  ? 'md:flex-row-reverse md:text-right' 
                  : 'md:flex-row'
              } pl-16 md:pl-0`}
            >
              {/* Timeline dot */}
              <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center
                              w-14 h-14 rounded-full border-2 z-10 transition-colors
                              ${event.highlight 
                                ? 'bg-[#D4AF37] border-[#D4AF37] text-[#121212] glow-gold' 
                                : 'bg-[#1A1A1A] border-[#6E472B]/50 text-[#D4AF37]'
                              }`}>
                {event.icon}
              </div>

              {/* Content card */}
              <div className={`flex-1 glass-dark rounded-xl p-4 border
                              ${event.highlight 
                                ? 'border-[#D4AF37]/30' 
                                : 'border-[#6E472B]/20'
                              } md:max-w-[calc(50%-40px)]`}>
                <div className={`text-xs font-bold mb-1 ${event.highlight ? 'text-[#D4AF37]' : 'text-[#6E472B]'}`}>
                  {event.time}
                </div>
                <h3 className="text-base font-bold text-[#F5F2EB] mb-1.5">
                  {event.title}
                </h3>
                <p className="text-sm text-[#A8A090] leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Empty space for alternating layout */}
              <div className="hidden md:block flex-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
