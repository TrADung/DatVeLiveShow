'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Music, Sparkles } from 'lucide-react'

interface ActivityItem {
  id: number
  title: string
  date: string
  venue: string
  attendees: string
  type: 'offline' | 'liveshow' | 'reward' | 'other'
  imageUrl: string
  description: string
  tags: string[]
}

const activities: ActivityItem[] = [
  {
    id: 1,
    title: 'LiveShow - Giao Lộ Âm Thanh',
    date: 'Tháng 5, 2026',
    venue: 'Miên Cafe - Đà Nẵng',
    attendees: '70+ Khán giả',
    type: 'liveshow',
    imageUrl: 'images/Activity/GiaoLoAmThanh.jpg',
    description: 'Nơi những cảm xúc giao nhau, nơi bạn có thể dừng lại giữa nhịp sống vội vã và lắng nghe chính mình.',
    tags: ['Acoustic', 'Full Band', 'MiniShow'],
  },
  {
    id: 2,
    title: 'Giải A - Sắc Âm Tuổi Trẻ 2025',
    date: 'Tháng 12, 2025',
    venue: 'Liên Hoan Band P.Hòa Khánh Mở Rộng - Đà Nẵng',
    attendees: '5 Thành viên band nhạc',
    type: 'reward',
    imageUrl: '/images/Activity/LienHoanBand.jpg',
    description: 'Vượt qua hàng chục band nhạc hết sức đáng gờm, CLB đã xuất sắc đạt được giải A trong cuộc thi liên hoan band.',
    tags: ['Vocal & Live Performance', 'Band Battle'],
  },
  {
    id: 3,
    title: 'LiveShow - Chạm Ngõ Hạ Sang',
    date: 'Tháng 4, 2024',
    venue: 'Miên Cafe - Đà Nẵng',
    attendees: '60+ Khán giả',
    type: 'liveshow',
    imageUrl: 'images/Activity/HaSang.jpg',
    description: 'Hãy để âm nhạc như những cánh hoa phượng rơi, tỏa hương trong gió, mang theo những kỷ niệm tươi đẹp của tuổi trẻ.',
    tags: ['Acoustic','Full Band', 'Visual Stage',],
  },
  {
    id: 4,
    title: 'Chào Đón TSV Viện Nam Khuê',
    date: 'Tháng 3, 2024',
    venue: 'Cung Thể thao Tiên Sơn - Đà Nẵng',
    attendees: '60+ Khán giả',
    type: 'other',
    imageUrl: 'images/Activity/khac.jpg',
    description: 'CLB vinh dự đã được Viện Nam Khuê ngỏ lời mời biểu diễn cho sự kiện chào đón TSV khóa mới.',
    tags: ['Collab', 'Live Performance', 'Acoustic'],
  },
  {
    id: 5,
    title: 'Offline hằng tuần',
    date: 'Tháng 2, 2024',
    venue: 'Dưới Chân Cầu Rồng - Đà Nẵng',
    attendees: 'Tị tị tị Người',
    type: 'offline',
    imageUrl: 'images/Activity/OffCauRong.jpg',
    description: 'Chủ nhật hằng tuần chúng minh sẽ offline đàn hát, dù bạn là ai cũng có thể tham gia - hãy theo dõi page nhé!',
    tags: ['Offline', 'Dragon Bridge', 'Acoustic'],
  },
  {
    id: 6,
    title: 'LiveShow - Sinh Nhật 8 Tuổi',
    date: 'Tháng 7, 2023',
    venue: 'Miên Cafe - Đà Nẵng',
    attendees: '60+ Khán giả',
    type: 'liveshow',
    imageUrl: 'images/Activity/SN8Tuoi.jpg',
    description: 'Live show nhân dịp sinh nhật 8 tuổi của CLB.',
    tags: ['Birthday','Anniversary', 'Acoustic'],
  },
]

const typeBadge = {
  offline: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  liveshow: 'bg-[#E53935]/15 text-[#E53935] border-[#E53935]/30',
  reward: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  other : ' bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
}

const typeLabel = {
  offline: 'Offline',
  liveshow: 'Live Show',
  reward: 'Giải Thưởng',
  other : 'Khác',
}

export default function ActivitiesSection() {
  return (
    <section
      id="activities"
      className="relative w-full min-h-screen py-20 md:py-32 overflow-hidden flex flex-col justify-center bg-[#141414]"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="section-heading-line mb-4 flex justify-center">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Music size={13} />
              <span>HÀNH TRÌNH HOẠT ĐỘNG CLB</span>
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Các Show Đã Tổ Chức
          </h2>

          <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Ngoài những liveshow hoành tráng thì chúng mình còn có những khoảnh khắc mộc mạc qua những buổi offline và sự góp mặt trong nhiều sự kiện.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="card-chess rounded-3xl overflow-hidden flex flex-col group"
            >
              {/* Photo with zoom effect */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activity.imageUrl}
                  alt={activity.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-black/30 pointer-events-none" />

                {/* Type Badge */}
                <span className={`absolute top-3.5 left-3.5 text-xs font-bold px-3 py-1 rounded-xl border backdrop-blur-md shadow-md ${typeBadge[activity.type]}`}>
                  {typeLabel[activity.type]}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2.5 group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {activity.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mb-5 line-clamp-2 leading-relaxed">
                    {activity.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={13} className="text-[#D4AF37] shrink-0" />
                      <span className="truncate">{activity.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Users size={13} className="text-[#D4AF37] shrink-0" />
                      <span className="truncate">{activity.attendees}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 truncate">
                      <MapPin size={13} className="text-[#E53935] shrink-0" />
                      <span className="truncate">{activity.venue}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activity.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 border border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
