'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Clock, Music, Mic, Gift, Users, Star, Sparkles, MapPin, Calendar } from 'lucide-react'
import { EVENT_INFO } from '@/lib/constants'
import VenueBadge from '@/components/VenueBadge'

interface TimelineStage {
  id: string
  phase: string
  timeRange: string
  title: string
  subtitle: string
  subEvents: { time: string; name: string }[]
  side: 'left' | 'right'
  photos: {
    url: string
    alt: string
    caption: string
  }[]
}

const timelineStages: TimelineStage[] = [
  {
    id: 'stage-1',
    phase: 'Chặng 01',
    timeRange: '18:30 – 19:00',
    title: 'Khai cuộc - Đón quân',
    subtitle: 'Đón tiếp khán giả, check-in và nhận vòng tay.',
    subEvents: [
      { time: '18:30', name: 'Mở Cổng & Check-in Nhận Vòng Tay' },
      { time: '19:00', name: 'Khai Mạc Đêm Nhạc' },
    ],
    side: 'left',
    photos: [
      {
        url: '/images/Timeline/KhaiQuan.jpg',
        alt: 'Khai Quân',
        caption: 'Khai Quân',
      },
      
      {
        url: '/images/Timeline/checkin.jpg',
        alt: 'Acoustic Performance',
        caption: 'Acoustic Live Show',
      },
      {
        url: '/images/Timeline/AcousticLiveShow.jpg',
        alt: 'Sảnh đón khách và check-in',
        caption: 'Sảnh Đón Khách',
      },
    ],
  },
  {
    id: 'stage-2',
    phase: 'Chặng 02',
    timeRange: '19:00 – 21:15',
    title: 'Thế cờ cảm xúc',
    subtitle: 'Những âm vang mộc mạc lắng đọng của câu lạc bộ. Xen kẻ đó là các giọng ca khách mời đáng mong đợi',
    subEvents: [
      { time: '', name: 'Bốc thăm trúng thưởng' },
    ],
    side: 'right',
    photos: [
      {
        url: '/images/Timeline/DanhDan.jpg',
        alt: 'Tiết mục Guitar Acoustic',
        caption: 'Guitar Mộc',
      },
      {
        url: '/images/Timeline/VanCo.jpeg',
        alt: 'Ván cờ',
        caption: 'chessboard',
      },
    ],
  },
  {
    id: 'stage-3',
    phase: 'Chặng 03',
    timeRange: '21:15 – 21:30',
    title: 'Lưu dấu ván cờ',
    subtitle: 'Chụp hình lưu niệm',
    subEvents: [
      
    ],
    side: 'left',
    photos: [
      {
        url: '/images/Timeline/luuniem.jpg',
        alt: 'Chụp hình lưu niệm',
        caption: 'take a photo',
      },
      {
        url: '/images/Timeline/ChupHinhLuuNiem.jpg',
        alt: 'Vòng quay may mắn',
        caption: 'Lucky Draw',
      },
    ],
  },
]

export default function TimelineSection() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Subtle floating parallax for background watermarks
  const yParallax = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const opacityParallax = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.2, 0.6, 0.6, 0.2])

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="relative w-full min-h-screen py-20 md:py-32 overflow-hidden flex flex-col justify-center bg-[#0D0D0D]"
    >
      {/* Background chess watermark */}
      <motion.div
        style={{ y: yParallax, opacity: opacityParallax }}
        className="absolute top-1/4 -left-12 select-none text-white/[0.025] text-[260px] font-serif pointer-events-none leading-none z-0"
      >
        ♔
      </motion.div>
      <motion.div
        style={{ y: yParallax, opacity: opacityParallax }}
        className="absolute bottom-1/4 -right-12 select-none text-white/[0.025] text-[260px] font-serif pointer-events-none leading-none z-0"
      >
        ♜
      </motion.div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Japan Tour Inspired Section Header with Horizontal Dividing Lines */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-16 md:mb-24">
          <div className="h-[1px] flex-1 max-w-[80px] sm:max-w-xs bg-gradient-to-r from-transparent to-white/30" />
          <div className="text-center shrink-0">
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-1.5 flex items-center justify-center gap-1.5">
              <Clock size={12} />
              <span>Timeline</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-widest uppercase font-sans">
              Lịch Trình Đêm Nhạc
            </h2>
          </div>
          <div className="h-[1px] flex-1 max-w-[80px] sm:max-w-xs bg-gradient-to-l from-transparent to-white/30" />
        </div>

        {/* 2-Column Japan Tour Layout: Left Narrative + Right Minimalist Collage Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: Editorial Narrative (Inspired by Japan Tour text side) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D4AF37]">
              <Sparkles size={13} className="text-[#D4AF37]" />
              <span>Hành Trình Âm Nhạc 19:00 - 21:30</span>
            </div>

            

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
              Lịch trình sự kiện gồm {' '}
              <span className="text-[#D4AF37] font-semibold italic"> 3 mốc.</span>
            </p>

            {/* Quick Specs Pill Box */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 text-xs">
              <div className="space-y-1 bg-[#1C1C1E] border border-white/10 p-3 rounded-xl flex-1">
                <span className="text-neutral-500 font-bold uppercase tracking-wider block text-[10px]">Thời Gian</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#D4AF37]" />
                  {EVENT_INFO.eventDateShort} • {EVENT_INFO.eventTime}
                </span>
              </div>
              <div className="flex-1">
                <VenueBadge className="w-full h-full" />
              </div>
            </div>

            {/* Quote decoration */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-neutral-400 italic">
              &ldquo;Mỗi mốc thời gian là một nước cờ nghệ thuật đưa cảm xúc khán giả chạm tới đỉnh cao.&rdquo;
            </div>
          </div>

          {/* RIGHT COLUMN: Japan Tour Timeline (Thin Axis Line + Circular Nodes + Organic Collage Photos) */}
          <div className="lg:col-span-7 relative">
            {/* The Vertical Axis Line: Positioned at 42% on desktop, left-5 on mobile */}
            <div className="absolute top-4 bottom-8 left-5 sm:left-6 lg:left-[44%] w-[1.5px] bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent pointer-events-none z-0" />

            <div className="space-y-16 sm:space-y-20 lg:space-y-24">
              {timelineStages.map((stage, stageIndex) => {
                const isLeftPhotos = stage.side === 'left'

                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: stageIndex * 0.05 }}
                    className="relative w-full"
                  >
                    {/* Node Dot on the Axis Line */}
                    <div className="absolute left-5 sm:left-6 lg:left-[44%] -translate-x-1/2 top-1.5 z-20 flex items-center justify-center pointer-events-none">
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-5 h-5 rounded-full bg-[#D4AF37]/30 animate-ping" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.8)] ring-4 ring-[#EEE5D8] dark:ring-[#0D0D0D] border-2 border-white" />
                      </div>
                    </div>

                    {/* DESKTOP LAYOUT (>= lg): Asymmetrical layout with text on one side, photos collage on the other */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start w-full">
                      {/* Left side of the Axis Line (Cols 1-5, before axis at 44%) */}
                      <div className="col-span-5 flex flex-col justify-start">
                        {isLeftPhotos ? (
                          /* Collaged Photos on Left */
                          <div className="relative pt-1 pr-6 flex justify-end">
                            <div className="relative">
                              {/* Primary Photo */}
                              <div className="w-44 h-32 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900 group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={stage.photos[0]?.url}
                                  alt={stage.photos[0]?.alt}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'
                                  }}
                                />
                              </div>

                              {/* Overlapping Secondary Photo (Japan Tour style) */}
                              {stage.photos[1] && (
                                <div className="absolute -bottom-6 -left-8 w-36 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-[#EEE5D8] dark:border-[#0D0D0D] bg-neutral-900 z-10 group">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={stage.photos[1].url}
                                    alt={stage.photos[1].alt}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Title & Stage Details on Left (when photos are on Right) */
                          <div className="text-right pr-8 pt-0.5">
                            <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase font-mono">
                              {stage.timeRange}
                            </span>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mt-0.5 mb-1">
                              {stage.title}
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs ml-auto">
                              {stage.subtitle}
                            </p>

                            {/* Sub-events list */}
                            <div className="mt-3 space-y-1.5">
                              {stage.subEvents.map((sub, i) => (
                                <div key={i} className="flex items-center justify-end gap-2 text-xs text-neutral-300">
                                  <span className="font-semibold text-white">{sub.name}</span>
                                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                                    {sub.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Spacer col for the axis at 44% */}
                      <div className="col-span-1" />

                      {/* Right side of the Axis Line (Cols 7-12, after axis) */}
                      <div className="col-span-6 flex flex-col justify-start pl-4">
                        {isLeftPhotos ? (
                          /* Title & Details on Right (when photos are on Left) */
                          <div className="text-left pt-0.5">
                            <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase font-mono">
                              {stage.timeRange}
                            </span>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mt-0.5 mb-1">
                              {stage.title}
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                              {stage.subtitle}
                            </p>

                            {/* Sub-events list */}
                            <div className="mt-3 space-y-1.5">
                              {stage.subEvents.map((sub, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                                    {sub.time}
                                  </span>
                                  <span className="font-semibold text-white">{sub.name}</span>
                                </div>
                              ))}
                            </div>

                            {/* Supplementary single thumbnail on right */}
                            {stage.photos[2] && (
                              <div className="mt-4 w-40 h-28 rounded-xl overflow-hidden shadow-xl border border-white/10 group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={stage.photos[2].url}
                                  alt={stage.photos[2].alt}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Collaged Photos on Right (when details are on Left) */
                          <div className="relative pt-1 pl-2">
                            <div className="relative">
                              {/* Primary Photo */}
                              <div className="w-48 h-32 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900 group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={stage.photos[0]?.url}
                                  alt={stage.photos[0]?.alt}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80'
                                  }}
                                />
                              </div>

                              {/* Overlapping Secondary Photo */}
                              {stage.photos[1] && (
                                <div className="absolute -bottom-6 -right-6 w-36 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-[#0D0D0D] bg-neutral-900 z-10 group">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={stage.photos[1].url}
                                    alt={stage.photos[1].alt}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80'
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MOBILE & TABLET LAYOUT (< lg): Single clean column on right of axis line */}
                    <div className="lg:hidden pl-12 sm:pl-16 w-full">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-lg border border-[#D4AF37]/20">
                          {stage.timeRange}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {stage.phase}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-1.5">
                        {stage.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-3">
                        {stage.subtitle}
                      </p>

                      {/* Sub-events list */}
                      <div className="space-y-1 mb-4">
                        {stage.subEvents.map((sub, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                            <span className="font-mono text-neutral-400 text-[11px]">{sub.time}</span>
                            <span className="font-medium text-white">{sub.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* Asymmetric Mobile Photo Collage (Scrollable / Overlapping) */}
                      <div className="flex items-center gap-3 pt-1 overflow-x-auto pb-2">
                        {stage.photos.map((photo, pIdx) => (
                          <div
                            key={pIdx}
                            className={`shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg ${
                              pIdx === 0 ? 'w-44 h-28 sm:w-48 sm:h-32' : 'w-32 h-24 sm:w-36 sm:h-28 -ml-3 sm:-ml-4 z-10 border-2 border-[#EEE5D8] dark:border-[#0D0D0D]'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.alt}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
