'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Clock, Music, Mic, Gift, Users, Star, Sparkles, Camera } from 'lucide-react'

interface TimelineEvent {
  time: string
  title: string
  description: string
  icon: React.ReactNode
  tag: string
  highlight?: boolean
  imageUrl: string
}

const timelineEvents: TimelineEvent[] = [
  {
    time: '18:30',
    title: 'Mở Cổng & Check-in Photo Wall',
    description: 'Đón tiếp khán giả, quét vé điện tử QR siêu tốc, nhận vòng tay dạ quang cờ vua và chụp hình kỷ niệm tại sảnh Photo Booth.',
    icon: <Users size={15} />,
    tag: 'Đón Khách',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&q=80',
  },
  {
    time: '19:00',
    title: 'Khai Mạc Đêm Nhạc & Nghi Thức Cờ Vua',
    description: 'Nghi thức khai mạc chính thức, phát biểu của Ban chủ nhiệm CLB Âm Nhạc và công bố thể lệ quay số may mắn minigame.',
    icon: <Star size={15} />,
    tag: 'Khai Mạc',
    highlight: true,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&q=80',
  },
  {
    time: '19:15',
    title: 'Phần I: Acoustic Melodies Mộc Mạc',
    description: 'Những bản tình ca acoustic nhẹ nhàng, hòa quyện giữa tiếng guitar mộc, cajon nhịp nhàng và âm sắc violin da diết.',
    icon: <Music size={15} />,
    tag: 'Acoustic Set',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=700&q=80',
  },
  {
    time: '20:00',
    title: 'Phần II: Live Band Trình Diễn Bùng Nổ',
    description: 'Dàn nhạc sống chính của CLB thăng hoa với loạt ca khúc Rock & Pop sôi động, mashup các bản hit được phối khí độc quyền.',
    icon: <Mic size={15} />,
    tag: 'Live Band',
    highlight: true,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&q=80',
  },
  {
    time: '20:45',
    title: 'Phần III: Special Guest Artists',
    description: 'Tiết mục kết hợp đặc sắc và màn song ca thăng hoa giữa ban nhạc CLB và các ca sĩ khách mời đặc biệt được giữ bí mật.',
    icon: <Sparkles size={15} />,
    tag: 'Khách Mời',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&q=80',
  },
  {
    time: '21:30',
    title: 'Thổi Nến Sinh Nhật & Giao Lưu Khán Phòng',
    description: 'Nghi thức cắt bánh mừng CLB tròn tuổi mới, tri ân khán giả và tiệc ngọt giao lưu thân mật giữa các thế hệ thành viên.',
    icon: <Gift size={15} />,
    tag: 'Sinh Nhật',
    imageUrl: 'https://images.unsplash.com/photo-1468359601543-843bfaef291a?w=700&q=80',
  },
  {
    time: '21:45',
    title: 'Quay Số May Mắn Trực Tiếp (Lucky Draw LED)',
    description: 'Bốc thăm trúng thưởng trực tiếp trên màn hình LED sân khấu trao giải thưởng cây đàn Guitar Epiphone và tai nghe kiểm âm cao cấp.',
    icon: <Sparkles size={15} />,
    tag: 'Lucky Draw',
    highlight: true,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&q=80',
  },
  {
    time: '22:15',
    title: 'Grand Finale & Chụp Ảnh Toàn Thể Khán Phòng',
    description: 'Màn đồng ca tập thể khép lại đêm liveshow trọn vẹn cảm xúc và chụp hình lưu niệm toàn thể khán giả có mặt.',
    icon: <Camera size={15} />,
    tag: 'Bế Mạc',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=80',
  },
]

export default function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Parallax subtle float
  const yParallax = useTransform(scrollYProgress, [0, 1], [-40, 40])
  const opacityParallax = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 0.7, 0.7, 0.3])

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="relative w-full block py-24 md:py-32 overflow-hidden bg-[#0D0D0D]"
    >
      {/* Background chess watermark with parallax */}
      <motion.div
        style={{ y: yParallax, opacity: opacityParallax }}
        className="absolute top-1/3 -left-12 select-none text-white/[0.025] text-[280px] font-serif pointer-events-none leading-none z-0"
      >
        ♔
      </motion.div>
      <motion.div
        style={{ y: yParallax, opacity: opacityParallax }}
        className="absolute bottom-1/4 -right-12 select-none text-white/[0.025] text-[280px] font-serif pointer-events-none leading-none z-0"
      >
        ♜
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="section-heading-line mb-4">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full flex items-center gap-1.5">
              <Clock size={13} />
              <span>TIMELINE SỰ KIỆN CHÍNH THỨC</span>
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Lịch Trình Đêm Nhạc
          </h2>

          <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Hành trình kết nối cảm xúc xuyên suốt đêm diễn từ 18:30 đến 22:30. Mỗi mốc thời gian là một nốt thăng hoa nghệ thuật.
          </p>
        </div>

        {/* Timeline Axis Container */}
        <div className="relative">
          {/* Vertical Timeline Axis Line (Centered on Desktop, Left on Mobile) */}
          <div className="absolute top-4 bottom-4 left-4 sm:left-6 md:left-1/2 md:-translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#D4AF37]/60 to-transparent z-0" />

          {/* Timeline Nodes & Cards */}
          <div className="space-y-12 sm:space-y-16 md:space-y-20">
            {timelineEvents.map((event, index) => {
              const isEven = index % 2 === 0
              return (
                <div
                  key={index}
                  className="relative flex flex-col md:flex-row items-start md:items-center w-full"
                >
                  {/* Glowing Node Marker on the Line */}
                  <div className="absolute left-4 sm:left-6 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-115 ${
                        event.highlight
                          ? 'bg-[#E53935] text-white border-2 border-white/60 shadow-[0_0_20px_rgba(229,57,53,0.6)]'
                          : 'bg-[#1C1C1E] text-[#D4AF37] border-2 border-[#D4AF37]/70 shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                      }`}
                    >
                      {event.icon}
                    </div>
                  </div>

                  {/* Desktop Alternating Zigzag Layout:
                      - If Even: Content on Left column (md:pr-12 md:text-right)
                      - If Odd: Content on Right column (md:pl-12 md:text-left)
                      - On Mobile: Always on right of the line (pl-12 sm:pl-16)
                  */}
                  <div
                    className={`w-full md:w-1/2 pl-12 sm:pl-16 md:pl-0 ${
                      isEven ? 'md:pr-12 md:text-right md:mr-auto' : 'md:pl-12 md:text-left md:ml-auto'
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.96 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.04 }}
                      className={`card-chess rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 group ${
                        event.highlight
                          ? 'border-[#D4AF37]/50 bg-gradient-to-b from-[#1C1C1E] via-[#1C1C1E] to-[#D4AF37]/10'
                          : 'border-white/10'
                      }`}
                    >
                      {/* Meta header */}
                      <div
                        className={`flex items-center gap-2 mb-3 ${
                          isEven ? 'md:justify-end' : 'md:justify-start'
                        }`}
                      >
                        <span
                          className={`inline-block text-xs sm:text-sm font-black px-3 py-1 rounded-xl font-mono ${
                            event.highlight
                              ? 'bg-[#E53935] text-white shadow-md shadow-[#E53935]/30'
                              : 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                          }`}
                        >
                          {event.time}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                          {event.tag}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-white mb-2 group-hover:text-[#D4AF37] transition-colors leading-snug">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                        {event.description}
                      </p>

                      {/* Artistic Thumbnail Image */}
                      <div className="relative w-full h-36 sm:h-44 md:h-48 rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&q=80'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div
                          className={`absolute bottom-2.5 ${
                            isEven ? 'left-3 md:right-3 md:left-auto' : 'left-3'
                          } text-[11px] font-bold text-white/90 drop-shadow flex items-center gap-1.5`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span>Chess Night Live</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
