'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Music, Sparkles } from 'lucide-react'

interface ActivityItem {
  id: number
  title: string
  date: string
  venue: string
  attendees: string
  type: 'acoustic' | 'liveshow' | 'workshop'
  imageUrl: string
  description: string
  tags: string[]
}

const activities: ActivityItem[] = [
  {
    id: 1,
    title: 'Acoustic Night Vol.1 - Những Mùa Nhớ',
    date: 'Tháng 3, 2024',
    venue: 'Hà Nội City',
    attendees: '80+ Khán giả',
    type: 'acoustic',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    description: 'Đêm acoustic mộc mạc khởi đầu của CLB với những giai điệu guitar và hòa thanh sâu lắng trong không gian ấm cúng.',
    tags: ['Acoustic', 'Intimate', 'Coffee Show'],
  },
  {
    id: 2,
    title: 'Live Concert Mùa Hè Rực Rỡ',
    date: 'Tháng 6, 2024',
    venue: 'Nhà Hát Tuổi Trẻ, Hà Nội',
    attendees: '250+ Khán giả',
    type: 'liveshow',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    description: 'Đêm nhạc bùng nổ với dàn nhạc sống kết hợp hiệu ứng visual sân khấu và hệ thống âm thanh ánh sáng chuyên nghiệp.',
    tags: ['Full Band', 'Visual Stage', 'Sold Out'],
  },
  {
    id: 3,
    title: 'Workshop: Đệm Hát & Kỹ Năng Sân Khấu',
    date: 'Tháng 8, 2024',
    venue: 'Studio CLB Âm Nhạc',
    attendees: '60 Thành viên',
    type: 'workshop',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
    description: 'Buổi chia sẻ kỹ thuật đệm hát acoustic, hòa âm guitar và làm chủ sự tự tin khi biểu diễn trên sân khấu lớn.',
    tags: ['Masterclass', 'Vocal & Guitar'],
  },
  {
    id: 4,
    title: 'Acoustic Night Vol.2 - Giai Điệu Mùa Thu',
    date: 'Tháng 9, 2024',
    venue: 'The Rooftop Sky Hall, Hà Nội',
    attendees: '150+ Khán giả',
    type: 'acoustic',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    description: 'Trở lại với không gian lãng mạn trên tầng cao, ngắm trọn hoàng hôn Hà Nội và đắm mình trong những bản tình ca bất hủ.',
    tags: ['Rooftop', 'Sunset Show'],
  },
  {
    id: 5,
    title: 'Gala Âm Nhạc Cuối Năm - Tái Ngộ',
    date: 'Tháng 12, 2024',
    venue: 'Trung Tâm Nghệ Thuật Hà Nội',
    attendees: '300+ Khán giả',
    type: 'liveshow',
    imageUrl: 'https://images.unsplash.com/photo-1468359601543-843bfaef291a?w=800&q=80',
    description: 'Đêm nhạc tổng kết năm với các tiết mục đặc sắc chào đón năm mới và tri ân các thế hệ thành viên CLB.',
    tags: ['Year End Gala', 'Anniversary'],
  },
  {
    id: 6,
    title: 'Offline Giao Lưu & Jam Session Mở',
    date: 'Tháng 10, 2024',
    venue: 'Cơ sở sinh hoạt CLB',
    attendees: '90 Thành viên',
    type: 'acoustic',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    description: 'Buổi giao lưu thân mật giữa các thế hệ cựu thành viên và khóa mới với sân khấu acoustic mở tự do thể hiện tài năng.',
    tags: ['Jam Session', 'Networking'],
  },
]

const typeBadge = {
  acoustic: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
  liveshow: 'bg-[#E53935]/15 text-[#E53935] border-[#E53935]/30',
  workshop: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

const typeLabel = {
  acoustic: 'Acoustic Live',
  liveshow: 'Live Concert',
  workshop: 'Masterclass',
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
            Dấu ấn âm nhạc của CLB qua những đêm acoustic ấm cúng, live concert hoành tráng và các buổi workshop chuyên sâu.
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
