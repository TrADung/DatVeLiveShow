'use client'

import { motion } from 'framer-motion'
import { Clock, Music, Mic, Gift, Users, Star, Sparkles } from 'lucide-react'

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
    description: 'Check-in và nhận vòng tay cờ vua tại cổng vào, chụp ảnh lưu niệm tại Photo Booth.',
    icon: <Users size={18} />,
  },
  {
    time: '19:00',
    title: 'Khai Mạc Đêm Nhạc',
    description: 'Nghi lễ khai mạc chính thức, phát biểu của Chủ nhiệm CLB và giới thiệu dàn nghệ sĩ.',
    icon: <Star size={18} />,
    highlight: true,
  },
  {
    time: '19:15',
    title: 'Phần I: Acoustic Opening',
    description: 'Những bản nhạc acoustic nhẹ nhàng, sâu lắng mở màn với guitar mộc và violin.',
    icon: <Music size={18} />,
  },
  {
    time: '20:00',
    title: 'Phần II: Live Band Performance',
    description: 'Ban nhạc chính CLB trình diễn các ca khúc sôi động và mashup độc quyền.',
    icon: <Mic size={18} />,
    highlight: true,
  },
  {
    time: '20:45',
    title: 'Phần III: Special Guest Artists',
    description: 'Tiết mục kết hợp đặc sắc giữa ban nhạc và các nghệ sĩ khách mời.',
    icon: <Sparkles size={18} />,
  },
  {
    time: '21:30',
    title: 'Cắt Bánh Sinh Nhật & Giao Lưu',
    description: 'Nghi thức thổi nến chúc mừng sinh nhật CLB và tiệc ngọt giao lưu.',
    icon: <Gift size={18} />,
  },
  {
    time: '21:45',
    title: '🎰 Quay Số Trúng Thưởng (Lucky Draw)',
    description: 'Bốc thăm trúng thưởng trực tiếp trên sân khấu dành cho tất cả khán giả có mặt.',
    icon: <Gift size={18} />,
    highlight: true,
  },
  {
    time: '22:15',
    title: 'Grand Finale & Bế Mạc',
    description: 'Màn đồng ca tập thể khép lại đêm liveshow và chụp hình kỷ niệm cùng khán giả.',
    icon: <Music size={18} />,
  },
]

export default function TimelineSection() {
  return (
    <section id="timeline" className="py-20 px-4 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Clock size={13} />
            <span>LỊCH TRÌNH CHÍNH THỨC</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Timeline Sự Kiện
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Hành trình âm nhạc kết nối cảm xúc từ 18:30 đến 22:30
          </p>
        </div>

        {/* Timeline container */}
        <div className="relative">
          {/* Vertical center line */}
          <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 md:-translate-x-1/2" />

          <div className="space-y-8 md:space-y-12">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`relative flex items-start gap-6 ${
                  index % 2 === 0
                    ? 'md:flex-row-reverse md:text-right'
                    : 'md:flex-row'
                } pl-14 md:pl-0`}
              >
                {/* Node icon */}
                <div
                  className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-2xl border-2 z-10 transition-transform ${
                    event.highlight
                      ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-white border-slate-300 text-slate-700 shadow-xs'
                  }`}
                >
                  {event.icon}
                </div>

                {/* Content Card */}
                <div
                  className={`flex-1 bg-white rounded-2xl p-5 border transition-all ${
                    event.highlight
                      ? 'border-red-300 shadow-md shadow-red-500/5'
                      : 'border-slate-200 shadow-xs'
                  } md:max-w-[calc(50%-36px)] hover:border-red-500`}
                >
                  <div
                    className={`inline-block text-xs font-black px-2.5 py-0.5 rounded-md mb-2 ${
                      event.highlight
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {event.time}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {event.description}
                  </p>
                </div>

                {/* Spacer for alternating desktop layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
