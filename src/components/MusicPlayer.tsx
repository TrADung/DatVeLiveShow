'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Volume2, VolumeX, Music } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '@/hooks/useAudio'

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { playClickSound } = useAudio()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Configure audio and attempt autoplay on mount
  useEffect(() => {
    setIsVisible(true)
    const audio = audioRef.current
    if (!audio) return

    // Set gentle, ambient volume (30%)
    audio.volume = 0.3

    const tryPlay = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
          // Autoplay blocked by browser policy without user gesture
          setIsPlaying(false)
        })
    }

    // 1. Attempt immediate autoplay
    tryPlay()

    // 2. Fallback: On the very first user interaction anywhere on the page, start playback
    const handleFirstInteraction = () => {
      if (audio.paused) {
        tryPlay()
      }
      cleanupListeners()
    }

    const cleanupListeners = () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction, { once: true })
    document.addEventListener('touchstart', handleFirstInteraction, { once: true })
    document.addEventListener('keydown', handleFirstInteraction, { once: true })

    return () => {
      cleanupListeners()
    }
  }, [])

  const handleToggle = useCallback(() => {
    playClickSound()
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [playClickSound])

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/NhacNen.wav"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2"
          >
            <button
              onClick={handleToggle}
              className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-2xl cursor-pointer border ${
                isPlaying
                  ? 'bg-[#18181B]/90 border-[#D4AF37]/60 text-white shadow-[#D4AF37]/20 hover:border-[#D4AF37]'
                  : 'bg-[#18181B]/80 border-white/10 text-neutral-400 hover:text-white hover:border-white/30'
              }`}
              title={isPlaying ? 'Bấm để tạm dừng nhạc nền' : 'Bấm để phát nhạc nền'}
              aria-label="Toggle background music"
            >
              {/* Icon / Equalizer visualizer */}
              <div className="relative flex items-center justify-center w-5 h-5">
                {isPlaying ? (
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-0.5 bg-[#D4AF37] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-3.5" />
                    <span className="w-0.5 bg-[#D4AF37] rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.2s] h-2" />
                    <span className="w-0.5 bg-[#D4AF37] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s] h-3" />
                  </div>
                ) : (
                  <VolumeX size={17} className="text-neutral-500 group-hover:text-neutral-300" />
                )}
              </div>

              {/* Text label */}
              <div className="flex items-center gap-1.5 text-xs font-semibold pr-1">
                <Music size={12} className={isPlaying ? 'text-[#D4AF37]' : 'text-neutral-500'} />
                <span className="text-[11px] font-bold tracking-wide">
                  {isPlaying ? 'Nhạc nền: Bật' : 'Nhạc nền: Tắt'}
                </span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
