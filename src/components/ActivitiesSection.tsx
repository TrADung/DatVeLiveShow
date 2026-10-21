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
    description: 'Đêm acoustic đầu tiên của CLB với những giai điệu mộc mạc và gần gũi.',
    tags: ['Acoustic', 'Offline'],
  },
  {
    id: 2,
    title: 'Live Show Mùa Hè',
    date: 'Tháng 6, 2024',
    venue: 'Nhà Hát Tuổi Trẻ, Hà Nội',
    attendees: '250+ khán giả',
    type: 'liveshow',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eaa54b4e5f96?w=600&q=80',
    description: 'Đêm nhạc mùa hè bùng nổ với dàn nhạc sống kết hợp ánh sáng hiện đại.',
    tags: ['Live Band', 'Concert', 'Special'],
  },
  {
    id: 3,
    title: 'Guitar & Vocal Workshop',
    date: 'Tháng 8, 2024',
    venue: 'Studio CLB Âm Nhạc',
    attendees: '60 thành viên',
    type: 'workshop',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80',
    description: 'Buổi chia sẻ kỹ thuật đệm hát và hòa thanh dành cho thành viên trẻ.',
    tags: ['Workshop', 'Guitar', 'Học Thuật'],
  },
  {
    id: 4,
    title: 'Acoustic Night Vol.2',
    date: 'Tháng 9, 2024',
    venue: 'The Rooftop Cafe, Hà Nội',
    attendees: '120+ khán giả',
    type: 'acoustic',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
    description: 'Trở lại với không gian lãng mạn trên cao và những bản tình ca bất hủ.',
    tags: ['Acoustic', 'Rooftop'],
  },
  {
    id: 5,
    title: 'Gala Âm Nhạc Cuối Năm',
    date: 'Tháng 12, 2024',
    venue: 'Trung Tâm Nghệ Thuật Hà Nội',
    attendees: '300+ khán giả',
    type: 'liveshow',
    imageUrl: 'https://images.unsplash.com/photo-1468359601543-843bfaef291a?w=600&q=80',
    description: 'Đêm nhạc tổng kết năm với các tiết mục đặc sắc chào đón năm mới.',
    tags: ['Year End', 'Gala', 'Live Band'],
  },
  {
    id: 6,
    title: 'CLB Acoustic Offline',
    date: 'Tháng 10, 2024',
    venue: 'Cơ sở sinh hoạt CLB',
    attendees: '70 thành viên',
    type: 'acoustic',
    imageUrl: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=600&q=80',
    description: 'Buổi giao lưu thân mật giữa các thế hệ cựu thành viên và khóa mới.',
    tags: ['Offline', 'Giao Lưu'],
  },
]

const typeBadge = {
  acoustic: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  liveshow: 'bg-red-50 text-red-700 border-red-200',
  workshop: 'bg-blue-50 text-blue-700 border-blue-200',
}

const typeLabel = {
  acoustic: 'Acoustic',
  liveshow: 'Live Show',
  workshop: 'Workshop',
}

export default function ActivitiesSection() {
  return (
    <section id="activities" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Music size={13} />
            <span>DẤU ẤN HOẠT ĐỘNG</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Các Show Đã Tổ Chức
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Hành trình âm nhạc của CLB qua những đêm acoustic ấm cúng, live concert hoành tráng và workshop bổ ích.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-red-500 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                <Image
                  src={activity.imageUrl}
                  alt={activity.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Type Badge */}
                <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${typeBadge[activity.type]}`}>
                  {typeLabel[activity.type]}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-red-600 transition-colors">
                    {activity.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {activity.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={13} className="text-red-600 shrink-0" />
                      <span className="truncate">{activity.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Users size={13} className="text-red-600 shrink-0" />
                      <span className="truncate">{activity.attendees}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 truncate">
                      <MapPin size={13} className="text-red-600 shrink-0" />
                      <span className="truncate">{activity.venue}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {activity.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
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
