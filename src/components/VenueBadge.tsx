'use client'

import { useState } from 'react'
import { MapPin, ExternalLink, Sparkles } from 'lucide-react'
import { EVENT_INFO } from '@/lib/constants'
import { useAudio } from '@/hooks/useAudio'

interface VenueBadgeProps {
  className?: string
  containerClassName?: string
  showLabel?: boolean
  venue?: string
  mapsUrl?: string
}

export default function VenueBadge({
  className = '',
  containerClassName = 'inline-block',
  showLabel = true,
  venue = EVENT_INFO.eventVenue,
  mapsUrl = EVENT_INFO.eventVenueMapsUrl,
}: VenueBadgeProps) {
  const { playClickSound } = useAudio()
  const [showToast, setShowToast] = useState(false)

  const hasVenue = Boolean(venue && venue.trim().length > 0)
  const hasMapsUrl = Boolean(mapsUrl && mapsUrl.trim().length > 0)

  const handleClick = (e: React.MouseEvent) => {
    playClickSound()
    if (hasMapsUrl) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    } else {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <div className={`relative ${containerClassName}`}>
      <button
        type="button"
        onClick={handleClick}
        className={`group flex items-center gap-3 bg-white/90 dark:bg-[#1C1C1E] hover:bg-white dark:hover:bg-[#252528] border border-amber-900/10 dark:border-white/10 hover:border-[#D4AF37]/50 p-3.5 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer text-left ${className}`}
        title={hasMapsUrl ? 'Bấm để mở bản đồ Google Maps' : 'Địa điểm sẽ được cập nhật sớm nhất'}
      >
        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
          <MapPin
            size={18}
            className={`transition-transform group-hover:scale-110 ${
              hasMapsUrl ? 'text-[#D4AF37]' : 'text-[#E53935]'
            }`}
          />
        </div>
        {showLabel ? (
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
              Địa Điểm
            </span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm truncate">
              <span className="truncate">{hasVenue ? venue : 'Sắp công bố'}</span>
              {hasMapsUrl ? (
                <ExternalLink
                  size={12}
                  className="text-[#D4AF37] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              ) : (
                <span className="text-[10px] text-[#D4AF37]/80 font-normal italic">
                  (Chờ công bố)
                </span>
              )}
            </span>
          </div>
        ) : (
          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
            <span>{hasVenue ? venue : 'Địa điểm: Sắp công bố'}</span>
            {hasMapsUrl ? (
              <ExternalLink
                size={12}
                className="text-[#D4AF37] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            ) : null}
          </span>
        )}
      </button>

      {/* Toast popup when clicked and no maps URL is set yet */}
      {showToast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 p-3 bg-[#1A1A1A] border border-[#D4AF37]/40 rounded-xl shadow-2xl text-[11px] text-neutral-300 leading-snug text-center animate-fade-in backdrop-blur-md">
          <div className="flex items-center justify-center gap-1 text-[#D4AF37] font-bold mb-1">
            <Sparkles size={12} />
            <span>Địa điểm đang được hoàn tất</span>
          </div>
          Vị trí quán & link Google Maps sẽ được cập nhật tại đây và gửi kèm trực tiếp trong vé điện tử của bạn!
        </div>
      )}
    </div>
  )
}
