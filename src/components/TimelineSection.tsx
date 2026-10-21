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
    icon: <Users size={16} />,
  },
  {
    time: '19:00',
    title: 'Khai Mạc Đêm Nhạc',
    description: 'Nghi lễ khai mạc chính thức, phát biểu của Ban chủ nhiệm CLB và giới thiệu dàn nghệ sĩ.',
    icon: <Star size={16} />,
    highlight: true,
  },
  {
    time: '19:15',
    title: 'Phần I: Acoustic Opening',
    description: 'Những bản nhạc acoustic nhẹ nhàng, sâu lắng mở màn với guitar mộc và violin.',
    icon: <Music size={16} />,
  },
  {
    time: '20:00',
    title: 'Phần II: Live Band Performance',
    description: 'Ban nhạc chính CLB trình diễn các ca khúc sôi động và mashup độc quyền.',
    icon: <Mic size={16} />,
    highlight: true,
  },
  {
    time: '20:45',
    title: 'Phần III: Special Guest Artists',
    description: 'Tiết mục kết hợp đặc sắc giữa ban nhạc và các nghệ sĩ khách mời đặc biệt.',
    icon: <Sparkles size={16} />,
  },
  {
    time: '21:30',
    title: 'Cắt Bánh Sinh Nhật & Giao Lưu',
    description: 'Nghi thức thổi nến chúc mừng sinh nhật CLB và tiệc ngọt giao lưu ấm cúng.',
    icon: <Gift size={16} />,
  },
  {
    time: '21:45',
    title: '🎰 Quay Số Trúng Thưởng (Lucky Draw)',
    description: 'Bốc thăm trúng thưởng trực tiếp trên sân khấu dành cho toàn bộ khán giả có mặt.',
    icon: <Gift size={16} />,
    highlight: true,
  },
  {
    time: '22:15',
    title: 'Grand Finale & Bế Mạc',
    description: 'Màn đồng ca tập thể khép lại đêm liveshow và chụp hình kỷ niệm cùng khán giả.',
    icon: <Music size={16} />,
  },
]

export default function TimelineSection() {
  return (
    <section id="timeline" className="py-24 px-4 sm:px-6 bg-[#F8FAFC] border-t border-b border-slate-200">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-2xs">
            <Clock size={13} />
            <span>LỊCH TRÌNH CHÍNH THỨC</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Timeline Sự Kiện
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Hành trình âm nhạc kết nối cảm xúc xuyên suốt đêm liveshow từ 18:30 đến 22:30
          </p>
        </div>

        {/* Unified Clean Vertical Timeline */}
        <div className="relative pl-8 sm:pl-10">
          {/* Vertical Connecting Line */}
          <div className="absolute left-3.5 sm:left-4 top-4 bottom-4 w-0.5 bg-slate-200" />

          <div className="space-y-6 sm:space-y-8">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="relative flex items-start group"
              >
                {/* Node Icon on the line */}
                <div
                  className={`absolute -left-8 sm:-left-10 mt-1 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 z-10 transition-transform duration-200 group-hover:scale-110 ${
                    event.highlight
                      ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-white border-slate-300 text-slate-700 shadow-xs'
                  }`}
                >
                  {event.icon}
                </div>

                {/* Event Card */}
                <div
                  className={`w-full bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-xs hover:shadow-md ${
                    event.highlight
                      ? 'border-red-200 bg-red-50/20 hover:border-red-500'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-block text-xs font-black px-2.5 py-1 rounded-lg ${
                        event.highlight
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {event.time}
                    </span>
                    {event.highlight && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Tiết mục chính
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-red-600 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
