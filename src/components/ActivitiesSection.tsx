'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, MapPin, Users, Music } from 'lucide-react'

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
    title: 'Acoustic Night Vol.1',
    date: 'Tháng 3, 2024',
    venue: 'Hà Nội',
    attendees: '80+ khán giả',
    type: 'acoustic',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    description: 'Đêm acoustic đầu tiên của CLB với những ca khúc nhẹ nhàng.',
    tags: ['Acoustic', 'Offline'],
  },
  {
    id: 2,
    title: 'Live Show Mùa Hè',
    date: 'Tháng 6, 2024',
    venue: 'Hà Nội',
    attendees: '150+ khán giả',
    type: 'liveshow',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eaa54b4e5f96?w=600&q=80',
    description: 'Live show hoành tráng mùa hè với sự tham gia của nhiều nghệ sĩ.',
    tags: ['Live Band', 'Summer', 'Special'],
  },
  {
    id: 3,
    title: 'Guitar Workshop',
    date: 'Tháng 8, 2024',
    venue: 'Online + Offline',
    attendees: '50 thành viên',
    type: 'workshop',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80',
    description: 'Workshop guitar acoustic chuyên sâu cho thành viên CLB.',
    tags: ['Workshop', 'Guitar', 'Học thuật'],
  },
  {
    id: 4,
    title: 'Acoustic Night Vol.2',
    date: 'Tháng 9, 2024',
    venue: 'Hà Nội',
    attendees: '120+ khán giả',
    type: 'acoustic',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
    description: 'Trở lại với đêm acoustic ấm cúng và đầy cảm xúc.',
    tags: ['Acoustic', 'Vol.2'],
  },
  {
    id: 5,
    title: 'Đêm Nhạc Cuối Năm',
    date: 'Tháng 12, 2024',
    venue: 'Hà Nội',
    attendees: '200+ khán giả',
    type: 'liveshow',
    imageUrl: 'https://images.unsplash.com/photo-1468359601543-843bfaef291a?w=600&q=80',
    description: 'Đêm nhạc cuối năm hoành tráng chào đón năm mới.',
    tags: ['Year End', 'Live Band', 'Gala'],
  },
  {
    id: 6,
    title: 'CLB Offline Tháng 10',
    date: 'Tháng 10, 2024',
    venue: 'Hà Nội',
    attendees: '60 thành viên',
    type: 'acoustic',
    imageUrl: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=600&q=80',
    description: 'Buổi sinh hoạt offline thường kỳ của CLB với giao lưu âm nhạc.',
    tags: ['Offline', 'Sinh hoạt', 'Giao lưu'],
  },
]

const typeColors = {
  acoustic: 'text-green-400 bg-green-900/30 border-green-500/30',
  liveshow: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30',
  workshop: 'text-blue-400 bg-blue-900/30 border-blue-500/30',
}

const typeLabel = {
  acoustic: 'Acoustic',
  liveshow: 'Live Show',
  workshop: 'Workshop',
}

export default function ActivitiesSection() {
  return (
    <section id="activities" className="py-20 px-4 relative bg-[#0D0D0D]">
      <div className="absolute inset-0 chess-bg opacity-10" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium mb-4">
            <Music size={16} />
            <span>Hoạt Động CLB</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F5F2EB] mb-4">
            Những Đêm Nhạc Đã Qua
          </h2>
          <p className="text-[#A8A090] max-w-2xl mx-auto">
            Nhìn lại hành trình âm nhạc của chúng tôi qua những buổi biểu diễn, workshop và đêm acoustic đáng nhớ.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`group glass-dark rounded-2xl overflow-hidden border border-[#D4AF37]/10 
                         hover:border-[#D4AF37]/30 transition-all duration-300 cursor-pointer
                         ${index === 1 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={activity.imageUrl}
                  alt={activity.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                
                {/* Type badge */}
                <div className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full 
                                border backdrop-blur-sm ${typeColors[activity.type]}`}>
                  {typeLabel[activity.type]}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-[#F5F2EB] text-base mb-2 group-hover:text-[#D4AF37] transition-colors">
                  {activity.title}
                </h3>
                <p className="text-xs text-[#A8A090] mb-3 leading-relaxed">
                  {activity.description}
                </p>
                
                <div className="flex flex-col gap-1.5 text-xs text-[#A8A090]">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#D4AF37]" />
                    {activity.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#D4AF37]" />
                    {activity.venue}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-[#D4AF37]" />
                    {activity.attendees}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activity.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]/70 border border-[#D4AF37]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
