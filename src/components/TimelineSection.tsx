'use client'

import { motion } from 'framer-motion'
import { Clock, Music, Mic, Gift, Users, Star, Sparkles, ChevronRight } from 'lucide-react'

interface TimelineEvent {
  time: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: boolean
  tag?: string
}

const timelineEvents: TimelineEvent[] = [
  {
    time: '18:30',
    title: 'Mở Cổng & Đón Khách',
    description: 'Check-in bằng mã QR vé điện tử, nhận vòng tay dạ quang cờ vua và chụp hình lưu niệm tại Photo Wall.',
    icon: <Users size={16} />,
    tag: 'Đón khách',
  },
  {
    time: '19:00',
    title: 'Khai Mạc Đêm Nhạc',
    description: 'Nghi thức khai mạc chính thức, phát biểu của Ban chủ nhiệm CLB và công bố thể lệ Minigame.',
    icon: <Star size={16} />,
    highlight: true,
    tag: 'Opening',
  },
  {
    time: '19:15',
    title: 'Phần I: Acoustic Opening Set',
    description: 'Những bản tình ca acoustic mộc mạc sâu lắng mở màn với đàn Guitar mộc, Cajon và Violin.',
    icon: <Music size={16} />,
    tag: 'Acoustic Set',
  },
  {
    time: '20:00',
    title: 'Phần II: Live Band Bùng Nổ',
    description: 'Dàn nhạc sống chính của CLB trình diễn các ca khúc Rock & Pop sôi động, mashup độc quyền.',
    icon: <Mic size={16} />,
    highlight: true,
    tag: 'Live Band',
  },
  {
    time: '20:45',
    title: 'Phần III: Nghệ Sĩ Khách Mời',
    description: 'Tiết mục kết hợp đặc sắc và màn song ca thăng hoa giữa CLB và các ca sĩ khách mời đặc biệt.',
    icon: <Sparkles size={16} />,
    tag: 'Special Guest',
  },
  {
    time: '21:30',
    title: 'Cắt Bánh Sinh Nhật & Giao Lưu',
    description: 'Nghi thức thổi nến chúc mừng sinh nhật CLB tròn tuổi mới và giao lưu gắn kết cùng khán giả.',
    icon: <Gift size={16} />,
    tag: 'Celebration',
  },
  {
    time: '21:45',
    title: '🎰 Quay Số May Mắn Trực Tiếp (Lucky Draw)',
    description: 'Quay số ngẫu nhiên trên màn hình LED sân khấu trao cây đàn Guitar và các phần quà giá trị cho khán giả.',
    icon: <Sparkles size={16} />,
    highlight: true,
    tag: 'Lucky Draw',
  },
  {
    time: '22:15',
    title: 'Grand Finale & Chụp Ảnh Kỷ Niệm',
    description: 'Màn đồng ca tập thể khép lại đêm liveshow ý nghĩa, chụp ảnh toàn thể khán phòng kỷ niệm.',
    icon: <Music size={16} />,
    tag: 'Finale',
  },
]

export default function TimelineSection() {
  return (
    <section id="timeline" className="py-24 sm:py-32 px-4 sm:px-6 bg-[#0E0E11] border-t border-b border-white/5 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section Header with Horizontal Lines (Inspired by Japan Tours) */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="section-heading-line mb-4">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-red-500 bg-red-950/40 border border-red-500/30 px-4 py-1.5 rounded-full">
              LỊCH TRÌNH CHÍNH THỨC
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Timeline Sự Kiện
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Hành trình âm nhạc kết nối cảm xúc xuyên suốt đêm diễn từ 18:30 đến 22:30 tại Hà Nội Concert Hall
          </p>
        </div>

        {/* Clean Timeline with Milestone Nodes */}
        <div className="relative pl-8 sm:pl-10">
          {/* Vertical Track Line */}
          <div className="absolute left-3.5 sm:left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-500 via-white/10 to-red-500/40" />

          <div className="space-y-6 sm:space-y-8">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="relative flex items-start group"
              >
                {/* Node icon on line */}
                <div
                  className={`absolute -left-8 sm:-left-10 mt-1.5 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all duration-300 group-hover:scale-110 z-10 ${
                    event.highlight
                      ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/40 ring-4 ring-red-600/20'
                      : 'bg-[#18181B] border-white/20 text-slate-300 shadow-md group-hover:border-red-500 group-hover:text-red-400'
                  }`}
                >
                  {event.icon}
                </div>

                {/* Event Content Card */}
                <div
                  className={`w-full card-luxury rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 ${
                    event.highlight
                      ? 'border-red-500/30 bg-gradient-to-r from-red-950/20 via-[#141417] to-[#141417]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block text-xs sm:text-sm font-black px-3 py-1 rounded-xl font-mono ${
                          event.highlight
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {event.time}
                      </span>
                      {event.tag && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                          {event.tag}
                        </span>
                      )}
                    </div>

                    {event.highlight && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>Tiết mục đặc biệt</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 group-hover:text-red-400 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
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
